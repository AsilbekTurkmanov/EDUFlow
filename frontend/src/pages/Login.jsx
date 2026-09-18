import React, { useState } from 'react';
import { GraduationCap, Shield, UserCheck, BookOpen, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login, quickLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  const handleDemo = async (role) => {
    setLoading(true);
    await quickLogin(role);
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top, #142035 0%, #080c14 100%)',
        padding: '24px'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(18, 26, 41, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '36px',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
              marginBottom: '16px'
            }}
          >
            <GraduationCap size={32} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            EDU<span style={{ color: '#10b981' }}>FLOW</span>
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            O'quv markazini boshqarish platformasi
          </p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
            Tezkor Demo Kirish (1-bosish):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleDemo('Admin')}
              disabled={loading}
              className="btn btn-secondary btn-sm"
              style={{ flexDirection: 'column', gap: '4px', padding: '10px 4px', border: '1px solid rgba(245, 158, 11, 0.3)' }}
            >
              <Shield size={16} color="#f59e0b" />
              <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 700 }}>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('Teacher')}
              disabled={loading}
              className="btn btn-secondary btn-sm"
              style={{ flexDirection: 'column', gap: '4px', padding: '10px 4px', border: '1px solid rgba(16, 185, 129, 0.3)' }}
            >
              <UserCheck size={16} color="#10b981" />
              <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 700 }}>Teacher</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('Student')}
              disabled={loading}
              className="btn btn-secondary btn-sm"
              style={{ flexDirection: 'column', gap: '4px', padding: '10px 4px', border: '1px solid rgba(139, 92, 246, 0.3)' }}
            >
              <BookOpen size={16} color="#8b5cf6" />
              <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: 700 }}>Student</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '12px' }}>
          <div style={{ height: '1px', flex: 1, background: 'rgba(255, 255, 255, 0.08)' }} />
          <span style={{ fontSize: '12px', color: '#6b7280' }}>yoki email bilan</span>
          <div style={{ height: '1px', flex: 1, background: 'rgba(255, 255, 255, 0.08)' }} />
        </div>

        {/* Regular Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Manzil</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#6b7280' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@eduflow.uz"
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Parol</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#6b7280' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
          >
            {loading ? <div className="spinner" style={{ width: '18px', height: '18px' }} /> : (
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
