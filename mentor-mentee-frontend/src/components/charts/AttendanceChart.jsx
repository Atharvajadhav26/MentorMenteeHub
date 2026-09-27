import React from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const AttendanceChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="flex h-full items-center justify-center text-slate-400 text-sm font-bold uppercase">No data rendered</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barSize={35} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dy={10} />
        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dx={-10} />
        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '10px 15px', fontWeight: 'bold', fontSize: '12px'}} />
        <Legend wrapperStyle={{paddingTop: '15px', fontSize: '11px', fontWeight: 'bold', color: '#64748b'}} iconType="circle" />
        <Bar dataKey="attendance" fill="#1e293b" radius={[6, 6, 0, 0]} name="Attendance %" animationDuration={1500} />
      </BarChart>
    </ResponsiveContainer>
  );
};
export default AttendanceChart;
