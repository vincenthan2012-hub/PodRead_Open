import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ChapterList from './components/ChapterList';
import BookPreview from './components/BookPreview';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import { transformTranscript } from './services/aiService';
import { generateEpubAndEmail, downloadEpub } from './services/epubService';
import { getChapters, saveChapter, deleteChapter, updateChapterSelection, getSettings, saveSettings } from './services/databaseService';
import { supabase } from './lib/supabase';
import { getDefaultSettings } from './lib/envConfig';
import { Chapter, AppSettings, GenerationStatus, ViewMode } from './types';
import { PROVIDER_DEFAULTS } from './constants';
import type { User } from '@supabase/supabase-js';

// 从content中提取标题的辅助函数
const extractTitleFromContent = (content: string): string => {
  if (!content) return 'Untitled Chapter';
  
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // 查找第一个以 # 开头的行作为标题
    if (trimmed.startsWith('# ')) {
      const title = trimmed.replace('# ', '').trim();
      if (title) return title;
    }
  }
  
  // 如果找不到标题，返回默认值
  return 'Untitled Chapter';
};

const App: React.FC = () => {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  // App state
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('draft');
  const [transcriptInput, setTranscriptInput] = useState('');
  const [status, setStatus] = useState<GenerationStatus>({ loading: false, error: null, step: 'idle' });
  const [isEmailing, setIsEmailing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => getDefaultSettings());
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialLoad = useRef(true);

  // Initialize auth state
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        setShowAuth(true);
      } else {
        // 如果用户已登录，加载用户数据
        loadUserData(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setShowAuth(true);
        setChapters([]);
        setSettings(getDefaultSettings());
        setIsSettingsLoaded(false);
      } else {
        setShowAuth(false);
        setIsSettingsLoaded(false);
        isInitialLoad.current = true; // 重置初始加载标志
        loadUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user data from Supabase
  const loadUserData = async (userId: string) => {
    try {
      // Load chapters
      let userChapters = await getChapters(userId);
      
      // 修复标题：如果标题是"Untitled Chapter"，尝试从content中重新提取
      userChapters = await Promise.all(userChapters.map(async (chapter) => {
        if (chapter.title === 'Untitled Chapter' && chapter.content) {
          const extractedTitle = extractTitleFromContent(chapter.content);
          if (extractedTitle !== 'Untitled Chapter') {
            // 更新数据库中的标题
            const updatedChapter = { ...chapter, title: extractedTitle };
            await saveChapter(userId, updatedChapter);
            return updatedChapter;
          }
        }
        return chapter;
      }));
      
      setChapters(userChapters);

      // Load settings
      const userSettings = await getSettings(userId);
      if (userSettings) {
        setSettings(userSettings);
      } else {
        // 如果没有保存的设置，使用环境变量默认值
        setSettings(getDefaultSettings());
      }
      // 标记设置已加载，允许后续保存
      setIsSettingsLoaded(true);
      // 重置初始加载标志，以便后续的修改可以保存
      isInitialLoad.current = false;
    } catch (error) {
      console.error('Error loading user data:', error);
      setStatus(prev => ({ ...prev, error: 'Failed to load your data' }));
      // 即使出错也标记为已加载，避免无限等待
      setIsSettingsLoaded(true);
      isInitialLoad.current = false;
    }
  };

  // Save settings to Supabase
  // 使用 ref 来跟踪是否是初始加载，避免在初始加载时保存
  useEffect(() => {
    // 如果是初始加载，跳过保存
    if (isInitialLoad.current) {
      if (isSettingsLoaded) {
        isInitialLoad.current = false;
      }
      return;
    }
    
    // 只有在设置已加载且不是初始加载时才保存
    if (user && settings && isSettingsLoaded) {
      saveSettings(user.id, settings).catch(error => {
        console.error('Error saving settings:', error);
        setStatus(prev => ({ ...prev, error: 'Failed to save settings' }));
      });
    }
  }, [settings, user, isSettingsLoaded]);

  // Save chapter to Supabase when chapters change
  const saveChapterToDB = async (chapter: Chapter) => {
    if (!user) return;
    try {
      await saveChapter(user.id, chapter);
    } catch (error) {
      console.error('Error saving chapter:', error);
      setStatus(prev => ({ ...prev, error: 'Failed to save chapter' }));
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    if (user) {
      loadUserData(user.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowAuth(true);
  };

  const handleTransform = async () => {
    if (!transcriptInput.trim()) return;
    if (!user) {
      setShowAuth(true);
      return;
    }
    
    setStatus({ loading: true, error: null, step: 'writing' });
    try {
      const transformedText = await transformTranscript(transcriptInput, settings);
      
      // 从content中提取真实标题
      const extractedTitle = extractTitleFromContent(transformedText);
      
      const newChapter: Chapter = {
        id: crypto.randomUUID(),
        title: extractedTitle,
        content: transformedText,
        originalTranscript: transcriptInput,
        createdAt: Date.now(),
        selected: false
      };
      
      // Save to Supabase
      await saveChapterToDB(newChapter);
      
      setChapters(prev => [newChapter, ...prev]);
      setActiveChapterId(newChapter.id);
      setTranscriptInput('');
      setStatus({ loading: false, error: null, step: 'idle' });
      setCurrentView('reader');
    } catch (error: any) {
      setStatus({ loading: false, error: error.message || 'Transformation failed', step: 'idle' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型（支持移动端）
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    const isValidFile = 
      fileName.endsWith('.txt') || 
      fileName.endsWith('.srt') ||
      fileType === 'text/plain' ||
      fileType === 'application/x-subrip' ||
      fileType === 'text/srt' ||
      fileType === ''; // 某些移动端可能不提供MIME类型，允许空类型但检查扩展名

    if (!isValidFile) {
      setStatus(prev => ({ ...prev, error: "Please upload a .txt or .srt file." }));
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTranscriptInput(content);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => {
      setStatus(prev => ({ ...prev, error: "Failed to read file." }));
    };
    reader.readAsText(file);
  };

  const handlePushToEmail = async () => {
    const selectedChapters = chapters.filter(c => c.selected);
    if (selectedChapters.length === 0) {
      alert("Please select at least one chapter from your Library.");
      return;
    }
    if (!settings.smtpUser) {
      alert("Please configure your Email address in Settings first.");
      setIsSettingsOpen(true);
      return;
    }

    setIsEmailing(true);
    try {
      await generateEpubAndEmail(selectedChapters, settings);
      alert("Success! Your literature has been dispatched via the simulated SMTP bridge.");
    } catch (err: any) {
      alert(`Email failed: ${err.message}`);
    } finally {
      setIsEmailing(false);
    }
  };

  const handleDownloadEpub = async () => {
    const selectedChapters = chapters.filter(c => c.selected);
    if (selectedChapters.length === 0) return;
    
    setIsDownloading(true);
    try {
      await downloadEpub(selectedChapters);
    } catch (err: any) {
      console.error('Download EPUB error:', err);
      alert(`Failed to generate EPUB download: ${err.message || 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleToggleSelection = async (id: string) => {
    const chapter = chapters.find(c => c.id === id);
    if (!chapter) return;
    
    const newSelected = !chapter.selected;
    setChapters(prev => prev.map(c => c.id === id ? { ...c, selected: newSelected } : c));
    
    // Update in Supabase
    if (user) {
      try {
        await updateChapterSelection(id, newSelected);
      } catch (error) {
        console.error('Error updating selection:', error);
      }
    }
  };

  const handleDeleteChapter = async (id: string) => {
    if (!user) return;
    
    try {
      await deleteChapter(id);
      setChapters(prev => prev.filter(c => c.id !== id));
      if (activeChapterId === id) setActiveChapterId(null);
    } catch (error) {
      console.error('Error deleting chapter:', error);
      setStatus(prev => ({ ...prev, error: 'Failed to delete chapter' }));
    }
  };

  const handleUpdateTitle = async (id: string, newTitle: string) => {
    if (!user) return;
    
    const chapter = chapters.find(c => c.id === id);
    if (!chapter || chapter.title === newTitle) return;
    
    try {
      const updatedChapter = { ...chapter, title: newTitle };
      await saveChapterToDB(updatedChapter);
      setChapters(prev => prev.map(c => c.id === id ? updatedChapter : c));
    } catch (error) {
      console.error('Error updating title:', error);
      setStatus(prev => ({ ...prev, error: 'Failed to update title' }));
    }
  };

  const activeChapter = chapters.find(c => c.id === activeChapterId);

  // Show loading or auth modal
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F7F2]">
        <div className="text-stone-600">Loading...</div>
      </div>
    );
  }

  if (showAuth || !user) {
    return <AuthModal onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F9F7F2]">
      <Header 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
        userEmail={user.email}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 lg:p-8">
        
        {/* Drafting Room View */}
        {currentView === 'draft' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-stone-800 display">Drafting Room</h2>
                  <p className="text-sm text-stone-400 mt-1">Input your raw transcript to begin the transformation.</p>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-stone-400 hover:text-stone-800 transition-colors p-3 bg-stone-50 rounded-full"
                  title="Upload TXT/SRT"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".txt,.srt,text/plain,application/x-subrip,text/srt" 
                  className="hidden" 
                />
              </div>

              <textarea
                className="w-full h-80 p-6 bg-stone-50 border border-stone-100 rounded-3xl text-base focus:ring-2 focus:ring-stone-800 outline-none resize-none transition-shadow leading-relaxed"
                placeholder="Paste podcast transcript here..."
                value={transcriptInput}
                onChange={(e) => setTranscriptInput(e.target.value)}
              />

              <button 
                onClick={handleTransform}
                disabled={status.loading || !transcriptInput.trim()}
                className="w-full py-3 sm:py-5 bg-stone-800 text-white rounded-2xl sm:rounded-3xl text-sm sm:text-base font-bold hover:bg-stone-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 shadow-xl active:scale-[0.98]"
              >
                {status.loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Crafting Your Chapter...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Transform to Literature</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Library View */}
        {currentView === 'library' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-bold text-stone-800 display">Private Library</h2>
                <button 
                  onClick={() => setCurrentView('draft')}
                  className="p-2 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-all"
                  title="Back to Drafting Room"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2">
                {chapters.some(c => c.selected) && (
                  <>
                    <button 
                      onClick={handleDownloadEpub}
                      disabled={isDownloading}
                      className="px-3 py-2 bg-stone-100 text-stone-600 rounded-xl text-xs font-bold hover:bg-stone-200 transition-all flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                    <button 
                      onClick={handlePushToEmail}
                      disabled={isEmailing}
                      className="px-3 py-2 bg-stone-100 text-stone-600 rounded-xl text-xs font-bold hover:bg-stone-200 transition-all flex items-center gap-2"
                    >
                      {isEmailing ? (
                        <svg className="animate-spin h-3.5 w-3.5 text-stone-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      )}
                      {isEmailing ? 'Sending...' : 'Push to Email'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {chapters.length === 0 ? (
              <div className="h-96 flex flex-col items-center justify-center text-stone-300 border-2 border-dashed border-stone-200 rounded-[2.5rem] bg-white/50">
                <p className="display text-xl">Your shelves are empty.</p>
                <button onClick={() => setCurrentView('draft')} className="text-stone-800 mt-4 font-bold underline">Begin Writing</button>
              </div>
            ) : (
              <ChapterList 
                chapters={chapters}
                selectedId={activeChapterId}
                onSelect={(id) => {
                  // 如果点击的是已选中的文章，则进入阅读视图；否则只选中
                  if (activeChapterId === id) {
                    setCurrentView('reader');
                  } else {
                    setActiveChapterId(id);
                  }
                }}
                onToggleSelection={handleToggleSelection}
                onDelete={handleDeleteChapter}
                onUpdateTitle={handleUpdateTitle}
              />
            )}
          </div>
        )}

        {/* Reader View */}
        {currentView === 'reader' && activeChapter && (
          <div className="animate-fade-in h-[calc(100vh-10rem)]">
            <BookPreview 
              chapter={activeChapter} 
              onClose={() => setCurrentView('library')}
              onPrint={() => window.print()}
            />
          </div>
        )}
      </main>

      {isSettingsOpen && (
        <SettingsModal 
          settings={settings} 
          onSave={async (newSettings) => {
            setSettings(newSettings);
            // 显式保存到数据库，确保保存成功
            if (user) {
              try {
                await saveSettings(user.id, newSettings);
                console.log('Settings saved successfully');
              } catch (error) {
                console.error('Error saving settings:', error);
                setStatus(prev => ({ ...prev, error: 'Failed to save settings. Please try again.' }));
              }
            }
          }} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}

      {status.error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl text-sm font-bold z-50 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {status.error}
          <button onClick={() => setStatus({ ...status, error: null })} className="ml-2 hover:opacity-70 underline">Dismiss</button>
        </div>
      )}
    </div>
  );
};

export default App;
