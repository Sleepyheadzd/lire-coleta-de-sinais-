import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface ReadingEntry {
  id: string;
  name: string;
  type: "PDF" | "TXT" | "Imagem" | "Outro";
  preview: string;
  progress: number; // 0-100
  lastAccessed: string; // ISO date
  scrollPosition: number;
}

interface ReadingHistoryContextType {
  entries: ReadingEntry[];
  addEntry: (entry: Omit<ReadingEntry, "id" | "lastAccessed">) => string;
  updateProgress: (id: string, progress: number, scrollPosition: number) => void;
  removeEntry: (id: string) => void;
  getEntry: (id: string) => ReadingEntry | undefined;
}

const ReadingHistoryContext = createContext<ReadingHistoryContextType | undefined>(undefined);

export function ReadingHistoryProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ReadingEntry[]>(() => {
    const stored = localStorage.getItem("lire_reading_history");
    if (stored) {
      try { return JSON.parse(stored); } catch { return []; }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("lire_reading_history", JSON.stringify(entries));
  }, [entries]);

  const addEntry = useCallback((entry: Omit<ReadingEntry, "id" | "lastAccessed">) => {
    const id = crypto.randomUUID();
    const newEntry: ReadingEntry = {
      ...entry,
      id,
      lastAccessed: new Date().toISOString(),
    };
    setEntries(prev => [newEntry, ...prev]);
    return id;
  }, []);

  const updateProgress = useCallback((id: string, progress: number, scrollPosition: number) => {
    setEntries(prev =>
      prev.map(e =>
        e.id === id
          ? { ...e, progress: Math.min(100, Math.max(0, progress)), scrollPosition, lastAccessed: new Date().toISOString() }
          : e
      ).sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
    );
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const getEntry = useCallback((id: string) => {
    return entries.find(e => e.id === id);
  }, [entries]);

  return (
    <ReadingHistoryContext.Provider value={{ entries, addEntry, updateProgress, removeEntry, getEntry }}>
      {children}
    </ReadingHistoryContext.Provider>
  );
}

export function useReadingHistory() {
  const ctx = useContext(ReadingHistoryContext);
  if (!ctx) throw new Error("useReadingHistory must be used within ReadingHistoryProvider");
  return ctx;
}
