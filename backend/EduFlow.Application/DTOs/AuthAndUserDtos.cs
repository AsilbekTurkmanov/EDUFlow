using EduFlow.Domain.Enums;

namespace EduFlow.Application.DTOs;

public class LoginRequestDto
{
    public string Email { get; set; } = string.Empty;
    public string? Username { get; set; }
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Username { get; set; }
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; }
    public string? Phone { get; set; }
    public string? ParentPhone { get; set; }
    public int ExperienceYears { get; set; }
    public Guid? CenterId { get; set; }
    public string? CenterName { get; set; }
    public DateTime CreatedAt { get; set; }

    // Teacher specific calculations & flexible compensation settings
    public TeacherCompensationType CompensationType { get; set; } = TeacherCompensationType.Percentage;
    public string CompensationTypeName { get; set; } = "Foizda (%)";
    public int? CustomSharePercentage { get; set; }
    public decimal? FixedAmount { get; set; }
    public int SharePercentage { get; set; } // Effective percentage (e.g. 70%, 65%)
    public decimal MonthlyRevenueGenerated { get; set; } // Markazga oyiga keltirgan jami tushumi (studentsCount * 800,000 UZS)
    public decimal MonthlyEarned { get; set; } // O'qituvchiga to'lanadigan ulush/maosh
    public decimal CenterNetProfit { get; set; } // Markazda qoladigan sof foyda
    public decimal TotalEarned { get; set; }
    public int StudentsCount { get; set; }
    public List<string> StudentNames { get; set; } = new();

    // Student specific calculations
    public decimal MonthlyFee { get; set; } = 800000m;
    public decimal TotalPaid { get; set; }
    public decimal Balance { get; set; } // e.g. -800000, 0, +7200000
    public int PresentCount { get; set; }
    public int AbsentCount { get; set; }
    public int LateCount { get; set; }
    public double AttendanceRate { get; set; }
    public List<string> GroupNames { get; set; } = new();
    public List<MonthlyPaymentStatDto> MonthlyPaymentStats { get; set; } = new();
}

public class MonthlyPaymentStatDto
{
    public string Month { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public bool IsPaid { get; set; }
}

public class CreateUserDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Username { get; set; }
    public string Password { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string? Phone { get; set; }
    public string? ParentPhone { get; set; }
    public int ExperienceYears { get; set; } = 0;
    public Guid? CenterId { get; set; }
}

public class UpdateUserDto
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Username { get; set; }
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; }
    public string? Phone { get; set; }
    public string? ParentPhone { get; set; }
    public int ExperienceYears { get; set; }
    public Guid? CenterId { get; set; }
    public string? NewPassword { get; set; }
}

public class UpdateTeacherCompensationDto
{
    public TeacherCompensationType CompensationType { get; set; } = TeacherCompensationType.Percentage;
    public int? CustomSharePercentage { get; set; }
    public decimal? FixedAmount { get; set; }
}
