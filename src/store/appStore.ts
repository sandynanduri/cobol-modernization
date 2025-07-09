
import { create } from 'zustand';

export interface CobolAnalysis {
  fileType: 'main-program' | 'copybook' | 'subprogram' | 'unknown';
  divisions: string[];
  hasIdentificationDivision: boolean;
  hasEnvironmentDivision: boolean;
  hasDataDivision: boolean;
  hasProcedureDivision: boolean;
  dependencies: {
    copyStatements: string[];
    callStatements: string[];
    fileAssignments: string[];
    databaseConnections: string[];
    externalReferences: string[];
  };
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string;
  uploadedAt: Date;
  cobolAnalysis?: CobolAnalysis;
}

export interface ChatMessage {
  id: string;
  type: 'system' | 'user';
  content: string;
  timestamp: Date;
}

export interface ConversionSession {
  id: string;
  fileName: string;
  targetLanguage: 'python' | 'java';
  linesProcessed: number;
  linesConverted: number;
  status: 'analyzing' | 'correcting' | 'converting' | 'completed' | 'failed';
  createdAt: Date;
  compilationStatus: 'pending' | 'success' | 'failed';
  testResults?: {
    passed: number;
    failed: number;
    total: number;
  };
}

interface AppState {
  // Current session
  currentFile: UploadedFile | null;
  targetLanguage: 'python' | 'java' | null;
  chatMessages: ChatMessage[];
  businessLogic: string;
  pseudoCode: string;
  convertedCode: string;
  currentStep: 'upload' | 'analyze' | 'convert' | 'dashboard';
  
  // Statistics
  sessions: ConversionSession[];
  totalFilesUploaded: number;
  totalLinesProcessed: number;
  pythonConversions: number;
  javaConversions: number;
  successfulCompilations: number;
  
  // Actions
  setCurrentFile: (file: UploadedFile | null) => void;
  setTargetLanguage: (language: 'python' | 'java' | null) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setBusinessLogic: (logic: string) => void;
  setPseudoCode: (code: string) => void;
  setConvertedCode: (code: string) => void;
  setCurrentStep: (step: 'upload' | 'analyze' | 'convert' | 'dashboard') => void;
  addSession: (session: Omit<ConversionSession, 'id' | 'createdAt'>) => void;
  updateSessionStatus: (sessionId: string, status: ConversionSession['status']) => void;
  resetCurrentSession: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  currentFile: null,
  targetLanguage: null,
  chatMessages: [],
  businessLogic: '',
  pseudoCode: '',
  convertedCode: '',
  currentStep: 'upload',
  
  // Statistics
  sessions: [],
  totalFilesUploaded: 0,
  totalLinesProcessed: 0,
  pythonConversions: 0,
  javaConversions: 0,
  successfulCompilations: 0,
  
  // Actions
  setCurrentFile: (file) => set({ currentFile: file }),
  setTargetLanguage: (language) => set({ targetLanguage: language }),
  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    }]
  })),
  setBusinessLogic: (logic) => set({ businessLogic: logic }),
  setPseudoCode: (code) => set({ pseudoCode: code }),
  setConvertedCode: (code) => set({ convertedCode: code }),
  setCurrentStep: (step) => set({ currentStep: step }),
  addSession: (session) => {
    const newSession: ConversionSession = {
      ...session,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    set((state) => ({
      sessions: [...state.sessions, newSession],
      totalFilesUploaded: state.totalFilesUploaded + 1,
      totalLinesProcessed: state.totalLinesProcessed + session.linesProcessed,
      pythonConversions: session.targetLanguage === 'python' 
        ? state.pythonConversions + 1 
        : state.pythonConversions,
      javaConversions: session.targetLanguage === 'java' 
        ? state.javaConversions + 1 
        : state.javaConversions
    }));
  },
  updateSessionStatus: (sessionId, status) => set((state) => ({
    sessions: state.sessions.map(session => 
      session.id === sessionId ? { ...session, status } : session
    )
  })),
  resetCurrentSession: () => set({
    currentFile: null,
    targetLanguage: null,
    chatMessages: [],
    businessLogic: '',
    pseudoCode: '',
    convertedCode: '',
    currentStep: 'upload'
  })
}));
