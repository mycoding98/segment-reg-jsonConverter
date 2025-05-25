declare var XLSX: any;

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

let _header: string[] = [];
let _segmentationRows: SegmentationRow[] | any[][] = [];
let _fileType: string = "";
let _isXlsxOptIn: boolean = false;
let _isCriteriaCsv: boolean = false;
let _isRegularCsv: boolean = false;
let _lastUploadedFileName: string | undefined = undefined;

const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
const output = document.getElementById('output') as HTMLPreElement | null;
const rawDataInput = document.getElementById('rawDataInput') as HTMLTextAreaElement | null;
const processRawDataButton = document.getElementById('processRawDataButton') as HTMLButtonElement | null;
const jsonInput = document.getElementById('jsonInput') as HTMLTextAreaElement | null;
const validateJsonButton = document.getElementById('validateJsonButton') as HTMLButtonElement | null;
const jsonValidationResult = document.getElementById('jsonValidationResult') as HTMLPreElement | null;

function normalizeBrand(brand: string): string {
  const match = BRAND_LIST.find(b => b.toLowerCase() === (brand + '').toLowerCase());
  return match || brand;
}

function normalizeType(type: string): string {
  if (type.toLowerCase() === "ge") return "Group Event";
  const found = TYPE_LIST.find(t => t.toLowerCase() === type.toLowerCase());
  return found || type;
}

