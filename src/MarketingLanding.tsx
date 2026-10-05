import { useState, useEffect, useRef } from 'react'

export type MarketingPage = 'home' | 'features' | 'about' | 'team' | 'faq' | 'terms' | 'privacy'

const pages: { id: MarketingPage; label: string; children?: { id: MarketingPage; label: string }[] }[] = [
  { id: 'home', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'about', label: 'About TunaEye', children: [
    { id: 'about', label: 'About TunaEye' },
    { id: 'terms', label: 'Terms & Conditions' },
    { id: 'privacy', label: 'Privacy Policy' },
  ]},
  { id: 'team', label: 'Team' },
  { id: 'faq', label: 'FAQ' },
]

const changelog = [
  { version: 'v0.9.0', date: 'Oct 2026', items: ['Initial kiosk workflow with guided capture', 'Raspberry Pi edge inference integration', 'Dual-cloud sync (Supabase + Convex)', 'Admin dashboard with audit logging'] },
  { version: 'v0.8.0', date: 'Sep 2026', items: ['Multi-camera support with live preview', 'Thermal receipt printing (80mm)', 'Expert override with PIN protection'] },
  { version: 'v0.7.0', date: 'Aug 2026', items: ['Offline-first PWA architecture', 'Bluetooth weighing scale integration', 'Sample association (same-fish / different-fish)'] },
  { version: 'v0.6.0', date: 'Jul 2026', items: ['5000K CRI 98+ lighting chamber design', 'Sashibo core and tail cut grading criteria', 'Grade A/B/C classification model training'] },
]

function Logo() {
  return (
    <span className="site-logo">
      <img src="/tunaeye-logo.svg" alt="" />
      <strong>Tuna<span>Eye</span></strong>
    </span>
  )
}

function Arrow() {
  return <span aria-hidden="true">→</span>
}

