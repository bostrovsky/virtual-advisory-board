'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageText,
            advisor: selectedAdvisor.id,
            context: []
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
            advisors: selectedAdvisors
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
    <div className="flex flex-col h-screen" style={{backgroundColor: 'var(--tt-container)'}}>
      {/* Header */}
      <div className="bg-white shadow-sm" style={{borderBottom: '1px solid var(--tt-border-neutral)', padding: 'var(--tt-space-4) var(--tt-space-6)'}}>
        <div className="flex justify-between items-center" style={{marginBottom: 'var(--tt-space-5)'}}>
          <h1 style={{fontSize: 'var(--tt-font-size-3xl)', fontWeight: 'var(--tt-font-weight-bold)', lineHeight: 'var(--tt-line-height-tight)', color: 'var(--tt-text-primary)'}}>Virtual Advisory Board</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowResearchAgent(true)}
              className="inline-flex items-center transition-all duration-200 focus:outline-none hover:bg-gray-50"
              style={{
                padding: '0.5rem 1rem',
                fontSize: 'var(--tt-font-size-sm)',
                fontWeight: 'var(--tt-font-weight-medium)',
                borderRadius: 'var(--tt-radius-md)',
                backgroundColor: 'white',
                color: 'var(--tt-text-primary)',
                border: '1px solid var(--tt-border-neutral)',
                cursor: 'pointer'
              }}
            >
              🔬 Research
            </button>
            <a
              href="/admin"
              className="inline-flex items-center transition-all duration-200 focus:outline-none"
              style={{
                padding: '0.5rem 1rem',
                fontSize: 'var(--tt-font-size-sm)',
                fontWeight: 'var(--tt-font-weight-medium)',
                borderRadius: 'var(--tt-radius-md)',
                backgroundColor: 'white',
                color: 'var(--tt-text-primary)',
                border: '1px solid var(--tt-border-neutral)',
                textDecoration: 'none'
              }}
            >
              ⚙️ Admin
            </a>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="flex mb-4" style={{gap: 'var(--tt-space-3)'}}>
          <button
            onClick={() => setChatMode('individual')}
            className="inline-flex items-center transition-all duration-200 focus:outline-none"
            style={{
              padding: '0.5rem 1rem',
              fontSize: 'var(--tt-font-size-sm)',
              fontWeight: 'var(--tt-font-weight-medium)',
              borderRadius: 'var(--tt-radius-md)',
              backgroundColor: chatMode === 'individual' ? 'var(--tt-primary)' : 'white',
              color: chatMode === 'individual' ? 'white' : 'var(--tt-text-primary)',
              border: chatMode === 'individual' ? '1px solid var(--tt-primary)' : '1px solid var(--tt-border-neutral)',
              boxShadow: chatMode === 'individual' ? 'var(--tt-shadow-sm)' : 'none'
            }}
          >
            Individual Chat
          </button>
          <button
            onClick={() => setChatMode('panel')}
            className="inline-flex items-center transition-all duration-200 focus:outline-none"
            style={{
              padding: '0.5rem 1rem',
              fontSize: 'var(--tt-font-size-sm)',
              fontWeight: 'var(--tt-font-weight-medium)',
              borderRadius: 'var(--tt-radius-md)',
              backgroundColor: chatMode === 'panel' ? 'var(--tt-primary)' : 'white',
              color: chatMode === 'panel' ? 'white' : 'var(--tt-text-primary)',
              border: chatMode === 'panel' ? '1px solid var(--tt-primary)' : '1px solid var(--tt-border-neutral)',
              boxShadow: chatMode === 'panel' ? 'var(--tt-shadow-sm)' : 'none'
            }}
          >
            Panel Discussion
          </button>
        </div>

        {chatMode === 'individual' ? (
          <>
            {/* Individual Advisor Selection */}
            <div className="flex flex-wrap mb-3" style={{gap: 'var(--tt-space-3)'}}>
              {ADVISORS.map((advisor) => (
                <button
                  key={advisor.id}
                  onClick={() => setSelectedAdvisor(advisor)}
                  className="inline-flex items-center transition-all duration-200 focus:outline-none"
                  style={{
                    padding: '0.625rem 1.25rem',
                    fontSize: 'var(--tt-font-size-sm)',
                    fontWeight: 'var(--tt-font-weight-medium)',
                    borderRadius: 'var(--tt-radius-full)',
                    backgroundColor: selectedAdvisor.id === advisor.id ? 'var(--tt-primary)' : 'white',
                    color: selectedAdvisor.id === advisor.id ? 'white' : 'var(--tt-text-primary)',
                    border: selectedAdvisor.id === advisor.id ? '1px solid var(--tt-primary)' : '1px solid var(--tt-border-neutral)',
                    boxShadow: selectedAdvisor.id === advisor.id ? 'var(--tt-shadow-sm)' : 'none'
                  }}
                >
                  {advisor.name.split(' ')[0]}
                </button>
              ))}
            </div>

            <div style={{fontSize: 'var(--tt-font-size-sm)', color: 'var(--tt-text-secondary)'}}>
              Currently chatting with <span style={{fontWeight: 'var(--tt-font-weight-medium)', color: 'var(--tt-primary)'}}>{selectedAdvisor.name.split(' ')[0]}</span>
            </div>
          </>
        ) : (
          <>
            {/* Panel Advisor Selection */}
            <div style={{fontSize: 'var(--tt-font-size-sm)', color: 'var(--tt-text-secondary)', marginBottom: 'var(--tt-space-3)'}}>
              Select advisors for panel discussion:
            </div>
            <div className="flex flex-wrap mb-3" style={{gap: 'var(--tt-space-3)'}}>
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
                  className="inline-flex items-center transition-all duration-200 focus:outline-none"
                  style={{
                    padding: '0.625rem 1.25rem',
                    fontSize: 'var(--tt-font-size-sm)',
                    fontWeight: 'var(--tt-font-weight-medium)',
                    borderRadius: 'var(--tt-radius-full)',
                    backgroundColor: selectedAdvisors.includes(advisor.id) ? 'var(--tt-primary)' : 'white',
                    color: selectedAdvisors.includes(advisor.id) ? 'white' : 'var(--tt-text-primary)',
                    border: selectedAdvisors.includes(advisor.id) ? '1px solid var(--tt-primary)' : '1px solid var(--tt-border-neutral)',
                    boxShadow: selectedAdvisors.includes(advisor.id) ? 'var(--tt-shadow-sm)' : 'none'
                  }}
                >
                  {advisor.name.split(' ')[0]}
                </button>
              ))}
            </div>

            <div style={{fontSize: 'var(--tt-font-size-sm)', color: 'var(--tt-text-secondary)'}}>
              Selected advisors: <span style={{fontWeight: 'var(--tt-font-weight-medium)', color: 'var(--tt-primary)'}}>{selectedAdvisors.length}</span> of {ADVISORS.length}
            </div>
          </>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto" style={{padding: 'var(--tt-space-4) var(--tt-space-6)', gap: 'var(--tt-space-4)', display: 'flex', flexDirection: 'column'}}>
        {messages.length === 0 ? (
          <div className="text-center" style={{marginTop: 'var(--tt-space-10)'}}>
            <div style={{fontSize: '4rem', marginBottom: 'var(--tt-space-4)'}}>👋</div>
            <div style={{fontSize: 'var(--tt-font-size-2xl)', fontWeight: 'var(--tt-font-weight-semibold)', marginBottom: 'var(--tt-space-2)', color: 'var(--tt-text-primary)'}}>Welcome to your Advisory Board!</div>
            <div style={{color: 'var(--tt-text-secondary)'}}>
              {chatMode === 'individual'
                ? 'Select an advisor above and start chatting'
                : 'Choose advisors and start a panel discussion'
              }
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              style={{marginBottom: 'var(--tt-space-4)'}}
            >
              <div className={`max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl ${
                message.sender === 'user' ? 'order-2' : 'order-1'
              }`}>
                {message.sender === 'advisor' && (
                  <div style={{fontSize: 'var(--tt-font-size-sm)', fontWeight: 'var(--tt-font-weight-medium)', color: 'var(--tt-text-secondary)', marginBottom: 'var(--tt-space-1)'}}>
                    {message.advisorName}
                  </div>
                )}
                <div
                  style={{
                    padding: 'var(--tt-space-3) var(--tt-space-4)',
                    borderRadius: message.sender === 'user' ? 'var(--tt-radius-lg) var(--tt-radius-lg) var(--tt-radius-sm) var(--tt-radius-lg)' : 'var(--tt-radius-lg) var(--tt-radius-lg) var(--tt-radius-lg) var(--tt-radius-sm)',
                    fontSize: 'var(--tt-font-size-md)',
                    lineHeight: 'var(--tt-line-height-normal)',
                    backgroundColor: message.sender === 'user' ? 'var(--tt-primary)' : 'white',
                    color: message.sender === 'user' ? 'white' : 'var(--tt-text-primary)',
                    border: message.sender === 'user' ? 'none' : '1px solid var(--tt-border-neutral)',
                    boxShadow: 'var(--tt-shadow-sm)'
                  }}
                >
                  <div className="whitespace-pre-wrap">{message.text}</div>
                </div>
                <div className={`mt-1 ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                }`} style={{fontSize: 'var(--tt-font-size-xs)', color: 'var(--tt-text-disabled)'}}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start" style={{marginBottom: 'var(--tt-space-4)'}}>
            <div className="max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl">
              <div style={{fontSize: 'var(--tt-font-size-sm)', fontWeight: 'var(--tt-font-weight-medium)', color: 'var(--tt-text-secondary)', marginBottom: 'var(--tt-space-1)'}}>
                {selectedAdvisor.name}
              </div>
              <div style={{
                backgroundColor: 'white',
                color: 'var(--tt-text-primary)',
                border: '1px solid var(--tt-border-neutral)',
                borderRadius: 'var(--tt-radius-lg) var(--tt-radius-lg) var(--tt-radius-lg) var(--tt-radius-sm)',
                boxShadow: 'var(--tt-shadow-sm)',
                padding: 'var(--tt-space-3) var(--tt-space-4)'
              }}>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{backgroundColor: 'var(--tt-text-disabled)'}}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{backgroundColor: 'var(--tt-text-disabled)', animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{backgroundColor: 'var(--tt-text-disabled)', animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white" style={{borderTop: '1px solid var(--tt-border-neutral)', padding: 'var(--tt-space-4)'}}>
        <div className="flex" style={{gap: 'var(--tt-space-3)'}}>
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
            className="flex-1 resize-none transition-all duration-200 focus:outline-none"
            rows={1}
            disabled={isLoading}
            style={{
              border: '1px solid var(--tt-border-neutral)',
              borderRadius: 'var(--tt-radius-lg)',
              padding: '0.625rem 0.75rem',
              fontSize: 'var(--tt-font-size-md)',
              minHeight: '48px',
              maxHeight: '120px',
              backgroundColor: 'var(--tt-container)',
              ...(isLoading && {
                opacity: '0.5',
                cursor: 'not-allowed'
              })
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--tt-border-focus)';
              e.target.style.backgroundColor = 'white';
              e.target.style.boxShadow = '0 0 0 4px rgba(99, 91, 255, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--tt-border-neutral)';
              e.target.style.backgroundColor = 'var(--tt-container)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="transition-all duration-200 focus:outline-none"
            style={{
              padding: 'var(--tt-space-3)',
              borderRadius: 'var(--tt-radius-full)',
              backgroundColor: (!inputText.trim() || isLoading) ? 'var(--tt-text-disabled)' : 'var(--tt-primary)',
              color: 'white',
              border: 'none',
              cursor: (!inputText.trim() || isLoading) ? 'not-allowed' : 'pointer',
              boxShadow: (!inputText.trim() || isLoading) ? 'none' : 'var(--tt-shadow-sm)'
            }}
            onMouseEnter={(e) => {
              if (!(!inputText.trim() || isLoading)) {
                e.currentTarget.style.backgroundColor = 'var(--tt-primary-dark)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = 'var(--tt-shadow-md)';
              }
            }}
            onMouseLeave={(e) => {
              if (!(!inputText.trim() || isLoading)) {
                e.currentTarget.style.backgroundColor = 'var(--tt-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--tt-shadow-sm)';
              }
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </div>
      </div>

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