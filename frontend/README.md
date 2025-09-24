# Virtual Advisory Board Frontend

A Next.js web application with voice I/O for conversing with AI advisors.

## Features

- **Voice Interface**: Real-time voice input and output using Web Audio API
- **Real-time Conversations**: WebSocket-powered live conversations
- **Advisor Management**: Select and manage multiple AI advisors
- **Professional UI**: Clean, responsive design with Tailwind CSS
- **TypeScript**: Full type safety and better development experience

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Architecture

### Components

- **VoiceInterface**: Handles microphone input and audio playback
- **AdvisorDisplay**: Shows advisor avatars with speaking indicators
- **ConversationView**: Real-time message display and history
- **Main Page**: Orchestrates the entire conversation experience

### Key Features

- **WebSocket Integration**: Real-time bidirectional communication
- **Voice Processing**: Audio recording, streaming, and playback
- **Advisor Management**: Dynamic advisor selection and status updates
- **Responsive Design**: Works on desktop and mobile devices

### Configuration

Environment variables in `.env.local`:
- `NEXT_PUBLIC_WS_URL`: WebSocket server URL
- `NEXT_PUBLIC_API_URL`: REST API server URL

## Usage

1. **Select Advisors**: Click on advisor cards to add them to your session
2. **Start Conversation**: Send a message or use voice input
3. **Voice Mode**: Toggle between text and voice conversation modes
4. **Real-time Updates**: See live indicators when advisors are speaking

## Dependencies

- **Next.js 15**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations
- **Socket.IO Client**: WebSocket communication
- **WaveSurfer.js**: Audio visualization

## Development

### Running locally:
```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
```

### Project Structure:
```
src/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main page
│   └── globals.css     # Global styles
├── components/         # Reusable components
│   ├── VoiceInterface.tsx
│   ├── AdvisorDisplay.tsx
│   └── ConversationView.tsx
├── lib/               # Utilities
│   └── websocket.ts   # WebSocket manager
└── types/             # TypeScript types
    └── index.ts       # Type definitions
```

## Integration

This frontend connects to:
- **Orchestrator Service** (port 8000): WebSocket and REST API
- **Advisor Services**: Individual AI advisor endpoints
- **Audio Processing**: Voice streaming and synthesis

For the complete system, ensure all backend services are running.