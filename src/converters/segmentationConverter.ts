
export async function readFileAsync(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = err => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

export async function parseFile(file: File): Promise<any[][]> {
  const fileName = file.name.toLowerCase();
  // @ts-ignore - SheetJS is loaded globally
  if (fileName.endsWith('.csv')) {
    const text = await file.text();
    // @ts-ignore
    const workbook = XLSX.read(text, { type: 'string' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    // @ts-ignore
    return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  } else if (fileName.endsWith('.xlsx')) {
    const arrayBuffer = await readFileAsync(file);
    // @ts-ignore
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    // @ts-ignore
    return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  } else {
    throw new Error("Unsupported file format: " + fileName);
  }
}

// Only keep/export this if you use it in this file or need it for external consumption.
export function arrayToSegmentationRows(
  header: string[], 
  data: any[][]
): { id: string | number, brand: string, type: string }[] {
  const idCol = header.findIndex(h => h.toLowerCase() === "id" || h === "#");
  const brandCol = header.findIndex(h => h.toLowerCase() === "brand" || h.toLowerCase().includes("center"));
  const typeCol = header.findIndex(h => h.toLowerCase() === "type" || h.toLowerCase().includes("preference"));
  return data.map(row => ({
    id: idCol >= 0 ? row[idCol] : "",
    brand: brandCol >= 0 ? row[brandCol] : "",
    type: typeCol >= 0 ? row[typeCol] : "",
  }));
}