// Projects page — grid layout.

import React from 'react';
import { MoodyPlaceholder } from './MoodyPlaceholder.jsx';
import projects from '../content/projects.json';

// An images[] entry is either a bare URL string or { src, credit }.
const imageSrc = (img) => (typeof img === 'string' ? img : img && img.src);

export function ProjectsPage({ openProject }) {
  const [filter, setFilter] = React.useState('All');
  const disciplines = ['All', ...Array.from(new Set(projects.map((p) => p.discipline)))];
  const visible = filter === 'All' ? projects : projects.filter((p) => p.discipline === filter);

  return (
    <main className="zo-page">
      <header className="zo-page-header">
        <div className="zo-page-eyebrow">/ Projects</div>
        <h1 className="zo-page-title">Selected work.</h1>
        <div className="zo-filters">
          {disciplines.map((d) => (
            <button
              key={d}
              className={`zo-filter ${filter === d ? 'is-active' : ''}`}
              onClick={() => setFilter(d)}
            >
              {d}{' '}
              <span className="zo-filter-count">
                {d === 'All' ? projects.length : projects.filter((p) => p.discipline === d).length}
              </span>
            </button>
          ))}
        </div>
      </header>

      <ProjectsGrid projects={visible} openProject={openProject} />
    </main>
  );
}

function ProjectsGrid({ projects, openProject }) {
  return (
    <div className="zo-grid">
      {projects.map((p) => (
        <button key={p.slug} className="zo-grid-card" onClick={() => openProject(p.slug)}>
          <div className="zo-grid-img">
            {p.images && p.images.length ? (
              <img
                src={imageSrc(p.images[0])}
                alt={p.title}
                className="zo-grid-photo"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <MoodyPlaceholder seed={p.title.length + p.year} palette={p.palette} aspect="4/3" />
            )}
          </div>
          <div className="zo-grid-meta" title={`${p.discipline} · ${p.venue} · ${p.year}`}>
            <span>{p.discipline}</span>
            <span>·</span>
            <span>{p.year}</span>
          </div>
          <div className="zo-grid-title">{p.title}</div>
          <div className="zo-grid-role">{p.role}</div>
        </button>
      ))}
    </div>
  );
}
