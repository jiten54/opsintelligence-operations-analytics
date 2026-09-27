import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Upload,
  Calculator,
  Grid,
  Wand2,
  Download,
  AlertCircle,
  CheckCircle2,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Table,
  Filter,
  FileCheck,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  inspectDataset,
  ExcelFormulaEngine,
  buildPivotTable,
  executeTransformationPipeline,
  exportToCSV,
  exportToXLSX,
  TransformationStep,
  PivotConfig,
  ValidationSummary,
} from '../../services/excelEngine';

export const AdvancedExcelView: React.FC = () => {
  const { projects, revenueTransactions, employees, showNotification } = useApp();

  const [activeTab, setActiveTab] = useState<'import' | 'formula' | 'pivot' | 'powerquery' | 'reports'>('formula');

  // --- Subtab A: Spreadsheet Import State ---
  const [importedData, setImportedData] = useState<Record<string, any>[] | null>(null);
  const [inspectionResult, setInspectionResult] = useState<ValidationSummary | null>(null);
  const [importFileName, setImportFileName] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(ws);

        setImportData(rawJson);
        showNotification(`Successfully parsed ${rawJson.length} rows from ${file.name}`, 'success');
      } catch (err: any) {
        showNotification(`File parse error: ${err.message}`, 'warning');
      }
    };

    reader.readAsBinaryString(file);
  };

  const setImportData = (rows: Record<string, any>[]) => {
    setImportedData(rows);
    const summary = inspectDataset(rows);
    setInspectionResult(summary);
  };

  const handleLoadSampleDataset = () => {
    const sample = projects.map((p) => ({
      ProjectID: p.id,
      EngagementName: p.name,
      Client: p.client,
      Practice: p.department,
      ContractValue: p.contractValue,
      RevenueRecognized: p.revenueRecognized,
      RemainingBacklog: p.remainingBacklog,
      MilestoneProgress: p.progressPercentage,
      DeliveryStatus: p.status,
    }));
    setImportFileName('Sample_Engagements_Ledger.xlsx');
    setImportData(sample);
    showNotification('Loaded operational engagements sample into Excel analyzer.', 'info');
  };

  // --- Subtab B: Formula Engine State ---
  const formulaEngine = useMemo(() => {
    const activeRows = importedData || projects.map((p) => ({
      id: p.id,
      name: p.name,
      client: p.client,
      department: p.department,
      contractValue: p.contractValue,
      revenueRecognized: p.revenueRecognized,
      backlog: p.remainingBacklog,
      status: p.status,
      progress: p.progressPercentage,
    }));
    return new ExcelFormulaEngine(activeRows);
  }, [importedData, projects]);

  const [formulaInput, setFormulaInput] = useState('=SUM(contractValue)');
  const [formulaOutput, setFormulaOutput] = useState<{ result: any; error?: string } | null>(null);

  const handleEvaluateFormula = (expr?: string) => {
    const target = expr || formulaInput;
    const res = formulaEngine.evaluateFormulaString(target);
    setFormulaOutput(res);
  };

  const FORMULA_EXAMPLES = [
    { label: 'SUM Total Contract Value', formula: '=SUM(contractValue)' },
    { label: 'SUMIF Active Projects Backlog', formula: '=SUMIF(status, "Active", backlog)' },
    { label: 'COUNT Total Mandates', formula: '=COUNT(id)' },
    { label: 'COUNTIF At-Risk Projects', formula: '=COUNTIF(status, "At Risk")' },
    { label: 'AVERAGE Progress %', formula: '=AVERAGE(progress)' },
    { label: 'XLOOKUP Project Name by ID', formula: '=XLOOKUP("PRJ-0001", id, name, "Not Found")' },
  ];

  // --- Subtab C: Pivot Table Builder State ---
  const [pivotConfig, setPivotConfig] = useState<PivotConfig>({
    rowField: 'department',
    colField: 'status',
    valField: 'contractValue',
    aggregation: 'SUM',
  });

  const pivotResult = useMemo(() => {
    const rows = importedData || projects.map((p) => ({
      department: p.department,
      status: p.status,
      client: p.client,
      contractValue: p.contractValue,
      revenueRecognized: p.revenueRecognized,
      backlog: p.remainingBacklog,
      progress: p.progressPercentage,
    }));
    return buildPivotTable(rows, pivotConfig);
  }, [importedData, projects, pivotConfig]);

  // --- Subtab D: Power Query Transformation Pipeline State ---
  const [pqSteps, setPqSteps] = useState<TransformationStep[]>([
    {
      id: 'step-1',
      name: 'Filter Active Practice',
      type: 'filter_rows',
      params: { column: 'department', operator: 'not_equals', value: '' },
      description: 'Filtered rows where department is not empty',
    },
  ]);

  const rawPqData = useMemo(() => {
    return (
      importedData ||
      projects.map((p) => ({
        ProjectID: p.id,
        Client: p.client,
        Department: p.department,
        ContractValue: p.contractValue,
        Status: p.status,
        Progress: p.progressPercentage,
      }))
    );
  }, [importedData, projects]);

  const transformedPqData = useMemo(() => {
    return executeTransformationPipeline(rawPqData, pqSteps);
  }, [rawPqData, pqSteps]);

  const handleAddPqStep = (type: TransformationStep['type'], params: any, desc: string) => {
    const newStep: TransformationStep = {
      id: `step-${Date.now()}`,
      name: type.replace('_', ' ').toUpperCase(),
      type,
      params,
      description: desc,
    };
    setPqSteps((prev) => [...prev, newStep]);
    showNotification(`Applied step: ${desc}`, 'success');
  };

  const handleRemovePqStep = (stepId: string) => {
    setPqSteps((prev) => prev.filter((s) => s.id !== stepId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <span>Advanced Excel Analytics Module</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Enterprise Excel-grade analytics: XLSX spreadsheet ingestion, dynamic formula evaluator, multidimensional pivot tables, and Power Query data transformation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToXLSX(projects, 'Engagements', 'Excel_Master_Workbook')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 rounded-lg transition-colors border border-emerald-800/60 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Active Data (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Subtab Segmented Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('formula')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'formula'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Excel Formula Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('pivot')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'pivot'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Pivot Table Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('powerquery')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'powerquery'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Power Query Studio ({pqSteps.length} Steps)</span>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'import'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Spreadsheet Import & Ingestion</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          <span>Conditional Formatting Ledger</span>
        </button>
      </div>

      {/* Tab 1: Excel Formula Engine */}
      {activeTab === 'formula' && (
        <div className="space-y-5">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Live Excel Formula Evaluator</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates formulas across active operational records: SUM, SUMIF, SUMIFS, COUNT, COUNTIF, COUNTIFS, AVERAGE, AVERAGEIF, IF, IFERROR, XLOOKUP, VLOOKUP, INDEX, MATCH, ROUND, CONCAT.
              </p>
            </div>

            {/* Formula Bar */}
            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
              <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-1 bg-emerald-950/40 rounded border border-emerald-800/60">
                fx
              </span>
              <input
                type="text"
                value={formulaInput}
                onChange={(e) => setFormulaInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEvaluateFormula()}
                placeholder="Type Excel formula, e.g. =SUMIF(status, &quot;Active&quot;, backlog)"
                className="flex-1 bg-transparent text-xs font-mono text-slate-100 focus:outline-none px-2"
              />
              <button
                onClick={() => handleEvaluateFormula()}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium cursor-pointer"
              >
                <Play className="w-3 h-3" />
                <span>Evaluate</span>
              </button>
            </div>

            {/* Live Result Display */}
            {formulaOutput && (
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-mono">Evaluated Result:</span>
                  <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                    {typeof formulaOutput.result === 'number'
                      ? formulaOutput.result.toLocaleString()
                      : String(formulaOutput.result)}
                  </div>
                </div>
                {formulaOutput.error && (
                  <span className="text-xs text-rose-400 font-mono">{formulaOutput.error}</span>
                )}
              </div>
            )}

            {/* Quick Formula Presets */}
            <div>
              <span className="text-xs text-slate-400 font-medium block mb-2">
                Click to Test Practical Excel Interview Formulas:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {FORMULA_EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => {
                      setFormulaInput(ex.formula);
                      handleEvaluateFormula(ex.formula);
                    }}
                    className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors cursor-pointer group"
                  >
                    <div className="text-[11px] font-medium text-slate-300 group-hover:text-blue-400">
                      {ex.label}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
                      {ex.formula}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pivot Table Builder */}
      {activeTab === 'pivot' && (
        <div className="space-y-5">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold text-white">Multidimensional Pivot Table Builder</h2>
            <p className="text-xs text-slate-400">
              Select grouping dimensions, columns, and metric aggregations (SUM, AVERAGE, COUNT, MIN, MAX).
            </p>

            {/* Pivot Configuration Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Rows Dimension</label>
                <select
                  value={pivotConfig.rowField}
                  onChange={(e) => setPivotConfig({ ...pivotConfig, rowField: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded px-2.5 py-1.5"
                >
                  <option value="department">Practice (Department)</option>
                  <option value="status">Delivery Status</option>
                  <option value="client">Client Enterprise</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Columns Dimension</label>
                <select
                  value={pivotConfig.colField || ''}
                  onChange={(e) => setPivotConfig({ ...pivotConfig, colField: e.target.value || undefined })}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded px-2.5 py-1.5"
                >
                  <option value="">(None - Single Dimension)</option>
                  <option value="status">Status</option>
                  <option value="department">Department</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Value Field</label>
                <select
                  value={pivotConfig.valField}
                  onChange={(e) => setPivotConfig({ ...pivotConfig, valField: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded px-2.5 py-1.5"
                >
                  <option value="contractValue">Contract Value ($)</option>
                  <option value="revenueRecognized">Revenue Recognized ($)</option>
                  <option value="backlog">Remaining Backlog ($)</option>
                  <option value="progress">Progress %</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Aggregation Function</label>
                <select
                  value={pivotConfig.aggregation}
                  onChange={(e) => setPivotConfig({ ...pivotConfig, aggregation: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded px-2.5 py-1.5"
                >
                  <option value="SUM">SUM</option>
                  <option value="AVERAGE">AVERAGE</option>
                  <option value="COUNT">COUNT</option>
                  <option value="MAX">MAX</option>
                  <option value="MIN">MIN</option>
                </select>
              </div>
            </div>

            {/* Pivot Table Grid */}
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="px-3.5 py-2.5 font-sans font-semibold text-slate-200">
                      {pivotConfig.rowField.toUpperCase()}
                    </th>
                    {pivotResult.colKeys.map((ck) => (
                      <th key={ck} className="px-3.5 py-2.5 text-right font-sans">
                        {ck}
                      </th>
                    ))}
                    <th className="px-3.5 py-2.5 text-right font-sans font-bold text-white bg-slate-900/50">
                      Grand Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pivotResult.rowKeys.map((rk) => (
                    <tr key={rk} className="hover:bg-slate-800/40">
                      <td className="px-3.5 py-2.5 font-sans font-medium text-slate-300">{rk}</td>
                      {pivotResult.colKeys.map((ck) => (
                        <td key={ck} className="px-3.5 py-2.5 text-right tabular-nums text-slate-300">
                          {pivotResult.matrix[rk]?.[ck] !== undefined
                            ? Math.round(pivotResult.matrix[rk][ck]).toLocaleString()
                            : '-'}
                        </td>
                      ))}
                      <td className="px-3.5 py-2.5 text-right tabular-nums font-bold text-emerald-400 bg-slate-900/50">
                        {Math.round(pivotResult.rowTotals[rk] || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {/* Column Totals Row */}
                  <tr className="bg-slate-950/80 font-bold border-t-2 border-slate-800">
                    <td className="px-3.5 py-2.5 font-sans text-white">Grand Total</td>
                    {pivotResult.colKeys.map((ck) => (
                      <td key={ck} className="px-3.5 py-2.5 text-right tabular-nums text-blue-400">
                        {Math.round(pivotResult.colTotals[ck] || 0).toLocaleString()}
                      </td>
                    ))}
                    <td className="px-3.5 py-2.5 text-right tabular-nums text-emerald-400 bg-slate-900">
                      {Math.round(pivotResult.grandTotal).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Power Query Studio */}
      {activeTab === 'powerquery' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Step History Pipeline (4 Cols) */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Applied Steps (M-Code Flow)</h2>
              <span className="text-[11px] font-mono text-slate-500">{pqSteps.length} steps</span>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                <span className="text-blue-400 font-semibold block">Source</span>
                <span className="text-slate-400 text-[11px]">Loaded {rawPqData.length} records</span>
              </div>

              {pqSteps.map((step, idx) => (
                <div
                  key={step.id}
                  className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs flex items-center justify-between group hover:border-slate-700"
                >
                  <div>
                    <span className="text-emerald-400 font-semibold block">{step.name}</span>
                    <span className="text-slate-400 text-[11px]">{step.description}</span>
                  </div>
                  <button
                    onClick={() => handleRemovePqStep(step.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Delete Transformation Step"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Transformation Actions */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-medium block">Add Transformation:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() =>
                    handleAddPqStep('remove_duplicates', { column: 'Client' }, 'Remove duplicate clients')
                  }
                  className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-left cursor-pointer"
                >
                  + Remove Duplicates
                </button>
                <button
                  onClick={() =>
                    handleAddPqStep(
                      'filter_rows',
                      { column: 'ContractValue', operator: 'greater_than', value: 200000 },
                      'Keep ContractValue > $200k'
                    )
                  }
                  className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-left cursor-pointer"
                >
                  + Filter Value &gt; 200k
                </button>
                <button
                  onClick={() =>
                    handleAddPqStep(
                      'rename_column',
                      { oldName: 'ContractValue', newName: 'TotalFee_USD' },
                      'Rename ContractValue to TotalFee_USD'
                    )
                  }
                  className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-left cursor-pointer"
                >
                  + Rename Column
                </button>
                <button
                  onClick={() =>
                    handleAddPqStep(
                      'remove_nulls',
                      { column: 'Department' },
                      'Remove null or empty departments'
                    )
                  }
                  className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-left cursor-pointer"
                >
                  + Remove Nulls
                </button>
              </div>
            </div>
          </div>

          {/* Right: Transformed Data Preview (8 Cols) */}
          <div className="lg:col-span-8 p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Transformed Dataset Preview</h2>
                <p className="text-xs text-slate-400">
                  Result after executing {pqSteps.length} Power Query operations ({transformedPqData.length} rows)
                </p>
              </div>
              <button
                onClick={() => exportToCSV(transformedPqData, 'PowerQuery_Transformed_Output')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Transformed</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800 max-h-96">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 sticky top-0">
                  <tr>
                    {transformedPqData[0] &&
                      Object.keys(transformedPqData[0]).map((h) => (
                        <th key={h} className="px-3 py-2 font-sans">
                          {h}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {transformedPqData.slice(0, 15).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      {Object.values(row).map((val: any, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-slate-300">
                          {typeof val === 'number' ? val.toLocaleString() : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Spreadsheet Ingestion & Validation */}
      {activeTab === 'import' && (
        <div className="space-y-5">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white">Spreadsheet Upload & Type Ingestion</h2>
                <p className="text-xs text-slate-400">
                  Upload CSV or Excel (.xlsx) files to run automated schema detection, missing value scans, and duplicate checks.
                </p>
              </div>
              <button
                onClick={handleLoadSampleDataset}
                className="px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-950/40 hover:bg-blue-900/50 rounded-lg border border-blue-800/60 transition-colors cursor-pointer"
              >
                Load Sample Kroll Operations File
              </button>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-8 text-center bg-slate-950/50 transition-colors">
              <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-200">
                Drag and drop your spreadsheet here, or browse files
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Supports .csv, .xlsx, .xls</p>
              <label className="mt-3 inline-block px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors">
                <span>Select File</span>
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Inspection Summary */}
            {inspectionResult && (
              <div className="space-y-4 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Inspection Audit: {importFileName}
                  </h3>
                  <span className="text-xs text-emerald-400 font-mono">
                    {inspectionResult.totalRows} Rows · {inspectionResult.totalColumns} Columns
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500">Duplicate Rows</span>
                    <p
                      className={`font-mono font-bold mt-1 ${
                        inspectionResult.duplicateRowsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {inspectionResult.duplicateRowsCount}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500">Missing Values</span>
                    <p
                      className={`font-mono font-bold mt-1 ${
                        inspectionResult.missingValuesTotal > 0 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {inspectionResult.missingValuesTotal}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500">Invalid Dates</span>
                    <p className="font-mono font-bold text-slate-200 mt-1">
                      {inspectionResult.invalidDatesCount}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-500">Detected Schema Status</span>
                    <p className="font-mono font-bold text-emerald-400 mt-1">Validated</p>
                  </div>
                </div>

                {/* Detected Column Types Table */}
                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="px-3 py-2">Column Name</th>
                        <th className="px-3 py-2">Inferred Type</th>
                        <th className="px-3 py-2 text-right">Unique Values</th>
                        <th className="px-3 py-2 text-right">Missing Count</th>
                        <th className="px-3 py-2">Sample Values</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {inspectionResult.columns.map((col) => (
                        <tr key={col.name} className="hover:bg-slate-800/40">
                          <td className="px-3 py-2 text-blue-400 font-semibold">{col.name}</td>
                          <td className="px-3 py-2 text-slate-300 font-sans">{col.type}</td>
                          <td className="px-3 py-2 text-right text-slate-300">{col.uniqueCount}</td>
                          <td className="px-3 py-2 text-right text-slate-400">{col.missingCount}</td>
                          <td className="px-3 py-2 text-slate-500 text-[11px] truncate max-w-xs">
                            {col.sampleValues.slice(0, 3).join(', ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Conditional Formatting Ledger */}
      {activeTab === 'reports' && (
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Conditional Formatting & Reconciliation Ledger
              </h2>
              <p className="text-xs text-slate-400">
                Visual threshold scales: Green &ge; 75% progress, Amber 30-74%, Red &lt; 30% or At Risk
              </p>
            </div>
            <button
              onClick={() => exportToCSV(projects, 'Conditional_Formatting_Report')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-sans font-medium">
                <tr>
                  <th className="px-3.5 py-2.5">Project ID</th>
                  <th className="px-3.5 py-2.5">Engagement</th>
                  <th className="px-3.5 py-2.5">Practice</th>
                  <th className="px-3.5 py-2.5 text-right">Contract Value</th>
                  <th className="px-3.5 py-2.5 text-right">Recognized</th>
                  <th className="px-3.5 py-2.5 text-center">Progress Bar</th>
                  <th className="px-3.5 py-2.5">Conditional Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {projects.slice(0, 12).map((p) => {
                  const isHighProgress = p.progressPercentage >= 75;
                  const isLowProgress = p.progressPercentage < 35;
                  const isAtRisk = p.status === 'At Risk';

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="px-3.5 py-2.5 text-blue-400 font-semibold">{p.id}</td>
                      <td className="px-3.5 py-2.5 font-sans font-medium text-slate-200">{p.name}</td>
                      <td className="px-3.5 py-2.5 font-sans text-slate-400 text-[11px]">{p.department}</td>
                      <td className="px-3.5 py-2.5 text-right tabular-nums text-slate-300">
                        ${p.contractValue.toLocaleString()}
                      </td>
                      <td className="px-3.5 py-2.5 text-right tabular-nums text-emerald-400">
                        ${p.revenueRecognized.toLocaleString()}
                      </td>
                      <td className="px-3.5 py-2.5 font-sans">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                isAtRisk
                                  ? 'bg-rose-500'
                                  : isHighProgress
                                  ? 'bg-emerald-500'
                                  : isLowProgress
                                  ? 'bg-amber-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${p.progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {p.progressPercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 font-sans">
                        <span
                          className={`text-[11px] font-semibold ${
                            isAtRisk
                              ? 'text-rose-400'
                              : isHighProgress
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
