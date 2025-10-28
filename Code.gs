/**
 * Adds a custom menu and exposes sidebar actions.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Advanced Interface')
    .addItem('Open Sidebar', 'showSidebar')
    .addToUi();
}

/**
 * Shows the sidebar UI defined in Sidebar.html.
 */
function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('Advanced Sheet Interface');
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Server-side function called from the sidebar to generate demo data
 * and write it into the active sheet at a given A1 location.
 *
 * @param {number} multiplier Numeric multiplier applied to the demo values.
 * @param {string} outputA1 A1 cell reference where the top-left of the table will be written.
 */
function writeDemoTableFromSidebar(multiplier, outputA1) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const multiplierNum = coerceNumber(multiplier, 'multiplier');

  const data = DEMO_TABLE(5, multiplierNum); // 5 rows for demo
  const topLeft = sheet.getRange(outputA1);
  const targetRange = sheet.getRange(topLeft.getRow(), topLeft.getColumn(), data.length, data[0].length);
  targetRange.setValues(data);

  SpreadsheetApp.getActive().toast('Demo table written to ' + outputA1, 'Sidebar');
}

function setDefaultOptions(optsJson) {
  // Basic storage in document properties for convenience
  var props = PropertiesService.getDocumentProperties();
  props.setProperty('DEFAULT_OPTIONS', String(optsJson || '{}'));
  return getDefaultOptions();
}

function getDefaultOptions() {
  var props = PropertiesService.getDocumentProperties();
  var raw = props.getProperty('DEFAULT_OPTIONS') || '{}';
  var opts = Utils.safeParseJson(raw, {});
  // Normalize and clamp defaults
  var normalized = {
    caseSensitive: Boolean(opts.caseSensitive),
    useRegex: Boolean(opts.useRegex),
    cacheMinutes: Utils.clampNumber(opts.cacheMinutes, 0, 60) // 0..60 minutes
  };
  return normalized;
}

function getVersion() {
  return 'AdvancedGoogleSheetInterface v1.0.0';
}