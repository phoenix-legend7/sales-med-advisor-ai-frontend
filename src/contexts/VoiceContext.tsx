
import React, { createContext, useContext, useState, useEffect } from 'react';

type VoiceContextType = {
  isSpeaking: boolean;
  isListening: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  startSpeaking: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  startListening: () => Promise<void>;
  stopListening: () => void;
};

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [deepgramTTS, setDeepgramTTS] = useState<any>(null);

  const startSpeaking = async (text: string) => {
    if (!text) return;
    
    try {
      setIsSpeaking(true);
      
      // Placeholder for Deepgram TTS API call
      // This will be replaced with actual Deepgram TTS implementation once API key is provided
      console.log('TTS speaking:', text);
      
      // Simulate TTS duration based on text length
      await new Promise(resolve => setTimeout(resolve, text.length * 50));
      
      setIsSpeaking(false);
    } catch (error) {
      console.error('TTS Error:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    // Stop the TTS output
    setIsSpeaking(false);
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      // Placeholder for Deepgram STT API initialization
      // This will be replaced with actual Deepgram STT implementation
    } catch (error) {
      console.error('STT Error:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false);
    // Clean up STT resources
  };

  return (
    <VoiceContext.Provider 
      value={{ 
        isSpeaking, 
        isListening, 
        volume,
        setVolume,
        startSpeaking, 
        stopSpeaking, 
        startListening, 
        stopListening
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = (): VoiceContextType => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
