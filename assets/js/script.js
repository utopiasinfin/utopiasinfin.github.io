(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EXAMS = { comptia: "2026-08-25", ap1: "2026-09-30" };

  var LANG = document.documentElement.lang || "de";
  var LOCALE = { de: "de-DE", en: "en-GB", es: "es-ES", it: "it-IT" }[LANG] || "de-DE";
  var CITY   = { de: "Berlin", en: "Berlin", es: "Berlín", it: "Berlino" }[LANG] || "Berlin";
  var I18N_ALL = {
    de: { inDays: function(d){ return "in " + d + " Tagen"; }, tomorrow: "morgen", today: "heute", done: "abgeschlossen", light: "Hell", dark: "Dunkel" },
    en: { inDays: function(d){ return "in " + d + " days"; },  tomorrow: "tomorrow", today: "today", done: "completed",   light: "Light", dark: "Dark" },
    es: { inDays: function(d){ return "en " + d + " días"; },  tomorrow: "mañana",  today: "hoy",   done: "completado",  light: "Claro", dark: "Oscuro" },
    it: { inDays: function(d){ return "tra " + d + " giorni"; }, tomorrow: "domani", today: "oggi",  done: "completato", light: "Chiaro", dark: "Scuro" }
  };
  var T = I18N_ALL[LANG] || I18N_ALL.de;

  function daysUntil(iso) {
    var t = new Date(); t.setHours(0,0,0,0);
    return Math.ceil((new Date(iso + "T00:00:00") - t) / 86400000);
  }
  function fmtDate(iso) {
    return new Date(iso + "T00:00:00")
      .toLocaleDateString(LOCALE, {day:"2-digit",month:"2-digit",year:"numeric"});
  }
  function exams() {
    Object.keys(EXAMS).forEach(function(id) {
      var d = daysUntil(EXAMS[id]);
      var rel = d > 1 ? T.inDays(d) : d === 1 ? T.tomorrow : d === 0 ? T.today : T.done;
      var txt = rel + " · " + fmtDate(EXAMS[id]);
      document.querySelectorAll('[data-exam="' + id + '"]').forEach(function(el){ el.textContent = txt; });
    });
  }

  function clocks() {
    var short = document.querySelector("[data-clock]");
    var long  = document.querySelector("[data-clock-long]");
    function tick() {
      var t = new Date().toLocaleTimeString(LOCALE,
        {hour:"2-digit",minute:"2-digit",second:"2-digit",timeZone:"Europe/Berlin"});
      if (short) short.textContent = t + " " + CITY;
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
      if (m === "light") { root.setAttribute("data-theme","light"); btn.textContent = T.dark; }
      else { root.removeAttribute("data-theme"); btn.textContent = T.light; }
    }
    var saved; try { saved = localStorage.getItem("wer-theme"); } catch(e){}
    apply(saved === "light" ? "light" : "dark");
    btn.addEventListener("click", function(){
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      apply(next); try { localStorage.setItem("wer-theme", next); } catch(e){}
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    exams(); clocks(); boot(); reveal(); theme();
    var y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
