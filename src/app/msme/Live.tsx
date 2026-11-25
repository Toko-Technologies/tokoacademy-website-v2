'use client';

/**
 * The register bar that slides up on phones between the hero and the final
 * call to action on the /msme page.
 *
 * The countdown and "N days to go" labels that used to live here were removed
 * while the training dates are not confirmed.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MSME_APPLY_PATH } from './config';

/**
 * Shown on phones only (CSS hides it from 900px), and only while neither the
 * hero nor the final "Ready to register" section is on screen, so it never
 * sits on top of a Register button that is already visible.
 */
export function MobileCta() {
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

  return (
    <div className={`mobile-cta${show ? ' is-visible' : ''}`} aria-hidden={show ? 'false' : 'true'}>
      <div>
        <strong>Free MSME training</strong>
        <span>Registration open · Yola North &amp; South</span>
      </div>
      <Link className="btn-primary btn-sm" href={MSME_APPLY_PATH} tabIndex={show ? 0 : -1}>
        Register
      </Link>
    </div>
  );
}
