import React from 'react';
import { Terminal, Shield, UserCheck, BookOpen, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ currentTabTitle }) => {
  const { role, quickLogin, user } = useAuth();

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
          {currentTabTitle}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Quick Demo Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Terminal size={14} color="#f59e0b" /> Demo Rol:
          </span>
          <button
            onClick={() => quickLogin('Admin')}
            className={`btn btn-sm ${role === 'Admin' ? 'btn-amber' : 'btn-ghost'}`}
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            Admin
          </button>
          <button
            onClick={() => quickLogin('Teacher')}
            className={`btn btn-sm ${role === 'Teacher' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            Teacher
          </button>
          <button
            onClick={() => quickLogin('Student')}
            className={`btn btn-sm ${role === 'Student' ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            Student
          </button>
        </div>

        {/* Scalar API Doc Button */}
        <a
          href="http://localhost:5000/scalar/v1"
          target="_blank"
          rel="noreferrer"
          className="btn btn-secondary btn-sm"
          title="Scalar API Dokumentatsiyasini ochish"
          style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399' }}
        >
          <ExternalLink size={14} />
          <span>Scalar API</span>
        </a>

        {/* User initials circle */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.4)'
          }}
        >
          {user?.fullName ? user.fullName.charAt(0) : 'U'}
        </div>
      </div>
    </header>
  );
};
