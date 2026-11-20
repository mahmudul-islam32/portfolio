---
title: "A minimal host firewall with nftables"
description: "How I write a small default-deny nftables ruleset for a Linux server: allow SSH and web traffic, keep established connections, and avoid locking myself out."
date: 2026-11-20
tags: [firewalls, linux, security, it-administration]
lang: en
---

## Why a host firewall still matters

Most servers I run sit behind a cloud security group or a router, so it is tempting to skip the firewall on the machine itself. I still add one. Network-level rules change over time, a service can start listening on 0.0.0.0 by accident, and a host firewall keeps the rule "only these ports are reachable" next to the services it protects.

On current Debian, Ubuntu, Fedora and RHEL, nftables is the kernel's packet filtering framework, and the old `iptables` command is often just a compatibility layer on top of it. Writing rules for nftables directly gives you one readable file instead of a long list of commands.

## Before you start: do not lock yourself out

If you are connected over SSH, a wrong rule can cut your own session. Two habits help:

1. Keep a console open (cloud provider serial console, KVM, or physical access) while you work.
2. Schedule an automatic rollback before applying anything new:

```bash
sudo nft list ruleset > /root/nft-backup.conf
# Flush everything in 5 minutes unless I cancel it
echo "nft flush ruleset" | sudo at now + 5 minutes
```

If the new rules work, remove the job with `atq` and `atrm <id>`. If they do not, wait five minutes and you are back in. (Install the `at` package first if it is missing.)

## The ruleset

Here is the file I start from, saved as `/etc/nftables.conf`:

```nft
#!/usr/sbin/nft -f
flush ruleset

table inet filter {
    chain input {
        type filter hook input priority filter; policy drop;

        # Keep replies to connections we already accepted or opened
        ct state established,related accept
        ct state invalid drop

        # Loopback is always fine
        iif "lo" accept

        # ICMP and ICMPv6 (ping, path MTU discovery, IPv6 neighbour discovery)
        ip protocol icmp accept
        meta l4proto ipv6-icmp accept

        # SSH, rate limited for new connections
        tcp dport 22 ct state new limit rate 10/minute accept

        # Web traffic
        tcp dport { 80, 443 } accept

        # Log a sample of what we drop
        limit rate 5/minute log prefix "nft drop: " level info
    }

    chain forward {
        type filter hook forward priority filter; policy drop;
    }

    chain output {
        type filter hook output priority filter; policy accept;
    }
}
```

A few things worth explaining:

- **`table inet`** covers IPv4 and IPv6 in one table. A common mistake is to firewall IPv4 carefully and leave IPv6 wide open.
- **`policy drop`** on `input` means anything not explicitly allowed is dropped. That is the whole point of the file.
- **`ct state established,related accept`** comes first. Without it, replies to your own outgoing connections (package updates, DNS lookups) would be dropped.
- **ICMPv6 must stay allowed.** IPv6 relies on it for neighbour discovery, so blocking it breaks IPv6 connectivity in confusing ways.
- **The SSH rate limit** is a simple brake on brute-force attempts. Note that `limit` here is a global rate, not per source address. For per-IP limits you would use a dynamic set, or a tool like fail2ban.
- **`forward` drops by default.** If the host is not a router, it should not forward packets.

## Applying and checking it

Check the syntax first, without changing anything:

```bash
sudo nft -c -f /etc/nftables.conf
```

Then load it and look at the result:

```bash
sudo nft -f /etc/nftables.conf
sudo nft list ruleset
```

From another machine, confirm what is actually reachable:

```bash
nc -zv server.example.com 22
nc -zv server.example.com 443
nc -zv -w 3 server.example.com 5432   # should time out
```

Once you are happy, cancel the rollback job and make the rules persistent:

```bash
sudo systemctl enable --now nftables
```

The `nftables` service loads `/etc/nftables.conf` at boot on Debian and Ubuntu. On Fedora and RHEL the service reads `/etc/sysconfig/nftables.conf` instead, which usually includes files from `/etc/nftables/`, so check the include lines on your distribution.

## Reading the logs

Dropped packets that match the log rule go to the kernel log:

```bash
sudo journalctl -k -g "nft drop" --since "1 hour ago"
```

The entries show source address, destination port and protocol. Most of it is internet background noise, but it is also how you notice that a legitimate service, like a monitoring agent, is being blocked.

## Docker and other tools that write rules

One caveat: Docker, Kubernetes networking, and libvirt add their own firewall rules. Published Docker ports are handled in Docker's own chains and can bypass the `input` chain above entirely, so a container published on `0.0.0.0:5432` may be reachable even though your ruleset does not allow 5432. Also, the `flush ruleset` line at the top of the file removes their rules too, so restart those services after reloading. On Docker hosts I bind published ports to `127.0.0.1` unless they really need to be public, and I check from outside with `nc` rather than trusting the ruleset alone.

## Keep it small

A host firewall is most useful when you can read it in one screen. I keep one file per server in version control, add a comment for every open port explaining which service needs it, and remove the rule when the service goes away. Default deny, a short allow list, and a quick test from outside cover most of what a single server needs.
