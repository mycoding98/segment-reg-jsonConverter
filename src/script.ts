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
    result.set(key, [{ rows: groupRows, brand, type }]);
  }
  return result;
}

function buildJsonStructure(
  rows: SegmentationRow[],
  fieldMapping: { pref: number; center: number; unsub: number },
  segmentName: string
): object {
  // Always wrap centers in a single OR block, always include FIELD5
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

  return {
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
        centerOrBlock // Always present, always or!
      ]
    }
  };
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

// ... (all your CSV/file parsing helpers remain unchanged) ...

function updateOutput() {
  if (!output || !_segmentationRows.length) {
    return;
  }

  // --- ENSURE CRITERIA CSV ALWAYS OUTPUTS AND/OR STRUCTURE ---
  if (_isCriteriaCsv && _header && Array.isArray(_segmentationRows)) {
    // Get brand and field from the first row
    const firstRow = _segmentationRows[0] as any[];
    let brand = "";
    let field = "";
    for (let i = 0; i < _header.length; i++) {
      const header = (_header[i] + "").trim().toLowerCase();
      if (header === "field5" || header === "brand") brand = firstRow[i];
      if (header === "field") field = firstRow[i];
    }
    brand = brand || "Bowlero";

    // Guess type from field mapping (reverse lookup)
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

    // Compose all center criteria, FORCING FIELD5 as brand string always
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

    // Always wrap center criteria in a single OR block
    const centerOrBlock = {
      type: "or",
      children: centerCriteria
    };

    // Pref/unsub criteria
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

    // ALWAYS produce this structure, even if empty/partial
    const wrapped = {
      type: "and",
      children: [
        prefCriteria,
        unsubCriteria,
        centerOrBlock
      ]
    };
    output.textContent = JSON.stringify(wrapped, null, 2);
    return;
  }

  if (_isRegularCsv && _header && Array.isArray(_segmentationRows)) {
    const simpleJson = arrayToSimpleJson(_header, _segmentationRows as any[][]);
    output.textContent = JSON.stringify(simpleJson, null, 2);
    return;
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