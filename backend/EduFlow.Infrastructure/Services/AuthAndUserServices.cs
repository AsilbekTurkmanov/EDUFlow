using EduFlow.Application.Common;
using EduFlow.Application.DTOs;
using EduFlow.Application.Interfaces;
using EduFlow.Domain.Entities;
using EduFlow.Domain.Enums;
using EduFlow.Infrastructure.Data;
using EduFlow.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;

namespace EduFlow.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly EduFlowDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtGenerator;
    private readonly ICurrentUserService _currentUser;
    private readonly IAuditLogService _audit;

    public AuthService(
        EduFlowDbContext db,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtGenerator,
        ICurrentUserService currentUser,
        IAuditLogService audit)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _jwtGenerator = jwtGenerator;
        _currentUser = currentUser;
        _audit = audit;
    }

    public async Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginRequestDto request)
    {
        var rawInput = !string.IsNullOrWhiteSpace(request.Username) ? request.Username : request.Email;
        var input = (rawInput ?? "").Trim().ToLower();
        var cleanInputPhone = input.Replace(" ", "").Replace("-", "");

        var user = await _db.Users
            .Include(u => u.Enrollments).ThenInclude(e => e.Group)
            .Include(u => u.TeachingGroups).ThenInclude(g => g.Enrollments).ThenInclude(e => e.Student)
            .Include(u => u.Payments)
            .Include(u => u.Attendances)
            .FirstOrDefaultAsync(u =>
                u.Email.ToLower() == input ||
                (u.Username != null && u.Username.ToLower() == input) ||
                (!input.Contains("@") && u.Email.ToLower().StartsWith(input + "@")) ||
                (u.Phone != null && u.Phone.Replace(" ", "").Replace("-", "").ToLower() == cleanInputPhone)
            );

        if (user == null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return ApiResponse<LoginResponseDto>.Fail("Login (email/username) yoki parol noto'g'ri.");
        }

        if (user.Status == UserStatus.Inactive)
        {
            return ApiResponse<LoginResponseDto>.Fail("Foydalanuvchi hisobi faol emas. Administratorga murojaat qiling.");
        }

        var token = _jwtGenerator.GenerateToken(user);
        await _audit.LogAsync("LOGIN", "User", user.Id.ToString(), $"Foydalanuvchi tizimga kirdi: {user.Email} ({user.Role})");

        var userDto = MapUserToDto(user);

        return ApiResponse<LoginResponseDto>.Ok(new LoginResponseDto
        {
            Token = token,
            User = userDto
        }, "Tizimga muvaffaqiyatli kirildi.");
    }

    public async Task<ApiResponse<UserDto>> GetCurrentUserAsync()
    {
        if (!_currentUser.UserId.HasValue)
            return ApiResponse<UserDto>.Fail("Avtorizatsiyadan o'tilmagan.");

        var user = await _db.Users
            .Include(u => u.Enrollments).ThenInclude(e => e.Group)
            .Include(u => u.TeachingGroups).ThenInclude(g => g.Enrollments).ThenInclude(e => e.Student)
            .Include(u => u.Payments)
            .Include(u => u.Attendances)
            .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId.Value);

        if (user == null)
            return ApiResponse<UserDto>.Fail("Foydalanuvchi topilmadi.");

        return ApiResponse<UserDto>.Ok(MapUserToDto(user));
    }

    public static UserDto MapUserToDto(User u)
    {
        var dto = new UserDto
        {
            Id = u.Id,
            FullName = u.FullName,
            Email = u.Email,
            Username = u.Username,
            Role = u.Role,
            Status = u.Status,
            Phone = u.Phone,
            ParentPhone = u.ParentPhone,
            ExperienceYears = u.ExperienceYears,
            CreatedAt = u.CreatedAt
        };

        if (u.Role == UserRole.Teacher)
        {
            int sharePct = u.ExperienceYears >= 3 ? 70 : (u.ExperienceYears >= 2 ? 60 : (u.ExperienceYears >= 1 ? 50 : 40));
            dto.SharePercentage = sharePct;

            var teachingStudents = u.TeachingGroups
                .SelectMany(g => g.Enrollments)
                .Where(e => e.Status == EnrollmentStatus.Active && e.Student != null)
                .Select(e => e.Student!)
                .GroupBy(s => s.Id)
                .Select(g => g.First())
                .ToList();

            dto.StudentsCount = teachingStudents.Count;
            dto.StudentNames = teachingStudents.Select(s => s.FullName).ToList();
            dto.MonthlyEarned = teachingStudents.Count * 800000m * sharePct / 100m;
            dto.TotalEarned = dto.MonthlyEarned * Math.Max(1, u.ExperienceYears * 12);
        }
        else if (u.Role == UserRole.Student)
        {
            dto.MonthlyFee = 800000m;
            var totalPaid = u.Payments.Where(p => p.Status == PaymentStatus.Completed).Sum(p => p.Amount);
            dto.TotalPaid = totalPaid;

            var enrolledMonths = 1;
            if (u.Enrollments.Any())
            {
                var earliestJoin = u.Enrollments.Min(e => e.JoinedAt);
                enrolledMonths = Math.Max(1, (int)Math.Ceiling((DateTime.UtcNow - earliestJoin).TotalDays / 30.0));
            }
            else
            {
                enrolledMonths = Math.Max(1, (int)Math.Ceiling((DateTime.UtcNow - u.CreatedAt).TotalDays / 30.0));
            }

            var totalDue = enrolledMonths * 800000m;
            dto.Balance = totalPaid - totalDue;
            dto.GroupNames = u.Enrollments.Where(e => e.Group != null).Select(e => e.Group.Name).ToList();

            var totalAtt = u.Attendances.Count;
            dto.PresentCount = u.Attendances.Count(a => a.Status == AttendanceStatus.Present);
            dto.AbsentCount = u.Attendances.Count(a => a.Status == AttendanceStatus.Absent);
            dto.LateCount = u.Attendances.Count(a => a.Status == AttendanceStatus.Late);
            dto.AttendanceRate = totalAtt > 0 ? Math.Round((double)dto.PresentCount / totalAtt * 100, 1) : 100.0;

            // Monthly breakdown stats for diagram
            var monthNames = new[] { "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr" };
            var list = new List<MonthlyPaymentStatDto>();
            for (int i = 0; i < monthNames.Length; i++)
            {
                bool isPaid = (dto.Balance >= 0) || ((i + 1) * 800000m <= totalPaid);
                decimal amt = isPaid ? 800000m : Math.Max(0, totalPaid - (i * 800000m));
                if (amt > 800000m) amt = 800000m;

                list.Add(new MonthlyPaymentStatDto
                {
                    Month = monthNames[i],
                    Amount = amt,
                    IsPaid = isPaid
                });
            }
            dto.MonthlyPaymentStats = list;
        }

        return dto;
    }
}

