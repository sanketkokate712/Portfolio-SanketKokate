"use client";

import React from "react";
import { AnimatePresence } from "motion/react";
import { useYoutubeWindows } from "@/contexts/youtube-windows";
import { DraggableYoutubeWindow } from "./draggable-youtube-window";

export const YoutubeWindowManager = () => {
  const { windows } = useYoutubeWindows();

  if (windows.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[200]">
      <AnimatePresence>
        {windows.map((w) => (
          // pointer-events-auto ensures the window itself captures events
          <div key={w.id} className="pointer-events-auto">
            <DraggableYoutubeWindow windowData={w} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
