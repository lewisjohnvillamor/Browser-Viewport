// Viewer page logic: renders one card per enabled device, keeps a single
// uniform zoom (so relative device sizes stay honest), and relays scroll
// messages between frames when Synced mode is on.

const $ = (sel) => document.querySelector(sel);

const state = {
  url: new URLSearchParams(location.search).get("url") || "",
  enabled: new Set(),
  rotated: new Set(),
  zoom: "fit", // "fit" or a number as string
  synced: true,
  tabId: null,
};

const allDevices = DEVICE_GROUPS.flatMap((g) => g.devices);
const deviceById = new Map(allDevices.map((d) => [d.id, d]));

/* ---------- Persistence ---------- */

async function loadPrefs() {
  const saved = await chrome.storage.local.get(["enabled", "rotated", "zoom", "synced"]);
  state.enabled = new Set(
    Array.isArray(saved.enabled) && saved.enabled.length
      ? saved.enabled.filter((id) => deviceById.has(id))
      : allDevices.filter((d) => d.on).map((d) => d.id)
  );
  state.rotated = new Set(Array.isArray(saved.rotated) ? saved.rotated : []);
  if (saved.zoom) state.zoom = saved.zoom;
  if (typeof saved.synced === "boolean") state.synced = saved.synced;
}

function savePrefs() {
  chrome.storage.local.set({
    enabled: [...state.enabled],
    rotated: [...state.rotated],
    zoom: state.zoom,
    synced: state.synced,
  });
}

/* ---------- Rendering ---------- */

function deviceSize(d) {
  return state.rotated.has(d.id) ? { w: d.h, h: d.w } : { w: d.w, h: d.h };
}

function currentScale() {
  if (state.zoom !== "fit") return Number(state.zoom);
  const stage = $("#stage");
  const enabled = allDevices.filter((d) => state.enabled.has(d.id));
  if (!enabled.length) return 1;
  const widest = Math.max(...enabled.map((d) => deviceSize(d).w));
  const available = stage.clientWidth - 42; // stage padding + card border
  return Math.min(1, Math.max(0.08, available / widest));
}

function renderCards() {
  const stage = $("#stage");
  stage.querySelectorAll(".card").forEach((c) => c.remove());
  const empty = $("#empty");
  empty.hidden = Boolean(state.url) && state.enabled.size > 0;
  empty.querySelector("p").textContent = state.url
    ? "No devices enabled — pick some from the Devices menu."
    : "Enter a URL above to preview it across devices.";

  if (!state.url) return;

  const template = $("#card-template");
  for (const group of DEVICE_GROUPS) {
    for (const d of group.devices) {
      if (!state.enabled.has(d.id)) continue;
      const card = template.content.firstElementChild.cloneNode(true);
      card.dataset.device = d.id;
      card.querySelector(".card-name").textContent = d.name;
      const iframe = card.querySelector(".frame");
      iframe.title = d.name;
      iframe.src = state.url;
      card.querySelector(".rotate").addEventListener("click", () => {
        state.rotated.has(d.id) ? state.rotated.delete(d.id) : state.rotated.add(d.id);
        savePrefs();
        layoutCard(card, d);
      });
      card.querySelector(".hide").addEventListener("click", () => {
        state.enabled.delete(d.id);
        savePrefs();
        renderDevicePanel();
        renderCards();
      });
      stage.appendChild(card);
      layoutCard(card, d);
    }
  }
}

function layoutCard(card, d) {
  const { w, h } = deviceSize(d);
  const scale = currentScale();
  card.querySelector(".card-dims").textContent = `${w}×${h}`;
  const shell = card.querySelector(".frame-shell");
  const iframe = card.querySelector(".frame");
  iframe.style.width = w + "px";
  iframe.style.height = h + "px";
  iframe.style.transform = `scale(${scale})`;
  shell.style.width = Math.round(w * scale) + "px";
  shell.style.height = Math.round(h * scale) + "px";
}

