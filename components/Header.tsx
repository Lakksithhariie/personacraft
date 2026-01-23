import React from 'react';

interface HeaderProps {
  onOpenShortcuts: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenShortcuts }) => {
  return (
    <header className="w-full max-w-4xl mx-auto px-4 py-6 flex justify-between items-center border-b-2 border-brand-200">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-brand-500 flex items-center justify-center text-white font-bold text-xl select-none lowercase">
          p
        </div>
        <h1 className="text-2xl font-bold text-brand-900 tracking-tight lowercase">personacraft</h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenShortcuts}
          className="p-2 text-brand-600 hover:bg-brand-100 transition-colors border-2 border-transparent hover:border-brand-200"
          aria-label="keyboard shortcuts"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-brand-600 hover:bg-brand-100 transition-colors border-2 border-transparent hover:border-brand-200"
          aria-label="github repository"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
        </a>
      </div>
    </header>
  );
};

export default Header;
