'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';

const teachersByCategory: Record<string, { name: string; subject: string; color: string }[]> = {
  sat: [
    { name: 'Amr Mustafa', subject: 'Math · Basics & Advanced', color: 'var(--blue)' },
    { name: 'Sarah Johnson', subject: 'English/RW · Foundation', color: 'var(--blue-soft)' },
  ],
  act: [
    { name: 'Michael Chen', subject: 'Science · Full Course', color: 'var(--teal)' },
    { name: 'Sarah Johnson', subject: 'English · Trial Prep', color: 'var(--teal-soft)' },
  ],
  other: [
    { name: 'Aisha Ali', subject: 'University Admissions Counseling', color: 'var(--slate)' },
  ],
};

const categories = [
  { key: 'sat', label: 'SAT', title: 'Digital SAT', desc: 'Math and Reading & Writing, from first-time Basics to Advanced and trial-specific Test-Prep.', href: '/category/SAT' },
  { key: 'act', label: 'ACT', title: 'ACT', desc: 'Math, English, Biology and Science courses, including full-length trial revision programs.', href: '/category/ACT' },
  { key: 'other', label: 'Other', title: 'Other', desc: 'University admissions counseling, aptitude tests, and subject-specific prep outside SAT/ACT.', href: '/category/Other' },
];

export default function CategoryPaths() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = containerRef.current?.querySelectorAll('.path-card');
    cards?.forEach((card) => {
      const cat = (card as HTMLElement).dataset.cat;
      const list = teachersByCategory[cat || ''] || [];
      if (!list.length) return;

      const photo = card.querySelector('.rot-photo') as HTMLElement;
      const caption = card.querySelector('.rot-caption') as HTMLElement;
      const nameEl = card.querySelector('.rot-name') as HTMLElement;
      const specEl = card.querySelector('.rot-spec') as HTMLElement;
      const dotsWrap = card.querySelector('.rot-dots') as HTMLElement;
      dotsWrap.innerHTML = list.map(() => '<span></span>').join('');
      const dots = dotsWrap.querySelectorAll('span');
      let i = 0;

      function render(idx: number) {
        const t = list[idx];
        const initials = t.name.split(' ').map((w) => w[0]).slice(0, 2).join('');
        photo.textContent = initials;
        photo.style.background = t.color;
        nameEl.textContent = t.name;
        specEl.textContent = t.subject;
        dots.forEach((d, di) => d.classList.toggle('active', di === idx));
      }
      render(0);

      if (list.length > 1 && !reduceMotion) {
        setInterval(() => {
          photo.classList.add('is-out');
          caption.classList.add('is-out');
          setTimeout(() => {
            i = (i + 1) % list.length;
            render(i);
            photo.classList.remove('is-out');
            caption.classList.remove('is-out');
          }, 500);
        }, 4500 + Math.random() * 1000);
      }
    });
  }, []);

  return (
    <section className="block" id="paths">
      <div className="section-head">
        <span className="eyebrow2">Start here</span>
        <h2>Which category are you preparing for?</h2>
        <p>Every course on Wijha is organized under SAT, ACT, or Other — pick yours to see levels, schedules, and the teachers currently teaching it.</p>
      </div>
      <div className="paths" ref={containerRef}>
        {categories.map((cat) => (
          <Link key={cat.key} href={cat.href} className={`path-card ${cat.key}`} data-cat={cat.key}>
            <div className="rot-photo-wrap"><div className="rot-photo" /></div>
            <span className="badge-pill">{cat.label}</span>
            <h3>{cat.title}</h3>
            <p>{cat.desc}</p>
            <div className="rot-caption"><div className="rot-name" /><div className="rot-spec" /></div>
            <div className="rot-dots" />
            <span className="go">Browse subjects <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8H14M14 8L9 3M14 8L9 13" stroke="currentColor" strokeWidth="1.5" /></svg></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
