import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { projectService, taskService, userService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  PlusIcon, TrashIcon, UserPlusIcon, XMarkIcon,
  ArrowLeftIcon, ClipboardDocumentListIcon, ExclamationCircleIcon
} from '@heroicons/react/24/outline';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="font-semibold text-slate-100">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const STATUS_OPTIONS = ['Todo', 'In Progress', 'Done'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

const statusClass = { 'Todo': 'badge-todo', 'In Progress': 'badge-progress', 'Done': 'badge-done' };
const priorityClass = { 'High': 'badge-high', 'Medium': 'badge-medium', 'Low': 'badge-low' };

function isOverdue(task) {
  return task.dueDate && task.status !== 'Done' && new Date(task.dueDate) < new Date();
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [taskFilter, setTaskFilter] = useState('All');
  const [submitting, setSubmitting] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: '', description: '', assignedTo: '',
    status: 'Todo', priority: 'Medium', dueDate: ''
  });

  const fetchData = useCallback(async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        projectService.getOne(id),
        taskService.getByProject(id),
      ]);
      setProject(projRes.data.data);
      setTasks(tasksRes.data.data);
    } catch {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
    if (isAdmin) {
      userService.getAll().then(res => setAllUsers(res.data.data)).catch(() => {});
    }
  }, [fetchData, isAdmin]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return toast.error('Title is required');
    setSubmitting(true);
    try {
      await taskService.create({ ...taskForm, projectId: id, assignedTo: taskForm.assignedTo || undefined });
      toast.success('Task created!');
      setShowAddTask(false);
      setTaskForm({ title: '', description: '', assignedTo: '', status: 'Todo', priority: 'Medium', dueDate: '' });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally { setSubmitting(false); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await taskService.updateStatus(taskId, newStatus);
      setTasks(prev => prev.map(t => t._id === taskId ? res.data.data : t));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  const handleAddMember = async (userId) => {
    try {
      await projectService.addMember(id, userId);
      toast.success('Member added');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add member'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await projectService.removeMember(id, userId);
      toast.success('Member removed');
      fetchData();
    } catch { toast.error('Failed to remove member'); }
  };

  const filteredTasks = taskFilter === 'All' ? tasks : tasks.filter(t => t.status === taskFilter);
  const nonMembers = allUsers.filter(u => !project?.teamMembers?.some(m => m._id === u._id));

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!project) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4 transition-colors">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Projects
        </button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{project.title}</h1>
            {project.description && <p className="text-slate-400 mt-1">{project.description}</p>}
            <p className="text-xs text-slate-500 mt-2">Created by {project.createdBy?.name} · {new Date(project.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {isAdmin && (
              <>
                <button onClick={() => setShowAddMember(true)} className="btn-secondary flex items-center gap-2 text-sm py-2">
                  <UserPlusIcon className="w-4 h-4" /> Manage Members
                </button>
                <button onClick={() => setShowAddTask(true)} className="btn-primary flex items-center gap-2 text-sm py-2">
                  <PlusIcon className="w-4 h-4" /> Add Task
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Team Members */}
      {project.teamMembers?.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Team Members ({project.teamMembers.length})</h3>
          <div className="flex flex-wrap gap-2">
            {project.teamMembers.map(m => (
              <div key={m._id} className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-400 uppercase">
                  {m.name?.charAt(0)}
                </div>
                <span className="text-sm text-slate-300">{m.name}</span>
                <span className="text-xs text-slate-500">({m.role})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="font-semibold text-slate-200">
            Tasks <span className="text-slate-500 font-normal">({filteredTasks.length})</span>
          </h3>
          <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
            {['All', ...STATUS_OPTIONS].map(s => (
              <button key={s} onClick={() => setTaskFilter(s)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${taskFilter === s ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >{s}</button>
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-10">
            <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-2 text-slate-700" />
            <p className="text-slate-500">{tasks.length === 0 ? 'No tasks yet' : 'No tasks match this filter'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map(task => {
              const canEdit = isAdmin || (task.assignedTo?._id === user?._id);
              const overdue = isOverdue(task);
              return (
                <div key={task._id} className={`p-4 rounded-lg border transition-colors group ${overdue ? 'bg-red-950/20 border-red-900/50' : 'bg-slate-800/50 border-slate-800 hover:border-slate-700'}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className={`text-sm font-medium ${task.status === 'Done' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {task.title}
                        </p>
                        {overdue && <ExclamationCircleIcon className="w-4 h-4 text-red-400" title="Overdue" />}
                      </div>
                      {task.description && <p className="text-xs text-slate-500 mb-2 line-clamp-2">{task.description}</p>}
                      <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
                        {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                        {task.dueDate && (
                          <span className={overdue ? 'text-red-400 font-medium' : ''}>
                            📅 {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={priorityClass[task.priority] || 'badge-low'}>{task.priority}</span>
                      {canEdit ? (
                        <select
                          value={task.status}
                          onChange={e => handleStatusChange(task._id, e.target.value)}
                          className="text-xs bg-slate-700 border border-slate-600 text-slate-200 rounded px-2 py-1 focus:outline-none focus:border-brand-500"
                        >
                          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      ) : (
                        <span className={statusClass[task.status] || 'badge-todo'}>{task.status}</span>
                      )}
                      {isAdmin && (
                        <button onClick={() => handleDeleteTask(task._id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all ml-1">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <Modal title="Create Task" onClose={() => setShowAddTask(false)}>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="label">Title *</label>
              <input type="text" value={taskForm.title} onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))} placeholder="Task title" className="input-field" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea value={taskForm.description} onChange={e => setTaskForm(p => ({ ...p, description: e.target.value }))} rows={2} className="input-field resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Priority</label>
                <select value={taskForm.priority} onChange={e => setTaskForm(p => ({ ...p, priority: e.target.value }))} className="input-field">
                  {PRIORITY_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select value={taskForm.status} onChange={e => setTaskForm(p => ({ ...p, status: e.target.value }))} className="input-field">
                  {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Assign To</label>
              <select value={taskForm.assignedTo} onChange={e => setTaskForm(p => ({ ...p, assignedTo: e.target.value }))} className="input-field">
                <option value="">Unassigned</option>
                {project.teamMembers?.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm(p => ({ ...p, dueDate: e.target.value }))} className="input-field" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowAddTask(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary flex-1">{submitting ? 'Creating...' : 'Create Task'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Manage Members Modal */}
      {showAddMember && (
        <Modal title="Manage Team Members" onClose={() => setShowAddMember(false)}>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Current Members</p>
              {project.teamMembers?.length === 0 ? (
                <p className="text-sm text-slate-500">No members yet</p>
              ) : (
                <div className="space-y-2">
                  {project.teamMembers.map(m => (
                    <div key={m._id} className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400 uppercase">{m.name?.charAt(0)}</div>
                        <span className="text-sm text-slate-300">{m.name}</span>
                        <span className="text-xs text-slate-500">({m.role})</span>
                      </div>
                      <button onClick={() => handleRemoveMember(m._id)} className="text-slate-600 hover:text-red-400 transition-colors">
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {nonMembers.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Add Members</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {nonMembers.map(u => (
                    <div key={u._id} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 uppercase">{u.name?.charAt(0)}</div>
                        <span className="text-sm text-slate-300">{u.name}</span>
                        <span className="text-xs text-slate-500">({u.role})</span>
                      </div>
                      <button onClick={() => handleAddMember(u._id)} className="text-brand-400 hover:text-brand-300 text-xs font-medium transition-colors flex items-center gap-1">
                        <UserPlusIcon className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => setShowAddMember(false)} className="btn-secondary w-full">Done</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
