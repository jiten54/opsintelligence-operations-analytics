import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { RevenuePipelineView } from './components/revenue/RevenuePipelineView';
import { ResourceUtilizationView } from './components/resources/ResourceUtilizationView';
import { ProjectOperationsView } from './components/projects/ProjectOperationsView';
import { AdvancedExcelView } from './components/excel/AdvancedExcelView';
import { PowerBIStudioView } from './components/powerbi/PowerBIStudioView';
import { DataQualityView } from './components/dataquality/DataQualityView';
import { RiskExceptionView } from './components/risks/RiskExceptionView';
import { ReportingCenterView } from './components/reports/ReportingCenterView';
import { SettingsView } from './components/settings/SettingsView';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { QAValidationModal } from './components/modals/QAValidationModal';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, notification } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQAOpen, setIsQAOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Collapsible Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header Contract */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenQA={() => setIsQAOpen(true)}
        />

        {/* Scrollable Viewport Canvas */}
        <main className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && <ExecutiveDashboard />}
          {activeTab === 'revenue' && <RevenuePipelineView />}
          {activeTab === 'resources' && <ResourceUtilizationView />}
          {activeTab === 'projects' && <ProjectOperationsView />}
          {activeTab === 'excel' && <AdvancedExcelView />}
          {activeTab === 'powerbi' && <PowerBIStudioView />}
          {activeTab === 'dataquality' && <DataQualityView />}
          {activeTab === 'risks' && <RiskExceptionView />}
          {activeTab === 'reports' && <ReportingCenterView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <QAValidationModal isOpen={isQAOpen} onClose={() => setIsQAOpen(false)} />

      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs text-white animate-in fade-in slide-in-from-bottom-2 duration-200">
          {notification.type === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          {notification.type === 'warning' && (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          {notification.type === 'info' && (
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
