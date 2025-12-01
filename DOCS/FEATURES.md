# Features & Capabilities

Nebula Chat is designed to be the most advanced, "living" interface for the Gemini AI model family. It moves beyond static text into interactive, visual, and personalized experiences.

## 🧠 Core Intelligence
- **Multi-Model Brain**: Seamlessly switch between Gemini 3 Pro (Reasoning), Gemini 2.5 Pro (Balanced), and Gemini 2.5 Flash (Speed).
- **Smart Personas**: Specialized modes for different workflows:
  - **Developer**: Technical precision and best practices.
  - **Creative**: Brainstorming and visionary ideation.
  - **Analyst**: Data-driven strategy and structure.
  - **Standard**: Balanced everyday assistant.
- **Core Memories**: Long-term memory system that stores user facts and preferences, injecting them into every conversation for hyper-personalization.
- **Voice & Vision**:
  - **Native Speech-to-Text**: Built-in voice recognition for hands-free chatting.
  - **Multimodal Vision**: Upload images for the AI to analyze, describe, or code from (e.g., "Turn this screenshot into HTML").
- **Thinking Process**: Visualize the AI's hidden chain-of-thought before it answers, allowing for deeper verification of logic.
- **Context Awareness**: The system knows who you are (via Settings) and maintains continuity with "Related Questions".

## 🎨 The "Living" Interface
- **Neural Canvas**: A background that isn't just a wallpaper. It's a particle network that reacts to your presence (mouse movement), symbolizing the neural connections being made in real-time.
- **Glassmorphism**: A modern, translucent UI aesthetic that blurs the line between content and background.
- **Smooth Motion**: Every message entry, hover state, and transition is animated with physics-based springs (Framer Motion).

## 🛠️ Developer Tools
- **Mermaid Diagram Engine**:
  - **Auto-Generation**: The AI detects when you need a system architecture or flow chart and *draws* it for you.
  - **Interactivity**: Zoom, pan, and explore complex diagrams.
  - **Export**: Download diagrams as SVGs for your own documentation or presentations.
- **Artifact System**:
  - **Intelligent Fusion**: Automatically aggregates HTML/CSS/JS into a unified preview.
  - **Smart Tabs**: Dedicated views for Code, Preview, and specific languages.
  - **Live Refresh**: Previews update instantly as the AI types.
  - **Code Sandbox**: Run HTML/CSS/JS prototypes directly in a secure side panel.
  - **Code Viewer**: Syntax-highlighted view for React, TypeScript, and more.
  - **Nebula View**: Full-screen immersive mode for distraction-free artifact consumption.

## ⚡ Performance
- **Real-Time Streaming**: Zero-latency token streaming via Server-Sent Events (SSE).
- **Optimized Rendering**: React Server Components (RSC) for initial load speed.
- **Local Persistence**: Your chat history lives in your browser, instantly restored on return.

## 🎄 Theming & Personalization
- **Holiday Themes**: Festive modes including Christmas (Red/Green/Gold), Halloween (Orange/Purple/Green), and Thanksgiving (Autumn Tones).
- **Theme System**: Seamless dark/light mode switching with system preference detection.
- **Persistent Preferences**: All theme and UI preferences saved to localStorage.

## 🛡️ Enterprise-Grade
- **Secure API**: API keys are handled server-side only.
- **Type Safety**: Built with strict TypeScript for reliability.
- **Clean Architecture**: Feature-sliced design for maintainability and scalability.
- **Durable Streaming**: Redis-backed streaming architecture ensures messages persist through disconnects and page refreshes.
