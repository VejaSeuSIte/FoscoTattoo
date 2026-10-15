'use client';
import { useEffect, useRef } from 'react';

// aparece suave quando entra na tela
export default function Revelar({ as: Tag = 'div', atraso = 0, className = '', children, ...resto }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('visivel');
      return;
    }
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add('visivel');
            io.disconnect();
          }
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`revelar ${className}`} style={{ transitionDelay: `${atraso}ms` }} {...resto}>
      {children}
    </Tag>
  );
}
