import {
  Department,
  DepartmentName,
  Employee,
  Project,
  RevenueTransaction,
  RevenueTarget,
  Opportunity,
  ResourceAllocation,
  DataQualityIssue,
  OperationalRisk,
  FollowUpAction,
  ProcessImprovement,
  AuditLog,
  UserProfile,
} from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-1',
    name: 'Cyber Risk & Incident Response',
    code: 'CRIR',
    head: 'Jonathan Reynolds, Senior MD',
    budget: 12500000,
    targetUtilization: 82,
  },
  {
    id: 'dept-2',
    name: 'Valuation & Financial Advisory',
    code: 'VFA',
    head: 'Priya Sharma, Managing Director',
    budget: 14200000,
    targetUtilization: 80,
  },
  {
    id: 'dept-3',
    name: 'Forensic Investigations',
    code: 'FI',
    head: 'Marcus Vance, Managing Director',
    budget: 9800000,
    targetUtilization: 78,
  },
  {
    id: 'dept-4',
    name: 'Compliance & Governance',
    code: 'CG',
    head: 'Eleanor Vance-Wu, Senior Director',
    budget: 8400000,
    targetUtilization: 76,
  },
  {
    id: 'dept-5',
    name: 'Restructuring & Turnaround',
    code: 'RTA',
    head: 'David Sterling, Managing Director',
    budget: 11600000,
    targetUtilization: 84,
  },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@kroll-analytics.demo',
    role: 'Data Analyst',
    title: 'Lead Operations Data Analyst (Bangalore Hub)',
    department: 'Cyber Risk & Incident Response',
  },
  {
    id: 'usr-2',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@kroll-ops.demo',
    role: 'Operations Manager',
    title: 'Global Operations & Resource Director',
    department: 'Valuation & Financial Advisory',
  },
  {
    id: 'usr-3',
    name: 'Alexander Cross',
    email: 'alex.cross@kroll-admin.demo',
    role: 'Administrator',
    title: 'Head of Business Systems & Strategy',
    department: 'Restructuring & Turnaround',
  },
  {
    id: 'usr-4',
    name: 'Ananya Rao',
    email: 'ananya.rao@kroll-exec.demo',
    role: 'Viewer',
    title: 'Executive Stakeholder / Practice Leader',
    department: 'Forensic Investigations',
  },
];

// First & last names for employee generation
const FIRST_NAMES = [
  'Aarav', 'Neha', 'Vikram', 'Aditi', 'Siddharth', 'Kavita', 'Arjun', 'Pooja', 'Rishi', 'Divya',
  'Daniel', 'Emily', 'Christopher', 'Jessica', 'Michael', 'Rachel', 'Thomas', 'Sophia', 'James', 'Olivia',
  'Tarun', 'Anjali', 'Karthik', 'Swati', 'Manish', 'Deepika', 'Rahul', 'Sneha', 'Abhishek', 'Meera',
  'William', 'Charlotte', 'Benjamin', 'Amelia', 'Ethan', 'Harper', 'Lucas', 'Evelyn', 'Alexander', 'Abigail',
  'Naveen', 'Shreya', 'Gaurav', 'Bhavna', 'Pranav', 'Tanvi', 'Varun', 'Rhea', 'Harsh', 'Ishita',
  'Sanjay', 'Sunita', 'Karan', 'Lavanya', 'Alok'
];

const LAST_NAMES = [
  'Iyer', 'Patel', 'Nair', 'Kulkarni', 'Deshmukh', 'Chatterjee', 'Banerjee', 'Verma', 'Kapoor', 'Reddy',
  'Harrison', 'Miller', 'Blackwood', 'Chen', 'Davies', 'Fletcher', 'Goldman', 'Hayward', 'Kowalski', 'Larson',
  'Bhat', 'Menon', 'Pillai', 'Ranganathan', 'Saxena', 'Sengupta', 'Talwar', 'Wadhwa', 'Zaveri', 'Grover',
  'Montgomery', 'Sinclair', 'Thorne', 'Westbrook', 'Adler', 'Bennett', 'Callahan', 'Donovan', 'Ellington', 'Gallagher',
  'Joshi', 'Chopra', 'Dutta', 'Goswami', 'Hebbar', 'Mishra', 'Pandey', 'Rawat', 'Sood', 'Tripathi',
  'Bhandari', 'Kaushik', 'Malhotra', 'Nagpal', 'Qureshi'
];

