# Build-Order Prompts: Frequency Zero

## Overview

A mobile-first AI radio platform where listeners sustain broadcasts through micropayments. The UI uses a "Military Leak Terminal" aesthetic with HUD/Sci-Fi FUI styling, state-driven chromatic aberration, and a Black + Emerald/Orange cyberpunk palette.

## Build Sequence

1. **Foundation** — Design tokens, CSS variables, base typography
2. **Layout Shell** — App container, safe areas, 9:16 viewport structure
3. **Signal Stability Bar** — The core countdown mechanic component
4. **Waveform Visualization** — Audio-reactive visualization component
5. **Station Card (Home Feed)** — Scrollable card for station discovery
6. **Home Feed Screen** — Full-screen vertical scroll of station cards
7. **Action Buttons** — Terminal-style payment action buttons
8. **Active Station View** — Full listening experience screen
9. **Payment Modal** — Terminal-style transaction interface
10. **INJECT Flow** — Secure drop input and upload animation
11. **CALL Flow** — Warning modal and on-air HUD overlay
12. **CLAIM Flow** — Preview modal and shareable lore fragment card
13. **Toast Notifications** — System alert component
14. **Static Event** — Broadcast death state with full glitch effect
15. **Chromatic Aberration System** — State-driven visual degradation
16. **Animations & Polish** — Glitch effects, scanlines, transitions

---

## Prompt 1: Foundation — Design Tokens & Base Styles

### Context

This is the design foundation for Frequency Zero, a mobile web app with a "Military Leak Terminal" aesthetic. All subsequent components depend on these tokens. The visual style is HUD/Sci-Fi FUI: monospace typography, beveled corners (not rounded), coordinate-style data formatting, and a cyberpunk Black + Emerald/Orange palette.

### Requirements

**CSS Variables — Colors (Primary Palette):**
```css
--black-void: #050505;      /* True black background */
--black-surface: #0D0D0D;   /* Card/panel backgrounds */
--black-elevated: #141414;  /* Elevated surfaces, modals */
--grid-line: #1A1A1A;       /* Grid overlay, dividers */
--text-primary: #E8E8E8;    /* Primary text (slightly warm white) */
--text-secondary: #6B6B6B;  /* Secondary text, labels */
--text-data: #00FF88;       /* Data readouts, coordinates */
```

**CSS Variables — Signal Status:**
```css
--signal-stable: #00FF88;   /* Emerald green — system nominal */
--signal-warning: #FF6B00;  /* High-vis orange — degrading */
--signal-critical: #FF2D2D; /* Alert red — failing */
--signal-dead: #333333;     /* Grey — offline/static */
```

**CSS Variables — Action Accents:**
```css
--accent-fuel: #FF6B00;     /* FUEL — orange */
--accent-inject: #00FF88;   /* INJECT — green */
--accent-call: #00BFFF;     /* CALL — cyan */
--accent-claim: #FFD700;    /* CLAIM — gold */
```

**CSS Variables — Chromatic Aberration:**
```css
--chroma-red: #FF0040;
--chroma-green: #00FF88;
--chroma-blue: #0080FF;
--aberration-intensity: 0;  /* 0 = stable, 1.5 = warning, 4 = critical */
```

**CSS Variables — Spacing:**
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--grid-unit: 8px;
```

**Typography:**
- Font family: `'JetBrains Mono', 'Roboto Mono', monospace` for ALL text
- `--text-xl`: 20px, line-height 1.3 (station titles, headers)
- `--text-lg`: 16px, line-height 1.4 (button labels, primary data)
- `--text-base`: 14px, line-height 1.5 (body text)
- `--text-sm`: 12px, line-height 1.4 (metadata, coordinates)
- `--text-xs`: 10px, line-height 1.3 (micro labels)
- Text is UPPERCASE for labels and status
- Bracketed format for actions: `[ FUEL ]` `[ INJECT ]`
- Coordinate format for data: `FREQ: 104.9 // SIGNAL: 87%`

**Borders & Corners:**
- Use beveled/clipped corners, NOT rounded
- `--border-thin`: 1px solid
- Beveled corner clip-path (4px cut):
```css
.panel {
  clip-path: polygon(
    0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px,
    100% calc(100% - 4px), calc(100% - 4px) 100%,
    4px 100%, 0 calc(100% - 4px)
  );
}
```

**Base Styles:**
- Body background: `--black-void`
- Default text color: `--text-primary`
- Selection highlight: `--signal-stable` at 30% opacity
- Scrollbar: Thin, styled to match terminal aesthetic

