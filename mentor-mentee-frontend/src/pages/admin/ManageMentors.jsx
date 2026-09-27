import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Input, Button, Loader } from '../../components/common/UIComponents';

const ManageMentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', department: '', password: '' });

  const fetchMentors = async () => {
    try {
      const res = await api.get('/admin/mentors');
      setMentors(res.data.data);
    } catch(err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchMentors(); }, []);

  const handleAddMentor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/mentors', form);
      setForm({ name: '', email: '', department: '', password: '' });
      fetchMentors();
    } catch (err) { alert(err.response?.data?.message || 'Failed to add mentor'); }
  };

  const handleDeactivate = async (id) => {
    if (confirm('Deactivate this mentor account?')) {
      try {
        await api.delete(`/admin/mentors/${id}`);
        fetchMentors();
      } catch(err) { alert('Failed to deactivate'); }
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Manage Mentors</h1>
      
      <Card className="mb-6">
        <h2 className="text-lg font-bold mb-4 border-b pb-2">Add New Mentor</h2>
        <form onSubmit={handleAddMentor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <Input label="Email (Username)" type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <Input label="Department" required value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
          <Input label="Initial Password" type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <div className="md:col-span-2 pt-2">
            <Button type="submit">Add Mentor to System</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-bold mb-4 border-b pb-2">Existing Mentors</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-sm text-slate-600">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Department</th>
                <th className="p-3 font-medium text-center">Status</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {mentors.map(m => (
                <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-medium text-slate-800">{m.name}</td>
                  <td className="p-3 text-slate-600">{m.email}</td>
                  <td className="p-3 text-slate-600">{m.department}</td>
                  <td className="p-3 text-center">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${m.user?.isActive ? 'bg-red-100 text-red-900' : 'bg-red-100 text-red-800'}`}>
                      {m.user?.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => handleDeactivate(m.id)} 
                      disabled={!m.user?.isActive} 
                      className="text-red-500 hover:text-red-700 hover:underline disabled:opacity-50 disabled:no-underline font-medium"
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
              {mentors.length === 0 && (
                <tr><td colSpan="5" className="p-6 text-center text-slate-500">No mentors configured yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default ManageMentors;
