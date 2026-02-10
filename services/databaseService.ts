import { supabase } from '../lib/supabase';
import { Chapter, AppSettings, AIProvider } from '../types';

// Chapters table operations
export async function getChapters(userId: string): Promise<Chapter[]> {
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching chapters:', error);
    throw error;
  }

  return data?.map(chapter => ({
    id: chapter.id,
    title: chapter.title,
    content: chapter.content,
    originalTranscript: chapter.original_transcript,
    createdAt: new Date(chapter.created_at).getTime(),
    selected: chapter.selected || false
  })) || [];
}

export async function saveChapter(userId: string, chapter: Chapter): Promise<Chapter> {
  const { data, error } = await supabase
    .from('chapters')
    .upsert({
      id: chapter.id,
      user_id: userId,
      title: chapter.title,
      content: chapter.content,
      original_transcript: chapter.originalTranscript,
      created_at: new Date(chapter.createdAt).toISOString(),
      selected: chapter.selected || false
    }, {
      onConflict: 'id'
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving chapter:', error);
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    originalTranscript: data.original_transcript,
    createdAt: new Date(data.created_at).getTime(),
    selected: data.selected || false
  };
}

export async function deleteChapter(chapterId: string): Promise<void> {
  const { error } = await supabase
    .from('chapters')
    .delete()
    .eq('id', chapterId);

  if (error) {
    console.error('Error deleting chapter:', error);
    throw error;
  }
}

export async function updateChapterSelection(chapterId: string, selected: boolean): Promise<void> {
  const { error } = await supabase
    .from('chapters')
    .update({ selected })
    .eq('id', chapterId);

  if (error) {
    console.error('Error updating chapter selection:', error);
    throw error;
  }
}

// Settings table operations
export async function getSettings(userId: string): Promise<AppSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No settings found, return null
      return null;
    }
    console.error('Error fetching settings:', error);
    throw error;
  }

  if (!data) return null;

  const aiProvider = (data.ai_provider || 'gemini') as AIProvider;
  let providerConfigs = data.provider_configs || {};

  // Migrate legacy data: if providerConfigs is empty or doesn't have current provider, initialize from legacy fields
  if (!providerConfigs || Object.keys(providerConfigs).length === 0 || !providerConfigs[aiProvider]) {
    providerConfigs = {
      ...providerConfigs,
      [aiProvider]: {
        apiKey: data.api_key || '',
        apiUrl: data.api_url || '',
        modelName: data.model_name || ''
      }
    };
  }

  // Get current provider's config
  const currentProviderConfig = providerConfigs[aiProvider];
  const apiKey = currentProviderConfig?.apiKey || '';
  const apiUrl = currentProviderConfig?.apiUrl || '';
  const modelName = currentProviderConfig?.modelName || '';

  return {
    aiProvider,
    apiKey,
    modelName,
    apiUrl,
    providerConfigs,
    savedModels: data.saved_models || [],
    useCustomSmtp: data.use_custom_smtp || false,
    smtpHost: data.smtp_host || '',
    smtpPort: data.smtp_port || '465',
    smtpUser: data.smtp_user || '',
    smtpPass: data.smtp_pass || ''
  };
}

export async function saveSettings(userId: string, settings: AppSettings): Promise<void> {
  const { error } = await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      ai_provider: settings.aiProvider,
      api_key: settings.apiKey, // Keep for backward compatibility
      model_name: settings.modelName,
      api_url: settings.apiUrl, // Keep for backward compatibility
      provider_configs: settings.providerConfigs || {},
      saved_models: settings.savedModels,
      use_custom_smtp: settings.useCustomSmtp,
      smtp_host: settings.smtpHost,
      smtp_port: settings.smtpPort,
      smtp_user: settings.smtpUser,
      smtp_pass: settings.smtpPass
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

