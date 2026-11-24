import './msme.css';
import IconSprite from './Icons';

/**
 * Wraps /msme and /msme/apply. Everything in msme.css is scoped under the
 * `.msme` class set here, so the page's styles stay on these two pages.
 * The site Header and Footer come from the root layout as usual.
 */
export default function MsmeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="msme">
      <IconSprite />
      {children}
    </div>
  );
}
