import ExcelJS from 'exceljs';

const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const output = document.getElementById('output') as HTMLPreElement;

fileInput?.addEventListener('change', async (event) => {
  const file = (event.target as HTMLInputElement)?.files?.[0];
  if (!file) {
    output.textContent = "No file selected";
    return;
  }

  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
    output.textContent = "Unsupported file format. Please upload an Excel file.";
    return;
  }

  try {
    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = await file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);

    // Get the first worksheet
    const worksheet = workbook.worksheets[0];

    // Read headers and rows
    const rows: any[] = [];
    worksheet.eachRow((row, rowIndex) => {
      const rowData: any = {};
      row.eachCell((cell, colIndex) => {
        const header = worksheet.getRow(1).getCell(colIndex).value || `Column ${colIndex}`;
        if (typeof header === 'string') {
          rowData[header] = cell.value;
        }
      });
      if (rowIndex !== 1) { // Skip the header row
        rows.push(rowData);
      }
    });

    // Display the JSON data
    output.textContent = JSON.stringify(rows, null, 2);

  } catch (err) {
    const error = err as Error; // Type-casting 'unknown' to 'Error'
    output.textContent = `Error reading Excel file: ${error.message}`;
  }
});