
import React, { useState, useRef } from 'react';
import { Mic, MicOff, Loader2, Volume, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoice } from '@/contexts/VoiceContext';
import { transcribeAudio } from '@/services/deepgramService';
import { useIsMobile } from '@/hooks/use-mobile';

interface AudioInputProps {
  onTranscription: (text: string) => void;
}

const AudioInput: React.FC<AudioInputProps> = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isSpeaking, volume, setVolume } = useVoice();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isMobile = useIsMobile();

  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        
        // Create audio blob from chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Use Deepgram to transcribe the audio
        const transcription = await transcribeAudio(audioBlob);
        
        if (transcription) {
          onTranscription(transcription);
        } else {
          console.error('Failed to transcribe audio');
        }
        
        setIsProcessing(false);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleVolume = () => {
    setVolume(volume === 0 ? 0.8 : 0);
  };

  const micSize = isMobile ? "h-14 w-14" : "h-16 w-16";
  const micIconSize = isMobile ? "h-6 w-6" : "h-7 w-7";
  const volumeButtonSize = isMobile ? "h-9 w-9" : "h-10 w-10";

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleVolume}
        className={`rounded-full bg-medical-light hover:bg-medical-accent ${volumeButtonSize} shadow-md transition-transform hover:scale-105`}
      >
        {volume === 0 ? (
          <VolumeX className="h-5 w-5 text-medical-secondary" />
        ) : (
          <Volume className="h-5 w-5 text-medical-secondary" />
        )}
      </Button>

      <Button
        variant={isRecording ? "destructive" : "outline"}
        size="icon"
        className={`relative rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-medical-primary hover:bg-medical-secondary'} ${micSize} transition-transform hover:scale-105 shadow-lg`}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing || isSpeaking}
      >
        {isProcessing ? (
          <Loader2 className={`${micIconSize} animate-spin text-white`} />
        ) : isRecording ? (
          <MicOff className={`${micIconSize} text-white`} />
        ) : (
          <Mic className={`${micIconSize} text-white`} />
        )}
        {isRecording && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
          </span>
        )}
        <div className={`absolute -inset-2 rounded-full border-2 ${isRecording ? 'border-red-300' : 'border-medical-accent'} opacity-70 animate-pulse`}></div>
        {isRecording && (
          <div className="absolute -inset-4 rounded-full border-4 border-red-300/30 animate-ping"></div>
        )}
      </Button>
    </div>
  );
};

export default AudioInput;
