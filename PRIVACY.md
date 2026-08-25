# Privacy Policy — Viewports (Multi-Device Preview)

Last updated: 2026-08-25

Viewports does not collect, store, transmit, or sell any user data. Period.

- **No data leaves your browser.** The extension has no server, makes no
  network requests of its own, and contains no analytics, telemetry, or
  tracking of any kind.
- **What is stored locally:** your device selection, card order, zoom level,
  and scroll mode are saved with `chrome.storage.local` on your own machine
  so the viewer remembers your setup. This data never leaves your browser.
- **Page content is never read or transmitted.** The content script that
  synchronizes scrolling and interactions runs only inside the extension's
  own preview tab and relays positions and element identifiers between the
  preview frames within that tab. On every other page it exits immediately
  without doing anything.
- **Header modification is scoped.** The extension removes anti-framing
  response headers (`X-Frame-Options`, `Content-Security-Policy`) only for
  sub-frame requests inside its own preview tab, so the page you chose to
  preview can render in iframes. Normal browsing is never affected; the rule
  is deleted when the preview tab closes.

If you have questions, open an issue at
https://github.com/lewisjohnvillamor/Browser-Viewport/issues.
