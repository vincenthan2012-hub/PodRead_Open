
import React from 'react';
import { Chapter } from '../types';

interface BookPreviewProps {
  chapter: Chapter;
  onClose: () => void;
  onPrint: () => void;
}

const BookPreview: React.FC<BookPreviewProps> = ({ chapter, onClose, onPrint }) => {
  // We want to track if we've already rendered the first paragraph for the drop cap
  let hasRenderedFirstParagraph = false;

  return (
    <div className="flex flex-col h-full bg-[#FCFBF7] shadow-2xl rounded-2xl border border-stone-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-white">
        <button onClick={onClose} className="text-stone-400 hover:text-stone-800 flex items-center gap-1 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back to Library</span>
        </button>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={onPrint}
            className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full text-sm font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-8 py-16 scroll-smooth" id="printable-area">
        <article className="max-w-2xl mx-auto prose-book serif animate-fade-in">
          {chapter.content.split('\n').map((line, i) => {
            const trimmed = line.trim();
            
            if (trimmed.startsWith('# ')) {
              return <h1 key={i} className="text-4xl font-bold display mb-12 text-stone-900 leading-tight">{trimmed.replace('# ', '')}</h1>;
            }
            if (trimmed.startsWith('## ')) {
              return <h2 key={i} className="text-2xl font-semibold display mt-12 mb-6 text-stone-800 border-b border-stone-100 pb-2">{trimmed.replace('## ', '')}</h2>;
            }
            if (trimmed.startsWith('### ')) {
              return <h3 key={i} className="text-xl font-medium serif italic mt-8 mb-4 text-stone-700">{trimmed.replace('### ', '')}</h3>;
            }
            if (trimmed === '') return <div key={i} className="h-4" />;

            // Style for the first paragraph (Drop Cap)
            if (!hasRenderedFirstParagraph) {
              hasRenderedFirstParagraph = true;
              return (
                <p key={i} className="mb-6 first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:leading-none first-letter:text-stone-800">
                  {trimmed}
                </p>
              );
            }

            // Standard paragraphs
            return <p key={i} className="mb-6 indent-0 leading-relaxed text-stone-700">{trimmed}</p>;
          })}
        </article>
      </div>
    </div>
  );
};

export default BookPreview;
