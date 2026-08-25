// Content script, runs in every frame. It activates only when the frame is
// embedded directly inside this extension's viewer page, then mirrors scroll
// positions, clicks, and form input across sibling frames (via the viewer,
// which relays messages).
//
// Interactions are mirrored by element identity (id → link href → text →
// structural path), never by coordinates — layouts differ per device, so the
// same button sits in different places (or inside a hamburger menu). Loops
// are impossible by construction: only trusted (real user) events broadcast,
// and everything a sibling applies is synthetic.
(() => {
  const EXT_ORIGIN = location.ancestorOrigins && location.ancestorOrigins[0];
  if (window.top === window) return;
  if (!EXT_ORIGIN || !EXT_ORIGIN.startsWith("chrome-extension://")) return;
  if (EXT_ORIGIN !== new URL(chrome.runtime.getURL("/")).origin) return;

  // Random per-frame id so a frame can ignore its own broadcast echoes.
  const FRAME_ID = Math.random().toString(36).slice(2);
  let applying = false;
  let applyTimer = 0;

  const doc = () => document.scrollingElement || document.documentElement;

  function ratios() {
    const el = doc();
    const maxX = el.scrollWidth - el.clientWidth;
    const maxY = el.scrollHeight - el.clientHeight;
    return {
      x: maxX > 0 ? el.scrollLeft / maxX : 0,
      y: maxY > 0 ? el.scrollTop / maxY : 0,
    };
  }

  addEventListener(
    "scroll",
    () => {
      if (applying) return;
      const r = ratios();
      try {
        chrome.runtime.sendMessage({ type: "frame-scroll", from: FRAME_ID, x: r.x, y: r.y });
      } catch (_) {
        /* extension reloaded; nothing to do */
      }
    },
    { passive: true }
  );

  chrome.runtime.onMessage.addListener((msg) => {
    if (!msg || msg.type !== "apply-scroll" || msg.from === FRAME_ID) return;
    const el = doc();
    applying = true;
    // behavior: "instant" overrides any scroll-behavior: smooth on the page —
    // an animated scroll would outlive the guard below and echo back as a
    // stream of scroll events, feeding a sync loop between frames.
    el.scrollTo({
      left: msg.x * Math.max(0, el.scrollWidth - el.clientWidth),
      top: msg.y * Math.max(0, el.scrollHeight - el.clientHeight),
      behavior: "instant",
    });
    clearTimeout(applyTimer);
    applyTimer = setTimeout(() => (applying = false), 120);
  });

  /* ----- Interaction sync (clicks + form input) ----- */

  const send = (payload) => {
    try {
      chrome.runtime.sendMessage({ type: "frame-action", from: FRAME_ID, ...payload });
    } catch (_) {}
  };

  // Several ways to identify "the same element" in a sibling frame, most
  // specific first. The receiver tries them in order.
  function describe(el) {
    const d = { tag: el.tagName.toLowerCase(), path: cssPath(el) };
    if (el.id) d.id = el.id;
    if (el.name) d.name = el.name;
    const a = el.closest("a[href]");
    if (a) d.href = a.getAttribute("href");
    const text = (el.innerText || el.value || "").trim().slice(0, 80);
    if (text && text.length < 80) d.text = text;
    return d;
  }

  function cssPath(el) {
    const parts = [];
    for (let n = el; n && n !== document.body && parts.length < 8; n = n.parentElement) {
      let i = 1;
      for (let s = n.previousElementSibling; s; s = s.previousElementSibling) {
        if (s.tagName === n.tagName) i++;
      }
      parts.unshift(`${n.tagName.toLowerCase()}:nth-of-type(${i})`);
    }
    return parts.join(" > ");
  }

  function locate(d) {
    if (d.id) {
      const el = document.getElementById(d.id);
      if (el) return el;
    }
    if (d.href) {
      const el = document.querySelector(`a[href="${d.href.replace(/"/g, '\\"')}"]`);
      if (el) return el;
    }
    if (d.name) {
      const el = document.querySelector(`${d.tag}[name="${d.name.replace(/"/g, '\\"')}"]`);
      if (el) return el;
    }
    if (d.text) {
      const el = [...document.querySelectorAll(d.tag)].find(
        (x) => (x.innerText || x.value || "").trim().slice(0, 80) === d.text
      );
      if (el) return el;
    }
    try {
      return document.querySelector(d.path);
    } catch (_) {
      return null;
    }
  }

  const CLICKABLE = "a[href], button, [role=button], input, select, textarea, label, summary, [onclick]";

  addEventListener(
    "click",
    (e) => {
      if (!e.isTrusted) return; // synthetic = applied from a sibling; never re-broadcast
      const el = e.target.closest ? e.target.closest(CLICKABLE) : null;
      if (!el) return;
      send({ action: "click", el: describe(el) });
    },
    true
  );

  addEventListener(
    "input",
    (e) => {
      if (!e.isTrusted) return;
      const el = e.target;
      if (!el || !("value" in el)) return;
      send({
        action: "input",
        el: describe(el),
        value: el.value,
        checked: el.checked,
      });
    },
    true
  );

  addEventListener(
    "change",
    (e) => {
      if (!e.isTrusted) return;
      const el = e.target;
      if (!el || !(el instanceof HTMLSelectElement || el.type === "checkbox" || el.type === "radio")) return;
      send({ action: "change", el: describe(el), value: el.value, checked: el.checked });
    },
    true
  );

  function nativeSetValue(el, value) {
    const proto =
      el instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : el instanceof HTMLSelectElement
          ? HTMLSelectElement.prototype
          : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value");
    if (setter && setter.set) setter.set.call(el, value);
    else el.value = value;
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (!msg || msg.type !== "apply-action" || msg.from === FRAME_ID) return;
    const el = locate(msg.el);
    if (!el) return;
    if (msg.action === "click") {
      el.click(); // works even when the element is hidden in this breakpoint's menu
    } else if (msg.action === "input") {
      if (el.type === "checkbox" || el.type === "radio") {
        el.checked = msg.checked;
      } else {
        // Native setter + input event so controlled inputs (React/Vue) update
        nativeSetValue(el, msg.value);
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
    } else if (msg.action === "change") {
      if (el.type === "checkbox" || el.type === "radio") el.checked = msg.checked;
      else nativeSetValue(el, msg.value);
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
})();
