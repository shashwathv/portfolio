export default function Footer() {
  const backToTop = e => {
    e.preventDefault();
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="colophon">
      <div className="sheet">
        <p>
          © 2026 Shashwath V — set in Anton, Archivo &amp; Courier Prime.
          Self-hosted.
        </p>
        <a href="#home" onClick={backToTop}>
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
