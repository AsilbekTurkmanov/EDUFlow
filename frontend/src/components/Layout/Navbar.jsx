import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  UserCheck,
  BookOpen,
  LogOut,
  Building2,
  Bell,
  Check,
  CheckCheck,
  Users,
  AlertTriangle,
  CreditCard,
  Target,
  FileCode,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const Navbar = ({ currentTabTitle, setTab }) => {
  const { role, user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Polling every 20s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.notifications.getAll();
      if (res?.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n) => !n.isRead).length);
      } else {
        // Fallback demo notifications if offline
        const fallback = [
          {
            id: 'n1',
            title: '🎯 Yangi lid kelib tushdi',
            message: 'Instagram orqali .NET Backend kursiga yangi qiziqish bildirildi.',
            type: 'Lead',
            actionUrl: 'leads',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
          },
          {
            id: 'n2',
            title: '💰 To\'lov amalga oshirildi',
            message: 'Jasur Bekmirzayev 800,000 UZS kurs to\'lovini amalga oshirdi.',
            type: 'Payment',
            actionUrl: 'payments',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
          },
          {
            id: 'n3',
            title: '⚠️ Davomat ogohlantirishi',
            message: 'Frontend guruhida 2 nafar o\'quvchi darsga kelmadi.',
            type: 'Attendance',
            actionUrl: 'attendance',
            isRead: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString()
          }
        ];
        setNotifications(fallback);
        setUnreadCount(fallback.filter((n) => !n.isRead).length);
      }
    } catch {
      // Ignore background notification fetch error
    }
  };

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await api.notifications.markAsRead(id);
    } catch {
      // offline fallback
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
    } catch {
      // offline fallback
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (item) => {
    if (!item.isRead) {
      handleMarkAsRead(item.id);
    }
    if (item.actionUrl && setTab) {
      setTab(item.actionUrl);
    }
    setShowNotifications(false);
  };

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
    if (role === 'Parent') {
      return (
        <span
          className="badge"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 700,
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8'
          }}
        >
          <Users size={14} color="#38bdf8" /> Ota-ona
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
    if (role === 'Parent') return 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)';
    return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Hozirgina';
    if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`;
    return `${Math.floor(diff / 86400)} kun oldin`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'Lead':
        return <Target size={15} color="#38bdf8" />;
      case 'Payment':
        return <CreditCard size={15} color="#10b981" />;
      case 'Warning':
      case 'Attendance':
        return <AlertTriangle size={15} color="#f59e0b" />;
      default:
        return <FileCode size={15} color="#a78bfa" />;
    }
  };

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.3px' }}>
          {currentTabTitle}
        </h2>
        {user?.centerName && (
          <span
            className="badge badge-emerald"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              fontSize: '11px',
              fontWeight: 600,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#34d399'
            }}
          >
            <Building2 size={12} /> {user.centerName}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Role Badge */}
        {getRoleBadge()}

        {/* 🔔 Notification Center Button & Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-ghost"
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              padding: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: showNotifications ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: unreadCount > 0 ? '#38bdf8' : '#9ca3af',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Bildirishnomalar"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '9px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '48px',
                right: '0',
                width: '360px',
                maxHeight: '440px',
                borderRadius: '16px',
                background: 'rgba(18, 22, 34, 0.96)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1000,
                overflow: 'hidden',
                animation: 'fadeIn 0.15s ease'
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={16} color="#38bdf8" />
                  <span style={{ fontWeight: 800, fontSize: '14px', color: '#fff' }}>
                    Bildirishnomalar
                  </span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        padding: '1px 7px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}
                    >
                      {unreadCount} yangi
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9ca3af',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Barchasini o'qilgan deb belgilash"
                  >
                    <CheckCheck size={14} color="#34d399" /> Hammasini o'qish
                  </button>
                )}
              </div>

              {/* List */}
              <div style={{ overflowY: 'auto', maxHeight: '340px' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '36px 16px', textAlign: 'center', color: '#6b7280' }}>
                    <Bell size={28} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '13px' }}>Hozircha yangi bildirishnomalar yo'q</div>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: n.isRead ? 'transparent' : 'rgba(56, 189, 248, 0.05)',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(56, 189, 248, 0.05)')
                      }
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {getNotificationIcon(n.type)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '2px'
                          }}
                        >
                          <span
                            style={{
                              fontSize: '13px',
                              fontWeight: n.isRead ? 600 : 700,
                              color: n.isRead ? '#d1d5db' : '#fff'
                            }}
                          >
                            {n.title}
                          </span>
                          {!n.isRead && (
                            <span
                              style={{
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                background: '#38bdf8'
                              }}
                            />
                          )}
                        </div>
                        <p
                          style={{
                            fontSize: '12px',
                            color: '#9ca3af',
                            margin: '0 0 4px 0',
                            lineHeight: 1.3
                          }}
                        >
                          {n.message}
                        </p>
                        <div style={{ fontSize: '10px', color: '#6b7280' }}>
                          {formatTimeAgo(n.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
