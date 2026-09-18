namespace EduFlow.Domain.Enums;

public enum UserRole
{
    Admin,
    Teacher,
    Student
}

public enum UserStatus
{
    Active,
    Inactive
}

public enum CourseStatus
{
    Active,
    Inactive,
    Archived
}

public enum GroupStatus
{
    Planned,
    Active,
    Completed
}

public enum EnrollmentStatus
{
    Active,
    Dropped,
    Completed
}

public enum AttendanceStatus
{
    Present,
    Late,
    Absent
}

public enum PaymentMethod
{
    Cash,
    Card,
    BankTransfer
}

public enum PaymentStatus
{
    Completed,
    Pending,
    Refunded
}
