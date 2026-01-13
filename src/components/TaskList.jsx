import React from 'react';
import { format } from 'date-fns';
import './TaskList.css';

function TaskList({ tasks, onEdit, onDelete }) {
  const getPriorityColor = (priority) => {
    const colors = {
      Low: '#10b981',
      Medium: '#f59e0b',
      High: '#ef4444',
      Urgent: '#dc2626',
    };
    return colors[priority] || '#666';
  };

  const getStatusBadge = (status) => {
    const badges = {
      Todo: { bg: '#fef3c7', color: '#92400e', text: 'To Do' },
      InProgress: { bg: '#dbeafe', color: '#1e40af', text: 'In Progress' },
      Completed: { bg: '#d1fae5', color: '#065f46', text: 'Completed' },
    };
    return badges[status] || badges.Todo;
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'Completed') return false;
    return new Date(dueDate) < new Date();
  };

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <p>No tasks found</p>
        <p style={{ fontSize: '14px', color: '#999' }}>
          Create a new task to get started
        </p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => {
        const statusBadge = getStatusBadge(task.status);
        const overdue = isOverdue(task.dueDate, task.status);

        return (
          <div key={task.id} className="task-card">
            <div className="task-header">
              <h3 className="task-title">{task.title}</h3>
              <div className="task-actions">
                <button
                  onClick={() => onEdit(task)}
                  className="task-action-btn edit-btn"
                  title="Edit task"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="task-action-btn delete-btn"
                  title="Delete task"
                >
                  🗑️
                </button>
              </div>
            </div>

            {task.description && (
              <p className="task-description">{task.description}</p>
            )}

            <div className="task-meta">
              <span
                className="task-badge"
                style={{
                  backgroundColor: statusBadge.bg,
                  color: statusBadge.color,
                }}
              >
                {statusBadge.text}
              </span>

              <span
                className="task-priority"
                style={{ color: getPriorityColor(task.priority) }}
              >
                {task.priority}
              </span>

              {task.dueDate && (
                <span className={`task-due-date ${overdue ? 'overdue' : ''}`}>
                  📅 {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                  {overdue && ' (Overdue)'}
                </span>
              )}
            </div>

            <div className="task-footer">
              <span className="task-created">
                Created: {format(new Date(task.createdAt), 'MMM dd, yyyy')}
              </span>
              {task.completedAt && (
                <span className="task-completed">
                  ✅ Completed: {format(new Date(task.completedAt), 'MMM dd, yyyy')}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TaskList;
