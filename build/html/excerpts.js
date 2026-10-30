/* MUSICATION — music excerpt library (muzikinės ištraukos).
 *
 * Short pieces sorted by metre (2/4, 3/4, 4/4) that children can play along
 * with while performing the rhythms and melodies they wrote themselves, and
 * that a teacher can attach to a lesson (pamokėlė). Two sources:
 *   - BUILTIN: well-known public-domain children's melodies and rhythm
 *     patterns, stored as notes and played by the program's own synth;
 *   - uploads: the teacher's own recordings (mp3, wav, ...), kept in this
 *     browser's IndexedDB with the metre the teacher gave them.
 *
 * One global: window.MusicationExcerpts. Only one excerpt plays at a time.
 */
(function (global) {
  'use strict';

  var METERS = ['2/4', '3/4', '4/4'];

  // notes: [name, beats] - one beat is a quarter note; 'R' is a rest.
  // A pickup (upbeat) is written as a rest filling the rest of the bar.
  var BUILTIN = [
    // ── 2/4 ──
    { id: 'b:avinelis', title: 'Marytės avinėlis', meter: '2/4', kind: 'melodija', bpm: 104, notes: [
      ['E4',1],['D4',1],['C4',1],['D4',1],['E4',1],['E4',1],['E4',2],
      ['D4',1],['D4',1],['D4',2],['E4',1],['G4',1],['G4',2],
      ['E4',1],['D4',1],['C4',1],['D4',1],['E4',1],['E4',1],['E4',1],['E4',1],
      ['D4',1],['D4',1],['E4',1],['D4',1],['C4',2],['R',2] ] },
    { id: 'b:bandeles', title: 'Karštos bandelės', meter: '2/4', kind: 'melodija', bpm: 96, notes: [
      ['E4',1],['D4',1],['C4',2],['E4',1],['D4',1],['C4',2],
      ['C4',0.5],['C4',0.5],['C4',0.5],['C4',0.5],['D4',0.5],['D4',0.5],['D4',0.5],['D4',0.5],
      ['E4',1],['D4',1],['C4',2] ] },
    { id: 'b:marsas', title: 'Maršas', meter: '2/4', kind: 'ritmas', bpm: 108, pattern: [
      [0,'kick'],[0,'hat'],[0.5,'hat'],[1,'snare'],[1,'hat'],[1.5,'hat'] ] },
    { id: 'b:polka', title: 'Polka', meter: '2/4', kind: 'ritmas', bpm: 126, pattern: [
      [0,'kick'],[0,'bass:C3'],[0.5,'clap'],[1,'kick'],[1,'bass:G2'],[1.5,'clap'] ] },

    // ── 3/4 ──
    { id: 'b:gimtadienis', title: 'Su gimtadieniu', meter: '3/4', kind: 'melodija', bpm: 104, notes: [
      ['R',2],['G4',0.75],['G4',0.25],
      ['A4',1],['G4',1],['C5',1],['B4',2],['G4',0.75],['G4',0.25],
      ['A4',1],['G4',1],['D5',1],['C5',2],['G4',0.75],['G4',0.25],
      ['G5',1],['E5',1],['C5',1],['B4',1],['A4',1],['F5',0.75],['F5',0.25],
      ['E5',1],['C5',1],['D5',1],['C5',3] ] },
    { id: 'b:valsas', title: 'Valsas', meter: '3/4', kind: 'ritmas', bpm: 132, pattern: [
      [0,'kick'],[0,'bass:C3'],[1,'clap'],[2,'clap'] ] },
    { id: 'b:menuetas', title: 'Lopšinės sūpavimas', meter: '3/4', kind: 'ritmas', bpm: 96, pattern: [
      [0,'bass:F2'],[0,'hat'],[1,'hat'],[2,'hat'],[2.5,'hat'] ] },

    // ── 4/4 ──
    { id: 'b:zvaigzdute', title: 'Mažoji žvaigždutė', meter: '4/4', kind: 'melodija', bpm: 100, notes: [
      ['C4',1],['C4',1],['G4',1],['G4',1],['A4',1],['A4',1],['G4',2],
      ['F4',1],['F4',1],['E4',1],['E4',1],['D4',1],['D4',1],['C4',2],
      ['G4',1],['G4',1],['F4',1],['F4',1],['E4',1],['E4',1],['D4',2],
      ['G4',1],['G4',1],['F4',1],['F4',1],['E4',1],['E4',1],['D4',2],
      ['C4',1],['C4',1],['G4',1],['G4',1],['A4',1],['A4',1],['G4',2],
      ['F4',1],['F4',1],['E4',1],['E4',1],['D4',1],['D4',1],['C4',2] ] },
    { id: 'b:jonai', title: 'Broli Jonai', meter: '4/4', kind: 'melodija', bpm: 108, notes: [
      ['C4',1],['D4',1],['E4',1],['C4',1],['C4',1],['D4',1],['E4',1],['C4',1],
      ['E4',1],['F4',1],['G4',2],['E4',1],['F4',1],['G4',2],
      ['G4',0.5],['A4',0.5],['G4',0.5],['F4',0.5],['E4',1],['C4',1],
      ['G4',0.5],['A4',0.5],['G4',0.5],['F4',0.5],['E4',1],['C4',1],
      ['C4',1],['G3',1],['C4',2],['C4',1],['G3',1],['C4',2] ] },
    { id: 'b:ode', title: 'Džiaugsmo odė', meter: '4/4', kind: 'melodija', bpm: 100, notes: [
      ['E4',1],['E4',1],['F4',1],['G4',1],['G4',1],['F4',1],['E4',1],['D4',1],
      ['C4',1],['C4',1],['D4',1],['E4',1],['E4',1.5],['D4',0.5],['D4',2],
      ['E4',1],['E4',1],['F4',1],['G4',1],['G4',1],['F4',1],['E4',1],['D4',1],
      ['C4',1],['C4',1],['D4',1],['E4',1],['D4',1.5],['C4',0.5],['C4',2] ] },
    { id: 'b:zingsniai', title: 'Žingsniai', meter: '4/4', kind: 'ritmas', bpm: 92, pattern: [
      [0,'kick'],[1,'kick'],[1,'clap'],[2,'kick'],[3,'kick'],[3,'clap'] ] },
    { id: 'b:rokas', title: 'Rokas', meter: '4/4', kind: 'ritmas', bpm: 100, pattern: [
      [0,'kick'],[0,'hat'],[0.5,'hat'],[1,'snare'],[1,'hat'],[1.5,'hat'],
      [2,'kick'],[2,'hat'],[2.5,'kick'],[2.5,'hat'],[3,'snare'],[3,'hat'],[3.5,'hat'] ] }
  ];

  // A rhythm pattern is one bar long; it is played this many bars per pass.
  var RHYTHM_BARS = 8;

  var KIND_ICON = { melodija: '🎵', ritmas: '🥁', irasas: '🎧' };
  var KIND_NAME = { melodija: 'Melodija', ritmas: 'Ritmas', irasas: 'Įrašas' };

  // ── Audio ────────────────────────────────────────────────────────────────
  var ctx = null, out = null;
  function audio() {
    if (!ctx) {
      ctx = new (global.AudioContext || global.webkitAudioContext)();
      var comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.ratio.value = 4;
      comp.connect(ctx.destination);
      out = comp;
    }
    if (ctx.state !== 'running') { ctx.resume(); }
    return ctx;
  }

  var SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function freqOf(name) {
    var m = /^([A-G])(s?)(\d)$/.exec(name);
    if (!m) { return 0; }
    var midi = 12 * (parseInt(m[3], 10) + 1) + SEMI[m[1]] + (m[2] ? 1 : 0);
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  var noiseBuf = null;
  function noise(t, dur) {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < d.length; i++) { d[i] = Math.random() * 2 - 1; }
    }
    var s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
    s.start(t); s.stop(t + dur);
    return s;
  }

  function env(dest, t, peak, decay) {
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    g.connect(dest);
    return g;
  }

  // Soft, bell-like piano tone for the melodies.
  function tone(dest, freq, t, dur) {
    var g = env(dest, t, 0.32, dur + 0.5);
    [[1, 1], [2, 0.35], [3, 0.12]].forEach(function (h) {
      var o = ctx.createOscillator(); var hg = ctx.createGain();
      o.type = h[0] === 1 ? 'triangle' : 'sine';
      o.frequency.value = freq * h[0]; hg.gain.value = h[1];
      o.connect(hg); hg.connect(g);
      o.start(t); o.stop(t + dur + 0.6);
    });
  }

  var DRUMS = {
    kick: function (dest, t, vol) {
      var g = env(dest, t, 0.9 * vol, 0.35);
      var o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(50, t + 0.18);
      o.connect(g); o.start(t); o.stop(t + 0.4);
    },
    snare: function (dest, t, vol) {
      var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = 0.6;
      f.connect(env(dest, t, 0.55 * vol, 0.18));
      noise(t, 0.2).connect(f);
    },
    hat: function (dest, t, vol) {
      var f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
      f.connect(env(dest, t, 0.22 * vol, 0.06));
      noise(t, 0.08).connect(f);
    },
    clap: function (dest, t, vol) {
      var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1500; f.Q.value = 0.9;
      f.connect(env(dest, t, 0.6 * vol, 0.14));
      noise(t, 0.15).connect(f);
    }
  };

  function hit(dest, what, t, vol, beatSecs) {
    if (what.indexOf('bass:') === 0) {
      var g = env(dest, t, 0.45 * vol, beatSecs * 0.9);
      var o = ctx.createOscillator(); o.type = 'triangle';
      o.frequency.value = freqOf(what.slice(5));
      o.connect(g); o.start(t); o.stop(t + beatSecs);
    } else if (DRUMS[what]) {
      DRUMS[what](dest, t, vol);
    }
  }

  // Schedules one pass of a built-in excerpt from time t0; returns its length (s).
  function schedule(item, dest, t0, bpm) {
    var beat = 60 / bpm;
    var perBar = parseInt(item.meter, 10);
    if (item.kind === 'ritmas') {
      for (var bar = 0; bar < RHYTHM_BARS; bar++) {
        item.pattern.forEach(function (ev) {
          hit(dest, ev[1], t0 + (bar * perBar + ev[0]) * beat, 1, beat);
        });
      }
      return RHYTHM_BARS * perBar * beat;
    }
    // Melody, with a soft beat underneath so the metre can be felt.
    var pos = 0;
    item.notes.forEach(function (n) {
      if (n[0] !== 'R') { tone(dest, freqOf(n[0]), t0 + pos * beat, n[1] * beat * 0.9); }
      pos += n[1];
    });
    for (var b = 0; b < Math.round(pos); b++) {
      hit(dest, b % perBar === 0 ? 'kick' : 'hat', t0 + b * beat, 0.45, beat);
    }
    return pos * beat;
  }

  // ── Uploaded recordings (IndexedDB) ─────────────────────────────────────
  var DB_NAME = 'musication-excerpts', STORE = 'files';
  function db() {
    return new Promise(function (resolve, reject) {
      var req = global.indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () { req.result.createObjectStore(STORE, { keyPath: 'id' }); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }
  function tx(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (resolve, reject) {
        var t = d.transaction(STORE, mode);
        var result = fn(t.objectStore(STORE));
        t.oncomplete = function () { resolve(result && result.result !== undefined ? result.result : result); };
        t.onerror = function () { reject(t.error); };
      });
    });
  }

  // Never lets a slow or unavailable IndexedDB hold back the built-in list.
  function uploads() {
    var timeout = new Promise(function (resolve) { setTimeout(function () { resolve([]); }, 1500); });
    return Promise.race([readUploads(), timeout]);
  }
  function readUploads() {
    if (!global.indexedDB) { return Promise.resolve([]); }
    return tx('readonly', function (s) { return s.getAll(); }).then(function (rows) {
      return (rows || []).map(function (r) {
        return { id: r.id, title: r.title, meter: r.meter, kind: 'irasas', blob: r.blob, createdAt: r.createdAt };
      }).sort(function (a, b) { return a.createdAt - b.createdAt; });
    }).catch(function () { return []; });
  }

  // ── Playback state (one excerpt at a time) ──────────────────────────────
  var current = null; // { id, gain?, audioEl?, timer? }
  var listeners = [];

  function notify() {
    var id = current ? current.id : null;
    listeners.forEach(function (fn) { try { fn(id); } catch (e) {} });
  }

  function stop() {
    if (!current) { return; }
    if (current.timer) { clearTimeout(current.timer); }
    if (current.gain) {
      var g = current.gain;
      g.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
      setTimeout(function () { g.disconnect(); }, 200);
    }
    if (current.audioEl) {
      current.audioEl.pause();
      URL.revokeObjectURL(current.audioEl.src);
    }
    current = null;
    notify();
  }

  // opts: { bpm, loop, volume (0..1) }
  function play(item, opts) {
    opts = opts || {};
    stop();
    var vol = opts.volume == null ? 0.9 : opts.volume;
    if (item.kind === 'irasas') {
      var el = new Audio(URL.createObjectURL(item.blob));
      el.loop = !!opts.loop;
      el.volume = vol;
      el.onended = function () { if (current && current.audioEl === el) { current = null; notify(); } };
      current = { id: item.id, audioEl: el };
      el.play();
      notify();
      return;
    }
    var c = audio();
    var gain = c.createGain(); gain.gain.value = vol; gain.connect(out);
    var bpm = opts.bpm || item.bpm;
    var me = { id: item.id, gain: gain };
    current = me;
    var start = c.currentTime + 0.08;
    (function pass(t0) {
      var len = schedule(item, gain, t0, bpm);
      var endsIn = (t0 + len - c.currentTime) * 1000;
      me.timer = setTimeout(function () {
        if (current !== me) { return; }
        if (opts.loop) { pass(t0 + len); } else { stop(); }
      }, Math.max(0, opts.loop ? endsIn - 300 : endsIn + 400));
    })(start);
    notify();
  }

  var api = {
    METERS: METERS,
    BUILTIN: BUILTIN,
    KIND_ICON: KIND_ICON,
    KIND_NAME: KIND_NAME,

    all: function () {
      return uploads().then(function (u) { return BUILTIN.concat(u); });
    },
    get: function (id) {
      var b = BUILTIN.filter(function (x) { return x.id === id; })[0];
      if (b) { return Promise.resolve(b); }
      return uploads().then(function (u) { return u.filter(function (x) { return x.id === id; })[0] || null; });
    },

    play: play,
    stop: stop,
    playingId: function () { return current ? current.id : null; },
    onChange: function (fn) { listeners.push(fn); },

    addUpload: function (file, title, meter) {
      var row = { id: 'u:' + Date.now() + '_' + Math.floor(Math.random() * 1e6), title: title, meter: meter, blob: file, createdAt: Date.now() };
      return tx('readwrite', function (s) { s.put(row); }).then(function () { return row.id; });
    },
    removeUpload: function (id) {
      if (current && current.id === id) { stop(); }
      return tx('readwrite', function (s) { s.delete(id); });
    }
  };

  global.MusicationExcerpts = api;
})(window);
