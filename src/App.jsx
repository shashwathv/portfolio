import Navigation from './components/Navigation';
import ScrollProgress from './components/ScrollProgress';
import Hero from './components/Hero';
import About from './components/About';
import Work from './components/Work';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <Navigation />
      <ScrollProgress />

      <main className="site-content">
        <Hero />
        <About />
        <Work />
        <Skills />
        <Contact />
      </main>

      <Footer />

      {/* Ink sits on top of the stock, not behind it. */}
      <div className="press-texture" aria-hidden="true" />
      <div className="press-grain" aria-hidden="true" />
    </>
  );
}
