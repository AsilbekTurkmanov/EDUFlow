namespace EduFlow.Application.DTOs;

public class AdminDashboardDto
{
    public int TotalStudents { get; set; }
    public int TotalTeachers { get; set; }
    public int TotalCourses { get; set; }
    public int ActiveGroups { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public decimal TotalDebts { get; set; }
    public int DebtorsCount { get; set; }
    public int FullyPaidCount { get; set; }
    public int PrepaidCount { get; set; }
    public List<PaymentDto> RecentPayments { get; set; } = new();
    public List<EnrollmentDto> RecentEnrollments { get; set; } = new();
    public List<MonthlyPaymentStatDto> RevenueChart { get; set; } = new();
}

public class TeacherDashboardDto
{
    public int MyGroupsCount { get; set; }
    public int MyStudentsCount { get; set; }
    public int PendingSubmissionsCount { get; set; }
    public int UpcomingLessonsCount { get; set; }
    public int ExperienceYears { get; set; }
    public int SharePercentage { get; set; } // 70%, 60%, 50%, 40%
    public decimal SharePerStudent => 800000m * SharePercentage / 100m;
    public decimal MonthlyEarnings { get; set; }
    public decimal TotalLifetimeEarnings { get; set; }
    public List<string> MyStudentNames { get; set; } = new();
    public List<LessonDto> UpcomingLessons { get; set; } = new();
    public List<SubmissionDto> PendingSubmissions { get; set; } = new();
}

public class StudentDashboardDto
{
    public int EnrolledCoursesCount { get; set; }
    public double AttendanceRatePercentage { get; set; }
    public int PresentCount { get; set; }
    public int AbsentCount { get; set; }
    public int LateCount { get; set; }
    public int PendingAssignmentsCount { get; set; }
    public decimal MonthlyFee { get; set; } = 800000m;
    public decimal TotalPaid { get; set; }
    public decimal Balance { get; set; } // -800 000, 0, +7 200 000
    public decimal BalanceDebt => Balance < 0 ? Math.Abs(Balance) : 0;
    public List<LessonDto> UpcomingLessons { get; set; } = new();
    public List<AssignmentDto> PendingAssignments { get; set; } = new();
    public List<MonthlyPaymentStatDto> MonthlyPaymentStats { get; set; } = new();
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
