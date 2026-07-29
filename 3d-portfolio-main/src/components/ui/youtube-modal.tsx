"use client";

import React from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "./responsive-dialog";

export const YoutubeModal = ({ 
  videoId, 
  title, 
  triggerText 
}: { 
  videoId: string;
  title: string;
  triggerText: React.ReactNode;
}) => {
  return (
    <ResponsiveDialog>
      <ResponsiveDialogTrigger asChild>
        <button className="underline hover:text-blue-400 transition-colors cursor-pointer text-left">
          {triggerText}
        </button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-black border-none">
        <ResponsiveDialogHeader className="p-4 bg-slate-900 border-b border-slate-800">
          <ResponsiveDialogTitle className="text-white">{title}</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="relative w-full aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full border-0"
          />
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};
