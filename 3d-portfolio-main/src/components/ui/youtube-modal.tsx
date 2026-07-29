"use client";

import React from "react";
import { useYoutubeWindows } from "@/contexts/youtube-windows";

export const YoutubeModal = ({ 
  videoId, 
  title, 
  triggerText 
}: { 
  videoId: string;
  title: string;
  triggerText: React.ReactNode;
}) => {
  const { openWindow } = useYoutubeWindows();

  return (
    <button 
      onClick={() => openWindow(videoId, title)}
      className="underline hover:text-blue-400 transition-colors cursor-pointer text-left"
    >
      {triggerText}
    </button>
  );
};
