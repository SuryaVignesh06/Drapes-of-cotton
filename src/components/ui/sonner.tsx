"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Global toast notification host styled to match the Drapes of Cotton ivory and olive palette.
 */
export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--surface)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-card)",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
        },
      }}
      {...props}
    />
  );
}
