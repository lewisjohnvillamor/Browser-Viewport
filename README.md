# Viewports — Multi-Device Preview

A deliberately lightweight Chrome extension for developers: open any page in a
grid of device viewports — phones, tablets, laptops, desktops, big screens —
side by side in one tab, and scroll them together or individually.

No frameworks, no build step, no bundler, no dependencies. Six small files of
vanilla JS/CSS.

![Extension icon](icons/icon128.png)

## Install

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome (or any Chromium browser).
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select this folder.
5. Visit any page and click the **Viewports** toolbar icon.

## Use

- **Toolbar icon** — opens the current page in the multi-viewport grid.
- **URL bar** — type any URL and press Enter to preview it in every device.
- **Synced / Solo** — scroll every viewport together (proportionally, so
  different page heights stay aligned), or scroll each one on its own.
- **Zoom** — `Fit` scales everything uniformly so the widest enabled device
  fits your window (relative device sizes stay honest); or pick a fixed zoom.
- **Devices** — toggle devices on/off, grouped by phones, tablets, laptops
  and desktops (iPhone, Pixel, Galaxy, iPad, Surface, MacBook, Windows
  laptop, Desktop HD/2K/4K).
- **Per-device controls** — rotate to landscape, or hide a device.
- Your device selection, zoom, and scroll mode persist between sessions.

## How it works

- `background.js` — service worker. Opens the viewer and registers a
  `declarativeNetRequest` **session rule scoped to the viewer's tab and to
  sub-frame requests only**, which strips `X-Frame-Options` and
  `Content-Security-Policy` response headers so sites that forbid framing can
  still render. Normal browsing is never touched; the rule is removed when
  the tab closes.
- `viewer.html/css/js` — the grid UI. Each device is a real `<iframe>` at its
  true CSS viewport size, scaled down with a CSS transform, so media queries
  and responsive layouts behave exactly as they would on the device.
- `sync.js` — a tiny content script that activates **only** inside frames
  embedded in this extension's viewer (verified via `ancestorOrigins`). It
  reports scroll positions as ratios and applies incoming ones; the viewer
  relays messages between frames when Synced mode is on.
- `devices.js` — the device catalog. Add your own device by adding one line.

## Known limitations

- Per-iframe user-agent / touch emulation isn't possible from an extension,
  so sites that UA-sniff may serve their desktop variant everywhere. Media
  queries, viewport widths and responsive CSS all behave correctly.
- Iframes are a third-party context: sites with strict cookie policies may
  treat you as logged out.
- Pages using JavaScript frame-busting (rare today) may refuse to render.
