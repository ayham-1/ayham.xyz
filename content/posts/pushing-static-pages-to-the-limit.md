---
title: "Pushing Static Pages to The Limit"
date: 2022-09-04T18:07:13+03:00
tags: ["guide", "website"]
---

Static webpages are well renowned for there speed, security, and simplicity. A
very common misconception is that static webpages can't enjoy Javascript. Here
is how I got this website to template applications that use Javascript and WASM
using Hugo's shortcode system.

# addapp (JS + CSS) shortcode
Create a new shortcode file in `theme/<name>/layouts/shortcodes/addapp.html`:

```html
<!-- ENTERING SHORTCODE: addapp -->
{{- $appName := .Get 0 }}
{{- $appJS := resources.Get (printf "apps/%s/app.js" ($appName | safeURL)) }}
{{- partial (printf "apps/%s/app.html" ($appName | safeURL)) . }}
<script src="{{ $appJS.Permalink }}"></script>
<!-- EXITING SHORTCODE: addapp -->
```

Then call the shortcode, for example, in this website's game sokoban (file:
`content/apps/sokoban.md`):

```md
---
title: "Sokoban"
date: 2022-09-09T08:06:28+03:00
---

{{</* addapp `sokoban` */>}}

Refresh the page to get another puzzle.
```

Then, put the javascript files in `assets/app/<name>/app.js`. The file name must
be `app.js`. Do the same for the `.css` files. 

For HTML, put the file in `layouts/partials/apps/<name>/app.html`. This would
allow for shortcodes and other hugo functionality to be used by the app's HTML.

Link the `.css` files in `app.html` like so:

```html
{{- $sokoshellCSS := resources.Get (printf "apps/sokoban/sokoshell.css" | safeURL) | resources.Fingerprint "md5" -}}
<link href="{{- $sokoshellCSS.Permalink -}}" rel="stylesheet" integrity="{{ $sokoshellCSS.Data.Integrity }}" />
```

Link any extra `.js` files in `app.html` like so:

```html
{{- $sokoshellJS := resources.Get (printf "apps/sokoban/sokoshell.js" | safeURL) |resources.Fingerprint "md5" -}}
<script src="{{- $sokoshellJS.Permalink -}}" integrity="{{ $sokoshellJS.Data.Integrity }}"></script>
```

# addapp + WASM binaries
Create the directory `contents/apps/<name>`, then move the file
`content/apps/sokoban.md` to `content/apps/sokoban/index.md`. Afterwards, place
the `game.data` and the `game.wasm` Emscripten generated files in the same
directory.

```
content/apps/sokoban/
├── game.data
├── game.wasm
└── index.md
```

```
assets/apps/sokoban
├── app.js
├── sokoshell.css
└── sokoshell.js
```
