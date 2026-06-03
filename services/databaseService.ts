import { Chapter, AppSettings } from '../types';

const CHAPTERS_STORAGE_KEY = 'podread:chapters';
const SETTINGS_STORAGE_KEY = 'podread:settings';

const isBrowser = () => typeof window !== 'undefined' && !!window.localStorage;

const readJson = <T,>(key: string, fallback: T): T => {
  if (!isBrowser()) return fallback;

  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) return fallback;

  try {
    return JSON.parse(rawValue) as T;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return fallback;
  }
};

const writeJson = <T,>(key: string, value: T): void => {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const normalizeChapter = (chapter: Chapter): Chapter => ({
  id: chapter.id,
  title: chapter.title || 'Untitled Chapter',
  content: chapter.content || '',
  originalTranscript: chapter.originalTranscript || '',
  sourceFileName: chapter.sourceFileName || chapter.title || 'Untitled Chapter',
  createdAt: chapter.createdAt || Date.now(),
  selected: chapter.selected || false
});

// The userId argument is kept for API compatibility with the previous remote storage service.
export async function getChapters(_userId: string): Promise<Chapter[]> {
  return readJson<Chapter[]>(CHAPTERS_STORAGE_KEY, [])
    .map(normalizeChapter)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveChapter(_userId: string, chapter: Chapter): Promise<Chapter> {
  const normalizedChapter = normalizeChapter(chapter);
  const chapters = readJson<Chapter[]>(CHAPTERS_STORAGE_KEY, []);
  const existingIndex = chapters.findIndex(item => item.id === normalizedChapter.id);

  if (existingIndex >= 0) {
    chapters[existingIndex] = normalizedChapter;
  } else {
    chapters.push(normalizedChapter);
  }

  writeJson(CHAPTERS_STORAGE_KEY, chapters);
  return normalizedChapter;
}

export async function deleteChapter(chapterId: string): Promise<void> {
  const chapters = readJson<Chapter[]>(CHAPTERS_STORAGE_KEY, []);
  writeJson(
    CHAPTERS_STORAGE_KEY,
    chapters.filter(chapter => chapter.id !== chapterId)
  );
}

export async function updateChapterSelection(chapterId: string, selected: boolean): Promise<void> {
  const chapters = readJson<Chapter[]>(CHAPTERS_STORAGE_KEY, []);
  writeJson(
    CHAPTERS_STORAGE_KEY,
    chapters.map(chapter => (
      chapter.id === chapterId ? normalizeChapter({ ...chapter, selected }) : chapter
    ))
  );
}

export async function getSettings(_userId: string): Promise<AppSettings | null> {
  return readJson<AppSettings | null>(SETTINGS_STORAGE_KEY, null);
}

export async function saveSettings(_userId: string, settings: AppSettings): Promise<void> {
  writeJson(SETTINGS_STORAGE_KEY, settings);
}
