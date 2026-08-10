// Wilson Escobar Rodriguez — IT-Portfolio
// Live-Status: Uhrzeit + Tage bis zu den Pruefungen (rein clientseitig
// berechnet, keine Fake-Daten), Scroll-Reveal, DE/EN-Umschalter (profil.html).

(function () {
  "use strict";

  var EXAMS = [
    { id: "comptia", date: "2026-08-25" },
    { id: "ap1", date: "2026-09-30" }
  ];

  function daysUntil(dateStr) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var target = new Date(dateStr + "T00:00:00");
    return Math.ceil((target - today) / 86400000);
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function renderCountdowns() {
    EXAMS.forEach(function (exam) {
      var els = document.querySelectorAll('[data-exam="' + exam.id + '"]');
      if (!els.length) return;
      var days = daysUntil(exam.date);
      var text;
      if (days > 1) text = "in " + days + " Tagen";
      else if (days === 1) text = "morgen";
      else if (days === 0) text = "heute";
      else text = "abgeschlossen";
      var full = text + " (" + formatDate(exam.date) + ")";
      els.forEach(function (el) { el.textContent = full; });
    });
  }

  function renderClocks() {
    var navClock = document.querySelector("[data-clock]");
    var termClock = document.querySelector("[data-clock2]");
    if (!navClock && !termClock) return;
    function tick() {
      var now = new Date();
      var short = now.toLocaleTimeString("de-DE", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Berlin"
      });
      if (navClock) navClock.textContent = "[ " + short + " ]";
      if (termClock) termClock.textContent = short + " Uhr · Berlin";
    }
    tick();
    setInterval(tick, 1000);
  }

  function setupReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    items.forEach(function (el) { io.observe(el); });
  }

  function setupLangToggle() {
    var buttons = document.querySelectorAll("[data-lang-btn]");
    if (!buttons.length) return;
    var blocks = document.querySelectorAll("[data-lang-block]");
    function activate(lang) {
      buttons.forEach(function (b) { b.classList.toggle("active", b.dataset.langBtn === lang); });
      blocks.forEach(function (b) { b.classList.toggle("active", b.dataset.langBlock === lang); });
    }
    buttons.forEach(function (b) {
      b.addEventListener("click", function () { activate(b.dataset.langBtn); });
    });
    activate("de");
  }

  function setupThemeToggle() {
    var btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;
    var root = document.documentElement;

    function apply(theme) {
      if (theme === "light") {
        root.setAttribute("data-theme", "light");
        btn.textContent = "Dark";
      } else {
        root.removeAttribute("data-theme");
        btn.textContent = "Light";
      }
    }

    var saved = null;
    try { saved = localStorage.getItem("wilson-theme"); } catch (e) {}
    apply(saved === "light" ? "light" : "dark");

    btn.addEventListener("click", function () {
      var isLight = root.getAttribute("data-theme") === "light";
      var next = isLight ? "dark" : "light";
      apply(next);
      try { localStorage.setItem("wilson-theme", next); } catch (e) {}
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderCountdowns();
    renderClocks();
    setupReveal();
    setupLangToggle();
    setupThemeToggle();
    var y = document.getElementById("y");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
