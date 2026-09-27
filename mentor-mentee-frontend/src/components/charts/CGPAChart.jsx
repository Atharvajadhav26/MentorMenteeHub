import React from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const CGPAChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="flex h-full items-center justify-center text-slate-400 text-sm font-bold uppercase">No data rendered</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dy={10} />
        <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} dx={-10} />
        <Tooltip cursor={{stroke: '#e2e8f0', strokeWidth: 2}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '10px 15px', fontWeight: 'bold', fontSize: '12px'}} />
        <Legend wrapperStyle={{paddingTop: '15px', fontSize: '11px', fontWeight: 'bold', color: '#64748b'}} iconType="circle" />
        <Line type="monotone" dataKey="cgpa" stroke="#771313" strokeWidth={4} dot={{r: 5, fill: '#771313', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8, strokeWidth: 0, fill: '#4a0404'}} name="CGPA Axis" animationDuration={1500} />
      </LineChart>
    </ResponsiveContainer>
  );
};
export default CGPAChart;
