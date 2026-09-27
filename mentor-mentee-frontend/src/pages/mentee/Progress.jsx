import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Input, Button, Loader } from '../../components/common/UIComponents';

const Progress = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    semester: '1', academic_year: '2023-24', cgpa: '', attendance: '', backlogs: '0',
    technicalSkills: '', communicationSkills: '', activities: '', certifications: '',
    internships: '', projects: '', selfRating: '5'
  });

  const fetchData = async () => {
    try {
      const res = await api.get('/mentee/progress');
      setRecords(res.data.data);
    } catch(err){ console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/mentee/progress', form);
      alert('Academic iteration successfully written to block vector.');
      fetchData();
      setForm({...form, semester: String(parseInt(form.semester)+1), cgpa:'', attendance:'', backlogs:'0', technicalSkills:'', communicationSkills:'', activities:'', certifications:'', internships:'', projects:''});
    } catch(err) { alert('Runtime error: Log mechanism intercepted.'); }
    finally { setSaving(false); }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-xl p-6 shadow-md text-white flex justify-between items-center">
         <div>
           <h1 className="text-2xl font-black tracking-tight text-secondary">Progress Tracker Node</h1>
           <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-1">Compile and index semester footprints</p>
         </div>
      </div>
      
      <Card className="border-t-4 border-t-accent shadow-md">
         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-2">
           <div className="col-span-full border-b border-slate-100 pb-2 mb-2"><h3 className="font-bold text-slate-800">Quantitative Metrics</h3></div>
           <Input label="Semester ID" type="number" required value={form.semester} onChange={e=>setForm({...form, semester: e.target.value})} />
           <Input label="Execution Year" required value={form.academic_year} onChange={e=>setForm({...form, academic_year: e.target.value})} />
           <Input label="Live CGPA (0.00)" type="number" step="0.01" required value={form.cgpa} onChange={e=>setForm({...form, cgpa: e.target.value})} />
           <Input label="Attendance Density (%)" type="number" step="0.1" required value={form.attendance} onChange={e=>setForm({...form, attendance: e.target.value})} />
           <Input label="Backlog Nodes" type="number" required value={form.backlogs} onChange={e=>setForm({...form, backlogs: e.target.value})} />
           <Input label="Subjective Score Base (1-10)" type="number" min="1" max="10" required value={form.selfRating} onChange={e=>setForm({...form, selfRating: e.target.value})} />
           
           <div className="col-span-full border-b border-slate-100 pb-2 mt-4 mb-2"><h3 className="font-bold text-slate-800">Qualitative Vectors Array</h3></div>
           <div className="lg:col-span-2"><Input label="Stack & Engineering Arrays" value={form.technicalSkills} onChange={e=>setForm({...form, technicalSkills: e.target.value})} required/></div>
           <div className="lg:col-span-2"><Input label="Speech/Text Routing (Comms)" value={form.communicationSkills} onChange={e=>setForm({...form, communicationSkills: e.target.value})} required/></div>
           <div className="lg:col-span-2"><Input label="Extracurricular Protocols" value={form.activities} onChange={e=>setForm({...form, activities: e.target.value})} required/></div>
           <div className="lg:col-span-2"><Input label="Licensed Authentication (Certs)" value={form.certifications} onChange={e=>setForm({...form, certifications: e.target.value})} required/></div>
           <div className="lg:col-span-2"><Input label="Operational Context (Internships)" value={form.internships} onChange={e=>setForm({...form, internships: e.target.value})} required/></div>
           <div className="lg:col-span-2"><Input label="Architectural Deployments (Projects)" value={form.projects} onChange={e=>setForm({...form, projects: e.target.value})} required/></div>
           
           <div className="col-span-full mt-4">
              <Button type="submit" isLoading={saving} className="btn-primary py-4 font-extrabold uppercase tracking-widest text-xs shadow-lg active:scale-95">Encrypt & Archive Timeline</Button>
           </div>
         </form>
      </Card>

      <Card>
        <div className="overflow-x-auto rounded-lg shadow-sm border border-slate-100">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-800 text-white border-b-2 border-accent text-xs uppercase tracking-widest font-black">
                <th className="p-4 rounded-tl-lg">Sem Matrix</th>
                <th className="p-4 text-slate-400">Year Hash</th>
                <th className="p-4 text-secondary">CGPA Logic</th>
                <th className="p-4 text-blue-400">Net Attend.</th>
                <th className="p-4 text-red-400">Anomalies</th>
                <th className="p-4 text-purple-400 rounded-tr-lg">System Score</th>
              </tr>
            </thead>
            <tbody>
               {records.map(r => (
                 <tr key={r.id} className="border-b border-slate-200 bg-white hover:bg-slate-50 transition-colors">
                   <td className="p-4 font-black text-slate-800">{r.semester}</td>
                   <td className="p-4 text-slate-500 font-medium">{r.academic_year}</td>
                   <td className="p-4 font-black text-accent text-base">{r.cgpa}</td>
                   <td className="p-4 font-bold text-slate-600">{r.attendance}%</td>
                   <td className="p-4 font-black text-red-500">{r.backlogs}</td>
                   <td className="p-4 font-mono font-bold text-slate-400 bg-slate-100/50">{r.autoScore?.toFixed(2)}</td>
                 </tr>
               ))}
               {records.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-400 font-bold bg-white">History Ledger Empty. Inject data vectors above.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default Progress;
