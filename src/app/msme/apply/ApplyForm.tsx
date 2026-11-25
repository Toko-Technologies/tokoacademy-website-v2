'use client';

/**
 * The MSME application: a six-step form whose answers go into the real
 * Google Form (and its linked Sheet), not anywhere on this site.
 *
 * A React port of the zip's apply.js. Same steps, same questions, same rules:
 *
 *  - Every question is required. Follow-ups only appear when they apply (CAC
 *    year and RC/BN number if registered, loan amount if "Yes", the email
 *    field unless "I do not have an email address" is ticked).
 *  - "Choose up to three" is enforced, and "None of these"-style options
 *    clear the others.
 *  - Everyone can submit, whatever their LGA or business age: eligibility is
 *    checked by the team afterwards, in the Sheet. (BLOCK_INELIGIBLE = true
 *    would stop applicants outside Yola North/South or under 3 years old.)
 *  - Progress survives an accidental refresh (sessionStorage, this tab only)
 *    and is cleared on submit.
 *  - A hidden spam-trap field, and the submit button locks while sending.
 *
 * Submission is a POST to Google's own formResponse endpoint with the form's
 * own entry IDs (see questions.ts), sent without cookies or a referrer.
 * Google does not let another site read its reply (no-cors), so a request
 * that completes is treated as success and only a network failure is
 * reported, with a link to the Google Form itself as a fallback.
 *
 * Without JavaScript the <noscript> styles show every section at once and the
 * browser posts the form straight to Google, as the original page did.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '../Icons';
import { MSME_PATH } from '../config';
import { GOOGLE_FORM_URL, SECTIONS, SUBMIT_URL, type ChoiceQuestion, type Question } from './questions';

/**
 * Stop applicants who fail the eligibility rules? Off: everyone may submit,
 * and the team separates eligible applicants afterwards from the responses.
 */
const BLOCK_INELIGIBLE = false;
const LGA_ID = '970623196';
const YEARS_ID = '497124056';
const TOO_NEW = ['Less than 1 year', '1 to 2 years'];
const OTHER = '__other_option__';
const STORAGE_KEY = 'toko-msme-application';
const ELIGIBILITY_STEP = 1;
const LAST = SECTIONS.length - 1;
const ALL_QUESTIONS = SECTIONS.flatMap((s) => s.questions);
const DATE_IDS = ALL_QUESTIONS.filter((q) => q.kind === 'date').map((q) => q.id);

const MSG = {
  text: 'This question is required.',
  radio: 'Please choose an option.',
  checkbox: 'Please tick at least one option.',
  other: 'Please specify your answer.',
  email: 'Enter a valid email address.',
  date: 'Please enter the date.',
  lga: 'This training is only open to businesses located in Yola North or Yola South LGA, so we are unable to accept this application.',
  years: 'This training is for businesses that have been operating for at least 3 years, so we are unable to accept this application.',
  network: 'We couldn’t send your application. Please check your internet connection and try again.',
};

/**
 * Everything the applicant has entered.
 * `text` holds text and date answers by question id, and the "Other, please
 * specify" text as `<id>.other`. `picked` holds radio and checkbox choices.
 */
type Answers = {
  text: Record<string, string>;
  picked: Record<string, string[]>;
  noEmail: boolean;
};

const EMPTY: Answers = { text: {}, picked: {}, noEmail: false };

/** Smooth scrolling, unless the visitor has asked their device for less motion. */
const motion = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

const normalisePhone = (v: string) => v.replace(/[\s\-().]/g, '');
const fieldId = (name: string) => name.replace(/^entry\./, '');
const today = () => {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
};

function isShown(q: Question, a: Answers) {
  if (!q.showWhen) return true;
  return q.showWhen.values.includes(a.picked[fieldId(q.showWhen.field)]?.[0] ?? '');
}

