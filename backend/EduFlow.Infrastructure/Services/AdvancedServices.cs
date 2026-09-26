using EduFlow.Application.Common;
using EduFlow.Application.DTOs;
using EduFlow.Application.Interfaces;
using EduFlow.Domain.Entities;
using EduFlow.Domain.Enums;
using EduFlow.Infrastructure.Data;
using EduFlow.Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace EduFlow.Infrastructure.Services;

// ==========================================
// 1. ROOM SERVICE
// ==========================================
public class RoomService : IRoomService
{
    private readonly EduFlowDbContext _db;
    private readonly IAuditLogService _audit;

    public RoomService(EduFlowDbContext db, IAuditLogService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task<ApiResponse<List<RoomDto>>> GetRoomsAsync(Guid? centerId = null)
    {
        var query = _db.Rooms.Include(r => r.Center).AsQueryable();
        if (centerId.HasValue)
        {
            query = query.Where(r => r.CenterId == centerId.Value);
        }

        var now = DateTime.UtcNow;
        var rooms = await query
            .OrderBy(r => r.Name)
            .Select(r => new RoomDto
            {
                Id = r.Id,
                Name = r.Name,
                Capacity = r.Capacity,
                HasProjector = r.HasProjector,
                ComputersCount = r.ComputersCount,
                HasAirConditioner = r.HasAirConditioner,
                IsActive = r.IsActive,
                CenterId = r.CenterId,
                CenterName = r.Center != null ? r.Center.Name : null,
                UpcomingLessonsCount = _db.Lessons.Count(l => l.RoomId == r.Id && l.StartsAt >= now)
            })
            .ToListAsync();

        return ApiResponse<List<RoomDto>>.Ok(rooms);
    }

    public async Task<ApiResponse<RoomDto>> GetRoomByIdAsync(Guid id)
    {
        var r = await _db.Rooms.Include(r => r.Center).FirstOrDefaultAsync(r => r.Id == id);
        if (r == null) return ApiResponse<RoomDto>.Fail("Xona topilmadi.");

        return ApiResponse<RoomDto>.Ok(new RoomDto
        {
            Id = r.Id,
            Name = r.Name,
            Capacity = r.Capacity,
            HasProjector = r.HasProjector,
            ComputersCount = r.ComputersCount,
            HasAirConditioner = r.HasAirConditioner,
            IsActive = r.IsActive,
            CenterId = r.CenterId,
            CenterName = r.Center?.Name
        });
    }

    public async Task<ApiResponse<RoomDto>> CreateRoomAsync(CreateRoomDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<RoomDto>.Fail("Xona nomi kiritilishi shart.");

        var room = new Room
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Capacity = request.Capacity,
            HasProjector = request.HasProjector,
            ComputersCount = request.ComputersCount,
            HasAirConditioner = request.HasAirConditioner,
            IsActive = true,
            CenterId = request.CenterId
        };

        _db.Rooms.Add(room);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("CREATE_ROOM", "Room", room.Id.ToString(), $"Yangi xona qo'shildi: {room.Name} (Sig'imi: {room.Capacity})");

        return ApiResponse<RoomDto>.Ok(new RoomDto
        {
            Id = room.Id,
            Name = room.Name,
            Capacity = room.Capacity,
            HasProjector = room.HasProjector,
            ComputersCount = room.ComputersCount,
            HasAirConditioner = room.HasAirConditioner,
            IsActive = room.IsActive,
            CenterId = room.CenterId
        }, "Xona muvaffaqiyatli yaratildi.");
    }

    public async Task<ApiResponse<RoomDto>> UpdateRoomAsync(Guid id, UpdateRoomDto request)
    {
        var room = await _db.Rooms.FindAsync(id);
        if (room == null) return ApiResponse<RoomDto>.Fail("Xona topilmadi.");

        room.Name = request.Name.Trim();
        room.Capacity = request.Capacity;
        room.HasProjector = request.HasProjector;
        room.ComputersCount = request.ComputersCount;
        room.HasAirConditioner = request.HasAirConditioner;
        room.IsActive = request.IsActive;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("UPDATE_ROOM", "Room", id.ToString(), $"Xona yangilandi: {room.Name}");

        return ApiResponse<RoomDto>.Ok(new RoomDto
        {
            Id = room.Id,
            Name = room.Name,
            Capacity = room.Capacity,
            HasProjector = room.HasProjector,
            ComputersCount = room.ComputersCount,
            HasAirConditioner = room.HasAirConditioner,
            IsActive = room.IsActive,
            CenterId = room.CenterId
        }, "Xona muvaffaqiyatli tahrirlandi.");
    }

    public async Task<ApiResponse<bool>> DeleteRoomAsync(Guid id)
    {
        var room = await _db.Rooms.FindAsync(id);
        if (room == null) return ApiResponse<bool>.Fail("Xona topilmadi.");

        var hasLessons = await _db.Lessons.AnyAsync(l => l.RoomId == id);
        if (hasLessons)
        {
            room.IsActive = false;
            await _db.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "Xonaga biriktirilgan darslar mavjudligi sababli u nofaol (arxiv) holatga o'tkazildi.");
        }

        _db.Rooms.Remove(room);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("DELETE_ROOM", "Room", id.ToString(), $"Xona o'chirildi: {room.Name}");

