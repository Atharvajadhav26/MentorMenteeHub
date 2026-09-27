import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Input, Button, Loader } from '../../components/common/UIComponents';

const FillForm = () => {
  const [formDoc, setFormDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [data, setData] = useState({
    dateOfBirth: '', bloodGroup: '', religion: '', castCategory: '', domicile: '',
    parentName: '', parentPhone: '', parentIncome: '',
    guardianName: '', guardianPhone: '',
    sscPercentage: '', hscPercentage: '', medicalContext: ''
  });
  
  const [photoBase64, setPhotoBase64] = useState('');

  const [formNotUnlocked, setFormNotUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.get('/mentee/forms').then(res => {
      setFormDoc(res.data.data);
      if (Object.keys(res.data.data.formData).length > 0) {
        setData(prev => ({ ...prev, ...res.data.data.formData }));
      }
      setLoading(false);
    }).catch(err => {
      const status = err.response?.status;
      if (status === 404) {
        setFormNotUnlocked(true); // Mentor hasn't unlocked the form yet
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to load form.');
      }
      setLoading(false);
    });
  }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => { setPhotoBase64(reader.result); };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/mentee/forms/fill', { formData: data, photoBase64 });
      alert('Data structure integrated globally.');
    } catch(err) {
      alert('Upload failed: Cloudinary parameters or network layer broken.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  if (formNotUnlocked) return (
    <div className="max-w-2xl mx-auto mt-16 text-center">
      <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-10 shadow-sm">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-amber-800 mb-2">Form Not Yet Unlocked</h2>
        <p className="text-amber-700 text-sm">
          Your Mentor has not unlocked your Mentorship Form yet.<br />
          Please wait for your mentor to send the form — you will receive a notification once it's available.
        </p>
      </div>
    </div>
  );

  if (errorMsg) return (
    <div className="max-w-2xl mx-auto mt-16 text-center">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-10">
        <p className="text-red-700 font-semibold">{errorMsg}</p>
      </div>
    </div>
  );

  if (!formDoc) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Mentorship Foundation Core</h1>
           <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">Fill and submit document artifacts</p>
        </div>
        <span className={`px-4 py-2 mt-4 sm:mt-0 rounded-lg text-xs font-black shadow-inner border uppercase tracking-[0.2em] ${formDoc.status==='APPROVED'?'bg-red-50 text-accent-dark border-red-200':'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'}`}>
          LOCK STATUS: {formDoc.status}
        </span>
      </div>

      <Card className="shadow-lg border-t-8 border-t-slate-800">
        <form onSubmit={handleSubmit} className="space-y-8 text-sm">
          
          <section className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <h3 className="font-extrabold text-slate-700 border-b border-blue-100 pb-2 mb-5 uppercase tracking-widest text-xs">Biological Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
               <Input label="Date of Birth Frame" type="date" value={data.dateOfBirth} onChange={e=>setData({...data, dateOfBirth: e.target.value})} required/>
               <Input label="Hemoglobin / Blood Group" value={data.bloodGroup} onChange={e=>setData({...data, bloodGroup: e.target.value})} required placeholder="E.g., O+"/>
               <Input label="Domicile Coordinates" value={data.domicile} onChange={e=>setData({...data, domicile: e.target.value})} required/>
               <Input label="Religion Identity" value={data.religion} onChange={e=>setData({...data, religion: e.target.value})} required/>
               <Input label="Caste Classification" value={data.castCategory} onChange={e=>setData({...data, castCategory: e.target.value})} required/>
            </div>
          </section>
          
          <section className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <h3 className="font-extrabold text-purple-600 border-b border-purple-100 pb-2 mb-5 uppercase tracking-widest text-xs">Primary Authority (Parents / Guardian)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <Input label="Primary Parent Exact Name" value={data.parentName} onChange={e=>setData({...data, parentName: e.target.value})} required/>
               <Input label="Parent Communications" type="tel" value={data.parentPhone} onChange={e=>setData({...data, parentPhone: e.target.value})} required/>
               <Input label="Declared Base Income (INR)" type="number" value={data.parentIncome} onChange={e=>setData({...data, parentIncome: e.target.value})} required/>
               <Input label="Local Guardian Alias (If Any)" value={data.guardianName} onChange={e=>setData({...data, guardianName: e.target.value})} />
            </div>
          </section>
          
          <section className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <h3 className="font-extrabold text-accent border-b border-emerald-100 pb-2 mb-5 uppercase tracking-widest text-xs">Academic Memory Index</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <Input label="SSC Node Value (%)" type="number" step="0.01" value={data.sscPercentage} onChange={e=>setData({...data, sscPercentage: e.target.value})} required/>
               <Input label="HSC / Diploma Node Value (%)" type="number" step="0.01" value={data.hscPercentage} onChange={e=>setData({...data, hscPercentage: e.target.value})} required/>
               <div className="md:col-span-2">
                 <Input label="Historical Medical Triggers (Conditional)" value={data.medicalContext} onChange={e=>setData({...data, medicalContext: e.target.value})} />
               </div>
            </div>
          </section>

          <section className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col sm:flex-row gap-6 items-center">
            <div className="flex-1 w-full">
              <h3 className="font-extrabold text-slate-800 border-b border-slate-200 pb-2 mb-4 uppercase tracking-widest text-xs">Photographic Entity Verification</h3>
              <input type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-slate-800 file:text-white hover:file:bg-slate-700 hover:file:shadow-md cursor-pointer transition-all outline-none" />
              <p className="text-[10px] uppercase text-slate-400 font-bold mt-3">Target format: JPEG/PNG. Max size scaling determined via Cloudinary bridge limit limits.</p>
            </div>
            {photoBase64 && <img src={photoBase64} alt="Target Scope Preview" className="w-32 h-32 object-cover rounded-xl shadow-lg border-4 border-white transform rotate-2 hover:rotate-0 transition-transform duration-300" />}
          </section>
          
          <div className="pt-2">
            <Button type="submit" isLoading={saving} disabled={formDoc.status==='APPROVED'} className="btn-primary py-4 font-black tracking-widest uppercase text-sm shadow-xl active:scale-[0.98]">
              {formDoc.status==='APPROVED' ? 'Global Block - Approved State' : 'Encrypt and Transmit Master Parameters'}
            </Button>
          </div>

        </form>
      </Card>
    </div>
  );
};
export default FillForm;
