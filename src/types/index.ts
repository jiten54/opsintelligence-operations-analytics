export type UserRole = 'Administrator' | 'Operations Manager' | 'Data Analyst' | 'Viewer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  department: string;
  avatarUrl?: string;
}

export type DepartmentName =
  | 'Cyber Risk & Incident Response'
  | 'Valuation & Financial Advisory'
  | 'Forensic Investigations'
  | 'Compliance & Governance'
  | 'Restructuring & Turnaround';

export interface Department {
  id: string;
  name: DepartmentName;
  code: string;
  head: string;
  budget: number;
  targetUtilization: number;
}

export type EmployeeRole =
  | 'Managing Director'
  | 'Director'
  | 'Senior Manager'
  | 'Manager'
  | 'Senior Associate'
  | 'Associate'
  | 'Analyst';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: DepartmentName;
  role: EmployeeRole;
  location: string;
  billableRate: number; // Hourly rate in USD
  availableHours: number; // Standard available working hours in period
  plannedHours: number;
  actualHours: number;
  billableHours: number;
  status: 'Active' | 'On Leave' | 'Bench';
  assignedProjectIds: string[];
}

export type ProjectStatus = 'Planned' | 'Active' | 'On Hold' | 'At Risk' | 'Completed' | 'Cancelled';
export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type DeliveryRisk = 'Low' | 'Moderate' | 'High' | 'Severe';

export interface Project {
  id: string;
  name: string;
  client: string;
  department: DepartmentName;
  projectManager: string;
  startDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  contractValue: number;
  budget: number;
  budgetSpent: number;
  revenueRecognized: number;
  remainingBacklog: number;
  status: ProjectStatus;
  priority: ProjectPriority;
  deliveryRisk: DeliveryRisk;
  progressPercentage: number;
  assignedResourceIds: string[];
  notes?: string;
}

export type TransactionType = 'Milestone' | 'Time & Materials' | 'Retainer' | 'Success Fee';
export type TransactionStatus = 'Completed' | 'Pending' | 'Scheduled' | 'Disputed';

export interface RevenueTransaction {
  id: string;
  projectId: string;
  projectName: string;
  client: string;
  department: DepartmentName;
  date: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  quarter: string;
  year: number;
}

export interface RevenueTarget {
  id: string;
  department: DepartmentName;
  year: number;
  quarter: string;
  targetAmount: number;
}

export type OpportunityStage =
  | 'Lead'
  | 'Discovery'
  | 'Proposal'
  | 'Negotiation'
  | 'Committed'
  | 'Won'
  | 'Lost';

export interface Opportunity {
  id: string;
  name: string;
  client: string;
  department: DepartmentName;
  salesOwner: string;
  stage: OpportunityStage;
  estimatedValue: number;
  probability: number; // 0 to 100
  expectedClosingDate: string;
  createdDate: string;
  weightedValue: number; // estimatedValue * (probability / 100)
}

export interface ResourceAllocation {
  id: string;
  employeeId: string;
  employeeName: string;
  projectId: string;
  projectName: string;
  department: DepartmentName;
  assignedHours: number;
  billableHours: number;
  weekStarting: string;
  allocationPercentage: number;
}

export type DataIssueSeverity = 'High' | 'Medium' | 'Low';
export type DataIssueStatus = 'Open' | 'Under Review' | 'Resolved' | 'Rejected';
export type DataIssueCategory = 'Integrity' | 'Completeness' | 'Accuracy' | 'Consistency' | 'Timeliness';

export interface DataQualityIssue {
  id: string;
  dataset: string;
  recordId: string;
  column: string;
  errorType: string;
  severity: DataIssueSeverity;
  category: DataIssueCategory;
  description: string;
  detectionDate: string;
  status: DataIssueStatus;
  assignedOwner: string;
  resolutionNotes?: string;
}

export interface OperationalRisk {
  id: string;
  category: 'Project Delay' | 'Capacity Shortage' | 'Budget Burn' | 'Backlog Aging' | 'Compliance & Quality';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  relatedEntityId: string;
  relatedEntityName: string;
  department: DepartmentName;
  detectionDate: string;
  recommendedAction: string;
  status: 'Open' | 'Mitigating' | 'Resolved';
  riskScore: number; // 1-100
}

export interface FollowUpAction {
  id: string;
  projectId: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  createdAt: string;
}

export interface ProcessImprovement {
  id: string;
  title: string;
  identifiedIssue: string;
  rootCause: string;
  proposedImprovement: string;
  expectedImpact: string;
  owner: string;
  targetDate: string;
  status: 'Proposed' | 'In Execution' | 'Implemented' | 'Under Review';
  actualOutcome?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
}

export type DateRangePreset =
  | '7d'
  | '30d'
  | '90d'
  | 'current_q'
  | 'prev_q'
  | 'current_year'
  | 'custom';

export interface FilterState {
  dateRange: DateRangePreset;
  customStartDate?: string;
  customEndDate?: string;
  department: 'All' | DepartmentName;
  searchQuery: string;
  statusFilter?: string;
}

export interface KPISummary {
  totalRevenue: number;
  prevRevenue: number;
  revenueGrowth: number;
  totalBacklog: number;
  prevBacklog: number;
  backlogChange: number;
  totalPipeline: number;
  weightedPipeline: number;
  pipelineChange: number;
  employeeUtilization: number;
  targetUtilization: number;
  utilizationDelta: number;
  availableCapacityHours: number;
  requiredCapacityHours: number;
  capacityGapHours: number;
  activeProjectsCount: number;
  projectsAtRiskCount: number;
  onTimeDeliveryRate: number;
  dataQualityScore: number;
  totalRecordsAudited: number;
  validRecordsCount: number;
}
