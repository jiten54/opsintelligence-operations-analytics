import React from 'react';
import { useApp, NavigationTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  TrendingUp,
  Layers,
  Users2,
  FolderGit2,
  FileSpreadsheet,
  BarChart3,
  ShieldCheck,
  AlertOctagon,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { activeTab, setActiveTab, dataQualityIssues, projects } = useApp();

  const openIssuesCount = dataQualityIssues.filter((i) => i.status === 'Open').length;
  const atRiskCount = projects.filter((p) => p.status === 'At Risk').length;

  const NAV_ITEMS: {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'revenue', label: 'Revenue Analytics', icon: TrendingUp },
    { id: 'resources', label: 'Resource Utilization', icon: Users2 },
    { id: 'projects', label: 'Project Operations', icon: FolderGit2, badge: atRiskCount, badgeColor: 'text-amber-400 bg-amber-950/40' },
    { id: 'excel', label: 'Advanced Excel', icon: FileSpreadsheet },
    { id: 'powerbi', label: 'Power BI Studio', icon: BarChart3 },
    { id: 'dataquality', label: 'Data Quality & Gov', icon: ShieldCheck, badge: openIssuesCount, badgeColor: 'text-blue-400 bg-blue-950/40' },
    { id: 'risks', label: 'Risk & Exceptions', icon: AlertOctagon },
    { id: 'reports', label: 'Automated Reports', icon: FileText },
    { id: 'settings', label: 'Architecture & Setup', icon: Settings },
  ];

  return (
    <aside
      className={`relative z-20 flex flex-col bg-slate-950 border-r border-slate-800/80 transition-all duration-300 ease-in-out shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Practice Context Header */}
      {!collapsed && (
        <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">
              Operations Center
            </span>
            <span className="text-xs text-slate-300 font-medium truncate">
              Bangalore Analytics Hub
            </span>
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1 text-slate-500 hover:text-slate-200 hover:bg-slate-900 rounded-md transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {collapsed && (
        <div className="py-3 flex justify-center border-b border-slate-800/60">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-900 rounded-md transition-colors cursor-pointer"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${item.badgeColor || 'text-slate-400 bg-slate-900'}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Candidate / Role Mission Statement Footer */}
      {!collapsed && (
        <div className="p-4 mx-3 mb-4 rounded-xl bg-slate-900/70 border border-slate-800/80 text-[11px]">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kroll Operations Role</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Engineered for Kroll Data Analyst – Operations. Demonstrates revenue, Excel engines, Power BI DAX, and automated data quality.
          </p>
        </div>
      )}
    </aside>
  );
};
