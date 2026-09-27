import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Layers,
  TrendingUp,
  Users2,
  Briefcase,
  Code2,
  Copy,
  Check,
  Filter,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { getDAXMeasuresCatalog, DAXMeasure } from '../../services/kpiEngine';

export const PowerBIStudioView: React.FC = () => {
  const {
    kpiSummary,
    departments,
    projects,
    revenueTransactions,
    opportunities,
    employees,
    showNotification,
  } = useApp();

  // Cross-filtering active state
  const [crossFilterDept, setCrossFilterDept] = useState<string>('All');
  const [crossFilterStatus, setCrossFilterStatus] = useState<string>('All');
  const [selectedDAX, setSelectedDAX] = useState<DAXMeasure | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // DAX measures list
  const daxCatalog = getDAXMeasuresCatalog(kpiSummary);

  // Cross-filtered records
  const biProjects = projects.filter((p) => {
    if (crossFilterDept !== 'All' && p.department !== crossFilterDept) return false;
    if (crossFilterStatus !== 'All' && p.status !== crossFilterStatus) return false;
    return true;
  });

  const biTransactions = revenueTransactions.filter((t) => {
    if (crossFilterDept !== 'All' && t.department !== crossFilterDept) return false;
    return true;
  });

  const biRevenue = biTransactions
    .filter((t) => t.status === 'Completed')
    .reduce((s, t) => s + t.amount, 0);

  const biBacklog = biProjects
    .filter((p) => p.status !== 'Completed' && p.status !== 'Cancelled')
    .reduce((s, p) => s + p.remainingBacklog, 0);

  const biActiveCount = biProjects.filter((p) => p.status === 'Active').length;
  const biAtRiskCount = biProjects.filter((p) => p.status === 'At Risk').length;

  const handleCopyDAX = (measure: DAXMeasure) => {
    navigator.clipboard.writeText(measure.daxExpression);
    setCopiedId(measure.id);
    showNotification(`Copied DAX measure: ${measure.name}`, 'info');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const resetCrossFilters = () => {
    setCrossFilterDept('All');
    setCrossFilterStatus('All');
    showNotification('Cleared Power BI cross-filters.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span>Power BI-Style Business Intelligence Studio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive multi-directional cross-filtering canvas and DAX measure modeling library for operations analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(crossFilterDept !== 'All' || crossFilterStatus !== 'All') && (
            <button
              onClick={resetCrossFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-950/40 hover:bg-amber-900/50 rounded-lg border border-amber-800/60 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Cross-Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Cross-Filtering Interactive Filter Strip */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-white">Cross-Filtering Matrix:</span>
          <span className="text-slate-400">Clicking any pill synchronizes all metrics and visual cards.</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg">
            <button
              onClick={() => setCrossFilterDept('All')}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                crossFilterDept === 'All' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Practices
            </button>
            {departments.map((d) => (
              <button
                key={d.id}
                onClick={() => setCrossFilterDept(d.name)}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  crossFilterDept === d.name
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d.code}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg">
            {['All', 'Active', 'At Risk', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setCrossFilterStatus(st)}
                className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                  crossFilterStatus === st
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Synchronized Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400">Filtered Revenue [Total Revenue]</span>
          <div className="mt-1 text-2xl font-bold font-mono text-white">
            ${(biRevenue / 1000000).toFixed(2)}M
          </div>
          <div className="mt-1 text-[10px] text-slate-500 font-mono">
            {biTransactions.length} Filtered Transactions
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400">Committed Backlog [Total Backlog]</span>
          <div className="mt-1 text-2xl font-bold font-mono text-cyan-400">
            ${(biBacklog / 1000000).toFixed(2)}M
          </div>
          <div className="mt-1 text-[10px] text-slate-500 font-mono">
            Remaining unearned fees
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400">In-Scope Active Projects</span>
          <div className="mt-1 text-2xl font-bold font-mono text-blue-400">
            {biActiveCount} Mandates
          </div>
          <div className="mt-1 text-[10px] text-slate-500 font-mono">
            {biProjects.length} Total Filtered
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400">Projects At Risk</span>
          <div className="mt-1 text-2xl font-bold font-mono text-rose-400">
            {biAtRiskCount} Flags
          </div>
          <div className="mt-1 text-[10px] text-rose-400/80 font-mono">
            Requires Steerco Review
          </div>
        </div>
      </div>

      {/* DAX Measures Modeling Library */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>DAX Measures Catalog & Live Evaluator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Production Power BI DAX calculations powering operational KPIs, calculated fields, and business definitions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {daxCatalog.map((measure) => (
            <div
              key={measure.id}
              onClick={() => setSelectedDAX(measure)}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">[{measure.name}]</span>
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/40">
                    {measure.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  {measure.plainDescription}
                </p>
              </div>

              <div>
                <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-[10px] text-slate-300 whitespace-pre-wrap overflow-x-auto border border-slate-800/80">
                  {measure.daxExpression}
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-mono">Output:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {measure.evaluatedValue}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyDAX(measure);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                    title="Copy DAX Expression"
                  >
                    {copiedId === measure.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Synchronized Projects Sub-Table */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">
            Cross-Filtered Engagements ({biProjects.length} Records)
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Practice: {crossFilterDept} · Status: {crossFilterStatus}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="px-3.5 py-2.5 font-sans">Project ID</th>
                <th className="px-3.5 py-2.5 font-sans">Engagement Name</th>
                <th className="px-3.5 py-2.5 font-sans">Client</th>
                <th className="px-3.5 py-2.5 font-sans">Department</th>
                <th className="px-3.5 py-2.5 text-right font-sans">Contract Value</th>
                <th className="px-3.5 py-2.5 text-right font-sans">Recognized</th>
                <th className="px-3.5 py-2.5 text-right font-sans">Backlog</th>
                <th className="px-3.5 py-2.5 font-sans">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {biProjects.slice(0, 8).map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40">
                  <td className="px-3.5 py-2.5 text-blue-400">{p.id}</td>
                  <td className="px-3.5 py-2.5 font-sans text-slate-200 font-medium truncate max-w-[200px]">
                    {p.name}
                  </td>
                  <td className="px-3.5 py-2.5 font-sans text-slate-300">{p.client}</td>
                  <td className="px-3.5 py-2.5 font-sans text-slate-400 text-[11px] truncate max-w-[120px]">
                    {p.department}
                  </td>
                  <td className="px-3.5 py-2.5 text-right tabular-nums text-slate-300">
                    ${p.contractValue.toLocaleString()}
                  </td>
                  <td className="px-3.5 py-2.5 text-right tabular-nums text-emerald-400">
                    ${p.revenueRecognized.toLocaleString()}
                  </td>
                  <td className="px-3.5 py-2.5 text-right tabular-nums text-cyan-400 font-semibold">
                    ${p.remainingBacklog.toLocaleString()}
                  </td>
                  <td className="px-3.5 py-2.5 font-sans text-slate-300">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
