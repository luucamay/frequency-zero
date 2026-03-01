# Google Stitch Workflow Guide for Frequency Zero

## What is Google Stitch?

Google Stitch is an AI-powered prototyping tool that converts natural language prompts into functional UI prototypes. It's ideal for rapidly generating interactive mockups from detailed specs like the ones in `build-prompts.md`.

---

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: FOUNDATION          PHASE 2: COMPONENTS           │
│  ─────────────────────        ─────────────────────          │
│  Prompt 1 → Design Tokens     Prompt 3 → Signal Bar          │
│  Prompt 2 → Layout Shell      Prompt 4 → Waveform            │
│                               Prompt 5 → Station Card        │
│                               Prompt 7 → Action Buttons      │
├─────────────────────────────────────────────────────────────┤
│  PHASE 3: SCREENS             PHASE 4: FLOWS                 │
│  ─────────────────────        ─────────────────────          │
│  Prompt 6 → Home Feed         Prompt 9 → Payment Modal       │
│  Prompt 8 → Active Station    Prompt 10 → INJECT Flow        │
│                               Prompt 11 → CALL Flow          │
│                               Prompt 12 → CLAIM Flow         │
├─────────────────────────────────────────────────────────────┤
│  PHASE 5: SYSTEM COMPONENTS   PHASE 6: POLISH                │
│  ─────────────────────        ─────────────────────          │
│  Prompt 13 → Toast Notifs     Prompt 15 → Chromatic System   │
│  Prompt 14 → Static Event     Prompt 16 → Animations         │
└─────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Instructions

### Phase 1: Foundation (Prompts 1-2)

**Goal:** Establish design system before any components.

#### Step 1.1: Design Tokens (Prompt 1)

1. Open Google Stitch
2. Start a new project named "Frequency Zero"
3. Copy **Prompt 1** entirely into Stitch
4. **Key additions to the prompt:**
   ```
   Create a design system foundation with:
   - All CSS variables defined in a :root block
   - A single HTML preview showing color swatches, typography scale, 
     and border/corner examples
   - Export as reusable CSS file
   ```
5. **Expected output:** CSS variables file + visual reference sheet

#### Step 1.2: Layout Shell (Prompt 2)

1. Reference the design tokens from Step 1.1
2. Copy **Prompt 2** and add:
   ```
   Use the design tokens from the previous step.
   Create an empty app shell with:
   - Mobile viewport (390px width, 844px height)
   - Corner HUD brackets visible
   - Bottom status bar showing placeholder data
   - Grid overlay at 5% opacity
   ```
3. **Expected output:** App shell container ready for screens

---

### Phase 2: Core Components (Prompts 3-5, 7)

**Goal:** Build reusable components before screens.

#### Step 2.1: Signal Stability Bar (Prompt 3)

**Stitch prompt addition:**
```
Create the Signal Stability bar as a standalone component.
Show 4 variations in one preview:
1. Stable state (green, 78% filled)
2. Warning state (orange, 45% filled)  
3. Critical state (red, 15% filled, with flicker animation)
4. Dead state (grey, 0% filled)

Include the countdown timer text "SIG: MM:SS // XX%"
Make it interactive: clicking cycles through states.
```

#### Step 2.2: Waveform Visualization (Prompt 4)

**Stitch prompt addition:**
```
Create an audio waveform component with simulated movement.
No audio API needed - use CSS/JS animation to simulate.
Show both sizes: 48px (card) and 80px (active view).
Color should accept a prop to match signal state.
```

#### Step 2.3: Station Card (Prompt 5)

**Stitch prompt addition:**
```
Combine the Signal Bar and Waveform components into a Station Card.
Use a placeholder image (900x1200, dark/moody aesthetic).
Make the card exactly 390px x 844px (9:16 mobile viewport).
All elements must be visible without scrolling.
```

#### Step 2.4: Action Buttons (Prompt 7)

