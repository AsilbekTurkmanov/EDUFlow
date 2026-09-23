using EduFlow.Domain.Enums;

namespace EduFlow.Application.DTOs;

public class LeadDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public LeadSource Source { get; set; }
    public string SourceName { get; set; } = string.Empty;
    public LeadStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public Guid? TargetCourseId { get; set; }
    public string? TargetCourseName { get; set; }
    public string? CourseOfInterest { get; set; }
    public Guid? CenterId { get; set; }
    public string? CenterName { get; set; }
    public string? Notes { get; set; }
    public DateTime? MeetingDate { get; set; }
    public DateTime? DemoLessonDate { get; set; }
    public decimal? EstimatedBudget { get; set; }
    public Guid? ConvertedStudentId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateLeadDto
{
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public LeadSource Source { get; set; } = LeadSource.Instagram;
    public LeadStatus Status { get; set; } = LeadStatus.Interested;
    public Guid? TargetCourseId { get; set; }
    public string? CourseOfInterest { get; set; }
    public Guid? CenterId { get; set; }
    public string? Notes { get; set; }
    public DateTime? MeetingDate { get; set; }
    public DateTime? DemoLessonDate { get; set; }
    public decimal? EstimatedBudget { get; set; }
}

public class UpdateLeadDto
{
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public LeadSource Source { get; set; }
    public LeadStatus Status { get; set; }
    public Guid? TargetCourseId { get; set; }
    public string? CourseOfInterest { get; set; }
    public string? Notes { get; set; }
    public DateTime? MeetingDate { get; set; }
    public DateTime? DemoLessonDate { get; set; }
    public decimal? EstimatedBudget { get; set; }
}

public class UpdateLeadStatusDto
{
    public LeadStatus Status { get; set; }
    public string? Notes { get; set; }
}

public class ConvertLeadDto
{
    public Guid? GroupId { get; set; }
    public decimal InitialPaymentAmount { get; set; } = 800000m;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Card;
    public string? ParentPhone { get; set; }
    public string? Password { get; set; } = "+998991992012";
}

public class LeadSummaryStatsDto
{
    public int TotalLeads { get; set; }
    public int InterestedCount { get; set; }
    public int ContactedCount { get; set; }
    public int MeetingScheduledCount { get; set; }
    public int DemoAttendedCount { get; set; }
    public int ConvertedCount { get; set; }
    public int LostCount { get; set; }
    public double ConversionRatePercentage { get; set; }
    public decimal EstimatedTotalPipelineValue { get; set; }
}
