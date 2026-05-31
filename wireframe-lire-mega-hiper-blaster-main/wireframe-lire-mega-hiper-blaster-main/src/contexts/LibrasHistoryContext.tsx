import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface LibrasEntry {
  id: string;
  text: string;
  lastAccessed: string; // ISO date
}

interface LibrasHistoryContextType {
  entries: LibrasEntry[];
  addEntry: (text: string) => string;
  removeEntry: (id: string) => void;
  getEntry: (id: string) => LibrasEntry | undefined;
}

const LibrasHistoryContext = createContext<LibrasHistoryContextType | undefined>(undefined);

export function LibrasHistoryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<LibrasEntry[]>(() => {
    const stored = localStorage.getItem("lire_libras_history");
    if (stored) {
      try { return JSON.parse(stored); } catch { return []; }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("lire_libras_history", JSON.stringify(entries));
  }, [entries]);

  const addEntry = useCallback((text: string) => {
    const id = crypto.randomUUID();
    const newEntry: LibrasEntry = {
      id,
      text,
      lastAccessed: new Date().toISOString(),
    };
    setEntries(prev => {
      // Avoid duplicates of same text, just update timestamp
      const filtered = prev.filter(e => e.text !== text);
      return [newEntry, ...filtered].slice(0, 50);
    });
    return id;
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const getEntry = useCallback((id: string) => {
    return entries.find(e => e.id === id);
  }, [entries]);

  return (
    <LibrasHistoryContext.Provider value={{ entries, addEntry, removeEntry, getEntry }}>
      {children}
    </LibrasHistoryContext.Provider>
  );
}

export function useLibrasHistory() {
  const ctx = useContext(LibrasHistoryContext);
  if (!ctx) throw new Error("useLibrasHistory must be used within LibrasHistoryProvider");
  return ctx;
}
