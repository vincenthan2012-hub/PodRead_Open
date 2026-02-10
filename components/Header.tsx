
import React from 'react';
import { ViewMode } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  userEmail?: string;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, onOpenSettings, onLogout, userEmail }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#F9F7F2]/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => onViewChange('draft')}
        >
          <div className="flex items-center justify-center bg-stone-800 rounded-lg p-1.5 transition-transform group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight display text-stone-800">PodRead</h1>
        </div>
        
        <nav className="flex items-center gap-1 sm:gap-4">
          <button 
            onClick={() => onViewChange('draft')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              currentView === 'draft' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:bg-stone-200'
            }`}
          >
            Draft
          </button>
          <button 
            onClick={() => onViewChange('library')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              currentView === 'library' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-500 hover:bg-stone-200'
            }`}
          >
            Library
          </button>
          
          <div className="w-px h-6 bg-stone-200 mx-2" />
          
          {userEmail && (
            <span className="text-xs text-stone-500 hidden sm:inline">{userEmail}</span>
          )}
          
          <button 
            onClick={onOpenSettings}
            className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-600"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          <button 
            onClick={onLogout}
            className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-600"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
