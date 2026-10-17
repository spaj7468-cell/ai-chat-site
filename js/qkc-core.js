/* ══════════════════════════════════════════════════════════════════════
   QKC Core — общий JS-слой продуктов OuRi Corp. Zero deps, ~3 KB.
   Даёт: тема dark/light, индикатор прокрутки, липкая навигация,
   reveal-анимации, активный пункт меню, reduced-motion.
   Подключать в конце <body>: <script src="js/qkc-core.js" defer></script>
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var root = document.documentElement;
  var KEY = "ouri-theme";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- тема ---------- */
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", t === "light" ? "#f4f4f5" : "#08080a");
    var b = document.getElementById("btnTheme");
    if (b) b.setAttribute("aria-pressed", t === "light" ? "true" : "false");
  }
  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved === "light" || saved === "dark") { applyTheme(saved); return; }
    if (!root.getAttribute("data-theme")) {
      applyTheme(window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    }
  }
  initTheme();
  var btnTheme = document.getElementById("btnTheme");
  if (btnTheme) {
    btnTheme.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
  }

  /* ---------- индикатор прокрутки + липкая навигация ---------- */
  var bar = document.getElementById("scrollBar");
  var nav = document.getElementById("nav") || document.querySelector(".nav");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
      if (nav) nav.classList.toggle("is-stuck", window.scrollY > 8);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- reveal при появлении ---------- */
  var items = document.querySelectorAll(".reveal");
  if (items.length && "IntersectionObserver" in window && !reduce.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 6, 5) * 55 + "ms";
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- активный пункт меню ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link[href^="#"]'));
  if (links.length && "IntersectionObserver" in window) {
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      var sec = document.getElementById(id);
      if (sec) map[id] = a;
    });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = map[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          links.forEach(function (x) { x.classList.remove("is-active"); x.removeAttribute("aria-current"); });
          a.classList.add("is-active");
          a.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { so.observe(document.getElementById(id)); });
  }

  /* ---------- burger-меню ---------- */
  var burger = document.getElementById("btnBurger");
  var menu = document.getElementById("navLinks");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) { menu.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }
    });
  }

  /* ---------- год в футере ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- публичный API ---------- */
  window.OuRiCore = { applyTheme: applyTheme, reduceMotion: reduce };
})();
