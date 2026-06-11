import { useState } from 'react';
import Reveal from './Reveal';
import RevealHeading from './RevealHeading';

// Sign up at https://formspree.io, create a form, and replace YOUR_FORM_ID below
const FORMSPREE_ID = 'mdaljzrw';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  const submit = async e => {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setDone(true);
        setForm({ name: '', email: '', message: '' });
        setTimeout(() => setDone(false), 4000);
      } else {
        setError('Something went wrong. Please try again or reach out directly.');
      }
    } catch {
      setError('Failed to send. Please reach out via email directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact">
      <div className="container contact-content">
        <Reveal>
          <p className="section-label section-label-center mono">Contact</p>
        </Reveal>
        <RevealHeading className="serif">Get in Touch</RevealHeading>

        <Reveal delay={80}>
          {done ? (
            <p className="form-success">Thank you. I'll be in touch soon.</p>
          ) : (
            <form onSubmit={submit}>
              {['name', 'email', 'message'].map(field => (
                <div className="form-group" key={field}>
                  <label className="mono" htmlFor={`contact-${field}`}>{field}</label>
                  {field === 'message' ? (
                    <textarea
                      id={`contact-${field}`}
                      name={field}
                      value={form[field]}
                      onChange={e => setForm({ ...form, [field]: e.target.value })}
                      required
                    />
                  ) : (
                    <input
                      id={`contact-${field}`}
                      type={field === 'email' ? 'email' : 'text'}
                      name={field}
                      value={form[field]}
                      onChange={e => setForm({ ...form, [field]: e.target.value })}
                      required
                    />
                  )}
                </div>
              ))}
              {error && <p className="form-error">{error}</p>}
              <button className="submit-button" disabled={sending}>
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </Reveal>

        <Reveal delay={140}>
          <div className="contact-links">
            <p className="mono">Or reach out directly</p>
            <div className="contact-links-list">
              <a href="mailto:shashwathv4405@gmail.com" className="contact-link">Email</a>
              <a href="https://github.com/shashwathv" target="_blank" rel="noopener noreferrer" className="contact-link">GitHub</a>
              <a href="https://linkedin.com/in/shashwathv4405" target="_blank" rel="noopener noreferrer" className="contact-link">LinkedIn</a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
