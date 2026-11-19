---
title: "Server backups you can actually restore: a practical restic setup"
description: "How I back up Linux servers with restic: an encrypted repository, a sensible retention policy, a systemd timer, and the restore drills that prove it works."
date: 2026-11-19
tags: [it-administration, linux, backups, operations]
lang: en
---

## A backup is only as good as its last restore

Most backup failures are not discovered when the backup runs. They are discovered on the day someone needs a file back and the archive turns out to be empty, corrupt, or missing the one directory that mattered. So when I set up backups for a server, I plan the restore first and the backup second.

My tool of choice for this is [restic](https://restic.net/). It is a single binary, it encrypts everything on the client side, it deduplicates data between snapshots, and it can write to local disks, SFTP servers, and S3-compatible object storage. That last point makes it easy to follow the classic 3-2-1 rule: three copies of your data, on two different kinds of storage, with one copy off-site.

## Creating the repository

restic stores snapshots in a *repository*. I keep the location and password in environment variables so they never end up in shell history:

```bash
# /etc/restic/env  (chmod 600, owned by root)
export RESTIC_REPOSITORY="sftp:backup@backup-host:/srv/restic/web01"
export RESTIC_PASSWORD_FILE="/etc/restic/password"
```

Then initialise the repository once:

```bash
source /etc/restic/env
restic init
```

The password encrypts the repository key. If you lose it, the data is gone for good, so store a copy in your password manager, not only on the server you are backing up.

## Deciding what to back up

Backing up the whole disk sounds safe, but it wastes space on caches and makes restores slower to navigate. For a typical web server I back up configuration and application data, and exclude things that can be rebuilt:

```bash
# /etc/restic/excludes
/var/cache
/var/tmp
/home/*/.cache
node_modules
*.log.gz
```

```bash
restic backup /etc /var/www /home /root \
  --exclude-file=/etc/restic/excludes \
  --tag scheduled
```

Databases need special care. Copying the data directory of a running PostgreSQL server can give you an inconsistent snapshot. Instead, stream a logical dump straight into restic:

```bash
sudo -u postgres pg_dump --format=custom appdb \
  | restic backup --stdin --stdin-filename appdb.dump --tag postgres
```

Nothing temporary is written to disk, and the dump is deduplicated like any other file.

## Retention: keep enough, but not everything

Without a retention policy the repository grows forever. restic separates two steps: `forget` removes snapshots from the list according to a policy, and `prune` deletes data that no snapshot references any more. You can run both at once:

```bash
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 12 --prune
```

This keeps the last seven daily snapshots, four weekly ones, and twelve monthly ones. Adjust the numbers to match how far back people realistically need to go. Pruning can take a while on big repositories, so I run it once a week rather than after every backup.

## Scheduling with a systemd timer

I prefer systemd timers over cron for backups because the logs land in the journal and missed runs can be caught up after a reboot. First the service:

```ini
# /etc/systemd/system/restic-backup.service
[Unit]
Description=restic backup
Wants=network-online.target
After=network-online.target

[Service]
Type=oneshot
EnvironmentFile=/etc/restic/env.systemd
ExecStart=/usr/local/bin/restic backup /etc /var/www /home /root --exclude-file=/etc/restic/excludes --tag scheduled
Nice=10
IOSchedulingClass=idle
```

Note that `EnvironmentFile` expects plain `KEY=value` lines, so `env.systemd` is the same file without the `export` keywords. Then the timer:

```ini
# /etc/systemd/system/restic-backup.timer
[Unit]
Description=Nightly restic backup

[Timer]
OnCalendar=*-*-* 02:30:00
RandomizedDelaySec=15m
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
systemctl daemon-reload
systemctl enable --now restic-backup.timer
systemctl list-timers restic-backup.timer
journalctl -u restic-backup.service --since today
```

`Persistent=true` means that if the server was off at 02:30, the backup runs soon after it boots instead of being skipped.

## Checking the repository

restic can verify its own repository structure:

```bash
restic check
```

By default this checks metadata, not every byte of data. To also read back a part of the stored data, use a subset so the check stays affordable:

```bash
restic check --read-data-subset=5%
```

Run this weekly and a different random part of the data is verified each time.

## The restore drill

This is the step most setups skip, and the one that matters most. Once a month I restore something real into a scratch directory and look at it:

```bash
restic snapshots --tag scheduled
restic ls latest /etc/nginx
restic restore latest --target /tmp/restore-test --include /etc/nginx
diff -r /etc/nginx /tmp/restore-test/etc/nginx
```

For the database dump, I restore it into a throwaway database and run a quick query to make sure the tables and rows are there:

```bash
restic dump latest appdb.dump > /tmp/appdb.dump
createdb restore_test
pg_restore --dbname=restore_test /tmp/appdb.dump
psql restore_test -c "SELECT count(*) FROM users;"
```

I also write the steps down in a short runbook. During a real incident nobody wants to read the restic manual for the first time.

## Monitoring the boring part

A backup job that silently stopped three weeks ago is worse than none, because everyone assumes it works. At minimum, alert when the service fails (`OnFailure=` in the unit can trigger a notification unit), and check that the newest snapshot is recent:

```bash
restic snapshots --latest 1 --json
```

A small script can parse the timestamp from that output and raise an alert if it is older than a day or so.

## Summary

- Encrypt on the client and keep the password somewhere other than the server.
- Back up configuration and data, stream databases with `--stdin`, and exclude what can be rebuilt.
- Use `forget --prune` with a retention policy that matches real needs.
- Schedule with a systemd timer and `Persistent=true`.
- Run `restic check` regularly and practise restores on a schedule.

Backups are an insurance policy. The restore drill is how you find out whether the policy pays out.
