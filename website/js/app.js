(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // DEMO AUTH ONLY. Credentials and roles live in this client-side file,
  // which means anyone can read them via view-source. This is intentional
  // for a showcase/demo build (no backend). Do not reuse this pattern to
  // protect real files or data.
  // ---------------------------------------------------------------------
  var USERS = {
    admin: { password: "admin123", role: "admin", label: "Administratorius" },
    worker: { password: "worker123", role: "worker", label: "Darbuotojas" }
  };

  var DOWNLOAD_PATH = "../electron-app/dist-installer/MUSICATION%20Setup%201.0.0.exe";
  var DOWNLOAD_NAME = "MUSICATION Setup 1.0.0.exe";
  var SESSION_KEY = "mm_session";

  // ---------- Tabs ----------
  var tabButtons = document.querySelectorAll(".tab-btn");
  var panels = document.querySelectorAll(".tab-panel");

  function activateTab(name) {
    tabButtons.forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.tab === name);
    });
    panels.forEach(function (panel) {
      panel.classList.toggle("active", panel.id === "panel-" + name);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () { activateTab(btn.dataset.tab); });
  });

  document.querySelectorAll("[data-tab-link]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      activateTab(el.dataset.tabLink);
    });
  });

  // ---------- Session ----------
  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function setSession(session) {
    if (session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
    renderSession();
  }

  var userPill = document.getElementById("userPill");
  var loginBtn = document.getElementById("loginBtn");
  var logoutBtn = document.getElementById("logoutBtn");
  var heroNote = document.getElementById("heroNote");

  function renderSession() {
    var session = getSession();
    if (session) {
      userPill.hidden = false;
      userPill.textContent = (USERS[session.username] ? USERS[session.username].label : session.username);
      loginBtn.hidden = true;
      logoutBtn.hidden = false;
      heroNote.innerHTML = session.role === "admin"
        ? "Prisijungę kaip <strong>administratorius</strong> — programą atsisiųsti galite."
        : "Prisijungę kaip <strong>darbuotojas</strong> — atsisiuntimas prieinamas tik administratoriui.";
    } else {
      userPill.hidden = true;
      loginBtn.hidden = false;
      logoutBtn.hidden = true;
      heroNote.innerHTML = "Atsisiuntimas prieinamas prisijungus <strong>administratoriaus</strong> paskyra.";
    }
  }

  logoutBtn.addEventListener("click", function () { setSession(null); });

  // ---------- Login modal ----------
  var loginOverlay = document.getElementById("loginOverlay");
  var loginForm = document.getElementById("loginForm");
  var loginUser = document.getElementById("loginUser");
  var loginPass = document.getElementById("loginPass");
  var loginError = document.getElementById("loginError");

  function openLogin() {
    loginError.hidden = true;
    loginForm.reset();
    loginOverlay.hidden = false;
    loginUser.focus();
  }
  function closeLogin() { loginOverlay.hidden = true; }

  loginBtn.addEventListener("click", openLogin);
  document.getElementById("loginClose").addEventListener("click", closeLogin);
  loginOverlay.addEventListener("click", function (e) {
    if (e.target === loginOverlay) closeLogin();
  });

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var username = loginUser.value.trim().toLowerCase();
    var password = loginPass.value;
    var user = USERS[username];
    if (user && user.password === password) {
      setSession({ username: username, role: user.role });
      closeLogin();
    } else {
      loginError.hidden = false;
    }
  });

  // ---------- Locked (worker) modal ----------
  var lockedOverlay = document.getElementById("lockedOverlay");
  function openLocked() { lockedOverlay.hidden = false; }
  function closeLocked() { lockedOverlay.hidden = true; }
  document.getElementById("lockedClose").addEventListener("click", closeLocked);
  document.getElementById("lockedOk").addEventListener("click", closeLocked);
  lockedOverlay.addEventListener("click", function (e) {
    if (e.target === lockedOverlay) closeLocked();
  });

  // ---------- Download gating ----------
  function triggerDownload() {
    var a = document.createElement("a");
    a.href = DOWNLOAD_PATH;
    a.download = DOWNLOAD_NAME;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  document.getElementById("heroDownloadBtn").addEventListener("click", function () {
    var session = getSession();
    if (!session) {
      openLogin();
      return;
    }
    if (session.role === "admin") {
      triggerDownload();
    } else {
      openLocked();
    }
  });

  // ---------- Contact form (demo only, no backend) ----------
  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      contactForm.reset();
      alert("Ačiū! Žinutė užregistruota (demo režimas, siuntimas realiai nevykdomas).");
    });
  }

  renderSession();
})();
