using EduFlow.Application.Common;
using EduFlow.Application.DTOs;
using EduFlow.Application.Interfaces;
using EduFlow.Domain.Entities;
using EduFlow.Domain.Enums;
using EduFlow.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EduFlow.Infrastructure.Services;

public class AssignmentService : IAssignmentService
{
    private readonly EduFlowDbContext _db;
    private readonly IAuditLogService _audit;
    private readonly ICurrentUserService _currentUser;

    public AssignmentService(EduFlowDbContext db, IAuditLogService audit, ICurrentUserService currentUser)
    {
        _db = db;
        _audit = audit;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<AssignmentDto>>> GetAssignmentsAsync(Guid? groupId = null)
    {
        var query = _db.Assignments
            .Include(a => a.Group)
            .Include(a => a.Submissions)
            .AsQueryable();

        if (groupId.HasValue)
            query = query.Where(a => a.GroupId == groupId.Value);

        if (_currentUser.Role == UserRole.Teacher && _currentUser.UserId.HasValue)
            query = query.Where(a => a.Group.TeacherId == _currentUser.UserId.Value);
        else if (_currentUser.Role == UserRole.Student && _currentUser.UserId.HasValue)
            query = query.Where(a => a.Group.Enrollments.Any(e => e.StudentId == _currentUser.UserId.Value));

        var list = await query
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AssignmentDto
            {
                Id = a.Id,
                GroupId = a.GroupId,
                GroupName = a.Group.Name,
                Title = a.Title,
                Description = a.Description,
                Deadline = a.Deadline,
                MaxScore = a.MaxScore,
                CreatedAt = a.CreatedAt,
                SubmissionsCount = a.Submissions.Count
            })
            .ToListAsync();

        return ApiResponse<List<AssignmentDto>>.Ok(list);
    }

    public async Task<ApiResponse<AssignmentDto>> GetAssignmentByIdAsync(Guid id)
    {
        var a = await _db.Assignments.Include(a => a.Group).Include(a => a.Submissions).FirstOrDefaultAsync(a => a.Id == id);
        if (a == null)
            return ApiResponse<AssignmentDto>.Fail("Vazifa topilmadi.");

        return ApiResponse<AssignmentDto>.Ok(new AssignmentDto
        {
            Id = a.Id,
            GroupId = a.GroupId,
            GroupName = a.Group.Name,
            Title = a.Title,
            Description = a.Description,
            Deadline = a.Deadline,
            MaxScore = a.MaxScore,
            CreatedAt = a.CreatedAt,
            SubmissionsCount = a.Submissions.Count
        });
    }

    public async Task<ApiResponse<AssignmentDto>> CreateAssignmentAsync(CreateAssignmentDto request)
    {
        var group = await _db.Groups.FindAsync(request.GroupId);
        if (group == null)
            return ApiResponse<AssignmentDto>.Fail("Guruh topilmadi.");

        if (_currentUser.Role == UserRole.Teacher && _currentUser.UserId.HasValue && group.TeacherId != _currentUser.UserId.Value)
            return ApiResponse<AssignmentDto>.Fail("Siz faqat o'z guruhingizga vazifa berishingiz mumkin.");

        var assignment = new Assignment
        {
            GroupId = request.GroupId,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Deadline = DateTime.SpecifyKind(request.Deadline, DateTimeKind.Utc),
            MaxScore = request.MaxScore > 0 ? request.MaxScore : 100,
            CreatedAt = DateTime.UtcNow
        };

        _db.Assignments.Add(assignment);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("CREATE", "Assignment", assignment.Id.ToString(), $"Vazifa yaratildi: {assignment.Title}");

        return ApiResponse<AssignmentDto>.Ok(new AssignmentDto
        {
            Id = assignment.Id,
            GroupId = assignment.GroupId,
            GroupName = group.Name,
            Title = assignment.Title,
            Description = assignment.Description,
            Deadline = assignment.Deadline,
            MaxScore = assignment.MaxScore,
            CreatedAt = assignment.CreatedAt,
            SubmissionsCount = 0
        }, "Vazifa e'lon qilindi.");
    }

