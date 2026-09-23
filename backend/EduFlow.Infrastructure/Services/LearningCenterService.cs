using EduFlow.Application.Common;
using EduFlow.Application.DTOs;
using EduFlow.Application.Interfaces;
using EduFlow.Domain.Entities;
using EduFlow.Domain.Enums;
using EduFlow.Infrastructure.Data;
using EduFlow.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;

namespace EduFlow.Infrastructure.Services;

public class LearningCenterService : ILearningCenterService
{
    private readonly EduFlowDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IAuditLogService _audit;
    private readonly ICurrentUserService _currentUser;

    public LearningCenterService(
        EduFlowDbContext db,
        IPasswordHasher passwordHasher,
        IAuditLogService audit,
        ICurrentUserService currentUser)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _audit = audit;
        _currentUser = currentUser;
    }

    public async Task<ApiResponse<List<LearningCenterDto>>> GetCentersAsync()
    {
        var centers = await _db.LearningCenters
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        var dtoList = new List<LearningCenterDto>();

        foreach (var c in centers)
        {
            var dto = await MapToDtoAsync(c);
            dtoList.Add(dto);
        }

        return ApiResponse<List<LearningCenterDto>>.Ok(dtoList);
    }

    public async Task<ApiResponse<LearningCenterDto>> GetCenterByIdAsync(Guid id)
    {
        var center = await _db.LearningCenters.FindAsync(id);
        if (center == null)
            return ApiResponse<LearningCenterDto>.Fail("O'quv markazi topilmadi.");

        var dto = await MapToDtoAsync(center);
        return ApiResponse<LearningCenterDto>.Ok(dto);
    }

    public async Task<ApiResponse<LearningCenterDto>> CreateCenterAsync(CreateCenterDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<LearningCenterDto>.Fail("Markaz nomi bo'sh bo'lishi mumkin emas.");

        var slug = GenerateSlug(request.Name);
        var existingSlug = await _db.LearningCenters.AnyAsync(c => c.Slug == slug);
        if (existingSlug)
        {
            slug = $"{slug}-{DateTime.UtcNow.Ticks % 10000}";
        }

        int quota = request.CustomQuota ?? GetDefaultQuota(request.TariffPlan);
        decimal price = request.CustomPrice ?? GetDefaultPrice(request.TariffPlan);

        var center = new LearningCenter
        {
            Name = request.Name.Trim(),
            Slug = slug,
            Phone = request.Phone?.Trim(),
            Address = request.Address?.Trim(),
            TariffPlan = request.TariffPlan,
            MaxStudentsQuota = quota,
            MonthlySubscriptionPrice = price,
            Status = CenterStatus.Active,
            SubscriptionValidUntil = DateTime.UtcNow.AddMonths(1),
            AutoBlockOnQuotaExceeded = true,
            Notes = request.Notes?.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.LearningCenters.Add(center);
        await _db.SaveChangesAsync();

        // Create Center Administrator user if requested
        if (!string.IsNullOrWhiteSpace(request.AdminFullName) && !string.IsNullOrWhiteSpace(request.AdminEmail))
        {
            var existingUser = await _db.Users.AnyAsync(u => u.Email.ToLower() == request.AdminEmail.Trim().ToLower());
            if (!existingUser)
            {
                var adminUser = new User
                {
                    FullName = request.AdminFullName.Trim(),
                    Email = request.AdminEmail.Trim().ToLower(),
                    Username = !string.IsNullOrWhiteSpace(request.AdminUsername) ? request.AdminUsername.Trim().ToLower() : slug + "_admin",
                    PasswordHash = _passwordHasher.Hash(request.AdminPassword ?? "+998991992012"),
                    Role = UserRole.Admin,
                    Status = UserStatus.Active,
                    Phone = request.AdminPhone?.Trim() ?? request.Phone,
                    CenterId = center.Id,
                    CreatedAt = DateTime.UtcNow
                };

                _db.Users.Add(adminUser);
                await _db.SaveChangesAsync();

                center.AdminUserId = adminUser.Id;
                await _db.SaveChangesAsync();
            }
        }

        await _audit.LogAsync("CREATE_CENTER", "LearningCenter", center.Id.ToString(), $"Yangi o'quv markazi ochildi: {center.Name} (Tarif: {center.TariffPlan}, Limit: {center.MaxStudentsQuota} ta o'quvchi)");

        var dto = await MapToDtoAsync(center);
        return ApiResponse<LearningCenterDto>.Ok(dto, "Yangi markaz muvaffaqiyatli ochildi!");
    }

    public async Task<ApiResponse<LearningCenterDto>> UpdateCenterAsync(Guid id, UpdateCenterDto request)
    {
        var center = await _db.LearningCenters.FindAsync(id);
        if (center == null)
            return ApiResponse<LearningCenterDto>.Fail("Markaz topilmadi.");

        center.Name = request.Name.Trim();
        center.Phone = request.Phone?.Trim();
        center.Address = request.Address?.Trim();
        center.Status = request.Status;
        center.Notes = request.Notes?.Trim();

        await _db.SaveChangesAsync();
        await _audit.LogAsync("UPDATE_CENTER", "LearningCenter", center.Id.ToString(), $"{center.Name} markazi ma'lumotlari yangilandi");

        var dto = await MapToDtoAsync(center);
        return ApiResponse<LearningCenterDto>.Ok(dto, "Markaz ma'lumotlari yangilandi.");
    }

    public async Task<ApiResponse<LearningCenterDto>> UpdateTariffAsync(Guid id, UpdateCenterTariffDto request)
    {
        var center = await _db.LearningCenters.FindAsync(id);
        if (center == null)
            return ApiResponse<LearningCenterDto>.Fail("Markaz topilmadi.");

        int oldQuota = center.MaxStudentsQuota;
        int newQuota = request.CustomQuota ?? GetDefaultQuota(request.TariffPlan);
        decimal newPrice = request.CustomPrice ?? GetDefaultPrice(request.TariffPlan);

        center.TariffPlan = request.TariffPlan;
        center.MaxStudentsQuota = newQuota;
        center.MonthlySubscriptionPrice = newPrice;
        
        if (request.ExtendMonths > 0)
        {
            var baseDate = center.SubscriptionValidUntil > DateTime.UtcNow ? center.SubscriptionValidUntil : DateTime.UtcNow;
            center.SubscriptionValidUntil = baseDate.AddMonths(request.ExtendMonths);
        }

        // Re-evaluate quota enforcement
        var activeCount = await _db.Users.CountAsync(u => u.CenterId == center.Id && u.Role == UserRole.Student && u.Status == UserStatus.Active);
        if (activeCount >= newQuota)
        {
            center.Status = CenterStatus.QuotaExceeded;
        }
        else if (center.Status == CenterStatus.QuotaExceeded)
        {
            center.Status = CenterStatus.Active;
        }

        await _db.SaveChangesAsync();

        await _audit.LogAsync("UPGRADE_TARIFF", "LearningCenter", center.Id.ToString(), $"{center.Name} tarifi o'zgartirildi: {oldQuota} -> {newQuota} o'quvchi ({newPrice:N0} so'm/oy)");

        var dto = await MapToDtoAsync(center);
        return ApiResponse<LearningCenterDto>.Ok(dto, $"Tarif muvaffaqiyatli o'zgartirildi! Yangi limit: {newQuota} ta o'quvchi.");
    }

    public async Task<ApiResponse<bool>> DeleteCenterAsync(Guid id)
    {
        var center = await _db.LearningCenters.FindAsync(id);
        if (center == null)
            return ApiResponse<bool>.Fail("Markaz topilmadi.");

        _db.LearningCenters.Remove(center);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("DELETE_CENTER", "LearningCenter", id.ToString(), $"{center.Name} markazi tizimdan o'chirildi.");
        return ApiResponse<bool>.Ok(true, "Markaz muvaffaqiyatli o'chirildi.");
    }

    public async Task<ApiResponse<List<TariffPlanOptionDto>>> GetTariffPlansAsync()
    {
        var plans = new List<TariffPlanOptionDto>
        {
            new()
            {
                Plan = CenterTariffPlan.Starter_200,
                Name = "Boshlang'ich (Starter)",
                Quota = 200,
                Price = 500000m,
                Description = "Kichik va o'rta o'quv markazlari uchun. 200 tagacha faol o'quvchi."
            },
            new()
            {
                Plan = CenterTariffPlan.Standard_400,
                Name = "Standart (Standard)",
                Quota = 400,
                Price = 700000m,
                Description = "O'sayotgan o'quv markazlari uchun. 400 tagacha faol o'quvchi."
            },
            new()
            {
                Plan = CenterTariffPlan.Enterprise_1000,
                Name = "Katta Markaz (Enterprise)",
                Quota = 1000,
                Price = 1200000m,
                Description = "Katta maktablar va akademiyalar uchun. 1000 tagacha faol o'quvchi."
            },
            new()
            {
                Plan = CenterTariffPlan.Unlimited,
                Name = "Cheksiz (Unlimited Network)",
                Quota = 999999,
                Price = 2500000m,
                Description = "Ko'p filialli yirik ta'lim tarmoqlari uchun cheksiz o'quvchilar soni."
            }
        };

        return await Task.FromResult(ApiResponse<List<TariffPlanOptionDto>>.Ok(plans));
    }

    public async Task<ApiResponse<bool>> CheckAndEnforceQuotaAsync(Guid centerId)
    {
        var center = await _db.LearningCenters.FindAsync(centerId);
        if (center == null)
            return ApiResponse<bool>.Fail("Markaz topilmadi.");

        var activeCount = await _db.Users.CountAsync(u => u.CenterId == centerId && u.Role == UserRole.Student && u.Status == UserStatus.Active);
        
        bool statusChanged = false;
        if (activeCount >= center.MaxStudentsQuota && center.Status == CenterStatus.Active)
        {
            center.Status = CenterStatus.QuotaExceeded;
            statusChanged = true;
        }
        else if (activeCount < center.MaxStudentsQuota && center.Status == CenterStatus.QuotaExceeded)
        {
            center.Status = CenterStatus.Active;
            statusChanged = true;
        }

        if (statusChanged)
        {
            await _db.SaveChangesAsync();
        }

        return ApiResponse<bool>.Ok(activeCount < center.MaxStudentsQuota);
    }

    private async Task<LearningCenterDto> MapToDtoAsync(LearningCenter c)
    {
        var activeStudents = await _db.Users.CountAsync(u => u.CenterId == c.Id && u.Role == UserRole.Student && u.Status == UserStatus.Active);
        var totalTeachers = await _db.Users.CountAsync(u => u.CenterId == c.Id && u.Role == UserRole.Teacher && u.Status == UserStatus.Active);
        var totalGroups = await _db.Groups.CountAsync(g => g.CenterId == c.Id && g.Status == GroupStatus.Active);

        User? adminUser = null;
        if (c.AdminUserId.HasValue)
        {
            adminUser = await _db.Users.FindAsync(c.AdminUserId.Value);
        }

        // Auto-check quota status dynamically
        var effectiveStatus = c.Status;
        if (activeStudents >= c.MaxStudentsQuota && effectiveStatus == CenterStatus.Active)
        {
            effectiveStatus = CenterStatus.QuotaExceeded;
        }

        string statusText = effectiveStatus switch
        {
            CenterStatus.Active => activeStudents >= c.MaxStudentsQuota * 0.9 ? "Limitga yaqin (90%+)" : "Faol",
            CenterStatus.QuotaExceeded => "Limit to'lgan (Bloklangan)",
            CenterStatus.Suspended => "To'xtatilgan",
            CenterStatus.Expired => "Obuna tugagan",
            _ => "Noma'lum"
        };

        string tariffName = c.TariffPlan switch
        {
            CenterTariffPlan.Starter_200 => "Boshlang'ich (200 ta / 500 ming)",
            CenterTariffPlan.Standard_400 => "Standart (400 ta / 700 ming)",
            CenterTariffPlan.Enterprise_1000 => "Katta Markaz (1000 ta / 1.2 mln)",
            CenterTariffPlan.Unlimited => "Cheksiz Tarmoq (2.5 mln)",
            _ => "Maxsus Tarif"
        };

        return new LearningCenterDto
        {
            Id = c.Id,
            Name = c.Name,
            Slug = c.Slug,
            Phone = c.Phone,
            Address = c.Address,
            AdminUserId = c.AdminUserId,
            AdminName = adminUser?.FullName,
            AdminUsername = adminUser?.Username,
            AdminPhone = adminUser?.Phone,
            TariffPlan = c.TariffPlan,
            TariffPlanName = tariffName,
            MaxStudentsQuota = c.MaxStudentsQuota,
            MonthlySubscriptionPrice = c.MonthlySubscriptionPrice,
            Status = effectiveStatus,
            StatusText = statusText,
            SubscriptionValidUntil = c.SubscriptionValidUntil,
            AutoBlockOnQuotaExceeded = c.AutoBlockOnQuotaExceeded,
            Notes = c.Notes,
            CreatedAt = c.CreatedAt,
            ActiveStudentsCount = activeStudents,
            TotalTeachersCount = totalTeachers,
            TotalGroupsCount = totalGroups
        };
    }

    private static int GetDefaultQuota(CenterTariffPlan plan) => plan switch
    {
        CenterTariffPlan.Starter_200 => 200,
        CenterTariffPlan.Standard_400 => 400,
        CenterTariffPlan.Enterprise_1000 => 1000,
        CenterTariffPlan.Unlimited => 999999,
        _ => 200
    };

    private static decimal GetDefaultPrice(CenterTariffPlan plan) => plan switch
    {
        CenterTariffPlan.Starter_200 => 500000m,
        CenterTariffPlan.Standard_400 => 700000m,
        CenterTariffPlan.Enterprise_1000 => 1200000m,
        CenterTariffPlan.Unlimited => 2500000m,
        _ => 500000m
    };

    private static string GenerateSlug(string name)
    {
        var slug = name.Trim().ToLower()
            .Replace(" ", "-")
            .Replace("'", "")
            .Replace("`", "")
            .Replace("\"", "")
            .Replace(".", "")
            .Replace(",", "");

        return new string(slug.Where(c => char.IsLetterOrDigit(c) || c == '-').ToArray());
    }
}
