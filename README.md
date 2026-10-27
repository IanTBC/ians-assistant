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

Updates install by themselves. Within a few minutes of a new version coming out you'll also see a small **"Ian's Assistant x.x is available"** banner — click **Update** to get it right away.

To check by hand: Tampermonkey icon → **Dashboard** → **Check for userscript updates**.

## What it does

**Flight sites** (ITA Matrix, Google Flights, Kayak, CheapOair, FlyBasis, PointsYeah, AwardLogic)
- The small Pip button next to each result opens a menu:
  - **GDS** copies the option in Sabre *IA/VI* format.
  - **Lead ID** — type a 6-digit lead number and the option (segments and price, or miles and taxes) is added to that lead in the BO for you.
  - **Sell** — fills in the sell price as Net + 10%, rounded to end in 88–92. Type your own price, or untick it to leave $0.00.

**In the BO**
- **Sort Me** puts pasted segments in the right order and picks the carrier; **Auto-next** moves through the Add option steps.
- **Merge** combines selected options into one, each as its own ticket.
- Click a **Sell** price to edit it in place.
- Search buttons for the lead (Google, ELR, Matrix, PointsYeah, Basis, Kayak). Links open in a new tab behind the BO, so you stay on the lead. **FS** sends the lead's Sabre search straight to the terminal. **Basis** opens a search box where you pick the class and the dates, with one airport on each side and ±1 day. **Open all** opens every site you tick in its ▾ menu, **Both** opens both legs of PointsYeah (Ctrl+click to pick legs one by one), and **↻** re-reads the lead.
- A red tag warns when an option changes airports during a connection.
- Click the lead number under the client's name to copy it.
- Warns before sending a quote that shows $0.00.
- **Call icons** next to every phone number call it in one click; right-click picks the RingCentral Windows app or website.
- **Card** on an option makes a clean picture of it (flights, times, connections and price) to paste into a text or chat for your client.

**Calling and texting**
- **Call** dials the next lead; the dialer keeps going after each call until you press **Stop**.
- Each lead gets a dot by its ID: green called, yellow skipped, red called in round 2. Right-click a dot to skip calling that lead.
- The panel shows today's calls, answered, skipped and round.
- **Double-dial** redials an unanswered lead once. **Redial** calls the last number again.
- **Night-time protection** — the dialer skips clients where it's 10 pm–8 am their time; calling one yourself asks first. A call that passes 3½ minutes stops auto-dialing.
- **Disclaimers** — the button next to the clock inside a lead opens the disclaimers and scripts page, filled in for the lead (click any text to copy). **Tools** next to it opens VIP Itinerary, GK Converter and How to make a PNR.
- **Callback reminders** — tap the clock next to a lead's number (or on the panel) to set a callback. When it's due, Pip pops up with the lead: **Open lead**, **+15 min** or **Done**. The clock at the top of the panel lists them all. Times are Egypt time.
- The RC tab shows your RingCentral texts and lets you send them to any country's number, with editable follow-up templates. Sent follow-ups turn green and show when they went out.

**Look** — the header buttons switch between **Dark, Light and Navy** and change the accent colour. Your choice is saved.

## What's new

**2.9.0 — tidy-up**
- Behind-the-scenes tidy-up. Everything works as before.

**2.8.0 — pick the class in Basis**
- The **Basis** box inside a lead now lets you choose the class (Business, Premium, First or Economy) and change the dates before you search. It always searches ±1 day around each date.

**2.7.0 — skip a lead, sent times and safer saving**
- Right-click the dot by a lead's ID and choose **Skip calling this lead**. The dialer then passes over it until you turn it off the same way. The dot gets a line through it.
- In the RC tab, follow-ups you've sent now turn green and say when they went out, for example **Sent 2 hrs ago**. Your sent follow-ups are kept for good.
- Your follow-up progress is backed up every day. If it ever goes missing, it comes back by itself.
- Departure and destination are now read correctly even if you've moved the columns around in your leads list.

**2.6.0 — lead tools and filled-in disclaimers**
- Inside every lead, a new **Tools** button next to Disclaimers opens **VIP Itinerary**, **GK Converter** and **How to make a PNR**, each in a new tab. VIP Itinerary already has the client's name filled in.
- The Disclaimers page now has a **Fill in for this lead** box at the top: client name, your direct number, the taxes amount, the award program and the fake-return city and date. The texts fill in as you type, so you copy a finished text. Your number is remembered.
- **Basis** now searches one airport on each side, always with ±1 day. To change an airport, click its box and type the new code.