function readFileAsync(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = err => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

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

function isXlsxOptInHeader(header: string[]): boolean {
  const normHeader = header.map(h => String(h).trim().toLowerCase());
  const hasOptinId = normHeader.some(cell =>
    cell.includes('#') ||
    cell.includes('id') ||
    cell.includes('number') ||
    cell.includes('optin')
  );
  const hasBrandOrCenter = normHeader.some(cell =>
    cell.includes('brand') || cell.includes('center')
  );
  return hasOptinId && hasBrandOrCenter;
}

function isRegularCsv(header: string[], data: any[][]): boolean {
  const criteria = isCriteriaHeader(header);
  const xlsxOptIn = isXlsxOptInHeader(header);
  const segmentationColumns = ["id", "brand", "type"];
  const normHeader = header.map(h => String(h).trim().toLowerCase());
  const hasSegCols = segmentationColumns.every(h => normHeader.includes(h));
  return !(criteria || xlsxOptIn || hasSegCols);
}

function arrayToSimpleJson(header: string[], data: any[][]): object[] {
  return data.map(row => {
    const obj: any = {};
    header.forEach((h, i) => { if (h && row[i] !== undefined) obj[h] = row[i]; });
    return obj;
  });
}

function guessBrandTypeFromFileName(fileName: string): { brand: string, type: string } {
  const lower = fileName.toLowerCase();
  let brand = BRAND_LIST.find(b => lower.includes(b.toLowerCase())) || "Bowlero";
  let type = TYPE_LIST.find(t =>
    lower.includes(t.toLowerCase().replace(/\s+/g, "")) ||
    lower.includes(t.toLowerCase())
  ) || "Retail";
  return { brand, type };
}

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
  } else if (isXlsx) {
    const arrayBuffer = await readFileAsync(file);
    workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  } else {
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

function getCheckedTypes(): string[] {
  const all = document.getElementById('all') as HTMLInputElement | null;
  if (all?.checked) return ["All"];
  const types: string[] = [];
  if ((document.getElementById('retail') as HTMLInputElement)?.checked) types.push("Retail");
  if ((document.getElementById('ge') as HTMLInputElement)?.checked) types.push("GE");
  if ((document.getElementById('league') as HTMLInputElement)?.checked) types.push("League");
  return types;
}

function buildJsonStructure(
  rows: SegmentationRow[],
  fieldMapping: { pref: number; center: number; unsub: number },
  segmentName: string
): object {
  const orCriteria = rows.map(row => ({
    type: "criteria",
    field: fieldMapping.center.toString(),
    operator: "equals",
    value: row.id?.toString(),
    FIELD5: row.brand,
  }));

  const centerOrBlock = {
    type: "or",
    children: orCriteria
  };

  const result = {
    name: segmentName,
    contactCriteria: {
      type: "and",
      children: [
        {
          type: "criteria",
          field: fieldMapping.pref.toString(),
          operator: "equals",
          value: "True",
        },
        {
          type: "criteria",
          field: fieldMapping.unsub.toString(),
          operator: "empty",
          value: "",
        },
        centerOrBlock
      ],
    }
  };
  return result;
}

function splitOptins(rows: SegmentationRow[]): SegmentationRow[][] {
  if (rows.length < 200) {
    return [rows];
  } else {
    const firstChunk = Math.ceil(rows.length / 2);
    const split = [rows.slice(0, firstChunk), rows.slice(firstChunk)];
    return split;
  }
}

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

function clearCsvState() {
  _header = [];
  _segmentationRows = [];
  _fileType = "";
  _isRegularCsv = false;
  _isCriteriaCsv = false;
  _isXlsxOptIn = false;
  _lastUploadedFileName = undefined;
  if (output) output.textContent = "";
}

fileInput?.addEventListener('change', async (event: Event) => {
  clearCsvState();
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
      const sheetsData = await parseXlsxAllSheets(file);
      let segmentationOutputs: string[] = [];
      let foundSegmentation = false;
      for (const [sheetName, data] of Object.entries(sheetsData)) {
        if (!data.length) continue;
        let header = data[0] as string[];
        if (header.every(cell => typeof cell !== "string" || !cell || !isNaN(Number(cell)))) {
          header = header.map((_, idx) => `field${idx + 1}`);
        }
        if (isRegularCsv(header, data.slice(1))) continue;

        let segmentationRows: SegmentationRow[];
        let isXlsxOptIn = isXlsxOptInHeader(header);
        let fileType = "";
        if (isXlsxOptIn) {
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
        const grouped = groupAndSplitRows(segmentationRows, isXlsxOptIn);
        let outputStr = "";
        for (const [key, chunks] of grouped.entries()) {
          for (let i = 0; i < chunks.length; i++) {
            const { rows, brand, type } = chunks[i];
            const mapping = fieldMappings[brand]?.[normalizeType(type)];
            if (!mapping) {
              outputStr += `// No mapping for brand "${brand}" and type "${type}"\n`;
              continue;
            }
            let name = `${brand} ${type}`;
            if (chunks.length > 1) name += ` ${i + 1}`;
            const json = buildJsonStructure(rows, mapping, name);
            outputStr += JSON.stringify(json, null, 2) + "\n\n";
          }
        }
        if (outputStr.trim()) {
          foundSegmentation = true;
          segmentationOutputs.push(`// ${sheetName}\n${outputStr.trim()}\n`);
        }
      }
      if (foundSegmentation) {
        output.textContent = segmentationOutputs.join('\n').trim();
        return;
      }
      const firstSheetName = Object.keys(sheetsData)[0];
      const data = sheetsData[firstSheetName];
      let header = data[0] as string[];
      if (header.every(cell => typeof cell !== "string" || !cell || !isNaN(Number(cell)))) {
        header = header.map((_, idx) => `field${idx + 1}`);
      }
      _header = header;
      _segmentationRows = data.slice(1);
      _isRegularCsv = true;
      updateOutput();
      return;
    } else {
      const { data, fileType, isXlsxOptIn, fileName } = await parseFile(file);
      _lastUploadedFileName = file.name;
      let header = data[0] as string[];
      if (header.every(cell => typeof cell !== "string" || !cell || !isNaN(Number(cell)))) {
        header = header.map((_, idx) => `field${idx + 1}`);
      }
      if (isRegularCsv(header, data.slice(1))) {
        _header = header;
        _segmentationRows = data.slice(1);
        _isRegularCsv = true;
        _isCriteriaCsv = false;
        _isXlsxOptIn = false;
        updateOutput();
        return;
      } else {
        _isRegularCsv = false;
      }
      if (isCriteriaHeader(header)) {
        _header = header;
        _segmentationRows = data.slice(1);
        _isCriteriaCsv = true;
        _isXlsxOptIn = false;
        updateOutput();
        return;
      } else {
        _isCriteriaCsv = false;
      }
      if (isXlsxOptIn) {
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
        _segmentationRows = arrayToSegmentationRows(header, data.slice(1), fileType, false);
      }
      _fileType = fileType;
      _isXlsxOptIn = isXlsxOptIn;
      updateOutput();
    }
  } catch (error) {
    output.textContent = `Error processing file: ${(error as Error).message}`;
  }
});

