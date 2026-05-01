import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { taskService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardDocumentListIcon, ExclamationCircleIcon,
  ArrowRightIcon, FunnelIcon
} from '@heroicons/react/24/outline';

const STATUS_OPTIONS = ['Todo', 'In Progress', 'Done'];
const statusClass = { 'Todo': 'badge-todo', 'In Progress': 'badge-progress', 'Done': 'badge-done' };
const priorityClass = { 'High': 'badge-high', 'Medium': 'badge-medium', 'Low': 'badge-low' };

function isOverdue(task) {
  return task.dueDate && task.status !== 'Done' && new Date(task.dueDate) < new Date();
}

export default function TasksPage() {
  const { isAdmin, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const fetchTasks = async () => {
    try {
      const res = isAdmin
        ? await taskService.getAll()
        : await taskService.getMy();
      setTasks(res.data.data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, [isAdmin]);

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

  const filtered = tasks.filter(t => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    return true;
  });

  // Group by status for kanban-like view
  const todoCount = tasks.filter(t => t.status === 'Todo').length;
  const progressCount = tasks.filter(t => t.status === 'In Progress').length;
  const doneCount = tasks.filter(t => t.status === 'Done').length;
  const overdueCount = tasks.filter(t => isOverdue(t)).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">{isAdmin ? 'All Tasks' : 'My Tasks'}</h1>
        <p className="text-slate-400 mt-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'To Do', count: todoCount, cls: 'text-slate-400' },
          { label: 'In Progress', count: progressCount, cls: 'text-blue-400' },
          { label: 'Done', count: doneCount, cls: 'text-green-400' },
          { label: 'Overdue', count: overdueCount, cls: 'text-red-400' },
        ].map(({ label, count, cls }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${cls}`}>{count}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-400">Filter:</span>
        </div>
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {['All', ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${statusFilter === s ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >{s}</button>
          ))}
        </div>
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {['All', 'High', 'Medium', 'Low'].map(p => (
            <button key={p} onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${priorityFilter === p ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >{p}</button>
          ))}
        </div>
        {(statusFilter !== 'All' || priorityFilter !== 'All') && (
          <button onClick={() => { setStatusFilter('All'); setPriorityFilter('All'); }}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors">
            Clear filters
          </button>
        )}
      </div>

      {/* Task List */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <ClipboardDocumentListIcon className="w-16 h-16 mx-auto mb-4 text-slate-700" />
          <p className="text-slate-400">{tasks.length === 0 ? 'No tasks assigned to you' : 'No tasks match your filters'}</p>
          {tasks.length === 0 && (
            <p className="text-sm text-slate-500 mt-2">
              Ask an Admin to assign you to projects and tasks
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => {
            const canEdit = isAdmin || (task.assignedTo?._id === user?._id);
            const overdue = isOverdue(task);
            return (
              <div key={task._id} className={`card p-4 hover:border-slate-700 transition-all group ${overdue && task.status !== 'Done' ? 'border-red-900/50 bg-red-950/10' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <h4 className={`font-medium ${task.status === 'Done' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {task.title}
                      </h4>
                      {overdue && task.status !== 'Done' && (
                        <span className="badge-overdue flex items-center gap-1">
                          <ExclamationCircleIcon className="w-3 h-3" /> Overdue
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-sm text-slate-400 mb-2 line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 flex-wrap text-xs text-slate-500">
                      {task.projectId && (
                        <Link to={`/projects/${task.projectId._id}`} className="flex items-center gap-1 text-brand-400 hover:text-brand-300 transition-colors">
                          <span>{task.projectId.title}</span>
                          <ArrowRightIcon className="w-3 h-3" />
                        </Link>
                      )}
                      {isAdmin && task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                      {task.dueDate && (
                        <span className={overdue && task.status !== 'Done' ? 'text-red-400 font-medium' : ''}>
                          📅 {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-slate-600">
                        Created {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                    <span className={priorityClass[task.priority] || 'badge-low'}>{task.priority}</span>

                    {canEdit ? (
                      <select
                        value={task.status}
                        onChange={e => handleStatusChange(task._id, e.target.value)}
                        className="text-xs bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-500 cursor-pointer"
                      >
                        {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    ) : (
                      <span className={statusClass[task.status] || 'badge-todo'}>{task.status}</span>
                    )}

                    {isAdmin && (
                      <button onClick={() => handleDeleteTask(task._id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1 rounded hover:bg-red-950/30">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
  );
}