**Stitch prompt addition:**
```
Create 4 action buttons as a vertical stack.
Each button must show:
- Icon in brackets [ ⚡ ]
- Label with dot leaders
- Price right-aligned
- Description on second line

Show hover and pressed states.
The FUEL button should have a special "critical pulse" variant.
```

---

### Phase 3: Main Screens (Prompts 6, 8)

**Goal:** Assemble components into full screens.

#### Step 3.1: Home Feed Screen (Prompt 6)

**Stitch prompt addition:**
```
Create a vertical scrolling feed using the Station Card component.
Include 4 cards with different signal states:
1. The Midnight Protocol - Stable (green)
2. Antarctic Frequencies - Warning (orange)  
3. The Dead Drop - Critical (red)
4. Sector 7 Transmissions - Static (dead)

Enable snap scrolling between cards.
Each card fills the full viewport.
```

#### Step 3.2: Active Station View (Prompt 8)

**Stitch prompt addition:**
```
Create the main listening screen combining:
- Transparent header with back button and listener count
- Station image (40% height, dimmed)
- Large waveform visualization (80px)
- Signal stability bar
- All 4 action buttons visible without scrolling

Show visual degradation states:
- Add chromatic aberration controls to preview different states
- Critical state should show scanlines and RGB split
```

---

### Phase 4: Modal Flows (Prompts 9-12)

**Goal:** Create interactive payment and action flows.

#### Step 4.1: Payment Modal (Prompt 9)

**Stitch prompt addition:**
```
Create a bottom-sheet modal at 50% viewport height.
Include:
- Terminal-style header "TRANSACTION // FUEL"
- Action/Effect/Cost breakdown
- Input field for identifier (pre-filled "ANONYMOUS")
- CONFIRM and ABORT buttons

Add glitch-in animation on open.
Show processing spinner state when CONFIRM is clicked.
```

#### Step 4.2: INJECT Flow (Prompt 10)

**Stitch prompt addition:**
```
Create an inline expansion below the INJECT button (not a modal).
Include:
- Text input with character counter (max 100)
- Placeholder: "e.g., 'The server is in Antarctica'"
- UPLOAD and ABORT buttons

Create a separate "upload animation" screen showing:
- 3 phases over 3 seconds
- Glitch effects, falling characters (Matrix-style), checksum confirmation
```

#### Step 4.3: CALL Flow (Prompt 11)

**Stitch prompt addition:**
```
Create two screens:

SCREEN 1: Warning Modal
- Warning icon and "LIVE TRANSMISSION WARNING" header
- Requirements list (microphone, monitoring notice)
- Duration and cost display
- ABORT and CONFIRM buttons

SCREEN 2: On-Air HUD Overlay  
- "◉ LIVE" pulsing indicator
- Caller info and countdown timer (01:00 → 00:00)
- Progress bar depleting
- Waveform showing "user audio"
- Warning state at 00:10 remaining
```

#### Step 4.4: CLAIM Flow (Prompt 12)

**Stitch prompt addition:**
```
Create two screens:

SCREEN 1: Preview Modal
- Last 30 seconds transcript preview
- Play preview button
- Lore card thumbnail preview
- ABORT and CLAIM buttons

SCREEN 2: Share Modal
- Full lore fragment card (1080x1080 preview)
- Share options: X, Instagram, Copy Link, Download
- Card should have redaction blocks ████, paper texture, slight rotation
```

---

### Phase 5: System Components (Prompts 13-14)

#### Step 5.1: Toast Notifications (Prompt 13)

**Stitch prompt addition:**
```
Create a toast notification component with 4 variants:
- Success (green): "✓ FUEL RECEIVED // SIG +05:00"
- Error (red): "✗ TRANSACTION FAILED // RETRY"
- Warning (orange): "⚠ SIGNAL DEGRADING // FUEL REQUIRED"
- Info (grey): "▸ LISTENER JOINED // COUNT: 143"

Show glitch-in animation on appear.
Auto-dismiss after 3 seconds.
Position at top center below safe area.
```

#### Step 5.2: Static Event (Prompt 14)

