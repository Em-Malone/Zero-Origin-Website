// Projects page — grid layout.

function ProjectsPage({ openProject }) {
  const [filter, setFilter] = React.useState('All');
  const projects = window.PROJECTS;
  const disciplines = ['All', ...Array.from(new Set(projects.map(p => p.discipline)))];
  const visible = filter === 'All' ? projects : projects.filter(p => p.discipline === filter);

  return (
    <main className="zo-page">
      <header className="zo-page-header">
        <div className="zo-page-eyebrow">/ Projects</div>
        <h1 className="zo-page-title">Selected work.</h1>
        <div className="zo-filters">
          {disciplines.map(d => (
            <button
              key={d}
              className={`zo-filter ${filter === d ? 'is-active' : ''}`}
              onClick={() => setFilter(d)}
            >
              {d} <span className="zo-filter-count">{d === 'All' ? projects.length : projects.filter(p => p.discipline === d).length}</span>
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
            <MoodyPlaceholder seed={p.title.length + p.year} palette={p.palette} aspect="4/3" />
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

window.ProjectsPage = ProjectsPage;
