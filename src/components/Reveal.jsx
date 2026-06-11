import useReveal from '../hooks/useReveal';

/**
 * Wraps content in a fade-and-rise reveal triggered when scrolled into view.
 * `delay` is in milliseconds, useful for staggering siblings.
 */
export default function Reveal({ children, delay = 0, className = '', ...rest }) {
  const [ref, visible] = useReveal();

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-revealed' : ''} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </div>
  );
}
