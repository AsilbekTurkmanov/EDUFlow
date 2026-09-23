using EduFlow.Domain.Enums;

namespace EduFlow.Application.DTOs;

public class LearningCenterDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public Guid? AdminUserId { get; set; }
    public string? AdminName { get; set; }
    public string? AdminUsername { get; set; }
    public string? AdminPhone { get; set; }

    // Tariff & Quota details
    public CenterTariffPlan TariffPlan { get; set; }
    public string TariffPlanName { get; set; } = string.Empty;
    public int MaxStudentsQuota { get; set; }
    public decimal MonthlySubscriptionPrice { get; set; }
    public CenterStatus Status { get; set; }
    public string StatusText { get; set; } = string.Empty;
    public DateTime SubscriptionValidUntil { get; set; }
    public bool AutoBlockOnQuotaExceeded { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    // Live Metrics
    public int ActiveStudentsCount { get; set; }
    public int TotalTeachersCount { get; set; }
    public int TotalGroupsCount { get; set; }
    public int RemainingQuota => Math.Max(0, MaxStudentsQuota - ActiveStudentsCount);
    public double QuotaUsagePercentage => MaxStudentsQuota > 0 ? Math.Round((double)ActiveStudentsCount / MaxStudentsQuota * 100, 1) : 0;
    public bool IsQuotaExceeded => ActiveStudentsCount >= MaxStudentsQuota;
    public bool IsBlocked => Status == CenterStatus.QuotaExceeded || Status == CenterStatus.Suspended || Status == CenterStatus.Expired;
    public bool CanAddStudents => !IsBlocked && ActiveStudentsCount < MaxStudentsQuota;
}

public class CreateCenterDto
{
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public CenterTariffPlan TariffPlan { get; set; } = CenterTariffPlan.Starter_200;
    public int? CustomQuota { get; set; }
    public decimal? CustomPrice { get; set; }
    public string? Notes { get; set; }

    // Center Administrator Details
    public string AdminFullName { get; set; } = string.Empty;
    public string? AdminUsername { get; set; }
    public string AdminEmail { get; set; } = string.Empty;
    public string? AdminPhone { get; set; }
    public string AdminPassword { get; set; } = "+998991992012";
}

public class UpdateCenterTariffDto
{
    public CenterTariffPlan TariffPlan { get; set; }
    public int? CustomQuota { get; set; }
    public decimal? CustomPrice { get; set; }
    public int ExtendMonths { get; set; } = 1;
}

public class UpdateCenterDto
{
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public CenterStatus Status { get; set; }
    public string? Notes { get; set; }
}

public class TariffPlanOptionDto
{
    public CenterTariffPlan Plan { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Quota { get; set; }
    public decimal Price { get; set; }
    public string Description { get; set; } = string.Empty;
}
