# Nebula Chat (v0.1)

![License](https://img.shields.io/badge/license-Private-red.svg)
![Version](https://img.shields.io/badge/version-0.1.9-blue.svg)
![Status](https://img.shields.io/badge/status-beta-orange.svg)

A next-generation AI chat interface featuring "Thinking" models (Gemini 2.5/3.0), durable streaming, and an intelligent artifact workspace ("Nebula").

## ✨ Key Features

### 🧠 Intelligent Chat
- **Thinking Models**: Support for reasoning models like Gemini 2.5 Pro and Gemini 3.0 Pro (Preview).
- **Chain of Thought**: View the AI's hidden reasoning process behind collapsible "Thinking Process" blocks.
- **Brain Modes**: Switch specialized personas (Developer, Creative, Analyst) for tailored responses.
- **Memory System**: Persistent "Core Memories" allow the AI to remember user preferences and context across sessions.
- **Voice & Vision**: Native Speech-to-Text input and Multimodal Image Analysis support.

### 🚀 Durable Streaming (Redis)
- **Unbreakable Streams**: Chat generation persists even if you refresh the page or lose internet connection.
- **History Replay**: Automatically restores the full stream state upon reconnection.
- **Real-time Pub/Sub**: Low-latency message delivery using Redis infrastructure.

### 🌌 Nebula Workspace (Artifacts)
- **Syntax-Aware Viewer**: Professional-grade code viewing with `vscDarkPlus` syntax highlighting for HTML, CSS, JS, React, and more.
- **Smart Fusion**: Automatically aggregates scattered HTML/CSS/JS code blocks into a unified live preview.
- **Live Preview**: Instant rendering of generated web components and pages.
- **Console Integration**: Capture and display browser console logs directly in the preview tab.
- **Multi-Tab Interface**: Dedicated tabs for HTML, CSS, JS, Preview, and Console.

### 🎄 Theme System
- **Adaptive Theming**: Seamless Dark/Light mode support.
- **Holiday Mode**: Toggleable "Christmas Theme" with festive animations, snow effects, and seasonal colors.
- **Neural Background**: Interactive particle visualization that reacts to mouse movement.

## 🛠️ Technical Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **State & Effects**: Framer Motion, Zustand (Artifacts), Context API
- **Backend**: Next.js API Routes, Google GenAI SDK
- **Persistence**: Redis (ioredis) for streams, LocalStorage for client preferences
- **Visualization**: Mermaid.js for diagrams, HTML5 Canvas for backgrounds

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- Redis server (optional, but required for durable streaming)

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   GOOGLE_API_KEY=your_api_key_here
   REDIS_URL=redis://localhost:6379  # Optional: defaults to localhost
   ```

3. **Launch the application**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

For detailed architecture and design decisions, see the [Documentation](./DOCS/) folder:

- [ARCHITECTURE.md](./DOCS/ARCHITECTURE.md) - System design and structure
- [FEATURES.md](./DOCS/FEATURES.md) - Detailed feature breakdown
- [SUMMARY.md](./DOCS/SUMMARY.md) - Project overview and status
- [CHANGELOG.md](./DOCS/CHANGELOG.md) - Version history
- [SBOM.md](./DOCS/SBOM.md) - Dependencies and security

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## License

Private project - All rights reserved

---

Built with ❤️ using Next.js and Google Gemini AI