function relayout() {
  document.querySelectorAll(".card").forEach((card) => {
    layoutCard(card, deviceById.get(card.dataset.device));
  });
}

/* ---------- Device picker ---------- */

function renderDevicePanel() {
  const panel = $("#devices-panel");
  panel.textContent = "";
  for (const group of DEVICE_GROUPS) {
    const label = document.createElement("div");
    label.className = "panel-group";
    label.textContent = group.group;
    panel.appendChild(label);
    for (const d of group.devices) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "panel-item";
      item.setAttribute("role", "checkbox");
      item.setAttribute("aria-checked", String(state.enabled.has(d.id)));
      item.innerHTML =
        `<span class="tick">` +
        (state.enabled.has(d.id)
          ? `<svg width="9" height="9" viewBox="0 0 9 9"><path d="M1.5 4.5 3.5 6.5 7.5 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`
          : "") +
        `</span><span></span><span class="dims"></span>`;
      item.children[1].textContent = d.name;
      item.children[2].textContent = `${d.w}×${d.h}`;
      item.addEventListener("click", () => {
        state.enabled.has(d.id) ? state.enabled.delete(d.id) : state.enabled.add(d.id);
        savePrefs();
        renderDevicePanel();
        renderCards();
      });
      panel.appendChild(item);
    }
  }
  $("#devices-count").textContent = String(state.enabled.size);
}

/* ---------- Toolbar wiring ---------- */

function normalizeUrl(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : "https://" + trimmed;
}

function setMode(synced) {
  state.synced = synced;
  $("#mode-synced").classList.toggle("active", synced);
  $("#mode-solo").classList.toggle("active", !synced);
  savePrefs();
}

function wireToolbar() {
  const input = $("#url-input");
  input.value = state.url;

  $("#url-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const url = normalizeUrl(input.value);
    if (!url) return;
    state.url = url;
    input.value = url;
    history.replaceState(null, "", "?url=" + encodeURIComponent(url));
    renderCards();
  });

  $("#reload").addEventListener("click", () => {
    document.querySelectorAll(".frame").forEach((f) => (f.src = f.src));
  });

  $("#mode-synced").addEventListener("click", () => setMode(true));
  $("#mode-solo").addEventListener("click", () => setMode(false));

  const zoom = $("#zoom");
  zoom.value = state.zoom;
  zoom.addEventListener("change", () => {
    state.zoom = zoom.value;
    savePrefs();
    relayout();
  });

  const devicesBtn = $("#devices-btn");
  const panel = $("#devices-panel");
  devicesBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = panel.hidden;
    panel.hidden = !open;
    devicesBtn.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (e) => {
    if (!panel.hidden && !panel.contains(e.target)) {
      panel.hidden = true;
      devicesBtn.setAttribute("aria-expanded", "false");
    }
  });

  let resizeTimer;
  addEventListener("resize", () => {
    if (state.zoom !== "fit") return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(relayout, 100);
  });
}

/* ---------- Scroll sync relay ---------- */

function wireScrollRelay() {
  chrome.runtime.onMessage.addListener((msg, sender) => {
    if (!msg || msg.type !== "frame-scroll" || !state.synced) return;
    if (!sender.tab || sender.tab.id !== state.tabId) return;
    chrome.tabs.sendMessage(state.tabId, {
      type: "apply-scroll",
      from: msg.from,
      x: msg.x,
      y: msg.y,
    }).catch(() => {});
  });
}

/* ---------- Boot ---------- */

(async function init() {
  await loadPrefs();
  const tab = await chrome.tabs.getCurrent();
  state.tabId = tab.id;

  // Ask the background worker to strip anti-framing headers for this tab
  // before any iframe starts loading.
  try {
    await chrome.runtime.sendMessage({ type: "enable-framing" });
  } catch (e) {
    console.warn("Could not enable framing rules:", e);
  }

  wireToolbar();
  wireScrollRelay();
  setMode(state.synced);
  renderDevicePanel();
  renderCards();
  if (!state.url) $("#url-input").focus();
})();
