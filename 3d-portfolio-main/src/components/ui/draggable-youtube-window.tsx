"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useDragControls } from "motion/react";
import { X, Maximize2, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { YoutubeWindowData, useYoutubeWindows } from "@/contexts/youtube-windows";

export const DraggableYoutubeWindow = ({ windowData }: { windowData: YoutubeWindowData }) => {
  const { closeWindow, focusWindow, updatePosition } = useYoutubeWindows();
  const controls = useDragControls();
  const windowRef = useRef<HTMLDivElement>(null);
  
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Track dragging state to not trigger clicks when dragging
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      ref={windowRef}
      drag
      dragControls={controls}
      dragListener={false} // Only drag from the handle
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, info) => {
        setTimeout(() => setIsDragging(false), 100);
        updatePosition(windowData.id, windowData.x + info.offset.x, windowData.y + info.offset.y);
      }}
      initial={{ opacity: 0, scale: 0.9, x: windowData.x, y: windowData.y }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        // x and y are controlled by the drag physics once mounted, but we can set constraints
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: "fixed",
        zIndex: windowData.zIndex,
        minWidth: 320,
        minHeight: isMinimized ? 48 : 200,
        // We set x/y directly on initial, motion takes over
      }}
      onPointerDown={() => focusWindow(windowData.id)}
      className={cn(
        "flex flex-col overflow-hidden rounded-xl shadow-2xl transition-[height,width] duration-300",
        "border border-white/20 dark:border-white/10",
        "bg-white/70 dark:bg-black/60 backdrop-blur-xl", // Glassmorphism
        isMinimized 
          ? "w-[300px] h-12 !resize-none" 
          : "w-[90vw] h-[50vw] md:w-[640px] md:h-[360px] resize"
      )}
    >
      {/* Title Bar (Drag Handle) */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/10"
        onPointerDown={(e) => controls.start(e)}
      >
        <span className="font-semibold text-xs truncate max-w-[200px] md:max-w-xs text-slate-800 dark:text-slate-200">
          {windowData.title}
        </span>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-slate-700 dark:text-slate-300"
            title={isMinimized ? "Restore" : "Minimize"}
          >
            {isMinimized ? <Maximize2 size={14} /> : <Minus size={14} />}
          </button>
          <button
            onClick={() => closeWindow(windowData.id)}
            className="p-1 rounded-md hover:bg-red-500/80 hover:text-white transition-colors text-slate-700 dark:text-slate-300"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Video Content */}
      <div 
        className={cn(
          "relative flex-1 w-full h-full transition-opacity duration-300",
          isMinimized ? "opacity-0 pointer-events-none hidden" : "opacity-100"
        )}
      >
        {/* We keep iframe rendered but hidden so video doesn't restart when minimized */}
        <iframe
          src={`https://www.youtube.com/embed/${windowData.videoId}?autoplay=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full border-0"
        />
        
        {/* Transparent overlay to allow dragging over the iframe without the iframe stealing pointer events */}
        {isDragging && (
          <div className="absolute inset-0 z-10 cursor-grabbing" />
        )}
      </div>
    </motion.div>
  );
};
