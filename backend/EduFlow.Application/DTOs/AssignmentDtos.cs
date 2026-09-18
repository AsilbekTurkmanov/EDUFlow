namespace EduFlow.Application.DTOs;

public class AssignmentDto
{
    public Guid Id { get; set; }
    public Guid GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Deadline { get; set; }
    public int MaxScore { get; set; }
    public DateTime CreatedAt { get; set; }
    public int SubmissionsCount { get; set; }
    public bool IsPassedDeadline => DateTime.UtcNow > Deadline;
}

public class CreateAssignmentDto
{
    public Guid GroupId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime Deadline { get; set; }
    public int MaxScore { get; set; } = 100;
}

public class SubmissionDto
{
    public Guid Id { get; set; }
    public Guid AssignmentId { get; set; }
    public string AssignmentTitle { get; set; } = string.Empty;
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string? Url { get; set; }
    public string? Text { get; set; }
    public DateTime SubmittedAt { get; set; }
    public int? Score { get; set; }
    public string? Feedback { get; set; }
    public int MaxScore { get; set; }
}

public class SubmitAssignmentDto
{
    public Guid AssignmentId { get; set; }
    public string? Url { get; set; }
    public string? Text { get; set; }
}

public class GradeSubmissionDto
{
    public int Score { get; set; }
    public string? Feedback { get; set; }
}
