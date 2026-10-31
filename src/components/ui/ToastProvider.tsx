"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Toast, ToastType } from "./Toast";
import "./toast.css";

interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message: string, duration?: number) => void;
  success: (title: string, message: string, duration?: number) => void;
  error: (title: string, message: string, duration?: number) => void;
  warning: (title: string, message: string, duration?: number) => void;
  info: (title: string, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  }, []);

  const success = useCallback((title: string, message: string, duration?: number) => {
    showToast("success", title, message, duration);
  }, [showToast]);

  const error = useCallback((title: string, message: string, duration?: number) => {
    showToast("error", title, message, duration);
  }, [showToast]);

  const warning = useCallback((title: string, message: string, duration?: number) => {
    showToast("warning", title, message, duration);
  }, [showToast]);

  const info = useCallback((title: string, message: string, duration?: number) => {
    showToast("info", title, message, duration);
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      
      {/* Toast Container */}
      <div className="toast-panel">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
