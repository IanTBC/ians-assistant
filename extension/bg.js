importScripts("config.js");
// TBC Assistant — background helper: opens and closes tabs for the tool,
// copies text, fetches the update check, keeps menu items for the popup.
const ALLOWED_FETCH = /^https:\/\/raw\.githubusercontent\.com\/IanTBC\/ians-assistant\//;
const sget = (k) => new Promise((r) => chrome.storage.session.get(k, (o) => r(o[k])));
const sset = (o) => new Promise((r) => chrome.storage.session.set(o, r));
// One change at a time, so two quick changes never overwrite each other.
let chain = Promise.resolve();
const serial = (fn) => (chain = chain.then(fn, fn));

async function copy(text) {
  try {
    const has = await chrome.offscreen.hasDocument();
    if (!has) await chrome.offscreen.createDocument({ url: 'offscreen.html', reasons: ['CLIPBOARD'], justification: 'Copy GDS text for the agent' });
  } catch (e) { /* already open */ }
  return chrome.runtime.sendMessage({ to: 'offscreen', op: 'copy', text });
}

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (!msg || msg.to) return false;
  const a = msg.args || {};
  const tab = sender.tab;
  serial(async () => {
    switch (msg.op) {
      case 'open': {
        if (!/^https?:\/\//i.test(a.url || '')) return { tabId: null };
        const opt = { url: a.url, active: !!a.active };
        if (tab && a.insert) opt.index = tab.index + 1;
        if (tab && a.setParent) opt.openerTabId = tab.id;
        const t = await chrome.tabs.create(opt);
        if (tab) { const map = (await sget('opened')) || {}; map[t.id] = tab.id; await sset({ opened: map }); }
        return { tabId: t.id };
      }
      case 'close': { try { await chrome.tabs.remove(a.tabId); } catch (e) { /* gone */ } return { ok: true }; }
      case 'copy': { try { await copy(String(a.text || '')); return { ok: true }; } catch (e) { return { ok: false }; } }
      case 'xhr': {
        if (!ALLOWED_FETCH.test(a.url || '')) return { error: 'not allowed' };
        try {
          const r = await fetch(a.url, { method: a.method || 'GET', headers: a.headers || {}, body: a.data || undefined, cache: 'no-store' });
          const text = await r.text();
          return { status: r.status, statusText: r.statusText, responseText: text, response: text, finalUrl: r.url, responseHeaders: '' };
        } catch (e) { return { error: String(e) }; }
      }
      case 'menu-add': {
        if (!tab) return {};
        const all = (await sget('menus')) || {};
        const list = (all[tab.id] || []).filter((m) => m.id !== a.id && m.caption !== a.caption);
        list.push({ id: a.id, caption: a.caption, frameId: sender.frameId });
        all[tab.id] = list; await sset({ menus: all });
        return {};
      }
      case 'menu-remove': {
        if (!tab) return {};
        const all = (await sget('menus')) || {};
        all[tab.id] = (all[tab.id] || []).filter((m) => m.id !== a.id); await sset({ menus: all });
        return {};
      }
      case 'menu-list': {
        const all = (await sget('menus')) || {};
        return { items: all[a.tabId] || [] };
      }
      case 'menu-run': { try { await chrome.tabs.sendMessage(a.tabId, { to: 'menu', id: a.id }, { frameId: 0 }); } catch (e) { /* tab gone */ } return {}; }
      default: return {};
    }
  }).then(reply, (e) => reply({ error: String(e) }));
  return true;
});

chrome.tabs.onRemoved.addListener((tabId) => serial(async () => {
  const map = (await sget('opened')) || {};
  const opener = map[tabId];
  if (opener != null) {
    delete map[tabId]; await sset({ opened: map });
    try { await chrome.tabs.sendMessage(opener, { to: 'tabclosed', tabId }); } catch (e) { /* opener gone */ }
  }
  const all = (await sget('menus')) || {};
  if (all[tabId]) { delete all[tabId]; await sset({ menus: all }); }
}));
// A reload clears the page's menu items; the page adds them again.
chrome.tabs.onUpdated.addListener((tabId, info) => {
  if (info.status !== 'loading') return;
  serial(async () => {
    const all = (await sget('menus')) || {};
    if (all[tabId]) { delete all[tabId]; await sset({ menus: all }); }
  });
});

chrome.runtime.onInstalled.addListener((d) => {
  if (d.reason === 'install' && typeof WELCOME_URL === 'string' && WELCOME_URL) chrome.tabs.create({ url: WELCOME_URL });
});
