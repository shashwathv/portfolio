import useReveal from '../hooks/useReveal';

/**
 * Wraps content in a fade-and-rise reveal triggered when scrolled into view.
 * `delay` is in milliseconds, useful for staggering siblings; `as` sets
 * the element, for when the wrapper has to be an <li> or a <section>.
 */
export default function Reveal({ as = 'div', children, delay = 0, className = '', ...rest }) {
  const [ref, visible] = useReveal();
  const Tag = as;

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-revealed' : ''} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
