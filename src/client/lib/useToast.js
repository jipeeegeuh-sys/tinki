import { createContext, useCallback, useContext, useRef, useState } from 'react';

const MAX_TOASTS = 3;
const EXIT_MS    = 300;
const DURATIONS  = { success: 4000, warning: 6000, info: 4000, error: null };

export const ToastContext = createContext(null);

let _nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const removeToast = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);

    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));

    const exitTimer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timers.current.delete(`${id}:exit`);
    }, EXIT_MS);

    timers.current.set(`${id}:exit`, exitTimer);
  }, []);

  const addToast = useCallback(
    (type, message) => {
      const id = `toast-${_nextId++}`;

      setToasts((prev) => {
        const item = { id, type, message, exiting: false };
        if (prev.length >= MAX_TOASTS) {
          const [evicted, ...rest] = prev;
          clearTimeout(timers.current.get(evicted.id));
          timers.current.delete(evicted.id);
          return [...rest, item];
        }
        return [...prev, item];
      });

      const ms = DURATIONS[type];
      if (ms !== null) {
        timers.current.set(id, setTimeout(() => removeToast(id), ms));
      }
      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (msg) => addToast('success', msg),
    error:   (msg) => addToast('error',   msg),
    warning: (msg) => addToast('warning', msg),
    info:    (msg) => addToast('info',    msg),
  };

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé à l'intérieur de <ToastProvider>");
  return ctx;
}
