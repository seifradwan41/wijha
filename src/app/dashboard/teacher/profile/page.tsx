'use client';
import { useState, useEffect } from 'react';
import ImageUpload from '@/components/ImageUpload';
import { sanitizeCssUrl } from '@/lib/url-utils';

interface Category { id: string; name: string; subcategories: { id: string; name: string }[] }

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState({
    name: '', description: '', teachingStyle: '', specialties: '',
    categories: '', subcategories: '', whatsappContact: '',
    avatarPhoto: '', bannerPhoto: '', profileStatus: 'draft',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/teacher/profile').then(r => r.json()),
      fetch('/api/admin/taxonomy/categories').then(r => r.json()),
    ]).then(([data, cats]) => {
      setCategories(cats);
      if (data) {
        setProfile({
          name: data.name || '',
          description: data.description || '',
          teachingStyle: data.teachingStyle || '',
          specialties: (data.specialties || []).join(', '),
          categories: (data.categories || []).join(', '),
          subcategories: (data.subcategories || []).join(', '),
          whatsappContact: data.whatsappContact || '',
          avatarPhoto: data.avatarPhoto || '',
          bannerPhoto: data.bannerPhoto || '',
          profileStatus: data.profileStatus || 'draft',
        });
        setSelectedCats(data.categories || []);
        setSelectedSubs(data.subcategories || []);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setProfile(prev => ({ ...prev, categories: selectedCats.join(', '), subcategories: selectedSubs.join(', ') }));
  }, [selectedCats, selectedSubs]);

  const toggleCat = (name: string) => {
    setSelectedCats(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);
  };

  const toggleSub = (qualified: string) => {
    setSelectedSubs(prev => {
      if (prev.includes(qualified)) return prev.filter(s => s !== qualified);
      const name = qualified.split('::')[1];
      return [...prev.filter(s => s !== name), qualified];
    });
  };

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch('/api/teacher/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...profile,
        categories: selectedCats,
        subcategories: selectedSubs,
        specialties: profile.specialties.split(',').map(s => s.trim()).filter(Boolean),
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', borderRadius: 100, border: '1px solid', fontSize: 13, cursor: 'pointer',
    background: active ? 'var(--blue)' : '#fff',
    color: active ? '#fff' : 'var(--ink-600)',
    borderColor: active ? 'var(--blue)' : 'var(--ink-200)',
  });

  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid rgba(27,31,42,0.12)', fontSize: 14, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box', background: '#fff', transition: 'border-color 0.2s' };
  const labelStyle: React.CSSProperties = { display: 'block', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-mute)', marginBottom: 7 };

  const specialtiesList = profile.specialties.split(',').map(s => s.trim()).filter(Boolean);
  const initials = profile.name.split(' ').map(w => w[0]).slice(0, 2).join('');

  if (loading) return <div style={{ padding: 40, color: 'var(--text-mute)' }}>Loading profile...</div>;

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1>Edit Profile</h1>
          <div className="dash-header-sub">Update your public profile. Preview how it looks on the right.</div>
        </div>
      </div>

      <div className="profile-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>
        {/* Editor */}
        <div className="dash-card">
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, marginBottom: 20 }}>Basic Info</h3>
          <div className="profile-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input style={inputStyle} value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} placeholder="Your full name" />
            </div>
            <div>
              <label style={labelStyle}>WhatsApp Contact</label>
              <input style={inputStyle} value={profile.whatsappContact} onChange={e => setProfile({...profile, whatsappContact: e.target.value})} placeholder="+966 5x xxx xxxx" />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>About / Description</label>
            <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' as const }} value={profile.description} onChange={e => setProfile({...profile, description: e.target.value})} placeholder="Tell students about your background and approach..." />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Teaching Style</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' as const }} value={profile.teachingStyle} onChange={e => setProfile({...profile, teachingStyle: e.target.value})} placeholder="How do you teach? What's your approach?" />
          </div>

          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, marginBottom: 16, paddingTop: 20, borderTop: '1px solid rgba(27,31,42,0.06)' }}>Categories &amp; Specialties</h3>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Categories</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {categories.map(c => (
                <button key={c.id} type="button" onClick={() => toggleCat(c.name)} style={chipStyle(selectedCats.includes(c.name))}>{c.name}</button>
              ))}
              {categories.length === 0 && <span style={{ fontSize: 13, color: 'var(--ink-400)' }}>No categories available yet.</span>}
            </div>
          </div>

  <div style={{ marginBottom: 24 }}>
    <label style={labelStyle}>Subcategories</label>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
      {categories
        .filter(c => selectedCats.includes(c.name) || selectedCats.length === 0)
        .map(c => (
          <div key={c.id}>
            <div style={{ fontSize: 11, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--text-mute)', marginBottom: 6 }}>{c.name}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {c.subcategories.map(s => {
                const qualified = `${c.name}::${s.name}`;
                return (
                  <button key={s.id} type="button" onClick={() => toggleSub(qualified)} style={chipStyle(selectedSubs.includes(qualified) || selectedSubs.includes(s.name))}>{s.name}</button>
                );
              })}
            </div>
          </div>
        ))}
      {categories.flatMap(c => c.subcategories).length === 0 && <span style={{ fontSize: 13, color: 'var(--ink-400)' }}>No subcategories available yet.</span>}
    </div>
  </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Specialties</label>
            <input style={inputStyle} value={profile.specialties} onChange={e => setProfile({...profile, specialties: e.target.value})} placeholder="Advanced, Test-Prep, Foundation" />
          </div>

          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, marginBottom: 16, paddingTop: 20, borderTop: '1px solid rgba(27,31,42,0.06)' }}>Photos</h3>
          <div className="profile-fields" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
            <ImageUpload
              label="Avatar Photo"
              currentImage={profile.avatarPhoto}
              onUpload={url => setProfile({...profile, avatarPhoto: url})}
            />
            <ImageUpload
              label="Banner Photo"
              currentImage={profile.bannerPhoto}
              onUpload={url => setProfile({...profile, bannerPhoto: url})}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 20, borderTop: '1px solid rgba(27,31,42,0.06)' }}>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {profile.profileStatus !== 'published' && (
              <button onClick={async () => {
                setSaving(true);
                const body = {
                  ...profile,
                  categories: selectedCats,
                  subcategories: selectedSubs,
                  specialties: profile.specialties.split(',').map(s => s.trim()).filter(Boolean),
                  profileStatus: 'published',
                };
                await fetch('/api/teacher/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                setProfile(prev => ({ ...prev, profileStatus: 'published' }));
                setSaving(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
              }} disabled={saving} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', opacity: saving ? 0.5 : 1 }}>
                {saving ? 'Publishing...' : 'Publish Profile'}
              </button>
            )}
            {profile.profileStatus === 'published' && (
              <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1C4.14 1 1 4.14 1 8s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm-1 11L3 8l1.5-1.5L7 9l4.5-4.5L13 6l-6 6z" fill="#16a34a"/></svg>
                Profile is published — visible to students
              </span>
            )}
            {saved && profile.profileStatus !== 'published' && <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>✓ Saved</span>}
          </div>
        </div>

        {/* Live Preview */}
        <div style={{ position: 'sticky', top: 20 }}>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-mute)', marginBottom: 10 }}>Live Preview</div>
          <div className="dash-card" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ height: 100, background: sanitizeCssUrl(profile.bannerPhoto) ? `url(${sanitizeCssUrl(profile.bannerPhoto)}) center/cover` : 'linear-gradient(135deg, var(--ink-700), var(--ink-900))' }} />
            <div style={{ padding: '0 22px 22px', textAlign: 'center', marginTop: -36 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: sanitizeCssUrl(profile.avatarPhoto) ? `url(${sanitizeCssUrl(profile.avatarPhoto)}) center/cover` : 'linear-gradient(135deg, var(--blue), var(--teal))', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 24, color: '#fff', border: '3px solid #fff' }}>
                {!profile.avatarPhoto && (initials || '?')}
              </div>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, margin: '0 0 4px' }}>{profile.name || 'Your Name'}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-mute)', margin: '0 0 12px' }}>{selectedCats.join(', ') || 'Category'}</p>
              {specialtiesList.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 14 }}>
                  {specialtiesList.map(s => (
                    <span key={s} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: 'var(--paper)', color: 'var(--text-mute)' }}>{s}</span>
                  ))}
                </div>
              )}
              {profile.description && (
                <p style={{ fontSize: 12, color: 'var(--text-mute)', lineHeight: 1.6, margin: 0 }}>{profile.description.slice(0, 120)}{profile.description.length > 120 ? '...' : ''}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