**2.5.0 — disclaimers, Fast Search and safer dialing**
- A new **Disclaimers** button inside every lead, next to the clock, opens the disclaimers and scripts page. Click any text there to copy it.
- **FS** in the lead's search box sends the lead's Sabre search (JR) straight to the terminal. If the terminal isn't open, it opens it for you.
- Night-time protection: the dialer skips clients where it's between 10 pm and 8 am their time and comes back to them in the daytime. Calling one yourself asks first.
- While auto-dialing, a call that passes 3½ minutes stops the run by itself, so you're never moved on mid-conversation.
- Matrix on one-way leads: a new option searches Business out with an Economy return 90 days later, which can price lower.
- Merge now also fills each passenger's commission value.
- Copying flights from Kayak works again after Kayak changed its pages.

**2.4.0 — panel tidy-up**
- The small tick box next to Double-dial has been removed from the panel. Everything else works as before.

**2.2.0 — call icons**
- A small phone icon now sits next to every phone number. Click it to show the number and call it. Right-click it to choose where calls go: the RingCentral Windows app (as before) or the RingCentral website.
- Inside a lead there's a Call now button, and clicking the number gives you Call now or Copy number.
- After a call ends, the next lead shows right away with a countdown, so you can Skip or Call. Redials always go to the lead you just called.
- Sending an option to a lead is steadier: it's never added twice. Basis detail pages now remember the number of passengers.

**2.1.0 — quote card**
- New Card button on every option: turns it into a clean picture with the flights, times, connections and price, ready to paste into a text or chat for your client.
- Change the client name, price, note or your name before copying. Nothing is sent for you.

**2.0.0 — new look**
- A fresh frosted-glass look for the assistant, the flight-site pop-up, the search buttons and the callback reminders, in Dark, Light and Navy.
- Today's numbers are now easy-to-read tiles, and the buttons are rounder and bolder. Everything works exactly the same.

**1.9.0 — callback reminders**
- Set a callback on any lead with the clock button next to the lead number, or on the panel while you dial. Pick 30 minutes, 1, 2 or 4 hours, tomorrow at 10:00, or your own time, and add a short note.
- When it's time, Pip pops up with the client, route and your note. Open the lead, push it back 15 minutes, or mark it done.
- The clock at the top of the panel shows how many callbacks you have; tap it to see them all. All times are Egypt time.

**1.8.0 — Basis search**
- Basis now opens a search box: up to 3 airports on each side, with dates you can change and a range from fixed dates to ±7 days. Search the outbound, the return, or both.
- Every Basis search, including Open all, now uses the date range you pick.

**1.7.2 — faster updates**
- New versions now show up within a few minutes of being released, instead of up to half an hour. Later hides the banner for an hour.

**1.7.1 — fix**
- The numbers on the panel no longer run into each other, and the panel's text is bolder and easier to read.

**1.7.0 — today's numbers**
- Today's numbers on the panel: calls made, answered, skipped and which round you're on. They start fresh every day at 2pm GMT.

**1.6.0 — search panel**
- Search links open in a new tab behind the BO, so you stay on the lead.
- Basis and PointsYeah: Both opens both legs at once, and Ctrl+click opens one leg while keeping the menu open for the next.
- The search panel has a fresh look that follows your Dark, Light or Navy mode.

**1.5.0 — new features**
- Set the sell price while adding an option from a flight site. Net + 10% is filled in for you, or type your own.
- Open all now opens the sites you tick: Google, ELR, Matrix, PointsYeah, Basis and Kayak. Plus a refresh button and new cabin and date pickers.
- Texting works with phone numbers from any country and on leads with no earlier messages. The message box grows as you type.
- A GDS copy with missing flight details is stopped instead of copied.
- Better reading of PointsYeah and FlyBasis detail pages.
- The $0.00 check now catches both quote email designs.

**1.4.1 — first release**
- Pip, your assistant, in the BO and on flight sites.
- Dark, Light and Navy modes, plus accent colours.
- Your place in the call list ("Lead 4 of 23") on the panel.
- Updates install automatically from this page.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Nothing appears | Make sure Tampermonkey is on and **Allow user scripts** is enabled (step 4). Refresh the page. |
| Buttons show twice | An old version is still installed — remove it in the Tampermonkey dashboard. |
| Calls don't dial | Your computer's default phone app must be the RingCentral app. |

---

© Ian Brown
