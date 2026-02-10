
export interface Chapter {
  id: string;
  title: string;
  content: string;
  originalTranscript: string;
  createdAt: number;
  selected?: boolean;
}

export type AIProvider = 'gemini' | 'deepseek' | 'siliconflow' | 'openrouter' | 'ollama' | 'custom';

export type ViewMode = 'draft' | 'library' | 'reader';

export interface AppSettings {
  // AI Settings
  aiProvider: AIProvider;
  apiKey: string;
  modelName: string;
  apiUrl: string;
  savedModels: string[]; // List of custom saved model names
  
  // Email Delivery Settings
  useCustomSmtp: boolean;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string; // Used as both sender and primary recipient for simplicity
  smtpPass: string;
}

export interface GenerationStatus {
  loading: boolean;
  error: string | null;
  step: 'idle' | 'analyzing' | 'writing' | 'polishing';
}