    public async Task<ApiResponse<List<SubmissionDto>>> GetSubmissionsAsync(Guid assignmentId)
    {
        var assignment = await _db.Assignments.Include(a => a.Group).FirstOrDefaultAsync(a => a.Id == assignmentId);
        if (assignment == null)
            return ApiResponse<List<SubmissionDto>>.Fail("Vazifa topilmadi.");

        var query = _db.Submissions
            .Include(s => s.Student)
            .Where(s => s.AssignmentId == assignmentId);

        if (_currentUser.Role == UserRole.Student && _currentUser.UserId.HasValue)
        {
            query = query.Where(s => s.StudentId == _currentUser.UserId.Value);
        }

        var list = await query
            .OrderByDescending(s => s.SubmittedAt)
            .Select(s => new SubmissionDto
            {
                Id = s.Id,
                AssignmentId = s.AssignmentId,
                AssignmentTitle = assignment.Title,
                StudentId = s.StudentId,
                StudentName = s.Student.FullName,
                Url = s.Url,
                Text = s.Text,
                SubmittedAt = s.SubmittedAt,
                Score = s.Score,
                Feedback = s.Feedback,
                MaxScore = assignment.MaxScore
            })
            .ToListAsync();

        return ApiResponse<List<SubmissionDto>>.Ok(list);
    }

    public async Task<ApiResponse<SubmissionDto>> SubmitAssignmentAsync(SubmitAssignmentDto request)
    {
        if (!_currentUser.UserId.HasValue)
            return ApiResponse<SubmissionDto>.Fail("Avtorizatsiyadan o'tilmagan.");

        var assignment = await _db.Assignments.Include(a => a.Group).FirstOrDefaultAsync(a => a.Id == request.AssignmentId);
        if (assignment == null)
            return ApiResponse<SubmissionDto>.Fail("Vazifa topilmadi.");

        // Check enrollment
        var isEnrolled = await _db.Enrollments.AnyAsync(e => e.GroupId == assignment.GroupId && e.StudentId == _currentUser.UserId.Value && e.Status == EnrollmentStatus.Active);
        if (!isEnrolled)
            return ApiResponse<SubmissionDto>.Fail("Siz ushbu guruh a'zosi emassiz.");

        var submission = await _db.Submissions.FirstOrDefaultAsync(s => s.AssignmentId == request.AssignmentId && s.StudentId == _currentUser.UserId.Value);
        if (submission != null)
        {
            submission.Url = request.Url?.Trim();
            submission.Text = request.Text?.Trim();
            submission.SubmittedAt = DateTime.UtcNow;
        }
        else
        {
            submission = new Submission
            {
                AssignmentId = request.AssignmentId,
                StudentId = _currentUser.UserId.Value,
                Url = request.Url?.Trim(),
                Text = request.Text?.Trim(),
                SubmittedAt = DateTime.UtcNow
            };
            _db.Submissions.Add(submission);
        }

        await _db.SaveChangesAsync();
        await _audit.LogAsync("SUBMIT", "Assignment", assignment.Id.ToString(), $"Uy vazifasi topshirildi: {assignment.Title}");

        var student = await _db.Users.FindAsync(_currentUser.UserId.Value);

        return ApiResponse<SubmissionDto>.Ok(new SubmissionDto
        {
            Id = submission.Id,
            AssignmentId = assignment.Id,
            AssignmentTitle = assignment.Title,
            StudentId = submission.StudentId,
            StudentName = student?.FullName ?? "Student",
            Url = submission.Url,
            Text = submission.Text,
            SubmittedAt = submission.SubmittedAt,
            Score = submission.Score,
            Feedback = submission.Feedback,
            MaxScore = assignment.MaxScore
        }, "Vazifa topshirildi.");
    }

    public async Task<ApiResponse<SubmissionDto>> GradeSubmissionAsync(Guid submissionId, GradeSubmissionDto request)
    {
        var submission = await _db.Submissions
            .Include(s => s.Assignment)
                .ThenInclude(a => a.Group)
            .Include(s => s.Student)
            .FirstOrDefaultAsync(s => s.Id == submissionId);

        if (submission == null)
            return ApiResponse<SubmissionDto>.Fail("Topshiriq topilmadi.");

        if (_currentUser.Role == UserRole.Teacher && _currentUser.UserId.HasValue && submission.Assignment.Group.TeacherId != _currentUser.UserId.Value)
        {
            return ApiResponse<SubmissionDto>.Fail("Faqat o'z guruhingiz vazifalarini baholay olasiz.");
        }

        if (request.Score < 0 || request.Score > submission.Assignment.MaxScore)
        {
            return ApiResponse<SubmissionDto>.Fail($"Baho 0 dan {submission.Assignment.MaxScore} gacha bo'lishi kerak.");
        }

        submission.Score = request.Score;
        submission.Feedback = request.Feedback?.Trim();

        await _db.SaveChangesAsync();
        await _audit.LogAsync("GRADE", "Submission", submission.Id.ToString(), $"{submission.Student.FullName} ga {request.Score} ball qo'yildi");

        return ApiResponse<SubmissionDto>.Ok(new SubmissionDto
        {
            Id = submission.Id,
            AssignmentId = submission.AssignmentId,
            AssignmentTitle = submission.Assignment.Title,
            StudentId = submission.StudentId,
            StudentName = submission.Student.FullName,
            Url = submission.Url,
            Text = submission.Text,
            SubmittedAt = submission.SubmittedAt,
            Score = submission.Score,
            Feedback = submission.Feedback,
            MaxScore = submission.Assignment.MaxScore
        }, "Baho muvaffaqiyatli saqlandi.");
    }
}

