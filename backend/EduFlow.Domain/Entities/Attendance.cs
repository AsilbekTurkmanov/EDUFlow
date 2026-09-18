using EduFlow.Domain.Enums;

namespace EduFlow.Domain.Entities;

public class Attendance
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid LessonId { get; set; }
    public Lesson Lesson { get; set; } = null!;

    public Guid StudentId { get; set; }
    public User Student { get; set; } = null!;

    public AttendanceStatus Status { get; set; } = AttendanceStatus.Present;
    public string? Note { get; set; }
}
