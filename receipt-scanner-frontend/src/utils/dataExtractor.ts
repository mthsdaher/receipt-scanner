export interface ParsedReceipt {
  company: string | null;
  address: string | null;
  items: string[];
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  date: string | null;
  time: string | null;
}

export function extractReceiptData(lines: string[]): ParsedReceipt {
  const data: ParsedReceipt = {
    company: lines[0]?.trim() || null,
    address: lines[1]?.trim() || null,
    items: [],
    subtotal: null,
    tax: null,
    total: null,
    date: null,
    time: null,
  };

  let insideItems = true;

  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if we reached subtotal section
    if (line.toLowerCase().includes('subtotal')) {
      insideItems = false;
      data.subtotal = extractMoney(lines[i + 1] || '');
    }

    if (line.toLowerCase().includes('hst') || line.toLowerCase().includes('tax')) {
      data.tax = extractMoney(lines[i + 1] || '');
    }

    if (line.toLowerCase().includes('total')) {
      data.total = extractMoney(lines[i + 1] || '');
    }

    if (line.toLowerCase().includes('date/time')) {
      const dateLine = lines[i + 1] || '';
      const match = dateLine.match(/(\d{2}\/\d{2}\/\d{2})\s+(\d{2}:\d{2}:\d{2})/);
      if (match) {
        data.date = match[1];
        data.time = match[2];
      }
    }

    if (insideItems && isLikelyProduct(line)) {
      data.items.push(line);
    }
  }

  return data;
}

function extractMoney(text: string): number | null {
  const match = text.match(/(\d{1,3}[.,]?\d{2})/);
  if (match) {
    return parseFloat(match[1].replace(',', '.'));
  }
  return null;
}

function isLikelyProduct(line: string): boolean {
  return (
    /^[A-Z0-9\s\-]+$/.test(line) &&
    line.length > 3 &&
    !/\d{11,}/.test(line)
  );
}
