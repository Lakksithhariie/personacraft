import React from 'react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const cmd = isMac ? '⌘' : 'ctrl';

  const shortcuts = [
    { key: `${cmd} + enter`, action: 'rephrase text' },
    { key: `${cmd} + shift + c`, action: 'copy result' },
    { key: `${cmd} + shift + x`, action: 'clear input' },
    { key: '?', action: 'show shortcuts' },
    { key: 'esc', action: 'close modal' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/20 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border-2 border-brand-900 w-full max-w-sm p-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-brand-900 lowercase tracking-wider">keyboard shortcuts</h2>
          <button onClick={onClose} className="text-brand-400 hover:text-brand-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex justify-between items-center border-b border-brand-50 pb-2 last:border-0">
              <span className="text-sm font-semibold text-brand-800 lowercase">{s.action}</span>
              <kbd className="px-2 py-1 bg-brand-50 border border-brand-200 font-mono text-xs text-brand-600 lowercase">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-brand-200 flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-brand-900 text-white font-bold text-xs lowercase tracking-widest hover:bg-brand-700 transition-colors"
          >
            close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