const ROLES_DISTRIBUTION: { role: Employee['role']; rate: number; count: number }[] = [
  { role: 'Managing Director', rate: 750, count: 5 },
  { role: 'Director', rate: 580, count: 7 },
  { role: 'Senior Manager', rate: 440, count: 10 },
  { role: 'Manager', rate: 340, count: 12 },
  { role: 'Senior Associate', rate: 250, count: 12 },
  { role: 'Associate', rate: 190, count: 6 },
  { role: 'Analyst', rate: 140, count: 3 },
];

export function generateSyntheticData() {
  const departments = INITIAL_DEPARTMENTS;
  const employees: Employee[] = [];
  let nameIndex = 0;

  // Generate 55 employees distributed across departments
  ROLES_DISTRIBUTION.forEach((roleInfo) => {
    for (let i = 0; i < roleInfo.count; i++) {
      const dept = departments[(nameIndex % departments.length)].name;
      const firstName = FIRST_NAMES[nameIndex % FIRST_NAMES.length];
      const lastName = LAST_NAMES[nameIndex % LAST_NAMES.length];
      const id = `EMP-${1000 + nameIndex + 1}`;
      
      // Standard available hours in quarter/month: 168 hours per month (approx 504 per quarter)
      // We model standard period available hours = 160 hrs
      const availableHours = 160;
      // Realistic variance in planned and billable
      const varianceFactor = 0.65 + ((nameIndex * 7) % 55) / 100; // 0.65 to 1.19
      const billableHours = Math.round(availableHours * varianceFactor);
      const plannedHours = Math.round(billableHours * 1.05);
      const actualHours = Math.round(billableHours * 1.08 + ((nameIndex % 4) * 4));
      
      const status: Employee['status'] =
        billableHours === 0 ? 'On Leave' : billableHours < 75 ? 'Bench' : 'Active';

      employees.push({
        id,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@kroll.demo`,
        department: dept,
        role: roleInfo.role,
        location: nameIndex % 3 === 0 ? 'Bangalore, IND' : nameIndex % 3 === 1 ? 'New York, USA' : 'London, UK',
        billableRate: roleInfo.rate,
        availableHours,
        plannedHours,
        actualHours,
        billableHours,
        status,
        assignedProjectIds: [],
      });
      nameIndex++;
    }
  });

  // Client enterprise names
  const CLIENTS = [
    'Vanguard Global FinTech', 'Novartis HealthTech', 'Aegis Global Energy', 'Astra Meridian Bank',
    'Apex Semiconductor Corp', 'Cerberus Capital Group', 'Lumina Cloud Infrastructure', 'Nexus Aerospace Systems',
    'Starlight Biotech International', 'Veritas Logistics Conglomerate', 'Crestview Maritime Shipping',
    'Prism Defense Solutions', 'Solaria Renewables', 'Titan Retail Corporation', 'Horizon Telecommunications',
    'Quantex Financial Services', 'BlueWave Media Group', 'Sterling Private Equity', 'Hyperion Robotics',
    'Sovereign Wealth Trust', 'OmniCare Healthcare Systems', 'Ironclad Cyber Security', 'Cobalt Mineral Resources',
    'Polaris Automotive Group', 'Borealis Heavy Industries'
  ];

  const PROJECT_TEMPLATES: { dept: DepartmentName; titles: string[] }[] = [
    {
      dept: 'Cyber Risk & Incident Response',
      titles: [
        'Enterprise Ransomware Triage & Remediation', 'Zero Trust Architecture Readiness Audit',
        'Cloud Security Posture Assessment', 'Red Team Breach & Attack Simulation',
        'CISO Advisory & Threat Modeling', 'SOC Optimization & Detection Engineering',
        'Dark Web Exposure & Threat Intelligence', 'Critical Infrastructure OT Defense Protocol',
        'Third-Party Vendor Risk Validation', 'Incident Containment & Forensic Artifact Recovery',
        'PCI-DSS 4.0 Compliance Security Verification', 'Executive Cyber Crisis Simulation'
      ],
    },
    {
      dept: 'Valuation & Financial Advisory',
      titles: [
        'Fairness Opinion & Acquisition Solvency Assessment', 'Purchase Price Allocation (ASC 805)',
        'Cross-Border Intangible Asset Valuation', 'Portfolio Mark-to-Market Valuation',
        'Share-Based Compensation 409A Appraisal', 'Patent Portfolio & IP Valuation',
        'Distressed Debt & Restructuring Valuation', 'Infrastructure Asset Impairment Testing',
        'SPAC Business Combination Valuation Analysis', 'Convertible Security & Derivative Pricing',
        'Private Equity Secondary Transactions Valuation', 'Tax Planning Asset Step-Up Valuation'
      ],
    },
    {
      dept: 'Forensic Investigations',
      titles: [
        'Global Anti-Corruption FCPA Compliance Review', 'Cross-Border Asset Tracing & Recovery Audit',
        'Executive Whistleblower Fraud Investigation', 'Intellectual Property Theft & Exfiltration Analysis',
        'Complex Commercial Litigation Damage Calculation', 'Accounting Irregularities & Restatement Probe',
        'Anti-Money Laundering (AML) Sanctions Screening', 'Cryptocurrency Flow & Blockchain Forensics',
        'Vendor Kickback & Procurement Fraud Audit', 'Bribery Risk Assessment & Compliance Remediation'
      ],
    },
    {
      dept: 'Compliance & Governance',
      titles: [
        'EU AI Act & Algorithmic Governance Blueprint', 'Global Privacy Compliance (GDPR & CCPA)',
        'ESG Disclosure & SEC Climate Rule Audit', 'Export Controls & Trade Sanctions Framework',
        'Board Governance & Conflict of Interest Review', 'Banking Sector Prudential Risk Architecture',
        'Healthcare HIPAA Data Governance Review', 'Supply Chain Ethics & Modern Slavery Audit',
        'Operational Resilience (DORA) Implementation', 'Enterprise Whistleblower Program Structuring'
      ],
    },
    {
      dept: 'Restructuring & Turnaround',
      titles: [
        'Chapter 11 Debtor Advisory & Cash Flow Forecasting', '13-Week Cash Flow & Liquidity Optimization',
        'Creditor Committee Financial Advisory', 'Operational Turnaround & Cost Rationalization',
        'Distressed M&A Due Diligence & Carve-Out', 'Working Capital Compression & Debt Sizing',
        'Insolvency Asset Realization Advisory', 'Supplier Contract Restructuring & Renegotiation',
        'Special Situations Capital Structure Optimization', 'Bridge Financing Underwriting Review'
      ],
    },
  ];

  const projects: Project[] = [];
  let projIndex = 1;

  // Generate 105 projects
  for (let cycle = 0; cycle < 9; cycle++) {
    for (const template of PROJECT_TEMPLATES) {
      for (const title of template.titles) {
        if (projects.length >= 105) break;

        const client = CLIENTS[(projIndex * 3) % CLIENTS.length];
        const id = `PRJ-${String(projIndex).padStart(4, '0')}`;
        
        // Contract value between $80k and $1,400k
        const contractValue = Math.round((80000 + ((projIndex * 47311) % 1320000)) / 1000) * 1000;
        const budget = Math.round(contractValue * (0.65 + ((projIndex % 7) * 0.03))); // 65-83% budget margin
        
        // Status determination
        const statusMod = projIndex % 10;
        let status: Project['status'] = 'Active';
        let progress = 45;
        let deliveryRisk: Project['deliveryRisk'] = 'Low';
        let priority: Project['priority'] = 'Medium';

        if (statusMod === 0) {
          status = 'Completed';
          progress = 100;
          deliveryRisk = 'Low';
        } else if (statusMod === 1) {
          status = 'Completed';
          progress = 100;
          deliveryRisk = 'Low';
        } else if (statusMod === 2) {
          status = 'At Risk';
          progress = 58;
          deliveryRisk = 'High';
          priority = 'Critical';
        } else if (statusMod === 3) {
          status = 'On Hold';
          progress = 30;
          deliveryRisk = 'Moderate';
          priority = 'High';
        } else if (statusMod === 4) {
          status = 'Planned';
          progress = 0;
          deliveryRisk = 'Low';
          priority = 'Medium';
        } else if (statusMod === 5) {
          status = 'At Risk';
          progress = 72;
          deliveryRisk = 'Severe';
          priority = 'Critical';
        } else {
          status = 'Active';
          progress = 20 + ((projIndex * 13) % 70);
          deliveryRisk = progress > 70 ? 'Low' : 'Moderate';
          priority = progress > 75 ? 'High' : 'Medium';
        }

        const revenueRecognized = status === 'Completed'
          ? contractValue
          : status === 'Planned'
          ? 0
          : Math.round((contractValue * (progress / 100)) / 1000) * 1000;
        
        const remainingBacklog = Math.max(0, contractValue - revenueRecognized);
        const budgetSpent = Math.round(budget * (progress / 100) * (status === 'At Risk' ? 1.18 : 0.95));

        // Start and end dates
        const startMonth = ((projIndex % 10) + 1);
        const startYear = startMonth > 8 ? 2025 : 2026;
        const startDate = `${startYear}-${String(startMonth).padStart(2, '0')}-05`;
        
        const endMonth = ((startMonth + 3) % 12) + 1;
        const endYear = startMonth + 3 > 12 ? 2026 : startYear;
        const expectedCompletionDate = `${endYear}-${String(endMonth).padStart(2, '0')}-28`;
        
        const actualCompletionDate = status === 'Completed'
          ? `${endYear}-${String(endMonth).padStart(2, '0')}-24`
          : undefined;

        // Assign PM and team from matching department
        const deptEmployees = employees.filter((e) => e.department === template.dept);
        const pm = deptEmployees.find((e) => e.role.includes('Director') || e.role.includes('Manager')) || deptEmployees[0];
        const assigned = deptEmployees.slice(0, 3).map((e) => e.id);

        assigned.forEach((empId) => {
          const emp = employees.find((e) => e.id === empId);
          if (emp && !emp.assignedProjectIds.includes(id)) {
            emp.assignedProjectIds.push(id);
          }
        });

        projects.push({
          id,
          name: `${title} (${client.split(' ')[0]})`,
          client,
          department: template.dept,
          projectManager: pm ? pm.name : 'Senior Manager',
          startDate,
          expectedCompletionDate,
          actualCompletionDate,
          contractValue,
          budget,
          budgetSpent,
          revenueRecognized,
          remainingBacklog,
          status,
          priority,
          deliveryRisk,
          progressPercentage: progress,
          assignedResourceIds: assigned,
          notes: status === 'At Risk'
            ? 'Scope escalation encountered during discovery phase; requires client steering committee alignment.'
            : undefined,
        });

        projIndex++;
      }
    }
  }

  // 210 Revenue transactions
  const revenueTransactions: RevenueTransaction[] = [];
  let txIndex = 1;
  const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'];

  projects.forEach((proj, idx) => {
    // Generate 2 transactions per project
    const q1 = quarters[idx % quarters.length];
    const qYear1 = parseInt(q1.split(' ')[1], 10);
    const amount1 = Math.round(proj.revenueRecognized * 0.55);

    if (amount1 > 0) {
      revenueTransactions.push({
        id: `TX-${String(txIndex).padStart(5, '0')}`,
        projectId: proj.id,
        projectName: proj.name,
        client: proj.client,
        department: proj.department,
        date: `${qYear1}-${String(((idx % 3) * 3) + 1).padStart(2, '0')}-15`,
        amount: amount1,
        type: idx % 4 === 0 ? 'Retainer' : idx % 4 === 1 ? 'Milestone' : 'Time & Materials',
        status: 'Completed',
        quarter: q1,
        year: qYear1,
      });
      txIndex++;
    }

    const remainingRec = Math.max(0, proj.revenueRecognized - amount1);
    if (remainingRec > 0 || proj.status === 'Active') {
      const q2 = quarters[(idx + 1) % quarters.length];
      const qYear2 = parseInt(q2.split(' ')[1], 10);
      const amount2 = remainingRec > 0 ? remainingRec : Math.round(proj.contractValue * 0.25);
      
      revenueTransactions.push({
        id: `TX-${String(txIndex).padStart(5, '0')}`,
        projectId: proj.id,
        projectName: proj.name,
        client: proj.client,
        department: proj.department,
        date: `${qYear2}-${String(((idx % 3) * 3) + 2).padStart(2, '0')}-22`,
        amount: amount2,
        type: idx % 2 === 0 ? 'Milestone' : 'Time & Materials',
        status: proj.status === 'Completed' ? 'Completed' : idx % 5 === 0 ? 'Pending' : 'Completed',
        quarter: q2,
        year: qYear2,
      });
      txIndex++;
    }
  });

  // Revenue Targets
  const revenueTargets: RevenueTarget[] = [];
  quarters.forEach((q) => {
    const yr = parseInt(q.split(' ')[1], 10);
    departments.forEach((dept) => {
      revenueTargets.push({
        id: `TGT-${dept.code}-${q.replace(' ', '-')}`,
        department: dept.name,
        year: yr,
        quarter: q,
        targetAmount: Math.round(dept.budget / 4 * 1.06),
      });
    });
  });

  // 52 Sales Opportunities in Pipeline
  const opportunities: Opportunity[] = [];
  const STAGES: { stage: Opportunity['stage']; prob: number }[] = [
    { stage: 'Committed', prob: 90 },
    { stage: 'Negotiation', prob: 75 },
    { stage: 'Proposal', prob: 50 },
    { stage: 'Discovery', prob: 25 },
    { stage: 'Lead', prob: 10 },
  ];

  for (let oppIdx = 1; oppIdx <= 52; oppIdx++) {
    const dept = departments[oppIdx % departments.length];
    const client = CLIENTS[(oppIdx * 5) % CLIENTS.length];
    const stageInfo = STAGES[oppIdx % STAGES.length];
    const estimatedValue = Math.round((120000 + ((oppIdx * 63100) % 950000)) / 5000) * 5000;
    const weightedValue = Math.round(estimatedValue * (stageInfo.prob / 100));

    const monthOffset = (oppIdx % 4) + 1;
    const expectedClosingDate = `2026-${String(9 + monthOffset > 12 ? 9 + monthOffset - 12 : 9 + monthOffset).padStart(2, '0')}-20`;

    opportunities.push({
      id: `OPP-${String(oppIdx).padStart(4, '0')}`,
      name: `${client.split(' ')[0]} ${dept.code} Strategic Engagement`,
      client,
      department: dept.name,
      salesOwner: dept.head.split(',')[0],
      stage: stageInfo.stage,
      estimatedValue,
      probability: stageInfo.prob,
      expectedClosingDate,
      createdDate: `2026-0${(oppIdx % 6) + 1}-10`,
      weightedValue,
    });
  }

  // 120 Resource Allocations
  const resourceAllocations: ResourceAllocation[] = [];
  let allocIdx = 1;
  employees.forEach((emp, empIdx) => {
    // 2-3 allocations per employee
    const assignedProjects = projects.filter((p) => p.assignedResourceIds.includes(emp.id));
    const targetProjs = assignedProjects.length > 0 ? assignedProjects : [projects[empIdx % projects.length]];

    targetProjs.forEach((p, pIdx) => {
      const assignedHours = Math.round(emp.availableHours * (pIdx === 0 ? 0.6 : 0.4));
      const billableHours = Math.round(assignedHours * 0.92);

      resourceAllocations.push({
        id: `ALC-${String(allocIdx).padStart(4, '0')}`,
        employeeId: emp.id,
        employeeName: emp.name,
        projectId: p.id,
        projectName: p.name,
        department: emp.department,
        assignedHours,
        billableHours,
        weekStarting: '2026-09-21',
        allocationPercentage: Math.round((assignedHours / emp.availableHours) * 100),
      });
      allocIdx++;
    });
  });

  // Seeded Data Quality Issues for demonstration
  const dataQualityIssues: DataQualityIssue[] = [
    {
      id: 'DQI-1001',
      dataset: 'Projects Master',
      recordId: 'PRJ-0014',
      column: 'revenueRecognized',
      errorType: 'Calculation Discrepancy',
      severity: 'High',
      category: 'Accuracy',
      description: 'Recognized revenue ($890,000) exceeds total contract value ($820,000) by $70,000.',
      detectionDate: '2026-09-24',
      status: 'Open',
      assignedOwner: 'Rohan Mehta',
      resolutionNotes: 'Awaiting revised billing schedule from engagement partner.',
    },
    {
      id: 'DQI-1002',
      dataset: 'Opportunities Pipeline',
      recordId: 'OPP-0027',
      column: 'expectedClosingDate',
      errorType: 'Invalid Past Date',
      severity: 'Medium',
      category: 'Timeliness',
      description: 'Expected closing date is 45 days in the past while stage remains in Proposal.',
      detectionDate: '2026-09-22',
      status: 'Under Review',
      assignedOwner: 'Sarah Jenkins',
      resolutionNotes: 'Sales team notified to either mark as Closed-Lost or update expected close.',
    },
    {
      id: 'DQI-1003',
      dataset: 'Resource Allocations',
      recordId: 'ALC-0042',
      column: 'allocationPercentage',
      errorType: 'Capacity Overflow',
      severity: 'High',
      category: 'Integrity',
      description: 'Employee allocated across 4 projects totaling 145% weekly capacity (232 hours).',
      detectionDate: '2026-09-25',
      status: 'Open',
      assignedOwner: 'Rohan Mehta',
    },
    {
      id: 'DQI-1004',
      dataset: 'Revenue Transactions',
      recordId: 'TX-00088',
      column: 'amount',
      errorType: 'Negative Value Exception',
      severity: 'High',
      category: 'Integrity',
      description: 'Transaction posted with negative credit memo balance without cross-reference invoice.',
      detectionDate: '2026-09-21',
      status: 'Resolved',
      assignedOwner: 'Sarah Jenkins',
      resolutionNotes: 'Credit memo linked to original milestone invoice TX-00034; reconciliation approved.',
    },
    {
      id: 'DQI-1005',
      dataset: 'Employees Directory',
      recordId: 'EMP-1048',
      column: 'billableRate',
      errorType: 'Missing Attribute',
      severity: 'Medium',
      category: 'Completeness',
      description: 'Managing Director rate profile missing from ERP rate card table.',
      detectionDate: '2026-09-20',
      status: 'Resolved',
      assignedOwner: 'Alexander Cross',
      resolutionNotes: 'Standard rate card ($750/hr) configured and backfilled.',
    },
    {
      id: 'DQI-1006',
      dataset: 'Projects Master',
      recordId: 'PRJ-0062',
      column: 'projectManager',
      errorType: 'Orphan Reference',
      severity: 'Low',
      category: 'Consistency',
      description: 'Project manager field populated with inactive external contractor ID.',
      detectionDate: '2026-09-18',
      status: 'Under Review',
      assignedOwner: 'Rohan Mehta',
    },
  ];

  // Seeded Operational Risks
  const operationalRisks: OperationalRisk[] = [
    {
      id: 'RSK-201',
      category: 'Project Delay',
      severity: 'Critical',
      description: 'Zero Trust Cloud Architecture audit 3 weeks behind schedule due to client firewall change freeze.',
      relatedEntityId: 'PRJ-0003',
      relatedEntityName: 'Zero Trust Architecture Readiness Audit (Apex)',
      department: 'Cyber Risk & Incident Response',
      detectionDate: '2026-09-23',
      recommendedAction: 'Execute client escalation meeting; renegotiate milestone delivery schedule.',
      status: 'Mitigating',
      riskScore: 88,
    },
    {
      id: 'RSK-202',
      category: 'Capacity Shortage',
      severity: 'High',
      description: 'Senior associates in Valuation practice over-committed by 28% for Q4 portfolio mark cycles.',
      relatedEntityId: 'dept-2',
      relatedEntityName: 'Valuation & Financial Advisory',
      department: 'Valuation & Financial Advisory',
      detectionDate: '2026-09-24',
      recommendedAction: 'Engage Bangalore offshore support analysts to absorb non-billable data prep.',
      status: 'Open',
      riskScore: 78,
    },
    {
      id: 'RSK-203',
      category: 'Budget Burn',
      severity: 'High',
      description: 'FCPA Whistleblower investigation has consumed 94% of budget at 60% completion milestone.',
      relatedEntityId: 'PRJ-0011',
      relatedEntityName: 'Global Anti-Corruption FCPA Review (Vanguard)',
      department: 'Forensic Investigations',
      detectionDate: '2026-09-22',
      recommendedAction: 'Issue change order for forensic eDiscovery data volume expansion.',
      status: 'Mitigating',
      riskScore: 84,
    },
    {
      id: 'RSK-204',
      category: 'Backlog Aging',
      severity: 'Medium',
      description: '$1.4M in committed turnaround backlog unstarted past original start dates in Restructuring practice.',
      relatedEntityId: 'dept-5',
      relatedEntityName: 'Restructuring & Turnaround',
      department: 'Restructuring & Turnaround',
      detectionDate: '2026-09-19',
      recommendedAction: 'Re-baseline project kick-off dates and release reserved senior team resources.',
      status: 'Open',
      riskScore: 62,
    },
  ];

  // Follow-Up Actions
  const followUpActions: FollowUpAction[] = [
    {
      id: 'ACT-501',
      projectId: 'PRJ-0003',
      title: 'Steering committee escalation for client firewall access',
      assignedTo: 'Jonathan Reynolds',
      dueDate: '2026-10-02',
      status: 'In Progress',
      priority: 'High',
      createdAt: '2026-09-23',
    },
    {
      id: 'ACT-502',
      projectId: 'PRJ-0011',
      title: 'Prepare eDiscovery Out-of-Scope Change Order',
      assignedTo: 'Marcus Vance',
      dueDate: '2026-09-29',
      status: 'In Progress',
      priority: 'High',
      createdAt: '2026-09-22',
    },
    {
      id: 'ACT-503',
      projectId: 'PRJ-0014',
      title: 'Reconcile ASC 606 revenue milestone with billing system',
      assignedTo: 'Rohan Mehta',
      dueDate: '2026-09-30',
      status: 'Pending',
      priority: 'Medium',
      createdAt: '2026-09-24',
    },
  ];

  // Process Improvements
  const processImprovements: ProcessImprovement[] = [
    {
      id: 'PI-301',
      title: 'Offshore Resource Balancing for Quarterly Valuation Cycles',
      identifiedIssue: 'Recurring peak-period overallocation of onshore senior managers in Valuation practice.',
      rootCause: 'Data extraction and template population performed manually by onshore managers rather than offshore hub.',
      proposedImprovement: 'Standardize Excel workpaper intake into standardized Power Query templates processed by Bangalore operations team.',
      expectedImpact: 'Reduce onshore overtime by 32%, saving ~$140k/quarter in burnout and improving turnaround by 4 days.',
      owner: 'Rohan Mehta',
      targetDate: '2026-11-15',
      status: 'In Execution',
    },
    {
      id: 'PI-302',
      title: 'Automated Revenue Milestone Validation Gate',
      identifiedIssue: 'Discrepancies between PM self-reported progress percentage and finance-billed milestone revenue.',
      rootCause: 'Lack of automated cross-table validation before month-end revenue closing.',
      proposedImprovement: 'Deploy OpsIntelligence Data Quality automated validation rule checking budget vs progress variance > 15%.',
      expectedImpact: 'Eliminate month-end billing restatements; zero out-of-balance revenue recognition exceptions.',
      owner: 'Sarah Jenkins',
      targetDate: '2026-10-30',
      status: 'Implemented',
      actualOutcome: 'Deployed validation rule DQI-1001; caught 3 discrepancies prior to audit review.',
    },
  ];

  // Audit Logs
  const auditLogs: AuditLog[] = [
    {
      id: 'LOG-001',
      timestamp: '2026-09-26 14:32:10',
      user: 'Rohan Mehta',
      action: 'DATA_QUALITY_SCAN',
      entity: 'System Engine',
      entityId: 'ALL_DATASETS',
      details: 'Executed automated audit scan across 485 records. Found 6 data quality exceptions.',
    },
    {
      id: 'LOG-002',
      timestamp: '2026-09-26 12:15:44',
      user: 'Sarah Jenkins',
      action: 'EXCEPTION_RESOLVED',
      entity: 'DataQualityIssue',
      entityId: 'DQI-1004',
      details: 'Approved reconciliation of credit memo transaction TX-00088.',
    },
    {
      id: 'LOG-003',
      timestamp: '2026-09-25 16:40:02',
      user: 'Alexander Cross',
      action: 'RESOURCE_REALLOCATED',
      entity: 'ResourceAllocation',
      entityId: 'ALC-0042',
      details: 'Reassigned 20 planned hours from Associate to Bangalore offshore pool.',
    },
  ];

  return {
    departments,
    employees,
    projects,
    revenueTransactions,
    revenueTargets,
    opportunities,
    resourceAllocations,
    dataQualityIssues,
    operationalRisks,
    followUpActions,
    processImprovements,
    auditLogs,
  };
}
