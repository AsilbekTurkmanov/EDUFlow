using EduFlow.Domain.Enums;

namespace EduFlow.Domain.Entities;

public class LearningCenter
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? Email { get; set; }
    public Guid? AdminUserId { get; set; }
    
    // Subscription & Tariff Quotas
    public CenterTariffPlan TariffPlan { get; set; } = CenterTariffPlan.Starter_200;
    public int MaxStudentsQuota { get; set; } = 200;
    public decimal MonthlySubscriptionPrice { get; set; } = 500000m;
    public CenterStatus Status { get; set; } = CenterStatus.Active;
    public DateTime SubscriptionValidUntil { get; set; } = DateTime.UtcNow.AddMonths(1);
    public bool AutoBlockOnQuotaExceeded { get; set; } = true;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Course> Courses { get; set; } = new List<Course>();
    public ICollection<Group> Groups { get; set; } = new List<Group>();
}
