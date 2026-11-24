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

/** `answer` is the state of the form: every new one means the token is used up. */
export function TurnstileField({ siteKey, answer }: { siteKey: string; answer: object }) {
  const host = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const seen = useRef(answer);

  useEffect(() => {
    const hostNode = host.current;
    if (!hostNode) return;
    let cancelled = false;

    const render = () => {
      const api = turnstileApi();
      if (cancelled || !api || widgetId.current) return;
      widgetId.current = api.render(hostNode, { sitekey: siteKey, theme: 'dark' });
    };

    let script = document.getElementById('cf-turnstile-script') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      document.head.appendChild(script);
    }
    const pending = script;
    render();
    // The script may still be loading from an earlier visit to this page.
    pending.addEventListener('load', render);

    return () => {
      cancelled = true;
      pending.removeEventListener('load', render);
    };
  }, [siteKey]);

  useEffect(() => {
    if (seen.current === answer) return;
    seen.current = answer;
    if (widgetId.current) turnstileApi()?.reset(widgetId.current);
  }, [answer]);

  return <div ref={host} className="lf-auth-form__turnstile" />;
}
