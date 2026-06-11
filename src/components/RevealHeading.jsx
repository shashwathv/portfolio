import { Fragment } from 'react';
import useReveal from '../hooks/useReveal';

/**
 * Section heading that reveals word by word — each word rises
 * out of its own mask with a small stagger.
 */
export default function RevealHeading({ children, className = '' }) {
  const [ref, visible] = useReveal();
  const words = String(children).split(' ');

  return (
    <h2 ref={ref} className={`reveal-heading ${visible ? 'is-revealed' : ''} ${className}`.trim()}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="rh-mask">
            <span className="rh-word" style={{ transitionDelay: `${i * 70}ms` }}>
              {word}
            </span>
          </span>
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </h2>
  );
}