        return ApiResponse<bool>.Ok(true, "Xona muvaffaqiyatli o'chirildi.");
    }

    public async Task<ApiResponse<bool>> CheckRoomAvailabilityAsync(Guid roomId, DateTime startsAt, DateTime endsAt, Guid? excludeLessonId = null)
    {
        var room = await _db.Rooms.FindAsync(roomId);
        if (room == null) return ApiResponse<bool>.Fail("Xona topilmadi.");

        var conflict = await _db.Lessons
            .Include(l => l.Group)
            .Where(l => l.RoomId == roomId &&
                        (!excludeLessonId.HasValue || l.Id != excludeLessonId.Value) &&
                        l.StartsAt < endsAt && l.EndsAt > startsAt)
            .FirstOrDefaultAsync();

        if (conflict != null)
        {
            var msg = $"DIQQAT: \"{room.Name}\" auditoriyasi {conflict.StartsAt:HH:mm} - {conflict.EndsAt:HH:mm} vaqt oralig'ida \"{conflict.Group?.Name}\" guruhi tomonidan band qilingan!";
            return ApiResponse<bool>.Fail(msg);
        }

        return ApiResponse<bool>.Ok(true, "Auditoriya ko'rsatilgan vaqtda bo'sh.");
    }
}

// ==========================================
// 2. TEACHER PAYROLL SERVICE
// ==========================================
public class TeacherPayrollService : ITeacherPayrollService
{
    private readonly EduFlowDbContext _db;
    private readonly IAuditLogService _audit;

    public TeacherPayrollService(EduFlowDbContext db, IAuditLogService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task<ApiResponse<List<TeacherPayrollDto>>> GetPayrollsAsync(string? periodMonth = null, Guid? teacherId = null, Guid? centerId = null)
    {
        var query = _db.TeacherPayrolls
            .Include(p => p.Teacher)
            .Include(p => p.Center)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(periodMonth))
            query = query.Where(p => p.PeriodMonth == periodMonth);

        if (teacherId.HasValue)
            query = query.Where(p => p.TeacherId == teacherId.Value);

        if (centerId.HasValue)
            query = query.Where(p => p.CenterId == centerId.Value);

        var list = await query
            .OrderByDescending(p => p.PeriodMonth)
            .ThenByDescending(p => p.FinalAmount)
            .Select(p => MapToDto(p))
            .ToListAsync();

        return ApiResponse<List<TeacherPayrollDto>>.Ok(list);
    }

    public async Task<ApiResponse<TeacherPayrollDto>> GenerateOrGetTeacherPayrollAsync(Guid teacherId, string periodMonth)
    {
        var teacher = await _db.Users
            .Include(u => u.Center)
            .Include(u => u.TeachingGroups).ThenInclude(g => g.Enrollments).ThenInclude(e => e.Student).ThenInclude(s => s.Payments)
            .Include(u => u.TeachingGroups).ThenInclude(g => g.Course)
            .FirstOrDefaultAsync(u => u.Id == teacherId && u.Role == UserRole.Teacher);

        if (teacher == null)
            return ApiResponse<TeacherPayrollDto>.Fail("O'qituvchi topilmadi.");

        var existing = await _db.TeacherPayrolls
            .Include(p => p.Teacher)
            .Include(p => p.Center)
            .FirstOrDefaultAsync(p => p.TeacherId == teacherId && p.PeriodMonth == periodMonth);

        // If already paid, return as is
        if (existing != null && existing.Status == PayrollStatus.Paid)
        {
            return ApiResponse<TeacherPayrollDto>.Ok(MapToDto(existing));
        }

        // Calculate teaching revenue and students
        var allStudents = teacher.TeachingGroups
            .SelectMany(g => g.Enrollments)
            .Where(e => e.Status == EnrollmentStatus.Active)
            .Select(e => e.Student)
            .DistinctBy(s => s.Id)
            .ToList();

        int studentCount = allStudents.Count;
        decimal totalRevenue = 0;

        foreach (var group in teacher.TeachingGroups.Where(g => g.Status == GroupStatus.Active))
        {
            var coursePrice = group.Course?.Price > 0 ? group.Course.Price : 800000m;
            var groupActiveStudents = group.Enrollments.Count(e => e.Status == EnrollmentStatus.Active);
            totalRevenue += groupActiveStudents * coursePrice;
        }

        // Calculate base salary according to compensation model
        decimal baseAmount = 0;
        int sharePct = teacher.CustomSharePercentage ?? 70;

        switch (teacher.CompensationType)
        {
            case TeacherCompensationType.Percentage:
                baseAmount = Math.Round(totalRevenue * sharePct / 100m, 0);
                break;
            case TeacherCompensationType.FixedPerStudent:
                var perStudent = teacher.FixedAmount.HasValue && teacher.FixedAmount.Value > 0 ? teacher.FixedAmount.Value : 400000m;
                baseAmount = studentCount * perStudent;
                break;
            case TeacherCompensationType.FixedMonthly:
                baseAmount = teacher.FixedAmount.HasValue && teacher.FixedAmount.Value > 0 ? teacher.FixedAmount.Value : 8000000m;
                break;
        }

        if (existing == null)
        {
            existing = new TeacherPayroll
            {
                Id = Guid.NewGuid(),
                TeacherId = teacherId,
                CenterId = teacher.CenterId,
                PeriodMonth = periodMonth,
                ActiveStudentsCount = studentCount,
                TotalRevenueGenerated = totalRevenue,
                CompensationType = teacher.CompensationType,
                SharePercentage = sharePct,
                BaseAmount = baseAmount,
                Bonus = 0,
                Deductions = 0,
                FinalAmount = baseAmount,
                Status = PayrollStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };
            _db.TeacherPayrolls.Add(existing);
        }
        else
        {
            existing.ActiveStudentsCount = studentCount;
            existing.TotalRevenueGenerated = totalRevenue;
            existing.BaseAmount = baseAmount;
            existing.FinalAmount = baseAmount + existing.Bonus - existing.Deductions;
        }

        await _db.SaveChangesAsync();

        existing.Teacher = teacher;
        existing.Center = teacher.Center;

        return ApiResponse<TeacherPayrollDto>.Ok(MapToDto(existing));
    }

