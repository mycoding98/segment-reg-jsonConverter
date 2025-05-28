// AMERconvert Main Script
// Handles CSV/XLSX parsing, segmentation, and JSON output for Bowlero/AMF/Lucky Strike brands
 // CSV parsing quoted fields, arrays, headerless, nested, vertical/horizontal, criteria, segmentation, etc.

declare var XLSX: any;

// Type
interface Criteria {
  type: "criteria" | "and" | "or";
  field?: string;
  operator?: "equals" | "empty";
  value?: string;
  FIELD5?: string;
  children?: Criteria[];
}
interface SegmentationRow {
  id: number | string;
  brand: string;
  type: string;
}

// Brand/type lists and field mappings
const BRAND_LIST = ["Bowlero", "AMF", "Lucky Strike"];
const TYPE_LIST = ["Retail", "League", "Group Event", "GE"];

const fieldMappings: Record<string, Record<string, { pref: number; center: number; unsub: number }>> = {
  "Bowlero": {
    "Retail": { "pref": 413, "center": 412, "unsub": 418 },
    "League": { "pref": 415, "center": 414, "unsub": 418 },
    "Group Event": { "pref": 417, "center": 416, "unsub": 418 },
    "GE": { "pref": 417, "center": 416, "unsub": 418 },
  },
  "AMF": {
    "Retail": { "pref": 406, "center": 405, "unsub": 411 },
    "League": { "pref": 408, "center": 407, "unsub": 411 },
    "Group Event": { "pref": 410, "center": 409, "unsub": 411 },
    "GE": { "pref": 410, "center": 409, "unsub": 411 },
  },
  "Lucky Strike": {
    "Retail": { "pref": 1064, "center": 1065, "unsub": 1084 },
    "League": { "pref": 1082, "center": 1083, "unsub": 1084 },
    "Group Event": { "pref": 1067, "center": 1068, "unsub": 1084 },
    "GE": { "pref": 1067, "center": 1068, "unsub": 1084 },
  },
};

// State variables
let _header: string[] = [];
let _segmentationRows: SegmentationRow[] | any[][] = [];
let _fileType: string = "";
let _isXlsxOptIn: boolean = false;
let _isRegularCsv: boolean = false;
let _lastUploadedFileName: string | undefined = undefined;

// DOM references
const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
const output = document.getElementById('output') as HTMLPreElement | null;
const rawDataInput = document.getElementById('rawDataInput') as HTMLTextAreaElement | null;
const processRawDataButton = document.getElementById('processRawDataButton') as HTMLButtonElement | null;
const jsonInput = document.getElementById('jsonInput') as HTMLTextAreaElement | null;
const validateJsonButton = document.getElementById('validateJsonButton') as HTMLButtonElement | null;
const jsonValidationResult = document.getElementById('jsonValidationResult') as HTMLPreElement | null;

// Transpose a 2D array
function transpose(matrix: any[][]): any[][] {
  if (!matrix.length) return [];
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}

// Normalize brand and type values
function normalizeBrand(brand: string): string {
  const match = BRAND_LIST.find(b => b.toLowerCase() === (brand + '').toLowerCase());
  return match || brand;
}
function normalizeType(type: string): string {
  if (type.toLowerCase() === "ge") return "Group Event";
  const found = TYPE_LIST.find(t => t.toLowerCase() === type.toLowerCase());
  return found || type;
}

// Read file as ArrayBuffer
function readFileAsync(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = err => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

// Check if header matches opt-in XLSX format
function isXlsxOptInHeader(header: any[]): boolean {
  const normHeader = header.map(h => (h == null ? "" : String(h)).trim().toLowerCase());
  const hasOptinId = normHeader.some(cell =>
    String(cell).includes('#') ||
    String(cell).includes('id') ||
    String(cell).includes('number') ||
    String(cell).includes('optin')
  );
  const hasBrandOrCenter = normHeader.some(cell =>
    String(cell).includes('brand') || String(cell).includes('center')
  );
  return hasOptinId && hasBrandOrCenter;
}

// Check if CSV is regular CSV, header is a flat array of strings
function isRegularCsv(header: any[], data: any[][]): boolean {
  if (!Array.isArray(header) || header.some(h => Array.isArray(h) || typeof h === "object")) {
    return false;
  }
  const normHeader = header.map(h => (h == null ? "" : String(h)).trim().toLowerCase());
  const segmentationColumns = ["id", "brand", "type"];
  const hasSegCols = segmentationColumns.every(h => normHeader.includes(h));
  const isCriteria = (
    normHeader.length >= 4 &&
    normHeader[0] === "type" &&
    normHeader[1] === "field" &&
    normHeader[2] === "operator" &&
    normHeader[3] === "value"
  );
  return !(isCriteria || hasSegCols);
}

// Convert array data to simple JSON objects
function arrayToSimpleJson(header: string[], data: any[][]): object[] {
  return data.map(row => {
    const obj: any = {};
    header.forEach((h, i) => { if (h && row[i] !== undefined) obj[h] = row[i]; });
    return obj;
  });
}

// Guess brand/type from file name
function guessBrandTypeFromFileName(fileName: string): { brand: string, type: string } {
  const lower = fileName.toLowerCase();
  let brand = BRAND_LIST.find(b => lower.includes(b.toLowerCase())) || "Bowlero";
  let type = TYPE_LIST.find(t =>
    lower.includes(t.toLowerCase().replace(/\s+/g, "")) ||
    lower.includes(t.toLowerCase())
  ) || "Retail";
  return { brand, type };
}

// Parse all sheets in an XLSX file
async function parseXlsxAllSheets(file: File): Promise<Record<string, any[][]>> {
  const arrayBuffer = await readFileAsync(file);
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const result: Record<string, any[][]> = {};
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    result[sheetName] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  }
  return result;
}

