import * as XLSX from 'xlsx';

export interface DataColumn {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  sampleValues: any[];
  missingCount: number;
  uniqueCount: number;
}

export interface ValidationSummary {
  totalRows: number;
  totalColumns: number;
  columns: DataColumn[];
  duplicateRowsCount: number;
  missingValuesTotal: number;
  invalidDatesCount: number;
  invalidNumbersCount: number;
  errors: string[];
}

export interface TransformationStep {
  id: string;
  name: string;
  type:
    | 'remove_duplicates'
    | 'filter_rows'
    | 'rename_column'
    | 'change_type'
    | 'split_column'
    | 'merge_columns'
    | 'replace_values'
    | 'remove_nulls';
  params: Record<string, any>;
  description: string;
}

export interface PivotConfig {
  rowField: string;
  colField?: string;
  valField: string;
  aggregation: 'SUM' | 'AVERAGE' | 'COUNT' | 'MIN' | 'MAX';
}

export interface PivotResult {
  rowKeys: string[];
  colKeys: string[];
  matrix: Record<string, Record<string, number>>;
  rowTotals: Record<string, number>;
  colTotals: Record<string, number>;
  grandTotal: number;
}

// 1. Spreadsheet Inspection & Type Inference
export function inspectDataset(rows: Record<string, any>[]): ValidationSummary {
  if (!rows || rows.length === 0) {
    return {
      totalRows: 0,
      totalColumns: 0,
      columns: [],
      duplicateRowsCount: 0,
      missingValuesTotal: 0,
      invalidDatesCount: 0,
      invalidNumbersCount: 0,
      errors: ['Empty dataset provided.'],
    };
  }

  const columnNames = Object.keys(rows[0]);
  let duplicateCount = 0;
  const seenJson = new Set<string>();

  rows.forEach((r) => {
    const serialized = JSON.stringify(r);
    if (seenJson.has(serialized)) {
      duplicateCount++;
    } else {
      seenJson.add(serialized);
    }
  });

  let totalMissing = 0;
  let invalidDates = 0;
  let invalidNumbers = 0;
  const errors: string[] = [];

  const columns: DataColumn[] = columnNames.map((col) => {
    let missing = 0;
    const valuesSet = new Set<any>();
    const samples: any[] = [];
    let numericHits = 0;
    let dateHits = 0;
    let boolHits = 0;
    let nonNullCount = 0;

    rows.forEach((row, idx) => {
      const val = row[col];
      if (val === undefined || val === null || val === '') {
        missing++;
        totalMissing++;
        return;
      }
      nonNullCount++;
      valuesSet.add(val);
      if (samples.length < 5) samples.push(val);

      if (typeof val === 'number' || (!isNaN(Number(val)) && typeof val === 'string' && val.trim() !== '')) {
        numericHits++;
      } else if (typeof val === 'boolean' || val === 'true' || val === 'false') {
        boolHits++;
      } else if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val) && !isNaN(Date.parse(val))) {
        dateHits++;
      } else if (typeof val === 'string' && col.toLowerCase().includes('date')) {
        invalidDates++;
        if (errors.length < 10) errors.push(`Row ${idx + 1}: Invalid date format in '${col}': "${val}"`);
      }
    });

    let detectedType: DataColumn['type'] = 'string';
    if (nonNullCount > 0) {
      if (numericHits / nonNullCount > 0.8) detectedType = 'number';
      else if (dateHits / nonNullCount > 0.8) detectedType = 'date';
      else if (boolHits / nonNullCount > 0.8) detectedType = 'boolean';
    }

    return {
      name: col,
      type: detectedType,
      sampleValues: samples,
      missingCount: missing,
      uniqueCount: valuesSet.size,
    };
  });

  return {
    totalRows: rows.length,
    totalColumns: columnNames.length,
    columns,
    duplicateRowsCount: duplicateCount,
    missingValuesTotal: totalMissing,
    invalidDatesCount: invalidDates,
    invalidNumbersCount: invalidNumbers,
    errors,
  };
}

// 2. Excel Formulas Evaluator Engine
export class ExcelFormulaEngine {
  private data: Record<string, any>[];

  constructor(data: Record<string, any>[]) {
    this.data = data;
  }

  setData(data: Record<string, any>[]) {
    this.data = data;
  }

  // SUM(column)
  sum(column: string): number {
    return this.data.reduce((acc, row) => acc + (Number(row[column]) || 0), 0);
  }

