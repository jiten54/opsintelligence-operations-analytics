import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  Layers,
  Briefcase,
  TrendingUp,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
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
import { exportToCSV, exportToXLSX } from '../../services/excelEngine';
import { detectRevenueAnomalies, calculateRevenueForecast } from '../../services/kpiEngine';

export const RevenuePipelineView: React.FC = () => {
  const {
    revenueTransactions,
    projects,
    opportunities,
    revenueTargets,
    kpiSummary,
    filters,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'revenue' | 'backlog' | 'pipeline' | 'forecast'>('revenue');
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filtered lists
  const filteredTxs = revenueTransactions.filter((tx) => {
    if (filters.department !== 'All' && tx.department !== filters.department) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        tx.projectName.toLowerCase().includes(q) ||
        tx.client.toLowerCase().includes(q) ||
        tx.id.toLowerCase().includes(q) ||
        tx.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredOpps = opportunities.filter((o) => {
    if (filters.department !== 'All' && o.department !== filters.department) return false;
    if (stageFilter !== 'All' && o.stage !== stageFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        o.name.toLowerCase().includes(q) ||
        o.client.toLowerCase().includes(q) ||
        o.salesOwner.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredProjects = projects.filter((p) => {
    if (filters.department !== 'All' && p.department !== filters.department) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.projectManager.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Quarterly targets vs actuals
  const quarterlyComparison = [
    { quarter: 'Q1 2025', actual: 14200000, target: 14000000 },
    { quarter: 'Q2 2025', actual: 15100000, target: 14800000 },
    { quarter: 'Q3 2025', actual: 15400000, target: 15000000 },
    { quarter: 'Q4 2025', actual: 16800000, target: 16200000 },
    { quarter: 'Q1 2026', actual: 17200000, target: 16900000 },
    { quarter: 'Q2 2026', actual: 18450000, target: 17800000 },
    { quarter: 'Q3 2026', actual: 19300000, target: 18500000 },
  ];

  // Backlog aging buckets
  const backlogAging = [
    { range: '< 30 Days', amount: 8400000, count: 28 },
    { range: '30 - 60 Days', amount: 11200000, count: 34 },
    { range: '60 - 90 Days', amount: 6900000, count: 22 },
    { range: '> 90 Days', amount: 4800000, count: 16 },
  ];

  // Anomaly detection & Forecasting
  const detectedAnomalies = detectRevenueAnomalies(filteredTxs);
  const forecastData = calculateRevenueForecast(revenueTransactions);

  // Pagination for transactions
  const totalPages = Math.ceil(filteredTxs.length / itemsPerPage);
  const paginatedTxs = filteredTxs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCSV = () => {
    if (activeSubTab === 'revenue') {
      exportToCSV(filteredTxs, `Revenue_Transactions_${new Date().toISOString().split('T')[0]}`);
    } else if (activeSubTab === 'pipeline') {
      exportToCSV(filteredOpps, `Sales_Pipeline_${new Date().toISOString().split('T')[0]}`);
    } else {
      exportToCSV(filteredProjects, `Backlog_Schedule_${new Date().toISOString().split('T')[0]}`);
    }
  };

  const handleExportXLSX = () => {
    if (activeSubTab === 'revenue') {
      exportToXLSX(filteredTxs, 'Transactions', `Revenue_Ledger_${new Date().toISOString().split('T')[0]}`);
    } else if (activeSubTab === 'pipeline') {
      exportToXLSX(filteredOpps, 'Pipeline', `Sales_Pipeline_${new Date().toISOString().split('T')[0]}`);
    } else {
      exportToXLSX(filteredProjects, 'Backlog', `Backlog_Analysis_${new Date().toISOString().split('T')[0]}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Subtab Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Revenue, Backlog & Sales Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Commercial bookings, revenue recognition ledger, contract backlog burn rate, and CRM pipeline funnel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportXLSX}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 rounded-lg transition-colors border border-emerald-800/60 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Subtab Segmented Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => { setActiveSubTab('revenue'); setCurrentPage(1); }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeSubTab === 'revenue'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Revenue Recognition ({filteredTxs.length})</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('backlog'); setCurrentPage(1); }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeSubTab === 'backlog'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Backlog Aging & Burn</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('pipeline'); setCurrentPage(1); }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeSubTab === 'pipeline'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Sales Pipeline Funnel ({filteredOpps.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('forecast')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeSubTab === 'forecast'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Forecasting & Anomaly Detection</span>
        </button>
      </div>

      {/* Tab 1: Revenue Recognition */}
      {activeSubTab === 'revenue' && (
        <div className="space-y-5">
          {/* Target vs Actual Visual */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Quarterly Performance vs Target</h2>
                <p className="text-xs text-slate-400">Quarterly actual recognized revenue against board targets ($M)</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quarterlyComparison} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="quarter" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `$${(v / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`$${(Number(val) / 1000000).toFixed(2)}M`, '']}
                  />
                  <Bar dataKey="target" name="Target Budget" fill="#475569" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Search & Ledger Table */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter transactions by project, client, ID..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="text-xs text-slate-400">
                Showing {paginatedTxs.length} of {filteredTxs.length} transactions
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-medium">
                  <tr>
                    <th className="px-3.5 py-2.5">TX ID</th>
                    <th className="px-3.5 py-2.5">Engagement Project</th>
                    <th className="px-3.5 py-2.5">Client Enterprise</th>
                    <th className="px-3.5 py-2.5">Practice</th>
                    <th className="px-3.5 py-2.5">Date</th>
                    <th className="px-3.5 py-2.5">Type</th>
                    <th className="px-3.5 py-2.5 text-right">Recognized Amount</th>
                    <th className="px-3.5 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {paginatedTxs.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-3.5 py-2.5 text-blue-400">{tx.id}</td>
                      <td className="px-3.5 py-2.5 font-sans font-medium text-slate-200 max-w-[200px] truncate">
                        {tx.projectName}
                      </td>
                      <td className="px-3.5 py-2.5 font-sans text-slate-300">{tx.client}</td>
                      <td className="px-3.5 py-2.5 font-sans text-slate-400 text-[11px] truncate max-w-[140px]">
                        {tx.department}
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-400">{tx.date}</td>
                      <td className="px-3.5 py-2.5 font-sans text-slate-300">{tx.type}</td>
                      <td className="px-3.5 py-2.5 text-right text-emerald-400 tabular-nums font-semibold">
                        ${tx.amount.toLocaleString()}
                      </td>
                      <td className="px-3.5 py-2.5 font-sans">
                        <span
                          className={`text-[11px] ${
                            tx.status === 'Completed'
                              ? 'text-emerald-400'
                              : tx.status === 'Pending'
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 font-mono">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Backlog Aging & Burn Rate */}
      {activeSubTab === 'backlog' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            {backlogAging.map((bucket) => (
              <div key={bucket.range} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs text-slate-400">{bucket.range}</span>
                <div className="mt-1 text-lg font-bold font-mono text-white">
                  ${(bucket.amount / 1000000).toFixed(2)}M
                </div>
                <div className="mt-1 text-[11px] text-slate-500 font-mono">
                  {bucket.count} Scheduled Engagements
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
            <h2 className="text-sm font-semibold text-white mb-1">Contract Backlog by Practice Line</h2>
            <p className="text-xs text-slate-400 mb-4">
              Committed client value awaiting delivery and milestone recognition
            </p>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="px-3.5 py-2.5">Project ID</th>
                    <th className="px-3.5 py-2.5">Project Name</th>
                    <th className="px-3.5 py-2.5">Client</th>
                    <th className="px-3.5 py-2.5">Practice</th>
                    <th className="px-3.5 py-2.5 text-right">Contract Value</th>
                    <th className="px-3.5 py-2.5 text-right">Recognized</th>
                    <th className="px-3.5 py-2.5 text-right">Remaining Backlog</th>
                    <th className="px-3.5 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredProjects.slice(0, 10).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-3.5 py-2.5 text-blue-400">{p.id}</td>
                      <td className="px-3.5 py-2.5 font-sans font-medium text-slate-200">{p.name}</td>
                      <td className="px-3.5 py-2.5 font-sans text-slate-300">{p.client}</td>
                      <td className="px-3.5 py-2.5 font-sans text-slate-400 text-[11px] truncate max-w-[140px]">
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
                      <td className="px-3.5 py-2.5 font-sans text-[11px] text-slate-300">
                        {p.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sales Pipeline Funnel */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Stage Filter:</span>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
              >
                <option value="All">All Stages</option>
                <option value="Committed">Committed (90%)</option>
                <option value="Negotiation">Negotiation (75%)</option>
                <option value="Proposal">Proposal (50%)</option>
                <option value="Discovery">Discovery (25%)</option>
                <option value="Lead">Lead (10%)</option>
              </select>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Total Weighted Value: ${(kpiSummary.weightedPipeline / 1000000).toFixed(2)}M
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="px-3.5 py-2.5">Opportunity ID</th>
                  <th className="px-3.5 py-2.5">Engagement Mandate</th>
                  <th className="px-3.5 py-2.5">Target Client</th>
                  <th className="px-3.5 py-2.5">Practice</th>
                  <th className="px-3.5 py-2.5">Stage</th>
                  <th className="px-3.5 py-2.5 text-center">Win Probability</th>
                  <th className="px-3.5 py-2.5 text-right">Gross Value</th>
                  <th className="px-3.5 py-2.5 text-right">Weighted Value</th>
                  <th className="px-3.5 py-2.5">Target Close</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredOpps.slice(0, 10).map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-3.5 py-2.5 text-blue-400">{opp.id}</td>
                    <td className="px-3.5 py-2.5 font-sans font-medium text-slate-200">{opp.name}</td>
                    <td className="px-3.5 py-2.5 font-sans text-slate-300">{opp.client}</td>
                    <td className="px-3.5 py-2.5 font-sans text-slate-400 text-[11px] truncate max-w-[130px]">
                      {opp.department}
                    </td>
                    <td className="px-3.5 py-2.5 font-sans">
                      <span className="text-slate-300 text-[11px]">{opp.stage}</span>
                    </td>
                    <td className="px-3.5 py-2.5 text-center text-slate-300">{opp.probability}%</td>
                    <td className="px-3.5 py-2.5 text-right tabular-nums text-slate-300">
                      ${opp.estimatedValue.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2.5 text-right tabular-nums text-emerald-400 font-semibold">
                      ${opp.weightedValue.toLocaleString()}
                    </td>
                    <td className="px-3.5 py-2.5 text-slate-400">{opp.expectedClosingDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Forecasting & Anomaly Detection */}
      {activeSubTab === 'forecast' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Linear Regression Revenue Forecast (Next 3 Quarters)
                </h2>
                <p className="text-xs text-slate-400">
                  Statistical trend modeling with 90% confidence bounds. (Historical actuals vs linear projection).
                </p>
              </div>
              <div className="text-xs font-mono text-blue-400">
                Growth Slope: +${(forecastData.slope / 1000).toFixed(0)}k / Quarter
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    ...forecastData.historical.map((h) => ({ period: h.period, Actual: h.revenue })),
                    ...forecastData.forecasts.map((f) => ({
                      period: f.period,
                      Forecast: f.forecast,
                      Upper: f.upper,
                      Lower: f.lower,
                    })),
                  ]}
                  margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="period" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                  />
                  <Line type="monotone" dataKey="Actual" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line
                    type="monotone"
                    dataKey="Forecast"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Upper"
                    stroke="#475569"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Lower"
                    stroke="#475569"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Statistical Anomalies Detected */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">Statistical Transaction Anomalies (Z-Score &ge; 2.0)</h2>
              <span className="text-xs text-amber-400 font-mono font-medium">
                {detectedAnomalies.length} Outliers Detected
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Transactions flagged by standard deviation z-score analysis exceeding 2.0 sigmas from the sample mean.
            </p>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="px-3.5 py-2.5">TX ID</th>
                    <th className="px-3.5 py-2.5">Project</th>
                    <th className="px-3.5 py-2.5">Client</th>
                    <th className="px-3.5 py-2.5 text-right">Amount</th>
                    <th className="px-3.5 py-2.5 text-right">Z-Score</th>
                    <th className="px-3.5 py-2.5">Flag Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {detectedAnomalies.map((anom) => (
                    <tr key={anom.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-3.5 py-2.5 text-amber-400">{anom.id}</td>
                      <td className="px-3.5 py-2.5 font-sans font-medium text-slate-200">{anom.projectName}</td>
                      <td className="px-3.5 py-2.5 font-sans text-slate-300">{anom.client}</td>
                      <td className="px-3.5 py-2.5 text-right font-bold text-amber-400">
                        ${anom.amount.toLocaleString()}
                      </td>
                      <td className="px-3.5 py-2.5 text-right text-rose-400">+{anom.zScore}&sigma;</td>
                      <td className="px-3.5 py-2.5 font-sans text-slate-400 text-[11px]">
                        Unusually large single milestone billing requiring partner sign-off
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
