-- D132: the scheduler. Every 30 minutes the database asks the app to send what is due.
-- Separate from the tables on purpose: without pg_cron or pg_net only this file fails.

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
declare
  v_job bigint;
begin
  for v_job in
    select jobid from cron.job where jobname in ('lf-notify', 'lf-notify-log-cleanup')
  loop
    perform cron.unschedule(v_job);
  end loop;
end;
$$;

-- The token is read at run time, so it is not part of the stored job text.
select cron.schedule(
  'lf-notify',
  '*/30 * * * *',
  $job$
    select net.http_post(
      url := 'https://www.lastfootball.pl/api/notify',
      body := '{}'::jsonb,
      headers := jsonb_build_object(
        'content-type', 'application/json',
        'authorization', 'Bearer ' || s.value
      ),
      timeout_milliseconds := 60000
    )
    from public.server_secrets s
    where s.name = 'notify_token';
  $job$
);

-- Planned items are at most 14 days old, so 60 days of log keep the dedup whole.
select cron.schedule(
  'lf-notify-log-cleanup',
  '40 3 * * *',
  $job$
    delete from public.notification_log where sent_at < now() - interval '60 days';
  $job$
);
