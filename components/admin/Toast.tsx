"use client";

export default function Toast({ message, variant = "success" }: { message: string; variant?: "success" | "error" }) {
  return (
    <div
      className={`toast${variant === "error" ? " toast--error" : ""}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
