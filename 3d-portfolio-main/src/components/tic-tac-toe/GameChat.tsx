"use client";

import React, { useState, useEffect, useContext, useRef } from 'react';
import { SocketContext } from '@/contexts/socketio';
import { Send } from 'lucide-react';
import { format } from 'date-fns';
import { getAvatarUrl } from '@/lib/avatar';

interface GameChatProps {
  roomId: string;
}

interface ChatMsg {
  id: string;
  username: string;
  avatar: string;
  flag?: string;
  location?: string;
  content: string;
  timestamp: string;
}

export default function GameChat({ roomId }: GameChatProps) {
  const { socket, users } = useContext(SocketContext);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg: ChatMsg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('game:chat_receive', handleReceive);

    return () => {
      socket.off('game:chat_receive', handleReceive);
    };
  }, [socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    // Find current user's profile info from context
    const currentUser = users.find((u) => u.socketId === socket.id);
    const username = currentUser?.name || 'Player';
    const avatar = currentUser?.avatar || '1.png';

    socket.emit('game:chat_send', {
      roomId,
      content: input.trim(),
    });
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white/80 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden shadow-xl">
      <div className="bg-black/5 dark:bg-white/5 p-4 border-b border-black/10 dark:border-white/10">
        <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse"></span>
          Room Chat
        </h3>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth min-h-[300px]">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 dark:text-slate-400 text-sm mt-4 italic">
            No messages yet. Say hello!
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-2 ${msg.username === (users.find(u => u.socketId === socket?.id)?.name || 'Player') ? 'flex-row-reverse' : ''}`}>
            <img src={getAvatarUrl(msg.avatar)} alt="Avatar" className="w-8 h-8 rounded-full border border-black/10 dark:border-white/20 bg-slate-200 dark:bg-slate-800" />
            <div className={`flex flex-col ${msg.username === (users.find(u => u.socketId === socket?.id)?.name || 'Player') ? 'items-end' : 'items-start'}`}>
              <span className="text-xs text-slate-500 mb-1 px-1 flex items-center gap-1">
                {msg.flag} {msg.username} <span className="opacity-50">from {msg.location}</span> • {format(new Date(msg.timestamp), 'HH:mm')}
              </span>
              <div className={`px-3 py-2 rounded-2xl text-sm max-w-[200px] break-words border border-black/10 dark:border-white/10 ${msg.username === (users.find(u => u.socketId === socket?.id)?.name || 'Player') ? 'bg-black text-white dark:bg-white dark:text-black rounded-tr-none' : 'bg-white dark:bg-black text-black dark:text-white rounded-tl-none'}`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white/50 dark:bg-black/50 border-t border-black/10 dark:border-white/10 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-transparent border border-black/20 dark:border-white/20 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-black dark:focus:border-white dark:text-white text-black placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="cursor-can-hover p-2 bg-black dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 disabled:hover:bg-black dark:disabled:hover:bg-white text-white dark:text-black rounded-full transition-colors flex items-center justify-center"
        >
          <Send className="w-4 h-4 ml-[-2px]" />
        </button>
      </form>
    </div>
  );
}
