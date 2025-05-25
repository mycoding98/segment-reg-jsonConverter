import { parseCSV } from './utils/dataSplitter';
// File input and output elements
const fileInput = document.getElementById('fileInput');
const output = document.getElementById('output');
const rawDataInput = document.getElementById('rawDataInput');
const processRawDataButton = document.getElementById('processRawDataButton');
const copyButton = document.getElementById('copyButton');
// Preferences checkboxes
const preferences = {
    brand: document.getElementById('brand'),
    retail: document.getElementById('retail'),
    ge: document.getElementById('ge'),
    league: document.getElementById('league'),
};
// Function to filter rows based on preferences
function filterByPreferences(rows) {
    return rows.filter(row => {
        if (preferences.brand?.checked && row['Category'] === 'Brand')
            return true;
        if (preferences.retail?.checked && row['Category'] === 'Retail')
            return true;
        if (preferences.ge?.checked && row['Category'] === 'GE or Group Event')
            return true;
        if (preferences.league?.checked && row['Category'] === 'League')
            return true;
        return false;
    });
}
// File input listener
fileInput?.addEventListener('change', async (event) => {
    if (!output)
        return;
    const file = event.target?.files?.[0];
    if (!file) {
        output.textContent = "No file selected.";
        return;
    }
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.csv') && !fileName.endsWith('.json')) {
        output.textContent = "Unsupported file format. Please upload an Excel, CSV, or JSON file.";
        return;
    }
    try {
        if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet);
            const filteredRows = filterByPreferences(rows);
            output.textContent = JSON.stringify(filteredRows, null, 2);
        }
        else if (fileName.endsWith('.csv')) {
            const csvText = await file.text();
            try {
                const rows = parseCSV(csvText, { delimiter: ',', headers: true });
                const filteredRows = filterByPreferences(rows);
                output.textContent = JSON.stringify(filteredRows, null, 2);
            }
            catch (err) {
                const csvError = err;
                output.textContent = `Error processing CSV file: ${csvError.message}`;
            }
        }
        else if (fileName.endsWith('.json')) {
            const jsonText = await file.text();
            try {
                const jsonData = JSON.parse(jsonText);
                output.textContent = JSON.stringify(jsonData, null, 2);
            }
            catch (err) {
                const jsonError = err;
                output.textContent = `Error processing JSON file: ${jsonError.message}`;
            }
        }
    }
    catch (err) {
        const error = err;
        output.textContent = `Error processing file: ${error.message}`;
    }
});
// Process Raw Data Button handler
processRawDataButton?.addEventListener('click', () => {
    if (!output || !rawDataInput)
        return;
    try {
        const rawData = rawDataInput.value;
        try {
            const jsonData = JSON.parse(rawData);
            output.textContent = JSON.stringify(jsonData, null, 2);
            return;
        }
        catch {
            // Not valid JSON, try CSV
        }
        try {
            const rows = parseCSV(rawData, { delimiter: ',', headers: true });
            output.textContent = JSON.stringify(rows, null, 2);
            return;
        }
        catch {
            // Not valid CSV
        }
        output.textContent = `Unable to process the data. Please ensure it is valid JSON, CSV, or XLSX content.`;
    }
    catch (err) {
        const error = err;
        output.textContent = `Error processing raw data: ${error.message}`;
    }
});
// Copy output button handler
copyButton?.addEventListener('click', () => {
    if (output) {
        navigator.clipboard.writeText(output.textContent || '');
    }
});
//# sourceMappingURL=script.js.map