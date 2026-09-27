import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  AuditLog,
  DataQualityIssue,
  Department,
  Employee,
  FilterState,
  FollowUpAction,
  KPISummary,
  Opportunity,
  OperationalRisk,
  ProcessImprovement,
  Project,
  ProjectStatus,
  ResourceAllocation,
  RevenueTarget,
  RevenueTransaction,
  UserProfile,
  UserRole,
} from '../types';
import { generateSyntheticData, INITIAL_USERS } from '../data/mockData';
import { calculateKPISummary } from '../services/kpiEngine';
import { runAutomatedDataQualityAudit } from '../services/dataQualityEngine';

export type NavigationTab =
  | 'overview'
  | 'revenue'
  | 'resources'
  | 'projects'
  | 'excel'
  | 'powerbi'
  | 'dataquality'
  | 'risks'
  | 'reports'
  | 'settings';

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  setUserRole: (role: UserRole) => void;
  allUsers: UserProfile[];

  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;

  // Data collections
  departments: Department[];
  employees: Employee[];
  projects: Project[];
  revenueTransactions: RevenueTransaction[];
  revenueTargets: RevenueTarget[];
  opportunities: Opportunity[];
  resourceAllocations: ResourceAllocation[];
  dataQualityIssues: DataQualityIssue[];
  operationalRisks: OperationalRisk[];
  followUpActions: FollowUpAction[];
  processImprovements: ProcessImprovement[];
  auditLogs: AuditLog[];

  // Computed KPI Summary
  kpiSummary: KPISummary;

  // Modals & Details selection
  selectedProject: Project | null;
  setSelectedProject: (proj: Project | null) => void;
  selectedEmployee: Employee | null;
  setSelectedEmployee: (emp: Employee | null) => void;
  selectedIssue: DataQualityIssue | null;
  setSelectedIssue: (issue: DataQualityIssue | null) => void;

  // Actions
  updateProjectStatus: (id: string, status: ProjectStatus, notes?: string) => void;
  assignFollowUpAction: (action: Omit<FollowUpAction, 'id' | 'createdAt'>) => void;
  updateFollowUpStatus: (id: string, status: FollowUpAction['status']) => void;
  updateResourceAllocation: (employeeId: string, projectId: string, assignedHours: number) => void;
  updateDataQualityIssue: (id: string, status: DataQualityIssue['status'], notes?: string) => void;
  runDataQualityScan: () => void;
  addProcessImprovement: (item: Omit<ProcessImprovement, 'id'>) => void;
  resetAllData: () => void;
  addAuditEntry: (action: string, entity: string, entityId: string, details: string) => void;

  // Toast / Status Message
  notification: { message: string; type: 'success' | 'info' | 'warning' } | null;
  showNotification: (message: string, type?: 'success' | 'info' | 'warning') => void;
  lastUpdated: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'opsintelligence_platform_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');

  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'current_q',
    department: 'All',
    searchQuery: '',
    statusFilter: 'All',
  });

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  // Initialize data from synthetic generator or local storage
  const [dataset, setDataset] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return generateSyntheticData();
  });

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
    } catch (e) {
      console.warn('Storage quota exceeded', e);
    }
  }, [dataset]);

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const addAuditEntry = (action: string, entity: string, entityId: string, details: string) => {
    const newEntry: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: currentUser.name,
      action,
      entity,
      entityId,
      details,
    };
    setDataset((prev: any) => ({
      ...prev,
      auditLogs: [newEntry, ...prev.auditLogs],
    }));
    setLastUpdated(new Date().toLocaleTimeString());
  };

  const setUserRole = (role: UserRole) => {
    const match = INITIAL_USERS.find((u) => u.role === role) || {
      ...currentUser,
      role,
    };
    setCurrentUser(match);
    showNotification(`Switched active session persona to: ${role}`, 'info');
  };

  const resetFilters = () => {
    setFilters({
      dateRange: 'current_q',
      department: 'All',
      searchQuery: '',
      statusFilter: 'All',
    });
    showNotification('Global filters reset to default.', 'info');
  };

  // Selections
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<DataQualityIssue | null>(null);

  // Computed KPI Summary
  const kpiSummary = useMemo(() => {
    return calculateKPISummary(
      dataset.projects,
      dataset.revenueTransactions,
      dataset.revenueTargets,
      dataset.opportunities,
      dataset.employees,
      dataset.resourceAllocations,
      dataset.dataQualityIssues,
      filters
    );
  }, [dataset, filters]);

  // Actions
  const updateProjectStatus = (id: string, status: ProjectStatus, notes?: string) => {
    setDataset((prev: any) => {
      const updatedProjects = prev.projects.map((p: Project) => {
        if (p.id === id) {
          return {
            ...p,
            status,
            progressPercentage: status === 'Completed' ? 100 : p.progressPercentage,
            notes: notes ? `${p.notes ? p.notes + ' | ' : ''}${notes}` : p.notes,
          };
        }
        return p;
      });
      return { ...prev, projects: updatedProjects };
    });
    addAuditEntry('PROJECT_STATUS_UPDATE', 'Project', id, `Updated project status to ${status}. ${notes || ''}`);
    showNotification(`Project ${id} updated to status "${status}"`, 'success');
  };

  const assignFollowUpAction = (action: Omit<FollowUpAction, 'id' | 'createdAt'>) => {
    const newAction: FollowUpAction = {
      ...action,
      id: `ACT-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDataset((prev: any) => ({
      ...prev,
      followUpActions: [newAction, ...prev.followUpActions],
    }));
    addAuditEntry('ACTION_ASSIGNED', 'FollowUpAction', newAction.id, `Assigned "${action.title}" to ${action.assignedTo}`);
    showNotification(`Follow-up action assigned to ${action.assignedTo}`, 'success');
  };

  const updateFollowUpStatus = (id: string, status: FollowUpAction['status']) => {
    setDataset((prev: any) => ({
      ...prev,
      followUpActions: prev.followUpActions.map((a: FollowUpAction) =>
        a.id === id ? { ...a, status } : a
      ),
    }));
    addAuditEntry('ACTION_STATUS_UPDATE', 'FollowUpAction', id, `Status updated to ${status}`);
    showNotification(`Follow-up action marked as "${status}"`, 'info');
  };

  const updateResourceAllocation = (
    employeeId: string,
    projectId: string,
    assignedHours: number
  ) => {
    setDataset((prev: any) => {
      const emp = prev.employees.find((e: Employee) => e.id === employeeId);
      const proj = prev.projects.find((p: Project) => p.id === projectId);
      if (!emp || !proj) return prev;

      // Update or create allocation
      let found = false;
      const updatedAllocations = prev.resourceAllocations.map((a: ResourceAllocation) => {
        if (a.employeeId === employeeId && a.projectId === projectId) {
          found = true;
          return {
            ...a,
            assignedHours,
            billableHours: Math.round(assignedHours * 0.95),
            allocationPercentage: Math.round((assignedHours / emp.availableHours) * 100),
          };
        }
        return a;
      });

      if (!found) {
        updatedAllocations.push({
          id: `ALC-${Date.now().toString().slice(-4)}`,
          employeeId: emp.id,
          employeeName: emp.name,
          projectId: proj.id,
          projectName: proj.name,
          department: emp.department,
          assignedHours,
          billableHours: Math.round(assignedHours * 0.95),
          weekStarting: new Date().toISOString().split('T')[0],
          allocationPercentage: Math.round((assignedHours / emp.availableHours) * 100),
        });
      }

      // Recalculate employee planned and billable hours
      const empAllocations = updatedAllocations.filter((a: ResourceAllocation) => a.employeeId === employeeId);
      const totalAssigned = empAllocations.reduce((s: number, a: ResourceAllocation) => s + a.assignedHours, 0);
      const totalBillable = empAllocations.reduce((s: number, a: ResourceAllocation) => s + a.billableHours, 0);

      const updatedEmployees = prev.employees.map((e: Employee) =>
        e.id === employeeId
          ? {
              ...e,
              plannedHours: totalAssigned,
              billableHours: totalBillable,
              actualHours: Math.round(totalBillable * 1.04),
            }
          : e
      );

      return {
        ...prev,
        resourceAllocations: updatedAllocations,
        employees: updatedEmployees,
      };
    });

    addAuditEntry(
      'RESOURCE_REALLOCATED',
      'ResourceAllocation',
      employeeId,
      `Reallocated ${assignedHours} hours on project ${projectId}`
    );
    showNotification(`Updated allocation: ${assignedHours} hrs assigned.`, 'success');
  };

  const updateDataQualityIssue = (
    id: string,
    status: DataQualityIssue['status'],
    notes?: string
  ) => {
    setDataset((prev: any) => ({
      ...prev,
      dataQualityIssues: prev.dataQualityIssues.map((iss: DataQualityIssue) =>
        iss.id === id
          ? {
              ...iss,
              status,
              resolutionNotes: notes || iss.resolutionNotes,
            }
          : iss
      ),
    }));
    addAuditEntry('DATA_QUALITY_ISSUE_RESOLVED', 'DataQualityIssue', id, `Updated status to ${status}. Notes: ${notes || 'None'}`);
    showNotification(`Data quality issue ${id} marked as "${status}"`, 'success');
  };

  const runDataQualityScan = () => {
    const result = runAutomatedDataQualityAudit(
      dataset.projects,
      dataset.revenueTransactions,
      dataset.opportunities,
      dataset.employees,
      dataset.dataQualityIssues
    );
    setDataset((prev: any) => ({
      ...prev,
      dataQualityIssues: result.newIssues,
    }));
    addAuditEntry(
      'AUTOMATED_DATA_SCAN',
      'System Engine',
      'ALL_DATASETS',
      `Audit scan completed. Audited ${result.totalAudited} records, calculated score ${result.score}%.`
    );
    showNotification(
      `Audit Scan Complete: Quality Score recalculated to ${result.score}%`,
      'success'
    );
  };

  const addProcessImprovement = (item: Omit<ProcessImprovement, 'id'>) => {
    const newItem: ProcessImprovement = {
      ...item,
      id: `PI-${Date.now().toString().slice(-4)}`,
    };
    setDataset((prev: any) => ({
      ...prev,
      processImprovements: [newItem, ...prev.processImprovements],
    }));
    addAuditEntry('PROCESS_IMPROVEMENT_ADDED', 'ProcessImprovement', newItem.id, `Proposed: ${item.title}`);
    showNotification('Process improvement proposal registered.', 'success');
  };

  const resetAllData = () => {
    const fresh = generateSyntheticData();
    setDataset(fresh);
    localStorage.removeItem(STORAGE_KEY);
    addAuditEntry('DATASET_RESET', 'System', 'ALL', 'Reset all platform records to initial baseline state.');
    showNotification('All operational records restored to clean initial benchmark dataset.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        setUserRole,
        allUsers: INITIAL_USERS,
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        resetFilters,
        departments: dataset.departments,
        employees: dataset.employees,
        projects: dataset.projects,
        revenueTransactions: dataset.revenueTransactions,
        revenueTargets: dataset.revenueTargets,
        opportunities: dataset.opportunities,
        resourceAllocations: dataset.resourceAllocations,
        dataQualityIssues: dataset.dataQualityIssues,
        operationalRisks: dataset.operationalRisks,
        followUpActions: dataset.followUpActions,
        processImprovements: dataset.processImprovements,
        auditLogs: dataset.auditLogs,
        kpiSummary,
        selectedProject,
        setSelectedProject,
        selectedEmployee,
        setSelectedEmployee,
        selectedIssue,
        setSelectedIssue,
        updateProjectStatus,
        assignFollowUpAction,
        updateFollowUpStatus,
        updateResourceAllocation,
        updateDataQualityIssue,
        runDataQualityScan,
        addProcessImprovement,
        resetAllData,
        addAuditEntry,
        notification,
        showNotification,
        lastUpdated,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
