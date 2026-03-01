# Demo Project PRD: Frequency Zero

---

## 1. One-Sentence Problem

> Creators lose thousands in potential revenue every time they go offline, yet existing platforms lack the agentic tools and real-time micropayment infrastructure to turn a creator's absence into a high-stakes, interactive infinite broadcasts.

---

## 2. Demo Goal (What Success Looks Like)

**What must work:**
- The home page shows various "stations" (AI agents) with their current "Signal Stability" countdowns sorted by popularity (most listeners).
- A listener chooses a single AI radio station broadcasting live with a synthetic voice host
- The "Signal Stability" countdown depleting in real-time
- Once the countdown reaches 0, the broadcast ends with a "Static" event (white noise + offline message "signal lost")
- A listener making a "Fuel" 0.1 USD payment that visibly extends the countdown by 5 mins
- A listener making a "Inject" 1 USD payment that gives new leaked information to the agent 
- A listener making a "Call" 10 USD payment that allows the user to speak live on the broadcast for 1 minute like a clasic radio phone call.
- A listener making a "Claim" 10 USD payment that lets the user claim a piece of the las 30 secs of lore as their own, which the agent then acknowledges in the broadcast and the user can share that piece on their social media.
- The AI agent acknowledging the payment for each category within <1 second latency

**Outcome the demo must communicate:**
- Listeners can directly sustain a broadcast through micropayments
- The payment → acknowledgment loop creates immediate, tangible feedback

**Non-Goals (out of scope for demo):**
- Production-grade payment infrastructure (Stripe Connect splits)
- Simultaneous streaming to YouTube/X

---

## 3. Target User (Role-Based)

**Primary User: The Listener ("Truth-Seeker")**

| Attribute | Description |
|-----------|-------------|
| Role | Mobile-first consumer seeking interactive, immersive audio entertainment |
| Skill Level | Low technical skill; expects one-tap payment flows |
| Key Constraint | Attention—must be hooked within 30 seconds or will scroll away |

---

## 4. Core Use Case (Happy Path)

**Start condition:** Listener lands on mobile web app; audio streams are live with Signal Stability between 2:00 to 5:00 mins.

**Flow:**
1. Listener scrolls through the 9:16 feed of active stations cards that show their show image, show title, show description, Signal Stability, their current listener count, and a pulsing waveform overlay.
2. Listener taps "LISTEN" on a card to unmute; hears AI host mid-broadcast.
3. Signal Stability bar turns red as it approaches 1:00
4. Listener taps the  **[ FUEL ]** button tha has a red battery icon and a label that says "Fuel" with the price ($1.00) to add 5 mins to the livestream.
5. One-tap payment modal appears ($1 USD default) use link mock pay or show qr code for crypto pay (payment is mocked for demo) and user writes down its name.
6. Listener confirms payment (mocked for demo)
7. Signal Stability bar jumps to plus 5:00 mins.
8. AI host audibly acknowledges: *"The signal just stabilized... thank you, [Username]."*

**End condition:** Listener has extended the broadcast and received real-time acknowledgment.

### 4.1. Tier 2 Use Case


**Start condition:** Listener is unmuted and actively listening to a station with a specific lore topic in progress.

**Flow:**
1. Listener taps the [ INJECT INFO ] button featuring a "syringe" icon.
2. An input field appears: "Enter a new leak or secret data (max 100 characters)."
3. Listener types a lore-specific detail (e.g., "The vault is in the basement") and submits.
4. One-tap payment modal appears for $1.00 USD.
5. Listener confirms payment.
6. A "Data Uploading" glitch animation overlays the station card for 3 seconds.
7. AI host stops mid-sentence, triggered by the webhook: "Wait... a secure drop just hit the frequency. [Username] claims the vault isn't empty—it’s in the basement. This changes everything."

**End condition:** Listener has successfully influenced the live narrative through a paid data injection.


### 4.2. **Tier 3 Use case: Call the Station**

**Start condition:** Station is live; listener wants to speak directly to the AI Agent on-air.

**Flow:**

1. Listener taps the **[ CALL ]** button featuring a "telephone" icon and the price ($10.00 USD).
2. A warning prompt appears: "You are about to go live on-air for 1 minute."
3. Listener confirms the **$10.00 USD** payment.
4. Browser requests microphone permission; listener grants access.
5. The AI Host announces: *"We have a caller on the line. [Username], you're on the air. What do you have for us?"*
6. Listener speaks via browser mic; the AI Agent responds in real-time with <800ms latency, creating a live interview.
7. At 0:50, a "Signal Fading" beep sounds; at 1:00, the call is gracefully terminated by the Host.

**End condition:** Listener has participated in a live voice interview with the AI Agent, broadcasted to all other listeners.

### 4.3. **Tier 4 Use case: Claim the Lore**

**Start condition:** Station is live; listener wants to claim ownership of a memorable lore moment.

**Flow:**

1. Listener taps the **[ CLAIM ]** button featuring a "flag/stamp" icon and the price ($10.00 USD).
2. A preview modal appears showing the last 30 seconds of audio transcript with a waveform visualization.
3. Listener confirms the **$10.00 USD** payment.
4. System captures the 30-second audio clip + transcript and mints it as a shareable "Lore Fragment."
5. A "Claimed" badge animation overlays the station card.
6. The AI Host announces: *"[Username] has claimed this moment. This fragment of truth now belongs to them."*
7. Listener receives a shareable card (image + audio link) with their username, timestamp, and the lore excerpt.
8. Share buttons appear for X (Twitter), Instagram Stories, and copy-link.

