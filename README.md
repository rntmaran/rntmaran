# for Vin ♡ — 1000 days

A little website for our 1000 days.

**Flow:** lock (code) → envelope → letter → "you have no idea how much I love you" → live counter → photo wall → certificate (downloadable) → mixtape → riddle → gift coupon → finale.

## Editing
Everything (text, code, songs, photos, riddle, coupon) is in **`js/config.js`**.
Photos live in `assets/photos/`, the video in `assets/video/`.

Preview tip: open `index.html#world` to skip straight past the lock/letter.

## Publishing (GitHub Pages)
Repo → **Settings → Pages** → Source: *Deploy from a branch* → pick the branch + `/ (root)` → Save.
YouTube music only works when served over http(s) (Pages or `python3 -m http.server`), not by double-clicking the file.

`js/vendor/html2canvas.min.js` — html2canvas 1.4.1, MIT license, © Niklas von Hertzen.
