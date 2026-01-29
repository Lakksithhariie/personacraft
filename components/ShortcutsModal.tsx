// components/ShortcutsModal.tsx

import React, { useEffect, useState } from 'react';
import { X, Keyboard } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [cmd, setCmd] = useState<'⌘' | 'Ctrl'>('Ctrl');

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      setCmd(navigator.platform.toUpperCase().includes('MAC') ? '⌘' : 'Ctrl');
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { key: `${cmd} + Enter`, action: 'Transform text', icon: '✨' },
    { key: `${cmd} + Shift + C`, action: 'Copy variation', icon: '📋' },
    { key: `${cmd} + Shift + X`, action: 'Clear workspace', icon: '🗑️' },
    { key: '?', action: 'Show shortcuts', icon: '⌨️' },
    { key: 'Esc', action: 'Close modal', icon: '✕' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-800/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-navy-800 border-2 border-teal-500 rounded-xl animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-200 dark:border-navy-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-lime-400 flex items-center justify-center">
              <Keyboard size={16} className="text-navy-800" />
            </div>
            <h2 className="font-display text-base font-bold text-navy-800 dark:text-white">Keyboard Shortcuts</h2>
          </div>
          <button onClick={onClose} className="p-2 text-navy-500 hover:text-navy-800 dark:hover:text-white hover:bg-navy-100 dark:hover:bg-navy-700 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {shortcuts.map((s) => (
            <div key={s.action} className="flex items-center justify-between p-3 rounded-lg bg-navy-50 dark:bg-navy-700/50 hover:bg-navy-100 dark:hover:bg-navy-700 transition-colors group">
              <div className="flex items-center gap-3">
                <span className="text-base">{s.icon}</span>
                <span className="text-sm font-medium text-navy-700 dark:text-navy-200 group-hover:text-navy-900 dark:group-hover:text-white transition-colors">{s.action}</span>
              </div>
              <div className="flex items-center gap-1">
                {s.key.split(' + ').map((k, i, arr) => (
                  <React.Fragment key={k}>
                    <kbd className="px-2 py-1 bg-white dark:bg-navy-600 border border-navy-200 dark:border-navy-500 rounded-md font-mono text-xs text-teal-600 dark:text-lime-400 min-w-[28px] text-center">{k}</kbd>
                    {i < arr.length - 1 && <span className="text-navy-400 text-xs">+</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-navy-200 dark:border-navy-600 bg-navy-50 dark:bg-navy-900/50 rounded-b-xl">
          <p className="text-[11px] text-navy-500 dark:text-navy-400 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-navy-600 border border-navy-200 dark:border-navy-500 rounded text-teal-600 dark:text-lime-400 font-mono text-[10px]">?</kbd> anytime to view shortcuts
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;