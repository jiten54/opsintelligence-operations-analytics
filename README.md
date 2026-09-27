# OpsIntelligence — Enterprise Operations Analytics Platform

> **Engineered for Kroll Data Analyst – Operations (Bangalore Hub)**  
> Production-grade operations intelligence platform simulating the workflow of a global cybersecurity and financial risk consulting practice.

---

## 1. Executive Overview

**OpsIntelligence** centralizes operational performance, financial reporting, pipeline health, resource capacity, project delivery tracking, and automated data quality governance into a unified analytics workbench.

Designed specifically to solve core enterprise questions:
1. **Financial Performance:** How is the business performing against quarterly budget targets?
2. **Backlog & Revenue Recognition:** What is current recognized revenue (ASC 606) vs committed project backlog?
3. **Sales Pipeline:** What is our gross vs probability-weighted commercial pipeline by stage?
4. **Project Risk:** Which engagements are at risk of milestone delay or budget overrun?
5. **Resource Efficiency:** What is practitioner billable utilization (target: 80%) across seniority levels?
6. **Capacity Gaps:** Which practices have deficit capacity vs upcoming demand?
7. **Data Quality Governance:** Where are relational inconsistencies, duplicate keys, or calculation discrepancies impacting reports?

---

## 2. Key Modules & Technical Capabilities

### A. Executive Operations Dashboard
- **10 Core Operational KPIs:** Total Revenue, Revenue Growth %, Current Backlog, Sales Pipeline (Weighted), Employee Utilization %, Available Resource Capacity, Active Projects, Projects at Risk, Data Quality Score %, On-Time Delivery Rate %.
- **Dynamic Cross-Filtering:** Reactive time period selector (`7d`, `30d`, `90d`, `Current Q`, `Previous Q`, `Current Year`) and Practice Line filter.
- **Interactive Visualizations:** Monthly revenue trend vs targets, Revenue by practice line, Backlog by project status, Sales pipeline stage funnel, Practice utilization rates, Capacity vs demand distribution.

### B. Advanced Excel Analytics Module
- **Spreadsheet Ingestion:** Drag-and-drop CSV / Excel (`.xlsx`) parser with automatic data type inference (`string`, `number`, `date`, `boolean`), duplicate row detection, missing value scans, and column mapping.
- **Formula Engine:** Live evaluator for `SUM`, `SUMIF`, `SUMIFS`, `COUNT`, `COUNTIF`, `COUNTIFS`, `AVERAGE`, `AVERAGEIF`, `IF`, `IFERROR`, `XLOOKUP`, `VLOOKUP`, `INDEX`, `MATCH`, `ROUND`, `CONCAT`, `LEFT`, `RIGHT`, `MID`, `TRIM`, `YEAR`, `MONTH`, `TODAY`.
- **Multidimensional Pivot Table Builder:** Dynamic selection of row dimensions, column dimensions, and aggregations (`SUM`, `AVERAGE`, `COUNT`, `MIN`, `MAX`) with row/column subtotals and grand totals.
- **Power Query-Inspired Studio:** Step-by-step data prep pipeline (Remove duplicates, filter rows, rename columns, change data types, remove nulls) with editable transformation step history.
- **Conditional Formatting Ledger:** Color scales and threshold indicators with one-click Excel (`.xlsx`) and CSV exports.

### C. Power BI-Style Business Intelligence Studio
- **Multi-Directional Cross-Filtering:** Synchronous cross-filtering matrix where selecting any practice or status updates all scorecards, charts, and sub-tables.
- **DAX Measures Catalog:** Copyable production DAX expressions (`Total Revenue`, `Total Backlog`, `Weighted Pipeline`, `Utilization Rate`, `Revenue Variance`, `On-Time Delivery Rate`, `Data Quality Index`) with mathematical definitions and live evaluated values.

### D. Revenue, Backlog & Sales Pipeline Analytics
- Revenue recognition ledger with ASC 606 milestone tracking.
- Backlog aging buckets (`<30 Days`, `30-60 Days`, `60-90 Days`, `>90 Days`).
- Stage-weighted pipeline funnel (Lead 10%, Discovery 25%, Proposal 50%, Negotiation 75%, Committed 90%).
- Linear regression revenue forecasting (next 3 quarters with 90% confidence bounds).
- Statistical anomaly detection using standard deviation Z-Scores ($Z \ge 2.0\sigma$).

### E. Resource Planning & Utilization
- Practitioner directory of 55+ consultants across 5 practices (Bangalore, New York, London hubs).
- Planned vs Actual vs Billable hours tracking.
- Overallocation alerts ($>100\%$ capacity) and bench risk alerts ($<70\%$ capacity).
- Interactive scheduling modal to reallocate hours and resolve capacity conflicts in real time.

### F. Project Operations & Delivery Tracking
- 105+ client mandates tracked with budget spend vs progress variance, delivery risk, and deadline monitoring.
- Follow-up action assignment register with owner and status tracking.
- Project details drawer with live status transitions and audit logging.

### G. Data Quality & Governance Management
- Automated validation rules engine checking for duplicate keys, missing attributes, negative contract values, date inversions, and calculation discrepancies.
- Dynamic Data Quality Index score with penalty weighting.
- Interactive exception audit table with owner assignment, resolution status lifecycle (`Open`, `Under Review`, `Resolved`, `Rejected`), and resolution notes.
- Comprehensive Enterprise Data Dictionary with business rules and validation logic.

### H. Automated Business Reporting Center
- Dynamic executive summary narrative generated strictly from real data calculations.
- Printable layout mode.
- Export to Excel (`.xlsx`) and CSV respecting active filters.

### I. Built-in QA & Verification Suite
- Interactive test runner executing all 10 verification scenarios specified in Section 19 with millisecond benchmarks.

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Recharts, Lucide React, XLSX (SheetJS)
- **Database & Architecture:** Normalized 3NF PostgreSQL / Supabase schema, Row-Level Security (RLS)
- **State Management:** Reactive React Context with localStorage persistence and benchmark reset
- **Deployment:** Vercel (Edge / Serverless compatible, zero manual configuration required)

---

## 4. Local Development & Installation

```bash
# Clone the repository
git clone https://github.com/example/opsintelligence-platform.git
cd opsintelligence-platform

# Install dependencies
npm install

# Start local development server (runs on port 3000)
npm run dev
```

---

## 5. Vercel Deployment Instructions

1. Push your repository to GitHub / GitLab.
2. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import this repository.
4. Framework Preset: **Vite** (or Next.js if configuring API routes).
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **Deploy**.
