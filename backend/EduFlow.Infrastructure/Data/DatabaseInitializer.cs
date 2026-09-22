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
            var totalUsers = await db.Users.CountAsync();
            if (!hasAdmin || totalUsers < 50)
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
            logger.LogInformation("Database already initialized with 500+ records and required users.");
            return;
        }

        logger.LogInformation("Seeding 500+ rich records for EduFlow...");

        var defaultPasswordHash = hasher.Hash("+998991992012");

        // 1. Core Users (Admin, Shahriyor teacher, Turkmanov student)
        var superAdmin = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Asilbek Turkmanov (Super Admin)",
            Email = "asilbekturkmanov@eduflow.uz",
            Username = "asilbekturkmanov",
            PasswordHash = defaultPasswordHash,
            Role = UserRole.Admin,
            Status = UserStatus.Active,
            Phone = "+998 99 199 20 12",
            CreatedAt = DateTime.UtcNow.AddMonths(-12)
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
            Phone = "+998 99 199 20 12",
            ParentPhone = "+998 90 777 55 44",
            CreatedAt = DateTime.UtcNow.AddMonths(-2)
        };

        var allUsers = new List<User> { superAdmin, mainTeacher, mainStudent };

        // 15 Additional Teachers with diverse experience
        var teacherConfigs = new[]
        {
            ("Anvar Karimov (Senior .NET)", "anvar.karimov@eduflow.uz", "anvar_k", 4, "+998 93 111 22 33"),
            ("Madina Alimova (Frontend Lead)", "madina.alimova@eduflow.uz", "madina_a", 2, "+998 94 222 33 44"),
            ("Bobur Mirzayev (Mobile Lead)", "bobur.mirzayev@eduflow.uz", "bobur_m", 3, "+998 91 333 44 55"),
            ("Nodira Rahimova (Data Science)", "nodira.rahimova@eduflow.uz", "nodira_r", 3, "+998 90 444 55 66"),
            ("Javohir Toshmatov (Cybersecurity)", "javohir.toshmatov@eduflow.uz", "javohir_t", 2, "+998 97 555 66 77"),
            ("Sarvar Usmonov (Python Backend)", "sarvar.usmonov@eduflow.uz", "sarvar_u", 2, "+998 99 666 77 88"),
            ("Dilshod Akramov (UI/UX Designer)", "dilshod.akramov@eduflow.uz", "dilshod_a", 1, "+998 93 777 88 99"),
            ("Umida Ergasheva (QA Automation)", "umida.ergasheva@eduflow.uz", "umida_e", 1, "+998 94 888 99 00"),
            ("Sherzod Zokirov (React Dev)", "sherzod.zokirov@eduflow.uz", "sherzod_z", 1, "+998 90 999 00 11"),
            ("Rustam Qodirov (DevOps Architect)", "rustam.qodirov@eduflow.uz", "rustam_q", 5, "+998 91 123 45 67"),
            ("Aziza Karimova (Junior Mentor)", "aziza.karimova@eduflow.uz", "aziza_k", 0, "+998 97 234 56 78"),
            ("Farrux Fayziyev (Tutor)", "farrux.fayziyev@eduflow.uz", "farrux_f", 0, "+998 99 345 67 89"),
            ("Gulnoza Hamidova (Math & Algo)", "gulnoza.hamidova@eduflow.uz", "gulnoza_h", 0, "+998 93 456 78 90"),
            ("Zafar Shukurov (Cloud Specialist)", "zafar.shukurov@eduflow.uz", "zafar_s", 2, "+998 94 567 89 01"),
            ("Malika Ismoilova (Full-Stack Mentor)", "malika.ismoilova@eduflow.uz", "malika_i", 1, "+998 90 678 90 12")
        };

        var teachersList = new List<User> { mainTeacher };
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
                Phone = tc.Item5,
                ExperienceYears = tc.Item4,
                CreatedAt = DateTime.UtcNow.AddYears(-Math.Max(1, tc.Item4))
            };
            allUsers.Add(t);
            teachersList.Add(t);
        }

        // 130 Additional Students with realistic names, phone, and parent phones
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
        int studentIdx = 1;
        for (int i = 0; i < 130; i++)
        {
            var fn = firstNames[i % firstNames.Length];
            var ln = lastNames[(i * 3 + 7) % lastNames.Length];
            var fullName = $"{fn} {ln}";
            var username = $"{fn.ToLower()}_{ln.ToLower()}{studentIdx}";
            var email = $"{username}@eduflow.uz";
            var phone = $"+998 {90 + (i % 10)} {100 + i:D3} {(i * 17) % 90 + 10} {(i * 23) % 90 + 10}";
            var parentPhone = $"+998 {90 + ((i + 3) % 10)} {200 + i:D3} {(i * 19) % 90 + 10} {(i * 29) % 90 + 10}";

            var student = new User
            {
                Id = Guid.NewGuid(),
                FullName = fullName,
                Email = email,
                Username = username,
                PasswordHash = defaultPasswordHash,
                Role = UserRole.Student,
                Status = UserStatus.Active,
                Phone = phone,
                ParentPhone = parentPhone,
                CreatedAt = DateTime.UtcNow.AddDays(-(i * 3 + 10))
            };

            studentUsers.Add(student);
            allUsers.Add(student);
            studentIdx++;
        }

        db.Users.AddRange(allUsers);
        await db.SaveChangesAsync();
        logger.LogInformation($"Saved {allUsers.Count} users.");

        // 2. Courses (12 diverse courses)
        var courses = new List<Course>
        {
            new() { Id = Guid.NewGuid(), Name = ".NET 10 Enterprise Architecture", Description = "Clean Architecture, CQRS, EF Core, PostgreSQL, REST API va Microservices", Price = 3500000m, DurationWeeks = 16, Status = CourseStatus.Active },
            new() { Id = Guid.NewGuid(), Name = "React 19 & Next.js Pro", Description = "Zamonaviy SPA, SSR, Zustand, React Query va Tailwind/Vanilla CSS", Price = 3200000m, DurationWeeks = 14, Status = CourseStatus.Active },
            new() { Id = Guid.NewGuid(), Name = "Full-Stack Enterprise Bootcamp", Description = "Backend .NET 10 + Frontend React to'liq integratsiya loyihasi", Price = 6000000m, DurationWeeks = 24, Status = CourseStatus.Active },
            new() { Id = Guid.NewGuid(), Name = "Python & Machine Learning", Description = "Python 3.12, Pandas, NumPy, Scikit-learn, PyTorch va AI modellari", Price = 3800000m, DurationWeeks = 18, Status = CourseStatus.Active },
            new() { Id = Guid.NewGuid(), Name = "Flutter & Dart Mobile Dev", Description = "Cross-platform iOS va Android ilovalar yaratish", Price = 3400000m, DurationWeeks = 16, Status = CourseStatus.Active },
            new() { Id = Guid.NewGuid(), Name = "Cybersecurity & Ethical Hacking", Description = "Tarmoq xavfsizligi, penetratsion testlar va axborot himoyasi", Price = 4200000m, DurationWeeks = 16, Status = CourseStatus.Active },
            new() { Id = Guid.NewGuid(), Name = "UI/UX Product Design & Figma", Description = "Figma, prototiplash, foydalanuvchi tadqiqotlari va dizayn tizimlari", Price = 2800000m, DurationWeeks = 12, Status = CourseStatus.Active },
            new() { Id = Guid.NewGuid(), Name = "Data Science & Power BI Analytics", Description = "SQL, Power BI, ma'lumotlar vizualizatsiyasi va biznes tahlil", Price = 3200000m, DurationWeeks = 14, Status = CourseStatus.Active },
            new() { Id = Guid.NewGuid(), Name = "DevOps & Cloud (Docker, K8s, CI/CD)", Description = "Linux, Docker, Kubernetes, GitHub Actions va AWS infratuzilmasi", Price = 4500000m, DurationWeeks = 16, Status = CourseStatus.Active },
            new() { Id = Guid.NewGuid(), Name = "Algoritmlar va Ma'lumotlar Tuzilmasi", Description = "LeetCode masalalari, graf, daraxt, dinamik dasturlash", Price = 2500000m, DurationWeeks = 10, Status = CourseStatus.Active },
            new() { Id = Guid.NewGuid(), Name = "PostgreSQL & Database Engineering", Description = "Indekslar, tranzaksiyalar, query optimallashtirish va replikatsiya", Price = 2900000m, DurationWeeks = 12, Status = CourseStatus.Active },
            new() { Id = Guid.NewGuid(), Name = "English for IT Professionals", Description = "IT sohasida muloqot, intervyular va xalqaro loyihalar tili", Price = 2000000m, DurationWeeks = 12, Status = CourseStatus.Active }
        };

        db.Courses.AddRange(courses);
        await db.SaveChangesAsync();

        // 3. Groups with 25 distinct vibrant colors and unique names
        var distinctColors = new[]
        {
            "#10B981", // Emerald
            "#6366F1", // Indigo
            "#F59E0B", // Amber
            "#EC4899", // Pink
            "#06B6D4", // Cyan
            "#8B5CF6", // Purple
            "#14B8A6", // Teal
            "#F97316", // Orange
            "#3B82F6", // Blue
            "#84CC16", // Lime
            "#E11D48", // Rose
            "#0284C7", // Sky
            "#D946EF", // Fuchsia
            "#A855F7", // Violet
            "#F43F5E", // Crimson
            "#0D9488", // Dark Teal
            "#EAB308", // Gold
            "#4F46E5", // Deep Indigo
            "#22C55E", // Green
            "#2563EB", // Cobalt
            "#7C3AED", // Deep Violet
            "#C026D3", // Magenta
            "#DB2777", // Deep Rose
            "#EA580C", // Rust Orange
            "#15803D"  // Forest Green
        };

        var groupNames = new[]
        {
            ("DOTNET-PRO-101", 0, 0),   // shahriyor
            ("REACT-MODERN-201", 1, 1),
            ("FULLSTACK-CAMP-301", 2, 0),// shahriyor
            ("PYTHON-AI-401", 3, 3),
            ("FLUTTER-MOB-501", 4, 2),
            ("CYBER-SEC-601", 5, 4),
            ("UIUX-DESIGN-701", 6, 6),
            ("DATA-BI-801", 7, 3),
            ("DEVOPS-CLOUD-901", 8, 9),
            ("ALGO-LEET-102", 9, 0),    // shahriyor
            ("PG-ENGINEER-111", 10, 5),
            ("ENGL-IT-121", 11, 7),
            ("DOTNET-ARCH-103", 0, 1),
            ("REACT-NEXT-202", 1, 8),
            ("FULLSTACK-ENT-302", 2, 14),
            ("PYTHON-DATA-402", 3, 3),
            ("FLUTTER-CROSS-502", 4, 2),
            ("CYBER-DEFENSE-602", 5, 4),
            ("FIGMA-PRO-702", 6, 6),
            ("BI-ANALYTICS-802", 7, 7),
            ("DOCKER-K8S-902", 8, 9),
            ("ALGO-ADVANCED-104", 9, 12),
            ("POSTGRES-PRO-112", 10, 13),
            ("FRONTEND-VITE-203", 1, 1),
            ("DOTNET-MICRO-105", 0, 0)   // shahriyor
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

        // 4. Enrollments (Distribute students across groups)
        var enrollments = new List<Enrollment>();
        // Turkmanov in DOTNET-PRO-101 and REACT-MODERN-201
        enrollments.Add(new Enrollment { Id = Guid.NewGuid(), GroupId = groups[0].Id, StudentId = mainStudent.Id, JoinedAt = DateTime.UtcNow.AddMonths(-2), Status = EnrollmentStatus.Active });
        enrollments.Add(new Enrollment { Id = Guid.NewGuid(), GroupId = groups[1].Id, StudentId = mainStudent.Id, JoinedAt = DateTime.UtcNow.AddMonths(-1), Status = EnrollmentStatus.Active });

        // Distribute remaining 130 students across 25 groups (approx 10-15 students per group)
        var rnd = new Random(42);
        for (int i = 0; i < studentUsers.Count; i++)
        {
            var student = studentUsers[i];
            if (student.Id == mainStudent.Id) continue;

            // assign to 1-2 groups
            int primaryGroupIdx = i % groups.Count;
            enrollments.Add(new Enrollment
            {
                Id = Guid.NewGuid(),
                GroupId = groups[primaryGroupIdx].Id,
                StudentId = student.Id,
                JoinedAt = DateTime.UtcNow.AddDays(-rnd.Next(20, 70)),
                Status = EnrollmentStatus.Active
            });

            if (i % 3 == 0) // some students enrolled in secondary group
            {
                int secondaryGroupIdx = (i + 5) % groups.Count;
                enrollments.Add(new Enrollment
                {
                    Id = Guid.NewGuid(),
                    GroupId = groups[secondaryGroupIdx].Id,
                    StudentId = student.Id,
                    JoinedAt = DateTime.UtcNow.AddDays(-rnd.Next(10, 40)),
                    Status = EnrollmentStatus.Active
                });
            }
        }

        db.Enrollments.AddRange(enrollments);
        await db.SaveChangesAsync();
        logger.LogInformation($"Saved {enrollments.Count} enrollments.");

        // 5. Lessons: Real Kundalik.com Timetable (Weekly schedule: Mon-Sat with periods)
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

        // Generate lessons for current week and past/future weeks (Mon-Sat)
        var today = DateTime.UtcNow.Date;
        // Find Monday of current week
        int diff = (7 + (today.DayOfWeek - DayOfWeek.Monday)) % 7;
        var monday = today.AddDays(-diff);

        // Schedule across 3 weeks: Last week (-7), Current week (0), Next week (+7)
        var weekOffsets = new[] { -14, -7, 0, 7 };
        int lessonCounter = 0;

        foreach (var wOffset in weekOffsets)
        {
            var weekStart = monday.AddDays(wOffset);

            for (int day = 0; day < 6; day++) // Monday (0) to Saturday (5)
            {
                var lessonDate = weekStart.AddDays(day);

                // For each day, schedule 5-8 lessons from different groups
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

        // 6. Attendances (for past lessons)
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

            foreach (var enr in groupEnrs)
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

            if (attendances.Count > 650) break; // Keep optimal size
        }

        db.Attendances.AddRange(attendances);
        await db.SaveChangesAsync();
        logger.LogInformation($"Saved {attendances.Count} attendances.");

        // 7. Payments: 800,000 UZS Monthly Fee, 0/+0, -800,000, 9-month prepaid +7,200,000
        var payments = new List<Payment>();

        // Turkmanov: Paid 2 months for 2 active courses (1,600,000 UZS total) -> Balance = +0 so'm!
        payments.Add(new Payment
        {
            Id = Guid.NewGuid(),
            StudentId = mainStudent.Id,
            Amount = 800000m,
            PaidAt = DateTime.UtcNow.AddDays(-25),
            Method = PaymentMethod.Card,
            Status = PaymentStatus.Completed,
            Note = "1-oy oylik to'lovi (DOTNET-PRO-101)"
        });
        payments.Add(new Payment
        {
            Id = Guid.NewGuid(),
            StudentId = mainStudent.Id,
            Amount = 800000m,
            PaidAt = DateTime.UtcNow.AddDays(-5),
            Method = PaymentMethod.Card,
            Status = PaymentStatus.Completed,
            Note = "1-oy oylik to'lovi (REACT-MODERN-201)"
        });

        // Other students:
        // 1/3 have prepaid 9 months (+7,200,000 so'm) or multi-month (2,400,000 so'm)
        // 1/3 have exact paid (800,000 so'm) -> Balance = 0
        // 1/3 have no payment or partial payment -> Balance = -800,000 so'm (unpaid)
        for (int i = 0; i < studentUsers.Count; i++)
        {
            var student = studentUsers[i];
            if (student.Id == mainStudent.Id) continue;

            int scenario = i % 4;
            if (scenario == 0)
            {
                // 9-month prepaid (+7,200,000 UZS)
                payments.Add(new Payment
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id,
                    Amount = 7200000m,
                    PaidAt = DateTime.UtcNow.AddDays(-rnd.Next(15, 45)),
                    Method = PaymentMethod.BankTransfer,
                    Status = PaymentStatus.Completed,
                    Note = "9 oylik to'liq o'quv kursi oldindan to'lovi (Chegirma bilan)"
                });
            }
            else if (scenario == 1)
            {
                // Normal 1-month paid exact 800,000 UZS -> Balance = 0
                payments.Add(new Payment
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id,
                    Amount = 800000m,
                    PaidAt = DateTime.UtcNow.AddDays(-rnd.Next(5, 25)),
                    Method = PaymentMethod.Card,
                    Status = PaymentStatus.Completed,
                    Note = "Joriy oy uchun 800 000 so'm to'lov"
                });
            }
            else if (scenario == 2)
            {
                // 3-month prepaid (2,400,000 UZS)
                payments.Add(new Payment
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id,
                    Amount = 2400000m,
                    PaidAt = DateTime.UtcNow.AddDays(-rnd.Next(10, 30)),
                    Method = PaymentMethod.Card,
                    Status = PaymentStatus.Completed,
                    Note = "Choraklik (3 oylik) to'lov"
                });
            }
            else
            {
                // Unpaid: either no payment at all (profile shows -800 000 so'm) or partial payment
                if (i % 8 == 0)
                {
                    // Partial payment of 400,000 UZS -> remaining -400,000
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
                // else no payments added -> balance will be -800,000 so'm as required!
            }
        }

        db.Payments.AddRange(payments);
        await db.SaveChangesAsync();
        logger.LogInformation($"Saved {payments.Count} payments.");

        // 8. Assignments & Submissions
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

        // 9. Audit Logs
        var auditLogs = new List<AuditLog>
        {
            new() { Id = Guid.NewGuid(), UserId = superAdmin.Id, Action = "INIT", Entity = "System", CreatedAt = DateTime.UtcNow.AddMonths(-3), Metadata = "EduFlow platformasi bazasi 500+ ma'lumotlar bilan ishga tushirildi." },
            new() { Id = Guid.NewGuid(), UserId = superAdmin.Id, Action = "CONFIG", Entity = "Billing", CreatedAt = DateTime.UtcNow.AddMonths(-2), Metadata = "Oylik o'quv to'lovi 800 000 so'm etib belgilandi." },
            new() { Id = Guid.NewGuid(), UserId = superAdmin.Id, Action = "CONFIG", Entity = "Salary", CreatedAt = DateTime.UtcNow.AddMonths(-2), Metadata = "O'qituvchilar foiz stavkalari: 3 yil (70%), 2 yil (60%), 1 yil (50%), <1 yil (40%)." }
        };

        db.AuditLogs.AddRange(auditLogs);
        await db.SaveChangesAsync();

        logger.LogInformation("Database seeded successfully with 500+ authentic data records!");
    }
}
