import clsx from "clsx";
import React, { useRef, useEffect } from "react";
import { Send, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import AudioInput from "./AudioInput";
import { useVoice } from "@/contexts/VoiceContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const {
    conversation,
    currentTranscript,
    isLoading,
    isListening,
    isRunning,
    typingMessage,
    handleSendMessage,
    setTypingMessage,
  } = useVoice();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card className="flex flex-col h-full bg-white/90 backdrop-blur-sm shadow-lg border-medical-light rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center text-muted-foreground bg-white/80 p-6 rounded-xl shadow-sm border border-medical-light max-w-md mx-auto">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-medical-primary to-medical-secondary flex items-center justify-center animate-pulse-light">
                <Volume2 className="h-10 w-10 md:h-12 md:w-12 text-white" />
              </div>
              <p className="text-xl md:text-2xl font-medium mb-2 md:mb-3 text-medical-secondary">
                Welcome to GPAI
              </p>
              <p className="mb-3 md:mb-4 text-base md:text-lg">
                Your medical AI assistant
              </p>
              <div className="mt-3 md:mt-4 flex items-center justify-center space-x-2 animate-bounce">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-medical-primary rounded-full"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 bg-medical-secondary rounded-full"></div>
                <div className="w-2 h-2 md:w-3 md:h-3 bg-medical-primary rounded-full"></div>
              </div>
              <p className="mt-3 md:mt-4 text-xs md:text-sm opacity-75">
                Tap the microphone to start speaking
              </p>
            </div>
          </div>
        ) : (
          conversation.messages.map(({ role, content }, index) => (
            <div
              key={index}
              className={clsx(
                "flex animate-fade-in",
                role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={clsx(
                  "chat-bubble",
                  isMobile ? "max-w-[85%]" : "max-w-md",
                  role === "user"
                    ? "chat-bubble-user shadow-md"
                    : "chat-bubble-assistant shadow-md"
                )}
              >
                {role === "assistant" && (
                  <div className="flex items-center mb-2 space-x-1 text-xs text-medical-secondary opacity-70">
                    <Volume2 className="h-3 w-3" />
                    <span className="animate-pulse-light">
                      GPAI speaking...
                    </span>
                  </div>
                )}
                <p className="leading-relaxed">{content}</p>
                {/* <div className="text-xs text-right mt-1 opacity-70">
                  {formatTime(message.timestamp)}
                </div> */}
              </div>
            </div>
          ))
        )}
        {(isLoading || isRunning) && (
          <div>
            {!!currentTranscript && (
              <div
                className={clsx(
                  "chat-bubble chat-bubble-assistant shadow-md",
                  isMobile ? "max-w-[85%]" : "max-w-md"
                )}
              >
                <p className="leading-relaxed">{currentTranscript}</p>
              </div>
            )}
            <div className="flex justify-start">
              <div className="chat-bubble chat-bubble-assistant flex space-x-2 shadow-md">
                <div className="h-2 w-2 bg-medical-secondary rounded-full animate-pulse"></div>
                <div className="h-2 w-2 bg-medical-secondary rounded-full animate-pulse delay-150"></div>
                <div className="h-2 w-2 bg-medical-secondary rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef}></div>
      </div>
      <div className="p-3 md:p-4 border-t bg-white/90">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <Input
              placeholder="Ask your medical question..."
              value={typingMessage}
              onChange={(e) => setTypingMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="border-medical-light focus-visible:ring-medical-primary shadow-sm"
              disabled={isLoading || isRunning || isListening}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={
              !typingMessage.trim() || isLoading || isListening || isRunning
            }
            className="bg-medical-primary hover:bg-medical-secondary shadow-sm transition-all duration-200"
          >
            <Send className="h-4 w-4" />
          </Button>
          <AudioInput />
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
