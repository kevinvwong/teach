"use client";

import { createContext, useContext, useState, useCallback } from "react";

type Toast = { id: number; message: string; type: "success" | "error" | "info" };

const ToastContext = createContext<{
  addToast: (message: string, type?: Toast["type"]) => void;
}>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all animate-slide-up ${
              t.type === "success" ? "bg-lms-success text-white" :
              t.type === "error" ? "bg-lms-error text-white" :
              "bg-lms-accent text-white"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{t.type === "success" ? "✓" : t.type === "error" ? "✗" : "ℹ"}</span>
              <span>{t.message}</span>
            </div>
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 200ms ease-out; }
      `}</style>
    </ToastContext.Provider>
  );
}
