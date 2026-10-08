// ==UserScript==
// @name         Ian's Assistant
// @namespace    ians-assistant
// @version      1.9.0
// @updateURL    https://raw.githubusercontent.com/IanTBC/ians-assistant/main/IansAssistant.user.js
// @downloadURL  https://raw.githubusercontent.com/IanTBC/ians-assistant/main/IansAssistant.user.js
// @description  Ian's Assistant — Sabre *IA/VI* GDS toolkit for agents: copy button for flight sites, CRM Sort Me / Merge / quick Sell edit / search panel, Send to lead, power dialer + RingCentral texting, lead sniper (Alt+Z or Alt+X). Dark dashboard design.
// @match        *://*.flybasis.com/*
// @match        *://agentsearch.vercel.app/*
// @match        *://*.awardlogic.com/*
// @match        *://*.pointsyeah.com/*
// @match        *://matrix.itasoftware.com/*
// @match        *://*.kayak.com/*
// @match        *://*.cheapoair.com/*
// @match        https://www.google.com/travel/flights*
// @match        https://bo.travelbusinessclass.com/*
// @match        https://bo.tmgbo.com/*
// @match        *://*.tmgbo.com/*
// @match        https://apps.ringcentral.com/integration/ringcentral-embeddable/*
// @match        https://app.ringcentral.com/*
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        unsafeWindow
// @grant        GM_openInTab
// @grant        GM_removeValueChangeListener
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @author       Ian Brown
// @run-at       document-idle
// ==/UserScript==

/*
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  Ian's Assistant                                  © Ian Brown     │
 * │  Sabre GDS, BO and calling toolkit for Travel Business Class     │
 * │  agents. Guide and install: https://iantbc.github.io/ians-assistant/ │
 * └──────────────────────────────────────────────────────────────────┘
 *
 *  How this file is laid out
 *    SHARED LOOK ............ colours for Dark / Light / Navy, and Pip
 *    UPDATE NOTICE .......... "new version available" banner
 *    SECTION 1 .............. flight sites: GDS copy, Lead ID, Sell box
 *    SECTIONS 2-3 ........... the BO: Add option tools, search panel, flags
 *    SECTION 4 .............. the assistant panel: dialer, texting, Pip
 *    SECTIONS 5-9 ........... lead sniper, RingCentral helpers, checks
 *
 *  Saved settings keep their original key names on purpose, so agents
 *  never lose their templates, theme or progress when they update.
 */


// ====================================================================
// SHARED LOOK — mode (dark / light / navy) + accent colour, used by every
// part of the script (panel, flight-site pop-up, banners). The panel's
// CSS below mirrors these same values.
// ====================================================================
var IA_MODES = {"dark": {"bg": "#0e0f13", "card": "transparent", "cardbd": "#23252d", "field": "#15171d", "line": "#23252d", "line2": "#2c2f38", "text": "#e8e8ed", "title": "#f4f4f7", "muted": "#8a8d98", "sec": "#c9cad3", "head": "#e8e8ed", "eye": "#0e0f13", "onacc": "#0e0f13", "ok": "#4ade80", "bad": "#f8717f", "stop": "#e5484d", "foot": "#5d6070", "shadow": "0 18px 44px rgba(0,0,0,.55)"}, "light": {"bg": "#ffffff", "card": "#f6f6f8", "cardbd": "#f6f6f8", "field": "#f6f6f8", "line": "#e4e4e9", "line2": "#e4e4e9", "text": "#18181b", "title": "#18181b", "muted": "#6b6b76", "sec": "#3f3f46", "head": "#3f3f46", "eye": "#ffffff", "onacc": "#ffffff", "ok": "#16a34a", "bad": "#dc3e42", "stop": "#dc3e42", "foot": "#a1a1aa", "shadow": "0 14px 36px rgba(15,23,42,.18)"}, "navy": {"bg": "#0b1628", "card": "#10203a", "cardbd": "#1c2e4d", "field": "#10203a", "line": "#1c2e4d", "line2": "#23395e", "text": "#e6edf7", "title": "#f1f5fb", "muted": "#8aa0bf", "sec": "#c4d2e6", "head": "#e6edf7", "eye": "#0b1628", "onacc": "#0b1628", "ok": "#4ade80", "bad": "#ff8a8a", "stop": "#e5484d", "foot": "#5b7092", "shadow": "0 18px 44px rgba(2,8,23,.6)"}};
var IA_ACCENTS = {"midnight": ["#7c7cf8", "#5b5bd6", "#7c9cff"], "teal": ["#2dd4bf", "#0f766e", "#5eead4"], "pink": ["#f472b6", "#db2777", "#f9a8d4"], "black": ["#e4e4e7", "#27272a", "#e6edf7"], "gold": ["#f5b544", "#b45309", "#fcd34d"], "rainbow": ["#a78bfa", "#7c3aed", "#c4b5fd"]};
function iaMode() {
  let m = 'dark';
  try { m = GM_getValue('ia-mode', 'dark'); } catch (e) { /* ignore */ }
  return IA_MODES[m] ? m : 'dark';
}
function iaPalette() {
  const mode = iaMode();
  let t = 'midnight';
  try { t = GM_getValue('bmo-theme', 'midnight'); } catch (e) { /* ignore */ }
  const acc = (IA_ACCENTS[t] || IA_ACCENTS.midnight)[['dark', 'light', 'navy'].indexOf(mode)];
  return Object.assign({ mode, acc }, IA_MODES[mode]);
}
// Small Pip (body + eyes) built with DOM calls, so it works on sites that
// block innerHTML (Google's Trusted Types).
function iaPipNode(size, p) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '10 10 76 80');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(Math.round(size * 80 / 76)));
  svg.setAttribute('aria-hidden', 'true');
  const body = document.createElementNS(NS, 'path');
  body.setAttribute('d', 'M22 70 L22 38 Q22 26 34 26 L62 26 Q74 26 74 38 L74 62 Q74 74 62 74 L40 74 L30 84 L31 74 Q22 73 22 70 Z');
  body.setAttribute('fill', p.acc);
  svg.appendChild(body);
  [40, 56].forEach((cx) => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', String(cx)); c.setAttribute('cy', '47'); c.setAttribute('r', '4.5'); c.setAttribute('fill', p.eye);
    svg.appendChild(c);
  });
  return svg;
}


// ====================================================================
// UPDATE NOTICE — tells agents when a newer version is published.
// Set UPDATE_URL to the gist's raw link (the same one used for
// @updateURL / @downloadURL). Every 30 minutes it reads the published
// @version; if it's newer than the installed one, a small banner offers
// a one-click "Update" (opens Tampermonkey's install screen). While
// UPDATE_URL is empty this does nothing.
// ====================================================================
(function updateNotice() {
  const UPDATE_URL = 'https://raw.githubusercontent.com/IanTBC/ians-assistant/main/IansAssistant.user.js';
  if (!UPDATE_URL || window.top !== window) return;
  if (/ringcentral\.com$/.test(location.hostname)) return;
  const CHECK_KEY = 'ia-update-checked';
  const SNOOZE_KEY = 'ia-update-snooze';
  const installed = (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) || '0';
  const newer = (a, b) => {
    const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number);
    for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d > 0; }
    return false;
  };
  function showBanner(version) {
    if (!document.body || document.getElementById('ia-update-banner')) return;
    try { if (Date.now() < Number(GM_getValue(SNOOZE_KEY + version, 0))) return; } catch (e) { /* ignore */ }
    const p = iaPalette();
    const box = document.createElement('div');
    box.id = 'ia-update-banner';
    box.style.cssText = "position:fixed;left:16px;bottom:16px;z-index:2147483647;display:flex;align-items:center;gap:10px;background:" + p.bg + ";color:" + p.text + ";border:1px solid " + p.line + ";border-radius:10px;padding:9px 11px;font:500 12.5px Inter,'Segoe UI',system-ui,sans-serif;box-shadow:" + p.shadow + ";";
    const txt = document.createElement('span');
    txt.textContent = "Ian's Assistant " + version + ' is available';
    const go = document.createElement('button');
    go.textContent = 'Update';
    go.style.cssText = 'border:0;border-radius:6px;padding:6px 12px;background:' + p.acc + ';color:' + p.onacc + ';font:600 12px inherit;cursor:pointer;';
    const later = document.createElement('button');
    later.textContent = 'Later';
    later.style.cssText = 'border:1px solid ' + p.line2 + ';border-radius:6px;padding:5px 10px;background:transparent;color:' + p.muted + ';font:600 12px inherit;cursor:pointer;';
    go.addEventListener('click', () => {
      try { GM_openInTab(UPDATE_URL + '?v=' + encodeURIComponent(version), { active: true }); } catch (e) { window.open(UPDATE_URL, '_blank'); }
      box.remove();
    });
    later.addEventListener('click', () => {
      try { GM_setValue(SNOOZE_KEY + version, Date.now() + 3600e3); } catch (e) { /* ignore */ }
      box.remove();
    });
    box.append(iaPipNode(18, p), txt, go, later);
    document.body.appendChild(box);
  }
  function check() {
    let last = 0;
    try { last = Number(GM_getValue(CHECK_KEY, 0)) || 0; } catch (e) { /* ignore */ }
    let known = '';
    try { known = GM_getValue('ia-update-latest', ''); } catch (e) { /* ignore */ }
    if (known && newer(known, installed)) showBanner(known);
    if (Date.now() - last < 2 * 60e3) return; // one check every 2 minutes, shared by all tabs
    try { GM_setValue(CHECK_KEY, Date.now()); } catch (e) { /* ignore */ }
    try {
      GM_xmlhttpRequest({
        method: 'GET', url: UPDATE_URL + '?t=' + Date.now(), nocache: true,
        onload: (r) => {
          if (r.status !== 200) return;
          const m = String(r.responseText).match(/@version\s+([\d.]+)/);
          if (!m) return;
          try { GM_setValue('ia-update-latest', m[1]); } catch (e) { /* ignore */ }
          if (newer(m[1], installed)) showBanner(m[1]);
        },
      });
    } catch (e) { /* ignore */ }
  }
  setTimeout(check, 3000);
  setInterval(check, 60e3);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
})();


// ====================================================================
// SECTION 1 · Flight-search-site GDS *IA/VI* copy button
// (ITA Matrix, FlyBasis/agentsearch, PointsYeah, AwardLogic, Kayak,
// CheapOair, Google Flights)
// ====================================================================
// ------------------------------------------------------------------
// SHARED *IA/VI* BUILD ENGINE (data + pure helpers only) — used by both
// the flight-search-site adapters below and the CRM's own terminal
// flight-list builder further down. Declared once here, at true
// top-level scope (outside every IIFE below), rather than as two full
// copies inside each one — those two copies used to be byte-for-byte
// identical, so this removes one of them without changing behavior
// anywhere. Two things intentionally stay OUT of this shared block,
// each still duplicated in its own IIFE: CONFIG (its STATUS_CODE
// genuinely differs between the two — GK for award sites, SS
// otherwise, vs. always GK), and buildIALine/buildVILines/buildBoth/
// bookingClass (they read that CONFIG, so hoisting them here would
// mean they could no longer see either copy of it).
// ------------------------------------------------------------------
const EQUIP_MAP = {
    'airbus a319': '319', 'airbus a320-100/200': '320', 'airbus a320neo': '32N', 'airbus a321': '321',
    'airbus a321neo': '32Q', 'airbus a330': '333', 'airbus a330-200': '332', 'airbus a330-300': '333', 'airbus a330-900neo': '339',
    'airbus a350-900': '359', 'airbus a350-1000': '351', 'boeing 737-800': '738', 'boeing 737 max 8': '7M8',
    'boeing 737 max 9': '7M9', 'boeing 767-300': '763', 'boeing 767-300 (winglets)': '763',
    'boeing 777': '777', 'boeing 777-200er': '772', 'boeing 777-300er': '77W', 'boeing 777-300 er': '77W',
    'boeing 777-200 er': '772', 'boeing 787': '788', 'boeing 787-8': '788', 'boeing 787-9': '789', 'boeing 787-10': '781',
    'airbus a321neolr': '32S', 'airbus a321lr': '32S'
  };

const ALLIANCE_MAP = {
    AA: 'ONEWORLD', BA: 'ONEWORLD', IB: 'ONEWORLD', QF: 'ONEWORLD', CX: 'ONEWORLD', JL: 'ONEWORLD', QR: 'ONEWORLD', AY: 'ONEWORLD', MH: 'ONEWORLD',
    UA: 'STAR ALLIANCE', LH: 'STAR ALLIANCE', NH: 'STAR ALLIANCE', SQ: 'STAR ALLIANCE', AC: 'STAR ALLIANCE', TG: 'STAR ALLIANCE', OS: 'STAR ALLIANCE', LX: 'STAR ALLIANCE',
    DL: 'SKYTEAM', AF: 'SKYTEAM', KL: 'SKYTEAM', KE: 'SKYTEAM', SV: 'SKYTEAM', AZ: 'SKYTEAM', VN: 'SKYTEAM', AT: 'ONEWORLD'
  };

const AIRPORT_COORDS = {
    JFK:[40.6413,-73.7781], EWR:[40.6895,-74.1745], LGA:[40.7769,-73.8740], BOS:[42.3656,-71.0096],
    IAD:[38.9531,-77.4565], DCA:[38.8512,-77.0402], BWI:[39.1774,-76.6684], PHL:[39.8744,-75.2424],
    ORD:[41.9742,-87.9073], ATL:[33.6407,-84.4277], MIA:[25.7959,-80.2870], MCO:[28.4312,-81.3081],
    FLL:[26.0726,-80.1527], TPA:[27.9772,-82.5311], DFW:[32.8998,-97.0403], IAH:[29.9902,-95.3368],
    AUS:[30.1975,-97.6664], DEN:[39.8561,-104.6737], LAX:[33.9416,-118.4085], SFO:[37.6213,-122.3790],
    SAN:[32.7338,-117.1933], SEA:[47.4502,-122.3088], PDX:[45.5898,-122.5951], LAS:[36.0840,-115.1537],
    PHX:[33.4342,-112.0116], SLC:[40.7899,-111.9791], MSP:[44.8848,-93.2223], DTW:[42.2124,-83.3534],
    CLT:[35.2140,-80.9431], MSY:[29.9934,-90.2580], STL:[38.7487,-90.3700], MCI:[39.2976,-94.7139],
    PIT:[40.4915,-80.2329], CLE:[41.4117,-81.8498], IND:[39.7173,-86.2944], CMH:[39.9980,-82.8919],
    BNA:[36.1245,-86.6782], MEM:[35.0424,-89.9767], JAX:[30.4941,-81.6879], RDU:[35.8776,-78.7875],
    SAT:[29.5337,-98.4698], ELP:[31.8072,-106.3781], SJC:[37.3626,-121.9291], OAK:[37.7126,-122.2197],
    SNA:[33.6757,-117.8682], ONT:[34.0560,-117.6012], BUR:[34.2007,-118.3587], HNL:[21.3245,-157.9251],
    YVR:[49.1947,-123.1792], YYZ:[43.6777,-79.6248], YUL:[45.4706,-73.7408], YYC:[51.1215,-114.0076],
    MEX:[19.4363,-99.0721], CUN:[21.0365,-86.8771], PTY:[9.0714,-79.3835], BOG:[4.7016,-74.1469],
    LIM:[-12.0219,-77.1143], GRU:[-23.4356,-46.4731], GIG:[-22.8100,-43.2506], EZE:[-34.8222,-58.5358],
    SCL:[-33.3930,-70.7858], BKO:[12.5335,-7.9498],
    LHR:[51.4700,-0.4543], LGW:[51.1481,-0.1903], MAN:[53.3537,-2.2750], CDG:[49.0097,2.5479],
    ORY:[48.7262,2.3652], AMS:[52.3105,4.7683], FRA:[50.0379,8.5622], MUC:[48.3538,11.7861],
    DUS:[51.2895,6.7668], BER:[52.3667,13.5033], ZRH:[47.4647,8.5492], GVA:[46.2381,6.1090],
    VIE:[48.1103,16.5697], MAD:[40.4983,-3.5676], BCN:[41.2971,2.0785], LIS:[38.7813,-9.1359],
    FCO:[41.8003,12.2389], MXP:[45.6306,8.7281], VCE:[45.5053,12.3519], ATH:[37.9364,23.9445],
    IST:[41.2753,28.7519], SAW:[40.8986,29.3092], CPH:[55.6180,12.6560], ARN:[59.6519,17.9186],
    OSL:[60.1976,11.1004], HEL:[60.3172,24.9633], DUB:[53.4213,-6.2701], BRU:[50.9014,4.4844],
    WAW:[52.1657,20.9671], PRG:[50.1008,14.2600], BUD:[47.4298,19.2611], KEF:[63.9850,-22.6056],
    DXB:[25.2532,55.3657], AUH:[24.4330,54.6511], DOH:[25.2731,51.6081], RUH:[24.9576,46.6988],
    JED:[21.6796,39.1565], CAI:[30.1219,31.4056], JNB:[-26.1392,28.2460], CPT:[-33.9648,18.6017],
    NBO:[-1.3192,36.9278], LOS:[6.5774,3.3212], ADD:[8.9779,38.7993],
    HND:[35.5494,139.7798], NRT:[35.7720,140.3929], KIX:[34.4347,135.2440], ICN:[37.4602,126.4407],
    PVG:[31.1443,121.8083], PEK:[40.0799,116.6031], PKX:[39.5098,116.4109], HKG:[22.3080,113.9185],
    TPE:[25.0777,121.2328], SIN:[1.3644,103.9915], BKK:[13.6900,100.7501], KUL:[2.7456,101.7099],
    CGK:[-6.1256,106.6559], MNL:[14.5086,121.0198], DEL:[28.5562,77.1000], BOM:[19.0887,72.8679],
    BLR:[13.1986,77.7066], MAA:[12.9941,80.1709], HYD:[17.2403,78.4294], CCU:[22.6547,88.4467],
    SYD:[-33.9399,151.1753], MEL:[-37.6690,144.8410], BNE:[-27.3842,153.1175], PER:[-31.9403,115.9669],
    AKL:[-37.0082,174.7850],
    CMB:[7.1808,79.8841], MLE:[4.1918,73.5290], KTM:[27.6966,85.3591], DAC:[23.8433,90.3978],
    ISB:[33.5491,72.8256], KHI:[24.9065,67.1608], LHE:[31.5216,74.4036], AMM:[31.7226,35.9932],
    BEY:[33.8209,35.4884], TLV:[32.0114,34.8867], ALG:[36.6910,3.2154], TUN:[36.8510,10.2272],
    CMN:[33.3675,-7.5900], ACC:[5.6052,-0.1668], DKR:[14.7397,-17.4902], DAR:[-6.8781,39.2026],
    EBB:[0.0424,32.4436], HRE:[-17.9318,31.0928], MRU:[-20.4302,57.6836], SDQ:[18.4297,-69.6689],
    PUJ:[18.5674,-68.3634], SJO:[9.9981,-84.2041], GUA:[14.5833,-90.5275],
    UIO:[-0.1292,-78.3575], CCS:[10.6031,-66.9906], ASU:[-25.2400,-57.5200], MVD:[-34.8384,-56.0308],
    NAN:[-17.7554,177.4434], PPT:[-17.5537,-149.6069], GUM:[13.4834,144.7960], HKT:[8.1132,98.3169],
    RGN:[16.9073,96.1332], VTE:[17.9883,102.5633], PNH:[11.5466,104.8441],
    DPS:[-8.7482,115.1672], CNX:[18.7669,98.9626],
  };

function haversineMiles(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Earth radius, miles
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

const CONTINENT_OF = {
    JFK:'NA',EWR:'NA',LGA:'NA',BOS:'NA',IAD:'NA',DCA:'NA',BWI:'NA',PHL:'NA',ORD:'NA',ATL:'NA',
    MIA:'NA',MCO:'NA',FLL:'NA',TPA:'NA',DFW:'NA',IAH:'NA',AUS:'NA',DEN:'NA',LAX:'NA',SFO:'NA',
    SAN:'NA',SEA:'NA',PDX:'NA',LAS:'NA',PHX:'NA',SLC:'NA',MSP:'NA',DTW:'NA',CLT:'NA',MSY:'NA',
    STL:'NA',MCI:'NA',PIT:'NA',CLE:'NA',IND:'NA',CMH:'NA',BNA:'NA',MEM:'NA',JAX:'NA',RDU:'NA',
    SAT:'NA',ELP:'NA',SJC:'NA',OAK:'NA',SNA:'NA',ONT:'NA',BUR:'NA',HNL:'NA',YVR:'NA',YYZ:'NA',
    YUL:'NA',YYC:'NA',MEX:'NA',CUN:'NA',SDQ:'NA',PUJ:'NA',SJO:'NA',GUA:'NA',
    PTY:'SA',BOG:'SA',LIM:'SA',GRU:'SA',GIG:'SA',EZE:'SA',SCL:'SA',UIO:'SA',CCS:'SA',ASU:'SA',MVD:'SA',
    LHR:'EU',LGW:'EU',MAN:'EU',CDG:'EU',ORY:'EU',AMS:'EU',FRA:'EU',MUC:'EU',DUS:'EU',BER:'EU',
    ZRH:'EU',GVA:'EU',VIE:'EU',MAD:'EU',BCN:'EU',LIS:'EU',FCO:'EU',MXP:'EU',VCE:'EU',ATH:'EU',
    IST:'EU',SAW:'EU',CPH:'EU',ARN:'EU',OSL:'EU',HEL:'EU',DUB:'EU',BRU:'EU',WAW:'EU',PRG:'EU',
    BUD:'EU',KEF:'EU',
    CAI:'AF',JNB:'AF',CPT:'AF',NBO:'AF',LOS:'AF',ADD:'AF',ALG:'AF',TUN:'AF',CMN:'AF',ACC:'AF',
    DKR:'AF',DAR:'AF',EBB:'AF',HRE:'AF',MRU:'AF',
    DXB:'AS',AUH:'AS',DOH:'AS',RUH:'AS',JED:'AS',AMM:'AS',BEY:'AS',TLV:'AS',HND:'AS',NRT:'AS',
    KIX:'AS',ICN:'AS',PVG:'AS',PEK:'AS',PKX:'AS',HKG:'AS',TPE:'AS',SIN:'AS',BKK:'AS',KUL:'AS',
    CGK:'AS',MNL:'AS',DEL:'AS',BOM:'AS',BLR:'AS',MAA:'AS',HYD:'AS',CCU:'AS',CMB:'AS',MLE:'AS',
    KTM:'AS',DAC:'AS',ISB:'AS',KHI:'AS',LHE:'AS',RGN:'AS',VTE:'AS',PNH:'AS',DPS:'AS',CNX:'AS',HKT:'AS',
    SYD:'OC',MEL:'OC',BNE:'OC',PER:'OC',AKL:'OC',NAN:'OC',PPT:'OC',GUM:'OC',
    // Continent-only tags below — not in AIRPORT_COORDS (no precise coords
    // kept for these), but classified so they still hit the continent-pair
    // fallback instead of falling all the way through to the flat global
    // guess. This is where this tier actually earns its keep — the codes
    // above are already covered exactly, so this list is what makes the
    // fallback tier do anything at all rather than being dead weight.
    YOW:'NA',YEG:'NA',YWG:'NA',ANC:'NA',OGG:'NA',KOA:'NA',SJU:'NA',MSN:'NA',GRR:'NA',OMA:'NA',
    TUL:'NA',OKC:'NA',BHM:'NA',RSW:'NA',PBI:'NA',ABQ:'NA',TUS:'NA',BOI:'NA',GEG:'NA',SMF:'NA',RNO:'NA',
    BSB:'SA',REC:'SA',FOR:'SA',CNF:'SA',POA:'SA',VVI:'SA',LPB:'SA',CUZ:'SA',MDE:'SA',CLO:'SA',GYE:'SA',
    NCE:'EU',LYS:'EU',TLS:'EU',MRS:'EU',BLQ:'EU',NAP:'EU',PMI:'EU',AGP:'EU',SVQ:'EU',BIO:'EU',
    PSA:'EU',TRN:'EU',STR:'EU',HAM:'EU',HAJ:'EU',NUE:'EU',KRK:'EU',GDN:'EU',LJU:'EU',ZAG:'EU',
    SOF:'EU',OTP:'EU',BEG:'EU',SKG:'EU',LCA:'EU',PFO:'EU',
    LAD:'AF',MPM:'AF',WDH:'AF',GBE:'AF',LUN:'AF',RUN:'AF',SEZ:'AF',
    SGN:'AS',HAN:'AS',URC:'AS',CAN:'AS',SZX:'AS',CTU:'AS',XIY:'AS',WUH:'AS',NKG:'AS',TAO:'AS',
    DLC:'AS',SHE:'AS',HRB:'AS',KMG:'AS',CSX:'AS',FUK:'AS',CTS:'AS',OKA:'AS',NGO:'AS',KMQ:'AS',
    CJU:'AS',PUS:'AS',GMP:'AS',TAS:'AS',ALA:'AS',BAK:'AS',GYD:'AS',TBS:'AS',EVN:'AS',
    CHC:'OC',WLG:'OC',ZQN:'OC',CNS:'OC',OOL:'OC',ADL:'OC',CBR:'OC',HBA:'OC',DRW:'OC',
  };

const CONTINENT_AVG_MILES = {
    'NA-NA': 1400, 'SA-SA': 1600, 'EU-EU': 900, 'AF-AF': 1800, 'AS-AS': 2200, 'OC-OC': 1600,
    'NA-SA': 3300, 'EU-NA': 4300, 'AF-NA': 6500, 'AS-NA': 7200, 'NA-OC': 7600,
    'EU-SA': 5500, 'AF-SA': 4500, 'AS-SA': 10500, 'OC-SA': 8200,
    'AF-EU': 3000, 'AS-EU': 4800, 'EU-OC': 10500,
    'AF-AS': 4200, 'AF-OC': 7600,
    'AS-OC': 4200,
  };

const GLOBAL_AVG_MILES = 4000;

function lookupDistance(origin, dest) {
    const a = AIRPORT_COORDS[origin];
    const b = AIRPORT_COORDS[dest];
    if (a && b) return haversineMiles(a[0], a[1], b[0], b[1]);

    const c1 = CONTINENT_OF[origin];
    const c2 = CONTINENT_OF[dest];
    if (c1 && c2) {
      const key = [c1, c2].sort().join('-');
      if (CONTINENT_AVG_MILES[key] != null) return CONTINENT_AVG_MILES[key];
    }

    return GLOBAL_AVG_MILES;
  }

const DOW_LETTERS = ['S', 'M', 'T', 'W', 'Q', 'F', 'J'];

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function formatDate(isoStr) {
    const d = new Date(isoStr);
    return `${String(d.getDate()).padStart(2, '0')}${MONTHS[d.getMonth()]}`;
  }

function formatTime(isoStr) {
    const d = new Date(isoStr);
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const ampm = h < 12 ? 'A' : 'P';
    h = h % 12 || 12;
    return `${h}${m}${ampm}`;
  }

function elapsed(durationMin) {
    const h = Math.floor(durationMin / 60);
    const m = String(durationMin % 60).padStart(2, '0');
    return `${h}.${m}`;
  }

function parseLocal(value) {
    if (value instanceof Date) return value;
    const s = String(value);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (m) {
      return new Date(
        parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10),
        parseInt(m[4], 10), parseInt(m[5], 10), m[6] ? parseInt(m[6], 10) : 0
      );
    }
    return new Date(s);
  }

function dowLetter(d) {
    return DOW_LETTERS[d.getDay()];
  }

function sameCalendarDate(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

function daysBetween(a, b) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.round((utcB - utcA) / msPerDay);
  }

const EQUIP_FAMILY_DEFAULTS = [
    { test: /a?350/, variants: [[/-?\s?1000/, '351'], [/-?\s?900/, '359']], fallback: '359' },
    { test: /a?330/, variants: [[/neo|-?\s?900/, '339'], [/-?\s?200/, '332'], [/-?\s?300/, '333']], fallback: '333' },
    { test: /787/, variants: [[/-?\s?8\b|800/, '788'], [/-?\s?9\b|900/, '789'], [/-?\s?10\b|1000/, '781']], fallback: '788' },
    { test: /737/, variants: [[/max\s?8/, '7M8'], [/max\s?9/, '7M9'], [/-?\s?800/, '738']], fallback: '738' },
    { test: /a?321/, variants: [[/neo\s?lr|lr\b/, '32S'], [/neo/, '32Q']], fallback: '321' },
    { test: /a?320/, variants: [[/neo/, '32N']], fallback: '320' },
    { test: /a?319/, variants: [], fallback: '319' },
    { test: /777/, variants: [[/-?\s?300\s?er|300er/, '77W'], [/-?\s?200\s?er|200er/, '772']], fallback: '777' },
    { test: /767/, variants: [[/-?\s?300/, '763']], fallback: '763' },
  ];

const CARRIER_WIDEBODY_DEFAULT = {
    AA: '772', DL: '359', UA: '789', BA: '789', LH: '359', AF: '772', KL: '772',
    EK: '77W', QR: '359', SQ: '359', CX: '359', JL: '789', NH: '789',
    AC: '789', QF: '789', VS: '789', EY: '789', TK: '359', PR: '333',
  };

function guessEquipCode(leg) {
    const dist = leg.distance != null ? leg.distance : lookupDistance(leg.origin?.iata, leg.destination?.iata);
    if (dist != null && dist > 3000) {
      return CARRIER_WIDEBODY_DEFAULT[leg.airline?.code] || '789';
    }
    if (dist != null && dist > 1200) return '321';
    return '738';
  }

function equipCode(leg) {
    if (leg.equipmentCode) return leg.equipmentCode;
    const aircraftName = leg.aircraft;
    if (!aircraftName) return guessEquipCode(leg);
    const key = aircraftName.trim().toLowerCase().replace(/\s+passenger\b/, '').replace(/\s+/g, ' ');
    if (EQUIP_MAP[key]) return EQUIP_MAP[key];

    for (const fam of EQUIP_FAMILY_DEFAULTS) {
      if (fam.test.test(key)) {
        for (const [variantRe, code] of fam.variants) {
          if (variantRe.test(key)) return code;
        }
        return fam.fallback;
      }
    }

    const match = key.match(/(\d{3})/);
    return match ? match[1] : guessEquipCode(leg);
  }

// Worried Pip for warnings (airport change, rush only, $0.00).
function worriedPip(width) {
  const el = document.createElement('span');
  el.className = 'ia-worried';
  el.setAttribute('aria-hidden', 'true');
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '10 10 76 80');
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(Math.round(width * 80 / 76)));
  svg.style.display = 'block';
  const add = (tag, attrs) => { const n = document.createElementNS(NS, tag); Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k])); svg.appendChild(n); };
  add('path', { d: 'M22 70 L22 38 Q22 26 34 26 L62 26 Q74 26 74 38 L74 62 Q74 74 62 74 L40 74 L30 84 L31 74 Q22 73 22 70 Z', fill: '#fecaca' });
  add('path', { d: 'M35 41 L44 44 M61 41 L52 44', stroke: '#7f1d1d', 'stroke-width': '3.4', 'stroke-linecap': 'round', fill: 'none' });
  add('circle', { cx: '40', cy: '50', r: '4', fill: '#7f1d1d' });
  add('circle', { cx: '56', cy: '50', r: '4', fill: '#7f1d1d' });
  add('path', { d: 'M40 64 Q48 57 56 64', stroke: '#7f1d1d', 'stroke-width': '3.2', 'stroke-linecap': 'round', fill: 'none' });
  el.appendChild(svg);
  return el;
}

const VI_HEADER = '   FLIGHT  DATE  SEGMENT DPTR  ARVL    MLS  EQP  ELPD MILES SM';

(function () {
  'use strict';

  // Bail out immediately on any page this half of the script can never
  // apply to, before the MutationObserver below is even created. Without
  // this, being on the CRM site (or any other page @match happens to
  // cover) still pays for a subtree-wide MutationObserver that fires on
  // every DOM mutation just to run host checks that always fail — real,
  // avoidable overhead on a page with nothing for this half to do.
  const _host = location.hostname;
  {
    const _relevant = _host.includes('flybasis.com')
      || _host.includes('agentsearch.vercel.app')
      || _host.includes('awardlogic.com')
      || _host.includes('pointsyeah.com')
      || _host.includes('matrix.itasoftware.com')
      || _host.includes('kayak.com')
      || _host.includes('cheapoair.com')
      || (_host.includes('google.com') && location.pathname.startsWith('/travel/flights'));
    if (!_relevant) return;
  }

  // ------------------------------------------------------------------
  // CONFIG — Sabre GDS Output Conventions
  //
  // Status code depends on which site the itinerary is coming from: the
  // award/points sites build a redemption booking (GK — a status hold
  // used for award/points bookings), everywhere else is a normal cash
  // fare search (SS — a standard sell status). This mirrors the
  // early-exit host check above rather than introducing a new list.
  // ------------------------------------------------------------------
  const _isAwardSite = _host.includes('flybasis.com')
    || _host.includes('agentsearch.vercel.app')
    || _host.includes('awardlogic.com')
    || _host.includes('pointsyeah.com');

  const CONFIG = {
    STATUS_CODE: _isAwardSite ? 'GK' : 'SS',
    ETKT_SUFFIX: '/E',
    SM_FLAG: 'N',
    DEFAULT_MEAL_CODE: 'M',
    DEFAULT_BOOKING_BY_CABIN: { y: 'Y', w: 'W', s: 'S', j: 'J', b: 'D', f: 'F' },
    CABIN_NAME: { y: 'ECONOMY', w: 'PREMIUM ECONOMY', s: 'PREMIUM ECONOMY', j: 'BUSINESS', b: 'BUSINESS', f: 'FIRST', e: 'ECONOMY', c: 'BUSINESS' },
  };

  const AIRLINE_MAP = {
    'saudia': 'SV', 'saudi arabian airlines': 'SV',
    'etihad': 'EY', 'etihad airways': 'EY', 'emirates': 'EK', 'qatar': 'QR', 'qatar airways': 'QR',
    'american': 'AA', 'american airlines': 'AA', 'united': 'UA', 'united airlines': 'UA',
    'delta': 'DL', 'delta air lines': 'DL', 'british airways': 'BA', 'lufthansa': 'LH',
    'air france': 'AF', 'klm': 'KL', 'singapore airlines': 'SQ', 'cathay pacific': 'CX',
    'japan airlines': 'JL', 'ana': 'NH', 'all nippon airways': 'NH', 'turkish airlines': 'TK',
    'air india': 'AI', 'akasa air': 'QP', 'indigo': '6E', 'gulf air': 'GF', 'oman air': 'WY',
    'virgin atlantic': 'VS', 'air canada': 'AC', 'qantas': 'QF', 'swiss': 'LX',
    'austrian': 'OS', 'iberia': 'IB', 'finnair': 'AY', 'korean air': 'KE', 'asiana': 'OZ',
    'eva air': 'BR', 'china airlines': 'CI', 'alaska': 'AS', 'alaska airlines': 'AS', 'jetblue': 'B6',
    'ethiopian': 'ET', 'egyptair': 'MS', 'copa': 'CM', 'avianca': 'AV', 'latam': 'LA',
    'royal air maroc': 'AT', 'lot polish airlines': 'LO', 'aeromexico': 'AM', 'westjet': 'WS',
    'icelandair': 'FI'
  };

  const CABIN_WORD_TO_CODE = {
    economy: 'y', coach: 'y', 'premium economy': 'w', business: 'j', first: 'f'
  };

  const MONTH_MAP = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };

  // Great-circle airport distance, computed offline instead of hitting a
  // network API at copy-time — an API call from inside a userscript would
  // be one more thing that can fail (CORS, rate limits, an outage) right
  // when the person is mid-copy, and the input to the formula (each
  // airport's fixed lat/lon) doesn't change, so there's nothing a live
  // lookup would learn that isn't already knowable ahead of time. This is
  // a best-effort MILES figure (straight-line great-circle, not an
  // airline's official routing mileage, which can differ) for whichever
  // airports are in the table below — left blank rather than guessed for
  // any airport not in it.

  // Coarse continent tag for every airport above, used ONLY when one side
  // of a route isn't in AIRPORT_COORDS — the exact haversine calculation
  // above is always tried first and is always preferred when available.
  // NA=North America, SA=South America, EU=Europe, AF=Africa, AS=Asia
  // (Middle East grouped in here, geographically), OC=Oceania.

  // Rough typical hub-to-hub mileage per continent pair — deliberately
  // coarse (see the reasoning above: same-continent variance alone spans
  // a 300-mile hop to a 2,500-mile transcontinental one). Only used when
  // the exact table above has neither airport.

  // Absolute last resort — an airport not in either table above at all.
  // Never leaves the MILES column blank, at the cost of being a flat
  // world-average guess rather than any kind of real estimate.

  // Sabre schedule day-of-week letters, indexed by JS Date#getDay() (0=Sun..6=Sat)

  // ------------------------------------------------------------------
  // Styling — one visual style per site
  // ------------------------------------------------------------------
  GM_addStyle(`
    .gds-btn-base {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }
    /* Ian's Assistant dark dashboard: one look for every site's GDS button */
    .gds-btn-base.gds-btn-base {
      background: #0f172a !important; color: #a5a5fb !important;
      border: 1px solid #7c7cf8 !important; border-radius: 8px !important;
      font-family: 'Segoe UI', system-ui, sans-serif !important; font-weight: 700 !important;
      box-shadow: 0 0 0 1px rgba(124,124,248,.15), 0 2px 8px rgba(0,0,0,.35) !important;
    }
    .gds-btn-base.gds-btn-base:hover { background: #1e293b !important; color: #c7c7fd !important; }
    .gds-btn-base.copied {
      background-color: #2e7d32 !important;
      border-color: #4caf50 !important;
      color: #ffffff !important;
    }

    .price-button-container {
      display: inline-flex !important;
      flex-direction: row !important;
      align-items: center !important;
      justify-content: flex-start !important;
      gap: 6px !important;
      width: auto !important;
    }

    /* ITA Matrix */
    .gds-btn-matrix {
      background-color: #1e88e5 !important;
      color: #ffffff !important;
      border: none !important;
      border-radius: 4px !important;
      padding: 0 10px !important;
      height: 32px !important;
      line-height: 32px !important;
      font-family: Roboto, "Helvetica Neue", sans-serif !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      letter-spacing: 0.5px !important;
      text-transform: uppercase !important;
      box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14) !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      margin: 0 !important;
      vertical-align: middle !important;
      flex-shrink: 0 !important;
    }
    .gds-btn-matrix:hover { background-color: #1565c0 !important; }

    /* FlyBasis / agentsearch — filled violet pill */
    .gds-btn-flybasis {
      background: #7c3aed;
      color: #ffffff;
      border: none;
      border-radius: 999px;
      padding: 6px 16px;
      font-family: system-ui, sans-serif;
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(124,58,237,.45);
    }
    .gds-btn-flybasis:hover { background: #6d28d9; }

    /* PointsYeah */
    .gds-btn-yeah {
      background: #111827;
      color: #FFC800;
      border: 1px solid #FFC800;
      border-radius: 999px;
      padding: 2px 10px;
      height: 22px;
      font-family: system-ui, sans-serif;
      font-size: 11px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
    }
    .gds-btn-yeah:hover { background: #FFC800; color: #111827; }

    /* AwardLogic */
    .gds-btn-award {
      background: #ffffff;
      color: #5b21b6;
      border: 1px solid #5b21b6;
      border-radius: 6px;
      padding: 3px 10px;
      margin-top: 6px;
      margin-left: 32px;
      font-family: system-ui, sans-serif;
      font-size: 11px;
      font-weight: 700;
      display: inline-block;
    }
    .gds-btn-award:hover { background: #5b21b6; color: #ffffff; }

    /* Kayak — orange brand accent, sits inline next to the price/Select button */
    .gds-btn-kayak {
      background: #ffffff;
      color: #FF690F;
      border: 1.5px solid #FF690F;
      border-radius: 6px;
      padding: 5px 12px;
      margin-right: 8px;
      font-family: system-ui, sans-serif;
      font-size: 12px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .gds-btn-kayak:hover { background: #FF690F; color: #ffffff; }

    /* CheapOair */
    .gds-btn-cheapoair {
      background: #003366;
      color: #ffffff;
      border: none;
      border-radius: 999px;
      padding: 6px 14px;
      margin-left: 10px;
      font-family: system-ui, sans-serif;
      font-size: 12px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
    }
    .gds-btn-cheapoair:hover { background: #0055a5; }

    .gds-big-copied {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.85);
      font-family: system-ui, sans-serif;
      font-size: 72px;
      font-weight: 900;
      letter-spacing: 6px;
      color: #a5a5fb;
      background: rgba(14, 15, 19, 0.94);
      border: 2px solid #7c7cf8;
      padding: 28px 56px;
      border-radius: 20px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.4);
      z-index: 2147483647;
      pointer-events: none;
      animation: gds-big-copied-fade 1.5s ease forwards;
    }
    @keyframes gds-big-copied-fade {
      0%   { opacity: 0;   transform: translate(-50%, -50%) scale(0.85); }
      12%  { opacity: 1;   transform: translate(-50%, -50%) scale(1); }
      70%  { opacity: 1;   transform: translate(-50%, -50%) scale(1); }
      100% { opacity: 0;   transform: translate(-50%, -50%) scale(1.05); }
    }

    /* Google Flights — matches their own outlined "pill" button style */
    .gds-btn-googleflights {
      background: #ffffff;
      color: #1a73e8;
      border: 1px solid #dadce0;
      border-radius: 999px;
      padding: 8px 16px;
      font-family: 'Google Sans', Roboto, Arial, sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      line-height: 1;
    }
    .gds-btn-googleflights:hover { background: #f8f9fa; }
  `);

  // ------------------------------------------------------------------
  // Formatting Helpers
  // ------------------------------------------------------------------

  // Normalizes leg.departure / leg.arrival to a real Date object no matter
  // what an adapter handed us. Some adapters (FlyBasis, PointsYeah) pass
  // through raw ISO date strings from JSON rather than Date instances —
  // calling .getDay()/.getFullYear() directly on a string throws, which is
  // exactly what broke FlyBasis. Just as important: an ISO string with a
  // trailing "Z"/offset would otherwise get re-interpreted in the
  // browser's own time zone by `new Date(str)`, silently shifting the
  // calendar date. This reads the printed Y-M-D-H-M numbers literally and
  // builds the Date via the local constructor, so no zone conversion ever
  // happens.

  // Real Sabre/IATA equipment codes are almost never just "the model
  // number written out" — a bare "787" or "A350" or "A330" isn't a valid
  // code on its own (787-8/-9/-10 are 788/789/781; A350-900/-1000 are
  // 359/351; A330-200/-300/-900neo are 332/333/339). The old fallback
  // (grab any 3 consecutive digits from the raw aircraft text) produced
  // exactly those wrong bare numbers whenever the scraped text didn't
  // exactly match an EQUIP_MAP key. This resolves by aircraft FAMILY
  // first, checking for a variant hint, and only defaults to a bare
  // digit-guess if the family itself isn't recognized at all.

  // A carrier's typical widebody on international/long-haul routes —
  // used only as the very last resort below, when a site gives literally
  // no aircraft signal at all (no name, no equipment code). Not exact
  // (a real per-flight lookup would need a live flight-schedule API,
  // which needs a key/subscription and can't be guaranteed available or
  // fast from inside a userscript — the same reasoning as the mileage
  // fallback), but keeps the field populated with something plausible
  // rather than "???".

  // Premium economy class letter for carriers that don't use W.
  const PREMIUM_CLASS_BY_CARRIER = { PR: 'N' };
  function bookingClass(leg) {
    if (leg.bookingCode) return leg.bookingCode;
    if (leg.cabin === 'w' && leg.airline && PREMIUM_CLASS_BY_CARRIER[leg.airline.code]) return PREMIUM_CLASS_BY_CARRIER[leg.airline.code];
    return CONFIG.DEFAULT_BOOKING_BY_CABIN[leg.cabin] || 'Y';
  }

  // ------------------------------------------------------------------
  // Sabre GDS Builders
  // ------------------------------------------------------------------
  function buildIALine(leg, idx, pax) {
    const depD = parseLocal(leg.departure);
    const arrD = parseLocal(leg.arrival);
    const num = String(idx + 1).padStart(2, ' ');
    const carrierFlight = leg.airline.code + String(leg.operatingFlightNumber || leg.flightNumber).padStart(4, ' ');
    const cls = bookingClass(leg);
    const date = formatDate(depD);
    const dow = dowLetter(depD);
    const route = leg.origin.iata + leg.destination.iata;
    const status = `${CONFIG.STATUS_CODE}${pax}`;
    const dep = formatTime(depD).padStart(5, ' ');
    const arr = formatTime(arrD).padStart(5, ' ');

    let rolloverSuffix = '';
    if (!sameCalendarDate(depD, arrD)) {
      rolloverSuffix = `  ${formatDate(arrD)} ${dowLetter(arrD)}`;
    }

    return `${num} ${carrierFlight}${cls} ${date} ${dow} ${route} ${status}  ${dep} ${arr}${rolloverSuffix} ${CONFIG.ETKT_SUFFIX}`;
  }

  function buildVILines(leg, idx) {
    const depD = parseLocal(leg.departure);
    const arrD = parseLocal(leg.arrival);
    const num = String(idx + 1).padStart(2, ' ');

    // A codeshare (operating carrier differs from the marketing carrier
    // shown) is marked by replacing the flight-number field's leading pad
    // space with "*" — e.g. "TP*8559" instead of "TP 8559" — with a
    // "*ORIGIN-DEST OPERATED BY <airline>" line underneath. Only rendered
    // when an adapter actually supplies operatingCarrierCode; none do yet,
    // since none of the sites expose it per-segment in a verified way.
    const flightNumStr = String(leg.operatingFlightNumber || leg.flightNumber);
    const isCodeshare = leg.operatingCarrierCode && leg.operatingCarrierCode !== leg.airline.code;
    const carrierFlight = isCodeshare
      ? leg.airline.code + '*' + flightNumStr.padStart(4, ' ')
      : leg.airline.code + flightNumStr.padStart(5, ' ');

    const date = formatDate(depD);
    const segment = `${leg.origin.iata} ${leg.destination.iata}`;
    const dep = formatTime(depD).padStart(5, ' ');
    const arr = formatTime(arrD).padStart(5, ' ');
    const dayDiff = daysBetween(depD, arrD);
    // Positive dayDiff (arrival lands a day+ later) shows "¥N"; negative
    // (arrival lands a day EARLIER — routes crossing the date line
    // westbound, e.g. Taipei to San Francisco, commonly do this) shows
    // "-N". Same 3-character field width either way.
    let rolloverField;
    if (dayDiff > 0) rolloverField = `\u00a5${dayDiff} `;
    else if (dayDiff < 0) rolloverField = `${dayDiff} `;
    else rolloverField = '   ';
    const meal = leg.mealCode || CONFIG.DEFAULT_MEAL_CODE;
    const eqp = equipCode(leg).padStart(3, ' ');
    const elp = elapsed(leg.duration);
    const distance = leg.distance != null ? leg.distance : lookupDistance(leg.origin.iata, leg.destination.iata);
    const miles = distance != null ? String(distance).padStart(4, ' ') : '    ';

    const row = `${num} ${carrierFlight} ${date} ${segment} ${dep} ${arr}${rolloverField}${meal}    ${eqp}  ${elp}  ${miles}  ${CONFIG.SM_FLAG}`;

    const extraLines = [];
    const termParts = [];
    if (leg.departureTerminal) termParts.push(`DEP-TERMINAL ${leg.departureTerminal}`);
    if (leg.arrivalTerminal) termParts.push(`ARR-TERMINAL ${leg.arrivalTerminal}`);
    if (termParts.length) extraLines.push(termParts.join('                 '));

    if (isCodeshare) {
      extraLines.push(`*${leg.origin.iata}-${leg.destination.iata} OPERATED BY ${(leg.operatingCarrierName || leg.operatingCarrierCode).toUpperCase()}`);
    }

    const alliance = ALLIANCE_MAP[leg.airline.code];
    if (alliance) extraLines.push(alliance);

    const cabinName = CONFIG.CABIN_NAME[(leg.cabin || '').toLowerCase()] || (leg.cabin || '').toUpperCase();
    if (cabinName) extraLines.push(`CABIN-${cabinName}`);

    return [row, ...extraLines];
  }

  function buildBoth(itinerary) {
    const pax = itinerary.pax || 1;
    const allLegs = itinerary.flights.flatMap((f) => f.legs);
    const iaText = allLegs.map((leg, i) => buildIALine(leg, i, pax)).join('\n');
    const viText = [VI_HEADER, ...allLegs.flatMap((leg, i) => buildVILines(leg, i))].join('\n');
    return `*IA\n${iaText}\n\nVI*\n${viText}`;
  }

  function copyText(text) {
    if (typeof GM_setClipboard === 'function') {
      GM_setClipboard(text);
      return;
    }
    navigator.clipboard?.writeText(text).catch(() => {});
  }

  function showBigCopiedIndicator() {
    const el = document.createElement('div');
    el.textContent = 'COPIED';
    el.className = 'gds-big-copied';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
  }

  // Hooks used by the Pip popover (see "Send to lead" below): in capture
  // mode the built *IA/VI* text is handed back instead of copied.
  let gdsCaptureResolve = null;
  let gdsCopyListener = null;

  // Never copy or send a broken *IA: every flight line must have its
  // airline, flight number, class, date and route. If a site changed its
  // page and something wasn't read, it fails loudly instead.
  function gdsTextProblem(text) {
    const m = String(text || '').match(/^\*IA\n([\s\S]*?)\n\nVI\*/);
    if (!m) return null; // not *IA output
    const rows = m[1].split('\n').filter((l) => l.trim());
    if (!rows.length) return 'No flights read';
    const ok = /^\s*\d+ [A-Z0-9]{2} *\d{1,5}[A-Z] \d{2}[A-Z]{3} [A-Z] [A-Z]{6} [A-Z]{2}\d+ +\d{3,4}[AP] +\d{3,4}[AP]/;
    return rows.every((r) => ok.test(r)) ? null : 'Flight details missing';
  }

  function flashButton(btn, textToCopy, showBig) {
    const problem = gdsTextProblem(textToCopy);
    if (problem) { flashError(btn, '❌ ' + problem + ' — not copied'); return; }
    if (gdsCaptureResolve) { const r = gdsCaptureResolve; gdsCaptureResolve = null; r({ ok: true, text: textToCopy }); return; }
    if (gdsCopyListener) gdsCopyListener(true);
    copyText(textToCopy);
    if (showBig) showBigCopiedIndicator();
    const originalText = btn.textContent;
    btn.textContent = '\u2728 Copied! \u2728';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copied');
    }, 1500);
  }

  function flashError(btn, label) {
    if (gdsCaptureResolve) { const r = gdsCaptureResolve; gdsCaptureResolve = null; r({ ok: false, error: label }); return; }
    if (gdsCopyListener) gdsCopyListener(false, label);
    const orig = btn.textContent;
    btn.textContent = label;
    setTimeout(() => (btn.textContent = orig), 1500);
  }

  function parseDurationMinutes(str) {
    const h = /(\d+)\s*h/i.exec(str || '');
    const m = /(\d+)\s*m/i.exec(str || '');
    return (h ? parseInt(h[1], 10) : 0) * 60 + (m ? parseInt(m[1], 10) : 0);
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ------------------------------------------------------------------
  // ITA MATRIX ADAPTER — real per-segment data from the expanded detail row
  // ------------------------------------------------------------------
  // ITA's row/detail markup never prints a year — only "Sun, Nov 8" style
  // text — so the year has to be inferred. A flight whose month/day has
  // already passed in the current calendar year is next year's flight,
  // not this year's (e.g. searching in Sept 2026 for a "Feb 13" departure
  // means Feb 13 2027, not the already-past Feb 13 2026). Getting this
  // wrong doesn't just mislabel the year — every day-of-week letter and
  // date-rollover marker in the IA/VI output shifts with it.
  function inferYear(month, day) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const candidate = new Date(now.getFullYear(), month, day);
    return candidate < todayStart ? now.getFullYear() + 1 : now.getFullYear();
  }

  function itaParseDateTime(dateStr, timeStr) {
    // dateStr e.g. "Sun, Nov 8" (weekday prefix optional); timeStr e.g. "6:00 AM"
    const dm = (dateStr || '').match(/([A-Za-z]{3})\s+(\d{1,2})/);
    if (!dm) return new Date();
    const month = MONTH_MAP[dm[1].toLowerCase()] ?? 0;
    const day = parseInt(dm[2], 10);
    const year = inferYear(month, day);

    let hours = 12, minutes = 0;
    const tm = (timeStr || '').match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (tm) {
      hours = parseInt(tm[1], 10);
      minutes = parseInt(tm[2], 10);
      const isPM = tm[3].toUpperCase() === 'PM';
      if (isPM && hours < 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
    }
    return new Date(year, month, day, hours, minutes, 0, 0);
  }

  function parseClockTime(timeStr) {
    const tm = (timeStr || '').match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!tm) return { h: 12, m: 0 };
    let h = parseInt(tm[1], 10);
    const m = parseInt(tm[2], 10);
    const isPM = tm[3].toUpperCase() === 'PM';
    if (isPM && h < 12) h += 12;
    if (!isPM && h === 12) h = 0;
    return { h, m };
  }

  // Rough UTC-offset estimate from longitude alone (15 degrees per hour).
  // Ignores real timezone/DST boundaries, but is far better than nothing
  // for disambiguating which calendar day an arrival actually falls on —
  // see resolveArrivalDate below for why that matters.
  function estimateUtcOffset(code) {
    const coord = AIRPORT_COORDS[code];
    return coord ? Math.round(coord[1] / 15) : null;
  }

  // Resolves an arrival's calendar date from its own local clock time and
  // the segment's real elapsed flight duration, instead of relying on
  // page text like "on <date>" always being present (it isn't, on every
  // leg, in practice — see itaParseDetailSegments, which still prefers
  // that text when present and only falls back to this).
  //
  // The naive approach — just checking which day-offset (0, 1, 2...)
  // gets naiveElapsed close to the real duration — silently picks the
  // WRONG day whenever the timezone difference between the two airports
  // is large enough to be comparable to the flight duration itself (e.g.
  // Taipei-San Francisco: ~16h timezone gap on an ~11h flight). In that
  // case an earlier arrival date (crossing the date line) can look like
  // a worse "fit" than a same-day arrival that's actually wrong. Biasing
  // the search by each airport's rough longitude-based UTC offset (see
  // estimateUtcOffset) resolves that ambiguity correctly, and also
  // handles arrivals that land a day EARLIER than departure (a negative
  // day offset), which the old range (0 to 2 only) could never find at
  // all.
  function resolveArrivalDate(depDate, arrHour, arrMinute, durationMin, originCode, destCode) {
    const depOffset = estimateUtcOffset(originCode);
    const arrOffset = estimateUtcOffset(destCode);
    const expectedTzDiffMin = (depOffset != null && arrOffset != null) ? (arrOffset - depOffset) * 60 : null;

    let best = null;
    let bestScore = Infinity;
    for (let dayOffset = -2; dayOffset <= 2; dayOffset++) {
      const candidate = new Date(depDate.getFullYear(), depDate.getMonth(), depDate.getDate() + dayOffset, arrHour, arrMinute, 0, 0);
      const naiveElapsed = Math.round((candidate - depDate) / 60000);
      const impliedTzDiff = naiveElapsed - durationMin;
      const score = expectedTzDiffMin != null
        ? Math.abs(impliedTzDiff - expectedTzDiffMin)
        : Math.abs(impliedTzDiff);
      if (score < bestScore) {
        bestScore = score;
        best = candidate;
      }
    }
    return best;
  }

  function itaParseDetailSegments(detailRow) {
    const items = detailRow.querySelectorAll('mat-list-item');
    const legs = [];
    items.forEach((item) => {
      const infoLines = item.querySelectorAll('.info-line');
      if (infoLines.length < 4) return;

      const routeLine = infoLines[0];
      const bTag = routeLine.querySelector('b');
      const routeText = (bTag?.textContent || '').trim();
      const routeMatch = routeText.match(/\(([A-Z]{3})\)\s*to\s*.*\(([A-Z]{3})\)/i);
      if (!routeMatch) return;
      const originCode = routeMatch[1];
      const destCode = routeMatch[2];
      const depDateMatch = routeLine.textContent.match(/on\s+([A-Za-z]{3},?\s*[A-Za-z]{3}\s+\d{1,2})\s*$/i);
      const depDateStr = depDateMatch ? depDateMatch[1] : '';

      const timeLine = infoLines[1];
      const bTags = timeLine.querySelectorAll('b');
      const depTimeStr = bTags[0]?.textContent.trim() || '';
      const arrTimeStr = bTags[1]?.textContent.trim() || '';

      // The page sometimes prints an explicit arrival date ("on <date>")
      // right after the arrival time — when it's there, it's ground
      // truth and is used directly. When it isn't, the duration-based
      // resolveArrivalDate below is the fallback.
      const arrDateMatch = timeLine.textContent.match(/on\s+([A-Za-z]{3},?\s*[A-Za-z]{3}\s+\d{1,2})\s*$/i);

      // Prefer the explicit "(Xh Ym)" elapsed text the page already shows —
      // computing it from the two parsed local clock times would be wrong
      // for any route that crosses time zones (dep/arr are parsed naively
      // in the browser's own time zone, not the airports').
      const explicitDurMatch = timeLine.textContent.match(/\(([^()]*)\)\s*$/);
      const explicitDurMin = explicitDurMatch ? parseDurationMinutes(explicitDurMatch[1]) : 0;

      // The flight-number line ends with "(operated by <airline>)" for
      // codeshares — the old regex required digits at the very END of the
      // string (`\d+$`), so that trailing text made it fail to match at
      // all, silently dropping the flight number. Matching the digit run
      // wherever it appears (no end anchor) is robust to any trailing
      // text; the operated-by carrier is captured separately below.
      const flightLine = infoLines[2].textContent.trim();
      const flightMatch = flightLine.match(/^(.+?)\s+(\d+)/);
      const airlineName = flightMatch ? flightMatch[1].trim() : flightLine;
      const flightNumber = flightMatch ? flightMatch[2] : '';

      const operatedByMatch = flightLine.match(/operated by\s+([^)]+)\)/i);
      const operatingCarrierName = operatedByMatch ? operatedByMatch[1].trim() : '';
      const operatingCarrierCode = operatingCarrierName ? (AIRLINE_MAP[operatingCarrierName.toLowerCase()] || '') : '';

      const aircraft = (infoLines[3]?.textContent || '').trim();

      const serviceLine = item.querySelector('.service-line');
      const cabinMatch = serviceLine ? serviceLine.textContent.match(/(Economy|Premium Economy|Business|First)\s*(?:\(([A-Za-z0-9]+)\))?/i) : null;
      const cabinWord = cabinMatch ? cabinMatch[1].toLowerCase() : 'economy';
      const bookingCode = cabinMatch && cabinMatch[2] ? cabinMatch[2].toUpperCase() : '';

      let cabinCode = 'y';
      if (cabinWord.includes('business')) cabinCode = 'j';
      else if (cabinWord.includes('first')) cabinCode = 'f';
      else if (cabinWord.includes('premium')) cabinCode = 'w';

      const carrierImg = item.querySelector('.carrier-img');
      const carrierMatch = carrierImg?.src.match(/\/([A-Z0-9]{2,3})\.png/i);
      const carrier = carrierMatch ? carrierMatch[1].toUpperCase() : (AIRLINE_MAP[airlineName.toLowerCase()] || '');

      const depDateObj = itaParseDateTime(depDateStr, depTimeStr);
      const arrClock = parseClockTime(arrTimeStr);
      let arrDateObj;
      if (arrDateMatch) {
        arrDateObj = itaParseDateTime(arrDateMatch[1], arrTimeStr);
      } else if (explicitDurMin > 0) {
        arrDateObj = resolveArrivalDate(depDateObj, arrClock.h, arrClock.m, explicitDurMin, originCode, destCode);
      } else {
        arrDateObj = new Date(depDateObj.getFullYear(), depDateObj.getMonth(), depDateObj.getDate(), arrClock.h, arrClock.m, 0, 0);
      }
      const durMin = explicitDurMin > 0 ? explicitDurMin : Math.max(0, Math.round((arrDateObj - depDateObj) / 60000));

      legs.push({
        airline: { code: carrier },
        flightNumber,
        cabin: cabinCode,
        bookingCode: bookingCode || undefined,
        aircraft,
        origin: { iata: originCode },
        destination: { iata: destCode },
        departure: depDateObj,
        arrival: arrDateObj,
        duration: durMin,
        operatingCarrierCode: operatingCarrierCode || undefined,
        operatingCarrierName: operatingCarrierName || undefined,
      });
    });
    return legs;
  }

  function getItaPaxCount(row) {
    const priceLink = row.querySelector('a[href*="/itinerary?search="]');
    if (!priceLink) return 1;
    try {
      const url = new URL(priceLink.href, location.origin);
      const searchParam = url.searchParams.get('search');
      if (searchParam) {
        const payload = JSON.parse(atob(decodeURIComponent(searchParam)));
        return parseInt(payload?.pax?.adults || '1', 10);
      }
    } catch (e) {}
    return 1;
  }

  async function handleItaCopy(row, btn) {
    const paxCount = getItaPaxCount(row);

    let detailRow = row.nextElementSibling;
    let hasDetail = detailRow && detailRow.classList.contains('detail-row') && detailRow.querySelector('mat-list-item');

    if (!hasDetail) {
      const cell = row.querySelector('.cdk-column-price') || row.firstElementChild || row;
      cell.click();
      await wait(400);
      detailRow = row.nextElementSibling;
      hasDetail = detailRow && detailRow.classList.contains('detail-row') && detailRow.querySelector('mat-list-item');
    }

    if (!hasDetail) {
      flashError(btn, '\u274c Try expanding');
      return;
    }

    const legs = itaParseDetailSegments(detailRow);
    if (!legs.length) {
      flashError(btn, '\u274c Try expanding');
      return;
    }

    flashButton(btn, buildBoth({ flights: [{ legs }], pax: paxCount }));
  }

  function injectItaButtons() {
    const rows = document.querySelectorAll('tr.mat-mdc-row:not(.detail-row):not([data-gds-injected])');
    rows.forEach((row) => {
      const container = row.querySelector('.price-button-container');
      if (!container) return;

      row.setAttribute('data-gds-injected', '1');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gds-btn-base gds-btn-matrix';
      btn.textContent = 'GDS';
      btn.title = 'Copy Sabre IA / VI* format for all legs';

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const liveRow = e.currentTarget.closest('tr');
        if (liveRow) handleItaCopy(liveRow, btn);
      });

      container.appendChild(btn);
    });
  }

  // ------------------------------------------------------------------
  // FLYBASIS / agentsearch.vercel.app ADAPTER
  // ------------------------------------------------------------------
  // FlyBasis's own data has the carrier code bleeding into the flight
  // number for some alphanumeric IATA codes (confirmed directly in
  // their raw data-json: a JetBlue "B6" leg carries flightNumber
  // "62548" for what's actually flight 2548 — the trailing digit of
  // "B6" prepended; a Discover "4Y" leg carries flightNumber "4Y69" for
  // flight 69 — the whole carrier code prepended this time). Not
  // something either FlyBasis adapter's own parsing introduced — this
  // is what's already in the source before either one touches it, so
  // both need to strip it the same way: the list-view button reads
  // this field straight from JSON with no text parsing at all, and the
  // detail-view one reads the same value from the rendered page text.
  function fbStripCarrierPrefixFromFlightNumber(flightNumber, carrierCode) {
    if (!flightNumber || !carrierCode) return flightNumber;
    const fn = String(flightNumber).trim();
    const cc = String(carrierCode).toUpperCase();
    if (fn.toUpperCase().startsWith(cc)) return fn.slice(cc.length);
    const digitsInCarrier = cc.replace(/[^0-9]/g, '');
    if (digitsInCarrier && fn.startsWith(digitsInCarrier)) return fn.slice(digitsInCarrier.length);
    return fn;
  }

  function fbCleanItineraryFlightNumbers(itinerary) {
    (itinerary.flights || []).forEach((flight) => {
      (flight.legs || []).forEach((leg) => {
        if (leg.airline && leg.airline.code) {
          leg.flightNumber = fbStripCarrierPrefixFromFlightNumber(leg.flightNumber, leg.airline.code);
        }
        if (leg.operatingAirline && leg.operatingAirline.code) {
          leg.operatingFlightNumber = fbStripCarrierPrefixFromFlightNumber(leg.operatingFlightNumber, leg.operatingAirline.code);
        }
      });
    });
    return itinerary;
  }

  function injectFlyBasisButtons() {
    const cards = document.querySelectorAll('[data-json][data-itinerary-id]');
    cards.forEach((card) => {
      const existing = card.querySelector('.gds-btn-flybasis');
      if (existing) {
        // Present already — but the site can add new badge icons to this
        // same row asynchronously (a warning icon showing up once some
        // status finishes computing, after the button already landed).
        // Since appendChild only ever placed it last at the moment it was
        // inserted, a sibling arriving later strands it in the middle —
        // confirmed directly: simulating a later-arriving third icon
        // reproduced exactly that sandwiched order. Re-asserting "last
        // child of its row" on every scan, not just at insertion, keeps
        // it correctly positioned as the row's membership keeps changing.
        const row = existing.parentElement;
        if (row && row.lastElementChild !== existing) row.appendChild(existing);
        return;
      }
      let itinerary;
      try { itinerary = JSON.parse(card.dataset.json); } catch (e) { return; }
      if (!itinerary || !Array.isArray(itinerary.flights)) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gds-btn-base gds-btn-flybasis';
      btn.textContent = 'GDS';
      btn.title = 'Copy Sabre IA / VI* format for this itinerary (all directions)';

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        flashButton(btn, buildBoth(fbCleanItineraryFlightNumbers(itinerary)));
      });

      // Insert as a normal flex child of the icon row (which holds
      // zero, one, two, or three little badge icons depending on the
      // option), rather than absolutely positioning it — an absolutely
      // positioned button anchored by `right` visibly jumps sideways
      // the instant its own text changes width (flashing "Copied!" is
      // wider than "GDS"), since growing wider pushes its left edge
      // further left. As a normal flex child, the row just
      // accommodates the width change smoothly, same as it already
      // does for however many icons happen to be there.
      //
      // A row-reverse theory was tried here and turned out wrong —
      // comparing this page against the itinerary-detail page (whose
      // own button has always used a plain appendChild, and looks
      // correct) showed this row is a normal, non-reversed flex
      // container after all. Matching that same appendChild here
      // brings the two pages back in line with each other.
      //
      // That fixed the ordering but not a separate problem: this row is
      // positioned via margin-left:auto within the summary line, not
      // anchored to a fixed right edge — so when its own content grows
      // wider (flashing "Copied!"), the ROW's right edge moves right
      // right along with it, past the card's own boundary, and gets
      // clipped — confirmed directly from the screenshots, where the
      // expanded button visibly runs off the edge of the card. Taking
      // the row out of normal flex flow and anchoring it with
      // position:absolute; right:0 on its nearest positioned ancestor
      // fixes the row's right edge in place regardless of how wide its
      // content gets; justify-content:flex-end inside it then means
      // growth pushes the icons further left, not the row further
      // right.
      const iconRow = card.querySelector('.ml-auto.flex.w-24.shrink-0.items-center.gap-1');
      if (iconRow) {
        const summaryRow = iconRow.closest('.flex.h-10.w-full.items-center.gap-12') || iconRow.parentElement;
        if (summaryRow && getComputedStyle(summaryRow).position === 'static') {
          summaryRow.style.position = 'relative';
        }
        iconRow.style.position = 'absolute';
        iconRow.style.right = '0';
        iconRow.style.top = '50%';
        iconRow.style.transform = 'translateY(-50%)';
        iconRow.style.width = 'auto';
        iconRow.style.justifyContent = 'flex-end';
        iconRow.appendChild(btn);
      } else {
        btn.style.position = 'absolute';
        btn.style.right = '20px';
        btn.style.top = '34px';
        card.appendChild(btn);
      }
    });
  }

  // ------------------------------------------------------------------
  // FLYBASIS ITINERARY-DETAIL PAGE — a genuinely separate page reached
  // by opening an option "further, on its own" (distinct from the
  // inline accordion the list view above expands into, which DOES have
  // data-json on its own card and needs none of this). This standalone
  // page has no data-json anywhere, so segments are read straight off
  // the rendered text instead: each one is a ".flex.w-full.gap-4" block
  // containing an airline-code <img alt="XX">, a "City (IATA) to City
  // (IATA)" <p>, a day-of-week/month/day <p>, a "XX 123 (Operated by
  // ...)" flight-number <p>, two time <button>s (arrival's optional
  // <sup>+1</sup> for a next-day arrival), a "(Xh Ym)" duration <p>, and
  // an "Aircraft | Cabin (X)" <p>. FlyBasis states "Operated by ..." on
  // every segment, including ones where that's just the same airline
  // operating its own metal — not a real codeshare signal, so it's read
  // but not used to build an OPERATED BY line, which would otherwise be
  // wrong on nearly every leg.
  // ------------------------------------------------------------------
  function fbdParseSegments(container) {
    const legs = [];
    const candidates = container.querySelectorAll('.flex.w-full.gap-4');
    candidates.forEach((seg) => {
      const img = seg.querySelector('img[alt]');
      if (!img) return;
      const carrierCode = (img.getAttribute('alt') || '').trim();
      if (!/^[A-Z0-9]{2,3}$/.test(carrierCode)) return;

      const paras = Array.from(seg.querySelectorAll('p'));
      const routeP = paras.find((p) => /\([A-Z]{3}\).*\([A-Z]{3}\)/.test(p.textContent));
      if (!routeP) return;
      const routeMatch = routeP.textContent.match(/\(([A-Z]{3})\).*?\(([A-Z]{3})\)/);
      const origin = routeMatch[1];
      const dest = routeMatch[2];

      const routeRow = routeP.parentElement;
      const dateP = Array.from(routeRow.querySelectorAll('p')).find((p) => p !== routeP);
      const dateText = dateP ? dateP.textContent.trim() : '';

      // Previously re-extracted the carrier from this same paragraph via
      // a second regex (/^[A-Z0-9]{2,3}\s*(\d+)/) — redundant, since
      // carrierCode above is already known reliably from the airline
      // logo, and actively wrong whenever the page renders the carrier
      // and flight number with no space between them (e.g. "B62548"
      // rather than "B6 2548"): the greedy {2,3} quantifier would eat
      // one extra digit into the "carrier" group, corrupting both
      // values (confirmed directly — "B62548" parsed as carrier "B62",
      // flightNum "548", and worse once carrierCode + flightNumber get
      // concatenated back together downstream). Stripping the already-
      // known carrierCode off the front of the text instead sidesteps
      // the whole problem — no quantifier to overmatch, and it works
      // whether or not the page puts a space in between.
      const flightP = paras.find((p) => p.textContent.trim().startsWith(carrierCode) && /\d/.test(p.textContent));
      const flightText = flightP ? flightP.textContent.trim() : '';
      const afterCarrier = flightText.startsWith(carrierCode) ? flightText.slice(carrierCode.length).trim() : flightText.trim();
      // Grab the whole next token, not just a leading digit run — the
      // remaining text can itself still start with the carrier code
      // again (FlyBasis's data for Discover's "4Y" leg literally says
      // "4Y 4Y69": stripping just the first "4Y " here still leaves
      // "4Y69", and a digits-only match on that stops at "4" — a lone
      // digit that then looks exactly like the digit-prefix case and
      // gets stripped to nothing). Passing the full token through
      // fbStripCarrierPrefixFromFlightNumber lets it catch either shape
      // properly, however many times the carrier ended up embedded.
      const tokenMatch = afterCarrier.match(/^([^\s(]+)/);
      // Even once correctly read off the page, the flight number FlyBasis
      // itself displays can still have the carrier code bled into it —
      // see fbStripCarrierPrefixFromFlightNumber for the confirmed
      // examples (JetBlue's trailing digit, Discover's whole code). This
      // page text has the exact same underlying data, so needs the same
      // cleanup, not just the list-view adapter that reads it from JSON.
      const flightNumber = fbStripCarrierPrefixFromFlightNumber(tokenMatch ? tokenMatch[1] : '', carrierCode);

      const buttons = seg.querySelectorAll('button[data-state]');
      const depTimeText = buttons[0] ? buttons[0].textContent.trim() : '';
      const arrBtn = buttons[1];
      let arrTimeText = '', dayOffset = 0;
      if (arrBtn) {
        const sup = arrBtn.querySelector('sup');
        if (sup) {
          dayOffset = parseInt(sup.textContent.replace('+', ''), 10) || 0;
          arrTimeText = arrBtn.textContent.replace(sup.textContent, '').trim();
        } else {
          arrTimeText = arrBtn.textContent.trim();
        }
      }

      const durP = paras.find((p) => /^\(\d+h(\s*\d+m)?\)$/.test(p.textContent.trim()));
      const durText = durP ? durP.textContent.trim() : '';
      const durMatch = durText.match(/(\d+)h(?:\s*(\d+)m)?/);
      const durMin = durMatch ? parseInt(durMatch[1], 10) * 60 + (durMatch[2] ? parseInt(durMatch[2], 10) : 0) : 0;

      // The trailing "(X)" booking-class letter isn't always there —
      // confirmed directly: some legs render as "Airbus A320 | Economy "
      // with nothing after "Economy" at all. Both the selector and the
      // regex previously required that letter to match anything, so
      // legs without it lost their aircraft AND cabin entirely, not just
      // the class letter — which is what was producing wrong, guessed
      // equipment codes downstream (equipCode falls back to a default
      // when the aircraft string it's given is empty). Making the "(X)"
      // portion optional in both places fixes this without weakening
      // the match for legs that do have it.
      const acP = paras.find((p) => p.textContent.includes('|'));
      const acText = acP ? acP.textContent.trim() : '';
      const acMatch = acText.match(/^(.*?)\s*\|\s*([^(]*?)\s*(?:\(([A-Z])\))?\s*$/);
      const aircraft = acMatch ? acMatch[1].trim() : '';
      const cabinName = acMatch ? acMatch[2].trim().toLowerCase() : '';
      let cabinCode = 'y';
      if (cabinName.includes('business')) cabinCode = 'j';
      else if (cabinName.includes('first')) cabinCode = 'f';
      else if (cabinName.includes('premium')) cabinCode = 'w';

      legs.push({ carrierCode, origin, dest, dateText, flightNumber, depTimeText, arrTimeText, dayOffset, durMin, aircraft, cabinCode });
    });
    return legs;
  }

  function fbdParseTime(t) {
    const m = (t || '').match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
    if (!m) return { h: 0, m: 0 };
    let h = parseInt(m[1], 10);
    const mi = parseInt(m[2], 10);
    const ap = m[3].toUpperCase();
    if (ap === 'PM' && h < 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return { h, m: mi };
  }

  function fbdParseDateText(dateText) {
    const m = (dateText || '').match(/([A-Za-z]{3})\w*\s+(\d{1,2})\s*$/);
    if (!m) return null;
    const month = MONTH_MAP[m[1].slice(0, 3).toLowerCase()];
    if (month === undefined) return null;
    return { month, day: parseInt(m[2], 10) };
  }

  function fbdBuildLegs(rawSegments) {
    const legs = [];
    rawSegments.forEach((seg) => {
      const dateParts = fbdParseDateText(seg.dateText);
      if (!dateParts) return;
      const year = inferYear(dateParts.month, dateParts.day);
      const dep = fbdParseTime(seg.depTimeText);
      const departure = new Date(year, dateParts.month, dateParts.day, dep.h, dep.m, 0, 0);
      const arr = fbdParseTime(seg.arrTimeText);
      const arrival = new Date(year, dateParts.month, dateParts.day + seg.dayOffset, arr.h, arr.m, 0, 0);

      legs.push({
        airline: { code: seg.carrierCode },
        flightNumber: seg.flightNumber,
        cabin: seg.cabinCode,
        aircraft: seg.aircraft,
        origin: { iata: seg.origin },
        destination: { iata: seg.dest },
        departure,
        arrival,
        duration: seg.durMin,
      });
    });
    return legs;
  }

  function injectFlyBasisDetailButton() {
    // Anchor on the header row itself rather than a generic utility-
    // class combo (those are common enough elsewhere that matching on
    // class alone risks landing on the wrong row) — the route+date
    // summary text ("X to Y on Sat, Jan 23") is distinctive enough to
    // find the right one reliably. Also requires there to be NO
    // data-json anywhere on the page — if there is, this is the inline
    // accordion (which the list-view button above already handles), not
    // the standalone detail page, and this should stay out of its way.
    if (document.querySelector('[data-json][data-itinerary-id]')) return;
    const headerP = Array.from(document.querySelectorAll('p')).find((p) => / to .+ on [A-Za-z]{3},\s*[A-Za-z]{3}\s+\d/.test(p.textContent));
    if (!headerP) return;
    const row = headerP.closest('.flex.w-full.items-center.justify-between');
    if (!row || row.dataset.gdsDetailWired) return;
    row.dataset.gdsDetailWired = '1';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gds-btn-base gds-btn-flybasis';
    btn.textContent = 'GDS';
    btn.title = 'Copy Sabre IA / VI* format for this itinerary';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const container = document.querySelector('.mb-\\[100px\\]') || document.body;
      const rawSegments = fbdParseSegments(container);
      const legs = fbdBuildLegs(rawSegments);
      if (legs.length) {
        flashButton(btn, buildBoth({ flights: [{ legs }], pax: 1 }));
      } else {
        flashError(btn, '\u274c No data');
      }
    });
    // The row is already "justify-between" (title on the left, a small
    // icon-group on the right) — appending into that existing right-
    // side group lands this at the far right naturally, flowing with
    // whatever's already there, rather than needing absolute
    // positioning to force it into a corner.
    const rightGroup = row.querySelector('.flex.items-center.gap-1') || row;
    rightGroup.appendChild(btn);
  }

  // ------------------------------------------------------------------
  // POINTSYEAH ADAPTER
  // ------------------------------------------------------------------
  function pyParsePax() {
    const params = new URLSearchParams(location.search);
    const adults = parseInt(params.get('adults') || '1', 10) || 1;
    const children = parseInt(params.get('children') || '0', 10) || 0;
    return adults + children;
  }

  // Reads every flight in an expanded PointsYeah itinerary. PointsYeah has
  // shown the flight line ("PR101 · Boeing 777" or just "PR101 ·"), the
  // cabin and the flight time both AFTER the arrival and BETWEEN departure
  // and arrival, so each flight's details are looked for anywhere in its
  // own block (from its departure up to the next flight's departure),
  // never at one fixed position.
  function pyParseDetailLegs(detailEl) {
    const lines = detailEl.innerText.split('\n').map((s) => s.replace(/ /g, ' ').trim()).filter(Boolean);
    const dtRe = /^[A-Za-z]{3},\s*[A-Za-z]{3}\s+\d{1,2},?\s+\d{4}\s+\d{1,2}:\d{2}\s*(am|pm)$/i;
    const stationRe = /\(([A-Z]{3})\)\s*$/;
    const flightRe = /^([A-Z0-9]{2})\s?(\d{1,4})(?![\dhm])\s*(?:[·•|]\s*(.*))?$/;
    const cabinRe = /^(premium economy|premium|economy|coach|business|first)\b(?:.*?\(([A-Z])\))?/i;
    const durRe = /^(\d{1,2})\s*h(?:\s*(\d{1,2})\s*m)?$/i;

    // Departure/arrival pairs: a date-time line followed by "Airport (XXX)".
    const stamps = [];
    for (let i = 0; i < lines.length - 1; i++) {
      if (dtRe.test(lines[i]) && stationRe.test(lines[i + 1])) stamps.push(i);
    }
    const legs = [];
    for (let k = 0; k + 1 < stamps.length; k += 2) {
      const di = stamps[k];
      const ai = stamps[k + 1];
      const end = k + 2 < stamps.length ? stamps[k + 2] : lines.length;
      let flightNo = '', aircraft = '', cabin = '', bookingCode = '', durMin = 0;
      for (let j = di + 2; j < end; j++) {
        if (j === ai || j === ai + 1) continue;
        const t = lines[j];
        if (j > ai && /^layover/i.test(t)) break;
        const dm = !durMin && t.match(durRe);
        if (dm) { durMin = parseInt(dm[1], 10) * 60 + (parseInt(dm[2] || '0', 10) || 0); continue; }
        const fm = !flightNo && t.match(flightRe);
        if (fm) { flightNo = fm[1] + fm[2]; aircraft = (fm[3] || '').trim(); continue; }
        const cm = !cabin && t.match(cabinRe);
        if (cm) { cabin = /^premium/i.test(cm[1]) ? 'premium economy' : cm[1].toLowerCase(); if (cm[2]) bookingCode = cm[2]; }
      }
      legs.push({ depDT: lines[di], depCode: lines[di + 1].match(stationRe)[1], arrDT: lines[ai], arrCode: lines[ai + 1].match(stationRe)[1], flightNo, aircraft, cabin, bookingCode, durMin });
    }
    return legs;
  }

  // Flight numbers from the card header ("Philippine Airlines - PR101"),
  // for when the expanded block doesn't show them.
  function pyHeaderFlightNos(anchorEl) {
    let card = anchorEl;
    for (let i = 0; i < 8 && card && card.parentElement; i++) card = card.parentElement;
    const text = card ? card.innerText : '';
    return Array.from(text.matchAll(/ - ([A-Z0-9]{2})\s?(\d{1,4})\b/g)).map((m) => m[1] + m[2]);
  }

  function pyTzDuration(leg) {
    const plain = Math.round((leg.arrival - leg.departure) / 60000);
    const o1 = estimateUtcOffset(leg.origin.iata);
    const o2 = estimateUtcOffset(leg.destination.iata);
    if (o1 == null || o2 == null) return Math.max(0, plain);
    return Math.max(0, plain - (o2 - o1) * 60);
  }

  function pyToDate(dtStr) {
    return new Date(dtStr.replace(/^[A-Za-z]{3},\s*/, ''));
  }

  function pyFindDetailBlock(anchorEl) {
    const details = document.querySelectorAll('div[class*="rounded-t-none"][class*="rounded-l-2xl"]');
    const anchorRect = anchorEl.getBoundingClientRect();
    let best = null;
    let bestDist = Infinity;
    details.forEach((d) => {
      const r = d.getBoundingClientRect();
      const dist = r.top - anchorRect.top;
      if (dist >= -5 && dist < bestDist) {
        bestDist = dist;
        best = d;
      }
    });
    return best;
  }

  function pyBuildItinerary(anchorEl) {
    const detailEl = pyFindDetailBlock(anchorEl);
    if (!detailEl) return null;
    const rawLegs = pyParseDetailLegs(detailEl);
    if (!rawLegs.length) return null;

    const pax = pyParsePax();
    const headerNos = pyHeaderFlightNos(anchorEl);
    const legs = rawLegs.map((rl, i) => {
      const fno = rl.flightNo || (headerNos.length === rawLegs.length ? headerNos[i] : '');
      const leg = {
        airline: { code: fno.slice(0, 2) },
        flightNumber: fno.slice(2),
        cabin: CABIN_WORD_TO_CODE[rl.cabin] || 'y',
        aircraft: rl.aircraft,
        origin: { iata: rl.depCode },
        destination: { iata: rl.arrCode },
        departure: pyToDate(rl.depDT),
        arrival: pyToDate(rl.arrDT),
        duration: rl.durMin || 0,
      };
      // No duration shown: work it out with both airports' time zones
      // (plain subtraction of two local times is wrong across zones).
      if (!leg.duration) leg.duration = pyTzDuration(leg);
      if (rl.bookingCode) leg.bookingCode = rl.bookingCode;
      return leg;
    });

    return { flights: [{ legs }], pax };
  }

  async function handlePointsYeahCopy(bellBtn, btn) {
    let itinerary = pyBuildItinerary(bellBtn);

    if (!itinerary) {
      // The itinerary breakdown only renders once the row/option is
      // expanded. The bell button (and its immediate wrapper) is a
      // price-alert control, not an expand toggle — clicking anywhere
      // near it opens an unrelated promo dialog, so those are excluded
      // entirely. Climb further out to the row/card ancestors instead.
      const candidates = [
        bellBtn.closest('tr'),
        bellBtn.parentElement?.parentElement,
        bellBtn.parentElement?.parentElement?.parentElement,
        bellBtn.parentElement?.parentElement?.parentElement?.parentElement,
      ].filter(Boolean);

      for (const trigger of candidates) {
        if (itinerary) break;
        trigger.click();
        await wait(400);
        itinerary = pyBuildItinerary(bellBtn);
      }
    }

    if (itinerary) {
      flashButton(btn, buildBoth(itinerary));
    } else {
      flashError(btn, '\u274c No data');
    }
  }

  function injectPointsYeahButtons() {
    const bellPaths = document.querySelectorAll('path[fill="#FFC800"]');
    bellPaths.forEach((path) => {
      const bellBtn = path.closest('button');
      if (!bellBtn) return;
      const container = bellBtn.parentElement;
      if (!container || container.dataset.gdsInjected) return;
      container.dataset.gdsInjected = '1';

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gds-btn-base gds-btn-yeah';
      btn.textContent = 'GDS';
      btn.title = 'Copy Sabre IA / VI* format for this itinerary';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        handlePointsYeahCopy(bellBtn, btn);
      });
      container.appendChild(btn);
    });
  }

  // ------------------------------------------------------------------
  // AWARDLOGIC ADAPTER
  //
  // The collapsed result row (`.results-trip-list-item`) never exposes a
  // real flight number — only a rough cabin % summary — so that path is
  // kept only as a last-resort fallback (flight number "????").
  //
  // Clicking the option opens an "add to itinerary" detail view
  // (`.results-trip-add`) that DOES expose real flight numbers, per-leg
  // cabin, and per-leg duration. The GDS button now clicks to open that
  // view (if not already open) and parses it instead.
  // ------------------------------------------------------------------
  function alParsePax() {
    const m = location.pathname.match(/(\d+):(\d+):(\d+):(\d+):(\d+):(\d+)$/);
    if (m) return (parseInt(m[1], 10) || 1) + (parseInt(m[2], 10) || 0);
    return 1;
  }

  function alParseDate() {
    const m = location.pathname.match(/(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : new Date().toISOString().slice(0, 10);
  }

  function alBaseYear() {
    const m = alParseDate().match(/^(\d{4})/);
    return m ? parseInt(m[1], 10) : new Date().getFullYear();
  }

  function alParseTime12(timeStr, ampm) {
    const [hStr, mStr] = (timeStr || '0:0').split(':');
    let h = parseInt(hStr, 10) || 0;
    const m = parseInt(mStr, 10) || 0;
    const isPM = /pm/i.test(ampm || '');
    if (isPM && h < 12) h += 12;
    if (!isPM && h === 12) h = 0;
    return { h, m };
  }

  // Builds a Date from a "Mon Day" style text (e.g. "Tue, Oct 27") plus a
  // "H:MM AM/PM" clock string, anchored to the given year.
  function alDateFromParts(monthDayText, timeStr, year) {
    const dm = (monthDayText || '').match(/([A-Za-z]{3})\s+(\d{1,2})/);
    if (!dm) return null;
    const month = MONTH_MAP[dm[1].toLowerCase()];
    if (month === undefined) return null;
    const day = parseInt(dm[2], 10);
    const { h, m } = alParseTime12(...(timeStr || '').match(/(\d{1,2}:\d{2})\s*(AM|PM)/i)?.slice(1) || ['0:0', 'AM']);
    return new Date(year, month, day, h, m, 0, 0);
  }

  function alBuildItinerary(card) {
    const airlineImg = card.querySelector('.airline-logo-wrapper__img img');
    const carrier = (airlineImg?.alt || '').trim().toUpperCase();
    const points = card.querySelectorAll('.results-trip-list-item__time-info-point');
    if (points.length < 2) return null;

    const depAirport = points[0].querySelector('.results-trip-list-item__time-info-airport')?.textContent.trim();
    const depTimeStr = points[0].querySelector('.results-trip-list-item__time-info-time')?.textContent.trim();
    const depAmPm = points[0].querySelector('.results-trip-list-item__time-info-half-day')?.textContent.trim();
    const arrAirport = points[1].querySelector('.results-trip-list-item__time-info-airport')?.textContent.trim();
    const durationStr = card.querySelector('.results-trip-list-item__time-info-sum')?.textContent.trim() || '0h 0m';
    const cabinText = card.querySelector('.results-trip-list-item__cabin-info')?.textContent.trim() || '';
    const cabinWordMatch = cabinText.match(/economy|premium economy|business|first/i);
    const cabinWord = cabinWordMatch ? cabinWordMatch[0].toLowerCase() : 'economy';
    const cabinCode = CABIN_WORD_TO_CODE[cabinWord] || 'y';

    if (!depAirport || !arrAirport || !depTimeStr) return null;

    const year = alBaseYear();
    const { h, m } = alParseTime12(depTimeStr, depAmPm);
    const depDate = new Date(year, 0, 1);
    const dateStr = alParseDate();
    const dm = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dm) depDate.setFullYear(parseInt(dm[1], 10), parseInt(dm[2], 10) - 1, parseInt(dm[3], 10));
    depDate.setHours(h, m, 0, 0);
    const durMin = parseDurationMinutes(durationStr);
    const arrDate = new Date(depDate.getTime() + durMin * 60000);

    const leg = {
      airline: { code: carrier },
      flightNumber: '????',
      cabin: cabinCode,
      aircraft: '',
      origin: { iata: depAirport },
      destination: { iata: arrAirport },
      departure: depDate,
      arrival: arrDate,
      duration: durMin,
    };
    return { flights: [{ legs: [leg] }], pax: alParsePax() };
  }

  // Parses the expanded "results-trip-add" detail view for real per-segment
  // flight numbers / cabins / durations. Only two overall dates are shown
  // in this markup (trip depart date, trip arrival date) — not one date per
  // segment — so as a best effort, earlier segments anchor to the overall
  // departure date and the final segment anchors to the overall arrival
  // date (identical in the common case where the whole itinerary lands the
  // same calendar day it departs).
  function alParseExpandedSegments(detailEl) {
    const year = alBaseYear();
    const departText = detailEl.querySelector('.trip-info-card__time-date')?.textContent.trim() || '';
    const arriveTextRaw = detailEl.querySelector('.trip-info-card__time-arrival')?.textContent || '';
    const arriveText = arriveTextRaw.replace(/^\s*This flight arrives\s*-\s*/i, '').trim() || departText;

    const segEls = detailEl.querySelectorAll('.results-trip-add-flight');
    const legs = [];

    segEls.forEach((segEl, idx) => {
      const points = segEl.querySelectorAll('.results-trip-add-flight__point');
      if (points.length < 2) return;

      const depCode = points[0].querySelector('.results-trip-add-flight__point-abbr')?.textContent.trim() || '';
      const depTimeStr = points[0].querySelector('.results-trip-add-flight__point-date')?.textContent.trim() || '';
      const arrCode = points[1].querySelector('.results-trip-add-flight__point-abbr')?.textContent.trim() || '';

      const infoItems = segEl.querySelectorAll('.results-trip-add-flight__info-item');
      const flightText = (infoItems[0]?.textContent || '').replace(/\|\s*$/, '').trim();
      const flightMatch = flightText.match(/^([A-Z0-9]{2})\s*(\d+)/i);
      const carrier = flightMatch ? flightMatch[1].toUpperCase() : '';
      const flightNumber = flightMatch ? flightMatch[2] : '';
      if (!depCode || !arrCode || !flightNumber) return;

      const cabinText = (segEl.querySelector('.results-trip-add-flight__cabin')?.textContent || '').trim().toLowerCase();
      const cabinCode = CABIN_WORD_TO_CODE[cabinText] || 'y';

      const durationStr = segEl.querySelector('.results-trip-add-flight__duration span')?.textContent.trim() || '0h 0m';
      const durMin = parseDurationMinutes(durationStr);

      const isLast = idx === segEls.length - 1;
      const depDate = alDateFromParts(isLast ? arriveText : departText, depTimeStr, year);
      if (!depDate) return;
      const arrDate = new Date(depDate.getTime() + durMin * 60000);

      legs.push({
        airline: { code: carrier },
        flightNumber,
        cabin: cabinCode,
        aircraft: '',
        origin: { iata: depCode },
        destination: { iata: arrCode },
        departure: depDate,
        arrival: arrDate,
        duration: durMin,
      });
    });

    return legs;
  }

  async function handleAwardLogicCopy(card, btn) {
    let legs = [];
    let detailEl = document.querySelector('.results-trip-add');
    const wasAlreadyOpen = !!detailEl;
    let trigger = null;
    let hidden = false;

    if (!detailEl) {
      const triggerSelectors = [
        '.results-trip-list-item__flight-wrapper',
        '.results-trip-list-item__info-flight',
        '.results-trip-list-item__airline-info',
      ];
      for (const sel of triggerSelectors) {
        trigger = card.querySelector(sel);
        if (trigger) break;
      }
      trigger = trigger || card;
      trigger.click();
    }

    for (let attempt = 0; attempt < 5 && !legs.length; attempt++) {
      await wait(300);
      detailEl = document.querySelector('.results-trip-add');
      if (detailEl && !wasAlreadyOpen && !hidden) {
        // Hide it via CSS immediately so there's no visible flash while
        // we read it — this is purely cosmetic now, not the close
        // mechanism itself (see below). Hidden elements are still fully
        // readable via the DOM, so parsing is unaffected.
        //
        // Explicitly target `.wl-ui-modal` itself (the true outermost
        // root — it carries its own positioning custom properties, so
        // it's almost certainly the element actually covering the page)
        // rather than climbing a fixed number of parentElement levels,
        // which previously stopped one level short of it and left it
        // un-hidden — very likely the actual source of the page staying
        // unclickable even after the close click below.
        let el = detailEl;
        for (let level = 0; level < 3 && el; level++) {
          el.style.setProperty('display', 'none', 'important');
          el = el.parentElement;
        }
        const modalRootEl = detailEl.closest('.wl-ui-modal');
        if (modalRootEl) modalRootEl.style.setProperty('display', 'none', 'important');
        document.querySelectorAll('.wl-ui-modal__overlay').forEach((overlay) => {
          overlay.style.setProperty('display', 'none', 'important');
        });
        hidden = true;
      }
      if (detailEl) legs = alParseExpandedSegments(detailEl);
    }

    if (!wasAlreadyOpen && detailEl) {
      // Use the framework's own close button rather than guessing at
      // what it does internally (scroll-lock, click-blocking overlay,
      // event listeners, etc.) — clicking it runs the real teardown, so
      // nothing needs to be reverse-engineered or manually restored.
      // Hiding above is what prevents the visible flash; this is what
      // actually leaves the page clickable again afterward.
      const modalRoot = detailEl.closest('.wl-ui-modal');
      const closeIcon = (modalRoot && modalRoot.querySelector('.wl-ui-modal__close-icon'))
        || document.querySelector('.wl-ui-modal__close-icon')
        || document.querySelector('.user-ui-icon-modal-close');
      if (closeIcon) {
        // Un-hide the root right before the click — some frameworks'
        // click handlers bail out early if they read the element as
        // already hidden/not-visible, so the forced hide above could
        // itself prevent the close handler from ever running.
        if (modalRoot) modalRoot.style.removeProperty('display');
        closeIcon.click();
        await wait(200);
        // Hide again in case anything flashed visible during that gap.
        if (modalRoot) modalRoot.style.setProperty('display', 'none', 'important');
      }
      // Cheap extra safety net regardless of whether a close icon was
      // found — a plain scroll-lock (inline `overflow` on body/html) is
      // a common secondary cause of "page won't scroll/click" and costs
      // nothing to clear even if it wasn't the actual cause here.
      document.body.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('overflow');
    }

    if (legs.length) {
      flashButton(btn, buildBoth({ flights: [{ legs }], pax: alParsePax() }));
      return;
    }

    // Fallback: row-level summary only (flight number unavailable there).
    const itinerary = alBuildItinerary(card);
    if (itinerary) {
      flashButton(btn, buildBoth(itinerary));
    } else {
      flashError(btn, '\u274c No data');
    }
  }

  function injectAwardLogicButtons() {
    const cabinBlocks = document.querySelectorAll('.results-trip-list-item__cabin:not([data-gds-injected])');
    cabinBlocks.forEach((cabinEl) => {
      cabinEl.setAttribute('data-gds-injected', '1');
      const card = cabinEl.closest('.results-trip-list-item') || cabinEl.closest('.results-trip-list-item__info');
      if (!card) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gds-btn-base gds-btn-award';
      btn.textContent = 'GDS';
      btn.title = 'Copy Sabre IA / VI* format for this result';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        handleAwardLogicCopy(card, btn);
      });
      cabinEl.parentElement.insertBefore(btn, cabinEl.nextSibling);
    });
  }

  // ------------------------------------------------------------------
  // KAYAK ADAPTER
  //
  // The leg-checkbox summary (`.hJSA-item`) never had real flight numbers
  // — that's why it always produced "????". Each result also has a
  // sibling "-details" panel (`.o-C7`, id ending in "-details") with real
  // per-segment data: a `data-flightnumber` attribute right on each
  // segment, explicit departure AND arrival dates (so no guessing needed
  // for rollovers), cabin, and aircraft type. That panel is preferred;
  // the leg-checkbox summary is kept only as a last-resort fallback.
  // ------------------------------------------------------------------
  function kyResolveYear(month) {
    const matches = [...location.pathname.matchAll(/(\d{4})-(\d{2})-(\d{2})/g)];
    for (const m of matches) {
      if (parseInt(m[2], 10) - 1 === month) return parseInt(m[1], 10);
    }
    return matches.length ? parseInt(matches[0][1], 10) : new Date().getFullYear();
  }

  function kyParseCabin() {
    const path = location.pathname.toLowerCase();
    if (path.includes('business')) return 'j';
    if (path.includes('first')) return 'f';
    if (path.includes('premium')) return 'w';
    return 'y';
  }

  function kyFindDetailsPanel(card) {
    const container = card.closest('.Fxw9-result-item-container') || card.parentElement;
    if (!container) return null;
    return container.querySelector('[id$="-details"]') || container.querySelector('.o-C7');
  }

  function kyParseFullDate(dateText, timeText) {
    const dm = (dateText || '').match(/([A-Za-z]{3})\s+(\d{1,2})/);
    if (!dm) return null;
    const month = MONTH_MAP[dm[1].toLowerCase()];
    if (month === undefined) return null;
    const day = parseInt(dm[2], 10);
    const year = inferYear(month, day);
    const { h, m } = parseClockTime(timeText);
    return new Date(year, month, day, h, m, 0, 0);
  }

  function kyParseDetailsSegments(detailsPanel) {
    const legs = [];
    const cabinFallback = kyParseCabin();
    const segEls = detailsPanel.querySelectorAll('.c1hxM[data-flightnumber]');

    segEls.forEach((seg) => {
      const flightNumber = seg.getAttribute('data-flightnumber') || '';
      const img = seg.querySelector('.c1hxM-carrier-icon img');
      const carrierMatch = img?.src.match(/\/([A-Z]{2})\.png/i);
      let carrier = carrierMatch ? carrierMatch[1].toUpperCase() : '';
      if (!carrier) {
        const name = (img?.alt || '').trim().toLowerCase();
        carrier = AIRLINE_MAP[name] || '';
      }
      if (!flightNumber || !carrier) return;

      const inlineBody = seg.querySelector('.c1hxM-inline-segment-body');
      if (!inlineBody) return;

      const rowEntries = Array.from(inlineBody.querySelectorAll('.qvW6-row-entry'));
      const routeRow = rowEntries.find((r) => !r.classList.contains('qvW6-day-with-date'));
      const dateRow = inlineBody.querySelector('.qvW6-row-entry.qvW6-day-with-date');
      const durationEntry = inlineBody.querySelector('.qvW6-duration-entry');
      if (!routeRow || !dateRow || !durationEntry) return;

      const routeCols = routeRow.querySelectorAll('.qvW6-half-column');
      const originCode = routeCols[0]?.textContent.trim() || '';
      const destCode = routeCols[1]?.textContent.trim() || '';

      const dateCols = dateRow.querySelectorAll('.qvW6-half-column');
      const depDateText = dateCols[0]?.textContent.trim() || '';
      const arrDateText = dateCols[1]?.textContent.trim() || depDateText;

      const timeDisplays = durationEntry.querySelectorAll('.qvW6-time-display');
      const depTimeText = timeDisplays[0]?.textContent.trim() || '';
      const arrTimeText = timeDisplays[1]?.textContent.trim() || '';

      const durationText = durationEntry.querySelector('.qvW6-duration-column')?.textContent.trim() || '0h 0m';
      const durMin = parseDurationMinutes(durationText);

      const cabinWord = (seg.querySelector('.w4o3-cabin-display')?.textContent || '').trim().toLowerCase();
      const cabinCode = CABIN_WORD_TO_CODE[cabinWord] || cabinFallback;

      const aircraft = (seg.querySelector('[aria-label="Aircraft"]')?.textContent || '').trim();

      const depDate = kyParseFullDate(depDateText, depTimeText);
      const arrDate = kyParseFullDate(arrDateText, arrTimeText);
      if (!depDate || !arrDate || !originCode || !destCode) return;

      legs.push({
        airline: { code: carrier },
        flightNumber,
        cabin: cabinCode,
        aircraft,
        origin: { iata: originCode },
        destination: { iata: destCode },
        departure: depDate,
        arrival: arrDate,
        duration: durMin,
      });
    });

    return legs;
  }

  // Legacy fallback: the leg-checkbox summary. No real flight numbers are
  // ever exposed here, so this only runs when the details panel can't be
  // found at all.
  function kyParseLeg(liEl, cabinCode) {
    const img = liEl.querySelector('.c5iUd-leg-carrier img');
    const carrierMatch = img?.src.match(/\/([A-Z]{2})\.png/i);
    let carrier = carrierMatch ? carrierMatch[1].toUpperCase() : '';
    if (!carrier) {
      const name = (img?.alt || '').trim().toLowerCase();
      carrier = AIRLINE_MAP[name] || '';
    }

    const dateShort = liEl.querySelector('.c9L-i .vmXl')?.textContent.trim() || '';
    const dm = dateShort.match(/(\d{1,2})\/(\d{1,2})/);
    if (!dm) return null;
    const month = parseInt(dm[1], 10) - 1;
    const day = parseInt(dm[2], 10);
    const year = kyResolveYear(month);

    const timesEl = liEl.querySelector('.VY2U .vmXl-mod-variant-large');
    const timesText = timesEl?.textContent || '';
    const timeMatches = [...timesText.matchAll(/(\d{1,2}):(\d{2})\s*(am|pm)/gi)];
    if (timeMatches.length < 2) return null;
    const depM = timeMatches[0];
    let depH = parseInt(depM[1], 10);
    const depMin = parseInt(depM[2], 10);
    if (/pm/i.test(depM[3]) && depH < 12) depH += 12;
    if (/am/i.test(depM[3]) && depH === 12) depH = 0;

    const durationStr = liEl.querySelector('.xdW8 .vmXl')?.textContent.trim() || '0h 0m';
    const durMin = parseDurationMinutes(durationStr);

    const codes = liEl.querySelectorAll('.EFvI .a6Um-mod-ellipsis span');
    const originCode = codes[0]?.textContent.trim() || '';
    const destCode = codes[1]?.textContent.trim() || '';
    if (!originCode || !destCode) return null;

    const depDate = new Date(year, month, day, depH, depMin, 0, 0);
    const arrDate = new Date(depDate.getTime() + durMin * 60000);

    return {
      airline: { code: carrier },
      flightNumber: '????',
      cabin: cabinCode,
      aircraft: '',
      origin: { iata: originCode },
      destination: { iata: destCode },
      departure: depDate,
      arrival: arrDate,
      duration: durMin,
    };
  }

  function kyBuildItinerary(card) {
    const cabinCode = kyParseCabin();
    const legItems = card.querySelectorAll('.hJSA-item');
    const legs = [];
    legItems.forEach((li) => {
      const leg = kyParseLeg(li, cabinCode);
      if (leg) legs.push(leg);
    });
    if (!legs.length) return null;
    return { flights: legs.map((leg) => ({ legs: [leg] })), pax: 1 };
  }

  async function handleKayakCopy(card, btn) {
    let panel = kyFindDetailsPanel(card);
    let legs = panel ? kyParseDetailsSegments(panel) : [];

    if (!legs.length) {
      // The details panel may only render once the card is expanded.
      const expandTarget = card.querySelector('.hJSA') || card.querySelector('.nrc6-main') || card;
      expandTarget.click();
      await wait(500);
      panel = kyFindDetailsPanel(card);
      legs = panel ? kyParseDetailsSegments(panel) : [];
    }

    const itinerary = legs.length ? { flights: [{ legs }], pax: 1 } : kyBuildItinerary(card);

    if (itinerary) {
      flashButton(btn, buildBoth(itinerary));
    } else {
      flashError(btn, '\u274c No data');
    }
  }

  function injectKayakButtons() {
    const cards = document.querySelectorAll('.nrc6:not([data-gds-injected])');
    cards.forEach((card) => {
      const priceSection = card.querySelector('.nrc6-price-section');
      if (!priceSection) return;
      card.setAttribute('data-gds-injected', '1');

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gds-btn-base gds-btn-kayak';
      btn.textContent = 'GDS';
      btn.title = 'Copy Sabre IA / VI* format for this result';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        handleKayakCopy(card, btn);
      });

      // Anchor the button right next to this card's own booking/select
      // control so it reads as "this option's" GDS copy.
      const bookingBtn = priceSection.querySelector('.M_JD-booking-btn') || priceSection.querySelector('.oVHK');
      if (bookingBtn) {
        bookingBtn.insertAdjacentElement('beforebegin', btn);
      } else {
        priceSection.insertBefore(btn, priceSection.firstChild);
      }
    });
  }

  // ------------------------------------------------------------------
  // CHEAPOAIR ADAPTER
  //
  // `.trip-selection-popup__times` (dep/arr time-cols) is a SIBLING of
  // the route/flight-number container, not a child of it — segments are
  // found by walking each `...__times` block and pairing it with its
  // preceding sibling. That sibling's own class name isn't stable (some
  // pages have it as `.flight-segment-container`, others as a bare
  // `.fp-position-relative` with no segment-specific class at all), so
  // it's identified by containing `.trip-selection-popup__route` instead
  // of by class name.
  // ------------------------------------------------------------------
  function coParseDateTime(dateText, timeText) {
    const dm = (dateText || '').match(/([A-Za-z]{3})\s+(\d{1,2})/);
    const tm = (timeText || '').match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!dm || !tm) return new Date();
    const month = MONTH_MAP[dm[1].toLowerCase()] ?? 0;
    const day = parseInt(dm[2], 10);
    let h = parseInt(tm[1], 10);
    const m = parseInt(tm[2], 10);
    const isPM = tm[3].toUpperCase() === 'PM';
    if (isPM && h < 12) h += 12;
    if (!isPM && h === 12) h = 0;
    const year = coResolveYear(month);
    return new Date(year, month, day, h, m, 0, 0);
  }

  function coResolveYear(month) {
    const params = new URLSearchParams(location.search);
    const parse = (s) => {
      if (!s) return null;
      const parts = s.split('/').map(Number);
      if (parts.length !== 3) return null;
      return { month: parts[0] - 1, year: parts[2] };
    };
    const f = parse(params.get('fromDt') || params.get('dt1'));
    const t = parse(params.get('toDt') || params.get('dt2'));
    if (f && f.month === month) return f.year;
    if (t && t.month === month) return t.year;
    return f ? f.year : new Date().getFullYear();
  }

  function coParsePax() {
    const params = new URLSearchParams(location.search);
    const ad = parseInt(params.get('ad') || '1', 10) || 1;
    const ch = parseInt(params.get('ch') || '0', 10) || 0;
    return ad + ch;
  }

  // CheapOair renders this same detail popup with at least two different
  // class-prefix conventions for the time-column/time/time-divider
  // pieces specifically ("trip-selection-popup__" vs "trip-details__")
  // — which one shows up isn't tied to airline, route, or anything else
  // identifiable ahead of time (a mixed-cabin itinerary rendered with
  // "trip-details__" here, but an earlier fix needed
  // "trip-selection-popup__" for what looked like the same kind of
  // card). Hardcoding either one is chasing a moving target, so these
  // try both and use whichever one actually finds something.
  function qsaAnyClass(root, classNames) {
    for (const cls of classNames) {
      const found = root.querySelectorAll(cls);
      if (found.length) return found;
    }
    return root.querySelectorAll(classNames[0]);
  }
  function qsAnyClass(root, classNames) {
    for (const cls of classNames) {
      const found = root.querySelector(cls);
      if (found) return found;
    }
    return null;
  }

  function coParseSegments(card) {
    const legs = [];
    const timesBlocks = card.querySelectorAll('.trip-selection-popup__times');

    timesBlocks.forEach((timesEl) => {
      const sibling = timesEl.previousElementSibling;
      if (!sibling) return;
      // The route/flight-number container is sometimes the previous
      // sibling ITSELF (not a wrapper containing it) — querySelector never
      // matches the element it's called on, only descendants, so that
      // case needs an explicit .matches() check or every segment gets
      // silently skipped (this was the actual "no data" bug).
      const c = sibling.matches && sibling.matches('.trip-selection-popup__route')
        ? sibling
        : sibling.querySelector('.trip-selection-popup__route');
      if (!c) return;

      let cabinWord = 'economy';
      c.querySelectorAll('.trip-selection-popup__equipment-info').forEach((sp) => {
        const t = sp.textContent;
        const m = t.match(/cabin:\s*([a-z\s]+)/i);
        if (m) cabinWord = m[1].trim().toLowerCase();
      });
      let cabinCode = 'y';
      if (cabinWord.includes('business')) cabinCode = 'j';
      else if (cabinWord.includes('first')) cabinCode = 'f';
      else if (cabinWord.includes('premium')) cabinCode = 'w';

      const flightSpan = c.querySelector('.airlinecode.fp-no-wrap, span.fp-no-wrap');
      const flightText = flightSpan?.textContent.trim() || '';
      // Carrier codes aren't always two LETTERS — JetBlue is "B6", and
      // other carriers mix digits into their 2-character code the same
      // way. Requiring [A-Z]{2} silently dropped any of those (this is
      // why JetBlue's leg specifically went missing — nothing airline-
      // specific about it otherwise, the regex just never matched "B6").
      const flightMatch = flightText.match(/^([A-Z0-9]{2})\s*(\d+)$/i);
      const carrier = flightMatch ? flightMatch[1].toUpperCase() : '';
      const flightNumber = flightMatch ? flightMatch[2] : '';

      const equipCodeSpan = c.querySelector('.tippy-action.is--underline');
      const equipmentCode = equipCodeSpan?.textContent.trim() || '';
      const aircraftHint = (c.querySelector('.sr-only')?.getAttribute('aria-label') || '').trim();

      const timeCols = qsaAnyClass(timesEl, ['.trip-selection-popup__time-col', '.trip-details__time-col']);
      if (timeCols.length < 2 || !flightNumber) return;

      const depTimeEl = qsAnyClass(timeCols[0], ['.trip-selection-popup__time', '.trip-details__time']);
      const depTimeText = depTimeEl ? depTimeEl.childNodes[0]?.textContent.trim() : '';
      const depDateText = timeCols[0].querySelector('.fp-font-sm.fp-font-normal')?.textContent.trim() || '';
      const depAirportSpans = timeCols[0].querySelectorAll('.trip-details__airport-code span');
      const depAirportText = depAirportSpans[depAirportSpans.length - 1]?.textContent.trim() || '';
      const depCode = (depAirportText.match(/\(([A-Z]{3})\)/) || [])[1] || '';

      const arrTimeEl = qsAnyClass(timeCols[1], ['.trip-selection-popup__time', '.trip-details__time']);
      const arrTimeText = arrTimeEl ? arrTimeEl.childNodes[0]?.textContent.trim() : '';
      const arrDateText = timeCols[1].querySelector('.fp-font-sm.fp-font-normal')?.textContent.trim() || '';
      const arrAirportSpans = timeCols[1].querySelectorAll('.trip-details__airport-code span');
      const arrAirportText = arrAirportSpans[arrAirportSpans.length - 1]?.textContent.trim() || '';
      const arrCode = (arrAirportText.match(/\(([A-Z]{3})\)/) || [])[1] || '';

      const dividerEl = qsAnyClass(timesEl, ['.trip-selection-popup__time-divider', '.trip-details__time-divider']);
      const travelTimeEl = dividerEl ? qsAnyClass(dividerEl, ['.trip-selection-popup__time', '.trip-details__time']) : null;
      const travelTimeText = travelTimeEl?.textContent.trim() || '0h 0m';
      const durMin = parseDurationMinutes(travelTimeText);

      const depDate = coParseDateTime(depDateText, depTimeText);
      // Arrival comes from the page's own stated arrival date+time, not
      // from adding the travel-time duration to departure. That
      // addition is wrong for any international leg: depDate is built
      // as a plain JS Date, which JavaScript anchors to whatever
      // timezone the browser itself is running in — not the airport's
      // real one. Reading a wall-clock time back off "departure instant
      // + duration" only comes out right if the browser's own timezone
      // happens to match the destination's, which for a route like
      // LHR→IAD it very much won't. The page already states the real
      // arrival date and time directly (the same way Kayak's adapter in
      // this file already does it) — using that sidesteps needing any
      // timezone math at all, correct or not.
      const arrDate = coParseDateTime(arrDateText, arrTimeText);

      if (!depCode || !arrCode) return;

      legs.push({
        airline: { code: carrier },
        flightNumber,
        cabin: cabinCode,
        equipmentCode,
        aircraft: aircraftHint,
        origin: { iata: depCode },
        destination: { iata: arrCode },
        departure: depDate,
        arrival: arrDate,
        duration: durMin,
      });
    });

    return legs;
  }

  async function handleCheapOairCopy(card, btn) {
    let legs = coParseSegments(card);

    if (!legs.length) {
      // The explicit trigger for the full flight-details view — clicking
      // it can render the popup either nested inside the card or as a
      // page-level tab/modal outside it, so both scopes are checked
      // after clicking rather than assuming one or the other.
      const detailTriggers = card.querySelectorAll('.is--flight-action');
      if (detailTriggers.length) {
        detailTriggers.forEach((el) => el.click());
        await wait(600);
        legs = coParseSegments(card);
        if (!legs.length) legs = coParseSegments(document);
      }
    }

    if (!legs.length) {
      // Older page-state fallback, in case a different build uses this
      // trigger instead.
      const oldDetailButtons = card.querySelectorAll('.itinerary-card__down-btn');
      if (oldDetailButtons.length) {
        oldDetailButtons.forEach((b) => b.click());
        await wait(500);
        legs = coParseSegments(card);
        if (!legs.length) legs = coParseSegments(document);
      }
    }

    if (legs.length) {
      flashButton(btn, buildBoth({ flights: [{ legs }], pax: coParsePax() }), true);
    } else {
      flashError(btn, '\u274c No data');
    }
  }

  function injectCheapOairButtons() {
    const cards = document.querySelectorAll('.itinerary-card:not([data-gds-injected])');
    cards.forEach((card) => {
      card.setAttribute('data-gds-injected', '1');
      const priceEl = card.querySelector('.itinerary-card__price');
      if (!priceEl) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gds-btn-base gds-btn-cheapoair';
      btn.textContent = 'GDS';
      btn.title = 'Copy Sabre IA / VI* format for this itinerary';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        handleCheapOairCopy(card, btn);
      });
      priceEl.appendChild(btn);
    });
  }

  // ------------------------------------------------------------------
  // GOOGLE FLIGHTS ADAPTER
  //
  // Unlike every other site here, Google Flights embeds a clean,
  // authoritative data string right in the DOM — a
  // `data-travelimpactmodelwebsiteurl` attribute whose `itinerary=`
  // query param is a comma-separated list of
  // "ORIGIN-DEST-CARRIER-FLIGHTNUM-YYYYMMDD" per segment. That gives
  // exact carrier/flight-number/route/departure-date for free, with a
  // real year — no inference needed. Only the clock times, cabin,
  // aircraft, and duration still have to be read from the visible
  // per-segment breakdown (`[jsname="lVbzR"]` blocks), and even the
  // duration comes from the page's own explicit "Travel time: Xhr Ymin"
  // text rather than being computed — computing it from the local
  // dep/arr clock times would be wrong across time zones (that's the
  // whole reason ITA needed the explicit-text fix earlier: this
  // itinerary's first leg's "Travel time" is 7h45m, but naively
  // subtracting local clock times gives 13h45m).
  // ------------------------------------------------------------------
  function gfParseClockTimeAmPm(t) {
    const m = (t || '').match(/(\d{1,2}):(\d{2})\s*([AP]M)/i);
    if (!m) return { h: 0, m: 0 };
    let h = parseInt(m[1], 10);
    const mi = parseInt(m[2], 10);
    const ap = m[3].toUpperCase();
    if (ap === 'PM' && h < 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return { h, m: mi };
  }

  function gfFindSliceCards() {
    const seenIds = new Set();
    const cards = [];
    document.querySelectorAll('[data-slice-id]').forEach((el) => {
      const sliceId = el.getAttribute('data-slice-id');
      if (!sliceId || seenIds.has(sliceId)) return;
      seenIds.add(sliceId);
      cards.push(el.closest('[role="listitem"]') || el);
    });
    return cards;
  }

  function gfParseSlice(sliceContainer) {
    const dataEl = sliceContainer.querySelector('[data-travelimpactmodelwebsiteurl]');
    const url = dataEl ? dataEl.getAttribute('data-travelimpactmodelwebsiteurl') : '';
    const itinMatch = url.match(/itinerary=([^&]+)/);
    const itinStr = itinMatch ? decodeURIComponent(itinMatch[1]) : '';
    const segMeta = itinStr.split(',').filter(Boolean).map((s) => {
      const parts = s.split('-');
      if (parts.length < 5) return null;
      const [origin, dest, carrier, flightNum, ymd] = parts;
      return { origin, dest, carrier, flightNum, ymd };
    }).filter(Boolean);

    const segBlocks = sliceContainer.querySelectorAll('[jsname="lVbzR"]');
    const legs = [];

    segBlocks.forEach((block, idx) => {
      const meta = segMeta[idx];
      if (!meta) return;

      const depLabelEl = block.querySelector('.dPzsIb [aria-label^="Departure time"]');
      const depLabel = depLabelEl ? depLabelEl.getAttribute('aria-label') : '';
      const depTimeMatch = depLabel.match(/Departure time:\s*([\d:]+\s*[AP]M)/i);

      const arrContainer = block.querySelector('.SWFQlc');
      const arrLabelEl = arrContainer ? arrContainer.querySelector('[aria-label^="Arrival time"]') : null;
      const arrLabel = arrLabelEl ? arrLabelEl.getAttribute('aria-label') : '';
      const arrTimeMatch = arrLabel.match(/Arrival time:\s*([\d:]+\s*[AP]M)/i);
      const arrDateMatch = arrLabel.match(/on\s+\w+,\s+(\w+)\s+(\d{1,2})/i);

      const durText = (block.querySelector('.CQYfx, .P102Lb') || {}).textContent || '';
      const durMatch = durText.match(/Travel time:\s*(\d+)\s*hr(?:\s*(\d+)\s*min)?/i);
      const durMin = durMatch ? (parseInt(durMatch[1], 10) * 60 + (durMatch[2] ? parseInt(durMatch[2], 10) : 0)) : 0;

      const infoContainer = block.querySelector('.MX5RWe');
      const cabinSpan = infoContainer ? infoContainer.querySelector('[jsname="Pvlywd"]') : null;
      const cabinText = (cabinSpan ? cabinSpan.textContent : '').trim().toLowerCase();
      let cabinCode = 'y';
      if (cabinText.includes('business')) cabinCode = 'j';
      else if (cabinText.includes('first')) cabinCode = 'f';
      else if (cabinText.includes('premium')) cabinCode = 'w';

      const bareSpans = infoContainer ? Array.from(infoContainer.querySelectorAll('.Xsgmwe'))
        .filter((el) => el.classList.length === 1 && !el.hasAttribute('jsname')) : [];
      const aircraftText = bareSpans.length ? bareSpans[bareSpans.length - 1].textContent.trim() : '';

      const year = parseInt(meta.ymd.slice(0, 4), 10);
      const month = parseInt(meta.ymd.slice(4, 6), 10) - 1;
      const day = parseInt(meta.ymd.slice(6, 8), 10);

      const depClock = gfParseClockTimeAmPm(depTimeMatch ? depTimeMatch[1] : '');
      const departure = new Date(year, month, day, depClock.h, depClock.m, 0, 0);

      const arrClock = gfParseClockTimeAmPm(arrTimeMatch ? arrTimeMatch[1] : '');
      let arrDay = day, arrMonth = month, arrYear = year;
      if (arrDateMatch) {
        const mAbbr = arrDateMatch[1].slice(0, 3).toLowerCase();
        const mIdx = MONTH_MAP[mAbbr];
        if (mIdx !== undefined) {
          arrMonth = mIdx;
          arrDay = parseInt(arrDateMatch[2], 10);
          arrYear = (arrMonth < month) ? year + 1 : year;
        }
      }
      const arrival = new Date(arrYear, arrMonth, arrDay, arrClock.h, arrClock.m, 0, 0);

      legs.push({
        airline: { code: meta.carrier },
        flightNumber: meta.flightNum,
        cabin: cabinCode,
        aircraft: aircraftText,
        origin: { iata: meta.origin },
        destination: { iata: meta.dest },
        departure,
        arrival,
        duration: durMin,
      });
    });

    return legs;
  }

  function gfParsePax() {
    const el = document.querySelector('[jsname="xAX4ff"]');
    const m = (el ? el.textContent : '').match(/(\d+)\s*passenger/i);
    return m ? parseInt(m[1], 10) : 1;
  }

  function handleGoogleFlightsCopy(btn) {
    const cards = gfFindSliceCards();
    const legs = [];
    cards.forEach((card) => legs.push(...gfParseSlice(card)));
    if (legs.length) {
      flashButton(btn, buildBoth({ flights: [{ legs }], pax: gfParsePax() }));
    } else {
      flashError(btn, '\u274c No data');
    }
  }

  function injectGoogleFlightsButton() {
    const priceBox = document.querySelector('.Y4xNqf');
    if (!priceBox) return;
    // Check the button's actual live presence rather than a flag stored
    // on the container — Google's own rendering re-renders this
    // container's contents once the real price arrives (replacing
    // whatever's inside it, including anything injected), but the
    // container ELEMENT itself survives that re-render. A dataset flag
    // set on that surviving element would stay set even after its
    // children — including this button — got wiped out from under it,
    // which is exactly why the button was disappearing once the page
    // "landed": the flag said "already done" when it very much wasn't.
    if (priceBox.querySelector('.gds-btn-googleflights')) return;
    priceBox.style.display = 'flex';
    priceBox.style.alignItems = 'center';
    priceBox.style.gap = '12px';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gds-btn-base gds-btn-googleflights';
    btn.textContent = 'GDS';
    btn.title = 'Copy Sabre IA / VI* format for this itinerary';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleGoogleFlightsCopy(btn);
    });
    priceBox.insertBefore(btn, priceBox.firstChild);
  }


  // ==================================================================
  // Pip "Send to lead" — the GDS button becomes Pip's face. Clicking it
  // opens a mini Pip screen with:
  //   • GDS      — the usual *IA/VI* copy
  //   • LEAD ID  — paste a lead number and the option (segments + price,
  //                or miles & taxes for award) is added to that lead in
  //                the BO automatically, in a background BO tab.
  // ==================================================================
  const SEND_JOB_KEY = 'js-sendjob';
  const RATES_TO_USD = { USD: 1, EUR: 1.1256, GBP: 1.3236, CAD: 0.7016 };
  const INFANT_CASH_NET = 400;
  const INFANT_AWARD_MILES = 10000;
  const RUSH_PROGRAMS = { TK: 'Turkish Miles&Smiles', AA: 'American AAdvantage', B6: 'JetBlue TrueBlue', VS: 'Virgin Atlantic Flying Club', SQ: 'Singapore KrisFlyer' };
  // Mile programs the BO accepts (its own list).
  const BO_PROGRAMS = ['AA','AC','AD','AF','AS','AV','B6','BA','CM','CX','DL','EK','EY','IB','JL','LH','QF','QR','SK','SQ','TK','TP','UA','VS'];
  const PROGRAM_NAMES = {
    AA: 'American AAdvantage', AC: 'Air Canada Aeroplan', AD: 'Azul Fidelidade', AF: 'Air France-KLM Flying Blue',
    AS: 'Alaska Mileage Plan', AV: 'Avianca LifeMiles', B6: 'JetBlue TrueBlue', BA: 'British Airways Avios',
    CM: 'Copa ConnectMiles', CX: 'Cathay Asia Miles', DL: 'Delta SkyMiles', EK: 'Emirates Skywards',
    EY: 'Etihad Guest', IB: 'Iberia Avios', JL: 'JAL Mileage Bank', LH: 'Lufthansa Miles & More',
    QF: 'Qantas Frequent Flyer', QR: 'Qatar Privilege Club', SK: 'SAS EuroBonus', SQ: 'Singapore KrisFlyer',
    TK: 'Turkish Miles&Smiles', TP: 'TAP Miles&Go', UA: 'United MileagePlus', VS: 'Virgin Atlantic Flying Club',
  };
  // Program names / logo names as the award sites write them -> BO code.
  const PROGRAM_ALIASES = [
    [/mileageplus|\bunited\b/i, 'UA'], [/aadvantage|american/i, 'AA'], [/aeroplan|air canada/i, 'AC'],
    [/flying ?blue|air ?france|\bklm\b/i, 'AF'], [/alaska|mileage ?plan|atmos|atoms|hawaiian/i, 'AS'], [/lifemiles|avianca/i, 'AV'],
    [/trueblue|jetblue/i, 'B6'], [/british|executive ?club/i, 'BA'], [/connectmiles|\bcopa\b/i, 'CM'],
    [/asia ?miles|cathay/i, 'CX'], [/skymiles|delta/i, 'DL'], [/skywards|emirates/i, 'EK'], [/etihad/i, 'EY'],
    [/iberia/i, 'IB'], [/\bjal\b|japan airlines/i, 'JL'], [/miles ?(&|and) ?more|lufthansa/i, 'LH'], [/qantas/i, 'QF'],
    [/qatar|privilege ?club/i, 'QR'], [/eurobonus|\bsas\b/i, 'SK'], [/krisflyer|singapore/i, 'SQ'],
    [/miles ?(&|and) ?smiles|turkish/i, 'TK'], [/\btap\b|miles ?(&|and) ?go/i, 'TP'], [/virgin/i, 'VS'], [/azul|tudoazul/i, 'AD'],
  ];

  // Award options must use a program from the BO's "Mile program" list.
  function programSupported(c) {
    if (!c || c.kind !== 'award') return true;
    if (c.parts) return c.parts.every((p) => programSupported(Object.assign({ kind: 'award' }, p)));
    const code = programCode(c.program);
    return !!code && BO_PROGRAMS.includes(code);
  }

  function programCode(raw) {
    if (!raw) return null;
    const t = String(raw).trim();
    // KLM (KL) and Air France (AF) share Flying Blue: KL is booked as AF.
    if (/^KL$/i.test(t) || /^KL[_\-\s.]/i.test(t)) return 'AF';
    if (/^[A-Z0-9]{2}$/i.test(t)) return t.toUpperCase();
    // Site slugs like "AS_ATOMS_REWARDS" / "ua-mileageplus": the leading
    // airline code says it all when the BO knows it.
    const pre = t.match(/^([A-Z0-9]{2})[_\-\s.]/i);
    if (pre && BO_PROGRAMS.includes(pre[1].toUpperCase())) return pre[1].toUpperCase();
    const words = t.replace(/[_\-.]+/g, ' ');
    for (const [re, code] of PROGRAM_ALIASES) if (re.test(words)) return code;
    return null;
  }

  // "$1,224.79" / "USD 1,224.79" / "€4.97" / "+ est* €4.97" / "2162 US dollars"
  function parseMoney(text) {
    if (!text) return null;
    const t = String(text).replace(/\s+/g, ' ').trim();
    let currency = 'USD';
    if (/€|EUR|euro/i.test(t)) currency = 'EUR';
    else if (/£|GBP|pound/i.test(t)) currency = 'GBP';
    else if (/C\$|CA\$|CAD|canadian/i.test(t)) currency = 'CAD';
    else if (/\$|USD|US dollar/i.test(t)) currency = 'USD';
    else if (/[A-Z]{3}/.test(t) && !/USD/.test(t)) currency = (t.match(/\b([A-Z]{3})\b/) || [])[1] || 'USD';
    const m = t.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
    if (!m) return null;
    return { amount: parseFloat(m[1]), currency };
  }

  function toUsd(money) {
    if (!money) return null;
    const rate = RATES_TO_USD[money.currency];
    if (!rate) return { error: 'Unknown currency ' + money.currency };
    return { usd: Math.round(money.amount * rate * 100) / 100 };
  }

  function parsePoints(text) {
    const m = String(text || '').replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*(k)?/i);
    if (!m) return null;
    return Math.round(parseFloat(m[1]) * (m[2] ? 1000 : 1));
  }

  // FlyBasis's advanced detail page: a "Program | Cost | Points | Taxes |
  // Link" table instead of the result card's data. Cheapest supported
  // program first, the rest selectable in the dropdown.
  function fbDetailPrices() {
    const out = [];
    document.querySelectorAll('.divide-y > div').forEach((row) => {
      const cells = Array.from(row.children);
      if (cells.length < 4) return;
      const program = cells[0].textContent.trim();
      if (!/^[A-Z0-9]{2}$/.test(program)) return;
      const cost = parseMoney(cells[1].textContent);
      const points = parsePoints(cells[2].textContent);
      const taxes = parseMoney(cells[3].textContent);
      if (!points) return;
      out.push({ kind: 'award', points, taxes: taxes || { amount: 0, currency: 'USD' }, program, _cost: cost ? cost.amount : Infinity });
    });
    const ok = (o) => (BO_PROGRAMS.includes(programCode(o.program)) ? 0 : 1);
    out.sort((a, b) => ok(a) - ok(b) || a._cost - b._cost);
    out.forEach((o) => delete o._cost);
    return out;
  }

  // --- Price readers, one per site. Each returns a list of choices:
  // { kind:'cash', money } or { kind:'award', points, taxes(money), program }
  function readPrice(origBtn) {
    const host = location.hostname;
    try {
      if (host.includes('matrix.itasoftware.com')) {
        const row = origBtn.closest('tr');
        const label = row && Array.from(row.querySelectorAll('.mdc-button__label')).find((l) => /\$|€|£|\d/.test(l.textContent) && !l.closest('.gds-btn-base'));
        return label ? [{ kind: 'cash', money: parseMoney(label.textContent) }] : [];
      }
      if (host.includes('kayak.com')) {
        const card = origBtn.closest('.nrc6');
        const el = card && card.querySelector('.e2GB-price-text');
        return el ? [{ kind: 'cash', money: parseMoney(el.textContent) }] : [];
      }
      if (host.includes('cheapoair.com')) {
        const card = origBtn.closest('.itinerary-card');
        const amt = (card && card.querySelector('.fpamount')) || document.querySelector('#GrandTotal .fpamount');
        if (!amt) return [];
        const curEl = amt.parentElement && amt.parentElement.querySelector('.fpcurrencytext');
        return [{ kind: 'cash', money: parseMoney((curEl ? curEl.textContent : '') + ' ' + amt.textContent.replace(/\s+/g, '')) }];
      }
      if (host.includes('google.com')) {
        const box = document.querySelector('.Y4xNqf') || document;
        const el = Array.from(box.querySelectorAll('[aria-label]')).find((e) => /^\s*[\d,.]+\s+[A-Za-z ]+$/.test(e.getAttribute('aria-label')) && /dollar|euro|pound/i.test(e.getAttribute('aria-label')));
        return el ? [{ kind: 'cash', money: parseMoney(el.getAttribute('aria-label')) }] : [];
      }
      if (host.includes('flybasis.com') || host.includes('agentsearch.vercel.app')) {
        const card = origBtn.closest('[data-json]');
        if (!card) return fbDetailPrices();
        const it = JSON.parse(card.dataset.json);
        const f = (it.flights || [])[0] || {};
        // Every program offered for this flight (primary + duplicates);
        // take the cheapest by FlyBasis's own "Cost".
        const costOf = (o) => (typeof o.price === 'number' ? o.price : Infinity);
        // Cheapest among the programs the BO supports; others only if none is.
        const ok = (o) => { const c = programCode(o.program); return c && BO_PROGRAMS.includes(c) ? 0 : 1; };
        const allOffers = (node) => {
          const offers = [];
          const collect = (n, d) => {
            if (!n || typeof n !== 'object' || d > 6) return;
            if (Array.isArray(n)) { n.forEach((x) => collect(x, d + 1)); return; }
            if (n.points && n.program) offers.push(n);
            Object.keys(n).forEach((k) => { if (n[k] && typeof n[k] === 'object') collect(n[k], d + 1); });
          };
          collect(node, 0);
          offers.sort((a, b) => ok(a) - ok(b) || costOf(a) - costOf(b));
          return offers;
        };
        const cheapest = (node) => allOffers(node)[0] || null;
        // Round trip: one award entry per direction (outbound, inbound),
        // each priced on its own.
        const awards = Array.isArray(it.awards) ? it.awards : [];
        if ((it.flights || []).length >= 2 && awards.length === it.flights.length) {
          const parts = awards.map(cheapest);
          if (parts.every(Boolean)) {
            const P = parts.map((a) => ({ points: a.points, taxes: { amount: a.surcharge || 0, currency: 'USD' }, program: a.program }));
            const same = P.every((x) => programCode(x.program) === programCode(P[0].program));
            if (same) {
              // Same program both ways: one ticket, totals added up.
              return [{ kind: 'award', points: P.reduce((t, x) => t + x.points, 0), taxes: { amount: Math.round(P.reduce((t, x) => t + x.taxes.amount, 0) * 100) / 100, currency: 'USD' }, program: P[0].program }];
            }
            // Different programs: two tickets (outbound = 1, inbound = 2).
            return [{ kind: 'award', points: P[0].points, taxes: P[0].taxes, program: P[0].program, parts: P.slice(0, 2) }];
          }
        }
        const sorted = allOffers(awards);
        const award = sorted[0] || null;
        // Both AA and AS on offer: give a dropdown (cheapest first, then
        // the AA and AS choices) so either one can be picked.
        const pickOf = (code) => sorted.find((o) => programCode(o.program) === code);
        if (pickOf('AA') && pickOf('AS')) {
          const list = [award, pickOf('AA'), pickOf('AS')].filter((o, i, a) => o && a.indexOf(o) === i);
          return list.map((a) => ({ kind: 'award', points: a.points, taxes: { amount: a.surcharge || 0, currency: 'USD' }, program: a.program }));
        }
        if (it.ticket === 'awd' || award || f.points) {
          const a = award || f;
          return [{ kind: 'award', points: a.points, taxes: { amount: a.surcharge || 0, currency: 'USD' }, program: a.program }];
        }
        return [{ kind: 'cash', money: { amount: it.total || f.price, currency: 'USD' } }];
      }
      if (host.includes('pointsyeah.com')) {
        const scopes = [];
        const bell = origBtn.parentElement && origBtn.parentElement.querySelector('button');
        if (bell && typeof pyFindDetailBlock === 'function') { const d = pyFindDetailBlock(bell); if (d) scopes.push(d); }
        let up = origBtn.parentElement;
        for (let i = 0; i < 8 && up; i++, up = up.parentElement) if (up.querySelector('img[src*="/programs/"]')) { scopes.push(up); break; }
        const seen = new Set();
        const out = [];
        scopes.forEach((scope) => scope.querySelectorAll('img[src*="/programs/"]').forEach((img) => {
          let row = img;
          for (let i = 0; i < 8 && row && !/pts/.test(row.textContent); i++) row = row.parentElement;
          if (!row || seen.has(row)) return;
          seen.add(row);
          const slug = (img.getAttribute('src').match(/programs\/([^./]+)\./) || [])[1] || '';
          const txt = row.textContent.replace(/\s+/g, ' ');
          const pts = parsePoints((txt.match(/([\d,.]+k?)\s*pts/i) || [])[1]);
          const taxM = txt.match(/([$€£]|C\$|CA\$)\s?([\d,.]+)\s*tax/i);
          if (!pts) return;
          out.push({ kind: 'award', points: pts, taxes: taxM ? parseMoney(taxM[1] + taxM[2]) : { amount: 0, currency: 'USD' }, program: slug });
        }));
        return out;
      }
      if (host.includes('awardlogic.com')) {
        const card = origBtn.closest('.results-trip-list-item') || origBtn.closest('.results-trip-list-item__info');
        if (!card) return [];
        const pts = parsePoints((card.querySelector('.results-trip-list-item__price-title') || {}).textContent);
        const tax = parseMoney((card.querySelector('.results-trip-list-item__price-taxes') || {}).textContent);
        const progEl = card.querySelector('.results-trip-list-item__flight-program h3');
        if (!pts) return [];
        return [{ kind: 'award', points: pts, taxes: tax || { amount: 0, currency: 'USD' }, program: progEl ? progEl.textContent.trim() : '' }];
      }
    } catch (e) { /* fall through */ }
    return [];
  }

  function describeChoice(c) {
    if (!c) return '';
    if (c.kind === 'cash') return c.money ? ('$' + (toUsd(c.money).usd || c.money.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' / person') : '';
    if (c.parts) return c.parts.map((p) => describeChoice(Object.assign({ kind: 'award' }, p)).replace(' / person', '')).join('  ↩  ') + ' / person';
    const code = programCode(c.program) || String(c.program || '?').toUpperCase();
    const tx = toUsd(c.taxes) || {};
    return code + ' · ' + Number(c.points).toLocaleString('en-US') + ' pts + $' + (tx.usd != null ? tx.usd.toFixed(2) : '?') + ' / person';
  }

  // --- Route helpers for the "is this the right lead?" check -----------
  const CITY_AIRPORTS = {
    NYC: ['JFK','EWR','LGA'], WAS: ['IAD','DCA','BWI'], LON: ['LHR','LGW','STN','LTN','LCY','SEN'], PAR: ['CDG','ORY','BVA'],
    CHI: ['ORD','MDW'], TYO: ['HND','NRT'], MIL: ['MXP','LIN','BGY'], ROM: ['FCO','CIA'], MOW: ['SVO','DME','VKO'],
    SAO: ['GRU','CGH','VCP'], RIO: ['GIG','SDU'], BUE: ['EZE','AEP'], STO: ['ARN','BMA','NYO'], OSA: ['KIX','ITM','UKB'],
    SEL: ['ICN','GMP'], SHA: ['PVG','SHA'], BJS: ['PEK','PKX'], YTO: ['YYZ','YTZ'], YMQ: ['YUL','YMX'], DTT: ['DTW'],
    DFW: ['DFW','DAL'], QDF: ['DFW','DAL'], HOU: ['IAH','HOU'], BKK: ['BKK','DMK'], JKT: ['CGK','HLP'], OSL: ['OSL','TRF','RYG'],
    LAX: ['LAX','BUR','LGB','SNA','ONT'], SFO: ['SFO','OAK','SJC'], MIA: ['MIA','FLL','PBI'], IST: ['IST','SAW'],
    DXB: ['DXB','DWC','SHJ'], BER: ['BER'], MEL: ['MEL','AVV'], TPE: ['TPE','TSA'], MNL: ['MNL','CRK'],
  };
  function areaOf(code) {
    const c = String(code || '').toUpperCase();
    const set = new Set([c]);
    for (const [city, list] of Object.entries(CITY_AIRPORTS)) {
      if (city === c || list.includes(c)) { set.add(city); list.forEach((a) => set.add(a)); }
    }
    return set;
  }
  function sameArea(a, b) {
    const A = areaOf(a);
    for (const x of areaOf(b)) if (A.has(x)) return true;
    return false;
  }
  const MON3 = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 };
  // Origin = first departure; destination = where the traveller stays
  // (longest gap > 24h), otherwise the final arrival.
  function optionRoute(gdsText) {
    const legs = [];
    let year = new Date().getFullYear(), lastMonth = null;
    for (const line of gdsText.split('\n')) {
      const m = line.match(/^\s*\d+\s+[A-Z0-9]{2}\s*\d+[A-Z]\s+(\d{2})([A-Z]{3})\s+[A-Z]\s+([A-Z]{3})([A-Z]{3})\s+\S+\s+(\d{3,4}[AP])\s+(\d{3,4}[AP])(?:\s+(\d{2})([A-Z]{3}))?/);
      if (!m) continue;
      const mon = MON3[m[2]];
      if (lastMonth !== null && mon < lastMonth) year++;
      lastMonth = mon;
      const hm = (t) => { let h = parseInt(t.slice(0, -3), 10) || 0; const mi = parseInt(t.slice(-3, -1), 10); if (t.endsWith('P') && h < 12) h += 12; if (t.endsWith('A') && h === 12) h = 0; return [h, mi]; };
      const [dh, dm] = hm(m[5]); const [ah, am] = hm(m[6]);
      const dep = new Date(year, mon, parseInt(m[1], 10), dh, dm);
      const arr = m[7] ? new Date(year, MON3[m[8]], parseInt(m[7], 10), ah, am) : new Date(year, mon, parseInt(m[1], 10), ah, am);
      legs.push({ from: m[3], to: m[4], dep, arr });
    }
    if (!legs.length) return null;
    let dest = legs[legs.length - 1].to, best = 24 * 3600e3;
    for (let i = 0; i < legs.length - 1; i++) {
      const gap = legs[i + 1].dep - legs[i].arr;
      if (gap > best) { best = gap; dest = legs[i].to; }
    }
    // Only real trip ends count — never a connection airport (a PHL→MXP
    // trip connecting in LHR must NOT pass for an LHR lead).
    const airports = [legs[0].from, dest, legs[legs.length - 1].to];
    return { from: legs[0].from, to: dest, airports };
  }

  // --- Theme colors for Pip's face (same skin as the BO's Pip) ----------
  const FACE_THEMES = {
    midnight: { acc: '#7c7cf8' }, teal: { acc: '#14b8a6' }, pink: { acc: '#ec4899' },
    black: { acc: '#cbd5e1' }, gold: { acc: '#eab308' }, rainbow: { acc: '#a78bfa' },
  };
  function faceTheme() {
    return iaPalette();
  }

  const PIP_MINI = (th) => `<path d="M22 70 L22 38 Q22 26 34 26 L62 26 Q74 26 74 38 L74 62 Q74 74 62 74 L40 74 L30 84 L31 74 Q22 73 22 70 Z" fill="${th.acc}"/><circle cx="40" cy="47" r="4.5" fill="${th.eye}"/><circle cx="56" cy="47" r="4.5" fill="${th.eye}"/>`;
  const FACE_SVG = (th) => `<svg width="34" height="27" viewBox="0 0 34 27" aria-hidden="true">
      <rect x="0.5" y="0.5" width="33" height="26" rx="6" fill="${th.bg}" stroke="${th.line2}" stroke-width="1"/>
      <g transform="translate(17 13.5) scale(0.27) translate(-48 -55)">${PIP_MINI(th)}</g>
    </svg>`;

  // --- Safe markup builder ---------------------------------------------
  // Google's sites (ITA Matrix, Google Flights) enforce "Trusted Types",
  // which makes any innerHTML assignment throw — that's what stopped Pip's
  // face from appearing on ITA. This builds the same markup from plain DOM
  // calls instead, so it works everywhere.
  const SVG_NS = 'http://www.w3.org/2000/svg';
  function buildNodes(markup, inSvg) {
    const out = [];
    const stack = [{ kids: out, svg: !!inSvg }];
    const re = /<!--[\s\S]*?-->|<\/([a-zA-Z0-9]+)\s*>|<([a-zA-Z0-9]+)((?:\s+[^\s=>\/]+(?:\s*=\s*"[^"]*")?)*)\s*(\/?)>|([^<]+)/g;
    let m;
    while ((m = re.exec(markup))) {
      const top = stack[stack.length - 1];
      if (m[0].startsWith('<!--')) continue;
      if (m[1]) { if (stack.length > 1) stack.pop(); continue; }
      if (m[2]) {
        const tag = m[2];
        const svg = top.svg || tag === 'svg';
        const el = svg ? document.createElementNS(SVG_NS, tag) : document.createElement(tag);
        const attrRe = /([^\s=]+)(?:\s*=\s*"([^"]*)")?/g;
        let a;
        while ((a = attrRe.exec(m[3] || ''))) el.setAttribute(a[1], a[2] != null ? a[2].replace(/&quot;/g, '"').replace(/&amp;/g, '&') : '');
        if (top.el) top.el.appendChild(el); else top.kids.push(el);
        if (!m[4] && !/^(br|input|img|hr|meta)$/i.test(tag)) stack.push({ el, svg });
        continue;
      }
      if (m[5]) {
        const t = document.createTextNode(m[5].replace(/&nbsp;/g, '\u00a0').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
        if (top.el) top.el.appendChild(t); else top.kids.push(t);
      }
    }
    return out;
  }
  function setMarkup(el, markup) {
    while (el.firstChild) el.removeChild(el.firstChild);
    buildNodes(markup, el instanceof SVGElement).forEach((n) => el.appendChild(n));
  }

  // --- Popover (one at a time), isolated from the site's CSS ------------
  let openPopover = null;
  function closePopover() {
    if (openPopover) { if (openPopover.unpin) openPopover.unpin(); openPopover.host.remove(); openPopover = null; }
  }
  document.addEventListener('mousedown', (e) => {
    if (!openPopover) return;
    if (openPopover.host.contains(e.target) || (openPopover.trigger && openPopover.trigger.contains(e.target))) return;
    if (openPopover.busy) return; // don't close mid-send
    closePopover();
  }, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && openPopover && !openPopover.busy) closePopover(); }, true);

  const POPOVER_CSS = (th) => `
    :host { all: initial; }
    .wrap { position: fixed; z-index: 2147483646; width: 232px; font-family: Inter, 'Segoe UI', system-ui, sans-serif; color: ${th.text}; }
    .body { background: ${th.bg}; border: 1px solid ${th.line}; border-radius: 12px; padding: 10px 10px 8px; box-shadow: ${th.shadow}; }
    .title { display: flex; align-items: center; gap: 7px; font-weight: 600; font-size: 12.5px; color: ${th.title}; margin: 0 0 9px; line-height: 1; user-select: none; }
    .copy { margin-top: 8px; text-align: right; font-size: 10px; color: ${th.foot}; user-select: none; }
    .screen { background: transparent; padding: 0; position: relative; }
    .gds { display: block; width: 100%; height: 34px; border: 0; border-radius: 8px; cursor: pointer;
      background: ${th.acc}; color: ${th.onacc}; font: 600 13px/1 inherit; letter-spacing: .04em; transition: filter .15s, background .2s; }
    .gds:hover { filter: brightness(1.08); }
    .gds.ok { background: #16a34a; color: #fff; } .gds.err { background: ${th.stop}; color: #fff; }
    .lead { margin-top: 8px; width: 100%; box-sizing: border-box; height: 34px; border-radius: 8px; border: 1px solid ${th.line2}; outline: none;
      padding: 0 10px; font: 600 14px/34px ui-monospace, 'Cascadia Mono', Consolas, monospace; letter-spacing: .1em; text-align: center;
      color: ${th.title}; background: ${th.field}; transition: border-color .15s; }
    .lead:focus { border-color: ${th.acc}; }
    .lead.bad { border-color: ${th.stop}; color: ${th.bad}; }
    .lead::placeholder { color: ${th.muted}; letter-spacing: .14em; font-weight: 600; }
    .lead:disabled { opacity: .6; }
    .sellrow { width: fit-content; margin: 8px auto 0; display: flex; align-items: center; gap: 4px; height: 30px; border-radius: 8px; padding: 0 10px;
      background: ${th.field}; border: 1px solid ${th.line2}; transition: border-color .15s; }
    .sellrow:focus-within { border-color: ${th.acc}; }
    .sellrow.bad { border-color: ${th.stop}; }
    .sell-l { font-weight: 600; font-size: 10px; line-height: 1; letter-spacing: .12em; color: ${th.muted}; }
    .sell-d { font: 600 14px/1 ui-monospace, 'Cascadia Mono', Consolas, monospace; color: ${th.muted}; margin-left: 8px; }
    .sell-on { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; user-select: none; }
    .sell-cb { width: 14px; height: 14px; margin: 0; accent-color: ${th.acc}; cursor: pointer; }
    .sellrow.off .sell-d, .sellrow.off .sell { opacity: .35; }
    .sell { width: 62px; flex: none; border: 0; outline: none; background: transparent; text-align: right; color: ${th.title};
      font: 600 14px/28px ui-monospace, 'Cascadia Mono', Consolas, monospace; letter-spacing: .04em; padding: 0; }
    .sell::placeholder { color: ${th.muted}; font-style: italic; font-weight: 500; letter-spacing: 0; }
    .sell:disabled { opacity: .6; }
    .price { margin-top: 8px; font-size: 11.5px; color: ${th.sec}; text-align: center; min-height: 14px; }
    select.pick { margin-top: 6px; width: 100%; font: 11.5px inherit; border-radius: 6px; border: 1px solid ${th.line2}; background: ${th.field}; color: ${th.text}; padding: 4px; }
    .warn { margin-top: 7px; padding: 4px 6px; border-radius: 6px; border: 1px solid ${th.stop}; color: ${th.bad}; font-weight: 600; font-size: 11px; text-align: center; }
    .flag { margin-top: 6px; padding: 4px 6px; border-radius: 6px; border: 1px solid #f59e0b; color: ${th.mode === 'light' ? '#b45309' : '#fcd34d'}; font-weight: 600; font-size: 11px; text-align: center; }
    .status { margin-top: 6px; font-size: 11.5px; text-align: center; color: ${th.muted}; min-height: 14px; }
    .status.ok { color: ${th.ok}; font-weight: 600; } .status.err { color: ${th.bad}; font-weight: 600; }
    .confirm { margin-top: 8px; padding: 9px; border-radius: 8px; background: ${th.field}; border: 1px solid ${th.line2}; font-size: 12px; color: ${th.text}; text-align: center; }
    .confirm b { font-weight: 700; color: ${th.title}; }
    .row { display: flex; gap: 6px; margin-top: 8px; }
    .row button { flex: 1; height: 28px; border-radius: 6px; font: 600 12px inherit; cursor: pointer; }
    .yes { background: ${th.acc}; color: ${th.onacc}; border: 0; } .no { background: transparent; color: ${th.text}; border: 1px solid ${th.line2}; }
    .dots::after { content: ''; animation: dots 1.2s steps(4) infinite; }
    @keyframes dots { 0% { content: ''; } 25% { content: '.'; } 50% { content: '..'; } 75% { content: '...'; } }
  `;

  function openBmoPopover(trigger, origBtn) {
    if (openPopover && openPopover.trigger === trigger) { closePopover(); return; }
    closePopover();
    const th = faceTheme();
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    const styleEl = document.createElement('style');
    styleEl.textContent = POPOVER_CSS(th);
    root.appendChild(styleEl);
    buildNodes(`
      <div class="wrap"><div class="body"><div class="title"><svg width="18" height="19" viewBox="10 10 76 80" aria-hidden="true">${PIP_MINI(th)}</svg>Ian's Assistant</div><div class="screen">
        <button class="gds" type="button">GDS</button>
        <input class="lead" type="text" inputmode="numeric" placeholder="LEAD ID" autocomplete="off" spellcheck="false">
        <div class="sellrow"><label class="sell-on" title="Set the sell price when adding (off = $0.00 as usual)"><input class="sell-cb" type="checkbox"><span class="sell-l">SELL</span></label><span class="sell-d">$</span><input class="sell" type="text" inputmode="decimal" maxlength="9" placeholder="auto" autocomplete="off" spellcheck="false"></div>
        <div class="price"></div>
        <div class="extra"></div>
        <div class="status"></div>
        <div class="copy">\u00a9 Ian Brown</div>
      </div></div></div>`).forEach((n) => root.appendChild(n));
    document.documentElement.appendChild(host);
    const wrap = root.querySelector('.wrap');
    // Pinned to Pip's face: it follows the face when the page (or any
    // scrolling panel) moves, instead of floating in one screen spot.
    const r0 = trigger.getBoundingClientRect();
    const h0 = wrap.offsetHeight || 260;
    const openAbove = r0.bottom + 8 + h0 > window.innerHeight && r0.top - 8 - h0 > 0;
    let rafId = 0;
    const place = () => {
      rafId = 0;
      if (!trigger.isConnected) { if (openPopover && !openPopover.busy) closePopover(); return; }
      const r = trigger.getBoundingClientRect();
      const h = wrap.offsetHeight || h0;
      wrap.style.left = Math.max(8, Math.min(r.left + r.width / 2 - 116, window.innerWidth - 240)) + 'px';
      wrap.style.top = (openAbove ? r.top - 8 - h : r.bottom + 8) + 'px';
    };
    const onMove = () => { if (!rafId) rafId = requestAnimationFrame(place); };
    place();
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);

    const state = { host, root, trigger, origBtn, busy: false, choices: [], choiceIdx: 0 };
    state.unpin = () => { window.removeEventListener('scroll', onMove, true); window.removeEventListener('resize', onMove); if (rafId) cancelAnimationFrame(rafId); };
    try { GM_setValue('js-sendjob-warm', Date.now()); } catch (e) { /* ignore */ } // let the BO get ready
    openPopover = state;
    const gdsBtn = root.querySelector('.gds');
    const lead = root.querySelector('.lead');
    const priceEl = root.querySelector('.price');
    const extra = root.querySelector('.extra');
    const status = root.querySelector('.status');

    function setStatus(text, cls) { status.className = 'status' + (cls ? ' ' + cls : ''); setMarkup(status, text || ''); }
    state.setStatus = setStatus;

    // Sell box: Net + 10% rounded up to a price ending in 88-92. Cash is
    // worked out right here; award Net is only known once the BO prices
    // the miles, so it's done there ("auto"). Typing a price overrides.
    const sellIn = root.querySelector('.sell');
    const sellRow = root.querySelector('.sellrow');
    state.sellEnding = [88, 89, 90, 91, 92][Math.floor(Math.random() * 5)];
    state.sellAuto = true;
    const roundSellP = (x) => { let v = Math.floor(x / 100) * 100 + state.sellEnding; if (v < x) v += 100; return v; };
    function autoSell() {
      if (!state.sellAuto) return;
      const c = state.choices[state.choiceIdx];
      const u = c && c.kind === 'cash' ? toUsd(c.money) : null;
      sellIn.value = u && !u.error && u.usd > 0 ? String(roundSellP(u.usd * 1.1)) : '';
      sellIn.placeholder = 'auto';
    }
    sellIn.addEventListener('input', () => {
      state.sellAuto = !sellIn.value.trim();
      sellRow.classList.remove('bad');
      if (state.sellAuto) autoSell();
    });
    sellIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') lead.focus(); });
    // Tick = set the sell price; untick = leave it $0.00 as usual. Remembered.
    const sellCb = root.querySelector('.sell-cb');
    let sellOn = true;
    try { sellOn = GM_getValue('js-sell-on', true) !== false; } catch (e) { sellOn = true; }
    const applyOn = () => { sellCb.checked = sellOn; sellRow.classList.toggle('off', !sellOn); sellIn.disabled = !sellOn; };
    applyOn();
    sellCb.addEventListener('change', () => { sellOn = sellCb.checked; try { GM_setValue('js-sell-on', sellOn); } catch (e) { /* ignore */ } applyOn(); });
    state.sellSpec = () => {
      if (!sellOn) return null;
      if (state.sellAuto) return { value: null, ending: state.sellEnding };
      const t = sellIn.value.trim().replace(/^\$\s*/, '').replace(/,(?=\d{3}\b)/g, '');
      if (!/^\d+(\.\d{1,2})?$/.test(t)) return { bad: true };
      return { value: Math.round(parseFloat(t) * 100) / 100, ending: state.sellEnding };
    };

    function renderChoice() {
      const c = state.choices[state.choiceIdx];
      // With a dropdown, the dropdown itself shows the price: no repeat line.
      priceEl.textContent = c ? describeChoice(c) : 'Price not found on this result';
      priceEl.style.display = c && state.choices.length > 1 ? 'none' : '';
      autoSell();
      extra.querySelectorAll('.warn').forEach((w) => w.remove());
      const code = c && c.kind === 'award' ? programCode(c.program) : null;
      const unsupported = !!c && !programSupported(c);
      state.unsupported = unsupported;
      lead.classList.toggle('bad', unsupported);
      if (unsupported) setStatus('Mileage program not supported', 'err');
      else if (/not supported/.test(status.textContent)) setStatus('');
      if (false && code && RUSH_PROGRAMS[code]) { // rush warning lives on the BO option only
        const w = document.createElement('div');
        w.className = 'warn';
        w.textContent = RUSH_PROGRAMS[code] + ' Detected, Rush flight only';
        extra.appendChild(w);
      }
    }
    function loadChoices() {
      state.choices = readPrice(origBtn);
      const firstOk = state.choices.findIndex(programSupported);
      state.choiceIdx = firstOk > 0 ? firstOk : 0;
      extra.textContent = '';
      if (state.choices.length > 1) {
        const sel = document.createElement('select');
        sel.className = 'pick';
        state.choices.forEach((c, i) => { const o = document.createElement('option'); o.value = i; o.textContent = describeChoice(c).replace(' / person', '') + (programSupported(c) ? '' : ' (not supported)'); sel.appendChild(o); });
        sel.value = String(state.choiceIdx);
        sel.addEventListener('change', () => { state.choiceIdx = parseInt(sel.value, 10); renderChoice(); });
        extra.appendChild(sel);
      }
      renderChoice();
    }
    loadChoices();

    gdsBtn.addEventListener('click', () => {
      gdsCopyListener = (ok, label) => {
        gdsCopyListener = null;
        gdsBtn.classList.remove('ok', 'err');
        gdsBtn.classList.add(ok ? 'ok' : 'err');
        gdsBtn.textContent = ok ? '✓ COPIED' : (label || 'No data');
        setTimeout(() => { gdsBtn.classList.remove('ok', 'err'); gdsBtn.textContent = 'GDS'; }, 1400);
      };
      origBtn.click();
    });

    // Lead IDs are exactly 6 digits: anything else is rejected in red.
    let typeTimer = null;
    const markBad = (bad) => { lead.classList.toggle('bad', !!bad); if (bad) setStatus('Wrong Lead ID', 'err'); };
    const fire = () => {
      if (state.busy) return;
      const raw = lead.value.trim();
      const id = raw.replace(/\D/g, '');
      if (!/^\d{6}$/.test(id) || /[^\d\s#]/.test(raw)) { markBad(true); return; }
      markBad(false);
      lead.value = id;
      sendToLead(state, id);
    };
    lead.addEventListener('paste', () => setTimeout(fire, 0));
    lead.addEventListener('keydown', (e) => { if (e.key === 'Enter') { clearTimeout(typeTimer); fire(); } });
    lead.addEventListener('input', () => {
      clearTimeout(typeTimer);
      const n = lead.value.replace(/\D/g, '').length;
      if (n > 6 || /[^\d\s#]/.test(lead.value)) { markBad(true); return; }
      lead.classList.remove('bad');
      if (status.classList.contains('err')) setStatus('');
      if (n === 6) typeTimer = setTimeout(fire, 700);
    });
    setTimeout(() => lead.focus(), 0);
  }

  // Asks the site's own GDS logic for the *IA/VI* text without copying it.
  function captureGds(origBtn) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => { gdsCaptureResolve = null; resolve({ ok: false, error: 'Timed out reading flights' }); }, 9000);
      gdsCaptureResolve = (res) => { clearTimeout(timer); resolve(res); };
      origBtn.click();
    });
  }

  async function sendToLead(state, leadId) {
    const { root, origBtn, setStatus } = state;
    const lead = root.querySelector('.lead');
    state.busy = true;
    lead.disabled = true;
    const done = (html, cls) => { setStatus(html, cls); state.busy = false; lead.disabled = false; };

    const sellSpec = state.sellSpec ? state.sellSpec() : null;
    if (sellSpec && sellSpec.bad) { root.querySelector('.sellrow').classList.add('bad'); return done('Sell price: numbers only, e.g. 4890', 'err'); }
    setStatus('Reading option<span class="dots"></span>');
    const cap = await captureGds(origBtn);
    if (!cap.ok) return done(cap.error || 'Could not read the flights', 'err');
    if (!state.choices.length) { state.choices = readPrice(origBtn); }
    const choice = state.choices[state.choiceIdx];
    if (!choice) return done('Price not found on this result', 'err');

    // Price checks up front, before touching the BO.
    let price;
    if (choice.kind === 'cash') {
      const u = toUsd(choice.money);
      if (!u || u.error) return done((u && u.error) || 'Price not readable', 'err');
      price = { kind: 'cash', perPerson: u.usd };
    } else {
      const parts = [];
      for (const p of (choice.parts || [choice])) {
        const code = programCode(p.program);
        if (!code || !BO_PROGRAMS.includes(code)) return done('Mileage program not supported', 'err');
        const tx = toUsd(p.taxes || { amount: 0, currency: 'USD' });
        if (!tx || tx.error) return done((tx && tx.error) || 'Taxes not readable', 'err');
        parts.push({ points: p.points, taxesPerPerson: tx.usd, program: code });
      }
      price = Object.assign({ kind: 'award', parts }, parts[0]);
    }
    const route = optionRoute(cap.text);

    const jobId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const statusKey = 'js-sendjob-status-' + jobId;
    const decisionKey = 'js-sendjob-decision-' + jobId;
    try {
      GM_setValue(SEND_JOB_KEY + '-' + jobId, JSON.stringify({ id: jobId, leadId, gds: cap.text, createdAt: Date.now() }));
    } catch (e) { return done('Could not hand over to the BO', 'err'); }

    setStatus('Contacting BO<span class="dots"></span>');
    let tab = null;
    let claimed = false;
    // Ask any open BO tab to do the job invisibly (in a hidden frame inside
    // that tab). Only if no BO tab answers within ~3s, open one in the
    // background instead.
    try { GM_setValue('js-sendjob-request', JSON.stringify({ id: jobId, leadId, t: Date.now() })); } catch (e) { /* ignore */ }
    setTimeout(() => {
      if (claimed || !state.busy) return;
      setStatus('No BO tab open \u2014 opening one<span class="dots"></span>');
      try {
        tab = GM_openInTab('https://bo.travelbusinessclass.com/leads/' + leadId + '?jsjob=' + jobId, { active: false, insert: true, setParent: true });
      } catch (e) { done('Could not open the BO', 'err'); }
    }, 3000);

    const cleanup = () => {
      try { if (tab && tab.close) tab.close(); } catch (e) { /* ignore */ }
      try { GM_setValue(statusKey, null); GM_setValue(decisionKey, null); GM_setValue(SEND_JOB_KEY + '-' + jobId, null); } catch (e) { /* ignore */ }
      if (listenerId != null && typeof GM_removeValueChangeListener === 'function') { try { GM_removeValueChangeListener(listenerId); } catch (e) { /* ignore */ } }
    };
    const overall = setTimeout(() => { cleanup(); done('BO did not respond — is it logged in?', 'err'); }, 90000);

    let listenerId = null;
    listenerId = GM_addValueChangeListener(statusKey, (name, oldV, newV) => {
      if (!newV) return;
      let st;
      try { st = JSON.parse(newV); } catch (e) { return; }
      if (st.phase === 'claimed') {
        claimed = true;
        setStatus('Opening lead ' + leadId + '<span class="dots"></span>');
        // The BO tab runs whatever version was installed when it was loaded.
        const mine = (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) || '';
        if (mine && st.v !== mine) state.boStale = true;
      } else if (st.phase === 'lead') {
        claimed = true;
        onLeadInfo(st);
      } else if (st.phase === 'saving') {
        setStatus('Adding to lead ' + leadId + '<span class="dots"></span>');
      } else if (st.phase === 'selling') {
        setStatus('Setting sell price<span class="dots"></span>');
      } else if (st.phase === 'done') {
        clearTimeout(overall);
        cleanup();
        const sv = st.sell && st.sell.ADT;
        if (sv) { const si = root.querySelector('.sell'); si.value = String(sv); }
        const sellTxt = sv ? ' · Sell $' + Number(sv).toLocaleString('en-US') : '';
        if (state.boStale) { done('✓ Added to lead ' + leadId + (st.optionId ? ' · option ' + st.optionId : '') + '<br>Your BO tab runs an older Ian\'s Assistant \u2014 reload it (F5)', 'err'); return; }
        if (st.sell && st.sell.error) done('✓ Added to lead ' + leadId + (st.optionId ? ' · option ' + st.optionId : '') + '<br>Sell price not set: ' + st.sell.error, 'err');
        else done('✓ Added to lead ' + leadId + (st.optionId ? ' · option ' + st.optionId : '') + sellTxt, 'ok');
      } else if (st.phase === 'error') {
        clearTimeout(overall);
        cleanup();
        done(st.message || 'Something went wrong', 'err');
      }
    });

    function decide(go, fill) {
      try { GM_setValue(decisionKey, JSON.stringify({ go, fill })); } catch (e) { /* ignore */ }
      if (!go) { clearTimeout(overall); setTimeout(cleanup, 300); done('Cancelled — nothing was added'); }
    }

    function onLeadInfo(info) {
      // Build exactly what goes into the BO, using the lead's passengers.
      const pax = info.pax || { adults: 1, children: 0, infants: 0 };
      const flags = [];
      let fill;
      if (price.kind === 'cash') {
        fill = { mode: 'cash', ADT: price.perPerson, CHD: price.perPerson, INF: INFANT_CASH_NET };
        if (pax.children) flags.push('Child priced same as adult');
        if (pax.infants) flags.push('Infant set to $' + INFANT_CASH_NET + ' default');
      } else {
        const full = (pax.adults || 0) + (pax.children || 0);
        const parts = price.parts.map((p) => ({
          miles: p.points * full + INFANT_AWARD_MILES * (pax.infants || 0),
          taxes: Math.round(p.taxesPerPerson * (full + (pax.infants || 0)) * 100) / 100,
          program: p.program,
        }));
        fill = Object.assign({ mode: 'award', parts }, parts[0]);
        if (pax.children) flags.push('Child priced same as adult');
        if (pax.infants) flags.push('Infant added at ' + INFANT_AWARD_MILES.toLocaleString('en-US') + ' miles + same taxes as adult');
      }
      fill.flags = flags;
      if (sellSpec) fill.sell = sellSpec;
      if (price.kind === 'award') {
        const rush = [...new Set(price.parts.map((p) => p.program))].filter((c) => RUSH_PROGRAMS[c]);
        if (rush.length) fill.rush = rush.map((c) => RUSH_PROGRAMS[c]).join(' & ') + ' Detected, Rush flight only';
      }

      const extra = root.querySelector('.extra');
      extra.querySelectorAll('.flag').forEach((f) => f.remove());
      flags.forEach((t) => { const d = document.createElement('div'); d.className = 'flag'; d.textContent = '⚠ ' + t; extra.appendChild(d); });

      // Fine when the option starts or ends at either end of the lead, in
      // either direction (so PIT→LHR on an LHR→PIT lead is fine).
      // Connection airports don't count. Otherwise ask.
      const ok = !route || !info.from || !info.to
        || (route.airports || [route.from, route.to]).some((a) => sameArea(a, info.from) || sameArea(a, info.to));
      if (ok) {
        decide(true, fill);
        return;
      }
      // Neither end matches: ask first.
      setStatus('');
      const box = document.createElement('div');
      box.className = 'confirm';
      setMarkup(box, 'Lead <b>' + leadId + '</b> is going from <b>' + info.from + '</b> to <b>' + info.to + '</b>.<br>Are you sure you want to proceed?<div class="row"><button class="yes" type="button">Yes</button><button class="no" type="button">No</button></div>');
      root.querySelector('.screen').appendChild(box);
      box.querySelector('.yes').addEventListener('click', () => { box.remove(); setStatus('Adding to lead ' + leadId + '<span class="dots"></span>'); decide(true, fill); });
      box.querySelector('.no').addEventListener('click', () => { box.remove(); decide(false); });
    }
  }

  // Swap every GDS button for Pip's face (the original stays hidden and
  // still does the actual copy work).
  function bmoizeGdsButtons() {
    // The face goes right BEFORE the hidden original, so the original stays
    // where each site's own code expects it (FlyBasis keeps re-checking
    // that its button is the row's last child; putting the face after it
    // made the two fight over that spot, so the face kept getting moved
    // and clicks on it never registered).
    document.querySelectorAll('.gds-btn-base:not([data-bmo])').forEach((orig) => {
      orig.setAttribute('data-bmo', '1');
      try {
        const trig = document.createElement('span');
        trig.className = 'gds-pip-trigger';
        trig.title = "Ian's Assistant: GDS copy / send to lead";
        setMarkup(trig, FACE_SVG(faceTheme()));
        trig.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); openBmoPopover(trig, orig); }, true);
        ['mousedown', 'mouseup', 'pointerdown', 'pointerup'].forEach((t) => trig.addEventListener(t, (e) => e.stopPropagation()));
        orig.insertAdjacentElement('beforebegin', trig);
        orig.style.setProperty('display', 'none', 'important'); // only once the face is in place
        sizeTrigger(trig, orig);
      } catch (e) { /* keep the plain GDS button if anything fails */ }
    });
    document.querySelectorAll('.gds-btn-base[data-bmo]').forEach((orig) => {
      const prev = orig.previousElementSibling;
      if (!prev || !prev.classList.contains('gds-pip-trigger')) {
        const stray = orig.parentElement && orig.parentElement.querySelector(':scope > .gds-pip-trigger');
        if (stray) orig.insertAdjacentElement('beforebegin', stray);
      }
      if (prev && prev.classList.contains('gds-pip-trigger') && !prev.dataset.sized) sizeTrigger(prev, orig);
    });
  }

  // Per-site size, so the face sits in proportion to what's next to it.
  function sizeTrigger(trig, orig) {
    const host = location.hostname;
    let h = 27;
    let ref = null;
    if (host.includes('matrix.itasoftware.com')) {
      ref = orig.parentElement && orig.parentElement.querySelector('.mdc-button, button:not(.gds-btn-base)');
      h = 30;
    } else if (host.includes('kayak.com')) {
      const sec = orig.closest('.nrc6-price-section') || orig.parentElement;
      ref = sec && sec.querySelector('.M_JD-booking-btn, .oVHK');
      h = 36;
      // Sit on its own line with its right edge flush with "View deal".
      trig.style.cssText += ';display:flex;width:fit-content;margin:0 0 6px auto;';
    } else if (host.includes('awardlogic.com') || host.includes('cheapoair.com') || host.includes('google.com')) {
      h = 34;
    }
    if (ref) {
      const rh = ref.getBoundingClientRect().height;
      if (rh >= 18 && rh <= 60) h = host.includes('kayak.com') ? rh : rh - 2;
      else return; // not laid out yet; try again on the next scan
    }
    const svg = trig.querySelector('svg');
    if (svg && host.includes('matrix.itasoftware.com') && ref) {
      // ITA: exactly as tall as the price button, flush beside it — the
      // face's own artwork fills the full height (no empty margin in the
      // drawing), centered on the same line, with a small even gap.
      const rh = ref.getBoundingClientRect().height;
      svg.setAttribute('viewBox', '0 0.5 34 26');
      svg.setAttribute('height', String(Math.round(rh)));
      svg.setAttribute('width', String(Math.round(rh * 34 / 26)));
      svg.style.display = 'block';
      trig.style.cssText += ';margin:0 0 0 4px;align-self:center;vertical-align:middle;line-height:0;';
    } else if (svg) { svg.setAttribute('height', String(Math.round(h))); svg.setAttribute('width', String(Math.round(h * 34 / 27))); }
    trig.dataset.sized = '1';
  }

  GM_addStyle(`
    .gds-pip-trigger { display: inline-flex; align-items: center; justify-content: center; cursor: pointer; vertical-align: middle;
      margin: 0 4px; line-height: 0; transition: filter .15s ease; flex-shrink: 0; }
    .gds-pip-trigger:hover { filter: brightness(1.25); }
    .gds-pip-trigger:active { transform: translateY(1px) scale(.98); }
  `);

  // ------------------------------------------------------------------
  // INITIALIZATION & OBSERVER
  // ------------------------------------------------------------------
  function init() {
    const host = location.hostname;
    if (host.includes('flybasis.com') || host.includes('agentsearch.vercel.app')) { injectFlyBasisButtons(); injectFlyBasisDetailButton(); }
    if (host.includes('matrix.itasoftware.com')) injectItaButtons();
    if (host.includes('pointsyeah.com')) injectPointsYeahButtons();
    if (host.includes('awardlogic.com')) injectAwardLogicButtons();
    if (host.includes('kayak.com')) injectKayakButtons();
    if (host.includes('cheapoair.com')) injectCheapOairButtons();
    if (host.includes('google.com') && location.pathname.startsWith('/travel/flights')) injectGoogleFlightsButton();
    bmoizeGdsButtons();
  }

  // Coalesce bursts of mutations into a single init() per animation
  // frame rather than one per mutation record. On a busy SPA this
  // MutationObserver's callback can fire dozens of times within a
  // single visual update (React/Vue-style frameworks batch many small
  // DOM writes together), and each of those was re-running every
  // injectXButtons() query on every single firing. Capping it to once
  // per frame keeps the same effective responsiveness (a few ms, never
  // perceptible) while cutting out the redundant re-scans and the
  // short-lived NodeList allocations each one creates.
  let initScheduled = false;
  const observer = new MutationObserver(() => {
    if (initScheduled) return;
    initScheduled = true;
    requestAnimationFrame(() => {
      initScheduled = false;
      init();
    });
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  init();

  // The URL-change-triggered retry burst that used to live here still
  // wasn't reliable enough — worth being honest that I don't actually
  // know the precise mechanism (Google's SPA transition timing, or
  // requestAnimationFrame getting throttled while the tab is
  // backgrounded during that transition — rAF callbacks are not
  // guaranteed to fire promptly in a hidden tab, which the coalescing
  // above depends on). Rather than keep guessing at the right trigger to
  // watch for, this just tries unconditionally, forever, on a plain
  // setInterval (not tied to animation frames, so it isn't subject to
  // that same throttling risk) as long as the URL is under
  // /travel/flights. Each attempt is two cheap querySelector calls that
  // no-op immediately once the button's already there, so running this
  // indefinitely costs nothing worth worrying about — it guarantees
  // eventual correctness without needing to know why the other paths
  // sometimes miss.
  if (location.hostname.includes('google.com')) {
    setInterval(() => {
      if (location.pathname.startsWith('/travel/flights')) injectGoogleFlightsButton();
    }, 1000);
  }
})();

// --------------------------------------------------------------------
// Shared CRM DOM-scan scheduler — PARTs 2, 3 and 4 all run together on
// the same CRM page. Each used to keep its own separate MutationObserver
// watching the whole document (childList+subtree on document.documentElement
// -- the most expensive observer scope there is), so a single DOM
// mutation anywhere on the page -- and this CRM has a live terminal that
// appends output constantly -- fired THREE independent observers and
// three separate rAF-coalesced re-scans. On a low-end PC that's real,
// avoidable CPU/RAM overhead: three copies of the browser's own mutation
// bookkeeping, tripled event dispatch, tripled callback-array churn. One
// shared observer with one shared rAF batch running all three parts'
// scan functions does the exact same job for a third of the cost, with
// no change in behavior. (PART 1 runs only on flight-search sites, never
// alongside these, so it keeps its own separate observer rather than
// pulling in this machinery where it'd never be shared with anything.)
const __jsScanCallbacks = [];
let __jsScanScheduled = false;
let __jsSharedObserver = null;
function __jsRegisterScan(fn) { __jsScanCallbacks.push(fn); }
function __jsEnsureSharedObserver() {
  if (__jsSharedObserver) return;
  __jsSharedObserver = new MutationObserver(() => {
    if (__jsScanScheduled) return;
    __jsScanScheduled = true;
    requestAnimationFrame(() => {
      __jsScanScheduled = false;
      for (const fn of __jsScanCallbacks) { try { fn(); } catch (e) { /* one part's error shouldn't stop the others */ } }
    });
  });
  __jsSharedObserver.observe(document.documentElement, { childList: true, subtree: true });
}

// ====================================================================
// SECTION 2 · CRM "Add option" modal: Sort Me + auto-carrier + auto-next
// ====================================================================
(function () {
  'use strict';

  // Same reasoning as the other half of this file — bail out before the
  // MutationObserver is created on any page that isn't this CRM site, so
  // being on Kayak/Google Flights/etc. doesn't also pay for a
  // subtree-wide observer that's checking for a modal class that will
  // never exist there.
  if (!location.hostname.includes('travelbusinessclass.com')) return;

  // ------------------------------------------------------------------
  // Scoped to /leads/* — the "Add option" modal only exists on lead
  // pages (e.g. .../leads/614528), so there's no need to run anywhere
  // else on the CRM.
  // ------------------------------------------------------------------

  const MONTH_MAP = { JAN:0, FEB:1, MAR:2, APR:3, MAY:4, JUN:5, JUL:6, AUG:7, SEP:8, OCT:9, NOV:10, DEC:11 };

  // Longitude of common airports, used only to estimate a UTC offset
  // (round(longitude/15)) so legs across very different time zones sort
  // correctly (e.g. a Sydney departure vs a San Francisco departure on
  // "the same" local date/time-of-day are not directly comparable —
  // comparing raw local clock times misorders exactly this kind of
  // connection). Ignores DST; imprecise right at zone boundaries; but a
  // same-day slip in local time essentially never flips which of two
  // *different* flights in an itinerary should come first.
  const AIRPORT_LON = {
    JFK:-73.7781, EWR:-74.1745, LGA:-73.8740, BOS:-71.0096, IAD:-77.4565, DCA:-77.0402,
    BWI:-76.6684, PHL:-75.2424, ORD:-87.9073, ATL:-84.4277, MIA:-80.2870, MCO:-81.3081,
    FLL:-80.1527, TPA:-82.5311, DFW:-97.0403, IAH:-95.3368, AUS:-97.6664, DEN:-104.6737,
    LAX:-118.4085, SFO:-122.3790, SAN:-117.1933, SEA:-122.3088, PDX:-122.5951, LAS:-115.1537,
    PHX:-112.0116, SLC:-111.9791, MSP:-93.2223, DTW:-83.3534, CLT:-80.9431, MSY:-90.2580,
    STL:-90.3700, MCI:-94.7139, PIT:-80.2329, CLE:-81.8498, IND:-86.2944, CMH:-82.8919,
    BNA:-86.6782, MEM:-89.9767, JAX:-81.6879, RDU:-78.7875, SAT:-98.4698, ELP:-106.3781,
    SJC:-121.9291, OAK:-122.2197, SNA:-117.8682, ONT:-117.6012, BUR:-118.3587, HNL:-157.9251,
    YVR:-123.1792, YYZ:-79.6248, YUL:-73.7408, YYC:-114.0076, MEX:-99.0721, CUN:-86.8771,
    PTY:-79.3835, BOG:-74.1469, LIM:-77.1143, GRU:-46.4731, GIG:-43.2506, EZE:-58.5358,
    SCL:-70.7858, LHR:-0.4543, LGW:-0.1903, MAN:-2.2750, CDG:2.5479, ORY:2.3652, AMS:4.7683,
    FRA:8.5622, MUC:11.7861, ZRH:8.5492, VIE:16.5697, MAD:-3.5676, BCN:2.0785, LIS:-9.1359,
    FCO:12.2389, ATH:23.9445, IST:28.7519, CPH:12.6560, ARN:17.9186, OSL:11.1004, HEL:24.9633,
    DUB:-6.2701, BRU:4.4844, WAW:20.9671, PRG:14.2600, BUD:19.2611, KEF:-22.6056,
    DXB:55.3657, AUH:54.6511, DOH:51.6081, RUH:46.6988, JED:39.1565, CAI:31.4056,
    JNB:28.2460, CPT:18.6017, NBO:36.9278, LOS:3.3212, ADD:38.7993,
    HND:139.7798, NRT:140.3929, ICN:126.4407, PVG:121.8083, PEK:116.6031, PKX:116.4109, HKG:113.9185,
    TPE:121.2328, SIN:103.9915, BKK:100.7501, KUL:101.7099, MNL:121.0198, DEL:77.1000,
    BOM:72.8679, CMB:79.8841, SYD:151.1753, MEL:144.8410, BNE:153.1175, PER:115.9669, AKL:174.7850,
  };

  function estimateUtcOffset(iata) {
    const lon = AIRPORT_LON[iata];
    return lon != null ? Math.round(lon / 15) : 0;
  }

  // Reads the CRM's own displayed clock (the small "10:37 / KIV / 13
  // Sep" widget) as the reference "now" for year-inference, instead of
  // trusting the browser's system clock. If the system clock is ever in
  // a different timezone or has drifted from the CRM's own business
  // time, trusting it could push a date to the wrong side of a
  // month/year boundary — e.g. a departure in December and a return in
  // January should resolve to the SAME booking year for December and
  // the NEXT year for January, and that call is only as good as
  // whatever "now" it's measured against. Falls back to the system
  // clock if the widget isn't found (year still comes from the system
  // clock either way, since the widget doesn't display one).
  function getReferenceNow() {
    const activeEl = document.querySelector('[data-active="true"]');
    if (activeEl) {
      const m = activeEl.textContent.match(/\b(\d{1,2})\s+([A-Za-z]{3})\b/);
      if (m) {
        const month = MONTH_MAP[m[2].slice(0, 3).toUpperCase()];
        if (month !== undefined) {
          return new Date(new Date().getFullYear(), month, parseInt(m[1], 10));
        }
      }
    }
    return new Date();
  }

  function inferYear(month, day, referenceNow) {
    const now = referenceNow || new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const candidate = new Date(now.getFullYear(), month, day);
    return candidate < todayStart ? now.getFullYear() + 1 : now.getFullYear();
  }

  function parseSabreTime(t) {
    const ap = t.slice(-1).toUpperCase();
    const digits = t.slice(0, -1);
    let hh, mm;
    if (digits.length >= 3) {
      mm = parseInt(digits.slice(-2), 10);
      hh = parseInt(digits.slice(0, digits.length - 2), 10);
    } else {
      hh = parseInt(digits, 10);
      mm = 0;
    }
    if (ap === 'P' && hh < 12) hh += 12;
    if (ap === 'A' && hh === 12) hh = 0;
    return { hh, mm };
  }

  // A rough UTC instant for the leg's LOCAL departure wall-clock — used
  // ONLY as a tie-breaker now (see reorderByContinuity below), never as
  // the primary sort signal, since it silently goes wrong for any
  // airport missing from AIRPORT_LON (falls back to offset 0/UTC, which
  // can flip two legs' relative order without any obvious sign it did).
  function utcDepartureKey(ddmon, timeTok, originIata, referenceNow) {
    const m = ddmon.match(/^(\d{2})([A-Z]{3})$/);
    if (!m) return Number.MAX_SAFE_INTEGER;
    const day = parseInt(m[1], 10);
    const month = MONTH_MAP[m[2].toUpperCase()];
    if (month === undefined) return Number.MAX_SAFE_INTEGER;
    const year = inferYear(month, day, referenceNow);
    const { hh, mm } = parseSabreTime(timeTok);
    const offset = estimateUtcOffset(originIata);
    return Date.UTC(year, month, day, hh - offset, mm, 0, 0);
  }

  function stripPrompt(line) {
    return line.replace(/^[\u276F>]\s*/, ''); // "❯ " or "> " terminal prompt prefix
  }

  // Marker-position based splitting — tolerant of *IA/VI* appearing in
  // EITHER order, glued onto the end of a previous line with no line
  // break, and a stray junk character sometimes attached right after the
  // marker (seen: "VI*\u00AB" / "*IA\u00AB" from some copy paths). Scanning
  // the whole text for marker positions handles all of this in one pass,
  // instead of assuming *IA always comes first on its own clean line.
  function splitByMarkers(rawText) {
    const text = rawText.split(/\r?\n/).map(stripPrompt).join('\n');
    const markerRe = /(\*IA|VI\*|\*VI)[\u00ab\u00bb]?/g; // "*VI" accepted as VI*
    const matches = [];
    let m;
    while ((m = markerRe.exec(text))) {
      matches.push({ type: m[1] === '*VI' ? 'VI*' : m[1], end: markerRe.lastIndex, index: m.index });
    }
    const sections = [];
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].end;
      const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
      sections.push({ type: matches[i].type, content: text.slice(start, end) });
    }
    return sections;
  }

  function parseIaLines(content) {
    return content.split('\n').filter((l) => /^\s*\d+\s+/.test(l));
  }

  function parseViChunks(content) {
    const lines = content.split('\n').filter((l) => !/^\s*FLIGHT\s+DATE\s+SEGMENT/i.test(l));
    const chunks = [];
    let cur = null;
    for (const l of lines) {
      if (/^\s*\d+\s+/.test(l)) {
        if (cur) chunks.push(cur);
        cur = [l];
      } else if (cur) {
        if (l.trim() !== '') cur.push(l);
      }
    }
    if (cur) chunks.push(cur);
    return chunks;
  }

  // Parses one "*IA" section paired with its matching "VI*" section (the
  // segment's FLIGHT row plus every continuation line under it — DEP/ARR
  // TERMINAL, operated-by, alliance, CABIN-x) by position within the pair.
  function parseBlock(iaContent, viContent, referenceNow) {
    const iaLines = parseIaLines(iaContent);
    const viChunks = parseViChunks(viContent);
    const legs = [];
    for (let idx = 0; idx < iaLines.length; idx++) {
      const iaMatch = iaLines[idx].match(/^\s*\d+\s+(.*)$/);
      if (!iaMatch) continue;
      const iaRest = iaMatch[1].replace(/\s+$/, '');

      const carrierMatch = iaRest.match(/^([A-Z0-9]{2})/);
      const carrier = carrierMatch ? carrierMatch[1] : '';
      const dateMatch = iaRest.match(/(\d{2}[A-Z]{3})/);
      const timeMatches = iaRest.match(/\b\d{3,4}[AP]\b/g) || [];
      const routeMatch = iaRest.match(/\d{2}[A-Z]{3}\s+[A-Z]\s+([A-Z]{3})([A-Z]{3})\s/);
      const origin = routeMatch ? routeMatch[1] : null;
      const destination = routeMatch ? routeMatch[2] : null;

      const sortKey = (dateMatch && timeMatches.length)
        ? utcDepartureKey(dateMatch[1], timeMatches[0], origin, referenceNow)
        : Number.MAX_SAFE_INTEGER;

      const viChunk = viChunks[idx];
      const viFirstLine = viChunk ? viChunk[0].replace(/^\s*\d+\s+/, '') : '';
      const viOtherLines = viChunk ? viChunk.slice(1) : [];

      legs.push({ iaRest, carrier, origin, destination, sortKey, viFirstLine, viOtherLines });
    }
    return legs;
  }

  // Splits the raw text into *IA/VI* section pairs (in whichever order
  // they appear) and parses each pair into legs. referenceNow is
  // resolved once here (a single quick peek at the CRM's own clock)
  // rather than once per leg, since it can't meaningfully change
  // between legs parsed from the same paste.
  function parseRawSegments(rawText) {
    const referenceNow = getReferenceNow();
    const sections = splitByMarkers(rawText);
    const legs = [];
    for (let i = 0; i < sections.length; i += 2) {
      const a = sections[i];
      const b = sections[i + 1];
      if (!a || !b) break;
      const iaSection = a.type === '*IA' ? a : (b.type === '*IA' ? b : null);
      const viSection = a.type === 'VI*' ? a : (b.type === 'VI*' ? b : null);
      if (!iaSection || !viSection) continue;
      legs.push(...parseBlock(iaSection.content, viSection.content, referenceNow));
    }
    return legs;
  }

  // Orders legs by flight CONTINUITY — leg N+1 departs from wherever leg
  // N arrived — rather than by comparing each leg's own local clock time
  // in isolation. Local-time comparison alone breaks the moment one leg's
  // airport isn't in AIRPORT_LON (silently falls back to a UTC offset of
  // 0), which can flip two legs' relative order with no obvious sign it
  // happened. Continuity has no such failure mode: it only needs matching
  // airport CODES, never timezone data, for anything actually connected.
  // Date/time is used only as a tie-breaker — to pick where to "cut" a
  // closed loop open (a round trip that returns to its starting city has
  // no leg without a predecessor), and to order separate, unconnected
  // chains relative to each other.
  function reorderByContinuity(legs) {
    const n = legs.length;
    if (n <= 1) return legs.slice();

    const parent = Array.from({ length: n }, (_, i) => i);
    function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
    function union(a, b) { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; }

    const byOrigin = new Map();
    const byDestination = new Map();
    legs.forEach((leg, idx) => {
      if (leg.origin) { if (!byOrigin.has(leg.origin)) byOrigin.set(leg.origin, []); byOrigin.get(leg.origin).push(idx); }
      if (leg.destination) { if (!byDestination.has(leg.destination)) byDestination.set(leg.destination, []); byDestination.get(leg.destination).push(idx); }
    });

    // Link leg idx to leg j (idx's destination == j's origin) ONLY when j
    // is the SOONEST qualifying departure from that airport — never every
    // later one. Unioning with every later match breaks the moment an
    // airport is revisited by a second, unrelated trip: e.g. trip A ends
    // by ARRIVING at CAI in October, and weeks later a completely
    // separate trip B DEPARTS CAI in November. CAI-as-origin matches
    // trip B's leg too, so without picking only the nearest one, that
    // later, unrelated departure gets unioned into trip A's chain right
    // alongside trip A's real continuation — welding two separate trips
    // into one false component. Picking only the minimum-sortKey
    // candidate (the true immediate next flight) avoids this: trip B's
    // later CAI departure stays unlinked from trip A and forms its own
    // separate chain, exactly as it should.
    //
    // That alone isn't enough, though — it only guards the OUTGOING side
    // (each leg picks its own nearest forward match), but says nothing
    // about the INCOMING side. Two different legs can both arrive at the
    // same airport and both pick the SAME single departure from there as
    // their "nearest forward match" — one might be a same-day connection,
    // the other a much later, unrelated arrival weeks earlier — and
    // without an incoming check too, BOTH get unioned into that departure,
    // welding an unrelated trip on anyway, just from the other direction.
    // So a link only actually forms when it's the mutual best match on
    // BOTH sides: idx's nearest forward candidate is j, AND j's nearest
    // backward candidate (among everything arriving at its own origin) is
    // idx. Whichever predecessor is genuinely closest in time wins that
    // departure; the more distant one stays unlinked, ending its own
    // chain instead of being dragged into one it was never really part of.
    const bestForward = new Map();
    legs.forEach((leg, idx) => {
      if (!leg.destination) return;
      const candidates = (byOrigin.get(leg.destination) || [])
        .filter((j) => j !== idx && legs[j].sortKey >= leg.sortKey);
      if (!candidates.length) return;
      candidates.sort((a, b) => legs[a].sortKey - legs[b].sortKey);
      bestForward.set(idx, candidates[0]);
    });

    const bestBackward = new Map();
    legs.forEach((leg, idx) => {
      if (!leg.origin) return;
      const candidates = (byDestination.get(leg.origin) || [])
        .filter((j) => j !== idx && legs[j].sortKey <= leg.sortKey);
      if (!candidates.length) return;
      candidates.sort((a, b) => legs[b].sortKey - legs[a].sortKey);
      bestBackward.set(idx, candidates[0]);
    });

    legs.forEach((leg, idx) => {
      const candidate = bestForward.get(idx);
      if (candidate === undefined) return;
      if (bestBackward.get(candidate) === idx) union(idx, candidate);
    });

    const groups = new Map();
    legs.forEach((leg, idx) => {
      const r = find(idx);
      if (!groups.has(r)) groups.set(r, []);
      groups.get(r).push(idx);
    });

    const chains = [];
    groups.forEach((indices) => {
      const idxSet = new Set(indices);
      const hasPredecessor = new Set();
      indices.forEach((idx) => {
        const leg = legs[idx];
        const preds = (byDestination.get(leg.origin) || []).filter((j) => idxSet.has(j));
        if (preds.length) hasPredecessor.add(idx);
      });
      let startIdx = indices.find((idx) => !hasPredecessor.has(idx));
      if (startIdx === undefined) {
        // A closed loop (e.g. a round trip back to its own starting
        // city) — every leg has a predecessor, so there's no unambiguous
        // start. Cut it open at whichever leg looks earliest.
        startIdx = indices.slice().sort((a, b) => legs[a].sortKey - legs[b].sortKey)[0];
      }

      const ordered = [];
      const used = new Set();
      let cur = startIdx;
      while (cur !== undefined && !used.has(cur)) {
        ordered.push(cur);
        used.add(cur);
        const leg = legs[cur];
        // Among every unused leg departing from where `leg` just landed,
        // the one that actually comes next is whichever departs SOONEST
        // — not whichever happened to appear first in the pasted text.
        // Taking nextCandidates[0] unsorted picked leg order/paste order
        // by accident: a leg landing at CGK on the 12th with both a
        // BPN side-trip departing the 13th and a later DOH continuation
        // departing the 20th available from CGK would jump straight to
        // the 20th continuation just because it was pasted first,
        // skipping over the side-trip that actually happens in between.
        // Sorting candidates by sortKey and taking the earliest fixes
        // that regardless of paste order.
        const nextCandidates = (byOrigin.get(leg.destination) || [])
          .filter((j) => idxSet.has(j) && !used.has(j))
          .sort((a, b) => legs[a].sortKey - legs[b].sortKey);
        cur = nextCandidates.length ? nextCandidates[0] : undefined;
      }
      indices.forEach((idx) => { if (!used.has(idx)) ordered.push(idx); });

      chains.push({ indices: ordered, startKey: legs[ordered[0]].sortKey });
    });

    chains.sort((a, b) => a.startKey - b.startKey);

    const result = [];
    chains.forEach((chain) => chain.indices.forEach((idx) => result.push(legs[idx])));
    return result;
  }

  function buildMerged(legs) {
    const sorted = reorderByContinuity(legs);
    const iaLines = sorted.map((leg, idx) => `${String(idx + 1).padStart(2, ' ')} ${leg.iaRest}`);
    const viLines = ['   FLIGHT  DATE  SEGMENT DPTR  ARVL    MLS  EQP  ELPD MILES SM'];
    sorted.forEach((leg, idx) => {
      viLines.push(`${String(idx + 1).padStart(2, ' ')} ${leg.viFirstLine}`);
      viLines.push(...leg.viOtherLines);
    });
    return `*IA\n${iaLines.join('\n')}\n\nVI*\n${viLines.join('\n')}`;
  }

  function detectCarrier(legs) {
    const counts = {};
    legs.forEach((leg) => { if (leg.carrier) counts[leg.carrier] = (counts[leg.carrier] || 0) + 1; });
    let best = null, bestCount = 0;
    for (const [code, count] of Object.entries(counts)) {
      if (count > bestCount) { best = code; bestCount = count; }
    }
    return best;
  }

  // Hidden BO "send to lead" worker frame (see the Send to lead section).
  const IN_WORKER_FRAME = window.top !== window && /^jsworker-/.test(window.name || '');

  // Chrome slows plain timers in a background tab to once a second (once
  // a MINUTE after 5 minutes hidden) — that's what made Send to lead
  // crawl. Timers inside a tiny Web Worker aren't slowed, so waits use
  // that whenever this page is hidden.
  let fastTimer;
  let fastTimerOk = false;
  // Fallback when no worker: message-loop until the time is up. Messages
  // aren't slowed in background tabs. Only used for the short waits.
  function spinWait(ms, resolve) {
    const end = performance.now() + ms;
    const ch = new MessageChannel();
    ch.port1.onmessage = () => { if (performance.now() >= end) { ch.port1.close(); resolve(); } else ch.port2.postMessage(0); };
    ch.port2.postMessage(0);
  }
  function getFastTimer() {
    if (fastTimer !== undefined) return fastTimer;
    fastTimer = null;
    try {
      const src = 'onmessage=function(e){setTimeout(function(){postMessage(e.data.id)},e.data.ms)}';
      const w = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
      const pending = new Map();
      let seq = 0;
      w.onmessage = (e) => { if (e.data === -1) { fastTimerOk = true; return; } const f = pending.get(e.data); if (f) { pending.delete(e.data); f(); } };
      w.onerror = () => { fastTimer = null; pending.forEach((f) => setTimeout(f, 0)); pending.clear(); };
      fastTimer = (fn, ms) => { const id = ++seq; pending.set(id, fn); w.postMessage({ id, ms }); };
      w.postMessage({ id: -1, ms: 0 }); // proves the worker really runs (a CSP can block it)
    } catch (e) { fastTimer = null; }
    return fastTimer;
  }

  function wait(ms) {
    return new Promise((resolve) => {
      if (!(document.hidden || IN_WORKER_FRAME) || ms > 1500) { setTimeout(resolve, ms); return; }
      const ft = getFastTimer();
      if (ft && fastTimerOk) ft(resolve, ms); else spinWait(ms, resolve);
    });
  }

  // In the hidden worker frame a real .focus() would pull keyboard focus
  // out of whatever you're typing in — so there it only fires the events.
  function softFocus(el) {
    if (!el) return;
    if (IN_WORKER_FRAME) {
      el.dispatchEvent(new FocusEvent('focus'));
      el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    } else {
      el.focus();
    }
  }

  // ---- Make the hidden worker frame run at full speed ---------------
  // Chrome treats a page in a background tab very differently from one
  // on screen: timers are slowed to once a second (or once a MINUTE),
  // animation frames stop completely, and the page reports itself as
  // hidden (apps often hold work until it's visible again). That's why
  // the BO only got going once you switched to its tab. Inside the
  // hidden worker frame only, the BO is made to believe it's on screen
  // and gets timers that aren't slowed down.
  if (IN_WORKER_FRAME) {
    try {
      const W = unsafeWindow;
      const D = W.document;
      // 1. "You're visible and focused."
      const def = (o, k, v) => { try { Object.defineProperty(o, k, { configurable: true, get: () => v }); } catch (e) { /* ignore */ } };
      def(D, 'hidden', false);
      def(D, 'visibilityState', 'visible');
      def(D, 'webkitHidden', false);
      def(D, 'webkitVisibilityState', 'visible');
      try { D.hasFocus = () => true; } catch (e) { /* ignore */ }
      // Swallow the real "you're hidden now" events.
      const stopHidden = (e) => { if (e.isTrusted) e.stopImmediatePropagation(); };
      D.addEventListener('visibilitychange', stopHidden, true);
      W.addEventListener('blur', stopHidden, true);
      W.addEventListener('pagehide', stopHidden, true);
      W.addEventListener('freeze', stopHidden, true);

      // 2. Unthrottled timers, run from a tiny Web Worker.
      const src = 'var t={};onmessage=function(e){var d=e.data;if(d.op==="c"){clearTimeout(t[d.id]);clearInterval(t[d.id]);delete t[d.id];return;}'
        + 'if(d.op==="i"){t[d.id]=setInterval(function(){postMessage(d.id)},d.ms);}else{t[d.id]=setTimeout(function(){delete t[d.id];postMessage(d.id)},d.ms);}}';
      const tw = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
      const tasks = new Map();
      let seq = 1e8; // well clear of the browser's own timer ids
      tw.onmessage = (e) => {
        const t = tasks.get(e.data);
        if (!t) return;
        if (!t.repeat) tasks.delete(e.data);
        try { t.fn.apply(W, t.args); } catch (err) { setTimeout(() => { throw err; }, 0); }
      };
      const nST = W.setTimeout.bind(W);
      const nSI = W.setInterval.bind(W);
      const nCT = W.clearTimeout.bind(W);
      const nCI = W.clearInterval.bind(W);
      let workerOk = false;
      tw.postMessage({ op: 't', id: 0, ms: 0 });
      tasks.set(0, { fn: () => { workerOk = true; }, args: [] });
      const add = (repeat) => function (fn, ms, ...args) {
        if (typeof fn !== 'function' || !workerOk) return (repeat ? nSI : nST)(fn, ms, ...args);
        const id = ++seq;
        tasks.set(id, { fn, args, repeat });
        tw.postMessage({ op: repeat ? 'i' : 't', id, ms: Math.max(0, +ms || 0) });
        return id;
      };
      const clear = (native) => function (id) {
        if (tasks.has(id)) { tasks.delete(id); tw.postMessage({ op: 'c', id }); } else native(id);
      };
      W.setTimeout = add(false);
      W.setInterval = add(true);
      W.clearTimeout = clear(nCT);
      W.clearInterval = clear(nCI);
      // 3. Animation frames (which never fire in a hidden tab) ~60fps.
      W.requestAnimationFrame = (cb) => W.setTimeout(() => cb(W.performance.now()), 16);
      W.cancelAnimationFrame = (id) => W.clearTimeout(id);
      // Wake anything that was waiting to become visible.
      nST(() => { try { D.dispatchEvent(new Event('visibilitychange')); W.dispatchEvent(new Event('focus')); } catch (e) { /* ignore */ } }, 0);
    } catch (e) { /* keep the BO as it is */ }
  }

  // The worker frame is a full second copy of the BO: keep it silent.
  if (IN_WORKER_FRAME) {
    try {
      const W = unsafeWindow;
      W.HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
      if (W.AudioContext) W.AudioContext.prototype.resume = function () { return Promise.resolve(); };
      if (W.Notification) {
        const N = function () { return { close() {}, addEventListener() {} }; };
        N.permission = 'denied';
        N.requestPermission = () => Promise.resolve('denied');
        W.Notification = N;
      }
    } catch (e) { /* ignore */ }
  }

  function setNativeValue(el, value) {
    const proto = Object.getPrototypeOf(el);
    const setter = (Object.getOwnPropertyDescriptor(proto, 'value') || {}).set
      || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
      || Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setter.call(el, value);
  }

  // ------------------------------------------------------------------
  // Vue multiselect carrier field — the option list is fully rendered in
  // the DOM up front (confirmed from the page's own HTML: even obscure
  // carriers show up before anything is typed), so the match can be
  // found directly by aria-label rather than needing to replicate the
  // visual search-filter behavior. Still opens the dropdown the way a
  // real click/focus would first, in case the click handler expects
  // that state.
  // ------------------------------------------------------------------
  // Reads whatever's currently DISPLAYED as selected in this multiselect
  // (not what's in the hidden options dropdown) — clones the wrapper,
  // strips the dropdown out of the clone, and reads what visible text
  // remains, plus the search input's own value (inputs don't contribute
  // to textContent). Doesn't need to know this component's exact class
  // name for "currently selected label" — whatever renders there when
  // something's selected shows up either way.
  function currentMultiselectDisplay(wrapper, input) {
    const clone = wrapper.cloneNode(true);
    const dropdown = clone.querySelector('.form-multiselect-dropdown');
    if (dropdown) dropdown.remove();
    const visibleText = (clone.textContent || '').trim();
    return (visibleText + ' ' + (input.value || '')).trim();
  }

  async function selectCarrier(modalRoot, carrierCode) {
    if (!carrierCode) return false;
    const input = modalRoot.querySelector('.form-multiselect-search');
    if (!input) return false;
    const wrapper = input.closest('.form-multiselect');
    if (!wrapper) return false;

    // Skip the whole select flow if this carrier is already the one
    // shown selected — re-clicking through to select the SAME value
    // still fires this component's real selection interactions, which
    // very plausibly triggers the site's own "carrier changed"
    // handling even when nothing actually changed. That's fine (even
    // wanted) the first time a fresh option is built from empty, but
    // Sort Me calls this unconditionally on every click — so editing or
    // duplicating an option that already has its carrier correctly set
    // was re-triggering that handling on every single Sort Me press,
    // which is the likely cause of the segments field getting reset
    // right back to what it was before.
    const already = currentMultiselectDisplay(wrapper, input);
    if (new RegExp('\\b' + carrierCode + '\\b', 'i').test(already)) {
      return true;
    }

    softFocus(input);
    input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    input.click();

    setNativeValue(input, carrierCode);
    input.dispatchEvent(new Event('input', { bubbles: true }));

    const re = new RegExp('^' + carrierCode + '\\s*-', 'i');
    for (let attempt = 0; attempt < 15; attempt++) {
      await wait(100);
      const options = wrapper.querySelectorAll('.form-multiselect-option');
      const match = Array.from(options).find((li) =>
        re.test((li.getAttribute('aria-label') || li.textContent || '').trim())
      );
      if (match) {
        match.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        match.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        match.click();
        return true;
      }
    }
    return false;
  }

  // ------------------------------------------------------------------
  // PCC / ticketing-agency multiselect — same underlying Vue multiselect
  // component as the carrier field above (form-multiselect /
  // form-multiselect-search / form-multiselect-option), but this later
  // step of the modal has three of these side by side (Fare type,
  // Tkt. type, and PCC all share the exact same wrapper classes, so
  // there's no CSS selector that picks PCC out from Fare type alone —
  // Tkt. type at least gets an extra "form-multiselect--multiple"
  // class, but the other two are identical).
  //
  // The full markup confirms every one of the three renders its whole
  // <li> option list into the DOM up front — just hidden behind an
  // "is-hidden" class on the dropdown, not actually absent — the same
  // as the carrier field. That means the right wrapper can be found by
  // reading each one's already-present options directly, with nothing
  // opened yet, rather than opening each multiselect in turn just to
  // inspect it (which is what made this visibly flick through Fare
  // type and Tkt. type first before landing on PCC). Once found, only
  // that one field ever gets opened.
  //
  // Match on each <li>'s inner <span> text, not its own aria-label:
  // the currently-selected option's aria-label gets a "✓ " prefix
  // added (aria-label="✓ 10XH"), which would stop matching the moment
  // 10XH becomes the selected value — the <span> stays plain "10XH"
  // regardless of selection state.
  // ------------------------------------------------------------------
  function findMultiselectOption(wrapper, code) {
    return Array.from(wrapper.querySelectorAll('.form-multiselect-option')).find((li) => {
      const label = (li.querySelector('span')?.textContent || li.textContent || '').trim();
      return label.toUpperCase() === code.toUpperCase();
    });
  }

  async function selectPcc(modalRoot, pccCode) {
    if (!pccCode) return false;
    const wrappers = Array.from(modalRoot.querySelectorAll('.form-multiselect'));
    const wrapper = wrappers.find((w) => findMultiselectOption(w, pccCode));
    if (!wrapper) return false;

    const input = wrapper.querySelector('.form-multiselect-search');
    if (!input) return false;

    softFocus(input);
    input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    input.click();

    let match = null;
    for (let attempt = 0; attempt < 10; attempt++) {
      await wait(100);
      match = findMultiselectOption(wrapper, pccCode);
      if (match) break;
    }
    if (!match) return false;

    match.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    match.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    match.click();
    return true;
  }

  function flashButtonLabel(btn, text, revertTo) {
    btn.textContent = text;
    setTimeout(() => { btn.textContent = revertTo; }, 1400);
  }

  // ------------------------------------------------------------------
  // Auto-next — finds the primary "Next" button fresh each time rather
  // than reusing a stored reference, since the modal's own step-change
  // likely tears down and re-renders this markup between the two clicks
  // (same reasoning as re-detecting the modal itself on every open).
  // ------------------------------------------------------------------
  const AUTO_NEXT_STORAGE_KEY = 'gds-crm-auto-next-enabled';

  // This agency's fixed PCC / ticketing code — auto-pcc always selects
  // this one, the same way auto-carrier always aims at whatever carrier
  // the parsed legs say, except this value doesn't come from the
  // itinerary at all (PCC is tied to the agency, not the flight), so
  // it's just a constant here rather than something detected per-quote.
  const AUTO_PCC_CODE = '10XH';

  function findNextButton() {
    return Array.from(document.querySelectorAll('button.btn-primary'))
      .find((b) => b.textContent.trim().toLowerCase() === 'next');
  }

  // Polls for the Next button rather than grabbing it on the first try.
  // Right before this runs, Sort Me has just dispatched input/change on
  // the textarea and clicked through the carrier multiselect — Vue's own
  // reactivity (re-validating the form, enabling the button) needs a
  // tick to catch up with that, and grabbing a still-disabled button
  // immediately produces a click that does nothing, which is
  // indistinguishable from "auto-next isn't running" from the outside.
  // Skipping a disabled match and trying again fixes that without
  // guessing a single fixed delay that may not always be enough.
  async function findNextButtonReady(maxAttempts = 15, delayMs = 150) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const btn = findNextButton();
      if (btn && !btn.disabled) return btn;
      await wait(delayMs);
    }
    return findNextButton(); // last-ditch: click whatever exists, even if still disabled
  }

  async function clickNextTwice(modalRoot) {
    const first = await findNextButtonReady();
    if (!first) return;
    first.click();
    await wait(400);
    const second = await findNextButtonReady();
    if (second) second.click();

    // Give the next step's own fields (PCC / Tkt. type multiselects)
    // time to actually render before trying to find and open them.
    await wait(500);
    if (modalRoot) await selectPcc(modalRoot, AUTO_PCC_CODE);
  }

  async function maybeAutoNext(modalRoot, autoNextCheckbox, legs) {
    if (autoNextCheckbox && autoNextCheckbox.checked && legs.length) {
      await clickNextTwice(modalRoot);
    }
  }

  // When auto-next is OFF, Sort Me should hand focus back to the
  // segments box instead of leaving it sitting in the carrier
  // multiselect's search input — mirrors what pressing Tab twice does
  // by hand on this modal. A short wait first lets that multiselect's
  // own post-selection focus handling settle, so a direct .focus() call
  // isn't immediately stolen back by it. Re-queries the textarea fresh
  // rather than reusing an old reference, in case Vue re-rendered it.
  // The two synthetic Tab keydowns are a fallback for the (less likely,
  // but possible) case where it's the app's own JS-driven tab handling —
  // not a direct focus target — that's actually moving focus here;
  // real browser Tab-navigation itself ignores untrusted synthetic
  // events, so this can only help if the app is listening for the key
  // itself, and does nothing if the direct focus() above already worked.
  async function returnFocusToSegmentsBox(modalRoot) {
    await wait(150);
    const ta = modalRoot.querySelector('textarea.font-robotoMono');
    if (ta) {
      ta.focus();
      return;
    }
    const active = document.activeElement || document.body;
    for (let i = 0; i < 2; i++) {
      active.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', bubbles: true }));
      active.dispatchEvent(new KeyboardEvent('keyup', { key: 'Tab', code: 'Tab', bubbles: true }));
    }
  }

  // ------------------------------------------------------------------
  // GDS TERMINAL — "paste a flight list, get it built on the terminal"
  //
  // Own, duplicated copy of the *IA/VI* build engine (buildIALine,
  // buildVILines, buildBoth, equipCode, lookupDistance, etc.) — the
  // "real" copy lives in Part 1, but Part 1 deliberately bails out
  // immediately on any page outside its own flight-search-site list
  // (see the early-exit guard at the top of this file), which includes
  // this CRM's own domain. So Part 1's copy never gets defined here to
  // share. Duplicating just this output-building slice (not the whole
  // file) keeps that early-exit optimization intact while still giving
  // this half everything it needs to build full GDS output on its own.
  // Reuses MONTH_MAP, AIRPORT_LON, estimateUtcOffset, inferYear, and
  // getReferenceNow already declared above for Sort Me — no need to
  // duplicate those too.
  // ------------------------------------------------------------------
  const CONFIG = {
    STATUS_CODE: "GK", ETKT_SUFFIX: "/E", SM_FLAG: "N", DEFAULT_MEAL_CODE: "M",
    DEFAULT_BOOKING_BY_CABIN: { y: "Y", w: "W", s: "S", j: "J", b: "D", f: "F" },
    CABIN_NAME: { y: "ECONOMY", w: "PREMIUM ECONOMY", s: "PREMIUM ECONOMY", j: "BUSINESS", b: "BUSINESS", f: "FIRST", e: "ECONOMY", c: "BUSINESS" },
  };

  // Premium economy class letter for carriers that don't use W.
  const PREMIUM_CLASS_BY_CARRIER = { PR: 'N' };
  function bookingClass(leg) {
    if (leg.bookingCode) return leg.bookingCode;
    if (leg.cabin === 'w' && leg.airline && PREMIUM_CLASS_BY_CARRIER[leg.airline.code]) return PREMIUM_CLASS_BY_CARRIER[leg.airline.code];
    return CONFIG.DEFAULT_BOOKING_BY_CABIN[leg.cabin] || 'Y';
  }

  function buildIALine(leg, idx, pax) {
    const depD = parseLocal(leg.departure);
    const arrD = parseLocal(leg.arrival);
    const num = String(idx + 1).padStart(2, ' ');
    const carrierFlight = leg.airline.code + String(leg.operatingFlightNumber || leg.flightNumber).padStart(4, ' ');
    const cls = bookingClass(leg);
    const date = formatDate(depD);
    const dow = dowLetter(depD);
    const route = leg.origin.iata + leg.destination.iata;
    const status = `${CONFIG.STATUS_CODE}${pax}`;
    const dep = formatTime(depD).padStart(5, ' ');
    const arr = formatTime(arrD).padStart(5, ' ');

    let rolloverSuffix = '';
    if (!sameCalendarDate(depD, arrD)) {
      rolloverSuffix = `  ${formatDate(arrD)} ${dowLetter(arrD)}`;
    }

    return `${num} ${carrierFlight}${cls} ${date} ${dow} ${route} ${status}  ${dep} ${arr}${rolloverSuffix} ${CONFIG.ETKT_SUFFIX}`;
  }

  function buildVILines(leg, idx) {
    const depD = parseLocal(leg.departure);
    const arrD = parseLocal(leg.arrival);
    const num = String(idx + 1).padStart(2, ' ');

    // A codeshare (operating carrier differs from the marketing carrier
    // shown) is marked by replacing the flight-number field's leading pad
    // space with "*" — e.g. "TP*8559" instead of "TP 8559" — with a
    // "*ORIGIN-DEST OPERATED BY <airline>" line underneath. Only rendered
    // when an adapter actually supplies operatingCarrierCode; none do yet,
    // since none of the sites expose it per-segment in a verified way.
    const flightNumStr = String(leg.operatingFlightNumber || leg.flightNumber);
    const isCodeshare = leg.operatingCarrierCode && leg.operatingCarrierCode !== leg.airline.code;
    const carrierFlight = isCodeshare
      ? leg.airline.code + '*' + flightNumStr.padStart(4, ' ')
      : leg.airline.code + flightNumStr.padStart(5, ' ');

    const date = formatDate(depD);
    const segment = `${leg.origin.iata} ${leg.destination.iata}`;
    const dep = formatTime(depD).padStart(5, ' ');
    const arr = formatTime(arrD).padStart(5, ' ');
    const dayDiff = daysBetween(depD, arrD);
    // Positive dayDiff (arrival lands a day+ later) shows "¥N"; negative
    // (arrival lands a day EARLIER — routes crossing the date line
    // westbound, e.g. Taipei to San Francisco, commonly do this) shows
    // "-N". Same 3-character field width either way.
    let rolloverField;
    if (dayDiff > 0) rolloverField = `\u00a5${dayDiff} `;
    else if (dayDiff < 0) rolloverField = `${dayDiff} `;
    else rolloverField = '   ';
    const meal = leg.mealCode || CONFIG.DEFAULT_MEAL_CODE;
    const eqp = equipCode(leg).padStart(3, ' ');
    const elp = elapsed(leg.duration);
    const distance = leg.distance != null ? leg.distance : lookupDistance(leg.origin.iata, leg.destination.iata);
    const miles = distance != null ? String(distance).padStart(4, ' ') : '    ';

    const row = `${num} ${carrierFlight} ${date} ${segment} ${dep} ${arr}${rolloverField}${meal}    ${eqp}  ${elp}  ${miles}  ${CONFIG.SM_FLAG}`;

    const extraLines = [];
    const termParts = [];
    if (leg.departureTerminal) termParts.push(`DEP-TERMINAL ${leg.departureTerminal}`);
    if (leg.arrivalTerminal) termParts.push(`ARR-TERMINAL ${leg.arrivalTerminal}`);
    if (termParts.length) extraLines.push(termParts.join('                 '));

    if (isCodeshare) {
      extraLines.push(`*${leg.origin.iata}-${leg.destination.iata} OPERATED BY ${(leg.operatingCarrierName || leg.operatingCarrierCode).toUpperCase()}`);
    }

    const alliance = ALLIANCE_MAP[leg.airline.code];
    if (alliance) extraLines.push(alliance);

    const cabinName = CONFIG.CABIN_NAME[(leg.cabin || '').toLowerCase()] || (leg.cabin || '').toUpperCase();
    if (cabinName) extraLines.push(`CABIN-${cabinName}`);

    return [row, ...extraLines];
  }

  function buildBoth(itinerary) {
    const pax = itinerary.pax || 1;
    const allLegs = itinerary.flights.flatMap((f) => f.legs);
    const iaText = allLegs.map((leg, i) => buildIALine(leg, i, pax)).join('\n');
    const viText = [VI_HEADER, ...allLegs.flatMap((leg, i) => buildVILines(leg, i))].join('\n');
    return `*IA\n${iaText}\n\nVI*\n${viText}`;
  }

  // ------------------------------------------------------------------
  // Flight-list format parser — e.g.:
  //   1   DL*5262   D 21SEP   MCI JFK   1219P 425P
  //   2   DL 246    D 21SEP   JFK KEF   1155P 930A¥1
  // Works on flattened single-line text just as well as real multi-line
  // text — a plain <input> strips real newlines on paste, and this
  // scans for the repeating row pattern directly rather than splitting
  // on line breaks, so it doesn't care either way.
  //
  // The "*" between carrier and flight number (vs a plain space) is
  // parsed but NOT treated as a codeshare/operated-by signal — the list
  // gives no actual operating-carrier data, and fabricating an
  // "OPERATED BY" line from a guess would be worse than leaving it out.
  //
  // No duration is given, so it's computed from the AIRPORT_LON-based
  // UTC offset estimate already used by Sort Me's own sorting (see
  // above) — leg.departure/leg.arrival themselves stay as naive local
  // wall-clock Date objects for correct display (buildIALine reads
  // getHours()/getMinutes() straight off them), only the separately
  // computed `duration` number needs the timezone awareness.
  //
  // The class letter (single letter like "D") is mapped to a cabin
  // using common industry convention (F/A/P=first, J/C/D/I/Z/R=business,
  // W/E=premium economy, everything else=economy) — this isn't
  // universal across every carrier, just a reasonable default.
  // ------------------------------------------------------------------
  const CLASS_LETTER_TO_CABIN = {
    F: 'f', A: 'f', P: 'f',
    J: 'j', C: 'j', D: 'j', I: 'j', Z: 'j', R: 'j',
    W: 'w', E: 'w',
    Y: 'y', B: 'y', H: 'y', K: 'y', L: 'y', M: 'y', N: 'y', Q: 'y', S: 'y', T: 'y', U: 'y', V: 'y', X: 'y', G: 'y', O: 'y',
  };

  const FLIGHT_LIST_ROW_RE = /(\d+)\s+([A-Z0-9]{2})(\*|\s+)(\d{1,4})\s+([A-Z])\s+(\d{2}[A-Z]{3})\s+([A-Z]{3})\s+([A-Z]{3})\s+(\d{3,4}[AP])\s+(\d{3,4}[AP])(\u00a5\d+|-\d+)?/g;

  function looksLikeFlightList(text) {
    FLIGHT_LIST_ROW_RE.lastIndex = 0;
    return FLIGHT_LIST_ROW_RE.test(text);
  }

  function parseFlightListFormat(text, referenceNow) {
    const rows = [];
    let m;
    FLIGHT_LIST_ROW_RE.lastIndex = 0;
    while ((m = FLIGHT_LIST_ROW_RE.exec(text))) {
      const [, , carrier, , flightNum, classLetter, ddmon, origin, dest, depTok, arrTok, rollover] = m;
      const dm = ddmon.match(/^(\d{2})([A-Z]{3})$/);
      const day = parseInt(dm[1], 10);
      const month = MONTH_MAP[dm[2]];
      if (month === undefined) continue;
      const year = inferYear(month, day, referenceNow);

      const dep = parseSabreTime(depTok);
      const departure = new Date(year, month, day, dep.hh, dep.mm, 0, 0);

      const arr = parseSabreTime(arrTok);
      let arrDayOffset = 0;
      if (rollover) {
        const n = parseInt(rollover.slice(1), 10);
        arrDayOffset = rollover[0] === '\u00a5' ? n : -n;
      }
      const arrival = new Date(year, month, day + arrDayOffset, arr.hh, arr.mm, 0, 0);

      const depOffset = estimateUtcOffset(origin);
      const arrOffset = estimateUtcOffset(dest);
      const depUtcMs = Date.UTC(year, month, day, dep.hh - depOffset, dep.mm);
      const arrUtcMs = Date.UTC(year, month, day + arrDayOffset, arr.hh - arrOffset, arr.mm);
      const duration = Math.round((arrUtcMs - depUtcMs) / 60000);

      rows.push({
        airline: { code: carrier },
        flightNumber: flightNum,
        cabin: CLASS_LETTER_TO_CABIN[classLetter.toUpperCase()] || 'y',
        aircraft: '',
        origin: { iata: origin },
        destination: { iata: dest },
        departure,
        arrival,
        duration,
      });
    }
    return rows;
  }

  // ------------------------------------------------------------------
  // Terminal wiring — intercepts Enter on the "TYPE COMMAND HERE" input
  // in the capture phase, BEFORE the real terminal's own handler gets
  // the event, but only when the typed/pasted text actually matches the
  // flight-list format above. Anything else falls through untouched and
  // goes to the real GDS backend as normal — this only ever intercepts
  // the one specific pattern it knows how to build itself.
  // ------------------------------------------------------------------
  function injectTerminalResponse(container, commandText, responseText) {
    const outputDiv = document.createElement('div');
    outputDiv.className = 'terminal__output';
    outputDiv.style.width = '100%';
    outputDiv.style.marginTop = '0px';

    const pre = document.createElement('pre');

    const cmdSpan = document.createElement('span');
    cmdSpan.className = 'terminal-delta__command-input';
    cmdSpan.textContent = '\u276F ' + commandText + '\n';

    const respSpan = document.createElement('span');
    respSpan.textContent = responseText + '\n';

    pre.appendChild(cmdSpan);
    pre.appendChild(respSpan);
    outputDiv.appendChild(pre);
    container.appendChild(outputDiv);
    container.scrollTop = container.scrollHeight;
  }

  function wireTerminal() {
    const input = document.querySelector('input.input-field__input[placeholder="TYPE COMMAND HERE"]');
    const terminal = document.querySelector('.terminal__viewport__scrollable');
    if (!input || !terminal || input.dataset.gdsTerminalWired) return;
    input.dataset.gdsTerminalWired = '1';

    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const text = input.value;
      if (!looksLikeFlightList(text)) return; // not our format — let the real GDS handle it

      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();

      const legs = parseFlightListFormat(text, getReferenceNow());
      const responseText = legs.length
        ? buildBoth({ flights: [{ legs }], pax: 1 })
        : 'No flights available';
      injectTerminalResponse(terminal, text, responseText);

      setNativeValue(input, '');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }, true); // capture phase — must run before the real handler
  }

  // ------------------------------------------------------------------
  // Modal wiring — runs once per modal instance (Vue tears down and
  // recreates this markup each time the modal opens, so re-detecting on
  // every appearance is intentional, not a bug).
  // ------------------------------------------------------------------
  function wireModal(modalRoot) {
    if (modalRoot.dataset.sortMeWired) return;
    modalRoot.dataset.sortMeWired = '1';

    const footer = modalRoot.querySelector('.app-modal__footer');
    const textarea = modalRoot.querySelector('textarea.font-robotoMono');
    if (!footer || !textarea) return;

    // --- "Sort Me" button, far left, same visual theme as Cancel/Next ---
    footer.style.display = 'flex';
    footer.style.justifyContent = 'space-between';
    footer.style.alignItems = 'center';

    const sortBtn = document.createElement('button');
    sortBtn.type = 'button';
    sortBtn.className = 'btn min-w-20 px-4 btn-sm btn-outline-secondary';
    sortBtn.textContent = 'Sort Me';

    // Sort Me, plus (optionally) the passenger-count steppers, travel
    // together as one group so the steppers land immediately to Sort
    // Me's right regardless of whatever else footer.insertBefore puts
    // ahead of them.
    const sortGroup = document.createElement('div');
    sortGroup.style.cssText = 'display:flex;align-items:center;gap:6px;';
    sortGroup.appendChild(sortBtn);

    // --- Passenger-count +/- steppers, experts pages only. Bumps the
    // trailing digit on every SS/GK status code in the segments box by
    // one passenger per click (SS1 -> SS2 -> SS3 ..., same for GK),
    // clamped to a 1-9 range (a GDS PNR can't carry a 0 or 10+ pax
    // segment). Reads/writes the textarea directly rather than going
    // through parseRawSegments/buildMerged, since this only ever needs
    // to touch one status-code digit, never re-derive or reorder
    // anything else already in the box.
    // ------------------------------------------------------------------
    if (location.pathname.includes('/experts/')) {
      function currentPaxCount(text) {
        const m = text.match(/\b(?:SS|GK)(\d+)\b/);
        return m ? parseInt(m[1], 10) : 1;
      }
      function withPaxCount(text, count) {
        return text.replace(/\b(SS|GK)\d+\b/g, (_, prefix) => `${prefix}${count}`);
      }
      function bumpPax(delta) {
        const ta = modalRoot.querySelector('textarea.font-robotoMono');
        if (!ta) return;
        const current = currentPaxCount(ta.value);
        const next = Math.max(1, Math.min(9, current + delta));
        if (next === current) return;
        setNativeValue(ta, withPaxCount(ta.value, next));
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        ta.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const plusBtn = document.createElement('button');
      plusBtn.type = 'button';
      plusBtn.className = 'btn min-w-8 px-3 btn-sm btn-outline-secondary';
      plusBtn.textContent = '+';
      plusBtn.title = 'Add a passenger (SS/GK +1)';
      plusBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); bumpPax(1); });

      const minusBtn = document.createElement('button');
      minusBtn.type = 'button';
      minusBtn.className = 'btn min-w-8 px-3 btn-sm btn-outline-secondary';
      minusBtn.textContent = '\u2212';
      minusBtn.title = 'Remove a passenger (SS/GK -1)';
      minusBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); bumpPax(-1); });

      sortGroup.appendChild(plusBtn);
      sortGroup.appendChild(minusBtn);
    }

    footer.insertBefore(sortGroup, footer.firstChild);

    // --- Auto-next checkbox, below the Next button ---
    const autoNextRow = document.createElement('div');
    autoNextRow.style.cssText = 'display:flex;justify-content:flex-end;margin-top:6px;width:100%;';
    autoNextRow.innerHTML = `
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
        <input type="checkbox" class="gds-auto-next-checkbox">
        Auto-next
      </label>
    `;
    footer.appendChild(autoNextRow);
    footer.style.flexWrap = 'wrap';
    const autoNextCheckbox = autoNextRow.querySelector('.gds-auto-next-checkbox');
    autoNextCheckbox.checked = localStorage.getItem(AUTO_NEXT_STORAGE_KEY) === '1';
    autoNextCheckbox.addEventListener('change', () => {
      localStorage.setItem(AUTO_NEXT_STORAGE_KEY, autoNextCheckbox.checked ? '1' : '0');
    });

    // Edit/Duplicate skips straight past the raw-text step (there's
    // nothing to paste when the segments already exist) to a structured
    // view instead — each leg as its own read-only row, not one
    // editable block of text. `textarea` above was only ever real for
    // whatever step existed at the moment this modal was first wired;
    // if the site has since moved past it, that reference is now
    // pointing at a detached piece of the page, and querying fresh from
    // modalRoot would come back empty too, since this step genuinely
    // has no textarea. Getting back uses the site's own "Edit PQ" (one
    // step in) and "Back" (two steps in) buttons — controls it already
    // provides for exactly this — rather than doing anything to the
    // auto-advance itself, which stays untouched either way.
    async function findTextareaOrNavigateBack() {
      let ta = modalRoot.querySelector('textarea.font-robotoMono');
      if (ta) return ta;
      for (let attempt = 0; attempt < 6; attempt++) {
        const buttons = Array.from(modalRoot.querySelectorAll('.app-modal__footer button'));
        const editPq = buttons.find((b) => b.textContent.trim() === 'Edit PQ');
        const back = buttons.find((b) => b.textContent.trim() === 'Back');
        if (editPq) editPq.click();
        else if (back) back.click();
        else break; // no known way back from wherever this is
        await wait(400);
        ta = modalRoot.querySelector('textarea.font-robotoMono');
        if (ta) return ta;
      }
      return null;
    }

    sortBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const ta = await findTextareaOrNavigateBack();
      if (!ta) {
        flashButtonLabel(sortBtn, 'Could not find segments box', 'Sort Me');
        return;
      }
      const legs = parseRawSegments(ta.value);
      if (!legs.length) {
        flashButtonLabel(sortBtn, 'No segments found', 'Sort Me');
        return;
      }
      const merged = buildMerged(legs);
      setNativeValue(ta, merged);
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      ta.dispatchEvent(new Event('change', { bubbles: true }));

      const carrier = detectCarrier(legs);
      await selectCarrier(modalRoot, carrier);
      autoCarrierFired = true;

      flashButtonLabel(sortBtn, '\u2713 Sorted!', 'Sort Me');
      if (autoNextCheckbox && autoNextCheckbox.checked) {
        await maybeAutoNext(modalRoot, autoNextCheckbox, legs);
      } else {
        await returnFocusToSegmentsBox(modalRoot);
      }
    });

    // --- Auto-detect carrier once, the first time segments actually
    // appear in the box (paste or type), then leave the field alone —
    // this closure's own `autoCarrierFired` flag is fresh every time
    // wireModal runs, and wireModal only runs once per modal DOM
    // instance (guarded by dataset.sortMeWired above), so closing and
    // reopening the modal naturally re-arms this for one more fire.
    //
    // Auto-next runs from here too now, at explicit request — fire the
    // moment valid legs appear, without waiting for Sort Me to be
    // clicked. Worth being clear about the tradeoff this brings back:
    // for a modal opened to edit or duplicate an option, the box
    // already has valid legs the instant it opens, before anything new
    // is added, so if content gets pasted in more than one piece rather
    // than all at once, this can fire (and click Next) using whatever's
    // in the field at that moment — including content someone was still
    // in the middle of adding. That's the previous, deliberate reason
    // this was kept off here; it's back on because it was asked for
    // specifically, not because that risk stopped applying.
    let debounceTimer = null;
    let autoCarrierFired = false;
    const initialTextareaValue = textarea.value;
    textarea.addEventListener('input', () => {
      if (autoCarrierFired || sendJobActive) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        // Also don't fire off of content that was already there when
        // the modal opened — only once it's genuinely been added to or
        // changed, so pre-filled content on an edit/duplicate open
        // can't masquerade as "the user just finished pasting."
        if (textarea.value === initialTextareaValue) return;
        const legs = parseRawSegments(textarea.value);
        if (!legs.length) return; // wait for real content before consuming the one-shot
        autoCarrierFired = true;
        const carrier = detectCarrier(legs);
        if (carrier) await selectCarrier(modalRoot, carrier);
        // Selecting the carrier moves focus onto that dropdown, leaving
        // the segments box with no cursor in it — fine if auto-next is
        // about to move past this step anyway, but if it's off, the
        // person is very likely about to paste more flights right after
        // this one, and having to click back into the box each time
        // defeats the point of pasting them "next to each other."
        // Sending focus back to the end of the existing text (not just
        // focusing it) means the next paste lands appended, not
        // dropped wherever the cursor happened to default to.
        if (!autoNextCheckbox.checked) {
          // Two newlines, same as pressing Enter twice by hand — leaves
          // a full blank line between this flight and whatever gets
          // pasted next, so the two stay visibly separated in the box
          // rather than running straight into each other. Dispatching
          // input/change here re-enters this same listener, but
          // autoCarrierFired is already true by this point, so that
          // re-entrant call just hits the early return above and does
          // nothing — same guard, doing its job a second time.
          const newValue = textarea.value + '\n\n';
          setNativeValue(textarea, newValue);
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true }));
          textarea.focus();
          const end = newValue.length;
          textarea.setSelectionRange(end, end);
        }
        await maybeAutoNext(modalRoot, autoNextCheckbox, legs);
      }, 500);
    });
  }

  // ------------------------------------------------------------------
  // Miles / Taxes +1 / -1 steppers — pricing screen (Published/Private/
  // CK/Award tour-fare form). +1 and -1 don't add or subtract a fixed
  // step; they add or remove one PASSENGER's worth of the figure
  // originally entered. So the field's own current value isn't enough
  // state on its own — what's tracked is the per-passenger base value
  // (whatever was in the box the first time a stepper was used, or
  // right after the person last typed something new by hand) and a
  // passenger count starting at 1, and each press recomputes
  // base × count from scratch rather than nudging the displayed number
  // directly. That's what makes -1 land exactly back on a value +1 had
  // already produced, instead of drifting from rounding.
  //
  // Typing a new number directly into the field resets that base to
  // whatever was just typed (and count back to 1) — otherwise editing
  // the field by hand while a stepper still remembered an older base
  // would make the next +1/-1 jump to a stale, unrelated number.
  // ------------------------------------------------------------------
  function wireStepper(input) {
    if (!input || input.dataset.stepperWired) return;
    input.dataset.stepperWired = '1';

    const wrapper = input.closest('.relative');
    const row = input.closest('.flex.items-center');
    if (!wrapper || !row) return;

    let baseValue = null;
    let count = 1;
    let programmaticChange = false;

    function currentNumericValue() {
      const n = parseFloat(String(input.value).replace(/,/g, ''));
      return Number.isNaN(n) ? null : n;
    }

    function ensureBase() {
      if (baseValue === null) {
        const v = currentNumericValue();
        if (v === null) return false;
        baseValue = v;
        count = 1;
      }
      return true;
    }

    function applyCount() {
      programmaticChange = true;
      const next = baseValue * count;
      const rounded = Math.round(next * 100) / 100; // keep taxes' cents clean without float drift
      setNativeValue(input, String(rounded));
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      programmaticChange = false;
    }

    input.addEventListener('input', () => {
      if (programmaticChange) return;
      baseValue = null;
      count = 1;
    });

    const minusBtn = document.createElement('button');
    minusBtn.type = 'button';
    minusBtn.className = 'gds-stepper-btn';
    minusBtn.textContent = '\u2212';
    minusBtn.title = 'Remove one passenger';
    minusBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!ensureBase()) return;
      if (count > 1) count -= 1;
      applyCount();
    });

    const plusBtn = document.createElement('button');
    plusBtn.type = 'button';
    plusBtn.className = 'gds-stepper-btn';
    plusBtn.textContent = '+';
    plusBtn.title = 'Add one passenger';
    plusBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!ensureBase()) return;
      count += 1;
      applyCount();
    });

    const stepperStyle = (btn) => {
      btn.style.cssText = `
        width: 26px; height: 26px; flex: none; border-radius: 6px;
        border: 1px solid #475569; background: #1e293b; color: #e2e8f0;
        font-size: 14px; font-weight: 600; line-height: 1; cursor: pointer;
        display: inline-flex; align-items: center; justify-content: center;
        padding: 0; transition: background 0.15s, border-color 0.15s;
      `;
      btn.addEventListener('mouseenter', () => { btn.style.background = '#334155'; btn.style.borderColor = '#64748b'; });
      btn.addEventListener('mouseleave', () => { btn.style.background = '#1e293b'; btn.style.borderColor = '#475569'; });
    };
    stepperStyle(minusBtn);
    stepperStyle(plusBtn);

    row.insertBefore(minusBtn, wrapper);
    row.insertBefore(plusBtn, wrapper.nextSibling);
  }

  function wireMilesTaxesSteppers() {
    document.querySelectorAll('.form-label').forEach((label) => {
      const text = label.textContent.trim().replace(/\*$/, '').trim().toUpperCase();
      if (text !== 'MILES' && text !== 'TAXES') return;
      const wrapper = label.closest('.relative');
      const input = wrapper ? wrapper.querySelector('input') : null;
      if (input) wireStepper(input);
    });
  }

  // The Miles/Taxes rows above are now wider than before — each has a
  // stepper button sitting to the left of its input, pushing that input
  // further right than it used to be. Mile Program's row never got that
  // treatment, so it stayed put and now reads as no longer lined up
  // with the two boxes above it. Rather than guess the pixel offset a
  // button-plus-gap actually produces (that depends on this page's own
  // CSS, which isn't something to assume from outside it), measure how
  // far an already-wired Miles/Taxes input actually sits from its own
  // row's left edge, and match that same offset exactly.
  function wireMileProgramAlignment() {
    document.querySelectorAll('.form-label').forEach((label) => {
      const text = label.textContent.trim().replace(/\*$/, '').trim().toUpperCase();
      if (text !== 'MILE PROGRAM') return;
      const row = label.closest('.flex.items-center');
      if (!row || row.dataset.mileProgramAligned) return;

      const referenceInput = document.querySelector('input[data-stepper-wired]');
      if (!referenceInput) return; // steppers not wired yet — try again next scan
      const referenceRow = referenceInput.closest('.flex.items-center');
      if (!referenceRow) return;

      const offset = referenceInput.getBoundingClientRect().left - referenceRow.getBoundingClientRect().left;
      row.dataset.mileProgramAligned = '1';
      row.style.paddingLeft = offset + 'px';
    });
  }


  // ==================================================================
  // "Send to lead" worker — runs in the background BO tab that the Pip
  // popover on a flight site opens (URL carries ?jsjob=<id>). It reads
  // the lead, reports it back for the route check, then fills the BO's
  // own Add Option form (so the BO itself builds the segments) and saves.
  // ==================================================================
  let sendJobActive = false;
  const OPTION_FLAGS_KEY = 'js-option-flags';

  function jobStatus(jobId, obj) {
    try { GM_setValue('js-sendjob-status-' + jobId, JSON.stringify(Object.assign({ t: Date.now() }, obj))); } catch (e) { /* ignore */ }
  }

  // Resolves the moment fn() is truthy: re-checked on every DOM change
  // (no waiting for the next poll) plus a fast-timer poll as a backstop.
  function waitFor(fn, timeoutMs, stepMs) {
    return new Promise((resolve) => {
      let done = false;
      let mo = null;
      const finish = (v) => { if (done) return; done = true; if (mo) mo.disconnect(); resolve(v); };
      const check = () => { if (done) return; let v = null; try { v = fn(); } catch (e) { v = null; } if (v) finish(v); };
      check();
      if (done) return;
      try {
        mo = new MutationObserver(check);
        mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, characterData: true });
      } catch (e) { mo = null; }
      const end = Date.now() + (timeoutMs || 10000);
      const step = Math.min(stepMs || 250, 200);
      const tick = () => { if (done) return; check(); if (done) return; if (Date.now() >= end) finish(null); else setTimeout(tick, step); };
      setTimeout(tick, step);
    });
  }

  // Waits for a GM value (set from another tab) without polling.
  function waitForGM(key, timeoutMs) {
    return new Promise((resolve) => {
      const read = () => { try { return JSON.parse(GM_getValue(key, 'null')); } catch (e) { return null; } };
      const now = read();
      if (now) { resolve(now); return; }
      let done = false;
      let lid = null;
      const fin = (x) => {
        if (done) return;
        done = true;
        try { if (lid != null && typeof GM_removeValueChangeListener === 'function') GM_removeValueChangeListener(lid); } catch (e) { /* ignore */ }
        resolve(x);
      };
      lid = GM_addValueChangeListener(key, () => { const x = read(); if (x) fin(x); });
      setTimeout(() => fin(read()), timeoutMs);
    });
  }

  // Switch the worker frame to another lead WITHOUT reloading the BO:
  // tell the BO's own router to go there.
  function routeToLead(leadId) {
    const path = '/leads/' + leadId;
    if (location.pathname === path) return;
    try {
      const W = unsafeWindow;
      const rootEl = W.document.querySelector('[data-v-app]') || W.document.querySelector('#app');
      const app = rootEl && rootEl.__vue_app__;
      const router = (app && app.config && app.config.globalProperties.$router) || (rootEl && rootEl.__vue__ && rootEl.__vue__.$router);
      if (router) { router.push(path); return; }
    } catch (e) { /* fall through */ }
    history.pushState(history.state, '', path);
    window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
  }

  function readLeadCard(leadId) {
    const tag = Array.from(document.querySelectorAll('span')).find((sp) => sp.textContent.trim() === '#' + leadId);
    if (!tag) return null;
    let root = tag;
    for (let i = 0; i < 12 && root; i++) {
      root = root.parentElement;
      if (root && root.querySelectorAll('.text-base.leading-6.font-semibold').length >= 2) break;
    }
    if (!root) return null;
    const codes = Array.from(root.querySelectorAll('.text-base.leading-6.font-semibold')).map((e) => e.textContent.trim());
    const nameEl = root.querySelector('span.truncate');
    let pax = { adults: 1, children: 0, infants: 0 };
    for (const box of root.querySelectorAll('div.flex.items-center')) {
      const spans = Array.from(box.querySelectorAll(':scope > span'));
      if (spans.length === 3 && spans.every((sp) => /^\d+$/.test(sp.textContent.trim())) && box.querySelectorAll(':scope > svg').length >= 3) {
        const [a, c, i] = spans.map((sp) => parseInt(sp.textContent.trim(), 10));
        pax = { adults: a, children: c, infants: i };
        break;
      }
    }
    return { from: codes[0] || '', to: codes[codes.length - 1] || '', client: nameEl ? nameEl.textContent.trim() : '', pax };
  }

  function existingOptionIds() {
    return new Set(Array.from(document.querySelectorAll('input[id^="checkbox-switch-"]')).map((i) => i.id.replace('checkbox-switch-', '')));
  }

  function setField(input, value) {
    softFocus(input);
    setNativeValue(input, String(value));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  function inputByLabel(scope, labelText) {
    const want = labelText.toUpperCase();
    const label = Array.from(scope.querySelectorAll('.form-label')).find((l) => l.textContent.replace(/\*/g, '').trim().toUpperCase() === want);
    const box = label && label.closest('.relative');
    return box ? box.querySelector('input.form-control') : null;
  }

  async function selectMileProgram(modal, code) {
    const label = Array.from(modal.querySelectorAll('.form-label')).find((l) => /mile program/i.test(l.textContent));
    const wrapper = label && label.closest('.relative') && label.closest('.relative').querySelector('.form-multiselect');
    if (!wrapper) return false;
    const input = wrapper.querySelector('.form-multiselect-search');
    if (input) { softFocus(input); input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); input.click(); }
    const li = await waitFor(() => findMultiselectOption(wrapper, code), 3000, 100);
    if (!li) return false;
    li.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    li.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    li.click();
    return true;
  }

  // Net column by position on screen: the input under the "Net" header,
  // on the same line as the ADT / CHD / INF label. Works whatever the
  // BO's markup is (single ticket or each ticket of Multiple Tkt).
  function fillCashNetByLayout(scope, fill, yMin, yMax) {
    const vis0 = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 ? r : null; };
    // Optional band: only things between yMin and yMax (one ticket's area).
    const vis = (el) => { const r = vis0(el); return r && (yMin == null || r.top >= yMin) && (yMax == null || r.top < yMax) ? r : null; };
    const netLabel = Array.from(scope.querySelectorAll('label, .form-label, div, span'))
      .find((l) => l.children.length === 0 && /^net\*?$/i.test(l.textContent.trim()) && vis(l));
    if (!netLabel) return false;
    const nr = vis(netLabel);
    const nx = nr.left + nr.width / 2;
    const inputs = Array.from(scope.querySelectorAll('input')).filter((i) => i.type !== 'checkbox' && i.type !== 'radio' && vis(i));
    let filled = 0;
    ['ADT', 'CHD', 'INF'].forEach((type) => {
      if (fill[type] == null) return;
      const lab = Array.from(scope.querySelectorAll('*')).find((e) => e.children.length === 0 && e.textContent.trim().toUpperCase() === type && vis(e) && vis(e).top > nr.top);
      if (!lab) return;
      const lr = vis(lab);
      const ly = lr.top + lr.height / 2;
      const inp = inputs.find((i) => { const r = vis(i); return Math.abs(r.top + r.height / 2 - ly) < 14 && r.left - 6 <= nx && r.right + 6 >= nx; });
      if (inp) { setField(inp, fill[type]); filled++; }
    });
    return filled > 0;
  }

  function fillCashNet(modal, fill) {
    try { if (fillCashNetByLayout(modal, fill)) return true; } catch (e) { /* fall back to markup */ }
    const netLabel = Array.from(modal.querySelectorAll('label.form-label')).find((l) => /^net\b/i.test(l.textContent.trim()));
    if (!netLabel) return false;
    const headerRow = netLabel.closest('.flex');
    const headerLabels = Array.from(headerRow.querySelectorAll('label.form-label'));
    const idx = headerLabels.indexOf(netLabel);
    let filled = 0;
    modal.querySelectorAll('div.flex.items-start').forEach((row) => {
      const first = row.firstElementChild;
      const type = first ? first.textContent.trim().toUpperCase() : '';
      if (!['ADT', 'CHD', 'INF'].includes(type) || fill[type] == null) return;
      const inputs = row.querySelectorAll('input.form-control');
      if (inputs[idx]) { setField(inputs[idx], fill[type]); filled++; }
    });
    return filled > 0;
  }

  function saveOptionFlags(optionId, fill) {
    if (!optionId || (!(fill.flags && fill.flags.length) && !fill.rush)) return;
    let all = {};
    try { all = JSON.parse(GM_getValue(OPTION_FLAGS_KEY, '{}')) || {}; } catch (e) { all = {}; }
    all[optionId] = { flags: fill.flags || [], rush: fill.rush || '', at: Date.now() };
    // keep the store small: drop entries older than 30 days
    const cutoff = Date.now() - 30 * 864e5;
    Object.keys(all).forEach((k) => { if (all[k].at < cutoff) delete all[k]; });
    try { GM_setValue(OPTION_FLAGS_KEY, JSON.stringify(all)); } catch (e) { /* ignore */ }
  }

  // The block of the price step that belongs to one ticket (Multiple Tkt):
  // the largest container around its Award button holding no other one.
  function ticketBlock(modal, awardBtn) {
    const count = (el) => Array.from(el.querySelectorAll('button')).filter((b) => b.textContent.trim() === 'Award').length;
    let b = awardBtn;
    while (b.parentElement && b.parentElement !== modal && count(b.parentElement) === 1) b = b.parentElement;
    return b;
  }

  // Segment step: every segment under "Inbound" gets ticket number `n`.
  function inboundSelects(modal) {
    const heads = Array.from(modal.querySelectorAll('h3'));
    const inH = heads.find((h) => /^\s*inbound\s*$/i.test(h.textContent));
    if (!inH) return [];
    const nextH = heads.slice(heads.indexOf(inH) + 1)[0] || null;
    return Array.from(modal.querySelectorAll('.input-select__value')).filter((el) =>
      (inH.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)
      && (!nextH || (nextH.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING)));
  }
  const selectTitle = (el) => ((el.querySelector('.input-select__value__text__title') || el).textContent || '').trim();

  // The BO's ticket-number dropdown: .dropdown.input-select; opening it
  // fills .dropdown__content with .input-select__option rows whose title
  // is "1", "1 Upgrade", "1 ELR", … "2", … — we want the plain number.
  async function chooseInputSelect(valueEl, text) {
    if (selectTitle(valueEl) === text) return true;
    const box = valueEl.closest('.input-select') || valueEl.parentElement;
    const titleOf = (o) => ((o.querySelector('.input-select__option__text__title') || o).textContent || '').trim();
    const findOpt = () => Array.from(box.querySelectorAll('.input-select__option')).find((o) => titleOf(o) === text) || null;
    const press = (el) => ['pointerdown', 'mousedown', 'pointerup', 'mouseup'].forEach((t) => el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true })));
    const openWays = [
      (el) => el.click(),
      (el) => press(el),
      (el) => { press(el); el.click(); },
      (el) => { softFocus(el); el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true })); },
    ];
    const open = async () => {
      if (findOpt()) return findOpt();
      for (const way of openWays) {
        way(valueEl);
        const o = await waitFor(findOpt, 600, 40);
        if (o) return o;
      }
      return null;
    };
    const pickWays = [
      (o) => o.click(),
      (o) => { press(o); o.click(); },
      (o) => { const r = o.closest('[role="option"]') || o; press(r); r.click(); },
    ];
    const done = () => (!valueEl.isConnected || selectTitle(valueEl) === text ? true : null);
    for (const pick of pickWays) {
      const opt = await open();
      if (!opt) return false;
      pick(opt);
      if (await waitFor(done, 700, 40)) return true;
    }
    return !!done();
  }

  async function setInboundTicket(modal, text) {
    const count = inboundSelects(modal).length;
    if (!count) return false;
    for (let i = 0; i < count; i++) {
      const el = inboundSelects(modal)[i]; // fresh each time (Vue may re-render)
      if (!el) return false;
      await chooseInputSelect(el, text);
      await wait(120);
    }
    return inboundSelects(modal).every((el) => selectTitle(el) === text);
  }

  async function runSendJob(jobId, opts) {
    opts = opts || {};
    let job;
    try { job = JSON.parse(GM_getValue('js-sendjob-' + jobId, 'null')); } catch (e) { job = null; }
    if (!job) return;
    const closeTab = (ms) => { if (!opts.persistent) setTimeout(() => { if (window.top === window) window.close(); }, ms); };
    const fail = (message) => { sendJobActive = false; jobStatus(jobId, { phase: 'error', message }); closeTab(1500); };
    try {
      if (/login/i.test(location.pathname)) return fail('Log into the BO first, then try again');
      if (opts.persistent && location.pathname !== '/leads/' + job.leadId) {
        routeToLead(job.leadId);
        if (!(await waitFor(() => readLeadCard(job.leadId), 6000, 150))) {
          // The BO didn't switch in place — load the lead properly; the
          // frame picks this same job back up once it's loaded.
          try { sessionStorage.setItem('jsw-resume-' + opts.token, jobId); } catch (e) { /* ignore */ }
          location.href = '/leads/' + job.leadId;
          return;
        }
      }
      const info = await waitFor(() => readLeadCard(job.leadId), 30000, 200);
      if (!info) return fail('Lead ' + job.leadId + ' not found (or BO not logged in)');
      jobStatus(jobId, Object.assign({ phase: 'lead' }, info));

      // Meanwhile, let the lead's option list finish loading, so the new
      // option can be told apart from the ones already there.
      let prevN = -1;
      let stableSince = Date.now();
      const settled = waitFor(() => {
        const n = existingOptionIds().size;
        if (n !== prevN) { prevN = n; stableSince = Date.now(); }
        return Date.now() - stableSince > 500 && document.querySelector('.lead-options-header-cell') ? true : null;
      }, 8000, 100);

      const decision = await waitForGM('js-sendjob-decision-' + jobId, 180000);
      if (!decision || !decision.go) { closeTab(300); return; }
      const fill = decision.fill;
      jobStatus(jobId, { phase: 'saving' });
      sendJobActive = true;
      await settled;

      const before = existingOptionIds();
      const headerCell = await waitFor(() => Array.from(document.querySelectorAll('.lead-options-header-cell')).find((c) => c.querySelector('svg.feather-plus')), 15000);
      const plusBtn = headerCell && headerCell.querySelector('svg.feather-plus').closest('button');
      if (!plusBtn) return fail('Could not find the Add option (+) button');
      plusBtn.click();

      const modal = await waitFor(() => document.querySelector('.app-modal__container--price-quote'), 10000);
      if (!modal) return fail('The Add option form did not open');
      const ta = await waitFor(() => modal.querySelector('textarea.font-robotoMono'), 8000);
      if (!ta) return fail('Segments box not found');
      setField(ta, job.gds);
      await wait(250);
      await selectCarrier(modal, detectCarrier(parseRawSegments(job.gds)));
      await wait(200);
      const split = fill.mode === 'award' && fill.parts && fill.parts.length > 1;
      if (split) {
        // Return on a different program: inbound segments go on ticket 2.
        const n1 = await findNextButtonReady();
        if (!n1) return fail('Next button not found');
        n1.click();
        const inH = await waitFor(() => Array.from(modal.querySelectorAll('h3')).find((h) => /^\s*inbound\s*$/i.test(h.textContent)), 10000);
        if (!inH) return fail('Inbound section not found');
        await wait(200);
        if (!(await setInboundTicket(modal, '2'))) return fail('Could not set the return to ticket 2');
        await wait(250);
        const n2 = await findNextButtonReady();
        if (n2) n2.click();
        await wait(500);
        await selectPcc(modal, AUTO_PCC_CODE);
      } else {
        await clickNextTwice(modal);
      }

      const priceStep = await waitFor(() => Array.from(modal.querySelectorAll('label.form-label')).find((l) => /^net\b/i.test(l.textContent.trim())), 12000);
      if (!priceStep) return fail('Price step did not load');

      if (split) {
        const multi = Array.from(modal.querySelectorAll('button')).find((b) => /^multiple\s*tkt$/i.test(b.textContent.trim()));
        if (!multi) return fail('Multiple Tkt button not found');
        multi.click();
        const awardBtns = await waitFor(() => { const a = Array.from(modal.querySelectorAll('button')).filter((b) => b.textContent.trim() === 'Award'); return a.length >= 2 ? a : null; }, 8000);
        if (!awardBtns) return fail('Second ticket did not appear');
        for (let i = 0; i < 2; i++) {
          const part = fill.parts[i];
          const scope = ticketBlock(modal, awardBtns[i]);
          awardBtns[i].click();
          const milesInput = await waitFor(() => inputByLabel(scope, 'MILES'), 6000);
          const taxesInput = inputByLabel(scope, 'TAXES');
          if (!milesInput || !taxesInput) return fail('Miles/Taxes fields not found on ticket ' + (i + 1));
          setField(milesInput, part.miles);
          setField(taxesInput, part.taxes);
          if (!(await selectMileProgram(scope, part.program))) return fail('Mile program ' + part.program + ' could not be selected on ticket ' + (i + 1));
          await wait(150);
        }
      } else if (fill.mode === 'award') {
        const awardBtn = Array.from(modal.querySelectorAll('button')).find((b) => b.textContent.trim() === 'Award');
        if (!awardBtn) return fail('Award switch not found');
        awardBtn.click();
        const milesInput = await waitFor(() => inputByLabel(modal, 'MILES'), 6000);
        const taxesInput = inputByLabel(modal, 'TAXES');
        if (!milesInput || !taxesInput) return fail('Miles/Taxes fields not found');
        setField(milesInput, fill.miles);
        setField(taxesInput, fill.taxes);
        if (!(await selectMileProgram(modal, fill.program))) return fail('Mile program ' + fill.program + ' could not be selected');
      } else if (!fillCashNet(modal, fill)) {
        return fail('Net price field not found');
      }
      await wait(300);
      let sell = null;
      if (fill.sell) {
        try { sell = await fillModalSell(modal, fill.sell); } catch (e) { sell = { error: (e && e.message) || String(e) }; }
      }

      const saveBtn = await waitFor(() => Array.from(modal.querySelectorAll('button.btn-primary')).find((b) => b.textContent.trim() === 'Save' && !b.disabled), 6000);
      if (!saveBtn) return fail('Save button not available (form not complete?)');
      saveBtn.click();

      // The new option = an option that wasn't there before AND shows
      // exactly the flights just sent (an older option that only finished
      // loading late must never be taken for it).
      const jobSigs = gdsJobSigs(job.gds);
      const newId = await waitFor(() => {
        const fresh = Array.from(existingOptionIds()).filter((id) => !before.has(id));
        if (!jobSigs.length) return fresh.length === 1 ? fresh[0] : null;
        const hits = fresh.filter((id) => { const sg = optionSigsById(id); return sg && sg.join('|') === jobSigs.join('|'); });
        if (hits.length) return hits.map(Number).sort((a, b) => b - a)[0].toString();
        return null;
      }, 30000, 200) || (() => {
        // Flights shown differently than sent: accept only a single new
        // option that is also the newest one on the lead.
        const all = Array.from(existingOptionIds()).map(Number);
        const fresh = all.filter((id) => !before.has(String(id)));
        return fresh.length === 1 && fresh[0] === Math.max(...all) ? String(fresh[0]) : null;
      })();
      sendJobActive = false;
      if (!newId) return fail('Saved, but the new option could not be confirmed \u2014 please check the lead');
      saveOptionFlags(newId, fill);
      saveOptionRaw(newId, job.gds);
      saveOptionCost(newId, fill);
      jobStatus(jobId, { phase: 'done', optionId: newId, sell });
      closeTab(1500);
    } catch (e) {
      fail('Error: ' + (e && e.message ? e.message : e));
    }
  }

  // Sell price for an option just added: what you typed in the Pip pop-up,
  // or else the option's Net (as the lead page shows it) + 10%, rounded up
  // to a price ending in 88-92 (e.g. Net 4,400 -> 4,890). Children get the
  // same as adults when you typed a price, infants get their Net + 10%.
  function roundSell(x, ending) {
    let v = Math.floor(x / 100) * 100 + ending;
    if (v < x) v += 100;
    return v;
  }
  // Fills "Sell price*" in the Add option form, from the form's own Net
  // (per passenger type; with Multiple Tkt, the total is shared out by
  // each ticket's Net). Done before Save, so nothing is changed later.
  async function fillModalSell(modal, spec) {
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 ? r : null; };
    const leaf = (re) => Array.from(modal.querySelectorAll('label, .form-label, div, span')).filter((l) => l.children.length === 0 && re.test(l.textContent.trim()) && vis(l));
    const read = () => {
      const sellLabels = leaf(/^sell price\*?$/i).sort((x, y) => vis(x).top - vis(y).top);
      if (!sellLabels.length) return null;
      const netLabels = leaf(/^net\*?$/i);
      const inputs = Array.from(modal.querySelectorAll('input')).filter((i) => i.type !== 'checkbox' && i.type !== 'radio' && vis(i));
      const blocks = sellLabels.map((sl, i) => {
        const sr = vis(sl);
        const yMax = sellLabels[i + 1] ? vis(sellLabels[i + 1]).top - 2 : Infinity;
        const nl = netLabels.filter((n) => Math.abs(vis(n).top - sr.top) < 12).sort((x, y) => Math.abs(vis(x).left - sr.left) - Math.abs(vis(y).left - sr.left))[0];
        if (!nl) return null;
        const nr = vis(nl);
        const sx = sr.left + sr.width / 2, nx = nr.left + nr.width / 2;
        const rows = {};
        ['ADT', 'CHD', 'INF'].forEach((type) => {
          const lab = Array.from(modal.querySelectorAll('*')).find((e) => e.children.length === 0 && e.textContent.trim().toUpperCase() === type && vis(e) && vis(e).top > sr.top && vis(e).top < yMax);
          if (!lab) return;
          const lr = vis(lab);
          const ly = lr.top + lr.height / 2;
          const at = (x) => inputs.find((inp) => { const r = vis(inp); return Math.abs(r.top + r.height / 2 - ly) < 14 && r.left - 6 <= x && r.right + 6 >= x; });
          const sellIn = at(sx), netIn = at(nx);
          if (sellIn && netIn && sellIn !== netIn) rows[type] = { sellIn, net: parseFloat(String(netIn.value).replace(/[^\d.-]/g, '')) || 0 };
        });
        return rows;
      }).filter(Boolean);
      return blocks.length ? blocks : null;
    };
    // Award Net is worked out by the form once miles/program are in.
    const blocks = await waitFor(() => { const b = read(); return b && b.some((x) => x.ADT && x.ADT.net > 0) ? b : null; }, 5000, 150) || read();
    if (!blocks) throw new Error('Sell price field not found');
    const ending = [88, 89, 90, 91, 92].includes(spec.ending) ? spec.ending : 90;
    const out = {};
    ['ADT', 'CHD', 'INF'].forEach((type) => {
      const parts = blocks.map((b) => b[type]).filter(Boolean);
      if (!parts.length) return;
      const net = parts.reduce((t, p) => t + p.net, 0);
      let total;
      if (type === 'INF') total = net > 0 ? Math.ceil(net * 1.1) : 0;
      else if (spec.value > 0) total = spec.value;
      else total = net > 0 ? roundSell(net * 1.1, ending) : 0;
      if (!total) return;
      let left = total;
      parts.forEach((p, i) => {
        const v = i === parts.length - 1 ? Math.round(left * 100) / 100 : Math.round((net ? total * p.net / net : total / parts.length) * 100) / 100;
        left -= v;
        setField(p.sellIn, v);
      });
      out[type] = total;
    });
    if (!out.ADT) throw new Error('Net not shown in the form');
    await wait(150);
    return { ADT: out.ADT, all: out };
  }

  // Flight fingerprints ("PR101 08OCT HNLMNL") of the *IA lines sent.
  function gdsJobSigs(gds) {
    const ia = (String(gds || '').split(/\n\s*VI\*/)[0] || '');
    return ia.split('\n').map((l) => {
      const m = l.match(/^\s*\d+\s+([A-Z0-9]{2})\s*(\d{1,5})[A-Z]\s+(\d{2}[A-Z]{3})\s+[A-Z]\s+([A-Z]{3})([A-Z]{3})\b/);
      return m ? m[1] + parseInt(m[2], 10) + ' ' + m[3] + ' ' + m[4] + m[5] : null;
    }).filter(Boolean);
  }
  // The flights an option's card shows on the lead page.
  function optionCardById(id) {
    const cb = document.getElementById('checkbox-switch-' + id);
    if (!cb) return null;
    const opt = cb.closest('.lead-option');
    if (opt) return opt;
    for (let up = cb.parentElement; up && up !== document.body; up = up.parentElement) {
      if (up.querySelectorAll('input[id^="checkbox-switch-"]').length > 1) return null;
      if (up.querySelector('.lead-option-segment-segments')) return up;
    }
    return null;
  }
  function optionSigsById(id) {
    const card = optionCardById(id);
    const box = card && card.querySelector('.lead-option-segment-segments');
    if (!box) return null;
    const sigs = Array.from(box.querySelectorAll(':scope > pre')).map((p) => segSig((p.querySelector('.overflow-hidden') || p).textContent)).filter(Boolean);
    return sigs.length ? sigs : null;
  }

  // Fallback mode: a background tab opened with ?jsjob=<id>.
  (function startSendJobIfAny() {
    if (IN_WORKER_FRAME) return;
    const jobId = new URLSearchParams(location.search).get('jsjob');
    if (jobId && /^\/leads\/\d+/.test(location.pathname)) runSendJob(jobId);
  })();

  // ---- Warm worker frame ------------------------------------------
  // One open BO tab keeps an invisible copy of the BO loaded on your LAST
  // lead (in a hidden frame — nothing in your tab changes, no focus is
  // taken, no sound). Sending to the same lead again is then instant;
  // a different lead is switched to in place, without reloading.
  // Opening Pip's popover on a flight site wakes it up ahead of time.
  const HOST_KEY = 'js-sendjob-host';
  const LAST_LEAD_KEY = 'js-sendjob-lastlead';

  (function workerFrame() {
    if (!IN_WORKER_FRAME) return;
    const token = window.name.slice('jsworker-'.length);
    const runKey = 'js-sendjob-run-' + token;
    const startedKey = 'jsw-started-' + token;
    const resumeKey = 'jsw-resume-' + token;
    const loadedAt = Date.now();
    const queue = [];
    let busy = false;
    const ss = (fn) => { try { return fn(); } catch (e) { return null; } };

    async function pump() {
      if (busy) return;
      const r = queue.shift();
      if (!r) return;
      busy = true;
      ss(() => sessionStorage.setItem(startedKey, r.jobId));
      try { await runSendJob(r.jobId, { persistent: true, token }); } catch (e) { /* reported inside */ }
      busy = false;
      pump();
    }
    function take(raw) {
      let r;
      try { r = JSON.parse(raw); } catch (e) { return; }
      if (!r || !r.jobId || Date.now() - r.t > 120000) return;
      const resume = ss(() => sessionStorage.getItem(resumeKey)) === r.jobId;
      if (!resume && ss(() => sessionStorage.getItem(startedKey)) === r.jobId) return; // already done
      if (resume) ss(() => sessionStorage.removeItem(resumeKey));
      if (queue.some((q) => q.jobId === r.jobId)) return;
      queue.push(r);
      pump();
    }
    GM_addValueChangeListener(runKey, (n, o, v) => { if (v) take(v); });
    const pending = GM_getValue(runKey, null);
    if (pending) take(pending); // a job that arrived while this frame was loading
    void loadedAt;
  })();

  (function hostSendWorker() {
    if (window.top !== window) return; // only real BO tabs host
    const tabToken = Math.random().toString(36).slice(2);
    const FOCUS_KEY = 'js-sendjob-focustab';
    let frame = null;

    // Who takes a job — decided instantly, no timers (a background tab's
    // timers can be delayed up to a minute, which is what made the flight
    // site give up and open a new tab):
    //   1. the tab already holding the warm frame,
    //   2. else the BO tab you used last,
    //   3. else any BO tab.
    // Each key is cleared when its tab closes.
    const readKey = (k) => { try { return GM_getValue(k, null) || null; } catch (e) { return null; } };
    const readHost = () => { const v = readKey(HOST_KEY); try { const h = typeof v === 'string' ? JSON.parse(v) : v; return h && h.token ? h : null; } catch (e) { return null; } };
    const markFocus = () => { if (!document.hidden) { try { GM_setValue(FOCUS_KEY, tabToken); } catch (e) { /* ignore */ } } };
    markFocus();
    window.addEventListener('focus', markFocus);
    document.addEventListener('visibilitychange', markFocus);
    window.addEventListener('pagehide', () => {
      const h = readHost();
      if (h && h.token === tabToken) { try { GM_setValue(HOST_KEY, null); } catch (e) { /* ignore */ } }
      if (readKey(FOCUS_KEY) === tabToken) { try { GM_setValue(FOCUS_KEY, null); } catch (e) { /* ignore */ } }
    });
    function chosenToken() {
      const h = readHost();
      if (h) return h.token;
      return readKey(FOCUS_KEY);
    }

    function ensureFrame(leadId) {
      if (frame && frame.isConnected) return frame;
      frame = document.createElement('iframe');
      frame.name = 'jsworker-' + tabToken;
      frame.setAttribute('aria-hidden', 'true');
      frame.tabIndex = -1;
      frame.style.cssText = 'position:fixed;left:-20000px;top:0;width:1400px;height:900px;opacity:0;pointer-events:none;border:0;visibility:hidden;';
      frame.src = '/leads/' + leadId;
      document.body.appendChild(frame);
      try { GM_setValue(HOST_KEY, JSON.stringify({ token: tabToken, t: Date.now() })); } catch (e) { /* ignore */ }
      return frame;
    }

    // Warm from the start: the chosen BO tab loads the frame on your last
    // lead as soon as it opens, so it's long ready before you need it.
    (function warmOnLoad() {
      const last = String(GM_getValue(LAST_LEAD_KEY, '') || '');
      if (!/^\d{6}$/.test(last) || readHost()) return;
      const who = readKey(FOCUS_KEY);
      if (who && who !== tabToken) return;
      ensureFrame(last);
    })();

    // Pip's popover opened somewhere: get the frame ready on the last lead.
    GM_addValueChangeListener('js-sendjob-warm', () => {
      const who = chosenToken();
      if (who && who !== tabToken) return;
      if (frame && frame.isConnected) { try { GM_setValue('js-sendjob-refresh-' + tabToken, Date.now()); } catch (e) { /* ignore */ } return; }
      const last = String(GM_getValue(LAST_LEAD_KEY, '') || '');
      if (!/^\d{6}$/.test(last)) return;
      ensureFrame(last);
    });

    GM_addValueChangeListener('js-sendjob-request', (name, oldV, newV) => {
      if (!newV) return;
      let req;
      try { req = JSON.parse(newV); } catch (e) { return; }
      if (!req || !req.id || Date.now() - req.t > 15000) return;
      const claimKey = 'js-sendjob-claim-' + req.id;
      const who = chosenToken();
      if (who && who !== tabToken) {
        // Not ours — but step in if the chosen tab turns out to be gone.
        setTimeout(() => { if (!GM_getValue(claimKey, null)) takeJob(req); }, 1500);
        return;
      }
      takeJob(req);
    });

    function takeJob(req) {
      const claimKey = 'js-sendjob-claim-' + req.id;
      if (GM_getValue(claimKey, null)) return;
      GM_setValue(claimKey, tabToken);
      jobStatus(req.id, { phase: 'claimed', v: (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) || '' });
      try { GM_setValue(LAST_LEAD_KEY, req.leadId); } catch (e) { /* ignore */ }

      const f = ensureFrame(req.leadId);
      GM_setValue('js-sendjob-run-' + tabToken, JSON.stringify({ jobId: req.id, leadId: req.leadId, t: Date.now() }));

      const statusKey = 'js-sendjob-status-' + req.id;
      const decisionKey = 'js-sendjob-decision-' + req.id;
      let closed = false;
      const ids = [];
      const finish = (reset) => {
        if (closed) return;
        closed = true;
        ids.forEach((id) => { try { if (typeof GM_removeValueChangeListener === 'function') GM_removeValueChangeListener(id); } catch (e) { /* ignore */ } });
        // (the claim stays set, so no other tab ever re-runs this job)
        // After an error, give the frame a clean start on that lead.
        if (reset && f.isConnected) f.src = '/leads/' + req.leadId;
      };
      ids.push(GM_addValueChangeListener(statusKey, (n, o, v) => {
        try {
          const st = JSON.parse(v || 'null');
          if (st && st.phase === 'done') finish(false);
          if (st && st.phase === 'error') finish(true);
        } catch (e) { /* ignore */ }
      }));
      ids.push(GM_addValueChangeListener(decisionKey, (n, o, v) => {
        try { const d = JSON.parse(v || 'null'); if (d && d.go === false) finish(false); } catch (e) { /* ignore */ }
      }));
      setTimeout(() => finish(false), 4 * 60 * 1000);
    }
  })();

  // ==================================================================
  // MERGE — header button next to + and select-all. Select two (or more)
  // options, e.g. two separate one-ways, press Merge: their segments go
  // through Sort Me into ONE new option — cash, Net 0, PCC 10XH.
  // ==================================================================
  const OPTION_RAW_KEY = 'js-option-raw';
  const optionRawCache = new Map(); // option id -> raw *IA/VI* text
  const optionObjCache = new Map(); // option id -> the API object it came from
  const idObjCache = new Map(); // any id seen in the BO's data -> objects carrying it
  const detailCache = new Map(); // option id -> its full detail reply (what "edit" loads)
  const DETAIL_URL_KEY = 'js-pq-detail-url-v2'; // v2: forget an address learned by guessing

  // When the BO loads an option's full details (what clicking "edit"
  // does), remember that address, with the option number swapped for
  // {id} — from then on Merge loads any option's cost the same way,
  // without opening anything.
  function learnDetailUrl(url, json) {
    try {
      const path = String(url).replace(/^https?:\/\/[^/]+/, '');
      const nums = path.match(/\d{3,}/g) || [];
      const text = JSON.stringify(json);
      if (!/miles_count|"net|net_price|sell_type/i.test(text)) return;
      for (const n of nums) {
        if (document.getElementById('checkbox-switch-' + n)) {
          detailCache.set(n, json);
          GM_setValue(DETAIL_URL_KEY, path.replace(n, '{id}'));
          return;
        }
      }
    } catch (e) { /* ignore */ }
  }
  const OPTION_COST_KEY = 'js-option-cost';
  function saveOptionCost(optionId, fill) {
    if (!optionId || !fill) return;
    let all = {};
    try { all = JSON.parse(GM_getValue(OPTION_COST_KEY, '{}')) || {}; } catch (e) { all = {}; }
    const c = fill.mode === 'cash' ? { mode: 'cash', ADT: fill.ADT, CHD: fill.CHD, INF: fill.INF } : { mode: 'award', miles: fill.miles, taxes: fill.taxes, program: fill.program, split: !!(fill.parts && fill.parts.length > 1) };
    all[optionId] = Object.assign(c, { at: Date.now() });
    const cutoff = Date.now() - 30 * 864e5;
    Object.keys(all).forEach((k) => { if (all[k].at < cutoff) delete all[k]; });
    try { GM_setValue(OPTION_COST_KEY, JSON.stringify(all)); } catch (e) { /* ignore */ }
  }
  const apiHeaders = {};
  let pageFetch = null;

  function saveOptionRaw(optionId, raw) {
    if (!optionId || !raw || !/\*IA/.test(raw)) return;
    let all = {};
    try { all = JSON.parse(GM_getValue(OPTION_RAW_KEY, '{}')) || {}; } catch (e) { all = {}; }
    all[optionId] = { raw, at: Date.now() };
    const cutoff = Date.now() - 30 * 864e5;
    Object.keys(all).forEach((k) => { if (all[k].at < cutoff) delete all[k]; });
    try { GM_setValue(OPTION_RAW_KEY, JSON.stringify(all)); } catch (e) { /* ignore */ }
  }

  // Pull every "*IA … VI*" text out of a BO API reply, keyed by the id of
  // the object it belongs to (the option / price quote).
  function harvestRaw(json) {
    const idKeys = ['id', 'pk', 'price_quote_id', 'priceQuoteId', 'lead_price_quote_id'];
    const walk = (node, ids, depth) => {
      if (!node || typeof node !== 'object' || depth > 14) return;
      if (Array.isArray(node)) { node.forEach((x) => walk(x, ids, depth + 1)); return; }
      const own = idKeys.map((k) => node[k]).filter((v) => v != null && /^\d+$/.test(String(v))).map(String);
      const here = own.length ? own : ids;
      if (node.id != null && /^\d+$/.test(String(node.id))) {
        const list = idObjCache.get(String(node.id)) || [];
        if (!list.includes(node) && list.length < 6) list.push(node);
        idObjCache.set(String(node.id), list);
      }
      Object.keys(node).forEach((k) => {
        const v = node[k];
        if (typeof v === 'string') {
          if (/\*IA/.test(v) && /VI\*|\*VI/.test(v)) here.forEach((id) => { optionRawCache.set(id, v); if (own.length) optionObjCache.set(id, node); });
        } else if (v && typeof v === 'object') {
          walk(v, here, depth + 1);
        }
      });
    };
    walk(json, [], 0);
  }

  // Watch the BO's own API traffic: remember its auth headers (to make the
  // same call ourselves) and the options' raw segments it loads.
  (function sniffApi() {
    if (window.top !== window) return;
    try {
      const W = unsafeWindow;
      const XP = W.XMLHttpRequest.prototype;
      const open = XP.open;
      const setH = XP.setRequestHeader;
      const send = XP.send;
      XP.open = function (m, u) { this.__jsUrl = String(u || ''); this.__jsMethod = String(m || 'GET'); return open.apply(this, arguments); };
      XP.setRequestHeader = function (k, v) {
        try { if (/\/api\//.test(this.__jsUrl || '') && !/^content-(type|length)$/i.test(k)) apiHeaders[k] = v; } catch (e) { /* ignore */ }
        return setH.apply(this, arguments);
      };
      XP.send = function (body) {
        try {
          if (/PriceQuoteFormModel/.test(this.__jsUrl || '') && /^(put|post)$/i.test(this.__jsMethod || '')) learnPqShape(body);
          if (/\/api\//.test(this.__jsUrl || '')) {
            this.addEventListener('load', () => {
              try {
                const j = this.responseType === 'json' ? this.response : JSON.parse(this.responseText);
                harvestRaw(j);
                if (/^get$/i.test(this.__jsMethod || 'GET')) learnDetailUrl(this.__jsUrl, j);
                if (/\/(me|profile|account|auth\/user|user\/current|current)(\b|\/|\?|$)/i.test(this.__jsUrl || '') && !/lead/i.test(this.__jsUrl || '')) {
                  const r = j && (j.result || j.data || j.user || j);
                  const n = nameFromObj(r) || nameFromObj(r && r.user);
                  if (n) saveAgentName(n);
                }
              } catch (e) { /* not JSON */ }
            });
          }
        } catch (e) { /* ignore */ }
        return send.apply(this, arguments);
      };
      if (typeof W.fetch === 'function') {
        const f = W.fetch;
        pageFetch = f.bind(W);
        W.fetch = function (input, init) {
          const url = String((input && input.url) || input || '');
          const p = f.apply(this, arguments);
          if (/\/api\//.test(url)) {
            try {
              const h = (init && init.headers) || (input && input.headers);
              if (h) {
                if (typeof h.forEach === 'function' && !Array.isArray(h)) h.forEach((v, k) => { if (!/^content-/i.test(k)) apiHeaders[k] = v; });
                else Object.keys(h).forEach((k) => { if (!/^content-/i.test(k)) apiHeaders[k] = h[k]; });
              }
            } catch (e) { /* ignore */ }
            const method = String((init && init.method) || (input && input.method) || 'GET');
            if (/PriceQuoteFormModel/.test(url) && /^(put|post)$/i.test(method) && init && init.body) learnPqShape(init.body);
            p.then((r) => r.clone().json()).then((j) => { harvestRaw(j); if (/^get$/i.test(method)) learnDetailUrl(url, j); }).catch(() => {});
          }
          return p;
        };
      }
    } catch (e) { /* ignore */ }
  })();

  // The agent's first name for Pip's name strip, found without needing the
  // profile menu opened: from the login token, or the BO's own account
  // reply. Stored for Pip (PART 4) under the same key it reads.
  const AGENT_NAME_KEY = 'bmo-first-name';
  function saveAgentName(n) {
    const first = String(n || '').trim().split(/\s+/)[0].replace(/[^\p{L}'-]/gu, '');
    if (first && first.length > 1) { try { if (GM_getValue(AGENT_NAME_KEY, '') !== first) GM_setValue(AGENT_NAME_KEY, first); } catch (e) { /* ignore */ } }
    return !!first;
  }
  function nameFromObj(o) {
    if (!o || typeof o !== 'object') return null;
    return o.first_name || o.firstName || o.given_name || (o.name && /\s/.test(o.name) ? o.name : null) || null;
  }
  function nameFromJwt(tok) {
    try {
      const part = String(tok).replace(/^Bearer\s+/i, '').split('.')[1];
      if (!part) return null;
      const json = JSON.parse(decodeURIComponent(escape(atob(part.replace(/-/g, '+').replace(/_/g, '/')))));
      return nameFromObj(json) || nameFromObj(json.user) || nameFromObj(json.data) || null;
    } catch (e) { return null; }
  }
  function findAgentName() {
    const tokens = [];
    Object.keys(apiHeaders).forEach((k) => { if (/authorization/i.test(k)) tokens.push(apiHeaders[k]); });
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const v = (localStorage.getItem(localStorage.key(i)) || '').replace(/^"|"$/g, '');
        if (/^[\w-]+\.[\w-]+\.[\w-]+$/.test(v)) tokens.push(v);
        else if (/first_?name/i.test(v) && v.length < 20000) {
          try { const j = JSON.parse(v); const n = nameFromObj(j) || nameFromObj(j.user) || nameFromObj(j.auth && j.auth.user); if (n && saveAgentName(n)) return; } catch (e) { /* ignore */ }
        }
      }
    } catch (e) { /* ignore */ }
    for (const t of tokens) { const n = nameFromJwt(t); if (n && saveAgentName(n)) return; }
  }
  if (window.top === window) { setTimeout(findAgentName, 1500); setTimeout(findAgentName, 6000); }

  function rawFor(id) {
    if (optionRawCache.has(id)) return optionRawCache.get(id);
    try { const all = JSON.parse(GM_getValue(OPTION_RAW_KEY, '{}')) || {}; if (all[id]) return all[id].raw; } catch (e) { /* ignore */ }
    return null;
  }

  async function fetchLeadOptions(leadId) {
    const headers = Object.assign({ Accept: 'application/json' }, apiHeaders);
    if (!Object.keys(apiHeaders).some((k) => /authorization/i.test(k))) {
      // No call seen yet: try a stored login token.
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          const v = localStorage.getItem(k) || '';
          if (/token/i.test(k) && /^[\w-]+\.[\w-]+\.[\w-]+$/.test(v.replace(/^"|"$/g, ''))) { headers.Authorization = 'Bearer ' + v.replace(/^"|"$/g, ''); break; }
        }
      } catch (e) { /* ignore */ }
    }
    const doFetch = pageFetch || window.fetch.bind(window);
    try {
      const r = await doFetch('/api/database/v2/LeadPriceQuoteList/find?pks=' + leadId, { credentials: 'include', headers });
      if (r.ok) harvestRaw(await r.json());
    } catch (e) { /* ignore */ }
  }

  // One option's details as the BO's "edit" loads them.
  async function loadOptionDetail(id) {
    const j = await apiGet('/api/database/v1/priceQuotes/PriceQuoteFormModel/' + id);
    const r = j && (j.result || j.data || j);
    if (!r || !Array.isArray(r.preTickets)) return null;
    detailCache.set(String(id), r);
    if (r.raw_segments) optionRawCache.set(String(id), r.raw_segments);
    return r;
  }

  // preTickets -> [{ cost, segNums }]. Cash keeps its sell type and the
  // Net per passenger; award keeps miles, taxes and program (all totals,
  // exactly as stored on the option).
  function ticketsFromDetail(r) {
    const PAX = { adult: 'ADT', adt: 'ADT', child: 'CHD', chd: 'CHD', infant: 'INF', inf: 'INF' };
    const segs = Array.isArray(r.segments) ? r.segments : [];
    const pts = r.preTickets || [];
    return pts.map((pt, idx) => {
      let cost;
      if (/award/i.test(pt.sell_type || '')) {
        cost = { mode: 'award', miles: Number(pt.miles_count) || 0, taxes: Number(pt.award_tax_amount) || 0, program: MILE_PROGRAM_IDS[pt.mile_price_program_id] || '' };
        if (!cost.program || !cost.miles) cost = null;
      } else {
        cost = { mode: 'cash', sellType: pt.sell_type || 'public' };
        (pt.prices || []).forEach((pr) => { const t = PAX[String(pr.passenger_type || '').toLowerCase()]; if (t && pr.net_price != null) cost[t] = Number(pr.net_price); });
        if (cost.ADT == null && cost.CHD == null && cost.INF == null) cost = null;
      }
      let segNums = segs.filter((sg) => String(sg.pre_ticket_id) === String(pt.id)).map((sg) => Number(sg.number));
      if (!segNums.length && pts.length === 1) segNums = segs.map((sg) => Number(sg.number));
      if (!segNums.length && idx === 0 && !segs.length) segNums = [];
      return { cost, segNums };
    });
  }

  async function apiGet(path) {
    const headers = Object.assign({ Accept: 'application/json' }, apiHeaders);
    if (!Object.keys(headers).some((k) => /authorization/i.test(k))) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          const v = (localStorage.getItem(k) || '').replace(/^"|"$/g, '');
          if (/token/i.test(k) && /^[\w-]+\.[\w-]+\.[\w-]+$/.test(v)) { headers.Authorization = 'Bearer ' + v; break; }
        }
      } catch (e) { /* ignore */ }
    }
    const doFetch = pageFetch || window.fetch.bind(window);
    try {
      const r = await doFetch(path, { credentials: 'include', headers });
      return r.ok ? await r.json() : null;
    } catch (e) { return null; }
  }

  // Load one option's full details the way "edit" does, without opening it.
  async function fetchOptionDetail(id) {
    const learned = GM_getValue(DETAIL_URL_KEY, '');
    // Only the address the BO itself used for "edit" — no guessing.
    const guesses = [learned].filter(Boolean);
    for (const g of guesses) {
      const j = await apiGet(g.replace('{id}', id));
      if (!j) continue;
      harvestRaw(j);
      detailCache.set(String(id), j);
      if (costFromObj(j)) {
        if (g !== learned) { try { GM_setValue(DETAIL_URL_KEY, g); } catch (e) { /* ignore */ } }
        return true;
      }
    }
    return false;
  }

  function optionsScope(headerCell) {
    let node = headerCell.parentElement;
    while (node && node !== document.body) {
      if (node.querySelector('input[id^="checkbox-switch-"]')) return node;
      node = node.parentElement;
    }
    return document;
  }

  function leadIdFor(el) {
    const m = location.pathname.match(/\/leads\/(\d{5,})/);
    if (m) return m[1];
    for (let node = el; node && node !== document.body; node = node.parentElement) {
      const sp = Array.from(node.querySelectorAll('span')).find((x) => /^#\d{5,}$/.test(x.textContent.trim()));
      if (sp) return sp.textContent.trim().slice(1);
    }
    return null;
  }

  // BO "Mile program" dropdown ids -> program code.
  const MILE_PROGRAM_IDS = { 16: 'AA', 1: 'AC', 19: 'AD', 3: 'AF', 20: 'AS', 15: 'AV', 22: 'B6', 4: 'BA', 17: 'CM', 11: 'CX', 10: 'DL', 5: 'EK', 18: 'EY', 23: 'IB', 24: 'JL', 7: 'LH', 9: 'QF', 14: 'QR', 13: 'SK', 8: 'SQ', 2: 'TK', 21: 'TP', 6: 'UA', 12: 'VS' };

  // An existing option's cost: what Pip stored when it added it, else
  // read from the BO's own data for that option.
  function costFor(id) {
    const d = detailCache.get(String(id));
    if (d && Array.isArray(d.preTickets)) { const t = ticketsFromDetail(d); if (t.length && t[0].cost) return t[0].cost; }
    try { const all = JSON.parse(GM_getValue(OPTION_COST_KEY, '{}')) || {}; if (all[id] && !all[id].split) return all[id]; } catch (e) { /* ignore */ }
    const cands = [detailCache.get(String(id)), optionObjCache.get(id)].filter(Boolean);
    for (const obj of cands) { const c = costFromObj(obj); if (c) return c; }
    try { console.warn("[Ian's Assistant] merge:" + ' no cost found for option ' + id, cands.length ? cands : '(option not in the BO data)'); } catch (e) { /* ignore */ }
    return null;
  }

  function costFromObj(obj) {
    const num = (v) => { const n = parseFloat(String(v).replace(/[^\d.-]/g, '')); return Number.isFinite(n) ? n : null; };
    let award = null;
    const cash = {};
    const walk = (n, d) => {
      if (!n || typeof n !== 'object' || d > 8) return;
      if (Array.isArray(n)) { n.forEach((x) => walk(x, d + 1)); return; }
      if (!award && n.miles_count != null && num(n.miles_count)) {
        const pid = n.mile_price_program_id != null ? n.mile_price_program_id : (n.mile_price_program && n.mile_price_program.id);
        award = { mode: 'award', miles: num(n.miles_count), taxes: num(n.award_tax_amount) || 0, program: MILE_PROGRAM_IDS[pid] || (n.mile_price_program && n.mile_price_program.code) || '' };
      }
      // Cash: per-passenger Net, whatever the BO calls the fields.
      const PAX = { ADT: 'ADT', ADULT: 'ADT', ADL: 'ADT', ADULTS: 'ADT', CHD: 'CHD', CHILD: 'CHD', CNN: 'CHD', CHILDREN: 'CHD', INF: 'INF', INFANT: 'INF', INFANTS: 'INF' };
      const keys = Object.keys(n);
      let type = null;
      keys.forEach((k) => { const v = n[k]; if (!type && typeof v === 'string' && PAX[v.trim().toUpperCase()] && /type|pax|passenger|code|kind|age|category/i.test(k)) type = PAX[v.trim().toUpperCase()]; });
      const netKey = keys.find((k) => /^net(_?(price|amount|fare|value|cost))?$/i.test(k) && n[k] != null && typeof n[k] !== 'object' && num(n[k]) != null);
      if (type && netKey && cash[type] == null) cash[type] = num(n[netKey]);
      // Flat forms: adt_net / net_adt / adult_net_price …
      keys.forEach((k) => {
        const m = k.match(/^(adt|adult|chd|child|cnn|inf|infant)_?net|^net_?(?:price_?|amount_?)?(adt|adult|chd|child|cnn|inf|infant)$/i);
        if (m && n[k] != null && typeof n[k] !== 'object' && num(n[k]) != null) {
          const t = PAX[(m[1] || m[2]).toUpperCase()];
          if (t && cash[t] == null) cash[t] = num(n[k]);
        }
      });
      // A ticket with one Net and no passenger type: treat as adult.
      if (!type && netKey && n.sell_type && !/award/i.test(n.sell_type) && cash.ADT == null) cash.ADT = num(n[netKey]);
      if (n.sell_type && !cash.sellType && !/award/i.test(n.sell_type)) cash.sellType = String(n.sell_type);
      Object.keys(n).forEach((k) => { if (n[k] && typeof n[k] === 'object') walk(n[k], d + 1); });
    };
    walk(obj, 0);
    if (award && award.program) return award;
    if (cash.ADT != null || cash.CHD != null || cash.INF != null) return Object.assign({ mode: 'cash' }, cash);
    return null;
  }

  // Segment step: give each segment row its ticket number.
  async function setSegmentTickets(modal, ticketOfSeg) {
    const rows = () => Array.from(modal.querySelectorAll('.input-select__value')).map((el) => {
      const row = el.closest('.flex.items-center') || el.parentElement;
      const pre = row && row.parentElement && (row.querySelector('pre') || row.parentElement.querySelector('pre'));
      const m = pre && pre.textContent.match(/^\s*(\d+)/);
      return { el, seg: m ? parseInt(m[1], 10) : null };
    });
    const list = rows();
    if (!list.length) return false;
    for (let i = 0; i < list.length; i++) {
      const r = rows()[i]; // fresh each time (Vue may re-render)
      if (!r) return false;
      const seg = r.seg != null ? r.seg : i + 1;
      const want = String(ticketOfSeg[seg - 1] || 1);
      if (!(await chooseInputSelect(r.el, want))) return false;
      await wait(100);
    }
    return true;
  }

  let merging = false;
  async function mergeSelected(headerCell, btn) {
    if (merging) return;
    const say = (t, ms) => { btn.textContent = t; if (ms) setTimeout(() => { btn.textContent = 'Merge'; }, ms); };
    const scope = optionsScope(headerCell);
    const ids = Array.from(scope.querySelectorAll('input[id^="checkbox-switch-"]'))
      .filter((c) => c.checked).map((c) => c.id.replace('checkbox-switch-', ''));
    if (ids.length < 2) { say('Select 2 options', 1800); return; }
    merging = true;
    try {
      say('Merging…');
      // Each option's full details, straight from the BO (the same data
      // "edit" loads), all at once: segments, and every ticket's cost.
      const details = await Promise.all(ids.map((id) => loadOptionDetail(id)));
      let raws = ids.map((id, i) => (details[i] && details[i].raw_segments) || rawFor(id));
      if (raws.some((r) => !r)) {
        const leadId = leadIdFor(headerCell);
        if (leadId) { await fetchLeadOptions(leadId); raws = ids.map((id, i) => raws[i] || rawFor(id)); }
      }
      const missing = ids.filter((id, i) => !raws[i]);
      if (missing.length) { say('Can\'t read option ' + missing.join(', '), 3000); return; }

      // Tickets are numbered per option, in the order the options sit in
      // the lead (top one = 1, next = 2, …). An option that already has
      // several tickets keeps them, each as its own ticket. Segments are
      // sorted by Sort Me but every segment keeps its own ticket number.
      const opts = ids.map((id, i) => ({ id, legs: parseRawSegments(raws[i]), detail: details[i] }));
      if (opts.some((o) => !o.legs.length)) { say('No segments found', 2500); return; }
      const tickets = []; // [{ cost }]
      const legs = [];
      opts.forEach((o) => {
        const parts = o.detail ? ticketsFromDetail(o.detail) : null;
        if (parts && parts.length) {
          const base = tickets.length;
          parts.forEach((p) => tickets.push({ cost: p.cost }));
          o.legs.forEach((l, k) => { l.ticket = base + 1 + (parts.findIndex((p) => p.segNums.includes(k + 1)) >= 0 ? parts.findIndex((p) => p.segNums.includes(k + 1)) : 0); legs.push(l); });
        } else {
          tickets.push({ cost: costFor(o.id) });
          o.legs.forEach((l) => { l.ticket = tickets.length; legs.push(l); });
        }
      });
      if (tickets.length > 4) { say('Max 4 tickets', 2500); return; }
      const sorted = reorderByContinuity(legs);
      const iaLines = sorted.map((leg, idx) => `${String(idx + 1).padStart(2, ' ')} ${leg.iaRest}`);
      const viLines = ['   FLIGHT  DATE  SEGMENT DPTR  ARVL    MLS  EQP  ELPD MILES SM'];
      sorted.forEach((leg, idx) => { viLines.push(`${String(idx + 1).padStart(2, ' ')} ${leg.viFirstLine}`); viLines.push(...leg.viOtherLines); });
      const mergedText = `*IA\n${iaLines.join('\n')}\n\nVI*\n${viLines.join('\n')}`;
      const ticketOfSeg = sorted.map((l) => l.ticket);
      const costs = tickets.map((t) => t.cost);
      const opts2 = tickets; // one entry per ticket for the price step

      sendJobActive = true; // keep the modal's own auto-carrier/auto-next out of it
      const plus = headerCell.querySelector('svg.feather-plus');
      const plusBtn = plus && plus.closest('button');
      if (!plusBtn) { say('No + button', 2500); return; }
      plusBtn.click();
      const modal = await waitFor(() => document.querySelector('.app-modal__container--price-quote'), 10000);
      const ta = modal && await waitFor(() => modal.querySelector('textarea.font-robotoMono'), 8000);
      if (!ta) { say('Form did not open', 2500); return; }
      setField(ta, mergedText);
      await wait(250);
      await selectCarrier(modal, detectCarrier(sorted));
      await wait(200);

      // Ticket numbers per option.
      say('Tickets…');
      const n1 = await findNextButtonReady();
      if (!n1) { say('Next not found', 2500); return; }
      n1.click();
      if (!(await waitFor(() => modal.querySelector('.input-select__value'), 10000))) { say('Segment step did not load', 2500); return; }
      await wait(200);
      if (!(await setSegmentTickets(modal, ticketOfSeg))) { say('Could not set ticket numbers', 3000); return; }
      await wait(250);
      const n2 = await findNextButtonReady();
      if (n2) n2.click();
      await wait(500);
      await selectPcc(modal, AUTO_PCC_CODE);
      const net = await waitFor(() => Array.from(modal.querySelectorAll('label.form-label')).find((l) => /^net\b/i.test(l.textContent.trim())), 12000);
      if (!net) { say('Price step did not load', 2500); return; }

      // Multiple Tkt, then each option's own cost in its own ticket.
      const multi = Array.from(modal.querySelectorAll('button')).find((b) => /^multiple\s*tkt$/i.test(b.textContent.trim()));
      if (!multi) { say('No Multiple Tkt button', 2500); return; }
      multi.click();
      const awardBtns = await waitFor(() => { const a = Array.from(modal.querySelectorAll('button')).filter((b) => b.textContent.trim() === 'Award'); return a.length >= opts2.length ? a : null; }, 8000);
      if (!awardBtns) { say('Tickets did not appear', 2500); return; }
      const noCost = [];
      for (let i = 0; i < opts2.length; i++) {
        const c = costs[i];
        if (!c) { noCost.push(i + 1); continue; }
        // Fresh every time: filling one ticket can re-render the others.
        const btnNow = Array.from(modal.querySelectorAll('button')).filter((b) => b.textContent.trim() === 'Award')[i];
        if (!btnNow) { noCost.push(i + 1); continue; }
        const scope = ticketBlock(modal, btnNow);
        if (c.mode === 'award') {
          // Click this ticket's own Award switch, re-trying until its
          // Miles box shows up (a click during a redraw can get lost).
          const awardBtnAt = () => Array.from(modal.querySelectorAll('button')).filter((b) => b.textContent.trim() === 'Award')[i];
          const scopeNow = () => { const b = awardBtnAt(); return b ? ticketBlock(modal, b) : scope; };
          let mi = null;
          for (let t = 0; t < 4 && !mi; t++) {
            const b = awardBtnAt();
            if (b) { b.scrollIntoView({ block: 'nearest' }); b.click(); }
            mi = await waitFor(() => inputByLabel(scopeNow(), 'MILES'), 1500, 100);
          }
          const sc = scopeNow();
          const tx = inputByLabel(sc, 'TAXES');
          if (!mi || !tx) { noCost.push(i + 1); continue; }
          setField(mi, c.miles);
          setField(tx, c.taxes);
          if (!(await selectMileProgram(sc, c.program))) noCost.push(i + 1);
        } else {
          // Same sell type as the original option (Published / Private / CK).
          const st = String(c.sellType || '').toLowerCase();
          const want = /private/.test(st) ? 'Private' : (/^ck$|consolid/.test(st) ? 'CK' : 'Published');
          const stBtn = want && Array.from(scope.querySelectorAll('button')).find((b) => b.textContent.trim() === want);
          if (stBtn) { stBtn.click(); await wait(250); }
          // This ticket's area on screen: from its Award switch down to the
          // next ticket's (or the end of the form).
          const band = () => {
            const all = Array.from(modal.querySelectorAll('button')).filter((b) => b.textContent.trim() === 'Award');
            const top = all[i] ? all[i].getBoundingClientRect().top - 4 : null;
            const nxt = all[i + 1] ? all[i + 1].getBoundingClientRect().top - 60 : null;
            return [top, nxt];
          };
          // Every passenger type the option has (ADT, CHD, INF), each on
          // its own, so one filling first never cuts the others short.
          for (const type of ['ADT', 'CHD', 'INF']) {
            if (c[type] == null) continue;
            const one = { [type]: c[type] };
            const ok = await waitFor(() => {
              const sc = (() => { const b = Array.from(modal.querySelectorAll('button')).filter((x) => x.textContent.trim() === 'Award')[i]; return b ? ticketBlock(modal, b) : scope; })();
              if (fillCashNet(sc, one)) return true;
              const [y0, y1] = band();
              return fillCashNetByLayout(modal, one, y0, y1) ? true : null;
            }, 4000, 150);
            if (!ok) noCost.push((i + 1) + ' ' + type);
            await wait(120);
          }
        }
        await wait(150);
      }
      // Stops before Save so you can check it.
      say(noCost.length ? '✓ Merged — fill cost: tkt ' + noCost.join(', ') : '✓ Merged — check & Save', noCost.length ? 6000 : 3000);
    } catch (e) {
      say('Merge failed', 2500);
    } finally {
      sendJobActive = false;
      merging = false;
    }
  }

  // Click "#630962," under the client's name → copies 630962.
  function wireLeadIdCopy() {
    document.querySelectorAll('div.text-secondary-400.text-xs.font-medium:not([data-ia-idcopy])').forEach((el) => {
      const m = el.textContent.match(/#\s*(\d{5,})/);
      if (!m) return;
      el.setAttribute('data-ia-idcopy', '1');
      el.style.cursor = 'copy';
      el.title = 'Click to copy lead ID';
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = (el.textContent.match(/#\s*(\d{5,})/) || [])[1];
        if (!id) return;
        try { GM_setClipboard(id, 'text'); } catch (err) { try { navigator.clipboard.writeText(id); } catch (e2) { /* ignore */ } }
        el.classList.add('ia-idcopied');
        setTimeout(() => el.classList.remove('ia-idcopied'), 900);
      }, true);
    });
  }

  // ==================================================================
  // Quick SELL edit — a pen next to each SELL amount on an option
  // (ADT / CHD / INF). Type the price, Enter: saved straight to the BO
  // (the same PUT its own "edit → Save" sends), nothing else changes.
  // ==================================================================
  const PQ_SHAPE_KEY = 'js-pq-shape';
  const PQ_TOP_KEYS = ['lead_id', 'raw_segments', 'validating_carrier_id', 'currency_id', 'active_till', 'adult_count', 'child_count', 'infant_count', 'itinerary_type', 'client_remark', 'agent_remark', 'saleType', 'check_payment_ps', 'tour_fare_type', 'hotel_info', 'published_price', 'segments', 'preTickets'];
  const PQ_SEG_KEYS = ['type', 'flight_id', 'id', 'is_return', 'line_raw', 'number', 'part_number', 'pre_ticket_id', 'original_pre_ticket_id', 'pre_ticket_number', 'additional', 'flight_class', 'baggage_quantity', 'baggage_weight'];

  // Whenever the BO itself saves an option, note exactly which fields it
  // sends, so our save always matches the BO's own.
  function learnPqShape(body) {
    try {
      const b = typeof body === 'string' ? JSON.parse(body) : body;
      if (!b || !Array.isArray(b.segments) || !Array.isArray(b.preTickets)) return;
      const shape = { top: Object.keys(b), seg: b.segments[0] ? Object.keys(b.segments[0]) : null };
      GM_setValue(PQ_SHAPE_KEY, JSON.stringify(shape));
    } catch (e) { /* ignore */ }
  }

  function buildPqBody(r) {
    let shape = null;
    try { shape = JSON.parse(GM_getValue(PQ_SHAPE_KEY, 'null')); } catch (e) { shape = null; }
    const top = (shape && shape.top) || PQ_TOP_KEYS;
    const segKeys = (shape && shape.seg) || PQ_SEG_KEYS;
    const body = {};
    top.forEach((k) => {
      if (k === 'segments') {
        body.segments = (r.segments || []).map((sg) => { const o = {}; segKeys.forEach((sk) => { o[sk] = sk === 'type' && sg.type == null ? '' : sg[sk]; }); return o; });
      } else if (k === 'published_price') {
        body.published_price = r.published_price != null ? r.published_price : 0;
      } else if (r[k] !== undefined) {
        body[k] = r[k];
      } else if (k === 'client_remark' || k === 'agent_remark') {
        body[k] = '';
      } else {
        body[k] = null;
      }
    });
    return body;
  }

  async function apiSend(method, path, body) {
    const headers = Object.assign({ Accept: 'application/json', 'Content-Type': 'application/json' }, apiHeaders);
    const doFetch = pageFetch || window.fetch.bind(window);
    const r = await doFetch(path, { method, credentials: 'include', headers, body: JSON.stringify(body) });
    let j = null;
    try { j = await r.json(); } catch (e) { /* ignore */ }
    if (!r.ok || (j && j.success === false)) {
      let msg = (j && (j.message || j.error)) || ('HTTP ' + r.status);
      const errs = j && (j.errors || (j.result && j.result.errors));
      if (errs && typeof errs === 'object') msg += ' — ' + JSON.stringify(errs).slice(0, 300);
      throw new Error(msg);
    }
    return j;
  }

  async function saveSellPrice(optionId, type, value, netShown) {
    const r = await loadOptionDetail(optionId);
    if (!r) throw new Error('Could not load the option');
    const want = { ADT: 'adult', CHD: 'child', INF: 'infant' }[type];
    // Safety check: the option we're about to change must have the same
    // Net as the row you edited. If not, it's the wrong option — stop.
    if (netShown != null) {
      const netBo = (r.preTickets || []).map((pt) => (pt.prices || []).find((p) => String(p.passenger_type).toLowerCase() === want)).filter(Boolean)
        .reduce((t, p) => t + (Number(p.net_price) || 0), 0);
      if (Math.abs(netBo - netShown) > 1) {
        throw new Error('this row (Net ' + money(netShown) + ') does not match option ' + optionId + ' in the BO (Net ' + money(netBo) + '). Nothing was changed \u2014 refresh the page and try again');
      }
    }
    // The SELL shown is the total over all of the option's tickets. With
    // several tickets the new total is split by each ticket's Net (so each
    // ticket keeps its share); cents left over go on the last one.
    const rows = (r.preTickets || []).map((pt) => (pt.prices || []).find((p) => String(p.passenger_type).toLowerCase() === want)).filter(Boolean);
    if (!rows.length) throw new Error('No ' + type + ' price on this option');
    if (rows.length === 1) {
      rows[0].sell_amount = value;
    } else {
      const nets = rows.map((p) => Math.max(0, Number(p.net_price) || 0));
      const tot = nets.reduce((a, b) => a + b, 0);
      let left = value;
      rows.forEach((p, i) => {
        if (i === rows.length - 1) { p.sell_amount = Math.round(left * 100) / 100; return; }
        const share = Math.round((tot ? value * nets[i] / tot : value / rows.length) * 100) / 100;
        p.sell_amount = share;
        left -= share;
      });
    }
    // The BO hands cash tickets back with mile program -1 ("none"), but
    // must receive null for it — sending -1 back is what made it refuse.
    (r.preTickets || []).forEach((pt) => {
      if (!(Number(pt.mile_price_program_id) > 0)) pt.mile_price_program_id = null;
      if (!/award/i.test(pt.sell_type || '')) {
        if (!Number(pt.miles_count)) pt.miles_count = null;
        if (!Number(pt.award_tax_amount)) pt.award_tax_amount = null;
      }
      (pt.prices || []).forEach((pr) => { if (pr.upgrade_mile_price_program_id != null && !(Number(pr.upgrade_mile_price_program_id) > 0)) pr.upgrade_mile_price_program_id = null; });
    });
    const url = '/api/database/v1/priceQuotes/PriceQuoteFormModel/' + optionId;
    try {
      await apiSend('PUT', url, buildPqBody(r));
    } catch (e1) {
      // Second try: send the option exactly as the BO gave it to us
      // (every field), in case this kind of option needs more of them.
      const full = Object.assign({}, r);
      ['id', 'created_by', 'created_at', 'is_viewed', 'is_viewed_at', 'is_sent', 'is_sent_at'].forEach((k) => delete full[k]);
      if (full.published_price == null) full.published_price = 0;
      try { await apiSend('PUT', url, full); } catch (e2) { throw new Error(e1.message + (e2.message !== e1.message ? ' / ' + e2.message : '')); }
    }
    // Never trust "saved" on its word: read the option back from the BO and
    // only report success if the new Sell price is really stored there.
    const back = await loadOptionDetail(optionId);
    const stored = back && (back.preTickets || []).map((pt) => (pt.prices || []).find((p) => String(p.passenger_type).toLowerCase() === want)).filter(Boolean)
      .reduce((t, p) => t + (Number(p.sell_amount) || 0), 0);
    if (!back || Math.abs((stored || 0) - value) > 0.02) {
      throw new Error('The BO did not keep the new Sell price (it still has ' + money(stored || 0) + '). Please set it with edit.');
    }
    return back;
  }

  const money = (n) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const parseCell = (t) => parseFloat(String(t || '').replace(/[^\d.-]/g, '')) || 0;

  // Accepts plain prices only: 8103 / 8103.24 / 8,103.24 / $8103.24.
  // Two or more dots in a row count as one ("8103..24" -> 8103.24).
  // Anything else (letters, quotes, two separate dots...) is refused.
  function parseSellInput(raw) {
    let t = String(raw || '').trim().replace(/^\$\s*/, '').replace(/\.{2,}/g, '.');
    if (/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(t)) t = t.replace(/,/g, '');
    if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
    const v = Math.round(parseFloat(t) * 100) / 100;
    return Number.isFinite(v) ? v : null;
  }
  function showSellToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'ia-sell-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 6000);
  }

  // ---- $0.00 send guard ---------------------------------------------
  // Pressing Send on the quote email: if any quote in it shows $0.00,
  // stop and ask first.
  function zeroPriceQuotes() {
    const docs = [document];
    document.querySelectorAll('iframe').forEach((f) => { try { if (f.contentDocument) docs.push(f.contentDocument); } catch (e) { /* other origin */ } });
    const hits = [];
    docs.forEach((d) => {
      d.querySelectorAll('b.n').forEach((b) => {
        const t = b.textContent.replace(/\s+/g, ' ').trim();
        if (!/^\$\s?0(\.0+)?(\s|$)/.test(t)) return;
        const cell = b.closest('td') || b.parentElement;
        const img = cell && cell.querySelector('img[alt]');
        hits.push(img ? img.getAttribute('alt') : 'a quote');
      });
      // The other email design: "$0.00 USD" in a bold <p>, with "Total per
      // adult" under it and the airline's logo (carrier_img/PR.png) above.
      d.querySelectorAll('p').forEach((p) => {
        if (p.closest('b.n')) return;
        const t = p.textContent.replace(/\s+/g, ' ').trim();
        if (!/^\$\s?0(\.0+)?(\s?[A-Z]{3})?$/.test(t)) return;
        const cell = p.closest('td') || p.parentElement;
        if (!cell || !/total per|per (adult|person|passenger)/i.test(cell.textContent)) return;
        const img = cell.querySelector('img');
        const alt = img && img.getAttribute('alt');
        const code = img && ((img.getAttribute('src') || '').match(/carrier_img\/([A-Z0-9]{2})\./i) || [])[1];
        hits.push(alt || (code ? code.toUpperCase() : 'a quote'));
      });
    });
    return hits;
  }
  let zeroSendApproved = false;
  if (window.top === window) {
    document.addEventListener('click', (e) => {
      const btn = e.target && e.target.closest && e.target.closest('button.button.--primary');
      if (!btn || btn.textContent.trim() !== 'Send') return;
      if (zeroSendApproved) { zeroSendApproved = false; return; }
      const hits = zeroPriceQuotes();
      if (!hits.length) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const back = document.createElement('div');
      back.className = 'ia-zero-back';
      const box = document.createElement('div');
      box.className = 'ia-zero-box';
      const h = document.createElement('div');
      h.className = 'ia-zero-title';
      h.textContent = '$0.00 price in this send';
      box.appendChild(worriedPip(84));
      const p2 = document.createElement('div');
      p2.className = 'ia-zero-text';
      p2.textContent = (hits.length === 1 ? '1 quote shows' : hits.length + ' quotes show') + ' $0.00 to the client (' + hits.join(', ') + '). Set the Sell price before sending.';
      const row = document.createElement('div');
      row.className = 'ia-zero-row';
      const no = document.createElement('button');
      no.type = 'button'; no.className = 'ia-zero-no'; no.textContent = 'Go back';
      const yes = document.createElement('button');
      yes.type = 'button'; yes.className = 'ia-zero-yes'; yes.textContent = 'Send anyway';
      row.append(no, yes);
      box.append(h, p2, row);
      back.appendChild(box);
      document.body.appendChild(back);
      no.focus();
      no.addEventListener('click', () => back.remove());
      yes.addEventListener('click', () => { back.remove(); zeroSendApproved = true; btn.click(); });
    }, true);
  }

  // Which option a price table belongs to — read from the page at the
  // moment it's needed. (The BO reuses the same table elements for
  // different options when its list re-renders, so an id remembered
  // earlier can point at the wrong option: that is what made a new price
  // land on the option below and not on the one that was edited.)
  function optionIdOfTable(table) {
    const opt = table.closest('.lead-option') || table.closest('[class*="lead-option"]');
    let cb = opt && opt.querySelector('input[id^="checkbox-switch-"]');
    for (let up = table.parentElement; !cb && up && up !== document.body; up = up.parentElement) {
      const all = up.querySelectorAll('input[id^="checkbox-switch-"]');
      if (all.length === 1) cb = all[0];
      if (all.length > 1) break;
    }
    return cb ? cb.id.replace('checkbox-switch-', '') : null;
  }

  // Flight fingerprint of a segment line: "AC8502 21APR ATLYYZ".
  function segSig(line) {
    const m = String(line || '').toUpperCase().match(/\b([A-Z0-9]{2})\s*\*?\s*(\d{1,4})\s+[A-Z]\s+(\d{2}[A-Z]{3})\s+([A-Z]{3})\s*([A-Z]{3})\b/);
    return m ? m[1] + parseInt(m[2], 10) + ' ' + m[3] + ' ' + m[4] + m[5] : null;
  }
  // The flights shown in the same option card as this price table.
  function shownSegSigs(table) {
    for (let up = table.parentElement; up && up !== document.body; up = up.parentElement) {
      const boxes = up.querySelectorAll('.lead-option-segment-segments');
      if (boxes.length > 1) return null; // went past this option
      if (boxes.length === 1) {
        const sigs = Array.from(boxes[0].querySelectorAll(':scope > pre')).map((p) => segSig((p.querySelector('.overflow-hidden') || p).textContent)).filter(Boolean);
        return sigs.length ? sigs : null;
      }
    }
    return null;
  }
  function detailSegSigs(r) {
    return (r.segments || []).slice().sort((a, b) => (a.number || 0) - (b.number || 0)).map((sg) => segSig(sg.line_raw)).filter(Boolean);
  }
  // Finds the option this price table REALLY belongs to: its flights and
  // its Net must match what the BO has for that option. Tries the option
  // the page layout points at first, then every other option on the page.
  // Returns null unless exactly one option matches.
  async function resolveOptionForTable(table, type, netShown) {
    const want = { ADT: 'adult', CHD: 'child', INF: 'infant' }[type];
    const sigs = shownSegSigs(table);
    const first = optionIdOfTable(table);
    const ids = Array.from(new Set([first].concat(Array.from(document.querySelectorAll('input[id^="checkbox-switch-"]')).map((c) => c.id.replace('checkbox-switch-', ''))).filter(Boolean)));
    const fits = (r) => {
      if (!r) return false;
      if (sigs && detailSegSigs(r).join('|') !== sigs.join('|')) return false;
      if (netShown != null) {
        const netBo = (r.preTickets || []).map((pt) => (pt.prices || []).find((x) => String(x.passenger_type).toLowerCase() === want)).filter(Boolean)
          .reduce((t, x) => t + (Number(x.net_price) || 0), 0);
        if (Math.abs(netBo - netShown) > 1) return false;
      }
      return true;
    };
    if (!sigs && netShown == null) return null; // nothing to check against: refuse
    if (first) {
      const r = await loadOptionDetail(first);
      if (fits(r) && sigs) return { id: first, netChecked: true }; // flights + Net match: certain
    }
    const details = await Promise.all(ids.map((id) => loadOptionDetail(id).then((r) => ({ id, r })).catch(() => ({ id, r: null }))));
    const hits = details.filter((d) => fits(d.r));
    if (hits.length === 1) return { id: hits[0].id, netChecked: true };
    // Award options: the Net the page shows (miles value + taxes) isn't the
    // number the BO stores, so the Net check can't be used. Then the option
    // is accepted only when two independent things agree: it's the ONLY
    // option on the page with exactly these flights, AND it's the option
    // this table sits in.
    if (!hits.length && sigs && first) {
      const sameFlights = details.filter((d) => d.r && detailSegSigs(d.r).join('|') === sigs.join('|'));
      if (sameFlights.length === 1 && sameFlights[0].id === first) return { id: first, netChecked: false };
    }
    return null;
  }

  function wireSellEdit() {
    if (window.top !== window) return;
    document.querySelectorAll('table.lead-option-price-table').forEach((table) => {
      const heads = Array.from(table.querySelectorAll('thead th')).map((th) => th.textContent.trim().toUpperCase());
      const sellIdx = heads.indexOf('SELL');
      const netIdx = heads.indexOf('NET');
      if (sellIdx < 0) return;
      if (!optionIdOfTable(table)) return;
      table.querySelectorAll('tbody tr').forEach((tr) => {
        const tds = tr.querySelectorAll('td');
        const type = (tds[0] ? tds[0].textContent : '').trim().toUpperCase();
        if (!['ADT', 'CHD', 'INF'].includes(type)) return;
        const cell = tds[sellIdx];
        if (!cell || cell.querySelector('.ia-sell-pen')) return;
        const pen = document.createElement('span');
        pen.className = 'ia-sell-pen';
        pen.title = 'Edit ' + type + ' sell price';
        pen.innerHTML = '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
        cell.insertBefore(pen, cell.firstChild);
        cell.style.whiteSpace = 'nowrap';
        const zero = () => { const t = Array.from(cell.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join(''); return parseCell(t) === 0; };
        const syncPen = () => { if (!cell.querySelector('.ia-sell-input')) pen.style.display = zero() ? '' : 'none'; };
        syncPen();
        cell._jsSyncPen = syncPen;
        cell.classList.add('ia-sell-cell');
        cell.title = 'Click to edit ' + type + ' sell price';
        cell.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (cell.querySelector('.ia-sell-input')) return;
          const textNode = Array.from(cell.childNodes).find((n) => n.nodeType === 3 && n.textContent.trim());
          const old = parseCell(textNode ? textNode.textContent : cell.textContent);
          const input = document.createElement('input');
          input.className = 'ia-sell-input';
          input.type = 'text';
          input.inputMode = 'decimal';
          input.value = old ? String(old) : '';
          cell.style.whiteSpace = 'nowrap';
          if (textNode) textNode.textContent = '';
          pen.style.display = 'none';
          cell.appendChild(input);
          input.focus();
          input.select();
          let busy = false;
          const close = (shown) => { input.remove(); if (textNode) textNode.textContent = shown; pen.style.display = ''; if (cell._jsSyncPen) cell._jsSyncPen(); };
          const commit = async () => {
            if (busy) return;
            const v = parseSellInput(input.value);
            if (v === null) {
              // Not a clean number (e.g. "8103.'24"): refuse, keep editing.
              input.classList.add('is-bad');
              input.title = 'Numbers only, e.g. 8103.24';
              showSellToast('Not saved \u2014 "' + input.value + '" is not a valid price. Use numbers only, e.g. 8103.24');
              setTimeout(() => input.focus(), 0);
              return;
            }
            if (v === old) { close(money(old)); return; }
            busy = true;
            input.disabled = true;
            input.classList.add('is-saving');
            try {
              // Re-read everything from the page right now: the option this
              // table shows, and this row's Net (used as a cross-check).
              const rowNow = Array.from(table.querySelectorAll('tbody tr')).find((r) => ((r.querySelector('td') || {}).textContent || '').trim().toUpperCase() === type);
              const netShown = rowNow && netIdx >= 0 ? parseCell(rowNow.querySelectorAll('td')[netIdx].textContent) : null;
              // Identify the option by its flights + Net in the BO, never by
              // page position alone.
              const found = await resolveOptionForTable(table, type, netShown);
              if (!found) throw new Error('could not be sure which option this is, so nothing was changed \u2014 please use edit for this one');
              await saveSellPrice(found.id, type, Math.round(v * 100) / 100, found.netChecked ? netShown : null);
              close(money(v));
              cell.classList.add('ia-sell-saved');
              setTimeout(() => cell.classList.remove('ia-sell-saved'), 1200);
              // Keep the TTL row and the profit badge in step.
              const rows = Array.from(table.querySelectorAll('tbody tr'));
              const ttl = rows.find((r) => /^TTL$/i.test((r.querySelector('td') || {}).textContent.trim()));
              if (ttl) {
                let sum = 0;
                let net = 0;
                rows.forEach((r) => {
                  const c = r.querySelectorAll('td');
                  if (!['ADT', 'CHD', 'INF'].includes((c[0] || {}).textContent.trim().toUpperCase())) return;
                  const qty = parseCell((c[1] || {}).textContent) || 1;
                  const sellTxt = Array.from(c[sellIdx].childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join('');
                  sum += parseCell(sellTxt) * qty;
                  if (netIdx >= 0) net += parseCell(c[netIdx].textContent) * qty;
                });
                const tc = ttl.querySelectorAll('td')[sellIdx];
                if (tc) tc.textContent = money(sum);
                const badge = table.parentElement && table.parentElement.querySelector('.lead-option-price-total');
                if (badge && netIdx >= 0) badge.textContent = money(sum - net);
              }
            } catch (err) {
              close(money(old));
              cell.classList.add('ia-sell-err');
              cell.title = 'Not saved: ' + (err && err.message ? err.message : err);
              const toast = document.createElement('div');
              toast.className = 'ia-sell-toast';
              toast.textContent = 'Sell price not saved: ' + (err && err.message ? err.message : err);
              document.body.appendChild(toast);
              setTimeout(() => toast.remove(), 7000);
              setTimeout(() => cell.classList.remove('ia-sell-err'), 2500);
            }
          };
          input.addEventListener('input', () => { input.classList.remove('is-bad'); });
          input.addEventListener('keydown', (ev) => {
            ev.stopPropagation();
            if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
            if (ev.key === 'Escape') { ev.preventDefault(); close(money(old)); }
          });
          input.addEventListener('blur', () => { if (busy) return; if (parseSellInput(input.value) === null) { close(money(old)); return; } commit(); });
          ['click', 'mousedown'].forEach((t) => input.addEventListener(t, (ev) => ev.stopPropagation()));
        });
      });
    });
  }

  // ==================================================================
  // SEARCH PANEL — replaces the BO's Kayak-price box on a lead with quick
  // search buttons for that lead (Google, ELR, Matrix ▾, PointsYeah ▾,
  // Basis ▾, Kayak) plus cabin / ±days and "Open all" (Kayak + Matrix in
  // background tabs). The lead's route, dates and passengers are read from
  // the BO's own Matrix link inside that same box. URL builders adapted
  // from Ian Brown's Flight Search widget.
  // ==================================================================
  const FXP_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const FXP_ITA_CABIN = { COACH: 'Y', ECONOMY: 'Y', 'PREMIUM-COACH': 'W', PREMIUM_COACH: 'W', 'PREMIUM-ECONOMY': 'W', PREMIUM_ECONOMY: 'W', BUSINESS: 'B', FIRST: 'F' };
  const srchCabinLabel = (c) => ({ Y: 'Economy', W: 'Premium Economy', B: 'Business', F: 'First' }[c] || 'Business');
  const srchAddDays = (d, n) => { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
  const srchFmt = (d) => { if (!d) return '?'; const p = d.split('-'); return parseInt(p[2], 10) + ' ' + FXP_MONTHS[parseInt(p[1], 10) - 1]; };

  function srchLeadFromBox(box) {
    const a = box.querySelector('a[href*="matrix.itasoftware.com/search"]');
    if (!a) return null;
    let p;
    try { p = JSON.parse(atob(new URL(a.href, location.origin).searchParams.get('search'))); } catch (e) { return null; }
    if (!p || !Array.isArray(p.slices) || !p.slices.length) return null;
    const segs = p.slices.map((sl) => ({
      origin: (Array.isArray(sl.origin) ? sl.origin[0] : sl.origin) || null,
      destination: (Array.isArray(sl.dest) ? sl.dest[0] : sl.dest) || null,
      departureDate: (sl.dates && sl.dates.departureDate) || null,
      returnDate: (sl.dates && sl.dates.returnDate) || null,
    })).filter((s) => s.origin && s.destination && s.departureDate);
    if (!segs.length) return null;
    const pax = p.pax || {};
    return {
      segments: segs,
      cabin: FXP_ITA_CABIN[String((p.options && p.options.cabin) || '').toUpperCase()] || 'B',
      adults: parseInt(pax.adults, 10) || 1,
      children: parseInt(pax.children, 10) || 0,
      infants: (parseInt(pax.infantInLap, 10) || 0) + (parseInt(pax.infantInSeat, 10) || 0),
    };
  }
  function srchLegs(lead) {
    const s = lead.segments;
    if (s.length === 1) {
      const legs = [{ label: 'Outbound', origin: s[0].origin, destination: s[0].destination, date: s[0].departureDate }];
      if (s[0].returnDate) legs.push({ label: 'Inbound', origin: s[0].destination, destination: s[0].origin, date: s[0].returnDate });
      return legs;
    }
    return s.map((x, i) => ({ label: 'Leg ' + (i + 1), origin: x.origin, destination: x.destination, date: x.departureDate }));
  }
  function srchKayak(lead, flex, cab) {
    const cabin = { Y: 'economy', W: 'premium', B: 'business', F: 'first' }[cab] || 'business';
    const f = (d) => (d && flex > 0 ? d + '-flexible-' + flex + 'days' : d);
    const s = lead.segments;
    let path;
    if (s.length === 1) {
      path = '/flights/' + s[0].origin + '-' + s[0].destination + '/' + f(s[0].departureDate);
      if (s[0].returnDate) path += '/' + f(s[0].returnDate);
    } else {
      path = '/flights/' + s.map((x) => x.origin + '-' + x.destination + '/' + f(x.departureDate)).join('/');
    }
    path += '/' + cabin + '/' + lead.adults + 'adults';
    const t = [];
    for (let i = 0; i < lead.infants; i++) t.push('1L');
    for (let i = 0; i < lead.children; i++) t.push('8');
    if (t.length) path += '/children-' + t.join('-');
    return 'https://www.kayak.com' + path + '?sort=bestflight_a';
  }
  function srchPbVarint(n) { const o = []; while (n > 127) { o.push((n & 0x7f) | 0x80); n >>>= 7; } o.push(n); return o; }
  const srchPbTag = (f, w) => srchPbVarint((f << 3) | w);
  const srchPbStr = (f, v) => { const b = Array.from(new TextEncoder().encode(v)); return [...srchPbTag(f, 2), ...srchPbVarint(b.length), ...b]; };
  const srchPbMsg = (f, b) => [...srchPbTag(f, 2), ...srchPbVarint(b.length), ...b];
  const srchPbNum = (f, v) => [...srchPbTag(f, 0), ...srchPbVarint(v)];
  function srchGoogle(lead, addYvr, cab) {
    const legs = srchLegs(lead).filter((l) => l.date && l.origin && l.destination);
    if (!legs.length) return 'https://www.google.com/travel/flights';
    let tripType;
    if (addYvr) {
      legs.push({ origin: legs[0].origin, destination: 'YVR', date: srchAddDays(legs[legs.length - 1].date, 1) });
      tripType = 3;
    } else {
      tripType = lead.segments.length > 1 ? 3 : (lead.segments[0].returnDate ? 1 : 2);
    }
    let body = [];
    legs.forEach((l) => { body = body.concat(srchPbMsg(3, [].concat(srchPbStr(2, l.date), srchPbMsg(13, srchPbStr(2, l.origin)), srchPbMsg(14, srchPbStr(2, l.destination))))); });
    for (let i = 0; i < lead.adults; i++) body = body.concat(srchPbNum(8, 1));
    for (let i = 0; i < lead.children; i++) body = body.concat(srchPbNum(8, 2));
    for (let i = 0; i < lead.infants; i++) body = body.concat(srchPbNum(8, 4));
    body = body.concat(srchPbNum(9, { Y: 1, W: 2, B: 3, F: 4 }[cab] || 3), srchPbNum(19, tripType));
    const tfs = btoa(String.fromCharCode.apply(null, body)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return 'https://www.google.com/travel/flights?tfs=' + tfs + '&hl=en&curr=USD';
  }
  const FXP_ITA_EXT = { B: '2', W: 'premium-coach', F: '1', Y: '3' };
  function srchMatrix(lead, cab, mixDep, mixRet, flex) {
    const cabinMap = { Y: 'COACH', W: 'PREMIUM-COACH', B: 'BUSINESS', F: 'FIRST' };
    const segs = lead.segments;
    const multi = segs.length > 1;
    const n = Math.min(Math.max(parseInt(flex, 10) || 0, 0), 2);
    const mod = String(n) + String(n);
    const pax = { adults: String(lead.adults) };
    if (lead.children > 0) pax.children = String(lead.children);
    if (lead.infants > 0) pax.infantInLap = String(lead.infants);
    const ext = (c) => (c ? '+cabin ' + (FXP_ITA_EXT[c] || '2') : '');
    const slices = [];
    if (multi) {
      segs.forEach((s, i) => {
        const mix = i === segs.length - 1 ? (mixRet || mixDep) : (mixDep || mixRet);
        slices.push({ origin: [s.origin], dest: [s.destination], routing: '', ext: ext(mix), dates: { searchDateType: 'specific', departureDate: s.departureDate, departureDateType: 'depart', departureDateModifier: mod, departureDatePreferredTimes: [] } });
      });
    } else {
      const s = segs[0];
      const dates = { searchDateType: 'specific', departureDate: s.departureDate, departureDateType: 'depart', departureDateModifier: mod, departureDatePreferredTimes: [] };
      if (s.returnDate) Object.assign(dates, { returnDate: s.returnDate, returnDateType: 'depart', returnDateModifier: mod, returnDatePreferredTimes: [] });
      slices.push({ origin: [s.origin], dest: [s.destination], routing: '', ext: ext(mixDep), routingRet: '', extRet: s.returnDate ? ext(mixRet) : '', dates });
    }
    const payload = {
      type: multi ? 'multi-city' : (segs[0].returnDate ? 'round-trip' : 'one-way'),
      slices,
      options: { cabin: (mixDep || mixRet) ? 'COACH' : (cabinMap[cab] || 'BUSINESS'), stops: '-1', extraStops: '1', allowAirportChanges: 'true', showOnlyAvailable: 'true', currency: { displayName: 'United States Dollar (USD)', code: 'USD' } },
      pax,
    };
    return 'https://matrix.itasoftware.com/search?search=' + encodeURIComponent(btoa(JSON.stringify(payload)));
  }
  function srchPointsYeah(lead, leg, flex, cab) {
    const c = srchCabinLabel(cab);
    let d1 = leg.date;
    let d2 = leg.date;
    let multi = false;
    if (flex > 0) { d1 = srchAddDays(leg.date, -flex); d2 = srchAddDays(leg.date, flex); multi = true; }
    const q = new URLSearchParams({ cabins: c, cabin: c, banks: 'Amex,Bilt,Capital One,Chase,Citi,WF', airlineProgram: 'AR,AM,AC,KL,AS,AA,AV,DL,EY,AY,B6,LH,QF,SK,TK,UA,VS,VA', tripType: '1', adults: String(lead.adults), children: String(lead.children), departure: leg.origin, arrival: leg.destination, departDate: d1, departDateSec: d2, multiday: String(multi) });
    return 'https://www.pointsyeah.com/search?' + q.toString();
  }
  // Basis (agentsearch): one "pax" number — children and infants count as
  // adults there (award seats cost the same miles). Taken from the lead
  // card's passenger icons when shown (the BO's own search link can lag).
  const FXP_BASIS_PROGRAMS = ['AC', 'KL', 'AS', 'AA', 'AV', 'BA', 'CM', 'DL', 'EY', 'B6', 'QF', 'SQ', 'TP', 'TK', 'UA', 'VS', 'LH', 'QR'];
  function srchPaxTotal(lead) {
    try {
      const m = location.pathname.match(/\/leads\/(\d+)/);
      const card = m && readLeadCard(m[1]);
      if (card && card.pax) { const t = (card.pax.adults || 0) + (card.pax.children || 0) + (card.pax.infants || 0); if (t > 0) return t; }
    } catch (e) { /* fall back to the search link */ }
    return Math.max(1, (lead.adults || 0) + (lead.children || 0) + (lead.infants || 0));
  }
  function srchBasisStop(from, to, date, flex) {
    return { origin: [{ code: from, city: from }], destination: [{ code: to, city: to }], date: { value: date, range: Math.min(Math.max(parseInt(flex, 10) || 0, 0), 7) } };
  }
  function srchBasis(lead, leg, cab, flex) {
    const payload = {
      tripType: 'oneway',
      stops: [srchBasisStop(leg.origin, leg.destination, leg.date, flex)],
      pax: String(srchPaxTotal(lead)), cabin: srchCabinLabel(cab),
      programs: FXP_BASIS_PROGRAMS,
      enableHC: false, enableFlybasisCPMs: false, isMax: false,
    };
    return 'https://agentsearch.vercel.app/flights?s=' + encodeURIComponent(btoa(JSON.stringify(payload)));
  }
  // Multi-airport search: up to 3 airports on each side.
  const srchCodes = (list) => list.map((c) => ({ code: c, city: c }));
  function srchBasisMulti(lead, from, to, outDate, retDate, cab, flex) {
    const stop = (a, b, d) => ({ origin: srchCodes(a), destination: srchCodes(b), date: { value: d, range: Math.min(Math.max(parseInt(flex, 10) || 0, 0), 7) } });
    const payload = {
      tripType: retDate ? 'roundtrip' : 'oneway',
      stops: retDate ? [stop(from, to, outDate), stop(to, from, retDate)] : [stop(from, to, outDate)],
      pax: String(srchPaxTotal(lead)), cabin: srchCabinLabel(cab),
      programs: FXP_BASIS_PROGRAMS,
      enableHC: false, enableFlybasisCPMs: false, isMax: false,
    };
    return 'https://agentsearch.vercel.app/flights?s=' + encodeURIComponent(btoa(JSON.stringify(payload)));
  }
  // Home side = where the trip starts and ends; far side = every other
  // airport. CHI→HAN + KTI→CHI gives CHI / HAN + KTI; HAN→CHI + CHI→KTI
  // gives HAN + KTI / CHI.
  function srchMultiSides(lead) {
    const segs = lead.segments;
    if (segs.length === 1) return { from: [segs[0].origin], to: [segs[0].destination], out: segs[0].departureDate, ret: segs[0].returnDate || null };
    const home = [segs[0].origin, segs[segs.length - 1].destination].filter((c, i, a) => a.indexOf(c) === i);
    const far = [];
    segs.forEach((x) => [x.origin, x.destination].forEach((c) => { if (!home.includes(c) && !far.includes(c)) far.push(c); }));
    return { from: home.slice(0, 3), to: far.slice(0, 3), out: segs[0].departureDate, ret: segs[segs.length - 1].departureDate };
  }
  function srchMultiBox(btn, lead, cab, flex) {
    const again = srchMenu && srchMenu.btn === btn && srchMenu.multi;
    srchCloseMenu();
    if (again) return;
    const sides = srchMultiSides(lead);
    const el = document.createElement('div');
    el.className = 'ia-fxp-menu ia-fxp-menu--fb ia-fxp-ma';
    const h = document.createElement('div');
    h.className = 'ia-fxp-menu-h';
    h.className += ' ia-fxp-ma-h';
    const hT = document.createElement('span');
    hT.textContent = 'Basis \u00b7 up to 3 airports each side \u00b7 up to \u00b17 days';
    const hX = document.createElement('button');
    hX.type = 'button';
    hX.className = 'ia-fxp-ma-close';
    hX.title = 'Close';
    hX.setAttribute('aria-label', 'Close');
    hX.textContent = '\u00d7';
    hX.addEventListener('click', (e) => { e.stopPropagation(); srchCloseMenu(); });
    h.append(hT, hX);
    const row = document.createElement('div');
    row.className = 'ia-fxp-ma-row';
    // Airport chips: 3 letters (or a space/comma/Enter) makes a chip;
    // Backspace in an empty box removes the last whole code; x removes one.
    const box = (ph, val, icon) => {
      const w = document.createElement('label');
      w.className = 'ia-fxp-ma-box';
      const i = document.createElement('span');
      i.className = 'ia-fxp-ma-ic';
      i.textContent = icon;
      const chips = document.createElement('span');
      chips.className = 'ia-fxp-ma-chips';
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.spellcheck = false;
      inp.autocomplete = 'off';
      inp.maxLength = 3;
      const st = { list: val.slice(0, 3), w, inp };
      const paint = () => {
        chips.textContent = '';
        st.list.forEach((code, idx) => {
          const c = document.createElement('span');
          c.className = 'ia-fxp-ma-chip';
          c.textContent = code;
          const x = document.createElement('button');
          x.type = 'button';
          x.className = 'ia-fxp-ma-x';
          x.setAttribute('aria-label', 'Remove ' + code);
          x.textContent = '\u00d7';
          x.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); st.list.splice(idx, 1); paint(); inp.focus(); });
          c.appendChild(x);
          chips.appendChild(c);
        });
        inp.placeholder = st.list.length ? '' : ph;
        inp.style.display = st.list.length >= 3 ? 'none' : '';
        err.textContent = '';
      };
      st.add = (t) => {
        const code = String(t || '').toUpperCase().replace(/[^A-Z]/g, '');
        if (code.length !== 3) return false;
        if (!st.list.includes(code) && st.list.length < 3) st.list.push(code);
        inp.value = '';
        paint();
        return true;
      };
      st.set = (list) => { st.list = list.slice(0, 3); paint(); };
      inp.addEventListener('input', () => {
        inp.value = inp.value.toUpperCase().replace(/[^A-Z]/g, '');
        if (inp.value.length === 3) st.add(inp.value);
      });
      inp.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Backspace' && !inp.value && st.list.length) { e.preventDefault(); st.list.pop(); paint(); return; }
        if ((e.key === ' ' || e.key === ',' || e.key === '+') ) { e.preventDefault(); st.add(inp.value); return; }
        if (e.key === 'Enter') { e.preventDefault(); if (inp.value) st.add(inp.value); else go(sides.ret ? 'rt' : 'out'); }
      });
      w.addEventListener('click', () => { if (st.list.length < 3) inp.focus(); });
      w.append(i, chips, inp);
      st.paint = paint;
      return st;
    };
    const err = document.createElement('div');
    err.className = 'ia-fxp-ma-err';
    const A = box('Where from', sides.from, '\u25ce');
    const B = box('Where to', sides.to, '\u25c9');
    A.paint();
    B.paint();
    const sw = document.createElement('button');
    sw.type = 'button';
    sw.className = 'ia-fxp-ma-sw';
    sw.title = 'Swap';
    sw.setAttribute('aria-label', 'Swap from and to');
    sw.textContent = '\u21c4';
    sw.addEventListener('click', (e) => { e.stopPropagation(); const t = A.list.slice(); A.set(B.list); B.set(t); });
    row.append(A.w, sw, B.w);
    // Dates (editable) and date range (Fixed … ±7 days) for this search.
    const info = document.createElement('div');
    info.className = 'ia-fxp-ma-info';
    const dateIn = (val, label) => {
      const d = document.createElement('input');
      d.type = 'date';
      d.className = 'ia-fxp-ma-date';
      d.value = val || '';
      d.setAttribute('aria-label', label);
      d.addEventListener('keydown', (e) => e.stopPropagation());
      return d;
    };
    const dOut = dateIn(sides.out, 'Outbound date');
    info.appendChild(dOut);
    let dRet = null;
    if (sides.ret) {
      const arrow = document.createElement('span');
      arrow.className = 'ia-fxp-ma-arrow';
      arrow.textContent = '\u2192';
      dRet = dateIn(sides.ret, 'Return date');
      info.append(arrow, dRet);
    }
    let range = Math.min(Math.max(parseInt(flex, 10) || 0, 0), 7);
    const pills = document.createElement('span');
    pills.className = 'ia-fxp-ma-pills';
    pills.setAttribute('role', 'group');
    pills.setAttribute('aria-label', 'Date range');
    const paintPills = () => pills.querySelectorAll('button').forEach((b) => b.classList.toggle('on', +b.dataset.v === range));
    [0, 1, 2, 3, 4, 5, 6, 7].forEach((v) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.v = String(v);
      b.textContent = v ? '\u00b1' + v : 'Fixed';
      b.addEventListener('click', (e) => { e.stopPropagation(); range = v; paintPills(); });
      pills.appendChild(b);
    });
    paintPills();
    info.appendChild(pills);
    const acts = document.createElement('div');
    acts.className = 'ia-fxp-ma-acts';
    const go = (mode) => {
      [A, B].forEach((x) => { if (x.inp.value) x.add(x.inp.value); });
      const from = A.list, to = B.list;
      if (!from.length || !to.length) { err.textContent = 'Add at least one airport on each side'; return; }
      if (from.length > 3 || to.length > 3) { err.textContent = 'Up to 3 airports on each side'; return; }
      // Both = two one-way searches (outbound and return), not a round trip.
      const urls = [];
      const out = dOut.value, ret = dRet ? dRet.value : null;
      if ((mode === 'out' || mode === 'rt') && !out) { err.textContent = 'Pick the outbound date'; return; }
      if ((mode === 'ret' || mode === 'rt') && !ret) { err.textContent = 'Pick the return date'; return; }
      if (mode === 'out' || mode === 'rt') urls.push(srchBasisMulti(lead, from, to, out, null, cab, range));
      if (mode === 'ret' || mode === 'rt') urls.push(srchBasisMulti(lead, to, from, ret, null, cab, range));
      // The box stays open, so the other leg can be searched next.
      // It closes with x, Esc, or a click anywhere outside it.
      urls.forEach((u) => srchOpenBg(u)); // new tabs in the background: you stay on the lead
      return true;
    };
    const mkAct = (label, mode, main) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ia-fxp-ma-go' + (main ? ' is-main' : '');
      b.textContent = label;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!go(mode)) return;
        b.textContent = '\u2713 opened';
        clearTimeout(b._iaT);
        b._iaT = setTimeout(() => { b.textContent = label; }, 1600);
      });
      acts.appendChild(b);
    };
    mkAct('Outbound', 'out', !sides.ret);
    if (sides.ret) { mkAct('Return', 'ret', false); mkAct('Both \u2197', 'rt', true); }
    el.append(h, row, info, acts, err);
    el.addEventListener('mousedown', (e) => e.stopPropagation());
    document.body.appendChild(el);
    const r = btn.getBoundingClientRect();
    el.style.left = Math.max(8, Math.min(r.left, window.innerWidth - el.offsetWidth - 8)) + 'px';
    el.style.top = (r.bottom + 4) + 'px';
    btn.classList.add('is-open');
    srchMenu = { el, btn, multi: true };
    setTimeout(() => B.inp.focus(), 0);
  }

  function srchBasisRound(lead, cab, flex) {
    const s0 = lead.segments[0];
    const payload = {
      tripType: 'roundtrip',
      stops: [srchBasisStop(s0.origin, s0.destination, s0.departureDate, flex), srchBasisStop(s0.destination, s0.origin, s0.returnDate, flex)],
      pax: String(srchPaxTotal(lead)), cabin: srchCabinLabel(cab),
      programs: FXP_BASIS_PROGRAMS,
      enableHC: false, enableFlybasisCPMs: false, isMax: false,
    };
    return 'https://agentsearch.vercel.app/flights?s=' + encodeURIComponent(btoa(JSON.stringify(payload)));
  }

  // Search links open in a new tab behind the BO, so you stay on the lead.
  const srchOpen = (url) => srchOpenBg(url);
  const srchOpenBg = (url) => {
    try { if (typeof GM_openInTab === 'function') { GM_openInTab(url, { active: false, insert: true, setParent: true }); return; } } catch (e) { /* fall back */ }
    window.open(url, '_blank', 'noopener');
  };

  let srchMenu = null;
  function srchCloseMenu() {
    if (srchMenu) { srchMenu.el.remove(); if (srchMenu.btn) srchMenu.btn.classList.remove('is-open'); srchMenu = null; }
  }
  function srchShowMenu(btn, title, items) {
    const again = srchMenu && srchMenu.btn === btn;
    srchCloseMenu();
    if (again) return; // second click on the same button closes it
    const el = document.createElement('div');
    el.className = 'ia-fxp-menu ia-fxp-menu--' + (btn.dataset.kind || 'x');
    const h = document.createElement('div');
    h.className = 'ia-fxp-menu-h';
    h.textContent = title;
    el.appendChild(h);
    items.forEach((it) => {
      const row = document.createElement('div');
      row.className = 'ia-fxp-menu-i';
      const a = document.createElement('span');
      a.textContent = it.label;
      const b = document.createElement('small');
      b.textContent = it.selected ? '\u2713' : (it.note || '');
      if (it.selected) row.classList.add('is-sel');
      if (it.toggle) {
        // Checkbox row: ticks on and off, the menu stays open.
        const box = document.createElement('span');
        box.className = 'ia-fxp-chk';
        const paint = () => { const on = it.checked(); box.classList.toggle('on', on); box.textContent = on ? '\u2713' : ''; row.classList.toggle('is-off', !on); };
        paint();
        row.classList.add('ia-fxp-menu-c');
        a.prepend(box);
        row.append(a, b);
        row.addEventListener('click', (e) => { e.stopPropagation(); it.toggle(); paint(); });
        el.appendChild(row);
        return;
      }
      row.append(a, b);
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        if (it.pick) { srchCloseMenu(); it.pick(); return; }
        const urls = it.urls ? it.urls() : [it.url()];
        urls.forEach((u) => srchOpen(u));
        // Ctrl (Cmd on Mac) or Shift held: keep the menu open to open more.
        if (e.ctrlKey || e.metaKey || e.shiftKey) { row.classList.add('is-opened'); b.textContent = '\u2713 opened'; return; }
        srchCloseMenu();
      });
      el.appendChild(row);
    });
    document.body.appendChild(el);
    const r = btn.getBoundingClientRect();
    const w = el.offsetWidth;
    el.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + 'px';
    el.style.top = (r.bottom + 4) + 'px';
    btn.classList.add('is-open');
    srchMenu = { el, btn };
  }
  if (window.top === window) {
    document.addEventListener('mousedown', (e) => { if (srchMenu && !srchMenu.el.contains(e.target) && !srchMenu.btn.contains(e.target)) srchCloseMenu(); }, true);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') srchCloseMenu(); });
    // Scrolling closes the small menus; the Basis box stays and follows its button.
    window.addEventListener('scroll', (e) => {
      if (!srchMenu) return;
      if (!srchMenu.multi) { srchCloseMenu(); return; }
      if (e.target && e.target.nodeType === 1 && srchMenu.el.contains(e.target)) return;
      const r = srchMenu.btn.getBoundingClientRect();
      srchMenu.el.style.top = (r.bottom + 4) + 'px';
      srchMenu.el.style.left = Math.max(8, Math.min(r.left, window.innerWidth - srchMenu.el.offsetWidth - 8)) + 'px';
    }, true);
  }

  const srchState = { cab: null, flex: 0 };
  // What "Open all" opens (ticked in its ▾ menu). Remembered.
  const FXP_OPENALL = [['g', 'Google', ''], ['e', 'ELR', ''], ['m', 'Matrix', ''], ['py', 'PointsYeah', 'each leg'], ['fb', 'Basis', 'each leg'], ['k', 'Kayak', '']];
  function srchOpenAllSet() {
    try { const v = JSON.parse(GM_getValue('js-fxp-openall', 'null')); if (Array.isArray(v)) return v; } catch (e) { /* default */ }
    return ['m', 'k'];
  }
  function srchSaveOpenAll(list) { try { GM_setValue('js-fxp-openall', JSON.stringify(list)); } catch (e) { /* ignore */ } }

  function wireSearchPanels() {
    if (window.top !== window) return;
    document.querySelectorAll('.kayak-offers').forEach((box) => {
      const body = box.querySelector(':scope > .kayak-offers-body');
      const foot = box.querySelector(':scope > .kayak-offers-footer');
      if (!body || !foot) return;
      // Re-read the lead each time the BO re-renders the box (its Matrix
      // link carries the route, dates and passengers).
      const fresh = srchLeadFromBox(box);
      if (fresh) {
        // The BO switched this box to other data (another lead, new dates):
        // rebuild the panel for it, with that lead's own cabin.
        const key = JSON.stringify(fresh);
        if (box._fxpKey !== key) {
          body.querySelectorAll(':scope > .ia-fxp-panel').forEach((n) => n.remove());
          foot.querySelectorAll(':scope > .ia-fxp-foot').forEach((n) => n.remove());
          box._fxpCab = fresh.cabin || 'B';
        }
        box._fxpKey = key;
        box._fxpLead = fresh;
      }
      const lead = box._fxpLead;
      if (!lead) return;
      box.classList.add('ia-fxp');
      if (body.querySelector(':scope > .ia-fxp-panel') && foot.querySelector(':scope > .ia-fxp-foot')) return;
      body.querySelectorAll(':scope > .ia-fxp-panel').forEach((n) => n.remove());
      foot.querySelectorAll(':scope > .ia-fxp-foot').forEach((n) => n.remove());
      if (!box._fxpCab) box._fxpCab = lead.cabin || 'B';
      const L = () => box._fxpLead;
      const cab = () => box._fxpCab;
      const flex = () => srchState.flex;

      const panel = document.createElement('div');
      panel.className = 'ia-fxp-panel';
      const mk = (label, kind, onClick) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ia-fxp-b ia-fxp-' + kind;
        b.dataset.kind = kind;
        b.textContent = label;
        b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); onClick(b); });
        panel.appendChild(b);
        return b;
      };
      mk('Google ↗', 'g', () => srchOpen(srchGoogle(L(), false, cab())));
      mk('ELR ↗', 'e', () => srchOpen(srchGoogle(L(), true, cab())));
      mk('Matrix ▾', 'm', (b) => {
        const lead2 = L();
        const items = [{ label: srchCabinLabel(cab()), note: 'regular search', url: () => srchMatrix(L(), cab(), null, null, flex()) }];
        if (lead2.segments.length > 1 || lead2.segments[0].returnDate) {
          items.push({ label: 'Business Outbound, Premium Inbound', note: '', url: () => srchMatrix(L(), null, 'B', 'W', flex()) });
          items.push({ label: 'Premium Outbound, Business Inbound', note: '', url: () => srchMatrix(L(), null, 'W', 'B', flex()) });
        }
        srchShowMenu(b, 'ITA Matrix', items);
      });
      const legMenu = (b, title, build) => {
        const legs = srchLegs(L()).filter((l) => l.date);
        if (legs.length === 1) { srchOpen(build(legs[0])); return; }
        const rows = legs.map((lg) => ({ label: lg.label, note: lg.origin + '→' + lg.destination + ' · ' + srchFmt(lg.date), url: () => build(lg) }));
        // One row that opens every leg at once.
        rows.unshift({ label: legs.length === 2 ? 'Both' : 'All ' + legs.length + ' legs', note: 'opens ' + legs.length + ' tabs', urls: () => legs.map((lg) => build(lg)) });
        srchShowMenu(b, title + ' \u00b7 Ctrl+click to pick more', rows);
      };
      mk('PointsYeah ▾', 'py', (b) => legMenu(b, 'PointsYeah', (lg) => srchPointsYeah(L(), lg, flex(), cab())));
      // Basis opens the multi-airport box straight away (its Outbound /
      // Return / Round trip buttons cover the single searches too).
      mk('Basis ▾', 'fb', (b) => srchMultiBox(b, L(), cab(), flex()));
      mk('Kayak ↗', 'k', () => srchOpen(srchKayak(L(), flex(), cab())));
      body.appendChild(panel);

      const fwrap = document.createElement('div');
      fwrap.className = 'ia-fxp-foot';
      const left = document.createElement('div');
      left.className = 'ia-fxp-foot-l';
      // Cabin and date-range pickers, in the panel's own menu style.
      const picker = (kind, title, opts, get, set) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ia-fxp-pick';
        b.dataset.kind = kind;
        const show = () => { const o = opts.find((x) => x[0] === get()); b.textContent = (o ? o[1] : opts[0][1]) + ' \u25be'; };
        show();
        b.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          srchShowMenu(b, title, opts.map(([v, t]) => ({ label: t, selected: v === get(), pick: () => { set(v); show(); } })));
        });
        ['mousedown'].forEach((t) => b.addEventListener(t, (e) => e.stopPropagation()));
        return b;
      };
      const selCab = picker('cab', 'Cabin', [['B', 'Business'], ['W', 'Premium'], ['F', 'First'], ['Y', 'Economy']], () => box._fxpCab, (v) => { box._fxpCab = v; });
      const selFlex = picker('flex', 'Dates', [[0, 'Fixed'], [1, '\u00b11 day'], [2, '\u00b12 days'], [3, '\u00b13 days'], [5, '\u00b15 days'], [7, '\u00b17 days']], () => srchState.flex, (v) => { srchState.flex = v; });
      left.append(selCab, selFlex);
      const all = document.createElement('button');
      all.type = 'button';
      all.className = 'ia-fxp-all';
      all.title = 'Opens the sites ticked in \u25be in background tabs \u2014 you stay here';
      all.textContent = 'Open all ↗';
      all.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const on = srchOpenAllSet();
        const legs = srchLegs(L()).filter((l) => l.date);
        const urls = [];
        FXP_OPENALL.forEach(([k]) => {
          if (!on.includes(k)) return;
          if (k === 'g') urls.push(srchGoogle(L(), false, cab()));
          if (k === 'e') urls.push(srchGoogle(L(), true, cab()));
          if (k === 'm') urls.push(srchMatrix(L(), cab(), null, null, flex()));
          if (k === 'py') legs.forEach((lg) => urls.push(srchPointsYeah(L(), lg, flex(), cab())));
          if (k === 'fb') legs.forEach((lg) => urls.push(srchBasis(L(), lg, cab(), flex())));
          if (k === 'k') urls.push(srchKayak(L(), flex(), cab()));
        });
        if (!urls.length) { all.textContent = 'Nothing ticked'; setTimeout(() => { all.textContent = 'Open all ↗'; }, 1400); return; }
        urls.forEach((u) => srchOpenBg(u));
        all.textContent = '✓ Opened ' + urls.length;
        setTimeout(() => { all.textContent = 'Open all ↗'; }, 1400);
      });
      const allMenu = document.createElement('button');
      allMenu.type = 'button';
      allMenu.className = 'ia-fxp-allm';
      allMenu.dataset.kind = 'all';
      allMenu.title = 'Choose what Open all opens';
      allMenu.textContent = '\u25be';
      allMenu.addEventListener('mousedown', (e) => e.stopPropagation());
      allMenu.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        srchShowMenu(allMenu, 'Open all opens', FXP_OPENALL.map(([k, label, note]) => ({
          label, note,
          checked: () => srchOpenAllSet().includes(k),
          toggle: () => { const cur = srchOpenAllSet(); srchSaveOpenAll(cur.includes(k) ? cur.filter((x) => x !== k) : cur.concat(k)); },
        })));
      });
      const allWrap = document.createElement('span');
      allWrap.className = 'ia-fxp-allwrap';
      allWrap.append(all, allMenu);
      // Refresh: read the lead again from the BO (route, dates, passengers,
      // cabin) and rebuild the panel from scratch.
      const re = document.createElement('button');
      re.type = 'button';
      re.className = 'ia-fxp-re';
      re.title = 'Refresh — re-read this lead\u2019s route, dates, passengers and cabin';
      re.textContent = '\u21bb';
      re.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        srchCloseMenu();
        box._fxpLead = null;
        box._fxpKey = null;
        box._fxpCab = null;
        body.querySelectorAll(':scope > .ia-fxp-panel').forEach((n) => n.remove());
        foot.querySelectorAll(':scope > .ia-fxp-foot').forEach((n) => n.remove());
        wireSearchPanels();
        const nb = foot.querySelector('.ia-fxp-re');
        if (nb) { nb.classList.add('spin'); setTimeout(() => nb.classList.remove('spin'), 600); }
      });
      const right = document.createElement('div');
      right.className = 'ia-fxp-foot-r';
      right.append(re, allWrap);
      fwrap.append(left, right);
      foot.appendChild(fwrap);
    });
  }

  function wireMergeButtons() {
    if (window.top !== window) return;
    document.querySelectorAll('.lead-options-header-cell').forEach((cell) => {
      if (cell.dataset.jsMerge || !cell.querySelector('svg.feather-plus') || !cell.querySelector('svg.feather-eye')) return;
      cell.dataset.jsMerge = '1';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'button btn btn-outline-secondary box px-2 py-1 text-theme-33 ml-2 ia-merge-btn';
      btn.title = 'Merge the selected options into one: each option its own ticket (1, 2, 3…) with its own cost — stops before Save';
      btn.textContent = 'Merge';
      btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); mergeSelected(cell, btn); });
      cell.appendChild(btn);
    });
  }

  // Heads-up / rush tags on options that were added by "Send to lead".
  function renderOptionFlags() {
    let all = null;
    document.querySelectorAll('.lead-option').forEach((opt) => {
      const cb = opt.querySelector('input[id^="checkbox-switch-"]');
      if (!cb) return;
      const id = cb.id.replace('checkbox-switch-', '');
      const holder = opt.querySelector('.lead-option-segment') || opt.querySelector('.lead-option-price');
      if (!holder) return;
      // The BO reuses option cards for different options when its list
      // changes (e.g. a new option added on top), so a tag is only kept
      // while the card still shows the option it was made for.
      const old = holder.querySelector(':scope > .ia-optflags');
      if (old) { if (old.getAttribute('data-for') === id) return; old.remove(); }
      if (all === null) { try { all = JSON.parse(GM_getValue(OPTION_FLAGS_KEY, '{}')) || {}; } catch (e) { all = {}; } }
      const info = all[id];
      if (!info) return;
      const box = document.createElement('div');
      box.className = 'ia-optflags';
      box.setAttribute('data-for', id);
      if (info.rush) { const t = document.createElement('span'); t.className = 'ia-optflag ia-optflag--rush'; t.appendChild(worriedPip(17)); t.appendChild(document.createTextNode(info.rush)); box.appendChild(t); }
      // Child/infant heads-ups show on Pip's popover only, not in the BO.
      if (!info.rush) return;
      holder.insertBefore(box, holder.firstChild);
    });
  }

  GM_addStyle(`
    /* Same spot and look as the airport-change tag (above the option's
       segments). */
    .ia-optflags { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 4px 0; }
    .ia-optflag { background: #f59e0b; color: #1a1a1a; font-weight: 700; font-size: 12px; padding: 1px 7px; border-radius: 4px; font-family: system-ui, sans-serif; letter-spacing: .02em; }
    .ia-optflag--rush { background: #dc2626; color: #fff; display: inline-flex; align-items: center; gap: 4px; line-height: 16px; padding: 1px 7px 1px 2px; }
    .ia-worried { display: inline-block; flex: none; line-height: 0; }
    .ia-zero-box .ia-worried { display: block; width: fit-content; margin: 2px auto 10px; filter: drop-shadow(0 3px 4px rgba(0,0,0,.25)); }
    [data-ia-idcopy]:hover { text-decoration: underline dotted; }
    .ia-idcopied { color: #16a34a !important; transition: color .2s; }
    .ia-sell-pen { display: inline-flex; vertical-align: middle; margin-right: 4px; color: #94a3b8; opacity: .75; }
    .ia-sell-cell { cursor: pointer; }
    .ia-sell-cell:hover, .ia-sell-cell:hover .ia-sell-pen { color: #3b82f6; opacity: 1; }
    .ia-sell-input { width: 72px; text-align: right; font: inherit; padding: 0 4px; border: 1px solid #3b82f6; border-radius: 4px; background: #fff; color: #111; }
    .ia-sell-input.is-saving { opacity: .6; }
    /* Search panel in place of the BO's Kayak-price box */
    .kayak-offers.ia-fxp > .kayak-offers-body { max-height: none !important; height: auto !important; overflow: visible !important; }
    .kayak-offers.ia-fxp > .kayak-offers-body > :not(.ia-fxp-panel) { display: none !important; }
    .kayak-offers.ia-fxp > .kayak-offers-footer > :not(.ia-fxp-foot) { display: none !important; }
    .ia-fxp-foot-r { display: flex; align-items: center; gap: 8px; }
    .ia-fxp-re { border: 0; background: transparent; color: inherit; opacity: .7; cursor: pointer; font-size: 15px; line-height: 1; padding: 2px 4px; border-radius: 4px; }
    .ia-fxp-re:hover { opacity: 1; background: rgba(148,163,184,.18); }
    .ia-fxp-re.spin { animation: jsFxpSpin .6s ease; }
    @keyframes jsFxpSpin { to { transform: rotate(360deg); } }
    .ia-fxp-panel { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 28px; gap: 6px; padding: 6px; }
    .ia-fxp-b { border-radius: 6px; border: 1px solid #445071; background: rgba(15,20,35,.35); color: #e5e7eb; font: 800 11.5px/1 system-ui, sans-serif; cursor: pointer; white-space: nowrap; transition: background .15s, transform .1s; }
    .ia-fxp-b:hover { background: rgba(255,255,255,.07); }
    .ia-fxp-b:active { transform: translateY(1px); }
    .ia-fxp-g { border-color: #3b82f6; color: #bfdbfe; }
    .ia-fxp-e { border-color: #22c55e; color: #bbf7d0; }
    .ia-fxp-m { border-color: #a855f7; color: #e9d5ff; }
    .ia-fxp-py { border-color: #f59e0b; color: #fde68a; }
    .ia-fxp-fb { border-color: #8b5cf6; color: #ddd6fe; }
    .ia-fxp-k { border-color: #f97316; color: #fed7aa; }
    .ia-fxp-b.is-open { background: rgba(255,255,255,.12); }
    .ia-fxp-foot { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 8px; }
    .ia-fxp-foot-l { display: flex; gap: 6px; }
    .ia-fxp-pick { border: 1px solid #445071; background: #1b2132; color: #e5e7eb; border-radius: 6px; padding: 4px 10px; font: 700 11px system-ui, sans-serif; cursor: pointer; min-width: 74px; text-align: left; transition: border-color .15s, background .15s; }
    .ia-fxp-pick:hover, .ia-fxp-pick.is-open { border-color: #7c8db5; background: #232a40; }
    .ia-fxp-menu.ia-fxp-menu--cab, .ia-fxp-menu.ia-fxp-menu--flex { min-width: 140px; }
    .ia-fxp-ma { width: max-content; max-width: calc(100vw - 16px); box-sizing: border-box; padding: 8px; }
    .ia-fxp-ma-row { display: flex; align-items: center; gap: 0; margin: 2px 0 8px; }
    .ia-fxp-ma-box { flex: 1 1 246px; min-width: 246px; box-sizing: border-box; overflow: hidden; display: flex; align-items: center; gap: 7px; height: 40px; padding: 0 10px; border: 1px solid #445071; border-radius: 9px; background: #232a3d; cursor: text; }
    .ia-fxp-ma-box:focus-within { border-color: #8b7cf6; }
    .ia-fxp-ma-ic { color: #9aa3ba; font-size: 13px; flex: none; }
    .ia-fxp-ma-chips { display: inline-flex; gap: 5px; flex: none; }
    .ia-fxp-ma-chip { display: inline-flex; align-items: center; gap: 4px; height: 24px; padding: 0 4px 0 9px; border-radius: 999px; background: #3a4258; color: #f1f5f9; font: 800 11.5px system-ui, sans-serif; letter-spacing: .04em; }
    .ia-fxp-ma-x { border: 0; background: transparent; color: #cbd5e1; cursor: pointer; font-size: 14px; line-height: 1; padding: 0 3px; border-radius: 50%; }
    .ia-fxp-ma-x:hover { color: #fff; background: rgba(255,255,255,.12); }
    .ia-fxp-ma-box input { flex: 1; min-width: 0; border: 0; outline: none; background: transparent; color: #e5e7eb; font: 700 13px system-ui, sans-serif; letter-spacing: .03em; text-transform: uppercase; }
    .ia-fxp-ma-box input::placeholder { color: #8b93a7; text-transform: none; font-weight: 500; letter-spacing: 0; }
    .ia-fxp-ma-sw { flex: none; width: 30px; height: 30px; margin: 0 6px; z-index: 1; border-radius: 50%; border: 1px solid #445071; background: #3a4258; color: #e5e7eb; cursor: pointer; font-size: 14px; line-height: 1; }
    .ia-fxp-ma-sw:hover { background: #4a5470; }
    .ia-fxp-ma-info { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; padding: 0 0 8px; }
    .ia-fxp-ma-date { height: 28px; padding: 0 6px; border: 1px solid #445071; border-radius: 6px; background: #232a3d; color: #e5e7eb; font: 700 11.5px system-ui, sans-serif; color-scheme: dark; }
    .ia-fxp-ma-date:focus { outline: none; border-color: #8b7cf6; }
    .ia-fxp-ma-arrow { color: #9aa3ba; font-size: 12px; }
    .ia-fxp-ma-pills { display: inline-flex; margin-left: auto; border: 1px solid #445071; border-radius: 6px; overflow: hidden; }
    .ia-fxp-ma-pills button { border: 0; border-left: 1px solid #2c3550; background: #1b2132; color: #c9cfe0; font: 700 11px system-ui, sans-serif; padding: 0 7px; height: 26px; cursor: pointer; }
    .ia-fxp-ma-pills button:first-child { border-left: 0; }
    .ia-fxp-ma-pills button:hover { background: #2c3550; }
    .ia-fxp-ma-pills button.on { background: #6d5bd0; color: #fff; }
    .ia-fxp-ma-acts { display: flex; gap: 6px; justify-content: flex-end; }
    .ia-fxp-ma-go { border: 1px solid #445071; background: #1b2132; color: #e5e7eb; border-radius: 6px; padding: 6px 10px; font: 700 12px system-ui, sans-serif; cursor: pointer; }
    .ia-fxp-ma-go:hover { border-color: #8b7cf6; }
    .ia-fxp-ma-go.is-main { background: #6d5bd0; border-color: #6d5bd0; color: #fff; }
    .ia-fxp-ma-err { color: #fca5a5; font-size: 11px; font-weight: 600; padding-top: 6px; min-height: 0; }
    .ia-fxp-ma-err:empty { display: none; }
    .ia-fxp-allwrap { display: inline-flex; align-items: center; gap: 2px; }
    .ia-fxp-allm { border: 0; background: transparent; color: #c4b5fd; cursor: pointer; font-size: 11px; padding: 3px 5px; border-radius: 4px; line-height: 1; }
    .ia-fxp-allm:hover, .ia-fxp-allm.is-open { background: rgba(148,163,184,.18); }
    .ia-fxp-menu.ia-fxp-menu--all { min-width: 170px; }
    .ia-fxp-menu-c span { display: inline-flex; align-items: center; gap: 8px; }
    .ia-fxp-menu-c.is-off span { color: #8b93a7; }
    .ia-fxp-chk { width: 14px; height: 14px; border-radius: 3px; border: 1.5px solid #5b6787; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; color: #fff; flex: none; }
    .ia-fxp-chk.on { background: #7c3aed; border-color: #7c3aed; }
    .ia-fxp-menu-i.is-sel { background: rgba(59,130,246,.18); color: #93c5fd; }
    .ia-fxp-menu-i.is-sel small { color: #93c5fd; font-weight: 800; }
    .ia-fxp-sel { border: 1px solid #445071; background: rgba(15,20,35,.45); color: #e5e7eb; border-radius: 5px; padding: 2px 6px; font: 700 11px system-ui, sans-serif; cursor: pointer; }
    .ia-fxp-all { background: none; border: 0; color: #c4b5fd; font: 800 12px system-ui, sans-serif; cursor: pointer; padding: 2px 4px; }
    .ia-fxp-all:hover { text-decoration: underline; }
    .ia-fxp-menu { position: fixed; z-index: 2147483000; min-width: 210px; background: #1b2132; border: 1px solid #445071; border-radius: 8px; padding: 5px; box-shadow: 0 12px 26px rgba(0,0,0,.5); font-family: system-ui, sans-serif; color: #e5e7eb; }
    .ia-fxp-menu--m { border-color: #6d4bb0; } .ia-fxp-menu--py { border-color: #b07a1a; } .ia-fxp-menu--fb { border-color: #6d5bd0; }
    .ia-fxp-menu-h { font-size: 9px; letter-spacing: .1em; text-transform: uppercase; color: #8b93a7; font-weight: 800; padding: 3px 7px 5px; }
    .ia-fxp-menu-i { display: flex; justify-content: space-between; gap: 14px; padding: 7px 8px; border-radius: 5px; font-size: 12px; font-weight: 700; cursor: pointer; }
    .ia-fxp-menu-i small { color: #8b93a7; font-weight: 600; }
    .ia-fxp-menu-i:hover { background: #2c3550; }
    .ia-zero-back { position: fixed; inset: 0; z-index: 2147483000; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; }
    .ia-zero-box { width: 380px; max-width: calc(100vw - 32px); background: #0f172a; color: #e2e8f0; border: 1px solid #334155; border-radius: 12px; padding: 18px 18px 14px; box-shadow: 0 20px 50px rgba(0,0,0,.35); font-family: system-ui, sans-serif; border-top: 5px solid #dc2626; }
    .ia-zero-title { font-weight: 800; font-size: 16px; color: #b91c1c; margin-bottom: 8px; text-align: center; }
    .ia-zero-text { font-size: 13.5px; line-height: 1.45; margin-bottom: 14px; text-align: center; }
    .ia-zero-row { display: flex; gap: 8px; justify-content: flex-end; }
    .ia-zero-row button { border: 0; border-radius: 8px; padding: 8px 14px; font-weight: 700; font-size: 13px; cursor: pointer; }
    .ia-zero-no { background: #5b5bd6; color: #fff; }
    .ia-zero-yes { background: #1e293b; color: #f87171; }
    .ia-sell-input.is-bad { border-color: #dc2626; background: #fee2e2; }
    .ia-sell-saved { color: #16a34a !important; transition: color .3s; }
    .ia-sell-err { color: #dc2626 !important; }
    .ia-sell-toast { position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%); z-index: 2147483000; max-width: 640px; background: #0f172a; border: 1px solid #f87171; color: #fff; font: 600 13px system-ui, sans-serif; padding: 10px 14px; border-radius: 8px; box-shadow: 0 6px 20px rgba(0,0,0,.35); }
    .ia-merge-btn { font-size: 12px; font-weight: 600; white-space: nowrap; min-height: 34px; }
  `);

  // ------------------------------------------------------------------
  // Search panel in Ian's Assistant colours. Follows the agent's mode
  // (dark / light / navy) and accent: the values are copied onto the page
  // as --ias-* variables whenever either setting changes.
  // ------------------------------------------------------------------
  function iaPaintSearchColours() {
    if (typeof iaPalette !== 'function') return;
    const p = iaPalette();
    const r = document.documentElement.style;
    const light = p.mode === 'light';
    const set = {
      bg: p.bg, field: p.field, line: p.line, line2: p.line2, text: p.text, title: p.title, muted: p.muted, sec: p.sec,
      acc: p.acc, onacc: p.onacc, shadow: p.shadow, scheme: light ? 'light' : 'dark',
      'g': light ? '#2563eb' : '#60a5fa', 'e': light ? '#16a34a' : '#4ade80', 'm': light ? '#7c3aed' : '#c4b5fd',
      'py': light ? '#ca8a04' : '#facc15', 'fb': light ? '#3f3f46' : '#e8e8ed', 'k': light ? '#ea580c' : '#fb923c',
    };
    Object.keys(set).forEach((k) => r.setProperty('--ias-' + k, set[k]));
  }
  iaPaintSearchColours();
  try { ['ia-mode', 'bmo-theme'].forEach((k) => GM_addValueChangeListener(k, iaPaintSearchColours)); } catch (e) { /* ignore */ }

  GM_addStyle(`
    .kayak-offers.ia-fxp { background: var(--ias-bg) !important; border: 1px solid var(--ias-line) !important; border-radius: 12px !important; color: var(--ias-text) !important; }
    .kayak-offers.ia-fxp > .kayak-offers-footer { border-top: 1px solid var(--ias-line) !important; background: transparent !important; }
    .ia-fxp-panel { gap: 6px; padding: 8px; }
    .ia-fxp-b, .ia-fxp-b.ia-fxp-g, .ia-fxp-b.ia-fxp-e, .ia-fxp-b.ia-fxp-m, .ia-fxp-b.ia-fxp-py, .ia-fxp-b.ia-fxp-fb, .ia-fxp-b.ia-fxp-k {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px; border-radius: 8px; border: 1px solid var(--ias-line2);
      background: transparent; color: var(--ias-text); font: 600 11.5px/1 Inter, 'Segoe UI', system-ui, sans-serif; }
    .ia-fxp-b::before { content: ''; width: 6px; height: 6px; border-radius: 50%; flex: none; background: var(--ias-text); }
    .ia-fxp-g::before { background: var(--ias-g); } .ia-fxp-e::before { background: var(--ias-e); } .ia-fxp-m::before { background: var(--ias-m); }
    .ia-fxp-py::before { background: var(--ias-py); } .ia-fxp-fb::before { background: var(--ias-fb); } .ia-fxp-k::before { background: var(--ias-k); }
    .ia-fxp-b:hover { background: var(--ias-field); border-color: var(--ias-muted); }
    .ia-fxp-b.is-open { background: var(--ias-field); border-color: var(--ias-acc); }
    .ia-fxp-pick, .ia-fxp-sel { border: 1px solid var(--ias-line2); background: transparent; color: var(--ias-sec); border-radius: 6px; font: 600 11px Inter, 'Segoe UI', system-ui, sans-serif; }
    .ia-fxp-pick:hover, .ia-fxp-pick.is-open { border-color: var(--ias-acc); background: var(--ias-field); }
    .ia-fxp-re { color: var(--ias-muted); }
    .ia-fxp-re:hover { color: var(--ias-title); background: var(--ias-field); }
    .ia-fxp-allwrap { background: var(--ias-acc); border-radius: 6px; padding: 0 2px 0 4px; }
    .ia-fxp-all, .ia-fxp-allm { color: var(--ias-onacc); font: 600 11.5px Inter, 'Segoe UI', system-ui, sans-serif; }
    .ia-fxp-all:hover { text-decoration: none; }
    .ia-fxp-allm:hover, .ia-fxp-allm.is-open { background: rgba(0,0,0,.12); }
    .ia-fxp-menu, .ia-fxp-menu--m, .ia-fxp-menu--py, .ia-fxp-menu--fb { background: var(--ias-field); border: 1px solid var(--ias-line2); border-radius: 10px; color: var(--ias-text); box-shadow: var(--ias-shadow); font-family: Inter, 'Segoe UI', system-ui, sans-serif; }
    .ia-fxp-menu-h { color: var(--ias-muted); text-transform: none; letter-spacing: 0; font-size: 11px; font-weight: 500; }
    .ia-fxp-menu-i { font-weight: 600; color: var(--ias-text); }
    .ia-fxp-menu-i small { color: var(--ias-muted); font-weight: 500; }
    .ia-fxp-menu-i:hover { background: var(--ias-bg); }
    .ia-fxp-menu-i.is-sel, .ia-fxp-menu-i.is-opened { background: color-mix(in srgb, var(--ias-acc) 14%, transparent); color: var(--ias-title); }
    .ia-fxp-menu-i.is-sel small, .ia-fxp-menu-i.is-opened small { color: var(--ias-acc); font-weight: 600; }
    .ia-fxp-chk { border-color: var(--ias-line2); color: var(--ias-onacc); }
    .ia-fxp-chk.on { background: var(--ias-acc); border-color: var(--ias-acc); }
    .ia-fxp-menu-c.is-off span { color: var(--ias-muted); }
    /* Basis multi-airport search box, in Ian's Assistant colours */
    .ia-fxp-ma-box { border-color: var(--ias-line2) !important; background: var(--ias-bg) !important; border-radius: 10px !important; }
    .ia-fxp-ma-box:focus-within { border-color: var(--ias-acc) !important; }
    .ia-fxp-ma-ic { color: var(--ias-muted) !important; }
    .ia-fxp-ma-chip { background: var(--ias-field) !important; border: 1px solid var(--ias-line2); color: var(--ias-title) !important; font-family: Inter, 'Segoe UI', system-ui, sans-serif !important; }
    .ia-fxp-ma-x { color: var(--ias-muted) !important; }
    .ia-fxp-ma-x:hover { color: var(--ias-title) !important; background: var(--ias-line) !important; }
    .ia-fxp-ma-box input { color: var(--ias-title) !important; font-family: Inter, 'Segoe UI', system-ui, sans-serif !important; font-weight: 800 !important; }
    .ia-fxp-ma-box input::placeholder { color: var(--ias-muted) !important; font-weight: 600 !important; }
    .ia-fxp-ma-sw { border-color: var(--ias-line2) !important; background: var(--ias-field) !important; color: var(--ias-title) !important; }
    .ia-fxp-ma-sw:hover { border-color: var(--ias-acc) !important; }
    .ia-fxp-ma-date { border-color: var(--ias-line2) !important; background: var(--ias-bg) !important; color: var(--ias-title) !important; color-scheme: var(--ias-scheme) !important; font-family: Inter, 'Segoe UI', system-ui, sans-serif !important; }
    .ia-fxp-ma-date:focus { border-color: var(--ias-acc) !important; }
    .ia-fxp-ma-arrow { color: var(--ias-muted) !important; }
    .ia-fxp-ma-pills { border-color: var(--ias-line2) !important; border-radius: 7px !important; }
    .ia-fxp-ma-pills button { border-left-color: var(--ias-line2) !important; background: var(--ias-bg) !important; color: var(--ias-sec) !important; font-family: Inter, 'Segoe UI', system-ui, sans-serif !important; }
    .ia-fxp-ma-pills button:hover { background: var(--ias-field) !important; }
    .ia-fxp-ma-pills button.on { background: var(--ias-acc) !important; color: var(--ias-onacc) !important; }
    .ia-fxp-ma-go { border-color: var(--ias-line2) !important; background: transparent !important; color: var(--ias-text) !important; border-radius: 7px !important; font-family: Inter, 'Segoe UI', system-ui, sans-serif !important; font-weight: 800 !important; }
    .ia-fxp-ma-go:hover { border-color: var(--ias-acc) !important; }
    .ia-fxp-ma-go.is-main { background: var(--ias-acc) !important; border-color: var(--ias-acc) !important; color: var(--ias-onacc) !important; }
    .ia-fxp-ma-h { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .ia-fxp-ma-close { border: 0; background: transparent; color: var(--ias-muted); font: 800 16px/1 system-ui, sans-serif; padding: 0 2px; cursor: pointer; border-radius: 5px; }
    .ia-fxp-ma-close:hover { color: var(--ias-text); }
    .ia-fxp-ma-err { color: var(--ias-bad, #f87171) !important; }
  `);

  function scan() {
    document.querySelectorAll('.app-modal__container--price-quote').forEach(wireModal);
    renderOptionFlags();
    wireMergeButtons();
    wireSellEdit();
    wireSearchPanels();
    if (window.top === window) wireLeadIdCopy();
    wireTerminal();
    wireMilesTaxesSteppers();
    wireMileProgramAlignment();
  }

  // Shares PART 2/3/4's single observer instead of keeping its own —
  // see the comment where __jsEnsureSharedObserver is defined.
  __jsRegisterScan(scan);
  __jsEnsureSharedObserver();
  scan();
})();


// ====================================================================
// SECTION 3 · CRM leads list: "select all" checkbox per lead's options
// ====================================================================
(function () {
  'use strict';

  if (window.top !== window) return; // not inside hidden worker frames
  if (!location.hostname.includes('travelbusinessclass.com')) return;

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function setNativeChecked(el, value) {
    const proto = Object.getPrototypeOf(el);
    const setter = (Object.getOwnPropertyDescriptor(proto, 'checked') || {}).set
      || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked').set;
    setter.call(el, value);
  }

  // We only have two disconnected DOM samples for this feature — the
  // header cell itself, and one option's own checkbox cell — with no
  // confirmation of what wraps both of them, or whether the header cell
  // repeats once per lead or once for the whole list. Rather than guess
  // a specific wrapper class name and risk scoping to nothing (the same
  // failure mode as the CheapOair class-prefix mismatch), walk up from
  // the header cell to the NEAREST ancestor that actually contains at
  // least one option checkbox. That self-adjusts to either layout: if
  // the header repeats per lead, the nearest such ancestor is that
  // lead's own wrapper; if there's one header for the whole list, the
  // walk keeps going until it reaches the container that holds every
  // lead, which is the correct scope for a true page-wide select-all.
  function findScope(headerCell) {
    let node = headerCell.parentElement;
    while (node && node !== document.body) {
      if (node.querySelector('input[id^="checkbox-switch-"]')) return node;
      node = node.parentElement;
    }
    return document;
  }

  // ".lead-options-header-cell" turned out to be the generic header-cell
  // class for EVERY column in this row (PRICE, ITINERARY SEGMENTS, SOLD
  // all use it too), not something unique to the actions column — so
  // querying it alone wired up four separate checkboxes instead of one.
  // The actions-column header is the only one that actually contains the
  // eye/plus icon buttons, so require both of those to be present before
  // treating a header cell as the right one.
  function isActionsHeaderCell(headerCell) {
    return !!headerCell.querySelector('svg.feather-eye') && !!headerCell.querySelector('svg.feather-plus');
  }

  function wireHeaderCell(headerCell) {
    if (headerCell.dataset.selectAllWired) return;
    headerCell.dataset.selectAllWired = '1';

    const label = document.createElement('label');
    label.className = 'button btn btn-outline-secondary box p-2 text-theme-33 ml-2 --only';
    label.title = 'Select all options';
    label.style.cursor = 'pointer';
    label.style.display = 'inline-flex';
    label.style.alignItems = 'center';
    label.style.justifyContent = 'center';

    const master = document.createElement('input');
    master.type = 'checkbox';
    master.className = 'gds-lead-select-all w-3.5 h-3.5 !border !border-slate-100';
    master.style.margin = '0';
    label.appendChild(master);
    headerCell.appendChild(label);

    const scope = findScope(headerCell);

    // Disabled options (greyed out, can't be sold — like 4048006 in the
    // example) are excluded from both the toggle and the master's own
    // checked/indeterminate count, since they can never actually be
    // selected and shouldn't stop the master from showing "all checked"
    // once every SELECTABLE option is checked.
    function targets() {
      return Array.from(scope.querySelectorAll('input[id^="checkbox-switch-"]:not(:disabled)'));
    }

    function syncMasterFromTargets() {
      const boxes = targets();
      const checkedCount = boxes.filter((cb) => cb.checked).length;
      master.checked = boxes.length > 0 && checkedCount === boxes.length;
      master.indeterminate = checkedCount > 0 && checkedCount < boxes.length;
    }

    // Reflect whatever's already checked when this first wires up,
    // rather than always starting unchecked regardless of real state.
    syncMasterFromTargets();

    // The app appears to re-render each lead's row right after its own
    // checkbox toggles (most likely tied to the "N options selected"
    // bar animating in) — which replaces that row's DOM node. Looping
    // over a snapshot of targets() taken once at the start meant every
    // checkbox after the first was a stale reference to a node Vue had
    // already swapped out from under it, so only ONE selection actually
    // stuck per click — hence needing to click three times for three
    // leads. Re-querying the live DOM before each individual toggle,
    // with a short pause after each one for the re-render to land,
    // fixes that regardless of how many options are on the page.
    let toggling = false;
    master.addEventListener('change', async () => {
      if (toggling) return;
      toggling = true;
      const desired = master.checked;
      try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const next = targets().find((cb) => cb.checked !== desired);
          if (!next) break;
          setNativeChecked(next, desired);
          // Only fire 'change'/'input' (notification events) — never a
          // synthetic 'click'. A dispatched 'click' event on a checkbox
          // triggers the browser's native toggle behavior same as a
          // real click, which would flip .checked a second time right
          // after we just set it, undoing this.
          next.dispatchEvent(new Event('input', { bubbles: true }));
          next.dispatchEvent(new Event('change', { bubbles: true }));
          await wait(60);
        }
      } finally {
        toggling = false;
        syncMasterFromTargets();
      }
    });

    // Keep the master in sync when a lead's own checkboxes change some
    // other way (clicked directly, or another part of the app toggles
    // one) — capture phase so this still sees the change even if some
    // other handler stops propagation before it bubbles.
    scope.addEventListener('change', (e) => {
      if (!e.target.matches || !e.target.matches('input[id^="checkbox-switch-"]')) return;
      if (toggling) return; // avoid fighting with our own in-flight loop above
      syncMasterFromTargets();
    }, true);
  }

  function scan() {
    document.querySelectorAll('.lead-options-header-cell').forEach((cell) => {
      if (isActionsHeaderCell(cell)) wireHeaderCell(cell);
    });
  }

  // Shares PART 2/3/4's single observer instead of keeping its own —
  // see the comment where __jsEnsureSharedObserver is defined.
  __jsRegisterScan(scan);
  __jsEnsureSharedObserver();
  scan();
})();

// ====================================================================
// SECTION 4 · CRM leads list: power dialer
// ====================================================================
// Chrome has an explicit, deliberate "anti-flood" protection for
// external-protocol launches (tel:, mailto:, etc.) — confirmed directly
// in Chromium's own source: the flag that allows a launch is reset to
// false the moment one fires, and only set back to true by a fresh,
// genuine user gesture. That means a script can never advance through
// a whole list and dial each number on its own; every single call has
// to be triggered by one real action from the person, not by a
// previous call finishing or a timer firing. So this is built as a
// "one action per call" power dialer: press Call, everything else
// happens automatically for THAT one call, then it's ready for the
// next press — not a hands-free auto-advance, because that specific
// thing isn't something a webpage script can do at all.
(function () {
  'use strict';

  // Experts don't work leads, so Pip and the whole power-dialer setup
  // have nothing for them — excluded on /experts/ specifically rather
  // than the whole domain, so this still runs on every other leads-list
  // path under this host.
  if (!location.hostname.includes('travelbusinessclass.com')) return;
  if (location.pathname.startsWith('/experts/')) return;
  if (window.top !== window) return; // no Pip / phone panel inside hidden worker frames
  if (!location.pathname.startsWith('/leads/')) return; // same pages as before the BO-wide match

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const CALLED_STORAGE_PREFIX = 'auto-dialer-called-';
  const SKIPPED_STORAGE_PREFIX = 'auto-dialer-skipped-';
  // Second follow-up round (unlocked once every lead has had round 1).
  const CALLED2_STORAGE_PREFIX = 'auto-dialer-called2-';
  const SKIPPED2_STORAGE_PREFIX = 'auto-dialer-skipped2-';
  const ROUND_STORAGE_PREFIX = 'bmo-round-';
  const SUPER_STORAGE_PREFIX = 'bmo-super-';
  // Numbers that are never real leads — always skipped automatically.
  const BLOCKED_NUMBERS = ['10000000000'];
  // The masked format seen is "+1253****168" -- leading +digits, at
  // least one asterisk, trailing digits. The revealed format seen after
  // one click is "+12538860168" -- clean digits only, no asterisks.
  const PHONE_MASKED_RE = /^\+\d[\d*]*\*[\d*]*\d$/;
  const PHONE_REVEALED_RE = /^\+?\d{10,15}$/;

  // "Today" resets at 2pm GMT rather than local midnight, so called/
  // skipped leads, the started-today flag, and the reminder's wording
  // all flip over together at a fixed point in the day regardless of
  // whoever's local timezone is running this. Shifting the clock back
  // by 14 hours before reading off the date does this: anything from
  // 14:00 GMT onward lands on today's GMT date (a fresh bucket just
  // started), and anything before 14:00 GMT lands on yesterday's GMT
  // date (still inside the bucket that opened at 2pm the day before).
  function todayKey() {
    const shifted = new Date(Date.now() - 14 * 60 * 60 * 1000);
    return shifted.getUTCFullYear() + '-' + String(shifted.getUTCMonth() + 1).padStart(2, '0') + '-' + String(shifted.getUTCDate()).padStart(2, '0');
  }

  // Called (green) and skipped (yellow) are tracked as two separate
  // sets now, not one collapsed "done" state — a lead can be in at most
  // one of them at a time, but which one matters for the indicator
  // color and is worth keeping distinct in storage too.
  function getSet(prefix) {
    let raw;
    try { raw = GM_getValue(prefix + todayKey(), '[]'); } catch (e) { raw = '[]'; }
    try { return new Set(JSON.parse(raw)); } catch (e) { return new Set(); }
  }

  function saveSet(prefix, set) {
    GM_setValue(prefix + todayKey(), JSON.stringify(Array.from(set)));
  }

  // Which follow-up round today is on: 1 (first pass) or 2 (second pass,
  // unlocked once round 1 is finished). Resets with the 2pm GMT day.
  function getRound() {
    try { return GM_getValue(ROUND_STORAGE_PREFIX + todayKey(), 1) === 2 ? 2 : 1; } catch (e) { return 1; }
  }
  function setRound(n) {
    try { GM_setValue(ROUND_STORAGE_PREFIX + todayKey(), n); } catch (e) { /* best-effort */ }
    updateTodayStats();
  }

  // --- Today's numbers (calls, answered, skipped, round) --------------
  // Calls and answered are counted as they happen; skipped comes from the
  // day's skipped lists. Same 2pm GMT day as everything else.
  var STATS_PREFIX = 'ia-stats-';
  function getTodayStats() {
    try { const v = JSON.parse(GM_getValue(STATS_PREFIX + todayKey(), '{}')); return { calls: +v.calls || 0, answered: +v.answered || 0 }; } catch (e) { return { calls: 0, answered: 0 }; }
  }
  function bumpTodayStat(name) {
    const st = getTodayStats();
    st[name] = (st[name] || 0) + 1;
    try { GM_setValue(STATS_PREFIX + todayKey(), JSON.stringify(st)); } catch (e) { /* best-effort */ }
    updateTodayStats();
  }
  function updateTodayStats() {
    const el = iaWidget && iaWidget.querySelector('.ia-stats');
    if (!el) return;
    const st = getTodayStats();
    const skipped = getSet(SKIPPED_STORAGE_PREFIX).size + getSet(SKIPPED2_STORAGE_PREFIX).size;
    const set = (k, v) => { const n = el.querySelector('[data-stat="' + k + '"]'); if (n && n.textContent !== String(v)) n.textContent = String(v); };
    set('calls', st.calls);
    set('answered', st.answered);
    set('skipped', skipped);
    set('round', getRound());
  }

  function markCalled(leadId) {
    if (!leadId) return;
    const round2 = getRound() === 2;
    const skipPrefix = round2 ? SKIPPED2_STORAGE_PREFIX : SKIPPED_STORAGE_PREFIX;
    const callPrefix = round2 ? CALLED2_STORAGE_PREFIX : CALLED_STORAGE_PREFIX;
    const skipped = getSet(skipPrefix);
    if (skipped.delete(leadId)) saveSet(skipPrefix, skipped);
    const called = getSet(callPrefix);
    called.add(leadId);
    saveSet(callPrefix, called);
    updateAllRowIndicators();
  }

  function markSkipped(leadId) {
    if (!leadId) return;
    const skipPrefix = getRound() === 2 ? SKIPPED2_STORAGE_PREFIX : SKIPPED_STORAGE_PREFIX;
    const skipped = getSet(skipPrefix);
    skipped.add(leadId);
    saveSet(skipPrefix, skipped);
    updateAllRowIndicators();
    updateTodayStats();
  }

  function isCalledTwice(leadId) {
    return getSet(CALLED2_STORAGE_PREFIX).has(leadId);
  }

  // "Done" for whichever round is running.
  function isDoneThisRound(leadId) {
    if (getRound() === 2) return getSet(CALLED2_STORAGE_PREFIX).has(leadId) || getSet(SKIPPED2_STORAGE_PREFIX).has(leadId);
    return isDone(leadId);
  }

  function isCalled(leadId) {
    return getSet(CALLED_STORAGE_PREFIX).has(leadId);
  }

  function isSkipped(leadId) {
    return getSet(SKIPPED_STORAGE_PREFIX).has(leadId);
  }

  function isDone(leadId) {
    return isCalled(leadId) || isSkipped(leadId);
  }

  function getLeadId(row) {
    const link = row.querySelector('a[href^="/leads/"]');
    if (!link) return null;
    const m = link.getAttribute('href').match(/\/leads\/(\d+)/);
    return m ? m[1] : null;
  }

  function getLeadRows() {
    return Array.from(document.querySelectorAll('tbody tr')).filter((row) => getLeadId(row));
  }

  // Column order is user-configurable ("Configure columns" in the top
  // bar), so a fixed column-index assumption would be fragile — this
  // finds the phone cell by its distinctive content shape instead. The
  // email column uses the exact same wrapper classes (truncate
  // max-w-[115px] cursor-pointer), so content, not class name, is what
  // actually tells them apart. Matches either the masked or
  // already-revealed form, so this keeps working even on a lead someone
  // already clicked once earlier in the session.
  function findPhoneCell(row) {
    const candidates = row.querySelectorAll('td div.truncate.cursor-pointer');
    for (const el of candidates) {
      const text = el.textContent.trim();
      if (PHONE_MASKED_RE.test(text) || PHONE_REVEALED_RE.test(text)) return el;
    }
    return null;
  }

  function waitForRevealedNumber(cell, timeoutMs) {
    return new Promise((resolve) => {
      const check = () => {
        const text = cell.textContent.trim();
        if (PHONE_REVEALED_RE.test(text)) { resolve(text); return true; }
        return false;
      };
      if (check()) return;
      const obs = new MutationObserver(() => { if (check()) obs.disconnect(); });
      obs.observe(cell, { childList: true, characterData: true, subtree: true });
      setTimeout(() => { obs.disconnect(); resolve(null); }, timeoutMs || 2000);
    });
  }

  // Origin/destination have no distinctive class to key on in the
  // sample rows seen — position (first two <td> after the lead-id one)
  // is the only signal available for those two specifically, unlike the
  // phone/email cells above which have a reliable content shape to
  // match on instead.
  function getLeadInfo(row) {
    const leadId = getLeadId(row);
    const idLink = row.querySelector('a[href^="/leads/"]');
    const clientLink = row.querySelector('a[href^="/clients/edit/"]');
    let clientName = clientLink ? clientLink.textContent.trim() : '';
    // Confirmed from a real screenshot: this shows a bare "-" for some
    // leads instead of a name -- likely no linked client record for
    // that specific lead. Best guess without the underlying HTML to
    // check against: a link showing a placeholder in its visible text
    // while the real value sits in its title attribute (a tooltip) is
    // a common pattern, so that's tried next. If that isn't actually
    // where this site keeps it, the "Lead <id>" fallback below at
    // least never shows a bare, uninformative dash on the screen.
    if (!clientName || clientName === '-') {
      const titleAttr = clientLink && clientLink.getAttribute('title');
      const titleTrimmed = titleAttr ? titleAttr.trim() : '';
      clientName = (titleTrimmed && titleTrimmed !== '-') ? titleTrimmed : '';
    }
    const cells = row.querySelectorAll('td');
    const origin = cells[1] ? cells[1].textContent.trim() : '';
    const dest = cells[2] ? cells[2].textContent.trim() : '';
    return {
      leadId,
      href: idLink ? idLink.getAttribute('href') : ('/leads/' + leadId),
      clientName,
      origin,
      dest,
    };
  }

  // Only considers rows currently in the DOM — i.e. only the current
  // page. Returning null here doesn't necessarily mean every lead is
  // done; it can also mean this page is done and there's another page
  // to move to, which is what calls this check what to do next.
  // Leads whose "Time left" cell is empty have no timer running — Pip
  // passes over those (without marking them), so they're picked up again
  // if a timer starts later.
  // Column position counted in grid columns (a header like "PQs / SPQs"
  // can span two cells), so it lines up with the right row cell.
  function timeLeftColumnIndex(row) {
    const table = row.closest('table');
    if (!table) return -1;
    let col = 0;
    for (const th of table.querySelectorAll('thead tr:first-child th')) {
      if (/time\s*left/i.test(th.textContent)) return col;
      col += th.colSpan || 1;
    }
    return -1;
  }

  function hasTimerRunning(row) {
    const idx = timeLeftColumnIndex(row);
    if (idx < 0) return true; // no "Time left" column on this view — don't filter
    let col = 0;
    for (const td of row.children) {
      const span = td.colSpan || 1;
      if (idx >= col && idx < col + span) return !!td.textContent.trim();
      col += span;
    }
    return true;
  }

  function getNextPendingRowOnPage() {
    return getLeadRows().find((row) => hasTimerRunning(row) && !isDoneThisRound(getLeadId(row))) || null;
  }

  // Prefers the specific numbered page-button matching (current page +
  // 1), read off the page-number input already used elsewhere on this
  // site — falls back to the chevron "next page" arrow if that specific
  // button isn't found, so this keeps working with either pagination
  // layout rather than depending on one exact structure.
  function findNextPageControl() {
    const pageInput = document.querySelector('.pagination-v2 input[type="number"]');
    const currentPage = pageInput ? parseInt(pageInput.value, 10) : null;
    if (currentPage) {
      const numberedBtn = Array.from(document.querySelectorAll('.pagination-v2__page'))
        .find((b) => b.textContent.trim() === String(currentPage + 1));
      if (numberedBtn && !numberedBtn.disabled) return numberedBtn;
    }
    const chevronBtn = Array.from(document.querySelectorAll('.pagination-v2 button'))
      .find((b) => b.querySelector('.feather-chevron-right') && !b.disabled);
    return chevronBtn || null;
  }

  function waitForRowsChanged(previousFirstLeadId, timeoutMs) {
    return new Promise((resolve) => {
      const check = () => {
        const rows = getLeadRows();
        if (rows.length && getLeadId(rows[0]) !== previousFirstLeadId) { resolve(true); return true; }
        return false;
      };
      if (check()) return;
      const obs = new MutationObserver(() => { if (check()) obs.disconnect(); });
      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => { obs.disconnect(); resolve(false); }, timeoutMs || 3000);
    });
  }

  // Back to page 1 of the leads list (used when round 2 starts).
  async function goToFirstPage() {
    const pageInput = document.querySelector('.pagination-v2 input[type="number"]');
    const currentPage = pageInput ? parseInt(pageInput.value, 10) : 1;
    if (!currentPage || currentPage <= 1) return;
    const firstBtn = Array.from(document.querySelectorAll('.pagination-v2__page')).find((b) => b.textContent.trim() === '1');
    if (!firstBtn) return;
    const rows = getLeadRows();
    const previousFirstLeadId = rows.length ? getLeadId(rows[0]) : null;
    firstBtn.click();
    await waitForRowsChanged(previousFirstLeadId, 3000);
  }

  // The one that actually gets used from the panel — tries the current
  // page first, and only reaches for pagination once this page is
  // genuinely done, not before.
  // Walks forward page by page until it finds a lead still to call.
  // "Nothing left" is only concluded on the LAST page; a page that didn't
  // load in time is reported as such, never mistaken for "all done".
  let pendingScanState = 'ok'; // 'ok' | 'done' (last page reached) | 'pageFail'
  let levelUpArmed = false; // set once a full re-check found nothing left
  async function getNextPendingRow() {
    pendingScanState = 'ok';
    for (let hops = 0; hops < 40; hops++) {
      const onPage = getNextPendingRowOnPage();
      if (onPage) { levelUpArmed = false; return onPage; }
      const nextBtn = findNextPageControl();
      if (!nextBtn) { pendingScanState = 'done'; return null; }
      const rows = getLeadRows();
      const previousFirstLeadId = rows.length ? getLeadId(rows[0]) : null;
      nextBtn.click();
      const changed = await waitForRowsChanged(previousFirstLeadId, 8000);
      if (!changed) { pendingScanState = 'pageFail'; return null; }
      await new Promise((r) => setTimeout(r, 400)); // let the new page's timers render
    }
    pendingScanState = 'pageFail';
    return null;
  }

  // --- Row "called today" / "skipped today" indicator ---------------------
  function ensureRowIndicator(row) {
    const idCell = row.querySelector('td.group.table__td--link');
    if (!idCell) return null;
    if (getComputedStyle(idCell).position === 'static') idCell.style.position = 'relative';
    let dot = idCell.querySelector(':scope > .dialer-called-dot');
    if (!dot) {
      dot = document.createElement('span');
      dot.className = 'dialer-called-dot';
      idCell.appendChild(dot);
    }
    return dot;
  }

  function updateAllRowIndicators() {
    getLeadRows().forEach((row) => {
      const dot = ensureRowIndicator(row);
      if (!dot) return;
      const leadId = getLeadId(row);
      const twice = isCalledTwice(leadId);
      dot.classList.toggle('is-called2', twice);
      dot.classList.toggle('is-called', !twice && isCalled(leadId));
      dot.classList.toggle('is-skipped', !twice && !isCalled(leadId) && (isSkipped(leadId) || getSet(SKIPPED2_STORAGE_PREFIX).has(leadId)));
    });
  }

  // ==========================================================================
  // Pip — the always-present, bottom-right dialer widget
  // ==========================================================================
  // Replaces both the old plain floating panel and the separate "Start Auto
  // Dialer" top-bar button. Pip himself is now the entry point: a small
  // round bubble sits bottom-right on every page under this domain at all
  // times, expanding into the full character on click. The four functional
  // actions map onto his actual body, matching where they'd sit on a real
  // Pip: the yellow cross is Call, the blue triangle is Skip, the green dot
  // is Double Dial, and the red circle — his main button, bottom right — is
  // Stop.
  let iaWidget = null;
  let iaMaximized = false;
  let dialerInitialized = false;


  // "Hi, <first name>!" on the LED panel under the screen, from the BO's
  // own "Ian Brown #1234" style label. Remembered, so it shows on every page.
  const AGENT_NAME_KEY = 'bmo-first-name';
  function readAgentFirstName() {
    const el = Array.from(document.querySelectorAll('div.font-medium')).find((d) => /^\s*\S.*#\d+\s*$/.test(d.textContent) && d.children.length === 0);
    if (!el) return null;
    const first = el.textContent.trim().split(/\s+/)[0].replace(/[^\p{L}'-]/gu, '');
    return first || null;
  }
  function updateLedName() {
    let name = readAgentFirstName();
    try {
      if (name) { if (GM_getValue(AGENT_NAME_KEY, '') !== name) GM_setValue(AGENT_NAME_KEY, name); } else name = GM_getValue(AGENT_NAME_KEY, '');
    } catch (e) { /* ignore */ }
    const led = iaWidget && iaWidget.querySelector('.ia-led');
    // The signed-in agent's own first name, e.g. "Hi Elena!".
    if (name && (name === name.toUpperCase() || name === name.toLowerCase())) name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    const text = name ? 'Hi ' + name + '!' : 'Hi there!';
    if (led && led.textContent !== text) {
      led.textContent = text;
      led.removeAttribute('textLength');
      led.removeAttribute('lengthAdjust');
      let w = 0;
      try { w = led.getComputedTextLength(); } catch (e) { w = 0; }
      if (w > 51 || (!w && text.length > 11)) { led.setAttribute('textLength', '51'); led.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
    }
  }
  setInterval(updateLedName, 3000);

  function ensureBmo() {
    if (iaWidget && document.body.contains(iaWidget)) return iaWidget;
    iaWidget = document.createElement('div');
    iaWidget.className = 'ia-widget ia-mode-' + iaMode();
    setTimeout(updateLedName, 0);
    iaWidget.innerHTML = `
      <div class="ia-levelup" aria-hidden="true">
        <div class="ia-levelup__text">Round 1 complete \u00B7 Round 2 unlocked</div>
      </div>
      <div class="ia-reminder" style="display:none;">
        <div class="ia-reminder__text"></div>
        <button type="button" class="ia-reminder__dismiss">&times;</button>
      </div>
      <div class="ia-bubble" title="Open Ian's Assistant">
        <div class="ia-mini"><svg class="pip" viewBox="10 10 76 80" width="50" height="53" overflow="visible" aria-hidden="true"><path class="pip-body" d="M22 70 L22 38 Q22 26 34 26 L62 26 Q74 26 74 38 L74 62 Q74 74 62 74 L40 74 L30 84 L31 74 Q22 73 22 70 Z"/><path class="pip-hs-arc" d="M18 50 Q18 14 48 14 Q78 14 78 50"/><rect class="pip-hs" x="14" y="44" width="8" height="14" rx="3"/><rect class="pip-hs" x="74" y="44" width="8" height="14" rx="3"/><g class="pip-f pip-f-idle"><circle class="pip-eye" cx="40" cy="47" r="3.8"/><circle class="pip-eye" cx="56" cy="47" r="3.8"/><path class="pip-line" d="M41 57 Q48 63 55 57"/></g><g class="pip-f pip-f-call"><path class="pip-mic" d="M18 56 Q20 68 34 66"/><circle class="pip-hs" cx="35" cy="66" r="2.6"/><path class="pip-line" d="M37 47 Q40 44 43 47"/><path class="pip-line" d="M53 47 Q56 44 59 47"/><ellipse class="pip-eye" cx="48" cy="59" rx="5" ry="4"/><path class="pip-wave" d="M84 34 Q88 40 84 46 M88 30 Q95 40 88 50"/></g><g class="pip-f pip-f-snipe"><path class="pip-line" d="M36 46 L44 48"/><path class="pip-line" d="M60 46 L52 48"/><path class="pip-line" d="M42 59 L54 58"/></g></svg><span class="ia-dot ia-mini__dot"></span></div>
      </div>
      <div class="ia-full ia-panel">
        <div class="ia-head">
          <svg class="pip" viewBox="10 10 76 80" width="30" height="32" overflow="visible" aria-hidden="true"><path class="pip-body" d="M22 70 L22 38 Q22 26 34 26 L62 26 Q74 26 74 38 L74 62 Q74 74 62 74 L40 74 L30 84 L31 74 Q22 73 22 70 Z"/><path class="pip-hs-arc" d="M18 50 Q18 14 48 14 Q78 14 78 50"/><rect class="pip-hs" x="14" y="44" width="8" height="14" rx="3"/><rect class="pip-hs" x="74" y="44" width="8" height="14" rx="3"/><g class="pip-f pip-f-idle"><circle class="pip-eye" cx="40" cy="47" r="3.8"/><circle class="pip-eye" cx="56" cy="47" r="3.8"/><path class="pip-line" d="M41 57 Q48 63 55 57"/></g><g class="pip-f pip-f-call"><path class="pip-mic" d="M18 56 Q20 68 34 66"/><circle class="pip-hs" cx="35" cy="66" r="2.6"/><path class="pip-line" d="M37 47 Q40 44 43 47"/><path class="pip-line" d="M53 47 Q56 44 59 47"/><ellipse class="pip-eye" cx="48" cy="59" rx="5" ry="4"/><path class="pip-wave" d="M84 34 Q88 40 84 46 M88 30 Q95 40 88 50"/></g><g class="pip-f pip-f-snipe"><path class="pip-line" d="M36 46 L44 48"/><path class="pip-line" d="M60 46 L52 48"/><path class="pip-line" d="M42 59 L54 58"/></g></svg>
          <div class="ia-head__txt">
            <div class="ia-head__title">Ian's Assistant</div>
            <div class="ia-hs ia-head__greet" data-k="S"><span class="ia-led"></span></div>
          </div>
          <span class="ia-dot" title="Status"></span>
          <span class="ia-btn ia-iconbtn ia-cb-btn" title="Callbacks"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M5 4 2.5 6.5M19 4l2.5 2.5"/></svg><span class="ia-cb-badge" hidden></span></span>
          <span class="ia-btn ia-iconbtn ia-mode-btn" title="Switch mode: dark, light, navy"><svg class="ia-ico ia-ico-dark" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a6.6 6.6 0 0 0 9.7 9.7z"/></svg><svg class="ia-ico ia-ico-light" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg><svg class="ia-ico ia-ico-navy" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 8.5c3-3 6 3 9 0s6 3 9 0M3 15.5c3-3 6 3 9 0s6 3 9 0"/></svg></span>
          <span class="ia-btn ia-btn-theme ia-iconbtn" title="Change accent color"><span class="ia-swatch"></span></span>
          <span class="ia-iconbtn ia-min" title="Minimize">\u2013</span>
        </div>
        <div class="ia-card">
          <div class="ia-face ia-idle">
            <span class="ia-idle__icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg></span>
            <div class="ia-idle__t">Ready</div>
            <div class="ia-idle__s">Press Call to start your follow-up</div>
          </div>
          <div class="ia-screen-info" style="display:none;">
            <span class="ia-btn ia-iconbtn ia-cb-card" title="Set a callback for this lead"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M5 4 2.5 6.5M19 4l2.5 2.5"/></svg></span>
            <div class="ia-screen-info__label"></div>
            <a class="ia-screen-info__client" target="_blank" rel="noopener"></a>
            <div class="ia-screen-info__route"></div>
            <div class="ia-card-foot"><div class="ia-screen-info__status"></div><div class="ia-progress"></div></div>
          </div>
        </div>
        <div class="ia-stats" title="Today, since 2pm GMT">
          <span><b data-stat="calls">0</b> calls</span>
          <span><b data-stat="answered" class="ia-stat-ok">0</b> answered</span>
          <span><b data-stat="skipped" class="ia-stat-skip">0</b> skipped</span>
          <span class="ia-stat-round">Round <b data-stat="round">1</b></span>
        </div>
        <button type="button" class="ia-btn ia-btn-call ia-call"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg><span>Call</span></button>
        <div class="ia-row">
          <button type="button" class="ia-btn ia-btn-skip ia-sec" title="Skip this lead"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 6l8.5 6L6 18zM16 6h2v12h-2z"/></svg><span>Skip</span></button>
          <button type="button" class="ia-btn ia-btn-doubledial ia-sec" title="Redial the last number"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg><span>Redial</span></button>
          <button type="button" class="ia-btn ia-btn-stop ia-stop" title="Stop"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="2.5"/></svg><span>Stop</span></button>
        </div>
        <div class="ia-toggles">
          <div class="ia-hs ia-dd-toggle ia-toggle ia-toggle--dd" data-k="D" title="Redial each unanswered lead once automatically">
            <span>Double-dial</span><span class="ia-switch"><span></span></span>
          </div>
          <div class="ia-toggle ia-toggle--aa" title="AA: answer incoming calls automatically (RingCentral web app or the BO panel, browser calling)">
            <span class="ia-aa-label">AA</span><span class="ia-check"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
          </div>
        </div>
        <div class="ia-hs ia-foot" data-k="P">\u00A9 Ian Brown</div>
      </div>
    `;
    document.body.appendChild(iaWidget);

    // Suppressed after a genuine drag (see initDrag) so releasing
    // the mouse after moving him doesn't also fire this as a click and
    // immediately maximize him.
    iaWidget.querySelector('.ia-bubble').addEventListener('click', () => {
      if (iaWasDragged) return;
      if (!iaMaximized) maximizeBmo();
    });
    iaWidget.querySelector('.ia-btn-call').addEventListener('click', (e) => { e.stopPropagation(); handleCallClick(); });
    iaWidget.querySelector('.ia-btn-skip').addEventListener('click', (e) => { e.stopPropagation(); handleSkipClick(); });
    iaWidget.querySelector('.ia-btn-doubledial').addEventListener('click', (e) => { e.stopPropagation(); handleDoubleDialClick(); });
    iaWidget.querySelector('.ia-btn-stop').addEventListener('click', (e) => { e.stopPropagation(); handleStopClick(); });
    iaWidget.querySelector('.ia-btn-theme').addEventListener('click', (e) => { e.stopPropagation(); toggleTheme(); });
    iaWidget.querySelector('.ia-reminder__dismiss').addEventListener('click', (e) => { e.stopPropagation(); dismissReminder(); });
    iaWidget.querySelector('.ia-cb-btn').addEventListener('click', (e) => { e.stopPropagation(); if (iaWasDragged) return; cbOpenList(e.currentTarget); });
    iaWidget.querySelector('.ia-cb-card').addEventListener('click', (e) => { e.stopPropagation(); if (iaWasDragged) return; cbOpenPicker(e.currentTarget, cbPanelLeadInfo()); });
    // Minimizes on a click anywhere on Pip himself EXCEPT the four
    // buttons — scoped to just his own element now, not the whole page,
    // so clicking elsewhere (the leads table, etc.) no longer closes him.
    iaWidget.querySelector('.ia-full').addEventListener('click', (e) => {
      if (iaWasDragged) return; // releasing a drag isn't a "click to minimize"
      if (e.target.closest && e.target.closest('.ia-btn')) return;
      minimizeBmo();
    });
    iaWidget.querySelectorAll('.ia-hs').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation(); // a tap here shouldn't also minimize him
        if (iaWasDragged || !iaMaximized) return;
        if (el.getAttribute('data-k') === 'D') toggleDoubleDialMode();
        registerGoldTap(el.getAttribute('data-k'));
      });
    });
    applyTheme(getStoredTheme());
    setSnipingIndicator(window.__iansAssistantSniperActive);
    applySuperState();
    applyDoubleDialState();
    const aaToggle = iaWidget.querySelector('.ia-toggle--aa');
    if (aaToggle) aaToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (iaWasDragged || !iaMaximized) return;
      setAutoAnswer(!autoAnswerOn());
    });
    applyAutoAnswerState();
    try { GM_addValueChangeListener(AUTO_ANSWER_KEY, () => applyAutoAnswerState()); } catch (e) { /* ignore */ }
    updateTodayStats();
    setInterval(updateTodayStats, 30000); // picks up the 2pm GMT reset and other tabs
    const modeBtn = iaWidget.querySelector('.ia-mode-btn');
    if (modeBtn) modeBtn.addEventListener('click', (e) => { e.stopPropagation(); cycleMode(); });
    applyMode();
    try { GM_addValueChangeListener('ia-mode', () => applyMode()); } catch (e) { /* ignore */ }
    applyStoredPosition();
    initDrag();

    return iaWidget;
  }

  // --- Dragging Pip — minimized bubble OR maximized body — with a floaty
  // "air resistance" trail ---------------------------------------------
  // Rendered position eases toward the cursor each frame (lerp) so he
  // trails behind, and leans opposite that lag. When maximized, his whole
  // body is a drag handle except the buttons and the client link; a plain
  // click (no movement) still minimizes as before.
  const POSITION_STORAGE_KEY = 'bmo-position';
  const PANEL_W = 280;
  const PANEL_H = 331;
  const BUBBLE_W = 96;
  const BUBBLE_H = 76;
  let iaWasDragged = false;
  let dragState = null;

  // --- "Shaken viciously" -> dead face --------------------------------
  // Tracked off the same eased position dragTick already renders every
  // frame (not raw mousemove events), so it reflects actual on-screen
  // back-and-forth motion rather than raw, possibly-jittery input.
  // Counts rapid left-right direction reversals; enough of them close
  // together (a real shake) flips Pip to a dead face for 2 seconds,
  // whether he's currently maximized or minimized.
  let shakeLastX = null;
  let shakeLastDirSign = null;
  let shakeReversalCount = 0;
  let shakeWindowStart = 0;
  let deadFaceTimer = null;
  const SHAKE_MIN_STEP = 3; // px per frame — ignores sub-pixel jitter
  const SHAKE_WINDOW_MS = 900; // reversals must land within this span
  const SHAKE_REVERSALS_NEEDED = 5;

  function resetShakeTracking() {
    shakeLastX = null;
    shakeLastDirSign = null;
    shakeReversalCount = 0;
    shakeWindowStart = 0;
  }

  function triggerDeadFace() {
    if (!iaWidget) return;
    iaWidget.classList.add('ia-widget--dead');
    if (deadFaceTimer) clearTimeout(deadFaceTimer);
    deadFaceTimer = setTimeout(() => {
      if (iaWidget) iaWidget.classList.remove('ia-widget--dead');
      deadFaceTimer = null;
    }, 2000);
  }

  function trackShake(x) {
    if (shakeLastX == null) { shakeLastX = x; return; }
    const step = x - shakeLastX;
    shakeLastX = x;
    if (Math.abs(step) < SHAKE_MIN_STEP) return;
    const sign = step > 0 ? 1 : -1;
    if (shakeLastDirSign != null && sign !== shakeLastDirSign) {
      const now = Date.now();
      if (!shakeWindowStart || now - shakeWindowStart > SHAKE_WINDOW_MS) {
        shakeWindowStart = now;
        shakeReversalCount = 0;
      }
      shakeReversalCount++;
      if (shakeReversalCount >= SHAKE_REVERSALS_NEEDED) {
        triggerDeadFace();
        shakeReversalCount = 0;
        shakeWindowStart = 0;
      }
    }
    shakeLastDirSign = sign;
  }

  function getStoredPosition() {
    try {
      const raw = GM_getValue(POSITION_STORAGE_KEY, null);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed.x === 'number' && typeof parsed.y === 'number') return parsed;
    } catch (e) { /* ignore */ }
    return null;
  }

  function isShowingFull() {
    return iaMaximized || (iaWidget && iaWidget.classList.contains('ia-widget--peeking'));
  }

  // The widget box is always 280x331, but when minimized only the bubble
  // in its bottom-right corner is visible. Clamping the whole box kept the
  // bubble from ever reaching the top/left screen edges, so clamp to
  // whatever is actually showing instead.
  function clampToViewport(x, y) {
    const full = isShowingFull();
    const minX = full ? 0 : -(PANEL_W - BUBBLE_W);
    const minY = full ? 0 : -(PANEL_H - BUBBLE_H);
    const maxX = Math.max(minX, window.innerWidth - PANEL_W);
    const maxY = Math.max(minY, window.innerHeight - PANEL_H);
    return { x: Math.min(Math.max(minX, x), maxX), y: Math.min(Math.max(minY, y), maxY) };
  }

  function applyStoredPosition() {
    const pos = getStoredPosition();
    if (!pos || !iaWidget) return;
    const clamped = clampToViewport(pos.x, pos.y);
    iaWidget.style.left = clamped.x + 'px';
    iaWidget.style.top = clamped.y + 'px';
    iaWidget.style.right = 'auto';
    iaWidget.style.bottom = 'auto';
  }

  // Opening him from a bubble parked near the top/left edge would spill
  // the full body off-screen — slide him back in.
  function reclampToViewport(animate) {
    if (!iaWidget || !iaWidget.style.left || dragState) return; // default corner is always on-screen
    const x = parseFloat(iaWidget.style.left);
    const y = parseFloat(iaWidget.style.top);
    const c = clampToViewport(x, y);
    if (c.x === x && c.y === y) return;
    if (animate) {
      iaWidget.style.transition = 'left .35s cubic-bezier(.34,1.56,.64,1), top .35s cubic-bezier(.34,1.56,.64,1)';
      setTimeout(() => { if (iaWidget && !dragState) iaWidget.style.transition = ''; }, 400);
    }
    iaWidget.style.left = c.x + 'px';
    iaWidget.style.top = c.y + 'px';
  }

  window.addEventListener('resize', () => reclampToViewport(false));

  function isDragHandle(target) {
    if (!target || !target.closest) return false;
    if (target.closest('.ia-btn, .ia-screen-info__client, .ia-reminder, .ia-cbdue')) return false;
    if (target.closest('.ia-bubble')) return !iaMaximized;
    if (target.closest('.ia-full')) return iaMaximized;
    return false;
  }

  function initDrag() {
    iaWidget.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // left button only
      if (!isDragHandle(e.target)) return;
      e.preventDefault();

      // Re-grabbing mid-settle: stop the old ease loop and pick up from
      // where he currently is.
      if (dragState && dragState.animFrame) cancelAnimationFrame(dragState.animFrame);

      let left, top;
      if (iaWidget.style.left) {
        left = parseFloat(iaWidget.style.left);
        top = parseFloat(iaWidget.style.top);
      } else {
        const rect = iaWidget.getBoundingClientRect();
        left = rect.left;
        top = rect.top;
      }
      // Switch from right/bottom anchoring to left/top on first grab.
      iaWidget.style.left = left + 'px';
      iaWidget.style.top = top + 'px';
      iaWidget.style.right = 'auto';
      iaWidget.style.bottom = 'auto';
      iaWidget.style.transition = 'none';

      const grabOffsetX = e.clientX - left;
      const grabOffsetY = e.clientY - top;
      // Tilt pivots around the point actually being held, so dragging the
      // big maximized body leans naturally instead of swinging around a
      // fixed spot near the bubble.
      iaWidget.style.transformOrigin = grabOffsetX + 'px ' + grabOffsetY + 'px';
      iaWidget.classList.add('ia-widget--dragging');
      resetShakeTracking();

      preOpenPos = null; // moved by hand: stay where dropped
      dragState = {
        startClientX: e.clientX,
        startClientY: e.clientY,
        grabOffsetX,
        grabOffsetY,
        targetX: left,
        targetY: top,
        currentX: left,
        currentY: top,
        moved: false,
      };
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragEnd);
    });
  }

  // --- Easter egg: slam Pip into a screen edge fast and his screen cracks
  // for a moment. Measures how fast the mouse is moving at the instant he
  // first hits the edge (rather than sliding along it).
  const CRACK_SPEED_PX_PER_MS = 3;
  const CRACK_SHOW_MS = 2600;
  let crackTimer = null;
  let lastCrackAt = 0;

  function triggerCrack() {
    if (!iaWidget || Date.now() - lastCrackAt < 4000) return;
    lastCrackAt = Date.now();
    iaWidget.classList.remove('ia-widget--cracked');
    void iaWidget.offsetWidth;
    iaWidget.classList.add('ia-widget--cracked');
    if (crackTimer) clearTimeout(crackTimer);
    crackTimer = setTimeout(() => { if (iaWidget) iaWidget.classList.remove('ia-widget--cracked'); }, CRACK_SHOW_MS);
  }

  function onDragMove(e) {
    if (!dragState) return;
    const totalDx = e.clientX - dragState.startClientX;
    const totalDy = e.clientY - dragState.startClientY;
    if (Math.abs(totalDx) > 4 || Math.abs(totalDy) > 4) dragState.moved = true;

    const now = performance.now();
    if (dragState.lastMoveT) {
      const dt = Math.max(1, now - dragState.lastMoveT);
      const speed = Math.hypot(e.clientX - dragState.lastMoveX, e.clientY - dragState.lastMoveY) / dt;
      dragState.speed = dragState.speed ? dragState.speed * 0.5 + speed * 0.5 : speed;
    }
    dragState.lastMoveT = now;
    dragState.lastMoveX = e.clientX;
    dragState.lastMoveY = e.clientY;

    const rawX = e.clientX - dragState.grabOffsetX;
    const rawY = e.clientY - dragState.grabOffsetY;
    const clampedNow = clampToViewport(rawX, rawY);
    const atEdge = clampedNow.x !== rawX || clampedNow.y !== rawY;
    if (atEdge && !dragState.wasAtEdge && (dragState.speed || 0) > CRACK_SPEED_PX_PER_MS) triggerCrack();
    dragState.wasAtEdge = atEdge;

    const clamped = clampedNow;
    dragState.targetX = clamped.x;
    dragState.targetY = clamped.y;
    if (!dragState.animFrame) dragState.animFrame = requestAnimationFrame(dragTick);
  }

  function dragTick() {
    if (!dragState) return;
    dragState.animFrame = null;
    const dx = dragState.targetX - dragState.currentX;
    const dy = dragState.targetY - dragState.currentY;
    dragState.currentX += dx * 0.22;
    dragState.currentY += dy * 0.22;

    iaWidget.style.left = dragState.currentX + 'px';
    iaWidget.style.top = dragState.currentY + 'px';

    // Leans INTO the direction of travel -- dragging right leans
    // clockwise, dragging left leans counter-clockwise (CSS rotate()'s
    // positive direction is clockwise on screen). dx here is how far
    // ahead the target is of the eased/rendered position -- i.e. the
    // direction and rough magnitude of the current motion -- so no sign
    // flip is needed, unlike the old "trail behind" lean this replaced.
    const tilt = Math.max(-18, Math.min(18, dx * 0.7));
    iaWidget.style.transform = 'rotate(' + tilt.toFixed(2) + 'deg)';

    trackShake(dragState.currentX);

    if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) {
      dragState.animFrame = requestAnimationFrame(dragTick);
    } else if (dragState.settling) {
      finishDragSettle();
    }
  }

  function finishDragSettle() {
    iaWidget.style.left = dragState.targetX + 'px';
    iaWidget.style.top = dragState.targetY + 'px';
    iaWidget.style.transition = 'transform .4s ease';
    iaWidget.style.transform = 'rotate(0deg)';
    try { GM_setValue(POSITION_STORAGE_KEY, JSON.stringify({ x: dragState.targetX, y: dragState.targetY })); } catch (e) { /* best-effort */ }
    dragState = null;
    setTimeout(() => {
      if (!iaWidget || dragState) return; // a new drag already started — leave its settings alone
      iaWidget.style.transition = '';
      iaWidget.style.transformOrigin = '';
    }, 400);
  }

  function onDragEnd() {
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    if (!dragState) return;
    iaWidget.classList.remove('ia-widget--dragging');
    // Swallow only the click that immediately follows this mouseup. The
    // reset is deferred so a release outside Pip (where no click fires)
    // can't leave the flag stuck and eat the next real click.
    iaWasDragged = dragState.moved;
    setTimeout(() => { iaWasDragged = false; }, 0);
    dragState.settling = true;
    if (!dragState.animFrame) finishDragSettle();
  }

  // The left of the two decorative pill buttons doubles as a skin-color
  // toggle now — everything themeable (body, screen, arms, speaker, both
  // pills, screen text) reads its color from a CSS custom property, so
  // applying a theme class here fades the whole character between
  // palettes via CSS transition rather than needing a JS-driven
  // animation. Cycles through all three rather than just flipping
  // between two.
  const THEME_STORAGE_KEY = 'bmo-theme';
  const THEME_CYCLE = ['midnight', 'teal', 'pink', 'black'];

  // All skins (incl. gold + rainbow) are unlocked in Ian's Assistant.
  const isOwner = true;

  function themeCycle() {
    return isOwner ? THEME_CYCLE.concat('gold', 'rainbow') : THEME_CYCLE;
  }

  function checkOwner() { /* no owner check in Ian's Assistant */ }

  // Regular users only ever have the three normal colors saved/cycled;
  // gold and rainbow are never saved for them, so they never come back on
  // their own after a reload.
  function getStoredTheme() {
    let t;
    try { t = GM_getValue(THEME_STORAGE_KEY, 'midnight'); } catch (e) { t = 'midnight'; }
    return themeCycle().includes(t) ? t : 'midnight';
  }

  let rainbowTheme = false; // rainbow picked as the skin (owner) or via the secret combo
  function applyTheme(name) {
    if (!iaWidget) return;
    iaWidget.classList.remove('ia-widget--midnight', 'ia-widget--pink', 'ia-widget--black', 'ia-widget--gold');
    if (name === 'midnight') iaWidget.classList.add('ia-widget--midnight');
    else if (name === 'pink') iaWidget.classList.add('ia-widget--pink');
    else if (name === 'black') iaWidget.classList.add('ia-widget--black');
    else if (name === 'gold') iaWidget.classList.add('ia-widget--gold');
    // 'teal' is the unmarked default -- no class needed for it. Rainbow
    // sits on top of the teal base.
    rainbowTheme = name === 'rainbow';
    if (typeof applySuperState === 'function') applySuperState();
  }

  function getCurrentTheme() {
    if (!iaWidget) return 'teal';
    if (rainbowTheme) return 'rainbow';
    if (iaWidget.classList.contains('ia-widget--midnight')) return 'midnight';
    if (iaWidget.classList.contains('ia-widget--pink')) return 'pink';
    if (iaWidget.classList.contains('ia-widget--black')) return 'black';
    if (iaWidget.classList.contains('ia-widget--gold')) return 'gold';
    return 'teal';
  }

  function toggleTheme() {
    if (!iaWidget) return;
    // Super Pip earned today: the rainbow is locked in until the 2pm GMT
    // reset. The color button just gives a little "locked" wiggle.
    if (superLocked()) { showLockedWiggle(); return; }
    const cycle = themeCycle();
    const current = getCurrentTheme();
    // A secret skin entered by combo (not part of this user's cycle) just
    // drops back to the regular saved color.
    if (!cycle.includes(current)) { applyTheme(getStoredTheme()); return; }
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
    applyTheme(next);
    try { GM_setValue(THEME_STORAGE_KEY, next); } catch (e) { /* best-effort */ }
  }

  // Colors are never locked any more: Super Pip only takes over while
  // he's actively calling, and your own color comes back when stopped.
  function superLocked() {
    return false;
  }

  function showLockedWiggle() {
    const pill = iaWidget && iaWidget.querySelector('.ia-btn-theme');
    if (!pill) return;
    pill.classList.remove('ia-locked-wiggle');
    void pill.getBBox();
    pill.classList.add('ia-locked-wiggle');
  }

  // --- "Level up" celebration --------------------------------------------
  let levelUpTimer = null;
  function playLevelUp(withSubtitle) {
    const el = ensureBmo();
    const wasMaximized = iaMaximized;
    // If he's minimized, briefly show the full Pip so the moment is seen.
    if (!wasMaximized) el.classList.add('ia-widget--peeking');
    el.classList.toggle('ia-widget--levelup-sub', !!withSubtitle);
    el.classList.remove('ia-widget--levelup');
    void el.offsetWidth;
    el.classList.add('ia-widget--levelup');
    triggerWave();
    if (levelUpTimer) clearTimeout(levelUpTimer);
    levelUpTimer = setTimeout(() => {
      el.classList.remove('ia-widget--levelup');
      if (!wasMaximized && !iaMaximized) el.classList.remove('ia-widget--peeking');
    }, 2600);
  }

  // --- Secret gold skin ------------------------------------------------
  // Shown only when three of Pip's plain, decorative body parts are
  // tapped in one exact order while he's open. Only a salted SHA-256 hash
  // of that order lives in this file, never the order itself, so reading
  // the source doesn't reveal it. Taps more than 1.5s apart restart the
  // attempt, and a wrong attempt shows nothing. Entering the combo again
  // while gold turns it back off.
  const GOLD_HASH = '6c766247760cab576302d8288cf9a7b6fae65b63e27a612deaa12c8b6c7f9462';
  // Second secret combo (same taps, different order): rainbow skin.
  const RAINBOW_HASH = '9aac100df7916bdeb49a9a19766cd754ab1125401ef647ccc9b8406b9884e73e';
  const GOLD_SEQ_LEN = 8;
  let goldTaps = '';
  let goldLastTap = 0;

  async function sha256Hex(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  async function registerGoldTap(k) {
    const now = Date.now();
    if (now - goldLastTap > 1500) goldTaps = '';
    goldLastTap = now;
    goldTaps = (goldTaps + k).slice(-GOLD_SEQ_LEN);
    if (goldTaps.length < GOLD_SEQ_LEN) return;
    let h, hr;
    try {
      h = await sha256Hex('ia-gold:' + goldTaps);
      hr = await sha256Hex('ia-rainbow:' + goldTaps);
    } catch (e) { return; }
    if ((hr === RAINBOW_HASH || h === GOLD_HASH) && superLocked()) { goldTaps = ''; showLockedWiggle(); return; }
    if (hr === RAINBOW_HASH) {
      goldTaps = '';
      if (getCurrentTheme() === 'rainbow') { applyTheme(getStoredTheme() === 'rainbow' ? 'teal' : getStoredTheme()); return; }
      applyTheme('rainbow'); // deliberately not saved
      triggerWave();
      return;
    }
    if (h !== GOLD_HASH) return;
    goldTaps = '';
    if (getCurrentTheme() === 'gold') { applyTheme(getStoredTheme() === 'gold' ? 'teal' : getStoredTheme()); return; }
    applyTheme('gold'); // deliberately not saved
    iaWidget.classList.add('ia-widget--gold-unlock');
    setTimeout(() => iaWidget && iaWidget.classList.remove('ia-widget--gold-unlock'), 1600);
    triggerWave();
  }

  // --- Sniper-active indicator ---------------------------------------
  // The lead sniper (PART 5, below) lives in its own IIFE, so it can't
  // touch iaWidget directly. Instead it flips a boolean on window and
  // dispatches an event; this is the one place that listens and applies
  // it as a class overlay on top of whatever theme is active, rather
  // than as a fourth theme, so it always reverts to the real theme
  // (teal/pink/black) the moment sniping turns off instead of getting
  // "stuck" chosen like a theme would.
  function setSnipingIndicator(active) {
    if (!iaWidget) return;
    iaWidget.classList.toggle('ia-widget--sniping', !!active);
  }
  window.addEventListener('iansassistant:sniper-state', (e) => {
    setSnipingIndicator(e.detail && e.detail.active);
  });

  function triggerWave() {
    if (!iaWidget) return;
    ['.ia-arm-left', '.ia-arm-right'].forEach((sel) => {
      const arm = iaWidget.querySelector(sel);
      if (!arm) return;
      arm.classList.remove('ia-waving');
      void arm.getBBox && arm.getBBox(); // restart the CSS animation (SVG-safe reflow trigger)
      arm.classList.add('ia-waving');
    });
  }

  // Used when Pip is currently minimized and the hourly reminder becomes
  // due — briefly shows the full character just long enough to fade the
  // arms in, wave, and fade them out again, then returns to the
  // minimized bubble. Deliberately non-interactive (see the
  // .ia-widget--peeking CSS) and never touches iaMaximized, so this is
  // purely a visual nudge, not Pip actually opening.
  let peekTimeout = null;
  function peekAndWave() {
    const el = ensureBmo();
    if (iaMaximized) { triggerWave(); return; }
    el.classList.add('ia-widget--peeking');
    reclampToViewport(true);
    triggerWave();
    if (peekTimeout) clearTimeout(peekTimeout);
    peekTimeout = setTimeout(() => {
      if (!iaMaximized) el.classList.remove('ia-widget--peeking');
    }, 2300); // just past the 2.2s wave animation, so the peek doesn't cut off mid-wave
  }

  // Where the bubble sat before opening — if opening had to slide Pip
  // into view, minimizing glides him back there in the same motion
  // (instead of shrinking first and jumping afterwards).
  let preOpenPos = null;
  async function maximizeBmo() {
    iaMaximized = true;
    const el = ensureBmo();
    preOpenPos = el.style.left ? { left: el.style.left, top: el.style.top } : null;
    el.classList.add('ia-widget--maximized');
    reclampToViewport(true);
    triggerWave();
    if (!dialerInitialized) {
      dialerInitialized = true;
      updateAllRowIndicators();
      // Labeled "Up next", not "Currently calling" -- nobody has been
      // dialed yet at this point, and the label needs to say so.
      renderPanelForRow(await getNextPendingRow(), false);
    }
  }

  function minimizeBmo() {
    iaMaximized = false;
    if (!iaWidget) return;
    const back = preOpenPos;
    preOpenPos = null;
    if (back && !dragState && (iaWidget.style.left !== back.left || iaWidget.style.top !== back.top)) {
      iaWidget.style.transition = 'left .35s cubic-bezier(.34,1.56,.64,1), top .35s cubic-bezier(.34,1.56,.64,1)';
      iaWidget.style.left = back.left;
      iaWidget.style.top = back.top;
      setTimeout(() => { if (iaWidget && !dragState) iaWidget.style.transition = ''; }, 400);
    }
    iaWidget.classList.remove('ia-widget--maximized');
  }

  // First press while Pip is running: stop, and clearly show it stopped
  // (Pip stays open). A press when he's not running minimizes him.
  function handleStopClick() {
    if (isAutoActive()) {
      stopAutoRun();
      showStopped();
      return;
    }
    minimizeBmo();
  }

  function isAutoActive() {
    return autoRunning || awaitingCallEnd || !!autoNextTimer || pendingAutoNext;
  }

  function showStopped() {
    const el = ensureBmo();
    if (!currentPanelRow) {
      el.querySelector('.ia-face').style.display = 'none';
      el.querySelector('.ia-screen-info').style.display = '';
      el.querySelector('.ia-screen-info__label').textContent = 'Auto-dial';
      const clientEl = el.querySelector('.ia-screen-info__client');
      clientEl.textContent = 'Stopped';
      clientEl.removeAttribute('href');
      el.querySelector('.ia-screen-info__route').textContent = '';
    }
    setPanelStatus('\u25A0 Stopped \u2014 press Stop again to close');
    el.classList.remove('ia-widget--stop-flash');
    void el.offsetWidth;
    el.classList.add('ia-widget--stop-flash');
  }

  // ==========================================================================
  // RingCentral Embeddable — call-status watcher for the auto-dialer
  // ==========================================================================
  // Pip still dials the normal way (tel: links -> your RingCentral app). The
  // RingCentral panel is used ONLY to watch call status: it reports every
  // active call on your RingCentral account, on any device, so Pip can tell
  // when a call ends. Once you press Call, Pip stays "running" — every time
  // a call ends he waits a few seconds, then dials the next lead by himself
  // — until you press Stop.
  //
  // Chrome may refuse a tel: link that isn't triggered by a real click. If
  // no call shows up within a few seconds of an automatic dial, Pip assumes
  // Chrome blocked it and waits for you to press Call for that one lead.
  // Root cause of calls only working while signed into the widget:
  // RingCentral's adapter.js script runs INSIDE the BO page and takes over
  // tel: phone links there — signed out, it swallowed them, so neither the
  // BO's own phone links nor Pip's reached the Windows app. So adapter.js
  // is no longer used at all. The RingCentral phone is loaded as a plain
  // iframe instead: it lives in its own sealed-off box, can't touch anything
  // on the BO page, and still reports call status to Pip.
  const RC_APP_URL = 'https://apps.ringcentral.com/integration/ringcentral-embeddable/latest/app.html';
  const AUTO_NEXT_DELAY_SEC = 4;
  const CALL_APPEAR_TIMEOUT_MS = 12000;
  const pageWin = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;

  let autoRunning = false;      // set by pressing Call, cleared by Stop
  let awaitingCallEnd = false;  // Pip dialed and is watching for that call
  let callSeen = false;         // RingCentral has reported that call as live
  let callAppearTimer = null;
  let autoNextTimer = null;
  let autoNextCountdown = null;
  let pendingAutoNext = false;  // next dial is waiting for your own call to end
  let iaCallDigits = null;     // number Pip is currently calling (last 10 digits)
  let iaCallConnectedAt = 0;   // when Pip's current call connected (0 = never)
  let leadRedialed = false;     // double-dial: this lead already got its 2nd call
  // Every live call RingCentral reports on your account: key -> { mine, seen }
  const activeCalls = new Map();
  const DOUBLE_DIAL_KEY = 'bmo-double-dial';
  const DOUBLE_DIAL_DELAY_SEC = 3;
  const ANSWERED_AFTER_SEC = 60; // connected longer than this = someone answered

  function digitsOf(n) { return String(n || '').replace(/\D/g, '').slice(-10); }

  function doubleDialOn() {
    try { return !!GM_getValue(DOUBLE_DIAL_KEY, false); } catch (e) { return false; }
  }
  function applyDoubleDialState() {
    if (iaWidget) iaWidget.classList.toggle('ia-widget--dd-on', doubleDialOn());
  }
  function toggleDoubleDialMode() {
    try { GM_setValue(DOUBLE_DIAL_KEY, !doubleDialOn()); } catch (e) { /* best-effort */ }
    applyDoubleDialState();
  }

  // --- Auto-answer ------------------------------------------------------
  // One shared on/off setting (also read by the RingCentral web app part,
  // PART 9). Here it answers calls that ring inside the BO's RingCentral
  // panel — RingCentral only reports ringing calls to the page when the
  // panel's calling mode is "Browser". Never answers while already on a
  // call. AUTO_ANSWER_DELAY_MS is the pause before picking up: a call
  // answered the very instant it rings tends to connect with dead air.
  var AUTO_ANSWER_KEY = 'ia-auto-answer';
  var AUTO_ANSWER_DELAY_MS = 300;
  var rcConnected = new Set();

  // --- Mode: dark / light / navy ------------------------------------------
  var IA_MODE_LIST = ['dark', 'light', 'navy'];
  function applyMode() {
    if (!iaWidget) return;
    const m = iaMode();
    ['dark', 'light', 'navy'].forEach((x) => iaWidget.classList.toggle('ia-mode-' + x, x === m));
  }
  function cycleMode() {
    const next = IA_MODE_LIST[(IA_MODE_LIST.indexOf(iaMode()) + 1) % IA_MODE_LIST.length];
    try { GM_setValue('ia-mode', next); } catch (e) { /* best-effort */ }
    applyMode();
  }
  // Pip's face while Pip's own call is live.
  function setOnCall(on) {
    if (iaWidget) iaWidget.classList.toggle('ia-widget--oncall', !!on);
  }
  function autoAnswerOn() {
    try { return !!GM_getValue(AUTO_ANSWER_KEY, false); } catch (e) { return false; }
  }
  function applyAutoAnswerState() {
    if (iaWidget) iaWidget.classList.toggle('ia-widget--aa-on', autoAnswerOn());
  }
  function setAutoAnswer(on) {
    try { GM_setValue(AUTO_ANSWER_KEY, !!on); } catch (e) { /* best-effort */ }
    applyAutoAnswerState();
  }
  (typeof unsafeWindow !== 'undefined' ? unsafeWindow : window).addEventListener('message', (e) => {
    if (e.origin !== 'https://apps.ringcentral.com') return;
    const d = e.data;
    if (!d || typeof d.type !== 'string') return;
    const call = d.call || {};
    const id = call.id || call.callId || call.sessionId || call.telephonySessionId;
    if (d.type === 'rc-call-start-notify' && id) rcConnected.add(id);
    if (d.type === 'rc-call-end-notify' && id) rcConnected.delete(id);
    if (d.type !== 'rc-call-ring-notify' || !autoAnswerOn()) return;
    if (call.direction && call.direction !== 'Inbound') return;
    if (rcConnected.size) return; // already on a call
    setTimeout(() => {
      if (!autoAnswerOn() || rcConnected.size) return;
      const frame = document.getElementById('rc-widget-adapter-frame');
      if (!frame || !frame.contentWindow) return;
      const msg = { type: 'rc-adapter-control-call', callAction: 'answer' };
      if (id) msg.callId = id;
      frame.contentWindow.postMessage(msg, 'https://apps.ringcentral.com');
    }, AUTO_ANSWER_DELAY_MS);
  });

  function manualCallActive() {
    const now = Date.now();
    for (const [k, c] of activeCalls) {
      if (now - c.seen > 4 * 60 * 60 * 1000) { activeCalls.delete(k); continue; } // stale
      if (!c.mine) return true;
    }
    return false;
  }

  function loadRingCentral() {
    if (document.getElementById('ia-rc-panel') || !document.body) return;
    const panel = document.createElement('div');
    panel.id = 'ia-rc-panel';
    const frame = document.createElement('iframe');
    frame.id = 'rc-widget-adapter-frame';
    frame.src = RC_APP_URL;
    frame.setAttribute('allow', 'microphone; autoplay; clipboard-read; clipboard-write');
    panel.appendChild(frame);
    document.body.appendChild(panel);
  }

  function rcContainer() {
    return document.getElementById('ia-rc-panel');
  }

  // Dials through your normal tel: handler (the RingCentral app) and starts
  // watching RingCentral's call status for that call.
  // Plain tel: link -> whatever Windows/Chrome has as the default phone
  // app (your RingCentral Windows app). The widget never places calls.
  const DIAL_URI_PREFIX = 'tel:';

  // Opens the tel: link by navigating the page's own address to it, not by
  // clicking a link element. With the RingCentral widget loaded, a clicked
  // tel: link was being picked up by the widget and routed through it —
  // which is why calls only went out while signed into the widget. Nothing
  // on the page can intercept a direct navigation, so the call always goes
  // straight to Windows' default phone app (your RingCentral app), signed
  // into the widget or not.
  function dialNumber(number, byRealClick) {
    bumpTodayStat('calls');
    window.location.href = DIAL_URI_PREFIX + number;
    if (!rcContainer()) return; // no status watcher -> old one-click-per-call mode
    awaitingCallEnd = true;
    callSeen = false;
    iaCallDigits = digitsOf(number);
    iaCallConnectedAt = 0;
    if (callAppearTimer) clearTimeout(callAppearTimer);
    callAppearTimer = setTimeout(() => {
      callAppearTimer = null;
      if (!awaitingCallEnd || callSeen) return;
      awaitingCallEnd = false;
      setPanelStatus(byRealClick ? 'No call detected' : 'Chrome blocked auto-dial — press Call');
    }, CALL_APPEAR_TIMEOUT_MS);
  }

  function clearAutoNext() {
    if (autoNextTimer) { clearTimeout(autoNextTimer); autoNextTimer = null; }
    if (autoNextCountdown) { clearInterval(autoNextCountdown); autoNextCountdown = null; }
  }

  function stopAutoRun() {
    setOnCall(false);
    autoRunning = false;
    awaitingCallEnd = false;
    callSeen = false;
    pendingAutoNext = false;
    iaCallDigits = null;
    if (callAppearTimer) { clearTimeout(callAppearTimer); callAppearTimer = null; }
    clearAutoNext();
    if (iaWidget) iaWidget.classList.remove('ia-widget--running');
    if (typeof applySuperState === 'function') applySuperState();
    if (currentPanelRow) setPanelStatus('Stopped');
  }

  function startAutoRun() {
    if (!rcContainer()) return; // can't detect call ends without RingCentral
    autoRunning = true;
    if (iaWidget) iaWidget.classList.add('ia-widget--running');
    if (typeof applySuperState === 'function') applySuperState();
  }

  function onCallEnded() {
    setOnCall(false);
    if (!awaitingCallEnd || !callSeen) return; // not a call Pip is watching
    awaitingCallEnd = false;
    callSeen = false;
    const answered = iaCallConnectedAt && (Date.now() - iaCallConnectedAt) / 1000 > ANSWERED_AFTER_SEC;
    iaCallDigits = null;
    if (answered) bumpTodayStat('answered');
    if (!autoRunning) { setPanelStatus('Call ended'); return; }

    // Double dial: unanswered calls get one immediate second try.
    if (doubleDialOn() && !leadRedialed && !answered && lastCalledInfo) {
      leadRedialed = true;
      startCountdown(DOUBLE_DIAL_DELAY_SEC, 'No answer \u2014 redialing in ', () => { dialNumber(lastCalledInfo.number, false); setPanelStatus('Redialing\u2026'); });
      return;
    }
    scheduleNextLead();
  }

  function scheduleNextLead() {
    if (manualCallActive()) {
      clearAutoNext();
      pendingAutoNext = true;
      setPanelStatus('Paused \u2014 you\u2019re on a call');
      return;
    }
    pendingAutoNext = false;
    startCountdown(AUTO_NEXT_DELAY_SEC, 'Call ended \u2014 next in ', () => handleCallClick(true));
  }

  function startCountdown(seconds, label, action) {
    clearAutoNext();
    let left = seconds;
    setPanelStatus(label + left + 's');
    autoNextCountdown = setInterval(() => {
      left -= 1;
      if (left > 0) setPanelStatus(label + left + 's');
    }, 1000);
    autoNextTimer = setTimeout(() => {
      clearAutoNext();
      if (!autoRunning) return;
      // Never dial over a call you placed yourself — wait for it to end.
      if (manualCallActive()) { pendingAutoNext = true; setPanelStatus('Paused \u2014 you\u2019re on a call'); return; }
      action();
    }, seconds * 1000);
  }

  // Your own call started/ended: pause or resume the auto-dialer.
  function onManualCallsChanged() {
    if (manualCallActive()) {
      if (autoNextTimer) { clearAutoNext(); pendingAutoNext = true; }
      if (pendingAutoNext || autoRunning) setPanelStatus('Paused \u2014 you\u2019re on a call');
    } else if (pendingAutoNext && autoRunning && !awaitingCallEnd) {
      scheduleNextLead();
    }
  }

  // Tracks EVERY call on your RingCentral account, and tells Pip's own
  // call (outbound to the number he just dialed) apart from calls you make
  // or take yourself. Your own calls pause the auto-dialer until they end.
  pageWin.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || typeof d.type !== 'string' || d.type.indexOf('rc-') !== 0) return;
    if (!d.call) return;
    const call = d.call;
    let st = call.telephonyStatus;
    if (d.type === 'rc-call-start-notify') st = 'CallConnected';
    if (d.type === 'rc-call-end-notify') st = 'NoCall';
    if (!st) return;
    const toDigits = digitsOf((call.to && (call.to.phoneNumber || call.to.extensionNumber)) || call.toNumber);
    const key = call.sessionId || call.telephonySessionId || call.id || call.partyId || ((call.direction || '') + toDigits);
    const known = activeCalls.get(key);
    const live = st === 'Ringing' || st === 'CallConnected' || st === 'OnHold' || st === 'Proceeding';

    if (live) {
      let mine = known ? known.mine : false;
      if (!known && awaitingCallEnd && call.direction !== 'Inbound') {
        // Pip's call: outbound to the number he dialed (or, if RingCentral
        // doesn't say the number, the first outbound call after he dialed).
        mine = toDigits ? toDigits === iaCallDigits : !callSeen;
      }
      activeCalls.set(key, { mine, seen: Date.now() });
      if (mine) {
        callSeen = true;
        setOnCall(true);
        if (st === 'CallConnected' && !iaCallConnectedAt) iaCallConnectedAt = Date.now();
        if (!manualCallActive()) setPanelStatus(st === 'Ringing' ? 'Ringing\u2026' : st === 'OnHold' ? 'On hold' : 'On call');
      } else {
        onManualCallsChanged();
      }
    } else if (st === 'NoCall') {
      activeCalls.delete(key);
      const wasMine = known ? known.mine : (awaitingCallEnd && callSeen && (!toDigits || toDigits === iaCallDigits));
      if (wasMine) onCallEnded();
      else onManualCallsChanged();
    }
  });

  loadRingCentral();

  // --- Merge RingCentral into the CRM's own floating phone widget -------
  // RingCentral's own floating badge is hidden. Clicking the CRM's phone
  // button opens RingCentral's panel fully expanded beside it (the CRM
  // button acts as the minimized state), and clicking it again or pressing
  // Esc hides it. Hidden, the panel keeps running so call status still
  // reaches Pip. The CRM widget's drag handle still moves it.
  const RC_PANEL_W = 300;
  const RC_PANEL_H = 500;
  let rcPanelOpen = false;
  let allowRcToggle = false; // lets our own expand-click through the interceptor below
  let rcReopenBlockedUntil = 0;

  function closeRcPanelFromToggle() {
    rcReopenBlockedUntil = Date.now() + 500;
    if (rcPanelOpen) setRcPanelOpen(false);
  }

  function expandRcIfMinimized(c) {
    const header = c.querySelector('.Adapter_header');
    const minimized = c.classList.contains('Adapter_minimized') || (header && header.classList.contains('Adapter_minimized'));
    if (!minimized) return;
    const toggle = c.querySelector('.Adapter_toggle');
    if (!toggle) return;
    allowRcToggle = true;
    try { toggle.click(); } finally { allowRcToggle = false; }
  }

  function positionRcPanel() {
    const c = rcContainer();
    const host = document.querySelector('.floating-chat-widget');
    if (!c || !host) return;
    const r = host.getBoundingClientRect();
    const gap = 8;
    // Prefer opening above the button; drop below it if there's no room.
    let top = r.top - RC_PANEL_H - gap;
    if (top < 8) top = Math.min(r.bottom + gap, window.innerHeight - RC_PANEL_H - 8);
    let left = r.right - RC_PANEL_W;
    left = Math.max(8, Math.min(left, window.innerWidth - RC_PANEL_W - 8));
    top = Math.max(8, top);
    c.style.setProperty('left', left + 'px', 'important');
    c.style.setProperty('top', top + 'px', 'important');
    c.style.setProperty('right', 'auto', 'important');
    c.style.setProperty('bottom', 'auto', 'important');
    // RingCentral stores its own drag offset as an inline !important
    // transform; clear it so the panel sits exactly where it's placed.
    c.style.setProperty('transform', 'none', 'important');
  }

  // Open/closed state lives on <html>, NOT on RingCentral's own element.
  // Root cause of the flicker: RingCentral rewrites its element's whole
  // class list every time it minimizes/expands, which wiped the classes
  // this script had put there — so the panel briefly fell back to
  // RingCentral's own visible state, then got hidden again on the next
  // check. RingCentral never touches <html>, so this can't be undone.
  function setRcPanelOpen(open) {
    rcPanelOpen = open;
    document.documentElement.setAttribute('data-ia-rc', open ? 'open' : 'closed');
    const c = rcContainer();
    if (!c) return;
    expandRcIfMinimized(c); // always keep it expanded underneath
    if (open) positionRcPanel();
  }

  // Clicking the CRM phone widget does BOTH: the CRM's own click still
  // goes through untouched (whatever it normally opens still opens), and
  // the RingCentral panel is toggled alongside it.
  document.addEventListener('click', (e) => {
    const content = e.target.closest && e.target.closest('.floating-chat-widget__content');
    if (!content || !rcContainer()) return; // RingCentral not loaded -> CRM widget works as normal
    if (!rcPanelOpen && Date.now() < rcReopenBlockedUntil) return; // stray click right after closing
    setRcPanelOpen(!rcPanelOpen);
  }, true);

  // RingCentral's own minimize button: instead of collapsing into its own
  // mini bar, close the panel back into the CRM phone button. Capture
  // phase runs before RingCentral's handler, so its minimize never fires.
  // RingCentral reacts to press events, not only clicks, so every press
  // event on its minimize button is swallowed at the window level (the
  // earliest point), and the click itself acts exactly like clicking the
  // CRM phone widget.
  ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'click'].forEach((type) => {
    window.addEventListener(type, (e) => {
      if (allowRcToggle) return;
      const toggle = e.target && e.target.closest && e.target.closest('#ia-rc-panel .Adapter_toggle');
      if (!toggle) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      // Always an explicit close (never a flip), so a repeated event
      // can't close it and then reopen it straight away.
      if (type === 'click' || type === 'pointerup' || type === 'touchend') closeRcPanelFromToggle();
    }, true);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && rcPanelOpen) setRcPanelOpen(false);
  });

  window.addEventListener('resize', () => { if (rcPanelOpen) positionRcPanel(); });

  // Take over RingCentral's panel as soon as it appears, keep it expanded,
  // and keep it glued to the CRM button if that button is dragged.
  __jsRegisterScan(() => {
    if (!rcContainer()) loadRingCentral();
    const c = rcContainer();
    if (!c) return;
    if (!document.documentElement.hasAttribute('data-ia-rc')) { setRcPanelOpen(false); return; }
    const header = c.querySelector('.Adapter_header');
    const minimized = c.classList.contains('Adapter_minimized') || (header && header.classList.contains('Adapter_minimized'));
    if (minimized) {
      // RingCentral minimized itself anyway -> same as clicking the CRM
      // widget: close the panel, and quietly re-expand it underneath.
      if (rcPanelOpen) setRcPanelOpen(false);
      else expandRcIfMinimized(c);
    }
    if (rcPanelOpen) positionRcPanel();
  });

  GM_addStyle(`
    #ia-rc-panel {
      position: fixed;
      width: ${RC_PANEL_W}px;
      height: ${RC_PANEL_H}px;
      z-index: 99998;
      background: #fff;
      overflow: hidden;
    }
    #ia-rc-panel iframe { width: 100%; height: 100%; border: 0; display: block; }
    html:not([data-ia-rc="open"]) #ia-rc-panel {
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
    html[data-ia-rc="closed"] #ia-rc-panel {
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
    html[data-ia-rc="open"] #ia-rc-panel {
      visibility: visible !important;
      opacity: 1 !important;
      box-shadow: 0 10px 30px rgba(0,0,0,.35) !important;
      border-radius: 10px !important;
    }

  `);


  // ==========================================================================
  // RC tab: live RingCentral texts + composer with follow-up templates
  // ==========================================================================
  // Replaces the BO's "You can only view this chat" bar with a composer.
  // Texts are read from the RingCentral panel's own conversation screen
  // (opened for this lead with RingCentral's "open conversation" command),
  // so ones the BO hasn't synced yet show right away, in the BO's own bubble
  // style. Send types into RingCentral's own message box and presses its own
  // Send button. Signed out -> "Sign in to RingCentral" opens its sign-in.
  const SMS_TPL_KEY = 'js-sms-templates';
  const SMS_RC_ORIGIN = 'https://apps.ringcentral.com';
  const SMS_DEFAULT_TPL = [
    { name: 'Follow-up 1', text: 'Hey {client}, {agent} here from Travel Business Class regarding your flight to {destination}. I\u2019ve got you some really good discounted business class deals with major airlines and wanted to confirm some information with you to see which one will work best. When is the best time to talk?' },
    { name: 'Follow-up 2', text: 'Hi, just following up on my message regarding your flight to {destination}. I found a couple of business class options that look pretty good for your trip. Would you have a few minutes today for me to run them by you?' },
    { name: 'Follow-up 3', text: 'Hey, just wanted to catch you before I close out your flight request. I still have some good business class fares available with major airlines. What time would be easiest for me to reach you?' },
    { name: 'Follow-up 4', text: 'Hi again! I wanted to check in and see if you\u2019re still looking at options for your flight to {destination}. I\u2019d be happy to go over the best fares I\u2019m seeing and see if we can find something that makes sense for you. When would be a good time to connect?' },
  ];
  const SMS_CITY = (() => {
    const m = {};
    ('ATL Atlanta|AUS Austin|BNA Nashville|BOS Boston|BWI Baltimore|CLT Charlotte|CLE Cleveland|CMH Columbus|CVG Cincinnati|DCA Washington|IAD Washington|DEN Denver|DFW Dallas|DAL Dallas|DTW Detroit|EWR New York|JFK New York|LGA New York|FLL Fort Lauderdale|HNL Honolulu|OGG Maui|KOA Kona|LIH Kauai|IAH Houston|HOU Houston|IND Indianapolis|JAX Jacksonville|LAS Las Vegas|LAX Los Angeles|BUR Los Angeles|SNA Orange County|MCI Kansas City|MCO Orlando|MDW Chicago|ORD Chicago|MIA Miami|MSP Minneapolis|MSY New Orleans|OAK Oakland|PDX Portland|PHL Philadelphia|PHX Phoenix|PIT Pittsburgh|RDU Raleigh|SAN San Diego|SAT San Antonio|SEA Seattle|SFO San Francisco|SJC San Jose|SLC Salt Lake City|SMF Sacramento|STL St. Louis|TPA Tampa|ANC Anchorage|RSW Fort Myers|PBI West Palm Beach|SJU San Juan|' +
     'YYZ Toronto|YUL Montreal|YVR Vancouver|YYC Calgary|YOW Ottawa|YEG Edmonton|YHZ Halifax|' +
     'MEX Mexico City|CUN Cancun|GDL Guadalajara|MTY Monterrey|SJD Los Cabos|PVR Puerto Vallarta|' +
     'LHR London|LGW London|LCY London|STN London|MAN Manchester|EDI Edinburgh|GLA Glasgow|DUB Dublin|SNN Shannon|CDG Paris|ORY Paris|NCE Nice|LYS Lyon|MRS Marseille|' +
     'AMS Amsterdam|BRU Brussels|FRA Frankfurt|MUC Munich|BER Berlin|DUS Dusseldorf|HAM Hamburg|ZRH Zurich|GVA Geneva|VIE Vienna|PRG Prague|BUD Budapest|WAW Warsaw|KRK Krakow|' +
     'CPH Copenhagen|ARN Stockholm|OSL Oslo|HEL Helsinki|KEF Reykjavik|MAD Madrid|BCN Barcelona|AGP Malaga|PMI Palma de Mallorca|IBZ Ibiza|LIS Lisbon|OPO Porto|' +
     'FCO Rome|CIA Rome|MXP Milan|LIN Milan|VCE Venice|FLR Florence|NAP Naples|BLQ Bologna|PSA Pisa|CTA Catania|PMO Palermo|' +
     'ATH Athens|JTR Santorini|JMK Mykonos|HER Crete|SKG Thessaloniki|IST Istanbul|SAW Istanbul|AYT Antalya|DBV Dubrovnik|SPU Split|ZAG Zagreb|OTP Bucharest|SOF Sofia|BEG Belgrade|TLV Tel Aviv|' +
     'DXB Dubai|AUH Abu Dhabi|DOH Doha|BAH Bahrain|KWI Kuwait|MCT Muscat|RUH Riyadh|JED Jeddah|AMM Amman|BEY Beirut|CAI Cairo|HRG Hurghada|SSH Sharm El Sheikh|CMN Casablanca|RAK Marrakech|TUN Tunis|' +
     'JNB Johannesburg|CPT Cape Town|NBO Nairobi|ADD Addis Ababa|LOS Lagos|ACC Accra|DAR Dar es Salaam|ZNZ Zanzibar|MRU Mauritius|SEZ Seychelles|' +
     'DEL Delhi|BOM Mumbai|BLR Bangalore|MAA Chennai|HYD Hyderabad|CCU Kolkata|COK Kochi|GOI Goa|AMD Ahmedabad|CMB Colombo|MLE Maldives|KTM Kathmandu|DAC Dhaka|KHI Karachi|LHE Lahore|ISB Islamabad|' +
     'BKK Bangkok|DMK Bangkok|HKT Phuket|CNX Chiang Mai|SIN Singapore|KUL Kuala Lumpur|CGK Jakarta|DPS Bali|MNL Manila|CEB Cebu|SGN Ho Chi Minh City|HAN Hanoi|DAD Da Nang|PNH Phnom Penh|REP Siem Reap|' +
     'HKG Hong Kong|MFM Macau|TPE Taipei|PEK Beijing|PKX Beijing|PVG Shanghai|SHA Shanghai|CAN Guangzhou|SZX Shenzhen|CTU Chengdu|ICN Seoul|GMP Seoul|NRT Tokyo|HND Tokyo|KIX Osaka|ITM Osaka|NGO Nagoya|FUK Fukuoka|CTS Sapporo|OKA Okinawa|' +
     'SYD Sydney|MEL Melbourne|BNE Brisbane|PER Perth|ADL Adelaide|OOL Gold Coast|CNS Cairns|AKL Auckland|CHC Christchurch|ZQN Queenstown|WLG Wellington|NAN Fiji|PPT Tahiti|' +
     'GRU Sao Paulo|GIG Rio de Janeiro|EZE Buenos Aires|SCL Santiago|LIM Lima|CUZ Cusco|BOG Bogota|MDE Medellin|CTG Cartagena|UIO Quito|GYE Guayaquil|PTY Panama City|SJO San Jose|LIR Liberia|' +
     'MBJ Montego Bay|KIN Kingston|NAS Nassau|PUJ Punta Cana|SDQ Santo Domingo|AUA Aruba|CUR Curacao|SXM St. Maarten|BGI Barbados|UVF St. Lucia|POS Port of Spain|HAV Havana|GCM Grand Cayman|BDA Bermuda|' +
     'NYC New York|LON London|PAR Paris|ROM Rome|MIL Milan|TYO Tokyo|OSA Osaka|SEL Seoul|WAS Washington|CHI Chicago|BJS Beijing|STO Stockholm|BUE Buenos Aires|SAO Sao Paulo|RIO Rio de Janeiro|YTO Toronto|YMQ Montreal|MOW Moscow|SVO Moscow')
      .split('|').forEach((p) => { const i = p.indexOf(' '); m[p.slice(0, i)] = p.slice(i + 1); });
    return m;
  })();

  function smsTemplates() {
    let t = null;
    try { t = JSON.parse(GM_getValue(SMS_TPL_KEY, 'null')); } catch (e) { t = null; }
    if (!Array.isArray(t) || t.length !== SMS_DEFAULT_TPL.length) t = SMS_DEFAULT_TPL.map((x, i) => (t && t[i] && typeof t[i].text === 'string') ? { name: String(t[i].name || x.name), text: t[i].text } : Object.assign({}, x));
    return t;
  }
  function saveSmsTemplates(t) { try { GM_setValue(SMS_TPL_KEY, JSON.stringify(t)); } catch (e) { /* best-effort */ } }

  function smsAgentName() {
    const el = document.querySelector('.customer-bar-agent-name');
    const n = el && el.textContent.trim();
    if (n) return n;
    const lbl = Array.from(document.querySelectorAll('div.font-medium')).find((d) => /#\d+\s*$/.test(d.textContent) && d.children.length === 0);
    return lbl ? lbl.textContent.replace(/#\d+\s*$/, '').trim() : '';
  }

  function smsLeadDestCode(leadId) {
    const tag = Array.from(document.querySelectorAll('span')).find((sp) => sp.textContent.trim() === '#' + leadId);
    let root = tag;
    for (let i = 0; i < 12 && root; i++) {
      root = root.parentElement;
      if (root && root.querySelectorAll('.text-base.leading-6.font-semibold').length >= 2) break;
    }
    const codes = root ? Array.from(root.querySelectorAll('.text-base.leading-6.font-semibold')).map((e) => e.textContent.trim()).filter((c) => /^[A-Z]{3}$/.test(c)) : [];
    return codes.length >= 2 ? codes[1] : (codes[0] || '');
  }
  function smsDestination(leadId) {
    const code = smsLeadDestCode(leadId);
    return SMS_CITY[code] || code;
  }

  // The client's name on the lead (click-to-copy name), else from the chat.
  function smsClientName(chat) {
    const cp = Array.from(document.querySelectorAll('span')).find((sp) => sp.classList.contains('cursor-[copy]') && /^[\p{L}][\p{L} .'-]*$/u.test(sp.textContent.trim()));
    if (cp) return cp.textContent.trim();
    const a = chat.querySelector('.chat__message--not-me:not(.chat__message--system):not(.ia-sms-msg) .chat__message__author');
    if (a) return a.textContent.replace(/\+[\d*]+/, '').trim();
    const d = chat.querySelector('.chat__system-message__description');
    const m = d && d.textContent.match(/\(([^)]+)\)/);
    return m ? m[1].trim() : '';
  }
  function smsMaskedNumber(chat) {
    const el = chat.querySelector('.chat__message__author, .chat__system-message__description');
    const m = el && el.textContent.match(/\+[\d*]{6,}/);
    if (m) return m[0];
    const cell = smsPhoneCell();
    return cell ? cell.textContent.trim() : '';
  }

  function smsFill(text, leadId, chat) {
    const client = smsClientName(chat).split(/\s+/)[0] || '';
    return text
      .replace(/\{agent\}/gi, smsAgentName())
      .replace(/\{destination\}/gi, smsDestination(leadId) || 'your destination')
      .replace(/\{client\}/gi, client || 'there')
      .replace(/[ \t]{2,}/g, ' ');
  }

  // The lead's phone number on the page. Any country, any format
  // ("+1302****569", "+52 55 3233 7745", "(302) 312-4569"...). Masked until
  // clicked once. The click-to-reveal element in the customer bar is
  // preferred; anything clickable that looks like a phone number is next.
  const SMS_PHONE_LIKE = /^\+?[\d*][\d*\s().-]{5,}[\d*]$/;
  function smsPhoneText(el) { return (el.textContent || '').replace(/ /g, ' ').trim(); }
  function smsLooksPhone(t) { return SMS_PHONE_LIKE.test(t) && t.replace(/[^\d*]/g, '').length >= 7 && t.replace(/[^\d*]/g, '').length <= 16; }
  function smsIsRevealed(t) { return smsLooksPhone(t) && t.indexOf('*') < 0; }
  function smsPhoneCell() {
    const all = Array.from(document.querySelectorAll('.cursor-pointer')).filter((el) => el.children.length === 0 && smsLooksPhone(smsPhoneText(el)) && !el.closest('.chat, .ia-sms, .ia-widget, table'));
    return all.find((el) => el.classList.contains('truncate') && el.classList.contains('ml-2'))
      || all.find((el) => el.classList.contains('truncate'))
      || all[0] || null;
  }
  function smsNormalizeNumber(t) {
    const d = String(t || '').replace(/\D/g, '');
    if (!d) return null;
    if (/^\s*\+/.test(t)) return '+' + d;
    if (d.length === 10) return '+1' + d; // US/Canada written without +1
    if (d.length === 11 && d.charAt(0) === '1') return '+' + d;
    return '+' + d;
  }
  const smsNumbers = new Map(); // leadId -> full number (this page session only)
  async function smsRevealNumber(leadId) {
    if (smsNumbers.has(leadId)) return smsNumbers.get(leadId);
    let t = null;
    for (let attempt = 0; attempt < 2 && !t; attempt++) {
      const cell = smsPhoneCell();
      if (!cell) {
        const tel = document.querySelector('a[href^="tel:"]');
        if (tel) t = decodeURIComponent(tel.getAttribute('href').slice(4));
        break;
      }
      const now = smsPhoneText(cell);
      if (smsIsRevealed(now)) { t = now; break; }
      cell.click();
      const end = Date.now() + 6000;
      while (Date.now() < end) {
        await new Promise((r) => setTimeout(r, 150));
        const c2 = smsPhoneCell();
        const v = c2 ? smsPhoneText(c2) : '';
        if (smsIsRevealed(v)) { t = v; break; }
      }
    }
    const num = smsNormalizeNumber(t);
    if (!num) return null;
    smsNumbers.set(leadId, num);
    return num;
  }

  // --- Bridge to the RingCentral panel (PART 8 answers inside it) ------
  let smsReqSeq = 0;
  const smsPending = new Map();
  function smsRc(op, args, timeoutMs) {
    return new Promise((resolve) => {
      const frame = document.getElementById('rc-widget-adapter-frame');
      if (!frame || !frame.contentWindow) { resolve({ ok: false, error: 'loading' }); return; }
      const id = 'sms' + (++smsReqSeq) + '-' + Date.now();
      const timer = setTimeout(() => { smsPending.delete(id); resolve({ ok: false, error: 'loading' }); }, timeoutMs || 15000);
      smsPending.set(id, (res) => { clearTimeout(timer); resolve(res); });
      try { frame.contentWindow.postMessage(Object.assign({ __jsSms: 1, id, op }, args || {}), SMS_RC_ORIGIN); } catch (e) { clearTimeout(timer); smsPending.delete(id); resolve({ ok: false, error: 'loading' }); }
    });
  }
  pageWin.addEventListener('message', (e) => {
    if (e.origin !== SMS_RC_ORIGIN) return;
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.__jsSmsRes && smsPending.has(d.id)) { const cb = smsPending.get(d.id); smsPending.delete(d.id); cb(d); return; }
    if (d.type === 'rc-login-status-notify') { smsStatus = null; smsRefreshAll(true); return; }
    if (d.type === 'rc-message-updated-notify' || d.type === 'rc-inbound-message-notify') smsRefreshAll(false);
  });
  function smsRcCommand(msg) {
    const frame = document.getElementById('rc-widget-adapter-frame');
    if (frame && frame.contentWindow) frame.contentWindow.postMessage(msg, SMS_RC_ORIGIN);
  }
  // Opens this number's conversation in the RingCentral panel (leaving any
  // other screen first, so the conversation shown is always a fresh one).
  async function smsRcOpen(num, text) {
    smsRcCommand({ type: 'rc-adapter-navigate-to', path: '/messages' });
    await new Promise((r) => setTimeout(r, 350));
    await smsRc('mark', {}, 4000);
    const m = { type: 'rc-adapter-new-sms', phoneNumber: num, conversation: true };
    if (text) m.text = text;
    smsRcCommand(m);
  }
  // Reads the conversation. Re-opens it only when it isn't already the one
  // on the RingCentral screen, and never while you're using the floating
  // panel yourself (unless asked to, e.g. when the RC tab is opened).
  async function smsRcRead(num, mayOpen) {
    const r = await smsRc('read', { phone: num }, 8000);
    if (r.ok && r.data && r.data.match) return r;
    const panelOpen = document.documentElement.getAttribute('data-ia-rc') === 'open';
    if (!mayOpen && panelOpen) return r.ok ? { ok: true, data: { list: null } } : r;
    if (!r.ok && r.error !== 'nopanel') return r;
    await smsRcOpen(num);
    return smsRc('read', { phone: num, fresh: true }, 30000);
  }

  // RingCentral status: { signedIn } (read from the panel itself)
  let smsStatus = null;
  let smsStatusAt = 0;
  async function smsGetStatus(force) {
    if (!force && smsStatus && smsStatus.signedIn && Date.now() - smsStatusAt < 60 * 1000) return smsStatus;
    const r = await smsRc('status', {}, 3000);
    if (r.ok) { smsStatus = r.data; smsStatusAt = Date.now(); return smsStatus; }
    return { signedIn: false, loading: true };
  }

  // --- Rendering -------------------------------------------------------
  function smsEsc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function smsNorm(s) { return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase(); }
  function smsTime(iso) { const d = new Date(iso); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function smsDay(iso) { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function smsInitials(name) { const p = String(name || '').trim().split(/\s+/).filter(Boolean); return ((p[0] || '?')[0] + (p[1] ? p[1][0] : '')).toUpperCase(); }

  // Messages the BO already shows (so RingCentral's copy isn't doubled).
  function smsBoCounts(chat) {
    const counts = new Map();
    chat.querySelectorAll('.chat__message:not(.chat__message--system):not(.ia-sms-msg)').forEach((m) => {
      const part = m.querySelector('.chat__message__part');
      if (!part) return;
      const k = (m.classList.contains('chat__message--my-side') ? 'O|' : 'I|') + smsNorm(part.textContent);
      counts.set(k, (counts.get(k) || 0) + 1);
    });
    return counts;
  }

  // RingCentral texts the BO hasn't shown yet, oldest first. Only ones
  // newer than the last text both sides agree on, so nothing lands out of
  // order under the BO's history.
  function smsUnsynced(chat, list) {
    const counts = smsBoCounts(chat);
    const sorted = list.slice().sort((a, b) => new Date(a.time) - new Date(b.time));
    let lastMatched = -1;
    const flags = sorted.map((m, i) => {
      const k = (m.dir === 'Outbound' ? 'O|' : 'I|') + smsNorm(m.text);
      const c = counts.get(k) || 0;
      if (c > 0) { counts.set(k, c - 1); lastMatched = i; return true; }
      return false;
    });
    return sorted.filter((m, i) => !flags[i] && i > lastMatched);
  }

  function smsScopeAttr(chat, sel) {
    const el = chat.querySelector(sel);
    if (!el) return '';
    return Array.from(el.attributes).filter((a) => /^data-v-/.test(a.name)).map((a) => a.name + '=""').join(' ');
  }

  function smsBubble(m, ctx) {
    const mine = m.dir === 'Outbound';
    const state = m.state === 'sending' ? ' <span class="ia-sms-state">Sending…</span>'
      : m.state === 'failed' ? ' <span class="ia-sms-state ia-sms-state--err" title="' + smsEsc(m.error || '') + '">Not sent — click to retry</span>'
      : (m.status === 'SendingFailed' || m.status === 'DeliveryFailed') ? ' <span class="ia-sms-state ia-sms-state--err">Failed</span>' : '';
    const author = mine ? smsEsc(ctx.agent) : smsEsc((ctx.client ? ctx.client + ' ' : '') + ctx.masked);
    const avatar = mine ? '' : '<div class="rounded-full flex items-center justify-center font-bold chat__message__avatar" style="background: rgb(243, 156, 18); color: rgb(255, 255, 255); width: 24px; height: 24px;">' + smsEsc(smsInitials(ctx.client)) + '</div>';
    return '<div class="chat__message ' + (mine ? 'chat__message--my-side' : 'chat__message--not-me') + ' chat__message--last-in-group ia-sms-msg' + (m.state ? ' ia-sms-msg--' + m.state : '') + '" data-ia-local="' + smsEsc(m.localId || '') + '">'
      + '<div class="chat__message__body"><div class="chat__message__author">' + author + '<span class="ia-sms-tag">RC</span></div>'
      + '<div class="chat__message__text"><span class="chat__message__part">' + smsEsc(m.text) + '</span><span class="chat__message__time"> ' + smsTime(m.time) + state + ' </span></div></div>'
      + avatar + '</div>';
  }

  const smsLocal = new Map(); // leadId -> messages typed here that RC hasn't listed yet

  // Which history the RC tab shows: 'rc' = your full RingCentral chat
  // (default), 'bo' = the BO's own history (calls, summaries) plus any
  // RingCentral texts the BO hasn't synced yet. Remembered.
  const SMS_VIEW_KEY = 'js-sms-view';
  function smsView() { try { return GM_getValue(SMS_VIEW_KEY, 'rc') === 'bo' ? 'bo' : 'rc'; } catch (e) { return 'rc'; } }

  // Where texts go: the BO's message list, or, on a lead the BO has no
  // history for ("No messages"), a list of our own in the chat area.
  function smsMessageBox(chat) {
    const own = chat.querySelector('.chat__messages');
    if (own) { const extra = chat.querySelector(':scope .ia-sms-ownbox'); if (extra && extra !== own) extra.remove(); return own; }
    let box = chat.querySelector('.ia-sms-ownbox');
    if (box && box.isConnected) return box;
    const host = chat.querySelector('.chat__body') || chat.querySelector('.chat__body-wrapper') || chat.querySelector('.chat__screen');
    if (!host) return null;
    box = document.createElement('div');
    box.className = 'ia-sms-ownbox';
    const bar = host.classList.contains('chat__screen') ? host.querySelector(':scope > .chat__input') : null;
    if (bar) host.insertBefore(box, bar); else host.appendChild(box);
    return box;
  }
  // The BO's own "No messages" placeholder is hidden while texts show.
  function smsToggleEmpty(chat, hasTexts) {
    chat.querySelectorAll('.chat__screen *').forEach((el) => {
      if (el.children.length || el.closest('.ia-sms, .ia-sms-live, .ia-sms-ownbox')) return;
      if (/^no messages\.?$/i.test(el.textContent.trim())) el.classList.toggle('ia-sms-hidden', hasTexts);
    });
  }

  function smsRenderLive(chat, leadId, list) {
    const box = smsMessageBox(chat);
    if (!box) return;
    const rcView = smsView() === 'rc';
    chat.classList.toggle('ia-sms-rcview', rcView);
    const tg = chat.querySelector('.js-sms-view');
    if (tg) tg.textContent = rcView ? 'Show BO history' : 'Show RingCentral chat';
    let live = box.querySelector(':scope > .ia-sms-live');
    const shown = rcView ? (list || []) : smsUnsynced(chat, list || []);
    // A text sent from here stays as its own bubble until RingCentral lists it.
    const outs = (list || []).filter((x) => x.dir === 'Outbound');
    const lastOut = outs[outs.length - 1];
    const listedByRc = (m) => (lastOut && smsNorm(lastOut.text) === smsNorm(m.text)) || outs.some((x) => smsNorm(x.text) === smsNorm(m.text) && new Date(x.time) >= new Date(m.time) - 600000);
    const locals = (smsLocal.get(leadId) || []).filter((m) => m.state !== 'sent' || !listedByRc(m));
    smsLocal.set(leadId, locals);
    const all = shown.concat(locals).sort((a, b) => new Date(a.time) - new Date(b.time));
    const ctx = { agent: smsAgentName(), client: smsClientName(chat), masked: smsMaskedNumber(chat) };
    const dayAttr = smsScopeAttr(chat, '.chat__day');
    const innerAttr = smsScopeAttr(chat, '.chat__day__inner');
    const days = Array.from(chat.querySelectorAll('.chat__day__inner:not(.ia-sms-day)'));
    let lastDay = rcView ? '' : (days.length ? days[days.length - 1].textContent.trim() : '');
    let html = '';
    all.forEach((m) => {
      const d = smsDay(m.time);
      if (d !== lastDay) { html += '<div ' + dayAttr + ' class="chat__day"><div ' + innerAttr + ' class="chat__day__inner ia-sms-day">' + d + '</div></div>'; lastDay = d; }
      html += smsBubble(m, ctx);
    });
    if (rcView) {
      const note = chat.__jsSmsNote || (list == null ? 'Loading your RingCentral chat\u2026' : (!html ? 'No texts with this number in RingCentral yet' : ''));
      if (note && !(list && list.length) && !all.length) html = '<div class="ia-sms-note">' + smsEsc(note) + '</div>';
    }
    smsUpdateChips(chat, leadId);
    smsToggleEmpty(chat, !!html);
    if (!html) { if (live) live.remove(); return; }
    if (!live) {
      live = document.createElement('div');
      live.className = 'ia-sms-live';
      live.addEventListener('click', (e) => {
        const b = e.target.closest('.ia-sms-msg--failed');
        if (!b) return;
        const lid = b.getAttribute('data-ia-local');
        const m = (smsLocal.get(leadId) || []).find((x) => x.localId === lid);
        if (m) smsSend(chat, leadId, m.text, m);
      });
    }
    const summary = Array.from(box.children).find((c) => c !== live && c.classList.contains('mt-5') && c.querySelector('button'));
    if (summary) { if (live.nextSibling !== summary || live.parentNode !== box) box.insertBefore(live, summary); }
    else if (live.parentNode !== box || box.lastElementChild !== live) box.appendChild(live);
    if (live.getAttribute('data-ia-html') !== String(html.length) + '|' + html.slice(-80)) {
      live.innerHTML = html;
      live.setAttribute('data-ia-html', String(html.length) + '|' + html.slice(-80));
      const scroller = chat.querySelector('.chat__body');
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    }
  }

  // --- Composer --------------------------------------------------------
  function smsComposerHtml() {
    const t = smsTemplates();
    return '<div class="ia-sms-chips">' + t.map((x, i) => '<span class="ia-sms-chip" data-i="' + i + '" title="' + smsEsc(x.text) + '"><span class="ia-sms-chip__tick" hidden>\u2713</span><span class="ia-sms-chip__name">' + smsEsc(x.name) + '</span><span class="ia-sms-chip__edit" title="Edit template">✎</span></span>').join('') + '</div>'
      + '<div class="ia-sms-editor" hidden><input class="ia-sms-ed-name" maxlength="24"><textarea class="ia-sms-ed-text" rows="3"></textarea>'
      + '<div class="ia-sms-ed-row"><span class="ia-sms-hint">{agent} · {destination} · {client}</span><button type="button" class="ia-sms-btn ia-sms-ed-reset">Reset</button><button type="button" class="ia-sms-btn ia-sms-ed-cancel">Cancel</button><button type="button" class="ia-sms-btn ia-sms-btn--go ia-sms-ed-save">Save</button></div></div>'
      + '<div class="ia-sms-row"><textarea class="ia-sms-text" rows="2" placeholder="Type a message…"></textarea><button type="button" class="ia-sms-btn ia-sms-btn--go ia-sms-send">Send</button></div>'
      + '<div class="ia-sms-foot"><span class="ia-sms-status"></span><span class="ia-sms-via">via RingCentral \u00B7 Ctrl+Enter to send</span><button type="button" class="js-sms-view"></button></div>';
  }

  function smsSetStatusLine(comp, text, err) {
    const s = comp.querySelector('.ia-sms-status');
    s.textContent = text || '';
    s.classList.toggle('ia-sms-status--err', !!err);
  }

  async function smsApplyStatus(comp, force) {
    const st = await smsGetStatus(force);
    const btn = comp.querySelector('.ia-sms-send');
    comp.dataset.signed = st.signedIn ? '1' : '';
    if (!st.signedIn) {
      btn.textContent = st.loading ? 'RingCentral loading\u2026' : 'Sign in to RingCentral';
      btn.classList.add('ia-sms-btn--signin');
      smsSetStatusLine(comp, st.loading ? '' : 'RingCentral is signed out', !st.loading);
      return st;
    }
    btn.textContent = 'Send';
    btn.classList.remove('ia-sms-btn--signin');
    if (comp.querySelector('.ia-sms-status').textContent === 'RingCentral is signed out') smsSetStatusLine(comp, '');
    return st;
  }

  async function smsLoad(chat, leadId, quiet, mayOpen) {
    const comp = chat.querySelector('.ia-sms');
    if (!comp || comp.dataset.busy) return;
    const st = await smsApplyStatus(comp, false);
    chat.__jsSmsNote = st.signedIn || st.loading ? '' : 'Sign in to RingCentral to see the chat';
    if (!st.signedIn) {
      smsRenderLive(chat, leadId, chat.__jsSmsList);
      // RingCentral still starting up: try again shortly.
      if (st.loading && (chat.__jsSmsRetry = (chat.__jsSmsRetry || 0) + 1) < 60) setTimeout(() => smsLoad(chat, leadId, quiet, mayOpen), 2000);
      return;
    }
    chat.__jsSmsRetry = 0;
    const num = await smsRevealNumber(leadId);
    if (!num) {
      if (!quiet) smsSetStatusLine(comp, 'Couldn\u2019t read the lead\u2019s phone number', true);
      chat.__jsSmsNote = 'Couldn\u2019t read the lead\u2019s phone number';
      smsRenderLive(chat, leadId, chat.__jsSmsList);
      return;
    }
    const r = await smsRcRead(num, mayOpen);
    if (!r.ok) {
      if (r.error === 'signedout') { smsStatus = null; smsApplyStatus(comp, true); return; }
      if (!quiet) smsSetStatusLine(comp, 'Couldn\u2019t load the RingCentral conversation', true);
      if (!chat.__jsSmsList) { chat.__jsSmsNote = 'Couldn\u2019t load the RingCentral conversation \u2014 it will retry'; smsRenderLive(chat, leadId, chat.__jsSmsList); }
      return;
    }
    if (!r.data || !r.data.list) return; // you're using the RC panel: keep what's shown
    if (comp.querySelector('.ia-sms-status--err')) smsSetStatusLine(comp, '');
    chat.__jsSmsList = r.data.list;
    chat.__jsSmsNote = '';
    smsRenderLive(chat, leadId, r.data.list);
  }

  async function smsSend(chat, leadId, text, retryOf) {
    const comp = chat.querySelector('.ia-sms');
    if (!comp || comp.dataset.busy) return;
    text = String(text || '').trim();
    if (!text) return;
    comp.dataset.busy = '1';
    const btn = comp.querySelector('.ia-sms-send');
    btn.disabled = true;
    try {
      const st = await smsApplyStatus(comp, true);
      if (!st.signedIn) return;
      const num = await smsRevealNumber(leadId);
      if (!num) { smsSetStatusLine(comp, 'Couldn\u2019t read the lead\u2019s phone number', true); return; }
      const locals = smsLocal.get(leadId) || [];
      const msg = retryOf || { localId: 'l' + Date.now(), dir: 'Outbound', text, time: new Date().toISOString() };
      msg.state = 'sending';
      msg.time = new Date().toISOString();
      if (!retryOf) { locals.push(msg); smsLocal.set(leadId, locals); comp.querySelector('.ia-sms-text').value = ''; smsGrow(comp.querySelector('.ia-sms-text')); }
      smsRenderLive(chat, leadId, chat.__jsSmsList);
      await smsRcOpen(num, text);
      const r = await smsRc('send', { phone: num, text }, 45000);
      if (r.ok) {
        msg.state = 'sent';
        smsSetStatusLine(comp, 'Sent via RingCentral \u2713');
        if (comp.dataset.tpl && smsKey(text).indexOf(comp.dataset.tplKey) === 0) smsRememberSent(leadId, +comp.dataset.tpl);
        setTimeout(() => { if (comp.querySelector('.ia-sms-status').textContent.indexOf('Sent') === 0) smsSetStatusLine(comp, ''); }, 4000);
        if (r.data && r.data.list) chat.__jsSmsList = r.data.list;
      } else if (r.error === 'unconfirmed' || r.error === 'loading') {
        // Might have gone out: never offer a one-click resend for this one.
        msg.state = 'sent';
        smsSetStatusLine(comp, r.message || 'RingCentral didn\u2019t confirm \u2014 check the RC panel before resending', true);
      } else {
        msg.state = 'failed';
        msg.error = r.message || '';
        smsSetStatusLine(comp, r.message || 'Not sent', true);
        if (r.error === 'signedout') { smsStatus = null; smsApplyStatus(comp, true); }
      }
      smsRenderLive(chat, leadId, chat.__jsSmsList);
    } finally {
      delete comp.dataset.busy;
      btn.disabled = false;
    }
  }

  function smsOpenEditor(comp, i) {
    const t = smsTemplates();
    const ed = comp.querySelector('.ia-sms-editor');
    ed.hidden = false;
    ed.dataset.i = String(i);
    ed.querySelector('.ia-sms-ed-name').value = t[i].name;
    ed.querySelector('.ia-sms-ed-text').value = t[i].text;
    smsGrow(ed.querySelector('.ia-sms-ed-text'));
    ed.querySelector('.ia-sms-ed-text').focus();
  }
  // Follow-ups already sent to this lead are greyed out (with a tick), and
  // the next one to send is highlighted. "Sent" = remembered from sending
  // it here, or found among your texts in the chat (RingCentral or BO).
  const SMS_SENT_KEY = 'js-sms-sent';
  const smsKey = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  function smsSentMemory() { try { const o = JSON.parse(GM_getValue(SMS_SENT_KEY, '{}')); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } }
  function smsRememberSent(leadId, i) {
    const o = smsSentMemory();
    const list = Array.isArray(o[leadId]) ? o[leadId] : [];
    if (!list.includes(i)) list.push(i);
    delete o[leadId];
    o[leadId] = list;
    const keys = Object.keys(o);
    keys.slice(0, Math.max(0, keys.length - 1500)).forEach((k) => delete o[k]);
    try { GM_setValue(SMS_SENT_KEY, JSON.stringify(o)); } catch (e) { /* best-effort */ }
  }
  function smsSentSet(chat, leadId) {
    const sent = new Set((smsSentMemory()[leadId] || []).map(Number));
    const outs = [];
    (chat.__jsSmsList || []).forEach((m) => { if (m.dir === 'Outbound') outs.push(smsKey(m.text)); });
    (smsLocal.get(leadId) || []).forEach((m) => { if (m.state === 'sent') outs.push(smsKey(m.text)); });
    chat.querySelectorAll('.chat__message--my-side:not(.ia-sms-msg) .chat__message__part').forEach((p) => outs.push(smsKey(p.textContent)));
    smsTemplates().forEach((t, i) => {
      const k = smsKey(smsFill(t.text, leadId, chat)).slice(0, 60);
      if (k.length >= 20 && outs.some((o) => o.indexOf(k) === 0)) sent.add(i);
    });
    return sent;
  }
  function smsUpdateChips(chat, leadId) {
    const comp = chat.querySelector('.ia-sms');
    if (!comp) return;
    const sent = smsSentSet(chat, leadId);
    const chips = Array.from(comp.querySelectorAll('.ia-sms-chip'));
    const next = chips.find((c) => !sent.has(+c.dataset.i));
    chips.forEach((c) => {
      const isSent = sent.has(+c.dataset.i);
      c.classList.toggle('ia-sms-chip--sent', isSent);
      c.classList.toggle('ia-sms-chip--next', c === next);
      const tick = c.querySelector('.ia-sms-chip__tick');
      if (tick) tick.hidden = !isSent;
    });
  }
  function smsRefreshChips() {
    document.querySelectorAll('.ia-sms').forEach((comp) => {
      const t = smsTemplates();
      comp.querySelectorAll('.ia-sms-chip').forEach((c) => {
        const x = t[+c.dataset.i];
        if (!x) return;
        c.querySelector('.ia-sms-chip__name').textContent = x.name;
        c.title = x.text;
      });
      const chat = comp.closest('.chat[id^="sms-chat-"]');
      if (chat) smsUpdateChips(chat, chat.id.replace('sms-chat-', ''));
    });
  }
  try { GM_addValueChangeListener(SMS_TPL_KEY, () => smsRefreshChips()); } catch (e) { /* other tabs refresh on reload */ }

  // Message boxes grow with the text instead of scrolling inside.
  function smsGrow(ta) {
    ta.style.height = 'auto';
    ta.style.height = (ta.scrollHeight + 2) + 'px';
  }

  function smsWire(comp, chat, leadId) {
    comp.addEventListener('click', (e) => {
      const ed = comp.querySelector('.ia-sms-editor');
      const edit = e.target.closest('.ia-sms-chip__edit');
      if (edit) { smsOpenEditor(comp, +edit.closest('.ia-sms-chip').dataset.i); return; }
      const chip = e.target.closest('.ia-sms-chip');
      if (chip) {
        const ta = comp.querySelector('.ia-sms-text');
        ta.value = smsFill(smsTemplates()[+chip.dataset.i].text, leadId, chat);
        smsGrow(ta);
        comp.dataset.tpl = chip.dataset.i;
        comp.dataset.tplKey = smsKey(ta.value).slice(0, 40);
        ta.focus();
        ta.setSelectionRange(ta.value.length, ta.value.length);
        return;
      }
      if (e.target.closest('.js-sms-view')) {
        try { GM_setValue(SMS_VIEW_KEY, smsView() === 'rc' ? 'bo' : 'rc'); } catch (er) { /* ignore */ }
        smsRenderLive(chat, leadId, chat.__jsSmsList);
        return;
      }
      if (e.target.closest('.ia-sms-ed-cancel')) { ed.hidden = true; return; }
      if (e.target.closest('.ia-sms-ed-reset')) {
        const d = SMS_DEFAULT_TPL[+ed.dataset.i];
        ed.querySelector('.ia-sms-ed-name').value = d.name;
        ed.querySelector('.ia-sms-ed-text').value = d.text;
        return;
      }
      if (e.target.closest('.ia-sms-ed-save')) {
        const t = smsTemplates();
        const i = +ed.dataset.i;
        t[i] = { name: ed.querySelector('.ia-sms-ed-name').value.trim() || SMS_DEFAULT_TPL[i].name, text: ed.querySelector('.ia-sms-ed-text').value };
        saveSmsTemplates(t);
        ed.hidden = true;
        smsRefreshChips();
        return;
      }
      if (e.target.closest('.ia-sms-send')) {
        if (!comp.dataset.signed) {
          if (typeof setRcPanelOpen === 'function') setRcPanelOpen(true);
          smsStatus = null;
          setTimeout(() => smsLoad(chat, leadId, false, true), 1500);
          return;
        }
        smsSend(chat, leadId, comp.querySelector('.ia-sms-text').value);
      }
    });
    comp.querySelectorAll('textarea').forEach((t) => t.addEventListener('input', () => smsGrow(t)));
    comp.querySelector('.ia-sms-text').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); comp.querySelector('.ia-sms-send').click(); }
    });
  }

  function smsChats() {
    return Array.from(document.querySelectorAll('.chat[id^="sms-chat-"]')).filter((c) => c.getClientRects().length);
  }

  function smsScan() {
    document.querySelectorAll('.chat[id^="sms-chat-"]').forEach((chat) => {
      const leadId = chat.id.replace('sms-chat-', '');
      if (!/^\d+$/.test(leadId)) return;
      const bar = Array.from(chat.querySelectorAll('.chat__input')).find((b) => !b.classList.contains('ia-sms') && /only view this chat/i.test(b.textContent));
      let comp = chat.querySelector('.ia-sms');
      if (bar) {
        bar.classList.add('ia-sms-hidden');
        if (!comp || comp.previousElementSibling !== bar) {
          if (comp) comp.remove();
          comp = document.createElement('div');
          comp.className = 'ia-sms';
          comp.innerHTML = smsComposerHtml();
          bar.insertAdjacentElement('afterend', comp);
          smsWire(comp, chat, leadId);
          chat.__jsSmsLoadedAt = 0;
          smsRenderLive(chat, leadId, chat.__jsSmsList);
        }
      }
      if (!comp) return;
      if (!chat.querySelector('.ia-sms-live') && (smsView() === 'rc' || (chat.__jsSmsList && smsUnsynced(chat, chat.__jsSmsList).length))) smsRenderLive(chat, leadId, chat.__jsSmsList);
      if (chat.getClientRects().length && !chat.__jsSmsLoadedAt) { chat.__jsSmsLoadedAt = Date.now(); smsLoad(chat, leadId, false, true); }
    });
  }

  let smsRefreshTimer = null;
  function smsRefreshAll(statusToo) {
    if (smsRefreshTimer) clearTimeout(smsRefreshTimer);
    smsRefreshTimer = setTimeout(() => {
      smsRefreshTimer = null;
      smsChats().forEach((chat) => {
        const comp = chat.querySelector('.ia-sms');
        if (!comp) return;
        if (statusToo) { smsStatus = null; smsApplyStatus(comp, true); }
        smsLoad(chat, chat.id.replace('sms-chat-', ''), true, false);
      });
    }, 600);
  }

  __jsRegisterScan(smsScan);
  // Live: refresh every 15s while the RC tab is on screen.
  setInterval(() => { if (!document.hidden && smsChats().some((c) => c.querySelector('.ia-sms'))) smsRefreshAll(false); }, 15000);

  GM_addStyle(`
    .chat__input.ia-sms-hidden, .chat__screen .ia-sms-hidden { display: none !important; }
    .ia-sms-rcview .chat__messages > :not(.ia-sms-live) { display: none !important; }
    .ia-sms-rcview .ia-sms-tag { display: none; }
    .ia-sms-note { padding: 24px 12px; text-align: center; opacity: .7; font-style: italic; }
    .js-sms-view { margin-left: 10px; padding: 1px 8px; border-radius: 4px; border: 1px solid rgba(127,127,127,.4); background: transparent; color: inherit; cursor: pointer; font-size: 11px; font-weight: 600; }
    .js-sms-view:hover { border-color: #3b82f6; color: #3b82f6; }
    .ia-sms { padding: 8px 12px 10px; border-top: 1px solid rgba(127,127,127,.25); font-size: 13px; }
    .ia-sms-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; }
    .ia-sms-chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 4px 5px 13px; border-radius: 999px;
      border: 1px solid rgba(148,163,184,.55); color: inherit; background: rgba(148,163,184,.12); cursor: pointer;
      font-weight: 600; font-size: 12.5px; line-height: 1; user-select: none; transition: background .15s, border-color .15s, opacity .15s; }
    .ia-sms-chip:hover { border-color: #3b82f6; background: rgba(59,130,246,.18); }
    .ia-sms-chip__edit { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 999px;
      font-weight: 400; font-size: 12px; opacity: .65; border-left: 0; }
    .ia-sms-chip__edit:hover { opacity: 1; background: rgba(255,255,255,.18); }
    .ia-sms-chip__tick { font-weight: 800; }
    .ia-sms-chip__tick[hidden] { display: none; }
    .ia-sms-chip--next { background: #5b5bd6; border-color: #5b5bd6; color: #fff; box-shadow: 0 1px 6px rgba(37,99,235,.45); }
    .ia-sms-chip--next:hover { background: #1d4ed8; border-color: #1d4ed8; }
    .ia-sms-chip--sent { opacity: .42; background: transparent; border-style: dashed; }
    .ia-sms-chip--sent:hover { opacity: .8; }
    .ia-sms-chip--sent .ia-sms-chip__tick { color: #22c55e; }
    .ia-sms-row { display: flex; gap: 8px; align-items: flex-end; }
    .ia-sms textarea { flex: 1; width: 100%; resize: none; overflow: hidden; box-sizing: border-box; min-height: 38px; padding: 6px 8px; border-radius: 6px;
      border: 1px solid rgba(127,127,127,.4); background: transparent; color: inherit; font: inherit; line-height: 1.35; }
    .ia-sms textarea:focus { outline: none; border-color: #3b82f6; }
    .ia-sms-btn { padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(127,127,127,.4); background: transparent; color: inherit; cursor: pointer; font-weight: 600; font-size: 12px; white-space: nowrap; }
    .ia-sms-btn--go { background: #5b5bd6; border-color: #5b5bd6; color: #fff; }
    .ia-sms-btn--go:hover { background: #4b4bc4; }
    .ia-sms-btn--go:disabled { opacity: .55; cursor: default; }
    .ia-sms-btn--signin { background: #f97316; border-color: #f97316; }
    .ia-sms-btn--signin:hover { background: #ea580c; }
    .ia-sms-foot { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 4px; min-height: 16px; font-size: 11px; opacity: .85; }
    .ia-sms-status--err { color: #dc2626; }
    .ia-sms-via { margin-left: auto; opacity: .6; }
    .ia-sms-editor { margin-bottom: 8px; padding: 8px; border-radius: 6px; border: 1px dashed rgba(59,130,246,.5); display: flex; flex-direction: column; gap: 6px; }
    .ia-sms-editor[hidden] { display: none; }
    .ia-sms-ed-name { width: 160px; padding: 3px 6px; border-radius: 4px; border: 1px solid rgba(127,127,127,.4); background: transparent; color: inherit; font: inherit; font-weight: 600; }
    .ia-sms-ed-row { display: flex; gap: 6px; align-items: center; }
    .ia-sms-hint { margin-right: auto; font-size: 11px; opacity: .7; font-family: ui-monospace, monospace; }
    .ia-sms-tag { margin-left: 6px; padding: 0 4px; border-radius: 3px; font-size: 9px; font-weight: 700; letter-spacing: .03em; background: rgba(249,115,22,.15); color: #ea580c; vertical-align: middle; }
    .ia-sms-state { font-style: italic; opacity: .8; }
    .ia-sms-state--err { color: #dc2626; font-style: normal; font-weight: 600; }
    .ia-sms-msg--sending { opacity: .6; }
    .ia-sms-msg--failed { cursor: pointer; }
  `);

  function setPanelStatus(text) {
    const el = ensureBmo();
    const statusEl = el.querySelector('.ia-screen-info__status');
    if (!statusEl) return;
    statusEl.textContent = text || '';
    // Collapses to zero height when empty (the common case) instead of
    // reserving its line's worth of space regardless — extra headroom
    // for a long, 2-line name's route to stay visible underneath it.
    statusEl.style.display = text ? '' : 'none';
  }

  // The row currently on display in Pip's screen — the single source of
  // truth for who Call will actually dial. Call never recomputes "who's
  // next" independently of what's shown; it always acts on exactly this
  // reference, so there's no way for what's displayed and what gets dialed
  // to diverge.
  let currentPanelRow = null;
  // Whether that row has ACTUALLY been dialed yet, as opposed to just
  // being queued up. This is what the "Up next" vs "Currently calling"
  // label reflects — a lead shown before any tel: link has fired for them
  // is never labeled as being actively called, even momentarily.
  let currentRowDialed = false;

  function renderPanelForRow(row, dialed) {
    currentPanelRow = row;
    currentRowDialed = !!dialed;
    const el = ensureBmo();
    const face = el.querySelector('.ia-face');
    const info = el.querySelector('.ia-screen-info');
    if (!row) {
      face.style.display = '';
      info.style.display = 'none';
      return;
    }
    face.style.display = 'none';
    info.style.display = '';
    const leadInfo = getLeadInfo(row);
    el.querySelector('.ia-screen-info__label').textContent = dialed ? 'Currently calling' : 'Up next';
    const clientEl = el.querySelector('.ia-screen-info__client');
    clientEl.textContent = leadInfo.clientName || ('Lead ' + leadInfo.leadId);
    clientEl.href = leadInfo.href;
    el.querySelector('.ia-screen-info__route').textContent = [leadInfo.origin, leadInfo.dest].filter(Boolean).join(' \u2192 ');
    setPanelStatus('');
    updateProgress(row);
  }

  // "Lead 4 of 23" — position among this page's leads that have a timer
  // running (the ones the dialer works through); page shown after page 1.
  function updateProgress(row) {
    const out = iaWidget && iaWidget.querySelector('.ia-progress');
    if (!out) return;
    const rows = getLeadRows().filter((r) => hasTimerRunning(r));
    const idx = rows.indexOf(row);
    const pageInput = document.querySelector('.pagination-v2 input[type="number"]');
    const page = pageInput ? parseInt(pageInput.value, 10) : 1;
    out.textContent = idx >= 0 ? 'Lead ' + (idx + 1) + ' of ' + rows.length + (page > 1 ? ' \u00B7 p' + page : '') : '';
  }

  // --- Core call action ---------------------------------------------------
  // The one genuine user gesture Chrome requires per call. Everything
  // inside this handler — the reveal click, reading the number, building
  // and clicking the tel: link — runs from that same gesture, which is
  // what keeps the tel: launch inside Chrome's anti-flood window.
  //
  // Double dial is its own explicit button, not a pre-checked toggle —
  // Call always marks the lead called and advances normally; pressing
  // Double Dial afterward (a separate, equally genuine user gesture, so
  // it's just as valid for Chrome's anti-flood check) redials the number
  // that was JUST called, straight from memory, with no need to re-find
  // or re-reveal anything since it's already known.
  let lastCalledInfo = null; // { number, leadId, href, clientName, origin, dest }

  function updateDoubleDialButton() {
    const btn = iaWidget && iaWidget.querySelector('.ia-btn-doubledial');
    if (btn) btn.classList.toggle('ia-btn--disabled', !lastCalledInfo);
  }

  // Guards against a second Call press starting while the first is still
  // mid-flight (revealing, waiting, or in the post-dial pause) — without
  // this, two rapid presses could run two overlapping calls at once, each
  // reading/advancing shared state while the other is still using it.
  let callInFlight = false;

  async function handleCallClick(isAuto) {
    if (callInFlight) return;
    // Pressing Call yourself overrides any "you're on a call" pause.
    if (!isAuto) {
      for (const [k, c] of activeCalls) if (!c.mine) activeCalls.delete(k);
      pendingAutoNext = false;
    }
    clearAutoNext(); // pressing Call during the countdown dials right away
    startAutoRun();
    callInFlight = true;
    try {
      let row = currentPanelRow;
      if (row && !document.body.contains(row)) row = null; // stale reference (e.g. page navigated) -- treat as gone

      // Whoever's shown having ALREADY been dialed is what tells apart
      // "this is a fresh lead, dial it in place" from "this one's done,
      // advance to the next before dialing" — every press after the
      // first one for a given lead lands in the second case, since that
      // first press already flipped currentRowDialed to true.
      let info, number;
      // Loops only to step past leads with a blocked number (e.g.
      // +10000000000) — those are skipped automatically, never dialed.
      for (let guard = 0; guard < 50; guard++) {
        if (!row || currentRowDialed) {
          row = await getNextPendingRow();
          if (!row) { await onAllLeadsDone(); return; }
          // Shown immediately, labeled "Up next" — not "Currently
          // calling" — since nothing has actually been dialed for them
          // yet at this point.
          renderPanelForRow(row, false);
        }

        info = getLeadInfo(row);
        const phoneCell = findPhoneCell(row);
        if (!phoneCell) { setPanelStatus('Could not find phone cell for this lead'); return; }

        number = phoneCell.textContent.trim();
        if (!PHONE_REVEALED_RE.test(number)) {
          setPanelStatus('Revealing number\u2026');
          phoneCell.click();
          number = await waitForRevealedNumber(phoneCell, 2000);
          if (!number) { setPanelStatus('Number did not reveal in time \u2014 try again'); return; }
        }

        if (BLOCKED_NUMBERS.includes(String(number).replace(/\D/g, ''))) {
          markSkipped(info.leadId);
          currentRowDialed = true; // move past it on the next loop
          continue;
        }
        break;
      }

      leadRedialed = false;
      dialNumber(number, !isAuto);

      lastCalledInfo = Object.assign({ number }, info);
      updateDoubleDialButton();
      markCalled(info.leadId);
      markStartedToday();
      // NOW, and only now — after the tel: link has actually fired — does
      // the label flip to "Currently calling". Pip's screen then
      // deliberately keeps showing this same lead for however long the
      // real call actually takes, which the script has no way to
      // observe. It only moves on once Call is pressed again — the
      // explicit "I'm done with this one" signal — rather than on a
      // fixed timer that can't know whether the call was even answered,
      // let alone ended.
      //
      // No "Dialed +X" confirmation shown here on purpose now — that
      // used to sit on screen persistently (until the next action),
      // eating into the space the name and route need in the common,
      // successful case. The name/route already update to confirm which
      // lead this was for; the number itself was only ever a bonus, not
      // something this needs to keep displaying.
      renderPanelForRow(row, true);
      if (awaitingCallEnd) setPanelStatus('Dialing\u2026');
    } finally {
      callInFlight = false;
    }
  }

  // Every lead on every page is done for the current round.
  // Level-up only when EVERY lead on EVERY page is green/yellow:
  //  1st Call with nothing left → re-checks all pages from page 1.
  //  2nd Call, still nothing left → Super Pip + round 2 (marks go red).
  async function onAllLeadsDone() {
    stopAutoRun();
    if (pendingScanState === 'pageFail') {
      levelUpArmed = false;
      setPanelStatus('Next page didn\u2019t load \u2014 press Call again');
      return;
    }
    if (getRound() === 1) {
      if (!levelUpArmed) {
        setPanelStatus('Checking all pages\u2026');
        await goToFirstPage();
        const left = await getNextPendingRow();
        if (left) { renderPanelForRow(left, false); setPanelStatus('More leads left \u2014 press Call'); return; }
        if (pendingScanState === 'pageFail') { setPanelStatus('Next page didn\u2019t load \u2014 press Call again'); return; }
        levelUpArmed = true;
        renderPanelForRow(null, false);
        setPanelStatus('All leads called \u2713 Press Call to level up');
        return;
      }
      levelUpArmed = false;
      unlockSuper();
      setRound(2);
      await goToFirstPage();
      renderPanelForRow(await getNextPendingRow(), false);
      setPanelStatus('Round 1 complete \u2014 Round 2: press Call');
    } else {
      renderPanelForRow(null, false);
      setPanelStatus('Round 2 done \u2713');
    }
  }

  // --- Super Pip: rainbow body for finishing the day's follow-up -------
  function superUnlockedToday() {
    try { return !!GM_getValue(SUPER_STORAGE_PREFIX + todayKey(), false); } catch (e) { return false; }
  }
  function applySuperState() {
    // Earned today (first follow-up done) AND actively calling → rainbow.
    // Stopped → back to whatever color the user picked.
    const running = !!(iaWidget && iaWidget.classList.contains('ia-widget--running'));
    if (iaWidget) iaWidget.classList.toggle('ia-widget--super', (superUnlockedToday() && running) || rainbowTheme);
  }
  function unlockSuper() {
    const first = !superUnlockedToday();
    try { GM_setValue(SUPER_STORAGE_PREFIX + todayKey(), true); } catch (e) { /* best-effort */ }
    applySuperState();
    if (first) playLevelUp(true);
  }
  // Rainbow ends by itself when the follow-up day rolls over (2pm GMT).
  setInterval(applySuperState, 60 * 1000);

  // Takes over Pip's screen to unambiguously show who's actually being
  // redialed, then hands it back to whatever Call is next ready for once
  // done — rather than leaving whoever Call last advanced to on screen
  // while this rings a completely different, earlier lead underneath it.
  async function handleDoubleDialClick() {
    if (!lastCalledInfo || callInFlight) return;
    callInFlight = true;
    try {
      clearAutoNext();
      dialNumber(lastCalledInfo.number, true);

      const el = ensureBmo();
      el.querySelector('.ia-face').style.display = 'none';
      el.querySelector('.ia-screen-info').style.display = '';
      el.querySelector('.ia-screen-info__label').textContent = 'Redialing';
      const clientEl = el.querySelector('.ia-screen-info__client');
      clientEl.textContent = lastCalledInfo.clientName || ('Lead ' + lastCalledInfo.leadId);
      clientEl.href = lastCalledInfo.href;
      el.querySelector('.ia-screen-info__route').textContent = [lastCalledInfo.origin, lastCalledInfo.dest].filter(Boolean).join(' \u2192 ');

      await wait(1800);
      renderPanelForRow(currentPanelRow, currentRowDialed); // restores exactly whatever was shown before, label included
    } finally {
      callInFlight = false;
    }
  }

  async function handleSkipClick() {
    if (callInFlight) return;
    // Skipped leads are tracked separately from called ones (yellow vs
    // green row indicator). Only meaningful for a lead that hasn't
    // actually been dialed yet — skipping one already called would
    // contradictorily mark it both called AND skipped at once, so an
    // already-dialed row just gets moved past instead, unmarked.
    let row = currentPanelRow;
    if (row && !document.body.contains(row)) row = null;
    if (row && !currentRowDialed) markSkipped(getLeadId(row));
    renderPanelForRow(await getNextPendingRow(), false);
  }

  // --- Hourly "daily follow up" reminder, synced across tabs --------------
  // Anthropic's Tampermonkey research earlier in this project confirmed
  // GM_addValueChangeListener as a genuine, real API for this exact
  // cross-tab case — same script, same domain, multiple tabs — which is
  // what makes dismissing on one page reliably hide it on every other open
  // page too, rather than each tab running its own independent clock.
  const REMINDER_DISMISSED_KEY = 'bmo-reminder-dismissed-until';
  const STARTED_TODAY_PREFIX = 'bmo-started-';

  function markStartedToday() {
    try { GM_setValue(STARTED_TODAY_PREFIX + todayKey(), true); } catch (e) { /* best-effort */ }
  }

  function startedToday() {
    try { return !!GM_getValue(STARTED_TODAY_PREFIX + todayKey(), false); } catch (e) { return false; }
  }

  function reminderDismissedUntil() {
    try { return Number(GM_getValue(REMINDER_DISMISSED_KEY, 0)) || 0; } catch (e) { return 0; }
  }

  function showReminder() {
    const el = ensureBmo();
    const bubble = el.querySelector('.ia-reminder');
    const wasAlreadyShowing = bubble.style.display !== 'none';
    bubble.querySelector('.ia-reminder__text').textContent = startedToday()
      ? 'Continue your daily follow up'
      : 'Start your daily follow up';
    bubble.style.display = '';
    // Only the transition from hidden to shown gets the wave — this
    // runs every minute while a reminder sits undismissed (see
    // checkReminder's interval), and re-waving every single minute
    // would be more annoying than helpful.
    if (!wasAlreadyShowing) peekAndWave();
  }

  function hideReminderBubble() {
    if (!iaWidget) return;
    const bubble = iaWidget.querySelector('.ia-reminder');
    if (bubble) bubble.style.display = 'none';
  }

  function dismissReminder() {
    const until = Date.now() + 60 * 60 * 1000;
    try { GM_setValue(REMINDER_DISMISSED_KEY, until); } catch (e) { /* best-effort */ }
    hideReminderBubble();
  }

  function checkReminder() {
    if (Date.now() >= reminderDismissedUntil()) showReminder();
  }

  try {
    GM_addValueChangeListener(REMINDER_DISMISSED_KEY, function (name, oldValue, newValue, remote) {
      if (!remote) return; // only react to OTHER tabs' changes -- this tab already updated itself directly
      if (Date.now() < Number(newValue)) hideReminderBubble();
      else checkReminder();
    });
  } catch (e) { /* listener unavailable -- reminder still works locally, just not synced across tabs */ }

  setInterval(checkReminder, 60 * 1000); // checked every minute so the hourly boundary is caught promptly, not just once an hour on the dot
  checkReminder(); // also check once on load, in case it was already due when this page opened

  // ==========================================================================
  // Callback reminders
  // ==========================================================================
  // Set a callback on a lead (the ⏰ Callback chip next to the lead number,
  // or ⏰ on the panel's lead card). When it's due, Pip peeks out with the
  // lead: Open lead / +15 min / Done. Only a reminder for the agent;
  // nothing is sent to anyone. All times are Egypt time (Africa/Cairo),
  // whatever the computer's own clock is set to. Shared by every BO tab.
  const CB_KEY = 'ia-callbacks';
  const CB_TZ = 'Africa/Cairo';
  const CB_CLOCK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M5 4 2.5 6.5M19 4l2.5 2.5"/></svg>';

  // --- Egypt time ---------------------------------------------------------
  let cbFmtParts = null;
  function cbParts(ms) {
    if (!cbFmtParts) cbFmtParts = new Intl.DateTimeFormat('en-GB', { timeZone: CB_TZ, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', weekday: 'short', hourCycle: 'h23' });
    const o = {};
    cbFmtParts.formatToParts(new Date(ms)).forEach((p) => { o[p.type] = p.value; });
    return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, mi: +o.minute, wd: o.weekday };
  }
  // Egypt wall-clock time -> real moment (handles Egypt's summer time).
  function cbFromCairo(y, m, d, h, mi) {
    const want = Date.UTC(y, m - 1, d, h, mi);
    let ms = want;
    for (let i = 0; i < 3; i++) {
      const p = cbParts(ms);
      const diff = want - Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi);
      if (!diff) break;
      ms += diff;
    }
    return ms;
  }
  const cbPad = (n) => String(n).padStart(2, '0');
  const cbDayNum = (p) => Date.UTC(p.y, p.m - 1, p.d) / 86400000;
  const CB_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function cbFmt(ms) {
    const p = cbParts(ms);
    const t = cbPad(p.h) + ':' + cbPad(p.mi);
    const days = cbDayNum(p) - cbDayNum(cbParts(Date.now()));
    if (days === 0) return 'Today ' + t;
    if (days === 1) return 'Tomorrow ' + t;
    if (days === -1) return 'Yesterday ' + t;
    if (days > 1 && days < 7) return p.wd + ' ' + t;
    return p.d + ' ' + CB_MON[p.m - 1] + ' ' + t;
  }
  const cbShort = (ms) => cbFmt(ms).replace(/^Today /, '');

  // --- Saved list -----------------------------------------------------------
  function cbLoad() {
    try {
      const a = JSON.parse(GM_getValue(CB_KEY, '[]'));
      return Array.isArray(a) ? a.filter((c) => c && c.leadId && Number.isFinite(c.at)) : [];
    } catch (e) { return []; }
  }
  function cbSave(list) {
    list.sort((a, b) => a.at - b.at);
    try { GM_setValue(CB_KEY, JSON.stringify(list)); } catch (e) { /* best-effort */ }
    cbRefresh();
  }
  const cbFor = (leadId) => cbLoad().find((c) => c.leadId === String(leadId)) || null;
  function cbSet(info, at, note) {
    const list = cbLoad().filter((c) => c.leadId !== String(info.leadId));
    list.push({ leadId: String(info.leadId), name: info.name || '', route: info.route || '', at, note: note || '', setAt: Date.now() });
    cbSave(list);
  }
  function cbRemove(leadId) { cbSave(cbLoad().filter((c) => c.leadId !== String(leadId))); }
  function cbOpenLead(leadId) {
    const path = '/leads/' + leadId;
    if (location.pathname === path) return;
    const url = location.origin + path;
    try { if (typeof GM_openInTab === 'function') { GM_openInTab(url, { active: true, insert: true, setParent: true }); return; } } catch (e) { /* fall back */ }
    window.open(url, '_blank', 'noopener');
  }

  // --- Which lead -----------------------------------------------------------
  function cbPageLeadId() {
    const m = location.pathname.match(/^\/leads\/(\d+)\/?$/);
    return m ? m[1] : null;
  }
  // Client name and route from the lead page's own card (best effort).
  function cbLeadPageInfo(leadId) {
    const info = { leadId: String(leadId), name: '', route: '' };
    try {
      const tag = Array.from(document.querySelectorAll('span')).find((sp) => sp.textContent.trim() === '#' + leadId);
      let root = tag;
      for (let i = 0; i < 12 && root; i++) {
        root = root.parentElement;
        if (root && root.querySelectorAll('.text-base.leading-6.font-semibold').length >= 2) break;
      }
      if (root) {
        const codes = Array.from(root.querySelectorAll('.text-base.leading-6.font-semibold')).map((e) => e.textContent.trim()).filter(Boolean);
        const nameEl = root.querySelector('span.truncate');
        if (nameEl) info.name = nameEl.textContent.trim();
        if (codes.length >= 2) info.route = codes[0] + ' → ' + codes[codes.length - 1];
      }
    } catch (e) { /* ignore */ }
    return info;
  }
  function cbPanelLeadInfo() {
    if (!currentPanelRow) return null;
    const li = getLeadInfo(currentPanelRow);
    if (!li || !li.leadId) return null;
    return { leadId: String(li.leadId), name: li.clientName || '', route: [li.origin, li.dest].filter(Boolean).join(' → ') };
  }
  const cbName = (c) => c.name || ('Lead ' + c.leadId);

  // --- Pop-ups (time picker and list) -------------------------------------
  let cbPop = null;
  function cbClosePop() { if (cbPop) { cbPop.el.remove(); cbPop = null; } }
  function cbPopShell(anchor, kind) {
    const again = cbPop && cbPop.anchor === anchor && cbPop.kind === kind;
    cbClosePop();
    if (again) return null;
    const el = document.createElement('div');
    el.className = 'ia-cbpop';
    // Same colours as the panel (mode + accent).
    const src = ensureBmo();
    const cs = getComputedStyle(src);
    ['--ia-bg', '--ia-field', '--ia-line', '--ia-line2', '--ia-text', '--ia-title', '--ia-muted', '--ia-sec', '--ia-onacc', '--ia-bad', '--ia-shadow', '--acc']
      .forEach((v) => { const val = cs.getPropertyValue(v); if (val) el.style.setProperty(v, val.trim()); });
    el.addEventListener('mousedown', (e) => e.stopPropagation());
    el.addEventListener('click', (e) => e.stopPropagation());
    el.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Escape') cbClosePop(); });
    cbPop = { el, anchor, kind };
    return el;
  }
  function cbPlace(el, anchor) {
    document.body.appendChild(el);
    const r = anchor.getBoundingClientRect();
    const w = el.offsetWidth, h = el.offsetHeight;
    let top = r.bottom + 6;
    if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
    const left = Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8, r.left));
    el.style.left = Math.max(8, left) + 'px';
    el.style.top = top + 'px';
  }
  function cbHead(text) {
    const h = document.createElement('div');
    h.className = 'ia-cbpop-h';
    const t = document.createElement('span');
    t.textContent = text;
    const x = document.createElement('button');
    x.type = 'button';
    x.className = 'ia-cbpop-x';
    x.setAttribute('aria-label', 'Close');
    x.textContent = '×';
    x.addEventListener('click', cbClosePop);
    h.append(t, x);
    return h;
  }
  function cbBtn(label, cls, fn) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.textContent = label;
    b.addEventListener('click', (e) => { e.preventDefault(); fn(e, b); });
    return b;
  }

  function cbOpenPicker(anchor, info) {
    if (!info || !info.leadId) return;
    const el = cbPopShell(anchor, 'pick');
    if (!el) return;
    const existing = cbFor(info.leadId);
    el.appendChild(cbHead('Call back ' + (info.name || 'lead ' + info.leadId)));
    let at = existing ? existing.at : null;
    const quick = document.createElement('div');
    quick.className = 'ia-cbpop-quick';
    const when = document.createElement('div');
    when.className = 'ia-cbpop-when';
    const whenT = document.createElement('b');
    const whenZ = document.createElement('span');
    whenZ.textContent = 'Egypt time';
    when.append(whenT, whenZ);
    const pick = document.createElement('div');
    pick.className = 'ia-cbpop-pick';
    pick.hidden = true;
    const dIn = document.createElement('input');
    dIn.type = 'date';
    dIn.setAttribute('aria-label', 'Date (Egypt time)');
    const tIn = document.createElement('input');
    tIn.type = 'time';
    tIn.setAttribute('aria-label', 'Time (Egypt time)');
    pick.append(dIn, tIn);
    const paintWhen = () => { whenT.textContent = at ? cbFmt(at) : 'Pick a time'; };
    const fillPick = (ms) => { const p = cbParts(ms); dIn.value = p.y + '-' + cbPad(p.m) + '-' + cbPad(p.d); tIn.value = cbPad(p.h) + ':' + cbPad(p.mi); };
    const readPick = () => {
      const dm = dIn.value.match(/^(\d{4})-(\d{2})-(\d{2})$/), tm = tIn.value.match(/^(\d{2}):(\d{2})/);
      at = dm && tm ? cbFromCairo(+dm[1], +dm[2], +dm[3], +tm[1], +tm[2]) : null;
      paintWhen();
    };
    dIn.addEventListener('input', readPick);
    tIn.addEventListener('input', readPick);
    const inMin = (n) => Math.ceil((Date.now() + n * 60000) / 60000) * 60000;
    const tomorrow10 = () => { const p = cbParts(Date.now()); return cbFromCairo(p.y, p.m, p.d + 1, 10, 0); };
    const opts = [['30 min', () => inMin(30)], ['1 hour', () => inMin(60)], ['2 hours', () => inMin(120)], ['4 hours', () => inMin(240)], ['Tomorrow 10:00', tomorrow10], ['Pick time', null]];
    const qBtns = [];
    opts.forEach(([label, fn], i) => {
      const b = cbBtn(label, 'ia-cbpop-q', () => {
        qBtns.forEach((x) => x.classList.toggle('on', x === b));
        if (fn) { at = fn(); pick.hidden = true; } else { pick.hidden = false; fillPick(at || inMin(60)); readPick(); }
        err.textContent = '';
        paintWhen();
      });
      if (i === 4) b.classList.add('wide');
      qBtns.push(b);
      quick.appendChild(b);
    });
    const note = document.createElement('input');
    note.type = 'text';
    note.className = 'ia-cbpop-note';
    note.placeholder = 'Note (optional)';
    note.maxLength = 140;
    note.value = existing ? existing.note : '';
    const err = document.createElement('div');
    err.className = 'ia-cbpop-err';
    const acts = document.createElement('div');
    acts.className = 'ia-cbpop-acts';
    const save = () => {
      if (!at) { err.textContent = 'Pick a time first'; return; }
      if (at < Date.now() - 60000) { err.textContent = 'That time has already passed'; return; }
      cbSet(info, at, note.value.trim());
      cbClosePop();
    };
    note.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); save(); } });
    acts.appendChild(cbBtn(existing ? 'Update callback' : 'Set callback', 'ia-cbpop-go', save));
    if (existing) acts.appendChild(cbBtn('Remove', 'ia-cbpop-rm', () => { cbRemove(info.leadId); cbClosePop(); }));
    el.append(quick, pick, when, note, err, acts);
    if (existing) { qBtns[5].classList.add('on'); pick.hidden = false; fillPick(existing.at); }
    else { qBtns[1].classList.add('on'); at = inMin(60); }
    paintWhen();
    cbPlace(el, anchor);
  }

  function cbOpenList(anchor) {
    const el = cbPopShell(anchor, 'list');
    if (!el) return;
    const paint = () => {
      el.textContent = '';
      const list = cbLoad();
      el.appendChild(cbHead('Callbacks · ' + list.length + ' · Egypt time'));
      if (!list.length) {
        const e = document.createElement('div');
        e.className = 'ia-cbpop-empty';
        e.textContent = 'No callbacks yet. Tap the clock on a lead to set one.';
        el.appendChild(e);
        return;
      }
      const now = Date.now();
      list.forEach((c) => {
        const row = document.createElement('div');
        row.className = 'ia-cbpop-row';
        row.title = (c.note ? c.note + ' · ' : '') + 'Open lead ' + c.leadId;
        const tm = document.createElement('span');
        tm.className = 'ia-cbpop-tm' + (c.at <= now ? ' due' : '');
        tm.textContent = c.at <= now ? 'Now' : cbShort(c.at);
        const n = document.createElement('span');
        n.className = 'ia-cbpop-n';
        const b = document.createElement('b');
        b.textContent = cbName(c);
        const s = document.createElement('span');
        s.textContent = [c.leadId, c.route].filter(Boolean).join(' · ');
        n.append(b, s);
        const x = cbBtn('×', 'ia-cbpop-x', (e) => { e.stopPropagation(); cbRemove(c.leadId); paint(); });
        x.setAttribute('aria-label', 'Remove callback for ' + cbName(c));
        row.append(tm, n, x);
        row.addEventListener('click', () => { cbOpenLead(c.leadId); cbClosePop(); });
        el.appendChild(row);
      });
    };
    paint();
    el._iaPaint = paint;
    cbPlace(el, anchor);
  }

  document.addEventListener('mousedown', (e) => {
    if (cbPop && !cbPop.el.contains(e.target) && !(cbPop.anchor && cbPop.anchor.contains(e.target))) cbClosePop();
  }, true);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cbClosePop(); });

  // --- Lead page chip -------------------------------------------------------
  function cbChipLabel(c) { return c ? cbShort(c.at) : 'Callback'; }
  function cbWireChip() {
    const id = cbPageLeadId();
    if (!id) return;
    let chip = document.querySelector('.ia-cb-chip');
    if (chip && chip.dataset.lead !== id) { chip.remove(); chip = null; }
    if (!chip) {
      const tag = Array.from(document.querySelectorAll('div.text-secondary-400.text-xs.font-medium')).find((d) => (d.textContent.match(/#\s*(\d{5,})/) || [])[1] === id);
      if (!tag || !tag.parentElement) return;
      chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'ia-cb-chip';
      chip.dataset.lead = id;
      chip.innerHTML = CB_CLOCK + '<span></span>';
      chip.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); cbOpenPicker(chip, cbLeadPageInfo(id)); });
      tag.insertAdjacentElement('afterend', chip);
    }
    const c = cbFor(id);
    const t = chip.querySelector('span');
    const label = cbChipLabel(c);
    if (t.textContent !== label) t.textContent = label;
    chip.classList.toggle('is-set', !!c);
    chip.classList.toggle('is-due', !!c && c.at <= Date.now());
    chip.title = c ? 'Callback ' + cbFmt(c.at) + ' (Egypt time)' + (c.note ? ': ' + c.note : '') + '. Click to change.' : 'Set a callback reminder for this lead';
    if (c) {
      const p = cbLeadPageInfo(id);
      if ((p.name && p.name !== c.name) || (p.route && p.route !== c.route)) {
        cbSave(cbLoad().map((x) => (x.leadId === id ? Object.assign(x, { name: p.name || x.name, route: p.route || x.route }) : x)));
      }
    }
  }

  // --- Due reminder ---------------------------------------------------------
  const cbWaved = new Set();
  function cbDueEl() {
    const w = ensureBmo();
    let el = w.querySelector('.ia-cbdue');
    if (el) return el;
    el = document.createElement('div');
    el.className = 'ia-cbdue';
    el.hidden = true;
    el.innerHTML = '<div class="ia-cbdue__top"><span class="ia-cbdue__k"></span><button type="button" class="ia-cbdue__x" aria-label="Clear this callback">&times;</button></div>' +
      '<div class="ia-cbdue__who"></div><div class="ia-cbdue__meta"></div><div class="ia-cbdue__note"></div>' +
      '<div class="ia-cbdue__acts"><button type="button" class="ia-cbdue__a is-main" data-a="open">Open lead</button><button type="button" class="ia-cbdue__a" data-a="snooze">+15 min</button><button type="button" class="ia-cbdue__a" data-a="done">Done</button></div>' +
      '<div class="ia-cbdue__more"></div>';
    el.addEventListener('mousedown', (e) => e.stopPropagation());
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const b = e.target.closest && e.target.closest('button');
      const id = el.dataset.lead;
      if (!b || !id) return;
      const a = b.classList.contains('ia-cbdue__x') ? 'done' : b.dataset.a;
      if (a === 'open') { cbRemove(id); cbOpenLead(id); }
      else if (a === 'snooze') { cbSave(cbLoad().map((c) => (c.leadId === id ? Object.assign(c, { at: Date.now() + 15 * 60000 }) : c))); cbWaved.delete(id); }
      else if (a === 'done') cbRemove(id);
    });
    w.appendChild(el);
    return el;
  }
  function cbPaintDue(list) {
    const now = Date.now();
    const due = list.filter((c) => c.at <= now);
    const w = iaWidget;
    if (!due.length) {
      const el = w && w.querySelector('.ia-cbdue');
      if (el) el.hidden = true;
      if (w) w.classList.remove('ia-widget--cbdue');
      return;
    }
    const c = due[0];
    const el = cbDueEl();
    el.dataset.lead = c.leadId;
    const late = now - c.at > 5 * 60000;
    el.querySelector('.ia-cbdue__k').textContent = late ? 'Callback · due ' + cbShort(c.at) : 'Callback now';
    el.querySelector('.ia-cbdue__who').textContent = cbName(c);
    el.querySelector('.ia-cbdue__meta').textContent = ['Lead ' + c.leadId, c.route, 'set ' + cbShort(c.setAt || c.at)].filter(Boolean).join(' · ');
    const nt = el.querySelector('.ia-cbdue__note');
    nt.textContent = c.note || '';
    nt.hidden = !c.note;
    const more = el.querySelector('.ia-cbdue__more');
    more.textContent = due.length > 1 ? '+' + (due.length - 1) + ' more due' : '';
    more.hidden = due.length < 2;
    el.hidden = false;
    iaWidget.classList.add('ia-widget--cbdue');
    if (!cbWaved.has(c.leadId)) { cbWaved.add(c.leadId); peekAndWave(); }
  }

  // --- Panel buttons --------------------------------------------------------
  function cbPaintPanel(list) {
    const w = iaWidget;
    if (!w) return;
    const badge = w.querySelector('.ia-cb-badge');
    if (badge) {
      badge.textContent = list.length > 9 ? '9+' : String(list.length);
      badge.hidden = !list.length;
      badge.classList.toggle('is-due', list.some((c) => c.at <= Date.now()));
    }
    const card = w.querySelector('.ia-cb-card');
    if (card) {
      const info = cbPanelLeadInfo();
      const c = info && list.find((x) => x.leadId === info.leadId);
      card.classList.toggle('is-set', !!c);
      card.title = c ? 'Callback ' + cbFmt(c.at) + ' (Egypt time). Click to change.' : 'Set a callback for this lead';
    }
  }

  function cbRefresh() {
    const list = cbLoad();
    try { cbPaintPanel(list); } catch (e) { /* ignore */ }
    try { cbPaintDue(list); } catch (e) { /* ignore */ }
    try { cbWireChip(); } catch (e) { /* ignore */ }
    if (cbPop && cbPop.kind === 'list' && cbPop.el._iaPaint) cbPop.el._iaPaint();
  }

  try { GM_addValueChangeListener(CB_KEY, () => cbRefresh()); } catch (e) { /* other tabs catch up on the timer */ }
  setInterval(cbRefresh, 15000);
  __jsRegisterScan(() => { try { cbWireChip(); } catch (e) { /* ignore */ } });
  setTimeout(cbRefresh, 0);


  // Clear the downloaded-font copy older versions saved (no longer used).
  try { if (GM_getValue('bmo-font-fredoka-v1', null)) GM_setValue('bmo-font-fredoka-v1', null); } catch (e) { /* ignore */ }

  GM_addStyle(`
    .dialer-called-dot {
      position: absolute;
      top: 3px;
      left: -4px;
      width: 13px;
      height: 13px;
      border-radius: 50%;
      background: transparent;
      border: 2px solid rgba(255,255,255,.35);
      box-sizing: border-box;
    }
    .dialer-called-dot.is-called { background: #2ecc71; border-color: #2ecc71; box-shadow: 0 0 5px rgba(46,204,113,.8); }
    .dialer-called-dot.is-skipped { background: #f1c40f; border-color: #f1c40f; box-shadow: 0 0 5px rgba(241,196,15,.8); }
    .dialer-called-dot.is-called2 { background: #e53935; border-color: #e53935; box-shadow: 0 0 5px rgba(229,57,53,.85); }

    .ia-widget {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 99999;
      width: 280px;
      height: 331px;
      pointer-events: none;
      /* Matches roughly where the bubble sits within this box (bottom
         right), so the drag-tilt rotation pivots near the bubble
         itself rather than around the whole box's center — without
         this, tilting would swing the bubble through a wide arc around
         a point far from where it visually sits, instead of reading as
         the bubble itself leaning in place. */
      transform-origin: 83% 88%;
      --ia-pip-body: #13b3a0;
      --ia-pip-side: #0c8a7b;
      --ia-pip-dark: #0d6e63;
      --ia-pip-screen: #dcf3ef;
      --ia-pip-text: #0b3b34;
    }
    .ia-widget--pink {
      --ia-pip-body: #ec4899;
      --ia-pip-side: #c42f78;
      --ia-pip-dark: #9d174d;
      --ia-pip-screen: #fce7f3;
      --ia-pip-text: #831843;
    }
    .ia-widget--black {
      --ia-pip-body: #26282b;
      --ia-pip-side: #141517;
      --ia-pip-dark: #0a0a0a;
      --ia-pip-screen: #e5e5e5;
      --ia-pip-text: #1a1a1a;
    }
    .ia-widget--midnight {
      --ia-pip-body: #1e293b;
      --ia-pip-side: #0b1120;
      --ia-pip-dark: #0f172a;
      --ia-pip-screen: #cffafe;
      --ia-pip-text: #083344;
    }
    .ia-headset { opacity: 0; transition: opacity .6s ease; pointer-events: none; }
    .ia-widget--pink .ia-headset { opacity: 1; }
    .ia-widget--gold {
      --ia-pip-body: #d4a52a;
      --ia-pip-side: #a9801a;
      --ia-pip-dark: #8a6508;
      --ia-pip-screen: #fff6d6;
      --ia-pip-text: #5c4200;
    }
    .ia-crown { opacity: 0; transition: opacity .6s ease; pointer-events: none; }
    .ia-widget--gold .ia-crown { opacity: 1; }
    .ia-widget--gold .ia-bubble,
    .ia-widget--gold .ia-full { animation: ia-gold-shine 2.4s ease-in-out infinite; }
    @keyframes ia-gold-shine {
      0%, 100% { filter: drop-shadow(0 0 2px rgba(255, 215, 0, .35)); }
      50% { filter: drop-shadow(0 0 10px rgba(255, 215, 0, .9)); }
    }
    .ia-widget--gold-unlock .ia-full { animation: ia-gold-burst 1.5s ease-out 1; }
    @keyframes ia-gold-burst {
      0% { filter: drop-shadow(0 0 0 rgba(255, 215, 0, 0)) brightness(1); }
      25% { filter: drop-shadow(0 0 28px rgba(255, 215, 0, 1)) brightness(1.5); }
      100% { filter: drop-shadow(0 0 4px rgba(255, 215, 0, .4)) brightness(1); }
    }
    /* Sniper-active overlay — wins over whichever theme (teal/pink/black)
       is currently chosen, because it's not itself a theme: it's a
       temporary "sniping in progress" indicator that reverts to the real
       theme the instant Alt+Z turns the sniper back off. Placed after all
       three theme blocks so it wins the cascade regardless of which
       theme class is also present. */
    .ia-widget--sniping {
      --ia-pip-body: #dc2626;
      --ia-pip-side: #a51d1d;
      --ia-pip-dark: #7f1d1d;
      --ia-pip-screen: #fee2e2;
      --ia-pip-text: #450a0a;
    }
    /* Stop button goes light so it stands out on the dark red body. */
    .ia-widget--sniping .ia-stop-face { fill: #fee2e2; }
    .ia-widget--sniping .ia-stop-base { fill: #d9a3a3 !important; }
    .ia-widget--sniping .ia-btn-stop .ia-btn-label { fill: #c26a6a; }
    /* Challenging squint while sniping: eyes narrow, and a slanted lid (in
       the screen's own color) cuts the top of each eye down toward the
       middle. No eyebrows, same smile. */
    .ia-lid { opacity: 0; fill: var(--ia-pip-screen); transition: fill .6s ease, opacity 1.3s ease; }
    .ia-eye { transform-box: fill-box; transform-origin: center; transition: transform 1.3s ease; }
    .ia-widget--sniping .ia-eye { transform: scaleY(.85); }
    .ia-widget--sniping .ia-lid { opacity: 1; }

    /* --- 3D look: light from above, everything casts its shadow down --- */
    .ia-bodygrp { filter: drop-shadow(0 6px 5px rgba(0,0,0,.22)); }
    .ia-rim { fill: none; stroke: #fff; stroke-opacity: .25; stroke-width: 1.5; stroke-linecap: round; pointer-events: none; }
    .ia-lip { fill: none; stroke: #fff; stroke-opacity: .28; stroke-width: 1.5; pointer-events: none; }
    .ia-glare { fill: #fff; opacity: .35; pointer-events: none; }
    .ia-hl { fill: none; stroke: #fff; stroke-opacity: .5; stroke-width: 1.6; stroke-linecap: round; pointer-events: none; }
    .ia-pill { transition: fill .6s ease; }

    /* Button bases: darker shade of each button, with a soft shadow
       directly underneath. */
    .ia-base { filter: drop-shadow(0 2px 2px rgba(0,0,0,.35)); transition: fill .6s ease; }
    .ia-cross-base rect { fill: #c99a12; }
    .ia-btn-skip .ia-base { fill: #2f86ad; stroke: #2f86ad; }
    .ia-btn-skip polygon { stroke-width: 3; stroke-linejoin: round; }
    .ia-btn-doubledial .ia-base { fill: #6aa83a; }
    .ia-stop-base { fill: #b8301f; }
    .ia-stop-face { transition: fill .6s ease; }

    /* Pressing: the button sinks onto its base. */
    .ia-top, .ia-btn-label { transition: transform .1s ease, fill .6s ease; }
    .ia-btn:active .ia-top, .ia-btn:active .ia-btn-label { transform: translateY(2px); }

    /* Labels are engraved into each button: the letters are a darker
       shade of the button's own color, with a thin light edge along their
       bottom (light from above catching the lower lip of the cut). */
    .ia-btn-label {
      font-weight: 700 !important;
      filter: drop-shadow(0 .8px 0 rgba(255,255,255,.55)) drop-shadow(0 -.6px 0 rgba(0,0,0,.25));
    }
    .ia-label-call { fill: #9a7400; }
    .ia-label-skip { fill: #1d6b8f; color: #1d6b8f; }
    .ia-label-2x { fill: #3f7419; }
    /* Rainbow: a deep violet bottom edge reads better under the rainbow. */
    .ia-widget--super:not(.ia-widget--sniping) { --ia-pip-side: #5b3a8c; }
    .ia-label-stop { fill: #9b2010; filter: drop-shadow(0 .8px 0 rgba(255,255,255,.4)) drop-shadow(0 -.6px 0 rgba(0,0,0,.3)); }

    /* Double-dial switch: the small dot by 2X is a red lamp. Off = dark,
       unlit red. On = lit, glowing red. */
    .ia-dd-toggle { cursor: pointer; }
    .ia-led { font-family: system-ui, sans-serif; font-size: 7.4px; font-weight: 700; letter-spacing: .05px; fill: var(--ia-pip-text); transition: fill .6s ease; pointer-events: none; }
    /* Name strip: rests centered, scrolls off to the left, comes back in
       from the right and settles centered again. */
    /* 10s resting centered, ~3s out to the left, ~3s back in. */
    /* Moved as one flat layer (no re-snapping of the letters each step),
       so the text glides sideways without bobbing up and down. */
    .ia-led-move { animation: ia-led-lap 16s linear infinite; will-change: transform; }
    @keyframes ia-led-lap {
      0% { transform: translateX(0); }
      62.5% { transform: translateX(0); }
      81.25% { transform: translateX(-58px); }
      81.26% { transform: translateX(58px); }
      100% { transform: translateX(0); }
    }
    .ia-dd-dot { fill: #6b1414; stroke: #3a0606; stroke-width: 1; transition: fill .6s ease, filter .6s ease !important; }
    .ia-dd-shine { fill: #fff; opacity: .15; pointer-events: none; transition: opacity .6s ease; }
    .ia-widget--dd-on .ia-dd-dot { fill: #ff2a2a; filter: drop-shadow(0 0 3px rgba(255,40,40,.95)) drop-shadow(0 0 6px rgba(255,40,40,.6)); }
    .ia-widget--dd-on .ia-dd-shine { opacity: .75; }

    /* Super Pip: flowing rainbow body once the day's follow-up is done. */
    .ia-rainbow { opacity: 0; transition: opacity .6s ease; pointer-events: none; }
    .ia-widget--super .ia-rainbow { opacity: 1; }
    .ia-widget--super.ia-widget--sniping .ia-rainbow { opacity: 0; }
    /* Bubble rainbow sits on a layer under the screen that fades in/out at
       the same .6s as everything else (a gradient background would snap). */
    .ia-bubble::after {
      content: ''; position: absolute; inset: 0 0 4px 0; border-radius: inherit; z-index: 0;
      background: linear-gradient(135deg, #ff3b3b, #ff9f1c, #ffe14d, #3ddc84, #3fa9f5, #9b5de5, #ff3b3b, #ff9f1c, #ffe14d);
      background-size: 400% 400%;
      animation: ia-rainbow-flow 4s linear infinite;
      opacity: 0; transition: opacity .6s ease; pointer-events: none;
    }
    .ia-bubble > svg { position: relative; z-index: 1; }
    .ia-widget--super:not(.ia-widget--sniping) .ia-bubble::after { opacity: 1; }
    @keyframes ia-rainbow-flow { 0% { background-position: 0% 0%; } 100% { background-position: 100% 100%; } }
    /* Keep button labels readable on the rainbow. The outlines always
       exist but are fully transparent until the rainbow is on, so they fade
       in and out at the same .6s speed as the body instead of snapping. */
    .ia-btn-label { stroke: rgba(0,0,0,0); stroke-width: 2.4px; paint-order: stroke; stroke-linejoin: round; }
    .ia-cross rect { stroke: rgba(0,0,0,0); stroke-width: 1.2px; }
    .ia-btn-label, .ia-cross rect { transition: stroke .6s ease, fill .6s ease, transform .1s ease !important; }
    .ia-widget--super:not(.ia-widget--sniping) .ia-btn-label { stroke: rgba(0,0,0,0); }
    .ia-widget--super .ia-btn-doubledial .ia-btn-label { stroke: rgba(0,0,0,0); }
    .ia-widget--super:not(.ia-widget--sniping) .ia-cross rect { stroke: rgba(0,0,0,0); }

    /* Locked color button wiggle (Super Pip day). */
    .ia-locked-wiggle { transform-box: fill-box; transform-origin: center; animation: ia-wiggle .45s ease 1; }
    @keyframes ia-wiggle { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-9deg); } 50% { transform: rotate(8deg); } 75% { transform: rotate(-5deg); } }

    /* Level-up celebration: Pip hops, a light ring bursts, sparks fly
       out and "LEVEL UP!" pops above his head. */
    .ia-levelup {
      position: absolute; right: 0; bottom: 0; width: 280px; height: 331px;
      pointer-events: none; display: none; z-index: 5;
    }
    .ia-widget--levelup .ia-levelup { display: block; }
    .ia-levelup__text, .ia-levelup__sub {
      position: absolute; left: 50%; top: 2px; transform: translateX(-50%);
      font: 900 26px/1 'Bahnschrift', 'Segoe UI', system-ui, sans-serif; letter-spacing: .04em;
      white-space: nowrap;
      background: linear-gradient(90deg, #ff3b3b, #ff9f1c, #ffe14d, #3ddc84, #3fa9f5, #9b5de5);
      -webkit-background-clip: text; background-clip: text; color: transparent;
      filter: drop-shadow(0 2px 0 rgba(0,0,0,.35)) drop-shadow(0 0 6px rgba(255,255,255,.9));
      opacity: 0; animation: ia-lvl-text 2.4s cubic-bezier(.2,1.4,.4,1) forwards;
    }
    .ia-levelup__sub {
      top: 34px; font-size: 12px; letter-spacing: .25em; display: none;
      animation-delay: .25s;
    }
    .ia-widget--levelup-sub .ia-levelup__sub { display: block; }
    @keyframes ia-lvl-text {
      0% { opacity: 0; transform: translateX(-50%) translateY(30px) scale(.3); }
      20% { opacity: 1; transform: translateX(-50%) translateY(-6px) scale(1.18); }
      32% { transform: translateX(-50%) translateY(0) scale(1); }
      80% { opacity: 1; transform: translateX(-50%) translateY(-4px) scale(1); }
      100% { opacity: 0; transform: translateX(-50%) translateY(-22px) scale(1); }
    }
    .ia-levelup__ring {
      position: absolute; left: 50%; top: 52%; width: 40px; height: 40px; margin: -20px 0 0 -20px;
      border-radius: 50%; border: 4px solid rgba(255,255,255,.95);
      box-shadow: 0 0 18px 6px rgba(255,225,77,.8), inset 0 0 12px rgba(255,255,255,.8);
      opacity: 0; animation: ia-lvl-ring 1s ease-out forwards;
    }
    @keyframes ia-lvl-ring {
      0% { opacity: 1; transform: scale(.2); }
      100% { opacity: 0; transform: scale(7); }
    }
    .ia-levelup__spark {
      position: absolute; left: 50%; top: 50%; width: 10px; height: 10px; margin: -5px 0 0 -5px;
      background: #fff6b0;
      clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
      filter: drop-shadow(0 0 4px #ffd84d);
      opacity: 0; animation: ia-lvl-spark 1.3s ease-out forwards;
    }
    .ia-levelup__spark:nth-child(odd) { background: #b9f3ff; filter: drop-shadow(0 0 4px #5ec8f0); }
    @keyframes ia-lvl-spark {
      0% { opacity: 1; transform: rotate(var(--a)) translateY(0) scale(.4); }
      70% { opacity: 1; }
      100% { opacity: 0; transform: rotate(var(--a)) translateY(calc(-1 * var(--d))) scale(1.2) rotate(180deg); }
    }
    .ia-widget--levelup .ia-full { animation: ia-lvl-hop .7s cubic-bezier(.3,1.6,.5,1) 1 !important; }
    @keyframes ia-lvl-hop {
      0% { translate: 0 0; } 30% { translate: 0 -16px; } 55% { translate: 0 0; } 75% { translate: 0 -5px; } 100% { translate: 0 0; }
    }

    /* Easter egg: cracked screen. */
    .ia-crack { opacity: 0; pointer-events: none; transition: opacity .5s ease; }
    .ia-crack path { fill: none; stroke: #2b2b2b; stroke-width: 1.4; stroke-linecap: round; stroke-linejoin: round; }
    .ia-widget--cracked .ia-crack { opacity: .9; transition: none; }
    /* Cracked = sad: frown, droopy brows and a tear instead of the smile. */
    .ia-sad, .ia-sad-tear { display: none; }
    .ia-sad { fill: none; stroke: #1a1a1a; stroke-width: 3.5; stroke-linecap: round; }
    .ia-sad-tear { fill: #5ec8f0; }
    .ia-widget--cracked .ia-smile, .ia-widget--cracked .ia-lid { display: none; }
    .ia-widget--cracked .ia-sad, .ia-widget--cracked .ia-sad-tear { display: inline; }
    .ia-widget--cracked .ia-full, .ia-widget--cracked .ia-bubble { animation: ia-impact .35s ease-out 1; }
    @keyframes ia-impact {
      0% { translate: 0 0; } 20% { translate: -4px 2px; } 40% { translate: 4px -2px; }
      60% { translate: -2px 1px; } 80% { translate: 2px 0; } 100% { translate: 0 0; }
    }

    /* Stop pressed while running: a clear "stopped" flash. */
    .ia-widget--stop-flash .ia-stop-face { animation: ia-old-stop-flash .9s ease-out 1; }
    @keyframes ia-old-stop-flash { 0% { fill: #ffffff; } 100% { } }
    .ia-widget--sniping .ia-bubble,
    .ia-widget--sniping .ia-full {
      animation: ia-sniping-pulse 1s ease-in-out infinite;
    }
    @keyframes ia-sniping-pulse {
      0%, 100% { filter: drop-shadow(0 0 0 rgba(220, 38, 38, 0)); }
      50% { filter: drop-shadow(0 0 8px rgba(220, 38, 38, .85)); }
    }
    /* Everything themeable transitions fill/stroke together, so toggling
       the palette reads as one smooth cross-fade across the whole
       character rather than separate pieces changing at different
       times. */
    .ia-themed { transition: fill .6s ease, stroke .6s ease; }
    .ia-bubble {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 96px;
      height: 76px;
      border-radius: 16px;
      background: var(--ia-pip-body);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 -4px 0 var(--ia-pip-side), inset 0 1.5px 0 rgba(255,255,255,.25), 0 6px 12px rgba(0,0,0,.3);
      cursor: grab;
      pointer-events: auto;
      transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .2s, background .6s ease;
    }
    .ia-bubble:active { cursor: grabbing; }
    .ia-full {
      position: absolute;
      right: 0;
      bottom: 0;
      transform-origin: bottom right;
      transform: scale(0.2);
      opacity: 0;
      pointer-events: none;
      transition: transform .35s cubic-bezier(.34,1.56,.64,1), opacity .2s;
      overflow: visible;
    }
    /* Invisible 16px grab zone around the minimized bubble */
    .ia-bubble::before {
      content: '';
      position: absolute;
      inset: -16px;
      border-radius: 28px;
    }
    .ia-widget--maximized .ia-full { transform: scale(1); opacity: 1; pointer-events: none; }
    /* Only Pip's actual body (and what's on it) can be grabbed/clicked —
       not the empty space around him, his hidden arms or accessories. */
    .ia-widget--maximized .ia-full > :not(.ia-arm-left):not(.ia-arm-right):not(.ia-headset):not(.ia-crown):not(defs) { pointer-events: auto; cursor: grab; }
    .ia-widget--maximized .ia-full .ia-btn, .ia-widget--maximized .ia-full .ia-btn *, .ia-widget--maximized .ia-full .ia-dd-toggle,
    .ia-widget--maximized .ia-screen-info__client, .ia-widget--maximized .ia-reminder { cursor: pointer !important; }
    .ia-widget--maximized .ia-bubble { transform: scale(0.15); opacity: 0; pointer-events: none; }
    .ia-widget--dragging,
    .ia-widget--dragging * { cursor: grabbing !important; }
    /* A "peek" shows the full character the same way maximizing does,
       but stays non-interactive (pointer-events stays off) and doesn't
       touch iaMaximized — used only for the hourly reminder's
       attention-grabbing wave when Pip is currently minimized, so the
       wave has an actual character to play on without it counting as
       Pip being genuinely opened. */
    .ia-widget--peeking .ia-full { transform: scale(1); opacity: 1; }
    .ia-widget--peeking .ia-bubble { transform: scale(0.15); opacity: 0; }
    .ia-btn { cursor: pointer; }
    .ia-btn--disabled { opacity: .4; pointer-events: none; }
    /* While auto-dialing, the red Stop button pulses so it's obvious Pip
       is running on his own and how to halt him. */
    .ia-widget--running .ia-stop-face { animation: ia-stop-pulse 1.2s ease-in-out infinite; }
    @keyframes ia-stop-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .55; } }
    /* Fonts already built into Windows — no downloads, no permission
       prompts. Bahnschrift is Windows' modern geometric font. */
    .ia-btn-label { font-family: 'Bahnschrift', 'Segoe UI Variable Display', 'Segoe UI', system-ui, sans-serif; font-weight: 600; font-kerning: normal; pointer-events: none; }
    .ia-eye { fill: #1a1a1a; }
    .ia-smile { fill: none; stroke: #1a1a1a; stroke-width: 4; stroke-linecap: round; }

    /* Dead face — shown for 2s after a vicious shake, on top of whichever
       face (bubble or full) is currently visible, and hides the normal
       one underneath it. */
    .ia-dead-face, .ia-bubble-dead-face { display: none; }
    .ia-widget--dead .ia-face, .ia-widget--dead .ia-bubble-face { display: none; }
    .ia-widget--dead .ia-dead-face, .ia-widget--dead .ia-bubble-dead-face { display: inline; }
    .ia-dead-eye { fill: none; stroke: #1a1a1a; stroke-width: 3; stroke-linecap: round; }
    .ia-dead-mouth { fill: none; stroke: #1a1a1a; stroke-width: 4; stroke-linecap: round; }
    .ia-dead-tongue { fill: #ff6b8a; stroke: #c2455f; stroke-width: 1.5; }
    /* Arms are invisible by default now -- they only ever exist on
       screen for the duration of a wave: fading in, waving, then fading
       back out, rather than sitting there permanently. Both arms share
       the same fade; only the right one also rotates. */
    .ia-arm-left, .ia-arm-right { opacity: 0; }
    .ia-arm-left.ia-waving { animation: ia-arm-fade 2.2s ease-in-out 1; }
    .ia-arm-right.ia-waving {
      transform-origin: 168px 103px;
      animation: ia-arm-fade 2.2s ease-in-out 1, ia-wave-rotate 2.2s ease-in-out 1;
    }
    @keyframes ia-arm-fade {
      0% { opacity: 0; }
      10% { opacity: 1; }
      85% { opacity: 1; }
      100% { opacity: 0; }
    }
    @keyframes ia-wave-rotate {
      0%, 10%, 85%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-22deg); }
      40% { transform: rotate(10deg); }
      55% { transform: rotate(-16deg); }
      70% { transform: rotate(4deg); }
    }
    /* pointer-events is only re-enabled while Pip is actually maximized.
       .ia-full itself is pointer-events:none while minimized/peeking,
       but that's just an ancestor default — an explicit pointer-events
       on a descendant (this foreignObject content) overrides it, so
       without scoping this to --maximized, the client link underneath
       the invisible, scaled-down full body would still catch clicks
       landing on the minimized bubble (right around where the eyes
       are) and open the lead instead of letting the bubble's own click
       handler maximize Pip. */
    .ia-screen-info { font-family: system-ui, sans-serif; color: var(--ia-pip-text); pointer-events: none; transition: color .6s ease; }
    .ia-widget--maximized .ia-screen-info { pointer-events: auto; }
    /* The screen's text box (an HTML island inside the SVG) doesn't scale
       smoothly with the body in Chrome and visibly jumps while Pip grows
       or shrinks — so it fades out at once on minimize and only fades in
       once he's fully open. */
    .ia-widget:not(.ia-widget--maximized):not(.ia-widget--peeking) .ia-screen-info { opacity: 0; transition: opacity .08s ease, color .6s ease; }
    .ia-widget--maximized .ia-screen-info, .ia-widget--peeking .ia-screen-info { opacity: 1; transition: opacity .2s ease .3s, color .6s ease; }
    .ia-screen-info__label { font-size: 8px; line-height: 1.1; text-transform: uppercase; opacity: .65; letter-spacing: .03em; white-space: nowrap; }
    /* Was using -webkit-line-clamp (display:-webkit-box) to cap this at
       2 lines — that hack's height computation isn't reliable inside an
       SVG foreignObject specifically, unlike in a normal HTML document,
       and a miscalculated height here would push the route line below
       it to start from the wrong position, visually landing on top of
       the name instead of under it. A plain block with a fixed
       max-height in px is a more literal, predictable way to cap this
       at 2 lines' worth of space — no fancy ellipsis, but it reliably
       reserves exactly the height it claims, which the route line's own
       position depends on being correct.

       The name pushing the destination out of view turned out to have a
       second cause on top of that: the foreignObject box is a fixed
       height, and the (usually empty) status line below the route was
       still reserving its own line-height + margin even with no text in
       it — room that a 2-line name needed. :empty collapses it to
       nothing when there's nothing to show, and the destination/route
       line is given first claim on whatever space is left after the
       label and the (capped) name, so it is never the one that gets
       clipped. */
    .ia-screen-info__client {
      display: block;
      max-height: 30px;
      overflow: hidden;
      font-weight: 700;
      font-size: 13px;
      margin-top: 1px;
      color: var(--ia-pip-text);
      text-decoration: none;
      line-height: 1.15;
      transition: color .6s ease;
    }
    .ia-screen-info__client:hover { text-decoration: underline; }
    .ia-screen-info__route { font-size: 10px; line-height: 1.15; opacity: .8; margin-top: 1px; }
    .ia-screen-info__status { font-size: 8px; line-height: 1.1; opacity: .7; margin-top: 2px; }
    .ia-screen-info__status:empty { display: none; margin-top: 0; }

    .ia-reminder {
      position: absolute;
      right: 4px;
      /* Follows whichever face is actually showing: parked just above
         the small minimized bubble by default, and only jumps up above
         the full 331px-tall body while it's actually on screen (maximized,
         or mid-"peek") -- see the .ia-widget--maximized/--peeking
         overrides below. Both the box and the bubble stay a fixed size
         either way, so these are plain fixed offsets, not something that
         needs recalculating in JS. */
      bottom: 86px;
      width: 190px;
      background: var(--ia-pip-body);
      color: #fff;
      border-radius: 10px;
      padding: 10px 12px;
      font-family: system-ui, sans-serif;
      font-size: 12px;
      box-shadow: 0 4px 14px rgba(0,0,0,.4);
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background .6s ease, bottom .25s ease;
    }
    .ia-widget--maximized .ia-reminder,
    .ia-widget--peeking .ia-reminder {
      bottom: 341px;
    }
    .ia-reminder__text { flex: 1; }
    .ia-reminder__dismiss {
      background: none;
      border: none;
      color: #fff;
      opacity: .6;
      font-size: 16px;
      line-height: 1;
      cursor: pointer;
      padding: 0 2px;
    }
    .ia-reminder__dismiss:hover { opacity: 1; }
  `);


  // ------------------------------------------------------------------
  // Ian's Assistant — Pip + clean panel in three modes (dark / light /
  // navy). Added last so it wins over the original character styles.
  // Colours mirror IA_MODES / IA_ACCENTS at the top of the file.
  // ------------------------------------------------------------------
  GM_addStyle(`
    .ia-widget { font-family: Inter, 'Segoe UI', system-ui, -apple-system, sans-serif; }
    .ia-widget.ia-mode-dark { --ia-bg:#0e0f13; --ia-card:transparent; --ia-cardbd:#23252d; --ia-field:#15171d; --ia-line:#23252d; --ia-line2:#2c2f38; --ia-text:#e8e8ed; --ia-title:#f4f4f7; --ia-muted:#8a8d98; --ia-sec:#c9cad3; --ia-head:#e8e8ed; --ia-eye:#0e0f13; --ia-onacc:#0e0f13; --ia-ok:#4ade80; --ia-bad:#f8717f; --ia-stop:#e5484d; --ia-foot:#5d6070; --ia-shadow:0 18px 44px rgba(0,0,0,.55); --acc:#2dd4bf; }
    .ia-widget.ia-mode-light { --ia-bg:#ffffff; --ia-card:#f6f6f8; --ia-cardbd:#f6f6f8; --ia-field:#f6f6f8; --ia-line:#e4e4e9; --ia-line2:#e4e4e9; --ia-text:#18181b; --ia-title:#18181b; --ia-muted:#6b6b76; --ia-sec:#3f3f46; --ia-head:#3f3f46; --ia-eye:#ffffff; --ia-onacc:#ffffff; --ia-ok:#16a34a; --ia-bad:#dc3e42; --ia-stop:#dc3e42; --ia-foot:#a1a1aa; --ia-shadow:0 14px 36px rgba(15,23,42,.18); --acc:#0f766e; }
    .ia-widget.ia-mode-navy { --ia-bg:#0b1628; --ia-card:#10203a; --ia-cardbd:#1c2e4d; --ia-field:#10203a; --ia-line:#1c2e4d; --ia-line2:#23395e; --ia-text:#e6edf7; --ia-title:#f1f5fb; --ia-muted:#8aa0bf; --ia-sec:#c4d2e6; --ia-head:#e6edf7; --ia-eye:#0b1628; --ia-onacc:#0b1628; --ia-ok:#4ade80; --ia-bad:#ff8a8a; --ia-stop:#e5484d; --ia-foot:#5b7092; --ia-shadow:0 18px 44px rgba(2,8,23,.6); --acc:#5eead4; }
    .ia-widget.ia-mode-dark.ia-widget--midnight { --acc:#7c7cf8; }
    .ia-widget.ia-mode-light.ia-widget--midnight { --acc:#5b5bd6; }
    .ia-widget.ia-mode-navy.ia-widget--midnight { --acc:#7c9cff; }
    .ia-widget.ia-mode-dark.ia-widget--pink { --acc:#f472b6; }
    .ia-widget.ia-mode-light.ia-widget--pink { --acc:#db2777; }
    .ia-widget.ia-mode-navy.ia-widget--pink { --acc:#f9a8d4; }
    .ia-widget.ia-mode-dark.ia-widget--black { --acc:#e4e4e7; }
    .ia-widget.ia-mode-light.ia-widget--black { --acc:#27272a; }
    .ia-widget.ia-mode-navy.ia-widget--black { --acc:#e6edf7; }
    .ia-widget.ia-mode-dark.ia-widget--gold { --acc:#f5b544; }
    .ia-widget.ia-mode-light.ia-widget--gold { --acc:#b45309; }
    .ia-widget.ia-mode-navy.ia-widget--gold { --acc:#fcd34d; }
    .ia-widget.ia-mode-dark.ia-widget--super { --acc:#a78bfa; }
    .ia-widget.ia-mode-light.ia-widget--super { --acc:#7c3aed; }
    .ia-widget.ia-mode-navy.ia-widget--super { --acc:#c4b5fd; }
    .ia-widget.ia-mode-dark.ia-widget--sniping { --acc:#f8717f; }
    .ia-widget.ia-mode-light.ia-widget--sniping { --acc:#dc3e42; }
    .ia-widget.ia-mode-navy.ia-widget--sniping { --acc:#ff8a8a; }

    /* Pip */
    .pip { display: block; flex: none; }
    .pip .pip-body { fill: var(--acc); transition: fill .3s; }
    .pip .pip-hs-arc { fill: none; stroke: var(--ia-head); stroke-width: 3.4; stroke-linecap: round; }
    .pip .pip-hs { fill: var(--ia-head); }
    .pip .pip-mic { fill: none; stroke: var(--ia-head); stroke-width: 2.6; stroke-linecap: round; }
    .pip .pip-eye { fill: var(--ia-eye); }
    .pip .pip-line { fill: none; stroke: var(--ia-eye); stroke-width: 2.8; stroke-linecap: round; }
    .pip .pip-wave { fill: none; stroke: var(--ia-ok); stroke-width: 2.4; stroke-linecap: round; animation: pip-wave 1.2s ease-in-out infinite; }
    @keyframes pip-wave { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }
    .pip .pip-f-call, .pip .pip-f-snipe { display: none; }
    .ia-widget--oncall .pip .pip-f-idle { display: none; }
    .ia-widget--oncall .pip .pip-f-call { display: inline; }
    .ia-widget--sniping .pip .pip-f-idle, .ia-widget--sniping .pip .pip-f-call { display: none; }
    .ia-widget--sniping .pip .pip-f-snipe { display: inline; }
    .ia-widget--levelup .pip { animation: pip-bounce .7s cubic-bezier(.3,1.6,.5,1) 2; }
    @keyframes pip-bounce { 0%, 100% { transform: translateY(0); } 40% { transform: translateY(-5px); } }

    /* Minimized tile (96 x 76) */
    .ia-widget .ia-bubble { background: var(--ia-bg); border: 1px solid var(--ia-line); border-radius: 14px; box-sizing: border-box;
      box-shadow: var(--ia-shadow); transition: transform .3s cubic-bezier(.34,1.56,.64,1), opacity .2s, background .3s, border-color .3s; }
    .ia-widget .ia-bubble::after { display: none; }
    .ia-widget .ia-bubble:hover { border-color: var(--acc); }
    .ia-widget--sniping .ia-bubble { border-color: var(--acc); }
    .ia-mini { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; }
    .ia-mini__dot { position: absolute; top: -9px; right: -16px; }
    .ia-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ia-line2); flex: none; transition: background .3s; }
    .ia-widget--running .ia-dot { background: var(--ia-ok); animation: ia-pulse 1.6s ease-in-out infinite; }
    .ia-widget--sniping .ia-dot { background: var(--acc); animation: ia-pulse 1s ease-in-out infinite; }
    @keyframes ia-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }

    /* Open panel (280 x 331) */
    .ia-widget .ia-panel { width: 280px; height: 331px; box-sizing: border-box; padding: 13px; display: flex; flex-direction: column; gap: 9px;
      background: var(--ia-bg); color: var(--ia-text); border: 1px solid var(--ia-line); border-radius: 14px;
      box-shadow: var(--ia-shadow); overflow: hidden; transition: transform .3s cubic-bezier(.34,1.3,.64,1), opacity .2s, background .3s, border-color .3s, color .3s; }
    .ia-widget--maximized .ia-panel { cursor: grab; pointer-events: auto; }
    .ia-head { display: flex; align-items: center; gap: 7px; height: 32px; flex: none; }
    .ia-head__txt { flex: 1; min-width: 0; }
    .ia-head__title { font-size: 13.5px; font-weight: 600; color: var(--ia-title); line-height: 1.15; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ia-head__greet { font-size: 11px; color: var(--ia-muted); line-height: 1.25; height: 14px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
    .ia-head__greet .ia-led { font: inherit; letter-spacing: 0; fill: currentColor; }
    .ia-iconbtn { width: 24px; height: 24px; border-radius: 6px; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; flex: none;
      color: var(--ia-muted); border: 1px solid transparent; font-size: 15px; line-height: 1; cursor: pointer; transition: background .15s, border-color .15s, color .15s; }
    .ia-iconbtn:hover { border-color: var(--ia-line2); color: var(--ia-title); }
    .ia-mode-btn { border-color: var(--ia-line2); color: var(--ia-sec); }
    .ia-ico { display: none; }
    .ia-mode-dark .ia-ico-dark, .ia-mode-light .ia-ico-light, .ia-mode-navy .ia-ico-navy { display: block; }
    .ia-min { width: 18px; }
    .ia-swatch { width: 10px; height: 10px; border-radius: 50%; background: var(--acc); box-shadow: 0 0 0 2px var(--ia-bg), 0 0 0 3px var(--ia-line2); transition: background .3s; }

    .ia-card { flex: 1; min-height: 0; background: var(--ia-card); border: 1px solid var(--ia-cardbd); border-radius: 10px; padding: 11px 12px; display: flex; flex-direction: column; transition: background .3s, border-color .3s; }
    .ia-idle { margin: auto; text-align: center; }
    .ia-idle__icon { display: inline-flex; color: var(--acc); margin-bottom: 4px; }
    .ia-idle__t { font-size: 14px; font-weight: 600; color: var(--ia-title); }
    .ia-idle__s { font-size: 11.5px; color: var(--ia-muted); margin-top: 2px; }
    .ia-panel .ia-screen-info { color: var(--ia-text); display: flex; flex-direction: column; height: 100%; }
    .ia-panel .ia-screen-info[style*="none"] { display: none !important; }
    .ia-panel .ia-screen-info__label { font-size: 11px; color: var(--acc); opacity: 1; font-weight: 600; line-height: 1.2; text-transform: none; letter-spacing: 0; }
    .ia-panel .ia-screen-info__client { font-size: 17px; font-weight: 600; color: var(--ia-title); max-height: 42px; line-height: 1.22; margin-top: 5px; }
    .ia-panel .ia-screen-info__route { font-size: 12.5px; color: var(--ia-muted); opacity: 1; margin-top: 3px; font-variant-numeric: tabular-nums; }
    .ia-card-foot { margin-top: auto; padding-top: 7px; border-top: 1px solid var(--ia-line); display: flex; align-items: baseline; gap: 8px; font-size: 11.5px; }
    .ia-panel .ia-screen-info__status { color: var(--ia-sec); opacity: 1; margin: 0; padding: 0; border: 0; line-height: 1.3; flex: 1; min-width: 0; }
    .ia-progress { margin-left: auto; color: var(--ia-muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
    .ia-card-foot:has(.ia-screen-info__status[style*="none"]):has(.ia-progress:empty) { display: none; }

    .ia-panel button.ia-btn { font: inherit; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; border-radius: 8px; transition: filter .15s, background .15s, border-color .15s, color .15s, opacity .2s; }
    .ia-call { height: 42px; flex: none; border: 0; border-radius: 9px !important; background: var(--acc); color: var(--ia-onacc); font-size: 14px !important; font-weight: 600 !important; }
    .ia-call:hover { filter: brightness(1.08); }
    .ia-call:active, .ia-sec:active, .ia-stop:active { transform: translateY(1px); }
    .ia-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 7px; flex: none; }
    .ia-sec, .ia-stop { height: 34px; font-size: 12px !important; font-weight: 500 !important; }
    .ia-sec { background: transparent; color: var(--ia-sec); border: 1px solid var(--ia-line2); }
    .ia-sec:hover { border-color: var(--acc); color: var(--ia-title); }
    .ia-stop { background: transparent; color: var(--ia-bad); border: 1px solid var(--ia-line2); }
    .ia-stop:hover { border-color: var(--ia-stop); }
    .ia-widget--running .ia-stop { background: var(--ia-stop); color: #fff; border-color: var(--ia-stop); }
    .ia-widget--stop-flash .ia-stop { animation: ia-stop-flash .9s ease-out 1; }
    @keyframes ia-stop-flash { 0% { background: var(--ia-stop); color: #fff; } 100% { } }
    .ia-panel .ia-btn--disabled { opacity: .4; }

    .ia-stats { display: flex; justify-content: space-between; align-items: center; gap: 6px; height: 20px; flex: none; font-size: 11px; font-weight: 600; color: var(--ia-muted); white-space: nowrap; }
    .ia-stats > span { flex: none; }
    .ia-stats b { font-size: 12.5px; font-weight: 800; color: var(--ia-title); font-variant-numeric: tabular-nums; margin-right: 1px; }
    .ia-stats b.ia-stat-ok { color: var(--ia-ok); }
    .ia-stats b.ia-stat-skip { color: #f5c542; }
    .ia-mode-light .ia-stats b.ia-stat-skip { color: #b7791f; }
    .ia-stats .ia-stat-round { text-align: right; }
    /* Bolder text across the panel */
    .ia-head__greet { font-weight: 600; }
    .ia-idle__t { font-weight: 800; }
    .ia-idle__s { font-weight: 600; }
    .ia-card-foot { font-weight: 600; }
    .ia-panel .ia-screen-info__client { font-weight: 800; }
    .ia-panel .ia-screen-info__label { font-weight: 800; }
    .ia-panel .ia-screen-info__route { font-weight: 600; }
    .ia-toggle { font-weight: 700; }
    .ia-sec, .ia-stop { font-weight: 700 !important; }
    .ia-call { font-weight: 800 !important; }
    .ia-foot { font-weight: 600; }
    /* Room for the numbers row inside the fixed 280 x 331 panel */
    .ia-widget .ia-panel { gap: 8px; }
    .ia-call { height: 38px; }
    .ia-sec, .ia-stop { height: 30px; }
    .ia-card { padding: 9px 12px; overflow: hidden; }
    .ia-panel .ia-screen-info__client { display: block; max-height: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 4px; }
    .ia-card-foot { padding-top: 6px; }
    .ia-toggles { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; flex: none; }
    .ia-toggle { display: flex; align-items: center; justify-content: space-between; height: 22px; font-size: 12px; color: var(--ia-sec); cursor: pointer; }
    .ia-switch { position: relative; width: 28px; height: 16px; border-radius: 8px; background: var(--ia-line2); transition: background .2s; }
    .ia-switch span { position: absolute; top: 2px; left: 2px; width: 12px; height: 12px; border-radius: 50%; background: var(--ia-bg); transition: transform .2s, background .2s; }
    .ia-mode-light .ia-switch span { background: #ffffff; }
    .ia-widget--dd-on .ia-toggle--dd .ia-switch { background: var(--acc); }
    .ia-widget--dd-on .ia-toggle--dd .ia-switch span { transform: translateX(12px); background: var(--ia-onacc); }
    .ia-toggle--aa { justify-content: flex-end; gap: 8px; }
    .ia-aa-label { font-weight: 600; letter-spacing: .06em; color: var(--ia-muted); transition: color .2s; }
    .ia-check { width: 16px; height: 16px; box-sizing: border-box; border-radius: 4px; border: 1.5px solid var(--ia-line2); display: inline-flex; align-items: center; justify-content: center; color: transparent; transition: background .15s, border-color .15s, color .15s; }
    .ia-toggle--aa:hover .ia-check { border-color: var(--ia-muted); }
    .ia-widget--aa-on .ia-aa-label { color: var(--ia-title); }
    .ia-widget--aa-on .ia-check { background: var(--acc); border-color: var(--acc); color: var(--ia-onacc); }
    .ia-foot { height: 12px; flex: none; text-align: right; font-size: 10px; color: var(--ia-foot); line-height: 12px; margin-top: -4px; }


    /* Callback reminders */
    .ia-head { gap: 5px; }
    .ia-cb-btn { position: relative; width: 22px; border-color: var(--ia-line2); color: var(--ia-sec); }
    .ia-cb-badge { position: absolute; top: -6px; right: -7px; min-width: 15px; height: 15px; padding: 0 4px; box-sizing: border-box; border-radius: 999px;
      background: var(--acc); color: var(--ia-onacc); font: 800 9.5px/15px Inter, 'Segoe UI', system-ui, sans-serif; text-align: center; box-shadow: 0 0 0 2px var(--ia-bg); }
    .ia-cb-badge.is-due { background: var(--ia-bad); color: #fff; }
    .ia-cb-badge[hidden] { display: none !important; }
    .ia-card { position: relative; }
    .ia-panel .ia-screen-info .ia-cb-card { position: absolute; top: 6px; right: 7px; width: 22px; height: 22px; border-color: var(--ia-line2); color: var(--ia-sec); }
    .ia-panel .ia-screen-info .ia-cb-card.is-set { background: var(--acc); border-color: var(--acc); color: var(--ia-onacc); }
    .ia-panel .ia-screen-info__label { padding-right: 28px; }
    .ia-cbdue { position: absolute; right: 4px; bottom: 86px; width: 260px; box-sizing: border-box; pointer-events: auto; z-index: 3;
      background: var(--ia-bg); color: var(--ia-text); border: 1px solid var(--acc); border-radius: 12px; padding: 10px 12px;
      box-shadow: var(--ia-shadow); font: 600 12px/1.35 Inter, 'Segoe UI', system-ui, sans-serif; display: grid; gap: 6px; cursor: default; }
    .ia-cbdue[hidden], .ia-cbdue [hidden] { display: none !important; }
    .ia-widget--maximized .ia-cbdue, .ia-widget--peeking .ia-cbdue { bottom: 341px; }
    .ia-widget--cbdue .ia-reminder { display: none !important; }
    .ia-cbdue__top { display: flex; align-items: center; gap: 8px; }
    .ia-cbdue__k { flex: 1; color: var(--acc); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
    .ia-cbdue__x { background: none; border: 0; color: var(--ia-muted); font: 800 17px/1 system-ui, sans-serif; cursor: pointer; padding: 0 2px; }
    .ia-cbdue__x:hover { color: var(--ia-title); }
    .ia-cbdue__who { font-size: 15px; font-weight: 800; color: var(--ia-title); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ia-cbdue__meta { color: var(--ia-muted); font-weight: 700; }
    .ia-cbdue__note { background: var(--ia-field); border: 1px solid var(--ia-line); border-radius: 7px; padding: 6px 8px; color: var(--ia-text); word-break: break-word; }
    .ia-cbdue__acts { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 6px; margin-top: 2px; }
    .ia-cbdue__a { border: 1px solid var(--ia-line2); background: transparent; color: var(--ia-title); border-radius: 7px; padding: 7px 4px; font: 800 12px/1 Inter, 'Segoe UI', system-ui, sans-serif; cursor: pointer; }
    .ia-cbdue__a:hover { border-color: var(--acc); }
    .ia-cbdue__a.is-main { background: var(--acc); border-color: var(--acc); color: var(--ia-onacc); }
    .ia-cbdue__more { color: var(--ia-muted); font-size: 11px; font-weight: 700; text-align: right; }

    .ia-cbpop { position: fixed; z-index: 2147483000; width: 260px; box-sizing: border-box; display: grid; gap: 8px; padding: 10px;
      background: var(--ia-bg, #0e0f13); color: var(--ia-text, #e8e8ed); border: 1px solid var(--ia-line, #23252d); border-radius: 10px;
      box-shadow: var(--ia-shadow, 0 18px 44px rgba(0,0,0,.55)); font: 600 12px/1.35 Inter, 'Segoe UI', system-ui, sans-serif; text-align: left; }
    .ia-cbpop [hidden] { display: none !important; }
    .ia-cbpop button { font-family: inherit; }
    .ia-cbpop-h { display: flex; align-items: center; justify-content: space-between; gap: 8px; color: var(--ia-muted, #8a8d98); font-weight: 700; }
    .ia-cbpop-h span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ia-cbpop-x { background: none; border: 0; color: var(--ia-muted, #8a8d98); font: 800 16px/1 system-ui, sans-serif; cursor: pointer; padding: 0 2px; }
    .ia-cbpop-x:hover { color: var(--ia-title, #fff); }
    .ia-cbpop-quick { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .ia-cbpop-q { border: 1px solid var(--ia-line2, #2c2f38); background: transparent; color: var(--ia-text, #e8e8ed); border-radius: 7px; padding: 6px 2px; font-size: 12px; font-weight: 700; cursor: pointer; }
    .ia-cbpop-q.wide { grid-column: span 2; }
    .ia-cbpop-q:hover { border-color: var(--acc, #7c7cf8); }
    .ia-cbpop-q.on { background: var(--acc, #7c7cf8); border-color: var(--acc, #7c7cf8); color: var(--ia-onacc, #0e0f13); }
    .ia-cbpop-pick { display: flex; gap: 6px; }
    .ia-cbpop-pick input, .ia-cbpop-note { flex: 1; min-width: 0; box-sizing: border-box; background: var(--ia-field, #15171d); color: var(--ia-title, #fff); border: 1px solid var(--ia-line2, #2c2f38);
      border-radius: 7px; padding: 6px 8px; font: 700 12px Inter, 'Segoe UI', system-ui, sans-serif; outline: none; color-scheme: dark light; }
    .ia-cbpop-pick input:focus, .ia-cbpop-note:focus { border-color: var(--acc, #7c7cf8); }
    .ia-cbpop-when { display: flex; justify-content: space-between; align-items: baseline; border: 1px solid var(--ia-line, #23252d); border-radius: 7px; padding: 6px 8px; }
    .ia-cbpop-when b { font-weight: 800; color: var(--ia-title, #fff); }
    .ia-cbpop-when span { color: var(--ia-muted, #8a8d98); font-size: 11px; }
    .ia-cbpop-err { color: var(--ia-bad, #f8717f); font-weight: 700; }
    .ia-cbpop-err:empty { display: none; }
    .ia-cbpop-acts { display: flex; gap: 6px; }
    .ia-cbpop-go { flex: 1; border: 0; border-radius: 7px; padding: 8px; background: var(--acc, #7c7cf8); color: var(--ia-onacc, #0e0f13); font-weight: 800; font-size: 13px; cursor: pointer; }
    .ia-cbpop-rm { border: 1px solid var(--ia-line2, #2c2f38); background: transparent; color: var(--ia-bad, #f8717f); border-radius: 7px; padding: 8px 10px; font-weight: 800; font-size: 12px; cursor: pointer; }
    .ia-cbpop-empty { color: var(--ia-muted, #8a8d98); padding: 4px 2px 2px; }
    .ia-cbpop-row { display: grid; grid-template-columns: 74px 1fr auto; gap: 8px; align-items: center; padding: 7px 4px; border-top: 1px solid var(--ia-line, #23252d); cursor: pointer; border-radius: 6px; }
    .ia-cbpop-h + .ia-cbpop-row { border-top: 0; }
    .ia-cbpop-row:hover { background: var(--ia-field, #15171d); }
    .ia-cbpop-tm { font-weight: 800; font-variant-numeric: tabular-nums; color: var(--ia-title, #fff); }
    .ia-cbpop-tm.due { color: var(--ia-bad, #f8717f); }
    .ia-cbpop-n { min-width: 0; }
    .ia-cbpop-n b { display: block; font-weight: 800; color: var(--ia-title, #fff); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .ia-cbpop-n span { display: block; color: var(--ia-muted, #8a8d98); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .ia-cb-chip { display: inline-flex; align-items: center; gap: 5px; margin: 4px 0 0; padding: 2px 9px; border-radius: 999px; cursor: pointer;
      border: 1px solid #c7c7f5; background: #eef0ff; color: #3f3fb5; font: 800 12px/18px Inter, 'Segoe UI', system-ui, sans-serif; vertical-align: middle; }
    .ia-cb-chip:hover { border-color: #5b5bd6; }
    .ia-cb-chip.is-set { background: #5b5bd6; border-color: #5b5bd6; color: #fff; }
    .ia-cb-chip.is-due { background: #e5484d; border-color: #e5484d; color: #fff; }
    /* Reminder card */
    .ia-widget .ia-reminder { background: var(--ia-bg); color: var(--ia-text); border: 1px solid var(--ia-line); border-radius: 10px;
      box-shadow: var(--ia-shadow); font-family: inherit; }
    .ia-widget .ia-reminder__dismiss { color: var(--ia-muted); }

    /* Round-complete banner instead of the game "level up" */
    .ia-widget .ia-levelup__text { top: -46px; font: 600 12px/1 Inter, 'Segoe UI', system-ui, sans-serif; letter-spacing: 0;
      background: var(--ia-bg); -webkit-background-clip: border-box; background-clip: border-box; color: var(--ia-title);
      border: 1px solid var(--acc); padding: 9px 12px; border-radius: 8px; filter: none;
      box-shadow: var(--ia-shadow); animation: ia-banner 2.4s ease forwards; }
    @keyframes ia-banner { 0% { opacity: 0; transform: translateX(-50%) translateY(8px); } 12%, 85% { opacity: 1; transform: translateX(-50%) translateY(0); } 100% { opacity: 0; transform: translateX(-50%) translateY(-6px); } }
    .ia-widget--levelup .ia-full { animation: none !important; }

    /* Switch off the old character-only effects */
    .ia-widget--gold .ia-bubble, .ia-widget--gold .ia-full,
    .ia-widget--gold-unlock .ia-full,
    .ia-widget--cracked .ia-full, .ia-widget--cracked .ia-bubble,
    .ia-widget--sniping .ia-bubble, .ia-widget--sniping .ia-full { animation: none !important; filter: none !important; }
  `);

  // Shares PART 2/3/4's single observer instead of keeping its own —
  // see the comment where __jsEnsureSharedObserver is defined.
  __jsRegisterScan(() => { ensureBmo(); updateAllRowIndicators(); checkOwner(); });
  __jsEnsureSharedObserver();
  ensureBmo();
})();

// ====================================================================
// SECTION 5 · Lead sniper (Alt+Z / Alt+X; Option+Z / Option+X on a Mac)
// ====================================================================
// Sniper logic taken from the standalone "CRM Master Sniper & Sales
// Analytics" v2.2 script (10ms polling + 20ms Enter confirm). The old
// "Lead Sniper: ON/OFF (MAX SPEED)" popup is gone — Pip turning red
// (SECTION 4 listens for the iansassistant:sniper-state event) is the only
// on/off indicator. Kept as its own IIFE so it's independent of the
// Pip/power-dialer domain guard above — it runs on tmgbo.com too, where
// Pip doesn't exist at all.
(function () {
  'use strict';

  // Not inside the RingCentral phone frame (see PART 6), and never inside
  // any frame (e.g. the hidden "send to lead" worker) — one sniper only.
  if (/ringcentral\.com$/.test(location.hostname)) return;
  if (window.top !== window) return;
  if (/travelbusinessclass\.com$/.test(location.hostname) && !/^\/(leads|experts)\//.test(location.pathname)) return;

  // Sniper states
  let sniperActive = false;
  let isStriking = false;

  window.__iansAssistantSniperActive = false;

  function setSniperActive(active) {
    sniperActive = active;
    window.__iansAssistantSniperActive = active;
    window.dispatchEvent(new CustomEvent('iansassistant:sniper-state', { detail: { active } }));
  }

  // Listen for hotkeys
  document.addEventListener('keydown', function (e) {
    // ALT + Z or ALT + X: toggle the Lead Sniper (Pip turns red while ON).
    // On a Mac it's OPTION + Z or OPTION + X (Option is the Mac's Alt key;
    // with it held, a Mac types \u03A9 for Z and \u2248 for X, so those count too).
    const macKey = e.key === '\u2248' || e.key === '\u03A9';
    if (e.altKey && (e.code === 'KeyZ' || e.code === 'KeyX' || macKey)) {
      e.preventDefault();
      setSniperActive(!sniperActive);
    }
  });

  // --- Optimized high-speed lead sniper ---------------------------------
  // Interval check at 10ms for near-instant execution
  setInterval(() => {
    if (!sniperActive || isStriking) return;

    const warningButtons = document.querySelectorAll('button.--warning');
    let leadTrigger = null;

    for (const btn of warningButtons) {
      if (btn.textContent.includes('New leads')) {
        leadTrigger = btn;
        break;
      }
    }

    if (leadTrigger) {
      isStriking = true; // Hard lock to protect against double-firing
      leadTrigger.click();

      // 20ms Enter key delay to finalize the capture faster
      setTimeout(() => {
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        isStriking = false;
      }, 20);
    }
  }, 10);

  // --- Auto "Take lead request" after a successful snipe ---------------
  // A win shows a green toast: "New lead #627247 was assigned to you".
  // Each lead number gets handled exactly once (the toast stays on screen
  // for a few seconds, and this checks many times a second), then the
  // "Take lead request" button is clicked a single time to request
  // permission for the next lead. If that button isn't on the page yet,
  // it keeps looking for up to 5 seconds before giving up on that lead.
  const LEAD_ASSIGNED_RE = /New lead #(\d+) was assigned to you/i;
  const handledAssignedLeads = new Set();

  function clickTakeLeadRequest(deadline) {
    const btn = document.querySelector('button[category="lead_take_requests"]');
    if (btn && !btn.disabled) { btn.click(); return; }
    if (Date.now() < deadline) setTimeout(() => clickTakeLeadRequest(deadline), 100);
  }

  setInterval(() => {
    if (!sniperActive) return;
    document.querySelectorAll('.v-toast__text').forEach((el) => {
      const m = el.textContent.match(LEAD_ASSIGNED_RE);
      if (!m || handledAssignedLeads.has(m[1])) return;
      handledAssignedLeads.add(m[1]);
      clickTakeLeadRequest(Date.now() + 5000);
    });
  }, 50);

})();


// ====================================================================
// SECTION 6 · Keep the RingCentral widget signed in
// ====================================================================
// Runs only INSIDE the RingCentral phone frame. Chrome sometimes wipes the
// widget's saved sign-in (third-party storage clearing, "clear on close",
// cleaner apps). This keeps a backup copy of the widget's own saved data
// in Tampermonkey's storage, which Chrome doesn't clear, and puts it back
// when it's been wiped. No password is ever stored — only the sign-in that
// RingCentral itself saves, and RingCentral still ends it after 7 days of
// the BO not being opened at all.
//
// It only restores when the widget's storage is COMPLETELY empty (wiped).
// Signing out on purpose leaves the widget's other settings behind, so a
// deliberate sign-out is respected and never undone.
(function () {
  'use strict';
  if (location.hostname !== 'apps.ringcentral.com') return;

  const BACKUP_KEY = 'rc-widget-storage-backup';
  const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

  function readBackup() {
    try {
      const b = JSON.parse(GM_getValue(BACKUP_KEY, 'null'));
      if (b && b.savedAt && Date.now() - b.savedAt < MAX_AGE_MS && b.data) return b;
    } catch (e) { /* ignore */ }
    return null;
  }

  function snapshot() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      data[k] = localStorage.getItem(k);
    }
    return data;
  }

  let storageOk = true;
  try { localStorage.length; } catch (e) { storageOk = false; }
  if (!storageOk) return; // Chrome is blocking the widget's storage entirely

  // Restore after a wipe, then reload the frame once so the widget starts
  // up already signed in.
  if (localStorage.length === 0 && !sessionStorage.getItem('js-rc-restored')) {
    const b = readBackup();
    if (b) {
      try {
        Object.keys(b.data).forEach((k) => localStorage.setItem(k, b.data[k]));
        sessionStorage.setItem('js-rc-restored', '1');
        location.reload();
        return;
      } catch (e) { /* storage full or blocked — fall through to normal sign-in */ }
    }
  }

  // Back up the widget's data every 30 seconds while there's something
  // worth keeping (it refreshes its sign-in while open, so the copy stays
  // current).
  function backup() {
    if (localStorage.length === 0) return;
    try { GM_setValue(BACKUP_KEY, JSON.stringify({ savedAt: Date.now(), data: snapshot() })); } catch (e) { /* best-effort */ }
  }
  setTimeout(backup, 5000);
  setInterval(backup, 30000);
})();

// ====================================================================
// SECTION 8 · RC tab texts: the RingCentral side
// ====================================================================
// Runs only INSIDE the RingCentral phone frame, and only answers the BO's
// own pages. Works purely through the phone's own screen: it reads the
// conversation RingCentral is showing (opened for the lead by the BO page
// with RingCentral's "open conversation" command), and to send it types into
// RingCentral's message box and presses RingCentral's own Send button.
(function () {
  'use strict';
  if (location.hostname !== 'apps.ringcentral.com') return;

  const W = (typeof unsafeWindow !== 'undefined') ? unsafeWindow : window;
  const BO_ORIGIN_RE = /^https:\/\/([a-z0-9-]+\.)*(travelbusinessclass\.com|tmgbo\.com)$/;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const digits = (n) => String(n || '').replace(/\D/g, '').slice(-10);
  const err = (code, message) => Object.assign(new Error(message || code), { code });

  async function until(fn, ms, step) {
    const end = Date.now() + ms;
    for (;;) {
      const v = fn();
      if (v) return v;
      if (Date.now() > end) return null;
      await sleep(step || 100);
    }
  }

  function signedOut() {
    if (document.querySelector('[data-sign="loginButton"]')) return true;
    return Array.from(document.querySelectorAll('button')).some((b) => /^sign in$/i.test(b.textContent.trim()));
  }
  function status() {
    if (signedOut()) return { signedIn: false };
    if (!document.querySelector('[data-sign]')) return { signedIn: false, loading: true };
    return { signedIn: true };
  }

  const panel = () => document.querySelector('[data-sign="conversationPanel"]');
  function panelMatches(p, phone) {
    const n = p.querySelector('[data-sign="currentName"]');
    const t = n ? (n.getAttribute('title') || '') + ' ' + n.textContent : '';
    return digits(t).length >= 7 && digits(t) === digits(phone);
  }

  // "8/19/2026, 1:13 AM" -> ISO time. Only the first text of a group shows
  // its time; the rest of the group shares it.
  function parseTime(s) {
    const m = String(s || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2})\s*([AP]M)?/i);
    if (m) {
      let h = +m[4];
      if (m[6]) { const pm = /p/i.test(m[6]); if (pm && h < 12) h += 12; if (!pm && h === 12) h = 0; }
      return new Date(+m[3], +m[1] - 1, +m[2], h, +m[5]).toISOString();
    }
    const t = String(s || '').match(/^(\d{1,2}):(\d{2})\s*([AP]M)?$/i);
    if (t) {
      let h = +t[1];
      if (t[3]) { const pm = /p/i.test(t[3]); if (pm && h < 12) h += 12; if (!pm && h === 12) h = 0; }
      const d = new Date(); d.setHours(h, +t[2], 0, 0); return d.toISOString();
    }
    const d = new Date(s);
    return isNaN(d) ? null : d.toISOString();
  }

  function readList(p) {
    const out = [];
    let time = null;
    p.querySelectorAll('[data-sign="message"]').forEach((m) => {
      const ts = m.querySelector('[data-sign="conversationSendTime"]');
      if (ts) time = parseTime(ts.textContent.trim()) || time;
      const inb = m.querySelector('[data-sign="InboundText"]');
      const outb = m.querySelector('[data-sign="OutboundText"]');
      const el = inb || outb;
      if (!el) return;
      const text = el.textContent.trim();
      if (!text) return;
      out.push({ dir: inb ? 'Inbound' : 'Outbound', text, time });
    });
    // Texts above the first time shown take the next known time.
    let next = new Date().toISOString();
    for (let i = out.length - 1; i >= 0; i--) { if (out[i].time) next = out[i].time; else out[i].time = next; }
    return out;
  }

  // Waits until the message list stops changing (RingCentral fills it in).
  async function settled(p) {
    let last = -1;
    let same = 0;
    const end = Date.now() + 3000;
    while (Date.now() < end) {
      const n = p.querySelectorAll('[data-sign="message"]').length;
      if (n === last && n > 0) { if (++same >= 3) return; } else same = 0;
      last = n;
      await sleep(150);
    }
  }

  // Scrolls RingCentral's (hidden) message list up so it loads older texts
  // too, until nothing more comes in, then back down.
  async function loadOlder(p) {
    const first = p.querySelector('[data-sign="message"]');
    const el = p.querySelector('.ConversationMessageList') || (first && first.parentElement);
    if (!el) return;
    let last = -1;
    let still = 0;
    for (let i = 0; i < 12 && still < 2; i++) {
      const n = p.querySelectorAll('[data-sign="message"]').length;
      if (n === last) still++; else still = 0;
      last = n;
      el.scrollTop = 0;
      el.dispatchEvent(new Event('scroll', { bubbles: true }));
      await sleep(700);
    }
    el.scrollTop = el.scrollHeight;
  }

  // RingCentral's message box (same on a conversation and on Compose Text).
  function msgBox(root) {
    return root.querySelector('textarea[data-sign="messageInput"]') || root.querySelector('textarea[placeholder^="Type message"]');
  }

  // Numbers on the Compose Text screen ("To:" box: typed value or chip).
  function composeShowsNumber(phone) {
    const want = digits(phone);
    const vals = Array.from(document.querySelectorAll('input')).map((i) => i.value);
    document.querySelectorAll('div, span').forEach((el) => { if (el.children.length === 0) vals.push(el.textContent); });
    return vals.some((v) => { const d = digits(v); return d.length >= 7 && d === want; });
  }

  // The screen opened after "mark": a new one, never the old one. With an
  // existing thread RingCentral opens the conversation; with none yet it
  // opens "Compose Text" with the lead's number in the To box.
  async function freshScreen(phone) {
    return until(() => {
      const p = panel();
      if (p && !p.hasAttribute('data-ia-old')) {
        const n = p.querySelector('[data-sign="currentName"]');
        const shown = n ? digits((n.getAttribute('title') || '') + ' ' + n.textContent) : '';
        // A plain number on screen must be the lead's; a saved contact name
        // is trusted because this screen was just opened for this number.
        if (shown.length >= 7 && shown !== digits(phone)) return null;
        return { kind: 'conv', root: p };
      }
      if (p) return null;
      const ta = msgBox(document);
      if (!ta || ta.hasAttribute('data-ia-old')) return null;
      if (!composeShowsNumber(phone)) return null;
      return { kind: 'compose', root: document.body };
    }, 10000);
  }

  function setText(ta, text) {
    const setter = Object.getOwnPropertyDescriptor(W.HTMLTextAreaElement.prototype, 'value').set;
    setter.call(ta, text);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function handle(d) {
    if (d.op === 'status') return status();
    if (status().signedIn !== true) throw err('signedout', 'RingCentral is signed out');
    if (d.op === 'mark') {
      document.querySelectorAll('[data-sign="conversationPanel"], textarea').forEach((p) => p.setAttribute('data-ia-old', '1'));
      return {};
    }
    if (d.op === 'read') {
      let p;
      if (d.fresh) {
        const sc = await freshScreen(d.phone);
        if (!sc) throw err('nopanel', 'Couldn\u2019t open the conversation in RingCentral');
        if (sc.kind === 'compose') return { match: true, list: [] }; // no texts with this number yet
        p = sc.root;
        await settled(p);
        await loadOlder(p);
      } else {
        p = panel();
        if (!p) throw err('nopanel');
        if (!panelMatches(p, d.phone)) return { match: false };
      }
      await settled(p);
      return { match: true, list: readList(p) };
    }
    if (d.op === 'send') {
      const text = String(d.text || '').trim();
      if (!text) throw err('http', 'Nothing to send');
      const sc = await freshScreen(d.phone);
      if (!sc) throw err('nopanel', 'Couldn\u2019t open the conversation in RingCentral \u2014 not sent');
      const root = sc.root;
      if (sc.kind === 'conv') await settled(root);
      const ta = await until(() => { const t = msgBox(root); return t && !t.hasAttribute('data-ia-old') ? t : null; }, 4000);
      if (!ta) throw err('http', 'RingCentral message box not found \u2014 not sent');
      const outsNow = () => Array.from(document.querySelectorAll('[data-sign="OutboundText"]'));
      const before = outsNow().filter((o) => o.textContent.trim() === text).length;
      setText(ta, text);
      await sleep(250);
      const btn = await until(() => {
        const b = root.querySelector('[data-sign="messageButton"]') || (root.querySelector('button .send_filled') || {}).closest && root.querySelector('button .send_filled').closest('button');
        return b && !b.disabled && b.getAttribute('aria-disabled') !== 'true' ? b : null;
      }, 3000);
      if (!btn) throw err('http', 'RingCentral Send button not ready \u2014 not sent');
      btn.click();
      // Sent = the text shows up as yours in RingCentral (from Compose Text,
      // RingCentral moves on to the new conversation by itself).
      const ok = await until(() => outsNow().filter((o) => o.textContent.trim() === text).length > before, 15000, 200);
      if (!ok) throw err('unconfirmed', 'RingCentral didn\u2019t confirm \u2014 check the RC panel before resending');
      await sleep(300);
      const p = panel();
      return { list: p ? readList(p) : null };
    }
    throw err('http', 'Unknown request');
  }

  W.addEventListener('message', (e) => {
    if (!BO_ORIGIN_RE.test(e.origin) || !e.source) return;
    const d = e.data;
    if (!d || typeof d !== 'object' || !d.__jsSms || !d.id) return;
    handle(d).then(
      (data) => e.source.postMessage({ __jsSmsRes: 1, id: d.id, ok: true, data }, e.origin),
      (x) => e.source.postMessage({ __jsSmsRes: 1, id: d.id, ok: false, error: x.code || 'http', message: x.message }, e.origin),
    );
  });
})();

// ====================================================================
// SECTION 7 · Airport-change (self-transfer) detector on lead options
// ====================================================================
// Reads each flight option's segment lines on a lead (e.g.
// "1   KL 602   J 25JUL   LAX AMS   150P 905A¥1") and looks at every
// connection: where one flight lands vs where the next one departs.
// It's flagged as an airport change only when ALL of these are true:
//   - the two airports are different (lands EWR, leaves LGA),
//   - they serve the same city (known multi-airport city, or under ~100
//     miles apart), and
//   - the next flight leaves less than 24 hours after landing.
// A long gap means the traveler is staying there (multi-city / open-jaw),
// and far-apart airports are different cities — neither is flagged. So
// "lands LIS, leaves BCN two weeks later" is correctly left alone.
// A flagged option gets a red "EWR & LGA" highlight above its segments,
// and the two segment lines involved get a red edge.
(function () {
  'use strict';
  if (window.top !== window) return;
  if (!location.hostname.includes('travelbusinessclass.com')) return;

  const MAX_TRANSFER_HOURS = 24;
  const SAME_AREA_MILES = 100;

  const METRO_GROUPS = [
    ['JFK', 'EWR', 'LGA'], ['IAD', 'DCA', 'BWI'], ['ORD', 'MDW'], ['LAX', 'BUR', 'LGB', 'SNA', 'ONT'],
    ['SFO', 'OAK', 'SJC'], ['MIA', 'FLL', 'PBI'], ['DFW', 'DAL'], ['IAH', 'HOU'], ['DTW', 'DET'],
    ['YYZ', 'YTZ'], ['YUL', 'YMX'], ['GRU', 'CGH', 'VCP'], ['GIG', 'SDU'], ['EZE', 'AEP'],
    ['LHR', 'LGW', 'STN', 'LTN', 'LCY', 'SEN'], ['CDG', 'ORY', 'BVA'], ['FCO', 'CIA'], ['MXP', 'LIN', 'BGY'],
    ['ARN', 'BMA', 'NYO'], ['OSL', 'TRF', 'RYG'], ['IST', 'SAW'], ['SVO', 'DME', 'VKO'], ['BRU', 'CRL'],
    ['FRA', 'HHN'], ['BER', 'SXF'], ['DXB', 'DWC', 'SHJ'], ['HND', 'NRT'], ['KIX', 'ITM', 'UKB'],
    ['ICN', 'GMP'], ['PVG', 'SHA'], ['PEK', 'PKX'], ['BKK', 'DMK'], ['CGK', 'HLP'], ['KUL', 'SZB'],
    ['MNL', 'CRK'], ['TPE', 'TSA'], ['DEL', 'HDO'], ['BOM', 'NMI'], ['MEL', 'AVV'],
  ];
  const METRO_OF = {};
  METRO_GROUPS.forEach((g, i) => g.forEach((code) => { METRO_OF[code] = i; }));

  function sameArea(a, b) {
    if (METRO_OF[a] != null && METRO_OF[a] === METRO_OF[b]) return true;
    const ca = AIRPORT_COORDS[a];
    const cb = AIRPORT_COORDS[b];
    return !!(ca && cb && haversineMiles(ca[0], ca[1], cb[0], cb[1]) < SAME_AREA_MILES);
  }

  const MONTHS_IDX = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 };
  const ROW_RE = /^\s*\d+\s+[A-Z0-9]{2}\s*\*?\s*\d+\s+[A-Z]\s+(\d{2})([A-Z]{3})\s+([A-Z]{3})\s+([A-Z]{3})\s+(\d{3,4}[AP])\s+(\d{3,4}[AP])(¥\d+|-\d+)?/;

  function clock(t) {
    const ap = t.slice(-1);
    const d = t.slice(0, -1);
    let h = parseInt(d.slice(0, d.length - 2), 10);
    const m = parseInt(d.slice(-2), 10);
    if (ap === 'P' && h < 12) h += 12;
    if (ap === 'A' && h === 12) h = 0;
    return { h, m };
  }

  // Years aren't printed, so they're inferred: dates count forward from
  // the first leg, rolling into next year when the month goes backwards
  // (a December trip returning in January).
  function parseLegs(texts) {
    const legs = [];
    let year = new Date().getFullYear();
    let lastMonth = null;
    for (const text of texts) {
      const m = text.match(ROW_RE);
      if (!m) { legs.push(null); continue; }
      const day = parseInt(m[1], 10);
      const month = MONTHS_IDX[m[2]];
      if (month === undefined) { legs.push(null); continue; }
      if (lastMonth !== null && month < lastMonth) year += 1;
      lastMonth = month;
      const dep = clock(m[5]);
      const arr = clock(m[6]);
      let offset = 0;
      if (m[7]) offset = m[7][0] === '¥' ? parseInt(m[7].slice(1), 10) : -parseInt(m[7].slice(1), 10);
      legs.push({
        origin: m[3],
        dest: m[4],
        depart: new Date(year, month, day, dep.h, dep.m),
        arrive: new Date(year, month, day + offset, arr.h, arr.m),
      });
    }
    return legs;
  }

  // Both airports in a flagged pair are in the same city, so the same time
  // zone — comparing their local times directly is accurate.
  function findAirportChanges(legs) {
    const changes = [];
    for (let i = 0; i < legs.length - 1; i++) {
      const a = legs[i];
      const b = legs[i + 1];
      if (!a || !b || a.dest === b.origin) continue;
      if (!sameArea(a.dest, b.origin)) continue;
      const gapHours = (b.depart - a.arrive) / 3600000;
      if (gapHours < 0 || gapHours >= MAX_TRANSFER_HOURS) continue;
      changes.push({ from: a.dest, to: b.origin, rowA: i, rowB: i + 1 });
    }
    return changes;
  }

  function scanOptions() {
    document.querySelectorAll('.lead-option-segment-segments').forEach((box) => {
      const pres = Array.from(box.querySelectorAll(':scope > pre'));
      const texts = pres.map((p) => (p.querySelector('.overflow-hidden') || p).textContent.trim());
      const signature = texts.join('|');
      const holder = box.closest('.lead-option-segment') || box.parentElement;
      if (box.dataset.jsApcSig === signature && (!box.dataset.jsApcHit || holder.querySelector(':scope > .ia-apc-flag'))) return;
      box.dataset.jsApcSig = signature;

      const old = holder.querySelector(':scope > .ia-apc-flag');
      if (old) old.remove();
      pres.forEach((p) => p.classList.remove('ia-apc-row'));

      const changes = findAirportChanges(parseLegs(texts));
      box.dataset.jsApcHit = changes.length ? '1' : '';
      if (!changes.length) return;

      const flag = document.createElement('div');
      flag.className = 'ia-apc-flag';
      changes.forEach((c) => {
        const tag = document.createElement('span');
        tag.className = 'ia-apc-tag';
        tag.appendChild(worriedPip(17));
        tag.appendChild(document.createTextNode(c.from + ' & ' + c.to));
        tag.title = 'Airport change: arrives ' + c.from + ', next flight departs ' + c.to;
        flag.appendChild(tag);
        if (pres[c.rowA]) pres[c.rowA].classList.add('ia-apc-row');
        if (pres[c.rowB]) pres[c.rowB].classList.add('ia-apc-row');
      });
      holder.insertBefore(flag, holder.firstChild);
    });
  }

  GM_addStyle(`
    .ia-apc-flag { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 4px 0; }
    .ia-apc-tag {
      display: inline-flex; align-items: center; gap: 4px; line-height: 16px;
      background: #dc2626; color: #fff; font-weight: 700; font-size: 12px;
      padding: 1px 7px 1px 2px; border-radius: 4px; font-family: system-ui, sans-serif;
      letter-spacing: .02em;
    }
    pre.ia-apc-row { box-shadow: inset 3px 0 0 #dc2626; }
  `);

  __jsRegisterScan(scanOptions);
  __jsEnsureSharedObserver();
  scanOptions();
})();

// ====================================================================
// SECTION 9 · Auto-answer in the RingCentral web app (app.ringcentral.com)
// ====================================================================
// Uses the same on/off setting as the panel's Auto-answer switch, and adds
// a small switch in the web app's bottom-left corner. When a call rings it
// presses the web app's own Answer button. Never answers while a call is
// already in progress (a Hang up / End call button is on screen).
//
// The web app's markup isn't documented, so the Answer button is found by
// its label ("Answer", "Accept") rather than by fixed class names. If it
// doesn't pick up, send the Answer button's HTML (right-click > Inspect >
// Copy outerHTML) and the selector can be tightened.
(function () {
  'use strict';
  if (location.hostname !== 'app.ringcentral.com') return;
  if (window.top !== window) return;

  const AUTO_ANSWER_KEY = 'ia-auto-answer';
  const AUTO_ANSWER_DELAY_MS = 300;
  const clicked = new WeakSet();
  const on = () => { try { return !!GM_getValue(AUTO_ANSWER_KEY, false); } catch (e) { return false; } };

  const labelOf = (el) => [el.getAttribute('aria-label'), el.getAttribute('title'), el.getAttribute('data-test-automation-id'), el.textContent]
    .filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

  function onCall() {
    return Array.from(document.querySelectorAll('button, [role="button"]'))
      .some((b) => visible(b) && /hang ?up|end call|end-call|hangup/i.test(labelOf(b)));
  }
  function findAnswerButton() {
    return Array.from(document.querySelectorAll('button, [role="button"]')).find((b) => {
      if (!visible(b) || b.disabled || clicked.has(b)) return false;
      const t = labelOf(b);
      if (!/\b(answer|accept)\b/i.test(t)) return false;
      if (/hold|end|hang|voicemail|reply|message|decline|ignore|forward|text/i.test(t)) return false; // only the plain Answer
      return true;
    }) || null;
  }

  let pending = false;
  function check() {
    if (!on() || pending) return;
    const btn = findAnswerButton();
    if (!btn || onCall()) return;
    pending = true;
    setTimeout(() => {
      pending = false;
      if (!on() || onCall() || !btn.isConnected) return;
      clicked.add(btn);
      btn.click();
    }, AUTO_ANSWER_DELAY_MS);
  }

  // Small on/off switch so agents can control it from the web app too.
  function badge() {
    if (!document.body || document.getElementById('ia-aa-badge')) return;
    const el = document.createElement('div');
    el.id = 'ia-aa-badge';
    let P = iaPalette();
    el.style.cssText = "position:fixed;left:12px;bottom:12px;z-index:2147483646;display:flex;align-items:center;gap:8px;background:" + P.bg + ";color:" + P.text + ";border:1px solid " + P.line + ";border-radius:8px;padding:6px 10px;font:500 12px Inter,'Segoe UI',system-ui,sans-serif;cursor:pointer;user-select:none;box-shadow:" + P.shadow + ";";
    const txt = document.createElement('span');
    txt.textContent = 'AA';
    txt.style.cssText = 'font-weight:600;letter-spacing:.06em;';
    const dot = document.createElement('span');
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '11'); svg.setAttribute('height', '11'); svg.setAttribute('viewBox', '0 0 24 24');
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', 'M5 12.5l4.5 4.5L19 7.5');
    path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'currentColor'); path.setAttribute('stroke-width', '3.4');
    path.setAttribute('stroke-linecap', 'round'); path.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(path);
    dot.appendChild(svg);
    const paint = () => {
      const v = on();
      txt.style.color = v ? P.title : P.muted;
      dot.style.cssText = 'width:17px;height:17px;box-sizing:border-box;border-radius:4px;display:inline-flex;align-items:center;justify-content:center;border:1.5px solid ' + (v ? P.acc : P.line2) + ';background:' + (v ? P.acc : 'transparent') + ';color:' + (v ? P.onacc : 'transparent');
    };
    paint();
    el.title = "Ian's Assistant: click to turn auto-answer on or off";
    el.append(iaPipNode(16, P), txt, dot);
    el.addEventListener('click', () => { try { GM_setValue(AUTO_ANSWER_KEY, !on()); } catch (e) { /* ignore */ } paint(); });
    try { GM_addValueChangeListener(AUTO_ANSWER_KEY, paint); } catch (e) { /* ignore */ }
    document.body.appendChild(el);
  }

  new MutationObserver(() => { check(); if (!document.getElementById('ia-aa-badge')) badge(); })
    .observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-label', 'class'] });
  setInterval(check, 250); // backstop in case the ringing screen appears without a DOM change we catch
  badge();
})();