function parseRawCsvToArray(raw: string): any[][] {
  const lines = raw.trim().split('\n');
  // Try all delimiters and pick the one with the most columns
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
  // Debugging:
  console.log('PARSED HEADER:', header);

  let checkedTypes = getCheckedTypes();
  if (!checkedTypes.length || checkedTypes.includes("All")) checkedTypes = TYPE_LIST;

  if (isRegularCsv(header, data.slice(1))) {
    _header = header;
    _segmentationRows = data.slice(1);
    _isRegularCsv = true;
    _isCriteriaCsv = false;
    _isXlsxOptIn = false;
    updateOutput();
    return;
  } else {
    _isRegularCsv = false;
  }
  if (isCriteriaHeader(header)) {
    _header = header;
    _segmentationRows = data.slice(1);
    _isCriteriaCsv = true;
    _isXlsxOptIn = false;
    updateOutput();
    return;
  } else {
    _isCriteriaCsv = false;
  }
  const isTwoColOptIn = isXlsxOptInHeader(header);
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
  } else {
    _header = header;
    _segmentationRows = arrayToSegmentationRows(header, data.slice(1), "", false);
    _isXlsxOptIn = false;
  }
  updateOutput();
});

function updateOutput() {
  if (!output || !_segmentationRows.length) {
    return;
  }

  if (_isRegularCsv && _header && Array.isArray(_segmentationRows)) {
    const simpleJson = arrayToSimpleJson(_header, _segmentationRows as any[][]);
    output.textContent = JSON.stringify(simpleJson, null, 2);
    return;
  }

  // --- CRITERIA CSV ---
  if (_isCriteriaCsv && _header && Array.isArray(_segmentationRows)) {
    let brand = "Bowlero";
    let type = "Retail";
    if (_lastUploadedFileName) {
      const guess = guessBrandTypeFromFileName(_lastUploadedFileName);
      brand = guess.brand;
      type = guess.type;
    }
    const mapping = fieldMappings[brand]?.[normalizeType(type)];
    if (!mapping) {
      output.textContent = "// Could not determine pref/unsub mapping for this criteria CSV";
      return;
    }
    const criteriaChildren = (_segmentationRows as any[][]).map(row => {
      const obj: any = {};
      _header.forEach((h, i) => { if (h && row[i] !== undefined) obj[h] = row[i]; });
      return obj;
    });

    const prefCriteria = {
      type: "criteria",
      field: mapping.pref.toString(),
      operator: "equals",
      value: "True",
    };
    const unsubCriteria = {
      type: "criteria",
      field: mapping.unsub.toString(),
      operator: "empty",
      value: "",
    };

    const centerCriteria = criteriaChildren.filter(
      c => c.field === mapping.center.toString() && c.operator === "equals"
    );
    const centerOrBlock = {
      type: "or",
      children: centerCriteria.map(c => ({
        type: "criteria",
        field: c.field,
        operator: c.operator,
        value: c.value,
        FIELD5: c.FIELD5
      }))
    };

    const wrapped = {
      name: `${brand} ${type} Criteria Segment`,
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
  // --- SEGMENTATION CSV ---
  let checkedTypes = getCheckedTypes();
  if (!checkedTypes.length) checkedTypes = ["All"];

  let filteredRows = _segmentationRows as SegmentationRow[];

  if (
    filteredRows.length > 0 &&
    filteredRows.every(r => !r.type) &&
    checkedTypes.length > 0 &&
    !checkedTypes.includes("All")
  ) {
    let expandedRows: SegmentationRow[] = [];
    for (const type of checkedTypes) {
      for (const row of filteredRows) {
        expandedRows.push({ ...row, type });
      }
    }
    filteredRows = expandedRows;
  } else if (!checkedTypes.includes("All") && checkedTypes.length > 0) {
    const normalizedTypes = checkedTypes.map(normalizeType);
    filteredRows = filteredRows.filter(r => normalizedTypes.includes(normalizeType(r.type)));
  }

  const grouped = groupAndSplitRows(filteredRows, _isXlsxOptIn);

  let outputStr = "";
  for (const [key, chunks] of grouped.entries()) {
    for (let i = 0; i < chunks.length; i++) {
      const { rows, brand, type } = chunks[i];
      const mapping = fieldMappings[brand]?.[normalizeType(type)];
      if (!mapping) {
        outputStr += `// No mapping for brand "${brand}" and type "${type}"\n`;
        continue;
      }
      let name = `${brand} ${type}`;
      if (chunks.length > 1) name += ` ${i + 1}`;
      // Always use buildJsonStructure which wraps in "or"
      const json = buildJsonStructure(rows, mapping, name);
      outputStr += JSON.stringify(json, null, 2) + "\n\n";
    }
  }
  output.textContent = outputStr.trim();
}

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

document.addEventListener('DOMContentLoaded', () => {
  ['all', 'retail', 'ge', 'league'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', updateOutput);
  });
});

document.getElementById('copyButton')?.addEventListener('click', () => {
  if (output) {
    navigator.clipboard.writeText(output.textContent || '');
  }
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