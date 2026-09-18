using EduFlow.Application.Common;
using EduFlow.Application.DTOs;
using EduFlow.Application.Interfaces;
using EduFlow.Domain.Entities;
using EduFlow.Domain.Enums;
using EduFlow.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EduFlow.Infrastructure.Services;

public class LessonService : ILessonService
{
    private readonly EduFlowDbContext _db;
    private readonly IAuditLogService _audit;
    private readonly ICurrentUserService _currentUser;

    public LessonService(EduFlowDbContext db, IAuditLogService audit, ICurrentUserService currentUser)
    {
        _db = db;
        _audit = audit;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<LessonDto>>> GetLessonsAsync(Guid? groupId = null, DateTime? date = null)
    {
        var query = _db.Lessons
            .Include(l => l.Group)
                .ThenInclude(g => g.Teacher)
            .Include(l => l.Group)
                .ThenInclude(g => g.Enrollments)
            .AsQueryable();

        if (groupId.HasValue)
            query = query.Where(l => l.GroupId == groupId.Value);

        if (date.HasValue)
        {
            var d = DateTime.SpecifyKind(date.Value.Date, DateTimeKind.Utc);
            var nextD = d.AddDays(1);
            query = query.Where(l => l.StartsAt >= d && l.StartsAt < nextD);
        }

        if (_currentUser.Role == UserRole.Teacher && _currentUser.UserId.HasValue)
        {
            query = query.Where(l => l.Group.TeacherId == _currentUser.UserId.Value);
        }
        else if (_currentUser.Role == UserRole.Student && _currentUser.UserId.HasValue)
        {
            query = query.Where(l => l.Group.Enrollments.Any(e => e.StudentId == _currentUser.UserId.Value && e.Status == EnrollmentStatus.Active));
        }

        var lessons = await query
            .OrderBy(l => l.StartsAt)
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

        return ApiResponse<List<LessonDto>>.Ok(lessons);
    }

    public async Task<ApiResponse<LessonDto>> GetLessonByIdAsync(Guid id)
    {
        var l = await _db.Lessons
            .Include(l => l.Group)
                .ThenInclude(g => g.Teacher)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (l == null)
            return ApiResponse<LessonDto>.Fail("Dars topilmadi.");

        return ApiResponse<LessonDto>.Ok(new LessonDto
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
        });
    }

    public async Task<ApiResponse<LessonDto>> CreateLessonAsync(CreateLessonDto request)
    {
        if (request.EndsAt <= request.StartsAt)
            return ApiResponse<LessonDto>.Fail("Dars tugash vaqti boshlanish vaqtidan keyin bo'lishi kerak.");

        var group = await _db.Groups.Include(g => g.Teacher).FirstOrDefaultAsync(g => g.Id == request.GroupId);
        if (group == null)
            return ApiResponse<LessonDto>.Fail("Guruh topilmadi.");

        // Validation 1: Room conflict (if room specified)
        if (!string.IsNullOrWhiteSpace(request.Room))
        {
            var roomConflict = await _db.Lessons
                .AnyAsync(l => l.Room.ToLower() == request.Room.ToLower() &&
                               l.StartsAt < request.EndsAt &&
                               l.EndsAt > request.StartsAt);

            if (roomConflict)
            {
                return ApiResponse<LessonDto>.Fail($"Kesishuv aniqlandi: '{request.Room}' xonasi belgilangan vaqtda boshqa dars bilan band.");
            }
        }

        // Validation 2: Teacher schedule conflict
        var teacherConflict = await _db.Lessons
            .Include(l => l.Group)
            .AnyAsync(l => l.Group.TeacherId == group.TeacherId &&
                           l.StartsAt < request.EndsAt &&
                           l.EndsAt > request.StartsAt);

        if (teacherConflict)
        {
            return ApiResponse<LessonDto>.Fail($"Kesishuv aniqlandi: O'qituvchi ({group.Teacher.FullName}) belgilangan vaqtda boshqa darsga ega.");
        }

        var lesson = new Lesson
        {
            GroupId = request.GroupId,
            Title = request.Title.Trim(),
            StartsAt = DateTime.SpecifyKind(request.StartsAt, DateTimeKind.Utc),
            EndsAt = DateTime.SpecifyKind(request.EndsAt, DateTimeKind.Utc),
            Room = request.Room.Trim(),
            OnlineUrl = request.OnlineUrl?.Trim()
        };

        _db.Lessons.Add(lesson);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("CREATE", "Lesson", lesson.Id.ToString(), $"Dars yaratildi: {lesson.Title} ({group.Name})");

        return ApiResponse<LessonDto>.Ok(new LessonDto
        {
            Id = lesson.Id,
            GroupId = lesson.GroupId,
            GroupName = group.Name,
            Title = lesson.Title,
            StartsAt = lesson.StartsAt,
            EndsAt = lesson.EndsAt,
            Room = lesson.Room,
            OnlineUrl = lesson.OnlineUrl,
            TeacherId = group.TeacherId,
            TeacherName = group.Teacher.FullName
        }, "Dars jadvalga kiritildi.");
    }

