import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Input, Loader } from '../../components/common/UIComponents';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const StudentsList = () => {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchMentees = async (prnQuery = '') => {
    try {
      const res = await api.get(`/admin/mentees${prnQuery ? `?prn=${prnQuery}` : ''}`);
      setMentees(res.data.data);
    } catch(err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchMentees(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMentees(search);
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Student Directory</h1>
      
      <Card className="mb-6 p-4">
        <form onSubmit={handleSearch} className="flex gap-4 items-end">
          <div className="flex-1">
            <Input 
              label="Search by PRN" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="E.g., 2023BTEIT001" 
            />
          </div>
          <div className="mb-4">
            <button type="submit" className="bg-slate-800 text-white px-5 py-2.5 rounded-lg hover:bg-slate-700 flex items-center shadow-sm transition-colors">
              <Search className="w-4 h-4 mr-2" /> Search
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-sm text-slate-600">
                <th className="p-3 font-medium">PRN</th>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Academic Year</th>
                <th className="p-3 font-medium">Assigned Mentor</th>
                <th className="p-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {mentees.map(m => (
                <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-800">{m.prn}</td>
                  <td className="p-3 font-medium text-slate-700">{m.name}</td>
                  <td className="p-3 text-slate-600">{m.academic_year}</td>
                  <td className="p-3 text-slate-600">
                    <span className={m.mentor ? "text-slate-800" : "text-amber-600 italic"}>
                      {m.mentor ? m.mentor.name : 'Unassigned'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link to={`/admin/mentees/${m.id}`} className="text-accent bg-accent/10 hover:bg-accent/20 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">
                      View details
                    </Link>
                  </td>
                </tr>
              ))}
              {mentees.length === 0 && (
                <tr><td colSpan="5" className="p-6 text-center text-slate-500">No students match the criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
export default StudentsList;
