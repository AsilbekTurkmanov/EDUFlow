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
    BankTransfer,
    Payme,
    Click
}

public enum PaymentStatus
{
    Completed,
    Pending,
    Refunded
}

public enum CenterTariffPlan
{
    Starter_200,     // 200 tagacha o'quvchi - 500,000 so'm / oy
    Standard_400,    // 400 tagacha o'quvchi - 700,000 so'm / oy
    Enterprise_1000, // 1000 tagacha o'quvchi - 1,200,000 so'm / oy
    Unlimited        // Cheksiz o'quvchi - 2,500,000 so'm / oy
}

public enum CenterStatus
{
    Active,          // Faol ishlab turibdi
    QuotaExceeded,   // O'quvchi limiti to'lgan yoki oshib ketgan (Yangi o'quvchi qo'shish bloklangan)
    Suspended,       // Vaqtincha to'xtatilgan
    Expired          // Obuna muddati tugagan
}

public enum LeadStatus
{
    Interested,        // Qiziqish bildirganlar (Yangi kelgan lidlar)
    Contacted,         // Gaplashilganlar (Qo'ng'iroq qilingan, aloqaga chiqilgan)
    MeetingScheduled,  // Uchrashuv belgilanganlar (Markazga uchrashuvga kelishi rejalashtirilgan)
    DemoAttended,      // Demo darsga kelganlar (Sinov darsida qatnashgan)
    Converted,         // To'lov qilganlar (Shartnoma tuzgan, to'lov qilgan)
    Lost               // Rad etganlar / Noaktiv
}

public enum LeadSource
{
    Instagram,
    Telegram,
    Facebook,
    Recommendation,
    Banner,
    Website,
    WalkIn,
    Other
}

public enum TeacherCompensationType
{
    Percentage,       // Foiz usulida (40-70% yoki rahbar belgilagan maxsus %)
    FixedPerStudent,  // Har bir o'quvchidan qat'iy summa (masalan, 400 000 so'm / o'quvchi)
    FixedMonthly      // Oylik o'zgarmas maosh (masalan, 8 000 000 so'm / oy)
}