**Stitch prompt addition:**
```
Create the "broadcast death" screen showing:
- Full-screen white noise/static animation
- Heavy chromatic aberration
- Rolling scanlines at 80% opacity
- "SIGNAL LOST // 00:00:00" centered text
- "RETURN TO FEED" button

Add a short transition animation (500ms glitch-in effect).
Include subtle audio: white noise hum (describe for mock).
```

---

### Phase 6: Polish & Effects (Prompts 15-16)

#### Step 6.1: Chromatic Aberration System (Prompt 15)

**Stitch prompt addition:**
```
Create a demo page showing the chromatic aberration effect system.
Show a UI element (e.g., a heading or button) with:
- Stable: No effect
- Warning: 1-2px RGB split
- Critical: 3-5px RGB tear with flicker
- Static: 5-8px full displacement

Include a slider to adjust --aberration-intensity in real-time.
Add scanline overlay with opacity slider.
```

#### Step 6.2: Animations & Polish (Prompt 16)

**Stitch prompt addition:**
```
Create an animation showcase page demonstrating:
1. Glitch-in animation (for modals/toasts)
2. Fuel-pulse animation (button glow)
3. Screen-flicker animation
4. Scanline-roll animation

Each animation should have a "Play" button to trigger it.
Include CSS code export for each animation.
```

---

## Stitch-Specific Tips

### 1. Use Context Chaining
When creating subsequent prompts, reference previous outputs:
```
"Using the design tokens and Signal Bar component from previous steps,
create the Station Card component that includes..."
```

### 2. Request State Variations
Always ask Stitch to show multiple states in one view:
```
"Show all 4 signal states side by side for comparison"
```

### 3. Export Options
At the end of each prompt, add:
```
"Export this as:
- Standalone HTML file with inline CSS/JS
- React component (functional, with props)
- CSS animations as separate file"
```

### 4. Iteration Pattern
For each component:
1. **Generate** → Initial output from prompt
2. **Refine** → "Make the glow effect more subtle" / "Increase contrast"
3. **Integrate** → "Add this component to the Active Station View"

### 5. Demo Data
Include realistic demo content:
```
"Use these station names and data:
- The Midnight Protocol (4:30 remaining, 142 listeners)
- Antarctic Frequencies (2:15 remaining, 89 listeners)
..."
```

---

## Assembly Order (Recommended)

```
Day 1: Foundation
├── Prompt 1: Design tokens → 30 min
└── Prompt 2: Layout shell → 30 min

Day 2: Components  
├── Prompt 3: Signal bar → 45 min
├── Prompt 4: Waveform → 45 min
├── Prompt 5: Station card → 60 min
└── Prompt 7: Action buttons → 45 min

Day 3: Screens
├── Prompt 6: Home feed → 60 min
└── Prompt 8: Active station → 90 min

Day 4: Flows
├── Prompt 9: Payment modal → 45 min
├── Prompt 10: INJECT flow → 60 min
├── Prompt 11: CALL flow → 60 min
└── Prompt 12: CLAIM flow → 60 min

Day 5: Polish
├── Prompt 13: Toasts → 30 min
├── Prompt 14: Static event → 45 min
├── Prompt 15: Chromatic system → 45 min
└── Prompt 16: Animations → 60 min
```

**Total estimated time: ~12 hours across 5 sessions**

---

## Final Integration

After all components are built:

```
"Combine all screens and components into a single interactive prototype:
- Home Feed as the landing screen
- Tap a station card → Active Station View
- Tap action buttons → respective flows
- Signal countdown runs in real-time
- When signal hits 0 → Static Event
- Toast notifications appear on actions
- All chromatic aberration effects active based on signal state

Make it fully navigable with working back buttons."
```

---

## Exporting from Stitch

For development handoff:
1. Export complete CSS with all variables and animations
2. Export component HTML/JSX separately
3. Document the state management (signal states, aberration intensity)
4. Include asset requirements (station images, fonts)

The prompts are designed to produce production-ready specifications that can be handed to developers or fed into code generation tools.
