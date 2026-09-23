import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Layout/Sidebar';
import { Navbar } from './components/Layout/Navbar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Centers } from './pages/Centers';
import { Users } from './pages/Users';
import { Courses } from './pages/Courses';
import { Groups } from './pages/Groups';
import { Schedule } from './pages/Schedule';
import { Attendance } from './pages/Attendance';
import { Assignments } from './pages/Assignments';
import { Payments } from './pages/Payments';
import { AuditLogs } from './pages/AuditLogs';
import './App.css';

export function App() {
  const { user, loading, role } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [filterCenterId, setFilterCenterId] = useState('ALL');

  useEffect(() => {
    // When role changes, switch to dashboard
    setCurrentTab('dashboard');
  }, [role]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-app)'
        }}
      >
        <div className="spinner" style={{ width: '48px', height: '48px' }} />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Boshqaruv Paneli';
      case 'centers': return '🏢 O\'quv Markazlari (SaaS Hub)';
      case 'users': return 'Foydalanuvchilar & To\'lov Analitikasi';
      case 'courses': return 'Kurslar';
      case 'groups': return 'Guruhlar';
      case 'schedule': return 'Dars Jadvali';
      case 'attendance': return 'Davomad Jurnali';
      case 'assignments': return 'Uy Vazifalari & Topshiriqlar';
      case 'payments': return 'Moliya & To\'lovlar';
      case 'audit': return 'Audit Tarixi';
      default: return 'EduFlow';
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentTab={currentTab} setTab={setCurrentTab} />

      <div className="main-content">
        <Navbar currentTabTitle={getTabTitle()} />

        <main className="page-body">
          {currentTab === 'dashboard' && <Dashboard setTab={setCurrentTab} />}
          {currentTab === 'centers' && (
            <Centers 
              onSelectCenterForUsers={(centerId) => {
                setFilterCenterId(centerId);
                setCurrentTab('users');
              }} 
            />
          )}
          {currentTab === 'users' && (
            <Users 
              initialCenterId={filterCenterId} 
              setTab={setCurrentTab} 
            />
          )}
          {currentTab === 'courses' && <Courses />}
          {currentTab === 'groups' && <Groups />}
          {currentTab === 'schedule' && <Schedule />}
          {currentTab === 'attendance' && <Attendance />}
          {currentTab === 'assignments' && <Assignments />}
          {currentTab === 'payments' && <Payments />}
          {currentTab === 'audit' && <AuditLogs />}
        </main>
      </div>
    </div>
  );
}

export default App;
