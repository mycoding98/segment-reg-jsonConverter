import { promises as fs } from 'fs'; // For async file reading
import * as syncFs from 'fs'; // For synchronous file reading

interface CSVOptions {
  delimiter?: string; // Default is comma (',')
  headers?: boolean;  // Whether the first row contains headers
  quoteChar?: string; // Character used for quoting fields, default is double quote ('"')
}

interface ParsedRow {
  [key: string]: any; // Dynamic keys for each column
  FIELD5?: string;    // FIELD5 will be added dynamically
}

/**
 * Parses a CSV file synchronously and converts it into JSON data.
 * @param filePath - Path to the CSV file
 * @param options - Optional configuration for delimiters, headers, etc.
 * @param computeField5 - Optional function to customize FIELD5 generation
 * @returns ParsedRow[] - Array of JSON objects representing the rows
 * @throws Error if the file is empty or malformed
 */
export function parseCSV(
  filePath: string,
  options: CSVOptions = {},
  computeField5: (row: ParsedRow) => string = defaultComputeField5
): ParsedRow[] {
  const { delimiter = ',', headers = true, quoteChar = '"' } = options;

  // Read the file content synchronously
  const fileContent = syncFs.readFileSync(filePath, 'utf-8');

  // Parse content into rows
  return parseCSVContent(fileContent, { delimiter, headers, quoteChar }, computeField5);
}

/**
 * Parses a CSV file asynchronously and converts it into JSON data.
 * @param filePath - Path to the CSV file
 * @param options - Optional configuration for delimiters, headers, etc.
 * @param computeField5 - Optional function to customize FIELD5 generation
 * @returns Promise<ParsedRow[]> - Array of JSON objects representing the rows
 * @throws Error if the file is empty or malformed
 */
export async function parseCSVAsync(
  filePath: string,
  options: CSVOptions = {},
  computeField5: (row: ParsedRow) => string = defaultComputeField5
): Promise<ParsedRow[]> {
  const { delimiter = ',', headers = true, quoteChar = '"' } = options;

  // Read the file content asynchronously
  const fileContent = await fs.readFile(filePath, 'utf-8');

  // Parse content into rows
  return parseCSVContent(fileContent, { delimiter, headers, quoteChar }, computeField5);
}

// Internal function to parse CSV content into JSON
function parseCSVContent(
  content: string,
  options: CSVOptions,
  computeField5: (row: ParsedRow) => string
): ParsedRow[] {
  const { delimiter = ',', headers = true, quoteChar = '"' } = options;

  // Split the content into rows
  const rows = content.split('\n').map(row => row.trim()).filter(row => row.length > 0);

  // Handle edge case: empty file
  if (rows.length === 0) {
    throw new Error('CSV file is empty.');
  }

  // Extract headers if applicable
  const headerRow = headers ? rows.shift()! : null;
  const headerKeys = headerRow ? parseRow(headerRow, delimiter, quoteChar) : [];

  // Parse rows into JSON
  const jsonData: ParsedRow[] = rows.map((row) => {
    const values = parseRow(row, delimiter, quoteChar);

    if (headers) {
      // Map values to header keys
      const jsonObject: ParsedRow = {};
      headerKeys.forEach((key, index) => {
        jsonObject[key] = values[index] || null; // Assign null for missing values
      });

      // Add FIELD5 dynamically
      jsonObject.FIELD5 = computeField5(jsonObject);

      return jsonObject;
    } else {
      throw new Error('CSV file must contain headers for proper mapping.');
    }
  });

  return jsonData;
}

// Helper function to parse a single row
function parseRow(row: string, delimiter: string, quoteChar: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];

    if (char === quoteChar) {
      if (insideQuotes && nextChar === quoteChar) {
        // Escaped quote
        current += quoteChar;
        i++; // Skip next character
      } else {
        // Toggle insideQuotes
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      // Append character to current field
      current += char;
    }
  }

  // Add the last field
  result.push(current.trim());

  return result;
}

// Default FIELD5 computation
function defaultComputeField5(row: ParsedRow): string {
  const field = row['field'] || '';
  const value = row['value'] || '';
  return `${field}-${value}`;
}