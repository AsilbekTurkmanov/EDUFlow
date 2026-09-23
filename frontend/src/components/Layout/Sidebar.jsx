import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  BookOpen,
  FolderKanban,
  Calendar,
  CheckSquare,
  FileCode,
  CreditCard,
  History,
  LogOut,
  GraduationCap,
  Target
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ currentTab, setTab }) => {
  const { user, role, logout } = useAuth();

  const getNavItems = () => {
    const items = [
      { id: 'dashboard', label: 'Boshqaruv Paneli', icon: LayoutDashboard }
    ];

    if (role === 'Admin') {
      // Super Admin and Center Admins have SaaS Centers Hub
      items.push(
        { id: 'centers', label: '🏢 O\'quv Markazlari (SaaS)', icon: Building2 },
        { id: 'leads', label: '🎯 Lidlar (CRM Doska)', icon: Target },
        { id: 'users', label: 'Foydalanuvchilar', icon: Users },
        { id: 'courses', label: 'Kurslar', icon: BookOpen },
        { id: 'groups', label: 'Guruhlar', icon: FolderKanban },
        { id: 'schedule', label: 'Dars Jadvali', icon: Calendar },
        { id: 'attendance', label: 'Davomad', icon: CheckSquare },
        { id: 'assignments', label: 'Vazifalar', icon: FileCode },
        { id: 'payments', label: 'To\'lovlar', icon: CreditCard },
        { id: 'audit', label: 'Audit Tarixi', icon: History }
      );
    } else if (role === 'Teacher') {
      items.push(
        { id: 'groups', label: 'Mening Guruhlarim', icon: FolderKanban },
        { id: 'schedule', label: 'Dars Jadvalim', icon: Calendar },
        { id: 'attendance', label: 'Davomad Belgilash', icon: CheckSquare },
        { id: 'assignments', label: 'Topshiriqlar & Baholash', icon: FileCode }
      );
    } else if (role === 'Student') {
      items.push(
        { id: 'groups', label: 'Guruhlarim', icon: FolderKanban },
        { id: 'schedule', label: 'Darslarim', icon: Calendar },
        { id: 'assignments', label: 'Uy Vazifalarim', icon: FileCode },
        { id: 'payments', label: 'Mening To\'lovlarim', icon: CreditCard }
      );
    }

    return items;
  };

  const navItems = getNavItems();

  const getRoleBadgeClass = () => {
    if (role === 'Admin') return 'badge-amber';
    if (role === 'Teacher') return 'badge-emerald';
    return 'badge-violet';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-brand-icon">
          <GraduationCap size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px', color: '#fff' }}>
            EDU<span style={{ color: '#10b981' }}>FLOW</span>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>SaaS Multi-Tenant Tizimi</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.fullName}
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
          <span className={`badge ${getRoleBadgeClass()}`} style={{ flexShrink: 0 }}>{role}</span>
        </div>

        {/* Center scope badge */}
        {user?.centerName && (
          <div style={{ 
            fontSize: '11px', 
            color: '#34d399', 
            background: 'rgba(16, 185, 129, 0.1)', 
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '4px 8px', 
            borderRadius: '6px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            <Building2 size={13} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.centerName}</span>
          </div>
        )}

        <button onClick={logout} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
          <LogOut size={16} />
          <span>Tizimdan Chiqish</span>
        </button>
      </div>
    </aside>
  );
};
