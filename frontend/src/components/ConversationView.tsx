'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, Advisor } from '@/types';

interface ConversationViewProps {
  messages: Message[];
  advisors: Advisor[];
  onSendMessage?: (message: string) => void;
  onPlayAudio?: (audioUrl: string) => void;
  isVoiceMode?: boolean;
  className?: string;
}

interface MessageItemProps {
  message: Message;
  advisor?: Advisor;
  onPlayAudio?: (audioUrl: string) => void;
}

function MessageItem({ message, advisor, onPlayAudio }: MessageItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongMessage = message.content.length > 300;

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(timestamp));
  };

  return (
    <motion.div
      className={`conversation-message ${message.sender}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20
      }}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar for advisor messages */}
        {message.sender === 'advisor' && advisor && (
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              <Image
                src={advisor.avatar}
                alt={advisor.name}
                width={40}
                height={40}
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const initials = advisor.name.split(' ').map(n => n[0]).join('').toUpperCase();
                    parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-600 font-semibold text-sm bg-gradient-to-br from-blue-100 to-purple-100">${initials}</div>`;
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900">
                {message.sender === 'user' ? 'You' : advisor?.name || message.senderName || 'Assistant'}
              </span>
              {advisor && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {advisor.title}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {formatTime(message.timestamp)}
              </span>
              {message.audioUrl && (
                <button
                  onClick={() => onPlayAudio?.(message.audioUrl!)}
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                  title="Play audio"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.5 13.5A.5.5 0 014 13H2a2 2 0 01-2-2V9a2 2 0 012-2h2a.5.5 0 01.5-.5l3.883-3.316zm2.617 3.674a1 1 0 000 1.5L14.707 10 12 12.25a1 1 0 101.414 1.414l3.5-3.5a1 1 0 000-1.414l-3.5-3.5A1 1 0 0012 5.836z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Message Content */}
          <div className="prose max-w-none">
            {message.isProcessing ? (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                <span className="italic">Processing...</span>
              </div>
            ) : (
              <div>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {isLongMessage && !isExpanded
                    ? `${message.content.substring(0, 300)}...`
                    : message.content
                  }
                </p>
                {isLongMessage && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-blue-600 hover:text-blue-800 text-sm mt-2 underline"
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Message Actions */}
          {!message.isProcessing && (
            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
              <button className="hover:text-gray-700 transition-colors">
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </button>
              {message.sender === 'advisor' && (
                <button className="hover:text-gray-700 transition-colors">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  Share
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ConversationView({
  messages,
  advisors,
  onSendMessage,
  onPlayAudio,
  isVoiceMode = false,
  className = ''
}: ConversationViewProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !onSendMessage || isSending) return;

    const messageToSend = inputMessage.trim();
    setIsSending(true);
    setSendError(null);
    setInputMessage('');

    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      console.error('Failed to send message:', error);
      setSendError('Failed to send message. Please try again.');
      setInputMessage(messageToSend); // Restore the message
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getAdvisorById = (advisorId: string) => {
    return advisors.find(advisor => advisor.id === advisorId);
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Conversation</h2>
            <p className="text-sm text-gray-600">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
              {isVoiceMode && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                  Voice Mode
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Clear conversation button */}
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start a Conversation</h3>
            <p className="text-gray-600">
              {isVoiceMode
                ? 'Use your voice or type a message to begin talking with your advisors.'
                : 'Type a message below to start your conversation with the advisors.'
              }
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                advisor={message.advisorId ? getAdvisorById(message.advisorId) : undefined}
                onPlayAudio={onPlayAudio}
              />
            ))}
          </AnimatePresence>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Only show in text mode */}
      {!isVoiceMode && (
        <div className="border-t p-3 md:p-4">
          {/* Error message */}
          {sendError && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {sendError}
            </div>
          )}

          <div className="flex items-end space-x-2 md:space-x-3">
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isSending ? "Sending..." : "Type your message here..."}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm md:text-base"
                disabled={!onSendMessage || isSending}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || !onSendMessage || isSending}
              className="px-3 md:px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send{!isSending && ', Shift+Enter for new line'}
          </p>
        </div>
      )}

      {/* Voice Mode Footer */}
      {isVoiceMode && (
        <div className="border-t p-4 text-center">
          <p className="text-sm text-gray-600">
            Use the voice interface below to speak with your advisors
          </p>
        </div>
      )}
    </div>
  );
}