using Microsoft.EntityFrameworkCore;
using TaskManager.API.Models;

namespace TaskManager.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<TaskItem> Tasks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasMany(e => e.Tasks)
                  .WithOne(e => e.User)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.Priority).HasConversion<string>();
        });
    }
}

public static class DbInitializer
{
    public static void Initialize(ApplicationDbContext context)
    {
        context.Database.EnsureCreated();

        // Check if data already exists
        if (context.Users.Any())
        {
            return;
        }

        // Seed demo user
        var demoUser = new User
        {
            Username = "demo",
            Email = "demo@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("demo123"),
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(demoUser);
        context.SaveChanges();

        // Seed demo tasks
        var demoTasks = new List<TaskItem>
        {
            new TaskItem
            {
                Title = "Complete project documentation",
                Description = "Write comprehensive documentation for the new feature",
                Status = TaskStatus.InProgress,
                Priority = TaskPriority.High,
                UserId = demoUser.Id,
                DueDate = DateTime.UtcNow.AddDays(3)
            },
            new TaskItem
            {
                Title = "Review pull requests",
                Description = "Review and approve pending pull requests",
                Status = TaskStatus.Todo,
                Priority = TaskPriority.Medium,
                UserId = demoUser.Id,
                DueDate = DateTime.UtcNow.AddDays(1)
            },
            new TaskItem
            {
                Title = "Setup CI/CD pipeline",
                Description = "Configure automated testing and deployment",
                Status = TaskStatus.Completed,
                Priority = TaskPriority.High,
                UserId = demoUser.Id,
                CompletedAt = DateTime.UtcNow.AddDays(-2)
            }
        };

        context.Tasks.AddRange(demoTasks);
        context.SaveChanges();
    }
}
