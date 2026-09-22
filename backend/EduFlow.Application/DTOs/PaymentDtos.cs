using EduFlow.Domain.Enums;

namespace EduFlow.Application.DTOs;

public class PaymentDto
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string StudentEmail { get; set; } = string.Empty;
    public string? StudentPhone { get; set; }
    public string? ParentPhone { get; set; }
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
    public string? StudentPhone { get; set; }
    public string? ParentPhone { get; set; }
    public decimal MonthlyFee { get; set; } = 800000m;
    public decimal TotalCourseFee { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal Balance { get; set; } // +0, -800 000, +7 200 000
    public decimal RemainingDebt => Balance < 0 ? Math.Abs(Balance) : 0;
    public int ActiveEnrollmentsCount { get; set; }
    public string StatusText => Balance > 0 ? "Oldindan to'langan" : (Balance == 0 ? "To'langan" : "Qarzdor");
    public List<MonthlyPaymentStatDto> MonthlyStats { get; set; } = new();
}

public class StudentBalanceDto
{
    public Guid StudentId { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public decimal MonthlyTuition { get; set; } = 800000m;
    public int EnrolledMonths { get; set; }
    public decimal TotalTuitionRequired { get; set; }
    public decimal TotalPaid { get; set; }
    public decimal Balance { get; set; }
    public string BalanceFormatted { get; set; } = string.Empty;
    public string StatusText { get; set; } = string.Empty;
    public List<PaymentDto> RecentPayments { get; set; } = new();
}
