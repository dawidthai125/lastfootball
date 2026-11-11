'use client';

import { useEffect, useRef } from 'react';

type TurnstileApi = {
  render: (element: HTMLElement, options: { sitekey: string; theme: 'dark' }) => string;
  reset: (widgetId: string) => void;
};

function turnstileApi(): TurnstileApi | null {
  const api = (window as Window & { turnstile?: TurnstileApi }).turnstile;
  return api ?? null;
}

export function TurnstileField({ siteKey, resetKey }: { siteKey: string; resetKey: string }) {
  const host = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    const hostNode = host.current;
    if (!hostNode) return;
    let cancelled = false;

    const render = () => {
      const api = turnstileApi();
      if (cancelled || !api || widgetId.current) return;
      widgetId.current = api.render(hostNode, { sitekey: siteKey, theme: 'dark' });
    };

    const existing = document.getElementById('cf-turnstile-script');
    if (existing) {
      render();
    } else {
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = render;
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [siteKey]);

  useEffect(() => {
    if (!resetKey || !widgetId.current) return;
    turnstileApi()?.reset(widgetId.current);
  }, [resetKey]);

  return <div ref={host} className="lf-auth-form__turnstile" />;
}
