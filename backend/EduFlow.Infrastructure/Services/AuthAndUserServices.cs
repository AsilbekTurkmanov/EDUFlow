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
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (user == null || !_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            return ApiResponse<LoginResponseDto>.Fail("Email yoki parol noto'g'ri.");
        }

        if (user.Status == UserStatus.Inactive)
        {
            return ApiResponse<LoginResponseDto>.Fail("Foydalanuvchi hisobi faol emas. Administratorga murojaat qiling.");
        }

        var token = _jwtGenerator.GenerateToken(user);
        await _audit.LogAsync("LOGIN", "User", user.Id.ToString(), $"Foydalanuvchi tizimga kirdi: {user.Email}");

        var userDto = new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            Status = user.Status,
            Phone = user.Phone,
            CreatedAt = user.CreatedAt
        };

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

        var user = await _db.Users.FindAsync(_currentUser.UserId.Value);
        if (user == null)
            return ApiResponse<UserDto>.Fail("Foydalanuvchi topilmadi.");

        return ApiResponse<UserDto>.Ok(new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            Status = user.Status,
            Phone = user.Phone,
            CreatedAt = user.CreatedAt
        });
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
        var query = _db.Users.AsQueryable();

        if (role.HasValue)
            query = query.Where(u => u.Role == role.Value);

        if (status.HasValue)
            query = query.Where(u => u.Status == status.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(u => u.FullName.ToLower().Contains(s) || u.Email.ToLower().Contains(s));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role,
                Status = u.Status,
                Phone = u.Phone,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

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
        var user = await _db.Users.FindAsync(id);
        if (user == null)
            return ApiResponse<UserDto>.Fail("Foydalanuvchi topilmadi.");

        return ApiResponse<UserDto>.Ok(new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            Status = user.Status,
            Phone = user.Phone,
            CreatedAt = user.CreatedAt
        });
    }

    public async Task<ApiResponse<UserDto>> CreateUserAsync(CreateUserDto request)
    {
        if (await _db.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower()))
            return ApiResponse<UserDto>.Fail("Ushbu email bilan foydalanuvchi allaqachon mavjud.");

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email.ToLower().Trim(),
            PasswordHash = _passwordHasher.Hash(request.Password),
            Role = request.Role,
            Status = UserStatus.Active,
            Phone = request.Phone,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("CREATE", "User", user.Id.ToString(), $"Yangi foydalanuvchi yaratildi: {user.Email} ({user.Role})");

        return ApiResponse<UserDto>.Ok(new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            Status = user.Status,
            Phone = user.Phone,
            CreatedAt = user.CreatedAt
        }, "Foydalanuvchi muvaffaqiyatli yaratildi.");
    }

    public async Task<ApiResponse<UserDto>> UpdateUserAsync(Guid id, UpdateUserDto request)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
            return ApiResponse<UserDto>.Fail("Foydalanuvchi topilmadi.");

        var existingEmail = await _db.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower() && u.Id != id);
        if (existingEmail)
            return ApiResponse<UserDto>.Fail("Ushbu email boshqa foydalanuvchi tomonidan band qilingan.");

        user.FullName = request.FullName;
        user.Email = request.Email.ToLower().Trim();
        user.Role = request.Role;
        user.Status = request.Status;
        user.Phone = request.Phone;

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        }

        await _db.SaveChangesAsync();
        await _audit.LogAsync("UPDATE", "User", user.Id.ToString(), $"Foydalanuvchi ma'lumotlari tahrirlandi: {user.Email}");

        return ApiResponse<UserDto>.Ok(new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            Status = user.Status,
            Phone = user.Phone,
            CreatedAt = user.CreatedAt
        }, "Foydalanuvchi muvaffaqiyatli yangilandi.");
    }

    public async Task<ApiResponse<bool>> DeleteUserAsync(Guid id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
            return ApiResponse<bool>.Fail("Foydalanuvchi topilmadi.");

        // Check if teacher is assigned to groups
        var isTeaching = await _db.Groups.AnyAsync(g => g.TeacherId == id);
        if (isTeaching)
        {
            return ApiResponse<bool>.Fail("Ushbu o'qituvchiga biriktirilgan guruhlar mavjud. Avval guruhlarga boshqa o'qituvchi biriktiring yoki guruhni o'chiring.");
        }

        // Cascade clean dependent records to satisfy PostgreSQL foreign keys
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
