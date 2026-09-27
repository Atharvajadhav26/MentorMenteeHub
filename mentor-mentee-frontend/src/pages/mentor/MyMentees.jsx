import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, Loader, Input, Button } from '../../components/common/UIComponents';
import { Users, Filter, Plus, Trash2 } from 'lucide-react';


const MyMentees = () => {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [newBatch, setNewBatch] = useState('');

  const fetchData = async () => {
    try {
      const [menteesRes, profileRes] = await Promise.all([
        api.get('/mentor/mentees'),
        api.get('/mentor/profile')
      ]);
      setMentees(menteesRes.data.data);
      setBatches(profileRes.data.data.batches || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBatch = async () => {
    if (!newBatch) return;
    const updated = [...batches, newBatch];
    try {
      await api.put('/mentor/batches', { batches: updated });
      setBatches(updated);
      setNewBatch('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBatch = async (batchToDelete) => {
    const updated = batches.filter(b => b !== batchToDelete);
    try {
      await api.put('/mentor/batches', { batches: updated });
      setBatches(updated);
      if (selectedBatch === batchToDelete) setSelectedBatch('');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMentees = selectedBatch ? mentees.filter(m => m.batchName === selectedBatch) : mentees;


  if (loading) return <Loader />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
        <Users className="mr-3 text-accent" /> Assigned Mentees
      </h1>

      {/* Batch Control Section */}
      <Card className="mb-6 bg-slate-50 border-dashed border-2 border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h3 className="font-bold text-slate-700 text-lg">Batch Control</h3>
            <p className="text-sm text-slate-500 mb-4 md:mb-0">Create and manage your mentorship batches (e.g., A1, B2).</p>
          </div>
          <div className="flex space-x-2">
            <Input 
              placeholder="E.g. A1" 
              value={newBatch} 
              onChange={(e) => setNewBatch(e.target.value)} 
              className="mt-0 w-32"
            />
            <Button onClick={handleCreateBatch} className="btn-primary py-2 px-4 shadow-sm h-[42px]">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </div>
        {batches.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {batches.map(b => (
              <div key={b} className="flex items-center bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm text-sm font-semibold text-slate-700">
                <span className="mr-2">{b}</span>
                <button onClick={() => handleDeleteBatch(b)} className="text-red-500 hover:text-red-700 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <div className="flex items-center text-sm font-semibold text-slate-600">
            <Filter className="w-4 h-4 mr-2" /> Filter Mentees
          </div>
          <select 
            value={selectedBatch} 
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 focus:border-accent focus:ring focus:ring-accent-light outline-none text-sm bg-white"
          >
            <option value="">View All Batches</option>
            {batches.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600">
                <th className="p-4 font-semibold text-left">PRN</th>
                <th className="p-4 font-semibold text-left">Mentee Name</th>
                <th className="p-4 font-semibold text-left">Batch</th>
                <th className="p-4 font-semibold text-left">Academic Year</th>
                <th className="p-4 font-semibold text-center">Mentorship Form Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMentees.length > 0 ? (
                filteredMentees.map((m) => (
                  <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{m.prn}</td>
                    <td className="p-4 font-medium text-slate-700">{m.name}</td>
                    <td className="p-4 font-bold text-slate-600 text-xs">{m.batchName || 'Unassigned'}</td>
                    <td className="p-4 text-slate-600">{m.academic_year}</td>
                    <td className="p-4 text-center">
                      {m.mentorshipForm ? (
                        <span className={`px-3 py-1 text-xs rounded-full font-bold shadow-sm ${m.mentorshipForm.status === 'APPROVED'
                            ? 'bg-red-100 text-red-900'
                            : 'bg-amber-100 text-amber-800'
                          }`}>
                          {m.mentorshipForm.status}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic font-medium px-3 py-1 bg-slate-100 rounded-full text-xs">
                          Uninitialized
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {/* FIXED: Uses m.id for valid UUID navigation */}
                      <Link
                        to={`/mentor/mentees/${m.id}`}
                        className="text-xs font-bold bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark shadow-sm transition-all focus:ring-2 focus:ring-accent"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500 font-medium">
                    <div className="flex flex-col items-center">
                      <Users className="w-12 h-12 text-slate-200 mb-3" />
                      <p>You do not have any mentees dynamically assigned to your profile yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default MyMentees;