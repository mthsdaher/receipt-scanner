export interface ParsedReceipt {
    company: string;
    address: string;
    subtotal: number;
    hst: number;
    total: number;
    date: string;
  }
  export function parseReceiptText(text: string): ParsedReceipt {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  // Extract company name and address from the first two lines
    // Assuming the first line is the company name and the second line is the address
    const company = lines[0] || 'Unknown Company';
    const address = lines[1] || 'Unknown Address';
  
    let items: { name: string; price: number }[] = [];
    let subtotal = 0;
    let hst = 0;
    let total = 0;
    let date = '';
  
    for (const line of lines) {
      // Extract subtotal
      if (/subtotal/i.test(line)) {
        const match = line.match(/\d+\.\d{2}/);
        if (match) {
          subtotal = parseFloat(match[0]);
          continue;
        }
      }
  
      // Extract HST 13%
      if (/HST\s*13%/i.test(line)) {
        const match = line.match(/\d+\.\d{2}/);
        if (match) {
          hst = parseFloat(match[0]);
          continue;
        }
      }
  
      // Extract total from AMOUNT line only
      if (/AMOUNT/i.test(line)) {
        const match = line.match(/\d+\.\d{2}/);
        if (match) {
          total = parseFloat(match[0]);
          continue;
        }
      }
  
      // Extract date from DATE/TIME line
      if (/DATE\/TIME/i.test(line)) {
        const match = line.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{2,4})/);
        if (match) {
          const [, dd, mm, yyyyOrYY] = match;
          const yyyy = yyyyOrYY.length === 2 ? `20${yyyyOrYY}` : yyyyOrYY;
          date = `${yyyy}-${mm}-${dd}`;
          continue;
        }
      }
    }
  
    return {
      company,
      address,
      subtotal,
      hst,
      total,
      date,
    };
  }
  