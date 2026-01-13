using Microsoft.EntityFrameworkCore;
using TaskManager.API.Data;
using TaskManager.API.DTOs;
using TaskManager.API.Models;

namespace TaskManager.API.Services;

public interface ITaskService
{
    Task<List<TaskDto>> GetUserTasksAsync(int userId);
    Task<TaskDto?> GetTaskByIdAsync(int taskId, int userId);
    Task<TaskDto> CreateTaskAsync(CreateTaskRequest request, int userId);
    Task<TaskDto?> UpdateTaskAsync(int taskId, UpdateTaskRequest request, int userId);
    Task<bool> DeleteTaskAsync(int taskId, int userId);
    Task<TaskStatsDto> GetTaskStatsAsync(int userId);
}

public class TaskService : ITaskService
{
    private readonly ApplicationDbContext _context;

    public TaskService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<TaskDto>> GetUserTasksAsync(int userId)
    {
        var tasks = await _context.Tasks
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return tasks.Select(MapToDto).ToList();
    }

    public async Task<TaskDto?> GetTaskByIdAsync(int taskId, int userId)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);

        return task != null ? MapToDto(task) : null;
    }

    public async Task<TaskDto> CreateTaskAsync(CreateTaskRequest request, int userId)
    {
        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            Status = Enum.Parse<TaskStatus>(request.Status),
            Priority = Enum.Parse<TaskPriority>(request.Priority),
            DueDate = request.DueDate,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return MapToDto(task);
    }

    public async Task<TaskDto?> UpdateTaskAsync(int taskId, UpdateTaskRequest request, int userId)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);

        if (task == null)
            return null;

        task.Title = request.Title;
        task.Description = request.Description;
        task.Status = Enum.Parse<TaskStatus>(request.Status);
        task.Priority = Enum.Parse<TaskPriority>(request.Priority);
        task.DueDate = request.DueDate;

        // Set completion timestamp if status changed to completed
        if (task.Status == TaskStatus.Completed && task.CompletedAt == null)
        {
            task.CompletedAt = DateTime.UtcNow;
        }
        else if (task.Status != TaskStatus.Completed)
        {
            task.CompletedAt = null;
        }

        await _context.SaveChangesAsync();

        return MapToDto(task);
    }

    public async Task<bool> DeleteTaskAsync(int taskId, int userId)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);

        if (task == null)
            return false;

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<TaskStatsDto> GetTaskStatsAsync(int userId)
    {
        var tasks = await _context.Tasks
            .Where(t => t.UserId == userId)
            .ToListAsync();

        var stats = new TaskStatsDto(
            TotalTasks: tasks.Count,
            TodoTasks: tasks.Count(t => t.Status == TaskStatus.Todo),
            InProgressTasks: tasks.Count(t => t.Status == TaskStatus.InProgress),
            CompletedTasks: tasks.Count(t => t.Status == TaskStatus.Completed),
            OverdueTasks: tasks.Count(t => t.DueDate.HasValue && t.DueDate < DateTime.UtcNow && t.Status != TaskStatus.Completed)
        );

        return stats;
    }

    private static TaskDto MapToDto(TaskItem task)
    {
        return new TaskDto(
            task.Id,
            task.Title,
            task.Description,
            task.Status.ToString(),
            task.Priority.ToString(),
            task.CreatedAt,
            task.DueDate,
            task.CompletedAt,
            task.UserId
        );
    }
}
