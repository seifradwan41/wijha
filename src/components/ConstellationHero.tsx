'use client';
import { useEffect, useRef } from 'react';

export default function ConstellationHero() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const svgNS = 'http://www.w3.org/2000/svg';

    function sizeSVG() {
      svg!.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
    }
    sizeSVG();
    window.addEventListener('resize', sizeSVG);

    const cx = () => window.innerWidth * 0.72;
    const cy = () => window.innerHeight * 0.42;
    const points = Array.from({ length: 16 }).map(() => ({
      angle: Math.random() * Math.PI * 2,
      dist: 160 + Math.random() * 260,
      r: 2 + Math.random() * 2.4,
      speed: 0.3 + Math.random() * 0.4,
      phase: Math.random() * Math.PI * 2,
    }));

    const circles: SVGCircleElement[] = [];
    const lines: SVGLineElement[] = [];

    points.forEach(() => {
      const c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('r', '0');
      c.setAttribute('fill', '#2F6FED');
      c.setAttribute('opacity', '0.55');
      svg.appendChild(c);
      circles.push(c);
    });
    points.forEach(() => {
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('stroke', '#3A465E');
      line.setAttribute('stroke-width', '0.6');
      line.setAttribute('opacity', '0.35');
      svg.insertBefore(line, svg.firstChild);
      lines.push(line);
    });

    let t = 0;
    let raf: number;
    function animate() {
      t += reduceMotion ? 0 : 0.01;
      const centerX = cx();
      const centerY = cy();
      points.forEach((p, i) => {
        const wobble = Math.sin(t * p.speed + p.phase) * 10;
        const x = centerX + Math.cos(p.angle) * (p.dist + wobble);
        const y = centerY + Math.sin(p.angle) * (p.dist + wobble) * 0.6;
        circles[i].setAttribute('cx', String(x));
        circles[i].setAttribute('cy', String(y));
        circles[i].setAttribute('r', String(p.r));
        lines[i].setAttribute('x1', String(x));
        lines[i].setAttribute('y1', String(y));
        lines[i].setAttribute('x2', String(centerX));
        lines[i].setAttribute('y2', String(centerY));
      });
      raf = requestAnimationFrame(animate);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', sizeSVG);
    };
  }, []);

  return (
    <section className="hero">
      <svg ref={svgRef} id="constellation" />
      <div className="hero-inner">
        <div className="eyebrow">SAT · ACT · ONE DESTINATION</div>
        <h1>Every trusted course,<br /><em>finally</em> in one place.</h1>
        <p>Wijha brings the SAT and ACT teachers you already know — and the ones you don&apos;t yet — out of scattered WhatsApp groups and into a single, searchable home.</p>
        <div className="hero-ctas">
          <a href="#search" className="btn-primary">Find your course</a>
          <a href="#teachers" className="btn-ghost">Meet the teachers</a>
        </div>
      </div>
    </section>
  );
}
