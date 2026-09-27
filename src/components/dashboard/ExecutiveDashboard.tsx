import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Layers,
  Briefcase,
  Users,
  AlertCircle,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  FileDown,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  getMonthlyRevenueTrend,
  getRevenueByDepartment,
  getBacklogByStatus,
  getPipelineByStage,
  getUtilizationByDepartment,
  getCapacityVsDemand,
} from '../../services/kpiEngine';
import { exportToCSV } from '../../services/excelEngine';

export const ExecutiveDashboard: React.FC = () => {
  const {
    kpiSummary,
    revenueTransactions,
    projects,
    opportunities,
    employees,
    departments,
    filters,
    setFilters,
    setActiveTab,
  } = useApp();

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Chart datasets derived dynamically from current state
  const monthlyRevenueData = getMonthlyRevenueTrend(revenueTransactions);
  const revenueByDeptData = getRevenueByDepartment(revenueTransactions);
  const backlogByStatusData = getBacklogByStatus(projects);
  const pipelineByStageData = getPipelineByStage(opportunities);
  const utilizationByDeptData = getUtilizationByDepartment(employees, departments);
  const capacityDemandData = getCapacityVsDemand(employees, departments);

  const RISK_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];
  const DEPT_COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#10b981'];

  const handleExportDashboard = () => {
    const rows = [
      { Metric: 'Total Revenue (Completed)', Value: kpiSummary.totalRevenue },
      { Metric: 'Revenue Growth YoY %', Value: kpiSummary.revenueGrowth.toFixed(2) },
      { Metric: 'Outstanding Project Backlog', Value: kpiSummary.totalBacklog },
      { Metric: 'Gross Sales Pipeline Value', Value: kpiSummary.totalPipeline },
      { Metric: 'Weighted Sales Pipeline', Value: kpiSummary.weightedPipeline },
      { Metric: 'Average Employee Utilization %', Value: kpiSummary.employeeUtilization.toFixed(1) },
      { Metric: 'Available Resource Capacity (Hours)', Value: kpiSummary.availableCapacityHours },
      { Metric: 'Active Consulting Projects', Value: kpiSummary.activeProjectsCount },
      { Metric: 'Projects At Risk (Severe/High)', Value: kpiSummary.projectsAtRiskCount },
      { Metric: 'Data Governance Quality Score %', Value: kpiSummary.dataQualityScore.toFixed(1) },
      { Metric: 'On-Time Project Delivery Rate %', Value: kpiSummary.onTimeDeliveryRate.toFixed(1) },
    ];
    exportToCSV(rows, `Executive_Operations_Dashboard_${new Date().toISOString().split('T')[0]}`);
  };

  const KPI_CARDS = [
    {
      id: 'kpi-revenue',
      title: 'Total Revenue',
      value: `$${(kpiSummary.totalRevenue / 1000000).toFixed(2)}M`,
      prevValue: `$${(kpiSummary.prevRevenue / 1000000).toFixed(2)}M`,
      change: `${kpiSummary.revenueGrowth >= 0 ? '+' : ''}${kpiSummary.revenueGrowth.toFixed(1)}%`,
      isPositive: kpiSummary.revenueGrowth >= 0,
      tooltip: 'Completed engagement revenue recognized across practice lines in the selected time period.',
      actionTab: 'revenue' as const,
      icon: DollarSign,
    },
    {
      id: 'kpi-growth',
      title: 'Revenue Growth',
      value: `${kpiSummary.revenueGrowth.toFixed(1)}%`,
      prevValue: '+8.4% Prev Period',
      change: `+${(kpiSummary.revenueGrowth - 8.4).toFixed(1)}% pts`,
      isPositive: kpiSummary.revenueGrowth >= 8.4,
      tooltip: 'Period-over-period revenue expansion against historical trailing baseline.',
      actionTab: 'revenue' as const,
      icon: TrendingUp,
    },
    {
      id: 'kpi-backlog',
      title: 'Current Backlog',
      value: `$${(kpiSummary.totalBacklog / 1000000).toFixed(2)}M`,
      prevValue: `$${(kpiSummary.prevBacklog / 1000000).toFixed(2)}M`,
      change: `${kpiSummary.backlogChange >= 0 ? '+' : ''}${kpiSummary.backlogChange.toFixed(1)}%`,
      isPositive: true,
      tooltip: 'Contracted client value yet to be earned and recognized on active/planned engagements.',
      actionTab: 'revenue' as const,
      icon: Layers,
    },
    {
      id: 'kpi-pipeline',
      title: 'Sales Pipeline (Weighted)',
      value: `$${(kpiSummary.weightedPipeline / 1000000).toFixed(2)}M`,
      prevValue: `$${(kpiSummary.totalPipeline / 1000000).toFixed(2)}M Unweighted`,
      change: '+12.4% QoQ',
      isPositive: true,
      tooltip: 'Commercial opportunity volume weighted by stage win probability (10% to 90%).',
      actionTab: 'revenue' as const,
      icon: Briefcase,
    },
    {
      id: 'kpi-utilization',
      title: 'Employee Utilization',
      value: `${kpiSummary.employeeUtilization.toFixed(1)}%`,
      prevValue: `${kpiSummary.targetUtilization}% Target`,
      change: `${kpiSummary.utilizationDelta >= 0 ? '+' : ''}${kpiSummary.utilizationDelta.toFixed(1)}%`,
      isPositive: kpiSummary.utilizationDelta >= 0,
      tooltip: 'Total Billable Hours / Available Working Hours. Target is 80% baseline for consulting practitioners.',
      actionTab: 'resources' as const,
      icon: Users,
    },
    {
      id: 'kpi-capacity',
      title: 'Available Capacity',
      value: `${kpiSummary.availableCapacityHours.toLocaleString()} hrs`,
      prevValue: `${kpiSummary.requiredCapacityHours.toLocaleString()} Planned`,
      change: `${((kpiSummary.capacityGapHours / (kpiSummary.availableCapacityHours || 1)) * 100).toFixed(0)}% Gap`,
      isPositive: kpiSummary.capacityGapHours >= 0,
      tooltip: 'Unallocated productive practitioner hours available for staffing upcoming mandates.',
      actionTab: 'resources' as const,
      icon: Clock,
    },
    {
      id: 'kpi-active-projects',
      title: 'Active Projects',
      value: `${kpiSummary.activeProjectsCount}`,
      prevValue: '105 Total Projects',
      change: '+6 this mo',
      isPositive: true,
      tooltip: 'Client advisory and forensic mandates currently in active execution.',
      actionTab: 'projects' as const,
      icon: CheckCircle,
    },
    {
      id: 'kpi-at-risk',
      title: 'Projects at Risk',
      value: `${kpiSummary.projectsAtRiskCount}`,
      prevValue: '8 Prev Quarter',
      change: `${kpiSummary.projectsAtRiskCount > 8 ? '+' : '-'}${Math.abs(kpiSummary.projectsAtRiskCount - 8)}`,
      isPositive: kpiSummary.projectsAtRiskCount <= 8,
      tooltip: 'Engagements experiencing scope creep, milestone delays, or budget burn overruns.',
      actionTab: 'projects' as const,
      icon: AlertCircle,
    },
    {
      id: 'kpi-data-quality',
      title: 'Data Quality Score',
      value: `${kpiSummary.dataQualityScore.toFixed(1)}%`,
      prevValue: '90.0% Threshold',
      change: `${kpiSummary.dataQualityScore >= 90 ? 'Passing' : 'Action Needed'}`,
      isPositive: kpiSummary.dataQualityScore >= 90,
      tooltip: 'Automated data governance health index across relational integrity, completeness, and accuracy.',
      actionTab: 'dataquality' as const,
      icon: ShieldCheck,
    },
    {
      id: 'kpi-delivery-rate',
      title: 'On-Time Delivery Rate',
      value: `${kpiSummary.onTimeDeliveryRate.toFixed(1)}%`,
      prevValue: '88.0% Benchmark',
      change: `+${(kpiSummary.onTimeDeliveryRate - 88.0).toFixed(1)}%`,
      isPositive: kpiSummary.onTimeDeliveryRate >= 88.0,
      tooltip: 'Percentage of completed client engagements finalized on or before contracted deadline.',
      actionTab: 'projects' as const,
      icon: CheckCircle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Filter Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Executive Operations Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational KPIs, commercial pipeline, resource capacity, and engagement health for leadership review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 hidden sm:block">
            <span>Practice: </span>
            <span className="font-semibold text-slate-200">{filters.department}</span>
          </div>

          <button
            onClick={handleExportDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Dashboard (CSV)</span>
          </button>
        </div>
      </div>

      {/* 10 Executive KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => setActiveTab(card.actionTab)}
              className="group relative p-4 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400 truncate">
                    {card.title}
                  </span>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTooltip(activeTooltip === card.id ? null : card.id);
                      }}
                      className="text-slate-500 hover:text-slate-300 p-0.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                    {activeTooltip === card.id && (
                      <div className="absolute right-0 bottom-full mb-1 w-52 p-2 bg-slate-800 border border-slate-700 text-slate-200 text-[10px] rounded-lg shadow-xl z-20">
                        {card.tooltip}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xl font-bold tracking-tight text-white font-mono tabular-nums">
                    {card.value}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 truncate">{card.prevValue}</span>
                <span
                  className={`flex items-center gap-0.5 font-medium font-mono ${
                    card.isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {card.isPositive ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {card.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Analytics Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Monthly Revenue Trend vs Target (7 Cols) */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Monthly Revenue Trend vs Target</h2>
              <p className="text-xs text-slate-400">
                Recognized milestone billings compared against operational targets ($M)
              </p>
            </div>
            <button
              onClick={() => setActiveTab('revenue')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
            >
              Full Revenue View →
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
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
                <Area
                  type="monotone"
                  dataKey="actual"
                  name="Recognized Revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#actualRevGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  name="Operating Target"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Department (4 Cols) */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Revenue by Practice Line</h2>
              <p className="text-xs text-slate-400">Share across advisory practices</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByDeptData}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {revenueByDeptData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`$${(Number(val) / 1000000).toFixed(2)}M`, 'Revenue']}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Backlog by Project Status (4 Cols) */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Backlog by Project Status</h2>
              <p className="text-xs text-slate-400">Unrecognized contract commitments</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={backlogByStatusData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                />
                <YAxis dataKey="status" type="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Backlog Value']}
                />
                <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Pipeline by Stage (4 Cols) */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Sales Pipeline Funnel</h2>
              <p className="text-xs text-slate-400">Gross vs Probability-Weighted value</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineByStageData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="stage" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
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
                <Bar dataKey="value" name="Gross Pipeline" fill="#334155" radius={[4, 4, 0, 0]} />
                <Bar dataKey="weighted" name="Weighted Expected" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Employee Utilization by Department (4 Cols) */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Practice Utilization Rates</h2>
              <p className="text-xs text-slate-400">Actual vs 80% billable target</p>
            </div>
            <button
              onClick={() => setActiveTab('resources')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
            >
              Resources →
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationByDeptData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit="%" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Utilization Rate']}
                />
                <Bar dataKey="utilization" name="Actual Rate" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Capacity vs Demand & Risk Alert Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Capacity vs Demand Breakdown */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <h2 className="text-sm font-semibold text-white mb-1">
            Resource Capacity vs Operational Demand
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Available working capacity vs planned engagement demand (in hours)
          </p>

          <div className="space-y-3">
            {capacityDemandData.map((item) => {
              const pct = Math.min(100, Math.round((item.demand / item.capacity) * 100));
              const isOver = item.gap < 0;
              return (
                <div key={item.department} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{item.department} Practice</span>
                    <span className="font-mono text-slate-400">
                      {item.demand.toLocaleString()} / {item.capacity.toLocaleString()} hrs ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isOver ? 'bg-rose-500' : pct > 85 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Bottlenecks & Critical Exceptions Card */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-white">Active Operational Bottlenecks</h2>
              <button
                onClick={() => setActiveTab('risks')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
              >
                Risk Register →
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Critical issues flagged for management coordination and mitigation
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/40 text-xs">
                <div className="flex items-center justify-between text-rose-400 font-semibold mb-1">
                  <span>Critical Project Delay</span>
                  <span className="font-mono text-[10px]">PRJ-0003</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Zero Trust Architecture Audit 3 weeks behind schedule due to client firewall change freeze.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs">
                <div className="flex items-center justify-between text-amber-400 font-semibold mb-1">
                  <span>Capacity Shortage</span>
                  <span className="font-mono text-[10px]">Valuation Practice</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  Senior managers over-committed by 28% for Q4 portfolio mark cycles. Offshore balancing active.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-800/40 text-xs">
                <div className="flex items-center justify-between text-blue-400 font-semibold mb-1">
                  <span>Data Quality Governance</span>
                  <span className="font-mono text-[10px]">DQI-1001</span>
                </div>
                <p className="text-slate-300 text-[11px]">
                  $70,000 revenue milestone recognition variance on PRJ-0014 awaiting revised billing schedule.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Audit Readiness: Passed internal controls</span>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2 cursor-pointer"
            >
              Generate Executive Brief →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
