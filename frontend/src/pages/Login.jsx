import React, { useState } from 'react';
import {
  GraduationCap,
  Shield,
  UserCheck,
  BookOpen,
  ArrowRight,
  Lock,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('Admin'); // 'Admin' | 'Teacher' | 'Student'
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const roleConfigs = {
    Admin: {
      role: 'Admin',
      title: 'Super Admin Portali',
      subtitle: 'Tizimni to\'liq boshqarish, moliya va barcha foydalanuvchilar nazorati',
      color: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.15)',
      borderColor: 'rgba(245, 158, 11, 0.35)',
      badgeClass: 'badge-amber',
      icon: Shield,
      loginPlaceholder: 'Admin logini yoki emaili'
    },
    Teacher: {
      role: 'Teacher',
      title: 'O\'qituvchi Portali',
      subtitle: 'Dars jadvali, talabalar davomati va oylik daromad hisobi',
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
      borderColor: 'rgba(16, 185, 129, 0.35)',
      badgeClass: 'badge-emerald',
      icon: UserCheck,
      loginPlaceholder: 'O\'qituvchi logini yoki emaili'
    },
    Student: {
      role: 'Student',
      title: 'O\'quvchi Portali',
      subtitle: 'Darslar jadvali, uy vazifalari va oylik to\'lovlar balansi',
      color: '#8b5cf6',
      bgGlow: 'rgba(139, 92, 246, 0.15)',
      borderColor: 'rgba(139, 92, 246, 0.35)',
      badgeClass: 'badge-violet',
      icon: BookOpen,
      loginPlaceholder: 'O\'quvchi niki yoki emaili'
    }
  };

  const currentCfg = roleConfigs[activeTab];

  const handleTabChange = (role) => {
    setActiveTab(role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginInput || !password) return;
    setLoading(true);
    await login(loginInput, password);
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top, #142035 0%, #06090e 100%)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative ambient background glows */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '20%',
          width: '500px',
          height: '500px',
          background: currentCfg.color,
          filter: 'blur(160px)',
          opacity: 0.12,
          pointerEvents: 'none',
          transition: 'all 0.5s ease'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '20%',
          width: '450px',
          height: '450px',
          background: '#047857',
          filter: 'blur(160px)',
          opacity: 0.08,
          pointerEvents: 'none'
        }}
      />

      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${currentCfg.borderColor}`,
          padding: '36px',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
          position: 'relative',
          zIndex: 10,
          transition: 'border-color 0.3s ease'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              background: `linear-gradient(135deg, ${currentCfg.color} 0%, #064e3b 100%)`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: `0 10px 25px ${currentCfg.bgGlow}`,
              marginBottom: '14px',
              transition: 'all 0.3s ease'
            }}
          >
            <GraduationCap size={32} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            EDU<span style={{ color: currentCfg.color, transition: 'color 0.3s ease' }}>FLOW</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
            Zamonaviy Ta'lim & O'quv Markazi Platformasi
          </p>
        </div>

        {/* 3 Dedicated Role Login Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            background: 'rgba(0, 0, 0, 0.35)',
            padding: '6px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '20px'
          }}
        >
          <button
            type="button"
            onClick={() => handleTabChange('Admin')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 6px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'Admin' ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
              color: activeTab === 'Admin' ? '#fbbf24' : '#9ca3af',
              boxShadow: activeTab === 'Admin' ? '0 4px 12px rgba(245, 158, 11, 0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Shield size={18} color={activeTab === 'Admin' ? '#f59e0b' : '#6b7280'} />
            <span style={{ fontSize: '12px', fontWeight: activeTab === 'Admin' ? 800 : 600 }}>Super Admin</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('Teacher')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 6px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'Teacher' ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
              color: activeTab === 'Teacher' ? '#34d399' : '#9ca3af',
              boxShadow: activeTab === 'Teacher' ? '0 4px 12px rgba(16, 185, 129, 0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <UserCheck size={18} color={activeTab === 'Teacher' ? '#10b981' : '#6b7280'} />
            <span style={{ fontSize: '12px', fontWeight: activeTab === 'Teacher' ? 800 : 600 }}>O'qituvchi</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('Student')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 6px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'Student' ? 'rgba(139, 92, 246, 0.18)' : 'transparent',
              color: activeTab === 'Student' ? '#a78bfa' : '#9ca3af',
              boxShadow: activeTab === 'Student' ? '0 4px 12px rgba(139, 92, 246, 0.2)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <BookOpen size={18} color={activeTab === 'Student' ? '#8b5cf6' : '#6b7280'} />
            <span style={{ fontSize: '12px', fontWeight: activeTab === 'Student' ? 800 : 600 }}>O'quvchi</span>
          </button>
        </div>

        {/* Active Portal Header Card */}
        <div
          style={{
            background: currentCfg.bgGlow,
            border: `1px solid ${currentCfg.borderColor}`,
            borderRadius: '14px',
            padding: '12px 16px',
            marginBottom: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{currentCfg.title}</span>
              <span className={`badge ${currentCfg.badgeClass}`}>Kirish</span>
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '3px' }}>
              {currentCfg.subtitle}
            </div>
          </div>
        </div>

        {/* Regular Interactive Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Login yoki Email
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: currentCfg.color }} />
              <input
                type="text"
                required
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder={currentCfg.loginPlaceholder}
                className="form-input"
                style={{ paddingLeft: '42px', fontSize: '14px' }}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Parol</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showPassword ? 'Yashirish' : 'Ko\'rsatish'}</span>
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: currentCfg.color }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parolingizni kiriting"
                className="form-input"
                style={{ paddingLeft: '42px', fontSize: '14px' }}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              fontSize: '15px',
              fontWeight: 800,
              background: `linear-gradient(135deg, ${currentCfg.color} 0%, #047857 100%)`,
              border: 'none',
              boxShadow: `0 8px 24px ${currentCfg.bgGlow}`
            }}
          >
            {loading ? (
              <div className="spinner" style={{ width: '20px', height: '20px' }} />
            ) : (
              <>
                <span>Tizimga Kirish</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
