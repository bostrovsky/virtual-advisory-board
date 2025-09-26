'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import FileUpload from '@/components/FileUpload';
import { getApiUrl } from '@/lib/api-config';

const ResearchAgent = dynamic(
  () => import('../../components/ResearchAgent'),
  { ssr: false }
);

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'advisor';
  advisorName?: string;
  timestamp: Date;
}

interface Advisor {
  id: string;
  name: string;
  description: string;
}

const ADVISORS: Advisor[] = [
  { id: 'alex', name: 'Alex Hormozi', description: 'Business scaling expert focused on offers and growth' },
  { id: 'mark', name: 'Mark Cuban', description: 'Entrepreneur, investor, and business strategist' },
  { id: 'sara', name: 'Sara Blakely', description: 'Entrepreneur and founder of Spanx' },
  { id: 'seth', name: 'Seth Godin', description: 'Marketing expert and author' },
  { id: 'robert', name: 'Robert Kiyosaki', description: 'Real estate investor and financial educator' },
  { id: 'tony', name: 'Tony Robbins', description: 'Peak performance coach and strategic advisor' }
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor>(ADVISORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'individual' | 'panel'>('individual');
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>(ADVISORS.map(a => a.id));
  const [showResearchAgent, setShowResearchAgent] = useState(false);
  const [advisorSuggestions, setAdvisorSuggestions] = useState<Array<{advisor: string; suggestion: string}>>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<{content: string; filename: string} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileContent = (content: string, filename: string) => {
    setUploadedDocument({ content, filename });
    setShowFileUpload(false);

    // Create a message that includes the document for review
    const documentMessage = `Please review this document (${filename}):\n\n${content.substring(0, 500)}${content.length > 500 ? '...' : ''}\n\n[Full document provided for review]`;
    setInputText(documentMessage);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      if (chatMode === 'individual') {
        // Individual chat
        const response = await fetch(getApiUrl('/api/chat'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageText,
            advisor: selectedAdvisor.id,
            context: [],
            document: uploadedDocument
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const data = await response.json();

        const advisorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          sender: 'advisor',
          advisorName: selectedAdvisor.name,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, advisorMessage]);
      } else {
        // Panel discussion
        const response = await fetch('/api/panel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: messageText,
            advisors: selectedAdvisors,
            document: uploadedDocument
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get panel response');
        }

        const data = await response.json();

        // Add all advisor responses
        data.responses.forEach((response: any, index: number) => {
          const advisorMessage: Message = {
            id: (Date.now() + index + 1).toString(),
            text: response.response,
            sender: 'advisor',
            advisorName: response.name,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, advisorMessage]);
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'advisor',
        advisorName: chatMode === 'individual' ? selectedAdvisor.name : 'System',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        {/* Top Row - Title and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Virtual Advisory Board
          </h1>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowResearchAgent(true)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Research
            </button>
            <a
              href="/admin"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin
            </a>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setChatMode('individual')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              chatMode === 'individual'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Individual Chat
          </button>
          <button
            onClick={() => setChatMode('panel')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              chatMode === 'panel'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Panel Discussion
          </button>
        </div>

        {/* Advisor Selection */}
        {chatMode === 'individual' ? (
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {ADVISORS.map((advisor) => (
                <button
                  key={advisor.id}
                  onClick={() => setSelectedAdvisor(advisor)}
                  className={`px-3 py-2 text-sm font-medium rounded-full transition-colors min-h-[44px] ${
                    selectedAdvisor.id === advisor.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {advisor.name.split(' ')[0]}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Currently chatting with <span className="font-medium text-blue-600">{selectedAdvisor.name}</span>
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-2">Select advisors for panel discussion:</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {ADVISORS.map((advisor) => (
                <button
                  key={advisor.id}
                  onClick={() => {
                    setSelectedAdvisors(prev =>
                      prev.includes(advisor.id)
                        ? prev.filter(id => id !== advisor.id)
                        : [...prev, advisor.id]
                    );
                  }}
                  className={`px-3 py-2 text-sm font-medium rounded-full transition-colors min-h-[44px] ${
                    selectedAdvisors.includes(advisor.id)
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {advisor.name.split(' ')[0]}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Selected advisors: <span className="font-medium text-blue-600">{selectedAdvisors.length}</span> of {ADVISORS.length}
            </p>
          </div>
        )}
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome to your Advisory Board!
              </h2>
              <p className="text-gray-600">
                {chatMode === 'individual'
                  ? 'Select an advisor above and start chatting'
                  : 'Choose advisors and start a panel discussion'
                }
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-2xl ${
                  message.sender === 'user' ? 'order-2' : 'order-1'
                }`}>
                  {message.sender === 'advisor' && (
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      {message.advisorName}
                    </div>
                  )}
                  <div
                    className={`p-3 rounded-lg shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed">
                      {message.text}
                    </div>
                  </div>
                  <div className={`mt-1 text-xs text-gray-500 ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-2xl">
                <div className="text-sm font-medium text-gray-600 mb-1">
                  {chatMode === 'individual' ? selectedAdvisor.name : 'Advisors'}
                </div>
                <div className="bg-white border border-gray-200 rounded-lg rounded-bl-sm shadow-sm p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* File Upload Area */}
      {showFileUpload && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <FileUpload onFileContent={handleFileContent} disabled={isLoading} />
            <button
              onClick={() => setShowFileUpload(false)}
              className="mt-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          {uploadedDocument && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-sm text-green-700 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {uploadedDocument.filename}
              </span>
              <button
                onClick={() => {
                  setUploadedDocument(null);
                  setInputText('');
                }}
                className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
              >
                Remove
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <textarea
              ref={(input) => { if (input) (window as any).chatInput = input; }}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                chatMode === 'individual'
                  ? `Message ${selectedAdvisor.name.split(' ')[0]}...`
                  : 'Ask your panel of advisors a question...'
              }
              className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              rows={1}
              disabled={isLoading}
              style={{
                minHeight: '48px',
                maxHeight: '120px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />

            <button
              onClick={() => setShowFileUpload(!showFileUpload)}
              disabled={isLoading}
              title="Upload document for review"
              className={`flex items-center justify-center w-12 h-12 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                showFileUpload
                  ? 'bg-blue-50 border-blue-300 text-blue-600'
                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>

            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
              className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </footer>

      {/* Research Agent Modal */}
      {showResearchAgent && (
        <ResearchAgent
          onClose={() => setShowResearchAgent(false)}
          currentContext={messages.map(m => `${m.sender === 'user' ? 'User' : m.advisorName}: ${m.text}`).join('\n')}
          advisorSuggestions={advisorSuggestions}
        />
      )}
    </div>
  );
}