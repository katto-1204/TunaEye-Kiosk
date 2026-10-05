import { useState } from 'react'

export type MarketingPage = 'home' | 'features' | 'about' | 'team' | 'faq' | 'terms' | 'privacy'

const pages: { id: MarketingPage; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'about', label: 'About TunaEye' },
  { id: 'team', label: 'Team' },
  { id: 'faq', label: 'FAQ' },
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
            {pages.map(item => (
              <button
                key={item.id}
                className={page === item.id ? 'is-active' : ''}
                onClick={() => navigate(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <button className="site-nav__cta" onClick={onInstall}>
            Install kiosk app
          </button>
        </header>
      </div>

      {page === 'home' ? (
        <Home onInstall={onInstall} onOpen={onOpen} onNavigate={navigate} />
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
          {pages.map(item => (
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
    </div>
  )
}

function Home({
  onInstall,
  onOpen,
  onNavigate,
}: {
  onInstall: () => void
  onOpen: () => void
  onNavigate: (page: MarketingPage) => void
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
          <span className="site-kicker">Evidence-First Yellowfin Tuna Grading</span>
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
