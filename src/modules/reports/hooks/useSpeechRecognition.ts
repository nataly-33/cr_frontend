import { useState, useCallback } from "react";

export interface UseSpeechRecognitionState {
  transcript: string;
  listening: boolean;
}

export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);

  const start = useCallback(() => {
    // Placeholder: in real app integrate Web Speech API or library
    setListening(true);
    setTranscript("");
  }, []);

  const stop = useCallback(() => {
    setListening(false);
  }, []);

  return {
    transcript,
    listening,
    start,
    stop,
  } as const;
};

export default useSpeechRecognition;
