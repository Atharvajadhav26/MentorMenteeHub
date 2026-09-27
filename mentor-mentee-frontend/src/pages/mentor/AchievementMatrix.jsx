import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Loader } from '../../components/common/UIComponents';
import { Trophy, Zap, Briefcase, Code, Award, ChevronDown, ChevronUp, ExternalLink, FileCheck, BarChart2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Input, Button } from '../../components/common/UIComponents';

const TYPE_META = {
  HACKATHON:   { label: 'Hackathon',   icon: Zap,       color: 'text-purple-600 bg-purple-100' },
  INTERNSHIP:  { label: 'Internship',  icon: Briefcase,  color: 'text-slate-700 bg-slate-100' },
  PROJECT:     { label: 'Project',     icon: Code,       color: 'text-accent bg-red-100' },
  COMPETITION: { label: 'Competition', icon: Award,      color: 'text-amber-600 bg-amber-100' },
};

const AchievementMatrix = () => {
  const [matrix, setMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [filter, setFilter] = useState('ALL');
  const [batchFilter, setBatchFilter] = useState('ALL');
  const [batches, setBatches] = useState([]);
  
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  const fetchData = async () => {
    try {
      const [matrixRes, profileRes] = await Promise.all([
        api.get('/mentor/achievements/matrix'),
        api.get('/mentor/profile')
      ]);
      setMatrix(matrixRes.data.data);
      setBatches(profileRes.data.data.batches || []);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleRow = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  let filteredMatrix = filter === 'ALL'
    ? matrix
    : matrix.filter(m => m.byType[filter] > 0);
  
  if (batchFilter !== 'ALL') {
    filteredMatrix = filteredMatrix.filter(m => m.batchName === batchFilter);
  }

  const handleExportMatrix = () => {
    const rows = [];
    filteredMatrix.forEach(m => {
      if (m.achievements.length === 0) {
        rows.push({ PRN: m.prn, Name: m.name, Batch: m.batchName, AcademicYear: m.academic_year, Type: '–', Title: 'No achievements', Description: '', Link: '', CertificateURL: '' });
      } else {
        m.achievements.forEach(a => {
          rows.push({
            PRN: m.prn, Name: m.name, Batch: m.batchName, AcademicYear: m.academic_year,
            Type: a.type, Title: a.title, Description: a.description,
            Link: a.link || '', CertificateURL: a.certificate_url || ''
          });
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, batchFilter !== 'ALL' ? `Batch_${batchFilter}` : 'Achievement Matrix');
    XLSX.writeFile(wb, batchFilter !== 'ALL' ? `Achievement_Matrix_Batch_${batchFilter}.xlsx` : 'Achievement_Comparison_Matrix.xlsx');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      await api.put(`/mentor/achievements/${editingAchievement.id}`, editingAchievement);
      setEditingAchievement(null);
      fetchData();
    } catch(err) {
      alert('Failed to update achievement data');
    } finally { setSavingEdit(false); }
  };

  if (loading) return <Loader />;

  const totalAchievements = matrix.reduce((s, m) => s + m.totalAchievements, 0);
  const typeTotals = Object.keys(TYPE_META).reduce((acc, t) => {
    acc[t] = matrix.reduce((s, m) => s + (m.byType[t] || 0), 0);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-amber-400 flex items-center gap-2">
              <Trophy className="w-6 h-6" /> Comparative Achievement Matrix
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-1">
              Side-by-side view of all mentees' achievements
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="flex items-center gap-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-black px-4 py-3 rounded-xl text-xs uppercase tracking-widest transition-all"
            >
              <BarChart2 className="w-4 h-4" /> {showCharts ? 'Hide Graphs' : 'View Graphs'}
            </button>
            <button
              id="export-achievement-matrix"
              onClick={handleExportMatrix}
              className="flex items-center gap-2 bg-accent hover:bg-accent text-white font-black px-4 py-3 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg"
            >
              <FileCheck className="w-4 h-4" /> Export Matrix
            </button>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Logged</p>
            <p className="text-3xl font-extrabold font-mono text-white mt-1">{totalAchievements}</p>
          </div>
          {Object.entries(TYPE_META).map(([type, meta]) => {
            const Icon = meta.icon;
            return (
              <div key={type} className="bg-white/10 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Icon className="w-3 h-3 text-slate-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{meta.label}</p>
                </div>
                <p className="text-3xl font-extrabold font-mono text-white">{typeTotals[type]}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {['ALL', ...Object.keys(TYPE_META)].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              id={`filter-${f.toLowerCase()}`}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                filter === f
                  ? 'bg-slate-800 text-white border-slate-700 shadow'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
              }`}
            >
              {f === 'ALL' ? `All Mentees (${matrix.length})` : `${TYPE_META[f].label}s (${typeTotals[f]})`}
            </button>
          ))}
        </div>
        <div>
          <select 
            value={batchFilter} 
            onChange={(e) => setBatchFilter(e.target.value)}
            className="border-2 border-slate-200 rounded-xl px-4 py-2 outline-none text-xs font-bold uppercase tracking-widest text-slate-600 bg-white"
          >
            <option value="ALL">All Batches</option>
            {batches.map(b => (
              <option key={b} value={b}>Batch: {b}</option>
            ))}
          </select>
        </div>
      </div>

      {showCharts && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col w-full h-[450px]">
           <h2 className="text-[11px] uppercase tracking-widest font-black mb-6 text-slate-700 w-full text-left">Cohort Achievement Distribution</h2>
           {filteredMatrix.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={filteredMatrix} margin={{top: 20, right: 30, left: 20, bottom: 50}}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} angle={-45} textAnchor="end" />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
                 <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
                 <Legend verticalAlign="top" wrapperStyle={{fontSize: '10px', fontWeight: 'bold', paddingBottom: '20px'}} />
                 <Bar dataKey="byType.HACKATHON" stackId="a" fill="#771313" name="Hackathons" radius={[0,0,0,0]} />
                 <Bar dataKey="byType.INTERNSHIP" stackId="a" fill="#1e293b" name="Internships" radius={[0,0,0,0]} />
                 <Bar dataKey="byType.PROJECT" stackId="a" fill="#4a0404" name="Projects" radius={[0,0,0,0]} />
                 <Bar dataKey="byType.COMPETITION" stackId="a" fill="#d97706" name="Competitions" radius={[4,4,0,0]} />
               </BarChart>
             </ResponsiveContainer>
           ) : <p className="text-center font-bold text-slate-400 mt-20 text-xs">No metrics for active filter.</p>}
        </div>
      )}

      {/* Comparative Table */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-800 text-white text-[10px] uppercase tracking-widest font-black">
                <th className="p-4">Mentee</th>
                <th className="p-4">PRN</th>
                <th className="p-4">Batch</th>
                <th className="p-4 text-center text-purple-300">Hackathons</th>
                <th className="p-4 text-center text-blue-300">Internships</th>
                <th className="p-4 text-center text-emerald-300">Projects</th>
                <th className="p-4 text-center text-amber-300">Competitions</th>
                <th className="p-4 text-center">Total</th>
                <th className="p-4 text-center">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatrix.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-slate-400 font-bold text-sm">
                    No mentees found for the selected filter.
                  </td>
                </tr>
              )}
              {filteredMatrix.map((m, idx) => (
                <React.Fragment key={m.id}>
                  <tr
                    className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-slate-50/30 transition-colors`}
                  >
                    <td className="p-4 font-black text-slate-800">{m.name}</td>
                    <td className="p-4 text-slate-500 font-mono text-xs">{m.prn}</td>
                    <td className="p-4 text-slate-600 font-bold text-xs">{m.batchName}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm ${m.byType.HACKATHON > 0 ? 'text-purple-700 bg-purple-100' : 'text-slate-300 bg-slate-50'}`}>
                        {m.byType.HACKATHON}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm ${m.byType.INTERNSHIP > 0 ? 'text-blue-700 bg-slate-100' : 'text-slate-300 bg-slate-50'}`}>
                        {m.byType.INTERNSHIP}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm ${m.byType.PROJECT > 0 ? 'text-accent-dark bg-red-100' : 'text-slate-300 bg-slate-50'}`}>
                        {m.byType.PROJECT}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm ${m.byType.COMPETITION > 0 ? 'text-amber-700 bg-amber-100' : 'text-slate-300 bg-slate-50'}`}>
                        {m.byType.COMPETITION}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full font-black text-sm ${m.totalAchievements > 0 ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {m.totalAchievements}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleRow(m.id)}
                        id={`expand-${m.id}`}
                        className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
                        title="Show achievement details"
                      >
                        {expanded[m.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Achievement Detail Row */}
                  {expanded[m.id] && (
                    <tr className="bg-slate-50 border-b-2 border-slate-200">
                      <td colSpan={8} className="px-6 py-4">
                        {m.achievements.length === 0 ? (
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest text-center py-2">
                            No achievements logged by {m.name} yet.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {m.achievements.map(a => {
                              const meta = TYPE_META[a.type];
                              const Icon = meta.icon;
                              return (
                                <div key={a.id} className={`p-3 rounded-xl border text-sm ${meta.color} border-opacity-30 relative group`}>
                                  
                                  {editingAchievement?.id === a.id ? (
                                    <form onSubmit={handleEditSubmit} className="space-y-3 bg-white p-3 rounded-lg border shadow-sm absolute inset-0 z-10 overflow-y-auto">
                                      <h4 className="text-[10px] font-black uppercase text-slate-500 mb-2 border-b pb-2">Edit Achievement</h4>
                                      <Input label="Title" required value={editingAchievement.title} onChange={e=>setEditingAchievement({...editingAchievement, title:e.target.value})} />
                                      <select className="input-field mb-4 w-full" value={editingAchievement.type} onChange={e=>setEditingAchievement({...editingAchievement, type:e.target.value})}>
                                        <option value="HACKATHON">Hackathon</option>
                                        <option value="INTERNSHIP">Internship</option>
                                        <option value="PROJECT">Project</option>
                                        <option value="COMPETITION">Competition</option>
                                      </select>
                                      <Input label="Description" value={editingAchievement.description} onChange={e=>setEditingAchievement({...editingAchievement, description:e.target.value})} />
                                      <Input label="Link" value={editingAchievement.link || ''} onChange={e=>setEditingAchievement({...editingAchievement, link:e.target.value})} />
                                      <Input label="Academic Year" required value={editingAchievement.academic_year} onChange={e=>setEditingAchievement({...editingAchievement, academic_year:e.target.value})} />
                                      <div className="flex gap-2">
                                        <Button type="submit" isLoading={savingEdit} className="bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-bold w-auto">Save</Button>
                                        <button type="button" onClick={() => setEditingAchievement(null)} className="px-3 py-1.5 border rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                                      </div>
                                    </form>
                                  ) : (
                                    <>
                                      <button onClick={() => setEditingAchievement(a)} className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-accent bg-white border shadow-sm rounded-md transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                      </button>
                                      
                                      <div className="flex items-center gap-2 mb-1">
                                        <Icon className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-black uppercase text-opacity-70">{meta.label}</span>
                                      </div>
                                      <p className="font-black text-slate-800 text-sm pr-6">{a.title}</p>
                                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{a.description}</p>
                                      <div className="flex gap-3 mt-2">
                                        {a.link && (
                                          <a href={a.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-slate-700 font-bold hover:underline">
                                            <ExternalLink className="w-3 h-3" /> Link
                                          </a>
                                        )}
                                        {a.certificate_url && (
                                          <a href={a.certificate_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-accent font-bold hover:underline">
                                            <FileCheck className="w-3 h-3" /> Certificate
                                          </a>
                                        )}
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AchievementMatrix;