### Constraints

- Do NOT use any rounded corners (border-radius)
- Do NOT use any sans-serif fonts
- This is design tokens only — no components yet
- Mobile-first: base viewport 390-428px width

---

## Prompt 2: Layout Shell — App Container & Structure

### Context

The main app container for Frequency Zero. This is a mobile-first 9:16 web app that functions like a vertical TikTok-style feed. The layout needs to handle safe areas for mobile notches and provide the foundation for both the Home Feed and Active Station views.

### Requirements

**App Container:**
- Full viewport: 100vw × 100vh
- Background: `#050505` (black-void)
- Safe area padding for iOS notch and home indicator
- Overflow: hidden on body (individual screens handle scroll)

**9:16 Viewport Frame:**
- Aspect ratio enforced for consistent card sizing
- On desktop (>768px): Show CRT monitor mockup frame around content
- On tablet (429-768px): Center content with max-width 428px

**Grid Overlay (Optional/Subtle):**
- 8px grid, 1px lines at 5% opacity (`#1A1A1A`)
- Visible only on larger screens
- Creates "targeting computer" / surveillance feel

**Corner Decorations (HUD Brackets):**
```
┌─┐                    ┌─┐
│                        │
       [CONTENT]
│                        │
└─┘                    └─┘
```
- 1px lines in `#1A1A1A`
- Positioned at corners of main content area
- Subtle pulse animation on state changes

**Persistent Status Bar (Bottom):**
```
┌───────────────────────────────────────────────────────┐
│ FREQ: 104.9 // SIG: 87% // LISTENERS: 142 // ◉ LIVE  │
└───────────────────────────────────────────────────────┘
```
- Height: 32px
- Background: `#050505` with top border `#1A1A1A`
- Text: 10px uppercase monospace, color `#00FF88`
- Fixed to bottom, above safe area
- Updates in real-time with subtle flicker effect

### States

- Default: Standard layout with grid visible
- Loading: Subtle scan line animation across screen
- Error: Red tint on corner brackets

### Constraints

- Do NOT include any screens or components yet
- This is the shell/frame only
- Must work on mobile Safari (iOS safe areas)
- Desktop shows decorative CRT frame but content stays mobile-sized

---

## Prompt 3: Signal Stability Bar Component

### Context

The Signal Stability bar is the CORE MECHANIC of Frequency Zero. It's a countdown timer that depletes in real-time. When it hits 0:00, the broadcast dies. Users pay to extend it. This component must feel alive, urgent, and reactive.

### Requirements

**Dimensions:**
- Height: 6px (home feed) or 12px (active station view)
- Full width minus padding
- Background: `#1A1A1A` with 1px tick marks every 10%

**Visual Structure:**
```
▓▓▓▓▓▓▓▓▓░░░░░░░  SIG: 02:35 // 78%
```
- Fill bar on left (solid color based on status)
- Empty portion uses tick marks as guides
- Countdown text right-aligned, monospace
- Percentage shown after `//`

**Color States:**
| State | Fill Color | Border |
|-------|------------|--------|
| Stable (>3 min) | `#00FF88` | `#00FF88` |
| Warning (1-3 min) | `#FF6B00` | `#FF6B00` |
| Critical (<1 min) | `#FF2D2D` | `#FF2D2D` |
| Dead (0:00) | `#333333` | `#333333` |

**Countdown Format:**
- Monospace, uppercase
- Format: `SIG: MM:SS // XX%`
- Example: `SIG: 02:35 // 78%`

### States

- **Stable:** Smooth depletion, 1-second ticks, no effects
- **Warning:** 1px RGB chromatic offset on bar edges, subtle pulse
- **Critical:** 3px RGB split, flicker effect, bar flashes
- **Dead:** Grey fill, text shows `SIG: 00:00 // LOST`

### Interactions

- NOT tappable (common misconception to address)
- Read-only display
- Animates smoothly between states

### Animations

- Depletion: Linear 1-second tick, smooth width decrease
- Refill (on FUEL): 300ms ease-out width increase + green flash
- State transition: 200ms color lerp
- Critical flicker: Random 50-150ms intervals

### Constraints

- Must be performant (runs continuously)
- CSS-only animations where possible
- Provide both 6px and 12px variants
- Accept time value as prop (seconds remaining)

---

## Prompt 4: Waveform Visualization Component

### Context

An audio-reactive waveform visualization that indicates "live" status. Appears on station cards and in the active station view. In the Military Leak Terminal aesthetic, it should feel like a radio frequency analyzer.

