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

        bool needsRecreation = false;
        try
        {
            var hasAdmin = await db.Users.AnyAsync(u => u.Username == "asilbekturkmanov");
            var hasCenters = await db.LearningCenters.AnyAsync();
            var hasLeads = await db.Leads.AnyAsync();
            var totalUsers = await db.Users.CountAsync();
            if (!hasAdmin || !hasCenters || !hasLeads || totalUsers < 50)
            {
                needsRecreation = true;
            }
        }
        catch
        {
            needsRecreation = true;
        }

        if (needsRecreation)
        {
            logger.LogInformation("Recreating database schema with updated tables and new columns...");
            await db.Database.EnsureDeletedAsync();
            await db.Database.EnsureCreatedAsync();
        }
        else
        {
            logger.LogInformation("Database already initialized with centers and required users.");
            return;
        }

        logger.LogInformation("Seeding SaaS Multi-Tenant Learning Centers & 800+ records for EduFlow...");

        var defaultPasswordHash = hasher.Hash("+998991992012");

        // 1. Seed Multi-Tenant Learning Centers
        var center1 = new LearningCenter
        {
            Id = Guid.NewGuid(),
            Name = "EduFlow Bosh Markaz (Toshkent)",
            Slug = "toshkent",
            Address = "Amir Temur shoh ko'chasi 107-B, Toshkent",
            Phone = "+998 71 200 00 11",
            Email = "toshkent@eduflow.uz",
            TariffPlan = CenterTariffPlan.Standard_400,
            MaxStudentsQuota = 400,
            MonthlySubscriptionPrice = 700000m,
            Status = CenterStatus.Active,
            AutoBlockOnQuotaExceeded = true,
            SubscriptionValidUntil = DateTime.UtcNow.AddMonths(11),
            CreatedAt = DateTime.UtcNow.AddMonths(-12)
        };

        var center2 = new LearningCenter
        {
            Id = Guid.NewGuid(),
            Name = "Najot Nur IT Academy (Chilonzor)",
            Slug = "najot-nur",
            Address = "Chilonzor 9-mavze, Qatortol ko'chasi 1-uy",
            Phone = "+998 78 888 99 00",
            Email = "info@najotnur.uz",
            TariffPlan = CenterTariffPlan.Starter_200,
            MaxStudentsQuota = 200,
            MonthlySubscriptionPrice = 500000m,
            Status = CenterStatus.Active,
            AutoBlockOnQuotaExceeded = true,
            SubscriptionValidUntil = DateTime.UtcNow.AddMonths(5),
            CreatedAt = DateTime.UtcNow.AddMonths(-6)
        };

        var center3 = new LearningCenter
        {
            Id = Guid.NewGuid(),
            Name = "Registon Smart School (Yunusobod)",
            Slug = "registon-smart",
            Address = "Yunusobod 4-mavze, Ahmad Donish ko'chasi",
            Phone = "+998 71 202 33 44",
            Email = "yunusobod@registon.uz",
            TariffPlan = CenterTariffPlan.Starter_200,
            MaxStudentsQuota = 200,
            MonthlySubscriptionPrice = 500000m,
            Status = CenterStatus.QuotaExceeded, // 200/200 reached -> BLOCKED test case!
            AutoBlockOnQuotaExceeded = true,
            SubscriptionValidUntil = DateTime.UtcNow.AddMonths(2),
            CreatedAt = DateTime.UtcNow.AddMonths(-4)
        };

        var center4 = new LearningCenter
        {
            Id = Guid.NewGuid(),
            Name = "PDP Enterprise Campus (Beruniy)",
            Slug = "pdp-campus",
            Address = "Beruniy shoh ko'chasi 3A-uy",
            Phone = "+998 78 777 47 47",
            Email = "enterprise@pdp.uz",
            TariffPlan = CenterTariffPlan.Enterprise_1000,
            MaxStudentsQuota = 1000,
            MonthlySubscriptionPrice = 1200000m,
            Status = CenterStatus.Active,
            AutoBlockOnQuotaExceeded = true,
            SubscriptionValidUntil = DateTime.UtcNow.AddMonths(9),
            CreatedAt = DateTime.UtcNow.AddMonths(-8)
        };

        db.LearningCenters.AddRange(center1, center2, center3, center4);
        await db.SaveChangesAsync();
        logger.LogInformation("Saved 4 Multi-Tenant Learning Centers.");

        // 2. Core Users (Super Admin, Center Admins, Shahriyor teacher, Turkmanov student)
        var superAdmin = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Asilbek Turkmanov (Super Admin)",
            Email = "asilbekturkmanov@eduflow.uz",
            Username = "asilbekturkmanov",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Admin,
            Status = UserStatus.Active,
            CenterId = null, // Super Admin oversees all
            Phone = "+998 99 199 20 12",
            CreatedAt = DateTime.UtcNow.AddMonths(-12)
        };

        var najotAdmin = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Najot Nur IT Admin",
            Email = "admin@najotnur.uz",
            Username = "najot_admin",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Admin,
            Status = UserStatus.Active,
            CenterId = center2.Id,
            Phone = "+998 78 888 99 01",
            CreatedAt = DateTime.UtcNow.AddMonths(-6)
        };

        var registonAdmin = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Registon Smart Admin",
            Email = "admin@registon.uz",
            Username = "registon_admin",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Admin,
            Status = UserStatus.Active,
            CenterId = center3.Id,
            Phone = "+998 71 202 33 45",
            CreatedAt = DateTime.UtcNow.AddMonths(-4)
        };

        var pdpAdmin = new User
        {
            Id = Guid.NewGuid(),
            FullName = "PDP Campus Admin",
            Email = "admin@pdp.uz",
            Username = "pdp_admin",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Admin,
            Status = UserStatus.Active,
            CenterId = center4.Id,
            Phone = "+998 78 777 47 48",
            CreatedAt = DateTime.UtcNow.AddMonths(-8)
        };

        var mainTeacher = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Shahriyor O'qituvchi",
            Email = "shahriyor@eduflow.uz",
            Username = "shahriyor",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Teacher,
            Status = UserStatus.Active,
            CenterId = center1.Id,
            Phone = "+998 90 345 67 89",
            ExperienceYears = 3, // 3+ years -> 70% share!
            CreatedAt = DateTime.UtcNow.AddYears(-3)
        };

        var mainStudent = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Turkmanov O'quvchi",
            Email = "turkmanov@eduflow.uz",
            Username = "turkmanov",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Student,
            Status = UserStatus.Active,
            CenterId = center1.Id,
            Phone = "+998 99 199 20 12",
            ParentPhone = "+998 90 777 55 44",
            CreatedAt = DateTime.UtcNow.AddMonths(-2)
        };

        var allUsers = new List<User> { superAdmin, najotAdmin, registonAdmin, pdpAdmin, mainTeacher, mainStudent };

        // 15 Additional Teachers with diverse experience across centers
        var teacherConfigs = new[]
        {
            ("Anvar Karimov (Senior .NET)", "anvar.karimov@eduflow.uz", "anvar_k", 4, "+998 93 111 22 33", center1.Id),
            ("Madina Alimova (Frontend Lead)", "madina.alimova@eduflow.uz", "madina_a", 2, "+998 94 222 33 44", center1.Id),
            ("Bobur Mirzayev (Mobile Lead)", "bobur.mirzayev@eduflow.uz", "bobur_m", 3, "+998 91 333 44 55", center1.Id),
            ("Nodira Rahimova (Data Science)", "nodira.rahimova@eduflow.uz", "nodira_r", 3, "+998 90 444 55 66", center2.Id),
            ("Javohir Toshmatov (Cybersecurity)", "javohir.toshmatov@eduflow.uz", "javohir_t", 2, "+998 97 555 66 77", center2.Id),
            ("Sarvar Usmonov (Python Backend)", "sarvar.usmonov@eduflow.uz", "sarvar_u", 2, "+998 99 666 77 88", center2.Id),
            ("Dilshod Akramov (UI/UX Designer)", "dilshod.akramov@eduflow.uz", "dilshod_a", 1, "+998 93 777 88 99", center3.Id),
            ("Umida Ergasheva (QA Automation)", "umida.ergasheva@eduflow.uz", "umida_e", 1, "+998 94 888 99 00", center3.Id),
            ("Sherzod Zokirov (React Dev)", "sherzod.zokirov@eduflow.uz", "sherzod_z", 1, "+998 90 999 00 11", center3.Id),
            ("Rustam Qodirov (DevOps Architect)", "rustam.qodirov@eduflow.uz", "rustam_q", 5, "+998 91 123 45 67", center4.Id),
            ("Aziza Karimova (Junior Mentor)", "aziza.karimova@eduflow.uz", "aziza_k", 0, "+998 97 234 56 78", center4.Id),
            ("Farrux Fayziyev (Tutor)", "farrux.fayziyev@eduflow.uz", "farrux_f", 0, "+998 99 345 67 89", center4.Id),
            ("Gulnoza Hamidova (Math & Algo)", "gulnoza.hamidova@eduflow.uz", "gulnoza_h", 0, "+998 93 456 78 90", center1.Id),
            ("Zafar Shukurov (Cloud Specialist)", "zafar.shukurov@eduflow.uz", "zafar_s", 2, "+998 94 567 89 01", center2.Id),
            ("Malika Ismoilova (Full-Stack Mentor)", "malika.ismoilova@eduflow.uz", "malika_i", 1, "+998 90 678 90 12", center3.Id)
        };

        var teachersList = new List<User> { mainTeacher };
        int tIdx = 0;
        foreach (var tc in teacherConfigs)
        {
            var t = new User
            {
                Id = Guid.NewGuid(),
                FullName = tc.Item1,
                Email = tc.Item2,
                Username = tc.Item3,
                PasswordHash = defaultPasswordHash,
                Role = UserRole.Teacher,
                Status = UserStatus.Active,
                CenterId = tc.Item6,
                Phone = tc.Item5,
                ExperienceYears = tc.Item4,
                CreatedAt = DateTime.UtcNow.AddYears(-Math.Max(1, tc.Item4))
            };

            // Sample compensation schemes for testing
            if (tIdx == 0) // Anvar Karimov (Senior .NET)
            {
                t.CompensationType = TeacherCompensationType.FixedPerStudent;
                t.FixedAmount = 450000m;
            }
            else if (tIdx == 1) // Madina Alimova (Frontend Lead)
            {
                t.CompensationType = TeacherCompensationType.Percentage;
                t.CustomSharePercentage = 65;
            }
            else if (tIdx == 2) // Bobur Mirzayev (Mobile Lead)
            {
                t.CompensationType = TeacherCompensationType.FixedMonthly;
                t.FixedAmount = 9000000m;
            }
            else if (tIdx == 5) // Sarvar Usmonov (Python Backend)
            {
                t.CompensationType = TeacherCompensationType.FixedPerStudent;
                t.FixedAmount = 400000m;
            }
            tIdx++;

            allUsers.Add(t);
            teachersList.Add(t);
        }

        // Realistic Uzbek Names
        var firstNames = new[] {
            "Jasur", "Shahzod", "Dilnoza", "Malika", "Bekzod", "Sanjar", "Kamola", "Farhod", "Nilufar", "Shohruh",
            "Mohira", "Jamshid", "Nigora", "Sardor", "Dildora", "Otabek", "Zilola", "Mirkomil", "Sevara", "Rustam",
            "Guzal", "Ulug'bek", "Umida", "Botir", "Feruza", "Eldor", "Laylo", "Alisher", "Diyora", "Aziz",
            "Lola", "Doniyor", "Shaxnoza", "Timur", "Gulchehra", "Nodir", "Nargiza", "Jahongir", "Munisa", "Sherali",
            "Saida", "Akmal", "Rayhon", "Dilshod", "Ziyoda", "Sunnat", "Xurshida", "Maqsad", "Gulbahor", "Bobur",
            "Nafisa", "Davron", "Rano", "Ilhom", "Dinara", "Shavkat", "Dilfuza", "Sobir", "Gulnoza", "Ravshan",
            "Shahnoza", "Erkin", "Mahliyo", "Furqat", "Ozoda", "Mansur", "Zarina", "Zafar", "Mavluda", "Muzaffar"
        };

        var lastNames = new[] {
            "Karimov", "Rahimova", "Aliyev", "Umarova", "Toshmatov", "Yusupova", "Bekmirzayev", "Normatova",
            "Ergashev", "Qodirova", "Fayziyev", "Hamidova", "Mirzayev", "Shukurova", "Zokirov", "Mahmudova",
            "Ismoilov", "Nabiyeva", "Xalilov", "Jalilova", "Saidov", "G'aniyeva", "Po'latov", "Tursunova",
            "Yoqubov", "Sobirova", "Qosimov", "Rustamova", "Bozorov", "Sharipova"
        };

        var studentUsers = new List<User> { mainStudent };
        int globalStudentCount = 1;

        // Helper function to seed students per center
        void SeedCenterStudents(Guid centerId, string centerCode, int count)
        {
            for (int i = 0; i < count; i++)
            {
                var fn = firstNames[(globalStudentCount * 7 + i) % firstNames.Length];
                var ln = lastNames[(globalStudentCount * 13 + i * 3) % lastNames.Length];
                var fullName = $"{fn} {ln}";
                var username = $"{fn.ToLower()}_{ln.ToLower()}_{centerCode}{globalStudentCount}";
                var email = $"{username}@eduflow.uz";
                var phone = $"+998 {90 + (globalStudentCount % 10)} {100 + (globalStudentCount % 800):D3} {(i * 17) % 90 + 10} {(i * 23) % 90 + 10}";
                var parentPhone = $"+998 {90 + ((globalStudentCount + 3) % 10)} {200 + (globalStudentCount % 700):D3} {(i * 19) % 90 + 10} {(i * 29) % 90 + 10}";

                var s = new User
                {
                    Id = Guid.NewGuid(),
                    FullName = fullName,
                    Email = email,
                    Username = username,
                    PasswordHash = defaultPasswordHash,
                    Role = UserRole.Student,
                    Status = UserStatus.Active,
                    CenterId = centerId,
                    Phone = phone,
                    ParentPhone = parentPhone,
                    CreatedAt = DateTime.UtcNow.AddDays(-(i * 2 + 5))
                };

                studentUsers.Add(s);
                allUsers.Add(s);
                globalStudentCount++;
            }
        }

        // Center 1 (EduFlow Bosh Markaz): 120 more students (total 121 / 400 quota = 30%)
        SeedCenterStudents(center1.Id, "c1", 120);

        // Center 2 (Najot Nur): 198 students (198 / 200 quota = 99% warning!)
        SeedCenterStudents(center2.Id, "najot", 198);

        // Center 3 (Registon): 200 students (200 / 200 quota = 100% BLOCKED!)
        SeedCenterStudents(center3.Id, "reg", 200);

        // Center 4 (PDP Enterprise): 340 students (340 / 1000 quota = 34%)
        SeedCenterStudents(center4.Id, "pdp", 340);

        db.Users.AddRange(allUsers);
        await db.SaveChangesAsync();
        logger.LogInformation($"Saved {allUsers.Count} users across 4 centers.");

        // 3. Courses (12 diverse courses distributed across centers)
        var courses = new List<Course>
        {
            // Center 1 Courses
            new() { Id = Guid.NewGuid(), CenterId = center1.Id, Name = ".NET 10 Enterprise Architecture", Description = "Clean Architecture, CQRS, EF Core, PostgreSQL, REST API va Microservices", Price = 3500000m, DurationWeeks = 16, Status = CourseStatus.Active },
            new() { Id = Guid.NewGuid(), CenterId = center1.Id, Name = "React 19 & Next.js Pro", Description = "Zamonaviy SPA, SSR, Zustand, React Query va Tailwind/Vanilla CSS", Price = 3200000m, DurationWeeks = 14, Status = CourseStatus.Active },
            new() { Id = Guid.NewGuid(), CenterId = center1.Id, Name = "Full-Stack Enterprise Bootcamp", Description = "Backend .NET 10 + Frontend React to'liq integratsiya loyihasi", Price = 6000000m, DurationWeeks = 24, Status = CourseStatus.Active },
            new() { Id = Guid.NewGuid(), CenterId = center1.Id, Name = "Algoritmlar va Ma'lumotlar Tuzilmasi", Description = "LeetCode masalalari, graf, daraxt, dinamik dasturlash", Price = 2500000m, DurationWeeks = 10, Status = CourseStatus.Active },
            // Center 2 Courses
            new() { Id = Guid.NewGuid(), CenterId = center2.Id, Name = "Python & Machine Learning", Description = "Python 3.12, Pandas, NumPy, Scikit-learn, PyTorch va AI modellari", Price = 3800000m, DurationWeeks = 18, Status = CourseStatus.Active },
            new() { Id = Guid.NewGuid(), CenterId = center2.Id, Name = "Flutter & Dart Mobile Dev", Description = "Cross-platform iOS va Android ilovalar yaratish", Price = 3400000m, DurationWeeks = 16, Status = CourseStatus.Active },
            new() { Id = Guid.NewGuid(), CenterId = center2.Id, Name = "Cloud Specialist (AWS & GCP)", Description = "AWS Cloud Practitioner, Docker containers va CI/CD", Price = 3900000m, DurationWeeks = 14, Status = CourseStatus.Active },
            // Center 3 Courses
            new() { Id = Guid.NewGuid(), CenterId = center3.Id, Name = "Cybersecurity & Ethical Hacking", Description = "Tarmoq xavfsizligi, penetratsion testlar va axborot himoyasi", Price = 4200000m, DurationWeeks = 16, Status = CourseStatus.Active },
            new() { Id = Guid.NewGuid(), CenterId = center3.Id, Name = "UI/UX Product Design & Figma", Description = "Figma, prototiplash, foydalanuvchi tadqiqotlari va dizayn tizimlari", Price = 2800000m, DurationWeeks = 12, Status = CourseStatus.Active },
            new() { Id = Guid.NewGuid(), CenterId = center3.Id, Name = "QA Manual & Automation", Description = "Test rejalashtirish, Selenium, Postman API va Bug tracking", Price = 3100000m, DurationWeeks = 12, Status = CourseStatus.Active },
            // Center 4 Courses
            new() { Id = Guid.NewGuid(), CenterId = center4.Id, Name = "DevOps & Cloud (Docker, K8s, CI/CD)", Description = "Linux, Docker, Kubernetes, GitHub Actions va AWS infratuzilmasi", Price = 4500000m, DurationWeeks = 16, Status = CourseStatus.Active },
            new() { Id = Guid.NewGuid(), CenterId = center4.Id, Name = "PostgreSQL & Database Engineering", Description = "Indekslar, tranzaksiyalar, query optimallashtirish va replikatsiya", Price = 2900000m, DurationWeeks = 12, Status = CourseStatus.Active }
        };

        db.Courses.AddRange(courses);
        await db.SaveChangesAsync();

        // 4. Groups with 25 distinct vibrant colors and unique names
        var distinctColors = new[]
        {
            "#10B981", "#6366F1", "#F59E0B", "#EC4899", "#06B6D4",
            "#8B5CF6", "#14B8A6", "#F97316", "#3B82F6", "#84CC16",
            "#E11D48", "#0284C7", "#D946EF", "#A855F7", "#F43F5E",
            "#0D9488", "#EAB308", "#4F46E5", "#22C55E", "#2563EB",
            "#7C3AED", "#C026D3", "#DB2777", "#EA580C", "#15803D"
        };

        var groupNames = new[]
        {
            ("DOTNET-PRO-101", 0, 0),    // Shahriyor, Center 1
            ("REACT-MODERN-201", 1, 1),  // Center 1
            ("FULLSTACK-CAMP-301", 2, 0),// Shahriyor, Center 1
            ("PYTHON-AI-401", 4, 6),     // Center 2
            ("FLUTTER-MOB-501", 5, 3),   // Center 2
            ("CYBER-SEC-601", 7, 5),     // Center 3
            ("UIUX-DESIGN-701", 8, 7),   // Center 3
            ("QA-AUTO-801", 9, 8),       // Center 3
            ("DEVOPS-CLOUD-901", 10, 10),// Center 4
            ("ALGO-LEET-102", 3, 0),     // Shahriyor, Center 1
            ("PG-ENGINEER-111", 11, 10), // Center 4
            ("CLOUD-AWS-121", 6, 14),    // Center 2
            ("DOTNET-ARCH-103", 0, 1),   // Center 1
            ("REACT-NEXT-202", 1, 2),    // Center 1
            ("PYTHON-DATA-402", 4, 6),   // Center 2
            ("FLUTTER-CROSS-502", 5, 3), // Center 2
            ("CYBER-DEFENSE-602", 7, 5), // Center 3
            ("FIGMA-PRO-702", 8, 7),     // Center 3
            ("DOCKER-K8S-902", 10, 10),  // Center 4
            ("ALGO-ADVANCED-104", 3, 13),// Center 1
            ("POSTGRES-PRO-112", 11, 10),// Center 4
            ("FRONTEND-VITE-203", 1, 1), // Center 1
            ("DOTNET-MICRO-105", 0, 0),  // Shahriyor, Center 1
            ("PYTHON-DEEP-403", 4, 6),   // Center 2
            ("FULLSTACK-CAMP-302", 2, 0) // Shahriyor, Center 1
        };

        var groups = new List<Group>();
        for (int i = 0; i < groupNames.Length; i++)
        {
            var (name, courseIdx, teacherIdx) = groupNames[i];
            var course = courses[courseIdx % courses.Count];
            var teacher = teachersList[teacherIdx % teachersList.Count];

            var grp = new Group
            {
                Id = Guid.NewGuid(),
                CenterId = course.CenterId,
                Name = name,
                CourseId = course.Id,
                TeacherId = teacher.Id,
                Color = distinctColors[i % distinctColors.Length],
                StartDate = DateTime.UtcNow.AddMonths(-2),
                EndDate = DateTime.UtcNow.AddMonths(4),
                Status = GroupStatus.Active,
                CreatedAt = DateTime.UtcNow.AddMonths(-2)
            };
            groups.Add(grp);
        }

        db.Groups.AddRange(groups);
        await db.SaveChangesAsync();
        logger.LogInformation($"Saved {groups.Count} groups with unique colors.");

        // 5. Enrollments (Distribute students within their center's groups)
        var enrollments = new List<Enrollment>();
        // Turkmanov in DOTNET-PRO-101 and REACT-MODERN-201
        enrollments.Add(new Enrollment { Id = Guid.NewGuid(), GroupId = groups[0].Id, StudentId = mainStudent.Id, JoinedAt = DateTime.UtcNow.AddMonths(-2), Status = EnrollmentStatus.Active });
        enrollments.Add(new Enrollment { Id = Guid.NewGuid(), GroupId = groups[1].Id, StudentId = mainStudent.Id, JoinedAt = DateTime.UtcNow.AddMonths(-1), Status = EnrollmentStatus.Active });

        var rnd = new Random(42);
        var groupsByCenter = groups.Where(g => g.CenterId.HasValue).GroupBy(g => g.CenterId!.Value).ToDictionary(g => g.Key, g => g.ToList());

        for (int i = 0; i < studentUsers.Count; i++)
        {
            var student = studentUsers[i];
            if (student.Id == mainStudent.Id) continue;
            if (student.CenterId == null || !groupsByCenter.TryGetValue(student.CenterId.Value, out var centerGroups) || centerGroups.Count == 0) continue;

            int primaryGroupIdx = i % centerGroups.Count;
            enrollments.Add(new Enrollment
            {
                Id = Guid.NewGuid(),
                GroupId = centerGroups[primaryGroupIdx].Id,
                StudentId = student.Id,
                JoinedAt = DateTime.UtcNow.AddDays(-rnd.Next(20, 70)),
                Status = EnrollmentStatus.Active
            });

            if (i % 3 == 0 && centerGroups.Count > 1)
            {
                int secondaryGroupIdx = (i + 1) % centerGroups.Count;
                enrollments.Add(new Enrollment
                {
                    Id = Guid.NewGuid(),
                    GroupId = centerGroups[secondaryGroupIdx].Id,
                    StudentId = student.Id,
                    JoinedAt = DateTime.UtcNow.AddDays(-rnd.Next(10, 40)),
                    Status = EnrollmentStatus.Active
                });
            }
        }

        db.Enrollments.AddRange(enrollments);
        await db.SaveChangesAsync();
        logger.LogInformation($"Saved {enrollments.Count} enrollments.");

        // 6. Lessons: Kundalik.com Timetable (Weekly schedule: Mon-Sat)
        var lessons = new List<Lesson>();
        var periodTimes = new (string Label, TimeSpan Start, TimeSpan End)[]
        {
            ("1-Dars", new TimeSpan(8, 30, 0), new TimeSpan(9, 15, 0)),
            ("2-Dars", new TimeSpan(9, 25, 0), new TimeSpan(10, 10, 0)),
            ("3-Dars", new TimeSpan(10, 20, 0), new TimeSpan(11, 5, 0)),
            ("4-Dars", new TimeSpan(11, 15, 0), new TimeSpan(12, 0, 0)),
            ("5-Dars", new TimeSpan(14, 0, 0), new TimeSpan(15, 30, 0)),
            ("6-Dars", new TimeSpan(16, 0, 0), new TimeSpan(17, 30, 0)),
            ("7-Dars", new TimeSpan(18, 0, 0), new TimeSpan(19, 30, 0))
        };

        var rooms = new[] { "Auditoriya 101", "Auditoriya 102", "Kompyuter Lab 1", "Kompyuter Lab 2", "Innovatsiya Zali", "Robototexnika Xonasi", "Katta Zal", "Online (Google Meet)" };

        var lessonTopics = new[]
        {
            "Clean Architecture va Domain Driven Design asoslari",
            "Entity Framework Core: Migratsiyalar va Query optimallashtirish",
            "JWT Authentication, Claims va Role-based Authorization",
            "React 19 Server Actions va Yangi Hooklar",
            "Zustand va TanStack Query bilan Global State boshqaruvi",
            "PostgreSQL Indekslar va Execution Plan tahlili",
            "Docker Containers va Docker Compose ko'p qatlamli arxitektura",
            "Kubernetes Pods, Services va Ingress sozlash",
            "Python OOP va PyTorch neyron tarmoqlar arxitekturasi",
            "Figma Component Library va Auto-layout tizimi",
            "GraphQL va REST API arxitekturaviy taqqoslash",
            "Microservices: RabbitMQ xabarlar navbati va MassTransit",
            "Unit Testlar va Integration Testing (xUnit, Moq)",
            "Web Xavfsizlik: OWASP Top 10 va XSS/CSRF himoya",
            "Algorithms: Graf algoritmlari (BFS, DFS, Dijkstra)"
        };

        var today = DateTime.UtcNow.Date;
        int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
        var monday = today.AddDays(-diff);
        var weekOffsets = new[] { -14, -7, 0, 7 };
        int lessonCounter = 0;

        foreach (var wOffset in weekOffsets)
        {
            var weekStart = monday.AddDays(wOffset);
            for (int day = 0; day < 6; day++)
            {
                var lessonDate = weekStart.AddDays(day);
                for (int pIdx = 0; pIdx < periodTimes.Length; pIdx++)
                {
                    var period = periodTimes[pIdx];
                    var grp = groups[(lessonCounter + day + pIdx) % groups.Count];
                    var topic = lessonTopics[(lessonCounter + pIdx) % lessonTopics.Length];
                    var room = rooms[(day + pIdx) % rooms.Length];

                    var startsAt = lessonDate.Add(period.Start);
                    var endsAt = lessonDate.Add(period.End);

                    var lesson = new Lesson
                    {
                        Id = Guid.NewGuid(),
                        GroupId = grp.Id,
                        Title = $"{period.Label}: {topic}",
                        StartsAt = startsAt,
                        EndsAt = endsAt,
                        Room = room,
                        OnlineUrl = room.Contains("Online") ? "https://meet.google.com/eduflow-lesson" : null
                    };
                    lessons.Add(lesson);
                    lessonCounter++;
                }
            }
        }

        db.Lessons.AddRange(lessons);
        await db.SaveChangesAsync();
        logger.LogInformation($"Saved {lessons.Count} lessons across timetable.");

        // 7. Attendances (for past lessons)
        var pastLessons = lessons.Where(l => l.EndsAt <= DateTime.UtcNow).ToList();
        var attendances = new List<Attendance>();
        var notesPresent = new[] { "Darsda juda faol", "O'z vaqtida keldi", "Topshiriqni a'lo bajardi", "Munozarada faol qatnashdi" };
        var notesLate = new[] { "10 daqiqa kechikib keldi", "Transport tirbandligi tufayli kechikdi", "5 daqiqa kechikdi" };
        var notesAbsent = new[] { "Sababsiz kelmadi", "Kasallik varaqasi bor", "Oldindan ogohlantirgan" };

        var lessonEnrollmentLookup = enrollments.GroupBy(e => e.GroupId).ToDictionary(g => g.Key, g => g.ToList());
        int attCount = 0;

        foreach (var l in pastLessons)
        {
            if (!lessonEnrollmentLookup.TryGetValue(l.GroupId, out var groupEnrs)) continue;

            foreach (var enr in groupEnrs.Take(15)) // limit per lesson for performance
            {
                attCount++;
                var roll = rnd.Next(100);
                AttendanceStatus status;
                string? note;

                if (roll < 80)
                {
                    status = AttendanceStatus.Present;
                    note = notesPresent[attCount % notesPresent.Length];
                }
                else if (roll < 92)
                {
                    status = AttendanceStatus.Late;
                    note = notesLate[attCount % notesLate.Length];
                }
                else
                {
                    status = AttendanceStatus.Absent;
                    note = notesAbsent[attCount % notesAbsent.Length];
                }

                attendances.Add(new Attendance
                {
                    Id = Guid.NewGuid(),
                    LessonId = l.Id,
                    StudentId = enr.StudentId,
                    Status = status,
                    Note = note
                });
            }
        }

        db.Attendances.AddRange(attendances);
        await db.SaveChangesAsync();
        logger.LogInformation($"Saved {attendances.Count} attendances.");

        // 8. Payments with authentic scenarios:
        // Monthly tuition = 800,000 UZS
        var payments = new List<Payment>();

        // Turkmanov: 9 months advance payment = 9 * 800,000 = 7,200,000 UZS!
        payments.Add(new Payment
        {
            Id = Guid.NewGuid(),
            StudentId = mainStudent.Id,
            Amount = 7200000m,
            PaidAt = DateTime.UtcNow.AddMonths(-2),
            Method = PaymentMethod.Card,
            Status = PaymentStatus.Completed,
            Note = "9 oylik to'liq o'quv kursi uchun oldindan to'lov (9 x 800,000 UZS)"
        });

        // Other students across centers:
        for (int i = 0; i < studentUsers.Count; i++)
        {
            var student = studentUsers[i];
            if (student.Id == mainStudent.Id) continue;

            if (i % 3 == 0)
            {
                payments.Add(new Payment
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id,
                    Amount = 800000m,
                    PaidAt = DateTime.UtcNow.AddDays(-rnd.Next(1, 25)),
                    Method = (i % 2 == 0) ? PaymentMethod.Card : PaymentMethod.Payme,
                    Status = PaymentStatus.Completed,
                    Note = "Joriy oy uchun oylik to'lov (800 000 UZS)"
                });
            }
            else if (i % 5 == 0)
            {
                int monthsAdvance = rnd.Next(2, 6);
                payments.Add(new Payment
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id,
                    Amount = monthsAdvance * 800000m,
                    PaidAt = DateTime.UtcNow.AddDays(-rnd.Next(5, 45)),
                    Method = PaymentMethod.Click,
                    Status = PaymentStatus.Completed,
                    Note = $"{monthsAdvance} oylik oldindan to'lov ({monthsAdvance * 800000:N0} UZS)"
                });
            }
            else if (i % 8 == 0)
            {
                payments.Add(new Payment
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id,
                    Amount = 400000m,
                    PaidAt = DateTime.UtcNow.AddDays(-rnd.Next(5, 15)),
                    Method = PaymentMethod.Cash,
                    Status = PaymentStatus.Completed,
                    Note = "Qisman to'lov (avans)"
                });
            }
        }

        db.Payments.AddRange(payments);
        await db.SaveChangesAsync();
        logger.LogInformation($"Saved {payments.Count} payments.");

        // 9. Assignments & Submissions
        var assignments = new List<Assignment>();
        for (int i = 0; i < groups.Count; i++)
        {
            var grp = groups[i];
            assignments.Add(new Assignment
            {
                Id = Guid.NewGuid(),
                GroupId = grp.Id,
                Title = $"Amaliy Vazifa #1: {grp.Name} asosiy loyihasi",
                Description = "Mavzu bo'yicha mustaqil topshiriqni GitHub ga yuklang va repository havolasini yuboring.",
                Deadline = DateTime.UtcNow.AddDays(rnd.Next(2, 10)),
                MaxScore = 100,
                CreatedAt = DateTime.UtcNow.AddDays(-rnd.Next(2, 10))
            });

            assignments.Add(new Assignment
            {
                Id = Guid.NewGuid(),
                GroupId = grp.Id,
                Title = $"Amaliy Vazifa #2: Testlar va arxitektura",
                Description = "Kod sifatini tekshirish va integratsion testlarni yozish.",
                Deadline = DateTime.UtcNow.AddDays(rnd.Next(5, 15)),
                MaxScore = 100,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            });
        }

        db.Assignments.AddRange(assignments);
        await db.SaveChangesAsync();

        var submissions = new List<Submission>();
        for (int i = 0; i < Math.Min(assignments.Count, 30); i++)
        {
            var assign = assignments[i];
            var enrs = enrollments.Where(e => e.GroupId == assign.GroupId).Take(3).ToList();
            foreach (var enr in enrs)
            {
                submissions.Add(new Submission
                {
                    Id = Guid.NewGuid(),
                    AssignmentId = assign.Id,
                    StudentId = enr.StudentId,
                    Url = "https://github.com/student/eduflow-task",
                    Text = "Vazifa to'liq bajarildi, barcha talablar inobatga olindi.",
                    SubmittedAt = DateTime.UtcNow.AddHours(-rnd.Next(4, 48)),
                    Score = rnd.Next(80, 100),
                    Feedback = "A'lo darajada bajarilgan kod! Toza arxitektura."
                });
            }
        }

        db.Submissions.AddRange(submissions);
        await db.SaveChangesAsync();

        // 10. Audit Logs
        var auditLogs = new List<AuditLog>
        {
            new() { Id = Guid.NewGuid(), UserId = superAdmin.Id, Action = "INIT", Entity = "SaaS Platform", CreatedAt = DateTime.UtcNow.AddMonths(-12), Metadata = "EduFlow SaaS Multi-tenant platformasi 4 ta o'quv markazlari bilan ishga tushirildi." },
            new() { Id = Guid.NewGuid(), UserId = superAdmin.Id, Action = "TARIFF", Entity = "Najot Nur IT Academy", CreatedAt = DateTime.UtcNow.AddMonths(-6), Metadata = "Boshlang'ich tarif faollashtirildi (200 o'quvchi / 500 000 UZS/oy)." },
            new() { Id = Guid.NewGuid(), UserId = superAdmin.Id, Action = "QUOTA_EXCEEDED", Entity = "Registon Smart School", CreatedAt = DateTime.UtcNow.AddDays(-2), Metadata = "Kvota chegarasi (200/200) to'ldi! Yangi o'quvchi qo'shish avtomatik bloklandi." }
        };

        db.AuditLogs.AddRange(auditLogs);
        await db.SaveChangesAsync();

        // 11. CRM Pipeline Leads (35 leads across 5 stages)
        var leadSeedConfigs = new[]
        {
            // Qiziqish bildirganlar (Interested)
            ("Oybek Mahmudov", "+998 90 112 34 56", "oybek.m@gmail.com", LeadSource.Instagram, LeadStatus.Interested, ".NET FullStack Dasturlash", "Instagram Direct orqali kurs dasturini va narxlarini so'radi. Kurs boshlanishi haqida qiziqmoqda.", (DateTime?)null, (DateTime?)null, 800000m, center1.Id),
            ("Gulasal Yo'ldosheva", "+998 91 223 45 67", "gulasal.y@mail.ru", LeadSource.Instagram, LeadStatus.Interested, "Frontend React & Next.js", "Insta Stories dagi reklama orqali yozdi. Kompyuteri bor, noldan boshlamoqchi.", (DateTime?)null, (DateTime?)null, 800000m, center1.Id),
            ("Bekzod Rahimov", "+998 93 334 56 78", "bekzod.r@gmail.com", LeadSource.Telegram, LeadStatus.Interested, "Python & Data Science", "Telegram kanal orqali murojaat qildi. Oqshomgi guruhlarga qiziqyapti.", (DateTime?)null, (DateTime?)null, 800000m, center1.Id),
            ("Nigora Tursunova", "+998 94 445 67 89", "nigora.t@gmail.com", LeadSource.Facebook, LeadStatus.Interested, "UI/UX Dizayn & Figma", "Facebook postiga izoh qoldirdi. Dizayn asoslarini o'rganish istagida.", (DateTime?)null, (DateTime?)null, 800000m, center2.Id),
            ("Sherali Norbekov", "+998 97 556 78 90", "sherali.n@inbox.uz", LeadSource.Recommendation, LeadStatus.Interested, "Flutter Mobile App Dev", "Do'sti tavsiyasi bilan telefon qildi. Hafta oxirida ma'lumot olmoqchi.", (DateTime?)null, (DateTime?)null, 800000m, center2.Id),
            ("Kamila Yusupova", "+998 99 667 89 01", "kamila.y@gmail.com", LeadSource.Instagram, LeadStatus.Interested, "QA Software Testing", "Instagram orqali yozdi, IT ga yangi kirib kelayotgan qizlar uchun guruh bormi deb so'radi.", (DateTime?)null, (DateTime?)null, 800000m, center1.Id),
            ("Alibek Toirov", "+998 90 778 90 12", "alibek.t@gmail.com", LeadSource.Website, LeadStatus.Interested, ".NET FullStack Dasturlash", "Sayt orqali ariza qoldirdi. Ishdan keyin 19:00 dagi darslarga qiziqmoqda.", (DateTime?)null, (DateTime?)null, 800000m, center3.Id),
            ("Zarina Qosimova", "+998 91 889 01 23", "zarina.q@gmail.com", LeadSource.Banner, LeadStatus.Interested, "Frontend React & Next.js", "Ko'chadagi bannerdagi QR kodni skaner qilib ariza tashladi.", (DateTime?)null, (DateTime?)null, 800000m, center4.Id),

            // Gaplashilganlar (Contacted)
            ("Mirjalol Vohidov", "+998 93 990 12 34", "mirjalol.v@gmail.com", LeadSource.Instagram, LeadStatus.Contacted, ".NET FullStack Dasturlash", "Telefon orqali bog'lanildi. Kurs formati, davomiyligi (6 oy) tushuntirildi. Ota-onasi bilan maslahatlashmoqda.", (DateTime?)null, (DateTime?)null, 800000m, center1.Id),
            ("Dildora Sobirova", "+998 94 001 23 45", "dildora.s@mail.ru", LeadSource.Telegram, LeadStatus.Contacted, "Frontend React & Next.js", "Menejer bog'landi. Dars jadvali ma'qul keldi, o'quv dasturi pdf fayli yuborildi.", (DateTime?)null, (DateTime?)null, 800000m, center1.Id),
            ("Sanjarbek Aliyev", "+998 97 112 34 56", "sanjar.a@gmail.com", LeadSource.Instagram, LeadStatus.Contacted, "Python & Data Science", "Instagram Direct orqali qo'ng'iroq qilindi. Talaba, chegirma bormi deb surishtirdi.", (DateTime?)null, (DateTime?)null, 800000m, center2.Id),
            ("Fotima Rustamova", "+998 99 223 45 67", "fotima.r@gmail.com", LeadSource.Recommendation, LeadStatus.Contacted, "UI/UX Dizayn & Figma", "Bog'lanildi, portfolioni ko'rib chiqdi. Hafta o'rtasida qayta qo'ng'iroq qilishni so'radi.", (DateTime?)null, (DateTime?)null, 800000m, center2.Id),
            ("Javlonbek Xudoyberdiyev", "+998 90 334 56 78", "javlon.x@gmail.com", LeadSource.Website, LeadStatus.Contacted, "Flutter Mobile App Dev", "Operator suhbatlashdi. Ingliz tili darajasi Intermediate, tez kunda boshlay oladi.", (DateTime?)null, (DateTime?)null, 800000m, center3.Id),
            ("Madinaxon Ergasheva", "+998 91 445 67 89", "madina.e@gmail.com", LeadSource.Facebook, LeadStatus.Contacted, "QA Software Testing", "Facebook orqali qoldirilgan raqamga qo'ng'iroq qilindi. Kurs dasturi yuborildi.", (DateTime?)null, (DateTime?)null, 800000m, center1.Id),
            ("Shoxruxbek Olimov", "+998 93 556 78 90", "shoxrux.o@inbox.uz", LeadSource.Telegram, LeadStatus.Contacted, ".NET FullStack Dasturlash", "Telegram orqali to'liq konsultatsiya berildi. Uchrashuvga chaqirildi.", (DateTime?)null, (DateTime?)null, 800000m, center4.Id),

            // Uchrashuv belgilanganlar (MeetingScheduled)
            ("Humoyun G'aniyev", "+998 94 667 89 01", "humoyun.g@gmail.com", LeadSource.Instagram, LeadStatus.MeetingScheduled, ".NET FullStack Dasturlash", "Markazimizga kelib o'qituvchi bilan yuzma-yuz suhbatlashishga rozi bo'ldi.", DateTime.UtcNow.AddDays(1), (DateTime?)null, 800000m, center1.Id),
            ("Nodiraxon Karimova", "+998 97 778 90 12", "nodira.k@mail.ru", LeadSource.Telegram, LeadStatus.MeetingScheduled, "Frontend React & Next.js", "Ertaga soat 15:00 da markaz filialiga ota-onasi bilan keladi.", DateTime.UtcNow.AddDays(1), (DateTime?)null, 800000m, center1.Id),
            ("Boburxon Shodiyev", "+998 99 889 01 23", "bobur.sh@gmail.com", LeadSource.Instagram, LeadStatus.MeetingScheduled, "Python & Data Science", "Shanba kuni soat 11:00 ga ofisda uchrashuv belgilandi.", DateTime.UtcNow.AddDays(2), (DateTime?)null, 800000m, center2.Id),
            ("Sevinch Mamatova", "+998 90 990 12 34", "sevinch.m@gmail.com", LeadSource.Recommendation, LeadStatus.MeetingScheduled, "UI/UX Dizayn & Figma", "Juma kuni soat 17:00 ga dizayn xonamizda konsultatsiya.", DateTime.UtcNow.AddDays(1), (DateTime?)null, 800000m, center1.Id),
            ("Eldorbek Qodirov", "+998 91 001 23 45", "eldor.q@gmail.com", LeadSource.Website, LeadStatus.MeetingScheduled, "Flutter Mobile App Dev", "Dushanba soat 14:00 da o'quv markazimizga keladi.", DateTime.UtcNow.AddDays(3), (DateTime?)null, 800000m, center3.Id),
            ("Mohinur Saidova", "+998 93 112 34 56", "mohinur.s@gmail.com", LeadSource.Facebook, LeadStatus.MeetingScheduled, "QA Software Testing", "Ofisga kelib shartnoma shartlari bilan tanishmoqchi.", DateTime.UtcNow.AddDays(2), (DateTime?)null, 800000m, center2.Id),
            ("Sarvarbek Bozorov", "+998 94 223 45 67", "sarvar.b@inbox.uz", LeadSource.Banner, LeadStatus.MeetingScheduled, ".NET FullStack Dasturlash", "Ertaga soat 16:30 da mentor bilan uchrashadi.", DateTime.UtcNow.AddDays(1), (DateTime?)null, 800000m, center4.Id),

            // Demo darsga kelganlar (DemoAttended)
            ("Javohirbek Islomov", "+998 97 334 56 78", "javohir.i@gmail.com", LeadSource.Instagram, LeadStatus.DemoAttended, ".NET FullStack Dasturlash", "Demo ochiq darsda faol qatnashdi, Shahriyor domlaning dars o'tishi juda ma'qul keldi.", DateTime.UtcNow.AddDays(-2), DateTime.UtcNow.AddDays(-1), 800000m, center1.Id),
            ("Shahrizoda Ergasheva", "+998 99 445 67 89", "shahrizoda.e@mail.ru", LeadSource.Telegram, LeadStatus.DemoAttended, "Frontend React & Next.js", "Frontend bo'yicha amaliy demo darsda qatnashdi. O'ziga loyiha yoqdi, guruhga qo'shilmoqchi.", DateTime.UtcNow.AddDays(-3), DateTime.UtcNow.AddDays(-1), 800000m, center1.Id),
            ("Ulug'bek Nazarov", "+998 90 556 78 90", "ulugbek.n@gmail.com", LeadSource.Instagram, LeadStatus.DemoAttended, "Python & Data Science", "Sinov darsiga qatnashdi, Python algoritmlarini tez tushundi. To'lov tafsilotlarini so'radi.", DateTime.UtcNow.AddDays(-2), DateTime.UtcNow.AddDays(-1), 800000m, center2.Id),
            ("Zilolaxon Hamidova", "+998 91 667 89 01", "zilola.h@gmail.com", LeadSource.Recommendation, LeadStatus.DemoAttended, "UI/UX Dizayn & Figma", "Dizayn master-klassida qatnashdi, birinchi prototipini chizdi. Juda xursand.", DateTime.UtcNow.AddDays(-4), DateTime.UtcNow.AddDays(-2), 800000m, center1.Id),
            ("Temurbek Yusupov", "+998 93 778 90 12", "temur.y@gmail.com", LeadSource.Website, LeadStatus.DemoAttended, "Flutter Mobile App Dev", "Mobil dasturlash sinov darsida qatnashdi. Guruh boshlanishini kutyapti.", DateTime.UtcNow.AddDays(-3), DateTime.UtcNow.AddDays(-1), 800000m, center3.Id),
            ("Charosxon Abdullayeva", "+998 94 889 01 23", "charos.a@gmail.com", LeadSource.Facebook, LeadStatus.DemoAttended, "QA Software Testing", "QA darsiga kirdi, bug report yozish amaliyotini sinab ko'rdi. To'lov qilishga tayyor.", DateTime.UtcNow.AddDays(-2), DateTime.UtcNow.AddDays(-1), 800000m, center2.Id),
            ("Asadbek Qobilov", "+998 97 990 12 34", "asadbek.q@inbox.uz", LeadSource.Instagram, LeadStatus.DemoAttended, ".NET FullStack Dasturlash", "Demo darsda qatnashdi, kontrakt shartnomasi qog'ozlarini oldi.", DateTime.UtcNow.AddDays(-2), DateTime.UtcNow.AddDays(-1), 800000m, center4.Id),

            // To'lov qilganlar (Converted / Ready to convert)
            ("Murodjon Jo'rayev", "+998 99 001 23 45", "murodjon.j@gmail.com", LeadSource.Instagram, LeadStatus.Converted, ".NET FullStack Dasturlash", "800 000 so'm to'lov qabul qilindi! Click orqali to'landi. Guruhga biriktirishga tayyor.", DateTime.UtcNow.AddDays(-5), DateTime.UtcNow.AddDays(-3), 800000m, center1.Id),
            ("Durdona Xoliqova", "+998 90 112 34 56", "durdona.x@mail.ru", LeadSource.Telegram, LeadStatus.Converted, "Frontend React & Next.js", "Kassaga 800 000 so'm naqd pul to'ladi. Kvitansiya berildi. O'quvchi profilini ochish kutilmoqda.", DateTime.UtcNow.AddDays(-4), DateTime.UtcNow.AddDays(-2), 800000m, center1.Id),
            ("Sherzodbek To'xtayev", "+998 91 223 45 67", "sherzod.t@gmail.com", LeadSource.Recommendation, LeadStatus.Converted, "Python & Data Science", "Payme orqali 800 000 so'm oylik to'lov o'tkazildi. CRM dan o'quvchiga o'tkazishga tayyor.", DateTime.UtcNow.AddDays(-6), DateTime.UtcNow.AddDays(-3), 800000m, center2.Id),
            ("Gulbahor Nurmatova", "+998 93 334 56 78", "gulbahor.n@gmail.com", LeadSource.Instagram, LeadStatus.Converted, "UI/UX Dizayn & Figma", "Bank orqali 800 000 so'm to'landi. Ertangi guruhga qabul qilindi.", DateTime.UtcNow.AddDays(-4), DateTime.UtcNow.AddDays(-2), 800000m, center1.Id),
            ("Jamshidbek Rahmonov", "+998 94 445 67 89", "jamshid.r@gmail.com", LeadSource.Website, LeadStatus.Converted, "Flutter Mobile App Dev", "800 000 so'm to'lov to'liq amalga oshirildi.", DateTime.UtcNow.AddDays(-3), DateTime.UtcNow.AddDays(-1), 800000m, center3.Id),
            ("Nargizaxon Soliyeva", "+998 97 556 78 90", "nargiza.s@gmail.com", LeadSource.Banner, LeadStatus.Converted, ".NET FullStack Dasturlash", "Terminal orqali 800 000 so'm to'lov qilindi. 1-darsga tayyor.", DateTime.UtcNow.AddDays(-5), DateTime.UtcNow.AddDays(-2), 800000m, center4.Id)
        };

        var leads = new List<Lead>();
        foreach (var cfg in leadSeedConfigs)
        {
            leads.Add(new Lead
            {
                Id = Guid.NewGuid(),
                FullName = cfg.Item1,
                Phone = cfg.Item2,
                Email = cfg.Item3,
                Source = cfg.Item4,
                Status = cfg.Item5,
                CourseOfInterest = cfg.Item6,
                Notes = cfg.Item7,
                MeetingDate = cfg.Item8,
                DemoLessonDate = cfg.Item9,
                EstimatedBudget = cfg.Item10,
                CenterId = cfg.Item11,
                ConvertedAt = cfg.Item5 == LeadStatus.Converted ? DateTime.UtcNow.AddDays(-1) : null,
                CreatedAt = DateTime.UtcNow.AddDays(-rnd.Next(7, 25))
            });
        }

        db.Leads.AddRange(leads);
        await db.SaveChangesAsync();
        logger.LogInformation($"Saved {leads.Count} CRM Pipeline Leads across 5 stages.");

        logger.LogInformation("Database seeded successfully with Multi-Tenant Learning Centers, CRM Leads, and 850+ authentic data records!");
    }
}
