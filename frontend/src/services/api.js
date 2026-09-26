const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getToken = () => localStorage.getItem('eduflow_token');
export const setToken = (token) => localStorage.setItem('eduflow_token', token);
export const removeToken = () => localStorage.removeItem('eduflow_token');

// In-browser mock data for GitHub Pages standalone demo when local backend is unreachable
const mockSeed = {
  centers: [
    {
      id: '1491683e-a729-4ca9-85c1-630c101195da',
      name: 'Registon Smart School (Yunusobod)',
      slug: 'registon-smart',
      phone: '+998 71 202 33 44',
      email: 'yunusobod@registon.uz',
      address: 'Yunusobod 4-mavze, Ahmad Donish ko\'chasi',
      tariffPlan: 0,
      tariffPlanName: 'Boshlang\'ich (200 ta / 500 ming)',
      maxStudentsQuota: 200,
      monthlySubscriptionPrice: 500000,
      status: 'QuotaExceeded',
      statusText: 'Limit to\'lgan (Bloklangan)',
      activeStudentsCount: 200,
      coursesCount: 3,
      groupsCount: 5,
      teachersCount: 4,
      remainingQuota: 0,
      quotaUsagePercentage: 100.0,
      isQuotaExceeded: true,
      isBlocked: true,
      canAddStudents: false,
      subscriptionValidUntil: new Date(Date.now() + 86400000 * 60).toISOString(),
      daysUntilExpiry: 60,
      autoBlockOnQuotaExceeded: true
    },
    {
      id: '1571bbef-ab69-4efc-88c1-e68547e47740',
      name: 'Najot Nur IT Academy (Chilonzor)',
      slug: 'najot-nur',
      phone: '+998 78 888 99 00',
      email: 'info@najotnur.uz',
      address: 'Chilonzor 9-mavze, Qatortol ko\'chasi 1-uy',
      tariffPlan: 0,
      tariffPlanName: 'Boshlang\'ich (200 ta / 500 ming)',
      maxStudentsQuota: 200,
      monthlySubscriptionPrice: 500000,
      status: 'Active',
      statusText: 'Faol (99% band)',
      activeStudentsCount: 198,
      coursesCount: 3,
      groupsCount: 6,
      teachersCount: 4,
      remainingQuota: 2,
      quotaUsagePercentage: 99.0,
      isQuotaExceeded: false,
      isBlocked: false,
      canAddStudents: true,
      subscriptionValidUntil: new Date(Date.now() + 86400000 * 150).toISOString(),
      daysUntilExpiry: 150,
      autoBlockOnQuotaExceeded: true
    },
    {
      id: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc',
      name: 'EduFlow Bosh Markaz (Toshkent)',
      slug: 'toshkent',
      phone: '+998 71 200 00 11',
      email: 'toshkent@eduflow.uz',
      address: 'Amir Temur shoh ko\'chasi 107-B, Toshkent',
      tariffPlan: 1,
      tariffPlanName: 'Standart (400 ta / 700 ming)',
      maxStudentsQuota: 400,
      monthlySubscriptionPrice: 700000,
      status: 'Active',
      statusText: 'Faol',
      activeStudentsCount: 121,
      coursesCount: 4,
      groupsCount: 9,
      teachersCount: 5,
      remainingQuota: 279,
      quotaUsagePercentage: 30.2,
      isQuotaExceeded: false,
      isBlocked: false,
      canAddStudents: true,
      subscriptionValidUntil: new Date(Date.now() + 86400000 * 330).toISOString(),
      daysUntilExpiry: 330,
      autoBlockOnQuotaExceeded: true
    },
    {
      id: 'ac38ad5b-aefa-4a0f-9039-d32dc2e03d70',
      name: 'PDP Enterprise Campus (Beruniy)',
      slug: 'pdp-campus',
      phone: '+998 78 777 47 47',
      email: 'enterprise@pdp.uz',
      address: 'Beruniy shoh ko\'chasi 3A-uy',
      tariffPlan: 2,
      tariffPlanName: 'Katta Markaz (1000 ta / 1.2 mln)',
      maxStudentsQuota: 1000,
      monthlySubscriptionPrice: 1200000,
      status: 'Active',
      statusText: 'Faol',
      activeStudentsCount: 340,
      coursesCount: 2,
      groupsCount: 5,
      teachersCount: 4,
      remainingQuota: 660,
      quotaUsagePercentage: 34.0,
      isQuotaExceeded: false,
      isBlocked: false,
      canAddStudents: true,
      subscriptionValidUntil: new Date(Date.now() + 86400000 * 270).toISOString(),
      daysUntilExpiry: 270,
      autoBlockOnQuotaExceeded: true
    }
  ],
  tariffs: [
    { plan: 0, name: 'Boshlang\'ich', maxStudentsQuota: 200, monthlyPrice: 500000, description: '200 tagacha faol o\'quvchi. Yangi ochilgan o\'quv markazlari va kichik maktablar uchun.' },
    { plan: 1, name: 'Standart', maxStudentsQuota: 400, monthlyPrice: 700000, description: '400 tagacha faol o\'quvchi. O\'rta hajmdagi zamonaviy o\'quv markazlari uchun eng ommabop tarif.' },
    { plan: 2, name: 'Katta Markaz (Enterprise)', maxStudentsQuota: 1000, monthlyPrice: 1200000, description: '1000 tagacha faol o\'quvchi. Yirik IT akademiyalar va ko\'p tarmoqli ta\'lim muassasalari.' },
    { plan: 3, name: 'Cheksiz (Unlimited VIP)', maxStudentsQuota: 999999, monthlyPrice: 2500000, description: 'Cheksiz o\'quvchilar soni, maxsus server va 24/7 VIP ustuvor qo\'llab-quvvatlash.' }
  ],
  users: [
    { id: '1', fullName: 'Asilbek Turkmanov (Super Admin)', username: 'asilbekturkmanov', email: 'asilbekturkmanov@eduflow.uz', role: 'Admin', status: 'Active', phone: '+998 99 199 20 12', centerId: null, centerName: 'Barcha Markazlar (Super Admin)' },
    { id: 'u_admin_root', fullName: 'Sardor Rahimov (Admin)', username: 'admin', email: 'admin@eduflow.uz', role: 'Admin', status: 'Active', phone: '+998 90 999 88 77', centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc', centerName: 'EduFlow Bosh Markaz (Toshkent)' },
    { id: 'p_dilshod', fullName: 'Dilshod Bekmirzayev (Ota)', username: 'dilshod_ota', email: 'ota.dilshod@eduflow.uz', role: 'Parent', status: 'Active', phone: '+998 90 123 45 67', centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc', centerName: 'EduFlow Bosh Markaz (Toshkent)' },
    { id: 'u_najot_admin', fullName: 'Najot Nur IT Admin', username: 'najot_admin', email: 'admin@najotnur.uz', role: 'Admin', status: 'Active', phone: '+998 78 888 99 01', centerId: '1571bbef-ab69-4efc-88c1-e68547e47740', centerName: 'Najot Nur IT Academy (Chilonzor)' },
    { id: 'u_reg_admin', fullName: 'Registon Smart Admin', username: 'registon_admin', email: 'admin@registon.uz', role: 'Admin', status: 'Active', phone: '+998 71 202 33 45', centerId: '1491683e-a729-4ca9-85c1-630c101195da', centerName: 'Registon Smart School (Yunusobod)' },
    { id: 'u_pdp_admin', fullName: 'PDP Campus Admin', username: 'pdp_admin', email: 'admin@pdp.uz', role: 'Admin', status: 'Active', phone: '+998 78 777 47 48', centerId: 'ac38ad5b-aefa-4a0f-9039-d32dc2e03d70', centerName: 'PDP Enterprise Campus (Beruniy)' },
    { id: '2', fullName: 'Shahriyor O\'qituvchi', username: 'shahriyor', email: 'shahriyor@eduflow.uz', role: 'Teacher', status: 'Active', phone: '+998 90 345 67 89', centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc', centerName: 'EduFlow Bosh Markaz (Toshkent)', experienceYears: 3, sharePercentage: 70, compensationType: 'Percentage', compensationTypeName: 'Ulush (70%)', customSharePercentage: 70, fixedAmount: null, studentsCount: 4, monthlyRevenueGenerated: 3200000, monthlyEarned: 2240000, centerNetProfit: 960000, totalEarned: 80640000, studentNames: ['Turkmanov O\'quvchi', 'Jasur Bekmirzayev', 'Shahzod Normatov', 'Dilnoza Rahimova'] },
    { id: 't_anvar', fullName: 'Anvar Karimov (Senior .NET)', username: 'anvar_k', email: 'anvar.karimov@eduflow.uz', role: 'Teacher', status: 'Active', phone: '+998 93 111 22 33', centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc', centerName: 'EduFlow Bosh Markaz (Toshkent)', experienceYears: 4, sharePercentage: 70, compensationType: 'FixedPerStudent', compensationTypeName: 'Har bir o\'quvchiga (450 000 so\'m)', customSharePercentage: null, fixedAmount: 450000, studentsCount: 15, monthlyRevenueGenerated: 12000000, monthlyEarned: 6750000, centerNetProfit: 5250000, totalEarned: 324000000, studentNames: ['Jasur Bekmirzayev', 'Shahzod Normatov'] },
    { id: 't_bobur', fullName: 'Bobur Mirzayev (Mobile Lead)', username: 'bobur_m', email: 'bobur.mirzayev@eduflow.uz', role: 'Teacher', status: 'Active', phone: '+998 91 333 44 55', centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc', centerName: 'EduFlow Bosh Markaz (Toshkent)', experienceYears: 3, sharePercentage: 70, compensationType: 'FixedMonthly', compensationTypeName: 'Oylik qat\'iy maosh (9 000 000 so\'m)', customSharePercentage: null, fixedAmount: 9000000, studentsCount: 20, monthlyRevenueGenerated: 16000000, monthlyEarned: 9000000, centerNetProfit: 7000000, totalEarned: 324000000, studentNames: ['Dilnoza Rahimova'] },
    { id: '3', fullName: 'Turkmanov O\'quvchi', username: 'turkmanov', email: 'turkmanov@eduflow.uz', role: 'Student', status: 'Active', phone: '+998 99 199 20 12', parentPhone: '+998 90 777 55 44', centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc', centerName: 'EduFlow Bosh Markaz (Toshkent)', balance: 0, balanceFormatted: '+0 so\'m', presentCount: 24, absentCount: 1, monthlyPaymentStats: [{ month: 'Apr', amount: 800000, isPaid: true }, { month: 'May', amount: 800000, isPaid: true }, { month: 'Iyun', amount: 800000, isPaid: true }, { month: 'Iyul', amount: 800000, isPaid: true }, { month: 'Avg', amount: 800000, isPaid: true }, { month: 'Sen', amount: 800000, isPaid: true }] },
    { id: '4', fullName: 'Jasur Bekmirzayev', username: 'jasur_b', email: 'jasur@eduflow.uz', role: 'Student', status: 'Active', phone: '+998 97 111 22 33', parentPhone: '+998 90 111 22 33', centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc', centerName: 'EduFlow Bosh Markaz (Toshkent)', balance: -800000, balanceFormatted: '-800 000 so\'m', presentCount: 22, absentCount: 3, monthlyPaymentStats: [{ month: 'Apr', amount: 800000, isPaid: true }, { month: 'May', amount: 800000, isPaid: true }, { month: 'Iyun', amount: 800000, isPaid: true }, { month: 'Iyul', amount: 800000, isPaid: true }, { month: 'Avg', amount: 800000, isPaid: true }, { month: 'Sen', amount: 0, isPaid: false }] },
    { id: '5', fullName: 'Shahzod Normatov', username: 'shahzod_n', email: 'shahzod@eduflow.uz', role: 'Student', status: 'Active', phone: '+998 91 444 55 66', parentPhone: '+998 90 444 55 66', centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc', centerName: 'EduFlow Bosh Markaz (Toshkent)', balance: 7200000, balanceFormatted: '+7 200 000 so\'m', presentCount: 25, absentCount: 0, monthlyPaymentStats: [{ month: 'Apr', amount: 800000, isPaid: true }, { month: 'May', amount: 800000, isPaid: true }, { month: 'Iyun', amount: 800000, isPaid: true }, { month: 'Iyul', amount: 800000, isPaid: true }, { month: 'Avg', amount: 800000, isPaid: true }, { month: 'Sen', amount: 800000, isPaid: true }] },
    { id: '6', fullName: 'Dilnoza Rahimova', username: 'dilnoza_r', email: 'dilnoza@eduflow.uz', role: 'Student', status: 'Active', phone: '+998 99 777 88 99', parentPhone: '+998 90 888 99 00', centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc', centerName: 'EduFlow Bosh Markaz (Toshkent)', balance: 0, balanceFormatted: '+0 so\'m', presentCount: 23, absentCount: 2, monthlyPaymentStats: [{ month: 'Apr', amount: 800000, isPaid: true }, { month: 'May', amount: 800000, isPaid: true }, { month: 'Iyun', amount: 800000, isPaid: true }, { month: 'Iyul', amount: 800000, isPaid: true }, { month: 'Avg', amount: 800000, isPaid: true }, { month: 'Sen', amount: 800000, isPaid: true }] }
  ],
  courses: [
    { id: 'c1', name: '.NET 10 Backend Architecture', description: 'Clean Architecture, EF Core, PostgreSQL, REST API, Docker va CI/CD kursi', price: 800000, durationWeeks: 16, status: 'Active', groupsCount: 1, centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc', centerName: 'EduFlow Bosh Markaz (Toshkent)' },
    { id: 'c2', name: 'React JS & Modern Frontend', description: 'React 19, SPA, State Management, Tailwind/Vanilla CSS va zamonaviy veb ilovalar', price: 800000, durationWeeks: 12, status: 'Active', groupsCount: 1, centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc', centerName: 'EduFlow Bosh Markaz (Toshkent)' },
    { id: 'c3', name: 'Full-Stack Enterprise Bootcamp', description: 'Frontend React + Backend .NET to\'liq integratsiya loyihasi', price: 800000, durationWeeks: 24, status: 'Active', groupsCount: 1, centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc', centerName: 'EduFlow Bosh Markaz (Toshkent)' }
  ],
  groups: [
    { id: 'g1', name: 'DOTNET-G101', color: '#10B981', courseId: 'c1', courseName: '.NET 10 Backend Architecture', teacherId: '2', teacherName: 'Shahriyor O\'qituvchi', startDate: '2026-08-18', status: 'Active', studentsCount: 4, centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc' },
    { id: 'g2', name: 'REACT-G201', color: '#3B82F6', courseId: 'c2', courseName: 'React JS & Modern Frontend', teacherId: '2', teacherName: 'Shahriyor O\'qituvchi', startDate: '2026-08-28', status: 'Active', studentsCount: 3, centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc' }
  ],
  lessons: [
    { id: 'l1', groupId: 'g1', groupName: 'DOTNET-G101', groupColor: '#10B981', title: '1-Dars: Clean Architecture & EF Core', startsAt: '2026-09-21T08:30:00Z', endsAt: '2026-09-21T10:00:00Z', room: 'Auditoriya 101', onlineUrl: 'https://meet.google.com/edu-net-101', teacherName: 'Shahriyor O\'qituvchi' },
    { id: 'l2', groupId: 'g2', groupName: 'REACT-G201', groupColor: '#3B82F6', title: '2-Dars: React 19 Hooks & State', startsAt: '2026-09-22T10:15:00Z', endsAt: '2026-09-22T11:45:00Z', room: 'Auditoriya 204', onlineUrl: 'https://meet.google.com/edu-react-201', teacherName: 'Shahriyor O\'qituvchi' },
    { id: 'l3', groupId: 'g1', groupName: 'DOTNET-G101', groupColor: '#10B981', title: '3-Dars: JWT Auth & Security', startsAt: '2026-09-23T12:00:00Z', endsAt: '2026-09-23T13:30:00Z', room: 'Auditoriya 101', onlineUrl: 'https://meet.google.com/edu-net-101', teacherName: 'Shahriyor O\'qituvchi' },
    { id: 'l4', groupId: 'g2', groupName: 'REACT-G201', groupColor: '#3B82F6', title: '4-Dars: Kundalik Dars Jadvali', startsAt: '2026-09-24T14:00:00Z', endsAt: '2026-09-24T15:30:00Z', room: 'Auditoriya 204', onlineUrl: 'https://meet.google.com/edu-react-201', teacherName: 'Shahriyor O\'qituvchi' },
    { id: 'l5', groupId: 'g1', groupName: 'DOTNET-G101', groupColor: '#10B981', title: '5-Dars: PostgreSQL & EF Migrations', startsAt: '2026-09-25T15:45:00Z', endsAt: '2026-09-25T17:15:00Z', room: 'Auditoriya 101', onlineUrl: 'https://meet.google.com/edu-net-101', teacherName: 'Shahriyor O\'qituvchi' },
    { id: 'l6', groupId: 'g2', groupName: 'REACT-G201', groupColor: '#3B82F6', title: '6-Dars: Moliya & Balans Integratsiyasi', startsAt: '2026-09-26T17:30:00Z', endsAt: '2026-09-26T19:00:00Z', room: 'Auditoriya 204', onlineUrl: 'https://meet.google.com/edu-react-201', teacherName: 'Shahriyor O\'qituvchi' }
  ],
  assignments: [
    { id: 'a1', groupId: 'g1', groupName: 'DOTNET-G101', title: 'Vazifa #1: Clean Architecture loyihasi', description: 'EF Core yordamida PostgreSQL bazasi bilan bog\'lanuvchi repository qatlamini yarating.', deadline: new Date(Date.now() + 86400000 * 3).toISOString(), maxScore: 100, submissionsCount: 2, isPassedDeadline: false },
    { id: 'a2', groupId: 'g2', groupName: 'REACT-G201', title: 'Vazifa #1: Kundalik Dars Jadvali UI', description: '6 kunlik jadval va rangli guruh kartalarini tayyorlang.', deadline: new Date(Date.now() + 86400000 * 5).toISOString(), maxScore: 100, submissionsCount: 1, isPassedDeadline: false }
  ],
  payments: [
    { id: 'p1', studentId: '3', studentName: 'Turkmanov O\'quvchi', studentEmail: 'turkmanov@eduflow.uz', studentPhone: '+998 99 199 20 12', parentPhone: '+998 90 777 55 44', amount: 800000, method: 'Card', status: 'Completed', paidAt: new Date(Date.now() - 86400000 * 2).toISOString(), note: '1 oylik o\'qish to\'lovi' },
    { id: 'p2', studentId: '5', studentName: 'Shahzod Normatov', studentEmail: 'shahzod@eduflow.uz', studentPhone: '+998 91 444 55 66', parentPhone: '+998 90 444 55 66', amount: 7200000, method: 'BankTransfer', status: 'Completed', paidAt: new Date(Date.now() - 86400000 * 10).toISOString(), note: '9 oylik to\'liq kurs to\'lovi (7 200 000 so\'m)' },
    { id: 'p3', studentId: '4', studentName: 'Jasur Bekmirzayev', studentEmail: 'jasur@eduflow.uz', studentPhone: '+998 97 111 22 33', parentPhone: '+998 90 111 22 33', amount: 800000, method: 'Card', status: 'Completed', paidAt: new Date(Date.now() - 86400000 * 25).toISOString(), note: 'Avvalgi oy to\'lovi' }
  ],
  audit: [
    { id: 'au1', action: 'LOGIN', entity: 'User', userName: 'Asilbek Turkmanov (Super Admin)', createdAt: new Date().toISOString(), metadata: 'Tizimga muvaffaqiyatli kirildi' },
    { id: 'au2', action: 'INIT', entity: 'SaaS Platform', userName: 'Asilbek Turkmanov (Super Admin)', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), metadata: 'Multi-Tenant o\'quv markazlari va kvota avtomatik bloklash tizimi yoqildi' }
  ],
  leads: [
    {
      id: 'lead-1',
      fullName: 'Oybek Mahmudov',
      phone: '+998 90 112 34 56',
      email: 'oybek.m@gmail.com',
      source: 'Instagram',
      sourceName: 'Instagram Direct',
      status: 'Interested',
      statusName: 'Qiziqish bildirganlar',
      courseOfInterest: '.NET FullStack Dasturlash',
      notes: 'Instagram Direct orqali kurs dasturini va narxlarini so\'radi.',
      meetingDate: null,
      demoLessonDate: null,
      estimatedBudget: 800000,
      centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc',
      centerName: 'EduFlow Bosh Markaz (Toshkent)',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'lead-2',
      fullName: 'Gulasal Yo\'ldosheva',
      phone: '+998 91 223 45 67',
      email: 'gulasal.y@mail.ru',
      source: 'Instagram',
      sourceName: 'Instagram Direct',
      status: 'Interested',
      statusName: 'Qiziqish bildirganlar',
      courseOfInterest: 'Frontend React & Next.js',
      notes: 'Insta Stories dagi reklama orqali yozdi. Kompyuteri bor, noldan boshlamoqchi.',
      meetingDate: null,
      demoLessonDate: null,
      estimatedBudget: 800000,
      centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc',
      centerName: 'EduFlow Bosh Markaz (Toshkent)',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'lead-3',
      fullName: 'Mirjalol Vohidov',
      phone: '+998 93 990 12 34',
      email: 'mirjalol.v@gmail.com',
      source: 'Instagram',
      sourceName: 'Instagram Direct',
      status: 'Contacted',
      statusName: 'Gaplashilganlar',
      courseOfInterest: '.NET FullStack Dasturlash',
      notes: 'Telefon orqali bog\'lanildi. Kurs formati tushuntirildi.',
      meetingDate: null,
      demoLessonDate: null,
      estimatedBudget: 800000,
      centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc',
      centerName: 'EduFlow Bosh Markaz (Toshkent)',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'lead-4',
      fullName: 'Dildora Sobirova',
      phone: '+998 94 001 23 45',
      email: 'dildora.s@mail.ru',
      source: 'Telegram',
      sourceName: 'Telegram Kanal / Bot',
      status: 'Contacted',
      statusName: 'Gaplashilganlar',
      courseOfInterest: 'Frontend React & Next.js',
      notes: 'Dars jadvali ma\'qul keldi, o\'quv dasturi pdf fayli yuborildi.',
      meetingDate: null,
      demoLessonDate: null,
      estimatedBudget: 800000,
      centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc',
      centerName: 'EduFlow Bosh Markaz (Toshkent)',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
      id: 'lead-5',
      fullName: 'Humoyun G\'aniyev',
      phone: '+998 94 667 89 01',
      email: 'humoyun.g@gmail.com',
      source: 'Instagram',
      sourceName: 'Instagram Direct',
      status: 'MeetingScheduled',
      statusName: 'Uchrashuv belgilanganlar',
      courseOfInterest: '.NET FullStack Dasturlash',
      notes: 'Markazimizga kelib o\'qituvchi bilan suhbatlashishga rozi bo\'ldi.',
      meetingDate: new Date(Date.now() + 86400000 * 1).toISOString(),
      demoLessonDate: null,
      estimatedBudget: 800000,
      centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc',
      centerName: 'EduFlow Bosh Markaz (Toshkent)',
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
    },
    {
      id: 'lead-6',
      fullName: 'Nodiraxon Karimova',
      phone: '+998 97 778 90 12',
      email: 'nodira.k@mail.ru',
      source: 'Telegram',
      sourceName: 'Telegram Kanal / Bot',
      status: 'MeetingScheduled',
      statusName: 'Uchrashuv belgilanganlar',
      courseOfInterest: 'Frontend React & Next.js',
      notes: 'Ertaga soat 15:00 da filialga ota-onasi bilan keladi.',
      meetingDate: new Date(Date.now() + 86400000 * 1).toISOString(),
      demoLessonDate: null,
      estimatedBudget: 800000,
      centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc',
      centerName: 'EduFlow Bosh Markaz (Toshkent)',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
    },
    {
      id: 'lead-7',
      fullName: 'Javohirbek Islomov',
      phone: '+998 97 334 56 78',
      email: 'javohir.i@gmail.com',
      source: 'Instagram',
      sourceName: 'Instagram Direct',
      status: 'DemoAttended',
      statusName: 'Demo darsga kelganlar',
      courseOfInterest: '.NET FullStack Dasturlash',
      notes: 'Demo ochiq darsda faol qatnashdi, o\'qituvchi juda ma\'qul keldi.',
      meetingDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      demoLessonDate: new Date(Date.now() - 86400000 * 1).toISOString(),
      estimatedBudget: 800000,
      centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc',
      centerName: 'EduFlow Bosh Markaz (Toshkent)',
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString()
    },
    {
      id: 'lead-8',
      fullName: 'Shahrizoda Ergasheva',
      phone: '+998 99 445 67 89',
      email: 'shahrizoda.e@mail.ru',
      source: 'Telegram',
      sourceName: 'Telegram Kanal / Bot',
      status: 'DemoAttended',
      statusName: 'Demo darsga kelganlar',
      courseOfInterest: 'Frontend React & Next.js',
      notes: 'Frontend bo\'yicha amaliy demo darsda qatnashdi. Guruhga qo\'shilmoqchi.',
      meetingDate: new Date(Date.now() - 86400000 * 3).toISOString(),
      demoLessonDate: new Date(Date.now() - 86400000 * 1).toISOString(),
      estimatedBudget: 800000,
      centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc',
      centerName: 'EduFlow Bosh Markaz (Toshkent)',
      createdAt: new Date(Date.now() - 86400000 * 9).toISOString()
    },
    {
      id: 'lead-9',
      fullName: 'Murodjon Jo\'rayev',
      phone: '+998 99 001 23 45',
      email: 'murodjon.j@gmail.com',
      source: 'Instagram',
      sourceName: 'Instagram Direct',
      status: 'Converted',
      statusName: 'To\'lov qilganlar',
      courseOfInterest: '.NET FullStack Dasturlash',
      notes: '800 000 so\'m to\'lov qabul qilindi! Click orqali to\'landi.',
      meetingDate: new Date(Date.now() - 86400000 * 4).toISOString(),
      demoLessonDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      estimatedBudget: 800000,
      centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc',
      centerName: 'EduFlow Bosh Markaz (Toshkent)',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
    },
    {
      id: 'lead-10',
      fullName: 'Durdona Xoliqova',
      phone: '+998 90 112 34 56',
      email: 'durdona.x@mail.ru',
      source: 'Telegram',
      sourceName: 'Telegram Kanal / Bot',
      status: 'Converted',
      statusName: 'To\'lov qilganlar',
      courseOfInterest: 'Frontend React & Next.js',
      notes: 'Kassaga 800 000 so\'m naqd pul to\'ladi. Kvitansiya berildi.',
      meetingDate: new Date(Date.now() - 86400000 * 5).toISOString(),
      demoLessonDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      estimatedBudget: 800000,
      centerId: 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc',
      centerName: 'EduFlow Bosh Markaz (Toshkent)',
      createdAt: new Date(Date.now() - 86400000 * 11).toISOString()
    }
  ],
  rooms: [
    { id: 'r1', name: '101-Auditoriya (.NET Lab)', capacity: 25, computersCount: 25, hasProjector: true, hasAirConditioner: true, centerName: 'EduFlow Bosh Markaz (Toshkent)' },
    { id: 'r2', name: '204-Frontend Studio', capacity: 20, computersCount: 20, hasProjector: true, hasAirConditioner: true, centerName: 'EduFlow Bosh Markaz (Toshkent)' },
    { id: 'r3', name: '305-Katta Ma\'ruzaxona', capacity: 45, computersCount: 0, hasProjector: true, hasAirConditioner: true, centerName: 'EduFlow Bosh Markaz (Toshkent)' }
  ],
  payrolls: [
    { id: 'pay1', teacherId: '2', teacherName: 'Shahriyor O\'qituvchi', periodMonth: '2026-09', basePercentage: 70, fixedAmount: null, totalRevenueGenerated: 3200000, calculatedAmount: 2240000, bonusAmount: 200000, deductionsAmount: 0, totalAmount: 2440000, status: 'Paid', paidAt: new Date().toISOString(), note: 'Oylik to\'liq to\'landi' },
    { id: 'pay2', teacherId: 't_anvar', teacherName: 'Anvar Karimov (Senior .NET)', periodMonth: '2026-09', basePercentage: 70, fixedAmount: 450000, totalRevenueGenerated: 12000000, calculatedAmount: 6750000, bonusAmount: 500000, deductionsAmount: 0, totalAmount: 7250000, status: 'Pending', paidAt: null, note: 'Kutilmoqda' }
  ],
  exams: [
    { id: 'ex1', groupId: 'g1', groupName: 'DOTNET-G101', title: '1-Modul Oraliq Nazorat Imtihoni', examDate: '2026-09-24', maxScore: 100, passingScore: 60, description: 'Clean Architecture va EF Core asoslari', gradedCount: 4, totalStudents: 4, averageScore: 88.5 },
    { id: 'ex2', groupId: 'g2', groupName: 'REACT-G201', title: 'React Hooks & State Test', examDate: '2026-09-25', maxScore: 100, passingScore: 60, description: 'Komponentlar va Lifecycle', gradedCount: 3, totalStudents: 3, averageScore: 91.0 }
  ],
  certificates: [
    { id: 'cert1', certificateNumber: 'EDU-2026-0091', studentId: '3', studentName: 'Turkmanov O\'quvchi', courseName: '.NET 10 Backend Architecture', finalScore: 94, issuedAt: '2026-09-20', verificationCode: 'EDU-2026-0091', qrCodeUrl: 'https://asilbekturkmanov.github.io/EDUFlow/?verify=EDU-2026-0091', isRevoked: false, centerName: 'EduFlow Bosh Markaz (Toshkent)' }
  ],
  studentRisks: [
    { studentId: '4', studentName: 'Jasur Bekmirzayev', groupName: 'DOTNET-G101', courseName: '.NET 10 Backend Architecture', attendancePercentage: 68.0, consecutiveAbsences: 3, unpaidAmount: 800000, riskLevel: 2, riskLevelText: 'Yuqori Xavf (85%)', primaryRiskFactor: 'Ketma-ket 3 dars qoldirilgan va oylik qarzdorlik', recommendedAction: 'Ota-onaga qo\'ng\'iroq qilish va SMS yuborish', parentPhone: '+998 90 123 45 67', phone: '+998 97 111 22 33' },
    { studentId: '6', studentName: 'Dilnoza Rahimova', groupName: 'DOTNET-G101', courseName: '.NET 10 Backend Architecture', attendancePercentage: 82.0, consecutiveAbsences: 1, unpaidAmount: 0, riskLevel: 1, riskLevelText: 'O\'rtacha Xavf (45%)', primaryRiskFactor: 'Vazifalar topshirishda kechikishlar bor', recommendedAction: 'Ustoz bilan shaxsiy muloqot', parentPhone: '+998 90 888 99 00', phone: '+998 99 777 88 99' }
  ],
  notifications: [
    { id: 'n1', title: '🎯 Yangi lid kelib tushdi', message: 'Instagram orqali .NET Backend kursiga yangi qiziqish bildirildi.', type: 'Lead', actionUrl: 'leads', isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
    { id: 'n2', title: '💰 To\'lov amalga oshirildi', message: 'Jasur Bekmirzayev 800,000 UZS kurs to\'lovini amalga oshirdi.', type: 'Payment', actionUrl: 'payments', isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
    { id: 'n3', title: '⚠️ Davomat ogohlantirishi', message: 'Frontend guruhida 2 nafar o\'quvchi darsga kelmadi.', type: 'Attendance', actionUrl: 'attendance', isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString() }
  ],
  parentChildren: [
    {
      childId: '4',
      fullName: 'Jasur Bekmirzayev',
      phone: '+998 97 111 22 33',
      email: 'jasur@eduflow.uz',
      groupName: 'DOTNET-G101 (.NET 10 Backend Architecture)',
      courseName: '.NET 10 Backend Architecture',
      teacherName: 'Anvar Karimov',
      attendancePercentage: 88.0,
      balance: -800000,
      monthlyTuition: 800000,
      averageGradeScore: 88.5,
      recentAttendances: [
        { id: 'a1', lessonTitle: '1-Dars: Clean Architecture & EF Core', status: 0, lessonDate: new Date().toISOString() },
        { id: 'a2', lessonTitle: '3-Dars: JWT Auth & Security', status: 0, lessonDate: new Date(Date.now() - 86400000 * 2).toISOString() },
        { id: 'a3', lessonTitle: '5-Dars: PostgreSQL & EF Migrations', status: 1, lessonDate: new Date(Date.now() - 86400000 * 4).toISOString() }
      ],
      recentExamResults: [
        { id: 'e1', examTitle: '1-Modul Oraliq Nazorat Imtihoni', score: 92, gradeLetter: 'A', teacherFeedback: 'A\'lo darajada topshirdi.' }
      ],
      recentPayments: [
        { id: 'p1', amount: 800000, paidAt: new Date(Date.now() - 86400000 * 25).toISOString(), method: 4, status: 0, note: 'Payme orqali to\'langan' }
      ]
    }
  ]
};

// Local storage helper functions
const getStorage = (key, fallback) => {
  const item = localStorage.getItem(`eduflow_${key}`);
  if (!item) {
    localStorage.setItem(`eduflow_${key}`, JSON.stringify(fallback));
    return fallback;
  }
  try { return JSON.parse(item); } catch { return fallback; }
};
const setStorage = (key, val) => localStorage.setItem(`eduflow_${key}`, JSON.stringify(val));

// Detect if running on GitHub Pages or static host without local backend
const isStaticDemo = 
  typeof window !== 'undefined' && 
  (!import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL.includes('localhost')) &&
  (window.location.hostname.includes('github.io') || 
   window.location.hostname.includes('vercel.app') || 
   window.location.protocol === 'file:' ||
   (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'));

export async function request(endpoint, options = {}) {
  // On GitHub Pages or static hosting without remote backend, serve directly via client store with 0 network errors
  if (isStaticDemo) {
    return handleOfflineFallback(endpoint, options);
  }

  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (response.status === 401) {
      if (!endpoint.includes('/auth/login')) {
        removeToken();
        localStorage.removeItem('eduflow_current_user');
        window.dispatchEvent(new Event('eduflow_unauthorized'));
      }
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || (data?.errors && data.errors.join(', ')) || `Xatolik yuz berdi (${response.status})`;
      const apiErr = new Error(errorMsg);
      apiErr.isApiError = true;
      apiErr.status = response.status;
      throw apiErr;
    }

    return data;
  } catch (err) {
    if (err.isApiError) {
      throw err;
    }
    return handleOfflineFallback(endpoint, options);
  }
}

function handleOfflineFallback(endpoint, options) {
  const method = options.method || 'GET';
  let body = {};
  if (options.body) {
    try { body = JSON.parse(options.body); } catch { body = {}; }
  }

  // Auth login
  if (endpoint === '/auth/login') {
    const users = getStorage('users', mockSeed.users);
    const identifier = (body.username || body.email || '').trim().toLowerCase();
    const cleanPhone = identifier.replace(/\D/g, '');

    const user = users.find(u => {
      const uName = (u.username || '').toLowerCase();
      const uEmail = (u.email || '').toLowerCase();
      const uPhone = (u.phone || '').replace(/\D/g, '');
      if (uName === identifier || uEmail === identifier) return true;
      if (uEmail.startsWith(identifier + '@')) return true;
      if (identifier.includes('@') && uEmail.split('@')[0] === identifier.split('@')[0]) return true;
      if (cleanPhone.length >= 7 && uPhone.includes(cleanPhone)) return true;
      if (identifier === u.role.toLowerCase()) return true;
      return false;
    });

    if (!user) {
      throw new Error("Login (username yoki email) tizimda topilmadi.");
    }

    const mockToken = 'mock_jwt_' + user.id;
    setStorage('current_user', user);
    return { success: true, data: { token: mockToken, user }, message: 'Muvaffaqiyatli kirildi' };
  }

  // Auth me
  if (endpoint === '/auth/me') {
    const token = getToken();
    const user = getStorage('current_user', null);
    if (token && user) {
      return { success: true, data: user };
    }
    return { success: false, data: null };
  }

  // Centers (SaaS Multi-Tenancy & Quota Management)
  if (endpoint.startsWith('/centers')) {
    let centers = getStorage('centers', mockSeed.centers);
    const tariffs = mockSeed.tariffs;

    if (endpoint === '/centers/tariffs') {
      return { success: true, data: tariffs };
    }

    if (endpoint === '/centers/current') {
      const curUser = getStorage('current_user', mockSeed.users[0]);
      let center = centers.find(c => c.id === curUser.centerId) || centers[0];
      return { success: true, data: center };
    }

    if (endpoint.includes('/tariff') && method === 'PUT') {
      const parts = endpoint.split('/');
      const centerId = parts[2];
      const selectedTariff = tariffs.find(t => t.plan === body.tariffPlan) || tariffs[0];
      
      centers = centers.map(c => {
        if (c.id === centerId) {
          const newMaxQuota = selectedTariff.maxStudentsQuota;
          const isQuotaExceeded = c.activeStudentsCount >= newMaxQuota;
          const isBlocked = isQuotaExceeded && c.autoBlockOnQuotaExceeded;
          const status = isQuotaExceeded ? 'QuotaExceeded' : 'Active';
          const statusText = isQuotaExceeded ? 'Limit to\'lgan (Bloklangan)' : 'Faol';
          const remainingQuota = Math.max(0, newMaxQuota - c.activeStudentsCount);
          const quotaUsagePercentage = Math.round((c.activeStudentsCount / newMaxQuota) * 1000) / 10;

          return {
            ...c,
            tariffPlan: selectedTariff.plan,
            tariffPlanName: `${selectedTariff.name} (${selectedTariff.maxStudentsQuota} ta / ${(selectedTariff.monthlyPrice / 1000).toLocaleString('uz-UZ')} ming)`,
            maxStudentsQuota: newMaxQuota,
            monthlySubscriptionPrice: selectedTariff.monthlyPrice,
            status,
            statusText,
            remainingQuota,
            quotaUsagePercentage,
            isQuotaExceeded,
            isBlocked,
            canAddStudents: !isBlocked
          };
        }
        return c;
      });

      setStorage('centers', centers);
      const updated = centers.find(c => c.id === centerId);
      return { success: true, data: updated, message: `Tarif muvaffaqiyatli yangilandi! Yangi limit: ${selectedTariff.maxStudentsQuota} ta o'quvchi.` };
    }

    if (method === 'GET') {
      const id = endpoint.split('/')[2];
      if (id) {
        const found = centers.find(c => c.id === id);
        return { success: true, data: found };
      }
      return { success: true, data: centers };
    }

    if (method === 'POST') {
      const selectedTariff = tariffs.find(t => t.plan === body.tariffPlan) || tariffs[0];
      const newCenter = {
        id: 'center_' + Date.now(),
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        phone: body.phone,
        email: body.email,
        address: body.address,
        tariffPlan: selectedTariff.plan,
        tariffPlanName: `${selectedTariff.name} (${selectedTariff.maxStudentsQuota} ta / ${(selectedTariff.monthlyPrice / 1000).toLocaleString('uz-UZ')} ming)`,
        maxStudentsQuota: selectedTariff.maxStudentsQuota,
        monthlySubscriptionPrice: selectedTariff.monthlyPrice,
        status: 'Active',
        statusText: 'Faol',
        activeStudentsCount: 0,
        coursesCount: 0,
        groupsCount: 0,
        teachersCount: 0,
        remainingQuota: selectedTariff.maxStudentsQuota,
        quotaUsagePercentage: 0,
        isQuotaExceeded: false,
        isBlocked: false,
        canAddStudents: true,
        subscriptionValidUntil: new Date(Date.now() + 86400000 * 30 * (body.initialMonths || 1)).toISOString(),
        daysUntilExpiry: 30 * (body.initialMonths || 1),
        autoBlockOnQuotaExceeded: true
      };

      centers = [newCenter, ...centers];
      setStorage('centers', centers);
      return { success: true, data: newCenter, message: 'Yangi o\'quv markazi muvaffaqiyatli ochildi!' };
    }

    if (method === 'PUT') {
      const id = endpoint.split('/')[2];
      centers = centers.map(c => (c.id === id ? { ...c, ...body } : c));
      setStorage('centers', centers);
      return { success: true, data: body, message: 'Markaz ma\'lumotlari yangilandi' };
    }

    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      centers = centers.filter(c => c.id !== id);
      setStorage('centers', centers);
      return { success: true, data: true, message: 'Markaz tizimdan o\'chirildi' };
    }
  }

  // Users (with automatic quota enforcement check)
  if (endpoint.startsWith('/users')) {
    let users = getStorage('users', mockSeed.users);
    let centers = getStorage('centers', mockSeed.centers);

    if (method === 'GET') {
      return { success: true, data: { items: users, totalCount: users.length, pageNumber: 1, pageSize: 20, totalPages: 1 } };
    }

    if (method === 'POST') {
      const role = body.role === 2 || body.role === 'Student' ? 'Student' : (body.role === 1 || body.role === 'Teacher' ? 'Teacher' : 'Admin');
      const targetCenterId = body.centerId || centers[0]?.id;
      const targetCenter = centers.find(c => c.id === targetCenterId);

      // Auto-Blocking Quota Enforcement Check
      if (role === 'Student' && targetCenter) {
        if (targetCenter.isBlocked || targetCenter.activeStudentsCount >= targetCenter.maxStudentsQuota) {
          throw new Error(`❌ DIQQAT: "${targetCenter.name}" markazining o'quvchi kvotasi (${targetCenter.activeStudentsCount} / ${targetCenter.maxStudentsQuota}) to'lgan! Yangi o'quvchi qo'shish avtomatik ravishda bloklangan. Davom etish uchun markaz tarifini oshiring.`);
        }

        // Increment student count in center
        targetCenter.activeStudentsCount += 1;
        targetCenter.remainingQuota = Math.max(0, targetCenter.maxStudentsQuota - targetCenter.activeStudentsCount);
        targetCenter.quotaUsagePercentage = Math.round((targetCenter.activeStudentsCount / targetCenter.maxStudentsQuota) * 1000) / 10;
        if (targetCenter.activeStudentsCount >= targetCenter.maxStudentsQuota) {
          targetCenter.isQuotaExceeded = true;
          targetCenter.isBlocked = true;
          targetCenter.status = 'QuotaExceeded';
          targetCenter.statusText = 'Limit to\'lgan (Bloklangan)';
          targetCenter.canAddStudents = false;
        }
        setStorage('centers', centers);
      }

      const newUser = { 
        id: String(Date.now()), 
        ...body, 
        role,
        status: 'Active',
        centerId: targetCenterId,
        centerName: targetCenter ? targetCenter.name : 'EduFlow'
      };
      users = [newUser, ...users];
      setStorage('users', users);
      return { success: true, data: newUser, message: "Foydalanuvchi qo'shildi" };
    }

    if (method === 'PUT') {
      const id = endpoint.split('/')[2];
      if (endpoint.includes('/compensation')) {
        const teacherId = endpoint.split('/')[2];
        users = users.map((u) => {
          if (u.id === teacherId) {
            const compType = body.compensationType || 'Percentage';
            const effPct = body.customSharePercentage || (u.experienceYears >= 3 ? 70 : (u.experienceYears >= 2 ? 60 : (u.experienceYears >= 1 ? 50 : 40)));
            const sCount = u.studentsCount || 4;
            const rev = sCount * 800000;
            let earned = 0;
            let typeName = `Ulush (${effPct}%)`;
            if (compType === 'Percentage') {
              earned = rev * effPct / 100;
              typeName = `Ulush (${effPct}%)`;
            } else if (compType === 'FixedPerStudent') {
              const perS = body.fixedAmount || 400000;
              earned = sCount * perS;
              typeName = `Har bir o'quvchiga (${perS.toLocaleString('uz-UZ')} so'm)`;
            } else if (compType === 'FixedMonthly') {
              const fMonthly = body.fixedAmount || 8000000;
              earned = fMonthly;
              typeName = `Oylik qat'iy maosh (${fMonthly.toLocaleString('uz-UZ')} so'm)`;
            }
            return {
              ...u,
              compensationType: compType,
              compensationTypeName: typeName,
              customSharePercentage: body.customSharePercentage,
              fixedAmount: body.fixedAmount,
              sharePercentage: effPct,
              monthlyRevenueGenerated: rev,
              monthlyEarned: earned,
              centerNetProfit: Math.max(0, rev - earned)
            };
          }
          return u;
        });
        setStorage('users', users);
        const updatedT = users.find(u => u.id === teacherId);
        return { success: true, data: updatedT, message: "O'qituvchi ulush/maosh parametrlari muvaffaqiyatli saqlandi!" };
      }

      users = users.map((u) => (u.id === id ? { ...u, ...body } : u));
      setStorage('users', users);
      return { success: true, data: body, message: 'Foydalanuvchi yangilandi' };
    }

    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      users = users.filter((u) => u.id !== id);
      setStorage('users', users);
      return { success: true, data: true, message: "Foydalanuvchi o'chirildi" };
    }
  }

  // Courses
  if (endpoint.startsWith('/courses')) {
    let courses = getStorage('courses', mockSeed.courses);
    if (method === 'GET') return { success: true, data: courses };
    if (method === 'POST') {
      const newC = { id: 'c_' + Date.now(), ...body, groupsCount: 0 };
      courses = [newC, ...courses];
      setStorage('courses', courses);
      return { success: true, data: newC };
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      courses = courses.filter((c) => c.id !== id);
      setStorage('courses', courses);
      return { success: true, data: true };
    }
  }

  // Groups
  if (endpoint.startsWith('/groups')) {
    let groups = getStorage('groups', mockSeed.groups);
    if (endpoint.includes('/students')) {
      return { success: true, data: [
        { id: 'en1', studentName: 'Jasur Bekmirzayev', studentEmail: 'jasur@eduflow.uz', joinedAt: '2026-08-18' },
        { id: 'en2', studentName: 'Shahzod Normatov', studentEmail: 'shahzod@eduflow.uz', joinedAt: '2026-08-18' }
      ] };
    }
    if (method === 'GET') return { success: true, data: groups };
    if (method === 'POST') {
      const newG = { id: 'g_' + Date.now(), ...body, courseName: 'Kurs', teacherName: 'O\'qituvchi', studentsCount: 0 };
      groups = [newG, ...groups];
      setStorage('groups', groups);
      return { success: true, data: newG };
    }
  }

  // Lessons
  if (endpoint.startsWith('/lessons')) {
    let lessons = getStorage('lessons', mockSeed.lessons);
    if (method === 'GET') return { success: true, data: lessons };
    if (method === 'POST') {
      const newL = { id: 'l_' + Date.now(), ...body, groupName: 'DOTNET-G101', teacherName: 'Anvar Karimov' };
      lessons = [newL, ...lessons];
      setStorage('lessons', lessons);
      return { success: true, data: newL };
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      lessons = lessons.filter((l) => l.id !== id);
      setStorage('lessons', lessons);
      return { success: true, data: true };
    }
  }

  // Attendance
  if (endpoint.startsWith('/attendance')) {
    if (endpoint.includes('/lesson/')) {
      return { success: true, data: [
        { studentId: '4', studentName: 'Jasur Bekmirzayev', status: 'Present', note: 'Faol qatnashdi' },
        { studentId: '5', studentName: 'Shahzod Normatov', status: 'Late', note: '10 daqiqa kechikdi' },
        { studentId: '6', studentName: 'Dilnoza Rahimova', status: 'Present', note: '' }
      ] };
    }
    if (method === 'POST') return { success: true, data: true, message: 'Davomad saqlandi' };
  }

  // Assignments
  if (endpoint.startsWith('/assignments')) {
    let assignments = getStorage('assignments', mockSeed.assignments);
    if (endpoint.includes('/submissions')) {
      return { success: true, data: [
        { id: 'sub1', assignmentId: 'a1', studentName: 'Jasur Bekmirzayev', url: 'https://github.com/jasur/eduflow-task', text: 'Topshiriq to\'liq qilindi', score: 95, maxScore: 100, feedback: 'Ajoyib natija!', submittedAt: new Date().toISOString() }
      ] };
    }
    if (method === 'GET') return { success: true, data: assignments };
    if (method === 'POST') {
      if (endpoint.includes('/submit') || endpoint.includes('/grade')) {
        return { success: true, data: true, message: 'Bajarildi' };
      }
      const newA = { id: 'a_' + Date.now(), ...body, groupName: 'DOTNET-G101', submissionsCount: 0 };
      assignments = [newA, ...assignments];
      setStorage('assignments', assignments);
      return { success: true, data: newA };
    }
  }

  // Payments
  if (endpoint.startsWith('/payments')) {
    let payments = getStorage('payments', mockSeed.payments);
    if (endpoint.includes('/balance')) {
      const user = getStorage('current_user', mockSeed.users[2]);
      const balance = user.balance ?? 0;
      const balanceFormatted = user.balanceFormatted ?? (balance === 0 ? '+0 so\'m' : (balance > 0 ? `+${balance.toLocaleString('uz-UZ')} so'm` : `-${Math.abs(balance).toLocaleString('uz-UZ')} so'm`));
      return {
        success: true,
        data: {
          studentId: user.id,
          studentName: user.fullName,
          monthlyTuition: 800000,
          enrolledMonths: 1,
          totalTuitionRequired: 800000,
          totalPaid: 800000 + balance,
          balance,
          balanceFormatted,
          statusText: balance > 0 ? "Oldindan to'langan" : (balance === 0 ? "To'liq to'langan" : "Qarzdorlik"),
          recentPayments: payments.filter(p => p.studentId === user.id)
        }
      };
    }
    if (endpoint.includes('/debts')) {
      const students = mockSeed.users.filter(u => u.role === 'Student');
      return {
        success: true,
        data: students.map(s => ({
          studentId: s.id,
          studentName: s.fullName,
          studentEmail: s.email,
          studentPhone: s.phone,
          parentPhone: s.parentPhone,
          monthlyFee: 800000,
          totalCourseFee: 800000,
          totalPaid: 800000 + (s.balance || 0),
          balance: s.balance || 0,
          remainingDebt: (s.balance || 0) < 0 ? Math.abs(s.balance) : 0,
          activeEnrollmentsCount: 1,
          statusText: (s.balance || 0) > 0 ? "Oldindan to'langan" : ((s.balance || 0) === 0 ? "To'langan" : "Qarzdor"),
          monthlyStats: s.monthlyPaymentStats || []
        }))
      };
    }
    if (method === 'GET') return { success: true, data: payments };
    if (method === 'POST') {
      const user = getStorage('current_user', mockSeed.users[2]);
      const newP = {
        id: 'p_' + Date.now(),
        ...body,
        studentName: user.fullName,
        studentEmail: user.email,
        studentPhone: user.phone,
        parentPhone: user.parentPhone,
        paidAt: new Date().toISOString(),
        status: 'Completed'
      };
      payments = [newP, ...payments];
      setStorage('payments', payments);
      return { success: true, data: newP, message: 'To\'lov qabul qilindi' };
    }
  }

  // Dashboard
  if (endpoint.startsWith('/dashboard')) {
    const user = getStorage('current_user', mockSeed.users[0]);
    if (user.role === 'Admin') {
      return {
        success: true,
        data: {
          totalStudents: 859,
          totalTeachers: 16,
          totalCourses: 12,
          activeGroups: 25,
          totalRevenue: 564480000,
          monthlyRevenue: 15680000,
          totalCenters: 4,
          totalCentersRevenue: 2900000,
          recentPayments: mockSeed.payments,
          recentEnrollments: [
            { id: 'e1', groupName: 'DOTNET-PRO-101', studentName: 'Turkmanov O\'quvchi', joinedAt: new Date().toISOString() }
          ]
        }
      };
    }
    if (user.role === 'Teacher') {
      return {
        success: true,
        data: {
          myGroupsCount: 2,
          myStudentsCount: 28,
          pendingSubmissionsCount: 1,
          upcomingLessonsCount: 6,
          upcomingLessons: mockSeed.lessons,
          sharePercentage: user.sharePercentage || 70,
          experienceYears: user.experienceYears || 3,
          monthlyEarned: user.monthlyEarned || 15680000,
          totalEarned: user.totalEarned || 564480000,
          pendingSubmissions: [
            { id: 'sub_p1', studentName: 'Turkmanov O\'quvchi', assignmentTitle: 'Clean Architecture loyihasi', submittedAt: new Date().toISOString(), maxScore: 100 }
          ]
        }
      };
    }
    return {
      success: true,
      data: {
        enrolledCoursesCount: 1,
        attendanceRatePercentage: 96.0,
        pendingAssignmentsCount: 1,
        totalCourseFee: 800000,
        totalPaid: 800000 + (user.balance || 0),
        balanceDebt: (user.balance || 0) < 0 ? Math.abs(user.balance) : 0,
        upcomingLessons: mockSeed.lessons,
        pendingAssignments: mockSeed.assignments
      }
    };
  }

  // Leads CRM Pipeline
  if (endpoint.startsWith('/leads')) {
    let leads = getStorage('leads', mockSeed.leads);

    if (endpoint.includes('/stats')) {
      const total = leads.length;
      const converted = leads.filter(l => l.status === 'Converted').length;
      return {
        success: true,
        data: {
          totalLeads: total,
          interestedCount: leads.filter(l => l.status === 'Interested').length,
          contactedCount: leads.filter(l => l.status === 'Contacted').length,
          meetingScheduledCount: leads.filter(l => l.status === 'MeetingScheduled').length,
          demoAttendedCount: leads.filter(l => l.status === 'DemoAttended').length,
          convertedCount: converted,
          lostCount: leads.filter(l => l.status === 'Lost').length,
          conversionRatePercentage: total > 0 ? Math.round((converted / total) * 1000) / 10 : 0,
          estimatedTotalPipelineValue: leads.reduce((sum, l) => sum + (l.estimatedBudget || 800000), 0)
        }
      };
    }

    if (endpoint.includes('/convert')) {
      const leadId = endpoint.split('/')[2];
      const lead = leads.find(l => l.id === leadId);
      if (!lead) return { success: false, message: 'Lid topilmadi' };

      // Quota check
      let centers = getStorage('centers', mockSeed.centers);
      const targetCenterId = lead.centerId || 'a0d3c5b0-9643-4f7c-9364-d72591a75ddc';
      const center = centers.find(c => c.id === targetCenterId);
      if (center && center.activeStudentsCount >= center.maxStudentsQuota) {
        throw new Error(`❌ DIQQAT: "${center.name}" markazining o'quvchi kvotasi (${center.activeStudentsCount} / ${center.maxStudentsQuota}) to'lgan! Yangi o'quvchi qo'shish avtomatik ravishda bloklangan. Davom etish uchun markaz tarifini oshiring.`);
      }

      if (center) {
        center.activeStudentsCount += 1;
        center.remainingQuota = Math.max(0, center.maxStudentsQuota - center.activeStudentsCount);
        center.quotaUsagePercentage = Math.round((center.activeStudentsCount / center.maxStudentsQuota) * 1000) / 10;
        if (center.activeStudentsCount >= center.maxStudentsQuota) {
          center.isQuotaExceeded = true;
          center.isBlocked = true;
          center.status = 'QuotaExceeded';
          center.statusText = "Limit to'lgan (Bloklangan)";
        }
        setStorage('centers', centers);
      }

      let users = getStorage('users', mockSeed.users);
      const newStudent = {
        id: 's_' + Date.now(),
        fullName: lead.fullName,
        email: lead.email || `${lead.fullName.toLowerCase().replace(/\s+/g, '_')}@eduflow.uz`,
        phone: lead.phone,
        parentPhone: body.parentPhone || lead.phone,
        role: 'Student',
        status: 'Active',
        centerId: targetCenterId,
        centerName: center ? center.name : 'EduFlow Bosh Markaz',
        balance: 0,
        balanceFormatted: '+0 so\'m',
        monthlyFee: 800000,
        createdAt: new Date().toISOString()
      };
      users = [newStudent, ...users];
      setStorage('users', users);

      if (body.initialPaymentAmount > 0) {
        let payments = getStorage('payments', mockSeed.payments);
        payments = [{
          id: 'p_' + Date.now(),
          studentId: newStudent.id,
          studentName: newStudent.fullName,
          amount: body.initialPaymentAmount,
          method: body.paymentMethod || 'Card',
          status: 'Completed',
          paidAt: new Date().toISOString(),
          note: 'Lid konversiyasi to\'lovi'
        }, ...payments];
        setStorage('payments', payments);
      }

      leads = leads.map(l => l.id === leadId ? { ...l, status: 'Converted', statusName: "To'lov qilganlar", convertedStudentId: newStudent.id } : l);
      setStorage('leads', leads);

      return { success: true, data: newStudent, message: "Lid muvaffaqiyatli o'quvchiga aylantirildi va to'lovi qabul qilindi!" };
    }

    if (endpoint.includes('/status')) {
      const leadId = endpoint.split('/')[2];
      const statusNames = {
        Interested: "Qiziqish bildirganlar",
        Contacted: "Gaplashilganlar",
        MeetingScheduled: "Uchrashuv belgilanganlar",
        DemoAttended: "Demo darsga kelganlar",
        Converted: "To'lov qilganlar",
        Lost: "Rad etganlar / Arxiv"
      };
      leads = leads.map(l => {
        if (l.id === leadId) {
          return {
            ...l,
            status: body.status,
            statusName: statusNames[body.status] || body.status,
            notes: body.notes ? `${l.notes || ''}\n${body.notes}` : l.notes
          };
        }
        return l;
      });
      setStorage('leads', leads);
      const updatedL = leads.find(l => l.id === leadId);
      return { success: true, data: updatedL, message: "Lid bosqichi yangilandi" };
    }

    if (method === 'GET') {
      const id = endpoint.split('/')[2];
      if (id && !id.includes('?')) {
        const found = leads.find(l => l.id === id);
        return found ? { success: true, data: found } : { success: false, message: 'Lid topilmadi' };
      }
      return { success: true, data: leads };
    }

    if (method === 'POST') {
      const sourceNames = {
        Instagram: "Instagram Direct",
        Telegram: "Telegram Kanal / Bot",
        Facebook: "Facebook Ad",
        Recommendation: "Tavsiya / Do'sti",
        Banner: "Tashqi Banner",
        Website: "Rasmiy Veb-sayt",
        WalkIn: "O'zi Kelgan (Walk-In)"
      };
      const newLead = {
        id: 'lead-' + Date.now(),
        ...body,
        sourceName: sourceNames[body.source] || 'Instagram Direct',
        status: body.status || 'Interested',
        statusName: 'Qiziqish bildirganlar',
        createdAt: new Date().toISOString()
      };
      leads = [newLead, ...leads];
      setStorage('leads', leads);
      return { success: true, data: newLead, message: "Yangi lid qo'shildi" };
    }

    if (method === 'PUT') {
      const id = endpoint.split('/')[2];
      leads = leads.map(l => l.id === id ? { ...l, ...body } : l);
      setStorage('leads', leads);
      return { success: true, data: body, message: "Lid yangilandi" };
    }

    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      leads = leads.filter(l => l.id !== id);
      setStorage('leads', leads);
      return { success: true, data: true, message: "Lid o'chirildi" };
    }
  }

  // Audit
  if (endpoint.startsWith('/auditlogs')) {
    return { success: true, data: mockSeed.audit };
  }

  // Rooms
  if (endpoint.startsWith('/rooms')) {
    let rooms = getStorage('rooms', mockSeed.rooms);
    if (endpoint.includes('/check-availability')) {
      return { success: true, data: { isAvailable: true, message: "Xona bo'sh" } };
    }
    if (method === 'GET') {
      return { success: true, data: rooms };
    }
    if (method === 'POST') {
      const newRoom = { id: 'r-' + Date.now(), ...body, centerName: 'EduFlow Bosh Markaz (Toshkent)' };
      rooms = [...rooms, newRoom];
      setStorage('rooms', rooms);
      return { success: true, data: newRoom, message: "Xona muvaffaqiyatli yaratildi" };
    }
    if (method === 'DELETE') {
      const id = endpoint.split('/')[2];
      rooms = rooms.filter(r => r.id !== id);
      setStorage('rooms', rooms);
      return { success: true, data: true, message: "Xona o'chirildi" };
    }
  }

  // Payroll
  if (endpoint.startsWith('/payroll')) {
    let payrolls = getStorage('payrolls', mockSeed.payrolls);
    if (endpoint.includes('/generate-center')) {
      return { success: true, message: "Oyliklar qayta hisoblandi" };
    }
    if (endpoint.includes('/pay') && method === 'POST') {
      const id = endpoint.split('/')[2];
      payrolls = payrolls.map(p => p.id === id ? { ...p, status: 'Paid', paidAt: new Date().toISOString() } : p);
      setStorage('payrolls', payrolls);
      return { success: true, message: "Oylik to'landi" };
    }
    return { success: true, data: payrolls };
  }

  // Notifications
  if (endpoint.startsWith('/notifications')) {
    let notifs = getStorage('notifications', mockSeed.notifications);
    if (endpoint === '/notifications/unread-count') {
      return { success: true, data: notifs.filter(n => !n.isRead).length };
    }
    if (endpoint.includes('/read-all')) {
      notifs = notifs.map(n => ({ ...n, isRead: true }));
      setStorage('notifications', notifs);
      return { success: true, data: true };
    }
    if (endpoint.includes('/read')) {
      const id = endpoint.split('/')[2];
      notifs = notifs.map(n => n.id === id ? { ...n, isRead: true } : n);
      setStorage('notifications', notifs);
      return { success: true, data: true };
    }
    return { success: true, data: notifs };
  }

  // Exams
  if (endpoint.startsWith('/exams')) {
    let exams = getStorage('exams', mockSeed.exams);
    if (method === 'POST' && endpoint.includes('/batch-results')) {
      return { success: true, message: "Baholar muvaffaqiyatli saqlandi" };
    }
    if (method === 'POST') {
      const newExam = { id: 'ex-' + Date.now(), ...body, gradedCount: 0, totalStudents: 4, averageScore: 0 };
      exams = [newExam, ...exams];
      setStorage('exams', exams);
      return { success: true, data: newExam, message: "Imtihon yaratildi" };
    }
    return { success: true, data: exams };
  }

  // Certificates
  if (endpoint.startsWith('/certificates')) {
    let certs = getStorage('certificates', mockSeed.certificates);
    if (endpoint.includes('/verify/')) {
      const code = endpoint.split('/verify/')[1];
      const found = certs.find(c => c.verificationCode === code || c.certificateNumber === code);
      return found ? { success: true, data: found } : { success: false, message: "Sertifikat topilmadi" };
    }
    if (method === 'POST' && endpoint.includes('/issue')) {
      const newCert = {
        id: 'cert-' + Date.now(),
        certificateNumber: 'EDU-2026-' + Math.floor(1000 + Math.random() * 9000),
        ...body,
        studentName: 'Jasur Bekmirzayev',
        courseName: '.NET 10 Backend Architecture',
        issuedAt: new Date().toISOString(),
        verificationCode: 'EDU-2026-' + Math.floor(1000 + Math.random() * 9000),
        isRevoked: false,
        centerName: 'EduFlow Bosh Markaz (Toshkent)'
      };
      certs = [newCert, ...certs];
      setStorage('certificates', certs);
      return { success: true, data: newCert, message: "Sertifikat muvaffaqiyatli berildi" };
    }
    return { success: true, data: certs };
  }

  // Student risks
  if (endpoint.startsWith('/studentrisks')) {
    const risks = getStorage('studentRisks', mockSeed.studentRisks);
    return { success: true, data: risks };
  }

  // Parent
  if (endpoint.startsWith('/parent')) {
    return { success: true, data: mockSeed.parentChildren };
  }

  return { success: true, data: null };
}

export const api = {
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    getMe: () => request('/auth/me')
  },
  centers: {
    getAll: () => request('/centers'),
    getById: (id) => request(`/centers/${id}`),
    getCurrent: () => request('/centers/current'),
    getTariffs: () => request('/centers/tariffs'),
    create: (data) => request('/centers', { method: 'POST', body: JSON.stringify(data) }),
    updateTariff: (id, data) => request(`/centers/${id}/tariff`, { method: 'PUT', body: JSON.stringify(data) }),
    update: (id, data) => request(`/centers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/centers/${id}`, { method: 'DELETE' })
  },
  users: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/users${q ? `?${q}` : ''}`);
    },
    getById: (id) => request(`/users/${id}`),
    create: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateCompensation: (id, data) => request(`/users/${id}/compensation`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/users/${id}`, { method: 'DELETE' })
  },
  leads: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/leads${q ? `?${q}` : ''}`);
    },
    getById: (id) => request(`/leads/${id}`),
    getStats: (centerId) => request(`/leads/stats${centerId ? `?centerId=${centerId}` : ''}`),
    create: (data) => request('/leads', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    updateStatus: (id, data) => request(`/leads/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
    convert: (id, data) => request(`/leads/${id}/convert`, { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/leads/${id}`, { method: 'DELETE' })
  },
  courses: {
    getAll: () => request('/courses'),
    getById: (id) => request(`/courses/${id}`),
    create: (data) => request('/courses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/courses/${id}`, { method: 'DELETE' })
  },
  groups: {
    getAll: (teacherId) => request(`/groups${teacherId ? `?teacherId=${teacherId}` : ''}`),
    getById: (id) => request(`/groups/${id}`),
    create: (data) => request('/groups', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/groups/${id}`, { method: 'DELETE' }),
    getStudents: (groupId) => request(`/groups/${groupId}/students`),
    enroll: (data) => request('/groups/enroll', { method: 'POST', body: JSON.stringify(data) }),
    removeStudent: (enrollmentId) => request(`/groups/enrollments/${enrollmentId}`, { method: 'DELETE' })
  },
  lessons: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/lessons${q ? `?${q}` : ''}`);
    },
    getById: (id) => request(`/lessons/${id}`),
    create: (data) => request('/lessons', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => request(`/lessons/${id}`, { method: 'DELETE' })
  },
  attendance: {
    getByLesson: (lessonId) => request(`/attendance/lesson/${lessonId}`),
    saveBatch: (data) => request('/attendance/batch', { method: 'POST', body: JSON.stringify(data) })
  },
  assignments: {
    getAll: (groupId) => request(`/assignments${groupId ? `?groupId=${groupId}` : ''}`),
    getById: (id) => request(`/assignments/${id}`),
    create: (data) => request('/assignments', { method: 'POST', body: JSON.stringify(data) }),
    getSubmissions: (id) => request(`/assignments/${id}/submissions`),
    submit: (data) => request('/assignments/submit', { method: 'POST', body: JSON.stringify(data) }),
    grade: (submissionId, data) => request(`/assignments/submissions/${submissionId}/grade`, { method: 'POST', body: JSON.stringify(data) })
  },
  payments: {
    getAll: (studentId) => request(`/payments${studentId ? `?studentId=${studentId}` : ''}`),
    create: (data) => request('/payments', { method: 'POST', body: JSON.stringify(data) }),
    getDebts: () => request('/payments/debts')
  },
  dashboard: {
    get: () => request('/dashboard')
  },
  auditLogs: {
    getAll: (count = 50) => request(`/auditlogs?count=${count}`)
  },
  rooms: {
    getAll: (centerId) => request(`/rooms${centerId ? `?centerId=${centerId}` : ''}`),
    getById: (id) => request(`/rooms/${id}`),
    create: (data) => request('/rooms', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/rooms/${id}`, { method: 'DELETE' }),
    checkAvailability: (id, startsAt, endsAt, excludeLessonId) => {
      const q = new URLSearchParams({ startsAt, endsAt, ...(excludeLessonId ? { excludeLessonId } : {}) }).toString();
      return request(`/rooms/${id}/check-availability?${q}`);
    }
  },
  payroll: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/payroll${q ? `?${q}` : ''}`);
    },
    getTeacherPayroll: (teacherId, periodMonth) => request(`/payroll/teacher/${teacherId}${periodMonth ? `?periodMonth=${periodMonth}` : ''}`),
    generateCenter: (data) => request('/payroll/generate-center', { method: 'POST', body: JSON.stringify(data) }),
    pay: (id, data) => request(`/payroll/${id}/pay`, { method: 'POST', body: JSON.stringify(data) })
  },
  notifications: {
    getAll: (unreadOnly = false) => request(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`),
    getUnreadCount: () => request('/notifications/unread-count'),
    markAsRead: (id) => request(`/notifications/${id}/read`, { method: 'POST' }),
    markAllAsRead: () => request('/notifications/read-all', { method: 'POST' })
  },
  exams: {
    getAll: (groupId) => request(`/exams${groupId ? `?groupId=${groupId}` : ''}`),
    getById: (id) => request(`/exams/${id}`),
    create: (data) => request('/exams', { method: 'POST', body: JSON.stringify(data) }),
    saveResults: (data) => request('/exams/batch-results', { method: 'POST', body: JSON.stringify(data) }),
    getStudentResults: (studentId) => request(`/exams/student-results${studentId ? `?studentId=${studentId}` : ''}`)
  },
  certificates: {
    getAll: (studentId) => request(`/certificates${studentId ? `?studentId=${studentId}` : ''}`),
    issue: (data) => request('/certificates/issue', { method: 'POST', body: JSON.stringify(data) }),
    verify: (code) => request(`/certificates/verify/${code}`)
  },
  risks: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/studentrisks${q ? `?${q}` : ''}`);
    }
  },
  parent: {
    getChildren: () => request('/parent/children')
  }
};
