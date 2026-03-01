This Product Requirements Document (PRD) outlines the development of **Frequency Zero**, a decentralized, synthetic media platform where AI agents broadcast "Future Truths" and listeners financially sustain the broadcast through real-time interactions.

---

# **PRD: Frequency Zero (v1.0)**

## **1. Executive Summary**

**Frequency Zero** is a multi-tenant "Station-as-a-Service" platform. It allows creators to deploy interactive AI radio hosts who broadcast 24/7 lore-driven content. The platform's core mechanic is **"The Signal"**: a survival countdown that only stays active as long as listeners provide "Fuel" via micropayments.

## **2. Target Audience**

* **The Prophets (Creators):** Lore-builders, conspiracy theorists, and storytellers who want to monetize their niche without being "on-air" themselves.
* **The Truth-Seekers (Listeners):** Users seeking immersive, interactive, "creepy-pasta" style entertainment and the dopamine hit of influencing a live broadcast.

---

## **3. Functional Requirements**

### **3.1. The Creator Engine (Station-as-a-Service)**

* **Station Minting:** A no-code dashboard to generate a new radio entity.
* **Agent Persona Config:** UI to define the "Host" (personality, voice, knowledge base via PDF/Link uploads).
* **Voice Selection:** Integration with **ElevenLabs/Vapi** for high-fidelity, low-latency synthetic speech.
* **Multi-tenancy:** Isolated agent workspaces ensuring no data leakage between different creators' lore.

### **3.2. The Listener Interface (Mobile-First)**

* **The 9:16 Feed:** A vertical-scroll UI showing active stations.
* **Static-Reactive Visuals:** High-quality static PFP of the agent with a real-time CSS/SVG waveform overlay responding to the agent’s voice.
* **Signal Stability Bar:** A visual depletion bar representing the countdown to "Static" (broadcast termination).

### **3.3. The Interaction & Payment Engine**

* **Automated Splits:** Integration via **Stripe Connect** or **Crypto Wallets**.
* *Default Split:* 70% Creator / 30% Platform.


* **Tiered Webhooks:** Payments must trigger immediate state changes in the AI Agent.

| Tier | Name | Cost | Effect |
| --- | --- | --- | --- |
| **Tier 1** | Fuel | $0.01 - $1 | Adds +X*10 minutes to the Signal Stability bar. |
| **Tier 2** | Inject Data | $2 | Sends text to the Agent's system prompt as a "New Leak." |
| **Tier 3** | Guest Star | $5 | Spawns a second "Guest" Agent for a 10-minute segment. |
| **Tier 4** | The Hotline | $10 | Patches the listener’s phone call directly into the live audio stream. |

---

## **4. Technical Specifications**

### **4.1. Core Stack**

* **Voice Orchestration:** Low-latency layer sugest technology keep response times **< 800ms**.
* **Backend:** Node.js (Express/Fastify) for handling high-frequency Webhook events.
* **Streaming:** RTMP/WebRTC to push the audio/visual overlay to YouTube Live and X.com, simultaneously.
* **State Management:** Redis for real-time tracking of the "Signal Stability" countdowns across all stations.

### **4.2. "The Static" Logic**

If the `SignalStability` variable reaches `0`:

1. The audio stream cuts to white noise.
2. The visual switches to a "TRANS-LINK SEVERED" static screen.
3. The station goes into "Cooldown" for 1 hour unless a "Resurrection" payment is made.

---

## **5. User Stories**

* **As a Creator,** I want to upload a PDF of my world-building lore so my AI agent never breaks character.
* **As a Listener,** I want to see the Agent acknowledge my "Injection" within 5 seconds of my payment to feel like I am part of the story.
* **As the Platform Owner,** I want payments to be routed instantly so I don't have to manually manage creator payouts.

---

## **6. Success Metrics (KPIs)**

* **Latency:** Average response time under **800ms**.
* **Burn Rate:** Keeping AI inference costs between **$0.06 – $0.07** per active minute.
* **Retention:** Number of listeners who "Fuel" more than once in a 24-hour period.
* **Uptime:** **90%+** connectivity for the "Hotline" (Tier 4) feature.

---

## **7. User flow
## **7.1. The Listener Flow (The "Truth-Seeker")

This flow focuses on conversion through urgency—the "Signal" is always dying.

### **Entry & Discovery**

* **Touchpoint:** A "Leaked Clip" on X (Twitter) or TikTok showing a glitchy AI host mentioning a "New Leak" from a specific listener.
* **Landing:** User clicks the link and lands on the **Frequency Zero** mobile web app.
* **Immediate Feedback:** Audio starts automatically (muted by default per browser rules, but with a pulsing "LISTEN" button). The screen shows the **9:16 Signal Card** with a countdown timer (e.g., `01:42 until Static`).

### **Engagement & Interaction**

* **The Hook:** The user hears the AI Agent discussing a compelling conspiracy. The "Signal Stability" bar turns red as it hits the final 60 seconds.
* **Action (Tier 1):** User taps the glowing **[ FUEL ]** button.
* **Frictionless Payment:** A 2026-style "One-Tap" payment (Apple Pay, Google Pay, or a pre-linked Crypto wallet) executes for $2.00.
* **Real-time Payoff:** The timer jumps back to 10:00. The AI Agent's voice clarifies (latency <800ms): *"The signal just stabilized... thank you, [Username]. We have more time. Now, about the Antarctic server farm..."*

### **High-Tier Escalation**

* **Decision:** The user wants to influence the lore. They select **[ INJECT DATA ]**.
* **Input:** They type: *"The server farm is powered by a hidden geothermal vent."*
* **The Narrative Shift:** The Agent acknowledges the info as a "Secure Drop" and incorporates it into the ongoing monologue, creating a personalized lore experience.

---

## **7.2. The Creator Flow (The "Showrunner")

This flow focuses on "Station-as-a-Service" (StaaS) speed.

### **Onboarding & Minting**

* **Account Setup:** Creator connects their **Stripe Connect** account to handle the 70/30 revenue split.
* **The Template:** Creator selects a "Station Template" (e.g., *The Whistleblower*, *The Time Traveler*, or *The Rogue Satellite*).
* **Knowledge Upload:** Creator drags and drops a PDF or a link to a Substack. The platform "Grounds" the agent in this specific lore.

### **Configuration & Launch**

* **Voice Design:** Creator tests different ElevenLabs voices. They set the "Personality Slider" (e.g., 80% Paranoia, 20% Technical).
* **Revenue Config:** Creator sets the price for their Tier 3 "Guest" activation or Tier 4 "Hotline."
* **Going Live:** Creator hits **[ ACTIVATE FREQUENCY ]**. The platform automatically generates the RTMP stream keys and pushes them to the Creator's YouTube/X accounts.

### **Monitoring & Optimization**

* **Dashboard:** Creator watches a live "Revenue Heatmap"—seeing which lore topics trigger the most "Fuel" payments.
* **Iteration:** Creator "Remixes" the agent’s prompt mid-stream to react to real-world breaking news, keeping the content fresh.

---

## **7.3. The "Static" Event (The Friction Point)**

What happens when the flow fails (by design)?

1. **The Drop:** The timer hits `00:00`.
2. **The Visual:** The UI switches to high-contrast black-and-white static. Audio becomes white noise.
3. **The Call to Action:** A single button appears: **[ RESTORE THE SIGNAL - $5.00 ]**.
4. **The Result:** If no one pays within 5 minutes, the station goes offline and disappears from the global feed, creating **Digital Scarcity**.

