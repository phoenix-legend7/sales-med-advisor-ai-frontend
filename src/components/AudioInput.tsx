import clsx from "clsx";
import React from "react";
import { Mic, MicOff, Loader2, Volume, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoice } from "@/contexts/VoiceContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface AudioInputProps {}

const AudioInput: React.FC<AudioInputProps> = () => {
  const {
    isListening,
    isLoading,
    startConversation,
    endConversation,
    toggleListening,
  } = useVoice();
  const isMobile = useIsMobile();

  const micSize = isMobile ? "h-14 w-14" : "h-16 w-16";
  const micIconSize = isMobile ? "h-6 w-6" : "h-7 w-7";
  const volumeButtonSize = isMobile ? "h-9 w-9" : "h-10 w-10";

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleListening}
        className={clsx(
          "rounded-full bg-medical-light hover:bg-medical-accent shadow-md transition-transform hover:scale-105",
          volumeButtonSize
        )}
      >
        {!isListening ? (
          <VolumeX className="h-5 w-5 text-medical-secondary" />
        ) : (
          <Volume className="h-5 w-5 text-medical-secondary" />
        )}
      </Button>

      <Button
        variant={isListening ? "destructive" : "outline"}
        size="icon"
        className={clsx(
          "relative rounded-full transition-transform hover:scale-105 shadow-lg",
          isListening
            ? "bg-red-500 hover:bg-red-600"
            : "bg-medical-primary hover:bg-medical-secondary",
          micSize
        )}
        onClick={isListening ? endConversation : startConversation}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className={clsx(micIconSize, "animate-spin text-white")} />
        ) : isListening ? (
          <MicOff className={clsx(micIconSize, "text-white")} />
        ) : (
          <Mic className={clsx(micIconSize, "text-white")} />
        )}
        {isListening && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
          </span>
        )}
        <div
          className={clsx(
            "absolute -inset-2 rounded-full border-2 opacity-70 animate-pulse",
            isListening ? "border-red-300" : "border-medical-accent"
          )}
        />
        {isListening && (
          <div className="absolute -inset-4 rounded-full border-4 border-red-300/30 animate-ping"></div>
        )}
      </Button>
    </div>
  );
};

export default AudioInput;
