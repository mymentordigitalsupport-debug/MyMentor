"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import "./fancy-button.css";

export interface FancyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
  loading?: boolean;
  topText?: string;
  bottomText?: string;
}

const FancyButton = React.forwardRef<HTMLButtonElement, FancyButtonProps>(
  (
    {
      className,
      fullWidth = false,
      loading = false,
      children,
      disabled,
      topText,
      bottomText,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("btn-container", fullWidth && "w-full")}>
        {topText && (
          <div className="btn-drawer transition-top">{topText}</div>
        )}
        {bottomText && (
          <div className="btn-drawer transition-bottom" data-value={bottomText}></div>
        )}
        <button
          className={cn("btn", className)}
          ref={ref}
          disabled={disabled ?? loading}
          {...props}
        >
          <span className="btn-text">
            {loading ? "Loading..." : children}
          </span>
        </button>
        <svg
          className="btn-corner"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-1 1 32 32"
        >
          <path d="M32,32C14.355,32,0,17.645,0,0h.985c0,17.102,13.913,31.015,31.015,31.015v.985Z"></path>
        </svg>
        <svg
          className="btn-corner"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-1 1 32 32"
        >
          <path d="M32,32C14.355,32,0,17.645,0,0h.985c0,17.102,13.913,31.015,31.015,31.015v.985Z"></path>
        </svg>
        <svg
          className="btn-corner"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-1 1 32 32"
        >
          <path d="M32,32C14.355,32,0,17.645,0,0h.985c0,17.102,13.913,31.015,31.015,31.015v.985Z"></path>
        </svg>
        <svg
          className="btn-corner"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="-1 1 32 32"
        >
          <path d="M32,32C14.355,32,0,17.645,0,0h.985c0,17.102,13.913,31.015,31.015,31.015v.985Z"></path>
        </svg>
      </div>
    );
  }
);

FancyButton.displayName = "FancyButton";

export { FancyButton };
