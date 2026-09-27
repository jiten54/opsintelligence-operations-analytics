import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertOctagon,
  ShieldAlert,
  TrendingDown,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  Lightbulb,
  FileDown,
  ExternalLink,
} from 'lucide-react';
import { OperationalRisk, ProcessImprovement } from '../../types';
import { exportToCSV } from '../../services/excelEngine';

export const RiskExceptionView: React.FC = () => {
  const {
    operationalRisks,
    processImprovements,
    addProcessImprovement,
    departments,
    showNotification,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'risks' | 'improvements'>('risks');
  const [showImprovementModal, setShowImprovementModal] = useState(false);

  // New improvement proposal form
  const [newTitle, setNewTitle] = useState('');
  const [newIssue, setNewIssue] = useState('');
  const [newRootCause, setNewRootCause] = useState('');
  const [newProposed, setNewProposed] = useState('');
  const [newImpact, setNewImpact] = useState('');
  const [newOwner, setNewOwner] = useState('Rohan Mehta');
  const [newTargetDate, setNewTargetDate] = useState('2026-11-30');

  const handleCreateImprovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newIssue || !newProposed) return;
    addProcessImprovement({
      title: newTitle,
      identifiedIssue: newIssue,
      rootCause: newRootCause,
      proposedImprovement: newProposed,
      expectedImpact: newImpact,
      owner: newOwner,
      targetDate: newTargetDate,
      status: 'Proposed',
    });
    setShowImprovementModal(false);
    setNewTitle('');
    setNewIssue('');
    setNewRootCause('');
    setNewProposed('');
    setNewImpact('');
  };

  const handleExportRisks = () => {
    exportToCSV(operationalRisks, `Operational_Risk_Register_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <span>Operational Risk & Exception Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent rule-based operational risk assessment, capacity bottleneck tracking, and continuous process improvement tracker.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'improvements' && (
            <button
              onClick={() => setShowImprovementModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Propose Process Improvement</span>
            </button>
          )}

          <button
            onClick={handleExportRisks}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Register (CSV)</span>
          </button>
        </div>
      </div>

      {/* Subtab Segmented Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('risks')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'risks'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Operational Risk Register ({operationalRisks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('improvements')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'improvements'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Continuous Process Improvements ({processImprovements.length})</span>
        </button>
      </div>

      {/* Tab 1: Operational Risk Register */}
      {activeTab === 'risks' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400">Critical / Severe Risks</span>
              <div className="mt-1 text-2xl font-bold font-mono text-rose-400">
                {operationalRisks.filter((r) => r.severity === 'Critical' || r.severity === 'High').length}
              </div>
              <div className="mt-1 text-[11px] text-rose-400/80 font-mono">
                Immediate leadership mitigation required
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400">Under Active Mitigation</span>
              <div className="mt-1 text-2xl font-bold font-mono text-amber-400">
                {operationalRisks.filter((r) => r.status === 'Mitigating').length}
              </div>
              <div className="mt-1 text-[11px] text-amber-400/80 font-mono">
                Steerco actions in progress
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400">Average Practice Risk Score</span>
              <div className="mt-1 text-2xl font-bold font-mono text-white">
                {Math.round(
                  operationalRisks.reduce((s, r) => s + r.riskScore, 0) /
                    (operationalRisks.length || 1)
                )}
                /100
              </div>
              <div className="mt-1 text-[11px] text-emerald-400 font-mono">
                Calculated via transparent business rules
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-sans font-medium">
                  <tr>
                    <th className="px-3.5 py-2.5">Risk ID</th>
                    <th className="px-3.5 py-2.5">Category</th>
                    <th className="px-3.5 py-2.5">Impacted Entity</th>
                    <th className="px-3.5 py-2.5">Practice</th>
                    <th className="px-3.5 py-2.5">Severity</th>
                    <th className="px-3.5 py-2.5 text-center">Score</th>
                    <th className="px-3.5 py-2.5">Risk Description & Mitigation Plan</th>
                    <th className="px-3.5 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {operationalRisks.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40">
                      <td className="px-3.5 py-2.5 text-rose-400 font-bold">{r.id}</td>
                      <td className="px-3.5 py-2.5 font-sans font-semibold text-slate-200">
                        {r.category}
                      </td>
                      <td className="px-3.5 py-2.5 font-sans text-slate-300 max-w-[150px] truncate">
                        {r.relatedEntityName}
                      </td>
                      <td className="px-3.5 py-2.5 font-sans text-slate-400 text-[11px] truncate max-w-[130px]">
                        {r.department}
                      </td>
                      <td className="px-3.5 py-2.5 font-sans">
                        <span
                          className={`text-[10px] font-bold ${
                            r.severity === 'Critical'
                              ? 'text-rose-400'
                              : r.severity === 'High'
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {r.severity}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-center font-bold text-slate-200">
                        {r.riskScore}
                      </td>
                      <td className="px-3.5 py-2.5 font-sans text-slate-300 max-w-sm">
                        <div>{r.description}</div>
                        <div className="text-[11px] text-blue-400 mt-1">
                          Action: {r.recommendedAction}
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 font-sans">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                            r.status === 'Resolved'
                              ? 'text-emerald-400 bg-emerald-950/40'
                              : r.status === 'Mitigating'
                              ? 'text-amber-400 bg-amber-950/40'
                              : 'text-rose-400 bg-rose-950/40'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Continuous Process Improvement Tracker */}
      {activeTab === 'improvements' && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
            <h2 className="text-sm font-semibold text-white mb-1">
              Operations Continuous Improvement Initiatives
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Systematic operational enhancements to eradicate bottlenecks, improve utilization, and streamline client delivery
            </p>

            <div className="space-y-3.5">
              {processImprovements.map((pi) => (
                <div
                  key={pi.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-400 font-bold">{pi.id}</span>
                      <span className="font-semibold text-white text-sm">{pi.title}</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-mono font-medium">
                      Status: {pi.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                    <div>
                      <span className="text-slate-500 font-medium block">Identified Root Cause:</span>
                      <p className="mt-0.5 leading-relaxed">{pi.rootCause}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Proposed Improvement:</span>
                      <p className="mt-0.5 leading-relaxed">{pi.proposedImprovement}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <div>
                      <span>Expected Impact: </span>
                      <span className="text-emerald-400 font-medium">{pi.expectedImpact}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>Owner: <strong className="text-slate-200">{pi.owner}</strong></span>
                      <span>Target: <strong className="font-mono text-slate-200">{pi.targetDate}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Propose Process Improvement Modal */}
      {showImprovementModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white">Propose Process Improvement</h3>
              <button
                onClick={() => setShowImprovementModal(false)}
                className="text-slate-500 hover:text-slate-300 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateImprovement} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Initiative Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Automated Milestone Variance Detection Gate"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Identified Operational Issue</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe the bottleneck or defect..."
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Underlying Root Cause</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Why does this issue occur?"
                  value={newRootCause}
                  onChange={(e) => setNewRootCause(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Proposed Improvement Mechanism</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detailed solution or workflow change..."
                  value={newProposed}
                  onChange={(e) => setNewProposed(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Expected Operational Impact</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Reduce overtime by 25%"
                    value={newImpact}
                    onChange={(e) => setNewImpact(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    required
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowImprovementModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 cursor-pointer"
                >
                  Register Initiative
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
