# Changelog

All notable changes to this project will be documented in this file.

## [0.1.12] - 2025-12-06

### 🔒 Security Update (CRITICAL)
- **CVE-2025-66478 Fix**: Updated Next.js from 16.0.5 to 16.0.7 to patch critical security vulnerability
  - This addresses a CVSS 10.0 remote code execution vulnerability in React Server Components
  - All users should upgrade immediately
  - See [Next.js Security Advisory](https://nextjs.org/blog/CVE-2025-66478) for details
  - Updated eslint-config-next to 16.0.7 to match

## [0.1.11] - 2025-12-01

### 🐳 Docker Support
- **Docker Configuration**:
  - Added multi-stage Dockerfile for optimized production builds.
  - Updated docker-compose.yml with app and Redis services.
  - Created comprehensive deployment documentation.
  - Added .dockerignore for efficient builds.
  - Configured health checks for both services.
  - Enabled standalone Next.js output for Docker.

### ✨ New Features
- **Text-to-Speech (TTS)**:
  - Added "Read aloud" capability for assistant messages.
  - Integrated Web Speech API for native voice synthesis.
  - Controls: Play, Stop, and Pulse animation during playback.
  - Smart voice selection (prefers Google/Microsoft English voices).

## [0.1.10] - 2025-12-01

### ✨ New Features
- **Universal File Attachments**:
  - Expanded file upload support to all file types (not just images).
  - Replaced generic image icon with a versatile "Paperclip" icon.
  - Added distinct visual previews for non-image files (File icon with name).
  - Preserved image preview functionality for image files.

### 🐛 Fixed
- **Chat Input Layout**:
  - Resolved "weird box" layout glitch caused by the native file input element affecting spacing.
  - Enforced `display: none` on the native file input to ensure invisible but functional operation.

## [0.1.9] - 2025-01-27

### 📚 Documentation & Repository
- **Git Repository**: Initialized git repository and connected to GitHub (https://github.com/AfyKirby1/Nebula-Chat)
- **Documentation Update**: Comprehensive review and update of all documentation files
- **Project Analysis**: Complete codebase analysis and feature documentation

## [0.1.9] - 2025-12-01

### 🌌 Rebranding
- **Project Name Change**: Rebranded from "Otter Chat" to "Nebula Chat" to better reflect the advanced, space-age capabilities (Artifacts/Nebula workspace).
- **Visual Identity**: Updated sidebar icons, headers, and placeholders to match the new "Nebula" theme.

### 🔧 Core Improvements
- **Default Model Update**: Set `gemini-2.5-pro` as the default model for new sessions (upgraded from Flash) for better reasoning capabilities.
- **Performance Optimization**: Disabled preloading of holiday theme fonts to eliminate browser warnings and improve initial load time.
- **UX Polish**: Prevented the creation of duplicate empty chat sessions when clicking "New Chat" from an already blank session.

### 🐛 Fixed
- **Advanced Mermaid Fixes**: 
  - Upgraded syntax sanitization to use type-specific bracket matching (`[]`, `{}`, `()`).
  - Prevents corruption of complex diagrams containing nested brackets or mixed node types.

## [0.1.8] - 2025-12-01

### 🐛 Fixed
- **Mermaid Rendering Robustness**:
  - Implemented proactive syntax sanitization for Mermaid diagrams.
  - Automatically quotes unquoted text with colons inside brackets (e.g., `C{Key: Value}` -> `C{"Key: Value"}`).
  - Removes trailing semicolons that cause parser errors.
  - Added resilient error handling to prevent render crashes and reduce console noise.

## [0.1.7] - 2025-11-30

### 🎙️ Voice & Vision (New)
- **Multimodal Image Support**: 
  - Upload images directly to the chat (supports drag-and-drop and file selection).
  - Vision-capable models (Gemini 1.5/2.0) can analyze, describe, and code from images.
  - Added "Vision" capability badges to the Model Selector.
- **Native Speech-to-Text**:
  - Integrated Web Speech API for seamless voice input.
  - Added microphone toggle with pulse animation in the input area.
  - Real-time transcription with auto-height adjustment.

### 🎄 Holiday Features
- **Christmas Theme System**: 
  - Complete festive UI overhaul with red/green/gold color scheme
  - CSS variable-based theme system compatible with light/dark modes
  - Animated toggle button with gift/snowflake icons
  - Candy cane border effects on inputs
  - Snowflake patterns on cards
  - Persistent theme state via localStorage
  - Integrated into sidebar with smooth animations

### 🚀 Infrastructure Improvements
- **Redis Durable Streaming Architecture**:
  - Implemented Redis Streams for persistent message storage
  - Redis Pub/Sub for real-time message delivery
  - Durable chat streams that survive page refreshes and disconnects
  - Automatic stream history replay on reconnection
  - Stream expiration management (1 hour TTL)
  - Graceful error handling for Redis connection failures
  - New `/api/chat/stream` endpoint for resumable streams

### ✨ Enhanced UI/UX
- **Sidebar Enhancements**:
  - Collapsible sidebar with smooth animations
  - Integrated theme toggle (dark/light) in sidebar footer
  - Christmas theme toggle integration
  - Enhanced tooltip system for all sidebar actions
  - Improved responsive behavior for collapsed state
  - Better visual hierarchy and spacing

- **Model Selector Improvements**:
  - Enhanced dropdown with model descriptions
  - Thinking capability badges for compatible models
  - Better visual feedback for selected models
  - Improved loading states

### 🛠️ Developer Experience
- **Syntax-Aware Code Viewer**:
  - Replaced basic `<pre>` blocks with `react-syntax-highlighter`.
  - Implemented `vscDarkPlus` theme for professional-grade code reading.
  - Auto-detection of languages (HTML, CSS, JS, TS, React).
- **Documentation Overhaul**:
  - Comprehensive updates to README and FEATURE docs.
  - Added TTS implementation plan (for future reference).

### 🔧 Technical Updates
- **Bug Fixes**:
  - Fixed race condition in stream resumption logic (`useChat.ts`).
  - Resolved Next.js font optimization warnings.
  - Fixed accessibility warnings for form fields.
- Added `ioredis` dependency for Redis integration
- Enhanced error handling in streaming endpoints
- Improved connection management with Redis singleton pattern
- Better separation of concerns for theme management

## [0.1.6] - 2025-11-30

### 🚀 Intelligent System Update
- **Intelligent Code Artifacts**:
  - **Smart Toolbar**: Added dedicated HTML/CSS/JS/Preview tabs for seamless web development workflow.
  - **Auto-Refresh**: Code previews now automatically update in real-time as new code is generated.
  - **Fusion Engine**: New logic to automatically link and aggregate related HTML, CSS, and JS artifacts from the conversation.
  - **Live Detection**: Improved system to detect and display artifacts the moment they appear in the stream.

### 🐛 Fixed
- **Mermaid Rendering**: 
  - Fixed syntax auto-correction for nested delimiters in Flowcharts (e.g., `A[List: [1, 2]]`).
  - Resolved lexical and parsing errors preventing complex diagrams from rendering.
- **Layout Stability**:
  - Fixed `ResizablePanel` warnings by ensuring stable IDs and order props, improving layout persistence.

## [0.1.5] - 2025-11-29

### 🚀 Major Features (VC Flare Update)
- **Smart Persona System**: A new "Brain Mode" selector in the sidebar allowing users to switch between specialized AI personas:
  - **Standard**: Balanced helper.
  - **Developer**: Hard-coded for technical precision and code generation.
  - **Creative**: Optimized for brainstorming and visionary ideas.
  - **Analyst**: Structured for data-driven insights and strategy.
- **Core Memories System**: 
  - **Long-Term Memory**: The AI now remembers user facts, preferences, and project details across sessions.
  - **Memory Management**: New "Memories" modal to view, add, and delete stored facts.
  - **Context Injection**: Memories are automatically injected into the system prompt for personalized responses.
- **Nebula Full-Screen Mode**:
  - Dedicated full-screen view for artifacts with a persistent branded toolbar.
