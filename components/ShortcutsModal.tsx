// components/ShortcutsModal.tsx — Lucide icons, zero emojis

import React, { useEffect, useState } from 'react';
import { X, Keyboard, Sparkles, ClipboardCopy, Trash2, XCircle } from 'lucide-react';

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
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts: { key: string; action: string; icon: React.ReactNode }[] = [
    {
      key: `${cmd} + Enter`,
      action: 'Transform text',
      icon: <Sparkles size={14} className="text-brand-500" />,
    },
    {
      key: `${cmd} + Shift + C`,
      action: 'Copy variation',
      icon: <ClipboardCopy size={14} className="text-teal-500" />,
    },
    {
      key: `${cmd} + Shift + X`,
      action: 'Clear workspace',
      icon: <Trash2 size={14} className="text-pink-500" />,
    },
    {
      key: '?',
      action: 'Show shortcuts',
      icon: <Keyboard size={14} className="text-sunny-500" />,
    },
    {
      key: 'Esc',
      action: 'Close modal',
      icon: <XCircle size={14} className="text-muted-foreground" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-background border border-border rounded-lg animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
              <Keyboard size={14} className="text-muted-foreground" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost h-7 w-7 rounded-md inline-flex items-center justify-center"
          >
            <X size={15} />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-2 space-y-0.5">
          {shortcuts.map((s) => (
            <div
              key={s.action}
              className="flex items-center justify-between px-2.5 py-2.5 rounded-md hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-5 flex items-center justify-center shrink-0">
                  {s.icon}
                </div>
                <span className="text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">
                  {s.action}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {s.key.split(' + ').map((k, i, arr) => (
                  <React.Fragment key={k}>
                    <kbd className="h-5 min-w-[22px] px-1.5 inline-flex items-center justify-center bg-muted border border-border rounded text-[10px] font-mono font-medium text-muted-foreground">
                      {k}
                    </kbd>
                    {i < arr.length - 1 && (
                      <span className="text-muted-foreground/40 text-[10px]">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-border">
          <p className="text-[11px] text-muted-foreground/60 text-center">
            Press{' '}
            <kbd className="px-1 py-px bg-muted border border-border rounded text-[10px] font-mono text-muted-foreground">
              ?
            </kbd>{' '}
            anytime to view
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;