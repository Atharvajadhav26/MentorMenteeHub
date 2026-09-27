import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Loader } from '../../components/common/UIComponents';
import { Calendar, MapPin, Tag } from 'lucide-react';

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/mentee/meetings').then(res => {
      setMeetings(res.data.data);
      setLoading(false);
    }).catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-slate-800 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
         <div className="absolute -right-10 -top-10 text-white/5 disabled"><Calendar className="w-48 h-48"/></div>
         <h1 className="text-2xl font-black tracking-tight text-white relative z-10">Scheduled Iterations</h1>
         <p className="text-xs uppercase tracking-[0.2em] text-secondary mt-1 relative z-10 font-bold">Synchronized Mentor Timelines</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {meetings.map((m, index) => (
           <Card key={m.id} className={`border-t-4 shadow-md hover:-translate-y-1 transition-all duration-300 ${index === 0 ? 'border-t-emerald-500 ring-2 ring-emerald-500/20' : 'border-t-accent'}`}>
             <div className="flex justify-between items-start mb-5">
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 font-mono bg-slate-100 px-2 py-1 rounded inline-block">{new Date(m.date).toLocaleDateString()}</p>
                 <h2 className="text-lg font-bold text-slate-800 leading-tight">{m.title}</h2>
               </div>
             </div>
             
             <div className="space-y-3">
               <p className="text-sm font-medium text-slate-600 bg-slate-50 py-2.5 px-3 rounded-lg border border-slate-100 flex items-center">
                 <MapPin className="w-4 h-4 text-accent mr-2" /> <span className="font-bold text-slate-700">{m.location}</span>
               </p>
               
               <div className="flex justify-between items-center bg-slate-50 rounded-lg border border-slate-100 py-2 px-3">
                 <div className="flex flex-col text-slate-500 text-xs font-semibold gap-1 items-start">
                   <span className="uppercase tracking-widest text-[9px]">Event Typology</span>
                   <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${m.isBatch ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-blue-700 border border-blue-200'}`}>
                     {m.isBatch ? 'BATCH POOL' : 'INDIVIDUAL'}
                   </span>
                 </div>
                 
                 <div className="text-right">
                   <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">Time Init</p>
                   <p className="text-sm font-black text-slate-700 font-mono">{new Date(m.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                 </div>
               </div>
             </div>
           </Card>
         ))}
         {meetings.length === 0 && (
           <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white border border-dashed border-slate-300 rounded-2xl">
             <Calendar className="w-12 h-12 text-slate-200 mb-4" />
             <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No scheduled nodes detected from parent hierarchy.</p>
           </div>
         )}
      </div>
    </div>
  );
};
export default Meetings;
