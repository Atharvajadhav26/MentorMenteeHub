import React, { useEffect, useState } from 'react';
import { Card, Loader } from '../../components/common/UIComponents';
import api from '../../services/api';

const MenteeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/mentee/dashboard').then(res => {
      setStats(res.data.data);
      setLoading(false);
    }).catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Mentee Analytics Protocol</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={stats?.profileComplete ? "border-t-4 border-t-emerald-500 shadow-md" : "border-t-4 border-t-red-500 shadow-md"}>
          <h3 className="text-slate-500 text-xs uppercase tracking-wider font-bold">Profile Integrity</h3>
          <p className={`text-2xl font-extrabold mt-2 ${stats?.profileComplete ? 'text-accent' : 'text-red-500'}`}>
            {stats?.profileComplete ? 'Verified' : 'Pending Action'}
          </p>
        </Card>
        <Card className="border-t-4 border-t-blue-500 shadow-md">
          <h3 className="text-slate-500 text-xs uppercase tracking-wider font-bold">Absolute CGPA</h3>
          <p className="text-4xl font-extrabold text-slate-700 mt-2 font-mono">{stats?.latestCgpa || 'N/A'}</p>
        </Card>
        <Card className="border-t-4 border-t-amber-500 shadow-md">
          <h3 className="text-slate-500 text-xs uppercase tracking-wider font-bold">Meeting Projections</h3>
          <p className="text-4xl font-extrabold text-slate-800 mt-2 font-mono">{stats?.upcomingMeetings || 0}</p>
        </Card>
        <Card className="border-t-4 border-t-purple-500 shadow-md bg-gradient-to-br from-white to-purple-50">
          <h3 className="text-slate-500 text-xs uppercase tracking-wider font-bold text-purple-800">Unread Overrides</h3>
          <p className="text-4xl font-extrabold text-purple-600 mt-2 font-mono">{stats?.unreadNotifications || 0}</p>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-indigo-500 shadow-md">
          <h3 className="text-slate-500 text-xs uppercase tracking-wider font-bold">Assigned Batch</h3>
          <p className="text-2xl font-extrabold text-slate-700 mt-2">
            {stats?.batchName ? `Batch: ${stats.batchName}` : 'Unassigned'}
          </p>
        </Card>
        <Card className="border-t-4 border-t-teal-500 shadow-md">
          <h3 className="text-slate-500 text-xs uppercase tracking-wider font-bold">Remaining Mentorship Period</h3>
          <p className="text-2xl font-extrabold text-slate-700 mt-2">
            {stats?.endDate ? (
              new Date() > new Date(stats.endDate) 
                ? <span className="text-red-500">Expired</span> 
                : `${Math.ceil((new Date(stats.endDate) - new Date()) / (1000 * 60 * 60 * 24))} Days Remaining`
            ) : 'Not Specified'}
          </p>
          {stats?.startDate && stats?.endDate && (
            <p className="text-xs text-slate-400 mt-1">
              Active: {new Date(stats.startDate).toLocaleDateString()} - {new Date(stats.endDate).toLocaleDateString()}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};
export default MenteeDashboard;
