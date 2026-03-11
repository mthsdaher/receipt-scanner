import asyncio
import os
import re
import tempfile
from io import BytesIO
from time import perf_counter
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from paddleocr import PaddleOCR
from PIL import Image

# Windows asyncio compatibility fix
try:
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
except Exception:
    pass

app = FastAPI()
ocr = None

# -------------------------------------------------------------------
# Load OCR model once at startup
# -------------------------------------------------------------------
@app.on_event("startup")
async def load_ocr_model():
    global ocr
    print("🔹 [INIT] Loading PaddleOCR model...")
    start = perf_counter()
    ocr = await asyncio.get_event_loop().run_in_executor(
        None, lambda: PaddleOCR(use_angle_cls=False, lang='en')
    )
    print(f"✅ [READY] Model loaded in {perf_counter() - start:.2f}s.")

# -------------------------------------------------------------------
# Extract store, total and date from raw OCR lines
# -------------------------------------------------------------------
def parse_receipt(lines: list[str]) -> dict:
    store = None
    total = None
    date = None

    upper = [l.strip().upper() for l in lines]

    # Store: first line with only letters and spaces, no digits
    for line in upper:
        if re.match(r'^[A-Z][A-Z\s&\-.]{2,}$', line) and not re.search(r'\d', line):
            store = line.title()
            break

    # Total: line containing "TOTAL" followed by a numeric value
    for i, line in enumerate(upper):
        if re.search(r'\bTOTAL\b', line):
            match = re.search(r'[\$]?\s*(\d+[.,]\d{2})', line)
            if match:
                total = float(match.group(1).replace(',', '.'))
                break
            # Value may be on the next line
            if i + 1 < len(upper):
                match = re.search(r'(\d+[.,]\d{2})', upper[i + 1])
                if match:
                    total = float(match.group(1).replace(',', '.'))
                    break

    # Date: prefer YYYY-MM-DD, fallback to DD/MM/YYYY
    for line in upper:
        m = re.search(r'(\d{4})[/-](\d{2})[/-](\d{2})', line)
        if m:
            date = f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
            break
        m = re.search(r'(\d{2})[/-](\d{2})[/-](\d{4})', line)
        if m:
            date = f"{m.group(3)}-{m.group(2)}-{m.group(1)}"
            break

    return {"store": store, "total": total, "date": date}

# -------------------------------------------------------------------
# OCR endpoint — returns { store, total, date }
# -------------------------------------------------------------------
@app.post("/ocr")
async def read_image(file: UploadFile = File(...)):
    temp_filename = None
    try:
        # Read file into memory to avoid Windows file lock issues
        file_bytes = await file.read()
        with Image.open(BytesIO(file_bytes)) as img:
            # Downscale large images for performance
            if max(img.size) > 2000:
                img = img.resize((img.width // 2, img.height // 2))
            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
                temp_filename = tmp.name
                img.convert("RGB").save(temp_filename, format="JPEG")

        print(f"🔸 [PROCESS] Running OCR for '{file.filename}'...")
        start = perf_counter()

        # Run OCR in a thread to avoid blocking the event loop
        result = await asyncio.get_event_loop().run_in_executor(
            None, lambda: ocr.ocr(temp_filename)
        )

        # PaddleOCR v3 returns a list of dicts — extract text from 'rec_texts'
        lines = []
        for page in result:
            for text in page.get("rec_texts", []):
                text = text.strip()
                if text:
                    lines.append(text)

        parsed = parse_receipt(lines)
        print(f"✅ [DONE] {perf_counter() - start:.2f}s — {parsed}")

        return JSONResponse(content=parsed)

    except Exception as e:
        print(f"❌ [ERROR] {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

    finally:
        # Safe file cleanup after OCR has fully released the handle
        try:
            if temp_filename and os.path.exists(temp_filename):
                os.remove(temp_filename)
        except Exception:
            pass