public class PaymentService : IPaymentService
{
    private readonly EduFlowDbContext _db;
    private readonly IAuditLogService _audit;
    private readonly ICurrentUserService _currentUser;

    public PaymentService(EduFlowDbContext db, IAuditLogService audit, ICurrentUserService currentUser)
    {
        _db = db;
        _audit = audit;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<PaymentDto>>> GetPaymentsAsync(Guid? studentId = null)
    {
        var query = _db.Payments.Include(p => p.Student).AsQueryable();

        if (studentId.HasValue)
            query = query.Where(p => p.StudentId == studentId.Value);

        if (_currentUser.Role == UserRole.Student && _currentUser.UserId.HasValue)
            query = query.Where(p => p.StudentId == _currentUser.UserId.Value);

        var list = await query
            .OrderByDescending(p => p.PaidAt)
            .Select(p => new PaymentDto
            {
                Id = p.Id,
                StudentId = p.StudentId,
                StudentName = p.Student.FullName,
                StudentEmail = p.Student.Email,
                Amount = p.Amount,
                PaidAt = p.PaidAt,
                Method = p.Method,
                Status = p.Status,
                Note = p.Note
            })
            .ToListAsync();

        return ApiResponse<List<PaymentDto>>.Ok(list);
    }

    public async Task<ApiResponse<PaymentDto>> CreatePaymentAsync(CreatePaymentDto request)
    {
        var student = await _db.Users.FindAsync(request.StudentId);
        if (student == null || student.Role != UserRole.Student)
            return ApiResponse<PaymentDto>.Fail("Talaba topilmadi.");

        if (request.Amount <= 0)
            return ApiResponse<PaymentDto>.Fail("To'lov summasi 0 dan katta bo'lishi lozim.");

        var payment = new Payment
        {
            StudentId = request.StudentId,
            Amount = request.Amount,
            PaidAt = DateTime.UtcNow,
            Method = request.Method,
            Status = PaymentStatus.Completed,
            Note = request.Note?.Trim()
        };

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("PAYMENT", "Payment", payment.Id.ToString(), $"{student.FullName} uchun {payment.Amount:N0} so'm to'lov qabul qilindi ({payment.Method})");

        return ApiResponse<PaymentDto>.Ok(new PaymentDto
        {
            Id = payment.Id,
            StudentId = student.Id,
            StudentName = student.FullName,
            StudentEmail = student.Email,
            Amount = payment.Amount,
            PaidAt = payment.PaidAt,
            Method = payment.Method,
            Status = payment.Status,
            Note = payment.Note
        }, "To'lov muvaffaqiyatli qayd etildi.");
    }

    public async Task<ApiResponse<List<StudentDebtDto>>> GetDebtsReportAsync()
    {
        var students = await _db.Users
            .Where(u => u.Role == UserRole.Student)
            .Include(u => u.Enrollments)
                .ThenInclude(e => e.Group)
                    .ThenInclude(g => g.Course)
            .Include(u => u.Payments)
            .ToListAsync();

        var reports = students.Select(s =>
        {
            var totalCourseFee = s.Enrollments
                .Where(e => e.Status == EnrollmentStatus.Active)
                .Sum(e => e.Group.Course.Price);

            var totalPaid = s.Payments
                .Where(p => p.Status == PaymentStatus.Completed)
                .Sum(p => p.Amount);

            return new StudentDebtDto
            {
                StudentId = s.Id,
                StudentName = s.FullName,
                StudentEmail = s.Email,
                TotalCourseFee = totalCourseFee,
                TotalPaid = totalPaid,
                ActiveEnrollmentsCount = s.Enrollments.Count(e => e.Status == EnrollmentStatus.Active)
            };
        }).OrderByDescending(r => r.RemainingDebt).ToList();

        return ApiResponse<List<StudentDebtDto>>.Ok(reports);
    }
}

public class DashboardService : IDashboardService
{
    private readonly EduFlowDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public DashboardService(EduFlowDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<AdminDashboardDto>> GetAdminDashboardAsync()
    {
        var totalStudents = await _db.Users.CountAsync(u => u.Role == UserRole.Student && u.Status == UserStatus.Active);
        var totalTeachers = await _db.Users.CountAsync(u => u.Role == UserRole.Teacher && u.Status == UserStatus.Active);
        var totalCourses = await _db.Courses.CountAsync(c => c.Status == CourseStatus.Active);
        var activeGroups = await _db.Groups.CountAsync(g => g.Status == GroupStatus.Active);

        var totalRevenue = await _db.Payments
            .Where(p => p.Status == PaymentStatus.Completed)
            .SumAsync(p => (decimal?)p.Amount) ?? 0;

        var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var monthlyRevenue = await _db.Payments
            .Where(p => p.Status == PaymentStatus.Completed && p.PaidAt >= startOfMonth)
            .SumAsync(p => (decimal?)p.Amount) ?? 0;

        var recentPayments = await _db.Payments
            .Include(p => p.Student)
            .OrderByDescending(p => p.PaidAt)
            .Take(5)
            .Select(p => new PaymentDto
            {
                Id = p.Id,
                StudentId = p.StudentId,
                StudentName = p.Student.FullName,
                StudentEmail = p.Student.Email,
                Amount = p.Amount,
                PaidAt = p.PaidAt,
                Method = p.Method,
                Status = p.Status,
                Note = p.Note
            })
            .ToListAsync();

        var recentEnrollments = await _db.Enrollments
            .Include(e => e.Group)
            .Include(e => e.Student)
            .OrderByDescending(e => e.JoinedAt)
            .Take(5)
            .Select(e => new EnrollmentDto
            {
                Id = e.Id,
                GroupId = e.GroupId,
                GroupName = e.Group.Name,
                StudentId = e.StudentId,
                StudentName = e.Student.FullName,
                StudentEmail = e.Student.Email,
                JoinedAt = e.JoinedAt,
                Status = e.Status
            })
            .ToListAsync();

        return ApiResponse<AdminDashboardDto>.Ok(new AdminDashboardDto
        {
            TotalStudents = totalStudents,
            TotalTeachers = totalTeachers,
            TotalCourses = totalCourses,
            ActiveGroups = activeGroups,
            TotalRevenue = totalRevenue,
            MonthlyRevenue = monthlyRevenue,
            RecentPayments = recentPayments,
            RecentEnrollments = recentEnrollments
        });
    }

    public async Task<ApiResponse<TeacherDashboardDto>> GetTeacherDashboardAsync()
    {
        var teacherId = _currentUser.UserId ?? Guid.Empty;

        var myGroups = await _db.Groups.Where(g => g.TeacherId == teacherId).ToListAsync();
        var myGroupIds = myGroups.Select(g => g.Id).ToList();

        var myStudentsCount = await _db.Enrollments
            .Where(e => myGroupIds.Contains(e.GroupId) && e.Status == EnrollmentStatus.Active)
            .Select(e => e.StudentId)
            .Distinct()
            .CountAsync();

        var pendingSubmissions = await _db.Submissions
            .Include(s => s.Assignment)
                .ThenInclude(a => a.Group)
            .Include(s => s.Student)
            .Where(s => myGroupIds.Contains(s.Assignment.GroupId) && !s.Score.HasValue)
            .OrderByDescending(s => s.SubmittedAt)
            .Take(10)
            .Select(s => new SubmissionDto
            {
                Id = s.Id,
                AssignmentId = s.AssignmentId,
                AssignmentTitle = s.Assignment.Title,
                StudentId = s.StudentId,
                StudentName = s.Student.FullName,
                Url = s.Url,
                Text = s.Text,
                SubmittedAt = s.SubmittedAt,
                Score = s.Score,
                Feedback = s.Feedback,
                MaxScore = s.Assignment.MaxScore
            })
            .ToListAsync();

        var now = DateTime.UtcNow;
        var upcomingLessons = await _db.Lessons
            .Include(l => l.Group)
                .ThenInclude(g => g.Teacher)
            .Where(l => myGroupIds.Contains(l.GroupId) && l.StartsAt >= now.AddHours(-2))
            .OrderBy(l => l.StartsAt)
            .Take(5)
            .Select(l => new LessonDto
            {
                Id = l.Id,
                GroupId = l.GroupId,
                GroupName = l.Group.Name,
                Title = l.Title,
                StartsAt = l.StartsAt,
                EndsAt = l.EndsAt,
                Room = l.Room,
                OnlineUrl = l.OnlineUrl,
                TeacherId = l.Group.TeacherId,
                TeacherName = l.Group.Teacher.FullName
            })
            .ToListAsync();

        return ApiResponse<TeacherDashboardDto>.Ok(new TeacherDashboardDto
        {
            MyGroupsCount = myGroups.Count,
            MyStudentsCount = myStudentsCount,
            PendingSubmissionsCount = pendingSubmissions.Count,
            UpcomingLessonsCount = upcomingLessons.Count,
            UpcomingLessons = upcomingLessons,
            PendingSubmissions = pendingSubmissions
        });
    }

    public async Task<ApiResponse<StudentDashboardDto>> GetStudentDashboardAsync()
    {
        var studentId = _currentUser.UserId ?? Guid.Empty;

        var enrollments = await _db.Enrollments
            .Include(e => e.Group)
                .ThenInclude(g => g.Course)
            .Where(e => e.StudentId == studentId && e.Status == EnrollmentStatus.Active)
            .ToListAsync();

        var groupIds = enrollments.Select(e => e.GroupId).ToList();
        var totalCourseFee = enrollments.Sum(e => e.Group.Course.Price);

        var totalPaid = await _db.Payments
            .Where(p => p.StudentId == studentId && p.Status == PaymentStatus.Completed)
            .SumAsync(p => (decimal?)p.Amount) ?? 0;

        // Attendance rate
        var totalAttendances = await _db.Attendances
            .CountAsync(a => a.StudentId == studentId);
        var presentAttendances = await _db.Attendances
            .CountAsync(a => a.StudentId == studentId && (a.Status == AttendanceStatus.Present || a.Status == AttendanceStatus.Late));

        var attendanceRate = totalAttendances > 0 ? Math.Round((double)presentAttendances / totalAttendances * 100, 1) : 100.0;

        // Pending assignments
        var submittedAssignmentIds = await _db.Submissions
            .Where(s => s.StudentId == studentId)
            .Select(s => s.AssignmentId)
            .ToListAsync();

        var pendingAssignments = await _db.Assignments
            .Include(a => a.Group)
            .Where(a => groupIds.Contains(a.GroupId) && !submittedAssignmentIds.Contains(a.Id))
            .OrderBy(a => a.Deadline)
            .Take(5)
            .Select(a => new AssignmentDto
            {
                Id = a.Id,
                GroupId = a.GroupId,
                GroupName = a.Group.Name,
                Title = a.Title,
                Description = a.Description,
                Deadline = a.Deadline,
                MaxScore = a.MaxScore,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        var now = DateTime.UtcNow;
        var upcomingLessons = await _db.Lessons
            .Include(l => l.Group)
                .ThenInclude(g => g.Teacher)
            .Where(l => groupIds.Contains(l.GroupId) && l.StartsAt >= now.AddHours(-2))
            .OrderBy(l => l.StartsAt)
            .Take(5)
            .Select(l => new LessonDto
            {
                Id = l.Id,
                GroupId = l.GroupId,
                GroupName = l.Group.Name,
                Title = l.Title,
                StartsAt = l.StartsAt,
                EndsAt = l.EndsAt,
                Room = l.Room,
                OnlineUrl = l.OnlineUrl,
                TeacherId = l.Group.TeacherId,
                TeacherName = l.Group.Teacher.FullName
            })
            .ToListAsync();

        return ApiResponse<StudentDashboardDto>.Ok(new StudentDashboardDto
        {
            EnrolledCoursesCount = enrollments.Count,
            AttendanceRatePercentage = attendanceRate,
            PendingAssignmentsCount = pendingAssignments.Count,
            TotalCourseFee = totalCourseFee,
            TotalPaid = totalPaid,
            UpcomingLessons = upcomingLessons,
            PendingAssignments = pendingAssignments
        });
    }
}
