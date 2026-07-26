'use client';
import { useEffect, useState, useRef } from 'react';

interface Thread {
  id: string; status: string; createdAt: string; messages: string;
}

interface Message { sender: string; text: string; timestamp: string }

export default function TeacherChatPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newThread, setNewThread] = useState('');
  const messagesEnd = useRef<HTMLDivElement>(null);

  const load = () => {
    fetch('/api/teacher/chat').then(r => r.json()).then(d => { setThreads(d); setLoading(false); });
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [selected, threads]);

  const handleNewThread = async () => {
    if (!newThread.trim()) return;
    await fetch('/api/teacher/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: newThread }) });
    setNewThread(''); load();
  };

  const handleSend = async () => {
    if (!selected || !newMessage.trim()) return;
    await fetch('/api/teacher/chat/' + selected, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: newMessage }) });
    setNewMessage(''); load();
  };

  const selectedThread = threads.find(t => t.id === selected);
  const messages: Message[] = selectedThread ? JSON.parse(selectedThread.messages || '[]') : [];

  if (loading) return <p style={{ color: 'var(--text-mute)' }}>Loading...</p>;

  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 8 }}>Chat</h1>
      <p style={{ color: 'var(--ink-500)', fontSize: 15, marginBottom: 24 }}>Start a conversation with the admin team.</p>

      <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 220px)' }}>
        {/* Thread list */}
        <div style={{ width: 320, background: '#fff', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--ink-100)' }}>
            <button onClick={() => { setSelected(null); }} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none', background: !selected ? 'var(--blue)' : 'var(--ink-100)', color: !selected ? '#fff' : 'var(--ink-600)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>+ New Conversation</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {threads.length === 0 ? (
              <p style={{ color: 'var(--ink-400)', textAlign: 'center', padding: '40px 16px', fontSize: 13 }}>No conversations yet.</p>
            ) : threads.map(t => (
              <button key={t.id} onClick={() => setSelected(t.id)} style={{ width: '100%', textAlign: 'left', padding: '14px 16px', border: 'none', borderBottom: '1px solid var(--ink-100)', background: selected === t.id ? 'rgba(47,111,237,0.06)' : 'transparent', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--ink-900)' }}>Conversation</span>
                  <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: t.status === 'open' ? '#dcfce7' : '#e0e7ff', color: t.status === 'open' ? '#166534' : '#3730a3', textTransform: 'capitalize' }}>{t.status}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-400)', marginTop: 2 }}>{new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
              <p style={{ color: 'var(--ink-500)', fontSize: 14 }}>Start a new conversation or select an existing one.</p>
              <textarea value={newThread} onChange={e => setNewThread(e.target.value)} placeholder="What's on your mind?" style={{ width: '100%', maxWidth: 480, minHeight: 100, padding: 12, borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'Inter, sans-serif' }} />
              <button onClick={handleNewThread} disabled={!newThread.trim()} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: newThread.trim() ? 'var(--blue)' : 'var(--ink-200)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: newThread.trim() ? 'pointer' : 'not-allowed' }}>Send Message</button>
            </div>
          ) : (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Conversation</span>
                <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: selectedThread?.status === 'open' ? '#dcfce7' : '#e0e7ff', color: selectedThread?.status === 'open' ? '#166534' : '#3730a3', textTransform: 'capitalize' }}>{selectedThread?.status}</span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ maxWidth: '70%', alignSelf: m.sender === 'teacher' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ padding: '10px 14px', borderRadius: 12, background: m.sender === 'teacher' ? 'var(--blue)' : 'var(--ink-100)', color: m.sender === 'teacher' ? '#fff' : 'var(--ink-900)', fontSize: 14, lineHeight: 1.5 }}>{m.text}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink-400)', marginTop: 4, textAlign: m.sender === 'teacher' ? 'right' : 'left' }}>{new Date(m.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                ))}
                <div ref={messagesEnd} />
              </div>
              {selectedThread?.status === 'open' && (
                <div style={{ padding: '14px 20px', borderTop: '1px solid var(--ink-100)', display: 'flex', gap: 10 }}>
                  <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Type a message..." style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, outline: 'none' }} />
                  <button onClick={handleSend} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Send</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