    public async Task<ApiResponse<bool>> DeleteLessonAsync(Guid id)
    {
        var lesson = await _db.Lessons.FindAsync(id);
        if (lesson == null)
            return ApiResponse<bool>.Fail("Dars topilmadi.");

        _db.Lessons.Remove(lesson);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("DELETE", "Lesson", id.ToString(), $"Dars o'chirildi: {lesson.Title}");

        return ApiResponse<bool>.Ok(true, "Dars o'chirildi.");
    }
}

public class AttendanceService : IAttendanceService
{
    private readonly EduFlowDbContext _db;
    private readonly IAuditLogService _audit;
    private readonly ICurrentUserService _currentUser;

    public AttendanceService(EduFlowDbContext db, IAuditLogService audit, ICurrentUserService currentUser)
    {
        _db = db;
        _audit = audit;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<AttendanceDto>>> GetAttendanceByLessonAsync(Guid lessonId)
    {
        var lesson = await _db.Lessons
            .Include(l => l.Group)
                .ThenInclude(g => g.Enrollments)
                    .ThenInclude(e => e.Student)
            .FirstOrDefaultAsync(l => l.Id == lessonId);

        if (lesson == null)
            return ApiResponse<List<AttendanceDto>>.Fail("Dars topilmadi.");

        // Teacher role check: teacher can only see attendance of their own groups
        if (_currentUser.Role == UserRole.Teacher && _currentUser.UserId.HasValue && lesson.Group.TeacherId != _currentUser.UserId.Value)
        {
            return ApiResponse<List<AttendanceDto>>.Fail("Siz faqat o'z guruhingiz davomadini ko'ra olasiz.");
        }

        var existingAttendances = await _db.Attendances
            .Where(a => a.LessonId == lessonId)
            .ToDictionaryAsync(a => a.StudentId);

        // Include all active enrolled students in this group
        var list = new List<AttendanceDto>();
        foreach (var enrollment in lesson.Group.Enrollments.Where(e => e.Status == EnrollmentStatus.Active))
        {
            if (existingAttendances.TryGetValue(enrollment.StudentId, out var att))
            {
                list.Add(new AttendanceDto
                {
                    Id = att.Id,
                    LessonId = lesson.Id,
                    LessonTitle = lesson.Title,
                    StudentId = enrollment.StudentId,
                    StudentName = enrollment.Student.FullName,
                    Status = att.Status,
                    Note = att.Note
                });
            }
            else
            {
                list.Add(new AttendanceDto
                {
                    Id = Guid.Empty,
                    LessonId = lesson.Id,
                    LessonTitle = lesson.Title,
                    StudentId = enrollment.StudentId,
                    StudentName = enrollment.Student.FullName,
                    Status = AttendanceStatus.Present,
                    Note = null
                });
            }
        }

        return ApiResponse<List<AttendanceDto>>.Ok(list.OrderBy(x => x.StudentName).ToList());
    }

    public async Task<ApiResponse<bool>> SaveAttendanceBatchAsync(SaveAttendanceBatchDto request)
    {
        var lesson = await _db.Lessons.Include(l => l.Group).FirstOrDefaultAsync(l => l.Id == request.LessonId);
        if (lesson == null)
            return ApiResponse<bool>.Fail("Dars topilmadi.");

        if (_currentUser.Role == UserRole.Teacher && _currentUser.UserId.HasValue && lesson.Group.TeacherId != _currentUser.UserId.Value)
        {
            return ApiResponse<bool>.Fail("O'qituvchi faqat o'z guruhiga davomad qo'ya oladi.");
        }

        foreach (var item in request.Items)
        {
            var existing = await _db.Attendances.FirstOrDefaultAsync(a => a.LessonId == request.LessonId && a.StudentId == item.StudentId);
            if (existing != null)
            {
                existing.Status = item.Status;
                existing.Note = item.Note;
            }
            else
            {
                _db.Attendances.Add(new Attendance
                {
                    LessonId = request.LessonId,
                    StudentId = item.StudentId,
                    Status = item.Status,
                    Note = item.Note
                });
            }
        }

        await _db.SaveChangesAsync();
        await _audit.LogAsync("ATTENDANCE", "Lesson", request.LessonId.ToString(), $"Davomad saqlandi ({lesson.Title})");

        return ApiResponse<bool>.Ok(true, "Davomad saqlandi.");
    }
}
