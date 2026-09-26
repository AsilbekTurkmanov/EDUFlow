using EduFlow.Domain.Enums;

namespace EduFlow.Application.DTOs;

// --- ROOM DTOs ---
public class RoomDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public bool HasProjector { get; set; }
    public int ComputersCount { get; set; }
    public bool HasAirConditioner { get; set; }
    public bool IsActive { get; set; }
    public Guid? CenterId { get; set; }
    public string? CenterName { get; set; }
    public int UpcomingLessonsCount { get; set; }
}

public class CreateRoomDto
{
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; } = 25;
    public bool HasProjector { get; set; } = true;
    public int ComputersCount { get; set; } = 20;
    public bool HasAirConditioner { get; set; } = true;
    public Guid? CenterId { get; set; }
}

public class UpdateRoomDto : CreateRoomDto
{
    public bool IsActive { get; set; } = true;
}

// --- PAYROLL DTOs ---
public class TeacherPayrollDto
{
    public Guid Id { get; set; }
    public Guid TeacherId { get; set; }
    public string TeacherName { get; set; } = string.Empty;
    public string TeacherEmail { get; set; } = string.Empty;
    public string? TeacherPhone { get; set; }
    public Guid? CenterId { get; set; }
    public string? CenterName { get; set; }
    public string PeriodMonth { get; set; } = string.Empty;
    public int ActiveStudentsCount { get; set; }
    public decimal TotalRevenueGenerated { get; set; }
    public TeacherCompensationType CompensationType { get; set; }
    public string CompensationTypeName { get; set; } = string.Empty;
    public int SharePercentage { get; set; }
    public decimal BaseAmount { get; set; }
    public decimal Bonus { get; set; }
    public decimal Deductions { get; set; }
    public decimal FinalAmount { get; set; }
    public PayrollStatus Status { get; set; }
    public string StatusText { get; set; } = string.Empty;
    public DateTime? PaidAt { get; set; }
    public string? PaymentNote { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class GeneratePayrollRequestDto
{
    public string PeriodMonth { get; set; } = string.Empty; // e.g. "2026-09"
    public Guid? CenterId { get; set; }
}

public class PayPayrollRequestDto
{
    public decimal Bonus { get; set; }
    public decimal Deductions { get; set; }
    public string? Note { get; set; }
}

// --- NOTIFICATION DTOs ---
public class NotificationDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public string? ActionUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateNotificationDto
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; } = NotificationType.Info;
    public string? ActionUrl { get; set; }
}

// --- EXAM & GRADE DTOs ---
public class ExamDto
{
    public Guid Id { get; set; }
    public Guid GroupId { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public Guid CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime ExamDate { get; set; }
    public int MaxScore { get; set; }
    public int PassingScore { get; set; }
    public string? Description { get; set; }
    public int SubmissionsCount { get; set; }
    public double AverageScore { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ExamResultDto> Results { get; set; } = new();
}

public class CreateExamDto
{
    public Guid GroupId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime ExamDate { get; set; }
    public int MaxScore { get; set; } = 100;
    public int PassingScore { get; set; } = 60;
    public string? Description { get; set; }
}

public class ExamResultDto
{
    public Guid Id { get; set; }
    public Guid ExamId { get; set; }
    public string ExamTitle { get; set; } = string.Empty;
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public int Score { get; set; }
    public ExamGrade Grade { get; set; }
    public string GradeLetter { get; set; } = "A";
    public string? TeacherFeedback { get; set; }
    public DateTime EvaluatedAt { get; set; }
}

public class SubmitExamResultDto
{
    public Guid StudentId { get; set; }
    public int Score { get; set; }
    public string? TeacherFeedback { get; set; }
}

public class BatchSaveExamResultsDto
{
    public Guid ExamId { get; set; }
    public List<SubmitExamResultDto> Results { get; set; } = new();
}

// --- CERTIFICATE DTOs ---
public class CertificateDto
{
    public Guid Id { get; set; }
    public string CertificateCode { get; set; } = string.Empty;
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public Guid CourseId { get; set; }
    public string CourseName { get; set; } = string.Empty;
    public Guid? CenterId { get; set; }
    public string? CenterName { get; set; }
    public DateTime IssuedAt { get; set; }
    public int FinalScore { get; set; }
    public string GradeLetter { get; set; } = "A";
    public string VerificationUrl { get; set; } = string.Empty;
}

public class IssueCertificateDto
{
    public Guid StudentId { get; set; }
    public Guid CourseId { get; set; }
    public int FinalScore { get; set; }
}

// --- STUDENT RISK DTOs ---
public class StudentRiskDto
{
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? ParentPhone { get; set; }
    public string GroupName { get; set; } = string.Empty;
    public string CourseName { get; set; } = string.Empty;
    public double AttendanceRate { get; set; } // e.g. 62.5%
    public int MissedLessonsCount { get; set; }
    public decimal OverdueDebt { get; set; } // e.g. 800000 UZS
    public int MissingAssignmentsCount { get; set; }
    public double AverageExamScore { get; set; }
    public int RiskScore { get; set; } // 0 - 100
    public StudentRiskLevel RiskLevel { get; set; }
    public string RiskLevelText { get; set; } = "O'rtacha";
    public List<string> RiskFactors { get; set; } = new();
    public string RecommendedAction { get; set; } = string.Empty;
}

// --- PARENT PORTAL DTOs ---
public class ParentChildDto
{
    public Guid ChildId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? GroupName { get; set; }
    public string? CourseName { get; set; }
    public string? TeacherName { get; set; }
    public double AttendancePercentage { get; set; }
    public decimal Balance { get; set; }
    public decimal MonthlyTuition { get; set; }
    public int PendingAssignmentsCount { get; set; }
    public double AverageGradeScore { get; set; }
    public List<AttendanceDto> RecentAttendances { get; set; } = new();
    public List<ExamResultDto> RecentExamResults { get; set; } = new();
    public List<PaymentDto> RecentPayments { get; set; } = new();
}
