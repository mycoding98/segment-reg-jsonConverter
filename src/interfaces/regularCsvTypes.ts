// Interface for a single row in a regular CSV file
export interface RegularCsvRow {
    [key: string]: string | number | null; // Each row can have keys with string, number, or null values
  }
  
  // Interface for the entire CSV file
  export interface RegularCsvFile {
    headers: string[];         // Array of column headers
    rows: RegularCsvRow[];     // Array of rows
  }