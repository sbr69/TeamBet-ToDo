'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, X } from 'lucide-react';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { clsx } from 'clsx';

// Toast types
type ToastType = 'success' | 'error' | 'loading';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
}

interface ToastContextType {
    showToast: (type: ToastType, title: string, message?: string) => string;
    dismissToast: (id: string) => void;
    updateToast: (id: string, type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Toast Item Component
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-green-400" />,
        error: <XCircle className="w-5 h-5 text-red-400" />,
        loading: <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />,
    };

    const bgColors = {
        success: 'border-green-500/30 bg-green-500/10',
        error: 'border-red-500/30 bg-red-500/10',
        loading: 'border-blue-500/30 bg-blue-500/10',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={clsx(
                'relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm shadow-xl',
                'bg-zinc-900/90',
                bgColors[toast.type]
            )}
        >
            <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{toast.title}</p>
                {toast.message && (
                    <p className="mt-1 text-sm text-zinc-400 truncate">{toast.message}</p>
                )}
            </div>
            {toast.type !== 'loading' && (
                <button
                    onClick={onDismiss}
                    className="flex-shrink-0 p-1 text-zinc-400 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </motion.div>
    );
}

// Toast Provider Component
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = Math.random().toString(36).substring(7);
        const newToast: Toast = { id, type, title, message };

        setToasts((prev) => [...prev, newToast]);

        // Auto-dismiss success/error toasts after 5 seconds
        if (type !== 'loading') {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 5000);
        }

        return id;
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const updateToast = useCallback((id: string, type: ToastType, title: string, message?: string) => {
        setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, type, title, message } : t))
        );

        // Auto-dismiss after update if not loading
        if (type !== 'loading') {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 5000);
        }
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, dismissToast, updateToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <div key={toast.id} className="pointer-events-auto">
                            <ToastItem toast={toast} onDismiss={() => dismissToast(toast.id)} />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