### Requirements

**Dimensions:**
- Height: 48px (home feed) or 80px (active station view)
- Full width minus padding

**Visual Style:**
- Vertical bars representing audio amplitude
- Bar count: ~30-40 bars across width
- Bar width: 3px with 2px gap
- Color: `#00FF88` (stable) / `#FF6B00` (warning) / `#FF2D2D` (critical)
- Glow effect: 0 0 8px blur of bar color

**Animation:**
- Bars react to audio amplitude (or simulated if no audio API)
- Smooth amplitude changes, 60fps target
- Subtle randomization to feel organic
- Base "idle" state has low-level movement

### States

- **Live - Stable:** Green bars, calm movement
- **Live - Warning:** Orange bars, slightly more erratic
- **Live - Critical:** Red bars, aggressive/urgent movement
- **Muted:** Grey bars, minimal movement
- **Static:** White noise pattern (random heights, fast flicker)

### Interactions

- Tap anywhere on waveform area toggles mute/unmute (in active view)
- No interaction in home feed cards

### Constraints

- Must accept audio analyser data OR provide simulated fallback
- CSS-only simulation acceptable for demo
- Performance: Should not cause frame drops on mobile
- Two size variants: 48px and 80px height

---

## Prompt 5: Station Card Component (Home Feed)

### Context

A full-screen 9:16 card representing a single AI radio station in the discovery feed. Users scroll vertically through these cards. Each card must immediately communicate: what the station is, how urgent the signal is, and invite the user to listen.

### Requirements

**Layout (9:16 aspect ratio, full viewport):**
```
┌─────────────────────────────┐
│                             │
│      [Station Image]        │  ← 60% height - Host artwork
│      (AI Host Visual)       │
│                             │
├─────────────────────────────┤
│  ▓▓▓▓▓▓▓▓▓░░░░░  02:35      │  ← Signal Stability bar (6px)
├─────────────────────────────┤
│  ● LIVE  👥 142 listeners   │  ← Badge row
├─────────────────────────────┤
│  THE MIDNIGHT PROTOCOL      │  ← Station title (20px, uppercase)
│  Whistleblower AI revealing │  ← Description (12px, 2 lines max)
│  classified anomalies...    │
├─────────────────────────────┤
│  [Waveform Visualization]   │  ← 48px height
├─────────────────────────────┤
│       [ 🎧 LISTEN ]         │  ← Primary CTA (56px height)
└─────────────────────────────┘
```

**HUD Overlay (Top-Left Corner):**
```
┌─ FREQ: 104.9 ─────────────────────┐
│ STATUS: NOMINAL                    │
│ LISTENERS: 142 // UPTIME: 04:22:17│
└────────────────────────────────────┘
```
- 1px border `#1A1A1A`, semi-transparent background `#0D0D0D` at 80%
- Beveled corners (4px clip-path)
- Text: 10px uppercase monospace, `#00FF88`

**LISTEN Button:**
- Full width minus margins (16px each side)
- Height: 56px
- Background: `#0D0D0D`, border 1px `#00FF88`
- Text: `[ 🎧 LISTEN ]` — 16px uppercase monospace, `#00FF88`
- Beveled corners (4px clip)
- Hover/Active: Background `#00FF88` at 10%, border glow

**LIVE Badge:**
- `● LIVE` with pulsing dot
- Dot color matches signal status
- Text: 12px uppercase, `#E8E8E8`

**Listener Count:**
- `👥 142` or icon + number
- Text: 12px, `#6B6B6B`

### States

- **Stable:** Green signal bar, green LIVE dot, calm waveform
- **Warning:** Orange signal bar, orange LIVE dot, pulsing overlay effect
- **Critical:** Red signal bar, flashing border, FUEL urgency implied
- **Static:** Greyscale image, `SIGNAL LOST` overlay, no LISTEN button

### Interactions

- Tap LISTEN button: Navigate to Active Station View
- Tap anywhere on card (except button): Also navigates
- Swipe up/down: Scroll to next/previous card

### Constraints

- Card must fill entire viewport (snap scrolling handled by parent)
- Image should lazy-load with skeleton placeholder
- Station image aspect ratio: Cover (crop to fill 60%)
- Do NOT include scroll logic (handled by Home Feed screen)

---

## Prompt 6: Home Feed Screen

### Context

The main discovery screen showing a vertical scroll feed of Station Cards. Uses TikTok-style snap scrolling where each card fills the viewport. For the demo, show 4 stations with different signal states.

### Requirements

