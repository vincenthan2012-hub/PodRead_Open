
import React from 'react';
import { AppSettings, AIProvider } from '../types';
import { PROVIDER_DEFAULTS } from '../constants';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = React.useState<AppSettings>({
    ...settings,
    savedModels: settings.savedModels || [],
    providerConfigs: settings.providerConfigs || {}
  });
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [showAppPassword, setShowAppPassword] = React.useState(false);

  const handleProviderChange = (newProvider: AIProvider) => {
    const defaults = PROVIDER_DEFAULTS[newProvider];
    
    setLocalSettings(prev => {
      // Save current provider's config before switching
      const currentProvider = prev.aiProvider;
      const updatedProviderConfigs = {
        ...prev.providerConfigs,
        [currentProvider]: {
          apiKey: prev.apiKey,
          apiUrl: prev.apiUrl,
          modelName: prev.modelName
        }
      };

      // Load new provider's config or use defaults
      const newProviderConfig = updatedProviderConfigs[newProvider];
      const newApiKey = newProviderConfig?.apiKey || '';
      const newApiUrl = newProviderConfig?.apiUrl || (newProvider === 'custom' ? '' : defaults.url);
      const newModelName = newProviderConfig?.modelName || (newProvider === 'custom' ? '' : defaults.model);

      return {
        ...prev,
        aiProvider: newProvider,
        apiKey: newApiKey,
        apiUrl: newApiUrl,
        modelName: newModelName,
        providerConfigs: updatedProviderConfigs
      };
    });
  };

  const handleSaveModel = () => {
    const model = localSettings.modelName.trim();
    if (model && !localSettings.savedModels.includes(model)) {
      setLocalSettings(prev => ({
        ...prev,
        savedModels: [...prev.savedModels, model]
      }));
    }
  };

  const handleDeleteModel = (e: React.MouseEvent, modelToDelete: string) => {
    e.stopPropagation();
    setLocalSettings(prev => ({
      ...prev,
      savedModels: prev.savedModels.filter(m => m !== modelToDelete)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <h2 className="text-lg font-semibold text-stone-800">Preferences</h2>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* AI Intelligence Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-stone-800 rounded-full"></div>
              <h3 className="text-sm font-bold text-stone-800 uppercase tracking-widest">AI Engine</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase">Provider</label>
                <select 
                  value={localSettings.aiProvider}
                  onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-stone-800 outline-none appearance-none cursor-pointer transition-all"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="deepseek">DeepSeek</option>
                  <option value="siliconflow">SiliconFlow</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="ollama">Ollama (Local)</option>
                  <option value="custom">Custom (OpenAI Compatible)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase">
                  API Key{(localSettings.aiProvider === 'ollama' || localSettings.aiProvider === 'gemini') ? ' (Optional)' : ''}
                </label>
                <div className="relative">
                  <input 
                    type={showApiKey ? "text" : "password"} 
                    value={localSettings.apiKey}
                    onChange={(e) => setLocalSettings({...localSettings, apiKey: e.target.value})}
                    placeholder={(localSettings.aiProvider === 'ollama' || localSettings.aiProvider === 'gemini') ? 'Optional' : 'sk-...'}
                    className="w-full px-4 py-2.5 pr-10 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-stone-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showApiKey ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase">Endpoint URL</label>
                  <input 
                    type="text" 
                    value={localSettings.apiUrl}
                    onChange={(e) => setLocalSettings({...localSettings, apiUrl: e.target.value})}
                    placeholder="https://api.your-provider.com/v1"
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-stone-800 outline-none ${localSettings.aiProvider === 'gemini' ? 'bg-stone-100 text-stone-400 border-transparent cursor-not-allowed' : 'bg-stone-50 border-stone-200'}`}
                    disabled={localSettings.aiProvider === 'gemini'}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-stone-500 mb-1.5 uppercase">Model Name</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={localSettings.modelName}
                      onChange={(e) => setLocalSettings({...localSettings, modelName: e.target.value})}
                      placeholder="e.g. gpt-4o, deepseek-chat"
                      className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-stone-800 outline-none"
                    />
                    <button 
                      onClick={handleSaveModel}
                      className="px-4 py-2.5 bg-stone-100 text-stone-600 rounded-xl text-xs font-bold hover:bg-stone-200 transition-all active:scale-95"
                    >
                      Save
                    </button>
                  </div>
                  
                  {localSettings.savedModels.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {localSettings.savedModels.map((model) => (
                        <div 
                          key={model}
                          onClick={() => setLocalSettings({...localSettings, modelName: model})}
                          className={`group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-all ${
                            localSettings.modelName === model 
                              ? 'bg-stone-800 text-white border-stone-800 shadow-sm' 
                              : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                          }`}
                        >
                          <span>{model}</span>
                          <button 
                            onClick={(e) => handleDeleteModel(e, model)}
                            className={`p-0.5 rounded-full transition-colors ${
                              localSettings.modelName === model ? 'hover:bg-white/20' : 'hover:bg-stone-100'
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Delivery Section */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-stone-400 rounded-full"></div>
              <h3 className="text-sm font-bold text-stone-800 uppercase tracking-widest">Email Delivery</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1 uppercase">Email Address</label>
                  <input 
                    type="email" 
                    value={localSettings.smtpUser}
                    onChange={(e) => setLocalSettings({...localSettings, smtpUser: e.target.value})}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-stone-800 outline-none"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">This address serves as both your login and the default destination.</p>
                </div>

                {localSettings.useCustomSmtp && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 animate-fade-in">
                    <div className="md:col-span-2 grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-stone-500 mb-1 uppercase">SMTP Host</label>
                        <input 
                          type="text" 
                          value={localSettings.smtpHost}
                          onChange={(e) => setLocalSettings({...localSettings, smtpHost: e.target.value})}
                          placeholder="smtp.gmail.com"
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-stone-800 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-500 mb-1 uppercase">Port</label>
                        <input 
                          type="text" 
                          value={localSettings.smtpPort}
                          onChange={(e) => setLocalSettings({...localSettings, smtpPort: e.target.value})}
                          placeholder="465"
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-stone-800 outline-none"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-stone-500 mb-1 uppercase">App Password</label>
                      <div className="relative">
                        <input 
                          type={showAppPassword ? "text" : "password"} 
                          value={localSettings.smtpPass}
                          onChange={(e) => setLocalSettings({...localSettings, smtpPass: e.target.value})}
                          className="w-full px-3 py-2 pr-10 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-stone-800 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAppPassword(!showAppPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                        >
                          {showAppPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="px-6 py-5 border-t border-stone-100 bg-stone-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-stone-600 hover:text-stone-800 transition-colors">Cancel</button>
          <button 
            onClick={() => {
              // Update current provider's config before saving
              const finalSettings: AppSettings = {
                ...localSettings,
                providerConfigs: {
                  ...localSettings.providerConfigs,
                  [localSettings.aiProvider]: {
                    apiKey: localSettings.apiKey,
                    apiUrl: localSettings.apiUrl,
                    modelName: localSettings.modelName
                  }
                }
              };
              onSave(finalSettings);
              onClose();
            }}
            className="px-8 py-2.5 bg-stone-800 text-white rounded-xl text-sm font-bold hover:bg-stone-900 shadow-md transition-all active:scale-95"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
