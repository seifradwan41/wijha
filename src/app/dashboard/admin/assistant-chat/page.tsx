'use client';
import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface Message {
  id: string; senderId: string; recipientId: string; text: string | null; imageAttachment: string | null; timestamp: string; readStatus: boolean;
}

interface User { id: string; name: string }
interface WatchWordHit { id: string; wordId: string; fullMessageText: string; timestamp: string; adminAssistant: { id: string; name: string }; word: { id: string; word: string } }

export default function AssistantChatPage() {
  const { data: session } = useSession();
  const userId = (session?.user as Record<string, unknown>)?.userId as string;
  const role = (session?.user as Record<string, unknown>)?.role as string;
  const isAdmin = role === 'admin';

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [assistants, setAssistants] = useState<User[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<string>('');
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const messagesEnd = useRef<HTMLDivElement>(null);

  const [watchWords, setWatchWords] = useState<{id:string;word:string;triggerCount:number}[]>([]);
  const [watchHits, setWatchHits] = useState<WatchWordHit[]>([]);
  const [newWord, setNewWord] = useState('');
  const [showHits, setShowHits] = useState(false);

  const load = () => {
    fetch('/api/admin/assistant-chat').then(r => r.json()).then((data: Message[]) => { setMessages(data); setLoading(false); });
  };

  const loadWords = () => {
    fetch('/api/admin/watchwords').then(r => r.json()).then((data: {id:string;word:string;triggerCount:number}[] | {error:string}) => {
      if (Array.isArray(data)) setWatchWords(data);
    });
    fetch('/api/admin/watchwords/hits').then(r => r.json()).then((data: WatchWordHit[] | {error:string}) => {
      if (Array.isArray(data)) setWatchHits(data);
    });
  };

  useEffect(() => {
    load();
    if (isAdmin) {
      fetch('/api/admin/assistants').then(r => r.json()).then((data: User[] | {error:string}) => { if (Array.isArray(data)) setAssistants(data); });
      loadWords();
    }
  }, [isAdmin]);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const lastLoggedRef = useRef<string>('');

  useEffect(() => {
    if (!isAdmin || !selectedAssistant || !newMessage.trim() || watchWords.length === 0) return;
    const lower = newMessage.toLowerCase();
    const matched = watchWords.filter(w => lower.includes(w.word.toLowerCase()));
    if (matched.length === 0) return;
    const key = matched.map(w => w.word).sort().join(',');
    if (key === lastLoggedRef.current) return;
    lastLoggedRef.current = key;
    const timer = setTimeout(() => {
      fetch('/api/admin/watchwords/hits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: newMessage, assistantId: selectedAssistant }) });
      loadWords();
    }, 600);
    return () => clearTimeout(timer);
  }, [newMessage, isAdmin, selectedAssistant, watchWords]);

  const handleSend = async () => {
    if ((!newMessage.trim() && !pendingImage)) return;
    const body: Record<string, unknown> = { text: newMessage, imageAttachment: pendingImage };
    if (isAdmin && selectedAssistant) body.recipientId = selectedAssistant;
    await fetch('/api/admin/assistant-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

    // Record watch word hits
    if (isAdmin && selectedAssistant && newMessage.trim()) {
      await fetch('/api/admin/watchwords/hits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: newMessage, assistantId: selectedAssistant }) });
      loadWords();
    }

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

  const addWord = async () => {
    if (!newWord.trim()) return;
    await fetch('/api/admin/watchwords', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word: newWord.trim() }) });
    setNewWord(''); loadWords();
  };

  const deleteWord = async (id: string) => {
    await fetch('/api/admin/watchwords', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    loadWords();
  };

  const filteredMessages = isAdmin && selectedAssistant
    ? messages.filter(m => (m.senderId === userId && m.recipientId === selectedAssistant) || (m.senderId === selectedAssistant && m.recipientId === userId))
    : isAdmin ? [] : messages;

  const highlightText = (text: string) => {
    if (!isAdmin || watchWords.length === 0) return <>{text}</>;
    const lowerText = text.toLowerCase();
    const matched = watchWords.filter(w => lowerText.includes(w.word.toLowerCase()));
    if (matched.length === 0) return <>{text}</>;
    let parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const lower = text.toLowerCase();
    const hits = matched.map(w => {
      const positions: number[] = [];
      let pos = lower.indexOf(w.word.toLowerCase(), 0);
      while (pos !== -1) { positions.push(pos); pos = lower.indexOf(w.word.toLowerCase(), pos + 1); }
      return { word: w.word, positions };
    }).filter(h => h.positions.length > 0).sort((a, b) => a.positions[0] - b.positions[0]);
    const usedPositions = new Set<number>();
    for (const hit of hits) {
      for (const pos of hit.positions) {
        if (usedPositions.has(pos)) continue;
        if (pos > lastIndex) parts.push(text.slice(lastIndex, pos));
        parts.push(<span key={`${pos}-${hit.word}`} style={{ background: '#fef08a', color: 'var(--ink-900)', padding: '0 2px', borderRadius: 2 }}>{text.slice(pos, pos + hit.word.length)}</span>);
        lastIndex = pos + hit.word.length;
        usedPositions.add(pos);
      }
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return <>{parts}</>;
  };

  if (loading) return <p style={{ color: 'var(--ink-500)' }}>Loading...</p>;

  return (
    <div>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: 'var(--ink-900)', marginBottom: 8 }}>
        {isAdmin ? 'Assistant Chat' : 'Chat with Admin'}
      </h1>
      <p style={{ color: 'var(--ink-500)', fontSize: 15, marginBottom: 24 }}>
        {isAdmin ? 'Direct messages with your admin assistants.' : 'Send messages and files to the admin team.'}
      </p>

      {isAdmin && (
        <div style={{ marginBottom: 24, padding: 20, background: '#fff', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-900)' }}>Watch Words</h2>
            <button onClick={() => setShowHits(!showHits)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--ink-200)', background: '#fff', fontSize: 12, cursor: 'pointer' }}>
              {showHits ? `Hide Hits (${watchHits.length})` : `View Hits (${watchHits.length})`}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input value={newWord} onChange={e => setNewWord(e.target.value)} onKeyDown={e => e.key === 'Enter' && addWord()} placeholder="Add watch word..." style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--ink-200)', fontSize: 14 }} />
            <button onClick={addWord} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Add</button>
          </div>
          {watchWords.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {watchWords.map(w => (
                <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, background: 'var(--ink-100)', fontSize: 13 }}>
                  <span style={{ fontWeight: 500 }}>{w.word}</span>
                  <span style={{ color: 'var(--ink-400)', fontSize: 11 }}>({w.triggerCount})</span>
                  <button onClick={() => deleteWord(w.id)} style={{ background: 'none', border: 'none', color: 'var(--ink-400)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>&times;</button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--ink-400)', fontSize: 13 }}>No watch words configured.</p>
          )}
          {showHits && (
            <div style={{ marginTop: 12, borderTop: '1px solid var(--ink-100)', paddingTop: 12 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Recent Hits</h3>
              {watchHits.length === 0 ? (
                <p style={{ color: 'var(--ink-400)', fontSize: 13 }}>No hits recorded yet.</p>
              ) : (
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {watchHits.map(h => (
                    <div key={h.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--ink-100)', fontSize: 13 }}>
                      <div style={{ fontWeight: 500, color: 'var(--ink-900)' }}>&quot;{h.word?.word}&quot; — {h.adminAssistant?.name}</div>
                      <div style={{ color: 'var(--ink-400)', fontSize: 12 }}>{new Date(h.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                      <div style={{ color: 'var(--ink-500)', fontSize: 12, marginTop: 4 }}>&quot;{h.fullMessageText.slice(0, 100)}&quot;</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 200px)' }}>
        {isAdmin && (
          <div style={{ width: 280, background: '#fff', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--ink-100)', fontWeight: 600, fontSize: 14 }}>Assistants</div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {assistants.length === 0 ? (
                <p style={{ color: 'var(--ink-400)', textAlign: 'center', padding: '40px 16px', fontSize: 13 }}>No assistants.</p>
              ) : assistants.map(a => (
                <button key={a.id} onClick={() => setSelectedAssistant(a.id)} style={{ width: '100%', textAlign: 'left', padding: '14px 16px', border: 'none', borderBottom: '1px solid var(--ink-100)', background: selectedAssistant === a.id ? 'rgba(47,111,237,0.06)' : 'transparent', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #dc2626, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                      {a.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                    </div>
                    <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--ink-900)' }}>{a.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ flex: 1, background: '#fff', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
          {isAdmin && !selectedAssistant ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-400)' }}>Select an assistant to start chatting</div>
          ) : (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredMessages.map((m) => {
                  const isMe = m.senderId === userId;
                  return (
                    <div key={m.id} style={{ maxWidth: '70%', alignSelf: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{ padding: '10px 14px', borderRadius: 12, background: isMe ? 'var(--blue)' : 'var(--ink-100)', color: isMe ? '#fff' : 'var(--ink-900)', fontSize: 14, lineHeight: 1.5 }}>
                        {m.text ? highlightText(m.text) : ''}
                        {m.imageAttachment && (
                          <div style={{ marginTop: m.text ? 8 : 0 }}>
                            <img src={m.imageAttachment} alt="Attachment" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, cursor: 'pointer' }} onClick={() => window.open(m.imageAttachment!, '_blank')} />
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--ink-400)', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>{new Date(m.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  );
                })}
                <div ref={messagesEnd} />
              </div>

              {pendingImage && (
                <div style={{ padding: '0 20px', paddingBottom: 10 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 8, background: 'var(--ink-100)' }}>
                    <img src={pendingImage} alt="Preview" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                    <button onClick={() => setPendingImage(null)} style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                  </div>
                </div>
              )}
              {uploadingImg && <div style={{ padding: '0 20px', fontSize: 12, color: 'var(--ink-400)', paddingBottom: 8 }}>Uploading image...</div>}

              <div style={{ padding: '14px 20px', borderTop: '1px solid var(--ink-100)' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }} />
                  <button onClick={() => fileRef.current?.click()} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--ink-200)', background: '#fff', fontSize: 16, cursor: 'pointer', flexShrink: 0 }} title="Attach image">&#128206;</button>
                  <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Type a message..." style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, outline: 'none' }} />
                  <button onClick={handleSend} style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Send</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
