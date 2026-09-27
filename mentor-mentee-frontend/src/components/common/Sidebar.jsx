import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, LogOut, FileText, User, TrendingUp, BarChart, Calendar, MessageSquare, Bell, Trophy } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const getLinks = () => {
    switch(user?.role) {
      case 'ADMIN': return [
        { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/mentors', label: 'Manage Mentors', icon: <Users size={20} /> },
        { path: '/admin/mentees', label: 'All Students', icon: <UserPlus size={20} /> },
        { path: '/admin/meetings', label: 'Meeting Reports', icon: <Calendar size={20} /> },
        { path: '/admin/reports', label: 'Reports & Export', icon: <FileText size={20} /> },
      ];
      case 'MENTOR': return [
        { path: '/mentor', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/mentor/profile', label: 'My Profile', icon: <User size={20} /> },
        { path: '/mentor/mentees', label: 'My Mentees', icon: <Users size={20} /> },
        { path: '/mentor/add', label: 'Add Mentee', icon: <UserPlus size={20} /> },
        { path: '/mentor/guidance', label: 'Guidance / Chat', icon: <MessageSquare size={20} /> },
        { path: '/mentor/forms', label: 'Forms Workflow', icon: <FileText size={20} /> },
        { path: '/mentor/meetings', label: 'Meetings Center', icon: <Calendar size={20} /> },
        { path: '/mentor/issues', label: 'Log Issue', icon: <FileText size={20} /> },
        { path: '/mentor/achievements', label: 'Achievement Matrix', icon: <Trophy size={20} /> },
      ];
      case 'MENTEE': return [
        { path: '/mentee', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/mentee/profile', label: 'My Profile', icon: <User size={20} /> },
        { path: '/mentee/form', label: 'Mentorship Form', icon: <FileText size={20} /> },
        { path: '/mentee/progress', label: 'Update Progress', icon: <TrendingUp size={20} /> },
        { path: '/mentee/achievements', label: 'Achievements', icon: <Trophy size={20} /> },
        { path: '/mentee/report', label: 'Progress Analytics', icon: <BarChart size={20} /> },
        { path: '/mentee/meetings', label: 'Schedules', icon: <Calendar size={20} /> },
        { path: '/mentee/messages', label: 'Feedback Vector', icon: <MessageSquare size={20} /> },
        { path: '/mentee/notifications', label: 'Alerts', icon: <Bell size={20} /> },
      ];
      default: return [];
    }
  };

  const links = getLinks();

  return (
    <div className="w-64 bg-[#771313] text-white min-h-screen flex flex-col transition-all duration-300 relative overflow-hidden border-r border-[#4a0404]">
      {/* Abstract Background Pattern to match login */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="absolute h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,0 L100,100 L100,0 Z" fill="#ffffff" />
          <path d="M0,100 L100,0 L100,100 Z" fill="#4a0404" />
        </svg>
      </div>

      <div className="p-6 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-white p-1 rounded inline-block shadow-sm">
            <img 
              src="/wce-logo.jpg" 
              alt="WCE Logo" 
              className="h-8 w-auto mix-blend-multiply" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h2 className="text-xl font-black tracking-tight text-white leading-tight">WCE Sangli</h2>
        </div>
        <p className="text-[10px] text-white/70 uppercase tracking-widest font-bold mt-2">{user?.role} Portal</p>
      </div>
      
      <nav className="flex-1 py-4 relative z-10 overflow-y-auto wce-scrollbar">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.path}>
              <NavLink 
                to={link.path}
                end
                className={({isActive}) => 
                  `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive ? 'bg-white text-[#771313] border-l-4 border-[#4a0404] shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-white/10 relative z-10">
        <button 
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
