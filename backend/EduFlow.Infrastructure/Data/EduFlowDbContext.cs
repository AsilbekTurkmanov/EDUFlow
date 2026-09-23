using EduFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EduFlow.Infrastructure.Data;

public class EduFlowDbContext : DbContext
{
    public EduFlowDbContext(DbContextOptions<EduFlowDbContext> options) : base(options)
    {
    }

    public DbSet<LearningCenter> LearningCenters => Set<LearningCenter>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();
    public DbSet<Lesson> Lessons => Set<Lesson>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<Submission> Submissions => Set<Submission>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // LearningCenter
        modelBuilder.Entity<LearningCenter>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Phone).HasMaxLength(50);
            entity.Property(e => e.Address).HasMaxLength(300);
            entity.Property(e => e.TariffPlan).HasConversion<string>();
            entity.Property(e => e.Status).HasConversion<string>();
            entity.Property(e => e.MonthlySubscriptionPrice).HasPrecision(18, 2);

            entity.HasMany(c => c.Users)
                .WithOne(u => u.Center)
                .HasForeignKey(u => u.CenterId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasMany(c => c.Courses)
                .WithOne(cr => cr.Center)
                .HasForeignKey(cr => cr.CenterId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(c => c.Groups)
                .WithOne(g => g.Center)
                .HasForeignKey(g => g.CenterId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.FullName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Username).HasMaxLength(100);
            entity.Property(e => e.ParentPhone).HasMaxLength(50);
            entity.Property(e => e.Role).HasConversion<string>();
            entity.Property(e => e.Status).HasConversion<string>();
        });

        // Course
        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Price).HasPrecision(18, 2);
            entity.Property(e => e.Status).HasConversion<string>();
        });

        // Group
        modelBuilder.Entity<Group>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Color).HasMaxLength(30);
            entity.Property(e => e.Status).HasConversion<string>();

            entity.HasOne(e => e.Course)
                .WithMany(c => c.Groups)
                .HasForeignKey(e => e.CourseId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Teacher)
                .WithMany(u => u.TeachingGroups)
                .HasForeignKey(e => e.TeacherId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Enrollment
        modelBuilder.Entity<Enrollment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.GroupId, e.StudentId }).IsUnique();
            entity.Property(e => e.Status).HasConversion<string>();

            entity.HasOne(e => e.Group)
                .WithMany(g => g.Enrollments)
                .HasForeignKey(e => e.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Student)
                .WithMany(u => u.Enrollments)
                .HasForeignKey(e => e.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Lesson
        modelBuilder.Entity<Lesson>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.GroupId);
            entity.HasIndex(e => e.StartsAt);
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Room).HasMaxLength(100);

            entity.HasOne(e => e.Group)
                .WithMany(g => g.Lessons)
                .HasForeignKey(e => e.GroupId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Attendance
        modelBuilder.Entity<Attendance>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.LessonId, e.StudentId }).IsUnique();
            entity.Property(e => e.Status).HasConversion<string>();

            entity.HasOne(e => e.Lesson)
                .WithMany(l => l.Attendances)
                .HasForeignKey(e => e.LessonId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Student)
                .WithMany(u => u.Attendances)
                .HasForeignKey(e => e.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Assignment
        modelBuilder.Entity<Assignment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.GroupId);
            entity.HasIndex(e => e.Deadline);
            entity.Property(e => e.Title).HasMaxLength(200).IsRequired();

            entity.HasOne(e => e.Group)
                .WithMany(g => g.Assignments)
                .HasForeignKey(e => e.GroupId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Submission
        modelBuilder.Entity<Submission>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.AssignmentId, e.StudentId }).IsUnique();

            entity.HasOne(e => e.Assignment)
                .WithMany(a => a.Submissions)
                .HasForeignKey(e => e.AssignmentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Student)
                .WithMany(u => u.Submissions)
                .HasForeignKey(e => e.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Payment
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.StudentId);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.Property(e => e.Method).HasConversion<string>();
            entity.Property(e => e.Status).HasConversion<string>();

            entity.HasOne(e => e.Student)
                .WithMany(u => u.Payments)
                .HasForeignKey(e => e.StudentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // AuditLog
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CreatedAt);
            entity.Property(e => e.Action).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Entity).HasMaxLength(100).IsRequired();

            entity.HasOne(e => e.User)
                .WithMany(u => u.AuditLogs)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
