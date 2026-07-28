import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@/store/useToastStore';
import { cn } from '@/lib/utils';

export const ToastContainer = memo(function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 md:px-0">
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'pointer-events-auto flex items-center gap-3 p-3.5 rounded-xl shadow-lg border text-sm font-medium backdrop-blur-md',
              toast.type === 'success' && 'bg-emerald-950/90 text-emerald-100 border-emerald-800/50 dark:bg-emerald-950/90 dark:text-emerald-100',
              toast.type === 'error' && 'bg-rose-950/90 text-rose-100 border-rose-800/50 dark:bg-rose-950/90 dark:text-rose-100',
              toast.type === 'info' && 'bg-surface-900/90 text-text-primary border-surface-700/50 dark:bg-surface-800/95 dark:text-white'
            )}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle size={18} className="text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info size={18} className="text-primary-400 shrink-0" />}

            <span className="flex-1 text-xs md:text-sm">{toast.message}</span>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white transition-colors p-1 rounded-lg"
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
