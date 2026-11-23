const mf = chrome.runtime.getManifest();
document.getElementById('name').textContent = mf.name;
document.getElementById('ver').textContent = 'Version ' + (mf.version_name || mf.version);
if (typeof GUIDE_URL === 'string' && GUIDE_URL) document.getElementById('guide').href = GUIDE_URL;
else document.querySelector('.foot').style.display = 'none';
const matches = (mf.content_scripts || []).flatMap((c) => c.matches || []);
const toRe = (p) => {
  const m = /^(\*|https?):\/\/([^/]+)(\/.*)$/.exec(p); if (!m) return null;
  const esc = (s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  const scheme = m[1] === '*' ? 'https?' : m[1];
  const host = m[2] === '*' ? '[^/]+' : m[2].startsWith('*.') ? '(?:[^/]+\\.)?' + esc(m[2].slice(2)) : esc(m[2]);
  return new RegExp('^' + scheme + '://' + host + esc(m[3]).replace(/\\\*/g, '.*') + '$');
};
chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
  const on = !!(tab && tab.url && matches.some((p) => { const r = toRe(p); return r && r.test(tab.url); }));
  const st = document.getElementById('state');
  st.classList.toggle('on', on);
  document.getElementById('stateText').textContent = on ? 'Working on this page' : 'Not used on this page';
  if (!tab) return;
  const res = await chrome.runtime.sendMessage({ op: 'menu-list', args: { tabId: tab.id } });
  const box = document.getElementById('menu');
  (res && res.items || []).forEach((it) => {
    const b = document.createElement('button');
    b.textContent = it.caption;
    b.addEventListener('click', async () => {
      await chrome.runtime.sendMessage({ op: 'menu-run', args: { tabId: tab.id, id: it.id } });
      setTimeout(() => window.close(), 150);
    });
    box.appendChild(b);
  });
});
