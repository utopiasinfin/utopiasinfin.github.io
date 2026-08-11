(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EXAMS = { comptia: "2026-08-25", ap1: "2026-09-30" };

  function daysUntil(iso) {
    var t = new Date(); t.setHours(0,0,0,0);
    return Math.ceil((new Date(iso + "T00:00:00") - t) / 86400000);
  }
  function fmtDate(iso) {
    return new Date(iso + "T00:00:00")
      .toLocaleDateString("de-DE", {day:"2-digit",month:"2-digit",year:"numeric"});
  }
  function exams() {
    Object.keys(EXAMS).forEach(function(id) {
      var d = daysUntil(EXAMS[id]);
      var rel = d > 1 ? "in " + d + " Tagen" : d === 1 ? "morgen" : d === 0 ? "heute" : "abgeschlossen";
      var txt = rel + " · " + fmtDate(EXAMS[id]);
      document.querySelectorAll('[data-exam="' + id + '"]').forEach(function(el){ el.textContent = txt; });
    });
  }

  function clocks() {
    var short = document.querySelector("[data-clock]");
    var long  = document.querySelector("[data-clock-long]");
    function tick() {
      var t = new Date().toLocaleTimeString("de-DE",
        {hour:"2-digit",minute:"2-digit",second:"2-digit",timeZone:"Europe/Berlin"});
      if (short) short.textContent = t + " Berlin";
      if (long)  long.textContent  = t + " · Europe/Berlin";
    }
    tick(); setInterval(tick, 1000);
  }

  function boot() {
    var rows = document.querySelectorAll("[data-boot]");
    if (!rows.length) return;
    if (reduced) { rows.forEach(function(r){ r.classList.add("on"); }); return; }
    rows.forEach(function(r, i){ setTimeout(function(){ r.classList.add("on"); }, 150 + i * 180); });
  }

  function reveal() {
    var els = document.querySelectorAll(".rise");
    if (!els.length) return;
    if (reduced || !("IntersectionObserver" in window)) {
      els.forEach(function(el){ el.classList.add("in"); }); return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
    els.forEach(function(el){ io.observe(el); });
  }

  function theme() {
    var btn = document.querySelector("[data-theme-sw]");
    if (!btn) return;
    var root = document.documentElement;
    function apply(m) {
      if (m === "light") { root.setAttribute("data-theme","light"); btn.textContent = "Dunkel"; }
      else { root.removeAttribute("data-theme"); btn.textContent = "Hell"; }
    }
    var saved; try { saved = localStorage.getItem("wer-theme"); } catch(e){}
    apply(saved === "light" ? "light" : "dark");
    btn.addEventListener("click", function(){
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      apply(next); try { localStorage.setItem("wer-theme", next); } catch(e){}
    });
  }

  function lang() {
    var btns = document.querySelectorAll("[data-lang-btn]");
    if (!btns.length) return;
    function apply(l) {
      btns.forEach(function(b){ b.setAttribute("aria-pressed", String(b.dataset.langBtn === l)); });
      document.querySelectorAll("[data-lang]").forEach(function(b){ b.classList.toggle("on", b.dataset.lang === l); });
    }
    btns.forEach(function(b){ b.addEventListener("click", function(){ apply(b.dataset.langBtn); }); });
    apply("de");
  }

  document.addEventListener("DOMContentLoaded", function(){
    exams(); clocks(); boot(); reveal(); theme(); lang();
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