**Layout:**
- Full viewport (100vh × 100vw)
- Vertical scroll with snap-to-card behavior
- Each child card: 100vh height
- Safe area padding for notch (top) and home indicator (bottom)

**Scroll Behavior:**
- `scroll-snap-type: y mandatory`
- Each card: `scroll-snap-align: start`
- Smooth scroll between cards
- Auto-mute audio when scrolling away from a card

**Demo Content (4 Stations):**
1. **The Midnight Protocol** — Signal: 4:30 (Stable/Green)
2. **Antarctic Frequencies** — Signal: 2:15 (Warning/Orange)
3. **The Dead Drop** — Signal: 0:45 (Critical/Red)
4. **Sector 7 Transmissions** — Signal: 0:00 (Static/Dead)

### States

- **Loading:** 4 skeleton cards with pulsing waveform placeholders
- **Success:** 4 station cards with live data
- **Empty:** "NO STATIONS LIVE" message with illustration
- **Error:** "CAN'T LOAD STATIONS // RETRY" with retry button
- **Partial:** 2-3 cards + "MORE STATIONS COMING SOON" placeholder

### Interactions

- Swipe up: Scroll to next station
- Swipe down: Scroll to previous station
- Pull down at top: Refresh feed
- Tap card: Navigate to Active Station View

### Constraints

- Mobile-first, 9:16 viewport
- Performance: Only render visible card + 1 above/below
- Audio: Mute all except currently visible card
- On desktop: Show phone mockup frame, scroll within

---

## Prompt 7: Action Buttons (Terminal Style)

### Context

Four payment action buttons that appear in the Active Station View. Each triggers a different payment tier. Styled as terminal/receipt interface with dot leaders connecting label to price.

### Requirements

**Layout (Stacked Vertical List):**
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

**Button Specifications:**
- Size: Full width, 56px height each
- Background: `#0D0D0D`
- Border: 1px solid accent color (varies per button)
- Clip-path: Beveled corners (4px cut)
- Font: 16px uppercase monospace

**Button Data:**
| Button | Icon | Accent Color | Price | Description |
|--------|------|--------------|-------|-------------|
| FUEL | ⚡ | `#FF6B00` | $0.10 | +05:00 TO SIGNAL |
| INJECT | ◉ | `#00FF88` | $1.00 | UPLOAD SECRET DATA |
| CALL | ☎ | `#00BFFF` | $10.00 | PATCH INTO BROADCAST |
| CLAIM | ⚑ | `#FFD700` | $10.00 | CAPTURE LAST 30S |

**Text Layout:**
- Icon in brackets: `[ ⚡ ]`
- Label + dot leaders + price on same line
- Description on second line, indented, `#6B6B6B` color, 12px

### States

- **Default:** Dark background, accent border
- **Hover:** Accent color at 10% background, border glow
- **Active/Pressed:** Accent color at 20% background
- **Disabled:** All grey, 50% opacity
- **Critical (FUEL only):** Pulsing orange glow, 2px chromatic split

### Interactions

- Tap FUEL: Open Payment Modal with FUEL preset
- Tap INJECT: Open INJECT Input inline
- Tap CALL: Open CALL Warning Modal
- Tap CLAIM: Open CLAIM Preview Modal

### Constraints

- Minimum tap target: 56px × full width
- Must be one-handed reachable (bottom third of screen)
- FUEL button gets special treatment in Critical state
- Do NOT implement modal logic yet — just button states

---

## Prompt 8: Active Station View Screen

### Context

The main listening experience. A full-screen 9:16 view where users actively listen to an AI host and interact via payment actions. The Signal Stability bar is prominent, and all 4 action buttons are visible without scrolling.

### Requirements

**Layout:**
```
┌─────────────────────────────┐
│ ← BACK          👥 142      │  ← Header (transparent)
├─────────────────────────────┤
│  THE MIDNIGHT PROTOCOL      │  ← Title (20px)
│  ▓▓▓▓▓▓▓░░░░░░░  01:42      │  ← Signal bar (12px height)
├─────────────────────────────┤
│                             │
│      [Station Image]        │  ← 40% height, dimmed 20%
│                             │
├─────────────────────────────┤
│  [Large Waveform 80px]      │  ← Reactive visualization
├─────────────────────────────┤
│  [ ⚡ ] FUEL ........ $0.10│
│  [ ◉ ] INJECT ...... $1.00 │  ← Action buttons stack
│  [ ☎ ] CALL ....... $10.00 │
│  [ ⚑ ] CLAIM ...... $10.00 │
└─────────────────────────────┘
```

