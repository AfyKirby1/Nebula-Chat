# System Architecture

## Overview

Nebula Chat is a **Next.js 16** application utilizing the **App Router** and **React Server Components**. It is designed as a hybrid application where the UI is highly interactive (Client Components) while the heavy lifting of API communication and security is handled by the server (Server Actions/Routes).

## High-Level Diagram

```mermaid
graph TD;
    User[User Browser] -->|Next.js App Router| FE[Frontend UI];
    FE -->|Streaming Request| API[API Routes];
    API -->|GoogleGenAI SDK| Gemini[Google Gemini API];
    Gemini -->|Token Stream| API;
    API -->|Write to Stream| Redis[(Redis Streams)];
    API -->|Pub/Sub| Redis;
    Redis -->|History Replay| StreamAPI[/api/chat/stream];
    Redis -->|Real-time Updates| StreamAPI;
    StreamAPI -->|NDJSON Stream| FE;
    FE -->|Render| Msg[Message Bubble];
    Msg -->|Detect Artifacts| Artifacts[Artifact Viewer];
    Msg -->|Detect Mermaid| Mermaid[Mermaid Engine];
    FE -->|Background| Neural[Neural Canvas];
    FE -->|Theme State| Theme[Theme Provider];
    Theme -->|Holiday Theme| Holiday[Holiday Theme Provider];
```

## Core Modules

### 1. The Chat Engine (`src/features/chat`)
- **MessageList**: Virtualized list handling for performance.
- **MessageBubble**: The "smart" component. It parses Markdown and routes special content (Code, Mermaid) to specialized renderers.
- **ChatInput**: Auto-expanding input with "Thinking Mode" toggles.

### 2. The Visualization Layer
- **NeuralBackground (`src/components/NeuralBackground.tsx`)**: 
  - Uses HTML5 Canvas API.
  - Physics-based particle system.
  - Theme-aware (Dark/Light mode adaptation).
- **Mermaid Renderer (`src/components/Mermaid.tsx`)**:
  - Lazy-loads `mermaid.js` library.
  - Handles SVG generation and scaling.
  - Error boundaries for malformed diagram code.

### 3. State Management
- **useChat Hook**:
  - Manages the message queue and streaming state.
  - **Chat Modes**: Manages the active persona state (Developer, Creative, etc.).
  - **Memory System**: 
    - Loads/Saves `chat_memories` from `localStorage`.
    - Exposes `addMemory` and `deleteMemory` actions.
    - Injects memories into the `sendMessage` payload.
  - Handles the complexity of appending streaming tokens to the last message.
  - Persists state to `localStorage`.
- **ArtifactContext**:
  - Global state for the side panel (Open/Close/Content).
  - Allows any component to trigger the artifact viewer.

### 4. API Layer (`src/app/api/chat`)
- **Streaming Protocol**:
  - Uses `ReadableStream` to pipe data from Google's SDK to the client.
  - Formats data as NDJSON (Newline Delimited JSON) to separate `text` chunks from `thought` chunks.
- **Durable Streaming Architecture** (`src/app/api/chat/route.ts`):
  - **Redis Streams**: All generated tokens are persisted to Redis Streams using `XADD`.
  - **Redis Pub/Sub**: Real-time token delivery via `PUBLISH` to active subscribers.
  - **Stream ID**: Each chat session gets a unique `streamId` for isolation.
  - **History Replay**: `/api/chat/stream` endpoint replays full history from Redis Streams.
  - **Connection Resilience**: Streams survive page refreshes, network interruptions, and client disconnects.
  - **TTL Management**: Streams expire after 1 hour to manage memory.
- **Prompt Engineering**:
  - Injects system instructions for "Related Questions" and "Mermaid Diagrams" dynamically.
  - Configures "Thinking Budget" for reasoning models.
  - Persona-specific instructions (Developer, Creative, Analyst) injected based on chat mode.
  - Core Memories injected into system prompt for personalization.

### 5. Redis Integration (`src/lib/redis.ts`)
- **Singleton Pattern**: Single Redis connection shared across requests (dev mode optimization).
- **Connection Management**:
  - Automatic retry strategy with exponential backoff.
  - Error handling to prevent server crashes.
  - Connection pooling for production scalability.
- **Stream Operations**:
  - `XADD`: Append tokens to persistent stream.
  - `XRANGE`: Retrieve stream history for replay.
  - `EXPIRE`: Automatic cleanup of old streams.
- **Pub/Sub Operations**:
  - `PUBLISH`: Broadcast new tokens to subscribers.
  - `SUBSCRIBE`: Real-time message delivery.

### 6. Theme System
- **Theme Provider** (`src/components/ThemeProvider.tsx`):
  - Manages dark/light mode state using `next-themes`.
  - System preference detection.
  - Persistent theme selection in localStorage.
- **Holiday Theme Provider** (`src/components/HolidayThemeProvider.tsx`):
  - Manages seasonal theme overlays (Christmas, Halloween, Thanksgiving).
  - CSS class-based theming (`.christmas`, `.halloween`, `.thanksgiving` classes on root element).
  - Independent of dark/light mode (works with both).
  - Persistent state in localStorage (`holiday-theme`).
- **CSS Variable System** (`src/app/globals.css`):
  - Theme colors defined as CSS variables.
  - Holiday themes override standard variables.
  - Smooth transitions between theme states.

## Design Patterns

- **Feature-Sliced Design**: Code is organized by feature (chat, artifacts) rather than type (components, hooks), making the codebase easier to navigate for new developers.
- **Compound Components**: UI components (like Dialog) use compound pattern (`Dialog.Root`, `Dialog.Trigger`, etc.) for flexibility.
- **Optimistic UI**: Messages appear immediately; thinking states are shown while waiting for network.

## Security

- **Environment Variables**: 
  - `GOOGLE_API_KEY` is strictly server-side (never exposed to client).
  - `REDIS_URL` optional (defaults to `redis://localhost:6379` for local development).
- **Sanitization**: Markdown rendering uses safe defaults to prevent XSS, while still allowing rich content.
- **Sandboxing**: HTML artifacts are rendered in isolated iframes (future roadmap, currently direct render with warnings).
- **Redis Security**: 
  - Connection errors handled gracefully without exposing internals.
  - Stream isolation via unique stream IDs.
  - Automatic expiration prevents data accumulation.
