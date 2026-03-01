# UX Specification: Frequency Zero

---

## Pass 1: Mental Model

**Primary user intent:** "I want to listen to a fake radio conspiracy and interactive, and feel like I can influence what happens."

**Likely misconceptions:**

1. **"This is a normal podcast"** — Users may expect passive consumption and be confused when the stream dies without payments
2. **"My payment is a tip/donation"** — Users may not understand payments have *immediate mechanical effects* (extending time, injecting data)
3. **"The countdown is fake urgency"** — Users may not believe the broadcast actually ends at 0:00 until they see it happen
4. **"I need an account to listen"** — Users may expect login walls before audio access
5. **"Call means text chat"** — Users may not realize CALL is literal voice on-air

**UX principle to reinforce/correct:**
- **Cause and effect must be visceral and immediate.** Every payment must produce visible + audible change within 1 second. The Signal Stability bar is the heartbeat of the experience—it must feel alive and reactive.
- **No walls before the hook.** Audio plays first; payment comes after engagement.

---

## Pass 2: Information Architecture

**All user-visible concepts:**

- Station (AI radio channel)
- Station image (host avatar)
- Station title
- Station description
- Signal Stability (countdown timer)
- Listener count
- Waveform visualization
- FUEL action ($0.1, +5 min)
- INJECT action ($1.00, add lore data)
- CALL action ($10.00, 1 min live voice)
- CLAIM action ($10.00, capture lore fragment)
- Username
- Payment modal
- Lore Fragment (shareable card)
- Static event (broadcast death)
- Toast notifications
- AI acknowledgment (audible response)

**Grouped structure:**

### Station Discovery (Home Feed)
| Concept | Priority | Rationale |
|---------|----------|-----------|
| Station cards | Primary | Entry point; must be immediately scannable |
| Station image | Primary | Visual identity, first hook |
| Station title | Primary | Quick identification |
| Signal Stability | Primary | Creates urgency, key differentiator |
| Listener count | Secondary | Social proof, but not core mechanic |
| Station description | Secondary | Only needed if user hesitates |
| Waveform overlay | Secondary | Indicates "live" but decorative |

### Active Listening (Station View)
| Concept | Priority | Rationale |
|---------|----------|-----------|
| Signal Stability bar | Primary | The survival mechanic—always visible |
| Audio stream | Primary | Core experience |
| Action buttons (FUEL/INJECT/CALL/CLAIM) | Primary | Monetization + interaction |
| Waveform visualization | Secondary | Ambiance, reinforces "live" |
| Station image | Secondary | Already seen; now background |
| Listener count | Secondary | Less relevant once engaged |

### Payment Flow
| Concept | Priority | Rationale |
|---------|----------|-----------|
| Action button | Primary | Clear affordance |
| Payment modal | Primary | One-tap completion |
| Username input | Primary | Required for personalized acknowledgment |
| Price display | Primary | No surprises |
| Confirmation feedback | Primary | Must be instant |

### Claim Experience
| Concept | Priority | Rationale |
|---------|----------|-----------|
| Claim preview modal | Primary | User must see what they're buying |
| Lore Fragment card | Primary | The deliverable |
| Share buttons | Primary | Core value = social sharing |
| AI acknowledgment | Primary | Validates the purchase |

---

## Pass 3: Affordances

| Action | Visual/Interaction Signal |
|--------|---------------------------|
| **Listen to station** | "LISTEN" button on card; card itself is tappable |
| **Mute/unmute** | Tap anywhere on 9:16 view toggles audio state |
| **Fuel the signal** | Red battery icon + "FUEL" label + price; glowing/pulsing when critical |
| **Inject data** | Syringe icon + "INJECT" label + price; text input appears on tap |
| **Call the host** | Telephone icon + "CALL" label + price; warning modal confirms intent |
| **Claim lore** | Flag/stamp icon + "CLAIM" label + price; preview modal shows transcript |
| **Share lore fragment** | Platform icons (X, Instagram, link) on share card |
| **Dismiss modals** | X button or tap outside; standard mobile patterns |
| **Scroll feed** | Vertical swipe; cards snap to 9:16 viewport |

