---
title: "Brackets Heaven in Neovim"
date: 2022-12-11T03:14:19+03:00
tags: ["guide", "neovim"]
---

Lately I have been writing alot of flutter. And there is one charecteristic
'annoyance' with that, *BRACKETS*. The flutter meta is having class constructors
that enclose other classes to form a Widget tree. Since initializing those
Widgets is done with class Constructors, you end up with this abomination: 

![screenshot1.png](pix/posts/brackets-nvim/screenshot1.png)

Ofcourse, this is Neovim we are talking about, and there is always a way to make
your life easier with plugins.


# Installing auto-pairs
You should be using a plugin manager for your vimrc. I use 'Plug', however they
all work almost the same. Install the `jiangmiao/auto-pairs` plugin like-so:

 `.config/nvim/init.nvim`:
```vimrc
Plug 'jiangmiao/auto-pairs'
```

Make sure you don't forget to update by running `:PlugUpdate` or a similar
command in a new Neovim session.

# Some Cool Features of 'auto-pairs'
Ofcourse there is the originary completion of brackets when inputting either of
'[{(', you can also delete those by removing the character using backspace in
insert mode.


![screenshot2.png](pix/posts/brackets-nvim/screenshot2.gif)

Now in flutter development, you may need to re-order a child Widget with the
parent Widget, using this plugin you can do so with a combination of
'auto-pairs' and Neovim's 'Shift-%' shortcut:

![screenshot3.png](pix/posts/brackets-nvim/screenshot3.gif)

Enjoy!
