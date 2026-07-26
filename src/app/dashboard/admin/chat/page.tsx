'use client';
import { useEffect, useState, useRef } from 'react';

interface Thread {
  id: string; status: string; createdAt: string;
  opener: { id: string; name: string };
  messages: string;
}

interface Message {
  sender: string; text: string; imageAttachment?: string | null; timestamp: string;
}

export default function ChatPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);

  const load = () => {
    fetch('/api/admin/chat').then(r => r.json()).then((data: Thread[]) => { setThreads(data); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [selected, threads]);

  const handleSend = async () => {
    if (!selected || (!newMessage.trim() && !pendingImage)) return;
    await fetch('/api/admin/chat/' + selected, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: newMessage, imageAttachment: pendingImage }) });
    setNewMessage(''); setPendingImage(null); load();
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImg(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) setPendingImage(data.url);
    } catch {}
    setUploadingImg(false);
  };

  const handleResolve = async (id: string) => {
    await fetch('/api/admin/chat/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'resolved' }) });
    load();
  };

  const selectedThread = threads.find(t => t.id === selected);
  const messages: Message[] = selectedThread ? JSON.parse(selectedThread.messages || '[]') : [];

  if (loading) return <p style={{ color: 'var(--ink-500)' }}>Loading...</p>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 8 }}>Chat</h1>
        <p style={{ color: 'var(--ink-500)', fontSize: 15 }}>Feature requests and questions from teachers and collaborators.</p>
      </div>

      <div className="chat-layout" style={{ display: 'flex', gap: 20, height: 'calc(100vh - 200px)' }}>
        {/* Thread list */}
        <div className="chat-sidebar" style={{ width: 320, background: '#fff', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--ink-100)', fontWeight: 600, fontSize: 14 }}>Threads ({threads.length})</div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {threads.length === 0 ? (
              <p style={{ color: 'var(--ink-400)', textAlign: 'center', padding: '40px 16px', fontSize: 13 }}>No conversations yet.</p>
            ) : threads.map(t => (
              <button key={t.id} onClick={() => setSelected(t.id)} style={{ width: '100%', textAlign: 'left', padding: '14px 16px', border: 'none', borderBottom: '1px solid var(--ink-100)', background: selected === t.id ? 'rgba(47,111,237,0.06)' : 'transparent', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--ink-900)' }}>{t.opener.name}</span>
                  <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: t.status === 'open' ? '#dcfce7' : '#e0e7ff', color: t.status === 'open' ? '#166534' : '#3730a3', textTransform: 'capitalize' }}>{t.status}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-400)' }}>{new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="chat-container" style={{ flex: 1, background: '#fff', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-400)' }}>Select a thread to start chatting</div>
          ) : (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--ink-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{selectedThread?.opener.name}</span>
                  <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: selectedThread?.status === 'open' ? '#dcfce7' : '#e0e7ff', color: selectedThread?.status === 'open' ? '#166534' : '#3730a3', textTransform: 'capitalize' }}>{selectedThread?.status}</span>
                </div>
                {selectedThread?.status === 'open' && (
                  <button onClick={() => handleResolve(selected)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--ink-200)', background: '#fff', fontSize: 12, cursor: 'pointer' }}>Mark Resolved</button>
                )}
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ maxWidth: '70%', alignSelf: m.sender === 'admin' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ padding: '10px 14px', borderRadius: 12, background: m.sender === 'admin' ? 'var(--blue)' : 'var(--ink-100)', color: m.sender === 'admin' ? '#fff' : 'var(--ink-900)', fontSize: 14, lineHeight: 1.5 }}>
                      {m.text && m.text}
                      {m.imageAttachment && (
                        <div style={{ marginTop: m.text ? 8 : 0 }}>
                          <img src={m.imageAttachment} alt="Attachment" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, cursor: 'pointer' }} onClick={() => window.open(m.imageAttachment!, '_blank')} />
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--ink-400)', marginTop: 4, textAlign: m.sender === 'admin' ? 'right' : 'left' }}>{new Date(m.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                ))}
                <div ref={messagesEnd} />
              </div>
              {selectedThread?.status === 'open' && (
                <div style={{ padding: '14px 20px', borderTop: '1px solid var(--ink-100)' }}>
                  {pendingImage && (
                    <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <img src={pendingImage} alt="Attachment" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                      <button onClick={() => setPendingImage(null)} style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                    </div>
                  )}
                  {uploadingImg && <div style={{ fontSize: 12, color: 'var(--ink-400)', marginBottom: 8 }}>Uploading image...</div>}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }} />
                    <button onClick={() => fileRef.current?.click()} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--ink-200)', background: '#fff', fontSize: 16, cursor: 'pointer', flexShrink: 0 }} title="Attach image">&#128206;</button>
                    <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Type a message..." style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, outline: 'none' }} />
                    <button onClick={handleSend} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Send</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
