import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Loader } from '../../components/common/UIComponents';
import { User, Edit3, Save, X, Mail, Building, Calendar, Users } from 'lucide-react';

const MentorProfile = () => {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await api.get('/mentor/profile');
      setProfile(res.data.data);
      setForm({
        name:          res.data.data.name,
        email:         res.data.data.email,
        department:    res.data.data.department,
        academic_year: res.data.data.academic_year,
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/mentor/profile', form);
      setProfile(prev => ({ ...prev, ...res.data.data }));
      setEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed to update profile. Please try again.');
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    setForm({
      name:          profile.name,
      email:         profile.email,
      department:    profile.department,
      academic_year: profile.academic_year,
    });
    setEditing(false);
  };

  if (loading) return <Loader />;
  if (!profile) return (
    <div className="text-center p-12 font-bold text-red-500">
      Mentor profile unavailable.
    </div>
  );

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl text-white flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/70 to-emerald-500/70 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg flex-shrink-0">
          {initials}
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="text-2xl font-black text-white">{profile.name}</h1>
          <p className="text-slate-400 text-sm mt-1">{profile.department}</p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
            <span className="px-3 py-1 bg-white/10 text-xs font-bold rounded-lg text-slate-300">
              {profile.academic_year}
            </span>
            <span className="px-3 py-1 bg-accent/20 text-xs font-bold rounded-lg text-emerald-300 flex items-center gap-1">
              <Users className="w-3 h-3" /> {profile._count?.mentees ?? 0} Mentees
            </span>
          </div>
        </div>
        <button
          id="toggle-profile-edit"
          onClick={() => editing ? handleCancel() : setEditing(true)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${
            editing
              ? 'bg-slate-600 hover:bg-slate-500 text-slate-200'
              : 'bg-accent hover:bg-accent/80 text-white'
          }`}
        >
          {editing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Success Toast */}
      {successMsg && (
        <div className="bg-red-50 border border-red-200 text-accent-dark font-bold text-sm px-5 py-3 rounded-xl animate-pulse">
          ✅ {successMsg}
        </div>
      )}

      {/* Profile Details / Edit Form */}
      <Card className="shadow-md">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
          <User className="w-4 h-4" /> Profile Details
        </h2>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Full Name *</label>
                <input
                  required
                  id="edit-mentor-name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Email *</label>
                <input
                  required
                  type="email"
                  id="edit-mentor-email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Department *</label>
                <input
                  required
                  id="edit-mentor-dept"
                  value={form.department}
                  onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Academic Year *</label>
                <input
                  required
                  id="edit-mentor-year"
                  value={form.academic_year}
                  onChange={e => setForm(f => ({ ...f, academic_year: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-accent outline-none"
                  placeholder="e.g. 2025-26"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2 text-xs font-black uppercase tracking-widest border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="save-mentor-profile"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-accent hover:bg-accent/80 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{profile.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Building className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Department</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{profile.department}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Academic Year</p>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{profile.academic_year}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Account Info */}
      <Card className="shadow-sm">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-3 mb-4">
          Activity Summary
        </h2>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Mentees</p>
            <p className="text-3xl font-extrabold text-slate-800 font-mono mt-1">{profile._count?.mentees ?? 0}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-accent">Profile Status</p>
            <p className="text-sm font-extrabold text-accent-dark mt-1">Active</p>
          </div>
        </div>
        <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-4 text-center">
          Mentor ID: {profile.id}
        </p>
      </Card>
    </div>
  );
};

export default MentorProfile;
