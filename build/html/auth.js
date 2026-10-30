/* MUSICATION — shared login / session helper.
 *
 * Loaded by index.html (the login screen) and by every page that should only
 * open after logging in. Exposes one global: window.MusicationAuth.
 */
(function (global) {
  'use strict';

  // ---------------------------------------------------------------------
  // DEMO AUTH ONLY. The accounts live in this client-side file, so anyone
  // can read them via view-source. That is fine for a classroom program
  // with no backend, where the login only decides which screen (teacher or
  // student) a person gets. Do not reuse this pattern to protect real data.
  //
  // To add or change accounts, edit this list. `role` is 'teacher' or
  // 'student'; `label` is the name shown in the top bar after logging in.
  // ---------------------------------------------------------------------
  var USERS = [
    { username: 'mokytojas', password: 'mokytojas123', role: 'teacher', label: 'Mokytojas' },
    { username: 'mokinys',   password: 'mokinys123',   role: 'student', label: 'Mokinys' }
  ];

  var ROLES = {
    teacher: { label: 'Mokytojas', icon: '👩‍🏫' },
    student: { label: 'Mokinys',   icon: '🧒' }
  };

  // sessionStorage (not localStorage) on purpose: the session ends when the
  // program / browser tab is closed, so every fresh start shows the login.
  var SESSION_KEY = 'musication.session';
  var LOGIN_PAGE = 'index.html';
  // Where a successful login lands: the main note-writing screen.
  var HOME_PAGE = 'rasymas.html';

  function getSession() {
    try {
      var s = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      return (s && ROLES[s.role]) ? s : null;
    } catch (e) {
      return null;
    }
  }

  // Returns the new session, or null when the name/password are wrong or
  // the account does not belong to the chosen role. `extra` carries the
  // choices made before logging in: { level: 'I'|'II'|'III', lang: 'lt'|'en' }.
  function login(role, username, password, extra) {
    var name = String(username || '').trim().toLowerCase();
    var user = null;
    for (var i = 0; i < USERS.length; i++) {
      if (USERS[i].username === name) { user = USERS[i]; break; }
    }
    if (!user || user.password !== password || user.role !== role) { return null; }
    var session = { username: user.username, role: user.role, name: user.label };
    if (extra && extra.level) { session.level = extra.level; }
    if (extra && extra.lang) { session.lang = extra.lang; }
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (e) { return null; }
    return session;
  }

  function logout() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
    location.replace(LOGIN_PAGE);
  }

  // Call from a protected page's <head>. Without a session the page is
  // hidden and replaced by the login screen before anything is shown.
  function requireLogin() {
    var session = getSession();
    if (!session) {
      document.documentElement.style.visibility = 'hidden';
      location.replace(LOGIN_PAGE);
    }
    return session;
  }

  global.MusicationAuth = {
    ROLES: ROLES,
    LOGIN_PAGE: LOGIN_PAGE,
    HOME_PAGE: HOME_PAGE,
    getSession: getSession,
    login: login,
    logout: logout,
    requireLogin: requireLogin
  };
})(window);
