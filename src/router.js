import { createElement, useSyncExternalStore } from 'react';

/**
 * Just enough routing for two kinds of page — the homepage and
 * /work/<slug> — on the History API, without a library.
 *
 * Direct loads and refreshes of /work/<slug> rely on the server
 * answering every unknown path with index.html: Vite's dev and preview
 * servers do, and so does Coolify's static-site nginx config.
 */

const listeners = new Set();

function subscribe(fn) {
  listeners.add(fn);
  window.addEventListener('popstate', fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener('popstate', fn);
  };
}

/** The current path, e.g. "/" or "/work/kanzen". */
export function usePath() {
  return useSyncExternalStore(subscribe, () => window.location.pathname);
}

/** Go to `to` ("/work/kanzen", "/#work") as a new history entry. */
export function navigate(to) {
  window.history.pushState(null, '', to);
  listeners.forEach(fn => fn());
}

/**
 * An <a> that routes in place. Modified clicks (new tab, new window)
 * and anything but the main button are left to the browser.
 */
export function Link({ to, onClick, ...rest }) {
  const handle = e => {
    onClick?.(e);
    if (
      e.defaultPrevented || e.button !== 0 ||
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
    ) return;
    e.preventDefault();
    navigate(to);
  };
  return createElement('a', { href: to, onClick: handle, ...rest });
}
