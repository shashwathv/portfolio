export default function Footer() {
  const backToTop = (e) => {
    e.preventDefault();
    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer>
      <div className="container footer-row">
        <p>© 2026 Shashwath V</p>
        <a href="#home" className="footer-top mono" onClick={backToTop}>
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
