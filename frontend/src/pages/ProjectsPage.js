import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { projectService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  PlusIcon, FolderIcon, TrashIcon, UserPlusIcon,
  ArrowRightIcon, UsersIcon, CalendarIcon
} from '@heroicons/react/24/outline';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="font-semibold text-slate-100">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await projectService.getAll();
      setProjects(res.data.data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchProjects();
    if (isAdmin) {
      userService.getAll().then(res => setUsers(res.data.data)).catch(() => {});
    }
  }, [isAdmin]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    setSubmitting(true);
    try {
      await projectService.create(form);
      toast.success('Project created!');
      setShowCreate(false);
      setForm({ title: '', description: '' });
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await projectService.delete(id);
      toast.success('Project deleted');
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch { toast.error('Failed to delete project'); }
  };

  const statusColor = {
    Active: 'text-green-400 bg-green-950 border-green-800',
    Completed: 'text-blue-400 bg-blue-950 border-blue-800',
    'On Hold': 'text-amber-400 bg-amber-950 border-amber-800',
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Projects</h1>
          <p className="text-slate-400 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="card text-center py-16">
          <FolderIcon className="w-16 h-16 mx-auto mb-4 text-slate-700" />
          <p className="text-slate-400 mb-2">No projects yet</p>
          {isAdmin && (
            <button onClick={() => setShowCreate(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
              <PlusIcon className="w-4 h-4" /> Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <div key={project._id} className="card hover:border-slate-700 transition-all group flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-brand-500/15 border border-brand-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FolderIcon className="w-5 h-5 text-brand-400" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded border ${statusColor[project.status] || statusColor.Active}`}>
                    {project.status}
                  </span>
                  {isAdmin && (
                    <button onClick={() => handleDelete(project._id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="font-semibold text-slate-100 mb-2 leading-tight">{project.title}</h3>
              {project.description && (
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{project.description}</p>
              )}

              <div className="mt-auto space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <UsersIcon className="w-3.5 h-3.5" />
                  <span>{project.teamMembers?.length || 0} member{project.teamMembers?.length !== 1 ? 's' : ''}</span>
                  <span className="mx-1">·</span>
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Member avatars */}
                {project.teamMembers?.length > 0 && (
                  <div className="flex items-center gap-1">
                    {project.teamMembers.slice(0, 4).map(m => (
                      <div key={m._id} title={m.name} className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-semibold text-slate-300 uppercase">
                        {m.name?.charAt(0)}
                      </div>
                    ))}
                    {project.teamMembers.length > 4 && (
                      <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs text-slate-400">
                        +{project.teamMembers.length - 4}
                      </div>
                    )}
                  </div>
                )}

                <Link to={`/projects/${project._id}`} className="flex items-center gap-1.5 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors">
                  View project <ArrowRightIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Create New Project" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Project Title *</label>
              <input
                type="text" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g., Website Redesign"
                className="input-field"
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="What is this project about?"
                rows={3} className="input-field resize-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
