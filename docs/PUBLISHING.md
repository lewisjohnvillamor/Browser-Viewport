# Publishing to the Chrome Web Store

Everything below is copy-paste ready. The upload zip is built with:

```sh
zip -r viewports-$(node -p "require('./manifest.json').version").zip \
  manifest.json background.js viewer.html viewer.css viewer.js \
  sync.js devices.js icons LICENSE
```

(Only runtime files — no docs, README, or git history.)

## One-time setup

1. Go to the [Chrome Web Store Developer Console](https://chrome.google.com/webstore/devconsole)
   and sign in with the Google account that should own the listing.
2. Pay the one-time **$5 developer registration fee** and verify your email.
3. Under **Account**, complete the **trader / non-trader declaration**
   (required in many regions; "non-trader" fits a free hobby extension).

## Creating the listing

1. **Add new item** → upload the zip.
2. **Store listing tab**
   - Category: **Developer Tools**
   - Language: English
   - Short description (≤132 chars):
     > Preview any page on phones, tablets, laptops and desktops at once — with synced scrolling, clicks and typing across viewports.
   - Detailed description: adapt the README's intro + Features section.
   - Store icon: `icons/icon128.png`
   - Screenshots: the four 1280×800 PNGs in `docs/store/` (generated from
     real usage; CWS requires 1280×800 or 640×400, no alpha channel).
3. **Privacy tab** — this is what reviewers read most carefully:
   - **Single purpose**: "Preview the current web page in multiple device
     viewports side by side for responsive design testing."
   - **Permission justifications**:
     - `host_permissions <all_urls>`: "The user chooses any URL to preview.
       The extension must load that page into iframes in its own viewer tab
       and inject its synchronization content script into those frames.
       Which sites are accessed is entirely user-initiated."
     - `declarativeNetRequest`: "Removes X-Frame-Options and CSP response
       headers only for sub-frame requests inside the extension's own
       viewer tab, so the user-chosen page can render in iframes. The rule
       is session-scoped to that single tab and deleted when it closes;
       normal browsing is never modified."
     - `storage`: "Persists the user's device selection, card order, zoom
       level and scroll mode locally. No data leaves the browser."
     - Content script on `<all_urls>`: "Required so the sync script exists
       in whatever page the user previews. It exits immediately unless its
       parent frame is the extension's own viewer page (verified via
       ancestorOrigins), so it is inert during normal browsing."
   - **Remote code**: none. **Data collection**: select "does not collect
     or use data" throughout.
   - Privacy policy URL:
     `https://github.com/lewisjohnvillamor/Browser-Viewport/blob/main/PRIVACY.md`
4. **Distribution tab**: Public (or Unlisted for a soft launch), choose
   regions (all is fine).
5. **Submit for review.**

## What to expect from review

- The broad `<all_urls>` host permission puts the extension into in-depth
  review; expect several days rather than hours. The justifications above
  address exactly what reviewers check: why the breadth is needed and how
  the risky capability (header stripping) is scoped.
- If rejected, the email states the policy section; fix, bump the patch
  version in `manifest.json`, re-zip, re-upload.

## Releasing updates

1. Bump `"version"` in `manifest.json` (CWS refuses a re-used version).
2. Re-run the zip command, upload via **Package → Upload new package**,
   and submit. Existing users update automatically within hours of
   approval.
