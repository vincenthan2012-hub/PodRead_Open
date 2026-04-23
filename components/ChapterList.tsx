
import React, { useState, useRef, useEffect } from 'react';
import { Chapter } from '../types';

interface ChapterListProps {
  chapters: Chapter[];
  onSelect: (id: string) => void;
  onToggleSelection: (id: string) => void;
  onToggleAllSelection: (selected: boolean) => void;
  selectedId: string | null;
  onDelete: (id: string) => void;
  onBatchDelete: () => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({ 
  chapters, 
  onSelect, 
  onToggleSelection, 
  onToggleAllSelection,
  selectedId,
  onDelete,
  onBatchDelete,
  onUpdateTitle
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCount = chapters.filter(c => c.selected).length;
  const isAllSelected = chapters.length > 0 && selectedCount === chapters.length;

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleTitleClick = (e: React.MouseEvent, chapter: Chapter) => {
    e.stopPropagation();
    setEditingId(chapter.id);
    setEditingTitle(chapter.sourceFileName || chapter.title);
  };

  const handleTitleBlur = (id: string) => {
    if (editingTitle.trim()) {
      onUpdateTitle(id, editingTitle.trim());
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editingTitle.trim()) {
        onUpdateTitle(id, editingTitle.trim());
      }
      setEditingId(null);
      setEditingTitle('');
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditingTitle('');
    }
  };

  if (chapters.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2 py-1 bg-stone-50/50 rounded-xl border border-stone-100">
        <div className="flex items-center gap-3">
          <div 
            className="checkbox-container flex items-center justify-center p-1"
            onClick={(e) => {
              e.stopPropagation();
              onToggleAllSelection(!isAllSelected);
            }}
          >
            <input 
              type="checkbox"
              checked={isAllSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleAllSelection(e.target.checked);
              }}
              className="w-4 h-4 rounded border-stone-300 text-stone-800 focus:ring-stone-500 cursor-pointer"
            />
          </div>
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest">
            {selectedCount > 0 ? `${selectedCount} Selected` : 'Library'}
          </span>
        </div>
        
        {selectedCount > 0 && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onBatchDelete();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Selected
          </button>
        )}
      </div>

      <div className="space-y-1">
        {chapters.map((chapter) => (
          <div 
            key={chapter.id}
            className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
              selectedId === chapter.id 
                ? 'bg-white border-stone-200 shadow-sm' 
                : 'hover:bg-white/50 border-transparent'
            }`}
            onClick={(e) => {
              // 如果点击的是checkbox或其容器，不触发onSelect
              if ((e.target as HTMLElement).closest('input[type="checkbox"]') || (e.target as HTMLElement).closest('.checkbox-container')) {
                return;
              }
              // 如果点击的是删除按钮，不触发onSelect
              if ((e.target as HTMLElement).closest('button[class*="opacity-0"]')) {
                return;
              }
              onSelect(chapter.id);
            }}
          >
            <div 
              className="checkbox-container"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelection(chapter.id);
              }}
            >
              <input 
                type="checkbox"
                checked={chapter.selected || false}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleSelection(chapter.id);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="w-4 h-4 rounded border-stone-300 text-stone-800 focus:ring-stone-500 cursor-pointer"
              />
            </div>
            <div className="flex-1 min-w-0">
              {editingId === chapter.id ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => handleTitleBlur(chapter.id)}
                  onKeyDown={(e) => handleTitleKeyDown(e, chapter.id)}
                  className="text-sm font-medium w-full px-2 py-1 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-stone-500"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <h4 
                  className={`text-sm font-medium truncate cursor-text hover:text-stone-900 ${
                    selectedId === chapter.id ? 'text-stone-900 font-semibold' : 'text-stone-800'
                  }`}
                  onClick={(e) => handleTitleClick(e, chapter)}
                  title="点击编辑标题"
                >
                  {chapter.sourceFileName || chapter.title}
                </h4>
              )}
              <p className="text-xs text-stone-400 mt-0.5">
                {new Date(chapter.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(chapter.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 rounded-md transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterList;
