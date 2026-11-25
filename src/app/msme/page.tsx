/* eslint-disable @next/next/no-img-element -- static export with images.unoptimized;
   plain <img> with width/height is what next/image would emit here anyway. */
import type { Metadata } from 'next';
import Link from 'next/link';
import { pageMetadata, jsonLdScript, SITE_URL, ORG_ID } from '@/lib/seo';
import { Icon } from './Icons';
import { Countdown, DaysToGo, MobileCta } from './Live';
import { MSME_APPLY_PATH, MSME_START } from './config';

/**
 * MSME Capacity Development Training: landing page.
 *
 * The page from tokopage.zip (index.html), converted to JSX with the same
 * markup, classes and copy. Two things differ, both as the zip's README
 * instructs for a page placed inside the site: its own header and footer are
 * gone (the site's are used), and the Google Fonts link is gone (the site
 * self-hosts the same font). Every Register button opens /msme/apply/.
 */

const IMG = '/images/msme';

/** Partner logos, cropped from public/4logos.jpeg (Toko Academy left out). */
const PARTNER_LOGOS = [
  { src: 'eu-cofunded.png', alt: 'Co-funded by the European Union', w: 408, h: 375 },
  { src: 'german-cooperation.png', alt: 'German Cooperation (Deutsche Zusammenarbeit)', w: 630, h: 369 },
  { src: 'nigeria-coat-of-arms.png', alt: 'Coat of arms of the Federal Republic of Nigeria', w: 414, h: 360 },
  { src: 'giz-implemented-by.png', alt: 'Implemented by GIZ — Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ) GmbH', w: 363, h: 162 },
  { src: 'bincike-international.png', alt: 'Bincike International', w: 528, h: 225 },
  { src: 'jaress-agricultural-finance.png', alt: 'Jaress Agricultural Finance Ltd (J.A.F.)', w: 267, h: 267 },
];

function PartnerLogos({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`logo-strip${compact ? ' logo-strip-compact' : ''}`}>
      {PARTNER_LOGOS.map((l) => (
        <li key={l.src}>
          <img src={`${IMG}/${l.src}`} alt={l.alt} width={l.w} height={l.h} loading="lazy" />
        </li>
      ))}
    </ul>
  );
}

export const metadata: Metadata = pageMetadata({
  path: '/msme',
  title: 'MSME Capacity Development Training',
  description:
    'A free, two-week practical business capacity development programme for established MSMEs in Yola North and Yola South. Starts 30 November 2026.',
  socialTitle: 'Free MSME Capacity Development Training — Yola North & Yola South',
  socialDescription:
    'Two weeks of practical training in business planning, marketing, operations and finance. 100% free. Starts 30 November 2026.',
  image: {
    url: `${IMG}/hero-market-traders.jpg`,
    alt: 'Two women in traditional attire trading fresh vegetables at a busy Nigerian market',
    width: 1600,
    height: 1067,
  },
});

const eventJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'MSME Capacity Development Training',
  description:
    'A free, two-week practical business capacity development programme for established MSMEs in Yola North and Yola South LGAs. Week 1 in person in Yola, Week 2 online.',
  startDate: MSME_START.toISOString(),
  eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  location: {
    '@type': 'Place',
    name: 'Yola, Adamawa State',
    address: { '@type': 'PostalAddress', addressLocality: 'Yola', addressRegion: 'Adamawa', addressCountry: 'NG' },
  },
  image: [`${SITE_URL}${IMG}/hero-market-traders.jpg`],
  organizer: { '@id': ORG_ID },
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'NGN',
    availability: 'https://schema.org/InStock',
    url: `${SITE_URL}${MSME_APPLY_PATH}`,
  },
};

const MODULES = [
  { icon: 'plan', title: 'Business Planning', text: 'Understanding and developing a structured business plan.' },
  { icon: 'target', title: 'Market Research & Marketing', text: 'Understanding customers, conducting market surveys and developing marketing plans.' },
  { icon: 'flow', title: 'Business Operations', text: 'Planning production processes and service delivery.' },
  { icon: 'org', title: 'Business Management', text: 'Understanding organisational and management structures.' },
  { icon: 'chart', title: 'Financial Planning', text: 'Developing financial projections, cash flow plans and sales forecasts.' },
  { icon: 'support', title: 'Business Development Support', text: 'Identifying and accessing business development services (BDS), including SMEDAN-recognised BDS providers.' },
  { icon: 'doc', title: 'Business Formalisation', text: 'Registering with CAC and SMEDAN, getting a TIN and other steps to formalise your business.' },
  { icon: 'bank', title: 'Access to Financial Services', text: 'Understanding financial services and institutions, MSME support schemes and risk management.' },
] as const;

