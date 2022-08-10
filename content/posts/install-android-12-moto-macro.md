---
title: "Installing Android 12 On The Motorola One Macro (lima)"
date: 2022-08-02T13:00:46+03:00
tags: ["guide", "android"]
---

Motorola One Macro, codename lima, can surprisingly be upgraded to Android 12.
To be exact, this phone can be upgraded to phh's treble Android 12 GSI. I have 
already written a longer [guide]({{< relref "hardening-the-one-macro.md" >}}
"that article") on this phone before, however it lacks some
edge cases. This guide would hopefully attempt to ammend these.

I originally intended for that article to be a complete guide which works for
all Android versions. Although that is still somewhat true, I decided to rewrite
a standalone article for Android 12. I've learned some stuff about the phone,
some issues that could arise while updating, which I thought would deserve their
own guide. Now, this is an article attuned to the type of step-by-step, which
is a contrast to the original guide. This article could also hopefully act as a
step-by-step upgrade guide.

# What do all those files mean?
![releases.webp](pix/posts/android12-lima/releases.webp)
This image is a list of available phhtreble images to download. For this phone,
the compatible configuration of images is arm64 a/b variants (\*-arm64-ab-*\).
Also, I was only able to boot vndklite image versions. I have no idea why, but
from my own understanding this is better for OS updates? It should be noted
though, that I couldn't get dynamic updates to work, most probably the phone
does not have dynamic partitions. Ofcourse, we will be downloading the -secure
variant as we will be installing Magisk later on.

At the time of writing, you can fetch the latest compatiable image as per the
following:

```bash
wget https://github.com/phhusson/treble_experimentations/releases/download/v414/system-squeak-arm64-ab-vndklite-floss-secure.img.xz
```

# Setting up the phone
You must flash a 'clean' stock image. Grab the latest image from
motostockrom.com. Use my guide in order to flash the stock image. Make sure the
phone boots before continuing on.

# Flashing Android 12
After setting up stock rom, flash Google's vbmeta disabling verity and
verification.

```bash
fastboot --disable-verity --disable-verification flash vbmeta vbmeta.img
```

Then, flash Android 12
```bash
unxz system-squeak-arm64-ab-vndklite-floss-secure.img.xz
fastboot flash system_a system-squeak-arm64-ab-vndklite-floss-secure.img
fastboot set_active a
fastboot erase userdata
```
*This would erase your data, make sure you format your phone through the
bootloader menu*

# Post-Install 
## Magisk
After sending the `boot.img` to the phone, install Magisk's App and patch the
bootloader by following the instructions in the app. After that, flash the
bootloader:

*This would format the phone again*
```bash
fastboot flash boot magisk_patched.img
```

Reinstall Magisk's App and reboot to complete setup.

## Audio Fixes
![audio.webp](pix/posts/android12-lima/audio.webp)

After installing, go to Settings -> phhtreble's Settings -> Misc features -> 
check "Use alternate..." and "Disable Audio effects" in order to fix headphones
not being connected.
