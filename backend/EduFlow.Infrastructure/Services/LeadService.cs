using EduFlow.Application.Common;
using EduFlow.Application.DTOs;
using EduFlow.Application.Interfaces;
using EduFlow.Domain.Entities;
using EduFlow.Domain.Enums;
using EduFlow.Infrastructure.Data;
using EduFlow.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;

namespace EduFlow.Infrastructure.Services;

public class LeadService : ILeadService
{
    private readonly EduFlowDbContext _db;
    private readonly IAuditLogService _audit;
    private readonly ICurrentUserService _currentUser;
    private readonly IPasswordHasher _passwordHasher;

    public LeadService(
        EduFlowDbContext db, 
        IAuditLogService audit, 
        ICurrentUserService currentUser, 
        IPasswordHasher passwordHasher)
    {
        _db = db;
        _audit = audit;
        _currentUser = currentUser;
        _passwordHasher = passwordHasher;
    }

    public async Task<ApiResponse<List<LeadDto>>> GetLeadsAsync(Guid? centerId = null, LeadStatus? status = null, LeadSource? source = null, string? search = null)
    {
        var query = _db.Leads
            .Include(l => l.TargetCourse)
            .Include(l => l.Center)
            .AsQueryable();

        // Scope to user's center if center admin or specified
        if (centerId.HasValue)
        {
            query = query.Where(l => l.CenterId == centerId.Value);
        }
        else if (_currentUser.UserId.HasValue)
        {
            var curUser = await _db.Users.FindAsync(_currentUser.UserId.Value);
            if (curUser?.CenterId != null)
            {
                query = query.Where(l => l.CenterId == curUser.CenterId);
            }
        }

        if (status.HasValue)
        {
            query = query.Where(l => l.Status == status.Value);
        }

        if (source.HasValue)
        {
            query = query.Where(l => l.Source == source.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(l =>
                l.FullName.ToLower().Contains(s) ||
                l.Phone.Contains(s) ||
                (l.Email != null && l.Email.ToLower().Contains(s)) ||
                (l.CourseOfInterest != null && l.CourseOfInterest.ToLower().Contains(s)) ||
                (l.Notes != null && l.Notes.ToLower().Contains(s)));
        }

        var leads = await query
            .OrderByDescending(l => l.UpdatedAt)
            .ToListAsync();

        return ApiResponse<List<LeadDto>>.Ok(leads.Select(MapToDto).ToList());
    }

    public async Task<ApiResponse<LeadDto>> GetLeadByIdAsync(Guid id)
    {
        var lead = await _db.Leads
            .Include(l => l.TargetCourse)
            .Include(l => l.Center)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (lead == null)
            return ApiResponse<LeadDto>.Fail("Lid topilmadi.");

        return ApiResponse<LeadDto>.Ok(MapToDto(lead));
    }

    public async Task<ApiResponse<LeadDto>> CreateLeadAsync(CreateLeadDto request)
    {
        Guid? centerId = request.CenterId;
        if (!centerId.HasValue && _currentUser.UserId.HasValue)
        {
            var curUser = await _db.Users.FindAsync(_currentUser.UserId.Value);
            centerId = curUser?.CenterId;
        }

        if (!centerId.HasValue)
        {
            var firstCenter = await _db.LearningCenters.FirstOrDefaultAsync();
            centerId = firstCenter?.Id;
        }

        var lead = new Lead
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName.Trim(),
            Phone = request.Phone.Trim(),
            Email = request.Email?.Trim(),
            Source = request.Source,
            Status = request.Status,
            TargetCourseId = request.TargetCourseId,
            CourseOfInterest = request.CourseOfInterest?.Trim(),
            CenterId = centerId,
            Notes = request.Notes?.Trim(),
            MeetingDate = request.MeetingDate,
            DemoLessonDate = request.DemoLessonDate,
            EstimatedBudget = request.EstimatedBudget ?? 800000m,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Leads.Add(lead);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("CREATE_LEAD", "Lead", lead.Id.ToString(), $"Yangi lid qo'shildi: {lead.FullName} ({lead.Source})");

        var created = await _db.Leads
            .Include(l => l.TargetCourse)
            .Include(l => l.Center)
            .FirstAsync(l => l.Id == lead.Id);

        return ApiResponse<LeadDto>.Ok(MapToDto(created), "Lid muvaffaqiyatli saqlandi.");
    }

    public async Task<ApiResponse<LeadDto>> UpdateLeadAsync(Guid id, UpdateLeadDto request)
    {
        var lead = await _db.Leads
            .Include(l => l.TargetCourse)
            .Include(l => l.Center)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (lead == null)
            return ApiResponse<LeadDto>.Fail("Lid topilmadi.");

        lead.FullName = request.FullName.Trim();
        lead.Phone = request.Phone.Trim();
        lead.Email = request.Email?.Trim();
        lead.Source = request.Source;
        lead.Status = request.Status;
        lead.TargetCourseId = request.TargetCourseId;
        lead.CourseOfInterest = request.CourseOfInterest?.Trim();
        lead.Notes = request.Notes?.Trim();
        lead.MeetingDate = request.MeetingDate;
        lead.DemoLessonDate = request.DemoLessonDate;
        lead.EstimatedBudget = request.EstimatedBudget;
        lead.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("UPDATE_LEAD", "Lead", lead.Id.ToString(), $"Lid yangilandi: {lead.FullName}");

        return ApiResponse<LeadDto>.Ok(MapToDto(lead), "Lid muvaffaqiyatli yangilandi.");
    }

    public async Task<ApiResponse<LeadDto>> UpdateLeadStatusAsync(Guid id, UpdateLeadStatusDto request)
    {
        var lead = await _db.Leads
            .Include(l => l.TargetCourse)
            .Include(l => l.Center)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (lead == null)
            return ApiResponse<LeadDto>.Fail("Lid topilmadi.");

        var oldStatus = lead.Status;
        lead.Status = request.Status;
        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            lead.Notes = string.IsNullOrWhiteSpace(lead.Notes)
                ? request.Notes.Trim()
                : $"{lead.Notes}\n[{DateTime.UtcNow:yyyy-MM-dd HH:mm}] {request.Notes.Trim()}";
        }
        lead.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        await _audit.LogAsync("STATUS_LEAD", "Lead", lead.Id.ToString(), $"Lid holati o'zgardi: {oldStatus} -> {lead.Status}");

        return ApiResponse<LeadDto>.Ok(MapToDto(lead), $"Lid bosqichi '{GetStatusName(lead.Status)}' ga o'tkazildi.");
    }

