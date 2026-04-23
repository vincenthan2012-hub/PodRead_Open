
export interface Chapter {
  id: string;
  title: string;
  sourceFileName?: string;
  content: string;
  originalTranscript: string;
  createdAt: number;
  selected?: boolean;
}

export interface BatchFile {
  id: string;
  name: string;
  content: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

export type AIProvider = 'gemini' | 'deepseek' | 'siliconflow' | 'openrouter' | 'ollama' | 'custom';

export type ViewMode = 'draft' | 'library' | 'reader';

export interface ProviderConfig {
  apiKey: string;
  apiUrl: string;
  modelName: string;
}

export interface AppSettings {
  // AI Settings
  aiProvider: AIProvider;
  apiKey: string; // Current provider's API key (for backward compatibility)
  modelName: string; // Current provider's model name
  apiUrl: string; // Current provider's API URL (for backward compatibility)
  providerConfigs: Partial<Record<AIProvider, ProviderConfig>>; // Store configs for each provider
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
