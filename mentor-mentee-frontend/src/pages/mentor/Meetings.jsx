import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Input, Button, Loader } from '../../components/common/UIComponents';
import { Calendar, Trash2, Edit3, CheckCircle, X, Clock } from 'lucide-react';

const Meetings = () => {
  const [data, setData] = useState({ schedules: [], reports: [] });
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({ title: '', date: '', location: '', academic_year: '2025-26', isBatch: true });
  const [reportForm, setReportForm] = useState({
    meetingNumber: 1, date: '', location: '', className: '', semester: '',
    academic_year: '2025-26', agenda: '', discussion: '', recommendations: '', conclusion: '', attendanceCount: 0
  });

  // Edit schedule state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchData = () => {
    api.get('/mentor/meetings').then(res => {
      setData(res.data.data);
      if (res.data.data.reports?.length > 0) {
        setReportForm(prev => ({ ...prev, meetingNumber: res.data.data.reports.length + 1 }));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      await api.post('/mentor/meetings', form);
      setForm({ title: '', date: '', location: '', academic_year: '2025-26', isBatch: true });
      fetchData();
    } catch { alert('Failed to schedule meeting.'); }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    try {
      await api.post('/mentor/meeting-reports', { ...reportForm, suggestions: reportForm.recommendations });
      setReportForm(prev => ({ ...prev, meetingNumber: prev.meetingNumber + 1, agenda: '', discussion: '', recommendations: '', conclusion: '' }));
      fetchData();
    } catch { alert('Failed to save report.'); }
  };

  const startEdit = (schedule) => {
    setEditingId(schedule.id);
    const localDate = new Date(schedule.date);
    // Format for datetime-local input: "YYYY-MM-DDTHH:MM"
    const formatted = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000)
      .toISOString().slice(0, 16);
    setEditForm({ title: schedule.title, date: formatted, location: schedule.location, academic_year: schedule.academic_year });
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/mentor/meetings/${id}`, editForm);
      setEditingId(null);
      fetchData();
    } catch { alert('Failed to update schedule.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this meeting schedule?')) return;
    try {
      await api.delete(`/mentor/meetings/${id}`);
      fetchData();
    } catch { alert('Failed to delete schedule.'); }
  };

  if (loading) return <Loader />;

  const now = new Date();
  const upcoming = (data.schedules || []).filter(s => new Date(s.date) >= now);
  const past     = (data.schedules || []).filter(s => new Date(s.date) < now);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
        <Calendar className="w-6 h-6 text-accent" /> Meetings & Archives
      </h1>

      {/* Schedule + Report Forms */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Schedule Form */}
        <Card className="border-l-4 border-l-accent shadow-md">
          <h2 className="text-lg font-bold mb-5 pb-2 border-b border-slate-100 text-slate-800">
            Schedule New Meeting
          </h2>
          <form onSubmit={handleSchedule} className="space-y-4">
            <Input label="Title / Agenda" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Date & Time" type="datetime-local" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              <Input label="Venue / Room" required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
            <Button type="submit" className="bg-accent text-white w-full py-3 hover:bg-accent-dark rounded-xl font-bold shadow-lg transition-all">
              Schedule & Notify Mentees
            </Button>
          </form>
        </Card>

        {/* Report Form */}
        <Card className="border-l-4 border-l-emerald-500 shadow-md">
          <h2 className="text-lg font-bold mb-5 pb-2 border-b border-slate-100 text-slate-800">Log Meeting Report</h2>
          <form onSubmit={handleReport} className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Input label="Meeting #" type="number" required value={reportForm.meetingNumber} onChange={e => setReportForm({ ...reportForm, meetingNumber: parseInt(e.target.value) })} />
            <Input label="Attendance Count" type="number" required value={reportForm.attendanceCount} onChange={e => setReportForm({ ...reportForm, attendanceCount: parseInt(e.target.value) })} />
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <Input label="Date Conducted" type="datetime-local" required value={reportForm.date} onChange={e => setReportForm({ ...reportForm, date: e.target.value })} />
              <Input label="Semester" required value={reportForm.semester} onChange={e => setReportForm({ ...reportForm, semester: e.target.value })} placeholder="e.g., 5" />
            </div>
            <div className="col-span-2"><Input label="Agenda" required value={reportForm.agenda} onChange={e => setReportForm({ ...reportForm, agenda: e.target.value })} /></div>
            <div className="col-span-2"><Input label="Discussion Summary" required value={reportForm.discussion} onChange={e => setReportForm({ ...reportForm, discussion: e.target.value })} /></div>
            <div className="col-span-2"><Input label="Conclusion & Suggestions" required value={reportForm.conclusion} onChange={e => setReportForm({ ...reportForm, conclusion: e.target.value })} /></div>
            <div className="col-span-2 pt-2">
              <Button type="submit" className="bg-accent text-white w-full py-3 hover:bg-accent-dark rounded-xl font-bold shadow-lg transition-all">
                Save Report
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Upcoming Meeting Schedules */}
      <Card>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
          <Clock className="w-5 h-5 text-accent" /> Upcoming Schedules
          <span className="ml-auto text-xs font-bold bg-slate-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
            {upcoming.length} scheduled
          </span>
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-6">No upcoming meetings scheduled.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map(s => (
              <div key={s.id} className="bg-slate-50/40 border border-blue-100 rounded-xl p-4">
                {editingId === s.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-accent outline-none" placeholder="Title" />
                    <input type="datetime-local" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
                    <input value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="Location" />
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdate(s.id)} className="flex-1 bg-accent text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-accent-dark flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-2 border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">{s.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        📅 {new Date(s.date).toLocaleString()} &nbsp;|&nbsp; 📍 {s.location}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => startEdit(s)} className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-all" title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-2 bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 rounded-lg transition-all" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Past Schedules */}
      {past.length > 0 && (
        <Card>
          <h2 className="text-lg font-bold mb-4 text-slate-500">Past Schedules</h2>
          <div className="space-y-2">
            {past.map(s => (
              <div key={s.id} className="flex justify-between items-center bg-slate-50 rounded-xl px-4 py-3 opacity-70">
                <div>
                  <p className="font-bold text-slate-600 text-sm">{s.title}</p>
                  <p className="text-xs text-slate-400">{new Date(s.date).toLocaleString()} — {s.location}</p>
                </div>
                <button onClick={() => handleDelete(s.id)} className="p-2 text-red-400 hover:text-red-600 rounded-lg" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Meeting Reports Archive */}
      <Card>
        <h2 className="text-lg font-bold mb-4 text-slate-800">Meeting Reports Archive</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="p-3 font-black text-slate-600 text-xs uppercase tracking-wide">#</th>
                <th className="p-3 font-black text-slate-600 text-xs uppercase tracking-wide">Agenda</th>
                <th className="p-3 font-black text-slate-600 text-xs uppercase tracking-wide">Date</th>
                <th className="p-3 font-black text-slate-600 text-xs uppercase tracking-wide">Location</th>
                <th className="p-3 font-black text-slate-600 text-xs uppercase tracking-wide text-right">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {(data.reports || []).map(r => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-700">M-{r.meetingNumber}</td>
                  <td className="p-3 text-slate-800">{r.agenda}</td>
                  <td className="p-3 text-slate-500 text-xs">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="p-3 text-slate-500 text-xs">{r.location}</td>
                  <td className="p-3 text-right font-bold text-slate-700">{r.attendanceCount}</td>
                </tr>
              ))}
              {!(data.reports?.length > 0) && (
                <tr><td colSpan="5" className="p-6 text-center text-slate-400">No meeting reports logged yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Meetings;