function NavDropdown({ item, page, onNavigate }: { item: typeof pages[number]; page: MarketingPage; onNavigate: (p: MarketingPage) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
  return (
    <div className={`site-nav-dropdown ${open ? 'is-open' : ''}`} ref={ref}>
      <button
        className={`site-nav-dropdown__toggle ${item.children?.some(c => c.id === page) ? 'is-active' : ''}`}
        onClick={() => setOpen(v => !v)}
      >
        {item.label} <span className="dropdown-chevron" aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="site-nav-dropdown__menu">
          {item.children?.map(child => (
            <button key={child.id} className={page === child.id ? 'is-active' : ''} onClick={() => { onNavigate(child.id); setOpen(false) }}>
              {child.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ChangelogModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop changelog-backdrop" role="dialog" aria-modal="true" aria-label="Changelog" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="changelog-modal">
        <div className="changelog-modal__header">
          <div className="changelog-modal__title-group">
            <span className="changelog-kicker">What's New</span>
            <h2>Version History</h2>
          </div>
          <button className="changelog-close-btn" aria-label="Close changelog" onClick={onClose}>&times;</button>
        </div>
        <div className="changelog-modal__body">
          {changelog.map(release => (
            <div key={release.version} className="changelog-entry">
              <div className="changelog-entry__head">
                <span className="changelog-version-badge">{release.version}</span>
                <span className="changelog-date">{release.date}</span>
              </div>
              <ul className="changelog-list">
                {release.items.map(item => (
                  <li key={item}>
                    <span className="changelog-bullet" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MarketingLanding({
  page,
  onNavigate,
  onInstall,
  onOpen,
}: {
  page: MarketingPage
  onNavigate: (page: MarketingPage) => void
  onInstall: () => void
  onOpen: () => void
}) {
  const [changelogOpen, setChangelogOpen] = useState(false)

  const navigate = (next: MarketingPage) => {
    onNavigate(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="site-shell">
      <div className="site-nav-wrapper">
        <header className="site-nav">
          <Logo />
          <nav>
            {pages.map(item =>
              item.children ? (
                <NavDropdown key={item.id} item={item} page={page} onNavigate={navigate} />
              ) : (
                <button
                  key={item.id}
                  className={page === item.id ? 'is-active' : ''}
                  onClick={() => navigate(item.id)}
                >
                  {item.label}
                </button>
              )
            )}
            <button className="site-nav__changelog-btn" onClick={() => setChangelogOpen(true)}>
              <span className="changelog-spark">✨</span> Changelog
            </button>
          </nav>
          <button className="site-nav__cta" onClick={onInstall}>
            Install kiosk app
          </button>
        </header>
      </div>

      {page === 'home' ? (
        <Home onInstall={onInstall} onOpen={onOpen} onNavigate={navigate} onChangelog={() => setChangelogOpen(true)} />
      ) : page === 'team' ? (
        <TeamPage onNavigate={navigate} onOpen={onOpen} />
      ) : (
        <InnerPage page={page} onNavigate={navigate} onOpen={onOpen} />
      )}

      <footer className="site-footer">
        <div>
          <Logo />
          <p>
            Evidence-first yellowfin tuna visual grading platform built for connected ports, buying stations, and processing facilities.
          </p>
        </div>
        <div>
          <strong>Explore</strong>
          {pages.filter(p => !p.children).map(item => (
            <button key={item.id} onClick={() => navigate(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <div>
          <strong>Legal</strong>
          <button onClick={() => navigate('terms')}>Terms of service</button>
          <button onClick={() => navigate('privacy')}>Privacy policy</button>
        </div>
        <div>
          <strong>Contact</strong>
          <a href="mailto:hello@tunaeye.app">hello@tunaeye.app</a>
          <span>General Santos City, Philippines</span>
        </div>
        <small>© 2026 TunaEye Systems. All rights reserved.</small>
      </footer>

      <button className="fixed-changelog-trigger" onClick={() => setChangelogOpen(true)} title="View Changelog">
        <span className="version-pill">v0.9.0</span>
        <span>What's new</span>
        <span className="sparkle-icon">✨</span>
      </button>

      {changelogOpen && <ChangelogModal onClose={() => setChangelogOpen(false)} />}
    </div>
  )
}

function Home({
  onInstall,
  onOpen,
  onNavigate,
  onChangelog,
}: {
  onInstall: () => void
  onOpen: () => void
  onNavigate: (page: MarketingPage) => void
  onChangelog: () => void
}) {
  const [showcase, setShowcase] = useState(0)
  const [selectedCut, setSelectedCut] = useState<'sashibo' | 'tail'>('sashibo')

  const showcaseItems = [
    {
      image: '/assets/sashiboCoreFull.png',
      title: 'Sashibo Core Sample',
      copy: 'Center-cut core sample providing evidence of translucency, fat/oil distribution, core structural integrity, and myoglobin oxidation.',
    },
    {
      image: '/assets/tailCutFull.png',
      title: 'Tail Cut Cross-Section',
      copy: 'Cross-sectional tail muscle sample revealing muscle grain density, color saturation, drip loss, and post-mortem firmness.',
    },
  ]

  return (
    <main className="site-home">
      {/* HERO SECTION */}
      <section className="site-hero">
        <div className="site-hero__mesh" />
        <div className="site-hero__copy">
          <h1>
            Clear evidence.<br />
            <em>Confident decisions.</em>
          </h1>
          <p>
            TunaEye replaces subjective disputes with standardized visual evidence. Combining guided tablet workflows, sub-200ms Raspberry Pi edge AI inference, and auditable cloud record synchronization.
          </p>
          <div className="site-actions">
            <button className="site-button site-button--primary" onClick={onOpen}>
              Start Grading <Arrow />
            </button>
            <button className="site-button" onClick={() => onNavigate('features')}>
              Station Specs <Arrow />
            </button>
          </div>
          <div className="site-trust">
            <span>Sub-200ms Edge AI</span>
            <span>Offline-Ready PWA</span><span>HACCP Traceable</span>
            <span>10.1″ IP65 Tablets</span>
            <span>Dual Cloud Sync</span>
          </div>
        </div>

        <div className="site-hero__visual">
          <div className="site-orbit site-orbit--one" />
          <div className="site-orbit site-orbit--two" />
          <img src="/assets/tunaEyeLoadingScreen.png" alt="TunaEye grading station interface" />
          <aside>
            <b>Station status</b>
            <strong>
              <i /> Station online & ready
            </strong>
            <small>Camera · RPi Edge · Scale · Thermal Printer</small>
          </aside>
        </div>

        <div className="site-hero__band">
          <span>01. Capture Specimen</span>
          <i />
          <span>02. Edge Neural Infer</span>
          <i />
          <span>03. Review & Override</span>
          <i />
          <span>04. Receipt & Cloud Sync</span>
        </div>
      </section>

      {/* WHY TUNAEYE / VALUE PROP */}
      <section className="site-story">
        <div>
          <span className="site-kicker">Why TunaEye Matters</span>
          <h2>Every sample must tell one complete, tamper-proof story.</h2>
        </div>
        <div>
          <p>
            Yellowfin tuna trading depends heavily on visual quality assessment. Without digital standardization, disagreements between vessel operators, buyers, and processors lead to renegotiations, delays, and lost value.
          </p>
          <p>
            TunaEye locks every decision to a verified specimen, weight, grader identity, neural network confidence, and printed thermal receipt—ensuring complete accountability from receiving tray to final shipment.
          </p>
          <button className="site-text-link" onClick={() => onNavigate('about')}>
            Read our engineering approach <Arrow />
          </button>
        </div>
      </section>

      {/* HARDWARE & CHAMBER INTEGRATION */}
      <section className="site-hardware" id="hardware">
        <header>
          <span className="site-kicker">Station Architecture</span>
          <h2>Rugged hardware engineered for the port floor.</h2>
          <p>TunaEye connects off-the-shelf industrial components into a seamless, splash-resistant grading station.</p>
        </header>

        <div className="hardware-grid">
          <article className="hardware-card">
            <div className="hardware-card__icon">🧠</div>
            <h3>Raspberry Pi 4/5 Edge Server</h3>
            <p>Runs custom-trained ONNX neural models locally on station hardware, guaranteeing sub-200ms inference without requiring active internet connectivity.</p>
            <ul>
              <li>Sub-200ms inference latency</li>
              <li>Local LAN health & diagnostics</li>
              <li>Zero cloud dependency for grading</li>
            </ul>
          </article>

          <article className="hardware-card">
            <div className="hardware-card__icon">💡</div>
            <h3>5000K CRI 98+ Diffuse Chamber</h3>
            <p>Standardized LED lighting environment eliminates glare, ambient shadows, and color temperature drift for consistent image capture across stations.</p>
            <ul>
              <li>5000K daylight-balanced illumination</li>
              <li>Dual optical rail alignment guides</li>
              <li>Consistent color calibration</li>
            </ul>
          </article>

          <article className="hardware-card">
            <div className="hardware-card__icon">📱</div>
            <h3>10.1″ IP65 Sealed Touch Tablet</h3>
            <p>High-brightness screen built for harsh seafood port environments, splash resistance, and seamless operation with gloved hands.</p>
            <ul>
              <li>Responsive 16:10 kiosk layout</li>
              <li>Standalone PWA application shell</li>
              <li>Full offline IndexedDB storage</li>
            </ul>
          </article>

          <article className="hardware-card">
            <div className="hardware-card__icon">⚖️</div>
            <h3>Scale & Thermal Receipt Printer</h3>
            <p>Automated Bluetooth digital scale integration up to 200kg with instant 80mm thermal receipt printing for physical specimen tags.</p>
            <ul>
              <li>Max 200kg weight capture</li>
              <li>80mm thermal receipt layout</li>
              <li>QR code specimen verification</li>
            </ul>
          </article>
        </div>
      </section>

      {/* TUNA GRADING CRITERIA BREAKDOWN */}
      <section className="site-criteria">
        <div className="site-criteria__intro">
          <span className="site-kicker">Anatomical Grading Criteria</span>
          <h2>Standardized quality metrics for Sashibo & Tail Cut samples.</h2>
          <p>TunaEye evaluates the primary anatomical sample cuts used in commercial yellowfin sashimi grading.</p>
        </div>

        <div className="criteria-tabs">
          <button
            className={selectedCut === 'sashibo' ? 'is-active' : ''}
            onClick={() => setSelectedCut('sashibo')}
          >
            Sashibo Core Sample Analysis
          </button>
          <button
            className={selectedCut === 'tail' ? 'is-active' : ''}
            onClick={() => setSelectedCut('tail')}
          >
            Tail Cut Cross-Section Analysis
          </button>
        </div>

        <div className="criteria-content">
          {selectedCut === 'sashibo' ? (
            <div className="criteria-panel">
              <div className="criteria-panel__text">
                <h3>Sashibo Core Evaluation Metrics</h3>
                <p>Extracted using a specialized sashibo probe from the core flesh near the dorsal fin, this sample provides a direct look into internal muscle quality.</p>
                <div className="criteria-list">
                  <div>
                    <strong>Flesh Translucency & Oil Content</strong>
                    <p>Measures light transmission and lipid dispersion across the core specimen, indicating high fat content prized in Grade A sashimi.</p>
                  </div>
                  <div>
                    <strong>Myoglobin Color Saturation</strong>
                    <p>Detects deep cherry-red hue versus brown oxidation or darkening caused by post-capture stress or thermal spike.</p>
                  </div>
                  <div>
                    <strong>Core Structural Integrity</strong>
                    <p>Ensures the core sample retains firmness without gaping, mushiness, or parasitic muscle breakdown.</p>
                  </div>
                </div>
              </div>
              <div className="criteria-panel__image">
                <img src="/assets/sashiboCoreFull.png" alt="Sashibo core sample breakdown" />
                <span>Center-Cut Core Evidence</span>
              </div>
            </div>
          ) : (
            <div className="criteria-panel">
              <div className="criteria-panel__text">
                <h3>Tail Cut Cross-Section Metrics</h3>
                <p>Harvested at the caudal peduncle, the tail cut exposes the muscle cross-section for rapid visual assessment of firmness and muscle density.</p>
                <div className="criteria-list">
                  <div>
                    <strong>Muscle Grain Density & Tightness</strong>
                    <p>Evaluates muscle fiber compactness. Tight, dense grain indicates strong muscle retention and superior shelf life.</p>
                  </div>
                  <div>
                    <strong>Oxidation & Color Saturation</strong>
                    <p>Detects edge browning and metmyoglobin formation along the outer fat ring and central muscle mass.</p>
                  </div>
                  <div>
                    <strong>Drip Loss & Surface Moisture</strong>
                    <p>Quantifies excessive surface water exudation resulting from cellular rupture during improper chilling.</p>
                  </div>
                </div>
              </div>
              <div className="criteria-panel__image">
                <img src="/assets/tailCutFull.png" alt="Tail cut sample breakdown" />
                <span>Caudal Peduncle Cross-Section</span>
              </div>
            </div>
          )}
        </div>

        {/* GRADE CLASSIFICATION SCALE */}
        <div className="grade-scale-grid">
          <div className="grade-card grade-card--a">
            <span className="grade-badge">Grade A</span>
            <h4>Export Sashimi Grade</h4>
            <p>Deep translucent red, high fat content, zero oxidation, firm core texture. Highest commercial value.</p>
          </div>
          <div className="grade-card grade-card--bplus">
            <span className="grade-badge">Grade B+</span>
            <h4>Premium Fresh Grade</h4>
            <p>Strong red color saturation, slight fat dispersion, firm muscle grain. Excellent fresh market suitability.</p>
          </div>
          <div className="grade-card grade-card--b">
            <span className="grade-badge">Grade B</span>
            <h4>Standard Fresh Grade</h4>
            <p>Moderate red color, minor surface oxidation acceptable, suitable for domestic retail and grilling.</p>
          </div>
          <div className="grade-card grade-card--c">
            <span className="grade-badge">Grade C</span>
            <h4>Processing / Canning Grade</h4>
            <p>Dark/brown oxidation, soft texture or high drip loss. Allocated for cooked processing or canning.</p>
          </div>
        </div>
      </section>

      {/* END-TO-END WORKFLOW AT A GLANCE */}
      <section className="site-workflow">
        <header>
          <span className="site-kicker">Step-by-Step Station Workflow</span>
          <h2>From receiving tray to traceable digital record.</h2>
        </header>

        <div>
          {[
            ['01', 'Grader Auth', 'Grader selects profile or inputs PIN. All actions stay linked to grader identity.'],
            ['02', 'Select Cut', 'Choose Sashibo Core, Tail Cut, or dual-sample same-fish association.'],
            ['03', 'Weigh Fish', 'Integrated Bluetooth scale reads fish weight up to maximum 200 kg limit.'],
            ['04', 'Chamber Place', 'Follow 3-step target alignment guide under 5000K diffuse illumination.'],
            ['05', 'Edge Infer', 'Raspberry Pi runs model inference and returns grade + confidence score in <200ms.'],
            ['06', 'Receipt & Sync', 'Print 80mm thermal tag and background-sync record to Supabase & Convex cloud.'],
          ].map(([number, title, copy]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      {/* SAMPLE EVIDENCE SHOWCASE */}
      <section className="site-showcase">
        <div className="site-showcase__copy">
          <span className="site-kicker">Traceable Evidence</span>
          <h2>{showcaseItems[showcase].title}</h2>
          <p>{showcaseItems[showcase].copy}</p>
          <div>
            <button
              onClick={() => setShowcase(value => (value ? value - 1 : showcaseItems.length - 1))}
              aria-label="Previous sample"
            >
              ←
            </button>
            <span>
              {showcase + 1} / {showcaseItems.length}
            </span>
            <button
              onClick={() => setShowcase(value => (value + 1) % showcaseItems.length)}
              aria-label="Next sample"
            >
              →
            </button>
          </div>
        </div>
        <div className="site-showcase__image">
          <span>Captured sample evidence</span>
          <img src={showcaseItems[showcase].image} alt={showcaseItems[showcase].title} />
        </div>
      </section>

      {/* STATION METRICS */}
      <section className="site-metrics">
        <article>
          <strong>&lt; 200ms</strong>
          <span>Edge inference speed</span>
        </article>
        <article>
          <strong>200 kg</strong>
          <span>Maximum fish weight cap</span>
        </article>
        <article>
          <strong>1:1</strong>
          <span>Fish-to-evidence traceability</span>
        </article>
        <article>
          <strong>100%</strong>
          <span>Offline kiosk availability</span>
        </article>
      </section>

      {/* DUAL CLOUD ARCHITECTURE */}
      <section className="site-architecture">
        <div>
          <span className="site-kicker">Resilient Infrastructure</span>
          <h2>Local edge speed. Cloud transparency.</h2>
          <p>
            The kiosk tablet handles operator interactions and offline IndexedDB queueing. The Raspberry Pi performs zero-latency AI inference on station LAN. Supabase PostgreSQL serves as the durable system of record, while Convex broadcasts live updates across all admin consoles.
          </p>
          <button className="site-text-link" onClick={() => onNavigate('features')}>
            Explore full feature breakdown <Arrow />
          </button>
        </div>
        <div className="architecture-flow">
          <article>
            <b>01</b>
            <strong>Tablet Kiosk</strong>
            <small>Capture, weigh & review</small>
          </article>
          <i>↔</i>
          <article>
            <b>02</b>
            <strong>Raspberry Pi</strong>
            <small>Edge AI model inference</small>
          </article>
          <i>↔</i>
          <article>
            <b>03</b>
            <strong>Supabase + Convex</strong>
            <small>Durable records & live sync</small>
          </article>
        </div>
      </section>

      {/* FAQ PREVIEW */}
      <section className="site-faq-preview">
        <header>
          <span className="site-kicker">Deployment FAQ</span>
          <h2>Frequently asked questions before deployment.</h2>
        </header>
        <div>
          <details open>
            <summary>Who uses the TunaEye station?</summary>
            <p>
              Fish ports, buying stations, commercial seafood processors, trained quality graders, and export inspection officers.
            </p>
          </details>
          <details>
            <summary>Does the kiosk work during internet outages?</summary>
            <p>
              Yes. The kiosk shell, camera capture, local weight entry, Raspberry Pi edge inference, thermal printing, and audit logging operate 100% offline. Cloud synchronization resumes automatically when connectivity is restored.
            </p>
          </details>
          <details>
            <summary>How are expert overrides handled and audited?</summary>
            <p>
              If a grader disagrees with the AI model confidence score, an expert override can be entered. Overrides require the Station Admin PIN and record the reason, preserving both the original AI output and the grader override for audit purposes.
            </p>
          </details>
          <details>
            <summary>Which cameras and scales are supported?</summary>
            <p>
              TunaEye supports device cameras, USB industrial cameras, and webcams via standard WebRTC, along with serial/Bluetooth digital weighing scales up to 200kg.
            </p>
          </details>
        </div>
        <button className="site-text-link" onClick={() => onNavigate('faq')}>
          View all questions & answers <Arrow />
        </button>
      </section>

      {/* CALL TO ACTION */}
      <section className="site-cta">
        <span className="site-kicker">Ready for the Grading Floor?</span>
        <h2>Turn every yellowfin tuna sample into clear, connected evidence.</h2>
        <p>Start grading now or explore the full platform capabilities in your browser.</p>
        <div className="site-actions">
          <button className="site-button site-button--primary" onClick={onOpen}>
            Start Grading <Arrow />
          </button>
          <button className="site-button" onClick={() => onNavigate('features')}>
            Explore Features
          </button>
        </div>
      </section>
    </main>
  )
}

function TeamPage({
  onNavigate,
  onOpen,
}: {
  onNavigate: (page: MarketingPage) => void
  onOpen: () => void
}) {
  const teamMembers = [
    {
      name: 'Gabriel Alarcon',
      role: 'Project Lead & Full Stack Architect',
      initials: 'GA',
      bio: 'Leads system architecture, dual-cloud sync, PWA development, and port kiosk integrations.',
      tags: ['System Architecture', 'React / PWA', 'Supabase & Convex'],
    },
    {
      name: 'Dr. Maria Santos',
      role: 'AI & Computer Vision Lead',
      initials: 'MS',
      bio: 'Spearheads deep learning models for tuna meat color classification, Sashibo analysis, and ONNX edge acceleration.',
      tags: ['Computer Vision', 'PyTorch / ONNX', 'Edge AI'],
    },
    {
      name: 'Jason Tan',
      role: 'Hardware & Embedded Systems',
      initials: 'JT',
      bio: 'Designs camera enclosures, 5000K CRI 98+ lighting chambers, Raspberry Pi peripherals, and thermal printers.',
      tags: ['Raspberry Pi', 'Optical Hardware', 'Thermal Printing'],
    },
    {
      name: 'Elena Rostova',
      role: 'Quality & Field Operations Specialist',
      initials: 'ER',
      bio: 'Bridges port grading practices with digital UI, ensuring compliance with international yellowfin export standards.',
      tags: ['Tuna Grading Standards', 'Field Testing', 'UX for Ports'],
    },
  ]

  const advisers = [
    {
      name: 'Capt. Fernando Cruz',
      title: 'Senior Fisheries Adviser',
      affiliation: 'Bureau of Fisheries & Aquatic Resources',
      expertise: '30+ years in commercial tuna export, port operations, and quality inspection standards.',
    },
    {
      name: 'Prof. Hiroshi Tanaka',
      title: 'Technical & Research Adviser',
      affiliation: 'Institute of Marine Robotics & AI',
      expertise: 'Pioneer in non-destructive agricultural & seafood spectral quality measurement.',
    },
  ]

  return (
    <main className="site-inner team-page">
      <header className="team-header">
        <span className="site-kicker">The People Behind TunaEye</span>
        <h1>Engineered for precision. Built for real ports.</h1>
        <p>
          Meet the multidisciplinary team of engineers, researchers, and fisheries experts dedicated to digitizing yellowfin tuna grading.
        </p>
      </header>

      <section className="team-grid">
        <div className="team-section-title">
          <h2>Core Project Team</h2>
          <p>Developers, engineers, and domain experts building TunaEye.</p>
        </div>
        <div className="team-cards">
          {teamMembers.map(m => (
            <div key={m.name} className="team-card">
              <div className="team-card__avatar">{m.initials}</div>
              <div className="team-card__info">
                <h3>{m.name}</h3>
                <span className="team-card__role">{m.role}</span>
                <p>{m.bio}</p>
                <div className="team-card__tags">
                  {m.tags.map(t => <span key={t}>{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="advisers-section">
        <div className="team-section-title">
          <h2>Project Advisers</h2>
          <p>Guidance from industry veterans and academic leaders in fisheries and computer vision.</p>
        </div>
        <div className="adviser-cards">
          {advisers.map(a => (
            <div key={a.name} className="adviser-card">
              <div className="adviser-card__icon">🏅</div>
              <div>
                <h3>{a.name}</h3>
                <span className="adviser-card__title">{a.title} • {a.affiliation}</span>
                <p>{a.expertise}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside>
        <h2>Want to partner or deploy TunaEye at your port?</h2>
        <div className="site-actions">
          <button className="site-button site-button--primary" onClick={onOpen}>
            Start Grading <Arrow />
          </button>
          <button className="site-button site-button--secondary" onClick={() => onNavigate('faq')}>
            Read FAQ
          </button>
        </div>
      </aside>
    </main>
  )
}

function InnerPage({
  page,
  onNavigate,
  onOpen,
}: {
  page: Exclude<MarketingPage, 'home'>
  onNavigate: (page: MarketingPage) => void
  onOpen: () => void
}) {
  const content = {
    features: {
      eyebrow: 'Platform Features',
      title: 'Everything a connected tuna grading station needs.',
      intro:
        'TunaEye combines guided sample capture, edge neural inference, evidence review, protected expert decision overrides, thermal receipt printing, and dual-cloud synchronization.',
      cards: [
        ['Guided Kiosk Workflow', 'Large touch targets, high contrast, and responsive 16:10 tablet layouts built for wet port floors.'],
        ['Multi-Camera Capture', 'Seamless switching between device, USB, and virtual station cameras with live optical alignment rails.'],
        ['Raspberry Pi Edge Service', 'Sub-200ms local ONNX neural network inference with HTTP LAN health monitoring.'],
        ['Protected Expert Overrides', 'Requires administrator PIN authorization while preserving original AI model confidence scores in immutable logs.'],
        ['Dual-Cloud Records', 'Supabase PostgreSQL durable historical database combined with Convex real-time multi-station broadcast engine.'],
        ['Comprehensive Audit Visibility', 'Complete event log tracking grader login, scale inputs, inference results, overrides, settings changes, and sync events.'],
        ['Integrated Thermal Receipts', '80mm receipt generation with fish weight, grade, timestamp, QR verification code, and station ID.'],
        ['Offline-First Architecture', 'PWA service-worker caching with local IndexedDB storage ensures 100% station uptime during network drops.'],
      ],
    },
    about: {
      eyebrow: 'About TunaEye',
      title: 'Better evidence for better yellowfin tuna decisions.',
      intro:
        'TunaEye was engineered as a bridge between the physical craft of expert tuna grading and the transparency of connected digital records.',
      cards: [
        ['Our Purpose', 'Empower trained graders with standardized evidence without replacing human judgment or commercial expertise.'],
        ['Our Method', 'Link every sample photo to its exact fish identity, weight, grader ID, AI inference score, override reason, and thermal receipt.'],
        ['Our Standard', 'Make every grading transaction inspectable, printable, auditable, and synchronizable across seafood supply chains.'],
      ],
    },
    team: {
      eyebrow: 'The TunaEye Team',
      title: 'Built where fisheries, hardware, AI, and software meet.',
      intro:
        'Designing a reliable port grading station requires deep collaboration across seafood operations and engineering disciplines.',
      cards: [
        ['Fisheries & Port Operations', 'Defines real-world station workflows, specimen handling constraints, and grader usability requirements.'],
        ['Edge AI & Hardware Engineering', 'Owns the Raspberry Pi edge engine, 5000K LED chamber, optical camera integration, and trained ONNX models.'],
        ['Product & Web Engineering', 'Builds the touch kiosk PWA, Supabase PostgreSQL persistence, Convex sync layer, security PINs, and administrative console.'],
      ],
    },
    faq: {
      eyebrow: 'Frequently Asked Questions',
      title: 'Answers for station operators and deployment teams.',
      intro: 'Detailed breakdown of TunaEye hardware boundaries, offline mechanics, and security controls.',
      cards: [
        ['Can TunaEye replace a trained grader?', 'No. TunaEye is an evidence and standardization tool. Expert review and final approval remain with qualified human graders.'],
        ['How does offline mode function?', 'The PWA and local IndexedDB store all sessions on the tablet. Inference runs on the local Pi LAN. Cloud sync uploads queued records once internet returns.'],
        ['How are multiple cuts handled per fish?', 'Graders can link both Sashibo Core and Tail Cut samples to the same fish ID, tracking individual images, weights, and grades under one master record.'],
        ['How is the tablet secured in kiosk mode?', 'The PWA manifest requests standalone fullscreen display. For full Android hardware button locking, managed kiosk / lock-task mode is recommended.'],
        ['Where is data stored long term?', 'Locally on the tablet first, then stored durably in Supabase PostgreSQL with raw photo object storage and Convex real-time dashboard sync.'],
        ['How are model updates deployed?', 'Station admins can check the Raspberry Pi health endpoint to inspect active model identifiers and update edge models without modifying the tablet kiosk.'],
      ],
    },
    terms: {
      eyebrow: 'Legal',
      title: 'Terms of Service',
      intro:
        'TunaEye provides decision-support tools for commercial seafood assessment. Operators remain responsible for fish association, sample quality, regulatory compliance, and purchasing agreements.',
      cards: [
        ['Authorized Use', 'Use TunaEye only with authorized stations, devices, grader credentials, and standard operating procedures.'],
        ['Human Responsibility', 'AI model output serves as decision support. Final commercial acceptance remains the sole responsibility of authorized personnel.'],
        ['Operational Integrity', 'Users must not tamper with captured evidence, bypass PIN security controls, or falsify station records.'],
      ],
    },
    privacy: {
      eyebrow: 'Legal',
      title: 'Privacy Policy',
      intro:
        'TunaEye processes grader identity, captured specimen photos, device metadata, grading decisions, and audit events strictly to operate and secure the service.',
      cards: [
        ['Data Purpose', 'Operate visual grading, station synchronization, system troubleshooting, audit logging, and commercial reporting.'],
        ['Data Access & Retention', 'Station records and cloud backups are restricted to authorized organization personnel with defined retention schedules.'],
        ['Image Security', 'Captured evidence photos are stored securely and associated exclusively with their corresponding station and fish IDs.'],
      ],
    },
  }[page]

  return (
    <main className="site-inner">
      <header>
        <span className="site-kicker">{content.eyebrow}</span>
        <h1>{content.title}</h1>
        <p>{content.intro}</p>
      </header>
      <section>
        {content.cards.map(([title, copy], index) => (
          <article key={title}>
            <span>0{index + 1}</span>
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>
      <aside>
        <h2>Ready to see TunaEye in action?</h2>
        <div className="site-actions">
          <button className="site-button site-button--primary" onClick={onOpen}>
            Start Grading <Arrow />
          </button>
        </div>
      </aside>
    </main>
  )
}
