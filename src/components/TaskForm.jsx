import React, { useState, useEffect } from 'react';
import './TaskForm.css';

function TaskForm({ onSubmit, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium',
    dueDate: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        status: initialData.status,
        priority: initialData.priority,
        dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate || null,
    });
  };

  return (
    <div className="task-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
            >
              <option value="Todo">To Do</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {initialData ? 'Update Task' : 'Create Task'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskForm;
