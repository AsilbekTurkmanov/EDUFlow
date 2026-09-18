using EduFlow.Domain.Enums;

namespace EduFlow.Application.DTOs;

public class CourseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DurationWeeks { get; set; }
    public CourseStatus Status { get; set; }
    public int GroupsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateCourseDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DurationWeeks { get; set; }
    public CourseStatus Status { get; set; } = CourseStatus.Active;
}

public class GroupDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;
    public Guid TeacherId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public GroupStatus Status { get; set; }
    public int StudentsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateGroupDto
{
    public string Name { get; set; } = string.Empty;
    public Guid CourseId { get; set; }
    public Guid TeacherId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public GroupStatus Status { get; set; } = GroupStatus.Active;
}

public class EnrollmentDto
{
    public Guid Id { get; set; }
    public Guid GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentEmail { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; }
    public EnrollmentStatus Status { get; set; }
}

public class EnrollStudentDto
{
    public Guid GroupId { get; set; }
    public Guid StudentId { get; set; }
}
