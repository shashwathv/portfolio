import { useState } from 'react';
import Reveal from './Reveal';

const FORMSPREE_ID = 'mdaljzrw';

/**
 * The address is never written down as one string — not in this file,
 * not in the built bundle, and not in the DOM until someone asks for
 * it. Harvesters that grep static HTML or scrape the rendered page
 * come away with a button that says "show address" and nothing else.
 */
const MAILBOX = ['shashwathv4405', 'gmail.com'];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState(null);

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
        setTimeout(() => setDone(false), 5000);
      } else {
        setError("That didn't send. Try again, or email me directly.");
      }
    } catch {
      setError('No connection. Email me directly and it will reach me.');
    } finally {
      setSending(false);
    }
  };

  const field = (name, label, type = 'text') => (
    <div className="form-field" key={name}>
      <label htmlFor={`contact-${name}`}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          id={`contact-${name}`}
          name={name}
          value={form[name]}
          onChange={e => setForm({ ...form, [name]: e.target.value })}
          rows={5}
          required
        />
      ) : (
        <input
          id={`contact-${name}`}
          type={type}
          name={name}
          value={form[name]}
          onChange={e => setForm({ ...form, [name]: e.target.value })}
          required
        />
      )}
    </div>
  );

  return (
    <section id="contact">
      <div className="sheet">
        <Reveal>
          <p className="section-kicker">Letters to the editor</p>
        </Reveal>

        <Reveal delay={60}>
          <h2 className="section-title">
            The desk is <em>always open</em>
          </h2>
        </Reveal>

        {/* The section's kicker calls these letters to the editor, so
            the form is the object that goes with the name: a printed
            reply card, on the stock, cut out of the page. The stub on
            the right is the part you keep. */}
        <Reveal delay={100}>
          <div className="reply-card">
            <div className="card-cut" aria-hidden="true" />

            <div className="card-body">
              <p className="card-head">
                Reply card <span aria-hidden="true">·</span> Nº 04
              </p>

              {done ? (
                <div className="card-received">
                  <p className="received-stamp" aria-hidden="true">Received</p>
                  <p className="received-note">
                    Sent. I'll write back within a day or two.
                  </p>
                </div>
              ) : (
                <form onSubmit={submit}>
                  {error && <p className="form-note">{error}</p>}
                  {field('name', 'Your name')}
                  {field('email', 'Email', 'email')}
                  {field('message', 'Message', 'textarea')}
                  <button className="btn-submit" disabled={sending}>
                    {sending ? 'Sending…' : 'Send it'}
                  </button>
                </form>
              )}
            </div>

            <div className="card-stub">
              <div className="stub-postage" aria-hidden="true">
                <span>No stamp needed</span>
              </div>

              <p className="stub-head">Or write direct</p>

              <dl className="direct-line">
                <dt>Email</dt>
                <dd>
                  {address ? (
                    <a href={`mailto:${address}`}>{address}</a>
                  ) : (
                    <button
                      type="button"
                      className="unmask"
                      onClick={() => setAddress(MAILBOX.join('@'))}
                    >
                      Show address
                    </button>
                  )}
                </dd>

                <dt>GitHub</dt>
                <dd>
                  <a
                    href="https://github.com/shashwathv"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    github.com/shashwathv
                  </a>
                </dd>

                <dt>LinkedIn</dt>
                <dd>
                  <a
                    href="https://linkedin.com/in/shashwathv4405"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    linkedin.com/in/shashwathv4405
                  </a>
                </dd>
              </dl>

              <p className="stub-keep" aria-hidden="true">Detach and keep</p>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