    public async Task<ApiResponse<UserDto>> ConvertLeadToStudentAsync(Guid id, ConvertLeadDto request)
    {
        var lead = await _db.Leads
            .Include(l => l.TargetCourse)
            .Include(l => l.Center)
            .FirstOrDefaultAsync(l => l.Id == id);

        if (lead == null)
            return ApiResponse<UserDto>.Fail("Lid topilmadi.");

        if (lead.ConvertedStudentId.HasValue)
            return ApiResponse<UserDto>.Fail("Ushbu lid allaqachon o'quvchiga aylantirilgan.");

        // Automatic Quota Enforcement Check
        if (lead.CenterId.HasValue)
        {
            var center = await _db.LearningCenters.FindAsync(lead.CenterId.Value);
            if (center != null)
            {
                var activeStudentsCount = await _db.Users.CountAsync(u => u.CenterId == center.Id && u.Role == UserRole.Student && u.Status == UserStatus.Active);
                if (activeStudentsCount >= center.MaxStudentsQuota)
                {
                    center.Status = CenterStatus.QuotaExceeded;
                    await _db.SaveChangesAsync();
                    return ApiResponse<UserDto>.Fail($"❌ DIQQAT: \"{center.Name}\" markazining o'quvchi kvotasi ({activeStudentsCount} / {center.MaxStudentsQuota}) to'lgan! Yangi o'quvchi qo'shish avtomatik ravishda bloklangan. Davom etish uchun markaz tarifini oshiring.");
                }
            }
        }

        // Generate student email and username
        var rawName = lead.FullName.Trim();
        var parts = rawName.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var baseUser = parts[0].ToLower();
        var uniqueSuffix = DateTime.UtcNow.ToString("ff");
        var username = $"{baseUser}_{uniqueSuffix}";
        var email = !string.IsNullOrWhiteSpace(lead.Email) 
            ? lead.Email.Trim().ToLower() 
            : $"{username}@eduflow.uz";

        // Check unique email
        int counter = 1;
        while (await _db.Users.AnyAsync(u => u.Email.ToLower() == email))
        {
            email = $"{username}_{counter}@eduflow.uz";
            counter++;
        }

        var defaultPassword = !string.IsNullOrWhiteSpace(request.Password) 
            ? request.Password 
            : $"EduFlow_{Random.Shared.Next(100000, 999999)}!";
        var student = new User
        {
            Id = Guid.NewGuid(),
            FullName = lead.FullName,
            Email = email,
            Username = username,
            PasswordHash = _passwordHasher.Hash(defaultPassword),
            Role = UserRole.Student,
            Status = UserStatus.Active,
            Phone = lead.Phone,
            ParentPhone = request.ParentPhone,
            CenterId = lead.CenterId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(student);

        // Enroll into group if specified
        if (request.GroupId.HasValue)
        {
            var group = await _db.Groups.FindAsync(request.GroupId.Value);
            if (group != null)
            {
                _db.Enrollments.Add(new Enrollment
                {
                    Id = Guid.NewGuid(),
                    GroupId = group.Id,
                    StudentId = student.Id,
                    JoinedAt = DateTime.UtcNow,
                    Status = EnrollmentStatus.Active
                });
            }
        }

        // Add initial payment if provided
        if (request.InitialPaymentAmount > 0)
        {
            _db.Payments.Add(new Payment
            {
                Id = Guid.NewGuid(),
                StudentId = student.Id,
                Amount = request.InitialPaymentAmount,
                Method = request.PaymentMethod,
                Status = PaymentStatus.Completed,
                PaidAt = DateTime.UtcNow,
                Note = "Lid konversiyasi: dastlabki o'qish to'lovi"
            });
        }

        // Mark lead as converted
        lead.Status = LeadStatus.Converted;
        lead.ConvertedStudentId = student.Id;
        lead.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        await _audit.LogAsync("CONVERT_LEAD", "Lead", lead.Id.ToString(), $"Lid muvaffaqiyatli o'quvchiga aylantirildi: {lead.FullName} -> Student ID: {student.Id}");

        var createdStudent = await _db.Users
            .Include(u => u.Enrollments).ThenInclude(e => e.Group)
            .Include(u => u.TeachingGroups)
            .Include(u => u.Payments)
            .Include(u => u.Attendances)
            .Include(u => u.Center)
            .FirstAsync(u => u.Id == student.Id);

        return ApiResponse<UserDto>.Ok(AuthService.MapUserToDto(createdStudent), $"Lid muvaffaqiyatli o'quvchiga aylantirildi! Login: {student.Username}, Vaqtinchalik parol: {defaultPassword}");
    }

    public async Task<ApiResponse<bool>> DeleteLeadAsync(Guid id)
    {
        var lead = await _db.Leads.FindAsync(id);
        if (lead == null)
            return ApiResponse<bool>.Fail("Lid topilmadi.");

        _db.Leads.Remove(lead);
        await _db.SaveChangesAsync();

        await _audit.LogAsync("DELETE_LEAD", "Lead", id.ToString(), $"Lid o'chirildi: {lead.FullName}");
        return ApiResponse<bool>.Ok(true, "Lid muvaffaqiyatli o'chirildi.");
    }

    public async Task<ApiResponse<LeadSummaryStatsDto>> GetLeadStatsAsync(Guid? centerId = null)
    {
        var query = _db.Leads.AsQueryable();

        if (centerId.HasValue)
        {
            query = query.Where(l => l.CenterId == centerId.Value);
        }
        else if (_currentUser.UserId.HasValue)
        {
            var curUser = await _db.Users.FindAsync(_currentUser.UserId.Value);
            if (curUser?.CenterId != null)
            {
                query = query.Where(l => l.CenterId == curUser.CenterId);
            }
        }

        var leads = await query.ToListAsync();
        var total = leads.Count;
        var converted = leads.Count(l => l.Status == LeadStatus.Converted);

        var stats = new LeadSummaryStatsDto
        {
            TotalLeads = total,
            InterestedCount = leads.Count(l => l.Status == LeadStatus.Interested),
            ContactedCount = leads.Count(l => l.Status == LeadStatus.Contacted),
            MeetingScheduledCount = leads.Count(l => l.Status == LeadStatus.MeetingScheduled),
            DemoAttendedCount = leads.Count(l => l.Status == LeadStatus.DemoAttended),
            ConvertedCount = converted,
            LostCount = leads.Count(l => l.Status == LeadStatus.Lost),
            ConversionRatePercentage = total > 0 ? Math.Round((double)converted / total * 100, 1) : 0,
            EstimatedTotalPipelineValue = leads.Sum(l => l.EstimatedBudget ?? 800000m)
        };

        return ApiResponse<LeadSummaryStatsDto>.Ok(stats);
    }

    private static LeadDto MapToDto(Lead l)
    {
        return new LeadDto
        {
            Id = l.Id,
            FullName = l.FullName,
            Phone = l.Phone,
            Email = l.Email,
            Source = l.Source,
            SourceName = GetSourceName(l.Source),
            Status = l.Status,
            StatusName = GetStatusName(l.Status),
            TargetCourseId = l.TargetCourseId,
            TargetCourseName = l.TargetCourse?.Name,
            CourseOfInterest = l.CourseOfInterest ?? l.TargetCourse?.Name,
            CenterId = l.CenterId,
            CenterName = l.Center?.Name,
            Notes = l.Notes,
            MeetingDate = l.MeetingDate,
            DemoLessonDate = l.DemoLessonDate,
            EstimatedBudget = l.EstimatedBudget,
            ConvertedStudentId = l.ConvertedStudentId,
            CreatedAt = l.CreatedAt,
            UpdatedAt = l.UpdatedAt
        };
    }

    private static string GetSourceName(LeadSource source) => source switch
    {
        LeadSource.Instagram => "Instagram Direct",
        LeadSource.Telegram => "Telegram Kanal / Bot",
        LeadSource.Facebook => "Facebook Ad",
        LeadSource.Recommendation => "Tavsiya / Do'sti",
        LeadSource.Banner => "Tashqi Banner",
        LeadSource.Website => "Rasmiy Veb-sayt",
        LeadSource.WalkIn => "O'zi Kelgan (Walk-In)",
        _ => "Boshqa"
    };

    private static string GetStatusName(LeadStatus status) => status switch
    {
        LeadStatus.Interested => "Qiziqish bildirganlar",
        LeadStatus.Contacted => "Gaplashilganlar",
        LeadStatus.MeetingScheduled => "Uchrashuv belgilanganlar",
        LeadStatus.DemoAttended => "Demo darsga kelganlar",
        LeadStatus.Converted => "To'lov qilganlar",
        LeadStatus.Lost => "Rad etganlar / Arxiv",
        _ => "Noma'lum"
    };
}
