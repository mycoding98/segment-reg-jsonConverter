import * as fs from 'fs';
import csvParser from 'csv-parser';

/**
 * Converts a regular CSV file to JSON and writes it to the specified output file.
 * @param inputFilePath - The path to the input CSV file.
 * @param outputFilePath - The path to save the output JSON file.
 */
export async function convertRegularCsv(inputFilePath: string, outputFilePath: string): Promise<void> {
  const rows: any[] = [];

  try {
    fs.createReadStream(inputFilePath)
      .pipe(csvParser())
      .on('data', (data) => rows.push(data)) // Parse rows and add them to the array
      .on('end', () => {
        try {
          fs.writeFileSync(outputFilePath, JSON.stringify(rows, null, 2));
          console.log(`Regular CSV converted to JSON and saved to ${outputFilePath}`);
        } catch (writeError) {
          if (writeError instanceof Error) {
            console.error(`Error writing to file: ${writeError.message}`);
          } else {
            console.error(`Unknown error while writing: ${writeError}`);
          }
        }
      })
      .on('error', (readError) => {
        if (readError instanceof Error) {
          console.error(`Error reading the CSV file: ${readError.message}`);
        } else {
          console.error(`Unknown error while reading: ${readError}`);
        }
      });
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Unexpected error during conversion: ${error.message}`);
    } else {
      console.error(`Unknown error occurred: ${error}`);
    }
  }
}