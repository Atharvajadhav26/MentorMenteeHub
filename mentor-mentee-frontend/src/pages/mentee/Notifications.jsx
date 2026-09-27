import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Loader } from '../../components/common/UIComponents';
import { BellRing, CheckCircle2 } from 'lucide-react';

const Notifications = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/mentee/notifications').then(res => {
      setNotifs(res.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center"><BellRing className="mr-3 text-accent w-6 h-6"/> Global Alert Stream</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Real-time asynchronous notification vectors</p>
        </div>
        <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold font-mono border border-slate-200 shadow-inner">Total: {notifs.length}</div>
      </div>
      
      <Card className="p-0 overflow-hidden shadow-md border border-slate-200">
        <div className="divide-y divide-slate-100">
          {notifs.map(n => (
            <div key={n.id} className={`p-5 transition-colors ${!n.isRead ? 'bg-slate-50/50 hover:bg-slate-50 border-l-4 border-l-accent' : 'bg-white hover:bg-slate-50 border-l-4 border-l-transparent'}`}>
               <div className="flex justify-between items-center mb-2">
                 <h3 className={`text-base flex items-center ${!n.isRead ? 'font-black text-slate-800' : 'font-semibold text-slate-600'}`}>
                   {!n.isRead && <span className="w-2 h-2 rounded-full bg-accent mr-3 shadow-sm"></span>}
                   {n.isRead && <CheckCircle2 className="w-4 h-4 text-secondary mr-2" />}
                   {n.title}
                 </h3>
                 <span className="text-[11px] text-slate-400 font-mono font-bold bg-slate-100 px-2 py-1 rounded">{new Date(n.createdAt).toLocaleDateString()}</span>
               </div>
               <p className={`text-sm leading-relaxed pl-5 ${!n.isRead ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>{n.message}</p>
            </div>
          ))}
          {notifs.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center">
              <BellRing className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">System stream is perfectly quiet.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
export default Notifications;
