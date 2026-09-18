namespace EduFlow.Domain.Entities;

public class Submission
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AssignmentId { get; set; }
    public Assignment Assignment { get; set; } = null!;

    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;

    public string? Url { get; set; }
    public string? Text { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public int? Score { get; set; }
    public string? Feedback { get; set; }
}
