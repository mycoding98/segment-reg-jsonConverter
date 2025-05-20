import * as fs from 'fs';
import * as path from 'path';
import ExcelJS from 'exceljs';
import csvParser from 'csv-parser'; // Install using: npm install csv-parser

interface SegmentationRow {
  id: number;
  center: string;
}

const fieldMappings: Record<string, Record<string, { pref: number; center: number; unsub: number }>> = {
  "Bowlero": {
    "Retail": { "pref": 413, "center": 412, "unsub": 418 },
    "League": { "pref": 415, "center": 414, "unsub": 418 },
    "Group Event": { "pref": 417, "center": 416, "unsub": 418 },
  },
  "AMF": {
    "Retail": { "pref": 406, "center": 405, "unsub": 411 },
    "League": { "pref": 408, "center": 407, "unsub": 411 },
    "Group Event": { "pref": 410, "center": 409, "unsub": 411 },
  },
  "Lucky Strike": {
    "Retail": { "pref": 1064, "center": 1065, "unsub": 1084 },
    "League": { "pref": 1082, "center": 1083, "unsub": 1084 },
    "Group Event": { "pref": 1067, "center": 1068, "unsub": 1084 },
  },
};

/**
 * Processes a segmentation file (Excel or CSV) and generates segmentation JSONs.
 * @param filePath - Path to the input file (.xlsx or .csv).
 * @param outputDir - Directory to save the JSON outputs.
 */
export async function processSegmentationFile(filePath: string, outputDir: string): Promise<void> {
  if (filePath.endsWith('.xlsx')) {
    await processExcelFile(filePath, outputDir);
  } else if (filePath.endsWith('.csv')) {
    await processCsvFile(filePath, outputDir);
  } else {
    throw new Error('Unsupported file type. Only .xlsx and .csv files are supported.');
  }
}

/**
 * Processes an Excel file with multiple tabs and generates segmentation JSONs.
 * @param filePath - Path to the Excel file.
 * @param outputDir - Directory to save the JSON outputs.
 */
async function processExcelFile(filePath: string, outputDir: string): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  console.log(`Loading Excel file: ${filePath}`);
  await workbook.xlsx.readFile(filePath);

  workbook.eachSheet(async (worksheet) => {
    const rows: SegmentationRow[] = [];
    worksheet.eachRow((row, rowIndex) => {
      if (rowIndex > 1) { // Skip the header row
        const id = parseInt(row.getCell(1).text.trim(), 10);
        const center = row.getCell(2).text.trim();
        rows.push({ id, center });
      }
    });
    await generateSegmentationJson(rows, outputDir, worksheet.name);
  });
}

/**
 * Processes a CSV file and generates segmentation JSONs.
 * @param filePath - Path to the CSV file.
 * @param outputDir - Directory to save the JSON outputs.
 */
async function processCsvFile(filePath: string, outputDir: string): Promise<void> {
  const rows: SegmentationRow[] = [];
  console.log(`Loading CSV file: ${filePath}`);

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (data) => {
      rows.push({
        id: parseInt(data['id'], 10), // Ensure CSV headers include "id" and "center"
        center: data['center'],
      });
    })
    .on('end', async () => {
      const segmentName = path.basename(filePath, '.csv');
      await generateSegmentationJson(rows, outputDir, segmentName);
    });
}

/**
 * Generates segmentation JSONs based on rows and field mappings.
 * Splits data into multiple JSONs per field if rows exceed 200.
 * @param rows - The array of rows for segmentation processing.
 * @param outputDir - Directory to save the JSON outputs.
 * @param segmentName - The name of the segment (e.g., "Bowlero League").
 */
async function generateSegmentationJson(rows: SegmentationRow[], outputDir: string, segmentName: string): Promise<void> {
  const groupedRows: Record<string, SegmentationRow[]> = rows.reduce((acc, row) => {
    if (!acc[row.center]) acc[row.center] = [];
    acc[row.center].push(row);
    return acc;
  }, {} as Record<string, SegmentationRow[]>);

  for (const [brand, brandRows] of Object.entries(groupedRows)) {
    const fieldMapping = fieldMappings[brand];
    if (!fieldMapping) {
      console.warn(`No field mapping found for brand: ${brand}. Skipping.`);
      continue;
    }

    for (const [preferenceType, mapping] of Object.entries(fieldMapping)) {
      const filteredRows = brandRows;
      if (filteredRows.length === 0) continue;

      // Split rows if they exceed 200
      const rowChunks: SegmentationRow[][] =
        filteredRows.length > 200 ? splitArrayIntoChunks(filteredRows, Math.ceil(filteredRows.length / 2)) : [filteredRows];

      // Generate JSON files for each chunk
      rowChunks.forEach((chunk, index) => {
        const jsonStructure = buildJsonStructure(chunk, mapping, `${brand} ${preferenceType}`);
        const outputFileName = `${brand.toLowerCase().replace(/ /g, "_")}_${preferenceType.toLowerCase().replace(/ /g, "_")}_part_${index + 1}.json`;
        const outputPath = path.resolve(outputDir, outputFileName);

        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(jsonStructure, null, 2));
        console.log(`Saved ${outputPath}`);
      });
    }
  }
}

/**
 * Builds the required JSON structure for segmentation.
 * @param rows - The array of rows filtered for the brand and preference type.
 * @param fieldMapping - The field mapping for the brand and preference type.
 * @param segmentName - The name of the segment (e.g., "Bowlero League").
 * @returns The JSON structure.
 */
function buildJsonStructure(rows: SegmentationRow[], fieldMapping: { pref: number; center: number; unsub: number }, segmentName: string): object {
  return {
    "name": segmentName,
    "contactCriteria": {
      "type": "and",
      "children": [
        {
          "type": "criteria",
          "field": fieldMapping.pref.toString(),
          "operator": "equals",
          "value": "True",
        },
        {
          "type": "criteria",
          "field": fieldMapping.unsub.toString(),
          "operator": "empty",
          "value": "",
        },
        {
          "type": "or",
          "children": rows.map((row) => ({
            "type": "criteria",
            "field": fieldMapping.center.toString(),
            "operator": "equals",
            "value": row.id.toString(),
          })),
        },
      ],
    },
  };
}

/**
 * Splits an array into chunks of a specified size.
 * @param array - The array to split.
 * @param chunkSize - The maximum size of each chunk.
 * @returns An array of chunks.
 */
function splitArrayIntoChunks<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}