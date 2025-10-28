// Custom functions for use directly in Google Sheets

/**
 * ADV_SUMIF(range, criteriaRange, criteria, [optsJson])
 * A flexible SUMIF supporting case sensitivity, regex, and caching.
 *
 * range: Numbers to sum (range or array)
 * criteriaRange: Range to match against (same shape/length as range)
 * criteria: String criteria. Supports wildcards (* ?) and/or regex (if enabled).
 * optsJson: Optional JSON string: { caseSensitive?: boolean, useRegex?: boolean, cacheMinutes?: number }
 *
 * Example:
 * =ADV_SUMIF(A2:A100, B2:B100, "status:done", "{\"caseSensitive\":false,\"useRegex\":false,\"cacheMinutes\":5}")
 */
function ADV_SUMIF(range, criteriaRange, criteria, optsJson) {
  var opts = Utils.safeParseJson(optsJson, {});
  var caseSensitive = Boolean(opts.caseSensitive);
  var useRegex = Boolean(opts.useRegex);
  var cacheMinutes = Utils.clampNumber(opts.cacheMinutes, 0, 60);

  // Flatten inputs
  var values = Utils.flatten(range);
  var matches = Utils.flatten(criteriaRange);

  // Validate equal lengths
  if (values.length !== matches.length) {
    throw new Error('range and criteriaRange must have the same length.');
  }

  // Attempt cache
  var cacheKey = 'ADV_SUMIF:' + Utils.buildCacheKey([values, matches, criteria, caseSensitive, useRegex]);
  if (cacheMinutes > 0) {
    var cached = Utils.cacheGet(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }

  // Build matcher
  var matcher = Utils.buildMatcher(criteria, { caseSensitive: caseSensitive, useRegex: useRegex });

  // Sum matched numeric values
  var sum = 0;
  for (var i = 0; i < values.length; i++) {
    if (matcher(String(matches[i]))) {
      var num = Utils.toNumber(values[i]);
      if (!isNaN(num)) sum += num;
    }
  }

  // Store in cache (TTL in seconds)
  if (cacheMinutes > 0) {
    Utils.cachePut(cacheKey, sum, cacheMinutes * 60);
  }

  return sum;
}

/**
 * ADV_FILTER(range, filterColumnIndex, operator, value, [sortColumnIndex], [sortOrder])
 * Filters a 2D range by a condition and optionally sorts results.
 *
 * Example:
 * =ADV_FILTER(A1:D100, 2, "equals", "done", 4, "desc")
 */
function ADV_FILTER(range, filterColumnIndex, operator, value, sortColumnIndex, sortOrder) {
  var data2d = Utils.ensure2D(range);
  if (!data2d.length) return [[]];

  var col = Utils.clampNumber(filterColumnIndex, 1, (data2d[0] || []).length) - 1;
  var op = String(operator || 'equals').toLowerCase();
  var val = String(value || '');

  var filtered = data2d.filter(function (row) {
    var cell = String(row[col] == null ? '' : row[col]);
    switch (op) {
      case 'equals': return cell === val;
      case 'contains': return cell.indexOf(val) !== -1;
      case 'starts_with': return cell.startsWith(val);
      case 'ends_with': return cell.endsWith(val);
      case 'not_equals': return cell !== val;
      case 'gt': return Utils.toNumber(cell) > Utils.toNumber(val);
      case 'gte': return Utils.toNumber(cell) >= Utils.toNumber(val);
      case 'lt': return Utils.toNumber(cell) < Utils.toNumber(val);
      case 'lte': return Utils.toNumber(cell) <= Utils.toNumber(val);
      default: throw new Error('Unsupported operator: ' + op);
    }
  });

  if (sortColumnIndex != null) {
    var sc = Utils.clampNumber(sortColumnIndex, 1, (data2d[0] || []).length) - 1;
    var order = String(sortOrder || 'asc').toLowerCase() === 'desc' ? -1 : 1;
    filtered.sort(function (a, b) {
      var av = a[sc], bv = b[sc];
      var an = Utils.toNumber(av), bn = Utils.toNumber(bv);
      var bothNumeric = !isNaN(an) && !isNaN(bn);
      if (bothNumeric) return (an - bn) * order;
      var as = String(av == null ? '' : av), bs = String(bv == null ? '' : bv);
      if (as < bs) return -1 * order;
      if (as > bs) return 1 * order;
      return 0;
    });
  }

  return filtered.length ? filtered : [[]];
}

/**
 * SAMPLE_ADD
 * Adds two numbers with validation.
 *
 * Usage: =SAMPLE_ADD(2, 3) -> 5
 *
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
function SAMPLE_ADD(a, b) {
  const aNum = coerceNumber(a, 'a');
  const bNum = coerceNumber(b, 'b');
  return aNum + bNum;
}

/**
 * CLEAN_TEXT
 * Cleans text based on a mode:
 * - "TRIM": trims whitespace
 * - "UPPER": uppercase
 * - "LOWER": lowercase
 *
 * Usage: =CLEAN_TEXT("  Hello  ", "TRIM") -> "Hello"
 *
 * @param {string} input
 * @param {string} mode TRIM|UPPER|LOWER
 * @return {string}
 */
function CLEAN_TEXT(input, mode) {
  const str = String(input == null ? '' : input);
  const m = String(mode || 'TRIM').toUpperCase();

  switch (m) {
    case 'UPPER':
      return str.toUpperCase();
    case 'LOWER':
      return str.toLowerCase();
    case 'TRIM':
    default:
      return str.trim();
  }
}

/**
 * DEMO_TABLE
 * Returns a 2D array suitable for writing directly to a range.
 * Each row contains: [Index, Value, Value * multiplier].
 *
 * Usage: =DEMO_TABLE(3, 2) -> a 3x3 table
 *
 * @param {number} rows Number of rows to generate
 * @param {number} multiplier Multiplier applied to the value column
 * @return {Array<Array<*>>} 2D array
 */
function DEMO_TABLE(rows, multiplier) {
  const r = coerceNumber(rows, 'rows');
  const m = coerceNumber(multiplier, 'multiplier');

  if (r <= 0) {
    throw new Error('rows must be > 0');
  }
  const header = ['Index', 'Value', 'Value x Multiplier'];
  const table = [header];

  for (let i = 1; i <= r; i++) {
    const value = i * 10;
    table.push([i, value, value * m]);
  }
  return table;
}

/**
 * FIB
 * Returns the n-th Fibonacci number with basic caching for speed.
 *
 * Usage: =FIB(10) -> 55
 *
 * @param {number} n
 * @return {number}
 */
function FIB(n) {
  const num = coerceNumber(n, 'n');
  if (num < 0) {
    throw new Error('n must be >= 0');
  }

  // Check cache
  const cacheKey = 'FIB_' + num;
  const cached = getCache(cacheKey);
  if (cached != null) {
    return Number(cached);
  }

  // Iterative Fibonacci for performance
  let a = 0, b = 1;
  for (let i = 0; i < num; i++) {
    const next = a + b;
    a = b;
    b = next;
  }

  setCache(cacheKey, String(a), 3600); // Cache for 1 hour
  return a;
}