// Parse a file (CSV or XLSX) and return data and metadata
async function parseFile(file: File): Promise<{data: any[][], fileType: string, isXlsxOptIn: boolean, fileName: string, workbook?: any}> {
  const fileName = file.name.toLowerCase();
  let data: any[][];
  let isCsv = fileName.endsWith('.csv');
  let isXlsx = fileName.endsWith('.xlsx');
  let fileType = "";
  let isXlsxOptIn = false;
  let workbook: any = undefined;

  if (isCsv) {
    const text = await file.text();
    workbook = XLSX.read(text, { type: 'string' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  } 
  else if (isXlsx) {
    const arrayBuffer = await readFileAsync(file);
    workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  } 
  else {
    throw new Error("Unsupported file format: " + fileName);
  }

  let header = data[0] as string[];
  if (header.every(cell => typeof cell !== "string" || !cell || !isNaN(Number(cell)))) {
    header = header.map((_, idx) => `field${idx + 1}`);
  }
  isXlsxOptIn = isXlsx && isXlsxOptInHeader(header);

  const lower = fileName.toLowerCase();
  for (let type of TYPE_LIST) {
    if (lower.includes(type.toLowerCase().replace(/\s+/g, ''))) fileType = type;
    else if (lower.includes(type.toLowerCase())) fileType = type;
  }
  
  return { data, fileType, isXlsxOptIn, fileName, workbook };
}

// convert array data to SegmentationRow[]
function arrayToSegmentationRows(
  header: string[],
  data: any[][],
  fileType: string,
  isXlsxOptIn: boolean = false
): SegmentationRow[] {
  let valueCol: number, brandCol: number, typeCol: number;
  if (isXlsxOptIn) {
    const normHeaders = header.map(h => (h ?? "").trim().toLowerCase());
    valueCol = normHeaders.findIndex(h =>
      h.includes('#') || h.includes('id') || h.includes('number') || h.includes('optin')
    );
    brandCol = normHeaders.findIndex(h =>
      h.includes('brand') || h.includes('center')
    );
    typeCol = normHeaders.findIndex(h => h === "type");
  } else {
    const normHeaders = header.map(h => String(h).trim().toLowerCase());
    valueCol = normHeaders.findIndex(h => h === "value");
    if (valueCol === -1) valueCol = normHeaders.findIndex(h => ["#", "id", "number", "optin"].includes(h));
    if (valueCol === -1 && header.length === 2) valueCol = 0;
    if (valueCol === -1) valueCol = 0;

    brandCol = normHeaders.findIndex(h =>
      h === "brand" || h === "field5" || h.includes("center") || h === "centername"
    );
    if (brandCol === -1 && header.length === 2) brandCol = 1;
    if (brandCol === -1) brandCol = header.length - 1;

    typeCol = normHeaders.findIndex(h => h === "type");
  }

  let baseRows: SegmentationRow[] = data
    .filter(row => Array.isArray(row) && row.length)
    .map(row => {
      let id = valueCol !== -1 ? row[valueCol] : "";
      let brand = brandCol !== -1 ? row[brandCol] : "";
      let type = typeCol !== -1 ? row[typeCol] : "";

      if (!brand) {
        for (const cell of row) {
          const found = BRAND_LIST.find(b => (cell + "").toLowerCase().includes(b.toLowerCase()));
          if (found) {
            brand = found;
            break;
          }
        }
      }
      brand = normalizeBrand(brand);

      if (!type) {
        for (const cell of row) {
          const found = TYPE_LIST.find(t => (cell + "").toLowerCase().includes(t.toLowerCase()));
          if (found) {
            type = found;
            break;
          }
        }
      }
      if (typeof id === "undefined" || id === null || id === "") {
        id = "";
      }
      return { id, brand, type };
    });

  if (baseRows.every(r => !r.type) && fileType) {
    baseRows = baseRows.map(r => ({ ...r, type: fileType }));
  }
  const rows = baseRows.filter(r => r.id !== "" && r.brand !== "" && r.type !== "");
  return rows;
}

// get checked types from UI
function getCheckedTypes(): string[] {
  const all = document.getElementById('all') as HTMLInputElement | null;
  if (all?.checked) return ["All"];
  const types: string[] = [];
  if ((document.getElementById('retail') as HTMLInputElement)?.checked) types.push("Retail");
  if ((document.getElementById('ge') as HTMLInputElement)?.checked) types.push("GE");
  if ((document.getElementById('league') as HTMLInputElement)?.checked) types.push("League");
  return types;
}

// build JSON structure for segmentation output
function buildJsonStructure(
  rows: SegmentationRow[],
  fieldMapping: { pref: number; center: number; unsub: number },
  segmentName: string
): object {
  const prefCriteria = {
    type: "criteria",
    field: fieldMapping.pref.toString(),
    operator: "equals",
    value: "True"
  };
  const unsubCriteria = {
    type: "criteria",
    field: fieldMapping.unsub.toString(),
    operator: "empty",
    value: ""
  };
  const centerOrBlock = {
    type: "or",
    children: rows.map(row => ({
      type: "criteria",
      field: fieldMapping.center.toString(),
      operator: "equals",
      value: row.id?.toString(),
      FIELD5: row.brand
    }))
  };

  // Wraps the criteria block with name and contactCriteria like Bruno
  return {
    name: segmentName,
    contactCriteria: {
      type: "and",
      children: [
        prefCriteria,
        unsubCriteria,
        centerOrBlock
      ]
    }
  };
}

// split large opt-in lists for output
function splitOptins(rows: SegmentationRow[]): SegmentationRow[][] {
  if (rows.length < 200) {
    return [rows];
  } else {
    const firstChunk = Math.ceil(rows.length / 2);
    return [rows.slice(0, firstChunk), rows.slice(firstChunk)];
  }
}

// group and split segmentation rows by brand/type
function groupAndSplitRows(rows: SegmentationRow[], splitForXlsxOptIn: boolean) {
  const grouped = new Map<string, { rows: SegmentationRow[], brand: string, type: string }[]>();
  for (const row of rows) {
    if (!row.brand || !row.type) continue;
    const brandKey = normalizeBrand(row.brand);
    const typeKey = normalizeType(row.type);
    const key = `${brandKey}|||${typeKey}`;
    if (!grouped.has(key)) grouped.set(key, []);
    let lastChunk = grouped.get(key)![grouped.get(key)!.length - 1];

    if (!lastChunk) {
      grouped.get(key)!.push({ rows: [], brand: brandKey, type: typeKey });
      lastChunk = grouped.get(key)![grouped.get(key)!.length - 1];
    }
    lastChunk.rows.push(row);
  }

  const result = new Map<string, { rows: SegmentationRow[], brand: string, type: string }[]>();
  for (const [key, groupChunks] of grouped.entries()) {
    const groupRows = groupChunks.flatMap(chunk => chunk.rows);
    const brand = groupChunks[0].brand;
    const type = groupChunks[0].type;
    const split = splitOptins(groupRows);
    result.set(key, split.map(rows => ({ rows, brand, type })));
  }
  return result;
}

// clear all CSV state and output
function clearCsvState() {
  _header = [];
  _segmentationRows = [];
  _fileType = "";
  _isRegularCsv = false;
  _isXlsxOptIn = false;
  _lastUploadedFileName = undefined;
  if (output) output.textContent = "";
}

// File input handler
fileInput?.addEventListener('change', async (event: Event) => {
  if (!fileInput.value) {
    clearCsvState();
  }
  if (!output) return;
  const file = (event.target as HTMLInputElement)?.files?.[0];
  if (!file) {
    output.textContent = "No file selected.";
    return;
  }
  try {
    const lowerName = file.name.toLowerCase();
    const isXlsx = lowerName.endsWith('.xlsx');
    let checkedTypes = getCheckedTypes();
    if (!checkedTypes.length || checkedTypes.includes("All")) checkedTypes = TYPE_LIST;
    if (isXlsx) {
      // XLSX: Only process sheets with both ID and brand/center columns
      const sheetsData = await parseXlsxAllSheets(file);
      let segmentationOutputs: string[] = [];
      let foundSegmentation = false;
      for (const [sheetName, data] of Object.entries(sheetsData)) {
        if (!data.length) continue;
        let header = data[0] as string[];
        if (header.every(cell => typeof cell !== "string" || !cell || !isNaN(Number(cell)))) {
          header = header.map((_, idx) => `field${idx + 1}`);
        }
        // Check for ID and brand/center columns
        const normHeader = header.map(h => (h == null ? "" : String(h)).trim().toLowerCase());
        const hasId = normHeader.some(cell =>
          typeof cell === "string" && (
            cell.includes('#') ||
            cell.includes('id') ||
            cell.includes('number') ||
            cell.includes('optin')
          )
        );
        const hasBrandOrCenter = normHeader.some(cell =>
          typeof cell === "string" && (
            cell.includes('brand') || cell.includes('center')
          )
        );
        if (!(hasId && hasBrandOrCenter)) {
          segmentationOutputs.push(`// Sheet "${sheetName}" skipped: missing ID or brand/center column`);
          continue;
        }

        let segmentationRows: SegmentationRow[];
        let isXlsxOptIn = isXlsxOptInHeader(header);
        let fileType = "";
        if (isXlsxOptIn) {
          // Expand opt-in rows for each checked type
          const normHeaders = header.map(h => (h ?? "").trim().toLowerCase());
          const valueCol = normHeaders.findIndex(h =>
            h.includes('#') || h.includes('id') || h.includes('number') || h.includes('optin')
          );
          const brandCol = normHeaders.findIndex(h =>
            h.includes('brand') || h.includes('center')
          );
          let expandedRows: any[][] = [];
          data.slice(1).forEach(row => {
            checkedTypes.forEach(type => {
              expandedRows.push([
                valueCol !== -1 ? row[valueCol] : "",
                brandCol !== -1 ? row[brandCol] : "",
                type
              ]);
            });
          });
          header = ["id", "brand", "type"];
          segmentationRows = arrayToSegmentationRows(header, expandedRows, "", true);
        } else {
          segmentationRows = arrayToSegmentationRows(header, data.slice(1), fileType, false);
        }
        // --- Robust deduplication and normalization for XLSX segmentation output ---
        function cleanStr(val: any) {
          if (val == null) return "";
          return String(val)
            .replace(/[\u200B-\u200D\uFEFF\u00A0\u202F\u2060\u180E]/g, "") // remove invisible/non-breaking
            .replace(/\s+/g, " ") // collapse whitespace
            .trim()
            .toLowerCase();
        }
        const seen = new Set<string>();
        segmentationRows = segmentationRows.filter(row => {
          const normId = cleanStr(row.id);
          const normBrand = cleanStr(normalizeBrand(row.brand));
          const normType = cleanStr(normalizeType(row.type));
          if (!normId || !normBrand || !normType) {
            console.error(`Deduplication skip: Missing field(s) - id: '${row.id}', brand: '${row.brand}', type: '${row.type}' (normalized: id='${normId}', brand='${normBrand}', type='${normType}')`);
            return false;
          }
          const key = `${normId}|||${normBrand}|||${normType}`;
          if (seen.has(key)) {
            console.error(`Deduplication skip: Duplicate key '${key}' for row id: '${row.id}', brand: '${row.brand}', type: '${row.type}'`);
            return false;
          }
          seen.add(key);
          // Store canonical-cased brand for output (not lowercased)
          row.id = normId;
          row.brand = normalizeBrand(row.brand); // preserve canonical casing for output
          row.type = normalizeType(row.type); // enforce normalized type for grouping/output
          return true;
        });
        // --- End robust deduplication ---
        const grouped = groupAndSplitRows(segmentationRows, isXlsxOptIn);
        let outputStr = "";
        for (const [key, chunks] of grouped.entries()) {
          for (let i = 0; i < chunks.length; i++) {
            const { rows, brand, type } = chunks[i];
            const mapping = fieldMappings[brand]?.[normalizeType(type)];
            if (!mapping) {
              outputStr += `// No mapping for brand "${brand}" and type "${type}"
`;
              continue;
            }
            // Fallback deduplication by id+brand+type within this chunk (with normalization)
            const seenFinal = new Set<string>();
            const dedupedChunk = rows.filter(row => {
              const key = `${cleanStr(row.id)}|||${cleanStr(normalizeBrand(row.brand))}|||${cleanStr(normalizeType(row.type))}`;
              if (seenFinal.has(key)) return false;
              seenFinal.add(key);
              return true;
            });
            let name = `${brand} ${type}`;
            if (chunks.length > 1) name += ` ${i + 1}`;
            const jsonStr = JSON.stringify(buildJsonStructure(dedupedChunk, mapping, name), null, 2);
            outputStr += `\n\n-- STARTS ${name} --\n\n`;
            outputStr += jsonStr + "\n\n";
            outputStr += `-- ENDS ${name} --\n\n`;
          }
        }
        if (outputStr.trim()) {
          foundSegmentation = true;
          segmentationOutputs.push(`// ${sheetName}\n\n${outputStr.trim()}\n`);
        }
      }
      if (foundSegmentation) {
        output.textContent = segmentationOutputs.join('\n').trim();
        return;
      }
      output.textContent = segmentationOutputs.length
        ? segmentationOutputs.join('\n').trim()
        : "XLSX files are only supported for segmentation/criteria/opt-in formats with both ID and brand/center columns.";
      return;
    } else {
      // CSV: parse and handle all types
      const { data, fileType, isXlsxOptIn, fileName } = await parseFile(file);
      _lastUploadedFileName = file.name;
      let header = data[0] as string[];
      if (header.every(cell => typeof cell !== "string" || !cell || !isNaN(Number(cell)))) {
        header = header.map((_, idx) => `field${idx + 1}`);
      }

      // Segmentation detection logic
      const normHeader = header.map(h => (h == null ? "" : String(h)).trim().toLowerCase());
      const isCriteriaHeader = (
        normHeader.length === 4 &&
        normHeader[0] === "type" &&
        normHeader[1] === "field" &&
        normHeader[2] === "operator" &&
        normHeader[3] === "value"
      );
      const isSegmentationHeader = (
        normHeader.length === 3 &&
        normHeader.includes("id") &&
        normHeader.includes("brand") &&
        normHeader.includes("type")
      );
      let isSegmentation = false;
      if (isCriteriaHeader) {
        isSegmentation = true;
      } else if (isSegmentationHeader) {
        const brandIdx = normHeader.indexOf("brand");
        if (brandIdx !== -1) {
          const brands = data.slice(1).map(row => (row[brandIdx] ?? "").toString().trim().toLowerCase());
          if (brands.some(b => ["bowlero", "amf", "lucky strike", "luckystrike"].includes(b.replace(/\s+/g, "")))) {
            isSegmentation = true;
          }
        }
      }

      if (isSegmentation) {
        _header = header;
        _segmentationRows = data.slice(1);
        _isXlsxOptIn = false;
        updateOutput();
        return;
      }

      if (isXlsxOptIn) {
        // Expand opt-in rows for each checked type
        const normHeaders = header.map(h => (h ?? "").trim().toLowerCase());
        const valueCol = normHeaders.findIndex(h =>
          h.includes('#') || h.includes('id') || h.includes('number') || h.includes('optin')
        );
        const brandCol = normHeaders.findIndex(h =>
          h.includes('brand') || h.includes('center')
        );
        let expandedRows: any[][] = [];
        data.slice(1).forEach(row => {
          checkedTypes.forEach(type => {
            expandedRows.push([
              valueCol !== -1 ? row[valueCol] : "",
              brandCol !== -1 ? row[brandCol] : "",
              type
            ]);
          });
        });
        header = ["id", "brand", "type"];
        _header = header;
        _segmentationRows = arrayToSegmentationRows(header, expandedRows, "", true);
      } else {
        _header = header;
        _segmentationRows = data.slice(1);
      }
      _fileType = fileType;
      _isXlsxOptIn = isXlsxOptIn;
      updateOutput();
    }
  } catch (error) {
    output.textContent = `Error processing file: ${(error as Error).message}`;
  }
});

// Robust CSV parser for pasted/textarea input
function parseRawCsvToArray(raw: string): any[][] {
  function parseCsvRow(row: string): string[] {
    const result: string[] = [];
    let curr = "";
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          curr += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(curr);
        curr = "";
      } else {
        curr += char;
      }
    }
    result.push(curr);
    return result;
  }
  const lines = raw.trim().split('\n');
  // If any line is quoted, use robust parser
  if (lines.some(line => line.includes('"'))) {
    const parsed = lines.map(parseCsvRow);
    return parsed;
  }
  // Otherwise, try delimiter detection
  const delimiters = [',', '\t', ';', '|'];
  let bestRows = lines.map(line => line.split(','));
  let maxCols = bestRows[0].length;
  for (const delim of delimiters) {
    const rows = lines.map(line => line.split(delim));
    if (rows[0].length > maxCols) {
      bestRows = rows;
      maxCols = rows[0].length;
    }
  }
  return bestRows;
}