    public async Task<ApiResponse<List<TeacherPayrollDto>>> GenerateCenterPayrollsAsync(GeneratePayrollRequestDto request)
    {
        var teachersQuery = _db.Users.Where(u => u.Role == UserRole.Teacher && u.Status == UserStatus.Active);
        if (request.CenterId.HasValue)
        {
            teachersQuery = teachersQuery.Where(u => u.CenterId == request.CenterId.Value);
        }

        var teachers = await teachersQuery.ToListAsync();
        var results = new List<TeacherPayrollDto>();

        foreach (var t in teachers)
        {
            var res = await GenerateOrGetTeacherPayrollAsync(t.Id, request.PeriodMonth);
            if (res.Success && res.Data != null)
            {
                results.Add(res.Data);
            }
        }

        return ApiResponse<List<TeacherPayrollDto>>.Ok(results, $"{results.Count} nafar o'qituvchining {request.PeriodMonth} oyi uchun maosh hisob-kitoblari yangilandi.");
    }

    public async Task<ApiResponse<TeacherPayrollDto>> PayTeacherAsync(Guid payrollId, PayPayrollRequestDto request)
    {
        var payroll = await _db.TeacherPayrolls
            .Include(p => p.Teacher)
            .Include(p => p.Center)
            .FirstOrDefaultAsync(p => p.Id == payrollId);

        if (payroll == null) return ApiResponse<TeacherPayrollDto>.Fail("Oylik qaydnomasi topilmadi.");

        payroll.Bonus = request.Bonus;
        payroll.Deductions = request.Deductions;
        payroll.FinalAmount = payroll.BaseAmount + request.Bonus - request.Deductions;
        payroll.Status = PayrollStatus.Paid;
        payroll.PaidAt = DateTime.UtcNow;
        payroll.PaymentNote = request.Note;

        await _db.SaveChangesAsync();

        await _audit.LogAsync("PAY_TEACHER_SALARY", "TeacherPayroll", payrollId.ToString(),
            $"{payroll.Teacher?.FullName} ga {payroll.PeriodMonth} uchun {payroll.FinalAmount:N0} UZS maosh to'landi.");

        return ApiResponse<TeacherPayrollDto>.Ok(MapToDto(payroll), "O'qituvchi maoshi to'langan deb belgilandi.");
    }

    private static TeacherPayrollDto MapToDto(TeacherPayroll p)
    {
        return new TeacherPayrollDto
        {
            Id = p.Id,
            TeacherId = p.TeacherId,
            TeacherName = p.Teacher?.FullName ?? "Noma'lum O'qituvchi",
            TeacherEmail = p.Teacher?.Email ?? "",
            TeacherPhone = p.Teacher?.Phone,
            CenterId = p.CenterId,
            CenterName = p.Center?.Name,
            PeriodMonth = p.PeriodMonth,
            ActiveStudentsCount = p.ActiveStudentsCount,
            TotalRevenueGenerated = p.TotalRevenueGenerated,
            CompensationType = p.CompensationType,
            CompensationTypeName = p.CompensationType switch
            {
                TeacherCompensationType.Percentage => $"Tushumdan {p.SharePercentage}% ulush",
                TeacherCompensationType.FixedPerStudent => "Har bir o'quvchidan fiks summa",
                _ => "Oylik o'zgarmas oklad"
            },
            SharePercentage = p.SharePercentage,
            BaseAmount = p.BaseAmount,
            Bonus = p.Bonus,
            Deductions = p.Deductions,
            FinalAmount = p.FinalAmount,
            Status = p.Status,
            StatusText = p.Status switch
            {
                PayrollStatus.Paid => "To'langan",
                PayrollStatus.Approved => "Tasdiqlangan",
                _ => "Kutilmoqda"
            },
            PaidAt = p.PaidAt,
            PaymentNote = p.PaymentNote,
            CreatedAt = p.CreatedAt
        };
    }
}

// ==========================================
// 3. NOTIFICATION SERVICE
// ==========================================
public class NotificationService : INotificationService
{
    private readonly EduFlowDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IHubContext<EduFlowHub> _hubContext;

    public NotificationService(
        EduFlowDbContext db,
        ICurrentUserService currentUser,
        IHubContext<EduFlowHub> hubContext)
    {
        _db = db;
        _currentUser = currentUser;
        _hubContext = hubContext;
    }

