using EduFlow.Domain.Enums;

namespace EduFlow.Domain.Entities;

public class TeacherPayroll
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TeacherId { get; set; }
    public User Teacher { get; set; } = null!;

    public Guid? CenterId { get; set; }
    public LearningCenter? Center { get; set; }

    public string PeriodMonth { get; set; } = string.Empty; // masalan: "2026-09"
    public int ActiveStudentsCount { get; set; }
    public decimal TotalRevenueGenerated { get; set; }
    public TeacherCompensationType CompensationType { get; set; }
    public int SharePercentage { get; set; }
    public decimal BaseAmount { get; set; }
    public decimal Bonus { get; set; }
    public decimal Deductions { get; set; }
    public decimal FinalAmount { get; set; }

    public PayrollStatus Status { get; set; } = PayrollStatus.Pending;
    public DateTime? PaidAt { get; set; }
    public string? PaymentNote { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