// detect vertical header CSVs
function isVerticalHeader(data: any[][]): boolean {
  if (!data.length || !data[0].length) return false;
  const firstCol = data.map(row => row[0]);
  const stringCount = firstCol.filter(cell => typeof cell === "string" && isNaN(Number(cell)) && cell.trim() !== "").length;
  return data.length > data[0].length && stringCount > data.length * 0.6;
}

// Handler for processing pasted/raw CSV data
processRawDataButton?.addEventListener('click', () => {
  clearCsvState();
  if (!rawDataInput || !output) return;
  const raw = rawDataInput.value.trim();
  if (!raw) {
    output.textContent = "No raw data entered.";
    return;
  }
  let data = parseRawCsvToArray(raw);
  if (!data.length) {
    output.textContent = "Empty or invalid CSV.";
    return;
  }
  let header = data[0] as string[];
  if (header.every(cell => typeof cell !== "string" || !cell || !isNaN(Number(cell)))) {
    header = header.map((_, idx) => `field${idx + 1}`);
  }

  let checkedTypes = getCheckedTypes();
  if (!checkedTypes.length || checkedTypes.includes("All")) checkedTypes = TYPE_LIST;

  // Segmentation detection logic
  const normHeader = header.map(h => (h == null ? "" : String(h)).trim().toLowerCase());
  const isCriteriaHeader = (
    normHeader.length === 4 &&
    normHeader[0] === "type" &&
    normHeader[1] === "field" &&
    normHeader[2] === "operator" &&
    normHeader[3] === "value"
  );
  const isSegmentationHeader = (
    normHeader.length === 3 &&
    normHeader.includes("id") &&
    normHeader.includes("brand") &&
    normHeader.includes("type")
  );
  let isSegmentation = false;
  if (isCriteriaHeader) {
    isSegmentation = true;
  } else if (isSegmentationHeader) {
    const brandIdx = normHeader.indexOf("brand");
    if (brandIdx !== -1) {
      const brands = data.slice(1).map(row => (row[brandIdx] ?? "").toString().trim().toLowerCase());
      if (brands.some(b => ["bowlero", "amf", "lucky strike", "luckystrike"].includes(b.replace(/\s+/g, "")))) {
        isSegmentation = true;
      }
    }
  }

  if (isSegmentation) {
    _header = header;
    _segmentationRows = data.slice(1);
    _isXlsxOptIn = false;
    updateOutput();
    return;
  }

  // Only check for opt-in if header is all strings and not auto-generated
  const isHeaderLikelyOptIn = header.every(cell => typeof cell === "string" && cell.trim() !== "");
  let isTwoColOptIn = false;
  if (isHeaderLikelyOptIn && header.length === 2) {
    isTwoColOptIn = isXlsxOptInHeader(header);
  }
  if (isTwoColOptIn) {
    const normHeaders = header.map(h => (h ?? "").trim().toLowerCase());
    const valueCol = normHeaders.findIndex(h =>
      h.includes('#') || h.includes('id') || h.includes('number') || h.includes('optin')
    );
    const brandCol = normHeaders.findIndex(h =>
      h.includes('brand') || h.includes('center')
    );
    let expandedRows: any[][] = [];
    checkedTypes.forEach(type => {
      data.slice(1).forEach(row => {
        expandedRows.push([
          valueCol !== -1 ? row[valueCol] : "",
          brandCol !== -1 ? row[brandCol] : "",
          type
        ]);
      });
    });
    header = ["id", "brand", "type"];
    _header = header;
    _segmentationRows = arrayToSegmentationRows(header, expandedRows, "", true);
    _isXlsxOptIn = true;
  }  else {
    _header = header;
    _segmentationRows = data.slice(1);
    _isXlsxOptIn = false;
  }
  updateOutput();
});