**Header:**
- Transparent background over image
- Back button: `← BACK` or `< BACK` in brackets
- Listener count: `👥 142` right-aligned
- Safe area padding for notch

**Station Image:**
- 40% of viewport height
- Dimmed 20% (dark overlay)
- Acts as ambient background

### States

- **Loading:** Skeleton with "CONNECTING TO FREQUENCY..." text
- **Live - Stable:** Green signal, calm waveform, normal UI
- **Live - Warning:** Orange signal, 1-2px chromatic aberration on all elements
- **Live - Critical:** Red signal, 3-5px aberration, scanlines overlay, FUEL button pulses
- **In Call:** "ON AIR" badge overlay, CALL button disabled
- **Static Event:** Full glitch transition to white noise screen

### State-Driven Visual Degradation

| State | Chromatic Aberration | Scanlines | Noise | Glow |
|-------|---------------------|-----------|-------|------|
| Stable | None | None | None | Subtle green on status |
| Warning | 1-2px RGB split | 10% opacity | None | Orange pulse on FUEL |
| Critical | 3-5px RGB tear | 30% + flicker | 5% static | Heavy red pulse |
| Static | Full displacement | 80% + rolling | 40% white noise | None |

### Interactions

- Tap BACK: Return to Home Feed
- Tap anywhere on image/waveform: Toggle mute
- Tap action buttons: Trigger respective flows
- Audio auto-plays on entry (subject to browser policies)

### Constraints

- All action buttons visible without scrolling
- One-handed operation: buttons in bottom third
- Performance: Aberration effects must not cause jank
- Audio must resume if returning from payment modal

---

## Prompt 9: Payment Modal (Terminal Interface)

### Context

A bottom-sheet modal for confirming payments. Used for FUEL transactions. Styled as a terminal transaction interface with military/classified document feel.

### Requirements

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

**Specifications:**
- Position: Bottom sheet, 50% viewport height
- Background: `#141414` with subtle grid pattern
- Border: 1px `#00FF88` (green glow: 0 0 8px)
- Backdrop: 80% `#050505` with scanline overlay

**Input Field:**
- Pre-filled: "ANONYMOUS" with blinking cursor
- Font: 16px monospace, `#00FF88` text on `#0D0D0D` background
- Border: 1px `#1A1A1A`
- Max length: 20 characters, uppercase forced

**Buttons:**
- CONFIRM: Background `#00FF88`, text `#050505`, full accent
- ABORT: Outline only, border `#FF2D2D`, text `#FF2D2D`
- Both: 48px height, beveled corners

### States

- **Open:** Glitch-in animation (horizontal displacement → settle)
- **Input Focus:** Green glow on input field
- **Processing:** Spinner on CONFIRM button, disable both buttons
- **Success:** Modal closes with glitch-out, toast appears
- **Error:** Modal stays, error message appears in red

### Interactions

- Tap CONFIRM: Process payment
- Tap ABORT: Close modal with glitch-out
- Tap backdrop: Close modal
- Type in field: Update identifier (uppercase only)

### Animation

- Open: 400ms glitch-in (H-displacement oscillates then settles)
- Close: 250ms glitch-out (reverse)
- Processing: Spinner + subtle scanline flicker

### Constraints

- Identifier field auto-focuses on open
- Mock payment for demo (always succeeds after 1s)
- Must trigger toast notification on success
- Must not block underlying audio

---

## Prompt 10: INJECT Flow (Secure Drop Interface)

### Context

The INJECT feature lets users pay $1 to inject "secret data" into the AI's knowledge base. It requires a text input and has a dramatic upload animation sequence.

### Requirements

**Input Interface (Inline, below INJECT button):**
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

**Input Field:**
- Placeholder: "e.g., 'The server is in Antarctica'"
- Max: 100 characters
- Counter: `CHARS: 078/100` — green if under limit, red if at limit
- Font: 14px monospace, `#00FF88`

**Upload Animation (3 seconds):**

**Phase 1 (0-1s):** Screen flickers, horizontal RGB tear
```
> ESTABLISHING SECURE CHANNEL...
```

**Phase 2 (1-2s):** Data stream visualization (falling green characters, Matrix-style)
```
> ENCRYPTING PAYLOAD...
> INJECTING TO BROADCAST STREAM...
```

**Phase 3 (2-3s):** Confirmation with checksum
```
> INJECTION CONFIRMED // HASH: 7f3a9c2b
```

