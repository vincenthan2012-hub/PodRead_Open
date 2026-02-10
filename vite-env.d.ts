/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_AI_PROVIDER?: string;
  readonly VITE_AI_API_URL?: string;
  readonly VITE_AI_MODEL_NAME?: string;
  readonly VITE_AI_API_KEY?: string;
  readonly VITE_SMTP_HOST?: string;
  readonly VITE_SMTP_PORT?: string;
  readonly VITE_SMTP_USER?: string;
  readonly VITE_SMTP_PASS?: string;
  readonly GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

