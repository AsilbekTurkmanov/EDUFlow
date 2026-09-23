using EduFlow.Domain.Enums;

namespace EduFlow.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; } = UserStatus.Active;
    public string? Username { get; set; }
    public string? Phone { get; set; }
    public string? ParentPhone { get; set; }
    public int ExperienceYears { get; set; } = 0;
    
    // Teacher Compensation & Revenue Share Configuration
    public TeacherCompensationType CompensationType { get; set; } = TeacherCompensationType.Percentage;
    public int? CustomSharePercentage { get; set; } // Custom percentage set by center leader (e.g. 65%)
    public decimal? FixedAmount { get; set; } // Fixed amount in UZS (e.g. 400,000 UZS per student or 8,000,000 UZS/month)

    public Guid? CenterId { get; set; }
    public LearningCenter? Center { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<Group> TeachingGroups { get; set; } = new List<Group>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    public ICollection<Submission> Submissions { get; set; } = new List<Submission>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}
