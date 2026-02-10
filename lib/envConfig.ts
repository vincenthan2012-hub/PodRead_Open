import { PROVIDER_DEFAULTS } from '../constants';
import { AppSettings, AIProvider } from '../types';

/**
 * 从环境变量读取默认配置
 */
export function getDefaultSettings(): AppSettings {
  // 从环境变量读取 AI 配置
  const aiProvider = (import.meta.env.VITE_AI_PROVIDER || 'gemini') as AIProvider;
  const aiApiUrl = import.meta.env.VITE_AI_API_URL || '';
  const aiModelName = import.meta.env.VITE_AI_MODEL_NAME || '';
  const aiApiKey = import.meta.env.VITE_AI_API_KEY || '';
  
  // 从环境变量读取 SMTP 配置
  const smtpHost = import.meta.env.VITE_SMTP_HOST || '';
  const smtpPort = import.meta.env.VITE_SMTP_PORT || '465';
  const smtpUser = import.meta.env.VITE_SMTP_USER || '';
  const smtpPass = import.meta.env.VITE_SMTP_PASS || '';

  // 根据 provider 设置默认值
  const providerDefaults = PROVIDER_DEFAULTS[aiProvider] || PROVIDER_DEFAULTS.gemini;
  const finalApiUrl = aiApiUrl || providerDefaults.url;
  const finalModelName = aiModelName || providerDefaults.model;

  return {
    aiProvider,
    apiKey: aiApiKey,
    modelName: finalModelName,
    apiUrl: finalApiUrl,
    savedModels: [],
    useCustomSmtp: !!(smtpHost && smtpUser),
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass
  };
}

