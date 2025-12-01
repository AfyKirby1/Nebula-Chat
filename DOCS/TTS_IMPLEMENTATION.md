# TTS Implementation Plan (Future Reference)

This document outlines the steps to re-implement Text-to-Speech (TTS) using `kokoro-js`, a high-quality, open-source, in-browser TTS engine. This implementation was previously tested and verified but removed to keep the production build lightweight.

## 1. Dependencies

Install the required package:
```bash
npm install kokoro-js
```

## 2. Custom Hook (`src/hooks/useTTS.ts`)

Create a hook to manage the TTS model, state, and audio playback. This implementation uses a singleton pattern to avoid reloading the model (approx. 80-90MB) multiple times.

```typescript
import { useState, useRef, useCallback, useEffect } from 'react';
import { KokoroTTS } from 'kokoro-js';

const MODEL_ID = "hexgrad/Kokoro-82M";

// Singleton to share model across instances
let globalTTS: KokoroTTS | null = null;
let initPromise: Promise<KokoroTTS> | null = null;
let globalSource: AudioBufferSourceNode | null = null;
let globalStopCurrent: (() => void) | null = null;

interface TTSState {
  isLoading: boolean;
  isSpeaking: boolean;
  error: string | null;
}

export const useTTS = () => {
  const [state, setState] = useState<TTSState>({
    isLoading: false,
    isSpeaking: false,
    error: null,
  });
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const init = useCallback(async () => {
    if (globalTTS) return globalTTS;
    
    if (initPromise) {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        await initPromise;
        setState(prev => ({ ...prev, isLoading: false }));
        return globalTTS;
      } catch (err) {
        setState(prev => ({ ...prev, isLoading: false, error: "Failed to load TTS model" }));
        return null;
      }
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    initPromise = (async () => {
      try {
        // Using q8 for better performance/size ratio in browser (~90MB)
        const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
          dtype: "q8", 
          device: "wasm" 
        });
        globalTTS = tts;
        return tts;
      } catch (err) {
        console.error("Failed to initialize TTS:", err);
        throw err;
      } finally {
        initPromise = null;
      }
    })();

    try {
      await initPromise;
      setState(prev => ({ ...prev, isLoading: false }));
      return globalTTS;
    } catch (err) {
      setState(prev => ({ ...prev, isLoading: false, error: "Failed to load TTS model" }));
      return null;
    }
  }, []);

  const stop = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      sourceRef.current = null;
    }
    setState(prev => ({ ...prev, isSpeaking: false }));
    
    // Clear global if it matches us
    if (globalSource === sourceRef.current) {
      globalSource = null;
      globalStopCurrent = null;
    }
  }, []);

  const speak = useCallback(async (text: string, voice: string = "af_heart") => {
    if (!text) return;
    
    // Ensure initialized
    if (!globalTTS) {
      await init();
    }
    
    if (!globalTTS) return; // Init failed

    // Stop any global playback first
    if (globalStopCurrent) {
      globalStopCurrent();
    }
    
    setState(prev => ({ ...prev, isSpeaking: true, error: null }));

    try {
      const audio = await globalTTS.generate(text, {
        voice: voice as any,
      });

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const buffer = ctx.createBuffer(1, audio.audio.length, audio.sampling_rate);
      buffer.getChannelData(0).set(audio.audio);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      
      source.onended = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
        sourceRef.current = null;
        if (globalSource === source) {
          globalSource = null;
          globalStopCurrent = null;
        }
      };
      
      sourceRef.current = source;
      globalSource = source;
      globalStopCurrent = stop;
      
      source.start();
      
    } catch (err) {
      console.error("TTS generation failed:", err);
      setState(prev => ({ ...prev, isSpeaking: false, error: "Failed to generate speech" }));
    }
  }, [init, stop]);

  useEffect(() => {
    return () => {
      stop();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stop]);

  return {
    speak,
    stop,
    ...state,
    init
  };
};
```

## 3. UI Integration (`MessageBubble.tsx`)

Integrate the hook into the message component to add a "Read Aloud" button.

1.  **Imports:**
    ```typescript
    import { Volume2, Square, Loader2 } from "lucide-react";
    import { useTTS } from "@/hooks/useTTS";
    ```

2.  **Hook Usage:**
    ```typescript
    const { speak, stop, isSpeaking, isLoading: isTTSLoading } = useTTS();
    ```

3.  **Button Implementation:**
    Add this button to the message action bar (where Copy/Edit buttons are):
    ```tsx
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
      onClick={() => {
        if (isSpeaking) {
          stop();
        } else {
          speak(message.content);
        }
      }}
      title={isSpeaking ? "Stop reading" : "Read aloud"}
      disabled={isTTSLoading}
    >
      {isTTSLoading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : isSpeaking ? (
        <Square size={12} className="fill-current" />
      ) : (
        <Volume2 size={12} />
      )}
    </Button>
    ```

## 4. Notes
*   **Model Size:** The quantized model (`q8`) is approximately **90MB**.
*   **Caching:** The model is cached in the user's browser after the first download.
*   **Offline:** Once loaded, TTS works completely offline.
*   **Performance:** Uses WebAssembly (WASM) for efficient CPU inference.
