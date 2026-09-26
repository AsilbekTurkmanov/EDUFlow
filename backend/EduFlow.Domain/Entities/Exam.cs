using EduFlow.Domain.Enums;

namespace EduFlow.Domain.Entities;

public class Exam
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GroupId { get; set; }
    public Group Group { get; set; } = null!;

    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public string Title { get; set; } = string.Empty; // "Midterm Exam 1", "Final Project Defense"
    public DateTime ExamDate { get; set; }
    public int MaxScore { get; set; } = 100;
    public int PassingScore { get; set; } = 60;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ExamResult> Results { get; set; } = new List<ExamResult>();
}

public class ExamResult
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ExamId { get; set; }
    public Exam Exam { get; set; } = null!;

    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;

    public int Score { get; set; }
    public ExamGrade Grade { get; set; } = ExamGrade.A;
    public string? TeacherFeedback { get; set; }
    public DateTime EvaluatedAt { get; set; } = DateTime.UtcNow;
}
