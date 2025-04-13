from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from paddleocr import PaddleOCR
import shutil
import os
import uuid

app = FastAPI()
ocr = PaddleOCR(use_angle_cls=True, lang='en')  # English OCR model

@app.post("/ocr")
async def read_image(file: UploadFile = File(...)):
    temp_filename = f"temp_{uuid.uuid4()}.jpg"
    
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = ocr.ocr(temp_filename, cls=True)

    os.remove(temp_filename)

    # Process the result to extract lines
    parsed_text = [line[1][0] for region in result for line in region]

    return JSONResponse(content={"lines": parsed_text})
