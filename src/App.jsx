import { useLayoutEffect } from 'react';
import Background from './components/background/Background';
import Navigation from './components/Navigation';
import ScrollProgress from './components/ScrollProgress';
import Hero from './components/Hero';
import About from './components/About';
import Work from './components/Work';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ProjectPage from './components/ProjectPage';
import { usePath } from './router';

export default function App() {
  const path = usePath();
  const slug = path.match(/^\/work\/([^/]+)\/?$/)?.[1];

  // A new page starts at its top — or, for a link like /#work, at that
  // section. The page scrolls inside #root, and the browser handles a
  // URL's fragment before React has rendered anything to scroll to, so
  // this is done here, instantly, as the browser would have.
  useLayoutEffect(() => {
    const root = document.getElementById('root');
    const id = window.location.hash.slice(1);
    const target = id && document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
    else if (root) root.scrollTo({ top: 0, behavior: 'instant' });
  }, [path]);

  return (
    <>
      {/* Keyed on the page: the tracer measures the reading once, and a
          new page is new reading. The ants write only on the homepage;
          on a project page they just walk. */}
      <Background key={path} silent={slug !== undefined} />
      <Navigation key={`nav${path}`} project={slug !== undefined} />
      <ScrollProgress />

      <main className="site-content">
        {slug !== undefined ? (
          <ProjectPage key={slug} slug={decodeURIComponent(slug)} />
        ) : (
          <>
            <Hero />
            <About />
            <Work />
            <Skills />
            <Contact />
          </>
        )}
      </main>

      <Footer sheet={slug && decodeURIComponent(slug)} />

      {/* Paper fibre over the whole board. */}
      <div className="press-grain" aria-hidden="true" />
    </>
  );
}
