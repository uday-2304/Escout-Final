import React, { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, options = {}) => {
    const id = ++toastId;
    const { type = "info", duration = 4000 } = options;

    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const contextValue = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          zIndex: 9999,
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              minWidth: 260,
              boxShadow: "0 8px 22px rgba(0,0,0,0.25)",
              color: "white",
              background:
                toast.type === "success"
                  ? "#16a34a"
                  : toast.type === "error"
                  ? "#dc2626"
                  : toast.type === "warning"
                  ? "#f59e0b"
                  : "#334155",
              fontSize: 14,
              lineHeight: 1.3,
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
