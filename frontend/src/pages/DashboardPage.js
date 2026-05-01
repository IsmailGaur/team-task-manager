import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardDocumentListIcon, CheckCircleIcon, ClockIcon,
  ExclamationCircleIcon, FolderIcon, UsersIcon, ArrowRightIcon
} from '@heroicons/react/24/outline';

const statusColors = {
  'Todo': 'badge-todo',
  'In Progress': 'badge-progress',
  'Done': 'badge-done',
};

const priorityColors = {
  'High': 'badge-high',
  'Medium': 'badge-medium',
  'Low': 'badge-low',
};

function StatCard({ icon: Icon, label, value, color, subtext }) {
  return (
    <div className="card hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-100 mb-1">{value ?? '—'}</p>
      <p className="text-sm font-medium text-slate-400">{label}</p>
      {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
    </div>
  );
}

function isOverdue(task) {
  return task.dueDate && task.status !== 'Done' && new Date(task.dueDate) < new Date();
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.get()
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentTasks = data?.recentTasks || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="text-brand-400">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-slate-400 mt-1">Here's what's happening with your team today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ClipboardDocumentListIcon}
          label="Total Tasks"
          value={stats.totalTasks}
          color="bg-slate-800 text-slate-400"
        />
        <StatCard
          icon={CheckCircleIcon}
          label="Completed"
          value={stats.completedTasks}
          color="bg-green-950 text-green-400"
          subtext={stats.totalTasks ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}% done` : null}
        />
        <StatCard
          icon={ClockIcon}
          label="In Progress"
          value={stats.inProgressTasks}
          color="bg-blue-950 text-blue-400"
        />
        <StatCard
          icon={ExclamationCircleIcon}
          label="Overdue"
          value={stats.overdueTasks}
          color={stats.overdueTasks > 0 ? "bg-red-950 text-red-400" : "bg-slate-800 text-slate-400"}
          subtext={stats.overdueTasks > 0 ? "Needs attention" : "All on track"}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={FolderIcon}
          label="Projects"
          value={stats.totalProjects}
          color="bg-purple-950 text-purple-400"
        />
        <StatCard
          icon={ClipboardDocumentListIcon}
          label="To Do"
          value={stats.todoTasks}
          color="bg-amber-950 text-amber-400"
        />
        {isAdmin && stats.memberCount != null && (
          <StatCard
            icon={UsersIcon}
            label="Team Members"
            value={stats.memberCount}
            color="bg-cyan-950 text-cyan-400"
          />
        )}
      </div>

      {/* Progress bar */}
      {stats.totalTasks > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Overall Progress</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-slate-800 rounded-full h-2.5">
              <div
                className="bg-brand-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-brand-400 w-10 text-right">
              {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
            </span>
          </div>
          <div className="flex gap-6 mt-3 text-xs text-slate-500">
            <span>{stats.completedTasks} completed</span>
            <span>{stats.pendingTasks} remaining</span>
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-200">Recent Activity</h3>
          <Link to="/tasks" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View all <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No tasks yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTasks.map(task => (
              <div key={task._id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-medium ${task.status === 'Done' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {task.title}
                    </p>
                    {isOverdue(task) && <span className="badge-overdue">Overdue</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-slate-500">{task.projectId?.title || 'No project'}</span>
                    {task.assignedTo && (
                      <span className="text-xs text-slate-500">· {task.assignedTo.name}</span>
                    )}
                    {task.dueDate && (
                      <span className="text-xs text-slate-500">· Due {new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={priorityColors[task.priority] || 'badge-low'}>{task.priority}</span>
                  <span className={statusColors[task.status] || 'badge-todo'}>{task.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
