using EduFlow.Domain.Enums;

namespace EduFlow.Domain.Entities;

public class Lead
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public LeadSource Source { get; set; } = LeadSource.Instagram;
    public LeadStatus Status { get; set; } = LeadStatus.Interested;
    
    // Target Course of Interest
    public Guid? TargetCourseId { get; set; }
    public Course? TargetCourse { get; set; }

    // Multi-tenant Center
    public Guid? CenterId { get; set; }
    public LearningCenter? Center { get; set; }

    // CRM details & Notes
    public string? CourseOfInterest { get; set; }
    public string? Notes { get; set; }
    public DateTime? MeetingDate { get; set; }
    public DateTime? DemoLessonDate { get; set; }
    public decimal? EstimatedBudget { get; set; }

    // Conversion to Student
    public Guid? ConvertedStudentId { get; set; }
    public User? ConvertedStudent { get; set; }
    public DateTime? ConvertedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
