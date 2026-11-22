/* MUSICATION lesson engine (window.LessonEngine).
 *
 * A lesson is a list of blocks: { id, type, title?, text?, ...type fields }.
 *   text      📖 { text }
 *   notes     🎼 { mode: 'melody', notes: ['C4',…], names, check } | { mode: 'lines' } | { mode: 'clef', clef }
 *   audio     🎧 { url }            video 🎬 { url }  (file or YouTube)        image 🖼️ { url }
 *   rhythm    👏 { pattern: ['q','ee',…], meter, accent }
 *   piano     🎹 { notes, show }    listen and play it back on the keys
 *   listening 👂 { options: [item…], answer, random }   item: {type:'rhythm',pattern,meter}|{type:'melody',notes}|{type:'clef',clef}
 *   task      📝 { text (the question), choices: [..], answer }
 *   game      🎮 { game: 'kagirdi', pool: [item…], rounds } | { game: 'judek' | 'orkestras' | … }
 *   recording 🎤 { seconds }
 *
 * LessonEngine.player(el, blocks, opts) plays them; scored blocks report
 * { score 0..1, errors: [places], area, tries } through opts.onBlockDone
 * once the child leaves the block. LessonEngine.editor(block, el, onChange)
 * edits one block. Strings come from i18n.js.
 */