    public async Task<ApiResponse<List<NotificationDto>>> GetUserNotificationsAsync(bool unreadOnly = false)
    {
        if (!_currentUser.UserId.HasValue)
            return ApiResponse<List<NotificationDto>>.Fail("Avtorizatsiyadan o'tilmagan.");

        var query = _db.Notifications.Where(n => n.UserId == _currentUser.UserId.Value);
        if (unreadOnly)
            query = query.Where(n => !n.IsRead);

        var list = await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                UserId = n.UserId,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                TypeName = n.Type.ToString(),
                IsRead = n.IsRead,
                ActionUrl = n.ActionUrl,
                CreatedAt = n.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<List<NotificationDto>>.Ok(list);
    }

    public async Task<ApiResponse<int>> GetUnreadCountAsync()
    {
        if (!_currentUser.UserId.HasValue)
            return ApiResponse<int>.Ok(0);

        var count = await _db.Notifications.CountAsync(n => n.UserId == _currentUser.UserId.Value && !n.IsRead);
        return ApiResponse<int>.Ok(count);
    }

    public async Task<ApiResponse<bool>> MarkAsReadAsync(Guid notificationId)
    {
        var n = await _db.Notifications.FindAsync(notificationId);
        if (n != null && _currentUser.UserId.HasValue && n.UserId == _currentUser.UserId.Value)
        {
            n.IsRead = true;
            await _db.SaveChangesAsync();
        }
        return ApiResponse<bool>.Ok(true);
    }

    public async Task<ApiResponse<bool>> MarkAllAsReadAsync()
    {
        if (!_currentUser.UserId.HasValue)
            return ApiResponse<bool>.Ok(true);

        var list = await _db.Notifications
            .Where(n => n.UserId == _currentUser.UserId.Value && !n.IsRead)
            .ToListAsync();

        foreach (var n in list)
        {
            n.IsRead = true;
        }

        await _db.SaveChangesAsync();
        return ApiResponse<bool>.Ok(true, "Barcha bildirishnomalar o'qilgan deb belgilandi.");
    }

    public async Task SendNotificationAsync(CreateNotificationDto request)
    {
        var n = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Title = request.Title,
            Message = request.Message,
            Type = request.Type,
            ActionUrl = request.ActionUrl,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _db.Notifications.Add(n);
        await _db.SaveChangesAsync();

        // Broadcast to SignalR client
        try
        {
            await _hubContext.Clients.Group($"User_{request.UserId}").SendAsync("ReceiveNotification", new NotificationDto
            {
                Id = n.Id,
                UserId = n.UserId,
                Title = n.Title,
                Message = n.Message,
                Type = n.Type,
                TypeName = n.Type.ToString(),
                IsRead = false,
                ActionUrl = n.ActionUrl,
                CreatedAt = n.CreatedAt
            });
        }
        catch
        {
            // Background SignalR push failure does not break the transaction
        }
    }
}

// ==========================================
// 4. EXAM & GRADE SERVICE
// ==========================================
public class ExamService : IExamService
{
    private readonly EduFlowDbContext _db;
    private readonly IAuditLogService _audit;
    private readonly ICurrentUserService _currentUser;

