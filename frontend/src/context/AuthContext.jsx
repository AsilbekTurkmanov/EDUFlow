import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken, removeToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const loadCurrentUser = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.auth.getMe();
      if (res?.data) {
        setUser(res.data);
      } else {
        removeToken();
        setUser(null);
      }
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();

    const handleUnauthorized = () => {
      setUser(null);
      showToast('Sessiya muddati tugadi. Iltimos, qayta kiring.', 'error');
    };

    window.addEventListener('eduflow_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('eduflow_unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.auth.login({ email, password });
      if (res?.data?.token) {
        setToken(res.data.token);
        setUser(res.data.user);
        showToast(`Xush kelibsiz, ${res.data.user.fullName}!`, 'success');
        return true;
      }
    } catch (err) {
      showToast(err.message || 'Login xatosi', 'error');
      return false;
    }
  };

  const quickLogin = async (targetRole) => {
    let email = 'admin@eduflow.uz';
    let password = 'Admin123!';

    if (targetRole === 'Teacher') {
      email = 'anvar.ustoz@eduflow.uz';
      password = 'Teacher123!';
    } else if (targetRole === 'Student') {
      email = 'jasur@eduflow.uz';
      password = 'Student123!';
    }

    return await login(email, password);
  };

  const logout = () => {
    removeToken();
    setUser(null);
    showToast('Tizimdan chiqildi.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role,
        loading,
        login,
        quickLogin,
        logout,
        showToast,
        loadCurrentUser
      }}
    >
      {children}
      {/* Toast notifications container */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
