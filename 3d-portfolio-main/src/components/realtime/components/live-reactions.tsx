"use client";

import React, { useContext } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SocketContext } from "@/contexts/socketio";

export const LiveReactions = () => {
  const { floatingReactions } = useContext(SocketContext);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {floatingReactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ opacity: 1, y: reaction.y, x: reaction.x, scale: 0.5 }}
            animate={{ 
              opacity: 0, 
              y: reaction.y - 300 - Math.random() * 200, 
              x: reaction.x + (Math.random() * 100 - 50),
              scale: 1.5 + Math.random() 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 + Math.random(), ease: "easeOut" }}
            className="absolute text-4xl drop-shadow-lg"
            style={{ left: 0, top: 0 }}
          >
            {reaction.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
