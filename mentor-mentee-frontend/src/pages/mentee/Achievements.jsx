import React, { useEffect, useState, useRef } from 'react';
import api from '../../services/api';
import { Card, Loader } from '../../components/common/UIComponents';
import { Trophy, Plus, Trash2, Link as LinkIcon, FileCheck, Upload, X, Award, Code, Briefcase, Zap } from 'lucide-react';

const TYPE_META = {
  HACKATHON:   { label: 'Hackathon',   icon: Zap,      color: 'text-purple-600 bg-purple-50 border-purple-200' },
  INTERNSHIP:  { label: 'Internship',  icon: Briefcase, color: 'text-slate-700 bg-slate-50 border-blue-200' },
  PROJECT:     { label: 'Project',     icon: Code,      color: 'text-accent bg-red-50 border-red-200' },
  COMPETITION: { label: 'Competition', icon: Award,     color: 'text-amber-600 bg-amber-50 border-amber-200' },
};

const EMPTY_FORM = {
  type: 'HACKATHON',
  title: '',
  description: '',
  link: '',
  academic_year: '2025-26',
  certificateBase64: null,
};

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [certPreview, setCertPreview] = useState(null);
  const fileInputRef = useRef(null);

  const fetch = async () => {
    try {
      const res = await api.get('/mentee/achievements');
      setAchievements(res.data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(f => ({ ...f, certificateBase64: reader.result }));
      setCertPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/mentee/achievements', form);
      setForm(EMPTY_FORM);
      setCertPreview(null);
      setShowForm(false);
      fetch();
    } catch (err) {
      alert('Failed to submit achievement. Please try again.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this achievement from your profile?')) return;
    try {
      await api.delete(`/mentee/achievements/${id}`);
      setAchievements(a => a.filter(x => x.id !== id));
    } catch (e) { alert('Could not delete achievement.'); }
  };

  if (loading) return <Loader />;

  const grouped = Object.keys(TYPE_META).reduce((acc, type) => {
    acc[type] = achievements.filter(a => a.type === type);
    return acc;
  }, {});

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl text-white flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-amber-400 flex items-center gap-2">
            <Trophy className="w-6 h-6" /> Achievement Vault
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-1">
            Log hackathons, internships, projects &amp; competitions
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          id="toggle-achievement-form"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'Add Achievement'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(TYPE_META).map(([type, meta]) => {
          const Icon = meta.icon;
          return (
            <div key={type} className={`rounded-xl border p-4 flex flex-col items-start gap-1 ${meta.color}`}>
              <Icon className="w-5 h-5 mb-1" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{meta.label}</p>
              <p className="text-3xl font-extrabold font-mono">{grouped[type]?.length || 0}</p>
            </div>
          );
        })}
      </div>

      {/* Add Form */}
      {showForm && (
        <Card className="border-t-4 border-t-amber-500 shadow-lg">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 mb-5">
            New Achievement Entry
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Achievement Type *</label>
              <select
                required
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-400 outline-none bg-white"
                id="achievement-type"
              >
                {Object.entries(TYPE_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Academic Year *</label>
              <input
                required
                value={form.academic_year}
                onChange={e => setForm(f => ({ ...f, academic_year: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-400 outline-none"
                placeholder="e.g. 2025-26"
                id="achievement-year"
              />
            </div>

            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Title *</label>
              <input
                required
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-400 outline-none"
                placeholder="e.g. Winner - Smart India Hackathon 2025"
                id="achievement-title"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Description *</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-400 outline-none resize-none"
                placeholder="Brief description of the achievement..."
                id="achievement-description"
              />
            </div>

            {/* Link */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Reference Link</label>
              <input
                value={form.link}
                onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-400 outline-none"
                placeholder="https://..."
                type="url"
                id="achievement-link"
              />
            </div>

            {/* Certificate Upload */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Certificate Upload</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 rounded-xl py-4 px-3 flex items-center gap-3 cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all"
                id="certificate-upload-zone"
              >
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-xs text-slate-400 font-bold">
                  {form.certificateBase64 ? 'File selected ✓' : 'Click to upload certificate (PDF/Image)'}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
                id="certificate-file-input"
              />
              {certPreview && certPreview.startsWith('data:image') && (
                <img src={certPreview} alt="Certificate Preview" className="mt-2 h-24 object-contain rounded-lg border border-slate-200" />
              )}
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                id="submit-achievement"
                className="bg-amber-500 hover:bg-amber-600 text-white font-black px-8 py-3 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg disabled:opacity-50"
              >
                {saving ? 'Submitting...' : 'Log Achievement'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Achievement List by Type */}
      {Object.entries(TYPE_META).map(([type, meta]) => {
        const items = grouped[type] || [];
        if (items.length === 0) return null;
        const Icon = meta.icon;
        return (
          <Card key={type} className="shadow-md">
            <h2 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 ${meta.color.split(' ')[0]}`}>
              <Icon className="w-4 h-4" /> {meta.label}s ({items.length})
            </h2>
            <div className="space-y-3">
              {items.map(a => (
                <div key={a.id} className={`flex items-start justify-between p-4 rounded-xl border ${meta.color} gap-4`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-slate-800">{a.title}</p>
                    <p className="text-xs text-slate-600 mt-1">{a.description}</p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {a.link && (
                        <a href={a.link} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-[10px] font-bold text-slate-700 hover:underline">
                          <LinkIcon className="w-3 h-3" /> Link
                        </a>
                      )}
                      {a.certificate_url && (
                        <a href={a.certificate_url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-[10px] font-bold text-accent hover:underline">
                          <FileCheck className="w-3 h-3" /> Certificate
                        </a>
                      )}
                      <span className="text-[10px] font-bold text-slate-400">{a.academic_year}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                    id={`delete-ach-${a.id}`}
                    title="Remove achievement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      {achievements.length === 0 && !showForm && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No achievements logged yet.</p>
          <p className="text-slate-400 text-xs mt-1">Click "Add Achievement" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default Achievements;