**Affordance rules:**
- If it has an icon + label + price, it's a payment action
- If it's glowing/pulsing, it's urgent or recommended
- If the Signal bar is red, the FUEL button should pulse
- Read-only information (countdown, listener count) has no interactive styling
- Buttons are pill-shaped with clear tap targets (min 44px)
- The countdown timer is NOT tappable (common misconception)

---

## Pass 4: Cognitive Load

**Friction points:**

| Moment | Type | Simplification |
|--------|------|----------------|
| Choosing a station | Choice | Sort by Signal Stability (most urgent first) or listener count; no filtering needed for demo |
| First payment | Uncertainty | Pre-fill username as "Anonymous"; one-tap payment; no account required |
| Understanding FUEL effect | Uncertainty | Show "+5:00" preview on button; animate timer jump immediately |
| Writing INJECT data | Choice + Uncertainty | Provide placeholder example: "e.g., 'A plane transporting money crashed...'"; 100 char limit visible |
| Deciding to CALL | Uncertainty + Fear | Warning modal explains exactly what happens; countdown shows 1:00 duration |
| Understanding CLAIM value | Uncertainty | Preview shows exact transcript they're buying; show share mockup |
| Multiple action buttons | Choice | Visual hierarchy: FUEL largest (most common), others secondary |
| When to act | Uncertainty | Color-coded Signal bar creates urgency without explicit "act now" text |

**Defaults introduced:**

| Default | Rationale |
|---------|-----------|
| Username = "Anonymous" | Removes friction; most users won't personalize |
| FUEL amount = $0.10 | Low default encourages trial; slider for more |
| INJECT new information text prompt | Guides user on what to contribute; reduces blank page anxiety |
| CALL starts immediately after payment, show left interaction time | No "ready?" confirmation; warning was enough |
| CLAIM preview auto-plays last 30s audio | User hears what they're buying |

---

## Pass 5: State Design

### Home Feed (Station Discovery)

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Empty | "No stations live" message + illustration | Nothing is broadcasting right now | Wait or check back later |
| Loading | 4 skeleton cards with pulsing waveforms | Feed is loading | Wait (brief) |
| Success | 4 station cards with live data | Stations are available to join | Tap any card to listen |
| Partial | 2-3 cards + "More stations coming soon" | Some content available | Browse available stations |
| Error | "Can't load stations" + retry button | Network/server issue | Tap retry |

### Station Card (Feed Item)

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Stable (>3 min) | Green Signal bar, calm waveform | Station is healthy | Listen casually |
| Warning (1-3 min) | Yellow Signal bar, pulsing overlay | Station needs help soon | Listen, consider FUEL |
| Critical (<1 min) | Red Signal bar, flashing border | Station dying, act now | FUEL urgently |
| Static (0:00) | Black & white static, "SIGNAL LOST" | Broadcast ended | Cannot interact; find another station |

### Active Station View (9:16 Full Screen)

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Loading | Skeleton with connecting animation | Joining stream | Wait |
| Live - Stable | Host image, green bar, waveform reacting to audio | Everything working | Listen, interact when ready |
| Live - Critical | Red bar, urgent waveform, FUEL button pulsing | Needs immediate help | FUEL, or watch it die |
| In Call | "ON AIR" badge, caller waveform overlay | Someone is talking to host | Listen; cannot CALL (queued) |
| Static Event | Full-screen static, white noise audio, "SIGNAL LOST" overlay | Broadcast is dead | Return to feed or wait for resurrection |

### Payment Modal

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Open | Price, username field, one-tap buttons (Apple Pay, etc.) | Ready to pay | Enter username, tap payment method |
| Processing | Spinner on payment button | Payment in progress | Wait |
| Success | Modal closes, toast "Payment received!", audio acknowledgment | It worked | Continue listening |
| Error | Toast "Payment failed. Try again." | Something went wrong | Tap button again |

### INJECT Flow

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Input | Text field with placeholder | Type your secret | Type, submit |
| Uploading | "Data uploading" glitch animation (3s) | System processing | Wait, watch the cool effect |
| Acknowledged | AI speaks the injection, toast confirms | My data is now part of the lore | Continue listening |

