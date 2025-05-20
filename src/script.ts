import ExcelJS from 'exceljs';
import { parseCSV } from './utils/dataSplitter'; // Ensure correct path to the utility file
import { validateJson } from './jsonValidator'; // Correct relative path for JSON validation utility

// Schema for JSON validation
const segmentationSchema = {
  type: 'object',
  properties: {
    Category: { type: 'string' }, // "Brand", "Retail", etc.
    Segment: { type: 'string' },
    Value: { type: 'number' },
  },
  required: ['Category', 'Segment', 'Value'],
  additionalProperties: false,
};

// File input and output elements
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const output = document.getElementById('output') as HTMLPreElement;
const rawDataInput = document.getElementById('rawDataInput') as HTMLTextAreaElement;
const processRawDataButton = document.getElementById('processRawDataButton') as HTMLButtonElement;

// Preferences checkboxes
const preferences = {
  brand: document.getElementById('brand') as HTMLInputElement,
  retail: document.getElementById('retail') as HTMLInputElement,
  ge: document.getElementById('ge') as HTMLInputElement,
  league: document.getElementById('league') as HTMLInputElement,
};

// Function to filter rows based on preferences
function filterByPreferences(rows: Record<string, any>[]): Record<string, any>[] {
  return rows.filter((row) => {
    if (preferences.brand.checked && row['Category'] === 'Brand') return true;
    if (preferences.retail.checked && row['Category'] === 'Retail') return true;
    if (preferences.ge.checked && row['Category'] === 'GE') return true;
    if (preferences.league.checked && row['Category'] === 'League') return true;
    return false;
  });
}

// Attach event listener to the file input
fileInput?.addEventListener('change', async (event) => {
  const file = (event.target as HTMLInputElement)?.files?.[0];
  if (!file) {
    output.textContent = "No file selected.";
    return;
  }

  const fileName = file.name.toLowerCase();

  // Validate file type
  if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.csv') && !fileName.endsWith('.json')) {
    output.textContent = "Unsupported file format. Please upload an Excel, CSV, or JSON file.";
    return;
  }

  try {
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Handle Excel file
      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);

      // Allow user to select the worksheet (default to the first one)
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        output.textContent = "No worksheet found in the Excel file.";
        return;
      }

      // Read headers and rows
      const rows: Record<string, any>[] = [];
      worksheet.eachRow((row, rowIndex) => {
        if (rowIndex === 1) return; // Skip the header row
        const rowData: Record<string, any> = {};
        row.eachCell((cell, colIndex) => {
          const header = worksheet.getRow(1).getCell(colIndex).value || `Column ${colIndex}`;
          if (typeof header === 'string') {
            rowData[header] = cell.value;
          }
        });
        rows.push(rowData);
      });

      // Filter rows based on preferences
      const filteredRows = filterByPreferences(rows);

      // Display the filtered JSON data
      output.textContent = JSON.stringify(filteredRows, null, 2);

    } else if (fileName.endsWith('.csv')) {
      // Handle CSV file
      const csvText = await file.text(); // Read CSV file as text

      // Parse CSV using `parseCSV`
      const rows = parseCSV(csvText, { delimiter: ',', headers: true });

      // Filter rows based on preferences
      const filteredRows = filterByPreferences(rows);

      // Display the filtered JSON data
      output.textContent = JSON.stringify(filteredRows, null, 2);

    } else if (fileName.endsWith('.json')) {
      // Handle JSON file
      const jsonText = await file.text();
      const jsonData = JSON.parse(jsonText);

      // Validate JSON against the segmentation schema
      validateJson(jsonData, segmentationSchema);

      // Display the validated JSON
      output.textContent = JSON.stringify(jsonData, null, 2);
    }
  } catch (err) {
    const error = err as Error;
    output.textContent = `Error processing file: ${error.message}`;
  }
});

// Attach event listener to the "Process Raw Data" button
processRawDataButton?.addEventListener('click', () => {
  try {
    const rawData = rawDataInput.value;
    const jsonData = JSON.parse(rawData);

    // Validate JSON data against the segmentation schema
    validateJson(jsonData, segmentationSchema);

    // Display the validated JSON
    output.textContent = JSON.stringify(jsonData, null, 2);
  } catch (err) {
    const error = err as Error;
    output.textContent = `Validation failed: ${error.message}`;
  }
});