  // SUMIF(rangeCol, criteria, sumCol)
  sumIf(rangeCol: string, criteria: any, sumCol: string): number {
    return this.data.reduce((acc, row) => {
      const match = String(row[rangeCol]).toLowerCase() === String(criteria).toLowerCase();
      return match ? acc + (Number(row[sumCol]) || 0) : acc;
    }, 0);
  }

  // SUMIFS(sumCol, [col1, crit1], [col2, crit2])
  sumIfs(sumCol: string, criteriaPairs: [string, any][]): number {
    return this.data.reduce((acc, row) => {
      const allMatch = criteriaPairs.every(([col, crit]) => {
        return String(row[col]).toLowerCase() === String(crit).toLowerCase();
      });
      return allMatch ? acc + (Number(row[sumCol]) || 0) : acc;
    }, 0);
  }

  // COUNT(column)
  count(column?: string): number {
    if (!column) return this.data.length;
    return this.data.filter((r) => r[column] !== undefined && r[column] !== null && r[column] !== '').length;
  }

  // COUNTIF(column, criteria)
  countIf(column: string, criteria: any): number {
    return this.data.filter((r) => String(r[column]).toLowerCase() === String(criteria).toLowerCase()).length;
  }

  // COUNTIFS([col1, crit1], [col2, crit2])
  countIfs(criteriaPairs: [string, any][]): number {
    return this.data.filter((row) => {
      return criteriaPairs.every(([col, crit]) => String(row[col]).toLowerCase() === String(crit).toLowerCase());
    }).length;
  }

  // AVERAGE(column)
  average(column: string): number {
    const valid = this.data.filter((r) => typeof r[column] === 'number' || !isNaN(Number(r[column])));
    if (valid.length === 0) return 0;
    const total = valid.reduce((acc, r) => acc + Number(r[column]), 0);
    return total / valid.length;
  }

  // AVERAGEIF(rangeCol, criteria, avgCol)
  averageIf(rangeCol: string, criteria: any, avgCol: string): number {
    const matches = this.data.filter(
      (r) => String(r[rangeCol]).toLowerCase() === String(criteria).toLowerCase()
    );
    if (matches.length === 0) return 0;
    const total = matches.reduce((acc, r) => acc + (Number(r[avgCol]) || 0), 0);
    return total / matches.length;
  }

  // XLOOKUP(lookupVal, lookupCol, returnCol, notFoundVal)
  xlookup(lookupVal: any, lookupCol: string, returnCol: string, notFound: any = '#N/A'): any {
    const match = this.data.find(
      (r) => String(r[lookupCol]).toLowerCase() === String(lookupVal).toLowerCase()
    );
    return match ? match[returnCol] : notFound;
  }

  // VLOOKUP(lookupVal, colIndex (1-indexed), exactMatch)
  vlookup(lookupVal: any, tableColNames: string[], returnIndex: number, exactMatch = true): any {
    if (tableColNames.length === 0 || returnIndex > tableColNames.length) return '#REF!';
    const lookupCol = tableColNames[0];
    const targetCol = tableColNames[returnIndex - 1];
    return this.xlookup(lookupVal, lookupCol, targetCol, '#N/A');
  }

  // INDEX-MATCH
  indexMatch(arrayCol: string, matchVal: any, matchCol: string): any {
    return this.xlookup(matchVal, matchCol, arrayCol);
  }

  // Text Functions
  concat(...args: string[]): string {
    return args.join('');
  }

  left(text: string, count: number): string {
    return String(text).slice(0, count);
  }

  right(text: string, count: number): string {
    return String(text).slice(-count);
  }

  mid(text: string, start: number, count: number): string {
    return String(text).substring(start - 1, start - 1 + count);
  }

  trim(text: string): string {
    return String(text).trim();
  }

  round(num: number, decimals: number = 0): number {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  }

  // Date Functions
  year(dateStr: string): number {
    return new Date(dateStr).getFullYear();
  }

  month(dateStr: string): number {
    return new Date(dateStr).getMonth() + 1;
  }

