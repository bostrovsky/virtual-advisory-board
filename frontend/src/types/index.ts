// Advisor Types
export interface Advisor {
  id: string;
  name: string;
  title: string;
  avatar: string;
  isActive: boolean;
  isSpeaking: boolean;
  personality: {
    traits: string[];
    speakingStyle: string;
    expertise: string[];
  };
}

// Message Types
export interface Message {
  id: string;
  sessionId: string;
  sender: 'user' | 'advisor';
  senderName?: string;
  advisorId?: string;
  content: string;
  timestamp: Date;
  audioUrl?: string;
  isProcessing?: boolean;
}

// Session Types
export interface Session {
  id: string;
  userId?: string;
  activeAdvisors: string[];
  status: 'active' | 'paused' | 'ended';
  createdAt: Date;
  lastActivity: Date;
}

// Voice Interface Types
export interface VoiceState {
  isRecording: boolean;
  isPlaying: boolean;
  audioLevel: number;
  isProcessing: boolean;
  error?: string;
}

// WebSocket Message Types
export interface WSMessage {
  type: 'message' | 'advisor_join' | 'advisor_leave' | 'voice_start' | 'voice_end' | 'error';
  payload: any;
  timestamp: Date;
}

// Audio Types
export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
}

// UI State Types
export interface UIState {
  selectedAdvisors: string[];
  conversationMode: 'text' | 'voice' | 'mixed';
  isSessionActive: boolean;
  showAdvisorSelector: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// Conversation Context
export interface ConversationContext {
  messages: Message[];
  advisors: Advisor[];
  session: Session | null;
  voiceState: VoiceState;
  uiState: UIState;
}

// Default Advisors
export const DEFAULT_ADVISORS: Advisor[] = [
  {
    id: 'alex',
    name: 'Alex Hormozi',
    title: 'Business Growth Expert',
    avatar: '/advisors/alex.svg',
    isActive: false,
    isSpeaking: false,
    personality: {
      traits: ['direct', 'metrics-focused', 'framework-driven'],
      speakingStyle: 'numbered lists, blunt truths, actionable frameworks',
      expertise: ['scaling businesses', 'offers', 'customer acquisition']
    }
  },
  {
    id: 'mark',
    name: 'Mark Cuban',
    title: 'Entrepreneur & Investor',
    avatar: '/advisors/mark.svg',
    isActive: false,
    isSpeaking: false,
    personality: {
      traits: ['blunt', 'sales-focused', 'bootstrap-minded'],
      speakingStyle: 'short sentences, sales cure all, hustle mentality',
      expertise: ['sales', 'business fundamentals', 'bootstrapping']
    }
  },
  {
    id: 'sara',
    name: 'Sara Blakely',
    title: 'Founder & Innovator',
    avatar: '/advisors/sara.svg',
    isActive: false,
    isSpeaking: false,
    personality: {
      traits: ['persistent', 'authentic', 'scrappy'],
      speakingStyle: 'encouraging, story-driven, resourceful',
      expertise: ['product development', 'authentic marketing', 'founder journey']
    }
  },
  {
    id: 'seth',
    name: 'Seth Godin',
    title: 'Marketing Visionary',
    avatar: '/advisors/seth.svg',
    isActive: false,
    isSpeaking: false,
    personality: {
      traits: ['philosophical', 'contrarian', 'story-focused'],
      speakingStyle: 'metaphors, purple cow thinking, tribe building',
      expertise: ['marketing', 'brand building', 'purple cow concepts']
    }
  },
  {
    id: 'robert',
    name: 'Robert Kiyosaki',
    title: 'Financial Educator',
    avatar: '/advisors/robert.svg',
    isActive: false,
    isSpeaking: false,
    personality: {
      traits: ['financial-focused', 'asset-building', 'education-driven'],
      speakingStyle: 'rich dad poor dad analogies, cash flow focus',
      expertise: ['financial literacy', 'real estate', 'passive income']
    }
  },
  {
    id: 'tony',
    name: 'Tony Robbins',
    title: 'Performance Coach',
    avatar: '/advisors/tony.svg',
    isActive: false,
    isSpeaking: false,
    personality: {
      traits: ['energetic', 'psychology-focused', 'peak-performance'],
      speakingStyle: 'high energy, psychology insights, massive action',
      expertise: ['personal development', 'peak performance', 'psychology']
    }
  }
];