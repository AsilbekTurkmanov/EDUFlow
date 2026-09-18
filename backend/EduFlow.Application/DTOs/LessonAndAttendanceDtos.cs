using EduFlow.Domain.Enums;

namespace EduFlow.Application.DTOs;

public class LessonDto
{
    public Guid Id { get; set; }
    public Guid GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public string Room { get; set; } = string.Empty;
    public string? OnlineUrl { get; set; }
    public Guid TeacherId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
}

public class CreateLessonDto
{
    public Guid GroupId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public string Room { get; set; } = string.Empty;
    public string? OnlineUrl { get; set; }
}

public class AttendanceDto
{
    public Guid Id { get; set; }
    public Guid LessonId { get; set; }
    public string LessonTitle { get; set; } = string.Empty;
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public AttendanceStatus Status { get; set; }
    public string? Note { get; set; }
}

public class MarkAttendanceItemDto
{
    public Guid StudentId { get; set; }
    public AttendanceStatus Status { get; set; }
    public string? Note { get; set; }
}

public class SaveAttendanceBatchDto
{
    public Guid LessonId { get; set; }
    public List<MarkAttendanceItemDto> Items { get; set; } = new();
}
