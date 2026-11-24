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

-- Token and URL are read at run time, so neither is part of the stored job text. Without the
-- 'notify_url' row the job does nothing: a copy of the database never calls production.
select cron.schedule(
  'lf-notify',
  '*/30 * * * *',
  $job$
    select net.http_post(
      url := u.value,
      body := '{}'::jsonb,
      headers := jsonb_build_object(
        'content-type', 'application/json',
        'authorization', 'Bearer ' || t.value
      ),
      timeout_milliseconds := 60000
    )
    from public.server_secrets t
    join public.server_secrets u on u.name = 'notify_url' and u.value like 'https://%'
    where t.name = 'notify_token';
  $job$
);

-- Planned items are at most 14 days old. The app reads the whole log that is kept here.
select cron.schedule(
  'lf-notify-log-cleanup',
  '40 3 * * *',
  $job$
    delete from public.notification_log where sent_at < now() - interval '30 days';
  $job$
);
