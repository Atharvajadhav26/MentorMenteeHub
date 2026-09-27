import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, Loader } from '../../components/common/UIComponents';
import {
  ArrowLeft, User, FileText, BarChart2, MessageSquare, Send, Download, Trophy,
  Zap, Briefcase, Code, Award, ExternalLink, FileCheck, Edit, Plus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import CGPAChart from '../../components/charts/CGPAChart';
import AttendanceChart from '../../components/charts/AttendanceChart';
import { Input, Button } from '../../components/common/UIComponents';

const TYPE_META = {
  HACKATHON:   { label: 'Hackathon',   icon: Zap,       color: 'text-purple-600 bg-purple-50 border-purple-200' },
  INTERNSHIP:  { label: 'Internship',  icon: Briefcase,  color: 'text-slate-700 bg-slate-50 border-blue-200' },
  PROJECT:     { label: 'Project',     icon: Code,       color: 'text-accent bg-red-50 border-red-200' },
  COMPETITION: { label: 'Competition', icon: Award,      color: 'text-amber-600 bg-amber-50 border-amber-200' },
};

const TABS = [
  { id: 'profile',      label: 'Form Data',    icon: FileText    },
  { id: 'progress',     label: 'Progress',     icon: BarChart2   },
  { id: 'achievements', label: 'Achievements', icon: Trophy      },
  { id: 'guidance',     label: 'Guidance',     icon: MessageSquare },
];

const MenteeProfile = () => {
  const { id: menteeId } = useParams();
  const [mentee, setMentee]         = useState(null);
  const [messages, setMessages]     = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState('profile');
  const [progressForm, setProgressForm] = useState(null);
  const [savingProgress, setSavingProgress] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(null);
  
  // NEW: Editing Mentorship Form
  const [editingMentorshipForm, setEditingMentorshipForm] = useState(false);
  const [mentorshipFormData, setMentorshipFormData] = useState({});

  // NEW: Editing Achievement
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [achievementForm, setAchievementForm] = useState(null);

  const fetchAll = async () => {
    try {
      if (!menteeId || menteeId === 'undefined') return;
      const [profileRes, messagesRes, achRes] = await Promise.all([
        api.get(`/mentor/mentees/${menteeId}`),
        api.get(`/mentor/guidance/${menteeId}`),
        api.get(`/mentor/achievements/${menteeId}`)
      ]);
      setMentee(profileRes.data.data);
      setMessages(messagesRes.data.data);
      setAchievements(achRes.data.data);
    } catch (err) {
      console.error('Data Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [menteeId]);

  // ── Excel Export (enhanced with achievements) ─────────────────────────────
  const handleExportToExcel = () => {
    if (!mentee) { alert('No data available for export.'); return; }

    const wb = XLSX.utils.book_new();

    // Sheet 1: Profile
    const profileData = [{
      'Mentee Name':    mentee.name,
      'PRN':            mentee.prn,
      'Academic Year':  mentee.academic_year,
      'Form Status':    mentee.mentorshipForm?.status || 'N/A',
      ...( mentee.mentorshipForm?.formData || {})
    }];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(profileData), 'Profile');

    // Sheet 2: Progress
    if (mentee.progressRecords?.length) {
      const progData = mentee.progressRecords.map(p => ({
        Semester: p.semester, 'Academic Year': p.academic_year, CGPA: p.cgpa,
        'Attendance %': p.attendance, Backlogs: p.backlogs,
        'Auto Score': p.autoScore?.toFixed(2)
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(progData), 'Progress');
    }

    // Sheet 3: Achievements
    if (achievements.length) {
      const achData = achievements.map(a => ({
        Type: a.type, Title: a.title, Description: a.description,
        Link: a.link || '', 'Certificate URL': a.certificate_url || '',
        'Academic Year': a.academic_year
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(achData), 'Achievements');
    }

    XLSX.writeFile(wb, `${mentee.name}_Full_Report.xlsx`);
  };

  const handleSendGuidance = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await api.post('/mentor/guidance', {
        menteeId, content: newMessage, academic_year: mentee.academic_year
      });
      setNewMessage('');
      fetchAll();
    } catch (err) { alert('Network failure dispatching guidance vector.'); }
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    setSavingProgress(true);
    try {
      if (progressForm.id) {
        await api.put(`/mentor/progress/${progressForm.id}`, progressForm);
      } else {
        await api.post(`/mentor/progress/${menteeId}`, progressForm);
      }
      setProgressForm(null);
      fetchAll();
    } catch(err) {
      alert('Failed to save progress record');
    } finally {
      setSavingProgress(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/mentor/mentees/${menteeId}`, profileForm);
      setEditingProfile(false);
      fetchAll();
    } catch(err) { alert('Failed to update details'); }
  };

  const handleMentorshipFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/mentor/forms/${menteeId}`, { formData: mentorshipFormData });
      setEditingMentorshipForm(false);
      fetchAll();
    } catch(err) { alert('Failed to save mentorship form data'); }
  };

  const handleAchievementSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/mentor/achievements/${editingAchievement}`, achievementForm);
      setEditingAchievement(null);
      setAchievementForm(null);
      fetchAll();
    } catch(err) { alert('Failed to save achievement data'); }
  };

  if (loading) return <Loader />;
  if (!mentee) return (
    <div className="p-12 text-center">
      <p className="text-red-500 font-bold uppercase tracking-widest text-sm">
        Mentee instance disconnected or not found.
      </p>
      <Link to="/mentor/mentees" className="mt-4 text-slate-600 underline inline-block">Return to Matrix</Link>
    </div>
  );

  const achByType = Object.keys(TYPE_META).reduce((acc, t) => {
    acc[t] = achievements.filter(a => a.type === t);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-black text-slate-800 flex items-center uppercase tracking-widest">
          <User className="mr-3 w-6 h-6 text-accent" /> {mentee.name}
          <span className="ml-3 text-sm font-mono text-slate-400 normal-case tracking-normal">{mentee.prn}</span>
          <button onClick={() => { setEditingProfile(!editingProfile); setProfileForm({ name: mentee.name, prn: mentee.prn, academic_year: mentee.academic_year }); }} className="ml-4 text-slate-400 hover:text-accent">
            <Edit className="w-5 h-5" />
          </button>
        </h1>
        <div className="flex gap-3">
          <button
            onClick={handleExportToExcel}
            id="export-mentee-profile"
            className="text-[10px] font-black uppercase tracking-widest text-white bg-accent hover:bg-accent-dark px-5 py-3 rounded-xl shadow-lg transition-all flex items-center"
          >
            <Download className="w-4 h-4 mr-2" /> Export to Excel
          </button>
          <Link to="/mentor/mentees" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-5 py-3 rounded-xl shadow-sm transition-all flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Link>
        </div>
      </div>

      {/* Achievement Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {Object.entries(TYPE_META).map(([type, meta]) => {
          const Icon = meta.icon;
          const count = achByType[type]?.length || 0;
          return (
            <div key={type} className={`rounded-xl border p-3 flex items-center gap-3 ${meta.color}`}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-70">{meta.label}</p>
                <p className="text-2xl font-extrabold font-mono">{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-full md:w-auto md:inline-flex">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.id === 'achievements' && achievements.length > 0 && (
                <span className="ml-1 bg-amber-500 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center font-black">
                  {achievements.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Card>
          {editingProfile && profileForm && (
            <form onSubmit={handleProfileSubmit} className="mb-6 border-b pb-6">
              <h2 className="text-[11px] uppercase tracking-widest font-black mb-4 flex items-center text-slate-800">
                <Edit className="w-4 h-4 mr-3 text-accent" /> Edit Basic Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Name" required value={profileForm.name} onChange={e=>setProfileForm({...profileForm, name: e.target.value})} />
                <Input label="PRN" required value={profileForm.prn} onChange={e=>setProfileForm({...profileForm, prn: e.target.value})} />
                <Input label="Academic Year" required value={profileForm.academic_year} onChange={e=>setProfileForm({...profileForm, academic_year: e.target.value})} />
              </div>
              <div className="flex mt-2 gap-2">
                <Button type="submit" className="bg-accent text-white px-4 py-2 rounded-lg text-xs font-bold w-auto">Save Details</Button>
                <button type="button" onClick={() => setEditingProfile(false)} className="px-4 py-2 border rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              </div>
            </form>
          )}

          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-5 text-slate-800">
            <h2 className="text-[11px] uppercase tracking-widest font-black flex items-center">
              <FileText className="w-4 h-4 mr-3 text-accent" /> Mentorship Form Data
            </h2>
            {mentee.mentorshipForm && !editingMentorshipForm && (
              <button onClick={() => { setEditingMentorshipForm(true); setMentorshipFormData(mentee.mentorshipForm.formData || {}); }} className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-accent transition-colors">
                <Edit className="w-4 h-4" /> Edit Form
              </button>
            )}
          </div>
          
          <div className="space-y-4 text-sm max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
            {!mentee.mentorshipForm ? (
              <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Student has not submitted the form yet.</p>
              </div>
            ) : editingMentorshipForm ? (
              <form onSubmit={handleMentorshipFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(mentorshipFormData).map(([key, value]) => {
                     // Provide a simple local change handler
                     const onChange = (e) => setMentorshipFormData(prev => ({...prev, [key]: e.target.value}));
                     return (
                       <Input key={key} label={key.replace(/_/g, ' ').toUpperCase()} value={value} onChange={onChange} />
                     );
                  })}
                </div>
                <div className="flex mt-4 gap-2 border-t pt-4">
                   <Button type="submit" className="bg-accent text-white px-4 py-2 rounded-lg text-xs font-bold w-auto">Save Form Data</Button>
                   <button type="button" onClick={() => setEditingMentorshipForm(false)} className="px-4 py-2 border rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                </div>
              </form>
            ) : (
              Object.entries(mentee.mentorshipForm.formData || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{key.replace(/_/g, ' ')}</span>
                  <span className="font-bold text-slate-700 text-xs">{String(value || 'N/A')}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {activeTab === 'progress' && (
        <Card>
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-5">
            <h2 className="text-[11px] uppercase tracking-widest font-black flex items-center text-slate-800">
              <BarChart2 className="w-4 h-4 mr-3 text-accent" /> Progression Analytics
            </h2>
            {!progressForm && (
              <button onClick={() => setProgressForm({ semester: String((mentee.progressRecords?.length || 0) + 1), academic_year: mentee.academic_year, cgpa: '', attendance: '', backlogs: '0', technicalSkills: '', communicationSkills: '', activities: '', certifications: '', internships: '', projects: '', selfRating: '5' })} className="flex items-center gap-1 text-[10px] font-bold text-white bg-accent px-3 py-1.5 rounded-lg hover:bg-accent-dark transition-colors">
                <Plus className="w-3 h-3" /> New Record
              </button>
            )}
          </div>
          
          {progressForm ? (
            <form onSubmit={handleProgressSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input label="Semester" type="number" required value={progressForm.semester} onChange={e=>setProgressForm({...progressForm, semester: e.target.value})} />
                <Input label="Academic Year" required value={progressForm.academic_year} onChange={e=>setProgressForm({...progressForm, academic_year: e.target.value})} />
                <Input label="CGPA" type="number" step="0.01" required value={progressForm.cgpa} onChange={e=>setProgressForm({...progressForm, cgpa: e.target.value})} />
                <Input label="Attendance %" type="number" step="0.1" required value={progressForm.attendance} onChange={e=>setProgressForm({...progressForm, attendance: e.target.value})} />
                <Input label="Backlogs" type="number" required value={progressForm.backlogs} onChange={e=>setProgressForm({...progressForm, backlogs: e.target.value})} />
                <Input label="Self Rating (1-10)" type="number" min="1" max="10" required value={progressForm.selfRating} onChange={e=>setProgressForm({...progressForm, selfRating: e.target.value})} />
                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 border-t pt-4">
                  <Input label="Technical Skills" value={progressForm.technicalSkills} onChange={e=>setProgressForm({...progressForm, technicalSkills: e.target.value})} />
                  <Input label="Communication Skills" value={progressForm.communicationSkills} onChange={e=>setProgressForm({...progressForm, communicationSkills: e.target.value})} />
                  <Input label="Activities" value={progressForm.activities} onChange={e=>setProgressForm({...progressForm, activities: e.target.value})} />
                  <Input label="Certifications" value={progressForm.certifications} onChange={e=>setProgressForm({...progressForm, certifications: e.target.value})} />
                  <Input label="Internships" value={progressForm.internships} onChange={e=>setProgressForm({...progressForm, internships: e.target.value})} />
                  <Input label="Projects" value={progressForm.projects} onChange={e=>setProgressForm({...progressForm, projects: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" isLoading={savingProgress} className="bg-accent text-white px-4 py-2 rounded-lg text-xs font-bold w-auto">Save Progress</Button>
                <button type="button" onClick={() => setProgressForm(null)} className="px-4 py-2 border rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              </div>
            </form>
          ) : (
            <>
              {(!mentee.progressRecords || mentee.progressRecords.length === 0) ? (
                <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">No progress records found.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="h-[250px] bg-slate-50 border rounded-xl p-4">
                       <h3 className="text-[10px] font-black uppercase text-slate-500 mb-2">CGPA Trend</h3>
                       <div className="h-full"><CGPAChart data={mentee.progressRecords.map(d => ({ name:`Sem ${d.semester}`, cgpa: d.cgpa }))} /></div>
                    </div>
                    <div className="h-[250px] bg-slate-50 border rounded-xl p-4">
                       <h3 className="text-[10px] font-black uppercase text-slate-500 mb-2">Attendance Trend</h3>
                       <div className="h-full"><AttendanceChart data={mentee.progressRecords.map(d => ({ name:`Sem ${d.semester}`, attendance: d.attendance }))} /></div>
                    </div>
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {mentee.progressRecords.map(p => (
                      <div key={p.id} className="p-4 bg-white border border-slate-200 rounded-xl relative group">
                        <button onClick={() => setProgressForm(p)} className="absolute top-4 right-4 text-slate-400 hover:text-accent shadow-sm bg-white rounded-md p-1 border">
                          <Edit className="w-4 h-4" />
                        </button>
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Semester {p.semester} — {p.academic_year}</p>
                        <div className="grid grid-cols-3 gap-4 text-center mb-3">
                          <div><p className="text-[9px] text-slate-400 uppercase">CGPA</p><p className="font-black text-accent text-lg">{p.cgpa}</p></div>
                          <div><p className="text-[9px] text-slate-400 uppercase">Attendance</p><p className="font-black text-slate-700 text-lg">{p.attendance}%</p></div>
                          <div><p className="text-[9px] text-slate-400 uppercase">Auto-Score</p><p className="font-black text-slate-700 text-lg">{p.autoScore?.toFixed(2)}</p></div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                          <p><span className="font-black text-slate-700">Skills:</span> {p.technicalSkills || 'N/A'}</p>
                          <p><span className="font-black text-slate-700">Backlogs:</span> {p.backlogs}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {activeTab === 'achievements' && (
        <Card>
          <h2 className="text-[11px] uppercase tracking-widest font-black border-b border-slate-100 pb-4 mb-5 flex items-center text-amber-600">
            <Trophy className="w-4 h-4 mr-3" /> Achievements ({achievements.length})
          </h2>
          {editingAchievement ? (
            <form onSubmit={handleAchievementSubmit} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-1">Type</label>
                  <select
                    className="border border-slate-200 bg-slate-50 p-2 rounded-lg text-sm focus:outline-none focus:border-accent"
                    value={achievementForm.type}
                    onChange={e => setAchievementForm({...achievementForm, type: e.target.value})}
                  >
                    <option value="HACKATHON">Hackathon</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="PROJECT">Project</option>
                    <option value="COMPETITION">Competition</option>
                  </select>
                </div>
                <Input label="Title" required value={achievementForm.title} onChange={e=>setAchievementForm({...achievementForm, title: e.target.value})} />
                <Input label="Description" value={achievementForm.description} onChange={e=>setAchievementForm({...achievementForm, description: e.target.value})} />
                <Input label="Link" value={achievementForm.link || ''} onChange={e=>setAchievementForm({...achievementForm, link: e.target.value})} />
                <Input label="Academic Year" required value={achievementForm.academic_year} onChange={e=>setAchievementForm({...achievementForm, academic_year: e.target.value})} />
              </div>
              <div className="flex gap-2 border-t pt-4">
                <Button type="submit" className="bg-accent text-white px-4 py-2 rounded-lg text-xs font-bold w-auto">Save Achievement</Button>
                <button type="button" onClick={() => setEditingAchievement(null)} className="px-4 py-2 border rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              </div>
            </form>
          ) : achievements.length === 0 ? (
            <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">No achievements logged by this mentee yet.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
              {achievements.map(a => {
                const meta = TYPE_META[a.type];
                const Icon = meta.icon;
                return (
                  <div key={a.id} className={`relative group flex items-start gap-3 p-4 rounded-xl border ${meta.color}`}>
                    <button onClick={() => { setEditingAchievement(a.id); setAchievementForm(a); }} className="absolute top-4 right-4 text-slate-400 hover:text-accent shadow-sm bg-white rounded-md p-1 border border-black/5">
                      <Edit className="w-4 h-4" />
                    </button>
                    <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-slate-800">{a.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{a.description}</p>
                      <div className="flex gap-3 mt-2 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400">{a.academic_year}</span>
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'guidance' && (
        <Card>
          <h2 className="text-[11px] uppercase tracking-widest font-black border-b border-slate-100 pb-4 mb-5 flex items-center text-slate-800">
            <MessageSquare className="w-4 h-4 mr-3 text-slate-600" /> Guidance Communication
          </h2>
          <div className="bg-slate-50 rounded-xl max-h-[350px] overflow-y-auto p-4 mb-4 flex flex-col space-y-3">
            {messages.length === 0 && (
              <p className="text-center text-[11px] text-slate-400 font-bold uppercase tracking-widest py-8">No messages yet.</p>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex w-full ${msg.isFromMentor ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[75%] text-sm ${msg.isFromMentor ? 'bg-accent text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}`}>
                  <p>{msg.content}</p>
                  <p className="text-[8px] uppercase mt-1 opacity-60">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendGuidance} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type professional guidance..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm"
              id="guidance-input"
              required
            />
            <button type="submit" id="send-guidance" className="bg-accent text-white px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </Card>
      )}
    </div>
  );
};

export default MenteeProfile;