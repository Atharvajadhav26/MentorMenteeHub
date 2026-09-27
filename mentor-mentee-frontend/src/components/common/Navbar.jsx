import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext, socket } from '../../context/AuthContext';
import { Bell, LayoutGrid } from 'lucide-react';
import api from '../../services/api';

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const dropdownRef = useRef(null);

  // Fetch real name based on role
  useEffect(() => {
    if (!user) return;
    if (user.role === 'ADMIN') { setDisplayName('Administrator'); return; }
    if (user.role === 'MENTOR') {
      api.get('/mentor/profile')
        .then(res => setDisplayName(res.data.data?.name || 'Mentor'))
        .catch(() => setDisplayName('Mentor'));
    } else if (user.role === 'MENTEE') {
      api.get('/mentee/profile')
        .then(res => setDisplayName(res.data.data?.name || 'Mentee'))
        .catch(() => setDisplayName('Mentee'));
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'MENTEE') {
      api.get('/mentee/notifications').then(res => setNotifs(res.data.data)).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    const handleNewNotif = (notif) => setNotifs(prev => [notif, ...prev]);
    socket.on('new_notification', handleNewNotif);
    return () => socket.off('new_notification', handleNewNotif);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    if (user?.role !== 'MENTEE') return;
    try {
      await api.put(`/mentee/notifications/${id}/read`);
      setNotifs(notifs.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) { console.error(e); }
  };

  const unreadCount = notifs.filter(n => !n.isRead).length;

  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : (user?.role?.[0] || '?');

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-50 relative">
      <div className="flex items-center text-[#771313]">
        <img 
          src="/wce-logo.jpg" 
          alt="WCE Logo" 
          className="h-10 w-auto mr-4 mix-blend-multiply" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
          }}
        />
        <h1 className="text-sm font-black tracking-[0.2em] uppercase hidden md:block mt-0.5 text-[#771313]">
          Mentorship Hub
        </h1>
      </div>

      <div className="flex items-center space-x-6">
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className={`p-3 transition-all relative rounded-full hover:shadow-sm border ${
              showNotifs
                ? 'bg-[#771313] text-white border-[#771313]'
                : 'bg-transparent text-slate-500 border-transparent hover:border-[#771313]/20 hover:text-[#771313] hover:bg-red-50'
            }`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse shadow-sm shadow-red-500/50" />
            )}
          </button>

          {showNotifs && user?.role === 'MENTEE' && (
            <div className="absolute top-full mt-3 right-0 w-96 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-50">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <span className="font-black text-[#771313] text-xs uppercase tracking-widest">Notifications</span>
                <span className="bg-red-50 text-red-600 border border-red-200 text-[10px] uppercase font-black px-3 py-1 rounded-full">
                  {unreadCount} Unread
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    No notifications yet.
                  </div>
                ) : (
                  notifs.map(n => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkRead(n.id)}
                      className={`p-5 border-b border-slate-100 cursor-pointer transition-colors ${
                        n.isRead ? 'bg-white hover:bg-slate-50 opacity-70' : 'bg-red-50/10 hover:bg-red-50/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[13px] font-black uppercase tracking-wider ${n.isRead ? 'text-slate-500' : 'text-[#771313]'}`}>
                          {n.title}
                        </span>
                        {!n.isRead && <span className="w-2.5 h-2.5 rounded-full bg-[#771313] mt-1 shadow-sm shadow-[#771313]/50" />}
                      </div>
                      <p className={`text-xs leading-relaxed ${n.isRead ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                        {n.message}
                      </p>
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mt-3 block">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {showNotifs && user?.role !== 'MENTEE' && (
            <div className="absolute top-full mt-4 right-0 w-64 bg-white border border-slate-200 shadow-xl rounded-2xl z-50 p-5 text-center">
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-loose">
                Notifications are<br />available for Mentees only.
              </p>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-6 cursor-default">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#771313] to-[#4a0404] flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0 border border-white">
            {initials}
          </div>
          <div className="hidden sm:block">
            <span className="text-[10px] block font-black tracking-[0.2em] uppercase text-slate-400 mb-0.5">
              {user?.role}
            </span>
            <span className="text-sm font-bold text-slate-800 max-w-[160px] truncate block">
              {displayName || user?.role || '—'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
