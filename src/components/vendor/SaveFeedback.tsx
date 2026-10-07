import React from 'react';
import { AlertCircle, CheckCircle2, Loader2, X, RotateCcw } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  title?: string;
}

/** Persistent (does not auto-hide) red banner with the real error text. */
export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss, onRetry, title = 'Not saved' }) => (
  <div
    role="alert"
    className="bg-red-50 border border-red-300 text-red-800 rounded-xl p-3 text-xs flex items-start gap-2.5"
  >
    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
    <div className="flex-1 min-w-0">
      <div className="font-bold">{title}</div>
      <p className="mt-0.5 break-words">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-1 font-bold text-red-700 hover:text-red-900 underline cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" /> Try again
        </button>
      )}
    </div>
    {onDismiss && (
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="text-red-500 hover:text-red-800 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);

interface SaveStatusProps {
  dirty: boolean;
  saving: boolean;
  savedAt: Date | null;
  hasError?: boolean;
}

/** Small pill: Unsaved changes / Saving… / Saved at 10:42 */
export const SaveStatus: React.FC<SaveStatusProps> = ({ dirty, saving, savedAt, hasError }) => {
  if (saving) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-600">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
      </span>
    );
  }
  if (hasError) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-700">
        <AlertCircle className="w-3.5 h-3.5" /> Save failed — changes not saved
      </span>
    );
  }
  if (dirty) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
        <span className="w-2 h-2 rounded-full bg-amber-500" /> Unsaved changes
      </span>
    );
  }
  if (savedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0F5C3A]">
        <CheckCircle2 className="w-3.5 h-3.5" /> Saved at{' '}
        {savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    );
  }
  return <span className="text-[11px] text-gray-400">No changes</span>;
};

/** Warn before closing/reloading the tab while there are unsaved edits. */
export function useUnsavedChangesGuard(dirty: boolean) {
  React.useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
}
