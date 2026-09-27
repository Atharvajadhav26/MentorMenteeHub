import React, { useEffect, useState } from 'react';
import { Card, Loader } from '../../components/common/UIComponents';
import api from '../../services/api';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#771313', '#1e293b', '#d97706', '#4a0404', '#475569'];

const MentorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/mentor/dashboard').then(res => {
      setStats(res.data.data);
      setLoading(false);
    }).catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Mentor Analytics Hub</h1>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Aggregate Trajectory Matrices</p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-t-4 border-t-emerald-500 shadow-md">
          <h3 className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Global Mentee Base</h3>
          <p className="text-4xl font-extrabold text-slate-800 mt-3 font-mono">{stats?.totalMentees || 0}</p>
        </Card>
        <Card className="border-t-4 border-t-blue-500 shadow-md">
          <h3 className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Average CGPA Metric</h3>
          <p className="text-4xl font-extrabold text-slate-700 mt-3 font-mono">{stats?.averageCgpa || 0}</p>
        </Card>
        <Card className="border-t-4 border-t-amber-500 shadow-md">
          <h3 className="text-slate-500 text-[10px] uppercase font-bold tracking-widest text-amber-700">Pending Approvals</h3>
          <p className="text-4xl font-extrabold text-amber-600 mt-3 font-mono">{stats?.pendingForms || 0}</p>
        </Card>
        <Card className="border-t-4 border-t-red-500 shadow-md">
          <h3 className="text-slate-500 text-[10px] uppercase font-bold tracking-widest text-red-700">Total Anomaly Flags</h3>
          <p className="text-4xl font-extrabold text-red-600 mt-3 font-mono">{stats?.issuesLogged || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="h-[400px] shadow-sm flex flex-col items-center border border-slate-100 bg-white p-6 relative overflow-hidden">
          <h2 className="text-[11px] uppercase tracking-widest font-black mb-6 text-slate-700 w-full text-left relative z-10">Mentee CGPA Distribution (Bar)</h2>
          <div className="w-full h-full min-h-0 relative z-10">
            {stats?.charts?.cgpaComparison?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.charts.cgpaComparison} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} dy={10} />
                  <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} dx={-10} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
                  <Bar dataKey="cgpa" fill="#771313" radius={[6, 6, 0, 0]} name="Absolute CGPA" animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-slate-400 font-bold text-[10px] uppercase tracking-widest">No active records parsed.</div>}
          </div>
        </Card>

        <Card className="h-[400px] shadow-sm flex flex-col items-center border border-slate-100 bg-white p-6">
          <h2 className="text-[11px] uppercase tracking-widest font-black mb-6 text-slate-700 w-full text-left">Behavioral Conflict Vector (Pie)</h2>
          <div className="w-full h-full min-h-0 flex items-center justify-center">
             {stats?.charts?.issueTypes?.reduce((a,b)=>a+b.value,0) > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={stats.charts.issueTypes} innerRadius={70} outerRadius={120} paddingAngle={4} dataKey="value" stroke="none">
                     {stats.charts.issueTypes.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
                   <Legend verticalAlign="bottom" height={36} wrapperStyle={{fontSize: '11px', fontWeight: 'bold', color: '#64748b'}} iconType="circle" />
                 </PieChart>
               </ResponsiveContainer>
             ) : <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No behavioral anomaly nodes detected.</div>}
          </div>
        </Card>

        <Card className="lg:col-span-2 h-[380px] shadow-sm flex flex-col items-center border border-slate-100 bg-white p-8 bg-gradient-to-tr from-white to-slate-50">
          <h2 className="text-[11px] uppercase tracking-widest font-black mb-4 text-slate-700 w-full text-left">Cohort Attendance Banding Matrix</h2>
          <div className="w-full h-full min-h-0 flex items-center justify-center">
             {stats?.charts?.attendanceDistribution?.reduce((a,b)=>a+b.value,0) > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={stats.charts.attendanceDistribution} layout="vertical" margin={{top: 0, right: 30, left: 20, bottom: 0}}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                   <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
                   <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}} />
                   <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
                   <Bar dataKey="value" fill="#1e293b" radius={[0, 6, 6, 0]} name="Headcount Volume" barSize={35} animationDuration={1500} />
                 </BarChart>
               </ResponsiveContainer>
             ) : <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">No functional attendance limits recorded.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
};
export default MentorDashboard;
