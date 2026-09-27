import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

export const socket = io('http://localhost:5000', { autoConnect: false });
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id, role: payload.role, requirePasswordChange: payload.requirePasswordChange });
        socket.connect();
        socket.emit('register', payload.id);
      } catch(e) {
        logout();
      }
    } else {
      socket.disconnect();
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.data.success) {
      const newToken = res.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setUser({ id: payload.id, role: payload.role, requirePasswordChange: res.data.requirePasswordChange });
      
      socket.connect();
      socket.emit('register', payload.id);

      if (res.data.requirePasswordChange) navigate('/change-password');
      else {
        if (payload.role === 'ADMIN') navigate('/admin');
        else if (payload.role === 'MENTOR') navigate('/mentor');
        else navigate('/mentee');
      }
    }
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    socket.disconnect();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setToken, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
