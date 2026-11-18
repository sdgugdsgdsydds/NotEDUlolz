/*! mini-browser.js - a small iframe browser you can add to any page with one <script> tag.
 *  Usage: <div id="mini-browser"></div>
 *         <script src="https://cdn.jsdelivr.net/gh/YOUR_USER/YOUR_REPO@main/mini-browser.js"></script>
 *  Optional on the div: data-home="https://en.wikipedia.org/wiki/Main_Page"
 */
(function () {
  "use strict";
  var host = document.getElementById("mini-browser");
  if (!host) { host = document.createElement("div"); host.id = "mini-browser"; document.body.appendChild(host); }

  var HOME = host.getAttribute("data-home") || "https://en.wikipedia.org/wiki/Main_Page";
  var root = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;

  root.innerHTML =
    '<style>' +
    ':host{display:block}' +
    '.page{--chrome:#f4f5f7;--field:#fff;--line:#d0d5db;--ink:#1f2328;font:14px system-ui,sans-serif;display:flex;justify-content:center;padding:16px}' +
    '.page.dark{--chrome:#1f2428;--field:#14171a;--line:#384047;--ink:#e9ecef}' +
    '.browser{width:760px;max-width:100%;height:480px;display:flex;flex-direction:column;background:var(--chrome);border:1px solid var(--line);border-radius:8px;overflow:hidden;color:var(--ink)}' +
    '.page.full{position:fixed;inset:0;padding:0;z-index:2147483647;background:var(--page-bg,#fff)}' +
    '.page.full .browser{width:100%;max-width:none;height:100%;border:0;border-radius:0}' +
    '.bar{display:flex;gap:4px;align-items:center;padding:6px;border-bottom:1px solid var(--line)}' +
    'button{font:inherit;color:var(--ink);background:transparent;border:1px solid transparent;border-radius:6px;min-width:30px;height:30px;cursor:pointer}' +
    'button:hover{background:var(--line)}' +
    'form{flex:1;display:flex;margin:0}' +
    'input{flex:1;min-width:0;height:30px;padding:0 12px;font:inherit;color:var(--ink);background:var(--field);border:1px solid var(--line);border-radius:15px}' +
    '.view{flex:1;position:relative;background:#fff}' +
    'iframe{position:absolute;inset:0;width:100%;height:100%;border:0}' +
    '</style>' +
    '<div class="page" id="page"><div class="browser">' +
    '<div class="bar">' +
    '<button id="back" title="Back">&#8592;</button>' +
    '<button id="forward" title="Forward">&#8594;</button>' +
    '<button id="reload" title="Reload">&#8635;</button>' +
    '<button id="home" title="Home">&#8962;</button>' +
    '<form id="form"><input id="address" type="text" placeholder="Type a web address or search Wikipedia"></form>' +
    '<button id="external" title="Open in a new tab">&#8599;</button>' +
    '<button id="theme" title="Switch to dark mode">Dark</button>' +
    '<button id="full" title="Fullscreen">&#9974;</button>' +
    '</div>' +
    '<div class="view"><iframe id="frame" title="Browser view" allow="fullscreen"></iframe></div>' +
    '</div></div>';

  var $ = function (id) { return root.getElementById ? root.getElementById(id) : root.querySelector("#" + id); };
  var frame = $("frame"), address = $("address"), page = $("page");
  var themeBtn = $("theme");
  var stack = [], index = -1, dark = false;

  function normalize(text) {
    text = text.trim();
    if (!text) return null;
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) return text;
    if (/^[^\s]+\.[a-z]{2,}([\/?#].*)?$/i.test(text)) return "https://" + text;
    return "https://en.wikipedia.org/w/index.php?search=" + encodeURIComponent(text);
  }
  function show(url) { address.value = url; frame.src = url; }
  function go(url) { stack = stack.slice(0, index + 1); stack.push(url); index = stack.length - 1; show(url); }

  $("form").addEventListener("submit", function (e) { e.preventDefault(); var u = normalize(address.value); if (u) go(u); });
  $("back").addEventListener("click", function () { if (index > 0) { index--; show(stack[index]); } });
  $("forward").addEventListener("click", function () { if (index < stack.length - 1) { index++; show(stack[index]); } });
  $("reload").addEventListener("click", function () { if (index >= 0) show(stack[index]); });
  $("home").addEventListener("click", function () { go(HOME); });
  $("external").addEventListener("click", function () { if (index >= 0) window.open(stack[index], "_blank", "noopener"); });

  // Light / dark: changes the whole page background, not just the widget
  var pageBg = document.documentElement.style.backgroundColor;
  themeBtn.addEventListener("click", function () {
    dark = !dark;
    var bg = dark ? "#14171a" : "#ffffff";
    document.documentElement.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;
    page.style.setProperty("--page-bg", bg);
    page.classList.toggle("dark", dark);
    themeBtn.textContent = dark ? "Light" : "Dark";
    themeBtn.title = dark ? "Switch to light mode" : "Switch to dark mode";
  });

  // Fullscreen: covers the window and requests real fullscreen too (Esc exits)
  $("full").addEventListener("click", function () {
    var on = !page.classList.contains("full");
    page.classList.toggle("full", on);
    if (on) { try { var p = host.requestFullscreen && host.requestFullscreen(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
    else if (document.fullscreenElement) { document.exitFullscreen(); }
  });
  document.addEventListener("fullscreenchange", function () {
    if (!document.fullscreenElement) page.classList.remove("full");
  });

  document.documentElement.style.backgroundColor = pageBg || "#ffffff";
  page.style.setProperty("--page-bg", "#ffffff");
  go(HOME);
})();