(function (global) {
  'use strict';

  var D = global.SolfedzioData, TOK = D.TOK, KEYS = D.KEYS, BLACK = D.BLACK;
  function t(k, v) { return global.I18N ? global.I18N.t(k, v) : k; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function uid() { return 'b' + Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 7); }

  // ───────────────────────────── Block types ─────────────────────────────
  var ORDER = ['text', 'notes', 'audio', 'video', 'image', 'rhythm', 'piano', 'listening', 'task', 'game', 'recording'];
  var ICO = { text: '📖', notes: '🎼', audio: '🎧', video: '🎬', image: '🖼️', rhythm: '👏', piano: '🎹',
    listening: '👂', task: '📝', game: '🎮', recording: '🎤' };
  var GAMES = [
    { id: 'kagirdi', ico: '🎧' },
    { id: 'judek', ico: '💃', href: 'judek.html' },
    { id: 'orkestras', ico: '🎼', href: 'orkestras.html' },
    { id: 'orkestras2', ico: '🦁', href: 'orkestras2.html' },
    { id: 'ritmas', ico: '🥁', href: 'ritmas.html' },
    { id: 'melodija', ico: '🎵', href: 'melodija.html' },
    { id: 'klausa', ico: '👂', href: 'klausa.html' },
    { id: 'lasas', ico: '💧', href: 'lasas.html' },
    { id: 'gyvunai', ico: '🐄', href: 'gyvunai.html' },
    { id: 'atmintis', ico: '🧠', href: 'atmintis.html' }
  ];
  function gameOf(id) { return GAMES.filter(function (g) { return g.id === id; })[0] || GAMES[0]; }

  function newBlock(type) {
    var b = { id: uid(), type: type, text: '' };
    if (type === 'notes') { b.mode = 'melody'; b.notes = ['C4', 'D4', 'E4']; b.names = true; b.check = true; }
    if (type === 'rhythm') { b.meter = 4; b.accent = false; b.pattern = ['q', 'q', 'ee', 'q']; }
    if (type === 'piano') { b.notes = ['C4', 'E4', 'G4']; b.show = true; }
    if (type === 'listening') {
      b.options = [{ type: 'rhythm', meter: 4, pattern: ['q', 'q', 'q', 'q'] }, { type: 'rhythm', meter: 4, pattern: ['ee', 'ee', 'ee', 'ee'] }];
      b.answer = 0; b.random = false;
    }
    if (type === 'task') { b.choices = ['', '']; b.answer = 0; }
    if (type === 'game') {
      b.game = 'kagirdi'; b.rounds = 5;
      b.pool = [{ type: 'rhythm', meter: 4, pattern: ['q', 'q', 'q', 'q'] }, { type: 'rhythm', meter: 4, pattern: ['ee', 'ee', 'ee', 'ee'] },
        { type: 'rhythm', meter: 4, pattern: ['q', 'ee', 'q', 'ee'] }];
    }
    if (type === 'recording') { b.seconds = 30; }
    if (type === 'audio' || type === 'video' || type === 'image') { b.url = ''; }
    return b;
  }

  // A MUSICATION I step (solfedzioData presets) as a block.
  function fromStep(st) {
    var b = { id: uid(), text: st.text || '' };
    if (st.type === 'rhythm') { b.type = 'rhythm'; b.pattern = st.pattern.slice(); b.meter = st.meter || 4; b.accent = !!st.accent; }
    else if (st.type === 'melody') { b.type = 'notes'; b.mode = 'melody'; b.notes = st.notes.slice(); b.names = true; b.check = true; }
    else if (st.type === 'lines') { b.type = 'notes'; b.mode = 'lines'; }
    else if (st.type === 'clef') { b.type = 'notes'; b.mode = 'clef'; b.clef = st.clef; }
    else if (st.type === 'clefs') {
      b.type = 'listening'; b.random = true; b.answer = 0;
      b.options = [{ type: 'clef', clef: 'treble' }, { type: 'clef', clef: 'bass' }];
    }
    return b;
  }
  function itemFromStep(st) {
    if (st.type === 'rhythm') { return { type: 'rhythm', pattern: st.pattern.slice(), meter: st.meter || 4 }; }
    if (st.type === 'melody') { return { type: 'melody', notes: st.notes.slice() }; }
    if (st.type === 'clef') { return { type: 'clef', clef: st.clef }; }
    return null;
  }

  // Which results column a block counts in (null: not scored).
  function areaOf(b) {
    if (!b) { return null; }
    if (b.type === 'rhythm') { return 'rhythm'; }
    if (b.type === 'notes') { return b.mode === 'melody' && b.check ? 'notes' : null; }
    if (b.type === 'piano') { return 'piano'; }
    if (b.type === 'listening') { return 'listening'; }
    if (b.type === 'task') { return 'other'; }
    if (b.type === 'game') { return b.game === 'kagirdi' ? 'listening' : null; }
    return null;
  }

  // ───────────────────────────── Sound ─────────────────────────────
  var actx = null;
  function ac() {
    if (!actx) { actx = new (global.AudioContext || global.webkitAudioContext)(); }
    if (actx.state !== 'running') { actx.resume(); }
    return actx;
  }
  var STEP_OF = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function freq(n) {
    var m = /^([A-G])(#?)(\d)$/.exec(n);
    var midi = 12 * (+m[3] + 1) + STEP_OF[m[1]] + (m[2] ? 1 : 0);
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  var timers = [], voices = [];
  function later(fn, ms) { var x = setTimeout(fn, ms); timers.push(x); return x; }
  function stopAll() {
    timers.forEach(clearTimeout); timers = [];
    voices.forEach(function (v) { try { v.stop(); } catch (e) {} }); voices = [];
  }
  function tone(f, at, dur, o) {
    o = o || {};
    var c = ac(), tt = c.currentTime + (at || 0), peak = o.gain || 0.3;
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, tt);
    g.gain.exponentialRampToValueAtTime(peak, tt + 0.015);
    if (o.sustain && dur > 0.3) {
      g.gain.exponentialRampToValueAtTime(peak * 0.6, tt + 0.15);
      g.gain.setValueAtTime(peak * 0.6, tt + dur - 0.08);
    }
    g.gain.exponentialRampToValueAtTime(0.0001, tt + dur);
    g.connect(c.destination);
    [['triangle', 1, 1], ['sine', 2, 0.22]].forEach(function (p) {
      var os = c.createOscillator(), pg = c.createGain();
      os.type = p[0]; os.frequency.value = f * p[1]; pg.gain.value = p[2];
      os.connect(pg); pg.connect(g); os.start(tt); os.stop(tt + dur + 0.05);
      voices.push(os);
    });
  }
  function drum(at, gain) {
    var c = ac(), tt = c.currentTime + (at || 0);
    var os = c.createOscillator(), g = c.createGain();
    os.type = 'sine';
    os.frequency.setValueAtTime(180, tt); os.frequency.exponentialRampToValueAtTime(60, tt + 0.18);
    g.gain.setValueAtTime(gain || 0.6, tt); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.25);
    os.connect(g); g.connect(c.destination); os.start(tt); os.stop(tt + 0.3);
    var len = Math.floor(c.sampleRate * 0.06), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) { d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    var src = c.createBufferSource(), ng = c.createGain();
    src.buffer = buf; ng.gain.value = (gain || 0.6) * 0.5;
    src.connect(ng); ng.connect(c.destination); src.start(tt);
    voices.push(os);
  }
  function tick(at, strong) {
    var c = ac(), tt = c.currentTime + (at || 0);
    var os = c.createOscillator(), g = c.createGain();
    os.frequency.value = strong ? 1500 : 1000;
    g.gain.setValueAtTime(strong ? 0.12 : 0.06, tt); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.06);
    os.connect(g); g.connect(c.destination); os.start(tt); os.stop(tt + 0.08);
    voices.push(os);
  }
  function happy() { ['C5', 'E5', 'G5', 'C6'].forEach(function (n, i) { tone(freq(n), i * 0.09, 0.5, { gain: 0.22 }); }); }
  function soft() { tone(freq('E4'), 0, 0.35, { gain: 0.15 }); tone(freq('D4'), 0.18, 0.5, { gain: 0.15 }); }

  // Three speeds a child understands (shared with solfedzis.html).
  var TEMPI = [60, 80, 104], TEMPO_KEY = 'musication.solf.tempo', tempoI = 1;
  try { var tv = localStorage.getItem(TEMPO_KEY); if (tv === '0' || tv === '1' || tv === '2') { tempoI = +tv; } } catch (e) {}
  function beatSec() { return 60 / TEMPI[tempoI]; }

  // ───────────────────────────── Rhythm and notes ─────────────────────────────
  function events(pattern) {
    var out = [], b = 0;
    pattern.forEach(function (tk, ti) {
      var ps = 0;
      TOK[tk].parts.forEach(function (p) {
        out.push({ t: ti, i: out.length, start: b + ps, dur: p[0], sound: !!p[1] });
        ps += p[0];
      });
      b += TOK[tk].beats;
    });
    return out;
  }
  function beatsOf(pattern) { return pattern.reduce(function (s, tk) { return s + TOK[tk].beats; }, 0); }
  function keyOf(n) { return KEYS.filter(function (k) { return k.n === n; })[0] || { n: n, name: n.replace(/\d/, ''), c: '#ccc' }; }
  function noteName(n) { return keyOf(n).name; }
  function syllables(pattern) { return pattern.map(function (tk) { return TOK[tk].syl; }).join('  '); }

  // ───────────────────────────── Drawings (SVG) ─────────────────────────────
  var BW = 160, PADL = 50, LY = 112, STEM_TOP = 34;
  function partSvg(e, x) {
    var s = '<g class="nt" data-i="' + e.i + '">';
    var endX = PADL + (e.start + e.dur) * BW - 22;
    if (e.sound) {
      if (e.dur >= 2) { s += '<rect class="hold" x="' + (x + 18) + '" y="' + (LY - 7) + '" width="' + (endX - x - 18) + '" height="14" rx="7"/>'; }
      var hollow = e.dur >= 2;
      s += '<ellipse cx="' + x + '" cy="' + LY + '" rx="17" ry="12" transform="rotate(-22 ' + x + ' ' + LY + ')"' +
        (hollow ? ' fill="#fffdf6" stroke-width="5"' : ' stroke-width="0"') + '/>';
      if (e.dur < 4) { s += '<rect x="' + (x + 12) + '" y="' + STEM_TOP + '" width="5" height="' + (LY - 4 - STEM_TOP) + '" stroke-width="0"/>'; }
    } else {
      if (e.dur >= 2) { s += '<line class="hold r" x1="' + (x + 30) + '" y1="' + (LY + 30) + '" x2="' + endX + '" y2="' + (LY + 30) + '"/>'; }
      var glyph = { 1: '', 0.5: '', 2: '', 4: '' }[e.dur];
      s += '<text class="rest" x="' + x + '" y="' + LY + '" font-size="80">' + glyph + '</text>';
    }
    return s + '</g>';
  }
  function rhythmSvg(pattern, meter, o) {
    o = o || {};
    meter = meter || 4;
    var total = beatsOf(pattern), W = PADL * 2 + Math.max(1, total) * BW, H = o.beats ? 238 : 190;
    var ev = events(pattern), s = '';
    s += '<rect class="ln" x="' + (PADL - 30) + '" y="' + (LY - 2) + '" width="' + (total * BW + 60) + '" height="4"/>';
    var bars = [];
    for (var b = 0; b <= total; b += meter) { bars.push(b); }
    if (bars[bars.length - 1] !== total) { bars.push(total); }
    bars.forEach(function (x) { s += '<rect class="bar" x="' + (PADL + x * BW - 2) + '" y="' + (LY - 36) + '" width="4" height="72"/>'; });
    var start = 0;
    pattern.forEach(function (tk, ti) {
      var parts = ev.filter(function (e) { return e.t === ti; });
      var xs = parts.map(function (e) { return PADL + (start + 0.22 + (e.start - start) * 0.75) * BW; });
      s += '<g class="tk" data-t="' + ti + '">';
      parts.forEach(function (e, k) { s += partSvg(e, xs[k]); });
      if (tk === 'ee' || tk === 's4') {
        var x1 = xs[0] + 12, x2 = xs[xs.length - 1] + 17;
        s += '<rect class="beam" x="' + x1 + '" y="' + STEM_TOP + '" width="' + (x2 - x1) + '" height="11"/>';
        if (tk === 's4') { s += '<rect class="beam" x="' + x1 + '" y="' + (STEM_TOP + 19) + '" width="' + (x2 - x1) + '" height="10"/>'; }
      }
      if (tk === 'eR' || tk === 'Re') {
        var fx = xs[tk === 'eR' ? 0 : 1] + 17;
        s += '<path class="beam" d="M' + fx + ' ' + STEM_TOP + ' c 2 20 30 26 24 58 c 0 -22 -14 -30 -24 -34 z"/>';
      }
      var cx = xs.reduce(function (a, x) { return a + x; }, 0) / xs.length + 6;
      var silent = parts.every(function (e) { return !e.sound; });
      if (!o.noSyl) { s += '<text class="syl' + (silent ? ' r' : '') + '" x="' + cx + '" y="' + (LY + 66) + '">' + TOK[tk].syl + '</text>'; }
      s += '</g>';
      start += TOK[tk].beats;
    });
    if (o.beats) {
      for (var k = 0; k < total; k++) {
        var bx = PADL + (k + 0.25) * BW;
        s += '<g class="bt' + (k % meter === 0 ? ' strong' : '') + '" data-b="' + k + '"><circle cx="' + bx + '" cy="' + (LY + 106) + '" r="17"/>' +
          '<text x="' + bx + '" y="' + (LY + 113) + '">' + (k % meter + 1) + '</text></g>';
      }
    }
    return '<svg class="mus" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
  }
  function staffIdx(n) {
    var m = /^([A-G])#?(\d)$/.exec(n);
    return (+m[2]) * 7 + 'CDEFGAB'.indexOf(m[1]) - (4 * 7 + 2);
  }
  function melodySvg(notes, o) {
    o = o || {};
    var sp = 18, bot = 140, NW = 118, X0 = 150;
    var W = X0 + Math.max(1, notes.length) * NW + 30, H = o.noNames ? 200 : 250, s = '';
    for (var i = 0; i < 5; i++) { s += '<rect class="ln" x="16" y="' + (bot - i * sp - 1.5) + '" width="' + (W - 32) + '" height="3"/>'; }
    s += '<rect class="bar" x="' + (W - 22) + '" y="' + (bot - 4 * sp - 1.5) + '" width="5" height="' + (4 * sp + 3) + '"/>';
    s += '<text class="clef" x="30" y="' + (bot - sp) + '" font-size="' + (sp * 4) + '"></text>';
    notes.forEach(function (n, j) {
      var k = keyOf(n), idx = staffIdx(n), x = X0 + j * NW + NW / 2 - 20, y = bot - idx * sp / 2;
      s += '<g class="nt" data-i="' + j + '">';
      for (var l = -2; l >= idx; l -= 2) { s += '<rect class="ln" x="' + (x - 24) + '" y="' + (bot - l * sp / 2 - 1.5) + '" width="48" height="3"/>'; }
      for (var u = 10; u <= idx; u += 2) { s += '<rect class="ln" x="' + (x - 24) + '" y="' + (bot - u * sp / 2 - 1.5) + '" width="48" height="3"/>'; }
      if (idx < 4) { s += '<rect x="' + (x + 10) + '" y="' + (y - 62) + '" width="4" height="62" stroke-width="0"/>'; }
      else { s += '<rect x="' + (x - 14) + '" y="' + y + '" width="4" height="62" stroke-width="0"/>'; }
      s += '<ellipse cx="' + x + '" cy="' + y + '" rx="13" ry="9.5" transform="rotate(-22 ' + x + ' ' + y + ')" fill="' + (o.mono ? '#14142b' : k.c) + '" stroke-width="2.5"/>';
      if (!o.noNames) {
        s += '<rect x="' + (x - 32) + '" y="208" width="64" height="34" rx="12" fill="' + k.c + '" stroke-width="0"/>' +
          '<text class="nlab" x="' + x + '" y="233" fill="' + (k.light ? '#fff' : '#1b2a6b') + '">' + k.name + '</text>';
      }
      s += '</g>';
    });
    return '<svg class="mus mel" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
  }
  var LINE_COLORS = ['#f25757', '#f7932f', '#4cc36b', '#3a74e6', '#b06ae3'];
  function linesSvg() {
    var sp = 34, bot = 196, s = '';
    for (var l = 1; l <= 5; l++) {
      var y = bot - (l - 1) * sp;
      s += '<g class="ln-g" data-l="' + l + '" style="--lc:' + LINE_COLORS[l - 1] + '">' +
        '<rect x="30" y="' + (y - 16) + '" width="900" height="32" fill="transparent"/>' +
        '<rect class="vis" x="60" y="' + (y - 3) + '" width="820" height="6" rx="3"/>' +
        '<g class="num"><circle cx="925" cy="' + y + '" r="16" fill="' + LINE_COLORS[l - 1] + '"/><text x="925" y="' + (y + 9) + '">' + l + '</text></g></g>';
    }
    return '<svg class="mus lines" viewBox="0 0 1000 230" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
  }
  function clefSvg(clef, o) {
    o = o || {};
    var sp = 24, bot = 170, W = o.w || 640, s = '';
    for (var i = 0; i < 5; i++) { s += '<rect class="ln" x="20" y="' + (bot - i * sp - 1.5) + '" width="' + (W - 40) + '" height="3"/>'; }
    var y = clef === 'treble' ? bot - sp : bot - 3 * sp;
    s += '<text class="clef clefg" x="44" y="' + y + '" font-size="' + (sp * 4) + '">' + (clef === 'treble' ? '' : '') + '</text>';
    if (!o.bare) { s += '<text class="syl" x="' + (W / 2 + 60) + '" y="' + (bot + 52) + '">' + esc(t(clef === 'treble' ? 'e.treble' : 'e.bass')) + '</text>'; }
    return '<svg class="mus" viewBox="0 0 ' + W + ' ' + (o.bare ? 200 : 236) + '" xmlns="http://www.w3.org/2000/svg">' + s + '</svg>';
  }
  var CLEF_TUNE = { treble: ['C5', 'E5', 'G5', 'C6', 'G5'], bass: ['C3', 'G2', 'E2', 'C2', 'G2'] };

  function itemSvg(it, o) {
    o = o || {};
    if (it.type === 'rhythm') { return rhythmSvg(it.pattern, it.meter, { noSyl: o.noSyl }); }
    if (it.type === 'melody') { return melodySvg(it.notes, { noNames: o.noNames !== false }); }
    if (it.type === 'clef') { return clefSvg(it.clef, { bare: true, w: 300 }); }
    return '';
  }
  function itemLabel(it) {
    if (!it) { return '—'; }
    if (it.type === 'rhythm') { return syllables(it.pattern); }
    if (it.type === 'melody') { return it.notes.map(noteName).join(' '); }
    if (it.type === 'clef') { return t(it.clef === 'treble' ? 'e.high' : 'e.low'); }
    return '';
  }

  // ───────────────────────────── Summaries ─────────────────────────────
  function typeName(type) { return t('bt.' + type); }
  function summary(b) {
    var x;
    switch (b.type) {
      case 'text': x = (b.text || '').replace(/\s+/g, ' '); return x.length > 90 ? x.slice(0, 88) + '…' : x;
      case 'notes':
        if (b.mode === 'lines') { return t('sum.lines'); }
        if (b.mode === 'clef') { return t(b.clef === 'bass' ? 'e.bass' : 'e.treble'); }
        return (b.notes || []).map(noteName).join(' – ');
      case 'rhythm': return syllables(b.pattern || []) + ' · ' + t('sum.meter', { n: b.meter || 4 });
      case 'piano': return (b.notes || []).map(noteName).join(' – ');
      case 'listening': return t('sum.options', { n: (b.options || []).length });
      case 'task': return b.text || '';
      case 'game': return t('game.' + (b.game || 'kagirdi'));
      case 'recording': return t('sum.rec', { s: b.seconds || 30 });
      default: return b.url ? decodeURIComponent(String(b.url).split('/').pop().split('?')[0]).slice(0, 60) : t('sum.nofile');
    }
  }
  function thumb(b) {
    if (b.type === 'rhythm') { return rhythmSvg(b.pattern || [], b.meter); }
    if (b.type === 'notes' && b.mode === 'melody') { return melodySvg(b.notes || [], { noNames: true }); }
    if (b.type === 'notes' && b.mode === 'lines') { return linesSvg(); }
    if (b.type === 'notes' && b.mode === 'clef') { return clefSvg(b.clef, { bare: true }); }
    if (b.type === 'image' && b.url) { return '<img src="' + esc(b.url) + '" alt="">'; }
    return '<span style="font-size:34px">' + (b.type === 'game' ? gameOf(b.game).ico : ICO[b.type]) + '</span>';
  }

  // A result's error place, in words for the teacher.
  function errorText(e) {
    if (!e) { return ''; }
    if (e.what === 'time') { return t('err.time', { bar: e.bar, beat: e.beat }); }
    if (e.what === 'few') { return t('err.few', { n: e.n }); }
    if (e.what === 'many') { return t('err.many', { n: e.n }); }
    if (e.pos) { return e.got ? t('err.note', { pos: e.pos, got: noteName(e.got), exp: noteName(e.expected) }) : t('err.noteMissing', { pos: e.pos, exp: noteName(e.expected) }); }
    if (e.round) { return t('err.round', { n: e.round, exp: e.expected || '' }); }
    if (e.chosen !== undefined) { return t('err.choice', { got: e.chosen, exp: e.expected }); }
    return '';
  }

  function youtubeId(url) {
    var m = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(url || '');
    return m ? m[1] : null;
  }

  // ───────────────────────────── Player ─────────────────────────────
  var AGE_TOL = 0.33;   // how far (part of a beat) a 5–7 year old's clap may miss
  var PC_KEYS = { a: 'C4', s: 'D4', d: 'E4', f: 'F4', g: 'G4', h: 'A4', j: 'B4', k: 'C5', w: 'C#4', e: 'D#4', t: 'F#4', y: 'G#4', u: 'A#4' };

  function player(el, blocks, opts) {
    opts = opts || {};
    blocks = blocks || [];
    var cur = 0, reach = 0, attempt = null, finished = false;
    var done = blocks.map(function () { return false; });
    var best = {}, reported = {}, startedAt = {};
    var bottomKind = '', listenFn = null, tryFn = null, round = null, rec = null;

    el.innerHTML =
      '<div class="le">' +
      '<div class="le-top"><div class="le-rail"></div><div class="le-pill"></div></div>' +
      '<div class="le-name"></div>' +
      '<div class="le-box le-explain"></div>' +
      '<div class="le-box le-stage"></div>' +
      '<div class="le-controls">' +
        '<div class="le-cbtn" data-w="listen"><button class="le-rbtn" data-act="listen">🎧</button><span>' + esc(t('e.listen')) + '</span></div>' +
        '<div class="le-cbtn" data-w="try"><button class="le-rbtn red" data-act="try">🔄</button><span class="le-tryl"></span></div>' +
        '<div class="le-box le-tempo" data-w="tempo"><span class="ani" data-t="0">🐌</span><div class="mid">' +
          '<input type="range" min="0" max="2" step="1" aria-label="' + esc(t('e.tempo')) + '"><div class="names">' +
          [0, 1, 2].map(function (i) { return '<button data-t="' + i + '">' + esc(t('e.tempo' + i)) + '</button>'; }).join('') +
          '</div></div><span class="ani" data-t="2">🐇</span></div>' +
        '<button class="le-next" data-act="next"></button>' +
      '</div>' +
      '<div class="le-bottom"></div>' +
      '</div>';
    var root = el.firstChild;
    function q(s) { return root.querySelector(s); }
    var stage = q('.le-stage'), explain = q('.le-explain');
    var bubbleEl = document.createElement('div');
    bubbleEl.className = 'le-bubble';
    var bubbleT = null;

    function bubble(text, kind, ms) {
      if (bubbleEl.parentNode !== stage) { stage.appendChild(bubbleEl); }
      bubbleEl.textContent = text;
      bubbleEl.className = 'le-bubble ' + (kind || '');
      void bubbleEl.offsetWidth;
      bubbleEl.classList.add('show');
      clearTimeout(bubbleT);
      if (ms !== 0) { bubbleT = setTimeout(hideBubble, ms || 2200); }
    }
    function hideBubble() { clearTimeout(bubbleT); bubbleEl.classList.remove('show'); }
    function confetti() {
      var ico = ['⭐', '🌟', '✨', '🎵', '🎶'];
      for (var i = 0; i < 14; i++) {
        var c = document.createElement('span');
        c.className = 'le-confetti';
        c.textContent = ico[i % ico.length];
        c.style.left = (40 + Math.random() * 20) + '%';
        c.style.top = (35 + Math.random() * 20) + '%';
        c.style.setProperty('--dx', (Math.random() * 600 - 300) + 'px');
        c.style.setProperty('--dy', (Math.random() * -220 - 40) + 'px');
        stage.appendChild(c);
        setTimeout(function (x) { x.remove(); }.bind(null, c), 1200);
      }
    }
    function markDone() {
      done[cur] = true;
      renderRail();
      q('.le-next').classList.add('ready');
    }
    function praise(msg) { bubble('⭐ ' + (msg || t('e.great')), 'good'); happy(); confetti(); markDone(); }
    function encourage(msg) { bubble('🙂 ' + (msg || t('e.tryAgain')), 'soft', 2600); soft(); }

    // A judged try. The best try of a block is what gets reported.
    function record(score, errors) {
      var b = blocks[cur], area = areaOf(b);
      if (!area || opts.mode === 'preview') { return; }
      var prev = best[b.id], tries = (prev ? prev.tries : 0) + 1;
      if (!prev || score >= prev.score) {
        best[b.id] = { score: Math.round(score * 1000) / 1000, errors: errors || [], area: area, tries: tries, startedAt: startedAt[b.id] };
      } else { prev.tries = tries; }
      reported[b.id] = false;
      if (opts.onTry) { opts.onTry(b, best[b.id]); }
    }
    function flush(i) {
      var b = blocks[i];
      if (b && best[b.id] && !reported[b.id]) {
        reported[b.id] = true;
        if (opts.onBlockDone) { opts.onBlockDone(b, best[b.id], i); }
      }
    }

    // ── Highlighting ──
    function clearMarks() { stage.querySelectorAll('.nt, .tk, .bt').forEach(function (x) { x.classList.remove('on', 'hit', 'ok', 'off'); }); }
    function setOn(i) {
      stage.querySelectorAll('.nt.on, .tk.on').forEach(function (x) { x.classList.remove('on'); });
      if (i == null) { return; }
      var nt = stage.querySelector('.nt[data-i="' + i + '"]');
      if (nt) { nt.classList.add('on'); var tk = nt.closest('.tk'); if (tk) { tk.classList.add('on'); } }
    }
    function setBeat(b) {
      stage.querySelectorAll('.bt.on').forEach(function (x) { x.classList.remove('on'); });
      var x = b == null ? null : stage.querySelector('.bt[data-b="' + b + '"]');
      if (x) { x.classList.add('on'); }
    }

    // ── Playback ──
    function playRhythm(it, highlight, onDone) {
      stopAll();
      var ev = events(it.pattern), beat = beatSec(), meter = it.meter || 4, total = beatsOf(it.pattern), lead = 0.15;
      ev.forEach(function (e) {
        var strong = it.accent && e.start % meter === 0;
        if (e.sound) { tone(freq('G4'), lead + e.start * beat, Math.max(0.14, e.dur * beat * 0.9), { sustain: true, gain: strong ? 0.34 : 0.24 }); }
        if (highlight) { later(function () { setOn(e.i); }, (lead + e.start * beat) * 1000); }
      });
      for (var b = 0; b < total; b++) {
        if (it.accent && b % meter === 0) { drum(lead + b * beat, 0.45); } else { tick(lead + b * beat, false); }
        if (highlight && it.accent) { (function (x) { later(function () { setBeat(x); }, (lead + x * beat) * 1000); })(b); }
      }
      later(function () { if (highlight) { setOn(null); setBeat(null); } if (onDone) { onDone(); } }, (lead + total * beat) * 1000 + 150);
    }
    function playMelody(notes, highlight, keys, onDone) {
      stopAll();
      var beat = beatSec(), lead = 0.15;
      notes.forEach(function (n, i) {
        tone(freq(n), lead + i * beat, Math.max(0.5, beat * 1.1), { gain: 0.3 });
        later(function () { if (highlight) { setOn(i); } if (keys) { flashKey(n, beat * 800); } }, (lead + i * beat) * 1000);
      });
      later(function () { if (highlight) { setOn(null); } if (onDone) { onDone(); } }, (lead + notes.length * beat) * 1000 + 150);
    }
    function playClefTune(clef, onDone) {
      stopAll();
      var gap = beatSec() * 0.6;
      CLEF_TUNE[clef].forEach(function (n, i) { tone(freq(n), 0.1 + i * gap, 0.7, { gain: clef === 'bass' ? 0.4 : 0.25 }); });
      later(function () { if (onDone) { onDone(); } }, (0.1 + CLEF_TUNE[clef].length * gap) * 1000 + 300);
    }
    function playItem(it) {
      if (it.type === 'rhythm') { playRhythm(it, false); }
      else if (it.type === 'melody') { playMelody(it.notes, false, false); }
      else if (it.type === 'clef') { playClefTune(it.clef); }
    }

    // ── Bottom: piano or rhythm pad ──
    function renderBottom(kind) {
      if (kind === bottomKind) { return; }
      bottomKind = kind;
      var box = q('.le-bottom');
      if (!kind) { box.innerHTML = ''; return; }
      if (kind === 'pad') {
        box.innerHTML = '<button class="le-pad"><span class="ico">🥁</span><span>' + esc(t('e.tapHere')) + '<small>' + esc(t('e.orSpace')) + '</small></span></button>';
        box.firstChild.addEventListener('pointerdown', function (e) { e.preventDefault(); tapPad(); });
        return;
      }
      var h = '<div class="le-piano"><div class="le-keys">';
      KEYS.forEach(function (k) {
        h += '<button class="le-wk' + (k.light ? ' light' : '') + '" data-n="' + k.n + '" style="--k:' + k.c + '" aria-label="' + k.name + '">' +
          '<span class="ico">' + k.ico + '</span><span class="nm">' + k.name + '</span></button>';
      });
      BLACK.forEach(function (b) {
        h += '<button class="le-bk" data-n="' + b.n + '" style="left:calc(' + (b.after + 1) + ' * (100% - 42px) / 8 + ' + (b.after * 6 + 3) + 'px)" aria-label="' + b.n + '"></button>';
      });
      box.innerHTML = h + '</div></div>';
      box.querySelectorAll('[data-n]').forEach(function (k) {
        k.addEventListener('pointerdown', function (e) { e.preventDefault(); pressKey(k.dataset.n); });
      });
    }
    function flashKey(n, ms) {
      var k = q('.le-bottom [data-n="' + n + '"]');
      if (!k) { return; }
      k.classList.add('down');
      setTimeout(function () { k.classList.remove('down'); }, ms || 180);
    }
    function pressKey(n) {
      tone(freq(n), 0, 1.1, { gain: 0.32 });
      flashKey(n);
      var b = blocks[cur];
      if (finished || !b) { return; }
      // A key press on a playing block starts a try by itself.
      if (!attempt && (b.type === 'piano' || (b.type === 'notes' && b.mode === 'melody' && b.check))) { startMelodyAttempt(true); }
      if (attempt && attempt.kind === 'melody') { melodyPress(n); }
    }
    function tapPad() {
      drum(0, 0.6);
      var p = q('.le-pad');
      if (p) { p.classList.add('down'); setTimeout(function () { p.classList.remove('down'); }, 110); }
      if (attempt && attempt.kind === 'rhythm') { rhythmTap(); }
    }
    function onKey(e) {
      if (!root.isConnected || !root.offsetParent || e.repeat || e.ctrlKey || e.metaKey || e.altKey) { return; }
      var tag = (e.target && e.target.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag) || (e.target && e.target.isContentEditable)) { return; }
      if (e.key === ' ' && bottomKind === 'pad') { e.preventDefault(); if (document.activeElement) { document.activeElement.blur(); } tapPad(); }
      else if (PC_KEYS[e.key] && bottomKind === 'piano') { pressKey(PC_KEYS[e.key]); }
    }
    document.addEventListener('keydown', onKey);

    // ── Rhythm try: count-in, claps, then a forgiving check ──
    function startRhythmAttempt() {
      stopAll(); clearMarks(); hideBubble();
      var b = blocks[cur], beat = beatSec(), a = { kind: 'rhythm', taps: [], open: false, ev: events(b.pattern), meter: b.meter || 4 };
      a.sounds = a.ev.filter(function (e) { return e.sound; });
      attempt = a;
      for (var k = 0; k < 4; k++) {
        (function (x) {
          tick(0.1 + x * beat, x === 0);
          later(function () { bubble(String(x + 1), 'count', 0); }, (0.1 + x * beat) * 1000);
        })(k);
      }
      later(function () { a.open = true; bubble('👏 ' + t('e.yourTurn'), 'count', 900); }, (0.1 + 3.6 * beat) * 1000);
      a.idle = later(function () { if (attempt === a && !a.taps.length) { attempt = null; encourage(t('e.tapWhen')); } }, (0.1 + 4 * beat) * 1000 + 5000);
    }
    function rhythmTap() {
      var a = attempt;
      if (!a.open) { return; }
      a.taps.push(performance.now() / 1000);
      var e = a.sounds[a.taps.length - 1];
      if (e) { var x = stage.querySelector('.nt[data-i="' + e.i + '"]'); if (x) { x.classList.add('hit'); } }
      clearTimeout(a.idle);
      if (a.taps.length >= a.sounds.length) { finishRhythm(a); return; }
      var beat = beatSec(), gap = 1;
      for (var i = 1; i < a.sounds.length; i++) { gap = Math.max(gap, a.sounds[i].start - a.sounds[i - 1].start); }
      a.idle = setTimeout(function () { if (attempt === a) { finishRhythm(a); } }, (gap + 1.5) * beat * 1300);
    }
    // First the number of claps, only then their timing (aligned on the
    // first clap and stretched a little, so a slightly slower child passes).
    function judgeRhythm(sounds, taps, beat) {
      var n = sounds.length;
      if (taps.length !== n) { return { ok: false, why: taps.length < n ? 'few' : 'many' }; }
      var exp = sounds.map(function (e) { return e.start * beat; });
      var scale = 1;
      if (n > 1 && exp[n - 1] > exp[0]) { scale = Math.min(1.25, Math.max(0.8, (taps[n - 1] - taps[0]) / (exp[n - 1] - exp[0]))); }
      var res = [], bad = 0;
      for (var i = 0; i < n; i++) {
        var d = Math.abs((taps[i] - taps[0]) - (exp[i] - exp[0]) * scale);
        var gap = Math.min(i > 0 ? exp[i] - exp[i - 1] : Infinity, i < n - 1 ? exp[i + 1] - exp[i] : Infinity);
        var tol = Math.max(0.08, Math.min(AGE_TOL * beat, 0.45 * gap));
        res.push(d <= tol);
        if (d > tol) { bad++; }
      }
      return { ok: bad <= Math.floor(n / 6), marks: res, why: 'time' };
    }
    function finishRhythm(a) {
      attempt = null;
      clearTimeout(a.idle);
      var r = judgeRhythm(a.sounds, a.taps, beatSec()), n = a.sounds.length;
      a.sounds.forEach(function (e, i) {
        var x = stage.querySelector('.nt[data-i="' + e.i + '"]');
        if (!x) { return; }
        x.classList.remove('hit');
        if (r.marks) { x.classList.add(r.marks[i] ? 'ok' : 'off'); } else if (i < a.taps.length) { x.classList.add('ok'); }
      });
      if (r.marks) {
        var errs = [];
        a.sounds.forEach(function (e, i) {
          if (!r.marks[i]) { errs.push({ what: 'time', bar: Math.floor(e.start / a.meter) + 1, beat: Math.round((e.start % a.meter + 1) * 100) / 100 }); }
        });
        record(n ? (n - errs.length) / n : 1, errs);
      } else {
        var diff = Math.abs(a.taps.length - n);
        record(Math.max(0, 1 - diff / Math.max(1, n)) * 0.5, [{ what: r.why, n: diff }]);
      }
      if (r.ok) { praise(); }
      else if (r.why === 'few') { encourage(t('e.missing', { n: n - a.taps.length })); }
      else { encourage(t('e.almost')); }
    }

    // ── Melody try: the same keys in the same order ──
    function startMelodyAttempt(silent) {
      stopAll(); clearMarks();
      var b = blocks[cur];
      attempt = { kind: 'melody', presses: [], times: [], notes: b.notes };
      if (b.type === 'piano') { renderDots(); }
      if (!silent) { bubble('🎹 ' + t('e.yourTurnPlay'), 'count', 1400); }
      var a = attempt;
      a.idle = later(function () { if (attempt === a && !a.presses.length) { attempt = null; encourage(t('e.pressKeys')); } }, 8000);
    }
    function renderDots() {
      var b = blocks[cur];
      stage.innerHTML = '<div class="le-col"><div class="le-dots">' + b.notes.map(function () { return '<span></span>'; }).join('') + '</div></div>';
      stage.appendChild(bubbleEl);
    }
    function melodyPress(n) {
      var a = attempt, i = a.presses.length, b = blocks[cur];
      a.presses.push(n); a.times.push(performance.now() / 1000);
      if (b.type === 'piano') {
        var dot = stage.querySelectorAll('.le-dots span')[i];
        if (dot) { var k = keyOf(n); dot.classList.add('filled'); dot.style.background = k.c; dot.style.color = k.light ? '#fff' : ''; dot.textContent = k.name; }
      } else {
        var x = stage.querySelector('.nt[data-i="' + i + '"]');
        if (x) { x.classList.add(n === a.notes[i] ? 'hit' : 'off'); }
      }
      clearTimeout(a.idle);
      if (a.presses.length >= a.notes.length) { finishMelody(a); return; }
      a.idle = setTimeout(function () { if (attempt === a) { finishMelody(a); } }, 6000);
    }
    function finishMelody(a) {
      attempt = null;
      clearTimeout(a.idle);
      var b = blocks[cur], good = 0, errs = [];
      a.notes.forEach(function (n, i) {
        var p = a.presses[i];
        if (p === n) { good++; } else { errs.push({ pos: i + 1, expected: n, got: p || null }); }
      });
      if (b.type === 'piano') {
        stage.querySelectorAll('.le-dots span').forEach(function (d, i) { if (i < a.presses.length) { d.classList.add(a.presses[i] === a.notes[i] ? 'good' : 'bad'); } });
      } else {
        stage.querySelectorAll('.nt').forEach(function (x, i) {
          x.classList.remove('hit');
          if (i < a.presses.length) { x.classList.add(a.presses[i] === a.notes[i] ? 'ok' : 'off'); }
        });
      }
      record(a.notes.length ? good / a.notes.length : 1, errs);
      if (errs.length) {
        encourage(a.presses.length < a.notes.length ? t('e.notAll') : t('e.tryListen'));
        return;
      }
      var iv = [];
      for (var i = 1; i < a.times.length; i++) { iv.push(a.times[i] - a.times[i - 1]); }
      var even = !iv.length || (Math.max.apply(null, iv) / Math.min.apply(null, iv) <= 2.2 &&
        iv.reduce(function (s, x) { return s + x; }, 0) / iv.length < beatSec() * 2.2);
      praise(even ? t('e.great') : t('e.notesRight'));
    }

    // ── Staff lines and clefs ──
    function bindLines() {
      var count = 0;
      stage.querySelectorAll('.ln-g').forEach(function (g) {
        g.addEventListener('pointerdown', function () {
          var l = +g.dataset.l;
          tone(freq(['E4', 'G4', 'B4', 'D5', 'F5'][l - 1]), 0, 0.8, { gain: 0.28 });
          if (g.classList.contains('counted')) { return; }
          g.classList.add('counted');
          count++;
          if (count === 5) { setTimeout(function () { praise(t('e.fiveLines')); }, 300); }
        });
      });
    }
    function demoLines() {
      stopAll();
      var beat = beatSec();
      stage.querySelectorAll('.ln-g').forEach(function (g) { g.classList.remove('counted', 'on'); });
      [1, 2, 3, 4, 5].forEach(function (l, i) {
        tone(freq(['E4', 'G4', 'B4', 'D5', 'F5'][i]), 0.1 + i * beat, 0.8, { gain: 0.28 });
        later(function () {
          stage.querySelectorAll('.ln-g.on').forEach(function (x) { x.classList.remove('on'); });
          stage.querySelector('.ln-g[data-l="' + l + '"]').classList.add('on');
        }, (0.1 + i * beat) * 1000);
      });
      later(function () { stage.querySelectorAll('.ln-g.on').forEach(function (x) { x.classList.remove('on'); }); }, (0.1 + 5 * beat) * 1000 + 300);
    }
    function wiggle(x) { x.classList.remove('le-wig'); void x.getBoundingClientRect(); x.classList.add('le-wig'); }
    function clefTap(clef, praiseIt) {
      var cg = stage.querySelector('.clefg');
      if (!cg) { return; }
      wiggle(cg); cg.classList.add('on');
      playClefTune(clef, function () { cg.classList.remove('on'); });
      if (praiseIt) { later(function () { praise(t(clef === 'treble' ? 'e.trebleYes' : 'e.bassYes')); }, 900); }
    }

    // ── Choose what you heard (listening block and the game) ──
    function cardsHtml(items) {
      return items.map(function (it, i) {
        return '<button class="le-card" data-k="' + i + '">' + itemSvg(it) +
          (it.type === 'clef' ? esc(t(it.clef === 'treble' ? 'e.high' : 'e.low')) : '') + '</button>';
      }).join('');
    }
    function newListeningRound(autoplay) {
      stopAll(); hideBubble();
      var b = blocks[cur], opts2 = b.options || [];
      var ans = b.random ? Math.floor(Math.random() * opts2.length) : Math.min(b.answer || 0, opts2.length - 1);
      var order = shuffle(opts2.map(function (_, i) { return i; }));
      round = { target: opts2[ans], ans: ans, first: true };
      stage.innerHTML = '<div class="le-quiz">' + cardsHtml(order.map(function (i) { return opts2[i]; })) + '</div>';
      stage.appendChild(bubbleEl);
      stage.querySelectorAll('.le-card').forEach(function (c) {
        var idx = order[+c.dataset.k];
        c.addEventListener('click', function () {
          if (!round || round.solved) { return; }
          if (round.first) {
            record(idx === ans ? 1 : 0, idx === ans ? [] : [{ chosen: itemLabel(opts2[idx]), expected: itemLabel(opts2[ans]) }]);
            round.first = false;
          }
          if (idx === ans) { c.classList.add('right'); round.solved = true; praise(t('e.right')); }
          else { c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); encourage(t('e.listenAgain')); later(function () { playItem(round.target); }, 900); }
        });
      });
      if (autoplay) { later(function () { playItem(round.target); }, 400); }
    }

    function startGame() {
      var b = blocks[cur];
      round = { game: true, no: 0, stars: 0, misses: [], pool: (b.pool || []).filter(Boolean), rounds: b.rounds || 5 };
      if (round.pool.length < 2) { stage.innerHTML = '<div class="le-missing">' + esc(t('e.gameEmpty')) + '</div>'; return; }
      nextGameRound();
    }
    function nextGameRound() {
      stopAll(); hideBubble();
      var g = round;
      if (g.no >= g.rounds) { gameOver(); return; }
      g.no++;
      var opts2 = shuffle(g.pool).slice(0, Math.min(3, g.pool.length));
      g.target = opts2[Math.floor(Math.random() * opts2.length)];
      g.first = true;
      stage.innerHTML = '<div class="le-col"><div class="le-stars">' + '⭐'.repeat(g.stars) +
        '<span style="opacity:0.25">' + '⭐'.repeat(g.rounds - g.stars) + '</span> <span style="font-size:18px;font-weight:800;color:#6a6f8f">' +
        g.no + '/' + g.rounds + '</span></div><div class="le-quiz">' + cardsHtml(opts2) + '</div></div>';
      stage.appendChild(bubbleEl);
      stage.querySelectorAll('.le-card').forEach(function (c) {
        var it = opts2[+c.dataset.k];
        c.addEventListener('click', function () {
          if (!g.target) { return; }
          if (it === g.target) {
            c.classList.add('right');
            if (g.first) { g.stars++; } else { g.misses.push({ round: g.no, expected: itemLabel(g.target) }); }
            g.target = null;
            praise(g.first ? t('e.right') : t('e.found'));
            later(nextGameRound, 1600);
          } else {
            g.first = false;
            c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
            encourage(t('e.listenAgain'));
            later(function () { if (g.target) { playItem(g.target); } }, 900);
          }
        });
      });
      later(function () { if (g.target) { playItem(g.target); } }, 500);
    }
    function gameOver() {
      var g = round;
      record(g.stars / g.rounds, g.misses);
      stage.innerHTML = '<div class="le-col"><div style="font-size:46px">' + '⭐'.repeat(Math.max(1, g.stars)) + '</div>' +
        '<div class="le-q">' + esc(t('e.gameDone')) + '</div></div>';
      stage.appendChild(bubbleEl);
      happy(); confetti(); markDone();
    }

    function openGamePage(href) {
      if (global.MusicationAuth && !global.MusicationAuth.getSession()) { global.MusicationAuth.enter(opts.role || 'student', { level: 'I' }); }
      stopAll();
      var box = document.createElement('div');
      box.className = 'le-gamebox';
      box.innerHTML = '<iframe src="' + esc(href) + '" allow="autoplay; fullscreen"></iframe><button class="close" aria-label="' + esc(t('e.close')) + '">✕</button>';
      document.body.appendChild(box);
      box.querySelector('.close').addEventListener('click', function () { box.remove(); });
      markDone();
    }

    // ── Recording (stays on this device) ──
    function stopRec() {
      if (rec && rec.mr && rec.mr.state === 'recording') { rec.mr.stop(); }
      if (rec && rec.stream) { rec.stream.getTracks().forEach(function (x) { x.stop(); }); }
      if (rec) { clearInterval(rec.iv); }
      rec = null;
    }
    function renderRecording() {
      var b = blocks[cur];
      stage.innerHTML = '<div class="le-rec"><button class="le-rbtn red rbig" data-rec>🎤</button><div class="time">' + esc(t('e.recStart')) + '</div>' +
        '<audio controls hidden></audio><div class="le-small">' + esc(t('e.recLocal')) + '</div></div>';
      stage.appendChild(bubbleEl);
      var btn = stage.querySelector('[data-rec]'), time = stage.querySelector('.time'), au = stage.querySelector('audio');
      btn.addEventListener('click', function () {
        if (rec) { stopRec(); return; }
        if (!navigator.mediaDevices || !global.MediaRecorder) { time.textContent = t('e.recNo'); return; }
        navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
          var chunks = [], mr = new MediaRecorder(stream), left = b.seconds || 30;
          rec = { mr: mr, stream: stream };
          mr.ondataavailable = function (e) { chunks.push(e.data); };
          mr.onstop = function () {
            btn.classList.remove('on'); btn.textContent = '🎤';
            au.src = URL.createObjectURL(new Blob(chunks, { type: mr.mimeType || 'audio/webm' }));
            au.hidden = false; time.textContent = t('e.recListen');
            markDone();
          };
          mr.start();
          btn.classList.add('on'); btn.textContent = '⏹';
          time.textContent = left + ' s';
          rec.iv = setInterval(function () { left--; time.textContent = left + ' s'; if (left <= 0) { stopRec(); } }, 1000);
        }).catch(function () { time.textContent = t('e.recDenied'); });
      });
    }

    // ── One block on screen ──
    function renderRail() {
      var r = q('.le-rail');
      r.innerHTML = '';
      blocks.forEach(function (b, i) {
        var x = document.createElement('button');
        x.textContent = b.type === 'game' ? gameOf(b.game).ico : ICO[b.type] || '•';
        x.className = (i === cur && !finished ? 'cur' : '') + (done[i] ? ' done' : '');
        x.title = (i + 1) + '. ' + (b.title || typeName(b.type));
        x.addEventListener('click', function () { if (!opts.lockOrder || i <= reach) { go(i); } });
        if (opts.lockOrder && i > reach) { x.style.opacity = '0.45'; x.style.cursor = 'default'; }
        r.appendChild(x);
      });
      q('.le-pill').textContent = finished ? '🎉' : (cur + 1) + '/' + blocks.length;
    }
    function show(w, on) { var x = q('[data-w="' + w + '"]'); if (x) { x.hidden = !on; } }

    function render() {
      stopAll(); stopRec(); attempt = null; round = null; hideBubble();
      listenFn = null; tryFn = null;
      q('.le-controls').hidden = false;
      var b = blocks[cur];
      renderRail();
      if (!b) { stage.innerHTML = '<div class="le-missing">' + esc(t('e.empty')) + '</div>'; explain.hidden = true; show('listen', false); show('try', false); show('tempo', false); q('.le-next').hidden = true; return; }
      q('.le-next').hidden = false;
      if (!startedAt[b.id]) { startedAt[b.id] = new Date().toISOString(); }
      q('.le-name').textContent = (b.type === 'game' ? gameOf(b.game).ico : ICO[b.type]) + ' ' + (b.title || typeName(b.type));
      explain.textContent = b.type === 'text' ? '' : (b.text || '');
      explain.hidden = !explain.textContent;
      var ui = { listen: false, tryIco: '🔄', tryLbl: t('e.again'), tempo: false, bottom: '' };
      stage.innerHTML = '';

      if (b.type === 'text') {
        stage.innerHTML = '<div class="le-text">' + esc(b.text || '') + '</div>';
        markDoneSoon();
      } else if (b.type === 'image') {
        stage.innerHTML = b.url ? '<img class="le-media" src="' + esc(b.url) + '" alt="">' : '<div class="le-missing">🖼️ ' + esc(t('sum.nofile')) + '</div>';
        markDoneSoon();
      } else if (b.type === 'audio') {
        stage.innerHTML = '<div class="le-audio"><div class="big">🎧</div>' + (b.url ? '<audio controls preload="metadata" src="' + esc(b.url) + '"></audio>' : '<div class="le-missing">' + esc(t('sum.nofile')) + '</div>') + '</div>';
        var au = stage.querySelector('audio');
        if (au) { au.addEventListener('ended', markDone); au.addEventListener('play', markDone); } else { markDoneSoon(); }
      } else if (b.type === 'video') {
        var yt = youtubeId(b.url);
        stage.innerHTML = yt ? '<iframe class="le-video" src="https://www.youtube-nocookie.com/embed/' + yt + '?rel=0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>'
          : b.url ? '<video class="le-video" controls preload="metadata" src="' + esc(b.url) + '"></video>' : '<div class="le-missing">🎬 ' + esc(t('sum.nofile')) + '</div>';
        markDoneSoon();
      } else if (b.type === 'rhythm') {
        stage.innerHTML = rhythmSvg(b.pattern, b.meter, { beats: !!b.accent });
        listenFn = function () { clearMarks(); attempt = null; playRhythm(b, true); };
        tryFn = startRhythmAttempt;
        ui.listen = true; ui.tryIco = '👏'; ui.tryLbl = t('e.yourTurn'); ui.tempo = true; ui.bottom = 'pad';
      } else if (b.type === 'notes' && b.mode === 'lines') {
        stage.innerHTML = linesSvg(); bindLines();
        listenFn = demoLines; ui.listen = true; ui.tempo = true;
      } else if (b.type === 'notes' && b.mode === 'clef') {
        stage.innerHTML = clefSvg(b.clef || 'treble');
        stage.querySelector('.clefg').addEventListener('pointerdown', function () { clefTap(b.clef || 'treble', true); });
        listenFn = function () { clefTap(b.clef || 'treble', false); }; ui.listen = true;
      } else if (b.type === 'notes') {
        stage.innerHTML = melodySvg(b.notes || [], { noNames: b.names === false, mono: !!opts.mono });
        listenFn = function () { clearMarks(); attempt = null; playMelody(b.notes || [], true, true, b.check ? null : markDone); };
        if (b.check) { tryFn = function () { startMelodyAttempt(false); }; ui.tryIco = '🎹'; ui.tryLbl = t('e.yourTurn'); }
        ui.listen = true; ui.tempo = true; ui.bottom = 'piano';
      } else if (b.type === 'piano') {
        renderDots();
        listenFn = function () { attempt = null; renderDots(); playMelody(b.notes || [], false, b.show !== false); };
        tryFn = function () { startMelodyAttempt(false); };
        ui.listen = true; ui.tryIco = '🎹'; ui.tryLbl = t('e.yourTurn'); ui.tempo = true; ui.bottom = 'piano';
      } else if (b.type === 'listening') {
        newListeningRound(false);
        listenFn = function () { if (round && round.target) { playItem(round.target); } };
        tryFn = function () { newListeningRound(true); };
        ui.listen = true; ui.tryLbl = t('e.newSound'); ui.tempo = true;
        ui.bottom = '';
      } else if (b.type === 'task') {
        var ch = (b.choices || []).map(function (c, i) { return { c: c, i: i }; }).filter(function (x) { return String(x.c).trim(); });
        stage.innerHTML = '<div class="le-col"><div class="le-q">' + esc(b.text || '') + '</div><div class="le-quiz">' +
          shuffle(ch).map(function (x) { return '<button class="le-card" data-i="' + x.i + '">' + esc(x.c) + '</button>'; }).join('') + '</div></div>';
        explain.hidden = true;
        var first = true, solved = false;
        stage.querySelectorAll('.le-card').forEach(function (c) {
          c.addEventListener('click', function () {
            if (solved) { return; }
            var i = +c.dataset.i, right = i === (b.answer || 0);
            if (first) { record(right ? 1 : 0, right ? [] : [{ chosen: b.choices[i], expected: b.choices[b.answer || 0] }]); first = false; }
            if (right) { solved = true; c.classList.add('right'); praise(t('e.right')); }
            else { c.classList.add('wrong'); c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); encourage(t('e.thinkAgain')); }
          });
        });
        tryFn = render; ui.tryLbl = t('e.again');
      } else if (b.type === 'game' && (b.game || 'kagirdi') === 'kagirdi') {
        startGame();
        listenFn = function () { if (round && round.target) { playItem(round.target); } };
        tryFn = startGame; ui.listen = true; ui.tryLbl = t('e.playAgain'); ui.tempo = true;
        var pk = (b.pool || [])[0];
        ui.bottom = '';
        if (pk && !b.text) { explain.textContent = t('e.gameHint'); explain.hidden = false; }
      } else if (b.type === 'game') {
        var gm = gameOf(b.game);
        stage.innerHTML = '<div class="le-col"><div class="le-gamepic">' + gm.ico + '</div><div class="le-q">' + esc(t('game.' + gm.id)) + '</div>' +
          '<button class="le-play">▶ ' + esc(t('e.play')) + '</button></div>';
        stage.querySelector('.le-play').addEventListener('click', function () { openGamePage(gm.href); });
      } else if (b.type === 'recording') {
        renderRecording();
      } else {
        stage.innerHTML = '<div class="le-missing">?</div>';
      }
      stage.appendChild(bubbleEl);
      show('listen', ui.listen); show('try', !!tryFn); show('tempo', ui.tempo);
      q('[data-act="listen"]').classList.toggle('pulse', b.type === 'listening' || b.type === 'piano');
      q('[data-act="try"]').textContent = ui.tryIco;
      q('.le-tryl').textContent = ui.tryLbl;
      var nx = q('.le-next');
      nx.textContent = cur < blocks.length - 1 ? t('e.next') + ' ➡️' : t('e.finish') + ' 🎉';
      nx.classList.toggle('ready', !!done[cur]);
      renderBottom(ui.bottom);
      if (opts.onChange) { opts.onChange(cur, b); }
    }
    function markDoneSoon() { setTimeout(function () { if (!finished) { done[cur] = true; renderRail(); q('.le-next').classList.add('ready'); } }, 50); }

    function go(i) {
      if (i < 0 || i >= blocks.length) { return; }
      flush(cur);
      finished = false;
      cur = i;
      reach = Math.max(reach, i);
      render();
    }
    function finish() {
      flush(cur);
      stopAll(); stopRec(); attempt = null; round = null;
      finished = true;
      renderRail();
      renderBottom('');
      q('.le-controls').hidden = true;
      explain.hidden = true;
      q('.le-name').textContent = '';
      var scored = blocks.filter(function (b) { return best[b.id]; });
      var avg = scored.length ? scored.reduce(function (s, b) { return s + best[b.id].score; }, 0) / scored.length : null;
      var stars = avg === null ? 3 : avg >= 0.85 ? 3 : avg >= 0.6 ? 2 : 1;
      stage.innerHTML = '<div class="le-col"><div style="font-size:80px;line-height:1">🎉</div><div style="font-size:44px">' + '⭐'.repeat(stars) + '</div>' +
        '<div class="le-q">' + esc(t('e.lessonDone')) + '</div><div class="le-btns le-fin" style="justify-content:center"></div></div>';
      var fin = stage.querySelector('.le-fin');
      var btns = [[t('e.restart'), function () { done = blocks.map(function () { return false; }); go(0); }]].concat(opts.finale || []);
      btns.forEach(function (x) {
        var bt = document.createElement('button');
        bt.className = 'btn ' + (x[2] || '');
        bt.textContent = x[0];
        bt.addEventListener('click', x[1]);
        fin.appendChild(bt);
      });
      stage.appendChild(bubbleEl);
      happy(); confetti();
      if (opts.onFinish) { opts.onFinish(best); }
    }

    q('[data-act="listen"]').addEventListener('click', function () { if (listenFn) { hideBubble(); listenFn(); } });
    q('[data-act="try"]').addEventListener('click', function () { if (tryFn) { hideBubble(); tryFn(); } });
    q('[data-act="next"]').addEventListener('click', function () { if (cur < blocks.length - 1) { go(cur + 1); } else { finish(); } });
    function setTempo(i) {
      tempoI = Math.max(0, Math.min(2, i));
      q('.le-tempo input').value = tempoI;
      try { localStorage.setItem(TEMPO_KEY, tempoI); } catch (e) {}
      root.querySelectorAll('.le-tempo .names button').forEach(function (x, k) { x.classList.toggle('sel', k === tempoI); });
    }
    q('.le-tempo input').addEventListener('input', function () { setTempo(+this.value); });
    root.querySelectorAll('.le-tempo [data-t]').forEach(function (x) { x.addEventListener('click', function () { setTempo(+x.dataset.t); }); });
    setTempo(tempoI);

    render();
    return {
      go: go,
      index: function () { return cur; },
      block: function () { return blocks[cur]; },
      results: function () { return best; },
      finish: finish,
      destroy: function () {
        flush(cur);
        stopAll(); stopRec(); hideBubble();
        document.removeEventListener('keydown', onKey);
        el.innerHTML = '';
      }
    };
  }

  // ───────────────────────────── Block editor ─────────────────────────────
  // Builds the form for one block into el. onChange(block) after each edit.
  // ctx.upload(file) → Promise<url> for pictures, sound and video.
  function editor(block, el, onChange, ctx) {
    ctx = ctx || {};
    var b = block;
    function changed() { if (onChange) { onChange(b); } }
    function h(tag, attrs, html) {
      var x = document.createElement(tag);
      Object.keys(attrs || {}).forEach(function (k) { if (k === 'class') { x.className = attrs[k]; } else { x.setAttribute(k, attrs[k]); } });
      if (html !== undefined) { x.innerHTML = html; }
      return x;
    }
    function field(label, inner) {
      var f = h('label', { class: 'field' });
      f.appendChild(h('span', {}, esc(label)));
      f.appendChild(inner);
      return f;
    }
    function input(val, on, ph) {
      var x = h('input', { class: 'input', type: 'text' });
      x.value = val || ''; if (ph) { x.placeholder = ph; }
      x.addEventListener('input', function () { on(x.value); changed(); });
      return x;
    }
    function textarea(val, on, ph) {
      var x = h('textarea', { class: 'textarea' });
      x.value = val || ''; if (ph) { x.placeholder = ph; }
      x.addEventListener('input', function () { on(x.value); changed(); });
      return x;
    }
    function select(options, val, on) {
      var x = h('select', { class: 'select' });
      options.forEach(function (o) { var op = h('option', { value: o[0] }, esc(o[1])); if (String(o[0]) === String(val)) { op.selected = true; } x.appendChild(op); });
      x.addEventListener('change', function () { on(x.value); changed(); });
      return x;
    }
    function check(label, val, on) {
      var l = h('label', { class: 'check' }), c = h('input', { type: 'checkbox' });
      c.checked = !!val;
      c.addEventListener('change', function () { on(c.checked); changed(); });
      l.appendChild(c); l.appendChild(h('span', {}, esc(label)));
      return l;
    }
    function presetSteps(kind) {
      var out = [];
      D.TOPICS.forEach(function (tp) {
        tp.presets.forEach(function (st, i) {
          if (st.type === kind) { out.push({ st: st, label: tp.no + '.' + (i + 1) + ' ' + (kind === 'rhythm' ? syllables(st.pattern) : st.notes.map(noteName).join(' ')) }); }
        });
      });
      return out;
    }

    // Rhythm builder: signs to add, meter, a preview. value: {pattern, meter}
    function rhythmBuilder(val, onSet) {
      var box = h('div', { class: 'le-ed' });
      var prev = h('div', { class: 'le-prev' });
      function draw() { prev.innerHTML = val.pattern.length ? rhythmSvg(val.pattern, val.meter) : esc(t('ed.addSigns')); }
      var row = h('div', { class: 'row' });
      row.appendChild(field(t('ed.meter'), select([[2, '2'], [3, '3'], [4, '4']], val.meter || 4, function (v) { val.meter = +v; draw(); onSet(); })));
      var pre = presetSteps('rhythm');
      row.appendChild(field(t('ed.fromProgram'), select([['', '—']].concat(pre.map(function (p, i) { return [i, p.label]; })), '', function (v) {
        if (v === '') { return; }
        val.pattern = pre[+v].st.pattern.slice(); val.meter = pre[+v].st.meter || 4; draw(); onSet();
      })));
      box.appendChild(row);
      var btns = h('div', { class: 'le-btns' });
      Object.keys(TOK).forEach(function (k) {
        var x = h('button', { class: 'le-tok', type: 'button', title: TOK[k].name }, rhythmSvg([k], 4, { noSyl: true }) + esc(TOK[k].syl));
        x.addEventListener('click', function () { if (val.pattern.length < 16) { val.pattern.push(k); draw(); onSet(); changed(); } });
        btns.appendChild(x);
      });
      var back = h('button', { class: 'btn btn-small', type: 'button' }, '⌫');
      back.addEventListener('click', function () { val.pattern.pop(); draw(); onSet(); changed(); });
      var clr = h('button', { class: 'btn btn-small', type: 'button' }, '✕ ' + esc(t('ed.clear')));
      clr.addEventListener('click', function () { val.pattern.length = 0; draw(); onSet(); changed(); });
      btns.appendChild(back); btns.appendChild(clr);
      box.appendChild(btns); box.appendChild(prev);
      draw();
      return box;
    }
    // Melody builder: the coloured keys. value: {notes}
    function melodyBuilder(val, onSet) {
      var box = h('div', { class: 'le-ed' });
      var prev = h('div', { class: 'le-prev' });
      function draw() { prev.innerHTML = val.notes.length ? melodySvg(val.notes, { noNames: false }) : esc(t('ed.addNotes')); }
      var pre = presetSteps('melody');
      box.appendChild(field(t('ed.fromProgram'), select([['', '—']].concat(pre.map(function (p, i) { return [i, p.label]; })), '', function (v) {
        if (v === '') { return; }
        val.notes = pre[+v].st.notes.slice(); draw(); onSet();
      })));
      var btns = h('div', { class: 'le-btns' });
      KEYS.forEach(function (k) {
        var x = h('button', { class: 'le-key' + (k.light ? ' light' : ''), type: 'button', style: 'background:' + k.c }, k.name + (k.n === 'C5' ? '²' : ''));
        x.addEventListener('click', function () { if (val.notes.length < 16) { val.notes.push(k.n); tone(freq(k.n), 0, 0.6, { gain: 0.25 }); draw(); onSet(); changed(); } });
        btns.appendChild(x);
      });
      var back = h('button', { class: 'btn btn-small', type: 'button' }, '⌫');
      back.addEventListener('click', function () { val.notes.pop(); draw(); onSet(); changed(); });
      var clr = h('button', { class: 'btn btn-small', type: 'button' }, '✕ ' + esc(t('ed.clear')));
      clr.addEventListener('click', function () { val.notes.length = 0; draw(); onSet(); changed(); });
      btns.appendChild(back); btns.appendChild(clr);
      box.appendChild(btns); box.appendChild(prev);
      draw();
      return box;
    }
    // A list of things to hear (listening options / game pool).
    function itemList(list, opt) {
      var box = h('div', { class: 'le-ed' });
      var rows = h('div', { class: 'le-opts' });
      function draw() {
        rows.innerHTML = '';
        if (!list.length) { rows.appendChild(h('div', { class: 'muted' }, esc(t('ed.noItems')))); }
        list.forEach(function (it, i) {
          var r = h('div', { class: 'le-opt' });
          r.appendChild(h('div', { class: 'p' }, itemSvg(it, { noNames: false }) + (it.type === 'clef' ? esc(itemLabel(it)) : '')));
          if (opt.answer) {
            var lab = h('label'), rd = h('input', { type: 'radio', name: 'ans' + b.id });
            rd.checked = (b.answer || 0) === i;
            rd.addEventListener('change', function () { b.answer = i; changed(); });
            lab.appendChild(rd); lab.appendChild(document.createTextNode(t('ed.right')));
            r.appendChild(lab);
          }
          var del = h('button', { type: 'button', title: t('ed.remove') }, '🗑️');
          del.addEventListener('click', function () {
            list.splice(i, 1);
            if (opt.answer && b.answer >= list.length) { b.answer = Math.max(0, list.length - 1); }
            draw(); changed();
          });
          r.appendChild(del);
          rows.appendChild(r);
        });
      }
      box.appendChild(rows);
      var kindSel = { v: 'rhythm' }, work = { pattern: ['q', 'q', 'q', 'q'], meter: 4, notes: ['C4', 'E4', 'G4'] };
      var build = h('div', { class: 'le-ed' });
      function drawBuild() {
        build.innerHTML = '';
        if (kindSel.v === 'rhythm') { build.appendChild(rhythmBuilder(work, function () {})); }
        else if (kindSel.v === 'melody') { build.appendChild(melodyBuilder(work, function () {})); }
      }
      var row = h('div', { class: 'row' });
      row.appendChild(field(t('ed.itemKind'), select([['rhythm', t('ed.kindRhythm')], ['melody', t('ed.kindMelody')], ['clef', t('ed.kindClef')]], 'rhythm', function (v) { kindSel.v = v; drawBuild(); })));
      var add = h('button', { class: 'btn btn-teal', type: 'button' }, '➕ ' + esc(t('ed.addItem')));
      add.addEventListener('click', function () {
        if (list.length >= (opt.max || 3)) { return; }
        var it = kindSel.v === 'rhythm' ? { type: 'rhythm', pattern: work.pattern.slice(), meter: work.meter }
          : kindSel.v === 'melody' ? { type: 'melody', notes: work.notes.slice() }
          : { type: 'clef', clef: list.some(function (x) { return x.type === 'clef' && x.clef === 'treble'; }) ? 'bass' : 'treble' };
        if ((it.pattern && !it.pattern.length) || (it.notes && !it.notes.length)) { return; }
        list.push(it); draw(); changed();
      });
      row.appendChild(add);
      box.appendChild(h('div', { class: 'muted' }, esc(t('ed.itemsMax', { n: opt.max || 3 }))));
      box.appendChild(row);
      box.appendChild(build);
      draw(); drawBuild();
      return box;
    }
    function mediaField(accept) {
      var box = h('div', { class: 'le-ed' });
      var prev = h('div', { class: 'le-prev' });
      function draw() {
        if (!b.url) { prev.textContent = t('sum.nofile'); return; }
        if (b.type === 'image') { prev.innerHTML = '<img src="' + esc(b.url) + '" alt="">'; }
        else if (b.type === 'audio') { prev.innerHTML = '<audio controls src="' + esc(b.url) + '"></audio>'; }
        else { prev.textContent = youtubeId(b.url) ? '▶ YouTube: ' + youtubeId(b.url) : summary(b); }
      }
      var url = input(b.url, function (v) { b.url = v.trim(); draw(); }, b.type === 'video' ? 'https://www.youtube.com/watch?v=…' : 'https://…');
      box.appendChild(field(t(b.type === 'video' ? 'ed.urlVideo' : 'ed.url'), url));
      if (ctx.upload) {
        var row = h('div', { class: 'row' });
        var fi = h('input', { type: 'file', accept: accept, hidden: '' });
        var up = h('button', { class: 'btn', type: 'button' }, '⬆️ ' + esc(t('ed.upload')));
        var msg = h('span', { class: 'muted' });
        up.addEventListener('click', function () { fi.click(); });
        fi.addEventListener('change', function () {
          var f = fi.files[0];
          if (!f) { return; }
          msg.textContent = t('ed.uploading');
          up.disabled = true;
          ctx.upload(f).then(function (u) { b.url = u; url.value = u.indexOf('data:') === 0 ? '(' + f.name + ')' : u; msg.textContent = '✓ ' + f.name; draw(); changed(); })
            .catch(function (e) { msg.textContent = e.message === 'too_big' ? t('ed.tooBig') : t('ed.uploadFail') + ' ' + e.message; })
            .then(function () { up.disabled = false; fi.value = ''; });
        });
        row.appendChild(up); row.appendChild(msg); row.appendChild(fi);
        box.appendChild(row);
      }
      box.appendChild(prev);
      draw();
      if (b.url && b.url.indexOf('data:') === 0) { url.value = '(' + t('ed.inLesson') + ')'; }
      return box;
    }

    el.innerHTML = '';
    var form = h('div', { class: 'le-ed' });
    form.appendChild(field(t('ed.title'), input(b.title, function (v) { b.title = v; }, typeName(b.type))));
    if (b.type === 'task') {
      form.appendChild(field(t('ed.question'), textarea(b.text, function (v) { b.text = v; })));
    } else {
      form.appendChild(field(t(b.type === 'text' ? 'ed.textMain' : 'ed.text'), textarea(b.text, function (v) { b.text = v; }, t('ed.textPh'))));
    }

    if (b.type === 'rhythm') {
      form.appendChild(check(t('ed.accent'), b.accent, function (v) { b.accent = v; }));
      form.appendChild(rhythmBuilder(b, changed));
    } else if (b.type === 'notes') {
      var sub = h('div', { class: 'le-ed' });
      var drawNotes = function () {
        sub.innerHTML = '';
        if (b.mode === 'melody') {
          b.notes = b.notes || [];
          sub.appendChild(check(t('ed.names'), b.names !== false, function (v) { b.names = v; }));
          sub.appendChild(check(t('ed.checkPlay'), !!b.check, function (v) { b.check = v; }));
          sub.appendChild(melodyBuilder(b, changed));
        } else if (b.mode === 'clef') {
          sub.appendChild(field(t('ed.clef'), select([['treble', t('e.treble')], ['bass', t('e.bass')]], b.clef || 'treble', function (v) { b.clef = v; })));
        }
      };
      form.appendChild(field(t('ed.notesMode'), select([['melody', t('ed.modeMelody')], ['lines', t('ed.modeLines')], ['clef', t('ed.modeClef')]], b.mode || 'melody', function (v) {
        b.mode = v; if (v === 'clef' && !b.clef) { b.clef = 'treble'; } drawNotes();
      })));
      form.appendChild(sub);
      drawNotes();
    } else if (b.type === 'piano') {
      form.appendChild(check(t('ed.showKeys'), b.show !== false, function (v) { b.show = v; }));
      b.notes = b.notes || [];
      form.appendChild(melodyBuilder(b, changed));
    } else if (b.type === 'listening') {
      b.options = b.options || [];
      form.appendChild(check(t('ed.random'), !!b.random, function (v) { b.random = v; }));
      form.appendChild(itemList(b.options, { answer: true, max: 3 }));
    } else if (b.type === 'task') {
      b.choices = b.choices || ['', ''];
      var cbox = h('div', { class: 'le-opts' });
      var drawChoices = function () {
        cbox.innerHTML = '';
        b.choices.forEach(function (c, i) {
          var r = h('div', { class: 'le-opt' });
          var lab = h('label'), rd = h('input', { type: 'radio', name: 'ans' + b.id });
          rd.checked = (b.answer || 0) === i;
          rd.addEventListener('change', function () { b.answer = i; changed(); });
          lab.appendChild(rd); lab.appendChild(document.createTextNode(t('ed.right')));
          r.appendChild(input(c, function (v) { b.choices[i] = v; }, t('ed.choice', { n: i + 1 })));
          r.appendChild(lab);
          if (b.choices.length > 2) {
            var del = h('button', { type: 'button', title: t('ed.remove') }, '🗑️');
            del.addEventListener('click', function () {
              b.choices.splice(i, 1);
              if (b.answer >= b.choices.length) { b.answer = 0; }
              drawChoices(); changed();
            });
            r.appendChild(del);
          }
          cbox.appendChild(r);
        });
        if (b.choices.length < 4) {
          var add = h('button', { class: 'btn btn-small', type: 'button' }, '➕ ' + esc(t('ed.addChoice')));
          add.addEventListener('click', function () { b.choices.push(''); drawChoices(); changed(); });
          cbox.appendChild(add);
        }
      };
      form.appendChild(field(t('ed.choices'), cbox));
      drawChoices();
    } else if (b.type === 'game') {
      var gsub = h('div', { class: 'le-ed' });
      var drawGame = function () {
        gsub.innerHTML = '';
        if ((b.game || 'kagirdi') === 'kagirdi') {
          b.pool = b.pool || []; b.rounds = b.rounds || 5;
          gsub.appendChild(field(t('ed.rounds'), select([[3, '3'], [5, '5'], [8, '8']], b.rounds, function (v) { b.rounds = +v; })));
          gsub.appendChild(itemList(b.pool, { answer: false, max: 8 }));
        } else {
          gsub.appendChild(h('div', { class: 'muted' }, esc(t('ed.gamePage'))));
        }
      };
      form.appendChild(field(t('ed.game'), select(GAMES.map(function (g) { return [g.id, g.ico + ' ' + t('game.' + g.id)]; }), b.game || 'kagirdi', function (v) { b.game = v; drawGame(); })));
      form.appendChild(gsub);
      drawGame();
    } else if (b.type === 'recording') {
      form.appendChild(field(t('ed.seconds'), select([[15, '15 s'], [30, '30 s'], [60, '60 s']], b.seconds || 30, function (v) { b.seconds = +v; })));
      form.appendChild(h('div', { class: 'muted' }, esc(t('e.recLocal'))));
    } else if (b.type === 'image') {
      form.appendChild(mediaField('image/*'));
    } else if (b.type === 'audio') {
      form.appendChild(mediaField('audio/*'));
    } else if (b.type === 'video') {
      form.appendChild(mediaField('video/*'));
    }
    el.appendChild(form);
  }

  // An assignment's content: { blocks, order_mode, color_mode } (or just the blocks).
  function blocksOf(content) { return Array.isArray(content) ? content : (content && content.blocks) || []; }

  global.LessonEngine = {
    blocksOf: blocksOf,
    ORDER: ORDER, ICO: ICO, GAMES: GAMES,
    uid: uid, clone: clone, esc: esc,
    newBlock: newBlock, fromStep: fromStep, itemFromStep: itemFromStep,
    areaOf: areaOf, summary: summary, thumb: thumb, typeName: typeName, errorText: errorText,
    noteName: noteName, syllables: syllables,
    svg: { rhythm: rhythmSvg, melody: melodySvg, lines: linesSvg, clef: clefSvg },
    player: player, editor: editor, stopAll: stopAll
  };
})(window);
