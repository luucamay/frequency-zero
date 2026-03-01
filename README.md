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

- Real-time AI voice generation (ElevenLabs)
- WebRTC for live caller participation
- WebSocket for signal state synchronization
- Mobile-first 9:16 interface

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Create a `.env.local` file with your API keys:
   ```
   MISTRAL_API_KEY="your_mistral_api_key"
   NEXT_PUBLIC_MISTRAL_API_KEY="your_mistral_api_key"
   ELEVENLABS_API_KEY="your_elevenlabs_api_key"
   ELEVENLABS_VOICE_ID="pNInz6obpgDQGcFmaJgB"  # optional, defaults to Adam voice
   ```
   - Get Mistral API key from [console.mistral.ai](https://console.mistral.ai/)
   - Get ElevenLabs API key from [elevenlabs.io](https://elevenlabs.io/)
3. Run the app:
   `npm run dev`
