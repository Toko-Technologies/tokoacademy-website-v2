'use client';

/**
 * The moving parts of the /msme page, ported from the zip's script.js:
 * the hero countdown, the "N days to go" label in the announcement bar, and
 * the register bar that slides up on phones between the hero and the final
 * call to action.
 *
 * All three render nothing time-dependent on the server (the page is a static
 * export, built long before anyone reads it) and fill in once mounted, which
 * also keeps hydration consistent. Once the programme has started they hide
 * themselves, exactly as the original did.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MSME_APPLY_PATH, MSME_START } from './config';

const pad = (n: number) => (n < 10 ? '0' : '') + n;

/** Milliseconds until the start, refreshed every `everyMs`; null until mounted. */
function useMsLeft(everyMs: number) {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => {
      const left = MSME_START.getTime() - Date.now();
      setMs(left);
      return left > 0;
    };
    if (!tick()) return;
    const timer = setInterval(() => {
      if (!tick()) clearInterval(timer);
    }, everyMs);
    return () => clearInterval(timer);
  }, [everyMs]);
  return ms;
}

const daysLeft = (ms: number) => Math.ceil(ms / 86400000);

export function Countdown() {
  const ms = useMsLeft(1000);
  const running = ms !== null && ms > 0;
  const s = running ? Math.floor(ms / 1000) : 0;
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);

  return (
    <div className="countdown" hidden={!running}>
      <div className="countdown-text">
        <p className="countdown-label">Training begins in</p>
        <p className="countdown-date">Monday, 30th November 2026</p>
      </div>
      <div className="countdown-units" role="timer" aria-live="off">
        <div className="cd-unit"><span>{pad(d)}</span><small>Days</small></div>
        <div className="cd-unit"><span>{pad(h)}</span><small>Hours</small></div>
        <div className="cd-unit"><span>{pad(m)}</span><small>Mins</small></div>
        <div className="cd-unit"><span>{pad(s % 60)}</span><small>Secs</small></div>
      </div>
    </div>
  );
}

/** "12 days to go" in the announcement bar; empty (and so hidden by CSS) otherwise. */
export function DaysToGo() {
  const ms = useMsLeft(60000);
  let text = '';
  if (ms !== null && ms > 0) text = daysLeft(ms) > 1 ? `${daysLeft(ms)} days to go` : 'Last day to register';
  return <span className="announce-days">{text}</span>;
}

/**
 * Shown on phones only (CSS hides it from 900px), and only while neither the
 * hero nor the final "Ready to register" section is on screen, so it never
 * sits on top of a Register button that is already visible.
 */
export function MobileCta() {
  const ms = useMsLeft(60000);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('.msme .hero');
    const register = document.getElementById('register');
    if (!hero || !register || !('IntersectionObserver' in window)) return;
    let heroVisible = true;
    let registerVisible = false;
    const update = () => setShow(!heroVisible && !registerVisible);
    const a = new IntersectionObserver((e) => { heroVisible = e[0].isIntersecting; update(); }, { threshold: 0 });
    const b = new IntersectionObserver((e) => { registerVisible = e[0].isIntersecting; update(); }, { threshold: 0.05 });
    a.observe(hero);
    b.observe(register);
    return () => { a.disconnect(); b.disconnect(); };
  }, []);

  let when = 'Starts 30 Nov';
  if (ms !== null && ms > 0) when = daysLeft(ms) > 1 ? `Starts in ${daysLeft(ms)} days` : 'Starts tomorrow';

  return (
    <div className={`mobile-cta${show ? ' is-visible' : ''}`} aria-hidden={show ? 'false' : 'true'}>
      <div>
        <strong>Free MSME training</strong>
        <span>{when} · Yola North &amp; South</span>
      </div>
      <Link className="btn-primary btn-sm" href={MSME_APPLY_PATH} tabIndex={show ? 0 : -1}>
        Register
      </Link>
    </div>
  );
}