**Visual Effects During Upload:**
- Full-screen glitch overlay
- Scanlines: 50% opacity
- Chromatic aberration: Heavy (4px)
- Background: Subtle noise/static

### States

- **Input:** Text field visible, UPLOAD button shows price
- **Uploading:** Full-screen animation, no interaction allowed
- **Success:** Animation clears, toast: `✓ DATA INJECTED // ACKNOWLEDGED`
- **Error:** Red glitch, toast: `✗ INJECTION FAILED // RETRY`

### Interactions

- Tap INJECT button: Expand inline input
- Type: Character counter updates
- Tap UPLOAD: Trigger payment → animation → confirmation
- Tap ABORT: Collapse interface

### Constraints

- Input must be inline (not modal) to maintain context
- Animation must feel dramatic — this is a key "wow" moment
- After success, AI host should acknowledge injection (audio handled elsewhere)
- Character limit enforced (100 max)

---

## Prompt 11: CALL Flow (Live Transmission Interface)

### Context

The CALL feature ($10) lets users speak live on-air for 1 minute via browser microphone. Requires a warning modal, microphone permission, and an on-air HUD overlay showing caller status.

### Requirements

**Warning Modal:**
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

**On-Air HUD Overlay:**
```
┌─────────────────────────────────────────┐
│ ◉ LIVE // PATCHED INTO FREQ: 104.9     │
│ ════════════════════════════════════════│
│ CALLER: @USERNAME                       │
│ DURATION: 00:47 / 01:00                 │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░ 78%  │
│                                         │
│ [ YOUR AUDIO WAVEFORM VISUALIZATION ]   │
│ ════════════════════════════════════════│
│ TRANSMISSION ACTIVE // DO NOT ABORT     │
└─────────────────────────────────────────┘
```

**LIVE Indicator:**
- `◉ LIVE` pulsing red
- Cyan chromatic offset on text
- Border: 1px `#FF2D2D`

**Progress Bar:**
- Shows call duration depleting
- Color: Orange → Red as time runs out
- At 00:10: Flashing border, beep tone, text: `⚠ SIGNAL FADING`

### States

- **Warning:** Modal open, waiting for confirmation
- **Connecting:** "CONNECTING TO FREQUENCY..." + mic permission prompt
- **On Air:** Full HUD overlay, countdown running, waveform shows user audio
- **Fading (0:10):** Warning visuals, beep sound
- **Ended:** Glitch-out, toast: `TRANSMISSION TERMINATED // AI HOST THANKING`

### Interactions

- Tap CONFIRM: Request mic permission → start call
- Tap ABORT: Close modal
- During call: No abort option (commitment required)
- Mic denied: Graceful fallback message + settings link

### Constraints

- Must request microphone permission via browser API
- If mic denied: Show error, do not charge
- Call is exactly 60 seconds, non-extendable
- Other listeners see "CALL IN PROGRESS" on the CALL button
- For demo: Mock the call (user speaks, no AI response needed)

---

## Prompt 12: CLAIM Flow (Lore Fragment Capture)

### Context

The CLAIM feature ($10) captures the last 30 seconds of broadcast as a shareable "Lore Fragment." Users preview what they're claiming, then receive a styled card they can share to social media.

### Requirements

**Preview Modal:**
```
╔═══════════════════════════════════════╗
║ 🏴 CLAIM LORE FRAGMENT                ║
║ ══════════════════════════════════════║
║                                       ║
║ LAST 30 SECONDS:                      ║
║ ┌───────────────────────────────────┐ ║
║ │ "...the coordinates match the    │ ║
║ │ Antarctic research station.      │ ║
║ │ Someone knew about this before   │ ║
║ │ the signal went dark..."         │ ║
║ └───────────────────────────────────┘ ║
║ [ ▶ PLAY PREVIEW ]                    ║
║                                       ║
║ THIS WILL BE YOURS:                   ║
║ ┌───────────────────────────────────┐ ║
║ │ [Lore Card Preview Thumbnail]    │ ║
║ └───────────────────────────────────┘ ║
║                                       ║
║ [ < ABORT ]      [ CLAIM // $10.00 ]  ║
╚═══════════════════════════════════════╝
```

