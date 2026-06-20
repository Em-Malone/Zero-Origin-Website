// Contact page — simple form plus email address.

function ContactPage() {
  const [sent, setSent] = React.useState(false);
  const onSubmit = (e) => {
    e.preventDefault();
    const f = e.target;
    const subject = encodeURIComponent(`Enquiry from ${f.name.value || 'website'}`);
    const body = encodeURIComponent(
      `${f.message.value}\n\n— ${f.name.value}\n${f.email.value}`
    );
    window.location.href = `mailto:mail@zero-origin.co.uk?subject=${subject}&body=${body}`;
    setSent(true);
  };
  return (
    <main className="zo-page zo-contact">
      <header className="zo-page-header">
        <div className="zo-page-eyebrow">/ Contact</div>
        <h1 className="zo-page-title">Let's talk.</h1>
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
            <textarea name="message" rows="5" required placeholder="Big idea, tight schedule, a wall of pixels? Go on…"></textarea>
          </label>
          <div className="zo-form-actions">
            <button type="submit" className="zo-btn">{sent ? 'Opening email ✓' : 'Send enquiry →'}</button>
          </div>
        </form>
      </div>
    </main>);

}

window.ContactPage = ContactPage;