  today(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Parse and evaluate a formula string
  evaluateFormulaString(expr: string): { result: any; error?: string } {
    try {
      const clean = expr.trim().startsWith('=') ? expr.trim().substring(1).trim() : expr.trim();
      
      // SUM
      const sumMatch = clean.match(/^SUM\s*\(\s*([A-Za-z0-9_]+)\s*\)$/i);
      if (sumMatch) {
        return { result: this.sum(sumMatch[1]) };
      }

      // SUMIF
      const sumIfMatch = clean.match(/^SUMIF\s*\(\s*([A-Za-z0-9_]+)\s*,\s*["']?([^"']+)["']?\s*,\s*([A-Za-z0-9_]+)\s*\)$/i);
      if (sumIfMatch) {
        return { result: this.sumIf(sumIfMatch[1], sumIfMatch[2], sumIfMatch[3]) };
      }

      // COUNT
      const countMatch = clean.match(/^COUNT\s*\(\s*([A-Za-z0-9_]*)\s*\)$/i);
      if (countMatch) {
        return { result: this.count(countMatch[1] || undefined) };
      }

      // COUNTIF
      const countIfMatch = clean.match(/^COUNTIF\s*\(\s*([A-Za-z0-9_]+)\s*,\s*["']?([^"']+)["']?\s*\)$/i);
      if (countIfMatch) {
        return { result: this.countIf(countIfMatch[1], countIfMatch[2]) };
      }

      // AVERAGE
      const avgMatch = clean.match(/^AVERAGE\s*\(\s*([A-Za-z0-9_]+)\s*\)$/i);
      if (avgMatch) {
        return { result: this.average(avgMatch[1]) };
      }

      // AVERAGEIF
      const avgIfMatch = clean.match(/^AVERAGEIF\s*\(\s*([A-Za-z0-9_]+)\s*,\s*["']?([^"']+)["']?\s*,\s*([A-Za-z0-9_]+)\s*\)$/i);
      if (avgIfMatch) {
        return { result: this.averageIf(avgIfMatch[1], avgIfMatch[2], avgIfMatch[3]) };
      }

      // XLOOKUP
      const xlookupMatch = clean.match(/^XLOOKUP\s*\(\s*["']?([^"']+)["']?\s*,\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*(?:,\s*["']?([^"']*)["']?)?\s*\)$/i);
      if (xlookupMatch) {
        return { result: this.xlookup(xlookupMatch[1], xlookupMatch[2], xlookupMatch[3], xlookupMatch[4] || '#N/A') };
      }

      return { result: null, error: `Formula syntax '${clean}' not recognized or requires parameters.` };
    } catch (err: any) {
      return { result: '#ERROR!', error: err.message };
    }
  }
}

// 3. Pivot Table Aggregator
export function buildPivotTable(rows: Record<string, any>[], config: PivotConfig): PivotResult {
  const { rowField, colField, valField, aggregation } = config;

  const rowKeysSet = new Set<string>();
  const colKeysSet = new Set<string>();

  // Collect distinct values
  rows.forEach((r) => {
    const rowVal = String(r[rowField] !== undefined ? r[rowField] : '(Blank)');
    rowKeysSet.add(rowVal);

    if (colField) {
      const colVal = String(r[colField] !== undefined ? r[colField] : '(Blank)');
      colKeysSet.add(colVal);
    } else {
      colKeysSet.add('Total');
    }
  });

  const rowKeys = Array.from(rowKeysSet).sort();
  const colKeys = Array.from(colKeysSet).sort();

  // Accumulate raw values into buckets
  const rawBucket: Record<string, Record<string, number[]>> = {};

  rowKeys.forEach((rk) => {
    rawBucket[rk] = {};
    colKeys.forEach((ck) => {
      rawBucket[rk][ck] = [];
    });
  });

  rows.forEach((r) => {
    const rk = String(r[rowField] !== undefined ? r[rowField] : '(Blank)');
    const ck = colField ? String(r[colField] !== undefined ? r[colField] : '(Blank)') : 'Total';
    const num = Number(r[valField]) || 0;
    if (rawBucket[rk] && rawBucket[rk][ck]) {
      rawBucket[rk][ck].push(num);
    }
  });

  const aggregate = (nums: number[]): number => {
    if (nums.length === 0) return 0;
    switch (aggregation) {
      case 'SUM':
        return nums.reduce((a, b) => a + b, 0);
      case 'AVERAGE':
        return nums.reduce((a, b) => a + b, 0) / nums.length;
      case 'COUNT':
        return nums.length;
      case 'MIN':
        return Math.min(...nums);
      case 'MAX':
        return Math.max(...nums);
      default:
        return 0;
    }
  };

  const matrix: Record<string, Record<string, number>> = {};
  const rowTotals: Record<string, number> = {};
  const colTotals: Record<string, number> = {};
  let allNumbers: number[] = [];

  colKeys.forEach((ck) => (colTotals[ck] = 0));

  rowKeys.forEach((rk) => {
    matrix[rk] = {};
    const rowValsForTotal: number[] = [];

    colKeys.forEach((ck) => {
      const nums = rawBucket[rk][ck];
      const val = aggregate(nums);
      matrix[rk][ck] = val;
      rowValsForTotal.push(...nums);
      allNumbers.push(...nums);
    });

    rowTotals[rk] = aggregate(rowValsForTotal);
  });

  colKeys.forEach((ck) => {
    const colValsForTotal: number[] = [];
    rowKeys.forEach((rk) => {
      colValsForTotal.push(...rawBucket[rk][ck]);
    });
    colTotals[ck] = aggregate(colValsForTotal);
  });

  const grandTotal = aggregate(allNumbers);

  return {
    rowKeys,
    colKeys,
    matrix,
    rowTotals,
    colTotals,
    grandTotal,
  };
}

// 4. Power Query Data Transformation Pipeline
export function executeTransformationPipeline(
  initialRows: Record<string, any>[],
  steps: TransformationStep[]
): Record<string, any>[] {
  let current = [...initialRows];

  steps.forEach((step) => {
    switch (step.type) {
      case 'remove_duplicates': {
        const seen = new Set<string>();
        current = current.filter((r) => {
          const key = step.params.column ? String(r[step.params.column]) : JSON.stringify(r);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        break;
      }
      case 'filter_rows': {
        const { column, operator, value } = step.params;
        current = current.filter((r) => {
          const val = r[column];
          if (operator === 'equals') return String(val).toLowerCase() === String(value).toLowerCase();
          if (operator === 'not_equals') return String(val).toLowerCase() !== String(value).toLowerCase();
          if (operator === 'greater_than') return Number(val) > Number(value);
          if (operator === 'less_than') return Number(val) < Number(value);
          if (operator === 'contains') return String(val).toLowerCase().includes(String(value).toLowerCase());
          return true;
        });
        break;
      }
      case 'rename_column': {
        const { oldName, newName } = step.params;
        current = current.map((r) => {
          const copy = { ...r };
          if (copy[oldName] !== undefined) {
            copy[newName] = copy[oldName];
            delete copy[oldName];
          }
          return copy;
        });
        break;
      }
      case 'change_type': {
        const { column, targetType } = step.params;
        current = current.map((r) => {
          const copy = { ...r };
          if (copy[column] !== undefined) {
            if (targetType === 'number') copy[column] = Number(copy[column]) || 0;
            if (targetType === 'string') copy[column] = String(copy[column]);
            if (targetType === 'boolean') copy[column] = Boolean(copy[column]);
          }
          return copy;
        });
        break;
      }
      case 'split_column': {
        const { column, delimiter, newCol1, newCol2 } = step.params;
        current = current.map((r) => {
          const copy = { ...r };
          const raw = String(copy[column] || '');
          const parts = raw.split(delimiter || ' ');
          copy[newCol1 || `${column}_1`] = parts[0] || '';
          copy[newCol2 || `${column}_2`] = parts.slice(1).join(delimiter || ' ') || '';
          return copy;
        });
        break;
      }
      case 'merge_columns': {
        const { col1, col2, separator, newCol } = step.params;
        current = current.map((r) => {
          const copy = { ...r };
          copy[newCol || 'Merged'] = `${copy[col1] || ''}${separator || ' '}${copy[col2] || ''}`;
          return copy;
        });
        break;
      }
      case 'replace_values': {
        const { column, findVal, replaceVal } = step.params;
        current = current.map((r) => {
          const copy = { ...r };
          if (String(copy[column]) === String(findVal)) {
            copy[column] = replaceVal;
          }
          return copy;
        });
        break;
      }
      case 'remove_nulls': {
        const { column } = step.params;
        current = current.filter(
          (r) => r[column] !== null && r[column] !== undefined && r[column] !== ''
        );
        break;
      }
    }
  });

  return current;
}

// 5. Export Utilities (CSV & XLSX)
export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((header) => {
        let cell = row[header] === null || row[header] === undefined ? '' : String(row[header]);
        cell = cell.replace(/"/g, '""');
        return `"${cell}"`;
      })
      .join(',')
  );

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToXLSX(data: Record<string, any>[], sheetName: string, filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
