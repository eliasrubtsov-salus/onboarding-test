namespace TaskManager.API.DTOs;

// Auth DTOs
public record RegisterRequest(string Username, string Email, string Password);
public record LoginRequest(string Username, string Password);
public record AuthResponse(string Token, UserDto User);

// User DTOs
public record UserDto(int Id, string Username, string Email, DateTime CreatedAt);

// Task DTOs
public record TaskDto(
    int Id,
    string Title,
    string Description,
    string Status,
    string Priority,
    DateTime CreatedAt,
    DateTime? DueDate,
    DateTime? CompletedAt,
    int UserId
);

public record CreateTaskRequest(
    string Title,
    string Description,
    string Status,
    string Priority,
    DateTime? DueDate
);

public record UpdateTaskRequest(
    string Title,
    string Description,
    string Status,
    string Priority,
    DateTime? DueDate
);

public record TaskStatsDto(
    int TotalTasks,
    int TodoTasks,
    int InProgressTasks,
    int CompletedTasks,
    int OverdueTasks
);
