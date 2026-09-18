using EduFlow.Application.Common;
using EduFlow.Application.DTOs;
using EduFlow.Application.Interfaces;
using EduFlow.Domain.Entities;
using EduFlow.Domain.Enums;
using EduFlow.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EduFlow.Infrastructure.Services;

public class CourseService : ICourseService
{
    private readonly EduFlowDbContext _db;
    private readonly IAuditLogService _audit;

    public CourseService(EduFlowDbContext db, IAuditLogService audit)
    {
        _db = db;
        _audit = audit;
    }

    public async Task<ApiResponse<List<CourseDto>>> GetCoursesAsync()
    {
        var courses = await _db.Courses
            .Include(c => c.Groups)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CourseDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Price = c.Price,
                DurationWeeks = c.DurationWeeks,
                Status = c.Status,
                GroupsCount = c.Groups.Count,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<List<CourseDto>>.Ok(courses);
    }

    public async Task<ApiResponse<CourseDto>> GetCourseByIdAsync(Guid id)
    {
        var c = await _db.Courses.Include(c => c.Groups).FirstOrDefaultAsync(c => c.Id == id);
        if (c == null)
            return ApiResponse<CourseDto>.Fail("Kurs topilmadi.");

        return ApiResponse<CourseDto>.Ok(new CourseDto
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            Price = c.Price,
            DurationWeeks = c.DurationWeeks,
            Status = c.Status,
            GroupsCount = c.Groups.Count,
            CreatedAt = c.CreatedAt
        });
    }

    public async Task<ApiResponse<CourseDto>> CreateCourseAsync(CreateCourseDto request)
    {
        var course = new Course
        {
            Name = request.Name.Trim(),
            Description = request.Description,
            Price = request.Price,
            DurationWeeks = request.DurationWeeks,
            Status = request.Status,
            CreatedAt = DateTime.UtcNow
        };

        _db.Courses.Add(course);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("CREATE", "Course", course.Id.ToString(), $"Yangi kurs yaratildi: {course.Name}");

        return ApiResponse<CourseDto>.Ok(new CourseDto
        {
            Id = course.Id,
            Name = course.Name,
            Description = course.Description,
            Price = course.Price,
            DurationWeeks = course.DurationWeeks,
            Status = course.Status,
            GroupsCount = 0,
            CreatedAt = course.CreatedAt
        }, "Kurs muvaffaqiyatli yaratildi.");
    }

    public async Task<ApiResponse<CourseDto>> UpdateCourseAsync(Guid id, CreateCourseDto request)
    {
        var course = await _db.Courses.FindAsync(id);
        if (course == null)
            return ApiResponse<CourseDto>.Fail("Kurs topilmadi.");

        course.Name = request.Name.Trim();
        course.Description = request.Description;
        course.Price = request.Price;
        course.DurationWeeks = request.DurationWeeks;
        course.Status = request.Status;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("UPDATE", "Course", course.Id.ToString(), $"Kurs tahrirlandi: {course.Name}");

        return ApiResponse<CourseDto>.Ok(new CourseDto
        {
            Id = course.Id,
            Name = course.Name,
            Description = course.Description,
            Price = course.Price,
            DurationWeeks = course.DurationWeeks,
            Status = course.Status,
            GroupsCount = await _db.Groups.CountAsync(g => g.CourseId == id),
            CreatedAt = course.CreatedAt
        }, "Kurs yangilandi.");
    }

    public async Task<ApiResponse<bool>> DeleteCourseAsync(Guid id)
    {
        var course = await _db.Courses.Include(c => c.Groups).FirstOrDefaultAsync(c => c.Id == id);
        if (course == null)
            return ApiResponse<bool>.Fail("Kurs topilmadi.");

        if (course.Groups.Any())
            return ApiResponse<bool>.Fail("Ushbu kursga tegishli guruhlar mavjud. Avval guruhlarni o'chiring yoki boshqa kursga ko'chiring.");

        _db.Courses.Remove(course);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("DELETE", "Course", id.ToString(), $"Kurs o'chirildi: {course.Name}");

        return ApiResponse<bool>.Ok(true, "Kurs muvaffaqiyatli o'chirildi.");
    }
}

