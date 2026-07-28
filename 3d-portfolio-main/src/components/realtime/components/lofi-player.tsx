"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "@/contexts/socketio";
import { THEME } from "../constants";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, SkipForward, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TRACKS = [
  { title: "Creative Focus", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Deep Work Flow", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Late Night Deploy", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

export const LofiPlayer = () => {
  const { lofiState, sendLofiAction } = useContext(SocketContext);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (!audioRef.current) return;
    
    // Check if we need to sync track index
    if (!audioRef.current.src.includes(TRACKS[lofiState.trackIndex]?.url)) {
      audioRef.current.src = TRACKS[lofiState.trackIndex]?.url;
    }

    // Sync play/pause state
    if (lofiState.isPlaying && hasInteracted) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  }, [lofiState.isPlaying, lofiState.trackIndex, hasInteracted]);

  const togglePlay = () => {
    setHasInteracted(true);
    sendLofiAction(lofiState.isPlaying ? "pause" : "play");
  };

  const nextTrack = () => {
    setHasInteracted(true);
    const nextIdx = (lofiState.trackIndex + 1) % TRACKS.length;
    sendLofiAction("skip", { trackIndex: nextIdx });
    sendLofiAction("play");
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex flex-col items-center gap-3 w-64 bg-black/60 dark:bg-black/80 border-white/10"
          >
            <div className="text-center w-full">
              <p className="text-xs text-white/50 font-medium uppercase tracking-wider mb-1">Shared DJ Room</p>
              <p className="text-sm text-white font-semibold truncate">{TRACKS[lofiState.trackIndex]?.title}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="h-10 w-10 rounded-full hover:bg-white/10 text-white bg-white/5 border border-white/10"
              >
                {lofiState.isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextTrack}
                className="h-10 w-10 rounded-full hover:bg-white/10 text-white"
              >
                <SkipForward size={18} />
              </Button>
            </div>
            
            {!hasInteracted && lofiState.isPlaying && (
              <p className="text-xs text-violet-400 mt-1 animate-pulse">Click play to join the room!</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mt-2">
        {lofiState.isPlaying && (
          <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 rounded-full blur-md animate-pulse opacity-80" />
        )}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative rounded-full h-14 w-14 shadow-lg backdrop-blur-xl border border-white/10 text-white hover:scale-105 transition-transform z-10",
            lofiState.isPlaying && hasInteracted ? "bg-black/80 hover:bg-black/90" : "bg-black/50 hover:bg-black/70"
          )}
        >
          <Music size={24} className={lofiState.isPlaying ? "animate-bounce text-violet-400" : ""} />
        </Button>
      </div>

      <audio ref={audioRef} onEnded={nextTrack} />
    </div>
  );
};
