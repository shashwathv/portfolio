import Background from './components/background/Background';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import About from './components/About';
import Work from './components/Work';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <Background />
      <Navigation />
      <main className="site-content">
        <Hero />
        <About />
        <Work />
        <Skills />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