### CALL Flow

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Warning | Modal: "You're about to go live. 1 minute." | This is serious | Confirm or cancel |
| Connecting | "Connecting to frequency..." + mic permission prompt | Getting ready | Grant mic access |
| On Air | "ON AIR" badge, 1:00 countdown, your waveform shown | I'm live | Speak |
| Fading (0:10) | Beep sounds, countdown flashing | Time's almost up | Wrap up |
| Ended | Toast "Call ended", AI thanks you | Done | Resume listening |

### CLAIM Flow

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Preview | Modal with last 30s transcript + waveform + audio preview | This is what I'm claiming | Play preview, confirm, or cancel |
| Processing | "Minting your lore fragment..." | System creating asset | Wait |
| Complete | Shareable card with image, audio, transcript, share buttons | I own this | Share to X, IG, copy link |
| Shared | Toast "Shared to X!" or "Link copied!" | Action complete | Dismiss, continue listening |

---

## Pass 6: Flow Integrity

**Flow risks:**

| Risk | Where | Mitigation |
|------|-------|------------|
| User doesn't understand Signal Stability | First station view | Tooltip on first visit: "Fuel keeps the signal alive" |
| User expects free listening indefinitely | Any station | Let them experience a Static event once—it teaches the mechanic |
| CALL mic permission denied | CALL flow | Graceful fallback: "Enable mic to go on air" + settings link; refund if not granted |
| INJECT data is inappropriate | INJECT flow | Disclaimer: "Content is public and AI-moderated" (demo: just let it through) |
| User taps CLAIM but doesn't understand value | CLAIM preview | Preview modal auto-plays audio; shows share mockup |
| Multiple users CALL simultaneously | CALL flow | Queue system: "You're #2 in line" (or for demo: lock button while someone is on air) |
| User doesn't notice AI acknowledgment | After any payment | Toast notification + visual flash + audio acknowledgment triple-reinforcement |
| User leaves before Static event | Passive listening | Push notification (if enabled): "[Station] is dying! 30 seconds left" (out of scope for demo) |

**Visibility decisions:**

**Must be visible (always):**
- Signal Stability countdown (the core mechanic)
- Current station title/host
- All 4 action buttons (FUEL, INJECT, CALL, CLAIM)
- Waveform (indicates "live")
- Listener count (shown on info tap)

**Can be implied or progressive:**
- Payment history (not shown in demo)
- Detailed station description (only on tap)

**UX constraints for visual phase:**
- **9:16 mobile-first viewport** — all core interactions must fit in thumb reach zone
- **One-handed operation** — action buttons in bottom third of screen
- **No scroll required for core actions** — FUEL/INJECT/CALL/CLAIM always visible
- **High contrast Signal bar** — must be readable in bright sunlight
- **Audio-first design** — audio starts before any visual complexity loads
- **3-second rule** — if a state lasts >3 seconds without feedback, something is wrong

---

## Visual Specifications

### Aesthetic Direction: "Military Leak Terminal"

**Core Concept:** A classified government frequency interceptor interface. Think leaked NSA listening station software meets dark web whistleblower portal. The UI feels like you're accessing something you shouldn't—raw, functional, slightly unstable.

**Style Pillars:**

1. **HUD / Sci-Fi FUI**
   - Thin 1px lines, beveled corners (not rounded)
   - Monospace everything—data feels like intercepted transmissions
   - Coordinate-style metadata: `FREQ: 104.9 // STATUS: DEGRADING // LAT: -82.8628`
   - Bracketed labels: `[ FUEL ]` `[ INJECT ]` `< BACK`
   - Grid overlays and scan lines suggest surveillance equipment

2. **Chromatic Aberration (State-Driven)**
   - **Stable (>3 min):** Sharp, clean UI. No aberration. System nominal.
   - **Warning (1-3 min):** Subtle RGB split (1-2px offset). Signal degrading.
   - **Critical (<1 min):** Heavy chromatic aberration (3-5px), scanline flicker, CRT noise. System failing.
   - **Static Event:** Full RGB tear, horizontal displacement, white noise wash.

3. **Cyberpunk: Black + Emerald/Orange**
   - Primary palette: Deep black + Emerald Green (stable) + High-Vis Orange (warning/critical)
   - Avoid pink/blue neon clichés
   - "Military leak" feel: utilitarian, not decorative
   - Glow effects are functional (status indicators), not aesthetic flourishes

