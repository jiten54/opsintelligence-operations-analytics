import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users2,
  Calendar,
  AlertTriangle,
  Clock,
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  Edit3,
  Download,
  Plus,
  ArrowUpDown,
  UserCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Employee, Project } from '../../types';
import { exportToCSV } from '../../services/excelEngine';

export const ResourceUtilizationView: React.FC = () => {
  const {
    employees,
    departments,
    projects,
    resourceAllocations,
    updateResourceAllocation,
    filters,
  } = useApp();

  const [searchEmployee, setSearchEmployee] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [utilFilter, setUtilFilter] = useState<'All' | 'Overallocated' | 'Underutilized'>('All');

  // Modal for scheduling / allocating
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [allocatedHoursInput, setAllocatedHoursInput] = useState<number>(40);

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    if (filters.department !== 'All' && emp.department !== filters.department) return false;
    if (roleFilter !== 'All' && emp.role !== roleFilter) return false;

    const utilRate = emp.availableHours > 0 ? (emp.billableHours / emp.availableHours) * 100 : 0;
    if (utilFilter === 'Overallocated' && utilRate <= 100) return false;
    if (utilFilter === 'Underutilized' && utilRate >= 70) return false;

    if (searchEmployee) {
      const q = searchEmployee.toLowerCase();
      return (
        emp.name.toLowerCase().includes(q) ||
        emp.id.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const overallocatedCount = employees.filter(
    (e) => (e.availableHours > 0 ? (e.billableHours / e.availableHours) * 100 : 0) > 100
  ).length;

  const underutilizedCount = employees.filter(
    (e) => (e.availableHours > 0 ? (e.billableHours / e.availableHours) * 100 : 0) < 70
  ).length;

  const totalBillable = employees.reduce((s, e) => s + e.billableHours, 0);
  const totalAvailable = employees.reduce((s, e) => s + e.availableHours, 0);
  const overallRate = totalAvailable > 0 ? (totalBillable / totalAvailable) * 100 : 0;

  // Chart data: Planned vs Actual by Role
  const rolesSummary = ['Managing Director', 'Director', 'Senior Manager', 'Manager', 'Senior Associate', 'Associate', 'Analyst'].map((r) => {
    const matching = employees.filter((e) => e.role === r);
    const planned = matching.reduce((s, e) => s + e.plannedHours, 0);
    const actual = matching.reduce((s, e) => s + e.actualHours, 0);
    const billable = matching.reduce((s, e) => s + e.billableHours, 0);
    return {
      role: r.replace('Senior', 'Sr.').replace('Managing', 'M.'),
      planned,
      actual,
      billable,
      count: matching.length,
    };
  });

  const handleOpenAllocationModal = (emp: Employee) => {
    setEditingEmployee(emp);
    const deptProjects = projects.filter((p) => p.department === emp.department);
    setSelectedProjectId(deptProjects[0]?.id || projects[0]?.id || '');
    setAllocatedHoursInput(40);
  };

  const handleSaveAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee || !selectedProjectId) return;
    updateResourceAllocation(editingEmployee.id, selectedProjectId, allocatedHoursInput);
    setEditingEmployee(null);
  };

  const handleExportResources = () => {
    const data = filteredEmployees.map((e) => {
      const util = e.availableHours > 0 ? ((e.billableHours / e.availableHours) * 100).toFixed(1) : '0';
      return {
        'Employee ID': e.id,
        Name: e.name,
        Department: e.department,
        Role: e.role,
        Location: e.location,
        'Billable Rate ($/hr)': e.billableRate,
        'Available Hours': e.availableHours,
        'Planned Hours': e.plannedHours,
        'Actual Hours': e.actualHours,
        'Billable Hours': e.billableHours,
        'Utilization %': util,
        Status: e.status,
      };
    });
    exportToCSV(data, `Resource_Directory_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Resource Planning & Utilization
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Practitioner capacity monitoring, billable hours tracking, overallocation alerts, and engagement scheduling.
          </p>
        </div>

        <button
          onClick={handleExportResources}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Directory (CSV)</span>
        </button>
      </div>

      {/* Resource Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Utilization</span>
            <Users2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {overallRate.toFixed(1)}%
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">
            {totalBillable.toLocaleString()} / {totalAvailable.toLocaleString()} Total Hours
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Consulting Staff</span>
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {employees.length}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 font-mono">
            Active in 5 Global Practice Lines
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overallocated Resources</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-400">
            {overallocatedCount} Staff
          </div>
          <div className="mt-1 text-[11px] text-rose-400/80 font-mono">
            Exceeding 100% Billable Capacity
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Underutilized Resources</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {underutilizedCount} Staff
          </div>
          <div className="mt-1 text-[11px] text-amber-400/80 font-mono">
            Under 70% Capacity (Bench Risk)
          </div>
        </div>
      </div>

      {/* Planned vs Actual Hours by Seniority Level */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
        <h2 className="text-sm font-semibold text-white mb-1">
          Planned vs Actual vs Billable Hours by Seniority Level
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Tracking time leakage, non-billable overhead, and staffing distribution
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rolesSummary} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="role" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
                formatter={(val: any) => [`${Number(val).toLocaleString()} hrs`, '']}
              />
              <Bar dataKey="planned" name="Planned Hours" fill="#475569" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual Total Hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="billable" name="Billable Hours" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employee Directory & Scheduling Table */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search staff by name, role, ID..."
                value={searchEmployee}
                onChange={(e) => setSearchEmployee(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
            >
              <option value="All">All Roles</option>
              <option value="Managing Director">Managing Director</option>
              <option value="Director">Director</option>
              <option value="Senior Manager">Senior Manager</option>
              <option value="Manager">Manager</option>
              <option value="Senior Associate">Senior Associate</option>
              <option value="Associate">Associate</option>
              <option value="Analyst">Analyst</option>
            </select>

            <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setUtilFilter('All')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  utilFilter === 'All' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setUtilFilter('Overallocated')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  utilFilter === 'Overallocated' ? 'bg-rose-950/60 text-rose-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Overallocated (&gt;100%)
              </button>
              <button
                onClick={() => setUtilFilter('Underutilized')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  utilFilter === 'Underutilized' ? 'bg-amber-950/60 text-amber-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Underutilized (&lt;70%)
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            {filteredEmployees.length} Practitioners
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="px-3.5 py-2.5">ID</th>
                <th className="px-3.5 py-2.5">Practitioner Name</th>
                <th className="px-3.5 py-2.5">Department</th>
                <th className="px-3.5 py-2.5">Seniority Role</th>
                <th className="px-3.5 py-2.5">Location</th>
                <th className="px-3.5 py-2.5 text-right">Available</th>
                <th className="px-3.5 py-2.5 text-right">Billable</th>
                <th className="px-3.5 py-2.5 text-center">Utilization</th>
                <th className="px-3.5 py-2.5">Status</th>
                <th className="px-3.5 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredEmployees.map((emp) => {
                const utilRate = emp.availableHours > 0 ? (emp.billableHours / emp.availableHours) * 100 : 0;
                const isOver = utilRate > 100;
                const isUnder = utilRate < 70;

                return (
                  <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-3.5 py-2.5 text-blue-400">{emp.id}</td>
                    <td className="px-3.5 py-2.5 font-sans font-medium text-slate-200">
                      <div>{emp.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{emp.email}</div>
                    </td>
                    <td className="px-3.5 py-2.5 font-sans text-slate-400 text-[11px] truncate max-w-[130px]">
                      {emp.department}
                    </td>
                    <td className="px-3.5 py-2.5 font-sans text-slate-300">{emp.role}</td>
                    <td className="px-3.5 py-2.5 font-sans text-slate-400 text-[11px]">{emp.location}</td>
                    <td className="px-3.5 py-2.5 text-right tabular-nums text-slate-400">
                      {emp.availableHours}h
                    </td>
                    <td className="px-3.5 py-2.5 text-right tabular-nums text-slate-200 font-semibold">
                      {emp.billableHours}h
                    </td>
                    <td className="px-3.5 py-2.5 text-center">
                      <span
                        className={`font-semibold ${
                          isOver ? 'text-rose-400' : isUnder ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {utilRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 font-sans">
                      <span
                        className={`text-[10px] font-medium ${
                          emp.status === 'Active'
                            ? 'text-emerald-400'
                            : emp.status === 'Bench'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 text-center font-sans">
                      <button
                        onClick={() => handleOpenAllocationModal(emp)}
                        className="p-1 text-blue-400 hover:text-blue-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        title="Reallocate Hours on Project"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Resource Allocation Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Adjust Resource Allocation</h3>
                <p className="text-xs text-slate-400">
                  Assign or adjust project hours for {editingEmployee.name}
                </p>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="text-slate-500 hover:text-slate-300 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveAllocation} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Select Engagement Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {projects
                    .filter((p) => p.department === editingEmployee.department)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} — {p.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">
                  Allocated Weekly Hours (Current Available: {editingEmployee.availableHours}h)
                </label>
                <input
                  type="number"
                  min="0"
                  max="160"
                  value={allocatedHoursInput}
                  onChange={(e) => setAllocatedHoursInput(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>New Planned Hours:</span>
                  <span className="font-mono text-slate-200">{allocatedHoursInput} hrs</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Resulting Utilization Rate:</span>
                  <span
                    className={`font-mono font-semibold ${
                      (allocatedHoursInput / editingEmployee.availableHours) * 100 > 100
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {((allocatedHoursInput / editingEmployee.availableHours) * 100).toFixed(1)}%
                  </span>
                </div>
                {(allocatedHoursInput / editingEmployee.availableHours) * 100 > 100 && (
                  <p className="text-rose-400 mt-1">
                    Warning: Allocation exceeds standard capacity and will trigger an overallocation alert.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 cursor-pointer"
                >
                  Save & Re-calculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
