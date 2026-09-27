import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  FolderGit2,
  Users,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  X,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { projects, employees, opportunities, dataQualityIssues, setActiveTab, setSelectedProject } =
    useApp();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedProjects = q
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const matchedEmployees = q
    ? employees.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const matchedOpps = q
    ? opportunities.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.client.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const matchedIssues = q
    ? dataQualityIssues.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.errorType.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const hasResults =
    matchedProjects.length > 0 ||
    matchedEmployees.length > 0 ||
    matchedOpps.length > 0 ||
    matchedIssues.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden text-xs">
        {/* Search Input Bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 bg-slate-950">
          <Search className="w-4 h-4 text-blue-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type to search across projects, clients, employees, pipeline..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 text-xs focus:outline-none"
          />
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {!q && (
            <div className="p-6 text-center text-slate-500">
              Type project IDs (e.g. <span className="font-mono text-blue-400">PRJ-0003</span>), client names, or consultant staff.
            </div>
          )}

          {q && !hasResults && (
            <div className="p-6 text-center text-slate-500">
              No matching operational records found for &quot;{query}&quot;.
            </div>
          )}

          {matchedProjects.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 px-2">
                Projects & Engagements
              </span>
              <div className="space-y-1">
                {matchedProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveTab('projects');
                      setSelectedProject(p);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
                      <div>
                        <div className="font-medium text-slate-200 group-hover:text-white">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {p.id} · {p.client} · ${p.contractValue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedEmployees.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 px-2">
                Consulting Staff & Practitioners
              </span>
              <div className="space-y-1">
                {matchedEmployees.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      setActiveTab('resources');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <div>
                        <div className="font-medium text-slate-200 group-hover:text-white">
                          {e.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {e.id} · {e.role} · {e.department}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedOpps.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 px-2">
                Sales Pipeline Opportunities
              </span>
              <div className="space-y-1">
                {matchedOpps.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setActiveTab('revenue');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                      <div>
                        <div className="font-medium text-slate-200 group-hover:text-white">
                          {o.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {o.id} · {o.stage} ({o.probability}%) · ${o.estimatedValue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-purple-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedIssues.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 px-2">
                Data Quality Exceptions
              </span>
              <div className="space-y-1">
                {matchedIssues.map((iss) => (
                  <button
                    key={iss.id}
                    onClick={() => {
                      setActiveTab('dataquality');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 text-left transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <div>
                        <div className="font-medium text-slate-200 group-hover:text-white">
                          {iss.errorType} ({iss.recordId})
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-sm">
                          {iss.description}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
