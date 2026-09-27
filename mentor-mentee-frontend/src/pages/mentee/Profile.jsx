import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Loader } from '../../components/common/UIComponents';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/mentee/profile').then(res => {
      setProfile(res.data.data);
      setLoading(false);
    }).catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return <Loader />;
  if (!profile) return <div className="text-center font-bold text-red-500">Local profile index unavailable.</div>;

  const form = profile.mentorshipForm?.formData || {};

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Static Profile Registry</h1>
      <Card className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-gradient-to-r from-white to-slate-50">
        {form.photoUrl ? (
           <img src={form.photoUrl} alt="Secure Vault Entity" className="w-32 h-32 object-cover rounded-2xl shadow-lg border border-slate-200" />
        ) : (
           <div className="w-32 h-32 rounded-2xl bg-slate-200 border-2 border-dashed border-slate-400 flex items-center justify-center text-slate-400 font-bold text-xs uppercase tracking-widest text-center px-4">Entity Unknown</div>
        )}
        <div className="flex-1 text-center md:text-left space-y-3">
           <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{profile.name}</h2>
           <div className="flex flex-wrap gap-2 justify-center md:justify-start">
             <span className="text-white text-xs bg-slate-800 font-bold px-3 py-1 rounded-md shadow-sm">PRN ID: {profile.prn}</span>
             <span className="text-slate-600 text-xs bg-slate-200 border border-slate-300 font-bold px-3 py-1 rounded-md shadow-sm">{profile.academic_year} Matrix</span>
           </div>
           <p className="text-slate-500 text-sm font-medium">System Email Endpoint: {profile.email || 'Null Routing'}</p>
           <p className="text-accent font-bold text-sm bg-slate-50 border border-blue-100 inline-block px-3 py-1 rounded">Mentor Authority: {profile.mentor?.name || 'Unassigned Linkage'}</p>
        </div>
      </Card>
      
      <Card className="shadow-md">
        <h2 className="text-lg font-bold border-b border-slate-200 pb-3 mb-6 text-slate-800">Expanded Document Attributes</h2>
        {Object.keys(form).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            {Object.entries(form).map(([key, value]) => {
              if(key === 'photoUrl') return null;
              return (
                <div key={key} className="border-b border-slate-100 pb-2">
                  <span className="block text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-slate-800 font-bold text-sm">{String(value)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center bg-slate-50 border border-dashed border-slate-300 p-8 rounded-lg">
             <p className="text-slate-500 font-bold">Complex document parameters nullified.</p>
             <p className="text-xs text-slate-400 mt-2">Submit your structural Form payload via the dashboard terminal to populate.</p>
          </div>
        )}
      </Card>
    </div>
  );
};
export default Profile;
