import {
  DataQualityIssue,
  Employee,
  Opportunity,
  Project,
  RevenueTransaction,
} from '../types';

export interface DataDictionaryField {
  dataset: string;
  field: string;
  type: string;
  required: boolean;
  businessRule: string;
  validationCheck: string;
}

export const DATA_DICTIONARY: DataDictionaryField[] = [
  {
    dataset: 'Projects Master',
    field: 'id',
    type: 'String (PRJ-XXXX)',
    required: true,
    businessRule: 'Unique engagement identifier issued upon conflict clearance.',
    validationCheck: 'Primary key integrity; regex ^PRJ-\\d{4}$; no duplicate entries allowed.',
  },
  {
    dataset: 'Projects Master',
    field: 'contractValue',
    type: 'Currency (USD)',
    required: true,
    businessRule: 'Total executed engagement letter fee approved by partner.',
    validationCheck: 'Must be positive numeric value > $0; cannot be negative.',
  },
  {
    dataset: 'Projects Master',
    field: 'revenueRecognized',
    type: 'Currency (USD)',
    required: true,
    businessRule: 'Cumulative revenue earned according to ASC 606 milestone or T&M schedule.',
    validationCheck: 'Must satisfy: 0 <= revenueRecognized <= contractValue.',
  },
  {
    dataset: 'Projects Master',
    field: 'expectedCompletionDate',
    type: 'ISO Date (YYYY-MM-DD)',
    required: true,
    businessRule: 'Target milestone delivery commitment provided to client.',
    validationCheck: 'Must be strictly >= startDate.',
  },
  {
    dataset: 'Projects Master',
    field: 'assignedResourceIds',
    type: 'Array of String',
    required: true,
    businessRule: 'At least 1 qualified consultant assigned to active engagements.',
    validationCheck: 'Length >= 1 when status is "Active" or "At Risk".',
  },
  {
    dataset: 'Opportunities Pipeline',
    field: 'probability',
    type: 'Percentage (0-100)',
    required: true,
    businessRule: 'Probability weighting aligned with sales stage governance.',
    validationCheck: 'Integer value between 0 and 100 inclusive.',
  },
  {
    dataset: 'Resource Allocations',
    field: 'allocationPercentage',
    type: 'Percentage (0-100+)',
    required: true,
    businessRule: 'Total weekly employee allocation should not exceed 100% sustainably.',
    validationCheck: 'Cumulative weekly percentage <= 100%; flags alert if > 115%.',
  },
  {
    dataset: 'Revenue Transactions',
    field: 'amount',
    type: 'Currency (USD)',
    required: true,
    businessRule: 'Gross billed or accrued invoice amount.',
    validationCheck: 'Amount > 0 for standard billings; credit memos must reference invoice.',
  },
];

