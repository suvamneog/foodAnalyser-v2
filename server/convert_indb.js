// server/convert_indb.js
const  xlsx = require("xlsx");
const  fs = require("fs");

// Step 1: Load the Excel file
const filePath = "./data/INDB.xlsx";
const workbook = xlsx.readFile(filePath);

// Step 2: Read the first sheet (it contains the main data)
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Step 3: Convert to JSON
const jsonData = xlsx.utils.sheet_to_json(sheet);

// Step 4: Save as JSON file
const outputPath = "./data/indb_dataset.json";
fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));

console.log(`✅ INDB dataset successfully converted! (${jsonData.length} recipes saved to indb_dataset.json)`);