---

### Design Tokens

**Colors — Primary Palette:**
| Token | Value | Usage |
|-------|-------|-------|
| `black-void` | #050505 | True black background |
| `black-surface` | #0D0D0D | Card/panel backgrounds |
| `black-elevated` | #141414 | Elevated surfaces, modals |
| `grid-line` | #1A1A1A | Grid overlay, dividers |
| `text-primary` | #E8E8E8 | Primary text (slightly warm white) |
| `text-secondary` | #6B6B6B | Secondary text, labels |
| `text-data` | #00FF88 | Data readouts, coordinates |

**Colors — Signal Status:**
| Token | Value | Usage |
|-------|-------|-------|
| `signal-stable` | #00FF88 | Emerald green — system nominal |
| `signal-warning` | #FF6B00 | High-vis orange — degrading |
| `signal-critical` | #FF2D2D | Alert red — failing |
| `signal-dead` | #333333 | Grey — offline/static |

**Colors — Action Accents:**
| Token | Value | Usage |
|-------|-------|-------|
| `accent-fuel` | #FF6B00 | FUEL — orange (inject energy) |
| `accent-inject` | #00FF88 | INJECT — green (data upload) |
| `accent-call` | #00BFFF | CALL — cyan (transmission) |
| `accent-claim` | #FFD700 | CLAIM — gold (ownership/trophy) |

**Colors — Chromatic Aberration Layers:**
| Token | Value | Usage |
|-------|-------|-------|
| `chroma-red` | #FF0040 | Red channel offset |
| `chroma-green` | #00FF88 | Green channel (base) |
| `chroma-blue` | #0080FF | Blue channel offset |

**Typography:**
| Token | Value | Usage |
|-------|-------|-------|
| `font-mono` | 'JetBrains Mono', 'Roboto Mono', monospace | ALL text — full commitment to terminal aesthetic |
| `text-xl` | 20px / 1.3 | Station titles, headers |
| `text-lg` | 16px / 1.4 | Button labels, primary data |
| `text-base` | 14px / 1.5 | Body text, descriptions |
| `text-sm` | 12px / 1.4 | Metadata, coordinates |
| `text-xs` | 10px / 1.3 | Micro labels, system status |

**Text Treatments:**
- Uppercase for labels and status: `STATUS: NOMINAL`
- Bracketed actions: `[ FUEL ]` `[ INJECT ]`
- Coordinate format: `FREQ: 104.9 // SIGNAL: 87%`
- Timestamps: `2026.03.01 // 23:42:17 UTC`

**Spacing:**
| Token | Value |
|-------|-------|
| `space-xs` | 4px |
| `space-sm` | 8px |
| `space-md` | 16px |
| `space-lg` | 24px |
| `space-xl` | 32px |
| `grid-unit` | 8px | Base grid for all layouts |

**Borders & Lines:**
| Token | Value |
|-------|-------|
| `border-thin` | 1px solid |
| `border-glow` | 1px solid + 0 0 8px blur |
| `corner-cut` | 4px clip-path (beveled corners, not rounded) |
| `corner-sharp` | 0px (sharp corners for data panels) |

**Radii — AVOID rounded corners. Use beveled/clipped:**
```css
/* Beveled corner clip-path */
.panel {
  clip-path: polygon(
    0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px,
    100% calc(100% - 4px), calc(100% - 4px) 100%,
    4px 100%, 0 calc(100% - 4px)
  );
}
```

---

### Screen: Home Feed

**Layout:**
- Full viewport height (100vh)
- Vertical scroll, snap to 9:16 card boundaries
- Each card fills entire viewport
- Safe area padding for notch/home indicator

