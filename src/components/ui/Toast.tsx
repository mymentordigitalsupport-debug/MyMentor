"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(id);
    }, 400);
  };

  const config = {
    success: {
      colorVar: "#03a65a",
      colorLight: "#005e38",
      icon: "L",
    },
    error: {
      colorVar: "#db3056",
      colorLight: "#851d41",
      icon: "+",
    },
    warning: {
      colorVar: "#fc8621",
      colorLight: "#c24914",
      icon: "!",
    },
    info: {
      colorVar: "#0070e0",
      colorLight: "#05478a",
      icon: "?",
    },
  };

  const style = config[type];

  return (
    <div
      className={cn(
        "toast-item",
        type,
        isVisible ? "show" : "hide"
      )}
      style={{
        "--clr": style.colorVar,
        "--brd": style.colorLight,
      } as React.CSSProperties & { "--clr": string; "--brd": string }}
    >
      <div className="toast">
        <button
          onClick={handleClose}
          className="close"
          aria-label="Close notification"
        />
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </div>
  );
}
