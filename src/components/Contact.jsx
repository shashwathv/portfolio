import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = e => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setDone(true);
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setDone(false), 3000);
    }, 1000);
  };

  return (
    <section id="contact">
      <div className="container contact-content">
        <h2 className="serif">Get in Touch</h2>

        {done ? (
          <p>Thank you. I’ll be in touch soon.</p>
        ) : (
          <form onSubmit={submit}>
            {['name', 'email', 'message'].map(field => (
              <div className="form-group" key={field}>
                <label>{field}</label>
                {field === 'message' ? (
                  <textarea
                    name={field}
                    value={form[field]}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                    required
                  />
                ) : (
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    name={field}
                    value={form[field]}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                    required
                  />
                )}
              </div>
            ))}
            <button className="submit-button" disabled={sending}>
              {sending ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}

        <div className="contact-links">
                                <p>Or reach out directly</p>
                                <div className="contact-links-list">
                                    <a href="mailto:shashwath@example.com" className="contact-link">Email</a>
                                    <a href="https://github.com/shashwathv" target="_blank" rel="noopener noreferrer" className="contact-link">GitHub</a>
                                    <a href="https://linkedin.com/in/shashwathv" target="_blank" rel="noopener noreferrer" className="contact-link">LinkedIn</a>
                                </div>
                            </div>
      </div>
    </section>
  );
}
