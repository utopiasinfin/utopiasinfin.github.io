// Wilson Escobar Rodriguez — IT-Portfolio
// Live-Status-Panel: Uhrzeit + Tage bis zu den Prüfungen. Alles rein
// clientseitig berechnet, keine Fake-Daten — nur echte Termine.

(function () {
  "use strict";

  // ---- Prüfungstermine (echte Daten) ----
  var EXAMS = [
    { id: "comptia", label: "CompTIA Network+", date: "2026-08-25" },
    { id: "ap1", label: "AP1 (Ausbildungsprüfung Teil 1)", date: "2026-09-30" }
  ];

  function daysUntil(dateStr) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var target = new Date(dateStr + "T00:00:00");
    var diffMs = target - today;
    return Math.ceil(diffMs / 86400000);
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

  function renderClock() {
    var el = document.querySelector("[data-clock]");
    if (!el) return;
    function tick() {
      var now = new Date();
      var time = now.toLocaleTimeString("de-DE", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Berlin"
      });
      el.textContent = time + " Uhr · Berlin";
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

  document.addEventListener("DOMContentLoaded", function () {
    renderCountdowns();
    renderClock();
    setupReveal();
    var y = document.getElementById("y");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
