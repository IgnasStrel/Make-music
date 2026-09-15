/* Shared "season background" engine for MUSICATION.
   Renders one of 7 backgrounds (4 looping season videos + 2 looping gif
   photos + "none") behind (or as a translucent wash over) any page, keeps
   the choice in localStorage so it follows the player from page to page,
   and — unless a page opts out with window.SEASON_BG_NO_FLOATING — mounts
   a small floating "orb" button that expands into the full picker.

   Any element anywhere in the page can also act as a picker button just by
   carrying data-theme-orb="<key>" — clicks are handled here via delegation,
   so a page with its own settings menu (rasymas.html, smoosic.html) can
   just render its own orb-styled buttons and this script wires them up. */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'musication.bg.theme';

  var THEMES = [
    { key: 'none',      label: 'Be fono',    icon: '⬜', type: 'none' },
    { key: 'pavasaris', label: 'Pavasaris',  icon: '🌸', type: 'video', src: '../uploads/pavasaris.mp4', gradient: 'linear-gradient(135deg,#ffc1e3,#7ee8a2)' },
    { key: 'vasara',    label: 'Vasara',     icon: '☀️', type: 'video', src: '../uploads/vasara.mp4',    gradient: 'linear-gradient(135deg,#ffe066,#4fc3f7)' },
    { key: 'ruduo',     label: 'Ruduo',      icon: '🍂', type: 'video', src: '../uploads/ruduo.mp4',     gradient: 'linear-gradient(135deg,#ffb46e,#8b5e34)' },
    { key: 'ziema',     label: 'Žiema',      icon: '❄️', type: 'video', src: '../uploads/ziema.mp4',     gradient: 'linear-gradient(135deg,#eaf7ff,#4a76a8)' },
    { key: 'beach',     label: 'Paplūdimys', icon: '🌊', type: 'image', src: '../uploads/beach.gif',     gradient: 'linear-gradient(135deg,#4fc3f7,#0288d1)' },
    { key: 'desert',    label: 'Dykuma',     icon: '🏜️', type: 'image', src: '../uploads/desert.gif',    gradient: 'linear-gradient(135deg,#ffd27a,#c9862c)' }
  ];

  function byKey(key) {
    for (var i = 0; i < THEMES.length; i++) { if (THEMES[i].key === key) { return THEMES[i]; } }
    return null;
  }

  function load() { try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; } }
  function persist(key) { try { localStorage.setItem(STORAGE_KEY, key); } catch (e) {} }

  var listeners = [];
  function onChange(cb) { listeners.push(cb); }

  var MODE = (global.SEASON_BG_MODE === 'wash') ? 'wash' : 'behind';

  // ---------------------------------------------------------------- CSS ---
  function ensureStyle() {
    if (document.getElementById('season-bg-style')) { return; }
    var css =
      /* Belt-and-suspenders: the stretched video below is clipped by its own
         fixed+overflow:hidden layer, but not every page already guards
         against horizontal overflow itself — this makes sure none of them
         ever show a bottom scrollbar because of it. */
      'html,body{overflow-x:hidden;}' +
      '.season-bg-layer{position:fixed;inset:0;pointer-events:none;overflow:hidden;}' +
      '.season-bg-layer.mode-behind{z-index:-1;--season-bg-opacity:0.94;}' +
      '.season-bg-layer.mode-wash{z-index:9998;--season-bg-opacity:0.38;}' +
      '#season-bg-video,#season-bg-photo{position:absolute;inset:0;width:100%;height:100%;' +
        'object-fit:cover;background-size:cover;background-position:center;background-repeat:no-repeat;' +
        'opacity:0;transition:opacity .6s ease;}' +
      /* The source clips are a portrait recording padded with black bars into
         a 16:9 frame — object-fit:cover alone can't remove baked-in pixels,
         so stretch the video horizontally (only) around its center to push
         those bars out past the edges. Tune via --season-bg-zoom-x. */
      '#season-bg-video{--season-bg-zoom-x:1.3;transform:scaleX(var(--season-bg-zoom-x));transform-origin:center center;}' +
      '#season-bg-video.on,#season-bg-photo.on{opacity:var(--season-bg-opacity);}' +
      '.bg-orb-row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;}' +
      '.bg-orb{width:38px;height:38px;border-radius:50%;flex:none;cursor:pointer;position:relative;' +
        'border:2px solid rgba(255,255,255,0.55);background:var(--orb-grad,#555);' +
        'box-shadow:inset -4px -4px 7px rgba(0,0,0,0.28),inset 3px 3px 6px rgba(255,255,255,0.4),0 3px 7px rgba(0,0,0,0.35);' +
        'display:flex;align-items:center;justify-content:center;font-size:16px;line-height:1;' +
        'transition:transform .15s ease,box-shadow .15s ease;padding:0;}' +
      '.bg-orb:hover{transform:scale(1.14);}' +
      '.bg-orb:active{transform:scale(0.96);}' +
      '.bg-orb.sel{border-color:#fff;box-shadow:inset -4px -4px 7px rgba(0,0,0,0.28),inset 3px 3px 6px rgba(255,255,255,0.4),0 0 0 3px rgba(255,255,255,0.55),0 3px 10px rgba(0,0,0,0.45);}' +
      '#season-bg-widget{position:fixed;left:14px;bottom:14px;z-index:99999;display:flex;align-items:center;gap:8px;}' +
      '#season-bg-widget .bg-orb-row{background:rgba(15,15,30,0.55);backdrop-filter:blur(6px);border-radius:999px;padding:6px;' +
        'max-width:0;overflow:hidden;opacity:0;transform:translateX(-8px) scale(0.85);transform-origin:left center;' +
        'transition:max-width .28s ease,opacity .2s ease,transform .22s ease,padding .28s ease;pointer-events:none;}' +
      '#season-bg-widget.open .bg-orb-row{max-width:400px;opacity:1;transform:translateX(0) scale(1);pointer-events:auto;padding:6px 8px;}' +
      '#season-bg-toggle{width:46px;height:46px;font-size:20px;box-shadow:inset -5px -5px 9px rgba(0,0,0,0.3),inset 4px 4px 7px rgba(255,255,255,0.45),0 4px 10px rgba(0,0,0,0.4);}' +
      '@media(max-width:480px){#season-bg-widget{left:8px;bottom:8px;}}';
    var style = document.createElement('style');
    style.id = 'season-bg-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // -------------------------------------------------------------- Layer ---
  function ensureLayers() {
    if (document.getElementById('season-bg-layer')) { return; }
    ensureStyle();
    var wrap = document.createElement('div');
    wrap.id = 'season-bg-layer';
    wrap.className = 'season-bg-layer mode-' + MODE;
    wrap.setAttribute('aria-hidden', 'true');
    var video = document.createElement('video');
    video.id = 'season-bg-video';
    video.muted = true; video.loop = true; video.autoplay = true; video.preload = 'auto';
    video.setAttribute('playsinline', ''); video.setAttribute('muted', '');
    var photo = document.createElement('div');
    photo.id = 'season-bg-photo';
    wrap.appendChild(video);
    wrap.appendChild(photo);
    document.body.insertBefore(wrap, document.body.firstChild);
  }

  // --------------------------------------------------------------- Apply ---
  function apply(key) {
    var theme = byKey(key) || byKey('none');
    ensureLayers();
    var video = document.getElementById('season-bg-video');
    var photo = document.getElementById('season-bg-photo');
    if (theme.type === 'video') {
      photo.classList.remove('on');
      photo.style.backgroundImage = '';
      if (video.getAttribute('data-key') !== theme.key) {
        video.setAttribute('data-key', theme.key);
        video.src = theme.src;
      }
      video.classList.add('on');
      var p = video.play();
      if (p && p.catch) { p.catch(function () {}); }
    } else if (theme.type === 'image') {
      video.classList.remove('on');
      video.removeAttribute('src'); video.removeAttribute('data-key'); video.load();
      photo.style.backgroundImage = 'url("' + theme.src + '")';
      photo.classList.add('on');
    } else {
      video.classList.remove('on');
      video.removeAttribute('src'); video.removeAttribute('data-key'); video.load();
      photo.classList.remove('on');
      photo.style.backgroundImage = '';
    }
    persist(theme.key);
    updateSelectedUI(theme.key);
    listeners.forEach(function (cb) { try { cb(theme.key); } catch (e) {} });
  }

  function updateSelectedUI(key) {
    document.querySelectorAll('[data-theme-orb]').forEach(function (el) {
      el.classList.toggle('sel', el.getAttribute('data-theme-orb') === key);
    });
  }

  function current() { return load() || global.SEASON_BG_DEFAULT || 'vasara'; }

  // --------------------------------------------------------- Orb markup ---
  function orbHtml(theme, extraClass) {
    var style = theme.gradient ? ' style="--orb-grad:' + theme.gradient + '"' : '';
    return '<button type="button" class="bg-orb' + (extraClass ? ' ' + extraClass : '') +
      '" data-theme-orb="' + theme.key + '" title="' + theme.label + '"' + style + '>' + theme.icon + '</button>';
  }

  function buildRowHtml() {
    return THEMES.map(function (t) { return orbHtml(t); }).join('');
  }

  // ----------------------------------------------------- Floating widget ---
  function mountFloatingPicker() {
    if (document.getElementById('season-bg-widget')) { return; }
    ensureStyle();
    var box = document.createElement('div');
    box.id = 'season-bg-widget';
    box.innerHTML =
      '<button type="button" id="season-bg-toggle" class="bg-orb" title="Fonas">🌅</button>' +
      '<div class="bg-orb-row">' + buildRowHtml() + '</div>';
    document.body.appendChild(box);
    box.querySelector('#season-bg-toggle').addEventListener('click', function (e) {
      e.stopPropagation();
      box.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!box.contains(e.target)) { box.classList.remove('open'); }
    });
  }

  // ------------------------------------------------------------- Clicks ---
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-theme-orb]') : null;
    if (!el) { return; }
    apply(el.getAttribute('data-theme-orb'));
  });

  function init() {
    ensureLayers();
    apply(current());
    if (!global.SEASON_BG_NO_FLOATING) { mountFloatingPicker(); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.SeasonBg = {
    THEMES: THEMES,
    apply: apply,
    current: current,
    onChange: onChange,
    buildRowHtml: buildRowHtml,
    orbHtml: orbHtml,
    mountFloatingPicker: mountFloatingPicker
  };
})(window);
