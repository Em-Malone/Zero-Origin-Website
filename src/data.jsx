// Placeholder project data. Real credits to be dropped in later.

const PROJECTS = [
  {
    slug: 'aurora-residency',
    title: 'Aurora — Residency',
    year: 2025,
    venue: 'O2 Academy Brixton, London',
    role: 'Media server programming & show operation',
    palette: 'cool',
    discipline: 'Live Music',
    credits: [
      { role: 'Show Designer', name: '[placeholder]' },
      { role: 'Production Designer', name: '[placeholder]' },
      { role: 'Production Manager', name: 'Matt Dennett · Zero Origin' },
      { role: 'Media Server', name: 'Zero Origin' },
      { role: 'Lighting Design', name: '[placeholder]' },
      { role: 'Video Production', name: '[placeholder]' },
    ],
    summary:
      'Six-night residency. Disguise gx2-based video system across an upstage LED wall and two flown IMAG surfaces, with live content cueing triggered from timecode.',
  },
  {
    slug: 'meridian-tour',
    title: 'Meridian — European Tour',
    year: 2025,
    venue: '12 cities · EU',
    role: 'Technical Direction & Media Server',
    palette: 'warm',
    discipline: 'Tour',
    credits: [
      { role: 'Creative Director', name: '[placeholder]' },
      { role: 'Technical Director', name: 'Matt Dennett · Zero Origin' },
      { role: 'Media Server Programmer', name: 'Zero Origin' },
      { role: 'Tour Manager', name: '[placeholder]' },
      { role: 'Production Co.', name: '[placeholder]' },
    ],
    summary:
      'Rolling 12-city arena tour. Trucked video package, timecoded show with live camera integration, and local crew handover at every stop.',
  },
  {
    slug: 'halcyon-launch',
    title: 'Halcyon — Product Launch',
    year: 2024,
    venue: 'Excel, London',
    role: 'Production Management & Media Systems',
    palette: 'magenta',
    discipline: 'Corporate',
    credits: [
      { role: 'Client', name: '[placeholder]' },
      { role: 'Production Manager', name: 'Matt Dennett · Zero Origin' },
      { role: 'Media Server', name: 'Zero Origin' },
      { role: 'Content Studio', name: '[placeholder]' },
      { role: 'Lighting', name: '[placeholder]' },
      { role: 'Audio', name: '[placeholder]' },
    ],
    summary:
      'One-shot product reveal for 1,800 guests. 24m wide curved LED wall with choreographed keynote playback and live IMAG switching.',
  },
  {
    slug: 'northlight-festival',
    title: 'Northlight Festival — Main Stage',
    year: 2024,
    venue: 'Reykjavík, IS',
    role: 'Media Server Operation',
    palette: 'cool',
    discipline: 'Festival',
    credits: [
      { role: 'Festival Production', name: '[placeholder]' },
      { role: 'Stage Manager', name: '[placeholder]' },
      { role: 'Media Server', name: 'Zero Origin' },
      { role: 'Lighting Design', name: '[placeholder]' },
    ],
    summary:
      'Eleven headline acts over three nights. Shared video rig with rapid changeover, IMAG switching, and bespoke content playback per act.',
  },
  {
    slug: 'atlas-immersive',
    title: 'Atlas — Immersive Installation',
    year: 2023,
    venue: 'Southbank Centre, London',
    role: 'Technical Direction',
    palette: 'mono',
    discipline: 'Installation',
    credits: [
      { role: 'Artist', name: '[placeholder]' },
      { role: 'Curator', name: '[placeholder]' },
      { role: 'Technical Director', name: 'Matt Dennett · Zero Origin' },
      { role: 'Media Server', name: 'Zero Origin' },
      { role: 'Fabrication', name: '[placeholder]' },
    ],
    summary:
      'Eight-week immersive installation. Four projection surfaces driven by a single media server with sensor-triggered content and auto-recovery for unattended 12-hour daily runs.',
  },
  {
    slug: 'pulse-broadcast',
    title: 'Pulse — Broadcast Awards',
    year: 2023,
    venue: 'Grosvenor House, London',
    role: 'Technical Direction & Programming',
    palette: 'warm',
    discipline: 'Broadcast',
    credits: [
      { role: 'Broadcaster', name: '[placeholder]' },
      { role: 'Show Director', name: '[placeholder]' },
      { role: 'Technical Director', name: 'Matt Dennett · Zero Origin' },
      { role: 'Media Server', name: 'Zero Origin' },
      { role: 'Graphics', name: '[placeholder]' },
    ],
    summary:
      'Live-to-tape awards broadcast. Graphics-driven show file with 40+ nominee packages, winner reveal sequences, and dynamic sponsor templates.',
  },
];

const PRODUCTS = [
  {
    type: 'paid',
    status: 'Available now',
    name: 'File Kitty',
    subtitle: 'A content management and tracking tool for people with busy brains.',
    description:
      'Manage, track and communicate content delivery and ingestion, from studio to screen. Weekly, monthly and annual licenses available.',
    href: 'https://cuelist.example.com',
    cta: 'Visit File Kitty',
    shotId: 'product-cuelist',
  },
  {
    type: 'free',
    status: 'Free download',
    name: 'LTCue',
    subtitle: 'Check your sync against reference audio or other videos.',
    description:
      'Compare your video with embedded audio against reference audio, or against other videos to establish timecode offset - either absolute or relative.',
    href: '#',
    cta: 'Download',
    shotId: 'product-origin',
  },
];

window.PROJECTS = PROJECTS;
window.PRODUCTS = PRODUCTS;
