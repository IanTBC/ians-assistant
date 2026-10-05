# Ian's Assistant

A Chrome toolkit for TBC agents: one-click Sabre *IA/VI* copy from flight sites, CRM shortcuts, a power dialer and RingCentral texting.

**Full guide with pictures:** https://iantbc.github.io/ians-assistant/

[![Install Ian's Assistant](https://img.shields.io/badge/Install-Ian's%20Assistant-7c7cf8?style=for-the-badge)](https://raw.githubusercontent.com/IanTBC/ians-assistant/main/IansAssistant.user.js)

**Install link:** https://raw.githubusercontent.com/IanTBC/ians-assistant/main/IansAssistant.user.js

---

## Install (one time, on your computer)

1. Install the **Tampermonkey** extension in Chrome from the Chrome Web Store.
2. Remove any older copy of this tool or a similar one from the Tampermonkey dashboard first, otherwise you'll see doubled buttons.
3. Click the **Install** button above. Tampermonkey opens its install page — click **Install**.
4. If nothing happens: open `chrome://extensions`, click **Details** on Tampermonkey, and turn on **Allow user scripts**. Then click the install link again.
5. Open a lead in the BO. The assistant appears in the bottom-right corner and greets you by name.

## Updates

Updates install by themselves. When a new version is out you'll also see a small **"Ian's Assistant x.x is available"** banner — click **Update** to get it right away.

To check by hand: Tampermonkey icon → **Dashboard** → **Check for userscript updates**.

## What it does

**Flight sites** (ITA Matrix, Google Flights, Kayak, CheapOair, FlyBasis, PointsYeah, AwardLogic)
- The small Pip button next to each result opens a menu:
  - **GDS** copies the option in Sabre *IA/VI* format.
  - **Lead ID** — type a 6-digit lead number and the option (segments and price, or miles and taxes) is added to that lead in the BO for you.

**In the BO**
- **Sort Me** puts pasted segments in the right order and picks the carrier; **Auto-next** moves through the Add option steps.
- **Merge** combines selected options into one, each as its own ticket.
- Click a **Sell** price to edit it in place.
- Search buttons for the lead (Google, ELR, Matrix, PointsYeah, Basis, Kayak).
- A red tag warns when an option changes airports during a connection.
- Click the lead number under the client's name to copy it.
- Warns before sending a quote that shows $0.00.

**Calling and texting**
- **Call** dials the next lead; the dialer keeps going after each call until you press **Stop**.
- Each lead gets a dot by its ID: green called, yellow skipped, red called in round 2.
- **Double-dial** redials an unanswered lead once. **Redial** calls the last number again.
- The RC tab shows your RingCentral texts and lets you send them, with editable follow-up templates.

**Lead sniper** — press **Alt+Z** (or Alt+X) to turn it on or off. The assistant turns red while it's on.

**Look** — the header buttons switch between **Dark, Light and Navy** and change the accent colour. Your choice is saved.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Nothing appears | Make sure Tampermonkey is on and **Allow user scripts** is enabled (step 4). Refresh the page. |
| Buttons show twice | An old version is still installed — remove it in the Tampermonkey dashboard. |
| Calls don't dial | Your computer's default phone app must be the RingCentral app. |

---

© Ian Brown
