---
title: "Stowing Your Dotfiles"
date: 2023-01-02T06:35:38+03:00
tags: ["guide", "linux", "dotfiles"]
---

Linux differs from other operating systems in how most applications are
configured - through files. Using text for configuration might seem as a
step-back, however, GUI configurations were never a progression.

Having applications configured through text has a couple of advantages:
 
* Portable - any computer which can install that application can have the same
configuration.
* The light level of configuration - some Linux distributions, such as NixOS, offer
a system level configuration. However, this would invalidate the first point,
and the level of configuration would be potentially limited through the
configuration of the distribution.
* The `stow` method is minimal and re-uses packaging software for dotfiles.

## Your dotfiles in Git

In order to have portable dotfiles, you need a method of update & transport. For
that, you can use Git. 

To set up your dotfiles for the first time:
```sh
$ mkdir .dotfiles
$ cd .dotfiles
$ git init
$ git remote add origin <your-url>
```

Inside the `.dotfiles` directory, create your configuration files:
```sh
$ ll .dotfiles
total 20K
drwxr-xr-x 21 ayham ayham 4.0K Jan  9 09:40 .config
drwxr-xr-x  8 ayham ayham 4.0K Jan  9 16:27 .git
-rw-r--r--  1 ayham ayham  135 May 21  2022 .gitignore
drwxr-xr-x  4 ayham ayham 4.0K Jul 14  2021 .local
-rwx------  1 ayham ayham 2.0K Oct  3 15:23 .zprofile
```

## Installing Your Dotfiles

To install your configurations on a new Linux install:
```sh
$ git clone <your-url>
$ cd .dotfiles/
$  stow --target=/home/<your-user> .
```

Now you would have your files linked in your home directory:
```sh
$ ls -al
...
lrwxrwxrwx   1 ayham ayham   19 Jul 14  2021 .zprofile -> .dotfiles/.zprofile
...
```

Enjoy!