const BENEFITS = [
  'Strengthen your business planning and management skills.',
  'Understand your market and business operations better.',
  'Improve your approach to financial planning.',
  'Identify opportunities for business development support.',
  'Know the steps to formalise, including CAC and SMEDAN registration.',
  'Build a stronger foundation for sustainable business growth.',
];

const SERVICES = [
  {
    icon: 'chat',
    title: 'MSME BDS Consultation',
    text: 'Business Development Services for small businesses: we review how your business runs, find the gaps and agree a practical plan to fix them.',
    points: ['Business diagnostics and business plan review', 'CAC, SMEDAN and TIN registration', 'Preparation for loans, grants and investors'],
  },
  {
    icon: 'users',
    title: 'Coaching & Mentorship',
    text: 'One-to-one and group support from experienced practitioners, so what you learn turns into results in your business.',
    points: ['Follow-up coaching after training', 'Mentors matched to your sector', 'Peer learning with other business owners'],
  },
  {
    icon: 'chart',
    title: 'Business Intelligence',
    text: 'Data and insight for better decisions, for individual businesses and for the organisations that support them.',
    points: ['Market research and customer surveys', 'Business records and performance tracking', 'MSME data and reports for partners'],
  },
] as const;

export default function MsmePage() {
  return (
    <>
      <script {...jsonLdScript(eventJsonLd)} />

      {/* Announcement bar */}
      <div className="announce">
        <div className="section-container announce-inner">
          <p>
            <span className="announce-dot" aria-hidden="true"></span>
            <strong>Registration is open.</strong>{' '}
            <span className="announce-long">FREE training starts Monday, 30 November</span>{' '}
            <DaysToGo />
          </p>
          <Link href={MSME_APPLY_PATH}>
            Register now <Icon name="arrow" />
          </Link>
        </div>
      </div>

      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="section-container hero-grid">
          <div className="hero-copy">
            <p className="status-pill"><span className="status-dot" aria-hidden="true"></span>Registration open · Free MSME training</p>
            <h1>Strengthening MSMEs for <span className="text-brand">sustainable growth</span></h1>
            <p className="hero-sub">A practical business capacity development programme for MSMEs in Yola North and Yola South.</p>
            <p className="hero-body">Take your business beyond day-to-day operations. Build the knowledge, structure and practical skills needed to manage your business more effectively and position it for sustainable growth.</p>

            <div className="hero-actions">
              <Link className="btn-primary btn-lg" href={MSME_APPLY_PATH}>
                Register now — it’s free
                <Icon name="arrow" />
              </Link>
              <a className="btn-secondary btn-lg" href="#eligibility">Check eligibility</a>
            </div>
            {/* Live countdown to the start date. Hides itself once training has begun. */}
            <Countdown />
          </div>

          <div className="hero-media">
            <div className="hero-glow" aria-hidden="true"></div>
            <figure className="hero-figure">
              <img src={`${IMG}/hero-market-traders.jpg`} alt="Two women in traditional attire trading fresh vegetables at a busy Nigerian market" width={1600} height={1067} fetchPriority="high" />
            </figure>
            <div className="free-badge" aria-hidden="true">
              <span className="free-badge-big">100%</span>
              <span className="free-badge-small">Free</span>
            </div>
            <div className="hero-card">
              <Icon name="pin" />
              <div>
                <strong>Open only to businesses in Yola North &amp; Yola South</strong>
                <span>with at least 3 years in operation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="section-container">
          <dl className="facts">
            <div className="fact fact-free">
              <dt><Icon name="tag" />Cost</dt>
              <dd>100% FREE</dd>
            </div>
            <div className="fact">
              <dt><Icon name="clock" />Duration</dt>
              <dd>2-week programme</dd>
            </div>
            <div className="fact">
              <dt><Icon name="cal" />Commences</dt>
              <dd>30th November, 2026</dd>
            </div>
            <div className="fact">
              <dt><Icon name="monitor" />Format</dt>
              <dd>Physical &amp; virtual sessions</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section className="section-padding bg-sunken" id="about">
        <div className="section-container split">
          <figure className="split-media">
            <img src={`${IMG}/icss-facilitator-sepin-susi.jpg`} alt="A facilitator leading an ICSS session under the SEPIN-SUSI programme, with the GIZ and SMEDAN slide on the screen behind" width={1800} height={1350} loading="lazy" />
          </figure>
          <div className="split-copy">
            <p className="eyebrow text-brand">About the programme</p>
            <h2>Stronger foundations for the business you have already built</h2>
            <p>The MSME Capacity Development Training supports business owners in strengthening the foundations of their businesses, with a focus on <strong>developing and improving their business plans</strong>.</p>
            <p>The programme follows the <strong>ICSS</strong> business training pathway and is aligned with <strong>SMEDAN</strong>’s approach to MSME development. Participants learn to understand their markets, plan operations, manage finances, use business development services (BDS) and take the steps to formalise and access finance.</p>

            <div className="pathway" role="group" aria-label="ICSS training pathway">
              <p className="pathway-title">The ICSS pathway</p>
              <ol className="pathway-steps">
                <li>Inspire</li>
                <li>Create</li>
                <li>Scale</li>
                <li className="is-current" aria-current="step">START <span>This programme</span></li>
              </ol>
              <p className="pathway-note">For established businesses ready to grow. You do not need to have attended earlier ICSS stages to apply.</p>
            </div>

            <div className="partner-line">
              <p>In partnership with <strong>GIZ</strong> under the <strong>SEPIN-SUSI Project</strong>.</p>
              <PartnerLogos compact />
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHAT YOU WILL LEARN ============ */}
      <section className="section-padding" id="curriculum">
        <div className="section-container">
          <div className="section-head">
            <p className="eyebrow text-brand">What you will learn</p>
            <h2>Eight practical areas, built around your business plan</h2>
            <p className="lead">Each session is hands-on. You work on your own business as you learn, so you leave with a plan you can use.</p>
          </div>

          <ol className="modules">
            {MODULES.map((m, i) => (
              <li className="card module" key={m.title}>
                <span className="module-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="module-icon"><Icon name={m.icon} /></span>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ WHO CAN APPLY ============ */}
      <section className="section-padding bg-inverted" id="eligibility">
        <div className="section-container eligibility">
          <div className="eligibility-copy">
            <p className="eyebrow eyebrow-on-dark">Who can apply?</p>
            <h2>For established business owners in Yola North and Yola South</h2>
            <p className="lead">The programme is open <strong>only</strong> to applicants who meet both requirements below.</p>

            <ul className="criteria">
              <li>
                <span className="criteria-icon"><Icon name="pin" /></span>
                <div>
                  <h3>Your business operates in Yola North or Yola South LGA</h3>
                  <p>The business must be located and operating within one of these two Local Government Areas.</p>
                </div>
              </li>
              <li>
                <span className="criteria-icon"><Icon name="cal" /></span>
                <div>
                  <h3>You have at least 3 years of business experience</h3>
                  <p>A minimum of three (3) years running your business.</p>
                </div>
              </li>
            </ul>

            <div className="notice" role="note">
              <Icon name="alert" />
              <p><strong>Important:</strong> Registrations from businesses outside Yola North and Yola South LGAs will not be accepted.</p>
            </div>

            <Link className="btn-primary btn-lg" href={MSME_APPLY_PATH}>I qualify — register now</Link>
          </div>

          <div className="eligibility-media" aria-hidden="true">
            <img className="em-a" src={`${IMG}/icss-participants-seated.jpg`} alt="" width={1800} height={1012} loading="lazy" />
            <img className="em-b" src={`${IMG}/icss-training-room.jpg`} alt="" width={1800} height={1012} loading="lazy" />
          </div>
        </div>
      </section>

      {/* ============ TRAINING STRUCTURE ============ */}
      <section className="section-padding bg-sunken" id="schedule">
        <div className="section-container">
          <div className="section-head">
            <p className="eyebrow text-brand">Training structure</p>
            <h2>Two weeks: one in the room, one online</h2>
            <p className="lead">Training commences on <strong>Monday, 30th November, 2026</strong>.</p>
          </div>

          <ol className="timeline">
            <li className="timeline-step">
              <div className="timeline-marker"><span>Week 1</span></div>
              <article className="card timeline-card">
                <img src={`${IMG}/icss-in-person-session.jpg`} alt="Participants seated at long tables while a facilitator leads an in-person ICSS training session" width={1800} height={1012} loading="lazy" />
                <div className="timeline-body">
                  <p className="timeline-when">Week of 30 November 2026</p>
                  <h3><Icon name="users" />Physical, in-person training</h3>
                  <p>Face-to-face sessions with facilitators and fellow business owners. Venue details will be shared after registration.</p>
                </div>
              </article>
            </li>
            <li className="timeline-step">
              <div className="timeline-marker"><span>Week 2</span></div>
              <article className="card timeline-card">
                <img src={`${IMG}/week2-virtual-session.jpg`} alt="Participants following a facilitator who is presenting over a video call" width={2000} height={1122} loading="lazy" />
                <div className="timeline-body">
                  <p className="timeline-when">Week of 7 December 2026</p>
                  <h3><Icon name="monitor" />Virtual training sessions</h3>
                  <p>Online sessions you can join from your business or home, building on what you started in Week 1.</p>
                </div>
              </article>
            </li>
          </ol>
        </div>
      </section>

      {/* ============ WHY PARTICIPATE ============ */}
      <section className="section-padding" id="benefits">
        <div className="section-container split split-reverse">
          <figure className="split-media split-media-tall">
            <img src={`${IMG}/icss-energiser.jpg`} alt="Participants on their feet during an energiser in an ICSS training session" width={1800} height={1012} loading="lazy" />
          </figure>
          <div className="split-copy">
            <p className="eyebrow text-brand">Why participate?</p>
            <h2>Practical value you can take straight back to your business</h2>
            <ul className="benefits">
              {BENEFITS.map((b) => (
                <li key={b}><Icon name="check" />{b}</li>
              ))}
            </ul>
            <Link className="btn-primary btn-lg" href={MSME_APPLY_PATH}>
              Register for free
              <Icon name="arrow" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FINAL CALL TO ACTION ============ */}
      <section className="section-padding bg-brand-soft" id="register">
        <div className="section-container final-cta">
          <div className="final-cta-copy">
            <p className="eyebrow text-brand">Registration</p>
            <h2>Ready to strengthen your business?</h2>
            <p className="lead">If you meet the eligibility requirements, take advantage of this <strong>FREE</strong> opportunity to build your business capacity.</p>
            <div className="final-cta-actions">
              <Link className="btn-primary btn-lg" href={MSME_APPLY_PATH}>
                Register for free
                <Icon name="arrow" />
              </Link>
              <p className="final-cta-meta">Training begins Monday, 30th November 2026</p>
            </div>
            <div className="help">
              <p className="help-title">Questions before you register?</p>
              <a href="tel:+2348088256055"><Icon name="phone" />+234 808 825 6055</a>
              <a href="https://wa.me/2348088256055" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
              <a href="mailto:info@tokoacademy.org"><Icon name="mail" />info@tokoacademy.org</a>
            </div>
          </div>

          <div className="card checklist-card">
            <p className="checklist-title">Before you register, make sure:</p>
            <ul className="register-checks">
              <li><Icon name="check" /><span>Your business is in <strong>Yola North or Yola South LGA</strong></span></li>
              <li><Icon name="check" /><span>You have run it for <strong>3 years or more</strong></span></li>
              <li><Icon name="check" /><span>You can attend <strong>Week 1 in person</strong> and <strong>Week 2 online</strong></span></li>
            </ul>
            <p className="checklist-note">Registrations from outside these two LGAs will not be accepted.</p>
          </div>
        </div>
      </section>

      {/* ============ WHAT WE DO (Toko Academy services) ============ */}
      <section className="section-padding bg-inverted" id="what-we-do">
        <div className="section-container">
          <div className="section-head services-head">
            <p className="eyebrow eyebrow-on-dark">What we do</p>
            <h2>Support for MSMEs beyond the training room</h2>
            <p className="lead">Toko Academy works with business owners, government agencies and development partners in three ways.</p>
          </div>

          <ol className="services">
            {SERVICES.map((s, i) => (
              <li className="service" key={s.title}>
                <span className="service-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="service-icon"><Icon name={s.icon} /></span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <ul className="service-points">
                  {s.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
              </li>
            ))}
          </ol>

          <div className="services-cta">
            <Link className="btn-primary btn-lg" href="/contact/">
              Talk to us
              <Icon name="arrow" />
            </Link>
            <p>A first conversation costs nothing.</p>
          </div>
        </div>
      </section>

      {/* ============ ORGANISERS & PARTNERS ============ */}
      <section className="partners" aria-labelledby="partners-title">
        <div className="section-container">
          <h2 className="eyebrow partners-title" id="partners-title">Organisers and partners</h2>
          <PartnerLogos />
          <p className="partners-project">SEPIN-SUSI Project</p>
        </div>
      </section>

      {/* Mobile sticky registration bar */}
      <MobileCta />
    </>
  );
}
