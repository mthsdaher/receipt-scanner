export interface ParsedReceipt {
  store: string;
  total: number;
  date: string;
}

export function extractReceiptData(lines: string[]): ParsedReceipt {
  let store = 'Unknown';
  let total = 0;
  let date = '';

  // Normaliza e limpa as linhas
  const cleanedLines = lines.map(line => line.trim());

  // 1. Encontrar o nome da loja (primeiras 5 linhas em CAPSLOCK, sem números)
  for (let i = 0; i < Math.min(cleanedLines.length, 5); i++) {
    const line = cleanedLines[i];
    if (/^[A-Z\s&\-\.]{4,}$/.test(line) && !/\d/.test(line)) {
      store = line.trim();
      break;
    }
  }

  // 2. Procurar o valor total (últimos valores numéricos com palavras-chave)
  for (const line of cleanedLines) {
    if (/total|amount due|balance/i.test(line)) {
      const match = line.match(/(\d+[.,]\d{2})/);
      if (match) {
        total = parseFloat(match[1].replace(',', '.'));
      }
    }
  }

  // 3. Procurar data em vários formatos comuns
  const dateRegexes = [
    /\b\d{4}[/-]\d{2}[/-]\d{2}\b/, // YYYY-MM-DD
    /\b\d{2}[/-]\d{2}[/-]\d{4}\b/, // DD/MM/YYYY or MM/DD/YYYY
  ];

  for (const line of cleanedLines) {
    for (const regex of dateRegexes) {
      const match = line.match(regex);
      if (match) {
        date = match[0];
        break;
      }
    }
    if (date) break;
  }

  return { store, total, date };
}
