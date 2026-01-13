import React from 'react';
import './TaskStats.css';

function TaskStats({ stats }) {
  const statCards = [
    { label: 'Total Tasks', value: stats.totalTasks, icon: '📊', color: '#667eea' },
    { label: 'To Do', value: stats.todoTasks, icon: '📝', color: '#f59e0b' },
    { label: 'In Progress', value: stats.inProgressTasks, icon: '⚡', color: '#3b82f6' },
    { label: 'Completed', value: stats.completedTasks, icon: '✅', color: '#10b981' },
    { label: 'Overdue', value: stats.overdueTasks, icon: '⚠️', color: '#ef4444' },
  ];

  return (
    <div className="task-stats">
      {statCards.map((stat, index) => (
        <div key={index} className="stat-card" style={{ borderTopColor: stat.color }}>
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-content">
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskStats;
