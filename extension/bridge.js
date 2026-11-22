// TBC Assistant — bridge (extension side).
// Keeps the tool's saved settings in Chrome's extension storage and passes
// them to the tool on the page. Runs before the page loads.
(() => {
  if (window.__tbcxBridge) return;
  window.__tbcxBridge = true;
  const D = document;
  const send = (type, obj) => D.dispatchEvent(new CustomEvent('tbcx:' + type, { detail: JSON.stringify(obj) }));
  let data = null, hello = false, started = false;
  const start = () => {
    if (started || !data || !hello) return;
    started = true;
    send('init', { data });
  };
  chrome.storage.local.get(null, (all) => { data = all || {}; start(); });
  D.addEventListener('tbcx:hello', () => { hello = true; start(); });

  // Writes from the tool. Values arrive already turned into text (JSON).
  D.addEventListener('tbcx:set', (e) => {
    let m; try { m = JSON.parse(e.detail); } catch (err) { return; }
    if (!m || typeof m.k !== 'string') return;
    if (m.v === null || m.v === undefined) chrome.storage.local.remove(m.k);
    else chrome.storage.local.set({ [m.k]: m.v });
  });
  // Changes made in other tabs.
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !started) return;
    for (const k of Object.keys(changes)) {
      const nv = changes[k].newValue;
      send('changed', { k, v: nv === undefined ? null : nv });
    }
  });
  // Styles are added from here, so a website's own rules can't block them.
  D.addEventListener('tbcx:style', (e) => {
    let m; try { m = JSON.parse(e.detail); } catch (err) { return; }
    const s = D.createElement('style');
    s.setAttribute('data-tbcx-style', m.id);
    s.textContent = m.css;
    (D.head || D.documentElement).appendChild(s);
  });
  // Things only the extension can do: open/close tabs, copy, download the
  // update check, Tampermonkey-style menu items.
  D.addEventListener('tbcx:rpc', (e) => {
    let m; try { m = JSON.parse(e.detail); } catch (err) { return; }
    if (!m || !m.op) return;
    try {
      chrome.runtime.sendMessage({ op: m.op, args: m.args || {} }, (res) => {
        void chrome.runtime.lastError;
        if (m.id) send('rpc-res', { id: m.id, res: res === undefined ? null : res });
      });
    } catch (err) { if (m.id) send('rpc-res', { id: m.id, res: { error: String(err) } }); }
  });
  chrome.runtime.onMessage.addListener((msg) => {
    if (!msg || !msg.to) return;
    if (msg.to === 'tabclosed') send('tabclosed', { tabId: msg.tabId });
    if (msg.to === 'menu' && window.top === window) send('menu-run', { id: msg.id });
  });
})();