    public ExamService(EduFlowDbContext db, IAuditLogService audit, ICurrentUserService currentUser)
    {
        _db = db;
        _audit = audit;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<ExamDto>>> GetExamsAsync(Guid? groupId = null)
    {
        var query = _db.Exams
            .Include(e => e.Group)
            .Include(e => e.Course)
            .Include(e => e.Results).ThenInclude(r => r.Student)
            .AsQueryable();

        if (groupId.HasValue)
            query = query.Where(e => e.GroupId == groupId.Value);

        var exams = await query
            .OrderByDescending(e => e.ExamDate)
            .ToListAsync();

        var dtos = exams.Select(e => new ExamDto
        {
            Id = e.Id,
            GroupId = e.GroupId,
            GroupName = e.Group?.Name ?? "",
            CourseId = e.CourseId,
            CourseName = e.Course?.Name ?? "",
            Title = e.Title,
            ExamDate = e.ExamDate,
            MaxScore = e.MaxScore,
            PassingScore = e.PassingScore,
            Description = e.Description,
            SubmissionsCount = e.Results.Count,
            AverageScore = e.Results.Any() ? Math.Round(e.Results.Average(r => r.Score), 1) : 0,
            CreatedAt = e.CreatedAt,
            Results = e.Results.Select(r => new ExamResultDto
            {
                Id = r.Id,
                ExamId = r.ExamId,
                ExamTitle = e.Title,
                StudentId = r.StudentId,
                StudentName = r.Student?.FullName ?? "",
                Score = r.Score,
                Grade = r.Grade,
                GradeLetter = r.Grade.ToString(),
                TeacherFeedback = r.TeacherFeedback,
                EvaluatedAt = r.EvaluatedAt
            }).ToList()
        }).ToList();

        return ApiResponse<List<ExamDto>>.Ok(dtos);
    }

    public async Task<ApiResponse<ExamDto>> GetExamByIdAsync(Guid id)
    {
        var e = await _db.Exams
            .Include(e => e.Group)
            .Include(e => e.Course)
            .Include(e => e.Results).ThenInclude(r => r.Student)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (e == null) return ApiResponse<ExamDto>.Fail("Imtihon topilmadi.");

        return ApiResponse<ExamDto>.Ok(new ExamDto
        {
            Id = e.Id,
            GroupId = e.GroupId,
            GroupName = e.Group?.Name ?? "",
            CourseId = e.CourseId,
            CourseName = e.Course?.Name ?? "",
            Title = e.Title,
            ExamDate = e.ExamDate,
            MaxScore = e.MaxScore,
            PassingScore = e.PassingScore,
            Description = e.Description,
            SubmissionsCount = e.Results.Count,
            AverageScore = e.Results.Any() ? Math.Round(e.Results.Average(r => r.Score), 1) : 0,
            CreatedAt = e.CreatedAt,
            Results = e.Results.Select(r => new ExamResultDto
            {
                Id = r.Id,
                ExamId = r.ExamId,
                ExamTitle = e.Title,
                StudentId = r.StudentId,
                StudentName = r.Student?.FullName ?? "",
                Score = r.Score,
                Grade = r.Grade,
                GradeLetter = r.Grade.ToString(),
                TeacherFeedback = r.TeacherFeedback,
                EvaluatedAt = r.EvaluatedAt
            }).ToList()
        });
    }

    public async Task<ApiResponse<ExamDto>> CreateExamAsync(CreateExamDto request)
    {
        var group = await _db.Groups.Include(g => g.Course).FirstOrDefaultAsync(g => g.Id == request.GroupId);
        if (group == null) return ApiResponse<ExamDto>.Fail("Guruh topilmadi.");

        var exam = new Exam
        {
            Id = Guid.NewGuid(),
            GroupId = group.Id,
            CourseId = group.CourseId,
            Title = request.Title.Trim(),
            ExamDate = request.ExamDate,
            MaxScore = request.MaxScore > 0 ? request.MaxScore : 100,
            PassingScore = request.PassingScore > 0 ? request.PassingScore : 60,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow
        };

        _db.Exams.Add(exam);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("CREATE_EXAM", "Exam", exam.Id.ToString(), $"Yangi imtihon belgilandi: {exam.Title} ({group.Name})");

        return ApiResponse<ExamDto>.Ok(new ExamDto
        {
            Id = exam.Id,
            GroupId = exam.GroupId,
            GroupName = group.Name,
            CourseId = exam.CourseId,
            CourseName = group.Course?.Name ?? "",
            Title = exam.Title,
            ExamDate = exam.ExamDate,
            MaxScore = exam.MaxScore,
            PassingScore = exam.PassingScore,
            Description = exam.Description,
            CreatedAt = exam.CreatedAt
        }, "Imtihon muvaffaqiyatli yaratildi.");
    }

    public async Task<ApiResponse<bool>> SaveExamResultsBatchAsync(BatchSaveExamResultsDto request)
    {
        var exam = await _db.Exams.Include(e => e.Results).FirstOrDefaultAsync(e => e.Id == request.ExamId);
        if (exam == null) return ApiResponse<bool>.Fail("Imtihon topilmadi.");

        foreach (var item in request.Results)
        {
            var existing = exam.Results.FirstOrDefault(r => r.StudentId == item.StudentId);
            var pct = exam.MaxScore > 0 ? (double)item.Score / exam.MaxScore * 100.0 : 0;
            var grade = pct >= 90 ? ExamGrade.A
                      : pct >= 80 ? ExamGrade.B
                      : pct >= 70 ? ExamGrade.C
                      : pct >= 60 ? ExamGrade.D
                      : ExamGrade.F;

            if (existing == null)
            {
                exam.Results.Add(new ExamResult
                {
                    Id = Guid.NewGuid(),
                    ExamId = exam.Id,
                    StudentId = item.StudentId,
                    Score = item.Score,
                    Grade = grade,
                    TeacherFeedback = item.TeacherFeedback,
                    EvaluatedAt = DateTime.UtcNow
                });
            }
            else
            {
                existing.Score = item.Score;
                existing.Grade = grade;
                existing.TeacherFeedback = item.TeacherFeedback;
                existing.EvaluatedAt = DateTime.UtcNow;
            }
        }

        await _db.SaveChangesAsync();
        await _audit.LogAsync("GRADE_EXAM", "Exam", exam.Id.ToString(), $"{request.Results.Count} ta o'quvchining imtihon baholari saqlandi.");

        return ApiResponse<bool>.Ok(true, "Imtihon natijalari muvaffaqiyatli saqlandi.");
    }

    public async Task<ApiResponse<List<ExamResultDto>>> GetStudentExamResultsAsync(Guid? studentId = null)
    {
        var targetStudentId = studentId ?? _currentUser.UserId;
        if (!targetStudentId.HasValue)
            return ApiResponse<List<ExamResultDto>>.Fail("O'quvchi aniqlanmadi.");

        var results = await _db.ExamResults
            .Include(r => r.Exam).ThenInclude(e => e.Course)
            .Include(r => r.Student)
            .Where(r => r.StudentId == targetStudentId.Value)
            .OrderByDescending(r => r.EvaluatedAt)
            .Select(r => new ExamResultDto
            {
                Id = r.Id,
                ExamId = r.ExamId,
                ExamTitle = r.Exam.Title,
                StudentId = r.StudentId,
                StudentName = r.Student.FullName,
                Score = r.Score,
                Grade = r.Grade,
                GradeLetter = r.Grade.ToString(),
                TeacherFeedback = r.TeacherFeedback,
                EvaluatedAt = r.EvaluatedAt
            })
            .ToListAsync();

        return ApiResponse<List<ExamResultDto>>.Ok(results);
    }
}

// ==========================================
// 5. CERTIFICATE SERVICE
// ==========================================
public class CertificateService : ICertificateService
{
    private readonly EduFlowDbContext _db;
    private readonly IAuditLogService _audit;

