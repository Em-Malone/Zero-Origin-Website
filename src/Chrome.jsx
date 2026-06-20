// Shared UI — nav, compact footer, project detail modal.

import React from 'react';
import { ZOMark } from './ZOMark.jsx';
import { MoodyPlaceholder } from './MoodyPlaceholder.jsx';

export function Nav({ route, goto, logo }) {
  const links = [
    ['projects', 'Projects'],
    ['products', 'Products'],
    ['contact', 'Contact'],
  ];
  return (
    <nav className="zo-nav">
      <a href="#home" className="zo-nav-brand"
         onClick={(e) => { e.preventDefault(); goto('home'); }}
         aria-label="Zero Origin — Home">
        <ZOMark size={24} variant={logo} />
        <span className="zo-nav-brand-text">Zero Origin</span>
      </a>
      <div className="zo-nav-links">
        {links.map(([key, label], i) => (
          <a key={key} href={`#${key}`}
             onClick={(e) => { e.preventDefault(); goto(key); }}
             className={`zo-nav-link ${route === key ? 'is-active' : ''}`}>
            <span className="zo-nav-num">{String(i + 1).padStart(2, '0')}</span>
            <span>{label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="zo-footer">
      <div className="zo-footer-row">
        <div className="zo-footer-col">
          <span className="zo-footer-muted">Zero Origin Ltd · Technical services for live entertainment</span>
        </div>
        <div className="zo-footer-col">
          <span className="zo-footer-muted">est. 2014 · London</span>
        </div>
      </div>
    </footer>
  );
}

// Build a list of gallery slides for a project. Today these are generated
// moody placeholders (varied seed + palette); to use real photography later,
// give each project an `images: [url, ...]` array and map over that instead.
function projectSlides(project) {
  if (project.images && project.images.length) {
    return project.images.map((src) => ({ type: 'image', src }));
  }
  const palettes = ['cool', 'warm', 'magenta', 'mono'];
  const base = project.title.length + project.year;
  const count = 4;
  return Array.from({ length: count }).map((_, i) => ({
    type: 'placeholder',
    seed: base + i * 7,
    palette: i === 0 ? project.palette : palettes[(palettes.indexOf(project.palette) + i) % palettes.length],
  }));
}

function ProjectGallery({ project }) {
  const slides = React.useMemo(() => projectSlides(project), [project]);
  const [i, setI] = React.useState(0);
  const trackRef = React.useRef(null);
  const single = slides.length < 2;

  const go = React.useCallback((dir) => {
    setI((prev) => (prev + dir + slides.length) % slides.length);
  }, [slides.length]);

  // Scroll the snap track to the active slide whenever the index changes.
  React.useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollLeft = i * el.clientWidth;
  }, [i]);

  // Arrow-key nav while the modal is open.
  React.useEffect(() => {
    if (single) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, single]);

  // Keep the dots/counter in sync when the user swipes the track directly.
  const onScroll = React.useCallback(() => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setI((prev) => (idx !== prev && idx >= 0 && idx < slides.length ? idx : prev));
  }, [slides.length]);

  return (
    <div className="zo-gallery">
      <div className="zo-gallery-track" ref={trackRef} onScroll={onScroll}>
        {slides.map((s, idx) => (
          <div className="zo-gallery-slide" key={idx}>
            {s.type === 'image' ? (
              <img src={s.src} alt={`${project.title} — ${idx + 1}`} className="zo-gallery-img" />
            ) : (
              <MoodyPlaceholder seed={s.seed} palette={s.palette} aspect="16/9" />
            )}
          </div>
        ))}
      </div>

      <div className="zo-gallery-tag">{project.discipline} · {project.year}</div>

      {!single && (
        <React.Fragment>
          <button className="zo-gallery-arrow zo-gallery-prev" onClick={() => go(-1)} aria-label="Previous image">
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M10 2 L4 8 L10 14" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
          </button>
          <button className="zo-gallery-arrow zo-gallery-next" onClick={() => go(1)} aria-label="Next image">
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M6 2 L12 8 L6 14" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
          </button>
          <div className="zo-gallery-dots">
            {slides.map((_, idx) => (
              <button
                key={idx}
                className={`zo-gallery-dot ${idx === i ? 'is-active' : ''}`}
                onClick={() => setI(idx)}
                aria-label={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
          <div className="zo-gallery-count">{String(i + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</div>
        </React.Fragment>
      )}
    </div>
  );
}

export function ProjectDetail({ project, onClose }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!project) return null;
  return (
    <div className="zo-modal" onClick={onClose}>
      <div className="zo-modal-inner" onClick={(e) => e.stopPropagation()}>
        <button className="zo-modal-close" onClick={onClose} aria-label="Close">
          <span>Close</span>
          <svg width="12" height="12" viewBox="0 0 14 14"><path d="M1 1 L13 13 M13 1 L1 13" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
        </button>
        <div className="zo-modal-media">
          <ProjectGallery project={project} />
        </div>
        <div className="zo-modal-body">
          <div className="zo-modal-meta">
            <span>{project.discipline}</span>
            <span className="zo-dot" />
            <span>{project.year}</span>
            <span className="zo-dot" />
            <span>{project.venue}</span>
          </div>
          <h2 className="zo-modal-title">{project.title}</h2>
          <p className="zo-modal-summary">{project.summary}</p>
          <div className="zo-modal-role">
            <div className="zo-field-label">Zero Origin</div>
            <div className="zo-field-value">{project.role}</div>
          </div>
          <div className="zo-modal-creditsblock">
            <div className="zo-field-label">Credits</div>
            <div className="zo-credits">
              {project.credits.map((c, i) => (
                <div key={i} className="zo-credit">
                  <span className="zo-credit-role">{c.role}</span>
                  <span className="zo-credit-dash" />
                  <span className="zo-credit-name">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
