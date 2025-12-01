import { useState, useEffect, useCallback, useRef } from 'react';

interface TextToSpeechState {
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
}

interface TextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

export const useTextToSpeech = () => {
  const [state, setState] = useState<TextToSpeechState>({
    isSpeaking: false,
    isPaused: false,
    isSupported: false,
    voices: []
  });
  
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setState(prev => ({ ...prev, isSupported: true }));

      // Handle page unload/refresh
      const handleUnload = () => {
        window.speechSynthesis.cancel();
      };
      window.addEventListener('beforeunload', handleUnload);

      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setState(prev => ({ ...prev, voices }));
        
        // Try to select a good default voice
        // 1. Microsoft/Google US English (usually higher quality)
        // 2. First English voice
        // 3. First voice
        const defaultVoice = 
            voices.find(v => v.name.includes("Google US English")) || 
            voices.find(v => v.name.includes("Microsoft Zira")) ||
            voices.find(v => v.lang.startsWith("en-US")) ||
            voices.find(v => v.lang.startsWith("en")) ||
            voices[0];
            
        if (defaultVoice && !selectedVoice) {
            setSelectedVoice(defaultVoice);
        }
      };

      loadVoices();
      
      // Chrome loads voices asynchronously
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.removeEventListener('beforeunload', handleUnload);
        // If this hook instance was speaking, stop it on unmount
        if (isSpeakingRef.current) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, []);

  const speak = useCallback((text: string, options: TextToSpeechOptions = {}) => {
    if (!state.isSupported) return;

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply options or defaults
    utterance.voice = options.voice || selectedVoice || null;
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    utterance.onstart = () => {
      isSpeakingRef.current = true;
      setState(prev => ({ ...prev, isSpeaking: true, isPaused: false }));
    };
    utterance.onend = () => {
      isSpeakingRef.current = false;
      setState(prev => ({ ...prev, isSpeaking: false, isPaused: false }));
    };
    utterance.onpause = () => setState(prev => ({ ...prev, isPaused: true }));
    utterance.onresume = () => setState(prev => ({ ...prev, isPaused: false }));
    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setState(prev => ({ ...prev, isSpeaking: false, isPaused: false }));
    };

    window.speechSynthesis.speak(utterance);
  }, [state.isSupported, selectedVoice]);

  const cancel = useCallback(() => {
    if (!state.isSupported) return;
    window.speechSynthesis.cancel();
    isSpeakingRef.current = false;
    setState(prev => ({ ...prev, isSpeaking: false, isPaused: false }));
  }, [state.isSupported]);

  const pause = useCallback(() => {
    if (!state.isSupported) return;
    window.speechSynthesis.pause();
  }, [state.isSupported]);

  const resume = useCallback(() => {
    if (!state.isSupported) return;
    window.speechSynthesis.resume();
  }, [state.isSupported]);

  return {
    ...state,
    speak,
    cancel,
    pause,
    resume,
    selectedVoice,
    setSelectedVoice
  };
};

export const cleanMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  
  return markdown
    // Remove code blocks (too verbose to read)
    .replace(/```[\s\S]*?```/g, 'Code block.')
    // Remove inline code backticks
    .replace(/`([^`]+)`/g, '$1')
    // Remove links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images ![alt](url) -> alt
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove bold/italic
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove headers
    .replace(/^#+\s+/gm, '')
    // Replace newlines with pauses
    .replace(/\n+/g, '. ')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
};
