import { createContext, useCallback, useContext, useRef, useState } from 'react';

const LiveRegionContext = createContext(null);

export function LiveRegionProvider({ children }) {
  const [politeMsg, setPoliteMsg] = useState('');
  const [assertiveMsg, setAssertiveMsg] = useState('');
  const politeTimer = useRef(null);
  const assertiveTimer = useRef(null);

  const announcePolite = useCallback((message) => {
    clearTimeout(politeTimer.current);
    setPoliteMsg('');
    politeTimer.current = setTimeout(() => setPoliteMsg(message), 50);
  }, []);

  const announceAssertive = useCallback((message) => {
    clearTimeout(assertiveTimer.current);
    setAssertiveMsg('');
    assertiveTimer.current = setTimeout(() => setAssertiveMsg(message), 50);
  }, []);

  return (
    <LiveRegionContext.Provider value={{ announcePolite, announceAssertive }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="wsb-sr-only"
      >
        {politeMsg}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="wsb-sr-only"
      >
        {assertiveMsg}
      </div>
    </LiveRegionContext.Provider>
  );
}

export function useLiveRegion() {
  const ctx = useContext(LiveRegionContext);
  if (!ctx) throw new Error("useLiveRegion doit être utilisé à l'intérieur de <LiveRegionProvider>");
  return ctx;
}
