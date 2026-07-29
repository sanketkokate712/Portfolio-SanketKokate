"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type YoutubeWindowData = {
  id: string;
  videoId: string;
  title: string;
  x: number;
  y: number;
  zIndex: number;
};

type YoutubeWindowContextType = {
  windows: YoutubeWindowData[];
  openWindow: (videoId: string, title: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updatePosition: (id: string, x: number, y: number) => void;
};

const YoutubeWindowContext = createContext<YoutubeWindowContextType | null>(null);

export const useYoutubeWindows = () => {
  const context = useContext(YoutubeWindowContext);
  if (!context) {
    throw new Error("useYoutubeWindows must be used within a YoutubeWindowProvider");
  }
  return context;
};

export const YoutubeWindowProvider = ({ children }: { children: ReactNode }) => {
  const [windows, setWindows] = useState<YoutubeWindowData[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(100);

  const openWindow = useCallback(
    (videoId: string, title: string) => {
      setWindows((prev) => {
        // Prevent opening the exact same video multiple times
        if (prev.find((w) => w.videoId === videoId)) {
          const w = prev.find((w) => w.videoId === videoId)!;
          // Bring it to front
          setMaxZIndex((z) => z + 1);
          return prev.map(p => p.id === w.id ? { ...p, zIndex: maxZIndex + 1 } : p);
        }

        const id = Math.random().toString(36).substring(7);
        // Stagger positions slightly
        const offset = (prev.length * 40) % 200;
        const x = window.innerWidth / 2 - 300 + offset;
        const y = Math.max(100, window.innerHeight / 2 - 200 + offset);

        const nextZIndex = maxZIndex + 1;
        setMaxZIndex(nextZIndex);

        return [
          ...prev,
          { id, videoId, title, x, y, zIndex: nextZIndex },
        ];
      });
    },
    [maxZIndex]
  );

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const focusWindow = useCallback(
    (id: string) => {
      setWindows((prev) => {
        const windowData = prev.find((w) => w.id === id);
        if (!windowData || windowData.zIndex === maxZIndex) return prev;

        const nextZIndex = maxZIndex + 1;
        setMaxZIndex(nextZIndex);

        return prev.map((w) =>
          w.id === id ? { ...w, zIndex: nextZIndex } : w
        );
      });
    },
    [maxZIndex]
  );

  const updatePosition = useCallback((id: string, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, x, y } : w))
    );
  }, []);

  return (
    <YoutubeWindowContext.Provider
      value={{ windows, openWindow, closeWindow, focusWindow, updatePosition }}
    >
      {children}
    </YoutubeWindowContext.Provider>
  );
};
