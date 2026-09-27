import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderGit2,
  Search,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  DollarSign,
  User,
  Plus,
  ArrowUpDown,
  Download,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Project, ProjectStatus, FollowUpAction } from '../../types';
import { exportToCSV } from '../../services/excelEngine';

export const ProjectOperationsView: React.FC = () => {
  const {
    projects,
    employees,
    followUpActions,
    assignFollowUpAction,
    updateFollowUpStatus,
    updateProjectStatus,
    filters,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected project modal
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // New follow-up action modal form
  const [showActionModal, setShowActionModal] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('');
  const [newActionDueDate, setNewActionDueDate] = useState('');
  const [newActionPriority, setNewActionPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    if (filters.department !== 'All' && p.department !== filters.department) return false;
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && p.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.projectManager.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenActionModal = (proj: Project) => {
    setSelectedProject(proj);
    setNewActionAssignee(proj.projectManager);
    setNewActionDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setShowActionModal(true);
  };

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newActionTitle) return;
    assignFollowUpAction({
      projectId: selectedProject.id,
      title: newActionTitle,
      assignedTo: newActionAssignee,
      dueDate: newActionDueDate,
      status: 'In Progress',
      priority: newActionPriority,
    });
    setNewActionTitle('');
    setShowActionModal(false);
  };

  const handleExportCSV = () => {
    const rows = filteredProjects.map((p) => ({
      'Project ID': p.id,
      'Engagement Name': p.name,
      Client: p.client,
      Department: p.department,
      'Project Manager': p.projectManager,
      'Start Date': p.startDate,
      'Expected Completion': p.expectedCompletionDate,
      'Contract Value': p.contractValue,
      'Budget Spent': p.budgetSpent,
      'Revenue Recognized': p.revenueRecognized,
      'Remaining Backlog': p.remainingBacklog,
      Status: p.status,
      Priority: p.priority,
      'Delivery Risk': p.deliveryRisk,
      'Progress %': p.progressPercentage,
    }));
    exportToCSV(rows, `Projects_Operations_Directory_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Project Operations & Coordination
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Engagement delivery tracking, deadline monitoring, milestone progression, and operational follow-up management.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Projects (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search projects, clients, PMs..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="At Risk">At Risk</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Planned">Planned</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="text-xs text-slate-400">
            Showing {paginatedProjects.length} of {filteredProjects.length} projects
          </div>
        </div>

        {/* Project Operations Master Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="px-3 py-2.5">ID</th>
                <th className="px-3 py-2.5">Engagement Mandate</th>
                <th className="px-3 py-2.5">Client</th>
                <th className="px-3 py-2.5">Lead PM</th>
                <th className="px-3 py-2.5">Milestone Deadline</th>
                <th className="px-3 py-2.5 text-right">Contract Value</th>
                <th className="px-3 py-2.5 text-right">Backlog</th>
                <th className="px-3 py-2.5 text-center">Progress</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Risk Level</th>
                <th className="px-3 py-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paginatedProjects.map((p) => {
                const isOverdue =
                  new Date(p.expectedCompletionDate) < new Date('2026-09-26') &&
                  p.status !== 'Completed';

                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProject(p)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="px-3 py-2.5 text-blue-400 font-semibold">{p.id}</td>
                    <td className="px-3 py-2.5 font-sans font-medium text-slate-200 max-w-[210px] truncate">
                      {p.name}
                    </td>
                    <td className="px-3 py-2.5 font-sans text-slate-300">{p.client}</td>
                    <td className="px-3 py-2.5 font-sans text-slate-400 text-[11px]">{p.projectManager}</td>
                    <td className="px-3 py-2.5 text-slate-400">
                      <div className="flex items-center gap-1">
                        <span>{p.expectedCompletionDate}</span>
                        {isOverdue && (
                          <span className="text-[10px] text-rose-400 font-sans font-semibold">Overdue</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-slate-300">
                      ${p.contractValue.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-cyan-400 font-semibold">
                      ${p.remainingBacklog.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-center font-sans">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              p.status === 'Completed'
                                ? 'bg-emerald-500'
                                : p.status === 'At Risk'
                                ? 'bg-rose-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${p.progressPercentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">
                          {p.progressPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-sans">
                      <span
                        className={`text-[11px] font-medium ${
                          p.status === 'Active'
                            ? 'text-blue-400'
                            : p.status === 'Completed'
                            ? 'text-emerald-400'
                            : p.status === 'At Risk'
                            ? 'text-rose-400 font-bold'
                            : 'text-amber-400'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-sans">
                      <span
                        className={`text-[10px] ${
                          p.deliveryRisk === 'Severe' || p.deliveryRisk === 'High'
                            ? 'text-rose-400 font-bold'
                            : p.deliveryRisk === 'Moderate'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {p.deliveryRisk}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenActionModal(p);
                        }}
                        className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                        title="Assign Follow-up Action"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 font-mono">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Operational Follow-Up Actions Registry */}
      <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
        <h2 className="text-sm font-semibold text-white mb-1">
          Operational Follow-Up Actions Register
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Tracking resolution of delivery bottlenecks, milestone blockers, and client steerco actions
        </p>

        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="px-3.5 py-2.5">Action ID</th>
                <th className="px-3.5 py-2.5">Project ID</th>
                <th className="px-3.5 py-2.5">Follow-Up Action Title</th>
                <th className="px-3.5 py-2.5">Assigned Owner</th>
                <th className="px-3.5 py-2.5">Due Date</th>
                <th className="px-3.5 py-2.5">Priority</th>
                <th className="px-3.5 py-2.5">Status</th>
                <th className="px-3.5 py-2.5 text-center">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {followUpActions.map((act) => (
                <tr key={act.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-3.5 py-2.5 text-blue-400">{act.id}</td>
                  <td className="px-3.5 py-2.5 text-slate-300">{act.projectId}</td>
                  <td className="px-3.5 py-2.5 font-sans font-medium text-slate-200">
                    {act.title}
                  </td>
                  <td className="px-3.5 py-2.5 font-sans text-slate-300">{act.assignedTo}</td>
                  <td className="px-3.5 py-2.5 text-slate-400">{act.dueDate}</td>
                  <td className="px-3.5 py-2.5 font-sans">
                    <span
                      className={`text-[10px] ${
                        act.priority === 'High' ? 'text-rose-400 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {act.priority}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 font-sans">
                    <span
                      className={`text-[10px] font-medium ${
                        act.status === 'Completed'
                          ? 'text-emerald-400'
                          : act.status === 'In Progress'
                          ? 'text-blue-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {act.status}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-center font-sans">
                    <select
                      value={act.status}
                      onChange={(e) => updateFollowUpStatus(act.id, e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] px-2 py-1 rounded focus:outline-none cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && !showActionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-blue-400">{selectedProject.id}</span>
                  <span className="text-xs text-slate-500">·</span>
                  <span className="text-xs text-slate-400">{selectedProject.department}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{selectedProject.name}</h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-slate-500 hover:text-slate-300 text-xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[11px]">Contract Value</span>
                <p className="font-mono text-slate-200 font-bold mt-1">
                  ${selectedProject.contractValue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[11px]">Revenue Recognized</span>
                <p className="font-mono text-emerald-400 font-bold mt-1">
                  ${selectedProject.revenueRecognized.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[11px]">Remaining Backlog</span>
                <p className="font-mono text-cyan-400 font-bold mt-1">
                  ${selectedProject.remainingBacklog.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[11px]">Budget Spent</span>
                <p className="font-mono text-slate-300 font-bold mt-1">
                  ${selectedProject.budgetSpent.toLocaleString()} / ${selectedProject.budget.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Engagement Lead / Project Manager:</span>
                <span className="font-medium text-slate-200">{selectedProject.projectManager}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Client Enterprise:</span>
                <span className="font-medium text-slate-200">{selectedProject.client}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Contract Timeline:</span>
                <span className="font-mono text-slate-300">
                  {selectedProject.startDate} &rarr; {selectedProject.expectedCompletionDate}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 items-center">
                <span>Operational Status:</span>
                <select
                  value={selectedProject.status}
                  onChange={(e) => updateProjectStatus(selectedProject.id, e.target.value as ProjectStatus)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded"
                >
                  <option value="Active">Active</option>
                  <option value="At Risk">At Risk</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Planned">Planned</option>
                </select>
              </div>
              {selectedProject.notes && (
                <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 mt-2">
                  <span className="text-slate-500 block mb-0.5">Engagement Notes & Exception Trail:</span>
                  <p className="text-slate-300 leading-relaxed">{selectedProject.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <button
                onClick={() => handleOpenActionModal(selectedProject)}
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Assign Action</span>
              </button>
              <button
                onClick={() => setSelectedProject(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Follow-Up Action Modal */}
      {showActionModal && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Assign Follow-Up Action</h3>
                <p className="text-xs text-slate-400">
                  Targeted mitigation action for {selectedProject.id}
                </p>
              </div>
              <button
                onClick={() => setShowActionModal(false)}
                className="text-slate-500 hover:text-slate-300 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateAction} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Action Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule client steering meeting on firewall access"
                  value={newActionTitle}
                  onChange={(e) => setNewActionTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Assigned Owner</label>
                <input
                  type="text"
                  required
                  value={newActionAssignee}
                  onChange={(e) => setNewActionAssignee(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newActionDueDate}
                    onChange={(e) => setNewActionDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Priority</label>
                  <select
                    value={newActionPriority}
                    onChange={(e) => setNewActionPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 cursor-pointer"
                >
                  Assign Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
