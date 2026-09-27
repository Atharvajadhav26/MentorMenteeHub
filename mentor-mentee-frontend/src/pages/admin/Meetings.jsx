import React, { useEffect, useState } from 'react';
import { Card, Loader } from '../../components/common/UIComponents';
import api from '../../services/api';
import { Calendar, Search } from 'lucide-react';

const AdminMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    api.get('/admin/meetings')
      .then(res => { setMeetings(res.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const filtered = meetings.filter(m =>
    m.agenda?.toLowerCase().includes(search.toLowerCase()) ||
    m.mentor?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-accent" /> All Meeting Reports
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">
            {meetings.length} completed meeting{meetings.length !== 1 ? 's' : ''} across all mentors
          </p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by mentor or agenda…"
            className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-accent outline-none bg-white shadow-sm w-64"
          />
        </div>
      </div>

      <Card className="shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="p-4 font-black text-xs uppercase tracking-wider rounded-tl-xl">#</th>
              <th className="p-4 font-black text-xs uppercase tracking-wider">Mentor</th>
              <th className="p-4 font-black text-xs uppercase tracking-wider">Agenda</th>
              <th className="p-4 font-black text-xs uppercase tracking-wider">Date</th>
              <th className="p-4 font-black text-xs uppercase tracking-wider">Location</th>
              <th className="p-4 font-black text-xs uppercase tracking-wider">Semester</th>
              <th className="p-4 font-black text-xs uppercase tracking-wider text-right rounded-tr-xl">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <tr key={m.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                <td className="p-4 font-bold text-slate-500 font-mono">M-{m.meetingNumber}</td>
                <td className="p-4">
                  <span className="font-bold text-slate-800">{m.mentor?.name || '—'}</span>
                </td>
                <td className="p-4 text-slate-700 max-w-xs">
                  <p className="font-semibold truncate">{m.agenda}</p>
                  {m.discussion && (
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{m.discussion}</p>
                  )}
                </td>
                <td className="p-4 text-slate-500 text-xs font-mono whitespace-nowrap">
                  {new Date(m.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="p-4 text-slate-600 text-xs">{m.location}</td>
                <td className="p-4 text-slate-500 text-xs">Sem {m.semester}</td>
                <td className="p-4 text-right">
                  <span className="bg-red-50 text-accent-dark border border-red-200 px-3 py-1 rounded-full font-black text-xs">
                    {m.attendanceCount}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" className="p-10 text-center text-slate-400 font-bold">
                  {search ? 'No meetings match your search.' : 'No meeting reports logged yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default AdminMeetings;
