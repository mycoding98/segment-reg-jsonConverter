import ExcelJS from 'exceljs';
import { parseCSV } from './utils/dataSplitter'; // Ensure correct path to the utility file

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
    if (preferences.ge.checked && row['Category'] === 'GE or Group Event') return true;
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
          const header = worksheet.getRow(1).getCell(colIndex).value;
          if (typeof header === 'string') {
            rowData[header] = cell.value; // Assume cell.value is of a compatible type
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

      try {
        // Parse CSV using `parseCSV`
        const rows = parseCSV(csvText, { delimiter: ',', headers: true });

        // Filter rows based on preferences
        const filteredRows = filterByPreferences(rows);

        // Display the filtered JSON data
        output.textContent = JSON.stringify(filteredRows, null, 2);
      } catch (err) {
        const csvError = err as Error; // Explicitly cast to Error
        output.textContent = `Error processing CSV file: ${csvError.message}`;
      }

    } else if (fileName.endsWith('.json')) {
      // Handle JSON file
      const jsonText = await file.text();

      try {
        const jsonData = JSON.parse(jsonText);

        // Display the parsed JSON
        output.textContent = JSON.stringify(jsonData, null, 2);
      } catch (err) {
        const jsonError = err as Error; // Explicitly cast to Error
        output.textContent = `Error processing JSON file: ${jsonError.message}`;
      }
    }
  } catch (err) {
    const error = err as Error; // Explicitly cast to Error
    output.textContent = `Error processing file: ${error.message}`;
  }
});

// Attach event listener to the "Process Raw Data" button
// Attach event listener to the "Process Raw Data" button
processRawDataButton?.addEventListener('click', () => {
  try {
    const rawData = rawDataInput.value;

    // Try to parse as JSON
    try {
      const jsonData = JSON.parse(rawData);
      output.textContent = JSON.stringify(jsonData, null, 2);
      return;
    } catch {
      // If JSON parsing fails, continue to check other formats
    }

    // Try to parse as CSV
    try {
      const rows = parseCSV(rawData, { delimiter: ',', headers: true });
      output.textContent = JSON.stringify(rows, null, 2);
      return;
    } catch {
      // If CSV parsing fails, continue to check other formats
    }

    // If neither JSON nor CSV parsing works, display an error
    output.textContent = `Unable to process the data. Please ensure it is valid JSON, CSV, or XLSX content.`;
  } catch (err) {
    const error = err as Error;
    output.textContent = `Error processing raw data: ${error.message}`;
  }
});