public class GroupService : IGroupService
{
    private readonly EduFlowDbContext _db;
    private readonly IAuditLogService _audit;
    private readonly ICurrentUserService _currentUser;

    public GroupService(EduFlowDbContext db, IAuditLogService audit, ICurrentUserService currentUser)
    {
        _db = db;
        _audit = audit;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<GroupDto>>> GetGroupsAsync(Guid? teacherId = null)
    {
        var query = _db.Groups
            .Include(g => g.Course)
            .Include(g => g.Teacher)
            .Include(g => g.Enrollments)
            .AsQueryable();

        if (teacherId.HasValue)
            query = query.Where(g => g.TeacherId == teacherId.Value);
        else if (_currentUser.Role == UserRole.Teacher && _currentUser.UserId.HasValue)
            query = query.Where(g => g.TeacherId == _currentUser.UserId.Value);
        else if (_currentUser.Role == UserRole.Student && _currentUser.UserId.HasValue)
            query = query.Where(g => g.Enrollments.Any(e => e.StudentId == _currentUser.UserId.Value));

        var list = await query
            .OrderByDescending(g => g.CreatedAt)
            .Select(g => new GroupDto
            {
                Id = g.Id,
                Name = g.Name,
                CourseId = g.CourseId,
                CourseName = g.Course.Name,
                TeacherId = g.TeacherId,
                TeacherName = g.Teacher.FullName,
                StartDate = g.StartDate,
                EndDate = g.EndDate,
                Status = g.Status,
                StudentsCount = g.Enrollments.Count(e => e.Status == EnrollmentStatus.Active),
                CreatedAt = g.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<List<GroupDto>>.Ok(list);
    }

    public async Task<ApiResponse<GroupDto>> GetGroupByIdAsync(Guid id)
    {
        var g = await _db.Groups
            .Include(g => g.Course)
            .Include(g => g.Teacher)
            .Include(g => g.Enrollments)
            .FirstOrDefaultAsync(g => g.Id == id);

        if (g == null)
            return ApiResponse<GroupDto>.Fail("Guruh topilmadi.");

        return ApiResponse<GroupDto>.Ok(new GroupDto
        {
            Id = g.Id,
            Name = g.Name,
            CourseId = g.CourseId,
            CourseName = g.Course.Name,
            TeacherId = g.TeacherId,
            TeacherName = g.Teacher.FullName,
            StartDate = g.StartDate,
            EndDate = g.EndDate,
            Status = g.Status,
            StudentsCount = g.Enrollments.Count(e => e.Status == EnrollmentStatus.Active),
            CreatedAt = g.CreatedAt
        });
    }

    public async Task<ApiResponse<GroupDto>> CreateGroupAsync(CreateGroupDto request)
    {
        var course = await _db.Courses.FindAsync(request.CourseId);
        if (course == null)
            return ApiResponse<GroupDto>.Fail("Tanlangan kurs topilmadi.");

        var teacher = await _db.Users.FindAsync(request.TeacherId);
        if (teacher == null || teacher.Role != UserRole.Teacher)
            return ApiResponse<GroupDto>.Fail("Tanlangan o'qituvchi yaroqsiz.");

        var group = new Group
        {
            Name = request.Name.Trim(),
            CourseId = request.CourseId,
            TeacherId = request.TeacherId,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Status = request.Status,
            CreatedAt = DateTime.UtcNow
        };

        _db.Groups.Add(group);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("CREATE", "Group", group.Id.ToString(), $"Yangi guruh ochildi: {group.Name}");

        return ApiResponse<GroupDto>.Ok(new GroupDto
        {
            Id = group.Id,
            Name = group.Name,
            CourseId = course.Id,
            CourseName = course.Name,
            TeacherId = teacher.Id,
            TeacherName = teacher.FullName,
            StartDate = group.StartDate,
            EndDate = group.EndDate,
            Status = group.Status,
            StudentsCount = 0,
            CreatedAt = group.CreatedAt
        }, "Guruh yaratildi.");
    }

    public async Task<ApiResponse<GroupDto>> UpdateGroupAsync(Guid id, CreateGroupDto request)
    {
        var group = await _db.Groups.Include(g => g.Course).Include(g => g.Teacher).FirstOrDefaultAsync(g => g.Id == id);
        if (group == null)
            return ApiResponse<GroupDto>.Fail("Guruh topilmadi.");

        group.Name = request.Name.Trim();
        group.CourseId = request.CourseId;
        group.TeacherId = request.TeacherId;
        group.StartDate = request.StartDate;
        group.EndDate = request.EndDate;
        group.Status = request.Status;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("UPDATE", "Group", group.Id.ToString(), $"Guruh tahrirlandi: {group.Name}");

        return await GetGroupByIdAsync(id);
    }

    public async Task<ApiResponse<bool>> DeleteGroupAsync(Guid id)
    {
        var group = await _db.Groups.FindAsync(id);
        if (group == null)
            return ApiResponse<bool>.Fail("Guruh topilmadi.");

        _db.Groups.Remove(group);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("DELETE", "Group", id.ToString(), $"Guruh o'chirildi: {group.Name}");

        return ApiResponse<bool>.Ok(true, "Guruh o'chirildi.");
    }

    public async Task<ApiResponse<List<EnrollmentDto>>> GetGroupStudentsAsync(Guid groupId)
    {
        var enrollments = await _db.Enrollments
            .Include(e => e.Group)
            .Include(e => e.Student)
            .Where(e => e.GroupId == groupId)
            .OrderBy(e => e.Student.FullName)
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

        return ApiResponse<List<EnrollmentDto>>.Ok(enrollments);
    }

    public async Task<ApiResponse<EnrollmentDto>> EnrollStudentAsync(EnrollStudentDto request)
    {
        var group = await _db.Groups.FindAsync(request.GroupId);
        if (group == null)
            return ApiResponse<EnrollmentDto>.Fail("Guruh topilmadi.");

        var student = await _db.Users.FindAsync(request.StudentId);
        if (student == null || student.Role != UserRole.Student)
            return ApiResponse<EnrollmentDto>.Fail("Tanlangan foydalanuvchi student emas.");

        if (student.Status != UserStatus.Active)
            return ApiResponse<EnrollmentDto>.Fail("Faqat faol talabalarni guruhga qo'shish mumkin.");

        var alreadyEnrolled = await _db.Enrollments.AnyAsync(e => e.GroupId == request.GroupId && e.StudentId == request.StudentId);
        if (alreadyEnrolled)
            return ApiResponse<EnrollmentDto>.Fail("Bu talaba ushbu guruhga allaqachon biriktirilgan (dublikat taqiqlanadi).");

        var enrollment = new Enrollment
        {
            GroupId = request.GroupId,
            StudentId = request.StudentId,
            JoinedAt = DateTime.UtcNow,
            Status = EnrollmentStatus.Active
        };

        _db.Enrollments.Add(enrollment);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("ENROLL", "Enrollment", enrollment.Id.ToString(), $"{student.FullName} {group.Name} guruhiga qo'shildi");

        return ApiResponse<EnrollmentDto>.Ok(new EnrollmentDto
        {
            Id = enrollment.Id,
            GroupId = group.Id,
            GroupName = group.Name,
            StudentId = student.Id,
            StudentName = student.FullName,
            StudentEmail = student.Email,
            JoinedAt = enrollment.JoinedAt,
            Status = enrollment.Status
        }, "Talaba guruhga muvaffaqiyatli qo'shildi.");
    }

    public async Task<ApiResponse<bool>> RemoveStudentAsync(Guid enrollmentId)
    {
        var enrollment = await _db.Enrollments.Include(e => e.Student).Include(e => e.Group).FirstOrDefaultAsync(e => e.Id == enrollmentId);
        if (enrollment == null)
            return ApiResponse<bool>.Fail("Yozuv topilmadi.");

        _db.Enrollments.Remove(enrollment);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("UNENROLL", "Enrollment", enrollmentId.ToString(), $"{enrollment.Student.FullName} {enrollment.Group.Name} guruhidan chiqarildi");

        return ApiResponse<bool>.Ok(true, "Talaba guruhdan chiqarildi.");
    }
}
