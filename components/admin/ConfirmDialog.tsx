"use client";

import { useEffect, useRef } from "react";

interface Action {
  label: string;
  onClick: () => void;
  variant: "primary" | "outline" | "danger";
}

export default function ConfirmDialog({
  title,
  message,
  actions,
}: {
  title: string;
  message?: string;
  actions: Action[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // focus the first action for keyboard users
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, []);

  return (
    <div className="modal-scrim" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal" ref={ref}>
        <h3>{title}</h3>
        {message && <p>{message}</p>}
        <div className="actions">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              className={`btn ${
                a.variant === "primary" ? "btn--primary" : a.variant === "danger" ? "btn--danger" : "btn--outline"
              }`}
              onClick={a.onClick}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
