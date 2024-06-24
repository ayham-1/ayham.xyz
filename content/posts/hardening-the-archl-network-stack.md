---
title: "Hardening the Archlinux Network Stack"
date: 2024-04-21T11:09:06+03:00
draft: true
---

A wise Archlinux user once said:

```quote
One shall secure his network stack, or shall suffer network leaks.
- a wise internet enjoyer
```

Due to ArchLinux's design of customizability and Laissez-Faire-like package and
system architecture policies, one has to make the incomprehnsibly (indeed)
difficult choice of choosing his network stack. Generally speaking, a decent
choice for estabilishing WiFi connection, is using `iwd` and `dhcpcd` for ethernet.
In this article, I would be focusing on WiFi and DNS hardening. More specifically,
these are the areas where slight changes to the configuration would offer a more
secure network stack:

* Automatic full/half MAC-address octets randomization for every network connection.
* 