// Main output logic: handles all output types
function updateOutput() {
  if (!output || !_segmentationRows.length) return;

  function isCriteriaHeader(header: string[]): boolean {
    const norm = header.map(h => String(h).trim().toLowerCase());
    return (
      norm.length >= 4 &&
      norm[0] === "type" &&
      norm[1] === "field" &&
      norm[2] === "operator" &&
      norm[3] === "value"
    );
  }

  // Criteria CSV output
  if (isCriteriaHeader(_header) && Array.isArray(_segmentationRows)) {
    const firstRow = _segmentationRows[0] as any[];
    let brand = "";
    let field = "";
    for (let i = 0; i < _header.length; i++) {
      const header = (_header[i] + "").trim().toLowerCase();
      if (header === "field5" || header === "brand") brand = firstRow[i];
      if (header === "field") field = firstRow[i];
    }
    // Try to infer brand from field if not found in row
    if (!brand && field) {
      for (const b of Object.keys(fieldMappings)) {
        for (const t of Object.keys(fieldMappings[b])) {
          if (fieldMappings[b][t].center.toString() === field.toString()) {
            brand = b;
            break;
          }
        }
        if (brand) break;
      }
    }
    brand = brand || "Bowlero";
    let foundType = "";
    for (const t of Object.keys(fieldMappings[brand] || {})) {
      if (fieldMappings[brand][t].center.toString() === field.toString()) {
        foundType = t;
        break;
      }
    }
    const type = foundType || "Retail";
    const mapping = fieldMappings[brand]?.[type];
    if (!mapping) {
      output.textContent = "// Could not determine pref/unsub mapping for this criteria CSV";
      return;
    }
    const centerCriteria = (_segmentationRows as any[][]).map(row => {
      const obj: any = {};
      _header.forEach((h, i) => { if (h && row[i] !== undefined) obj[h] = row[i]; });
      return {
        type: "criteria",
        field: obj.field !== undefined ? (typeof obj.field === "string" ? obj.field : obj.field.toString()) : "",
        operator: obj.operator,
        value: obj.value !== undefined ? (typeof obj.value === "string" ? obj.value : obj.value.toString()) : "",
        FIELD5: brand.toString()
      };
    });
    const centerOrBlock = {
      type: "or",
      children: centerCriteria
    };
    const prefCriteria = {
      type: "criteria",
      field: mapping.pref.toString(),
      operator: "equals",
      value: "True"
    };
    const unsubCriteria = {
      type: "criteria",
      field: mapping.unsub.toString(),
      operator: "empty",
      value: ""
    };
    const segmentName = `${brand} ${type}`;
    const wrapped = {
      name: segmentName,
      contactCriteria: {
        type: "and",
        children: [
          prefCriteria,
          unsubCriteria,
          centerOrBlock
        ]
      }
    };
    output.textContent = JSON.stringify(wrapped, null, 2);
    return;
  }

  // Segmentation CSV output
  const normHeader = _header.map(h => String(h).trim().toLowerCase());
  const isSegmentation = normHeader.includes("id") && normHeader.includes("brand") && normHeader.includes("type");
  if (isSegmentation && Array.isArray(_segmentationRows)) {
    let rows = (_segmentationRows as any[][]).map(row => {
      const obj: any = {};
      _header.forEach((h, i) => { if (h && row[i] !== undefined) obj[h] = row[i]; });
      return obj;
    });
    // eliminate possible duped rows by id+brand+type (robust normalization)
    function cleanStr(val: any) {
      if (val == null) return "";
      return String(val)
        .replace(/[\u200B-\u200D\uFEFF\u00A0\u202F\u2060\u180E]/g, "") // remove invisible/non-breaking
        .replace(/\s+/g, " ") // collapse whitespace
        .trim()
        .toLowerCase();
    }
    const seen = new Set<string>();
    rows = rows.filter(row => {
      const normId = cleanStr(row.id);
      const normBrand = cleanStr(normalizeBrand(row.brand));
      const normType = cleanStr(normalizeType(row.type));
      if (!normId || !normBrand || !normType) {
        console.error(`Deduplication skip: Missing field(s) - id: '${row.id}', brand: '${row.brand}', type: '${row.type}' (normalized: id='${normId}', brand='${normBrand}', type='${normType}')`);
        return false;
      }
      const key = `${normId}|||${normBrand}|||${normType}`;
      if (seen.has(key)) {
        console.error(`Deduplication skip: Duplicate key '${key}' for row id: '${row.id}', brand: '${row.brand}', type: '${row.type}'`);
        return false;
      }
      seen.add(key);
      //normalize values for grouping/output
      row.id = normId;
      row.brand = normBrand;
      row.type = normalizeType(row.type); // enforce normalized type for grouping/output
      return true;
    });
    // group by brand/type
    const grouped: Record<string, any[]> = {};
    for (const row of rows) {
      const brand = row.brand;
      const type = row.type; // already normalized
      const key = `${brand}|||${type}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    }
    // split and output each group as separate JSON if >=200 rows
    let outputStr = "";
    let foundAny = false;
    for (const key of Object.keys(grouped)) {
      const [brand, type] = key.split("|||");
      const mapping = fieldMappings[brand]?.[type];
      if (!mapping) {
        outputStr += `// No mapping for brand "${brand}" and type "${type}"
`;
        continue;
      }
      const groupRows = grouped[key];
      // split into chunks of <200
      const chunkSize = 200;
      for (let i = 0; i < groupRows.length; i += chunkSize) {
        const chunk = groupRows.slice(i, i + chunkSize);
        // Fallback deduplication by id+brand+type within this chunk (with normalization)
        const seenFinal = new Set<string>();
        const dedupedChunk = chunk.filter(row => {
          const key = `${cleanStr(row.id)}|||${cleanStr(normalizeBrand(row.brand))}|||${cleanStr(normalizeType(row.type))}`;
          if (seenFinal.has(key)) return false;
          seenFinal.add(key);
          return true;
        });
        let name = `${brand} ${type}`;
        if (groupRows.length > chunkSize) name += ` ${Math.floor(i / chunkSize) + 1}`;
        const centerOrBlock = {
          type: "or",
          children: dedupedChunk.map(row => ({
            type: "criteria",
            field: mapping.center.toString(),
            operator: "equals",
            value: row.id?.toString(),
            FIELD5: brand
          }))
        };
        const prefCriteria = {
          type: "criteria",
          field: mapping.pref.toString(),
          operator: "equals",
          value: "True"
        };
        const unsubCriteria = {
          type: "criteria",
          field: mapping.unsub.toString(),
          operator: "empty",
          value: ""
        };
        const wrapped = {
          name,
          contactCriteria: {
            type: "and",
            children: [
              prefCriteria,
              unsubCriteria,
              centerOrBlock
            ]
          }
        };
        outputStr += JSON.stringify(wrapped, null, 2) + "\n\n";
        foundAny = true;
      }
    }
    if (foundAny) {
      output.textContent = outputStr.trim();
      return;
    }
  }

  // Vertical CSV detection (headers in first column)
  if (_header && Array.isArray(_segmentationRows)) {
    let header = _header;
    let dataRows = _segmentationRows as any[][];
    if (isVerticalHeader([header, ...dataRows])) {
      const matrix = [header, ...dataRows];
      const transposed = transpose(matrix);
      header = transposed[0].map((cell: any) => String(cell).trim());
      dataRows = transposed.slice(1);
      const firstRow = transposed[0];
      const isHeaderRow = firstRow.some(cell => typeof cell === "string" && isNaN(Number(cell)) && cell.trim() !== "");
      let records: any[] = [];
      if (isHeaderRow) {
        const newHeader = firstRow;
        for (let i = 1; i < transposed.length; i++) {
          const row = transposed[i];
          const obj: any = {};
          newHeader.forEach((h, idx) => { obj[h] = row[idx]; });
          records.push(obj);
        }
      } else {
        const newHeader = firstRow.map((_, idx) => `field${idx + 1}`);
        for (let i = 0; i < transposed.length; i++) {
          const row = transposed[i];
          const obj: any = {};
          newHeader.forEach((h, idx) => { obj[h] = row[idx]; });
          records.push(obj);
        }
      }
      output.textContent = JSON.stringify(records, null, 2);
      return;
    }
  }

  // Regular CSV (robust parsing, arrays, nested, headerless, etc)
  if (_isRegularCsv && _header && Array.isArray(_segmentationRows)) {
    let header = _header;
    let dataRows = _segmentationRows as any[][];
    const isHeaderRow = header.some(cell => typeof cell === "string" && isNaN(Number(cell)) && cell.trim() !== "");
    if (!isHeaderRow) {
      header = header.map((_, idx) => `field${idx + 1}`);
    }

    // Set nested value by dotted path
    function setNested(obj: any, path: string, value: any) {
      const parts = path.split(".");
      let curr = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!curr[parts[i]]) curr[parts[i]] = {};
        curr = curr[parts[i]];
      }
      curr[parts[parts.length - 1]] = value;
    }

    const simpleJson = dataRows.map(row => {
      const obj: any = {};
      header.forEach((h, i) => {
        let val = row[i];
        if (val === undefined || val === "") val = null;
        // Array support: split on ; if present and not quoted
        if (typeof val === "string" && val.includes(";")) {
          let v = val.trim();
          if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
          val = v.split(";").map(s => s.trim());
        } else if (typeof val === "string" && val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        }
        // Nested support: dotted headers
        if (h.includes(".")) {
          setNested(obj, h, val);
        } else {
          obj[h] = val;
        }
      });
      return obj;
    });

    output.textContent = JSON.stringify(simpleJson, null, 2);
    return;
  }

  // Fallback treat as horizontal CSV
  if (_header && Array.isArray(_segmentationRows)) {
    let header = _header;
    let dataRows = _segmentationRows as any[][];
    const isHeaderRow = header.some(cell => typeof cell === "string" && isNaN(Number(cell)) && cell.trim() !== "");
    if (!isHeaderRow) {
      header = header.map((_, idx) => `field${idx + 1}`);
    }
    const simpleJson = dataRows.map(row => {
      const obj: any = {};
      header.forEach((h, i) => { obj[h] = row[i]; });
      return obj;
    });
    output.textContent = JSON.stringify(simpleJson, null, 2);
    return;
  }
}

// JSON validation for manual input
validateJsonButton?.addEventListener('click', () => {
  if (!jsonInput || !jsonValidationResult) return;
  const raw = jsonInput.value.trim();
  if (!raw) {
    jsonValidationResult.textContent = "No input!";
    jsonValidationResult.style.color = "red";
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    jsonValidationResult.textContent = "Valid JSON!\n\n" + JSON.stringify(parsed, null, 2);
    jsonValidationResult.style.color = "green";
  } catch (e) {
    jsonValidationResult.textContent = "Invalid JSON: " + (e as Error).message;
    jsonValidationResult.style.color = "red";
  }
});

// UI event listeners for type checkboxes
document.addEventListener('DOMContentLoaded', () => {
  ['all', 'retail', 'ge', 'league'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', updateOutput);
  });
});

// Copy and download buttons
document.getElementById('copyButton')?.addEventListener('click', () => {
  if (output) { navigator.clipboard.writeText(output.textContent || ''); }
});
document.getElementById('downloadButton')?.addEventListener('click', () => {
  if (output) {
    const blob = new Blob([output.textContent || ''], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'result.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
});