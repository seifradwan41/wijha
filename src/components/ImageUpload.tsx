'use client';
import { useRef, useState } from 'react';

interface Props {
  currentImage?: string;
  onUpload: (url: string) => void;
  label?: string;
  className?: string;
}

export default function ImageUpload({ currentImage, onUpload, label, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    setError('');
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setPreview(data.url);
      onUpload(data.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {label && (
        <label style={{ display: 'block', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-mute)', marginBottom: 7 }}>{label}</label>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        className={className}
        style={{
          width: '100%',
          minHeight: 100,
          borderRadius: 12,
          border: '2px dashed rgba(27,31,42,0.15)',
          background: preview ? `url(${preview}) center/cover no-repeat` : 'var(--paper)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.2s',
          overflow: 'hidden',
          position: 'relative',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--blue)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(27,31,42,0.15)')}
      >
        {!preview && (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 6, opacity: 0.3 }}>{uploading ? '...' : '+'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>{uploading ? 'Uploading...' : 'Click to upload'}</div>
          </div>
        )}
        {uploading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>Uploading...</div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      {error && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 6 }}>{error}</div>}
      {preview && (
        <button onClick={e => { e.stopPropagation(); setPreview(''); onUpload(''); }} style={{ marginTop: 6, fontSize: 11, color: 'var(--text-mute)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Remove image</button>
      )}
    </div>
  );
}
