// Edge Function stub — health ping (no business logic).
// Deploy later: `npx supabase functions deploy health`
// Verify JWT as needed per environment.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

Deno.serve((_req) => {
  return new Response(
    JSON.stringify({
      ok: true,
      service: 'lastfootball-edge',
      status: 'foundation',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Connection: 'keep-alive',
      },
    },
  );
});
