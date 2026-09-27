import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Filter,
  Search,
  BookOpen,
  Edit2,
  FileDown,
  RotateCcw,
} from 'lucide-react';
import { DataQualityIssue, DataIssueStatus } from '../../types';
import { DATA_DICTIONARY } from '../../services/dataQualityEngine';
import { exportToCSV } from '../../services/excelEngine';

export const DataQualityView: React.FC = () => {
  const {
    dataQualityIssues,
    kpiSummary,
    runDataQualityScan,
    updateDataQualityIssue,
    showNotification,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'issues' | 'dictionary'>('issues');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Resolving modal
  const [resolvingIssue, setResolvingIssue] = useState<DataQualityIssue | null>(null);
  const [newStatus, setNewStatus] = useState<DataIssueStatus>('Resolved');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  const filteredIssues = dataQualityIssues.filter((iss) => {
    if (statusFilter !== 'All' && iss.status !== statusFilter) return false;
    if (severityFilter !== 'All' && iss.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        iss.id.toLowerCase().includes(q) ||
        iss.dataset.toLowerCase().includes(q) ||
        iss.recordId.toLowerCase().includes(q) ||
        iss.errorType.toLowerCase().includes(q) ||
        iss.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openCount = dataQualityIssues.filter((i) => i.status === 'Open').length;
  const underReviewCount = dataQualityIssues.filter((i) => i.status === 'Under Review').length;
  const resolvedCount = dataQualityIssues.filter((i) => i.status === 'Resolved').length;

  const handleOpenResolveModal = (iss: DataQualityIssue) => {
    setResolvingIssue(iss);
    setNewStatus(iss.status);
    setResolutionNotes(iss.resolutionNotes || '');
  };

  const handleSaveResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingIssue) return;
    updateDataQualityIssue(resolvingIssue.id, newStatus, resolutionNotes);
    setResolvingIssue(null);
  };

  const handleExportIssues = () => {
    exportToCSV(filteredIssues, `Data_Quality_Exceptions_Audit_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Data Quality & Governance Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated validation checks, relational integrity auditing, exception resolution lifecycle, and data dictionary.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => runDataQualityScan()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 rounded-lg border border-emerald-800/60 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Automated Audit Scan</span>
          </button>

          <button
            onClick={handleExportIssues}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Exceptions (CSV)</span>
          </button>
        </div>
      </div>

      {/* Governance Score & Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Data Quality Score</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                kpiSummary.dataQualityScore >= 90 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {kpiSummary.dataQualityScore.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 100% Target</span>
          </div>
          <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                kpiSummary.dataQualityScore >= 90 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${kpiSummary.dataQualityScore}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Total Audited Records</span>
          <div className="mt-1 text-2xl font-bold font-mono text-white">
            {kpiSummary.totalRecordsAudited.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">
            Across 5 relational datasets
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Open Exceptions</span>
          <div className="mt-1 text-2xl font-bold font-mono text-rose-400">
            {openCount} Issues
          </div>
          <div className="mt-1 text-[11px] text-rose-400/80 font-mono">
            Requires data owner remediation
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-xs text-slate-400">Resolved & Validated</span>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-400">
            {resolvedCount} Issues
          </div>
          <div className="mt-1 text-[11px] text-emerald-400/80 font-mono">
            Reconciled & audited
          </div>
        </div>
      </div>

      {/* Subtab Segmented Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('issues')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'issues'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Active Quality Exceptions ({filteredIssues.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dictionary')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'dictionary'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Data Dictionary & Governance Rules</span>
        </button>
      </div>

      {/* Tab 1: Active Quality Issues Table */}
      {activeTab === 'issues' && (
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search exceptions by ID, dataset, error..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Under Review">Under Review</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
              >
                <option value="All">All Severities</option>
                <option value="High">High Severity</option>
                <option value="Medium">Medium Severity</option>
                <option value="Low">Low Severity</option>
              </select>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              {filteredIssues.length} Quality Exceptions Found
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-sans font-medium">
                <tr>
                  <th className="px-3.5 py-2.5">Issue ID</th>
                  <th className="px-3.5 py-2.5">Dataset</th>
                  <th className="px-3.5 py-2.5">Record ID</th>
                  <th className="px-3.5 py-2.5">Column</th>
                  <th className="px-3.5 py-2.5">Error Type</th>
                  <th className="px-3.5 py-2.5">Severity</th>
                  <th className="px-3.5 py-2.5">Description</th>
                  <th className="px-3.5 py-2.5">Status</th>
                  <th className="px-3.5 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredIssues.map((iss) => (
                  <tr key={iss.id} className="hover:bg-slate-800/40">
                    <td className="px-3.5 py-2.5 text-blue-400 font-bold">{iss.id}</td>
                    <td className="px-3.5 py-2.5 font-sans text-slate-300">{iss.dataset}</td>
                    <td className="px-3.5 py-2.5 text-amber-400">{iss.recordId}</td>
                    <td className="px-3.5 py-2.5 text-slate-400">{iss.column}</td>
                    <td className="px-3.5 py-2.5 font-sans font-semibold text-slate-200">
                      {iss.errorType}
                    </td>
                    <td className="px-3.5 py-2.5 font-sans">
                      <span
                        className={`text-[10px] font-bold ${
                          iss.severity === 'High'
                            ? 'text-rose-400'
                            : iss.severity === 'Medium'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {iss.severity}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 font-sans text-slate-300 max-w-xs truncate">
                      {iss.description}
                    </td>
                    <td className="px-3.5 py-2.5 font-sans">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                          iss.status === 'Resolved'
                            ? 'text-emerald-400 bg-emerald-950/40'
                            : iss.status === 'Open'
                            ? 'text-rose-400 bg-rose-950/40'
                            : 'text-amber-400 bg-amber-950/40'
                        }`}
                      >
                        {iss.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-center font-sans">
                      <button
                        onClick={() => handleOpenResolveModal(iss)}
                        className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Data Dictionary */}
      {activeTab === 'dictionary' && (
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Enterprise Operations Data Dictionary</h2>
            <p className="text-xs text-slate-400">
              Field definitions, data types, business constraints, and automated validation rules enforcing audit readiness.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-sans font-medium">
                <tr>
                  <th className="px-3.5 py-2.5">Dataset</th>
                  <th className="px-3.5 py-2.5">Field Name</th>
                  <th className="px-3.5 py-2.5">Data Type</th>
                  <th className="px-3.5 py-2.5">Mandatory</th>
                  <th className="px-3.5 py-2.5">Business Logic Definition</th>
                  <th className="px-3.5 py-2.5">Automated Validation Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {DATA_DICTIONARY.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="px-3.5 py-2.5 font-sans font-semibold text-slate-200">
                      {entry.dataset}
                    </td>
                    <td className="px-3.5 py-2.5 text-blue-400 font-bold">{entry.field}</td>
                    <td className="px-3.5 py-2.5 font-sans text-slate-400 text-[11px]">{entry.type}</td>
                    <td className="px-3.5 py-2.5 font-sans">
                      <span className="text-emerald-400">Required</span>
                    </td>
                    <td className="px-3.5 py-2.5 font-sans text-slate-300 max-w-xs">
                      {entry.businessRule}
                    </td>
                    <td className="px-3.5 py-2.5 font-sans text-slate-400 text-[11px] max-w-xs">
                      {entry.validationCheck}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Issue Resolution Modal */}
      {resolvingIssue && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-blue-400 font-mono">{resolvingIssue.id}</span>
                <h3 className="text-sm font-semibold text-white mt-0.5">
                  Review & Resolve Data Quality Exception
                </h3>
              </div>
              <button
                onClick={() => setResolvingIssue(null)}
                className="text-slate-500 hover:text-slate-300 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Dataset:</span>
                <span className="font-semibold text-slate-200">{resolvingIssue.dataset}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Record ID:</span>
                <span className="font-mono text-amber-400">{resolvingIssue.recordId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Error Type:</span>
                <span className="text-slate-200">{resolvingIssue.errorType}</span>
              </div>
              <div className="text-slate-300 pt-1 border-t border-slate-800/80 leading-relaxed">
                {resolvingIssue.description}
              </div>
            </div>

            <form onSubmit={handleSaveResolution} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as DataIssueStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                >
                  <option value="Open">Open</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Resolution Audit Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Document reconciliation or fix justification for the audit trail..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResolvingIssue(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 cursor-pointer"
                >
                  Save & Recalculate Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