    public CertificateService(EduFlowDbContext db, IAuditLogService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task<ApiResponse<List<CertificateDto>>> GetCertificatesAsync(Guid? studentId = null)
    {
        var query = _db.Certificates
            .Include(c => c.Student)
            .Include(c => c.Course)
            .Include(c => c.Center)
            .AsQueryable();

        if (studentId.HasValue)
            query = query.Where(c => c.StudentId == studentId.Value);

        var list = await query
            .OrderByDescending(c => c.IssuedAt)
            .Select(c => new CertificateDto
            {
                Id = c.Id,
                CertificateCode = c.CertificateCode,
                StudentId = c.StudentId,
                StudentName = c.Student.FullName,
                CourseId = c.CourseId,
                CourseName = c.Course.Name,
                CenterId = c.CenterId,
                CenterName = c.Center != null ? c.Center.Name : null,
                IssuedAt = c.IssuedAt,
                FinalScore = c.FinalScore,
                GradeLetter = c.GradeLetter,
                VerificationUrl = c.VerificationUrl
            })
            .ToListAsync();

        return ApiResponse<List<CertificateDto>>.Ok(list);
    }

    public async Task<ApiResponse<CertificateDto>> IssueCertificateAsync(IssueCertificateDto request)
    {
        var student = await _db.Users.FindAsync(request.StudentId);
        if (student == null) return ApiResponse<CertificateDto>.Fail("O'quvchi topilmadi.");

        var course = await _db.Courses.FindAsync(request.CourseId);
        if (course == null) return ApiResponse<CertificateDto>.Fail("Kurs topilmadi.");

        var existing = await _db.Certificates
            .FirstOrDefaultAsync(c => c.StudentId == request.StudentId && c.CourseId == request.CourseId);

        if (existing != null)
            return ApiResponse<CertificateDto>.Fail("Ushbu o'quvchiga ushbu kurs bo'yicha allaqachon sertifikat berilgan.");

        var randCode = $"EDF-{DateTime.UtcNow:yyMM}-{Random.Shared.Next(1000, 9999)}";
        var gradeLetter = request.FinalScore >= 90 ? "A+" : request.FinalScore >= 80 ? "A" : request.FinalScore >= 70 ? "B" : "C";

        var cert = new Certificate
        {
            Id = Guid.NewGuid(),
            CertificateCode = randCode,
            StudentId = request.StudentId,
            CourseId = request.CourseId,
            CenterId = student.CenterId,
            IssuedAt = DateTime.UtcNow,
            FinalScore = request.FinalScore,
            GradeLetter = gradeLetter,
            VerificationUrl = $"/verify-certificate/{randCode}"
        };

        _db.Certificates.Add(cert);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("ISSUE_CERTIFICATE", "Certificate", cert.Id.ToString(),
            $"{student.FullName} ga \"{course.Name}\" kursi bo'yicha sertifikat topshirildi ({randCode})");

        return ApiResponse<CertificateDto>.Ok(new CertificateDto
        {
            Id = cert.Id,
            CertificateCode = cert.CertificateCode,
            StudentId = cert.StudentId,
            StudentName = student.FullName,
            CourseId = cert.CourseId,
            CourseName = course.Name,
            CenterId = cert.CenterId,
            IssuedAt = cert.IssuedAt,
            FinalScore = cert.FinalScore,
            GradeLetter = cert.GradeLetter,
            VerificationUrl = cert.VerificationUrl
        }, "Sertifikat muvaffaqiyatli topshirildi va QR tasdiq kodi generatsiya qilindi.");
    }

    public async Task<ApiResponse<CertificateDto>> VerifyCertificateAsync(string certificateCode)
    {
        var cert = await _db.Certificates
            .Include(c => c.Student)
            .Include(c => c.Course)
            .Include(c => c.Center)
            .FirstOrDefaultAsync(c => c.CertificateCode.ToLower() == certificateCode.Trim().ToLower());

        if (cert == null)
            return ApiResponse<CertificateDto>.Fail("Sertifikat topilmadi yoki kiritilgan kod haqiqiy emas.");

        return ApiResponse<CertificateDto>.Ok(new CertificateDto
        {
            Id = cert.Id,
            CertificateCode = cert.CertificateCode,
            StudentId = cert.StudentId,
            StudentName = cert.Student.FullName,
            CourseId = cert.CourseId,
            CourseName = cert.Course.Name,
            CenterId = cert.CenterId,
            CenterName = cert.Center?.Name,
            IssuedAt = cert.IssuedAt,
            FinalScore = cert.FinalScore,
            GradeLetter = cert.GradeLetter,
            VerificationUrl = cert.VerificationUrl
        }, "Sertifikat haqiqiy va davlat tasdiqlagan EDUFlow standarti bo'yicha rasmiylashtirilgan.");
    }
}

// ==========================================
// 6. STUDENT RISK DETECTION SERVICE
// ==========================================
public class StudentRiskService : IStudentRiskService
{
    private readonly EduFlowDbContext _db;