**Lore Fragment Card (Shareable, 1080×1080):**
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
║  CLAIMED BY: @USERNAME                                ║
║  STATION:    THE MIDNIGHT PROTOCOL                    ║
║  TIMESTAMP:  2026.03.01 // 23:42:17 UTC               ║
║  HASH:       7f3a9c2b4e...                            ║
║ ══════════════════════════════════════════════════════║
║  [ ▶ LISTEN TO INTERCEPTED AUDIO ]                    ║
╚═══════════════════════════════════════════════════════╝
```

**Card Visual Effects:**
- Subtle paper texture overlay
- Faint grid lines (graph paper)
- Redaction blocks: `████████` randomly placed
- Scan artifacts: slight 0.5° rotation, edge shadows
- "DECLASSIFIED" or "PROPERTY OF @username" watermark

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
╚═══════════════════════════════════════╝
```

### States

- **Preview:** Modal showing transcript and card preview
- **Processing:** "MINTING LORE FRAGMENT..." with glitch effect
- **Complete:** Share modal with card and distribution options
- **Shared:** Toast confirmation: `✓ SHARED TO X` or `✓ LINK COPIED`

### Interactions

- Tap PLAY PREVIEW: Play last 30s audio
- Tap CLAIM: Process payment → mint card
- Share buttons: Trigger native share or copy to clipboard
- Download: Save image to device

### Constraints

- Card must be shareable image (1080×1080 for IG, 1200×628 for Twitter)
- Audio must be captured in real-time (rolling 30s buffer)
- For demo: Use pre-recorded transcript/audio
- QR code in card corner links to audio clip

---

## Prompt 13: Toast Notifications (System Alerts)

### Context

Toast notifications provide feedback for actions across the app. Styled as terminal system alerts with status colors and coordinate-style formatting.

### Requirements

**Position & Size:**
- Top center, below safe area (notch)
- Auto-width, max 90% of screen
- Padding: 16px
- Border: 1px solid status color

**Format:**
```
┌─────────────────────────────────────────┐
│ ✓ TRANSACTION CONFIRMED // +05:00 SIG  │
└─────────────────────────────────────────┘
```

**Variants:**
| Type | Border Color | Text Color | Icon |
|------|--------------|------------|------|
| Success | `#00FF88` | `#00FF88` | ✓ |
| Error | `#FF2D2D` | `#FF2D2D` | ✗ |
| Warning | `#FF6B00` | `#FF6B00` | ⚠ |
| Info | `#6B6B6B` | `#E8E8E8` | ▸ |

**Text Examples:**
- Success: `✓ FUEL RECEIVED // SIG +05:00`
- Error: `✗ TRANSACTION FAILED // RETRY`
- Warning: `⚠ SIGNAL DEGRADING // FUEL REQUIRED`
- Info: `▸ LISTENER JOINED // COUNT: 143`

**Typography:**
- Font: 12px uppercase monospace
- Single line preferred, wrap if needed

### States

- **Appear:** Glitch-in animation (horizontal displacement → settle)
- **Visible:** Hold for 3 seconds
- **Dismiss:** Glitch-out animation (settle → displacement → fade)

### Interactions

- Auto-dismiss after 3 seconds
- Tap to dismiss early
- Stack multiple toasts (max 3 visible)

### Animation

```css
@keyframes glitch-in {
  0% { transform: translateX(-10px); opacity: 0; }
  20% { transform: translateX(5px); }
  40% { transform: translateX(-3px); }
  60% { transform: translateX(2px); }
  80% { transform: translateX(-1px); }
  100% { transform: translateX(0); opacity: 1; }
}
```
- Duration: 300ms in, 200ms out
- Add subtle hue-rotate at start for glitch feel

### Constraints

- Must be z-indexed above modals
- Must not block touch on content below (pointer-events: none after appear)
- Accessible: Include ARIA live region for screen readers

---

## Prompt 14: Static Event (Broadcast Death)

### Context

When Signal Stability reaches 0:00, the broadcast "dies" with a dramatic Static Event. This is the failure state that teaches users the core mechanic. Full glitch effect, white noise, and "SIGNAL LOST" messaging.

### Requirements

**Visual Transition (500ms):**
- Full-screen white noise/static overlay
- Heavy chromatic aberration (5px+ RGB displacement)
- Horizontal scanlines at 80% opacity, rolling upward
- CRT flicker effect

**Final State:**
```
┌─────────────────────────────────────────┐
│                                         │
│            ▓▓▓▓▓▓▓▓▓▓▓▓▓               │
│        SIGNAL LOST // 00:00:00          │
│            ▓▓▓▓▓▓▓▓▓▓▓▓▓               │
│                                         │
│        FREQUENCY: 104.9 // OFFLINE      │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │      [ RETURN TO FEED ]          │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│    TRANS-LINK SEVERED // STANDBY...    │
└─────────────────────────────────────────┘
```

