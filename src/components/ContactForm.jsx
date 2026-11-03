import { useEffect, useRef, useState } from 'react';
import { Send, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

/**
 * Contact form — visitors message Shubham straight from the site.
 *
 * Delivery: FormSubmit (https://formsubmit.co) AJAX endpoint → email inbox. No backend, no API key.
 * The very first submission triggers a one-time ACTIVATION email to the inbox; messages are delivered
 * once that link is clicked. After activation FormSubmit shows a random alias string — put it in
 * VITE_CONTACT_ENDPOINT (e.g. https://formsubmit.co/ajax/<alias>) to keep the address out of the bundle.
 *
 * Spam protection: honeypot field, minimum fill time, per-browser cooldown, length limits.
 */
const DEFAULT_TO = 'shubhamg0116@gmail.com';
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || `https://formsubmit.co/ajax/${DEFAULT_TO}`;
const COOLDOWN_MS = 60 * 1000;
const COOLDOWN_KEY = 'sg-contact-last';
const LIMITS = { name: 80, email: 120, subject: 120, message: 4000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const empty = { name: '', email: '', subject: '', message: '' };

function validate(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = 'Please enter your name';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Enter a valid email so I can reply';
  if (v.message.trim().length < 10) e.message = 'Message should be at least 10 characters';
  return e;
}

export default function ContactForm({ fallbackEmail = DEFAULT_TO }) {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [serverMsg, setServerMsg] = useState('');
  const openedAt = useRef(Date.now());
  const honeyRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const onChange = (field) => (ev) => {
    const next = { ...values, [field]: ev.target.value.slice(0, LIMITS[field]) };
    setValues(next);
    if (touched[field]) setErrors(validate(next));
    if (status === 'error' || status === 'sent') setStatus('idle');
  };
  const onBlur = (field) => () => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(validate(values));
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (status === 'sending') return;
    const errs = validate(values);
    setErrors(errs);
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(errs).length) {
      const first = ['name', 'email', 'message'].find(f => errs[f]);
      document.getElementById(`cf-${first}`)?.focus();
      return;
    }
    // Bots: honeypot filled or form submitted inhumanly fast → pretend success, send nothing
    if (honeyRef.current?.value || Date.now() - openedAt.current < 2500) {
      setStatus('sent');
      setValues(empty);
      return;
    }
    let last = 0;
    try { last = Number(localStorage.getItem(COOLDOWN_KEY) || 0); } catch { /* storage unavailable */ }
    const wait = COOLDOWN_MS - (Date.now() - last);
    if (wait > 0) {
      setStatus('error');
      setServerMsg(`You just sent a message — please wait ${Math.ceil(wait / 1000)}s before sending another.`);
      return;
    }

    setStatus('sending');
    setServerMsg('');
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject.trim() || '(no subject)',
          message: values.message.trim(),
          _subject: `Portfolio message from ${values.name.trim()}${values.subject.trim() ? ` — ${values.subject.trim()}` : ''}`,
          _replyto: values.email.trim(),
          _template: 'table',
          _captcha: 'false',
          _url: window.location.href,
        }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      const ok = res.ok && String(data.success) !== 'false';
      if (!ok) throw new Error(data.message || `HTTP ${res.status}`);
      try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch { /* best-effort */ }
      setStatus('sent');
      setValues(empty);
      setTouched({});
      setErrors({});
    } catch (err) {
      setStatus('error');
      setServerMsg(err.name === 'AbortError'
        ? 'The request timed out. Check your connection and try again.'
        : `Couldn't send right now (${err.message}).`);
    } finally {
      clearTimeout(timer);
    }
  };

  const field = (name, label, props = {}) => {
    const invalid = touched[name] && errors[name];
    const Tag = props.as === 'textarea' ? 'textarea' : 'input';
    const { as, ...rest } = props; // eslint-disable-line no-unused-vars
    return (
      <div className={`cf-field ${name === 'message' ? 'cf-field--full' : ''} ${invalid ? 'cf-field--invalid' : ''}`}>
        <label htmlFor={`cf-${name}`} className="font-mono">{label}</label>
        <Tag
          id={`cf-${name}`}
          name={name}
          value={values[name]}
          onChange={onChange(name)}
          onBlur={onBlur(name)}
          maxLength={LIMITS[name]}
          aria-invalid={invalid ? 'true' : 'false'}
          aria-describedby={invalid ? `cf-${name}-err` : undefined}
          disabled={status === 'sending'}
          {...rest}
        />
        <div className="cf-meta font-mono">
          <span id={`cf-${name}-err`} className="cf-err" role={invalid ? 'alert' : undefined}>{invalid || ''}</span>
          {name === 'message' && <span className="cf-count">{values.message.length}/{LIMITS.message}</span>}
        </div>
      </div>
    );
  };

  return (
    <form className="cf" onSubmit={onSubmit} noValidate aria-label="Contact form">
      <div className="cf-grid">
        {field('name', 'Name *', { type: 'text', autoComplete: 'name', placeholder: 'Your name' })}
        {field('email', 'Email *', { type: 'email', autoComplete: 'email', inputMode: 'email', placeholder: 'you@example.com' })}
        <div className="cf-field cf-field--full">
          <label htmlFor="cf-subject" className="font-mono">Subject</label>
          <input id="cf-subject" name="subject" type="text" value={values.subject} onChange={onChange('subject')} maxLength={LIMITS.subject} placeholder="Collaboration, pentest, internship…" disabled={status === 'sending'} />
          <div className="cf-meta" aria-hidden="true" />
        </div>
        {field('message', 'Message *', { as: 'textarea', rows: 6, placeholder: 'Say hi, ask a question, or pitch an idea…', 'data-lenis-prevent': true })}
      </div>

      {/* Honeypot — hidden from people and screen readers; bots tend to fill every field */}
      <input ref={honeyRef} type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" className="cf-honey" />

      <div className="cf-actions">
        <button type="submit" className="cf-submit font-mono" disabled={status === 'sending'}>
          {status === 'sending'
            ? <><Loader2 size={16} className="cf-spin" /> SENDING…</>
            : <><Send size={16} /> SEND MESSAGE</>}
        </button>
        <div className="cf-status font-mono" aria-live="polite">
          {status === 'sent' && (
            <span className="cf-ok"><CheckCircle2 size={15} /> Message sent — I&apos;ll get back to you soon.</span>
          )}
          {status === 'error' && (
            <span className="cf-bad">
              <AlertTriangle size={15} /> {serverMsg}{' '}
              <a href={`mailto:${fallbackEmail}?subject=${encodeURIComponent(values.subject || 'Hello from your portfolio')}&body=${encodeURIComponent(values.message)}`}>Email me directly</a>
            </span>
          )}
        </div>
      </div>
    </form>
  );
}