**End condition:** Listener owns a shareable lore fragment and can post it to social media.

## 5. Functional Decisions (What It Must Do)

| ID | Function | Notes |
|----|----------|-------|
| F1 | Stream live AI-generated audio | Pre-configured agent persona |
| F2 | Display real-time Signal Stability countdown | Visual depletion bar, updates every second |
| F3 | Accept payments | Mocked one-tap payment; no real money for demo |
| F4 | Extend countdown on payment | Any FUEL payment adds fixed 5 minutes to timer |
| F5 | Trigger AI acknowledgment on payment for extend the life of the signal | Agent speaks listener's username within 1s |
| F6 | Visual waveform overlay | CSS/SVG reacting to audio amplitude |
| F7 | Inject new information on payment | Listener's injected data is added to the AI's knowledge base |
| F8 | Trigger AI acknowledgment on payment for new information | Agent thanks listener by name within 1s |
| F9 | Accept user call participation on payment | User speaks via browser WebRTC for 1 minute with the agent host |
| F10 | Capture lore fragment on Claim payment | System captures last 30 seconds of audio + transcript |
| F11 | Generate shareable lore card | Creates image/audio card with username, timestamp, lore excerpt |
| F12 | Trigger AI acknowledgment on Claim | Agent announces the claim within 1s |
---

## 6. UX Decisions (What the Experience Is Like)

### 6.1 Entry Point

- First screen: 4 cards representing different AI radio stations, sorted by current listener count. Each card shows:
  - Station image (AI host)
  - Station title and brief description
  - Real-time "Signal Stability" countdown (e.g., `02:35 until Static`)
  - Current listener count
  - Pulsing waveform overlay to indicate live audio
  - Prominent "LISTEN" button to unmute and join the broadcast.
- Radio live show: Full-bleed 9:16 Signal Card with AI host image, waveform, and countdown timer

### 6.2 Inputs

| Input | Source |
|-------|--------|
| Payment action | Tap on [ FUEL, INJECT, CALL, CLAIM ] button |
| Username | Updated on first payment or mocked as "Anonymous" |
| Browser microphone | WebRTC for CALL feature |

### 6.3 Outputs

| Output | Form |
|--------|------|
| AI audio stream | Continuous ai generated speech |
| Signal Stability bar | Real-time depleting/refilling gauge | It is red when under 1 min, yellow when between 1-3 mins, and green when above 3 mins.
| Payment confirmation | Toast notification + audible AI acknowledgment |

### 6.4 Feedback & States

| State | Visual/Audio Feedback |
|-------|----------------------|
| Loading | Skeleton card with pulsing waveform placeholder |
| Stable (>3 min) | Green Signal bar, calm ambient waveform |
| Warning (1-3 min) | Yellow Signal bar, pulsing urgency overlay |
| Critical (<1 min) | Red Signal bar, flashing border, AI tone shifts to urgent |
| Fueled | Timer jumps; green flash; AI speaks thanks |

### 6.5 Errors (Minimum Viable Handling)

| Scenario | Response |
|----------|----------|
| Payment fails | Toast: "Signal boost failed. Try again." Timer unaffected. |
| Audio stream disconnects | Static visual + "Reconnecting..." message; auto-retry. |
| User does nothing | Countdown continues; at 0:00 triggers "Static" event (white noise + offline message). |

---

## 7. Data & Logic (At a Glance)

### 7.1 Inputs

| Data | Source |
|------|--------|
| Agent persona/voice using eleven labs API | Static config (pre-loaded for demo) |
| Knowledge base | Static PDF/text (pre-ingested) |
| Signal Stability state | Redis (or in-memory for demo) |
| Payment event | Mocked API call |
| Username | Session or hardcoded "Anonymous" |
| User microphone audio | Browser WebRTC (for CALL feature) |
| Last 30s audio buffer | Rolling buffer in memory (for CLAIM feature) |

### 7.2 Processing

```
[Listener taps FUEL] 
   → Payment webhook fires 
   → Backend increments SignalStability by 5 minutes (fixed) 
   → Backend sends "acknowledge" event to AI voice layer 
   → AI generates real-time thank-you speech 
   → Audio stream injects acknowledgment
```

```
[Listener taps INJEST] 
   → Payment webhook fires 
   → Backend modifies agent information state with new data.
   → Backend sends "acknowledge" event to AI voice layer 
   → AI generates real-time thank-you speech 
   → Audio stream injects acknowledgment
```
```
[Listener taps CALL] 
   → Payment webhook fires 
   → Browser requests mic permission via WebRTC
   → User audio mixed into broadcast stream
   → AI agent responds in real-time (<800ms)
   → At 1:00, call gracefully terminated
```

```
[Listener taps CLAIM] 
   → Payment webhook fires 
   → Backend captures last 30s audio buffer + transcript
   → System generates shareable card (image + audio URL)
   → Backend sends "claim acknowledge" event to AI voice layer
   → AI announces the claim
   → Share modal presented to user
```

### 7.3 Outputs

| Output | Destination |
|--------|-------------|
| Audio stream | Browser via WebRTC/HLS |
| Signal state updates | UI via WebSocket |
| Payment logs | Console only (demo) |
| Shareable lore card | Generated image + audio URL (for CLAIM) |

---

## Assumptions (Labeled)

1. **Voice latency achievable** — Assumes ElevenLabs can produce <800ms response; demo may use pre-recorded fallback if needed.
2. **Mocked payments** — No real payment processor; UI simulates success flow.
4. **Desktop fallback** — Mobile-first, but basic desktop view acceptable.

---

*This PRD is ready for a builder to implement a demo without guessing.*
