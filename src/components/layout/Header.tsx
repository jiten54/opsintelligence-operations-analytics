import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Search,
  Bell,
  Download,
  Calendar,
  Building2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  User,
  SlidersHorizontal,
} from 'lucide-react';
import { exportToCSV } from '../../services/excelEngine';

export const Header: React.FC<{ onOpenSearch: () => void; onOpenQA: () => void }> = ({
  onOpenSearch,
  onOpenQA,
}) => {
  const {
    currentUser,
    setUserRole,
    filters,
    setFilters,
    resetFilters,
    departments,
    notification,
    lastUpdated,
    projects,
    kpiSummary,
    dataQualityIssues,
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotificationsList, setShowNotificationsList] = useState(false);

  const roles: UserRole[] = [
    'Administrator',
    'Operations Manager',
    'Data Analyst',
    'Viewer',
  ];

  const handleExportQuickSummary = () => {
    const summaryData = [
      { Metric: 'Total Revenue', Value: `$${kpiSummary.totalRevenue.toLocaleString()}` },
      { Metric: 'Revenue Growth', Value: `${kpiSummary.revenueGrowth.toFixed(1)}%` },
      { Metric: 'Current Backlog', Value: `$${kpiSummary.totalBacklog.toLocaleString()}` },
      { Metric: 'Sales Pipeline (Weighted)', Value: `$${kpiSummary.weightedPipeline.toLocaleString()}` },
      { Metric: 'Employee Utilization', Value: `${kpiSummary.employeeUtilization.toFixed(1)}%` },
      { Metric: 'Available Capacity', Value: `${kpiSummary.availableCapacityHours.toLocaleString()} hrs` },
      { Metric: 'Active Projects', Value: kpiSummary.activeProjectsCount },
      { Metric: 'Projects At Risk', Value: kpiSummary.projectsAtRiskCount },
      { Metric: 'On-Time Delivery Rate', Value: `${kpiSummary.onTimeDeliveryRate.toFixed(1)}%` },
      { Metric: 'Data Quality Score', Value: `${kpiSummary.dataQualityScore.toFixed(1)}%` },
      { Metric: 'Timestamp', Value: new Date().toISOString() },
    ];
    exportToCSV(summaryData, `OpsIntelligence_Executive_Summary_${new Date().toISOString().split('T')[0]}`);
  };

  const openIssuesCount = dataQualityIssues.filter((i) => i.status === 'Open').length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Brand Zone: 1 text element wordmark */}
      <div className="flex items-center gap-3">
        <a href="#overview" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:bg-blue-500 transition-colors">
            O
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white leading-none">
              OpsIntelligence
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Enterprise Operations Analytics
            </span>
          </div>
        </a>

        <div className="hidden lg:flex items-center ml-4 pl-4 border-l border-slate-800 text-xs text-slate-400 gap-1.5 font-mono">
          <span>Synced:</span>
          <span className="text-slate-200 tabular-nums">{lastUpdated}</span>
        </div>
      </div>

      {/* Global Controls & Filters */}
      <div className="hidden md:flex items-center gap-3">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer w-64"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span className="truncate">Search projects, clients, staff...</span>
          <kbd className="ml-auto text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Date Filter Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
          <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value as any }))}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
          >
            <option value="7d" className="bg-slate-900">Last 7 Days</option>
            <option value="30d" className="bg-slate-900">Last 30 Days</option>
            <option value="90d" className="bg-slate-900">Last 90 Days</option>
            <option value="current_q" className="bg-slate-900">Current Quarter (Q3)</option>
            <option value="prev_q" className="bg-slate-900">Previous Quarter (Q2)</option>
            <option value="current_year" className="bg-slate-900">Current Year (2026)</option>
          </select>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
          <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <select
            value={filters.department}
            onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value as any }))}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs max-w-[160px] truncate"
          >
            <option value="All" className="bg-slate-900">All Practices</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name} className="bg-slate-900">
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {filters.department !== 'All' && (
          <button
            onClick={resetFilters}
            className="text-[11px] text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Action Zone: QA runner, Export, Notifications, Role Profile */}
      <div className="flex items-center gap-2.5">
        {/* QA Test Runner Button */}
        <button
          onClick={onOpenQA}
          title="Run System Verification & KPI Audit Suite"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 rounded-lg transition-colors cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>QA Audit Suite</span>
        </button>

        {/* Quick CSV Export */}
        <button
          onClick={handleExportQuickSummary}
          title="Export current dashboard KPIs to CSV"
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700 cursor-pointer"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotificationsList(!showNotificationsList)}
            className="relative p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {openIssuesCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>

          {showNotificationsList && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
                <span className="font-semibold text-slate-200">Operational Alerts</span>
                <span className="text-[11px] text-amber-400 font-mono">{openIssuesCount} Open Issues</span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/50">
                {openIssuesCount === 0 ? (
                  <div className="p-4 text-center text-slate-500">No active alerts. All systems healthy.</div>
                ) : (
                  dataQualityIssues.slice(0, 4).map((iss) => (
                    <div key={iss.id} className="p-3 hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{iss.errorType}</span>
                        <span className="ml-auto text-[10px] text-slate-500">{iss.recordId}</span>
                      </div>
                      <p className="text-slate-300 mt-1 line-clamp-2 text-[11px]">{iss.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active Persona / Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded bg-blue-900/60 border border-blue-700/60 text-blue-300 flex items-center justify-center font-bold text-[10px]">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-slate-200 font-medium leading-none">{currentUser.name}</span>
              <span className="text-[10px] text-blue-400 mt-0.5 leading-none">{currentUser.role}</span>
            </div>
            <SlidersHorizontal className="w-3 h-3 text-slate-500 ml-1" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="font-semibold text-slate-200">{currentUser.name}</p>
                <p className="text-[11px] text-slate-400">{currentUser.title}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">{currentUser.email}</p>
              </div>

              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Switch Test Persona
              </div>

              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setUserRole(r);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
                    currentUser.role === r ? 'text-blue-400 font-semibold bg-blue-950/20' : 'text-slate-300'
                  }`}
                >
                  <span>{r}</span>
                  {currentUser.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
