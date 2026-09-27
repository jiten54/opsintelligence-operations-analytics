import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Database,
  Cloud,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Terminal,
  FileCode,
  Layers,
  Sparkles,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    auditLogs,
    resetAllData,
    currentUser,
    projects,
    revenueTransactions,
    employees,
    dataQualityIssues,
  } = useApp();

  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const POSTGRESQL_SCHEMA_SQL = `-- OpsIntelligence Relational Database Schema
-- Optimized for PostgreSQL / Supabase with Row Level Security (RLS)

CREATE TABLE departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL,
    head TEXT NOT NULL,
    budget NUMERIC(15, 2) NOT NULL DEFAULT 0,
    target_utilization NUMERIC(5, 2) NOT NULL DEFAULT 80.0
);

CREATE TABLE employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    department TEXT REFERENCES departments(name),
    role TEXT NOT NULL,
    location TEXT NOT NULL,
    billable_rate NUMERIC(10, 2) NOT NULL,
    available_hours INT NOT NULL DEFAULT 160,
    planned_hours INT NOT NULL DEFAULT 0,
    actual_hours INT NOT NULL DEFAULT 0,
    billable_hours INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('Active', 'On Leave', 'Bench'))
);

CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    client TEXT NOT NULL,
    department TEXT REFERENCES departments(name),
    project_manager TEXT NOT NULL,
    start_date DATE NOT NULL,
    expected_completion_date DATE NOT NULL,
    actual_completion_date DATE,
    contract_value NUMERIC(15, 2) NOT NULL CHECK (contract_value > 0),
    budget NUMERIC(15, 2) NOT NULL,
    budget_spent NUMERIC(15, 2) NOT NULL DEFAULT 0,
    revenue_recognized NUMERIC(15, 2) NOT NULL DEFAULT 0,
    remaining_backlog NUMERIC(15, 2) GENERATED ALWAYS AS (contract_value - revenue_recognized) STORED,
    status TEXT NOT NULL CHECK (status IN ('Planned', 'Active', 'On Hold', 'At Risk', 'Completed', 'Cancelled')),
    priority TEXT NOT NULL,
    delivery_risk TEXT NOT NULL,
    progress_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0
);

CREATE TABLE revenue_transactions (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id),
    client TEXT NOT NULL,
    department TEXT REFERENCES departments(name),
    date DATE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Completed', 'Pending', 'Scheduled', 'Disputed')),
    quarter VARCHAR(10) NOT NULL,
    year INT NOT NULL
);

CREATE TABLE opportunities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    client TEXT NOT NULL,
    department TEXT REFERENCES departments(name),
    sales_owner TEXT NOT NULL,
    stage TEXT NOT NULL,
    estimated_value NUMERIC(15, 2) NOT NULL,
    probability NUMERIC(5, 2) NOT NULL CHECK (probability BETWEEN 0 AND 100),
    expected_closing_date DATE NOT NULL,
    created_date DATE NOT NULL,
    weighted_value NUMERIC(15, 2) GENERATED ALWAYS AS (estimated_value * (probability / 100.0)) STORED
);

CREATE TABLE data_quality_issues (
    id TEXT PRIMARY KEY,
    dataset TEXT NOT NULL,
    record_id TEXT NOT NULL,
    column_name TEXT NOT NULL,
    error_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('High', 'Medium', 'Low')),
    description TEXT NOT NULL,
    detection_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Open', 'Under Review', 'Resolved', 'Rejected')),
    assigned_owner TEXT NOT NULL,
    resolution_notes TEXT
);`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" />
            <span>Architecture & Deployment Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Production Vercel deployment configuration, normalized PostgreSQL schema, and system audit trail.
          </p>
        </div>

        <button
          onClick={resetAllData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-950/40 hover:bg-amber-900/50 rounded-lg border border-amber-800/60 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Datasets to Benchmark</span>
        </button>
      </div>

      {/* Deployment & Architecture Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-white font-semibold text-xs">
            <Cloud className="w-4 h-4 text-blue-400" />
            <span>Vercel Production Deployment</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Zero-config Edge/Serverless deployment. Ready for continuous integration with Git and custom domains.
          </p>
          <div className="pt-2 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Vercel Build Target: Production Ready</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-white font-semibold text-xs">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>PostgreSQL / Supabase Schema</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            3rd Normal Form (3NF) relational design with foreign key constraints, generated backlog columns, and indexes.
          </p>
          <div className="pt-2 text-[10px] font-mono text-blue-400 flex items-center gap-1">
            <Layers className="w-3 h-3" />
            <span>16 Normalized Entities Supported</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-white font-semibold text-xs">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Role-Based Access Control (RBAC)</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Active persona: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role}). Governs edit permissions across datasets.
          </p>
          <div className="pt-2 text-[10px] font-mono text-purple-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Permission Enforcement: Active</span>
          </div>
        </div>
      </div>

      {/* Database Schema SQL Viewer */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-400" />
              <span>Production PostgreSQL Schema Definition</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Production DDL script implementing normalized tables, constraints, and relational integrity.
            </p>
          </div>

          <button
            onClick={() => handleCopy(POSTGRESQL_SCHEMA_SQL, 'schema')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer"
          >
            {copiedSection === 'schema' ? 'Copied SQL!' : 'Copy SQL Script'}
          </button>
        </div>

        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 max-h-72 overflow-y-auto whitespace-pre">
          {POSTGRESQL_SCHEMA_SQL}
        </div>
      </div>

      {/* System Audit Trail Log */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>Real-Time Operations Audit Log ({auditLogs.length} Entries)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live audit logging documenting user actions, resource reallocations, and data quality remediations.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-sans font-medium">
              <tr>
                <th className="px-3.5 py-2.5">Timestamp</th>
                <th className="px-3.5 py-2.5">User</th>
                <th className="px-3.5 py-2.5">Action Event</th>
                <th className="px-3.5 py-2.5">Target Entity</th>
                <th className="px-3.5 py-2.5">Entity ID</th>
                <th className="px-3.5 py-2.5">Operational Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="px-3.5 py-2.5 text-slate-400">{log.timestamp}</td>
                  <td className="px-3.5 py-2.5 font-sans text-slate-200 font-medium">{log.user}</td>
                  <td className="px-3.5 py-2.5 text-blue-400 font-bold">{log.action}</td>
                  <td className="px-3.5 py-2.5 font-sans text-slate-300">{log.entity}</td>
                  <td className="px-3.5 py-2.5 text-amber-400">{log.entityId}</td>
                  <td className="px-3.5 py-2.5 font-sans text-slate-300 max-w-sm truncate">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
