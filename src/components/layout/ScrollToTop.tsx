import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Fixes the bug where navigating kept the previous page's scroll position. */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}
