import { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';

import { ZOMark } from './ZOMark.jsx';
import { Nav, ProjectDetail } from './Chrome.jsx';
import { HomePage } from './HomePage.jsx';
import { ProjectsPage } from './ProjectsPage.jsx';
import { ProductsPage } from './ProductsPage.jsx';
import { ContactPage } from './ContactPage.jsx';
import projects from '../content/projects.json';

const LOGO_KEY = 'zo-logo-variant';

function TweaksPanel({ open, logo, setLogo }) {
  if (!open) return null;
  const opts = [
    { value: 'a', label: 'Mark A' },
    { value: 'b', label: 'Mark B' },
  ];
  return (
    <div className="zo-tweaks" data-screen-label="Tweaks panel">
      <div className="zo-tweaks-head">
        <span className="zo-tweaks-head-title">/ Tweaks</span>
        <span style={{ color: 'var(--fg-3)' }}>live</span>
      </div>
      <div className="zo-tweaks-body">
        <div className="zo-tweak-group">
          <label>Logo mark</label>
          <div className="zo-tweak-row">
            {opts.map((o) => (
              <button
                key={o.value}
                className={`zo-tweak-opt ${logo === o.value ? 'is-active' : ''}`}
                onClick={() => setLogo(o.value)}
              >
                <ZOMark size={18} variant={o.value} />
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [route, setRoute] = useState(() => {
    const hash = (location.hash || '').replace('#', '');
    return ['home', 'projects', 'products', 'contact'].includes(hash) ? hash : 'home';
  });
  const [openSlug, setOpenSlug] = useState(null);
  const [logo, setLogoState] = useState(() => {
    try {
      return localStorage.getItem(LOGO_KEY) || 'b';
    } catch {
      return 'b';
    }
  });
  const [tweaksOpen, setTweaksOpen] = useState(false);

  const setLogo = useCallback((v) => {
    setLogoState(v);
    try {
      localStorage.setItem(LOGO_KEY, v);
    } catch {}
  }, []);

  // Edit-mode handshake: register listener FIRST, then announce availability.
  useEffect(() => {
    const onMsg = (e) => {
      const d = e.data;
      if (!d || typeof d !== 'object') return;
      if (d.type === '__activate_edit_mode') setTweaksOpen(true);
      if (d.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', onMsg);
    try {
      window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    } catch {}
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const goto = useCallback((r, slug) => {
    setRoute(r);
    location.hash = r;
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (slug) setTimeout(() => setOpenSlug(slug), 100);
  }, []);

  useEffect(() => {
    const onHash = () => {
      const h = (location.hash || '').replace('#', '');
      if (['home', 'projects', 'products', 'contact'].includes(h)) setRoute(h);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const openProject = useCallback((slug) => setOpenSlug(slug), []);
  const openProjectObj = openSlug ? projects.find((p) => p.slug === openSlug) : null;

  return (
    <div className="zo-app">
      <Nav route={route} goto={goto} logo={logo} />
      <div className="zo-route zo-route-enter" key={route} data-screen-label={route}>
        {route === 'home' && <HomePage goto={goto} logo={logo} />}
        {route === 'projects' && <ProjectsPage openProject={openProject} />}
        {route === 'products' && <ProductsPage />}
        {route === 'contact' && <ContactPage />}
      </div>
      <ProjectDetail project={openProjectObj} onClose={() => setOpenSlug(null)} />
      <TweaksPanel open={tweaksOpen} logo={logo} setLogo={setLogo} />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