public class UserService : IUserService
{
    private readonly EduFlowDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IAuditLogService _audit;

    public UserService(EduFlowDbContext db, IPasswordHasher passwordHasher, IAuditLogService audit)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _audit = audit;
    }

    public async Task<ApiResponse<PagedResult<UserDto>>> GetUsersAsync(int page = 1, int pageSize = 20, UserRole? role = null, UserStatus? status = null, string? search = null)
    {
        var query = _db.Users
            .Include(u => u.Enrollments).ThenInclude(e => e.Group)
            .Include(u => u.TeachingGroups).ThenInclude(g => g.Enrollments).ThenInclude(e => e.Student)
            .Include(u => u.Payments)
            .Include(u => u.Attendances)
            .AsQueryable();

        if (role.HasValue)
            query = query.Where(u => u.Role == role.Value);

        if (status.HasValue)
            query = query.Where(u => u.Status == status.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(u =>
                u.FullName.ToLower().Contains(s) ||
                u.Email.ToLower().Contains(s) ||
                (u.Username != null && u.Username.ToLower().Contains(s)) ||
                (u.ParentPhone != null && u.ParentPhone.Contains(s)) ||
                (u.Phone != null && u.Phone.Contains(s)));
        }

        var totalCount = await query.CountAsync();
        var rawUsers = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var items = rawUsers.Select(AuthService.MapUserToDto).ToList();

        return ApiResponse<PagedResult<UserDto>>.Ok(new PagedResult<UserDto>
        {
            Items = items,
            PageNumber = page,
            PageSize = pageSize,
            TotalCount = totalCount
        });
    }

    public async Task<ApiResponse<UserDto>> GetUserByIdAsync(Guid id)
    {
        var user = await _db.Users
            .Include(u => u.Enrollments).ThenInclude(e => e.Group)
            .Include(u => u.TeachingGroups).ThenInclude(g => g.Enrollments).ThenInclude(e => e.Student)
            .Include(u => u.Payments)
            .Include(u => u.Attendances)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return ApiResponse<UserDto>.Fail("Foydalanuvchi topilmadi.");

        return ApiResponse<UserDto>.Ok(AuthService.MapUserToDto(user));
    }

    public async Task<ApiResponse<UserDto>> CreateUserAsync(CreateUserDto request)
    {
        var emailLower = request.Email.ToLower().Trim();
        if (await _db.Users.AnyAsync(u => u.Email.ToLower() == emailLower))
            return ApiResponse<UserDto>.Fail("Ushbu email bilan foydalanuvchi allaqachon mavjud.");

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = emailLower,
            Username = string.IsNullOrWhiteSpace(request.Username) ? request.Email.Split('@')[0].ToLower() : request.Username.Trim().ToLower(),
            PasswordHash = _passwordHasher.Hash(request.Password),
            Role = request.Role,
            Status = UserStatus.Active,
            Phone = request.Phone,
            ParentPhone = request.ParentPhone,
            ExperienceYears = request.ExperienceYears,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("CREATE", "User", user.Id.ToString(), $"Yangi foydalanuvchi yaratildi: {user.FullName} ({user.Role})");

        return ApiResponse<UserDto>.Ok(AuthService.MapUserToDto(user), "Foydalanuvchi muvaffaqiyatli yaratildi.");
    }

    public async Task<ApiResponse<UserDto>> UpdateUserAsync(Guid id, UpdateUserDto request)
    {
        var user = await _db.Users
            .Include(u => u.Enrollments).ThenInclude(e => e.Group)
            .Include(u => u.TeachingGroups).ThenInclude(g => g.Enrollments).ThenInclude(e => e.Student)
            .Include(u => u.Payments)
            .Include(u => u.Attendances)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return ApiResponse<UserDto>.Fail("Foydalanuvchi topilmadi.");

        var emailLower = request.Email.ToLower().Trim();
        var existingEmail = await _db.Users.AnyAsync(u => u.Email.ToLower() == emailLower && u.Id != id);
        if (existingEmail)
            return ApiResponse<UserDto>.Fail("Ushbu email boshqa foydalanuvchi tomonidan band qilingan.");

        user.FullName = request.FullName.Trim();
        user.Email = emailLower;
        if (!string.IsNullOrWhiteSpace(request.Username))
            user.Username = request.Username.Trim().ToLower();
        user.Role = request.Role;
        user.Status = request.Status;
        user.Phone = request.Phone;
        user.ParentPhone = request.ParentPhone;
        user.ExperienceYears = request.ExperienceYears;

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        }

        await _db.SaveChangesAsync();
        await _audit.LogAsync("UPDATE", "User", user.Id.ToString(), $"Foydalanuvchi ma'lumotlari tahrirlandi: {user.Email}");

        return ApiResponse<UserDto>.Ok(AuthService.MapUserToDto(user), "Foydalanuvchi muvaffaqiyatli yangilandi.");
    }

    public async Task<ApiResponse<bool>> DeleteUserAsync(Guid id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
            return ApiResponse<bool>.Fail("Foydalanuvchi topilmadi.");

        var isTeaching = await _db.Groups.AnyAsync(g => g.TeacherId == id);
        if (isTeaching)
        {
            return ApiResponse<bool>.Fail("Ushbu o'qituvchiga biriktirilgan guruhlar mavjud. Avval guruhlarga boshqa o'qituvchi biriktiring yoki guruhni o'chiring.");
        }

        var enrollments = await _db.Enrollments.Where(e => e.StudentId == id).ToListAsync();
        if (enrollments.Any()) _db.Enrollments.RemoveRange(enrollments);

        var attendances = await _db.Attendances.Where(a => a.StudentId == id).ToListAsync();
        if (attendances.Any()) _db.Attendances.RemoveRange(attendances);

        var submissions = await _db.Submissions.Where(s => s.StudentId == id).ToListAsync();
        if (submissions.Any()) _db.Submissions.RemoveRange(submissions);

        var payments = await _db.Payments.Where(p => p.StudentId == id).ToListAsync();
        if (payments.Any()) _db.Payments.RemoveRange(payments);

        var auditLogs = await _db.AuditLogs.Where(l => l.UserId == id).ToListAsync();
        foreach (var log in auditLogs)
        {
            log.UserId = null;
        }

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        await _audit.LogAsync("DELETE", "User", id.ToString(), $"Foydalanuvchi o'chirildi: {user.Email}");

        return ApiResponse<bool>.Ok(true, "Foydalanuvchi muvaffaqiyatli o'chirildi.");
    }
}
