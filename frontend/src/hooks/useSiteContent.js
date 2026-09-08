import { useEffect, useState } from 'react';
import { siteContentApi } from '../api/client';

/**
 * Load an admin-managed content document while always returning a usable
 * design-safe fallback when the API is unavailable or partially configured.
 */
export default function useSiteContent(key, fallback = {}) {
  const [content, setContent] = useState(fallback);

  useEffect(() => {
    let mounted = true;
    setContent(fallback);
    siteContentApi.get(key)
      .then((response) => {
        if (mounted && response.data?.content && typeof response.data.content === 'object') {
          setContent((current) => ({ ...current, ...response.data.content }));
        }
      })
      .catch(() => {
        // Static defaults keep the page usable during an API outage.
      });
    return () => { mounted = false; };
  }, [key]); // fallback is intentionally a per-key default, not a request trigger.

  return content;
}
