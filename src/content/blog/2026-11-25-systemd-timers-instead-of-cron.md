---
title: "Replacing cron jobs with systemd timers on Linux"
description: "How to turn a cron job into a systemd service and timer pair, with logging in the journal, missed-run catch-up, randomized delays and easy status checks."
date: 2026-11-25
tags: [linux, it-administration, systemd, operations]
lang: en
---

## Why bother moving away from cron

Cron has run scheduled jobs on Unix systems for decades, and it still works. But on a modern Linux server that already runs systemd, a cron job has a few rough edges:

- Output goes to local mail (if it is configured at all) instead of a searchable log.
- If the machine is off at the scheduled time, the run is simply skipped.
- There is no built-in way to see when a job last ran, whether it failed, or when it will run next.
- The job runs with a minimal, slightly different environment, which causes the classic "works in my shell, fails in cron" bug.

systemd timers solve all of these. The trade-off is that one cron line becomes two small unit files. This post walks through converting a real job.

## The example job

Say we have this line in root's crontab, which dumps a PostgreSQL database every night at 02:30:

```cron
30 2 * * * /usr/local/bin/pg-backup.sh >> /var/log/pg-backup.log 2>&1
```

We will replace it with a `pg-backup.service` that does the work and a `pg-backup.timer` that decides when.

## Step 1: the service unit

Create `/etc/systemd/system/pg-backup.service`:

```ini
[Unit]
Description=Nightly PostgreSQL backup
Wants=network-online.target
After=network-online.target postgresql.service

[Service]
Type=oneshot
User=postgres
ExecStart=/usr/local/bin/pg-backup.sh
Nice=10
IOSchedulingClass=idle
```

A few notes:

- `Type=oneshot` tells systemd the process runs to completion and then exits. That is what you want for batch jobs.
- `User=postgres` runs the script as an unprivileged user, without needing `sudo -u` inside the script.
- `Nice` and `IOSchedulingClass=idle` keep the backup from competing with real traffic for CPU and disk.
- There is no redirect to a log file. Anything the script writes to stdout or stderr ends up in the journal automatically.

You can test the service right away, before any timer exists:

```bash
sudo systemctl daemon-reload
sudo systemctl start pg-backup.service
systemctl status pg-backup.service
```

Testing the job in exactly the environment it will run in is one of the biggest practical wins over cron.

## Step 2: the timer unit

Create `/etc/systemd/system/pg-backup.timer` with the same base name:

```ini
[Unit]
Description=Run pg-backup every night

[Timer]
OnCalendar=*-*-* 02:30:00
Persistent=true
RandomizedDelaySec=10min

[Install]
WantedBy=timers.target
```

- `OnCalendar` is the schedule. `*-*-* 02:30:00` means every day at 02:30. Shorthands such as `daily`, `weekly` or `hourly` also work.
- `Persistent=true` stores the last run time on disk. If the server was powered off at 02:30, the job runs shortly after the next boot instead of being skipped.
- `RandomizedDelaySec` adds a random delay up to the given value. On a fleet of servers that all back up to the same storage, this spreads the load instead of having every machine start at the same second.

Enable and start the timer (not the service):

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now pg-backup.timer
```

Then remove the old line from the crontab with `sudo crontab -e`, so the job does not run twice.

## Checking calendar expressions

`OnCalendar` syntax is different from cron's five fields, so it is worth checking before you rely on it. `systemd-analyze` parses an expression and shows the next times it would fire:

```bash
systemd-analyze calendar "Mon..Fri *-*-* 07:00:00" --iterations=3
```

Some common translations:

| cron | OnCalendar |
|------|------------|
| `0 * * * *` | `hourly` or `*-*-* *:00:00` |
| `*/15 * * * *` | `*:0/15` |
| `0 3 * * 0` | `Sun *-*-* 03:00:00` |
| `0 7 * * 1-5` | `Mon..Fri *-*-* 07:00:00` |
| `0 0 1 * *` | `monthly` or `*-*-01 00:00:00` |

For "run every N minutes after the last run finished" instead of wall-clock times, use a monotonic timer such as `OnUnitActiveSec=15min` together with `OnBootSec=5min`.

## Day-to-day operations

This is where timers pay off. To see every timer, when it last ran and when it runs next:

```bash
systemctl list-timers
```

To read the output of the last runs of the job:

```bash
journalctl -u pg-backup.service --since "2 days ago"
```

To check whether the last run succeeded:

```bash
systemctl status pg-backup.service
systemctl is-failed pg-backup.service
```

If the script exits with a non-zero status, the unit is marked as failed, which your monitoring can pick up. `systemctl --failed` lists every failed unit on the machine in one place.

## Getting notified on failure

Cron's mail-on-output behaviour can be replaced with `OnFailure=`. Add this to the `[Unit]` section of the service:

```ini
OnFailure=notify-failure@%n.service
```

Then write a small template unit `notify-failure@.service` that runs a script with `%i` as an argument, and have that script send a message to your chat tool or mail system. Every job can reuse the same template.

## When cron is still fine

For a personal machine or a container without systemd, cron remains the simpler choice. Timers also need root (or `systemctl --user` units) to set up. But for servers you administer, the combination of journald logs, catch-up runs, randomized delays and a single `list-timers` overview makes systemd timers the better default for scheduled work.
