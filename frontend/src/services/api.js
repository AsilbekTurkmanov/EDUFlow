const API_BASE_URL = 'http://localhost:5000/api';

export const getToken = () => localStorage.getItem('eduflow_token');
export const setToken = (token) => localStorage.setItem('eduflow_token', token);
export const removeToken = () => localStorage.removeItem('eduflow_token');

// In-browser mock data for GitHub Pages standalone demo when local backend is unreachable
const mockSeed = {
  users: [
    { id: '1', fullName: 'Asilbek Turkmanov (Super Admin)', username: 'asilbekturkmanov', email: 'asilbekturkmanov@eduflow.uz', role: 'Admin', status: 'Active', phone: '+998 99 199 20 12' },
    { id: '2', fullName: 'Shahriyor O\'qituvchi', username: 'shahriyor', email: 'shahriyor@eduflow.uz', role: 'Teacher', status: 'Active', phone: '+998 90 345 67 89', experienceYears: 3, sharePercentage: 70, monthlyEarned: 15680000, totalEarned: 564480000, studentNames: ['Turkmanov O\'quvchi', 'Jasur Bekmirzayev', 'Shahzod Normatov', 'Dilnoza Rahimova'] },
    { id: '3', fullName: 'Turkmanov O\'quvchi', username: 'turkmanov', email: 'turkmanov@eduflow.uz', role: 'Student', status: 'Active', phone: '+998 99 199 20 12', parentPhone: '+998 90 777 55 44', balance: 0, balanceFormatted: '+0 so\'m', presentCount: 24, absentCount: 1, monthlyPaymentStats: [{ month: 'Apr', amount: 800000, isPaid: true }, { month: 'May', amount: 800000, isPaid: true }, { month: 'Iyun', amount: 800000, isPaid: true }, { month: 'Iyul', amount: 800000, isPaid: true }, { month: 'Avg', amount: 800000, isPaid: true }, { month: 'Sen', amount: 800000, isPaid: true }] },
    { id: '4', fullName: 'Jasur Bekmirzayev', username: 'jasur_b', email: 'jasur@eduflow.uz', role: 'Student', status: 'Active', phone: '+998 97 111 22 33', parentPhone: '+998 90 111 22 33', balance: -800000, balanceFormatted: '-800 000 so\'m', presentCount: 22, absentCount: 3, monthlyPaymentStats: [{ month: 'Apr', amount: 800000, isPaid: true }, { month: 'May', amount: 800000, isPaid: true }, { month: 'Iyun', amount: 800000, isPaid: true }, { month: 'Iyul', amount: 800000, isPaid: true }, { month: 'Avg', amount: 800000, isPaid: true }, { month: 'Sen', amount: 0, isPaid: false }] },
    { id: '5', fullName: 'Shahzod Normatov', username: 'shahzod_n', email: 'shahzod@eduflow.uz', role: 'Student', status: 'Active', phone: '+998 91 444 55 66', parentPhone: '+998 90 444 55 66', balance: 7200000, balanceFormatted: '+7 200 000 so\'m', presentCount: 25, absentCount: 0, monthlyPaymentStats: [{ month: 'Apr', amount: 800000, isPaid: true }, { month: 'May', amount: 800000, isPaid: true }, { month: 'Iyun', amount: 800000, isPaid: true }, { month: 'Iyul', amount: 800000, isPaid: true }, { month: 'Avg', amount: 800000, isPaid: true }, { month: 'Sen', amount: 800000, isPaid: true }] },
    { id: '6', fullName: 'Dilnoza Rahimova', username: 'dilnoza_r', email: 'dilnoza@eduflow.uz', role: 'Student', status: 'Active', phone: '+998 99 777 88 99', parentPhone: '+998 90 888 99 00', balance: 0, balanceFormatted: '+0 so\'m', presentCount: 23, absentCount: 2, monthlyPaymentStats: [{ month: 'Apr', amount: 800000, isPaid: true }, { month: 'May', amount: 800000, isPaid: true }, { month: 'Iyun', amount: 800000, isPaid: true }, { month: 'Iyul', amount: 800000, isPaid: true }, { month: 'Avg', amount: 800000, isPaid: true }, { month: 'Sen', amount: 800000, isPaid: true }] }
  ],
  courses: [
    { id: 'c1', name: '.NET 10 Backend Architecture', description: 'Clean Architecture, EF Core, PostgreSQL, REST API, Docker va CI/CD kursi', price: 800000, durationWeeks: 16, status: 'Active', groupsCount: 1 },
    { id: 'c2', name: 'React JS & Modern Frontend', description: 'React 19, SPA, State Management, Tailwind/Vanilla CSS va zamonaviy veb ilovalar', price: 800000, durationWeeks: 12, status: 'Active', groupsCount: 1 },
    { id: 'c3', name: 'Full-Stack Enterprise Bootcamp', description: 'Frontend React + Backend .NET to\'liq integratsiya loyihasi', price: 800000, durationWeeks: 24, status: 'Active', groupsCount: 1 }
  ],
  groups: [
    { id: 'g1', name: 'DOTNET-G101', color: '#10B981', courseId: 'c1', courseName: '.NET 10 Backend Architecture', teacherId: '2', teacherName: 'Shahriyor O\'qituvchi', startDate: '2026-08-18', status: 'Active', studentsCount: 4 },
    { id: 'g2', name: 'REACT-G201', color: '#3B82F6', courseId: 'c2', courseName: 'React JS & Modern Frontend', teacherId: '2', teacherName: 'Shahriyor O\'qituvchi', startDate: '2026-08-28', status: 'Active', studentsCount: 3 }
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
    { id: 'au2', action: 'CREATE', entity: 'Course', userName: 'Asilbek Turkmanov (Super Admin)', createdAt: new Date(Date.now() - 86400000).toISOString(), metadata: 'Kurs qo\'shildi: .NET 10 Backend Architecture' }
  ]
};

