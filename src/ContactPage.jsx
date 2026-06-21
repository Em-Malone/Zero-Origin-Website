// Contact page — form submits via Web3Forms, plus a direct email address.

import React from 'react';

// Public Web3Forms access key. Safe to expose: it only routes mail to the
// address registered with Web3Forms. Set VITE_WEB3FORMS_KEY in the environment
// (Vercel project settings / .env.local) to override the fallback below.
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || 'YOUR_WEB3FORMS_ACCESS_KEY';

export function ContactPage() {
  // status: 'idle' | 'sending' | 'sent' | 'error'
  const [status, setStatus] = React.useState('idle');
  const [error, setError] = React.useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setError('');

    const f = e.target;
    const payload = {
      access_key: ACCESS_KEY,
      subject: `Enquiry from ${f.name.value || 'website'}`,
      name: f.name.value,
      email: f.email.value,
      message: f.message.value,
      // Honeypot: bots tick this hidden checkbox; real users never see it.
      // Web3Forms expects a boolean — false for humans.
      botcheck: f.botcheck.checked,
    };

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('sent');
        f.reset();
      } else {
        setStatus('error');
        setError(data.message || 'Something went wrong. Please email us directly.');
      }
    } catch {
      setStatus('error');
      setError('Network error. Please email us directly.');
    }
  };

  const buttonLabel = {
    idle: 'Send enquiry →',
    sending: 'Sending…',
    sent: 'Sent ✓',
    error: 'Try again →',
  }[status];

  return (
    <main className="zo-page zo-contact">
      <header className="zo-page-header">
        <div className="zo-page-eyebrow">/ Contact</div>
        <h1 className="zo-page-title">Let&apos;s talk.</h1>
      </header>

      <div className="zo-contact-layout">
        <aside className="zo-contact-aside">
          <div className="zo-contact-label">Email</div>
          <a href="mailto:mail@zero-origin.co.uk" className="zo-contact-email">
            mail@zero-origin.co.uk
          </a>
        </aside>

        <form className="zo-form" onSubmit={onSubmit}>
          <div className="zo-form-row">
            <label className="zo-field">
              <span className="zo-field-tag">Name</span>
              <input name="name" type="text" required placeholder="Your name" />
            </label>
            <label className="zo-field">
              <span className="zo-field-tag">Email</span>
              <input name="email" type="email" required placeholder="you@company.com" />
            </label>
          </div>
          <label className="zo-field">
            <span className="zo-field-tag">Message</span>
            <textarea name="message" rows="5" required placeholder="How can we help?"></textarea>
          </label>

          {/* Honeypot field — hidden from users, catches bots. */}
          <input
            type="checkbox"
            name="botcheck"
            tabIndex="-1"
            autoComplete="off"
            style={{ display: 'none' }}
          />

          <div className="zo-form-actions">
            <button type="submit" className="zo-btn" disabled={status === 'sending'}>
              {buttonLabel}
            </button>
            {status === 'sent' && (
              <p className="zo-form-note">Thanks — we&apos;ll be in touch shortly.</p>
            )}
            {status === 'error' && <p className="zo-form-note zo-form-error">{error}</p>}
          </div>
        </form>
      </div>
    </main>
  );
}
