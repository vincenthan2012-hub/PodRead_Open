
import React from 'react';
import { Chapter } from '../types';

interface ChapterListProps {
  chapters: Chapter[];
  onSelect: (id: string) => void;
  onToggleSelection: (id: string) => void;
  selectedId: string | null;
  onDelete: (id: string) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({ 
  chapters, 
  onSelect, 
  onToggleSelection, 
  selectedId,
  onDelete 
}) => {
  if (chapters.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-widest px-2">Library</h3>
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
              // 如果已经选中，再次点击则进入文章；如果未选中，则只选中
              if (selectedId === chapter.id) {
                // 已选中，再次点击进入文章
                onSelect(chapter.id);
              } else {
                // 未选中，只选中不进入
                onSelect(chapter.id);
              }
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
              <h4 className={`text-sm font-medium truncate ${
                selectedId === chapter.id ? 'text-stone-900 font-semibold' : 'text-stone-800'
              }`}>{chapter.title}</h4>
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
