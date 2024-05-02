---
title: "Hardening the Archlinux WiFi Network Stack"
date: 2024-04-21T11:09:06+03:00
tags: [ "guide", "security", "archlinux" ]
---

A wise Archlinux user once said:

```quote
One shall secure his network stack, or shall suffer network leaks.
- a wise internet enjoyer
```

Due to ArchLinux's design of customizability and Laissez-Faire-like package and
system architecture policies, one has to make the incomprehnsibly (indeed)
difficult choice of choosing his network stack. Generally speaking, a decent
choice for estabilishing WiFi connection, is using `iwd`. And `dhcpcd` for ethernet.
In this article, I would be focusing on WiFi and DNS hardening. More specifically,
these are the areas where slight changes to the configuration would offer a more
secure network stack:

* Automatic full/half MAC-address octets randomization on every network connection.
* System-wide DNS resolving over TLS
* DNSSEC signature verification

A 'downside' of such configuration scheme is that public routers, which have
login pages, need you to have DNS-over-TLS disabled for rerouting. However, it
is not that hard to do so.

*Note: this guide assumes you already have WiFi configured using `iwd`*

## Configuring `IWD` for Automatic MAC-Address Randomization

In `/etc/iwd/main.conf` have the following configured:

```bash
[General]
EnableNetworkConfiguration=true
NameResolvingService=systemd
AutoConnect=true
AddressRandomization=network
AddressRandomizationRange=nic
AlwaysRandomizeAddress=true
```

If you would like to have complete address randomization, set
`AddressRandomizationRange` to `full`. `nic` means that only last 3 octets are
randomized. This *could* help with avoiding immediate detection of MAC address
randomization on the network, as the first three octets are normally used as
manufacturer identification.

## Configuring `systemd-resolve`

Enable the service:

```bash
sudo systemctl enable systemd-resolved
sudo systemctl start systemd-resolved
```

Configure usage of local systemd DNS server for application that [use glibc's
`getaddrinfo()`](https://wiki.archlinux.org/title/Systemd-resolved#DNS).

```bash
ln -sf ../run/systemd/resolve/stub-resolv.conf /etc/resolv.conf
```

In the file `/etc/systemd/resolved.conf` have:

```bash
[Resolve]
DNS=9.9.9.9#dns.quad9.net 149.112.112.112#dns.quad9.net 2620:fe::fe#dns.quad9.net 2620:fe::9#dns.quad9.net
FallbackDNS=9.9.9.9#dns.quad9.net 149.112.112.112#dns.quad9.net 2620:fe::fe#dns.quad9.net 2620:fe::9#dns.quad9.net
DNSSEC=yes
DNSOverTLS=yes
Cache=yes
DNSStubListener=yes
DNSStubListenerExtra=udp:127.0.0.1:53
```

This tells `systemd-resolved` to use quad9 as remote DNS server, feel free to
replace `DNS` and `FallbackDNS` values with whatever server suites you.

## Accessing Public WiFi

Most public WiFi requires you accepting an agreement (yuck) or signing in. If
you've followed the previous instructions, this means that you won't be able to
resolve the redirect which WiFi routers use in order to redirect you from any 
website you access to their own website. However, you can temporarily disable 
secure DNS and use a browser that does not verify DNS signatures. Through testing,
found out that Brave (chromium based) allows such redirects while Firefox does not.

To disable systemd resolving temporarily, change in `/etc/systemd/resolved.conf`:
```bash
[Resolve]
DNSSEC=no
DNSOverTLS=no
```

Don't forget to turn them back on once logged in to the network.

Enjoy!
