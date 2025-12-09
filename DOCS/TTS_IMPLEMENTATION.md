# Text-to-Speech (TTS) Architecture

**Current Status**: Active (Web Speech API)

This document outlines the current implementation of the Text-to-Speech system in Nebula Chat. We are using the browser's native **Web Speech API** to provide a lightweight, zero-latency, and offline-capable voice experience without the need for heavy external models.

## 1. Core Technology: Web Speech API

The system leverages `window.speechSynthesis` to access the operating system's built-in voices.

### Advantages
- **Zero Overhead**: No heavy WASM models (like Kokoro/Whisper) to download (saves ~100MB).
- **Zero Latency**: Instant playback.
- **Privacy**: Audio is generated locally on the device.
- **Offline**: Works without an internet connection.

## 2. Implementation Details

### Custom Hook: `useTextToSpeech`
Located in: `src/hooks/useTextToSpeech.ts`

The hook manages the complex lifecycle of the `speechSynthesis` API:
- **State Management**: Tracks `isSpeaking`, `isPaused`, `voices`.
- **Voice Selection**: 
  - Automatically prefers "Google US English" or "Microsoft Zira" for a natural sound.
  - Falls back to the first available English voice.
- **Markdown Cleaning**: 
  - Includes a `cleanMarkdown` utility that strips code blocks, links, and special characters.
  - Ensures the AI reads "human" text, not raw Markdown syntax.
- **Lifecycle Safety**:
  - Automatically cancels speech on component unmount.
  - Automatically cancels speech on page refresh/navigation (`beforeunload`).
  - Uses `useRef` to track speaking state synchronously.

### UI Integration: `MessageBubble`
Located in: `src/features/chat/MessageBubble.tsx`

- **Controls**:
  - **Play/Stop**: Toggles speech.
  - **Voice Selection**: Dropdown menu to choose from available system voices.
- **Visual Feedback**:
  - Speaker icon pulses when active.
  - Button changes state (Play vs Square/Stop).

## 3. Future Roadmap (Optional)

While the current implementation is robust, we may explore high-fidelity neural TTS in the future if higher quality is required.

### Potential Upgrade: Kokoro-JS
We previously evaluated `kokoro-js` (82M param model). It offers superior prosody but requires:
- ~90MB model download.
- High CPU/GPU usage during generation.
- Significant initialization time.

For now, the Web Speech API provides the best balance of UX and performance for a chat interface.
