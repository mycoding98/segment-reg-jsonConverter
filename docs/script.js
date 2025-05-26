"use strict";
const BRAND_LIST = ["Bowlero", "AMF", "Lucky Strike"];
const TYPE_LIST = ["Retail", "League", "Group Event", "GE"];
const fieldMappings = {
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
let _header = [];
let _segmentationRows = [];
let _fileType = "";
let _isXlsxOptIn = false;
let _isRegularCsv = false;
let _lastUploadedFileName = undefined;
const fileInput = document.getElementById('fileInput');
const output = document.getElementById('output');
const rawDataInput = document.getElementById('rawDataInput');
const processRawDataButton = document.getElementById('processRawDataButton');
const jsonInput = document.getElementById('jsonInput');
const validateJsonButton = document.getElementById('validateJsonButton');
const jsonValidationResult = document.getElementById('jsonValidationResult');
function normalizeBrand(brand) {
    const match = BRAND_LIST.find(b => b.toLowerCase() === (brand + '').toLowerCase());
    return match || brand;
}
function normalizeType(type) {
    if (type.toLowerCase() === "ge")
        return "Group Event";
    const found = TYPE_LIST.find(t => t.toLowerCase() === type.toLowerCase());
    return found || type;
}
function readFileAsync(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target?.result);
        reader.onerror = err => reject(err);
        reader.readAsArrayBuffer(file);
    });
}
function isXlsxOptInHeader(header) {
    const normHeader = header.map(h => String(h).trim().toLowerCase());
    const hasOptinId = normHeader.some(cell => cell.includes('#') ||
        cell.includes('id') ||
        cell.includes('number') ||
        cell.includes('optin'));
    const hasBrandOrCenter = normHeader.some(cell => cell.includes('brand') || cell.includes('center'));
    return hasOptinId && hasBrandOrCenter;
}
function isRegularCsv(header, data) {
    const normHeader = header.map(h => String(h).trim().toLowerCase());
    const segmentationColumns = ["id", "brand", "type"];
    const hasSegCols = segmentationColumns.every(h => normHeader.includes(h));
    const isCriteria = (normHeader.length >= 4 &&
        normHeader[0] === "type" &&
        normHeader[1] === "field" &&
        normHeader[2] === "operator" &&
        normHeader[3] === "value");
    const xlsxOptIn = isXlsxOptInHeader(header);
    return !(isCriteria || xlsxOptIn || hasSegCols);
}
function arrayToSimpleJson(header, data) {
    return data.map(row => {
        const obj = {};
        header.forEach((h, i) => { if (h && row[i] !== undefined)
            obj[h] = row[i]; });
        return obj;
    });
}
function guessBrandTypeFromFileName(fileName) {
    const lower = fileName.toLowerCase();
    let brand = BRAND_LIST.find(b => lower.includes(b.toLowerCase())) || "Bowlero";
    let type = TYPE_LIST.find(t => lower.includes(t.toLowerCase().replace(/\s+/g, "")) ||
        lower.includes(t.toLowerCase())) || "Retail";
    return { brand, type };
}
async function parseXlsxAllSheets(file) {
    const arrayBuffer = await readFileAsync(file);
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const result = {};
    for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        result[sheetName] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    }
    return result;
}
async function parseFile(file) {
    const fileName = file.name.toLowerCase();
    let data;
    let isCsv = fileName.endsWith('.csv');
    let isXlsx = fileName.endsWith('.xlsx');
    let fileType = "";
    let isXlsxOptIn = false;
    let workbook = undefined;
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
    let header = data[0];
    if (header.every(cell => typeof cell !== "string" || !cell || !isNaN(Number(cell)))) {
        header = header.map((_, idx) => `field${idx + 1}`);
    }
    isXlsxOptIn = isXlsx && isXlsxOptInHeader(header);
    const lower = fileName.toLowerCase();
    for (let type of TYPE_LIST) {
        if (lower.includes(type.toLowerCase().replace(/\s+/g, '')))
            fileType = type;
        else if (lower.includes(type.toLowerCase()))
            fileType = type;
    }
    return { data, fileType, isXlsxOptIn, fileName, workbook };
}
function arrayToSegmentationRows(header, data, fileType, isXlsxOptIn = false) {
    let valueCol, brandCol, typeCol;
    if (isXlsxOptIn) {
        const normHeaders = header.map(h => (h ?? "").trim().toLowerCase());
        valueCol = normHeaders.findIndex(h => h.includes('#') || h.includes('id') || h.includes('number') || h.includes('optin'));
        brandCol = normHeaders.findIndex(h => h.includes('brand') || h.includes('center'));
        typeCol = normHeaders.findIndex(h => h === "type");
    }
    else {
        const normHeaders = header.map(h => String(h).trim().toLowerCase());
        valueCol = normHeaders.findIndex(h => h === "value");
        if (valueCol === -1)
            valueCol = normHeaders.findIndex(h => ["#", "id", "number", "optin"].includes(h));
        if (valueCol === -1 && header.length === 2)
            valueCol = 0;
        if (valueCol === -1)
            valueCol = 0;
        brandCol = normHeaders.findIndex(h => h === "brand" || h === "field5" || h.includes("center") || h === "centername");
        if (brandCol === -1 && header.length === 2)
            brandCol = 1;
        if (brandCol === -1)
            brandCol = header.length - 1;
        typeCol = normHeaders.findIndex(h => h === "type");
    }
    let baseRows = data
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
function getCheckedTypes() {
    const all = document.getElementById('all');
    if (all?.checked)
        return ["All"];
    const types = [];
    if (document.getElementById('retail')?.checked)
        types.push("Retail");
    if (document.getElementById('ge')?.checked)
        types.push("GE");
    if (document.getElementById('league')?.checked)
        types.push("League");
    return types;
}
function buildJsonStructure(rows, fieldMapping, segmentName) {
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
    return {
        type: "and",
        children: [
            prefCriteria,
            unsubCriteria,
            centerOrBlock
        ]
    };
}
function splitOptins(rows) {
    if (rows.length < 200) {
        return [rows];
    }
    else {
        const firstChunk = Math.ceil(rows.length / 2);
        const split = [rows.slice(0, firstChunk), rows.slice(firstChunk)];
        return split;
    }
}
function groupAndSplitRows(rows, splitForXlsxOptIn) {
    const grouped = new Map();
    for (const row of rows) {
        if (!row.brand || !row.type)
            continue;
        const brandKey = normalizeBrand(row.brand);
        const typeKey = normalizeType(row.type);
        const key = `${brandKey}|||${typeKey}`;
        if (!grouped.has(key))
            grouped.set(key, []);
        let lastChunk = grouped.get(key)[grouped.get(key).length - 1];
        if (!lastChunk) {
            grouped.get(key).push({ rows: [], brand: brandKey, type: typeKey });
            lastChunk = grouped.get(key)[grouped.get(key).length - 1];
        }
        lastChunk.rows.push(row);
    }
    const result = new Map();
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
    _isXlsxOptIn = false;
    _lastUploadedFileName = undefined;
    if (output)
        output.textContent = "";
}
fileInput?.addEventListener('change', async (event) => {
    clearCsvState();
    if (!output)
        return;
    const file = event.target?.files?.[0];
    if (!file) {
        output.textContent = "No file selected.";
        return;
    }
    try {
        const lowerName = file.name.toLowerCase();
        const isXlsx = lowerName.endsWith('.xlsx');
        let checkedTypes = getCheckedTypes();
        if (!checkedTypes.length || checkedTypes.includes("All"))
            checkedTypes = TYPE_LIST;
        if (isXlsx) {
            const sheetsData = await parseXlsxAllSheets(file);
            let segmentationOutputs = [];
            let foundSegmentation = false;
            for (const [sheetName, data] of Object.entries(sheetsData)) {
                if (!data.length)
                    continue;
                let header = data[0];
                if (header.every(cell => typeof cell !== "string" || !cell || !isNaN(Number(cell)))) {
                    header = header.map((_, idx) => `field${idx + 1}`);
                }
                if (isRegularCsv(header, data.slice(1)))
                    continue;
                let segmentationRows;
                let isXlsxOptIn = isXlsxOptInHeader(header);
                let fileType = "";
                if (isXlsxOptIn) {
                    const normHeaders = header.map(h => (h ?? "").trim().toLowerCase());
                    const valueCol = normHeaders.findIndex(h => h.includes('#') || h.includes('id') || h.includes('number') || h.includes('optin'));
                    const brandCol = normHeaders.findIndex(h => h.includes('brand') || h.includes('center'));
                    let expandedRows = [];
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
                }
                else {
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
                        if (chunks.length > 1)
                            name += ` ${i + 1}`;
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
            let header = data[0];
            if (header.every(cell => typeof cell !== "string" || !cell || !isNaN(Number(cell)))) {
                header = header.map((_, idx) => `field${idx + 1}`);
            }
            _header = header;
            _segmentationRows = data.slice(1);
            _isRegularCsv = true;
            updateOutput();
            return;
        }
        else {
            const { data, fileType, isXlsxOptIn, fileName } = await parseFile(file);
            _lastUploadedFileName = file.name;
            let header = data[0];
            if (header.every(cell => typeof cell !== "string" || !cell || !isNaN(Number(cell)))) {
                header = header.map((_, idx) => `field${idx + 1}`);
            }
            // Regular CSV
            if (isRegularCsv(header, data.slice(1))) {
                _header = header;
                _segmentationRows = data.slice(1);
                _isRegularCsv = true;
                _isXlsxOptIn = false;
                updateOutput();
                return;
            }
            else {
                _isRegularCsv = false;
            }
            // Segmentation/criteria CSV (criteria or id/brand/type)
            const normHeader = header.map(h => h.trim().toLowerCase());
            if ((normHeader.length >= 4 &&
                normHeader[0] === "type" &&
                normHeader[1] === "field" &&
                normHeader[2] === "operator" &&
                normHeader[3] === "value") ||
                (normHeader.includes("id") && normHeader.includes("brand") && normHeader.includes("type"))) {
                _header = header;
                _segmentationRows = data.slice(1);
                _isXlsxOptIn = false;
                updateOutput();
                return;
            }
            // 2-col opt-in
            if (isXlsxOptIn) {
                const normHeaders = header.map(h => (h ?? "").trim().toLowerCase());
                const valueCol = normHeaders.findIndex(h => h.includes('#') || h.includes('id') || h.includes('number') || h.includes('optin'));
                const brandCol = normHeaders.findIndex(h => h.includes('brand') || h.includes('center'));
                let expandedRows = [];
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
            }
            else {
                _header = header;
                _segmentationRows = data.slice(1);
            }
            _fileType = fileType;
            _isXlsxOptIn = isXlsxOptIn;
            updateOutput();
        }
    }
    catch (error) {
        output.textContent = `Error processing file: ${error.message}`;
    }
});
function parseRawCsvToArray(raw) {
    const lines = raw.trim().split('\n');
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
    if (!rawDataInput || !output)
        return;
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
    let header = data[0];
    if (header.every(cell => typeof cell !== "string" || !cell || !isNaN(Number(cell)))) {
        header = header.map((_, idx) => `field${idx + 1}`);
    }
    let checkedTypes = getCheckedTypes();
    if (!checkedTypes.length || checkedTypes.includes("All"))
        checkedTypes = TYPE_LIST;
    if (isRegularCsv(header, data.slice(1))) {
        _header = header;
        _segmentationRows = data.slice(1);
        _isRegularCsv = true;
        _isXlsxOptIn = false;
        updateOutput();
        return;
    }
    else {
        _isRegularCsv = false;
    }
    // Segmentation/criteria CSV (criteria or id/brand/type)
    const normHeader = header.map(h => h.trim().toLowerCase());
    if ((normHeader.length >= 4 &&
        normHeader[0] === "type" &&
        normHeader[1] === "field" &&
        normHeader[2] === "operator" &&
        normHeader[3] === "value") ||
        (normHeader.includes("id") && normHeader.includes("brand") && normHeader.includes("type"))) {
        _header = header;
        _segmentationRows = data.slice(1);
        _isXlsxOptIn = false;
        updateOutput();
        return;
    }
    // 2-col opt-in
    const isTwoColOptIn = isXlsxOptInHeader(header);
    if (isTwoColOptIn) {
        const normHeaders = header.map(h => (h ?? "").trim().toLowerCase());
        const valueCol = normHeaders.findIndex(h => h.includes('#') || h.includes('id') || h.includes('number') || h.includes('optin'));
        const brandCol = normHeaders.findIndex(h => h.includes('brand') || h.includes('center'));
        let expandedRows = [];
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
    }
    else {
        _header = header;
        _segmentationRows = data.slice(1);
        _isXlsxOptIn = false;
    }
    updateOutput();
});
function updateOutput() {
    if (!output || !_segmentationRows.length)
        return;
    // Helper: is this a criteria CSV?
    function isCriteriaHeader(header) {
        const norm = header.map(h => String(h).trim().toLowerCase());
        return (norm.length >= 4 &&
            norm[0] === "type" &&
            norm[1] === "field" &&
            norm[2] === "operator" &&
            norm[3] === "value");
    }
    // --- CRITERIA CSV ---
    if (isCriteriaHeader(_header) && Array.isArray(_segmentationRows)) {
        // Get brand and field from the first row
        const firstRow = _segmentationRows[0];
        let brand = "";
        let field = "";
        for (let i = 0; i < _header.length; i++) {
            const header = (_header[i] + "").trim().toLowerCase();
            if (header === "field5" || header === "brand")
                brand = firstRow[i];
            if (header === "field")
                field = firstRow[i];
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
        // Compose all center criteria, FORCING FIELD5 as brand string always
        const centerCriteria = _segmentationRows.map(row => {
            const obj = {};
            _header.forEach((h, i) => { if (h && row[i] !== undefined)
                obj[h] = row[i]; });
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
    // --- SEGMENTATION CSV ---
    // Check for id, brand, type columns
    const normHeader = _header.map(h => String(h).trim().toLowerCase());
    const isSegmentation = normHeader.includes("id") && normHeader.includes("brand") && normHeader.includes("type");
    if (isSegmentation && Array.isArray(_segmentationRows)) {
        // Group by brand/type
        const rows = _segmentationRows.map(row => {
            const obj = {};
            _header.forEach((h, i) => { if (h && row[i] !== undefined)
                obj[h] = row[i]; });
            return obj;
        });
        // group by brand/type
        const grouped = {};
        for (const row of rows) {
            const brand = row.brand || "Bowlero";
            const type = row.type || "Retail";
            const key = `${brand}|||${type}`;
            if (!grouped[key])
                grouped[key] = [];
            grouped[key].push(row);
        }
        // Output only the first group as a single JSON object (matches your example)
        const firstKey = Object.keys(grouped)[0];
        if (firstKey) {
            const [brand, type] = firstKey.split("|||");
            const mapping = fieldMappings[brand]?.[type];
            if (!mapping) {
                output.textContent = `// No mapping for brand "${brand}" and type "${type}"`;
                return;
            }
            const centerOrBlock = {
                type: "or",
                children: grouped[firstKey].map(row => ({
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
    }
    // Fallback: treat as simple array of objects
    if (_header && Array.isArray(_segmentationRows)) {
        const simpleJson = arrayToSimpleJson(_header, _segmentationRows);
        output.textContent = JSON.stringify(simpleJson, null, 2);
        return;
    }
    output.textContent = "// No valid data";
}
validateJsonButton?.addEventListener('click', () => {
    if (!jsonInput || !jsonValidationResult)
        return;
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
    }
    catch (e) {
        jsonValidationResult.textContent = "Invalid JSON: " + e.message;
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
//# sourceMappingURL=script.js.map