# AMERconvert

A web-based and CLI tool for converting segmentation and regular CSV files to JSON, and validating JSON data.

## Features
- Convert regular CSV and segmentation CSV/XLSX files to JSON
- Validate JSON data against schemas
- Web UI (in `docs/`)
- CLI support (Node.js)
- Collapsible sections and resizable output for easy use

## Getting Started

### Web App
1. Open `docs/index.html` in your browser, or serve the `docs/` folder with a static server.
2. Upload a file or paste raw data to convert.
3. Paste JSON to validate in the validator section.

### CLI
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the CLI (example):
   ```bash
   node src/index.js
   ```

## Development
- Source code: `src/`
- Build: `npm run build` (outputs to `docs/`)
- Ignore `node_modules/` and build artifacts in git

## Sharing
- To share with your team, zip the project (excluding `node_modules/`) or push to GitHub.

## License
MIT
