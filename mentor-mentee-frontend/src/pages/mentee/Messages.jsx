import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Loader } from '../../components/common/UIComponents';
import { Send, Hash } from 'lucide-react';
import { socket } from '../../context/AuthContext';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');

  const fetchMessages = () => {
    api.get('/mentee/messages').then(res => {
      setMessages(res.data.data);
      setLoading(false);
    });
  };

  useEffect(() => { 
    fetchMessages(); 
    
    const handleNewMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };
    socket.on('new_message', handleNewMessage);
    
    return () => socket.off('new_message', handleNewMessage);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if(!content.trim()) return;
    try {
      const res = await api.post('/mentee/messages', { content });
      setMessages(prev => [...prev, res.data.data]); // instantly append own message
      setContent('');
    } catch(err) { alert('Transmission failed check mentor linkage.'); }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-100px)]">
      <div className="bg-slate-900 rounded-t-2xl p-5 text-white flex justify-between items-center shadow-md z-10">
         <div>
           <h1 className="text-xl font-bold tracking-tight text-white flex items-center"><Hash className="w-5 h-5 mr-2 text-accent" /> Feedback & Communications Router</h1>
           <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">E2E Endpoints directly linked to Assigned Mentor</p>
         </div>
      </div>
      
      <div className="flex-1 overflow-y-auto flex flex-col p-6 space-y-6 bg-slate-50 border-x border-slate-200">
        {messages.length === 0 && <div className="m-auto text-slate-400 font-bold uppercase text-xs tracking-widest bg-white px-6 py-3 rounded-full shadow-sm border border-slate-200">Message ledger is absolutely empty.</div>}
        
        {messages.map(m => (
          <div key={m.id} className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${m.isFromMentor ? 'bg-white border border-slate-200 text-slate-700 self-start rounded-tl-none' : 'bg-accent/90 backdrop-blur-sm text-white self-end rounded-tr-none'}`}>
             {m.isFromMentor && <p className="text-[10px] font-black text-accent mb-2 uppercase tracking-wider flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent"></span> RECEIVED: {m.mentor?.name}</p>}
             <p className="text-[15px] leading-relaxed font-medium">{m.content}</p>
             <p className={`text-[10px] text-right mt-3 font-mono font-bold uppercase tracking-wider ${m.isFromMentor ? 'text-slate-400' : 'text-blue-100'}`}>
               {new Date(m.createdAt).toLocaleString()}
             </p>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-white border border-t-0 border-slate-200 rounded-b-2xl shadow-sm">
        <form onSubmit={handleSend} className="flex gap-3">
          <input 
            type="text" 
            value={content} 
            onChange={e => setContent(e.target.value)}
            placeholder="Transmit query or issue directly to Mentor..." 
            className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-white transition-all shadow-inner"
          />
          <button type="submit" className="bg-accent hover:bg-accent-dark text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-md shadow-accent/20 active:scale-95 flex items-center justify-center">
            <Send className="w-4 h-4 mr-2" /> Dispatch
          </button>
        </form>
      </div>
    </div>
  );
};
export default Messages;
