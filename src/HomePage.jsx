// Landing page — centered hero.

import { ZOMark } from './ZOMark.jsx';

export function HomePage({ goto, logo }) {
  return (
    <main className="zo-home">
      <HomeCentered goto={goto} logo={logo} />
      <HomeMarquee />
    </main>);

}

function HomeCentered({ goto, logo }) {
  return (
    <section className="zo-hero zo-hero-centered">
            <div className="zo-hero-mark">
        <ZOMark size={140} variant={logo} />
      </div>
      <h1 className="zo-hero-title">
        Technical services<br />for live entertainment.
      </h1>
      <ul className="zo-hero-list">
        <li>Technical direction &amp; production management</li>
        <li>Media server programming &amp; operating</li>
        <li>Custom software tooling &amp; solutions</li>
      </ul>
      <div className="zo-hero-cta">
        <button className="zo-btn" onClick={() => goto('projects')}>See selected work →</button>
        <button className="zo-btn zo-btn-ghost" onClick={() => goto('contact')}>Contact us →</button>
      </div>
    </section>);

}

function HomeMarquee() {
  const items = ['Experiential', 'Immersive', 'Awards', 'Live Broadcast', 'Theatre', 'Dance', 'Events', 'Virtual Production', 'Film', 'TV'];
  return (
    <section className="zo-marquee">
      <div className="zo-marquee-track">
        {[...items, ...items, ...items].map((item, i) =>
        <span key={i} className="zo-marquee-item">
            <span className="zo-marquee-plus">+</span>
            {item}
          </span>
        )}
      </div>
    </section>);

}
