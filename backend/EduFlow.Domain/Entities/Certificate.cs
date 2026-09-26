namespace EduFlow.Domain.Entities;

public class Certificate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string CertificateCode { get; set; } = string.Empty; // masalan: "EDF-2026-9812A"
    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;

    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public Guid? CenterId { get; set; }
    public LearningCenter? Center { get; set; }

    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    public int FinalScore { get; set; }
    public string GradeLetter { get; set; } = "A";
    public string VerificationUrl { get; set; } = string.Empty;
}
