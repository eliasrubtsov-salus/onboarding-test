import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tasksAPI } from '../services/api';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import TaskStats from '../components/TaskStats';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadTasks();
    loadStats();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await tasksAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await tasksAPI.createTask(taskData);
      loadTasks();
      loadStats();
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      await tasksAPI.updateTask(editingTask.id, taskData);
      loadTasks();
      loadStats();
      setEditingTask(null);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to update task:', error);
      alert('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await tasksAPI.deleteTask(taskId);
      loadTasks();
      loadStats();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'All') return true;
    return task.status === filter;
  });

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>📋 Task Manager</h1>
          <div className="header-actions">
            <span className="user-name">Welcome, {user?.username}!</span>
            <button onClick={logout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-container">
          {stats && <TaskStats stats={stats} />}

          <div className="tasks-section">
            <div className="tasks-header">
              <h2>Your Tasks</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn btn-primary"
              >
                {showForm ? 'Cancel' : '+ New Task'}
              </button>
            </div>

            {showForm && (
              <TaskForm
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                onCancel={handleCancelForm}
                initialData={editingTask}
              />
            )}

            <div className="filter-tabs">
              {['All', 'Todo', 'InProgress', 'Completed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`filter-tab ${filter === status ? 'active' : ''}`}
                >
                  {status === 'InProgress' ? 'In Progress' : status}
                </button>
              ))}
            </div>

            <TaskList
              tasks={filteredTasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
