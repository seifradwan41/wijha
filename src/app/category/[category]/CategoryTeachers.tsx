'use client';
import { useEffect, useRef } from 'react';

interface Teacher {
  id: string;
  name: string;
  categories: string[];
  subcategories: string[];
}

export default function CategoryTeachers({ teachers }: { teachers: Teacher[] }) {
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = document.querySelectorAll('.path-card');
    cards.forEach((card) => {
      const sub = (card as HTMLElement).dataset.sub || '';
      const filtered = sub ? teachers.filter(t => t.subcategories.includes(sub)) : teachers;
      if (filtered.length === 0) return;
      const photo = card.querySelector('.rot-photo') as HTMLElement;
      const caption = card.querySelector('.rot-caption') as HTMLElement;
      const nameEl = card.querySelector('.rot-name') as HTMLElement;
      const specEl = card.querySelector('.rot-spec') as HTMLElement;
      const dotsWrap = card.querySelector('.rot-dots') as HTMLElement;
      dotsWrap.innerHTML = filtered.map(() => '<span></span>').join('');
      const dots = dotsWrap.querySelectorAll('span');
      let i = 0;
      function render(idx: number) {
        const t = filtered[idx];
        if (!t) return;
        const initials = t.name.split(' ').map((w) => w[0]).slice(0, 2).join('');
        photo.textContent = initials;
        photo.style.background = 'var(--blue)';
        nameEl.textContent = t.name;
        specEl.textContent = t.subcategories.join(', ');
        dots.forEach((d, di) => d.classList.toggle('active', di === idx));
      }
      render(0);
      if (filtered.length > 1 && !reduceMotionRef.current) {
        setInterval(() => {
          photo.classList.add('is-out');
          caption.classList.add('is-out');
          setTimeout(() => {
            i = (i + 1) % filtered.length;
            render(i);
            photo.classList.remove('is-out');
            caption.classList.remove('is-out');
          }, 500);
        }, 4500 + Math.random() * 1000);
      }
    });
  }, [teachers]);

  return null;
}
