// Content script, runs in every frame. It activates only when the frame is
// embedded directly inside this extension's viewer page, then mirrors scroll
// positions across sibling frames (via the viewer, which relays messages).
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
    el.scrollLeft = msg.x * Math.max(0, el.scrollWidth - el.clientWidth);
    el.scrollTop = msg.y * Math.max(0, el.scrollHeight - el.clientHeight);
    clearTimeout(applyTimer);
    applyTimer = setTimeout(() => (applying = false), 120);
  });
})();