// Run Automated Data Quality Audit Scan
export function runAutomatedDataQualityAudit(
  projects: Project[],
  transactions: RevenueTransaction[],
  opportunities: Opportunity[],
  employees: Employee[],
  currentIssues: DataQualityIssue[]
): {
  newIssues: DataQualityIssue[];
  totalAudited: number;
  score: number;
  stats: {
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
  };
} {
  const generated: DataQualityIssue[] = [...currentIssues];
  const existingKeys = new Set(generated.map((i) => `${i.dataset}-${i.recordId}-${i.column}`));

  const addIssue = (issue: Omit<DataQualityIssue, 'id' | 'detectionDate' | 'status'>) => {
    const key = `${issue.dataset}-${issue.recordId}-${issue.column}`;
    if (!existingKeys.has(key)) {
      existingKeys.add(key);
      generated.push({
        ...issue,
        id: `DQI-${1000 + generated.length + 1}`,
        detectionDate: '2026-09-26',
        status: 'Open',
      });
    }
  };

  // Rule 1: Project duplicate IDs
  const seenProjIds = new Set<string>();
  projects.forEach((p) => {
    if (seenProjIds.has(p.id)) {
      addIssue({
        dataset: 'Projects Master',
        recordId: p.id,
        column: 'id',
        errorType: 'Duplicate Primary Key',
        severity: 'High',
        category: 'Integrity',
        description: `Duplicate project ID ${p.id} detected in master directory.`,
        assignedOwner: 'Rohan Mehta',
      });
    }
    seenProjIds.add(p.id);

    // Rule 2: Missing client
    if (!p.client || p.client.trim() === '') {
      addIssue({
        dataset: 'Projects Master',
        recordId: p.id,
        column: 'client',
        errorType: 'Missing Mandatory Field',
        severity: 'High',
        category: 'Completeness',
        description: `Project ${p.id} has no client enterprise associated.`,
        assignedOwner: 'Rohan Mehta',
      });
    }

    // Rule 3: Revenue recognized exceeds contract value
    if (p.revenueRecognized > p.contractValue) {
      addIssue({
        dataset: 'Projects Master',
        recordId: p.id,
        column: 'revenueRecognized',
        errorType: 'Calculation Discrepancy',
        severity: 'High',
        category: 'Accuracy',
        description: `Recognized revenue ($${p.revenueRecognized.toLocaleString()}) exceeds contract value ($${p.contractValue.toLocaleString()}).`,
        assignedOwner: 'Sarah Jenkins',
      });
    }

    // Rule 4: Negative contract value
    if (p.contractValue <= 0) {
      addIssue({
        dataset: 'Projects Master',
        recordId: p.id,
        column: 'contractValue',
        errorType: 'Invalid Value',
        severity: 'High',
        category: 'Integrity',
        description: `Project ${p.id} contains negative or zero contract value ($${p.contractValue}).`,
        assignedOwner: 'Sarah Jenkins',
      });
    }

    // Rule 5: Date sequence invalid
    if (new Date(p.expectedCompletionDate) < new Date(p.startDate)) {
      addIssue({
        dataset: 'Projects Master',
        recordId: p.id,
        column: 'expectedCompletionDate',
        errorType: 'Date Sequence Inversion',
        severity: 'Medium',
        category: 'Timeliness',
        description: `Expected completion date precedes engagement start date.`,
        assignedOwner: 'Rohan Mehta',
      });
    }

    // Rule 6: Inconsistent status vs progress
    if (p.status === 'Completed' && p.progressPercentage < 100) {
      addIssue({
        dataset: 'Projects Master',
        recordId: p.id,
        column: 'progressPercentage',
        errorType: 'Status Inconsistency',
        severity: 'Medium',
        category: 'Consistency',
        description: `Project marked 'Completed' but milestone progress is recorded at ${p.progressPercentage}%.`,
        assignedOwner: 'Sarah Jenkins',
      });
    }

    // Rule 7: Active project with no resource assignments
    if ((p.status === 'Active' || p.status === 'At Risk') && (!p.assignedResourceIds || p.assignedResourceIds.length === 0)) {
      addIssue({
        dataset: 'Projects Master',
        recordId: p.id,
        column: 'assignedResourceIds',
        errorType: 'Missing Resource Allocation',
        severity: 'High',
        category: 'Completeness',
        description: `Active delivery project has no active consultants assigned.`,
        assignedOwner: 'Rohan Mehta',
      });
    }
  });

  // Rule 8: Opportunities invalid probability
  opportunities.forEach((o) => {
    if (o.probability < 0 || o.probability > 100) {
      addIssue({
        dataset: 'Opportunities Pipeline',
        recordId: o.id,
        column: 'probability',
        errorType: 'Out-of-Bounds Probability',
        severity: 'High',
        category: 'Accuracy',
        description: `Win probability (${o.probability}%) is outside valid 0-100 range.`,
        assignedOwner: 'Sarah Jenkins',
      });
    }
  });

  // Calculate score & statistics
  const totalAudited = projects.length + transactions.length + opportunities.length + employees.length;
  const byCategory: Record<string, number> = { Integrity: 0, Completeness: 0, Accuracy: 0, Consistency: 0, Timeliness: 0 };
  const bySeverity: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
  const byStatus: Record<string, number> = { Open: 0, 'Under Review': 0, Resolved: 0, Rejected: 0 };

  let unresolvedPenalty = 0;
  generated.forEach((iss) => {
    byCategory[iss.category] = (byCategory[iss.category] || 0) + 1;
    bySeverity[iss.severity] = (bySeverity[iss.severity] || 0) + 1;
    byStatus[iss.status] = (byStatus[iss.status] || 0) + 1;

    if (iss.status === 'Open' || iss.status === 'Under Review') {
      unresolvedPenalty += iss.severity === 'High' ? 3.5 : iss.severity === 'Medium' ? 2 : 0.8;
    }
  });

  const validRecords = Math.max(0, totalAudited - unresolvedPenalty);
  const score = parseFloat(Math.min(100, Math.max(0, (validRecords / totalAudited) * 100)).toFixed(1));

  return {
    newIssues: generated,
    totalAudited,
    score,
    stats: {
      byCategory,
      bySeverity,
      byStatus,
    },
  };
}
