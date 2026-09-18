namespace EduFlow.Application.DTOs;

public class AdminDashboardDto
{
    public int TotalStudents { get; set; }
    public int TotalTeachers { get; set; }
    public int TotalCourses { get; set; }
    public int ActiveGroups { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public List<PaymentDto> RecentPayments { get; set; } = new();
    public List<EnrollmentDto> RecentEnrollments { get; set; } = new();
}

public class TeacherDashboardDto
{
    public int MyGroupsCount { get; set; }
    public int MyStudentsCount { get; set; }
    public int PendingSubmissionsCount { get; set; }
    public int UpcomingLessonsCount { get; set; }
    public List<LessonDto> UpcomingLessons { get; set; } = new();
    public List<SubmissionDto> PendingSubmissions { get; set; } = new();
}

public class StudentDashboardDto
{
    public int EnrolledCoursesCount { get; set; }
    public double AttendanceRatePercentage { get; set; }
    public int PendingAssignmentsCount { get; set; }
    public decimal TotalCourseFee { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal BalanceDebt => Math.Max(0, TotalCourseFee - TotalPaid);
    public List<LessonDto> UpcomingLessons { get; set; } = new();
    public List<AssignmentDto> PendingAssignments { get; set; } = new();
}

public class AuditLogDto
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Entity { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? Metadata { get; set; }
}
