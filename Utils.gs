// Helper utilities used across functions
var Utils = (function () {
  function flatten(range) {
    if (Array.isArray(range)) {
      var out = [];
      for (var i = 0; i < range.length; i++) {
        var row = range[i];
        if (Array.isArray(row)) {
          for (var j = 0; j < row.length; j++) out.push(row[j]);
        } else {
          out.push(row);
        }
      }
      return out;
    }
    return [range];
  }

  function ensure2D(range) {
    if (!Array.isArray(range)) return [[range]];
    if (range.length && Array.isArray(range[0])) return range;
    // Single row -> wrap
    return range.map(function (v) { return [v]; });
  }

  function toNumber(v) {
    if (typeof v === 'number') return v;
    var n = Number(v);
    return isNaN(n) ? NaN : n;
  }

  function clampNumber(n, min, max) {
    var num = Number(n);
    if (isNaN(num)) num = min;
    return Math.min(Math.max(num, min), max);
  }

  function safeParseJson(text, fallback) {
    try {
      if (text == null || text === '') return fallback;
      return JSON.parse(String(text));
    } catch (e) {
      return fallback;
    }
  }

  function buildCacheKey(parts) {
    var flat = [];
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (Array.isArray(p)) {
        flat.push(JSON.stringify(p));
      } else {
        flat.push(String(p));
      }
    }
    // Simple deterministic hash
    var s = flat.join('|');
    var hash = 0;
    for (var i2 = 0; i2 < s.length; i2++) {
      hash = (hash << 5) - hash + s.charCodeAt(i2);
      hash |= 0;
    }
    return String(hash);
  }

  function cacheGet(key) {
    try

    /**
     * Utility helpers for data normalization and string transforms.
     */
    
    /**
     * Ensures input is a 2D array (as Sheets passes ranges).
     * Scalars become [[scalar]], 1D arrays become column arrays.
     * @param {*} input
     * @return {Array<Array<*>>}
     */
    function normalizeTo2D(input) {
      if (Array.isArray(input)) {
        // Already 2D
        if (Array.isArray(input[0])) return input;
        // 1D -> column
        return input.map(v => [v]);
      }
      return [[input]];
    }
    
    /**
     * Flattens input into a 1D array of values.
     * @param {*} input
     * @return {Array<*>}
     */
    function flattenTo1D(input) {
      const twoD = normalizeTo2D(input);
      const res = [];
      for (let r = 0; r < twoD.length; r++) {
        const row = twoD[r] || [];
        for (let c = 0; c < row.length; c++) {
          res.push(row[c]);
        }
      }
      return res;
    }
    
    /**
     * Returns a transformer function by mode.
     * @param {string} mode
     * @return {function(*): string}
     */
    function getTransformFn(mode) {
      const m = String(mode || '').trim().toUpperCase();
    
      if (m === 'UPPER') return v => toStringSafe(v).toUpperCase();
      if (m === 'LOWER') return v => toStringSafe(v).toLowerCase();
      if (m === 'TRIM') return v => toStringSafe(v).trim();
      if (m === 'SNAKE_CASE') return v => toSnakeCase(toStringSafe(v));
      if (m === 'TITLE_CASE') return v => toTitleCase(toStringSafe(v));
    
      throw new Error('Unsupported mode: ' + mode);
    }
    
    /**
     * Applies a transform across a 2D range.
     * @param {Array<Array<*>>} values
     * @param {string} mode
     * @return {Array<Array<string>>}
     */
    function applyTransformRange(values, mode) {
      const fn = getTransformFn(mode);
      return (values || []).map(row => (row || []).map(v => fn(v)));
    }
    
    /**
     * Converts any value to a reasonable string.
     * @param {*} v
     * @return {string}
     */
    function toStringSafe(v) {
      if (v === null || v === undefined) return '';
      // Optional: format dates more explicitly
      if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      return String(v);
    }
    
    /**
     * Converts a string to snake_case.
     * @param {string} s
     * @return {string}
     */
    function toSnakeCase(s) {
      return s
        .replace(/[\W_]+/g, ' ')    // non-word to spaces
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_');      // spaces to underscores
    }
    
    /**
     * Converts a string to Title Case.
     * @param {string} s
     * @return {string}
     */
    function toTitleCase(s) {
      return s
        .toLowerCase()
        .replace(/\b\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1));
    }

    /**
     * Converts a value to a number or throws a friendly error.
     *
     * @param {*} val
     * @param {string} name
     * @return {number}
     */
    function coerceNumber(val, name) {
      const num = Number(val);
      if (Number.isFinite(num)) return num;
      throw new Error('Argument "' + name + '" must be a valid number.');
    }
    
    /**
     * Flattens a 2D range input (from Sheets) into a 1D array of values.
     *
     * @param {Array<Array<*>>|*} range
     * @return {Array<*>}
     */
    function flattenRange(range) {
      if (Array.isArray(range)) {
        const out = [];
        for (let i = 0; i < range.length; i++) {
          const row = range[i];
          if (Array.isArray(row)) {
            for (let j = 0; j < row.length; j++) out.push(row[j]);
          } else {
            out.push(row);
          }
        }
        return out;
      }
      return [range];
    }
    
    /**
     * Simple cache wrappers using CacheService.
     */
    
    /**
     * @param {string} key
     * @return {string|null}
     */
    function getCache(key) {
      try {
        const cache = CacheService.getScriptCache();
        return cache.get(key);
      } catch (e) {
        return null;
      }
    }
    
    /**
     * @param {string} key
     * @param {string} value
     * @param {number} seconds
     */
    function setCache(key, value, seconds) {
      try {
        const cache = CacheService.getScriptCache();
        cache.put(key, value, seconds);
      } catch (e) {
        // no-op if cache unavailable
      }
    }