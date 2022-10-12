---
title: "AppImages Are a Bad Idea"
date: 2022-09-15T16:23:59+03:00
draft: true
---

IDEAS:
	- The idea of appimages
	- AppImages are below Window's executable installers
	- Appimages have security issues compared to package manager
		- GPG signing, md5 signing
		- appimages have optional security
	- package managers are not limited, because user repository can be made and
	  those can have security by default requirements
	- trust is centralized in package managers whileas it is distributed in
	  appimages
		- user repositories are still better
	- appimages including needed libraries is not a good idea
		- if libc needs a security update, need to wait for appimage dev
		- even if libc update won't break the app
		- a broken application is better than an insecure one
	- appimages don't make life easier:
		- won't be able to maintain replicable systems by having lists of
		  applications without needing to maintain a large library of
		  unoptimized appimages
		- opening a browser should never be a step in getting applications
	- appimages are not practical for users
		- users want app stores

Imagine an application distribution system where it is decentralized, a SINGLE
executable, directly from the developer, with no extra dependencies. Meet
AppImages, argueably the second worst distribution system after Snaps. But Why?
Why would I call such a *great* system as second worst? 

It all begins with this quote from their official website: 
> "As a user, I want to download an application from the original author, and
> run it on my linux desktop system just like I would do with a Windows or Mac
> System"

Just like windows or Mac?

I would argue that the way Windows handles applications is *slightly* better
compared to AppImages. Mainly because you can actually install the application
onto the system. Also, I should make it clear that this article is not a dunk on
any application specifically, but rather the distribution systems that are used
by those applications. 

## The security problems with AppImages