**Station Card (9:16):**
```
┌─────────────────────────────┐
│                             │
│      [Station Image]        │  ← 100% - Artwork, background of card
│      (Show Topic Visual)    │
│                             │
├─────────────────────────────┤
│  ▓▓▓▓▓▓▓▓▓░░░░░  02:35      │  ← Signal Stability bar + countdown
├─────────────────────────────┤
│  ● LIVE  👥 142 listeners   │  ← Badge row
├─────────────────────────────┤
│  The Midnight Protocol      │  ← Station title (text-xl)
│  Whistleblower AI revealing │  ← Description (text-sm, 2 lines max)
│  classified anomalies...    │
├─────────────────────────────┤
│  [Waveform Visualization]   │  ← Animated, responds to audio
├─────────────────────────────┤
│       [ 🎧 LISTEN ]         │  ← Primary CTA (pill button, 56px height)
└─────────────────────────────┘
```

**Signal Stability Bar (HUD Style):**
- Height: 6px
- Background: `grid-line` with 1px tick marks every 10%
- Fill: Solid color based on status (`signal-stable` → `signal-warning` → `signal-critical`)
- Border: 1px `signal-stable` (changes color with status)
- Countdown: Monospace, right-aligned, coordinate format: `SIG: 02:35 // 78%`
- Chromatic aberration: Increases as time decreases
  - Stable: None
  - Warning: 1px RGB offset on bar edges
  - Critical: 3px RGB split + flicker

**Station Card HUD Overlay:**
```
┌─ FREQ: 104.9 ─────────────────────┐
│ STATUS: NOMINAL                    │
│ LISTENERS: 142 // UPTIME: 04:22:17│
└────────────────────────────────────┘
```

---

### Screen: Active Station View

**Layout:**
```
┌─────────────────────────────┐
│ ← Back          👥 142      │  ← Header (transparent over image)
├─────────────────────────────┤
│  The Midnight Protocol      │  ← Title
│  ▓▓▓▓▓▓▓░░░░░░░  01:42      │  ← Signal bar (larger, 12px)
├─────────────────────────────┤
│                             │
│      [Station Image]        │  ← Top 50% - slightly dimmed, background
│                             │
├─────────────────────────────┤
│  [Large Waveform]           │  ← Reactive visualization
├─────────────────────────────┤
│                             │
│  [🔋 FUEL]     $0.10        │  ← Action button row 1
│  [💉 INJECT]    $1.00       │  ← Action button row 2
│  [📞 CALL]     $10.10       │  ← Action button row 3
│  [🏴 CLAIM]    $10.00       │  ← Action button row 4
│                             │
└─────────────────────────────┘
```

**Action Buttons (Terminal Style):**
- Size: Full width, 56px height (stacked vertical list)
- Border: 1px solid accent color
- Clip-path: Beveled corners (4px cut)
- Layout: `[ ICON ] LABEL .............. $PRICE`
- Background: `black-surface` default, accent color at 10% on hover
- Text: Uppercase, monospace, `text-lg`
- Dot leaders connect label to price (terminal receipt style)

**Button Format Example:**
```
┌─────────────────────────────────────┐
│ [ ⚡ ] FUEL ................. $0.10 │
│       +05:00 TO SIGNAL              │
├─────────────────────────────────────┤
│ [ ◉ ] INJECT ............... $1.00 │
│       UPLOAD SECRET DATA            │
├─────────────────────────────────────┤
│ [ ☎ ] CALL ................ $10.00 │
│       PATCH INTO BROADCAST          │
├─────────────────────────────────────┤
│ [ ⚑ ] CLAIM ............... $10.00 │
│       CAPTURE LAST 30S              │
└─────────────────────────────────────┘
```

**Critical State Modifications (Chromatic Aberration):**
- FUEL button: Orange glow pulse + 2px chromatic split
- Signal bar: RGB tear effect, horizontal displacement
- Background: Scanline overlay (semi-transparent), subtle CRT curve
- All text: 1-3px RGB offset based on severity
- Screen edges: Vignette darkening + chromatic fringe

**State-Driven Visual Degradation:**
| State | Chromatic Aberration | Scanlines | Noise | Glow |
|-------|---------------------|-----------|-------|------|
| Stable | None | None | None | Subtle green on status |
| Warning | 1-2px RGB split | 10% opacity | None | Orange pulse on FUEL |
| Critical | 3-5px RGB tear | 30% opacity + flicker | 5% static | Heavy red pulse |
| Static | Full displacement | 80% + rolling | 40% white noise | None (dead) |

---

### Component: Payment Modal (Terminal Interface)

