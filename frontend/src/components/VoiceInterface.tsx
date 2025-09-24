'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceState } from '@/types';
import { wsManager } from '@/lib/websocket';

interface VoiceInterfaceProps {
  sessionId?: string;
  onTranscript?: (transcript: string) => void;
  onAudioLevel?: (level: number) => void;
  disabled?: boolean;
}

export default function VoiceInterface({
  sessionId,
  onTranscript,
  onAudioLevel,
  disabled = false
}: VoiceInterfaceProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isRecording: false,
    isPlaying: false,
    audioLevel: 0,
    isProcessing: false
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize audio context and analyzer
  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;

      // Create audio context for visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Create media recorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm;codecs=opus'
        });
        audioChunksRef.current = [];

        if (sessionId) {
          wsManager.sendVoiceData(audioBlob, sessionId);
        }

        setVoiceState(prev => ({
          ...prev,
          isProcessing: true
        }));
      };

      return true;
    } catch (error) {
      console.error('Error initializing audio:', error);
      setVoiceState(prev => ({
        ...prev,
        error: 'Microphone access denied or not available'
      }));
      return false;
    }
  }, [sessionId]);

  // Audio level monitoring
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate RMS for audio level
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += (dataArray[i] / 255) * (dataArray[i] / 255);
    }
    const rms = Math.sqrt(sum / dataArray.length);
    const level = Math.min(rms * 10, 1); // Normalize to 0-1

    setVoiceState(prev => ({
      ...prev,
      audioLevel: level
    }));

    onAudioLevel?.(level);

    if (voiceState.isRecording) {
      animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
    }
  }, [voiceState.isRecording, onAudioLevel]);

  // Start recording
  const startRecording = useCallback(async () => {
    if (disabled || voiceState.isRecording) return;

    const initialized = await initializeAudio();
    if (!initialized) return;

    try {
      audioChunksRef.current = [];
      mediaRecorderRef.current?.start(250); // Collect data every 250ms

      setVoiceState(prev => ({
        ...prev,
        isRecording: true,
        error: undefined
      }));

      // Start audio level monitoring
      monitorAudioLevel();
    } catch (error) {
      console.error('Error starting recording:', error);
      setVoiceState(prev => ({
        ...prev,
        error: 'Failed to start recording'
      }));
    }
  }, [disabled, voiceState.isRecording, initializeAudio, monitorAudioLevel]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (!voiceState.isRecording) return;

    try {
      mediaRecorderRef.current?.stop();

      setVoiceState(prev => ({
        ...prev,
        isRecording: false,
        audioLevel: 0
      }));

      // Stop audio level monitoring
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Clean up stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setVoiceState(prev => ({
        ...prev,
        error: 'Failed to stop recording'
      }));
    }
  }, [voiceState.isRecording]);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    if (voiceState.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [voiceState.isRecording, startRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Keyboard shortcut (spacebar to talk)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat && !disabled) {
        event.preventDefault();
        if (!voiceState.isRecording) {
          startRecording();
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !disabled) {
        event.preventDefault();
        if (voiceState.isRecording) {
          stopRecording();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [disabled, voiceState.isRecording, startRecording, stopRecording]);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Voice Button */}
      <motion.button
        onClick={toggleRecording}
        disabled={disabled || voiceState.isProcessing}
        className={`voice-button ${voiceState.isRecording ? 'active' : 'inactive'}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: voiceState.isRecording ? [1, 1.1, 1] : 1,
        }}
        transition={{
          scale: {
            repeat: voiceState.isRecording ? Infinity : 0,
            duration: 1
          }
        }}
      >
        <motion.div
          className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
          animate={{
            scale: 1 + voiceState.audioLevel * 0.5
          }}
        >
          {voiceState.isRecording ? (
            <div className="w-4 h-4 bg-red-500 rounded-sm" />
          ) : (
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </motion.div>
      </motion.button>

      {/* Status Indicator */}
      <div className="text-center">
        <AnimatePresence mode="wait">
          {voiceState.isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 text-blue-600"
            >
              <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-sm">Processing...</span>
            </motion.div>
          )}

          {voiceState.isRecording && !voiceState.isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-red-600"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                <span className="text-sm">Recording...</span>
              </div>
            </motion.div>
          )}

          {!voiceState.isRecording && !voiceState.isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-gray-600"
            >
              <span className="text-sm">
                {disabled ? 'Voice disabled' : 'Press spacebar or click to speak'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Audio Level Visualization */}
      {voiceState.isRecording && (
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-red-500 rounded-full"
            animate={{
              width: `${voiceState.audioLevel * 100}%`
            }}
            transition={{ duration: 0.1 }}
          />
        </div>
      )}

      {/* Error Display */}
      {voiceState.error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm text-center"
        >
          {voiceState.error}
        </motion.div>
      )}
    </div>
  );
}