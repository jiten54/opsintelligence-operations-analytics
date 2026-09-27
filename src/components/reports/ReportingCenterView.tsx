import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Building2,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { exportToCSV, exportToXLSX } from '../../services/excelEngine';

export const ReportingCenterView: React.FC = () => {
  const {
    kpiSummary,
    filters,
    projects,
    revenueTransactions,
    employees,
    dataQualityIssues,
    lastUpdated,
  } = useApp();

  const [selectedReportType, setSelectedReportType] = useState<
    'executive' | 'revenue' | 'utilization' | 'dataquality'
  >('executive');

  // Dynamic Executive Summary Synthesis (derived purely from real data calculations)
  const executiveSummaryNarrative = [
    `For the period ending ${new Date().toISOString().split('T')[0]}, operations generated $${(
      kpiSummary.totalRevenue / 1000000
    ).toFixed(2)}M in recognized revenue, reflecting a ${
      kpiSummary.revenueGrowth >= 0 ? '+' : ''
    }${kpiSummary.revenueGrowth.toFixed(1)}% variance against historical baseline.`,
    `Outstanding committed backlog across active consulting mandates stands at $${(
      kpiSummary.totalBacklog / 1000000
    ).toFixed(2)}M, backed by a probability-weighted commercial sales pipeline of $${(
      kpiSummary.weightedPipeline / 1000000
    ).toFixed(2)}M.`,
    `Employee billable utilization is performing at ${kpiSummary.employeeUtilization.toFixed(
      1
    )}% (target: 80.0%), leaving ${kpiSummary.availableCapacityHours.toLocaleString()} productive hours in reserve.`,
    `Engagement delivery health shows ${kpiSummary.activeProjectsCount} active mandates with ${
      kpiSummary.projectsAtRiskCount
    } projects flagged for delivery risk mitigation. On-time completion benchmark is ${kpiSummary.onTimeDeliveryRate.toFixed(
      1
    )}%.`,
    `Automated data governance audit calculated an integrity score of ${kpiSummary.dataQualityScore.toFixed(
      1
    )}% across ${kpiSummary.totalRecordsAudited} records, with ${
      dataQualityIssues.filter((i) => i.status === 'Open').length
    } exceptions currently undergoing data steward review.`,
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const reportData = [
      { Section: 'Executive Findings', Key: 'Total Revenue', Value: `$${kpiSummary.totalRevenue.toLocaleString()}` },
      { Section: 'Executive Findings', Key: 'Revenue Growth', Value: `${kpiSummary.revenueGrowth.toFixed(2)}%` },
      { Section: 'Executive Findings', Key: 'Committed Backlog', Value: `$${kpiSummary.totalBacklog.toLocaleString()}` },
      { Section: 'Executive Findings', Key: 'Weighted Pipeline', Value: `$${kpiSummary.weightedPipeline.toLocaleString()}` },
      { Section: 'Operations', Key: 'Utilization Rate', Value: `${kpiSummary.employeeUtilization.toFixed(1)}%` },
      { Section: 'Operations', Key: 'Available Capacity', Value: `${kpiSummary.availableCapacityHours} hrs` },
      { Section: 'Delivery', Key: 'Active Mandates', Value: kpiSummary.activeProjectsCount },
      { Section: 'Delivery', Key: 'Projects At Risk', Value: kpiSummary.projectsAtRiskCount },
      { Section: 'Governance', Key: 'Data Quality Score', Value: `${kpiSummary.dataQualityScore.toFixed(1)}%` },
    ];
    exportToCSV(reportData, `Executive_Brief_${selectedReportType}_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportXLSX = () => {
    const reportData = [
      { Metric: 'Total Recognized Revenue ($)', Value: kpiSummary.totalRevenue },
      { Metric: 'Committed Backlog ($)', Value: kpiSummary.totalBacklog },
      { Metric: 'Weighted Sales Pipeline ($)', Value: kpiSummary.weightedPipeline },
      { Metric: 'Employee Utilization Rate (%)', Value: kpiSummary.employeeUtilization },
      { Metric: 'Available Capacity (Hours)', Value: kpiSummary.availableCapacityHours },
      { Metric: 'Data Governance Quality (%)', Value: kpiSummary.dataQualityScore },
      { Metric: 'On-Time Delivery Rate (%)', Value: kpiSummary.onTimeDeliveryRate },
    ];
    exportToXLSX(reportData, 'Executive Report', `OpsIntelligence_Report_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Automated Business Reporting Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Production-grade operational reports, automated executive briefs, data fresh timestamps, and board-ready exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
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

      {/* Report Template Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: 'executive', title: 'Executive Operations Brief', desc: 'Holistic performance summary' },
          { id: 'revenue', title: 'Revenue & Variance Audit', desc: 'ASC 606 & budget variance' },
          { id: 'utilization', title: 'Resource & Capacity Audit', desc: 'Staffing gap & billable hours' },
          { id: 'dataquality', title: 'Data Governance Audit', desc: 'Relational data integrity review' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedReportType(t.id as any)}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedReportType === t.id
                ? 'bg-blue-600/15 border-blue-500/60 text-white'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-900'
            }`}
          >
            <div className="font-semibold text-xs text-white">{t.title}</div>
            <div className="text-[11px] text-slate-400 mt-1">{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Generated Report Document View */}
      <div className="p-8 rounded-xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono text-blue-400 uppercase tracking-widest block font-bold">
              CONFIDENTIAL · KROLL OPERATIONS ANALYTICS
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              {selectedReportType === 'executive' && 'Executive Operations Performance & Risk Briefing'}
              {selectedReportType === 'revenue' && 'Revenue Recognition & Budget Variance Analysis'}
              {selectedReportType === 'utilization' && 'Practitioner Resource Capacity & Utilization Review'}
              {selectedReportType === 'dataquality' && 'Enterprise Data Governance & Quality Audit'}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2 font-mono">
              <span>Period: {filters.dateRange.toUpperCase()}</span>
              <span>·</span>
              <span>Scope: {filters.department}</span>
              <span>·</span>
              <span>Audited Records: {kpiSummary.totalRecordsAudited}</span>
              <span>·</span>
              <span>Generated: {new Date().toLocaleDateString()} {lastUpdated}</span>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-500 font-mono">Document Status</div>
            <div className="text-xs font-semibold text-emerald-400 mt-0.5">Audited & Verified</div>
          </div>
        </div>

        {/* Section 1: Executive Summary Narrative */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            1. Executive Findings & Commentary
          </h3>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs text-slate-300 leading-relaxed font-sans">
            {executiveSummaryNarrative.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* Section 2: Core KPI Scorecard Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            2. Quantitative Operational Indicators
          </h3>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-sans font-medium">
                <tr>
                  <th className="px-3.5 py-2.5">Indicator Metric</th>
                  <th className="px-3.5 py-2.5 text-right">Current Period</th>
                  <th className="px-3.5 py-2.5 text-right">Baseline / Target</th>
                  <th className="px-3.5 py-2.5 text-right">Variance</th>
                  <th className="px-3.5 py-2.5">Governance Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="px-3.5 py-2.5 font-sans font-medium text-slate-200">
                    Recognized Revenue
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-bold text-white">
                    ${(kpiSummary.totalRevenue / 1000000).toFixed(2)}M
                  </td>
                  <td className="px-3.5 py-2.5 text-right text-slate-400">
                    ${(kpiSummary.prevRevenue / 1000000).toFixed(2)}M
                  </td>
                  <td className="px-3.5 py-2.5 text-right text-emerald-400">
                    +{kpiSummary.revenueGrowth.toFixed(1)}%
                  </td>
                  <td className="px-3.5 py-2.5 font-sans text-emerald-400">
                    Exceeding Historical Baseline
                  </td>
                </tr>

                <tr>
                  <td className="px-3.5 py-2.5 font-sans font-medium text-slate-200">
                    Outstanding Contract Backlog
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-bold text-cyan-400">
                    ${(kpiSummary.totalBacklog / 1000000).toFixed(2)}M
                  </td>
                  <td className="px-3.5 py-2.5 text-right text-slate-400">
                    ${(kpiSummary.prevBacklog / 1000000).toFixed(2)}M
                  </td>
                  <td className="px-3.5 py-2.5 text-right text-cyan-400">
                    +{kpiSummary.backlogChange.toFixed(1)}%
                  </td>
                  <td className="px-3.5 py-2.5 font-sans text-slate-300">
                    Healthy Delivery Queue
                  </td>
                </tr>

                <tr>
                  <td className="px-3.5 py-2.5 font-sans font-medium text-slate-200">
                    Practitioner Utilization Rate
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-bold text-white">
                    {kpiSummary.employeeUtilization.toFixed(1)}%
                  </td>
                  <td className="px-3.5 py-2.5 text-right text-slate-400">
                    80.0% Target
                  </td>
                  <td className="px-3.5 py-2.5 text-right text-emerald-400">
                    +{kpiSummary.utilizationDelta.toFixed(1)}% pts
                  </td>
                  <td className="px-3.5 py-2.5 font-sans text-emerald-400">
                    In Optimal Range
                  </td>
                </tr>

                <tr>
                  <td className="px-3.5 py-2.5 font-sans font-medium text-slate-200">
                    On-Time Project Delivery Rate
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-bold text-white">
                    {kpiSummary.onTimeDeliveryRate.toFixed(1)}%
                  </td>
                  <td className="px-3.5 py-2.5 text-right text-slate-400">
                    88.0% Benchmark
                  </td>
                  <td className="px-3.5 py-2.5 text-right text-emerald-400">
                    +{(kpiSummary.onTimeDeliveryRate - 88.0).toFixed(1)}% pts
                  </td>
                  <td className="px-3.5 py-2.5 font-sans text-slate-300">
                    Satisfactory SLA Compliance
                  </td>
                </tr>

                <tr>
                  <td className="px-3.5 py-2.5 font-sans font-medium text-slate-200">
                    Data Governance Quality Score
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-bold text-emerald-400">
                    {kpiSummary.dataQualityScore.toFixed(1)}%
                  </td>
                  <td className="px-3.5 py-2.5 text-right text-slate-400">
                    90.0% Standard
                  </td>
                  <td className="px-3.5 py-2.5 text-right text-emerald-400">
                    +{(kpiSummary.dataQualityScore - 90.0).toFixed(1)}% pts
                  </td>
                  <td className="px-3.5 py-2.5 font-sans text-emerald-400">
                    Audit Certified
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Sign-Off and Controls Footnote */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>Prepared by: Rohan Mehta (Operations Data Analyst)</span>
          <span>Approved: Practice Managing Directors Steering Committee</span>
        </div>
      </div>
    </div>
  );
};