**Layout:**
```
╔═══════════════════════════════════════╗
║ TRANSACTION // FUEL                   ║
║ ══════════════════════════════════════║
║                                       ║
║ ACTION: SIGNAL BOOST                  ║
║ EFFECT: +05:00 STABILITY              ║
║ COST:   $0.10 USD                     ║
║                                       ║
║ ──────────────────────────────────────║
║ IDENTIFIER:                           ║
║ ┌───────────────────────────────────┐ ║
║ │ ANONYMOUS_                        │ ║
║ └───────────────────────────────────┘ ║
║                                       ║
║ ══════════════════════════════════════║
║ [ CONFIRM // $0.10 ]    [ < ABORT ]   ║
╚═══════════════════════════════════════╝
```

**Styling:**
- Modal: Bottom sheet, 50% viewport height
- Border: 1px `signal-stable` (green glow)
- Background: `black-elevated` with subtle grid pattern
- Backdrop: 80% `black-void` with scanline overlay
- Animation: Glitch-in effect (horizontal displacement → settle)
- Close: `< ABORT` button or tap backdrop
- Input field: Blinking cursor, green text on black
- Confirm button: Full accent color, uppercase, beveled corners

---

### Component: INJECT Input (Secure Terminal)

**Appears inline below INJECT button:**
```
╔═══════════════════════════════════════╗
║ > SECURE DROP INTERFACE               ║
║ ══════════════════════════════════════║
║                                       ║
║ ENTER CLASSIFIED DATA:                ║
║ ┌───────────────────────────────────┐ ║
║ │ The vault is located beneath_    │ ║
║ └───────────────────────────────────┘ ║
║ CHARS: 078/100 // ENCRYPTION: AES-256 ║
║                                       ║
║ [ < ABORT ]         [ UPLOAD // $1 ]  ║
╚═══════════════════════════════════════╝
```

**Upload Animation (Full Glitch Sequence):**
- Duration: 3 seconds
- Phase 1 (0-1s): Screen flickers, horizontal RGB tear
- Phase 2 (1-2s): Data stream visualization (falling green characters)
- Phase 3 (2-3s): "INJECTION CONFIRMED" with checksum display
- Text sequence:
  ```
  > ESTABLISHING SECURE CHANNEL...
  > ENCRYPTING PAYLOAD...
  > INJECTING TO BROADCAST STREAM...
  > INJECTION CONFIRMED // HASH: 7f3a9c2b
  ```
- Scanlines: 50% opacity during upload
- Chromatic aberration: Heavy during upload, resolves on confirm

---

### Component: CALL Warning Modal (Transmission Alert)

```
╔═══════════════════════════════════════╗
║ ⚠ LIVE TRANSMISSION WARNING ⚠         ║
║ ══════════════════════════════════════║
║                                       ║
║ YOU ARE ABOUT TO PATCH INTO           ║
║ LIVE BROADCAST FREQUENCY              ║
║                                       ║
║ DURATION: 01:00                       ║
║ COST:     $10.00 USD                  ║
║                                       ║
║ ──────────────────────────────────────║
║ REQUIREMENTS:                         ║
║ • MICROPHONE ACCESS REQUIRED          ║
║ • CONTENT SUBJECT TO MONITORING       ║
║ • BROADCAST IS LIVE AND IRREVERSIBLE  ║
║                                       ║
║ [ < ABORT ]      [ CONFIRM // PATCH ] ║
╚═══════════════════════════════════════╝
```

**On-Air State (Full HUD Overlay):**
```
┌─────────────────────────────────────────┐
│ ◉ LIVE // PATCHED INTO FREQ: 104.9     │
│ ════════════════════════════════════════│
│ CALLER: @username                       │
│ DURATION: 00:47 / 01:00                 │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░ 78%  │
│                                         │
│ [ YOUR AUDIO WAVEFORM VISUALIZATION ]   │
│ ════════════════════════════════════════│
│ TRANSMISSION ACTIVE // DO NOT ABORT     │
└─────────────────────────────────────────┘
```

- "◉ LIVE" indicator: Pulsing red with cyan chromatic offset
- Progress bar: Depleting orange → red
- At 00:10: Flashing border, beep tone, text: `⚠ SIGNAL FADING`
- At 00:00: `TRANSMISSION TERMINATED` with glitch-out effect

