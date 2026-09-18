using EduFlow.Application.Common;
using EduFlow.Application.DTOs;
using EduFlow.Application.Interfaces;
using EduFlow.Domain.Entities;
using EduFlow.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EduFlow.Infrastructure.Services;

public class AuditLogService : IAuditLogService
{
    private readonly EduFlowDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public AuditLogService(EduFlowDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task LogAsync(string action, string entity, string? entityId = null, string? metadata = null)
    {
        try
        {
            var log = new AuditLog
            {
                UserId = _currentUser.UserId,
                Action = action,
                Entity = entity,
                EntityId = entityId,
                CreatedAt = DateTime.UtcNow,
                Metadata = metadata
            };
            _db.AuditLogs.Add(log);
            await _db.SaveChangesAsync();
        }
        catch
        {
            // Silently ignore audit log failures to avoid breaking main business flow
        }
    }

    public async Task<ApiResponse<List<AuditLogDto>>> GetRecentLogsAsync(int count = 50)
    {
        var logs = await _db.AuditLogs
            .Include(l => l.User)
            .OrderByDescending(l => l.CreatedAt)
            .Take(count)
            .Select(l => new AuditLogDto
            {
                Id = l.Id,
                UserId = l.UserId,
                UserName = l.User != null ? l.User.FullName : "System",
                Action = l.Action,
                Entity = l.Entity,
                EntityId = l.EntityId,
                CreatedAt = l.CreatedAt,
                Metadata = l.Metadata
            })
            .ToListAsync();

        return ApiResponse<List<AuditLogDto>>.Ok(logs);
    }
}
