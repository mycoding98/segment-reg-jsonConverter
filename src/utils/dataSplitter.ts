// ---- Master Flow ----
export function setupCSVImportFlow() {
  // DOM Elements
  const fileInput = getFileInputElement();
  const submitButton = getSubmitButtonElement();
  const outputDiv = getOutputDivElement();

  // Modal Functions
  function showModal(message: string) {
    // Replace with a real modal in your app if desired
    window.alert(message);
  }

  // Internal data storage for parsed rows
  let parsedRows: ParsedRow[] = [];

  // Input Function
  function handleFileInput(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      showModal("No file selected.");
      return;
    }
    readCSVFile(file)
      .then((csvText) => {
        try {
          parsedRows = parseCSV(csvText, { headers: true }, [
            // Example: dynamic segmentation field
            (row) => { row.FIELD5 = `${row['field'] ?? ""}-${row['value'] ?? ""}`; },
            // Add more row transforms here if needed
          ]);
          showModal("CSV successfully parsed!");
          displayParsedRows(parsedRows, outputDiv);
        } catch (err) {
          showModal("Error parsing CSV: " + (err as Error).message);
        }
      })
      .catch((err) => showModal("Error reading file: " + err));
  }

  // Button Functions/Listeners
  if (fileInput) fileInput.addEventListener("change", handleFileInput);
  if (submitButton) submitButton.addEventListener("click", handleSubmit);

  // Submit Function
  function handleSubmit() {
    if (!parsedRows.length) {
      showModal("Please upload and parse a CSV first!");
      return;
    }
    // Final processing or output logic here
    showModal(`Submitting ${parsedRows.length} rows!`);
    // For example, send parsedRows to a server or do something else
  }
}

// ---- DOM Elements ----
function getFileInputElement(): HTMLInputElement | null {
  return document.getElementById("csv-file-input") as HTMLInputElement | null;
}
function getSubmitButtonElement(): HTMLButtonElement | null {
  return document.getElementById("csv-submit-btn") as HTMLButtonElement | null;
}
function getOutputDivElement(): HTMLElement | null {
  return document.getElementById("csv-output");
}

// ---- Display Function ----
function displayParsedRows(rows: ParsedRow[], container: HTMLElement | null) {
  if (!container) return;
  container.innerHTML = "";
  if (!rows.length) {
    container.textContent = "No rows to display.";
    return;
  }
  // Create a table for the output
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  const headers = Object.keys(rows[0]);
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");
  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    th.style.border = "1px solid #ccc";
    th.style.padding = "2px 8px";
    tr.appendChild(th);
  });
  thead.appendChild(tr);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach(row => {
    const tr = document.createElement("tr");
    headers.forEach(h => {
      const td = document.createElement("td");
      td.textContent = row[h];
      td.style.border = "1px solid #ccc";
      td.style.padding = "2px 8px";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

// ---- CSV Parsing Logic ----

export interface CSVOptions {
  delimiter?: string;
  headers?: boolean;
  quoteChar?: string;
}
export interface ParsedRow {
  [key: string]: any;
}
export type RowTransform = (row: ParsedRow, index: number) => void;

export function parseCSV(
  text: string,
  options: CSVOptions = {},
  rowTransforms: RowTransform[] = []
): ParsedRow[] {
  const delimiter = options.delimiter ?? ",";
  const headersEnabled = options.headers !== false;
  const quoteChar = options.quoteChar ?? '"';

  const rows: string[][] = [];
  let field = "", row: string[] = [];
  let inQuotes = false, i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (char === quoteChar) {
      if (inQuotes && nextChar === quoteChar) {
        field += quoteChar; i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      row.push(field); field = "";
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else {
      field += char;
    }
    i++;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  if (!rows.length) throw new Error("CSV input is empty or invalid.");

  let output: ParsedRow[] = [];
  if (headersEnabled) {
    const headerKeys = rows[0];
    output = rows.slice(1).map((values, idx) => {
      const obj: ParsedRow = {};
      headerKeys.forEach((key, i) => (obj[key] = values[i] ?? ""));
      rowTransforms.forEach(fn => fn(obj, idx));
      return obj;
    });
  } else {
    output = rows.map((values, idx) => {
      const arr: ParsedRow = [...values];
      rowTransforms.forEach(fn => fn(arr, idx));
      return arr;
    });
  }
  return output;
}

// ---- File Reading Helper ----
function readCSVFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target?.result as string);
    reader.onerror = e => reject(e);
    reader.readAsText(file);
  });
}