---

### Component: CLAIM Preview Modal

```
┌─────────────────────────────┐
│         🏴 CLAIM LORE       │
├─────────────────────────────┤
│  Last 30 seconds:           │
│  ┌───────────────────────┐  │
│  │ "...the coordinates   │  │
│  │ match the Antarctic   │  │
│  │ research station.     │  │
│  │ Someone knew..."      │  │  ← Transcript preview
│  └───────────────────────┘  │
│  [▶ Play Preview]           │  ← Audio preview button
├─────────────────────────────┤
│  This will be yours:        │
│  ┌───────────────────────┐  │
│  │ [Lore Card Preview]   │  │  ← Shareable card mockup
│  │  "Antarctic Station"  │  │
│  │   @username  •  now   │  │
│  └───────────────────────┘  │
├─────────────────────────────┤
│ [Cancel]  [Claim - $10]     │
└─────────────────────────────┘
```

---

### Component: Lore Fragment Card (Shareable — Classified Document Style)

**Dimensions:** 1080×1080 (Instagram) or 1200×628 (Twitter)

**Visual Style:** Declassified document aesthetic with redaction marks and scan artifacts

```
╔═══════════════════════════════════════════════════════╗
║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ║
║                   FREQUENCY ZERO                      ║
║            INTERCEPTED TRANSMISSION                   ║
║ ══════════════════════════════════════════════════════║
║                                                       ║
║  TRANSCRIPT // FREQ: 104.9                            ║
║  ────────────────────────────────────────────────     ║
║                                                       ║
║  "The coordinates match the Antarctic research        ║
║   station. Someone knew about this before the         ║
║   signal went dark. The ████████ files confirm        ║
║   what we feared..."                                  ║
║                                                       ║
║ ══════════════════════════════════════════════════════║
║  CLAIMED BY: @username                                ║
║  STATION:    THE MIDNIGHT PROTOCOL                    ║
║  TIMESTAMP:  2026.03.01 // 23:42:17 UTC               ║
║  HASH:       7f3a9c2b4e...                            ║
║ ══════════════════════════════════════════════════════║
║  [ ▶ LISTEN TO INTERCEPTED AUDIO ]                    ║
╚═══════════════════════════════════════════════════════╝
```

**Card Effects:**
- Subtle paper texture overlay
- Faint grid lines (graph paper feel)
- Redaction blocks using `▓▓▓` characters (randomized)
- Scan artifacts: slight rotation (0.5°), edge shadows
- QR code in corner linking to audio
- Stamp effect: "DECLASSIFIED" or "PROPERTY OF @username" watermark

**Share Modal:**
```
╔═══════════════════════════════════════╗
║ LORE FRAGMENT CAPTURED                ║
║ ══════════════════════════════════════║
║                                       ║
║  [ Card Preview with Glitch Effect ]  ║
║                                       ║
║ ──────────────────────────────────────║
║ DISTRIBUTE:                           ║
║ [ 𝕏 ] POST TO X .................. → ║
║ [ ◐ ] INSTAGRAM STORY ............ → ║
║ [ ⧉ ] COPY LINK .................. → ║
║ [ ↓ ] DOWNLOAD ASSET ............. → ║
║                                       ║
╚═══════════════════════════════════════╝
```

---

### Component: Toast Notifications (System Alerts)

**Position:** Top center, below safe area
**Size:** Auto-width, max 90%, padding `space-md`
**Border:** 1px solid status color
**Animation:** Glitch-in (horizontal displacement → settle), auto-dismiss after 3s

**Format:**
```
┌─────────────────────────────────────────┐
│ ✓ TRANSACTION CONFIRMED // +05:00 SIG  │
└─────────────────────────────────────────┘
```

**Variants:**
| Type | Border | Text Color | Icon |
|------|--------|------------|------|
| Success | `signal-stable` | `signal-stable` | ✓ |
| Error | `signal-critical` | `signal-critical` | ✗ |
| Warning | `signal-warning` | `signal-warning` | ⚠ |
| Info | `text-secondary` | `text-primary` | ▸ |

