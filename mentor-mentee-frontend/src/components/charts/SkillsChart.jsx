import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';

const SkillsChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="flex h-full items-center justify-center text-slate-400 text-sm font-bold uppercase">No target attributes mapped</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
        <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3"/>
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: '900', letterSpacing: '1px' }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar name="Mentee Profile Attributes" dataKey="A" stroke="#d97706" strokeWidth={3} fill="#d97706" fillOpacity={0.4} animationDuration={2000} />
        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
      </RadarChart>
    </ResponsiveContainer>
  );
};
export default SkillsChart;
