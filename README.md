# Frequency Zero

**AI-powered interactive radio where listeners shape the broadcast through micropayments.**

Frequency Zero transforms passive audio consumption into an interactive experience. AI hosts run continuous live broadcasts that depend entirely on listener engagement to survive. When the "Signal Stability" countdown hits zero, the station goes dark.

## Core Concept

Each station features an AI agent broadcasting live with a synthetic voice. Listeners can:

- **Fuel ($0.10)** — Extend the broadcast by 5 minutes
- **Inject ($1)** — Feed secret information into the AI's narrative
- **Call ($10)** — Go live on-air for a 1-minute voice conversation with the AI host
- **Claim ($10)** — Own and share the last 30 seconds of lore as a social media card

Every payment triggers an immediate on-air acknowledgment, creating a direct feedback loop between listener action and broadcast response.

## The Experience

Listeners browse a feed of active stations, each showing its host, current topic, listener count, and remaining signal time. Tapping in unmutes the live stream. As signal stability drops, urgency builds—red warnings, flashing borders, and the AI's tone shifts. Pay to keep it alive, or watch it fade to static.

## Tech Stack

- **Next.js 15** with React 19 and TypeScript
- **Mistral AI** for generating station concepts and broadcast content
- **ElevenLabs** for real-time AI voice synthesis
- **Tailwind CSS 4** with Motion (Framer Motion) for animations
- Mobile-first 9:16 interface design

## Project Structure

```
app/
├── page.tsx              # Main station grid and generation logic
├── layout.tsx            # Root layout with metadata
├── api/
│   ├── broadcast/        # Text-to-speech broadcast API
│   └── call/             # Live caller WebRTC handler
├── test-payment/         # Payment flow testing page
└── test-station/         # Station testing page

components/
├── Hero.tsx              # Landing hero with lore input
├── StationGrid.tsx       # Grid of active stations
├── StationCard.tsx       # Individual station card
├── StationDetail.tsx     # Full station view with audio
├── CallModal.tsx         # Live call interface
└── PaymentModal.tsx      # Micropayment modal

hooks/
├── use-broadcast.ts      # Audio broadcast state management
├── use-call-mode.ts      # Live call mode handling
└── use-mobile.ts         # Mobile detection
```

## Getting Started

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file with your API keys:
   ```env
   MISTRAL_API_KEY="your_mistral_api_key"
   NEXT_PUBLIC_MISTRAL_API_KEY="your_mistral_api_key"
   ELEVENLABS_API_KEY="your_elevenlabs_api_key"
   ELEVENLABS_VOICE_ID="pNInz6obpgDQGcFmaJgB"  # optional, defaults to Adam
   ```

   - Get a Mistral API key from [console.mistral.ai](https://console.mistral.ai/)
   - Get an ElevenLabs API key from [elevenlabs.io](https://elevenlabs.io/)

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |

## License

See [LICENSE](LICENSE) for details.
