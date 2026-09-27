import React, { useEffect, useState } from 'react';
import { Card, Loader } from '../../components/common/UIComponents';
import api from '../../services/api';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#771313', '#1e293b', '#d97706', '#4a0404', '#475569'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(res => {
      setStats(res.data.data);
      setLoading(false);
    }).catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Core Oversight</h1>
          <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 mt-1">High-Level Institutional Analytics Extracted Live</p>
        </div>
        <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm text-xs font-bold text-slate-500 tracking-widest uppercase">
           All Time Matrix
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-t-4 border-t-purple-500 shadow-md">
          <h3 className="text-purple-800 text-[10px] uppercase font-black tracking-widest mb-1">Global Mentors Auth</h3>
          <p className="text-4xl font-extrabold text-slate-800 font-mono">{stats?.totalMentors || 0}</p>
        </Card>
        <Card className="border-t-4 border-t-blue-500 shadow-md">
          <h3 className="text-slate-800 text-[10px] uppercase font-black tracking-widest mb-1">Total Active Students</h3>
          <p className="text-4xl font-extrabold text-slate-800 font-mono">{stats?.totalMentees || 0}</p>
        </Card>
        <Card className="border-t-4 border-t-emerald-500 shadow-md">
          <h3 className="text-red-900 text-[10px] uppercase font-black tracking-widest mb-1">Registered Meetings</h3>
          <p className="text-4xl font-extrabold text-slate-800 font-mono">{stats?.totalMeetings || 0}</p>
        </Card>
        <Card className="border-t-4 border-t-red-500 shadow-md bg-gradient-to-tr from-white to-red-50/50">
          <h3 className="text-red-800 text-[10px] uppercase font-black tracking-widest mb-1">Escalated Anomalies</h3>
          <p className="text-4xl font-extrabold text-red-600 font-mono">{stats?.totalIssues || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        
        <Card className="h-[420px] shadow-sm flex flex-col items-center border border-slate-100 bg-white p-8">
          <h2 className="text-[11px] uppercase tracking-widest font-black mb-8 text-slate-700 w-full text-left">Student Volume by Academic Origin</h2>
          <div className="w-full h-full min-h-0">
             {stats?.charts?.studentsByYear?.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={stats.charts.studentsByYear} barSize={50}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}} dx={-10} />
                   <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
                   <Legend wrapperStyle={{paddingTop: '20px', fontSize: '11px', fontWeight: 'bold'}} iconType="circle" />
                   <Bar dataKey="value" fill="#771313" radius={[6, 6, 0, 0]} name="Headcount Density" animationDuration={1500} />
                 </BarChart>
               </ResponsiveContainer>
             ) : <div className="flex h-full items-center justify-center text-slate-400 font-bold text-[10px] uppercase tracking-widest">No active mapping identified</div>}
          </div>
        </Card>

        <Card className="h-[420px] shadow-sm flex flex-col items-center border border-slate-100 bg-white p-8">
          <h2 className="text-[11px] uppercase tracking-widest font-black mb-4 text-slate-700 w-full text-left">Departmental Mentor Allocation</h2>
          <div className="w-full h-full min-h-0 flex items-center justify-center">
             {stats?.charts?.deptDistribution?.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={stats.charts.deptDistribution} innerRadius={80} outerRadius={130} paddingAngle={4} dataKey="value" stroke="none" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                     {stats.charts.deptDistribution.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
                 </PieChart>
               </ResponsiveContainer>
             ) : <div className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Unstructured Data</div>}
          </div>
        </Card>

        <Card className="lg:col-span-2 h-[480px] shadow-md flex flex-col items-center border border-slate-100 bg-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-bl-full pointer-events-none opacity-50"></div>
          <h2 className="text-[11px] uppercase tracking-widest font-black mb-8 text-slate-700 w-full text-left relative z-10">Temporal Issue Vectors (Academic vs Personal)</h2>
          <div className="w-full h-full min-h-0 relative z-10">
            {stats?.charts?.issueTrends?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.charts.issueTrends} margin={{top: 10, right: 30, left: 0, bottom: 0}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 'bold'}} dx={-10} />
                  <Tooltip cursor={{stroke: '#e2e8f0', strokeWidth: 2}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
                  <Legend wrapperStyle={{paddingTop: '20px', fontSize: '11px', fontWeight: 'bold'}} iconType="circle" />
                  <Line type="monotone" dataKey="academic" stroke="#771313" strokeWidth={4} dot={{r: 6, strokeWidth: 2}} activeDot={{r: 8}} name="Academic Escalations" animationDuration={2000} />
                  <Line type="monotone" dataKey="personal" stroke="#1e293b" strokeWidth={4} dot={{r: 6, strokeWidth: 2}} activeDot={{r: 8}} name="Personal Anomalies" animationDuration={2000} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center text-slate-400 font-bold text-[10px] uppercase tracking-widest">Matrix stable. No temporal disruptions plotted.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
};
export default AdminDashboard;
