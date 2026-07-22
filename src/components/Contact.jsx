import { useState } from 'react';
import Reveal from './Reveal';

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
            Say something <em>useful</em>
          </h2>
        </Reveal>

        <div className="contact-spread">
          <Reveal delay={100}>
            {done ? (
              <p className="form-note is-success">
                Sent. I'll write back within a day or two.
              </p>
            ) : (
              <form onSubmit={submit}>
                {error && <p className="form-note is-error">{error}</p>}
                {field('name', 'Your name')}
                {field('email', 'Email', 'email')}
                {field('message', 'Message', 'textarea')}
                <button className="btn-submit" disabled={sending}>
                  {sending ? 'Sending…' : 'Send it'}
                </button>
              </form>
            )}
          </Reveal>

          <Reveal delay={160}>
            <dl className="direct-line">
              <dt>Email</dt>
              <dd>
                <a href="mailto:shashwathv4405@gmail.com">
                  shashwathv4405@gmail.com
                </a>
              </dd>

              <dt>GitHub</dt>
              <dd>
                <a
                  href="https://github.com/shashwathv"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @shashwathv
                </a>
              </dd>

              <dt>LinkedIn</dt>
              <dd>
                <a
                  href="https://linkedin.com/in/shashwathv4405"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  shashwathv4405
                </a>
              </dd>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
