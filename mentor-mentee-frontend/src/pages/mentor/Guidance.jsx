import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, Loader } from '../../components/common/UIComponents';
import { MessageSquare, Send, User } from 'lucide-react';
import { socket } from '../../context/AuthContext';

const Guidance = () => {
  const [mentees, setMentees] = useState([]);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get('/mentor/mentees')
      .then(res => { setMentees(res.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Listen for real-time incoming messages from mentees
  useEffect(() => {
    const handleNewMsg = (msg) => {
      if (selectedMentee && msg.menteeId === selectedMentee.id) {
        setMessages(prev => [...prev, msg]);
      }
    };
    socket.on('new_message', handleNewMsg);
    return () => socket.off('new_message', handleNewMsg);
  }, [selectedMentee]);

  const openChat = async (mentee) => {
    setSelectedMentee(mentee);
    setMessages([]);
    try {
      const res = await api.get(`/mentor/guidance/${mentee.id}`);
      setMessages(res.data.data || []);
    } catch { setMessages([]); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMentee) return;
    setSending(true);
    try {
      await api.post('/mentor/guidance', {
        menteeId: selectedMentee.id,
        content: newMessage,
        academic_year: selectedMentee.academic_year || '2025-26'
      });
      setNewMessage('');
      // Refresh messages
      const res = await api.get(`/mentor/guidance/${selectedMentee.id}`);
      setMessages(res.data.data || []);
    } catch { alert('Failed to send message.'); }
    finally { setSending(false); }
  };

  if (loading) return <Loader />;

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6">
      {/* Mentee List Panel */}
      <div className="w-72 flex-shrink-0 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent" /> Guidance
          </h2>
          <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">
            {mentees.length} mentee{mentees.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mentees.length === 0 ? (
            <p className="p-6 text-center text-slate-400 text-xs">No mentees assigned yet.</p>
          ) : (
            mentees.map(m => (
              <button
                key={m.id}
                onClick={() => openChat(m)}
                className={`w-full text-left px-5 py-4 border-b border-slate-50 transition-colors flex items-center gap-3 ${
                  selectedMentee?.id === m.id
                    ? 'bg-accent/10 border-l-4 border-l-accent'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-500 text-white flex items-center justify-center text-xs font-black flex-shrink-0">
                  {m.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || <User className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{m.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{m.prn}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {!selectedMentee ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <MessageSquare className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-slate-400 font-bold text-sm uppercase tracking-widest">Select a mentee</h3>
            <p className="text-slate-300 text-xs mt-2">Choose from the list to start a guidance conversation</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-blue-600 text-white flex items-center justify-center text-xs font-black">
                {selectedMentee.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <p className="font-black text-slate-800">{selectedMentee.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{selectedMentee.prn} · {selectedMentee.academic_year}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">
              {messages.length === 0 && (
                <p className="text-center text-slate-400 text-xs py-8 uppercase tracking-widest font-bold">
                  No messages yet. Start the conversation below.
                </p>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isFromMentor ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl max-w-[72%] text-sm shadow-sm ${
                    msg.isFromMentor
                      ? 'bg-accent text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}>
                    <p>{msg.content}</p>
                    <p className={`text-[9px] mt-1 opacity-60 uppercase tracking-wide ${msg.isFromMentor ? 'text-right' : ''}`}>
                      {msg.isFromMentor ? 'You' : selectedMentee.name?.split(' ')[0]} · {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-3 bg-white">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder={`Send guidance to ${selectedMentee.name?.split(' ')[0]}...`}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-accent outline-none text-sm"
                required
              />
              <button
                type="submit"
                disabled={sending}
                className="bg-accent text-white px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-accent-dark transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {sending ? '...' : 'Send'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Guidance;
