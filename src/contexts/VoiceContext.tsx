import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useReducer,
  useRef,
  useState,
} from "react";
import conversationReducer from "./conversationReducer";

const initialConversation = {
  messages: [],
  finalTranscripts: [],
  interimTranscript: "",
};

function getMediaSource() {
  if ("MediaSource" in window) {
    return new MediaSource();
  } else if ("ManagedMediaSource" in window) {
    // Use ManagedMediaSource if available in iPhone
    return new ManagedMediaSource();
  } else {
    console.log("No MediaSource API available");
    return null;
  }
}

type VoiceContextType = {
  conversation: any;
  currentTranscript: string;
  error: string | null;
  isRunning: boolean;
  isListening: boolean;
  isConnected: boolean;
  isLoading: boolean;
  typingMessage: string;
  endConversation(): void;
  handleSendMessage(): Promise<void>;
  setTypingMessage: Dispatch<SetStateAction<string>>;
  startConversation(): Promise<void>;
  toggleListening(): void;
};

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [conversation, dispatch] = useReducer(
    conversationReducer,
    initialConversation
  );
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState("");
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);
  const audioElementRef = useRef(null);
  const audioDataRef = useRef([]);

  function openWebSocketConnection() {
    const ws_url =
      import.meta.env.VITE_APP_WS_URL || "ws://localhost:8000/listen";
    wsRef.current = new WebSocket(ws_url);
    wsRef.current.binaryType = "arraybuffer";

    wsRef.current.onopen = () => {
      setIsConnected(true);
    };

    function handleAudioStream(streamData) {
      audioDataRef.current.push(new Uint8Array(streamData));
      if (sourceBufferRef.current && !sourceBufferRef.current.updating) {
        sourceBufferRef.current.appendBuffer(audioDataRef.current.shift());
      }
    }
    function handleJsonMessage(jsonData) {
      const message = JSON.parse(jsonData);
      if (message.type === "finish") {
        endConversation();
      } else {
        // If user interrupts while audio is playing, skip the audio currently playing
        if (message.type === "transcript_final" && isAudioPlaying()) {
          skipCurrentAudio();
        }
        dispatch(message);
      }
    }

    wsRef.current.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        handleAudioStream(event.data);
      } else {
        handleJsonMessage(event.data);
      }
    };

    wsRef.current.onclose = () => {
      endConversation();
      setIsConnected(false);
      stopAudioPlayer();
    };
  }
  function closeWebSocketConnection() {
    if (wsRef.current) {
      wsRef.current.close();
    }
  }
  async function startMicrophone() {
    try {
      // Request microphone with audio quality options
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Check if audio context is allowed (for audio output)
      const audioContext = new window.AudioContext();
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.addEventListener("dataavailable", (e) => {
        if (
          e.data.size > 0 &&
          wsRef.current &&
          wsRef.current.readyState === WebSocket.OPEN
        ) {
          wsRef.current.send(e.data);
        }
      });
      mediaRecorderRef.current.start(250);

      return true;
    } catch (error) {
      console.error("Microphone access error:", error);
      throw error; // Re-throw to be handled by the caller
    }
  }
  function stopMicrophone() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  }
  function startAudioPlayer() {
    // Initialize MediaSource and event listeners
    mediaSourceRef.current = getMediaSource();
    if (!mediaSourceRef.current) {
      return;
    }

    mediaSourceRef.current.addEventListener("sourceopen", () => {
      if (!MediaSource.isTypeSupported("audio/mpeg")) return;

      sourceBufferRef.current =
        mediaSourceRef.current.addSourceBuffer("audio/mpeg");
      sourceBufferRef.current.addEventListener("updateend", () => {
        if (
          audioDataRef.current.length > 0 &&
          !sourceBufferRef.current.updating
        ) {
          sourceBufferRef.current.appendBuffer(audioDataRef.current.shift());
        }
      });
    });

    // Initialize Audio Element
    const audioUrl = URL.createObjectURL(mediaSourceRef.current);
    audioElementRef.current = new Audio(audioUrl);
    audioElementRef.current.play();
  }
  function isAudioPlaying() {
    return (
      audioElementRef.current.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA
    );
  }
  function skipCurrentAudio() {
    audioDataRef.current = [];
    const buffered = sourceBufferRef.current.buffered;
    if (buffered.length > 0) {
      if (sourceBufferRef.current.updating) {
        sourceBufferRef.current.abort();
      }
      audioElementRef.current.currentTime = buffered.end(buffered.length - 1);
    }
  }
  function stopAudioPlayer() {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      URL.revokeObjectURL(audioElementRef.current.src);
      audioElementRef.current = null;
    }

    if (mediaSourceRef.current) {
      if (sourceBufferRef.current) {
        mediaSourceRef.current.removeSourceBuffer(sourceBufferRef.current);
        sourceBufferRef.current = null;
      }
      mediaSourceRef.current = null;
    }

    audioDataRef.current = [];
  }
  async function startConversation() {
    setError(null);
    dispatch({ type: "reset" });
    try {
      if (!isConnected) {
        openWebSocketConnection();
      }
      try {
        await startMicrophone();
      } catch (micError) {
        // Handle specific microphone access errors
        if (
          micError.name === "NotAllowedError" ||
          micError.name === "PermissionDeniedError"
        ) {
          throw new Error(
            "Microphone access denied. Please allow microphone access to use the voice assistant."
          );
        } else if (
          micError.name === "NotFoundError" ||
          micError.name === "DevicesNotFoundError"
        ) {
          throw new Error(
            "No microphone found. Please connect a microphone to use the voice assistant."
          );
        } else {
          throw new Error(`Microphone error: ${micError.message}`);
        }
      }
      if (!isConnected) {
        startAudioPlayer();
      }
      setIsRunning(true);
      setIsListening(true);
    } catch (err) {
      setError(`${err.message}`);
      console.error("Error starting conversation:", err);
      endConversation();
    }
  }
  function endConversation() {
    closeWebSocketConnection();
    stopMicrophone();
    setIsRunning(false);
    setIsListening(false);
  }
  function toggleListening() {
    if (isListening) {
      mediaRecorderRef.current.pause();
    } else {
      mediaRecorderRef.current.resume();
    }
    setIsListening(!isListening);
  }
  function waitForWebSocket() {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (wsRef.current && wsRef.current.readyState === 1) {
          clearInterval(interval);
          resolve(true);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(interval);
        resolve(false);
      }, 30000);
    });
  }
  async function handleSendMessage() {
    setError(null);
    if (!typingMessage.trim()) return;
    try {
      setIsLoading(true);
      if (!isConnected) {
        dispatch({ type: "reset" });
        openWebSocketConnection();
        startAudioPlayer();
        const isConnected = await waitForWebSocket();
        if (!isConnected) {
          throw new Error("WebSocket connection failed");
        }
      }
      const message = { type: "transcript_final", content: typingMessage };
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify(message));
      }
      dispatch(message);
      setTypingMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError(`Error sending message: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  const currentTranscript = [
    ...conversation.finalTranscripts,
    conversation.interimTranscript,
  ].join(" ");

  return (
    <VoiceContext.Provider
      value={{
        conversation,
        currentTranscript,
        error,
        isRunning,
        isListening,
        isConnected,
        isLoading,
        typingMessage,
        endConversation,
        handleSendMessage,
        setTypingMessage,
        startConversation,
        toggleListening,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = (): VoiceContextType => {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error("useVoice must be used within a VoiceProvider");
  }
  return context;
};
