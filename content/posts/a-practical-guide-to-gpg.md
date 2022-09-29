---
title: "A Practical Guide to GPG"
date: 2022-09-27T18:22:03+03:00
draft: true
---

It is very well known that using GPG could be a daunting task. Using it
correctly and securely is even harder. I would go over setting up GPG keys,
subkeys, using GPG for SSH, transfering keys to other computers and using online
services like Github and Codeberg.

## Generating GPG Master Keys
GnuPG uses asymmetric encryption, which means that you would use 2 keys. Private
keys for decrypting data. Public key is for encrypting the key and signing
stuff. By default, the implementation of GnuPG generates 2 pairs of keys, the
master-key and a signed sub-key. It also generates your primary user identity.

The types of keys GnuPG can generate are:
* pub - public primary-key
* sub - public sub-key
* sec - secret primary-key
* ssb - secret sub-key  
 
By default, running `gpg --gen-key` creates pub, sec, and sub, ssb. The latter
pair is for encryption.

```bash
[~] $ gpg --list-secret-keys
/home/ayham/.local/share/gnupg/pubring.kbx
------------------------------------------
sec#  rsa4096 2022-09-27 [SC] [expires: 2023-03-26]
      8C38DD3A3030F8AEB8A9A2BC783F6DE277DA7BFF
uid           [ultimate] ayham <me@ayham.xyz>
ssb   rsa4096 2022-09-27 [E] [expires: 2023-03-26]
ssb   rsa4096 2022-09-27 [S] [expires: 2023-03-26]
ssb#  rsa4096 2022-09-27 [A] [expires: 2023-03-26]
```

You might have noticed the '`#`' after the key identifiers, these would be
explained later with how to transfer files and other security measures.

Generate your new secret keys either with the quick command `gpg --gen-key`, or
if you would like to specify bit-size (recommended) wiwth the command `gpg
--full-generate-key`