**Text Style:** Uppercase monospace, coordinate format
- Success: `✓ FUEL RECEIVED // SIG +05:00`
- Error: `✗ TRANSACTION FAILED // RETRY`
- Warning: `⚠ SIGNAL DEGRADING // FUEL REQUIRED`

---

### Animation Specifications

**Core Animations:**
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Signal bar depletion | Width decrease + color shift | 1s tick | linear |
| Signal bar refill | Width increase + green flash | 300ms | ease-out |
| FUEL button pulse | Glow shadow + chromatic flicker | 1s loop | ease-in-out |
| Modal open | Glitch-in (H-displacement → settle) | 400ms | custom bezier |
| Modal close | Glitch-out (settle → H-displacement) | 250ms | ease-in |
| Waveform | Amplitude react to audio | 60fps | - |
| Static event | Full RGB tear + noise flood | 500ms | ease-in |
| Glitch effect (INJECT) | Scanlines + data stream + flicker | 3s | custom |
| Toast | Glitch-in, glitch-out | 300ms in, 200ms out | custom |

**Chromatic Aberration Animation (CSS):**
```css
/* Applied to all UI elements, intensity based on signal status */
.chromatic-aberration {
  position: relative;
}

.chromatic-aberration::before,
.chromatic-aberration::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Red channel - offset left */
.chromatic-aberration::before {
  color: #FF0040;
  mix-blend-mode: screen;
  transform: translateX(calc(var(--aberration-intensity) * -1px));
  animation: chromatic-flicker 0.1s infinite;
}

/* Blue channel - offset right */
.chromatic-aberration::after {
  color: #0080FF;
  mix-blend-mode: screen;
  transform: translateX(calc(var(--aberration-intensity) * 1px));
  animation: chromatic-flicker 0.1s infinite reverse;
}

/* Intensity levels */
.state-stable { --aberration-intensity: 0; }
.state-warning { --aberration-intensity: 1.5; }
.state-critical { --aberration-intensity: 4; }
```

**Scanline Overlay (CSS):**
```css
.scanlines::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15),
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
  pointer-events: none;
  opacity: var(--scanline-opacity);
  animation: scanline-roll 8s linear infinite;
}

.state-stable { --scanline-opacity: 0; }
.state-warning { --scanline-opacity: 0.1; }
.state-critical { --scanline-opacity: 0.3; }
```

**Glitch-In Animation (Modal/Toast):**
```css
@keyframes glitch-in {
  0% { 
    transform: translateX(-10px); 
    opacity: 0;
    filter: hue-rotate(90deg);
  }
  20% { transform: translateX(5px); }
  40% { transform: translateX(-3px); }
  60% { transform: translateX(2px); }
  80% { transform: translateX(-1px); }
  100% { 
    transform: translateX(0); 
    opacity: 1;
    filter: hue-rotate(0deg);
  }
}
```

---

### Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| 390-428px (standard mobile) | Default layout — full terminal aesthetic |
| 429-768px (large mobile/tablet) | Centered content, max-width 428px, visible grid overlay |
| > 768px (desktop fallback) | CRT monitor mockup frame with screen curve effect |

---

### Additional HUD Elements

**Persistent Status Bar (Bottom of Screen):**
```
┌───────────────────────────────────────────────────────┐
│ FREQ: 104.9 // SIG: 87% // LISTENERS: 142 // ◉ LIVE  │
└───────────────────────────────────────────────────────┘
```
- Height: 32px
- Background: `black-void` with top border `grid-line`
- Text: `text-xs`, uppercase, `text-data` (green)
- Updates in real-time with subtle flicker

**Grid Overlay (Optional/Subtle):**
- 8px grid, 1px lines at 5% opacity
- Visible only on larger screens
- Reinforces "targeting computer" / surveillance aesthetic

**Corner Decorations (HUD Brackets):**
```
┌─┐                                   ┌─┐
│                                       │
                   CONTENT
│                                       │
└─┘                                   └─┘
```
- 1px lines in `grid-line` color
- Animated: subtle pulse on state changes

---

*This UX specification combines HUD/Sci-Fi FUI, state-driven chromatic aberration, and cyberpunk terminal aesthetics. Ready for visual implementation.*

