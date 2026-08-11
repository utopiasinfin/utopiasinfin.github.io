/* Wilson Escobar Rodriguez — IT-Portfolio
   Alles clientseitig, keine Abhängigkeiten.
   1) Prüfungstermine live herunterzählen
   2) Uhr (Berlin)
   3) Terminal-Boot: Zeilen erscheinen nacheinander
   4) Abschnitte beim Scrollen einblenden
   5) Hell/Dunkel umschalten (Auswahl wird gemerkt)
   6) DE/EN auf der Profilseite
*/
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1) Prüfungen ---------- */
  var EXAMS = {
    comptia: "2026-08-25",
    ap1:     "2026-09-30"
  };

  function daysUntil(iso) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.ceil((new Date(iso + "T00:00:00") - today) / 86400000);
  }

  function fmt(iso) {
    return new Date(iso + "T00:00:00")
      .toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function renderExams() {
    Object.keys(EXAMS).forEach(function (id) {
      var nodes = document.querySelectorAll('[data-exam="' + id + '"]');
      if (!nodes.length) return;
      var d = daysUntil(EXAMS[id]);
      var rel = d > 1 ? "in " + d + " Tagen"
              : d === 1 ? "morgen"
              : d === 0 ? "heute"
              : "abgeschlossen";
      var text = rel + " · " + fmt(EXAMS[id]);
      Array.prototype.forEach.call(nodes, function (n) { n.textContent = text; });
    });
  }

  /* ---------- 2) Uhr ---------- */
  function startClock() {
    var short = document.querySelector("[data-clock]");
    var long  = document.querySelector("[data-clock-long]");
    if (!short && !long) return;
    function tick() {
      var t = new Date().toLocaleTimeString("de-DE", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Berlin"
      });
      if (short) short.textContent = t + " Berlin";
      if (long)  long.textContent  = t + " · Europe/Berlin";
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- 3) Terminal-Boot ---------- */
  function bootTerminal() {
    var rows = document.querySelectorAll("[data-boot]");
    if (!rows.length) return;
    if (reduced) {
      Array.prototype.forEach.call(rows, function (r) { r.classList.add("is-on"); });
      return;
    }
    Array.prototype.forEach.call(rows, function (row, i) {
      setTimeout(function () { row.classList.add("is-on"); }, 180 + i * 190);
    });
  }

  /* ---------- 4) Einblenden beim Scrollen ---------- */
  function revealOnScroll() {
    var items = document.querySelectorAll(".rise");
    if (!items.length) return;
    if (reduced || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    Array.prototype.forEach.call(items, function (el) { io.observe(el); });
  }

  /* ---------- 5) Hell / Dunkel ---------- */
  function themeSwitch() {
    var btn = document.querySelector("[data-theme-switch]");
    if (!btn) return;
    var root = document.documentElement;

    function apply(mode) {
      if (mode === "light") {
        root.setAttribute("data-theme", "light");
        btn.textContent = "Dunkel";
      } else {
        root.removeAttribute("data-theme");
        btn.textContent = "Hell";
      }
    }

    var saved = null;
    try { saved = localStorage.getItem("wer-theme"); } catch (e) {}
    apply(saved === "light" ? "light" : "dark");

    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      apply(next);
      try { localStorage.setItem("wer-theme", next); } catch (e) {}
    });
  }

  /* ---------- 6) DE / EN ---------- */
  function langSwitch() {
    var btns = document.querySelectorAll("[data-lang-btn]");
    if (!btns.length) return;
    var blocks = document.querySelectorAll("[data-lang]");

    function apply(lang) {
      Array.prototype.forEach.call(btns, function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.langBtn === lang));
      });
      Array.prototype.forEach.call(blocks, function (b) {
        b.classList.toggle("is-on", b.dataset.lang === lang);
      });
    }

    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener("click", function () { apply(b.dataset.langBtn); });
    });
    apply("de");
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderExams();
    startClock();
    bootTerminal();
    revealOnScroll();
    themeSwitch();
    langSwitch();
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