    public StudentRiskService(EduFlowDbContext db)
    {
        _db = db;
    }

    public async Task<ApiResponse<List<StudentRiskDto>>> GetStudentRisksAsync(Guid? centerId = null, Guid? groupId = null)
    {
        var query = _db.Users
            .Where(u => u.Role == UserRole.Student && u.Status == UserStatus.Active)
            .Include(u => u.Enrollments).ThenInclude(e => e.Group).ThenInclude(g => g.Course)
            .Include(u => u.Payments)
            .Include(u => u.Attendances)
            .Include(u => u.Submissions)
            .AsQueryable();

        if (centerId.HasValue)
            query = query.Where(u => u.CenterId == centerId.Value);

        if (groupId.HasValue)
            query = query.Where(u => u.Enrollments.Any(e => e.GroupId == groupId.Value && e.Status == EnrollmentStatus.Active));

        var students = await query.ToListAsync();
        var risks = new List<StudentRiskDto>();

        foreach (var s in students)
        {
            var enrollment = s.Enrollments.FirstOrDefault(e => e.Status == EnrollmentStatus.Active);
            var groupName = enrollment?.Group?.Name ?? "Guruhsiz";
            var courseName = enrollment?.Group?.Course?.Name ?? "Kurs biriktirilmagan";
            var coursePrice = enrollment?.Group?.Course?.Price > 0 ? enrollment.Group.Course.Price : 800000m;

            // Attendance rate
            var attendances = s.Attendances.ToList();
            int totalLessons = attendances.Count;
            int missedLessons = attendances.Count(a => a.Status == AttendanceStatus.Absent);
            double attendanceRate = totalLessons > 0
                ? Math.Round((attendances.Count(a => a.Status == AttendanceStatus.Present) + 0.5 * attendances.Count(a => a.Status == AttendanceStatus.Late)) / totalLessons * 100, 1)
                : 100.0;

            // Payments and Balance
            var enrolledMonths = 1;
            if (s.Enrollments.Any())
            {
                var earliestJoin = s.Enrollments.Min(e => e.JoinedAt);
                enrolledMonths = Math.Max(1, (int)Math.Ceiling((DateTime.UtcNow - earliestJoin).TotalDays / 30.0));
            }
            var totalPaid = s.Payments.Where(p => p.Status == PaymentStatus.Completed).Sum(p => p.Amount);
            var balance = totalPaid - (enrolledMonths * coursePrice);
            decimal overdueDebt = balance < 0 ? Math.Abs(balance) : 0;

            // Missing assignments
            var activeGroupId = enrollment?.GroupId;
            int totalGroupAssignments = activeGroupId.HasValue
                ? await _db.Assignments.CountAsync(a => a.GroupId == activeGroupId.Value)
                : 0;
            int submittedCount = s.Submissions.Count;
            int missingAssignments = Math.Max(0, totalGroupAssignments - submittedCount);

            // Compute composite risk score (0 to 100)
            int score = 0;
            var factors = new List<string>();

            if (attendanceRate < 50)
            {
                score += 45;
                factors.Add($"Davomat juda past ({attendanceRate}%)");
            }
            else if (attendanceRate < 75)
            {
                score += 25;
                factors.Add($"Davomat pasaygan ({attendanceRate}%)");
            }

            if (overdueDebt > coursePrice)
            {
                score += 35;
                factors.Add($"Qarzdorlik 1 oydan oshgan ({overdueDebt:N0} UZS)");
            }
            else if (overdueDebt > 0)
            {
                score += 20;
                factors.Add($"Qarzdorlik mavjud ({overdueDebt:N0} UZS)");
            }

            if (missingAssignments >= 3)
            {
                score += 25;
                factors.Add($"{missingAssignments} ta topshirilmagan uy vazifasi bor");
            }
            else if (missingAssignments > 0)
            {
                score += 10;
                factors.Add($"{missingAssignments} ta vazifa kechikmoqda");
            }

            score = Math.Min(100, score);
            var riskLevel = score >= 55 ? StudentRiskLevel.High : score >= 25 ? StudentRiskLevel.Medium : StudentRiskLevel.Low;

            string action = riskLevel switch
            {
                StudentRiskLevel.High => "Ota-onasi bilan shoshilinch bog'lanish va individual suhbatga chaqirish tavsiya etiladi.",
                StudentRiskLevel.Medium => "O'qituvchiga darsdagi ishtirokini kuchaytirish va vazifalarini surishtirish tavsiya etiladi.",
                _ => "O'quvchi faol holatda. Qo'shimcha chora talab etilmaydi."
            };

            risks.Add(new StudentRiskDto
            {
                StudentId = s.Id,
                StudentName = s.FullName,
                Phone = s.Phone,
                ParentPhone = s.ParentPhone,
                GroupName = groupName,
                CourseName = courseName,
                AttendanceRate = attendanceRate,
                MissedLessonsCount = missedLessons,
                OverdueDebt = overdueDebt,
                MissingAssignmentsCount = missingAssignments,
                RiskScore = score,
                RiskLevel = riskLevel,
                RiskLevelText = riskLevel switch
                {
                    StudentRiskLevel.High => "Yuqori xavf (Dropout xavfi)",
                    StudentRiskLevel.Medium => "O'rtacha xavf",
                    _ => "Barqaror"
                },
                RiskFactors = factors,
                RecommendedAction = action
            });
        }

        return ApiResponse<List<StudentRiskDto>>.Ok(risks.OrderByDescending(r => r.RiskScore).ToList());
    }
}

// ==========================================
// 7. PARENT PORTAL SERVICE
// ==========================================
public class ParentService : IParentService
{
    private readonly EduFlowDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ParentService(EduFlowDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<ParentChildDto>>> GetMyChildrenAsync()
    {
        if (!_currentUser.UserId.HasValue)
            return ApiResponse<List<ParentChildDto>>.Fail("Avtorizatsiyadan o'tilmagan.");

        var parent = await _db.Users.FindAsync(_currentUser.UserId.Value);
        if (parent == null) return ApiResponse<List<ParentChildDto>>.Fail("Ota-ona topilmadi.");

        var cleanParentPhone = (parent.Phone ?? "").Replace(" ", "").Replace("-", "").Replace("+", "");

        // Find children linked by ParentId or matching ParentPhone
        var children = await _db.Users
            .Where(u => u.Role == UserRole.Student &&
                        (u.ParentId == parent.Id ||
                         (!string.IsNullOrEmpty(u.ParentPhone) &&
                          u.ParentPhone.Replace(" ", "").Replace("-", "").Replace("+", "") == cleanParentPhone)))
            .Include(u => u.Enrollments).ThenInclude(e => e.Group).ThenInclude(g => g.Course)
            .Include(u => u.Enrollments).ThenInclude(e => e.Group).ThenInclude(g => g.Teacher)
            .Include(u => u.Payments)
            .Include(u => u.Attendances).ThenInclude(a => a.Lesson)
            .Include(u => u.Submissions)
            .ToListAsync();

        var result = new List<ParentChildDto>();

        foreach (var c in children)
        {
            var enrollment = c.Enrollments.FirstOrDefault(e => e.Status == EnrollmentStatus.Active);
            var coursePrice = enrollment?.Group?.Course?.Price > 0 ? enrollment.Group.Course.Price : 800000m;

            var enrolledMonths = 1;
            if (c.Enrollments.Any())
            {
                var earliestJoin = c.Enrollments.Min(e => e.JoinedAt);
                enrolledMonths = Math.Max(1, (int)Math.Ceiling((DateTime.UtcNow - earliestJoin).TotalDays / 30.0));
            }

            var totalPaid = c.Payments.Where(p => p.Status == PaymentStatus.Completed).Sum(p => p.Amount);
            var balance = totalPaid - (enrolledMonths * coursePrice);

            var attendances = c.Attendances.ToList();
            var attPct = attendances.Count > 0
                ? Math.Round((attendances.Count(a => a.Status == AttendanceStatus.Present) + 0.5 * attendances.Count(a => a.Status == AttendanceStatus.Late)) / attendances.Count * 100, 1)
                : 100.0;

            var recentAtts = attendances
                .OrderByDescending(a => a.Lesson?.StartsAt ?? DateTime.UtcNow)
                .Take(5)
                .Select(a => new AttendanceDto
                {
                    Id = a.Id,
                    LessonId = a.LessonId,
                    LessonTitle = a.Lesson?.Title ?? "Dars",
                    StudentId = a.StudentId,
                    StudentName = c.FullName,
                    LessonDate = a.Lesson?.StartsAt ?? DateTime.UtcNow,
                    Status = a.Status
                }).ToList();

            var recentPays = c.Payments
                .OrderByDescending(p => p.PaidAt)
                .Take(5)
                .Select(p => new PaymentDto
                {
                    Id = p.Id,
                    StudentId = p.StudentId,
                    StudentName = c.FullName,
                    Amount = p.Amount,
                    PaidAt = p.PaidAt,
                    Method = p.Method,
                    Status = p.Status,
                    Note = p.Note
                }).ToList();

            var examResults = await _db.ExamResults
                .Include(r => r.Exam)
                .Where(r => r.StudentId == c.Id)
                .OrderByDescending(r => r.EvaluatedAt)
                .Take(5)
                .Select(r => new ExamResultDto
                {
                    Id = r.Id,
                    ExamId = r.ExamId,
                    ExamTitle = r.Exam.Title,
                    StudentId = r.StudentId,
                    StudentName = c.FullName,
                    Score = r.Score,
                    Grade = r.Grade,
                    GradeLetter = r.Grade.ToString(),
                    TeacherFeedback = r.TeacherFeedback,
                    EvaluatedAt = r.EvaluatedAt
                }).ToListAsync();

            result.Add(new ParentChildDto
            {
                ChildId = c.Id,
                FullName = c.FullName,
                Phone = c.Phone,
                Email = c.Email,
                GroupName = enrollment?.Group?.Name,
                CourseName = enrollment?.Group?.Course?.Name,
                TeacherName = enrollment?.Group?.Teacher?.FullName,
                AttendancePercentage = attPct,
                Balance = balance,
                MonthlyTuition = coursePrice,
                PendingAssignmentsCount = 0,
                AverageGradeScore = examResults.Any() ? Math.Round(examResults.Average(r => r.Score), 1) : 0,
                RecentAttendances = recentAtts,
                RecentExamResults = examResults,
                RecentPayments = recentPays
            });
        }

        return ApiResponse<List<ParentChildDto>>.Ok(result);
    }
}
