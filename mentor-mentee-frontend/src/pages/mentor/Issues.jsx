import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Input, Button, Loader } from '../../components/common/UIComponents';
import { AlertCircle } from 'lucide-react';

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ menteeId: '', date: '', issueType: 'ACADEMIC', description: '', actionTaken: '', academic_year: '2023-24' });

  const fetchData = async () => {
    try {
      const [iss, men] = await Promise.all([api.get('/mentor/issues'), api.get('/mentor/mentees')]);
      setIssues(iss.data.data);
      setMentees(men.data.data);
    } catch(err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleLog = async (e) => {
    e.preventDefault();
    if(!form.menteeId) return alert('Select a student binding');
    try {
      await api.post('/mentor/issues', form);
      alert('Issue tracked systematically.');
      setForm({ menteeId: '', date: '', issueType: 'ACADEMIC', description: '', actionTaken: '', academic_year: '2023-24' });
      fetchData();
    } catch(err) { alert('Failed to mount issue onto state ledger.'); }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center"><AlertCircle className="text-red-500 mr-3" /> Student Alert Ledger</h1>
      
      <Card className="border-l-4 border-l-red-500 shadow-md bg-gradient-to-tr from-white to-red-50">
        <h2 className="text-lg font-bold mb-4 border-b border-red-100 pb-2 text-red-900">Escalate Behavioral/Academic Trace</h2>
        <form onSubmit={handleLog} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Target Account</label>
            <select className="input-field shadow-sm bg-white" value={form.menteeId} onChange={e => setForm({...form, menteeId: e.target.value})} required>
              <option value="">-- Bind to Student Matrix --</option>
              {mentees.map(m => <option key={m.id} value={m.id}>[PRN: {m.prn}] {m.name}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">Severity Type</label>
            <select className="input-field shadow-sm bg-white" value={form.issueType} onChange={e => setForm({...form, issueType: e.target.value})} required>
              <option value="ACADEMIC">Academic Regression</option>
              <option value="PERSONAL">Personal / Psychological Conflict</option>
            </select>
          </div>
          <Input label="Timestamp Logged" type="datetime-local" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          <Input label="Immediate Action Taken" required value={form.actionTaken} onChange={e => setForm({...form, actionTaken: e.target.value})} />
          <div className="md:col-span-2">
            <Input label="Comprehensive Description Array" required value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="md:col-span-2 mt-2">
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white w-full py-3 rounded-xl shadow-lg shadow-red-600/30 transition-all font-bold tracking-wider active:scale-[0.98]">Dispatch Alert Trace</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-bold mb-4 text-slate-800">Global Escalation Flow</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="p-3">Reference Account</th>
                <th className="p-3">Vector Type</th>
                <th className="p-3">Description</th>
                <th className="p-3">Action Resolution</th>
                <th className="p-3 text-right font-mono">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {issues.map(i => (
                <tr key={i.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-semibold text-slate-700">{i.mentee?.name || 'Unknown Node'}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest shadow-sm ${i.issueType === 'ACADEMIC' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>{i.issueType}</span></td>
                  <td className="p-3 max-w-[200px] truncate text-slate-600" title={i.description}>{i.description}</td>
                  <td className="p-3 text-slate-600">{i.actionTaken}</td>
                  <td className="p-3 text-right text-xs text-slate-400 font-mono">{new Date(i.date).toLocaleDateString()}</td>
                </tr>
              ))}
              {issues.length === 0 && (
                 <tr><td colSpan="5" className="p-6 text-center text-slate-400 font-medium">No behavioral anomalies found in current index trace.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default Issues;
