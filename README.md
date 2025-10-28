# Advanced Google Sheet Interface (Apps Script)

A structured Apps Script project that extends Google Sheets with custom functions and a lightweight sidebar UI. Designed to be clean, reusable, and easy to maintain.

## Overview
- Custom functions usable like native formulas (e.g., `=SAMPLE_ADD(2, 3)`).
- A simple HTML sidebar to generate a demo table into the active sheet.
- Modular structure with basic utilities and caching for performance.

## Features
- `SAMPLE_ADD(a, b)`: Validates and adds two numbers.
- `CLEAN_TEXT(text, mode)`: Trims or changes case of input text.
- `DEMO_TABLE(rows, multiplier)`: Returns a 2D array table suitable for writing to a range.
- `FIB(n)`: Computes the nth Fibonacci number with caching.
- Sidebar UI to write a generated table to a specified cell.

## Project Structure
- `Code.gs`: App entry points (menu, sidebar, server handlers).
- `Functions.gs`: All custom functions callable from Sheets.
- `Utils.gs`: Shared utilities (validation, range flattening, cache wrappers).
- `Sidebar.html`: Minimal responsive UI for generating demo tables.
- `appsscript.json`: Script configuration (V8 runtime, timezone, logging).

## Requirements
- Google account with access to Google Sheets and Apps Script.
- No external APIs required for this demo.

## Setup
1. Open a Google Sheet (new or existing).
2. Go to `Extensions` → `Apps Script`.
3. In the Apps Script editor:
   - Create files named exactly:
     - `Code.gs`
     - `Functions.gs`
     - `Utils.gs`
     - `Sidebar.html`
   - Paste the corresponding contents from this project into each file.
   - Open `Project Settings` → `Script properties` if you need custom configuration (optional).
4. Save the project. The Sheet may require reloading once.

## How to Use in Google Sheets
- After saving and reloading the Sheet:
  - A new menu `Advanced Interface` appears.
  - Click `Advanced Interface` → `Open Sidebar` to use the UI.
- First run:
  - Apps Script will prompt for authorization; approve the requested scopes.

### Using Custom Functions in Cells
- `=SAMPLE_ADD(2, 3)`  
  Returns `5`.
- `=CLEAN_TEXT("  Hello  ", "TRIM")`  
  Returns `Hello`. Modes supported: `TRIM`, `UPPER`, `LOWER`.
- `=DEMO_TABLE(4, 3)`  
  Returns a 5-row table (including header) with computed values.
- `=FIB(10)`  
  Returns `55`. Uses caching to improve repeated calls.

### Using the Sidebar
1. Open via `Advanced Interface` → `Open Sidebar`.
2. Set `Multiplier` (e.g., `2`) and `Output cell (A1)` (e.g., `A1`).
3. Click `Generate Table`.
4. The demo table is written to your specified top-left cell.

## Maintenance & Extension
- Add new custom functions in `Functions.gs` using clear signatures and validations.
- Keep shared helpers in `Utils.gs` for reuse and consistent error handling.
- For lightweight configuration UIs, extend `Sidebar.html` and server handlers in `Code.gs`.
- Use caching (`CacheService`) when functions are computationally heavy or frequently called.

## Troubleshooting
- “Authorization required”: Trigger any function (e.g., open the sidebar) and grant permissions.
- “Function not found”: Ensure names in `Functions.gs` match your formulas exactly.
- Sidebar not showing: Confirm the file name `Sidebar.html` and the call `showSidebar()` in `Code.gs`.
- Array output not appearing correctly: Ensure the function returns a 2D array (e.g., `DEMO_TABLE` returns `Array<Array<*>>`).

## FAQ
- Can I change the menu name?  
  Yes, update `onOpen()` in `Code.gs`.
- Can I write the table to another sheet?  
  Modify `writeDemoTableFromSidebar()` to target a specific sheet.
- How do I handle large outputs?  
  Return values in batches and avoid excessive API calls; consider caching and memoization.

## Notes
- This project uses the V8 runtime (`appsscript.json` sets `"runtimeVersion": "V8"`).
- Error messages are user-friendly and thrown when inputs are invalid.

## Support
For enhancements (new functions, API integrations, more advanced UI), add requirements and examples of expected inputs/outputs. The modular structure is designed for quick iteration.