**Audio:**
- White noise burst on trigger
- Continue low-level static hum
- Audio stops on exit

**Visual Effects:**
- Full RGB tear/displacement on all text
- Rolling scanlines
- Random horizontal displacement on text (glitch)
- Noise overlay: 40% opacity, animated

### States

- **Transition:** 500ms glitch-in to static
- **Static:** Sustained static with glitch loops
- **Recovery (if someone pays):** Reverse transition, "SIGNAL RESTORED"

### Interactions

- Tap RETURN TO FEED: Navigate back to Home Feed
- If another listener pays FUEL while you're in static: Show recovery animation

### Constraints

- Must be dramatically different from normal UI
- Audio should not be jarring (fade in white noise)
- Performance: Noise animation should use CSS/canvas, not heavy JS
- Accessible: Reduce motion version available (no flicker)

---

## Prompt 15: Chromatic Aberration System

### Context

A global visual effect system that applies RGB channel splitting based on Signal Stability state. As the signal degrades, the entire UI becomes visually unstable.

### Requirements

**CSS Implementation:**
```css
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
```

**Intensity Levels:**
```css
.state-stable { --aberration-intensity: 0; }
.state-warning { --aberration-intensity: 1.5; }
.state-critical { --aberration-intensity: 4; }
.state-static { --aberration-intensity: 8; }
```

**Scanline Overlay:**
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

### States

| State | Aberration | Scanlines | Noise | Applied To |
|-------|-----------|-----------|-------|------------|
| Stable | 0px | 0% | 0% | Nothing |
| Warning | 1-2px | 10% | 0% | Signal bar, FUEL button |
| Critical | 3-5px | 30% + flicker | 5% | All UI elements |
| Static | 5-8px | 80% + roll | 40% | Full screen |

### Interactions

- Effect intensity updates in real-time based on Signal Stability prop
- Smooth transitions between states (200ms)
- Performance mode: Reduce effects on low-power devices

### Constraints

- Must not cause jank on mobile (GPU-accelerated only)
- Must not affect tap targets (pointer-events: none on overlays)
- Provide `prefers-reduced-motion` fallback
- Apply to text via `data-text` attribute duplication

---

## Prompt 16: Animations & Polish

### Context

Final animation polish for Frequency Zero including glitch effects, transitions, and micro-interactions that reinforce the Military Leak Terminal aesthetic.

### Requirements

**Core Animation Specs:**
| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Signal bar depletion | Width decrease + color shift | 1s tick | linear |
| Signal bar refill | Width increase + green flash | 300ms | ease-out |
| FUEL button pulse | Glow shadow + chromatic flicker | 1s loop | ease-in-out |
| Modal open | Glitch-in | 400ms | custom bezier |
| Modal close | Glitch-out | 250ms | ease-in |
| Waveform | Amplitude react | 60fps | - |
| Static event | Full RGB tear + noise | 500ms | ease-in |
| Toast | Glitch-in/out | 300ms/200ms | custom |

**Glitch-In Animation:**
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

**Button Pulse (Critical State):**
```css
@keyframes fuel-pulse {
  0%, 100% { 
    box-shadow: 0 0 8px var(--accent-fuel);
  }
  50% { 
    box-shadow: 0 0 20px var(--accent-fuel), 0 0 40px var(--accent-fuel);
  }
}
```

**Screen Flicker:**
```css
@keyframes screen-flicker {
  0%, 100% { opacity: 1; }
  92% { opacity: 1; }
  93% { opacity: 0.8; }
  94% { opacity: 1; }
  97% { opacity: 0.9; }
  98% { opacity: 1; }
}
```

**Scanline Roll:**
```css
@keyframes scanline-roll {
  0% { transform: translateY(0); }
  100% { transform: translateY(100vh); }
}
```

### Micro-Interactions

- Button hover: 50ms scale(1.01) + border glow
- Button press: 100ms scale(0.98) + background flash
- Input focus: Border color transition + cursor blink
- Counter update: Brief flash on change
- Listener count: Subtle pulse on increment

### Performance Guidelines

- Use `transform` and `opacity` only for animations
- Use `will-change` sparingly
- Reduce effects when `prefers-reduced-motion: reduce`
- Target 60fps on mid-range mobile devices
- Debounce rapid state changes

### Constraints

- All animations must be CSS-based where possible
- Canvas/WebGL for complex noise effects only
- Provide static fallbacks for critical UI
- Test on Safari iOS (limited animation support)

---

*These 16 prompts cover the complete Frequency Zero UI. Build in order for optimal results.*
