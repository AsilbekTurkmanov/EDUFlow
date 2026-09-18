using EduFlow.Domain.Entities;
using EduFlow.Domain.Enums;
using EduFlow.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace EduFlow.Infrastructure.Data;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<EduFlowDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<EduFlowDbContext>>();

        logger.LogInformation("Checking database schema and ensuring tables exist...");
        await db.Database.EnsureCreatedAsync();

        if (await db.Users.AnyAsync())
        {
            logger.LogInformation("Database already has seed data. Skipping seed.");
            return;
        }

        logger.LogInformation("Seeding initial data for EduFlow...");

        // 1. Users
        var admin = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Sardor Rahimov (Admin)",
            Email = "admin@eduflow.uz",
            PasswordHash = hasher.Hash("Admin123!"),
            Role = UserRole.Admin,
            Status = UserStatus.Active,
            Phone = "+998 90 123 45 67",
            CreatedAt = DateTime.UtcNow.AddMonths(-3)
        };

        var teacher1 = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Anvar Karimov (Senior .NET)",
            Email = "anvar.ustoz@eduflow.uz",
            PasswordHash = hasher.Hash("Teacher123!"),
            Role = UserRole.Teacher,
            Status = UserStatus.Active,
            Phone = "+998 93 222 33 44",
            CreatedAt = DateTime.UtcNow.AddMonths(-3)
        };

        var teacher2 = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Madina Alimova (Frontend Lead)",
            Email = "madina.ustoz@eduflow.uz",
            PasswordHash = hasher.Hash("Teacher123!"),
            Role = UserRole.Teacher,
            Status = UserStatus.Active,
            Phone = "+998 94 333 44 55",
            CreatedAt = DateTime.UtcNow.AddMonths(-3)
        };

        var student1 = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Jasur Bekmirzayev",
            Email = "jasur@eduflow.uz",
            PasswordHash = hasher.Hash("Student123!"),
            Role = UserRole.Student,
            Status = UserStatus.Active,
            Phone = "+998 97 111 22 33",
            CreatedAt = DateTime.UtcNow.AddMonths(-2)
        };

        var student2 = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Shahzod Normatov",
            Email = "shahzod@eduflow.uz",
            PasswordHash = hasher.Hash("Student123!"),
            Role = UserRole.Student,
            Status = UserStatus.Active,
            Phone = "+998 91 444 55 66",
            CreatedAt = DateTime.UtcNow.AddMonths(-2)
        };

        var student3 = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Dilnoza Rahimova",
            Email = "dilnoza@eduflow.uz",
            PasswordHash = hasher.Hash("Student123!"),
            Role = UserRole.Student,
            Status = UserStatus.Active,
            Phone = "+998 99 777 88 99",
            CreatedAt = DateTime.UtcNow.AddMonths(-1)
        };

        var student4 = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Malika Yusupova",
            Email = "malika@eduflow.uz",
            PasswordHash = hasher.Hash("Student123!"),
            Role = UserRole.Student,
            Status = UserStatus.Active,
            Phone = "+998 95 888 99 00",
            CreatedAt = DateTime.UtcNow.AddMonths(-1)
        };

        db.Users.AddRange(admin, teacher1, teacher2, student1, student2, student3, student4);

        // 2. Courses
        var courseNet = new Course
        {
            Id = Guid.NewGuid(),
            Name = ".NET 10 Backend Architecture",
            Description = "Clean Architecture, Entity Framework Core, PostgreSQL, REST API, Docker va CI/CD kursi",
            Price = 3500000m,
            DurationWeeks = 16,
            Status = CourseStatus.Active,
            CreatedAt = DateTime.UtcNow.AddMonths(-3)
        };

        var courseReact = new Course
        {
            Id = Guid.NewGuid(),
            Name = "React JS & Modern Frontend",
            Description = "React 19, SPA, State Management, Tailwind/Vanilla CSS va zamonaviy veb ilovalar",
            Price = 3000000m,
            DurationWeeks = 12,
            Status = CourseStatus.Active,
            CreatedAt = DateTime.UtcNow.AddMonths(-3)
        };

        var courseFullstack = new Course
        {
            Id = Guid.NewGuid(),
            Name = "Full-Stack Enterprise Bootcamp",
            Description = "Frontend React + Backend .NET to'liq integratsiya loyihasi",
            Price = 6000000m,
            DurationWeeks = 24,
            Status = CourseStatus.Active,
            CreatedAt = DateTime.UtcNow.AddMonths(-2)
        };

        db.Courses.AddRange(courseNet, courseReact, courseFullstack);

        // 3. Groups
        var groupNet = new Group
        {
            Id = Guid.NewGuid(),
            Name = "DOTNET-G101",
            CourseId = courseNet.Id,
            TeacherId = teacher1.Id,
            StartDate = DateTime.UtcNow.AddMonths(-1),
            EndDate = DateTime.UtcNow.AddMonths(3),
            Status = GroupStatus.Active,
            CreatedAt = DateTime.UtcNow.AddMonths(-1)
        };

        var groupReact = new Group
        {
            Id = Guid.NewGuid(),
            Name = "REACT-G201",
            CourseId = courseReact.Id,
            TeacherId = teacher2.Id,
            StartDate = DateTime.UtcNow.AddDays(-20),
            EndDate = DateTime.UtcNow.AddMonths(2),
            Status = GroupStatus.Active,
            CreatedAt = DateTime.UtcNow.AddDays(-20)
        };

        db.Groups.AddRange(groupNet, groupReact);

        // 4. Enrollments
        var enr1 = new Enrollment { GroupId = groupNet.Id, StudentId = student1.Id, JoinedAt = DateTime.UtcNow.AddMonths(-1), Status = EnrollmentStatus.Active };
        var enr2 = new Enrollment { GroupId = groupNet.Id, StudentId = student2.Id, JoinedAt = DateTime.UtcNow.AddMonths(-1), Status = EnrollmentStatus.Active };
        var enr3 = new Enrollment { GroupId = groupNet.Id, StudentId = student3.Id, JoinedAt = DateTime.UtcNow.AddDays(-25), Status = EnrollmentStatus.Active };

        var enr4 = new Enrollment { GroupId = groupReact.Id, StudentId = student1.Id, JoinedAt = DateTime.UtcNow.AddDays(-20), Status = EnrollmentStatus.Active };
        var enr5 = new Enrollment { GroupId = groupReact.Id, StudentId = student4.Id, JoinedAt = DateTime.UtcNow.AddDays(-20), Status = EnrollmentStatus.Active };

        db.Enrollments.AddRange(enr1, enr2, enr3, enr4, enr5);

        // 5. Lessons
        var lesson1 = new Lesson
        {
            Id = Guid.NewGuid(),
            GroupId = groupNet.Id,
            Title = "1-Dars: Clean Architecture asoslari va EF Core PostgreSQL",
            StartsAt = DateTime.UtcNow.AddDays(-2).Date.AddHours(14),
            EndsAt = DateTime.UtcNow.AddDays(-2).Date.AddHours(16),
            Room = "Auditoriya 101",
            OnlineUrl = "https://meet.google.com/edu-net-101"
        };

        var lesson2 = new Lesson
        {
            Id = Guid.NewGuid(),
            GroupId = groupNet.Id,
            Title = "2-Dars: JWT Authentication va Role Authorization",
            StartsAt = DateTime.UtcNow.Date.AddHours(14),
            EndsAt = DateTime.UtcNow.Date.AddHours(16),
            Room = "Auditoriya 101",
            OnlineUrl = "https://meet.google.com/edu-net-101"
        };

        var lesson3 = new Lesson
        {
            Id = Guid.NewGuid(),
            GroupId = groupNet.Id,
            Title = "3-Dars: Scalar OpenAPI va Darslar to'qnashuvini tekshirish",
            StartsAt = DateTime.UtcNow.AddDays(2).Date.AddHours(14),
            EndsAt = DateTime.UtcNow.AddDays(2).Date.AddHours(16),
            Room = "Auditoriya 101",
            OnlineUrl = "https://meet.google.com/edu-net-101"
        };

        var lessonReact1 = new Lesson
        {
            Id = Guid.NewGuid(),
            GroupId = groupReact.Id,
            Title = "React komponentlar va State boshqaruvi",
            StartsAt = DateTime.UtcNow.Date.AddHours(16).AddMinutes(30),
            EndsAt = DateTime.UtcNow.Date.AddHours(18).AddMinutes(30),
            Room = "Auditoriya 204",
            OnlineUrl = "https://meet.google.com/edu-react-201"
        };

        db.Lessons.AddRange(lesson1, lesson2, lesson3, lessonReact1);

        // 6. Attendance
        db.Attendances.AddRange(
            new Attendance { LessonId = lesson1.Id, StudentId = student1.Id, Status = AttendanceStatus.Present, Note = "Darsda faol qatnashdi" },
            new Attendance { LessonId = lesson1.Id, StudentId = student2.Id, Status = AttendanceStatus.Late, Note = "10 daqiqa kechikib keldi" },
            new Attendance { LessonId = lesson1.Id, StudentId = student3.Id, Status = AttendanceStatus.Present, Note = "O'z vaqtida keldi" }
        );

        // 7. Assignments
        var assign1 = new Assignment
        {
            Id = Guid.NewGuid(),
            GroupId = groupNet.Id,
            Title = "Vazifa #1: Repository va Unit of Work pattern yaratish",
            Description = "EF Core yordamida PostgreSQL bazasi bilan bog'lanuvchi repository qatlamini yarating va CRUD amallarini yozing.",
            Deadline = DateTime.UtcNow.AddDays(3),
            MaxScore = 100,
            CreatedAt = DateTime.UtcNow.AddDays(-2)
        };

        var assign2 = new Assignment
        {
            Id = Guid.NewGuid(),
            GroupId = groupReact.Id,
            Title = "Vazifa #1: React Dashboard UI interfeysi",
            Description = "Ko'k rangdan foydalanmasdan, zamonaviy Zumrad va Qahrabo ranglarida boshqaruv paneli sahifasini yarating.",
            Deadline = DateTime.UtcNow.AddDays(5),
            MaxScore = 100,
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        db.Assignments.AddRange(assign1, assign2);

        // 8. Submissions
        var sub1 = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assign1.Id,
            StudentId = student1.Id,
            Url = "https://github.com/jasur-dev/eduflow-backend-task",
            Text = "Topshiriq to'liq bajarildi, barcha unit testlar o'tgan.",
            SubmittedAt = DateTime.UtcNow.AddHours(-12),
            Score = 95,
            Feedback = "Ajoyib bajarilgan! Kod tuzilishi toza va o'qilishi oson."
        };

        var sub2 = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assign1.Id,
            StudentId = student2.Id,
            Url = "https://github.com/shahzod/net10-repository-homework",
            Text = "PostgreSQL ulanish sozlandi, migratsiyalar qo'shildi.",
            SubmittedAt = DateTime.UtcNow.AddHours(-4),
            Score = null,
            Feedback = null
        };

        db.Submissions.AddRange(sub1, sub2);

        // 9. Payments
        var pay1 = new Payment
        {
            Id = Guid.NewGuid(),
            StudentId = student1.Id,
            Amount = 2000000m,
            PaidAt = DateTime.UtcNow.AddDays(-25),
            Method = PaymentMethod.Card,
            Status = PaymentStatus.Completed,
            Note = ".NET kursi uchun 1-qism to'lov"
        };

        var pay2 = new Payment
        {
            Id = Guid.NewGuid(),
            StudentId = student1.Id,
            Amount = 1500000m,
            PaidAt = DateTime.UtcNow.AddDays(-5),
            Method = PaymentMethod.BankTransfer,
            Status = PaymentStatus.Completed,
            Note = ".NET kursi yakuniy to'lov"
        };

        var pay3 = new Payment
        {
            Id = Guid.NewGuid(),
            StudentId = student2.Id,
            Amount = 1800000m,
            PaidAt = DateTime.UtcNow.AddDays(-15),
            Method = PaymentMethod.Card,
            Status = PaymentStatus.Completed,
            Note = "Boshlang'ich 50% to'lov"
        };

        var pay4 = new Payment
        {
            Id = Guid.NewGuid(),
            StudentId = student3.Id,
            Amount = 3500000m,
            PaidAt = DateTime.UtcNow.AddDays(-20),
            Method = PaymentMethod.Cash,
            Status = PaymentStatus.Completed,
            Note = "To'liq kurs to'lovi kassa orqali"
        };

        var pay5 = new Payment
        {
            Id = Guid.NewGuid(),
            StudentId = student4.Id,
            Amount = 1500000m,
            PaidAt = DateTime.UtcNow.AddDays(-10),
            Method = PaymentMethod.Card,
            Status = PaymentStatus.Completed,
            Note = "React kursi 1-oy to'lovi"
        };

        db.Payments.AddRange(pay1, pay2, pay3, pay4, pay5);

        // 10. Audit Logs
        db.AuditLogs.AddRange(
            new AuditLog { UserId = admin.Id, Action = "SEED", Entity = "System", EntityId = "init", CreatedAt = DateTime.UtcNow.AddMonths(-1), Metadata = "Tizim ma'lumotlari bazasi ishga tushirildi" },
            new AuditLog { UserId = admin.Id, Action = "CREATE", Entity = "Course", EntityId = courseNet.Id.ToString(), CreatedAt = DateTime.UtcNow.AddMonths(-1), Metadata = "Kurs qo'shildi: .NET 10 Backend Architecture" },
            new AuditLog { UserId = admin.Id, Action = "CREATE", Entity = "Group", EntityId = groupNet.Id.ToString(), CreatedAt = DateTime.UtcNow.AddMonths(-1), Metadata = "Guruh ochildi: DOTNET-G101" }
        );

        await db.SaveChangesAsync();
        logger.LogInformation("Database seeded successfully with test data!");
    }
}
