"use client";

import React, { useState, useEffect, useContext, useRef } from 'react';
import { SocketContext } from '@/contexts/socketio';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Loader2, Play, User, Globe, Trophy, Settings } from 'lucide-react';
import GameChat from './GameChat';
import confetti from 'canvas-confetti';
import { EditProfileModal } from '@/components/realtime/components/edit-profile-modal';
import { useToast } from '@/components/ui/use-toast';

type PlayerRole = 'X' | 'O' | 'Spectator' | null;
type BoardState = Array<string | null>;

interface PlayerData {
  socketId: string;
  name: string;
  symbol: string;
  flag: string;
  location: string;
}

interface RoomData {
  roomId: string;
  host: PlayerData;
}

// Simple Web Audio API for zero-dependency sound effects
const playSound = (type: 'place' | 'win' | 'start') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'place') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'win') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'start') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.setValueAtTime(450, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export default function TicTacToe() {
  const { socket, users } = useContext(SocketContext);
  const { toast } = useToast();
  
  // Lobby State
  const [activeRooms, setActiveRooms] = useState<RoomData[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [roomId, setRoomId] = useState<string>('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Game State
  const [role, setRole] = useState<PlayerRole>(null);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [opponentData, setOpponentData] = useState<PlayerData | null>(null);
  const [myProfile, setMyProfile] = useState<PlayerData | null>(null);
  
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [turn, setTurn] = useState<string | null>(null);
  const [winnerInfo, setWinnerInfo] = useState<{ winner: string; combo: number[] } | null>(null);
  
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showVsScreen, setShowVsScreen] = useState(false);
  const [challengeRequest, setChallengeRequest] = useState<any>(null);

  useEffect(() => {
    if (!socket) return;
    
    const me = users.find(u => u.socketId === socket.id);
    if (me) {
      setMyProfile({
        socketId: me.socketId,
        name: me.name,
        symbol: 'X', // default, updated later
        flag: me.flag,
        location: me.location
      });
    }

    socket.emit('game:get_rooms');

    socket.on('game:rooms_list', (rooms: RoomData[]) => {
      setActiveRooms(rooms);
    });

    socket.on('game:hosted', (data: { roomId: string }) => {
      setRoomId(data.roomId);
      setIsJoined(true);
    });

    socket.on('game:challenge_received', (data: any) => {
      setChallengeRequest(data);
      playSound('start');
    });

    socket.on('game:challenge_declined', (data: any) => {
      alert("Challenge declined: " + data.message);
    });

    socket.on('game:status', (data: { role: PlayerRole; opponent: string | null; opponentData: PlayerData | null }) => {
      setRole(data.role);
      if (data.opponent) setOpponent(data.opponent);
      if (data.opponentData) {
        setOpponentData(data.opponentData);
        if (data.opponent) {
           // We have an opponent! Show VS Screen
           setShowVsScreen(true);
           playSound('start');
           setTimeout(() => {
             setShowVsScreen(false);
           }, 3000); // VS screen duration
        }
      }
      setIsJoined(true);
    });

    socket.on('game:update', (data: { board: BoardState; turn: string }) => {
      setBoard(data.board);
      setTurn(data.turn);
      setWinnerInfo(null);
    });

    socket.on('game:over', (data: { winner: string; combo: number[] }) => {
      setWinnerInfo(data);
      if (data.winner !== 'draw') {
        playSound('win');
        triggerConfetti();
      }
    });

    socket.on('opponent:left', () => {
      setOpponent(null);
      setOpponentData(null);
      alert("Opponent has left the match.");
    });

    return () => {
      socket.off('game:rooms_list');
      socket.off('game:hosted');
      socket.off('game:challenge_received');
      socket.off('game:challenge_declined');
      socket.off('game:status');
      socket.off('game:update');
      socket.off('game:over');
      socket.off('opponent:left');
    };
  }, [socket, users]);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
      confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
  };

  const hostMatch = () => {
    if (!socket) return;
    socket.emit('game:host');
  };

  const challengePlayer = (targetRoomId: string) => {
    if (!socket) return;
    socket.emit('game:challenge', { roomId: targetRoomId });
    setRoomId(targetRoomId);
  };

  const handleChallengeResponse = (accept: boolean) => {
    if (!socket || !challengeRequest) return;
    socket.emit('game:challenge_response', { 
      roomId, 
      challengerId: challengeRequest.challengerId, 
      accept 
    });
    setChallengeRequest(null);
  };

  const handleCellClick = (index: number) => {
    if (!socket || role === 'Spectator' || winnerInfo || board[index] !== null) return;
    if (socket.id !== turn) return;

    // Optimistic update
    playSound('place');
    const newBoard = [...board];
    newBoard[index] = role;
    setBoard(newBoard);

    socket.emit('player:move', { index, roomId });
  };

  const restartGame = () => {
    if (!socket) return;
    socket.emit('game:restart', { roomId });
  };

  const leaveRoom = () => {
    if (!socket) return;
    socket.emit('game:leave', { roomId });
    setIsJoined(false);
    setBoard(Array(9).fill(null));
    setRole(null);
    setWinnerInfo(null);
    setOpponent(null);
    setOpponentData(null);
    setRoomId('');
  };

  const updateProfile = ({ name, avatar, color }: { name: string; avatar: string, color?: string }) => {
    socket?.emit("update-user", {
      username: name,
      avatar,
      color
    });
    localStorage.setItem("username", name);
    localStorage.setItem("avatar", avatar);
    if (color) localStorage.setItem("color", color);
    toast({ title: "Profile updated for all chats and games!" });
    setIsEditingProfile(false);
  };

  // ----------------------------------------------------
  // RENDER LOBBY
  // ----------------------------------------------------
  if (!isJoined) {
    const currentUser = users.find(u => u.socketId === socket?.id);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl p-8 rounded-[2rem] border border-black/10 dark:border-white/10 shadow-2xl w-full max-w-2xl"
        >
          <div className="text-center mb-10">
             <Trophy className="w-16 h-16 mx-auto text-black dark:text-white mb-4" />
             <h2 className="text-4xl font-black text-black dark:text-white tracking-tight">Arena Lobby</h2>
             <p className="text-slate-500 mt-2">Challenge players or host your own match.</p>
          </div>

          <button
            onClick={hostMatch}
            disabled={!socket}
            className="cursor-can-hover w-full bg-black text-white dark:bg-white dark:text-black font-bold py-4 rounded-2xl transition-all shadow-lg disabled:opacity-50 flex justify-center items-center gap-3 text-lg mb-8 hover:scale-[1.02] active:scale-[0.98]"
          >
            {socket ? <Play className="w-6 h-6 fill-current" /> : <Loader2 className="w-6 h-6 animate-spin" />}
            Host a Match
          </button>

          <div className="space-y-4">
             <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Waiting for Challengers</h3>
             {activeRooms.length === 0 ? (
                <div className="text-center py-8 bg-black/5 dark:bg-white/5 rounded-2xl border border-white/5 border-dashed">
                   <p className="text-slate-500 font-medium">No one is hosting right now. Be the first!</p>
                </div>
             ) : (
                 <div className="grid gap-3">
                   {activeRooms.map((room) => (
                      <div key={room.roomId} className="flex items-center justify-between p-4 bg-white dark:bg-black/40 backdrop-blur-md rounded-2xl border border-black/10 dark:border-white/10 transition-all hover:bg-slate-50 dark:hover:bg-black/60">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-black dark:bg-white flex items-center justify-center text-xl font-bold text-white dark:text-black shadow-inner">
                               {room.host.name.charAt(0)}
                            </div>
                            <div>
                               <h4 className="font-bold text-lg text-black dark:text-white flex items-center gap-2">
                                  {room.host.name} <span className="text-xl">{room.host.flag}</span>
                               </h4>
                               <p className="text-sm text-slate-500 flex items-center gap-1">
                                  <Globe className="w-3 h-3" /> {room.host.location}
                               </p>
                            </div>
                         </div>
                         <button 
                            onClick={() => challengePlayer(room.roomId)}
                            className="cursor-can-hover px-6 py-2 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
                         >
                            <Swords className="w-4 h-4" /> Challenge
                         </button>
                      </div>
                   ))}
                </div>
             )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER VS SCREEN ANIMATION
  // ----------------------------------------------------
  if (showVsScreen && opponentData && myProfile) {
     return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden">
           {/* Player 1 (Left) */}
           <motion.div 
              initial={{ x: '-100%', skewX: -10 }} animate={{ x: 0, skewX: 0 }} transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="absolute left-0 top-0 bottom-0 w-1/2 bg-white flex flex-col items-center justify-center text-black"
           >
              <h2 className="text-7xl font-black mb-4 uppercase tracking-tighter">{myProfile.name}</h2>
              <div className="text-3xl flex items-center gap-3"><Globe /> {myProfile.location} {myProfile.flag}</div>
           </motion.div>

           {/* VS Divider */}
           <motion.div 
              initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.5, type: 'spring' }}
              className="absolute z-10 w-40 h-40 bg-black rounded-full border-8 border-white flex items-center justify-center shadow-2xl"
           >
              <span className="text-6xl font-black text-white italic">VS</span>
           </motion.div>

           {/* Player 2 (Right) */}
           <motion.div 
              initial={{ x: '100%', skewX: 10 }} animate={{ x: 0, skewX: 0 }} transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="absolute right-0 top-0 bottom-0 w-1/2 bg-black flex flex-col items-center justify-center text-white"
           >
              <h2 className="text-7xl font-black mb-4 uppercase tracking-tighter">{opponentData.name}</h2>
              <div className="text-3xl flex items-center gap-3">{opponentData.flag} {opponentData.location} <Globe /></div>
           </motion.div>
        </div>
     );
  }

  // ----------------------------------------------------
  // RENDER ACTIVE GAME
  // ----------------------------------------------------
  const isMyTurn = socket?.id === turn && role !== 'Spectator';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full relative">
      
      {/* Challenge Modal Overlay */}
      <AnimatePresence>
        {challengeRequest && (
           <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm rounded-[2rem] flex items-center justify-center"
           >
               <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white dark:bg-black p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl border border-black/10 dark:border-white/10">
                 <div className="w-20 h-20 bg-black/5 dark:bg-white/10 text-black dark:text-white rounded-full flex items-center justify-center mx-auto mb-6">
                    <Swords className="w-10 h-10" />
                 </div>
                 <h3 className="text-2xl font-black text-black dark:text-white mb-2">Challenge!</h3>
                 <p className="text-slate-500 mb-8">
                    <strong className="text-black dark:text-white">{challengeRequest.challengerName}</strong> from {challengeRequest.challengerLocation} {challengeRequest.challengerFlag} wants to battle you.
                 </p>
                 <div className="flex gap-3">
                    <button onClick={() => handleChallengeResponse(false)} className="cursor-can-hover flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-black dark:text-white font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">Decline</button>
                    <div className="relative group flex-1">
                       <button onClick={() => handleChallengeResponse(true)} className="cursor-can-hover w-full py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 shadow-lg transition-all">Accept</button>
                       <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg opacity-0 translate-y-[-10px] group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-50 shadow-lg">
                          Ready to lose? 😈
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-rose-500 rotate-45"></div>
                       </div>
                    </div>
                 </div>
              </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      <div className="lg:col-span-2 flex flex-col items-center">
        {/* Top Bar */}
        <div className="w-full flex justify-between items-center mb-8 bg-white/50 dark:bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm relative z-30">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1 bg-black/5 dark:bg-white/10 rounded-full text-sm font-medium text-black dark:text-white">
                <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse"></span> Live Match
             </div>
          </div>
          <div className="flex items-center gap-4">
             {users.find(u => u.socketId === socket?.id) && (
               <button 
                 onClick={() => setIsEditingProfile(true)}
                 className="cursor-can-hover flex items-center gap-2 bg-white/50 hover:bg-white dark:bg-white/10 dark:hover:bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-md transition-all border border-black/10 dark:border-white/10 text-black dark:text-white"
               >
                 <Settings className="w-4 h-4" />
                 <span className="font-semibold text-sm hidden sm:inline">Profile</span>
               </button>
             )}
             <button onClick={leaveRoom} className="cursor-can-hover text-sm font-bold px-4 py-2 bg-black/5 dark:bg-white/10 text-black dark:text-white rounded-lg hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
               Leave Room
             </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex justify-between items-center gap-2 sm:gap-4 mb-4 w-full max-w-lg px-2">
          <div className={`flex flex-col items-center p-2 sm:p-4 rounded-xl flex-1 transition-all relative overflow-hidden ${role === 'X' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md scale-105' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white scale-95'} border border-black/10 dark:border-white/10`}>
            {turn === (role === 'X' ? socket?.id : opponentData?.socketId) && (
               <motion.div layoutId="turn-indicator" className="absolute inset-0 border-2 border-black/20 dark:border-white/20 rounded-xl shadow-inner"></motion.div>
            )}
            <span className="text-3xl sm:text-5xl font-black mb-0.5 z-10">X</span>
            <span className="text-sm sm:text-lg font-bold z-10 text-center leading-tight">
               {role === 'X' ? (users.find(u => u.socketId === socket?.id)?.name || myProfile?.name || 'You') : (users.find(u => u.socketId === opponentData?.socketId)?.name || opponentData?.name || 'Waiting...')}
            </span>
            <span className="text-[10px] sm:text-xs opacity-70 z-10">
               {role === 'X' ? (users.find(u => u.socketId === socket?.id)?.flag || myProfile?.flag) : (users.find(u => u.socketId === opponentData?.socketId)?.flag || opponentData?.flag)}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center font-black italic text-slate-400 dark:text-slate-500 text-2xl sm:text-4xl">
             VS
          </div>

          <div className={`flex flex-col items-center p-2 sm:p-4 rounded-xl flex-1 transition-all relative overflow-hidden ${role === 'O' ? 'bg-black text-white dark:bg-white dark:text-black shadow-md scale-105' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white scale-95'} border border-black/10 dark:border-white/10`}>
            {turn === (role === 'O' ? socket?.id : opponentData?.socketId) && (
               <motion.div layoutId="turn-indicator" className="absolute inset-0 border-2 border-black/20 dark:border-white/20 rounded-xl shadow-inner"></motion.div>
            )}
            <span className="text-3xl sm:text-5xl font-black mb-0.5 z-10">O</span>
            <span className="text-sm sm:text-lg font-bold z-10 text-center leading-tight">
               {role === 'O' ? (users.find(u => u.socketId === socket?.id)?.name || myProfile?.name || 'You') : (users.find(u => u.socketId === opponentData?.socketId)?.name || opponentData?.name || 'Waiting...')}
            </span>
            <span className="text-[10px] sm:text-xs opacity-70 z-10">
               {role === 'O' ? (users.find(u => u.socketId === socket?.id)?.flag || myProfile?.flag) : (users.find(u => u.socketId === opponentData?.socketId)?.flag || opponentData?.flag)}
            </span>
          </div>
        </div>

        {/* The Board */}
        <div className="relative w-full max-w-sm px-2">
          {/* Game Board */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-slate-200 dark:bg-slate-800 p-2 sm:p-3 rounded-[2rem] shadow-xl border border-black/5 dark:border-white/5 relative z-10">
            {board.map((cell, idx) => {
              const isWinningCell = winnerInfo?.line?.includes(idx);
              const isEmpty = cell === null;
              
              return (
                  <motion.div
                  key={idx}
                  whileHover={isEmpty && isMyTurn ? { scale: 0.95, y: 2 } : {}}
                  whileTap={isEmpty && isMyTurn ? { scale: 0.9, y: 5 } : {}}
                  onClick={() => handleCellClick(idx)}
                  onMouseEnter={() => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                  className={`cursor-can-hover
                    w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center rounded-[1rem] sm:rounded-[1.5rem] text-4xl sm:text-6xl font-black transition-all duration-300
                    ${isWinningCell ? 'bg-black text-white dark:bg-white dark:text-black shadow-xl z-10 scale-110' : 'bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5'}
                    ${!isEmpty && !isWinningCell ? 'shadow-inner' : 'shadow-sm hover:shadow-md'}
                    ${!isMyTurn && isEmpty ? 'cursor-not-allowed opacity-80' : ''}
                  `}
                  animate={isWinningCell ? { y: [0, -10, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
                >
                  <AnimatePresence mode="popLayout">
                    {cell === 'X' && (
                      <motion.span
                        key="X"
                        initial={{ scale: 3, opacity: 0, rotate: -45 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        className={isWinningCell ? "text-white dark:text-black drop-shadow-lg" : "text-black dark:text-white"}
                      >
                        X
                      </motion.span>
                    )}
                    {cell === 'O' && (
                      <motion.span
                        key="O"
                        initial={{ scale: 3, opacity: 0, rotate: 45 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        className={isWinningCell ? "text-white dark:text-black drop-shadow-lg" : "text-black dark:text-white"}
                      >
                        O
                      </motion.span>
                    )}
                    {/* Ghost piece on hover */}
                    {isEmpty && isMyTurn && hoverIndex === idx && !winnerInfo && (
                       <motion.span
                          key="ghost"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 0.3, scale: 1 }}
                          className="text-black dark:text-white"
                       >
                         {role}
                       </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        {/* Overlays */}
          <AnimatePresence>
            {winnerInfo && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-white/40 dark:bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center z-[100]"
              >
                <motion.div 
                  initial={{ scale: 0.5, y: 50, rotateX: 45 }} animate={{ scale: 1, y: 0, rotateX: 0 }} 
                  transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.2 }}
                  className="bg-white dark:bg-black p-10 rounded-3xl shadow-2xl text-center border border-black/10 dark:border-white/10 max-w-lg w-[90%]"
                >
                  <h3 className={`text-4xl sm:text-6xl font-black mb-4 uppercase tracking-tighter text-black dark:text-white`}>
                    {winnerInfo.winner === 'draw' ? "Draw" : winnerInfo.winner === role ? "Victory!" : "Defeat"}
                  </h3>
                  <p className="text-slate-500 mb-6 sm:mb-8 font-medium text-lg sm:text-xl">
                    {winnerInfo.winner === 'draw' ? 'A battle of equals.' : `${winnerInfo.winner === 'X' ? 'Player 1' : 'Player 2'} takes the crown.`}
                  </p>
                  {(role === 'X' || role === 'O') && (
                    <button onClick={restartGame} className="cursor-can-hover px-6 sm:px-10 py-3 sm:py-4 bg-black text-white dark:bg-white dark:text-black rounded-full font-bold text-lg sm:text-xl transition-transform hover:scale-105 active:scale-95 shadow-xl w-full">
                      Play Again
                    </button>
                  )}
                </motion.div>
              </motion.div>
            )}
            {!opponent && role !== 'Spectator' && (
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-20"
               >
                 <div className="bg-white dark:bg-black p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 text-center max-w-[250px] border border-black/10 dark:border-white/10">
                    <div className="relative">
                       <Loader2 className="w-12 h-12 animate-spin text-black dark:text-white" />
                    </div>
                    <div>
                       <span className="font-bold text-lg block text-black dark:text-white">Waiting for opponent...</span>
                       <span className="text-sm text-slate-500 mt-1 block">Your room is visible in the lobby.</span>
                    </div>
                 </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="lg:col-span-1 h-[250px] sm:h-[350px] lg:h-[500px] mt-4 lg:mt-0 w-full max-w-sm sm:max-w-md lg:max-w-none mx-auto lg:mx-0">
        <GameChat roomId={roomId} />
      </div>

      {users.find(u => u.socketId === socket?.id) && (
        <EditProfileModal
          user={users.find(u => u.socketId === socket?.id) as any}
          isOpen={isEditingProfile}
          onClose={() => setIsEditingProfile(false)}
          updateProfile={updateProfile}
        />
      )}
    </div>
  );
}