/** The error for one question, or '' if its answer is acceptable. */
function validate(q: Question, a: Answers): string {
  if (!isShown(q, a)) return '';
  if (q.kind === 'radio' || q.kind === 'checkbox') {
    const picked = a.picked[q.id] ?? [];
    if (!picked.length) return MSG[q.kind];
    if (q.max && picked.length > q.max) return `Please choose no more than ${q.max}.`;
    if (picked.includes(OTHER) && !(a.text[`${q.id}.other`] ?? '').trim()) return MSG.other;
    return '';
  }
  if (q.kind === 'date') {
    const v = a.text[q.id] ?? '';
    return !v || isNaN(new Date(v).getTime()) ? MSG.date : '';
  }
  if (q.noEmail && a.noEmail) return '';
  const raw = a.text[q.id] ?? '';
  const v = (q.field.phone ? normalisePhone(raw) : raw).trim();
  if (!v) return MSG.text;
  if (q.field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return MSG.email;
  if (q.field.pattern && !new RegExp(q.field.pattern).test(v)) return q.field.patternMsg || MSG.text;
  return '';
}

function eligibilityMessage(a: Answers) {
  if (!BLOCK_INELIGIBLE) return '';
  if (a.picked[LGA_ID]?.[0] === OTHER) return MSG.lga;
  if (TOO_NEW.includes(a.picked[YEARS_ID]?.[0] ?? '')) return MSG.years;
  return '';
}

/** The POST body Google expects: entry.<id>=value for every answer given. */
function buildBody(a: Answers) {
  const body = new URLSearchParams();
  for (const s of SECTIONS) {
    for (const q of s.questions) {
      if (!isShown(q, a)) continue;
      if (q.kind === 'text') {
        if (q.noEmail && a.noEmail) {
          body.append(q.noEmail.name, q.noEmail.value);
        } else {
          const raw = a.text[q.id] ?? '';
          body.append(`entry.${q.id}`, q.field.phone ? normalisePhone(raw) : raw.trim());
        }
      } else if (q.kind === 'date') {
        const [y = '', m = '', d = ''] = (a.text[q.id] ?? '').split('-');
        body.append(`entry.${q.id}_year`, y);
        body.append(`entry.${q.id}_month`, m ? String(+m) : '');
        body.append(`entry.${q.id}_day`, d ? String(+d) : '');
      } else {
        const picked = a.picked[q.id] ?? [];
        for (const o of q.options) if (picked.includes(o.value)) body.append(`entry.${q.id}`, o.value);
        if (picked.includes(OTHER)) body.append(`entry.${q.id}.other_option_response`, (a.text[`${q.id}.other`] ?? '').trim());
      }
    }
  }
  // Google Forms needs these to accept answers from every section.
  body.append('fvv', '1');
  body.append('pageHistory', SECTIONS.map((_, i) => i).join(','));
  return body;
}

/** Reads saved progress, keeping only values this form could have produced. */
function restore(): { answers: Answers; step: number } | null {
  let data: unknown;
  try {
    data = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object') return null;
  const d = data as { step?: unknown; text?: unknown; picked?: unknown; noEmail?: unknown };
  const answers: Answers = { text: {}, picked: {}, noEmail: d.noEmail === true };
  const text = (d.text && typeof d.text === 'object' ? d.text : {}) as Record<string, unknown>;
  const picked = (d.picked && typeof d.picked === 'object' ? d.picked : {}) as Record<string, unknown>;
  for (const s of SECTIONS) {
    for (const q of s.questions) {
      for (const key of [q.id, `${q.id}.other`]) {
        if (typeof text[key] === 'string') answers.text[key] = (text[key] as string).slice(0, 1000);
      }
      if ((q.kind === 'radio' || q.kind === 'checkbox') && Array.isArray(picked[q.id])) {
        const allowed = q.options.map((o) => o.value);
        answers.picked[q.id] = (picked[q.id] as unknown[]).filter((v): v is string => typeof v === 'string' && allowed.includes(v));
      }
    }
  }
  const step = Math.max(0, Math.min(Number.parseInt(String(d.step), 10) || 0, LAST));
  return { answers, step };
}

/** What the page looks like without JavaScript: every section, posting straight to Google. */
const NO_SCRIPT_CSS = [
  '.msme .is-enhanced .step{display:block}',
  '.msme .is-enhanced .step+.step{margin-top:3rem;padding-top:2.5rem;border-top:1px solid rgb(var(--line))}',
  '.msme .is-enhanced .required-note{display:block}',
  '.msme .stepper,.msme .progress,.msme .form-nav [data-next],.msme .form-nav [data-back]{display:none!important}',
  '.msme .form-nav [data-submit]{display:inline-flex!important}',
].join('');

export default function ApplyForm() {
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [finished, setFinished] = useState(false);
  const [formError, setFormError] = useState<{ text: string; withLink: boolean } | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const ineligibleRef = useRef<HTMLDivElement>(null);
  const formErrorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const stepHeadings = useRef<Array<HTMLHeadingElement | null>>([]);

  /* Scrolling and focus have to wait until the step they target is on screen. */
  const afterRender = useRef<(() => void) | null>(null);
  useEffect(() => {
    const run = afterRender.current;
    afterRender.current = null;
    run?.();
  });

  const ineligible = eligibilityMessage(answers);

  /* ---------- restore, then save as the applicant goes ---------- */
  useEffect(() => {
    const saved = restore();
    const next = saved?.answers ?? EMPTY;
    // The declaration date starts as today, as on the original page.
    const text = { ...next.text };
    for (const id of DATE_IDS) if (!text[id]) text[id] = today();
    setAnswers({ ...next, text });
    if (saved) setStep(saved.step);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || finished) return;
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step, ...answers }));
      } catch {
        /* storage unavailable: ignore */
      }
    }, 250);
    return () => clearTimeout(t);
  }, [answers, step, ready, finished]);

  /* ---------- updating answers ---------- */
  /** Functional, so two changes in quick succession (a blur, then a click) both land. */
  const update = (change: (a: Answers) => Answers) => setAnswers(change);

  /* A question showing an error is re-checked as soon as its answer changes. */
  useEffect(() => {
    setErrors((errs) => {
      let changed = false;
      const out = { ...errs };
      for (const q of ALL_QUESTIONS) {
        if (!errs[q.id]) continue;
        const msg = validate(q, answers);
        if (msg !== errs[q.id]) { out[q.id] = msg; changed = true; }
      }
      return changed ? out : errs;
    });
  }, [answers]);

  const setText = (key: string, value: string) =>
    update((a) => ({ ...a, text: { ...a.text, [key]: value } }));

  const toggle = (q: ChoiceQuestion, value: string, checked: boolean) =>
    update((a) => {
      let picked: string[];
      if (q.kind === 'radio') {
        picked = [value];
      } else if (!checked) {
        picked = (a.picked[q.id] ?? []).filter((v) => v !== value);
      } else {
        const exclusive = new Set(q.options.filter((o) => o.exclusive).map((o) => o.value));
        // Ticking "None of these" clears the rest; ticking anything else clears "None of these".
        const kept = exclusive.has(value) ? [] : (a.picked[q.id] ?? []).filter((v) => !exclusive.has(v));
        picked = [...kept, value];
      }
      return { ...a, picked: { ...a.picked, [q.id]: picked } };
    });

  /* ---------- steps ---------- */
  const scrollToShell = () => {
    const shell = shellRef.current;
    if (!shell) return;
    const headerH = parseFloat(getComputedStyle(shell).getPropertyValue('--header-h')) || 72;
    const top = shell.getBoundingClientRect().top + window.scrollY - headerH - 18;
    if (window.scrollY > top) window.scrollTo({ top, behavior: motion() });
  };

  const goTo = (i: number) => {
    const target = Math.max(0, Math.min(i, LAST));
    setStep(target);
    setFormError(null);
    afterRender.current = () => {
      scrollToShell();
      stepHeadings.current[target]?.focus({ preventScroll: true });
    };
  };

  /** Marks every question in a step, and returns the first one that is wrong. */
  const checkStep = (i: number): string | null => {
    let firstBad: string | null = null;
    const found: Record<string, string> = {};
    for (const q of SECTIONS[i].questions) {
      const msg = validate(q, answers);
      found[q.id] = msg;
      if (msg && !firstBad) firstBad = q.id;
    }
    setErrors((e) => ({ ...e, ...found }));
    return firstBad;
  };

  const focusQuestion = (id: string) => {
    const q = formRef.current?.querySelector<HTMLElement>(`[data-q="${id}"]`);
    if (!q) return;
    const target = q.querySelector<HTMLElement>('.input:not([disabled]), .options input:not([disabled])');
    q.scrollIntoView({ behavior: motion(), block: 'center' });
    target?.focus({ preventScroll: true });
  };

  const showIneligible = () => {
    afterRender.current = () => ineligibleRef.current?.scrollIntoView({ behavior: motion(), block: 'center' });
  };

  const onNext = () => {
    const bad = checkStep(step);
    if (bad) {
      afterRender.current = () => focusQuestion(bad);
      return;
    }
    if (step === ELIGIBILITY_STEP && ineligible) {
      showIneligible();
      return;
    }
    goTo(step + 1);
  };

  /* ---------- submit ---------- */
  const showSuccess = () => {
    setFinished(true);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    afterRender.current = () => {
      const shell = shellRef.current;
      if (shell) {
        const headerH = parseFloat(getComputedStyle(shell).getPropertyValue('--header-h')) || 72;
        window.scrollTo({ top: shell.getBoundingClientRect().top + window.scrollY - headerH - 18, behavior: motion() });
      }
      successRef.current?.focus({ preventScroll: true });
    };
  };

  const showFormError = (text: string, withLink: boolean) => {
    setFormError({ text, withLink });
    afterRender.current = () => formErrorRef.current?.scrollIntoView({ behavior: motion(), block: 'center' });
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    setFormError(null);

    for (let i = 0; i < SECTIONS.length; i++) {
      const bad = checkStep(i);
      if (bad) {
        setStep(i);
        afterRender.current = () => focusQuestion(bad);
        return;
      }
    }
    if (ineligible) {
      setStep(ELIGIBILITY_STEP);
      showIneligible();
      return;
    }

    // Bots fill the hidden trap field: pretend it worked and send nothing.
    if (honeypotRef.current?.value) {
      showSuccess();
      return;
    }

    setSending(true);
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 20000);

    fetch(SUBMIT_URL, {
      method: 'POST',
      mode: 'no-cors',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      body: buildBody(answers),
      signal: ctrl.signal,
    })
      .then(() => showSuccess())
      .catch(() => showFormError(MSG.network, true))
      .finally(() => {
        clearTimeout(timeout);
        setSending(false);
      });
  };

  /* ---------- rendering ---------- */
  const errorProps = (q: Question) =>
    errors[q.id] ? { 'aria-invalid': true as const, 'aria-errormessage': `err-${q.id}` } : {};

  const renderQuestion = (q: Question) => {
    const shown = isShown(q, answers);
    const err = errors[q.id] && shown ? errors[q.id] : '';
    const cls = `q${err ? ' has-error' : ''}`;
    const num = q.num ? <span className="q-num">{q.num}</span> : null;
    const helpId = q.help ? `h-${q.id}` : undefined;
    const help = q.help ? <p className="q-help" id={helpId}>{q.help}</p> : null;
    const error = <p className="q-error" id={`err-${q.id}`}>{err}</p>;

    if (q.kind === 'radio' || q.kind === 'checkbox') {
      const picked = answers.picked[q.id] ?? [];
      const full = !!q.max && picked.length >= q.max;
      const otherOn = picked.includes(OTHER);
      const otherKey = `${q.id}.other`;
      return (
        <fieldset key={q.id} className={`${cls}${q.declaration ? ' q-declaration' : ''}`} data-q={q.id} data-kind={q.kind} data-max={q.max} hidden={!shown}>
          <legend className="q-label">{num}{q.label}</legend>
          {help}
          {q.declaration && <p className="declaration-text">{q.declaration}</p>}
          <div className={`options${q.grid ? ' options-grid' : ''}`}>
            {q.options.map((o) => {
              const checked = picked.includes(o.value);
              return (
                <label key={o.value} className={`option${o.strong ? ' option-strong' : ''}`}>
                  <input
                    type={q.kind}
                    name={`entry.${q.id}`}
                    value={o.value}
                    checked={checked}
                    disabled={!shown || (q.kind === 'checkbox' && full && !checked)}
                    onChange={(e) => toggle(q, o.value, e.target.checked)}
                    {...errorProps(q)}
                  />
                  <span className="option-mark" aria-hidden="true"></span>
                  <span className="option-text">{o.label ?? o.value}</span>
                </label>
              );
            })}
          </div>
          {q.options.some((o) => o.other) && (
            <div className="other-input" hidden={!otherOn}>
              <input
                className="input"
                name={`entry.${q.id}.other_option_response`}
                type="text"
                maxLength={100}
                placeholder="Please specify"
                aria-label={`${q.label}: other, please specify`}
                disabled={!otherOn || !shown}
                value={answers.text[otherKey] ?? ''}
                onChange={(e) => setText(otherKey, e.target.value)}
                {...errorProps(q)}
              />
            </div>
          )}
          {error}
        </fieldset>
      );
    }

    if (q.kind === 'date') {
      const [y = '', m = '', d = ''] = (answers.text[q.id] ?? '').split('-');
      return (
        <div key={q.id} className={cls} data-q={q.id} data-kind="date">
          <label className="q-label" htmlFor={`e-${q.id}`}>{num}{q.label}</label>
          <input
            className="input input-date"
            id={`e-${q.id}`}
            type="date"
            required
            value={answers.text[q.id] ?? ''}
            onChange={(e) => setText(q.id, e.target.value)}
            {...errorProps(q)}
          />
          <input type="hidden" name={`entry.${q.id}_year`} value={y} />
          <input type="hidden" name={`entry.${q.id}_month`} value={m ? String(+m) : ''} />
          <input type="hidden" name={`entry.${q.id}_day`} value={d ? String(+d) : ''} />
          {error}
        </div>
      );
    }

    const f = q.field;
    const disabled = !shown || (!!q.noEmail && answers.noEmail);
    const common = {
      className: 'input',
      id: `e-${q.id}`,
      name: `entry.${q.id}`,
      maxLength: f.maxLength,
      required: true,
      disabled,
      autoComplete: f.autoComplete,
      placeholder: f.placeholder,
      'aria-describedby': helpId,
      value: answers.text[q.id] ?? '',
      ...errorProps(q),
    };
    return (
      <div key={q.id} className={cls} data-q={q.id} hidden={!shown}>
        <label className="q-label" htmlFor={`e-${q.id}`}>{num}{q.label}</label>
        {help}
        {f.type === 'textarea' ? (
          <textarea {...common} rows={f.rows} onChange={(e) => setText(q.id, e.target.value)} />
        ) : (
          <input
            {...common}
            type={f.type}
            inputMode={f.inputMode}
            onChange={(e) => setText(q.id, e.target.value)}
            onBlur={f.phone ? (e) => e.target.value && setText(q.id, normalisePhone(e.target.value)) : undefined}
          />
        )}
        {q.noEmail && (
          <label className="inline-check">
            <input
              type="checkbox"
              name={q.noEmail.name}
              value={q.noEmail.value}
              checked={answers.noEmail}
              onChange={(e) => {
                const on = e.target.checked;
                update((a) => ({ ...a, noEmail: on }));
              }}
            />
            <span className="option-mark" aria-hidden="true"></span>
            {q.noEmail.value}
          </label>
        )}
        {error}
      </div>
    );
  };

  const isLast = step === LAST;

  return (
    <>
      <noscript dangerouslySetInnerHTML={{ __html: `<style>${NO_SCRIPT_CSS}</style>` }} />

      <aside className="apply-aside" aria-label="Form sections">
        <ol className="stepper">
          {SECTIONS.map((s, n) => {
            const done = finished || n < step;
            const current = !finished && n === step;
            return (
              <li key={s.sec} className={current ? 'is-current' : done ? 'is-done' : undefined} aria-current={current ? 'step' : undefined}>
                <span className="stepper-dot" aria-hidden="true"><span>{n + 1}</span><Icon name="check" /></span>
                <span className="stepper-text"><span className="stepper-sec">{s.sec}</span>{s.short}</span>
              </li>
            );
          })}
        </ol>
        <div className="aside-note">
          <p><strong>Who should apply:</strong> owners of businesses located in Yola North or Yola South LGA that have been operating for at least 3 years.</p>
          <p>Week 1 is physical training in Yola; Week 2 is virtual. No stipend or payment is attached to participation.</p>
        </div>
      </aside>

      <div className="card form-shell" ref={shellRef}>
        <div className="progress" hidden={finished}>
          <p className="progress-text">
            <span>Step {step + 1} of {SECTIONS.length}</span>
            <span data-progress-name>{SECTIONS[step].title}</span>
          </p>
          <div className="progress-track" role="progressbar" aria-valuemin={1} aria-valuemax={SECTIONS.length} aria-valuenow={step + 1} aria-label="Form progress">
            <span className="progress-fill" style={{ width: `${((step + 1) / SECTIONS.length) * 100}%` }}></span>
          </div>
        </div>

        <form
          id="apply-form"
          ref={formRef}
          className="apply-form is-enhanced"
          action={SUBMIT_URL}
          method="POST"
          acceptCharset="UTF-8"
          noValidate
          hidden={finished}
          onSubmit={onSubmit}
        >
          <p className="required-note">All questions are required.</p>

          {SECTIONS.map((s, i) => (
            <section key={s.sec} className={`step${i === step ? ' is-active' : ''}`} data-step={i} aria-labelledby={`step-title-${i}`}>
              <header className="step-head">
                <p className="eyebrow text-brand">{s.eyebrow}</p>
                <h2 id={`step-title-${i}`} tabIndex={-1} ref={(el) => { stepHeadings.current[i] = el; }}>{s.title}</h2>
                {s.desc && <p className="step-desc">{s.desc}</p>}
              </header>
              {s.questions.map(renderQuestion)}
              {i === ELIGIBILITY_STEP && (
                <div className="notice notice-block" id="ineligible" role="alert" ref={ineligibleRef} hidden={!ineligible}>
                  <Icon name="alert" />
                  <p>{ineligible}</p>
                </div>
              )}
            </section>
          ))}

          {/* Google Forms needs these to accept answers from every section */}
          <input type="hidden" name="fvv" value="1" />
          <input type="hidden" name="pageHistory" value={SECTIONS.map((_, i) => i).join(',')} />

          {/* Spam trap: hidden from people, bots fill it in. Never sent to Google. */}
          <div className="hp" aria-hidden="true">
            <label htmlFor="hp-website">Website</label>
            <input id="hp-website" type="text" ref={honeypotRef} tabIndex={-1} autoComplete="off" />
          </div>

          <div className="form-error" id="form-error" role="alert" ref={formErrorRef} hidden={!formError}>
            <Icon name="alert" />
            <p>
              {formError?.text}{' '}
              {formError?.withLink && (
                <>
                  If it keeps failing,{' '}
                  <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer">apply on Google Forms instead</a>.
                </>
              )}
            </p>
          </div>

          <div className="form-nav">
            <button type="button" className="btn-secondary" data-back hidden={step === 0} disabled={sending} onClick={() => goTo(step - 1)}>
              <Icon name="back" />Back
            </button>
            <button type="button" className="btn-primary btn-lg" data-next hidden={isLast} onClick={onNext}>
              Continue<Icon name="arrow" />
            </button>
            <button type="submit" className="btn-primary btn-lg" data-submit hidden={!isLast} disabled={sending}>
              <span className="btn-label">{sending ? 'Submitting…' : 'Submit application'}</span><Icon name="arrow" />
            </button>
          </div>

          <p className="secure-note"><Icon name="lock" />Your answers are sent securely to Toko Academy&apos;s application form on Google Forms and used only for participant selection and follow-up.</p>
        </form>

        <div className="success" id="success" tabIndex={-1} ref={successRef} hidden={!finished}>
          <span className="success-icon"><Icon name="check" /></span>
          <h2>Application received</h2>
          <p className="success-lead">Thank you. Your application has been received. Shortlisted applicants may be contacted for a short interview before selection.</p>
          <div className="success-next">
            <p><strong>What happens next</strong></p>
            <p>Keep your phone close. If you are shortlisted, the Toko Academy team will contact you with the training dates and venue.</p>
          </div>
          <Link className="btn-secondary" href={MSME_PATH}>Back to programme page</Link>
        </div>
      </div>
    </>
  );
}
