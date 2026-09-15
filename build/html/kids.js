/* Shared engine for the MUSICATION kids activities.
   Exposes a global `Kids` object: audio, rewards (stars), mascot, colours,
   Lithuanian speech instructions, screen navigation and small helpers. */
(function (global) {
  'use strict';

  // ----------------------------------------------------------------- Audio ---
  var actx = null;
  function ctx() {
    if (!actx) {
      var AC = global.AudioContext || global.webkitAudioContext;
      actx = new AC();
    }
    if (actx.state === 'suspended') { actx.resume(); }
    return actx;
  }

  // Note name -> frequency (Do..Si across a couple of octaves used by the games)
  var FREQ = {
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    'C6': 1046.50
  };
  function freqOf(n) { return (typeof n === 'number') ? n : (FREQ[n] || FREQ[n + '4'] || 440); }

  // A soft bell-like tone (triangle wave, quick attack, exponential decay).
  function tone(note, opts) {
    opts = opts || {};
    var c = ctx(), now = c.currentTime + (opts.delay || 0);
    var dur = opts.dur || 0.9;
    var g = opts.gain != null ? opts.gain : 0.35;
    var osc = c.createOscillator(), gain = c.createGain();
    osc.type = opts.type || 'triangle';
    osc.frequency.value = freqOf(note);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(g, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(now);
    osc.stop(now + dur + 0.05);
  }

  // Play a sequence: items = [{note, dur}] ; gap between starts = item.dur (or `gap`).
  // onNote(index) fires as each note starts (for highlighting). Returns a Promise.
  function melody(items, opts) {
    opts = opts || {};
    var t = 0;
    items.forEach(function (it, i) {
      var step = (it.gap || opts.gap || it.dur || 0.6);
      setTimeout(function () {
        tone(it.note, { dur: (it.dur || 0.8), gain: opts.gain });
        if (opts.onNote) { opts.onNote(i, it); }
      }, t * 1000);
      t += step;
    });
    return new Promise(function (res) { setTimeout(res, t * 1000); });
  }

  // A short noise burst -> a hand clap.
  function clap(opts) {
    opts = opts || {};
    var c = ctx(), now = c.currentTime + (opts.delay || 0);
    var len = 0.12, buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    }
    var src = c.createBufferSource(); src.buffer = buf;
    var bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1600; bp.Q.value = 0.7;
    var g = c.createGain(); g.gain.value = opts.gain != null ? opts.gain : 0.6;
    src.connect(bp).connect(g).connect(c.destination);
    src.start(now);
  }

  function tick() { tone('C6', { dur: 0.06, gain: 0.25, type: 'square' }); }

  // Happy little arpeggio for a correct answer.
  function correct() {
    ['C5', 'E5', 'G5', 'C6'].forEach(function (n, i) {
      tone(n, { delay: i * 0.09, dur: 0.5, gain: 0.3 });
    });
  }
  // Gentle low "oops" for a wrong answer.
  function wrong() {
    tone('E3', { dur: 0.3, gain: 0.25, type: 'sawtooth' });
    tone('Eb3' in FREQ ? 'Eb3' : 155.56, { delay: 0.16, dur: 0.4, gain: 0.25, type: 'sawtooth' });
  }
  function fanfare() {
    ['C5', 'E5', 'G5', 'C6', 'G5', 'C6'].forEach(function (n, i) {
      tone(n, { delay: i * 0.12, dur: 0.6, gain: 0.32 });
    });
  }

  // -------------------------------------------------------------- Solfège ---
  // Boomwhacker colours: C red, D orange, E yellow, F green, G blue, A purple, B pink.
  var SOLFEGE = [
    { solf: 'Do',  note: 'C4', color: '#e53935', sign: '✊', signName: 'kumštis' },        // ✊
    { solf: 'Re',  note: 'D4', color: '#fb8c00', sign: '🖐️', signName: 'plaštaka įstrižai' }, // 🖐 (angled)
    { solf: 'Mi',  note: 'E4', color: '#fdd835', sign: '✋', signName: 'tiesi plaštaka' }, // ✋
    { solf: 'Fa',  note: 'F4', color: '#43a047', sign: '👎', signName: 'nykštys žemyn' }, // 👎
    { solf: 'Sol', note: 'G4', color: '#1e88e5', sign: '🤚', signName: 'plaštaka tiesiai' }, // 🤚
    { solf: 'La',  note: 'A4', color: '#8e24aa', sign: '👋', signName: 'plaštaka žemyn' }, // 👋
    { solf: 'Si',  note: 'B4', color: '#ec407a', sign: '☝️', signName: 'pirštas aukštyn' } // ☝
  ];
  function solfByNote(note) {
    for (var i = 0; i < SOLFEGE.length; i++) { if (SOLFEGE[i].note === note) { return SOLFEGE[i]; } }
    return null;
  }

  // --------------------------------------------------------------- Speech ---
  // Optional Lithuanian voice instructions (helps non-readers). Degrades silently.
  function say(text) {
    try {
      if (!global.speechSynthesis) { return; }
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'lt-LT'; u.rate = 0.95; u.pitch = 1.05;
      global.speechSynthesis.cancel();
      global.speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }

  // ------------------------------------------------------- Background fx ---
  // Decorative floating musical notes drifting up behind the content. Purely
  // visual (aria-hidden, no pointer events) - shared across every kids.css page.
  var NOTE_GLYPHS = ['♪', '♫', '♩', '♪', '♬'];
  function ensureBgNotes(count) {
    if (document.querySelector('.bg-notes')) { return; }
    var wrap = document.createElement('div');
    wrap.className = 'bg-notes';
    wrap.setAttribute('aria-hidden', 'true');
    var n = count || 10;
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.textContent = rand(NOTE_GLYPHS);
      s.style.left = (Math.random() * 96) + 'vw';
      s.style.fontSize = (18 + Math.random() * 22) + 'px';
      s.style.animationDuration = (14 + Math.random() * 12) + 's';
      s.style.animationDelay = (Math.random() * 14) + 's';
      wrap.appendChild(s);
    }
    document.body.insertBefore(wrap, document.body.firstChild);
  }

  // -------------------------------------------------------------- Rewards ---
  var KEY = 'makemusic.progress.v1';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function persist(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }

  function getStars() { return load().stars || 0; }
  function renderStars() {
    var el = document.getElementById('starCount');
    if (el) { el.textContent = getStars(); }
  }
  function addStars(n) {
    var o = load(); o.stars = (o.stars || 0) + n; persist(o);
    renderStars();
    var box = document.querySelector('.stars-box');
    if (box) { box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop'); }
    return o.stars;
  }
  function markDone(id) {
    var o = load(); o.done = o.done || {}; o.done[id] = true; persist(o);
  }
  function isDone(id) { var d = load().done; return !!(d && d[id]); }

  // --------------------------------------------------------------- Mascot ---
  // A small animated SVG owl (idle bob + blink, happy/cheer wing-flap bounce,
  // sad droopy eyes) instead of a single static emoji - the mood reads through
  // motion, not just a swapped glyph.
  var mascotEl = null, mascotTimer = null;
  function ensureMascot() {
    if (mascotEl) { return mascotEl; }
    mascotEl = document.createElement('div');
    mascotEl.id = 'kids-mascot';
    mascotEl.innerHTML =
      '<div class="bubble"></div>' +
      '<svg class="owl" viewBox="0 0 100 100" width="72" height="72" aria-hidden="true">' +
        '<ellipse class="owl-wing owl-wing-l" cx="18" cy="62" rx="13" ry="21"></ellipse>' +
        '<ellipse class="owl-wing owl-wing-r" cx="82" cy="62" rx="13" ry="21"></ellipse>' +
        '<path class="owl-ear" d="M27 22 L18 3 L37 15 Z"></path>' +
        '<path class="owl-ear" d="M73 22 L82 3 L63 15 Z"></path>' +
        '<ellipse class="owl-belly" cx="50" cy="56" rx="33" ry="37"></ellipse>' +
        '<g class="owl-eye owl-eye-l"><circle class="owl-eye-white" cx="36" cy="47" r="12"></circle><circle class="owl-pupil" cx="36" cy="47" r="5.5"></circle></g>' +
        '<g class="owl-eye owl-eye-r"><circle class="owl-eye-white" cx="64" cy="47" r="12"></circle><circle class="owl-pupil" cx="64" cy="47" r="5.5"></circle></g>' +
        '<path class="owl-beak" d="M50 55 L44 65 L56 65 Z"></path>' +
      '</svg>';
    document.body.appendChild(mascotEl);
    return mascotEl;
  }
  function mascot(mood, text) {
    var m = ensureMascot();
    m.classList.remove('happy', 'sad', 'cheer');
    if (mood === 'happy' || mood === 'cheer') { m.classList.add('happy'); }
    else if (mood === 'sad') { m.classList.add('sad'); }
    if (text) {
      m.querySelector('.bubble').textContent = text;
      m.classList.add('show');
      clearTimeout(mascotTimer);
      mascotTimer = setTimeout(function () { m.classList.remove('show'); }, 2600);
    }
  }

  function confetti() {
    var colors = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa', '#ec407a'];
    for (var i = 0; i < 40; i++) {
      var c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animation = 'fall ' + (1.4 + Math.random() * 1.2) + 's linear ' + (Math.random() * 0.4) + 's forwards';
      document.body.appendChild(c);
      (function (el) { setTimeout(function () { el.remove(); }, 3200); })(c);
    }
    fanfare();
  }

  // -------------------------------------------------------------- Screens ---
  // A page can hold several <section class="screen" id="...">. show() toggles them.
  function showScreen(id) {
    var all = document.querySelectorAll('.screen');
    var found = false;
    all.forEach(function (s) {
      var on = (s.id === id);
      s.classList.toggle('active', on);
      if (on) { found = true; }
    });
    if (found) {
      try { history.replaceState(null, '', '#' + id); } catch (e) {}
      window.scrollTo(0, 0);
      mascot('idle');
    }
    return found;
  }
  function initScreens(defaultId) {
    var h = (location.hash || '').replace('#', '');
    if (!h || !showScreen(h)) { showScreen(defaultId); }
  }

  // ---------------------------------------------------------------- Utils ---
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = (Math.random() * (i + 1)) | 0; var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function rand(arr) { return arr[(Math.random() * arr.length) | 0]; }

  global.Kids = {
    audio: { resume: ctx, tone: tone, melody: melody, clap: clap, tick: tick, correct: correct, wrong: wrong, fanfare: fanfare, freqOf: freqOf },
    SOLFEGE: SOLFEGE, solfByNote: solfByNote,
    say: say,
    stars: { add: addStars, get: getStars, render: renderStars },
    progress: { markDone: markDone, isDone: isDone },
    mascot: mascot, confetti: confetti,
    showScreen: showScreen, initScreens: initScreens,
    shuffle: shuffle, rand: rand,
    bgNotes: ensureBgNotes
  };

  document.addEventListener('DOMContentLoaded', function () { renderStars(); ensureMascot(); ensureBgNotes(); });
})(window);
