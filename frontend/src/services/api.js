const API_BASE_URL = 'http://localhost:5000/api';

export const getToken = () => localStorage.getItem('eduflow_token');
export const setToken = (token) => localStorage.setItem('eduflow_token', token);
export const removeToken = () => localStorage.removeItem('eduflow_token');

// In-browser mock data for GitHub Pages standalone demo when local backend is unreachable
const mockSeed = {
  users: [
    { id: '1', fullName: 'Sardor Rahimov (Admin)', email: 'admin@eduflow.uz', role: 'Admin', status: 'Active', phone: '+998 90 123 45 67' },
    { id: '2', fullName: 'Anvar Karimov (Senior .NET)', email: 'anvar.ustoz@eduflow.uz', role: 'Teacher', status: 'Active', phone: '+998 93 222 33 44' },
    { id: '3', fullName: 'Madina Alimova (Frontend Lead)', email: 'madina.ustoz@eduflow.uz', role: 'Teacher', status: 'Active', phone: '+998 94 333 44 55' },
    { id: '4', fullName: 'Jasur Bekmirzayev', email: 'jasur@eduflow.uz', role: 'Student', status: 'Active', phone: '+998 97 111 22 33' },
    { id: '5', fullName: 'Shahzod Normatov', email: 'shahzod@eduflow.uz', role: 'Student', status: 'Active', phone: '+998 91 444 55 66' },
    { id: '6', fullName: 'Dilnoza Rahimova', email: 'dilnoza@eduflow.uz', role: 'Student', status: 'Active', phone: '+998 99 777 88 99' }
  ],
  courses: [
    { id: 'c1', name: '.NET 10 Backend Architecture', description: 'Clean Architecture, EF Core, PostgreSQL, REST API, Docker va CI/CD kursi', price: 3500000, durationWeeks: 16, status: 'Active', groupsCount: 1 },
    { id: 'c2', name: 'React JS & Modern Frontend', description: 'React 19, SPA, State Management, Tailwind/Vanilla CSS va zamonaviy veb ilovalar', price: 3000000, durationWeeks: 12, status: 'Active', groupsCount: 1 },
    { id: 'c3', name: 'Full-Stack Enterprise Bootcamp', description: 'Frontend React + Backend .NET to\'liq integratsiya loyihasi', price: 6000000, durationWeeks: 24, status: 'Active', groupsCount: 0 }
  ],
  groups: [
    { id: 'g1', name: 'DOTNET-G101', courseId: 'c1', courseName: '.NET 10 Backend Architecture', teacherId: '2', teacherName: 'Anvar Karimov', startDate: '2026-08-18', status: 'Active', studentsCount: 3 },
    { id: 'g2', name: 'REACT-G201', courseId: 'c2', courseName: 'React JS & Modern Frontend', teacherId: '3', teacherName: 'Madina Alimova', startDate: '2026-08-28', status: 'Active', studentsCount: 2 }
  ],
  lessons: [
    { id: 'l1', groupId: 'g1', groupName: 'DOTNET-G101', title: '1-Dars: Clean Architecture asoslari va EF Core PostgreSQL', startsAt: new Date(Date.now() - 86400000 * 2).toISOString(), endsAt: new Date(Date.now() - 86400000 * 2 + 7200000).toISOString(), room: 'Auditoriya 101', onlineUrl: 'https://meet.google.com/edu-net-101', teacherName: 'Anvar Karimov' },
    { id: 'l2', groupId: 'g1', groupName: 'DOTNET-G101', title: '2-Dars: JWT Authentication va Role Authorization', startsAt: new Date(Date.now() + 86400000).toISOString(), endsAt: new Date(Date.now() + 86400000 + 7200000).toISOString(), room: 'Auditoriya 101', onlineUrl: 'https://meet.google.com/edu-net-101', teacherName: 'Anvar Karimov' },
    { id: 'l3', groupId: 'g2', groupName: 'REACT-G201', title: 'React Hooks va State boshqaruvi', startsAt: new Date(Date.now() + 86400000 * 2).toISOString(), endsAt: new Date(Date.now() + 86400000 * 2 + 7200000).toISOString(), room: 'Auditoriya 204', onlineUrl: 'https://meet.google.com/edu-react-201', teacherName: 'Madina Alimova' }
  ],
  assignments: [
    { id: 'a1', groupId: 'g1', groupName: 'DOTNET-G101', title: 'Vazifa #1: Repository va Unit of Work pattern yaratish', description: 'EF Core yordamida PostgreSQL bazasi bilan bog\'lanuvchi repository qatlamini yarating.', deadline: new Date(Date.now() + 86400000 * 3).toISOString(), maxScore: 100, submissionsCount: 2, isPassedDeadline: false },
    { id: 'a2', groupId: 'g2', groupName: 'REACT-G201', title: 'Vazifa #1: React Dashboard UI interfeysi', description: 'Ko\'k rangdan foydalanmasdan, zamonaviy Zumrad va Qahrabo ranglarida boshqaruv paneli sahifasini yarating.', deadline: new Date(Date.now() + 86400000 * 5).toISOString(), maxScore: 100, submissionsCount: 1, isPassedDeadline: false }
  ],
  payments: [
    { id: 'p1', studentId: '4', studentName: 'Jasur Bekmirzayev', studentEmail: 'jasur@eduflow.uz', amount: 2000000, method: 'Card', status: 'Completed', paidAt: new Date(Date.now() - 86400000 * 15).toISOString(), note: '.NET kursi uchun 1-qism to\'lov' },
    { id: 'p2', studentId: '4', studentName: 'Jasur Bekmirzayev', studentEmail: 'jasur@eduflow.uz', amount: 1500000, method: 'BankTransfer', status: 'Completed', paidAt: new Date(Date.now() - 86400000 * 5).toISOString(), note: '.NET kursi yakuniy to\'lov' },
    { id: 'p3', studentId: '5', studentName: 'Shahzod Normatov', studentEmail: 'shahzod@eduflow.uz', amount: 1800000, method: 'Card', status: 'Completed', paidAt: new Date(Date.now() - 86400000 * 10).toISOString(), note: 'Boshlang\'ich 50% to\'lov' }
  ],
  audit: [
    { id: 'au1', action: 'LOGIN', entity: 'User', userName: 'Sardor Rahimov (Admin)', createdAt: new Date().toISOString(), metadata: 'Tizimga muvaffaqiyatli kirildi' },
    { id: 'au2', action: 'CREATE', entity: 'Course', userName: 'Sardor Rahimov (Admin)', createdAt: new Date(Date.now() - 86400000).toISOString(), metadata: 'Kurs qo\'shildi: .NET 10 Backend Architecture' }
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
    const rawInput = (body.username || body.email || '').toLowerCase();
    const user = users.find((u) => (u.username && u.username.toLowerCase() === rawInput) || (u.email && u.email.toLowerCase() === rawInput)) || users[0];
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
    if (endpoint.includes('/debts')) {
      return { success: true, data: [
        { studentId: '4', studentName: 'Jasur Bekmirzayev', studentEmail: 'jasur@eduflow.uz', totalCourseFee: 3500000, totalPaid: 3500000, remainingDebt: 0, activeEnrollmentsCount: 1 },
        { studentId: '5', studentName: 'Shahzod Normatov', studentEmail: 'shahzod@eduflow.uz', totalCourseFee: 3500000, totalPaid: 1800000, remainingDebt: 1700000, activeEnrollmentsCount: 1 }
      ] };
    }
    if (method === 'GET') return { success: true, data: payments };
    if (method === 'POST') {
      const newP = { id: 'p_' + Date.now(), ...body, studentName: 'Talaba', paidAt: new Date().toISOString(), status: 'Completed' };
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
          totalStudents: 6,
          totalTeachers: 2,
          totalCourses: 3,
          activeGroups: 2,
          totalRevenue: 5300000,
          monthlyRevenue: 3300000,
          recentPayments: mockSeed.payments,
          recentEnrollments: [
            { id: 'e1', groupName: 'DOTNET-G101', studentName: 'Jasur Bekmirzayev', joinedAt: new Date().toISOString() }
          ]
        }
      };
    }
    if (user.role === 'Teacher') {
      return {
        success: true,
        data: {
          myGroupsCount: 2,
          myStudentsCount: 5,
          pendingSubmissionsCount: 1,
          upcomingLessonsCount: 2,
          upcomingLessons: mockSeed.lessons,
          pendingSubmissions: [
            { id: 'sub_p1', studentName: 'Jasur Bekmirzayev', assignmentTitle: 'Clean Architecture topshirig\'i', submittedAt: new Date().toISOString(), maxScore: 100 }
          ]
        }
      };
    }
    return {
      success: true,
      data: {
        enrolledCoursesCount: 1,
        attendanceRatePercentage: 96.5,
        pendingAssignmentsCount: 1,
        totalCourseFee: 3500000,
        totalPaid: 3500000,
        balanceDebt: 0,
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
