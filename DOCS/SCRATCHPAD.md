# Scratchpad

**Last Updated**: 2025-01-27  
**Purpose**: Continuous reference and notes (never delete, only compact old updates)

## Current Project State

### Initial Documentation Creation
- Created comprehensive documentation structure
- All required DOCS files initialized
- Architecture updated to reflect real API implementation
- SBOM generated with all dependencies

### Key Implementation Details
- Real Google Gemini API integration (not mock)
- Streaming responses via ReadableStream
- Thinking mode uses thinkingConfig with model-specific parameters
- System instructions are model-aware (Gemini 3 Pro, 2.5 series, 2.0 series)
- Theme system uses ThemeProvider context with localStorage persistence
- Chat messages persist to localStorage automatically

### Architecture Notes
- Feature-based directory structure
- Separation of concerns: hooks, components, services, contexts
- Server-side API routes for security (GOOGLE_API_KEY env var)
- Client-side service layer (`google-api.ts`) handles streaming parsing
- Artifact system with React Context for global state management
- Resizable panel layout for artifact viewer integration

### New Features Added
- **Artifact System**: Code blocks can be opened in resizable side panel
  - Detects HTML, React, JSX, TSX, JavaScript, TypeScript, CSS code blocks
  - Preview mode for HTML (sandboxed iframe)
  - Code view for all artifact types
  - Copy to clipboard functionality
- **Enhanced Code Blocks**: Custom ReactMarkdown components for artifact detection
- **Chat Persistence**: Auto-save to localStorage on every message change, auto-restore on load
- **Resizable Layout**: ChatLayout with ResizablePanelGroup for artifact viewer
- **UI Polish**: Added `framer-motion` for smooth message animations and interactions
- **Engagement Features**: 
  - Related questions suggestions for conversational continuity
  - User settings modal for personalization
  - Toast notifications for better feedback
- **Visual Intelligence**: 
  - Neural network background simulation
  - Interactive Mermaid diagram rendering

### Configuration
- Environment variables:
  - `GOOGLE_API_KEY` (required): Google Gemini API key
  - `REDIS_URL` (optional): Redis connection string (defaults to `redis://localhost:6379`)
- Default model: `gemini-2.5-pro`
- Port: 3000 (Next.js default)
- App name: Nebula Chat (changed from Otter Chat)

### Latest Features (2025-12-01)
- **Rebranding**: Official rename to **Nebula Chat** with updated UI and metadata.
- **Advanced Mermaid Fixes**: Robust regex for complex nested bracket syntax.
- **Performance**: Optimized font loading (no unused preloads).
- **Mermaid Fix**: Implemented robust syntax sanitization for diagrams (auto-quoting, semicolon removal).
- **Christmas Theme System**: Complete festive UI overhaul with CSS variable-based theming
- **Redis Durable Streaming**: Messages persist through disconnects using Redis Streams + Pub/Sub
- **Enhanced Sidebar**: Collapsible sidebar with integrated theme toggles
- **Stream History Replay**: Automatic message history restoration on reconnection

## ROADMAP (NEVER DELETE THIS CONTENT)

### Implemented Features
- [x] **Neural Background**: Immersive particle network visualization (HTML5 Canvas).
- [x] **Mermaid Diagrams**: Intelligent diagram generation and rendering with zoom/pan.
- [x] **Mermaid Syntax Fixer**: Auto-correction for common syntax errors (quotes, semicolons).
- [x] **Related Questions**: AI-suggested follow-up questions for conversation continuity.
- [x] **Settings Modal**: Basic user personalization (name).
- [x] **Markdown Artifacts**: Resizable side panel for code/preview.

### LLM Provider Inspired Features (New)
**Nous Research (Hermes 4 / Open Source)**
- [x] **Hybrid Reasoning Toggle**: Switch between "Thinking" (Reasoning) and "Standard" modes for response generation.
- [ ] **Graph-Based Synthetic Data**: Tool to generate custom datasets from chat history for potential fine-tuning.
- [ ] **RL Environment (Atropos)**: "Gym" mode where AI practices skills via simulated feedback loops.
- [ ] **Neutral Alignment Mode**: "Raw" mode option to reduce refusals and filtered responses.
- [ ] **Length Control**: Slider to control the verbosity/depth of the reasoning chain.

**Minimax (Hailuo)**
- [ ] **Real-Time Emotive Voice**: Integration of low-latency, emotionally expressive TTS for assistant voice.
- [ ] **Video Generation**: Command to generate short video clips from text descriptions (e.g., `/video a cat jumping`).
- [ ] **Music Generation**: Command to generate short background music/audio clips.

**Mistral (LeChat)**
- [x] **Incremental Canvas**: "Canvas" mode allowing in-place editing and iteration of code/docs (not just re-generation).
- [ ] **Task Agents**: dedicated mini-agents for specific workflows (e.g., "Receipt Scanner", "Invoice Processor").
- [ ] **Document Analysis**: Free-tier PDF/Image analysis with deep understanding.

**DeepSeek (R1 / V3)**
- [x] **Reasoning Chain Visualization**: Collapsible accordion to show the raw "Chain of Thought" steps before the final answer.
- [ ] **Distilled Local Models**: Support for running smaller, distilled models (e.g., via WebLLM) locally in the browser.
- [ ] **Cost/Token Counter**: Real-time display of token usage and estimated cost (even if $0 for us, good for awareness).

**Cohere (Command R+)**
- [ ] **RAG with In-Line Citations**: Precise `[1]` style citations linking to source documents/web search results.
- [ ] **Multi-Step Tool Use**: Autonomous agent mode that can plan and execute sequences (Search -> Read -> Summarize).
- [ ] **Connectors**: Pre-built integrations for Google Drive, Notion, Slack (RAG sources).

### General Enhancements
- [ ] **Voice Mode**: Web Speech API integration for voice input/output.
- [ ] **Vector Memory**: Local vector store (`idb`) for long-term memory of user preferences.
- [ ] **Plugin System**: Standardized interface for external tools.
- [ ] **Mobile App**: PWA manifest and service worker.
- [ ] **Collaborative Mode**: WebSockets for multiplayer chat sessions.
- [ ] **Canvas Editor**: Drag-and-drop editor for Mermaid diagrams.

---

*Note: Old entries should be compacted but preserved for historical reference*

### Debug Log
- **Hydration Mismatch Fix**: Fixed `useSpeechToText` hook to correctly handle server-side rendering by initializing `isSupported` to `false` and updating it in `useEffect`. This resolves the hydration error caused by `typeof window` checks during initial render.
- **Redis Connection Fix**: Implemented `MemoryRedis` fallback in `src/lib/redis.ts`. If `REDIS_URL` is not set, the application now uses an in-memory store for chat streaming instead of failing to connect to localhost. This makes the app work out-of-the-box without Redis.
- **ChatInput Hydration Fix**: Added `suppressHydrationWarning` to the file input in `ChatInput.tsx` to prevent hydration errors caused by browser extensions (e.g., Retriever) injecting attributes like `rtrvr-role`.