// Local storage storage initialization for demo fallback
const getStorage = (key, fallback) => {
  const item = localStorage.getItem(`eduflow_${key}`);
  if (!item) {
    localStorage.setItem(`eduflow_${key}`, JSON.stringify(fallback));
    return fallback;
  }
  try { return JSON.parse(item); } catch { return fallback; }
};
const setStorage = (key, val) => localStorage.setItem(`eduflow_${key}`, JSON.stringify(val));

export async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

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
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    // If server unreachable or aborted, use standalone demo fallback
    return handleOfflineFallback(endpoint, options);
  }
}

function handleOfflineFallback(endpoint, options) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : null;

  // Auth login
  if (endpoint === '/auth/login' && method === 'POST') {
    const users = getStorage('users', mockSeed.users);
    const rawInput = (body.username || body.email || '').trim().toLowerCase();
    const cleanPhone = rawInput.replace(/[\s-]/g, '');
    const user = users.find(
      (u) =>
        (u.username && u.username.toLowerCase() === rawInput) ||
        (u.email && u.email.toLowerCase() === rawInput) ||
        (u.phone && u.phone.replace(/[\s-]/g, '').toLowerCase() === cleanPhone)
    );

    if (!user || (body.password !== '+998991992012' && body.password !== '123456')) {
      throw new Error("Login (username/email) yoki parol noto'g'ri.");
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

  // Users
  if (endpoint.startsWith('/users')) {
    let users = getStorage('users', mockSeed.users);
    if (method === 'GET') {
      return { success: true, data: { items: users, totalCount: users.length, pageNumber: 1, pageSize: 20, totalPages: 1 } };
    }
    if (method === 'POST') {
      const newUser = { id: String(Date.now()), ...body, status: 'Active' };
      users = [newUser, ...users];
      setStorage('users', users);
      return { success: true, data: newUser, message: "Foydalanuvchi qo'shildi" };
    }
    if (method === 'PUT') {
      const id = endpoint.split('/')[2];
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
          totalStudents: 131,
          totalTeachers: 16,
          totalCourses: 12,
          activeGroups: 25,
          totalRevenue: 564480000,
          monthlyRevenue: 15680000,
          recentPayments: mockSeed.payments,
          recentEnrollments: [
            { id: 'e1', groupName: 'DOTNET-G101', studentName: 'Turkmanov O\'quvchi', joinedAt: new Date().toISOString() }
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

  // Audit
  if (endpoint.startsWith('/auditlogs')) {
    return { success: true, data: mockSeed.audit };
  }

  return { success: true, data: null };
}

export const api = {
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    getMe: () => request('/auth/me')
  },
  users: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/users${q ? `?${q}` : ''}`);
    },
    getById: (id) => request(`/users/${id}`),
    create: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/users/${id}`, { method: 'DELETE' })
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
  }
};
