import React from 'react';
import { Shield, UserCheck, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ currentTabTitle }) => {
  const { role, user, logout } = useAuth();

  const getRoleBadge = () => {
    if (role === 'Admin') {
      return (
        <span
          className="badge badge-amber"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 700
          }}
        >
          <Shield size={14} color="#f59e0b" /> Super Admin
        </span>
      );
    }
    if (role === 'Teacher') {
      return (
        <span
          className="badge badge-emerald"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 700
          }}
        >
          <UserCheck size={14} color="#10b981" /> O'qituvchi
        </span>
      );
    }
    return (
      <span
        className="badge badge-violet"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '5px 12px',
          fontSize: '12px',
          fontWeight: 700
        }}
      >
        <BookOpen size={14} color="#8b5cf6" /> O'quvchi
      </span>
    );
  };

  const getAvatarGradient = () => {
    if (role === 'Admin') return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    if (role === 'Teacher') return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.3px' }}>
          {currentTabTitle}
        </h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Role Badge */}
        {getRoleBadge()}

        {/* Logged in User Information */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 12px 4px 6px',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: getAvatarGradient(),
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '13px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              letterSpacing: '0.5px'
            }}
          >
            {getInitials(user?.fullName)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#f3f4f6', lineHeight: 1.2 }}>
              {user?.fullName || 'Foydalanuvchi'}
            </span>
            <span style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.1 }}>
              @{user?.username || (user?.email ? user.email.split('@')[0] : 'user')}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="btn btn-ghost btn-sm"
          title="Tizimdan chiqish (Login sahifasiga qaytish)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#f87171',
            borderColor: 'rgba(239, 68, 68, 0.25)',
            background: 'rgba(239, 68, 68, 0.06)',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <LogOut size={14} />
          <span>Chiqish</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
