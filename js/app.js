/* =========================================================
   1000 days ♡  — app
   ========================================================= */
(() => {
  "use strict";
  const C = window.CONFIG;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } }
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- fill names / static text ---------- */
  $$(".js-to").forEach((el) => (el.textContent = C.to));
  $$(".js-from").forEach((el) => (el.textContent = C.from));
  $$(".js-nick").forEach((el) => (el.textContent = C.nickname));
  $("#lockName").textContent = C.to;

  function show(id) {
    $$(".scene").forEach((s) => s.classList.toggle("is-active", s.id === id));
  }

  /* =======================================================
     FX — hearts & petals confetti
     ======================================================= */
  const FX = (() => {
    const cv = $("#fx");
    const ctx = cv.getContext("2d");
    let parts = [];
    let running = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
    resize();
    addEventListener("resize", resize);
    const colors = ["#e2457a", "#f6a8c2", "#d98c8c", "#c49a52", "#f3c54b", "#6b2a3a", "#fbeff0", "#e98ba6"];

    function heart(s) {
      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(-s, -s * 0.3, -s * 0.45, -s, 0, -s * 0.45);
      ctx.bezierCurveTo(s * 0.45, -s, s, -s * 0.3, 0, s * 0.3);
      ctx.fill();
    }
    function loop() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.scale(dpr, dpr);
      parts = parts.filter((p) => p.life > 0 && p.y < innerHeight + 40);
      for (const p of parts) {
        p.vy += p.g; p.vx *= 0.99; p.vy *= 0.99;
        p.x += p.vx + Math.sin(p.t * 0.05) * p.drift; p.y += p.vy;
        p.rot += p.vr; p.t++; p.life--;
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life / 40);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        if (p.shape === "heart") heart(p.s);
        else if (p.shape === "petal") { ctx.beginPath(); ctx.ellipse(0, 0, p.s * 0.45, p.s, 0, 0, Math.PI * 2); ctx.fill(); }
        else { ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); }
        ctx.restore();
      }
      if (parts.length) requestAnimationFrame(loop);
      else { running = false; ctx.clearRect(0, 0, cv.width, cv.height); }
    }
    function add(p) {
      parts.push(p);
      if (!running) { running = true; requestAnimationFrame(loop); }
    }
    return {
      burst(x, y, n = 60, power = 9) {
        if (reduced) n = Math.min(n, 12);
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2;
          const v = (0.35 + Math.random()) * power;
          add({
            x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - power * 0.4, g: 0.16,
            s: 6 + Math.random() * 9, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2,
            c: colors[(Math.random() * colors.length) | 0], shape: ["heart", "petal", "rect"][(Math.random() * 3) | 0],
            life: 140 + Math.random() * 80, t: 0, drift: Math.random() * 0.6
          });
        }
      },
      rain(n = 80) {
        if (reduced) n = 15;
        for (let i = 0; i < n; i++) {
          add({
            x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.6,
            vx: (Math.random() - 0.5) * 1.5, vy: 1 + Math.random() * 2, g: 0.02,
            s: 7 + Math.random() * 8, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.12,
            c: colors[(Math.random() * colors.length) | 0], shape: Math.random() < 0.5 ? "heart" : "petal",
            life: 400, t: Math.random() * 100, drift: 0.8 + Math.random()
          });
        }
      }
    };
  })();

  /* =======================================================
     MUSIC — one <audio> element plays everything (mp3, no ads)
     ======================================================= */
  const pill = $("#pill");
  const cassette = $("#cassette");
  const audio = new Audio();
  audio.preload = "auto";
  audio.setAttribute("playsinline", "");
  const Music = {
    started: false, playing: false, current: { kind: "lock", i: 0 },

    song() { return this.current.kind === "mix" ? C.mixtape.tracks[this.current.i] : C.lockSong; },
    init() {
      audio.src = C.lockSong.src;
      ["play", "playing", "pause", "ended"].forEach((ev) => audio.addEventListener(ev, () => this.onState(ev)));
      audio.addEventListener("error", () => { $("#pillTitle").textContent = "couldn't load this song :("; });
      this.label();
    },
    /** play from a user tap; if the browser refuses, ask for one more tap */
    tryPlay() {
      const p = audio.play();
      if (p && p.catch) p.catch(() => { pill.classList.add("nudge"); $("#pillTitle").textContent = "Tap here to play ♪"; });
    },
    /** first tap anywhere on the lock screen */
    start() {
      if (this.started) return;
      this.started = true;
      pill.classList.add("show");
      this.tryPlay();
    },
    load(song) {
      const start = song.start || 0;
      audio.src = song.src;
      audio.currentTime = start;
      // some browsers ignore currentTime until the file's metadata is in
      if (start) audio.addEventListener("loadedmetadata", () => { if (audio.currentTime < start - 1) audio.currentTime = start; }, { once: true });
      this.started = true;
      this.label();
      this.tryPlay();
    },
    playLock() { this.current = { kind: "lock", i: 0 }; this.load(C.lockSong); },
    playTrack(i) {
      const n = C.mixtape.tracks.length;
      i = ((i % n) + n) % n;
      this.current = { kind: "mix", i };
      pill.classList.add("show");
      this.load(C.mixtape.tracks[i]);
      renderTracks();
    },
    toggle() {
      this.started = true;
      pill.classList.add("show");
      if (audio.paused) this.tryPlay(); else audio.pause();
    },
    seek(d) { audio.currentTime = Math.max(0, Math.min((audio.duration || 1e9) - 0.5, audio.currentTime + d)); },
    label() {
      $("#pillLabel").textContent = this.current.kind === "mix" ? `mixtape · track ${this.current.i + 1}` : "our song";
      if (this.playing || !pill.classList.contains("nudge")) $("#pillTitle").textContent = this.song().title || "our song ♡";
    },
    onState(ev) {
      this.playing = !audio.paused && ev !== "ended";
      if (this.playing) pill.classList.remove("nudge");
      pill.classList.toggle("playing", this.playing);
      cassette.classList.toggle("playing", this.playing && this.current.kind === "mix");
      $("#mixPlay").textContent = this.playing && this.current.kind === "mix" ? "❚❚" : "▶";
      renderTracks();
      this.label();
      if (ev === "ended") {
        if (this.current.kind === "lock") { audio.currentTime = C.lockSong.start || 0; this.tryPlay(); }
        else if (this.current.i < C.mixtape.tracks.length - 1) this.playTrack(this.current.i + 1);
      }
    }
  };
  $("#pillPlay").addEventListener("click", () => Music.toggle());
  $("#pillMeta").addEventListener("click", () => Music.toggle());
  $("#pillRew").addEventListener("click", () => Music.seek(-10));
  $("#pillFwd").addEventListener("click", () => Music.seek(10));

  /* =======================================================
     1 · LOCK
     ======================================================= */
  const FLOWERS = {
    ring(n, rx, ry, d, fill, stroke, off = 0) {
      let s = "";
      for (let i = 0; i < n; i++) s += `<ellipse cx="0" cy="${-d}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="1" transform="rotate(${off + (i * 360) / n})"/>`;
      return s;
    },
    daisy() { return this.ring(14, 6, 19, 24, "#fffdf7", "#e2d6c2") + `<circle r="10" fill="#f0b93d"/><circle r="5" fill="#d98e22" opacity=".6"/>`; },
    sun() {
      let dots = "";
      for (let i = 0; i < 26; i++) { const a = i * 2.4, r = Math.sqrt(i) * 2.9; dots += `<circle cx="${(Math.cos(a) * r).toFixed(1)}" cy="${(Math.sin(a) * r).toFixed(1)}" r="1.3" fill="#2f1b0c"/>`; }
      return this.ring(18, 7, 21, 30, "#f6c445", "#d9982a") + this.ring(18, 6, 17, 26, "#eeb032", "#cf8d1f", 10) + `<circle r="18" fill="#6a4321"/>` + dots;
    },
    cosmos() { return this.ring(8, 13, 24, 21, "#ea8fa8", "#c9607e") + `<circle r="8" fill="#f3c54b"/><circle r="4" fill="#d79a2b"/>`; },
    rose() {
      return this.ring(5, 22, 20, 20, "#eba08f", "#cf7766") + this.ring(4, 15, 13, 11, "#e58a79", "#c96a5b", 40) +
        `<circle r="11" fill="#dc7d6c"/><path d="M0 0a3 3 0 1 1 6 0a6 6 0 1 1-12 0a9 9 0 1 1 18 0" fill="none" stroke="#b5584b" stroke-width="1.8" stroke-linecap="round"/>`;
    },
    tulip() {
      return `<path d="M0 6 C2 20 -2 34 0 48" stroke="#6f9a68" stroke-width="3" fill="none"/><path d="M0 40 C-16 30 -22 18 -20 8 C-10 16 -4 26 0 40Z" fill="#87ad7d"/>` +
        `<path d="M-17 -6 C-21 -30 -10 -38 -6 -28 L0 -40 L6 -28 C10 -38 21 -30 17 -6 C13 12 -13 12 -17 -6Z" fill="#ea7c5c" stroke="#c75c40" stroke-width="1.2"/><path d="M0 -40 C-4 -20 -2 -2 0 8" stroke="#c75c40" stroke-width="1" fill="none" opacity=".6"/>`;
    },
    leaf() {
      let s = `<path d="M0 46 C-4 10 4 -20 0 -46" stroke="#7d9b74" stroke-width="2.5" fill="none"/>`;
      [[-38, -30], [-22, 30], [-6, -28], [10, 28], [26, -26], [40, 0]].forEach(([y, a]) => {
        s += `<ellipse cx="${a > 0 ? 10 : -10}" cy="${y}" rx="6" ry="13" fill="#9cb991" stroke="#7d9b74" transform="rotate(${a * 2} ${a > 0 ? 10 : -10} ${y})"/>`;
      });
      return s;
    }
  };
  const field = [
    ["rose", 6, 6, 18, -12], ["sun", 27, 3, 12, 0], ["tulip", 67, 3, 9, 14], ["cosmos", 95, 5, 14, 8],
    ["daisy", 0, 70, 13, 0], ["sun", 5, 93, 20, 0], ["rose", 31, 96, 12, 10], ["tulip", 56, 95, 10, -8],
    ["daisy", 64, 97, 8, 0], ["cosmos", 94, 91, 16, -6], ["rose", 100, 73, 10, 20], ["leaf", 98, 40, 16, 12],
    ["leaf", 2, 38, 13, -14]
  ];
  const ghosts = [["sun", 24, 30, 52, 0], ["cosmos", 15, 60, 34, 10], ["leaf", 80, 52, 48, 30], ["rose", 86, 16, 30, 0]];
  const ff = $("#flowerField");
  [...ghosts.map((g) => [...g, true]), ...field].forEach(([t, x, y, s, r, ghost]) => {
    const d = document.createElement("div");
    d.className = "flower" + (ghost ? " ghost" : "");
    d.style.cssText = `left:calc(${x}% - ${s / 2}vmin);top:calc(${y}% - ${s / 2}vmin);width:${s}vmin;height:${s}vmin;--r:${r}deg;animation-delay:${(-Math.random() * 7).toFixed(2)}s`;
    d.dataset.x = x; d.dataset.y = y;
    d.innerHTML = `<svg viewBox="-50 -50 100 100">${FLOWERS[t]()}</svg>`;
    ff.appendChild(d);
  });

  const dotsEl = $("#dots");
  dotsEl.innerHTML = "<i></i>".repeat(C.passcode.length);
  let code = "", wrong = 0, unlocked = false;
  const renderDots = () => $$("i", dotsEl).forEach((d, i) => d.classList.toggle("on", i < code.length));

  function press(k) {
    Music.start();
    if (unlocked) return;
    if (k === "back") code = code.slice(0, -1);
    else if (code.length < C.passcode.length) code += k;
    renderDots();
    if (code.length === C.passcode.length) setTimeout(check, 200);
  }
  function check() {
    if (code === C.passcode) return unlock();
    wrong++;
    dotsEl.classList.remove("shake"); void dotsEl.offsetWidth; dotsEl.classList.add("shake");
    if (navigator.vibrate) navigator.vibrate(80);
    code = ""; renderDots();
    $("#lockHint").textContent = wrong >= 2 ? C.passcodeHint : "hmm, not quite ♡";
  }
  async function unlock() {
    unlocked = true;
    dotsEl.classList.add("ok");
    $("#lockHint").textContent = "";
    const scene = $("#scene-lock");
    scene.classList.add("unlocked");
    const r = $("#padlock").getBoundingClientRect();
    FX.burst(r.left + r.width / 2, r.top + r.height / 2, 70, 10);
    $$(".flower:not(.ghost)", ff).forEach((f) => {
      const dx = (f.dataset.x - 50) * 0.5, dy = (f.dataset.y - 50) * 0.5;
      f.style.transform = `translate(${dx}vw, ${dy}vh) rotate(40deg)`;
      f.style.animation = "none";
    });
    await wait(1700);
    goEnvelope();
  }
  $("#keypad").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) press(b.dataset.k || b.textContent.trim());
  });
  addEventListener("keydown", (e) => {
    if (!$("#scene-lock").classList.contains("is-active")) return;
    if (/^\d$/.test(e.key)) press(e.key);
    else if (e.key === "Backspace") press("back");
  });
  // any first touch on the lock screen also starts the music
  $("#scene-lock").addEventListener("pointerdown", () => Music.start(), { once: true });

  /* =======================================================
     2 · ENVELOPE
     ======================================================= */
  const env = $("#envelope");
  function goEnvelope() {
    env.classList.remove("open", "zoom");
    $("#envTip").style.opacity = "";
    document.body.classList.add("intro");
    show("scene-envelope");
    setStep("envelope");
  }
  async function openEnvelope() {
    if (env.classList.contains("open")) return;
    Music.start();
    env.classList.add("open");
    $("#envTip").style.opacity = 0;
    await wait(reduced ? 300 : 2500);
    env.classList.add("zoom");
    await wait(700);
    goLetter(false);
  }
  env.addEventListener("click", openEnvelope);

  /* =======================================================
     3 · LETTER
     ======================================================= */
  const L = C.letter;
  $("#letterTo").textContent = C.to;
  $("#letterFrom").textContent = C.from;
  $("#letterBody").innerHTML = L.lines.map((l) => `<p class="ln">${esc(l)}</p>`).join("");
  $("#letterSign").innerHTML = `${esc(L.signoff)}<small>— ${esc(C.from)}</small>`;
  $("#letterSign").classList.add("ln");
  $("#lyricsLines").innerHTML = L.lyrics.lines.map((l) => `<p>${esc(l)}</p>`).join("");
  $("#lyricsSong").textContent = L.lyrics.song;
  $("#lyrics").classList.add("ln");

  const letterScene = $("#scene-letter");
  let letterRun = 0;
  function finishLetter() {
    letterRun++;
    $$(".ln", letterScene).forEach((el) => el.classList.add("in"));
    letterScene.classList.add("letter-done");
  }
  async function startLetter() {
    const run = ++letterRun;
    letterScene.scrollTop = 0;
    await wait(1100);
    for (const el of $$(".ln", letterScene)) {
      if (run !== letterRun) return;
      el.classList.add("in");
      const r = el.getBoundingClientRect();
      if (r.bottom > innerHeight - 80) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      await wait(reduced ? 150 : Math.min(3200, 700 + el.textContent.length * 26));
    }
    if (run === letterRun) letterScene.classList.add("letter-done");
  }
  function goLetter(done) {
    document.body.classList.add("intro");
    show("scene-letter");
    setStep("letter");
    if (done) { finishLetter(); letterScene.scrollTop = 0; }
    else { letterScene.classList.remove("letter-done"); $$(".ln", letterScene).forEach((el) => el.classList.remove("in")); startLetter(); }
  }
  $("#skipLetter").addEventListener("click", finishLetter);
  $("#toWorld").addEventListener("click", () => enterWorld("hero"));

  /* =======================================================
     4+ · THE WORLD
     ======================================================= */
  let worldBuilt = false;
  function enterWorld(id = "hero", fx = true) {
    show("none");
    document.body.classList.remove("intro");
    document.body.classList.add("world-on");
    if (!worldBuilt) { worldBuilt = true; buildWorld(); }
    jumpTo(id, false);
    setStep(id);
    if (fx) setTimeout(() => FX.rain(50), 600);
  }
  function jumpTo(id, smooth) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add("seen");
    const y = () => (id === "hero" ? 0 : Math.max(0, el.getBoundingClientRect().top + scrollY - 70));
    scrollTo({ top: y(), behavior: smooth ? "smooth" : "instant" });
    // layout can shift while images/fonts settle, so re-align once more
    if (!smooth) setTimeout(() => scrollTo({ top: y(), behavior: "instant" }), 400);
  }

  const ICONS = {
    heart: `<path d="M50 82C20 62 10 45 18 30C26 16 44 18 50 32C56 18 74 16 82 30C90 45 80 62 50 82Z"/>`,
    moon: `<path d="M60 14A36 36 0 1 0 86 70A30 30 0 1 1 60 14Z"/><path d="M80 18l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="currentColor"/>`,
    letter: `<rect x="12" y="26" width="76" height="52" rx="4"/><path d="M12 28l38 30 38-30"/><path d="M50 72c-8-5-10-9-8-12 2-3 6-2 8 1 2-3 6-4 8-1 2 3 0 7-8 12z" fill="currentColor"/>`,
    rose: `<path d="M50 40c-9 0-14-7-12-14 2-8 12-11 17-6 5 4 3 11-2 12-4 1-7-2-5-5"/><path d="M38 26c-6 8-2 20 12 20s18-12 12-20"/><path d="M50 46v44"/><path d="M50 66c-10-2-16-8-18-14 8 0 14 4 18 14zM50 74c8-2 14-8 16-14-8 0-13 5-16 14z"/>`,
    sparkle: `<path d="M50 10C54 40 60 46 90 50C60 54 54 60 50 90C46 60 40 54 10 50C40 46 46 40 50 10Z" fill="currentColor"/>`,
    note: `<path d="M40 72V24l38-8v46"/><circle cx="32" cy="72" r="8"/><circle cx="70" cy="62" r="8"/>`,
    ribbon: `<path d="M50 40c-14-14-30-10-26 0s20 6 26 0zM50 40c14-14 30-10 26 0s-20 6-26 0zM50 40l-12 40M50 40l12 40"/><circle cx="50" cy="40" r="4" fill="currentColor"/>`
  };
  function buildFloaters() {
    const host = $("#floaters");
    const kinds = Object.keys(ICONS);
    let seed = 7;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 26; i++) {
      const k = kinds[i % kinds.length];
      const d = document.createElement("div");
      const size = 34 + rnd() * 70;
      const side = i % 2 ? 78 + rnd() * 18 : rnd() * 18;
      d.className = "floater" + (k === "sparkle" ? " solid" : "");
      d.style.cssText = `left:${side}%;top:${2 + (i / 26) * 94 + rnd() * 3}%;width:${k === "sparkle" ? size / 3 : size}px;height:${k === "sparkle" ? size / 3 : size}px;`;
      if (k === "sparkle") d.style.color = "#c49a52";
      d.dataset.speed = ((rnd() - 0.5) * 0.25).toFixed(3);
      d.dataset.rot = ((rnd() - 0.5) * 30).toFixed(1);
      d.innerHTML = `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg>`;
      host.appendChild(d);
    }
    const fl = $$(".floater", host);
    let ticking = false;
    const update = () => {
      const y = scrollY;
      fl.forEach((f) => { f.style.transform = `translateY(${y * f.dataset.speed}px) rotate(${+f.dataset.rot + y * 0.01 * Math.sign(f.dataset.speed)}deg)`; });
      ticking = false;
    };
    if (!reduced) addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  const polaroid = (p, extra = "") =>
    `<figure class="polaroid ${p.video ? "is-video" : ""}" ${extra}>` +
    `<div class="ph">${p.video
      ? `<video src="${p.video}" muted loop autoplay playsinline preload="metadata"></video>`
      : `<img src="${p.src}" alt="${esc(p.caption || "us")}" loading="lazy" />`}</div>` +
    `<figcaption>${esc(p.caption || "")}</figcaption></figure>`;

  function buildStack() {
    const stack = $("#stack");
    const pics = C.photos.filter((p) => p.src).slice(0, 3);
    stack.innerHTML = pics.map((p) => polaroid(p)).join("");
    let order = $$(".polaroid", stack);
    const poses = ["rotate(-3deg)", "rotate(6deg) translate(16px, 6px)", "rotate(-10deg) translate(-18px, 12px)"];
    const lay = () => order.forEach((el, i) => { el.style.zIndex = 3 - i; el.style.transform = poses[i]; });
    lay();
    stack.addEventListener("click", async () => {
      const top = order[0];
      top.style.transform = "translate(70%, -10%) rotate(18deg)";
      await wait(330);
      order = [...order.slice(1), top];
      lay();
    });
  }

  function buildCounter() {
    const [y, m, d] = C.startDate.split("-").map(Number);
    const start = new Date(y, m - 1, d);
    const tick = () => {
      const diff = Math.max(0, Date.now() - start);
      const days = Math.floor(diff / 864e5);
      const dayNo = days + 1;
      $("#cDays").textContent = dayNo; // day 1 = the day we started
      $("#cHours").textContent = Math.floor(diff / 36e5) % 24;
      $("#cMins").textContent = Math.floor(diff / 6e4) % 60;
      $("#cSecs").textContent = Math.floor(diff / 1e3) % 60;
      $("#fHours").textContent = Math.floor(diff / 36e5).toLocaleString("en-US");
      $("#fBeats").textContent = Math.floor((diff / 6e4) * 75).toLocaleString("en-US");
      const left = 1000 - dayNo;
      $("#countNote").textContent =
        left === 0 ? "today is our 1000th day ♡" :
        left > 0 ? `${left} more sleep${left === 1 ? "" : "s"} until day 1000 ♡` :
        `day ${dayNo} — and still counting ♡`;
      $("#finaleDay").textContent = `today is day ${dayNo} of us`;
    };
    tick();
    setInterval(tick, 1000);
  }

  function buildWall() {
    const rots = [-4, 3, -2, 5, -3, 2, -5, 4, -1, 3];
    $("#wall").innerHTML = C.photos.map((p, i) => polaroid(p, `style="--r:${rots[i % rots.length]}deg" data-i="${i}"`)).join("");
    $("#wall").addEventListener("click", (e) => {
      const f = e.target.closest(".polaroid");
      if (f) openLightbox(C.photos[f.dataset.i]);
    });
  }
  const lb = $("#lightbox");
  function openLightbox(p) {
    $("#lbFig").outerHTML = polaroid(p, 'id="lbFig"').replace('class="polaroid', 'class="polaroid lb-polaroid').replace(' loading="lazy"', "");
    lb.classList.add("open");
  }
  lb.addEventListener("click", () => lb.classList.remove("open"));
  addEventListener("keydown", (e) => { if (e.key === "Escape") lb.classList.remove("open"); });

  function buildCert() {
    const c = C.certificate;
    $("#certKicker").textContent = c.kicker;
    $("#certTitle").textContent = c.title;
    $("#certSub").textContent = c.subtitle;
    $("#certLead").textContent = c.lead;
    $("#certLine").textContent = c.line;
    $("#certDate").textContent = c.date;
    $("#certFooter").textContent = c.footer;
    // rose-gold seal
    let pts = "";
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2, r = i % 2 ? 54 : 58;
      pts += `${(60 + Math.cos(a) * r).toFixed(2)},${(60 + Math.sin(a) * r).toFixed(2)} `;
    }
    $("#sealSvg").innerHTML = `
      <defs>
        <radialGradient id="sg" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#f2b8c4"/><stop offset=".55" stop-color="#c46b82"/><stop offset="1" stop-color="#8e3c55"/></radialGradient>
        <path id="arcT" d="M24 60a36 36 0 0 1 72 0"/><path id="arcB" d="M20 60a40 40 0 0 0 80 0"/>
      </defs>
      <polygon points="${pts}" fill="url(#sg)"/>
      <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1"/>
      <circle cx="60" cy="60" r="31" fill="none" stroke="rgba(255,255,255,.45)" stroke-width=".8"/>
      <text font-family="Jost, sans-serif" font-size="7.2" letter-spacing="1.6" fill="#fff"><textPath href="#arcT" startOffset="50%" text-anchor="middle">ONE OF A KIND</textPath></text>
      <text font-family="Jost, sans-serif" font-size="7.2" letter-spacing="1.6" fill="#fff"><textPath href="#arcB" startOffset="50%" text-anchor="middle">LOVED ALWAYS</textPath></text>
      <path d="M60 72c-10-6-14-11-12-16 2-4 8-4 12 1 4-5 10-5 12-1 2 5-2 10-12 16z" fill="none" stroke="#fff" stroke-width="2"/>`;
  }

  async function saveNode(node, filename, bg) {
    if (!window.html2canvas) { alert("One sec — still loading, try again in a moment ♡"); return; }
    try {
      await document.fonts.ready;
      const canvas = await html2canvas(node, {
        scale: 2, backgroundColor: bg, windowWidth: 1200, windowHeight: 900, useCORS: true,
        onclone: (doc) => {
          const n = doc.getElementById(node.id);
          n.style.width = node.id === "cert" ? "860px" : "520px";
          const st = doc.createElement("style");
          st.textContent = "*{animation:none!important;transition:none!important}.coupon::before{display:none}.seal svg{filter:none}";
          doc.head.appendChild(st);
        }
      });
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      }, "image/png");
    } catch (err) {
      console.error(err);
      alert("Couldn't save it automatically — a screenshot works too ♡");
    }
  }
  $("#saveCert").addEventListener("click", (e) => {
    saveNode($("#cert"), "best-boyfriend-certificate.png", "#f6ebe2");
    const r = e.currentTarget.getBoundingClientRect();
    FX.burst(r.left + r.width / 2, r.top, 30, 7);
  });

  /* ---------- mixtape ---------- */
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  function renderTracks() {
    const ol = $("#tracks");
    if (!ol) return;
    ol.innerHTML = C.mixtape.tracks.map((t, i) => {
      const on = Music.current.kind === "mix" && Music.current.i === i;
      return `<li class="track ${on ? "on" : ""} ${on && Music.playing ? "playing" : ""}" data-i="${i}">
        <span class="track-num">${i + 1}</span>
        <span class="track-title">${esc(t.title || `track ${i + 1}`)}<span class="eq"><i></i><i></i><i></i></span></span>
        <span class="track-time">${t.start ? "from<br>" + fmtTime(t.start) : ""}</span>
        <span class="track-note">${esc(t.note || "")}</span>
      </li>`;
    }).join("");
  }
  function buildMixtape() {
    $("#casLabel").textContent = C.mixtape.label;
    $("#linerNote").textContent = C.mixtape.note;
    renderTracks();
    $("#tracks").addEventListener("click", (e) => {
      const li = e.target.closest(".track");
      if (!li) return;
      const i = +li.dataset.i;
      if (Music.current.kind === "mix" && Music.current.i === i) Music.toggle();
      else Music.playTrack(i);
    });
    $("#mixPlay").addEventListener("click", () => {
      if (Music.current.kind === "mix") Music.toggle(); else Music.playTrack(0);
    });
    $("#mixPrev").addEventListener("click", () => Music.playTrack(Music.current.kind === "mix" ? Music.current.i - 1 : 0));
    $("#mixNext").addEventListener("click", () => Music.playTrack(Music.current.kind === "mix" ? Music.current.i + 1 : 0));
  }

  /* ---------- riddle → coupon ---------- */
  function buildRiddle() {
    const R = C.riddle;
    $("#riddleQ").innerHTML = R.question.map((l) => `<p>${esc(l)}</p>`).join("");
    const cp = R.coupon;
    $("#cpTitle").textContent = cp.title;
    $("#cpAmount").textContent = cp.amount || "surprise amount ♡";
    $("#cpFine").textContent = cp.fine;
    $("#cpRedeem").textContent = cp.redeem;
    $("#cpSerial").textContent = cp.serial;
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    let tries = 0;
    const section = $("#riddle");
    if (store.get("riddle-solved") === "1") section.classList.add("solved");
    $("#riddleForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const v = norm($("#riddleInput").value);
      if (!v) return;
      if (R.answers.some((a) => v.includes(norm(a)))) {
        $("#riddleHint").textContent = "YES! ♡";
        $("#riddleInput").blur();
        await wait(400);
        section.classList.add("solved");
        store.set("riddle-solved", "1");
        await wait(80);
        $("#coupon").scrollIntoView({ behavior: "smooth", block: "center" });
        await wait(700);
        const r = $("#coupon").getBoundingClientRect();
        FX.burst(r.left + r.width / 2, r.top + r.height / 2, 110, 12);
        FX.rain(90);
        if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
      } else {
        tries++;
        const f = $("#riddleForm");
        f.classList.remove("shake"); void f.offsetWidth; f.classList.add("shake");
        $("#riddleHint").textContent = R.hints[Math.min(tries - 1, R.hints.length - 1)] || "not quite — try again ♡";
      }
    });
    $("#saveCoupon").addEventListener("click", () => saveNode($("#coupon"), "my-gift-coupon.png", null));
  }

  /* ---------- finale ---------- */
  $("#rereadLetter").addEventListener("click", () => goLetter(true));
  $("#restart").addEventListener("click", () => {
    store.set("step", "");
    scrollTo({ top: 0, behavior: "instant" });
    location.reload();
  });

  /* =======================================================
     BACK / NEXT  +  remember where he was
     ======================================================= */
  const STEPS = ["envelope", "letter", "hero", "counter", "gallery", "certSection", "mixtape", "riddle", "finale"];
  const WORLD = STEPS.slice(2);
  let step = null;
  function setStep(id) {
    if (step === id) return;
    step = id;
    store.set("step", id);
    const i = STEPS.indexOf(id);
    document.body.classList.add("has-nav");
    $("#navBack").disabled = i <= 0;
    $("#navNext").disabled = i >= STEPS.length - 1;
    $("#navCount").textContent = `${i + 1} / ${STEPS.length}`;
  }
  function go(dir) {
    const i = STEPS.indexOf(step);
    const id = STEPS[i + dir];
    if (!id) return;
    if (id === "envelope") goEnvelope();
    else if (id === "letter") {
      if (step === "envelope" && dir > 0) openEnvelope();
      else goLetter(true);
    } else if (step === "letter" || !document.body.classList.contains("world-on")) enterWorld(id, step === "letter");
    else { setStep(id); jumpTo(id, true); }
  }
  $("#navBack").addEventListener("click", () => go(-1));
  $("#navNext").addEventListener("click", () => go(1));
  // keep the saved step in sync while he scrolls through the world
  let scrollT = 0;
  addEventListener("scroll", () => {
    if (!document.body.classList.contains("world-on") || document.body.classList.contains("intro")) return;
    clearTimeout(scrollT);
    scrollT = setTimeout(() => {
      let cur = "hero";
      for (const id of WORLD) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < innerHeight * 0.45) cur = id;
      }
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = "finale";
      setStep(cur);
    }, 150);
  }, { passive: true });

  function buildWorld() {
    buildFloaters();
    buildStack();
    buildCounter();
    buildWall();
    buildCert();
    buildMixtape();
    buildRiddle();
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("seen"); io.unobserve(en.target); }
    }), { threshold: 0.12 });
    $$("section.reveal").forEach((s) => io.observe(s));
  }

  Music.init();
  // came back / refreshed? pick up exactly where he left off
  const saved = location.hash === "#world" ? "hero" : store.get("step");
  if (saved && STEPS.includes(saved)) {
    unlocked = true;
    pill.classList.add("show", "nudge");
    $("#pillTitle").textContent = "Tap here to play ♪";
    addEventListener("pointerdown", () => Music.start(), { once: true });
    if (saved === "envelope") goEnvelope();
    else if (saved === "letter") goLetter(true);
    else enterWorld(saved, false);
  }
})();
