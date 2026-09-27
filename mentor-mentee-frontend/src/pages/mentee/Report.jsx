import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Loader } from '../../components/common/UIComponents';
import CGPAChart from '../../components/charts/CGPAChart';
import AttendanceChart from '../../components/charts/AttendanceChart';
import SkillsChart from '../../components/charts/SkillsChart';
import { Layers } from 'lucide-react';

const Report = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState('All');

  useEffect(() => {
    api.get('/mentee/progress/report').then(res => {
      setData(res.data.data);
      setLoading(false);
    }).catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return <Loader />;

  const filteredData = filterYear === 'All' ? data : data.filter(d => d.academic_year === filterYear);
  const years = [...new Set(data.map(d => d.academic_year))];

  // Performance Score calculation based on LATEST aggregate
  const latest = filteredData[filteredData.length - 1];
  let perfScore = 0; let colorClass = 'text-slate-500'; let label = 'N/A';
  let radarData = [];
  
  if (latest) {
    perfScore = ((latest.cgpa * 4) + (latest.attendance * 0.3) + (latest.selfRating * 3)).toFixed(1);
    
    if (perfScore >= 80) { colorClass = 'text-accent border-accent'; label = 'Excellent Cohort'; }
    else if (perfScore >= 60) { colorClass = 'text-amber-500 border-amber-500'; label = 'Average Bounds'; }
    else { colorClass = 'text-red-500 border-red-500'; label = 'Deficient Trajectory'; }

    const techScore = Math.min(100, (latest.technicalSkills.length * 2) + (latest.selfRating * 5));
    const commScore = Math.min(100, (latest.communicationSkills.length * 2) + (latest.selfRating * 5));
    const projScore = Math.min(100, (latest.projects.length * 3) + 40);
    const actScore = Math.min(100, (latest.activities.length * 2) + 30);
    
    radarData = [
      { subject: 'TECH COMMITS', A: techScore },
      { subject: 'ORAL COMMS', A: commScore },
      { subject: 'PROJECT DEPLOYS', A: projScore },
      { subject: 'EXTRACURRICULARS', A: actScore },
      { subject: 'CORE CGPA', A: latest.cgpa * 10 }
    ];
  }

  const chartPoints = filteredData.map(d => ({
    name: `Sem ${d.semester}`,
    cgpa: d.cgpa,
    attendance: d.attendance,
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center">
          <Layers className="w-8 h-8 text-accent mr-4 opacity-80" />
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Analytics Dashboard</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Holistic Academic Trajectory Overlays</p>
          </div>
        </div>
        <select value={filterYear} onChange={e=>setFilterYear(e.target.value)} className="mt-4 sm:mt-0 bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700 rounded-xl px-5 py-3 shadow-inner focus:ring-2 focus:ring-accent outline-none appearance-none transition-all hover:bg-slate-100 cursor-pointer text-center">
          <option value="All">All Matrix Bounds</option>
          {years.map(y => <option key={y} value={y}>Bound: {y}</option>)}
        </select>
      </div>

      {latest && (
        <Card className={`flex flex-col md:flex-row items-center justify-between border-l-[6px] shadow-md bg-white p-8 ${colorClass}`}>
           <div className="text-center md:text-left mb-6 md:mb-0">
             <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Calculated Performance Density</h2>
             <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 font-mono">Algorithm: [CGPA × 0.4] + [Attendance × 0.3] + [Skills × 0.3]</p>
           </div>
           <div className="flex items-center gap-4 border-l pl-6 border-slate-100">
             <div className="text-right">
               <span className={`block text-5xl font-black font-mono tracking-tighter ${colorClass.split(' ')[0]}`}>{perfScore}%</span>
               <span className={`block text-[10px] sm:text-xs mt-2 font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-slate-50 shadow-sm border border-slate-100 ${colorClass.split(' ')[0]}`}>{label}</span>
             </div>
           </div>
        </Card>
      )}

      {chartPoints.length === 0 ? (
        <Card className="text-center py-24 bg-white border border-dashed border-slate-300 rounded-3xl"><p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No analytics parameters resolved under active filters.</p></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="h-[380px] shadow-sm flex flex-col items-center bg-white border border-slate-100 p-6 relative overflow-hidden">
            <h2 className="text-[11px] uppercase tracking-widest font-black mb-6 text-slate-700 w-full text-left relative z-10">CGPA Temporal Trajectory (Line)</h2>
            <div className="w-full h-full min-h-0 relative z-10"><CGPAChart data={chartPoints} /></div>
          </Card>
          
          <Card className="h-[380px] shadow-sm flex flex-col items-center bg-white border border-slate-100 p-6">
            <h2 className="text-[11px] uppercase tracking-widest font-black mb-6 text-slate-700 w-full text-left">Attendance Heat/Drop Matrix (Bar)</h2>
            <div className="w-full h-full min-h-0"><AttendanceChart data={chartPoints} /></div>
          </Card>
          
          <Card className="lg:col-span-2 h-[500px] shadow-md flex flex-col items-center border-t-4 border-t-purple-500 bg-gradient-to-tr from-white to-purple-50/50 p-8">
            <h2 className="text-xs uppercase tracking-[0.2em] font-black mb-4 text-purple-900 w-full text-center">Cognitive & Operational Skill Radar</h2>
            <div className="w-full h-full min-h-0"><SkillsChart data={radarData} /></div>
            <p className="text-[9px] text-purple-400/80 uppercase font-bold tracking-widest mt-2">Vector rendering heavily relies on subjective and text-length parsing heuristics derived from raw block text.</p>
          </Card>
        </div>
      )}
    </div>
  );
};
export default Report;
