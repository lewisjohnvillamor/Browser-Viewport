// Service worker: opens the viewer for the active tab and manages the
// per-tab header-stripping rules that let arbitrary sites render in iframes.

const RULE_OFFSET = 1000; // rule id = RULE_OFFSET + tabId, so rules stay per-tab

chrome.action.onClicked.addListener((tab) => {
  const url = tab && tab.url && /^https?:/i.test(tab.url) ? tab.url : "";
  chrome.tabs.create({
    url: chrome.runtime.getURL("viewer.html") + (url ? "?url=" + encodeURIComponent(url) : ""),
    index: tab ? tab.index + 1 : undefined,
  });
});

// The viewer asks us to allow framing inside its own tab. Session rules with a
// tabIds condition keep the header stripping scoped to that single tab and to
// sub-frame requests only — normal browsing is untouched.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === "enable-framing" && sender.tab) {
    const tabId = sender.tab.id;
    chrome.declarativeNetRequest.updateSessionRules({
      removeRuleIds: [RULE_OFFSET + tabId],
      addRules: [
        {
          id: RULE_OFFSET + tabId,
          priority: 1,
          condition: {
            tabIds: [tabId],
            resourceTypes: ["sub_frame"],
          },
          action: {
            type: "modifyHeaders",
            responseHeaders: [
              { header: "x-frame-options", operation: "remove" },
              { header: "content-security-policy", operation: "remove" },
              { header: "content-security-policy-report-only", operation: "remove" },
            ],
          },
        },
      ],
    }).then(() => sendResponse({ ok: true }), (e) => sendResponse({ ok: false, error: String(e) }));
    return true; // async response
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.declarativeNetRequest.updateSessionRules({
    removeRuleIds: [RULE_OFFSET + tabId],
  }).catch(() => {});
});
