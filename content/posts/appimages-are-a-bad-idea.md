---
title: "AppImages Are a Bad Idea"
date: 2022-09-15T16:23:59+03:00
draft: true
---

IDEAS:
	- The idea of appimages
	- AppImages are below Window's executable installers
	- Appimages have security issues compared to package manager
	-	- GPG signing, md5 signing
	-	- appimages have optional security
	- appimages are not practical for users
	-	- users want app stores
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
		  
