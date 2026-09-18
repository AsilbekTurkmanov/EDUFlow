using EduFlow.Domain.Enums;

namespace EduFlow.Application.DTOs;

public class PaymentDto
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentEmail { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime PaidAt { get; set; }
    public PaymentMethod Method { get; set; }
    public PaymentStatus Status { get; set; }
    public string? Note { get; set; }
}

public class CreatePaymentDto
{
    public Guid StudentId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; } = PaymentMethod.Card;
    public string? Note { get; set; }
}

public class StudentDebtDto
{
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentEmail { get; set; } = string.Empty;
    public decimal TotalCourseFee { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal RemainingDebt => Math.Max(0, TotalCourseFee - TotalPaid);
    public int ActiveEnrollmentsCount { get; set; }
}
