import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, Input, Button } from '../../components/common/UIComponents';
import { UserPlus } from 'lucide-react';

const AddMentee = () => {
  const [form, setForm] = useState({ prn: '', name: '', academic_year: '2023-24', batchName: '', startDate: '', endDate: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    api.get('/mentor/profile').then(res => {
      setBatches(res.data.data.batches || []);
    }).catch(err => console.error("Failed to fetch batches:", err));
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      const res = await api.post('/mentor/mentees', form);
      setMessage({ type: 'success', text: res.data.message });
      setForm({ prn: '', name: '', academic_year: '2023-24', batchName: '', startDate: '', endDate: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add mentee' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center"><UserPlus className="mr-3 text-accent" /> Add New Mentee</h1>
      <Card>
        {message && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-bold ${message.type === 'success' ? 'bg-red-100 text-red-900' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Mentee PRN Number" required value={form.prn} onChange={e => setForm({...form, prn: e.target.value})} placeholder="E.g., 2023BTEIT001" />
          <Input label="Full Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" />
          <Input label="Academic Year" required value={form.academic_year} onChange={e => setForm({...form, academic_year: e.target.value})} />
          
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-700">Batch Assignment</label>
            <select
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 focus:border-accent focus:ring focus:ring-accent-light outline-none transition-all text-sm bg-white"
              value={form.batchName}
              onChange={e => setForm({ ...form, batchName: e.target.value })}
            >
              <option value="">-- No Batch --</option>
              {batches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className="flex space-x-4">
            <div className="w-1/2">
              <Input label="Mentorship Start Date" type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
            </div>
            <div className="w-1/2">
              <Input label="Mentorship End Date" type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
            </div>
          </div>
          
          <div className="pt-4">
            <Button type="submit" isLoading={isLoading} className="btn-primary w-full shadow-sm text-base py-3">Register Mentee Account</Button>
            <p className="text-xs text-slate-500 mt-4 text-center">The Mentee will authenticate using their PRN as both the username and strictly initial password.</p>
          </div>
        </form>
      </Card>
    </div>
  );
};
export default AddMentee;
