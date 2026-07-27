# Source Code for Portfolio Features

Provide the following code to your AI to rebuild the Resume, Hire Me tooltip, and Live Agent Chat features.

## app/resume/page.tsx
```tsx
import ResumeView from "./resume-view";

export const metadata = {
  title: "Résumé | Sanket Kokate",
  description:
    "Résumé of Sanket Kokate — Full-Stack Developer. View online or download the PDF.",
};

export default function ResumePage() {
  return <ResumeView />;
}

```

## app/resume/resume-view.tsx
```tsx
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ResumeDoodle from "./resume-doodle";

// Drop the compiled PDF here: frontend/public/Sanket_Kokate_Resume.pdf
const RESUME_PATH = "/Sanket_Kokate_Resume.pdf";

export default function ResumeView() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* Hide the global nav on mobile, only while this page is mounted */}
      <style
        dangerouslySetInnerHTML={{
          __html:
            "@media (max-width: 767px){ header { display: none !important; } }",
        }}
      />

      {/* Top bar: back (left) + download (right) */}
      <div className="mx-auto w-full max-w-4xl shrink-0 px-4 pt-24 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 flex items-center justify-between gap-4"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to portfolio
          </Link>
          <Button>
            <a
              href={RESUME_PATH}
              download
              className="flex gap-2 text-sm transition-colors hover:text-foreground"
            >
              <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              Download PDF
            </a>
          </Button>
        </motion.div>
      </div>

      {/* PDF viewer — centered on mobile (short A4 card), top-aligned on desktop (tall) */}
      <div className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-2 pb-6 md:items-start md:px-4 md:pb-24">
        {/* opacity-only animation: a transformed ancestor would trap the fixed doodle FAB */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="aspect-[210/297] w-full overflow-hidden rounded-2xl bg-white shadow-xl"
        >
          <ResumeDoodle
            src={`${RESUME_PATH}#toolbar=0&navpanes=0&view=FitH`}
            title="Sanket Kokate — Résumé"
          />
        </motion.div>
      </div>
    </div>
  );
}

```

## app/resume/resume-doodle.tsx
```tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Pencil, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = [
  "hsl(20,100%,70%)", // accent
  "#ffffff",
  "#5cc8ff",
  "#ff6bb9",
  "#9b8cff",
];

export default function ResumeDoodle({
  src,
  title,
}: {
  src: string;
  title: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const [active, setActive] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [wiped, setWiped] = useState(false);

  // Keep the canvas sized to the viewer (clears on resize — rare, fine for a doodle).
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const resize = () => {
      const { width, height } = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  const posFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!active) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = posFromEvent(e);
    // a single dot, so taps leave a mark too
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && last.current) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(last.current.x, last.current.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    setHasDrawing(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!active || !drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    const l = last.current;
    if (!ctx || !l) return;
    const p = posFromEvent(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };

  const onPointerUp = () => {
    drawing.current = false;
    last.current = null;
  };

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    // quick wipe animation, then clear
    setWiped(true);
    window.setTimeout(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawing(false);
      setWiped(false);
    }, 180);
  }, []);

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden bg-zinc-100/50 flex flex-col items-center justify-center">
      <iframe
        src={src}
        title={title}
        className="h-full w-full border-none shadow-sm"
      />

      {/* Doodle layer */}
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ opacity: wiped ? 0 : 1, transition: "opacity 160ms ease" }}
        className={cn(
          "absolute inset-0 z-10",
          active
            ? "pointer-events-auto cursor-crosshair touch-none"
            : "pointer-events-none"
        )}
      />

      {/* Floating toolbar (viewport-fixed FAB so it never overlaps the page) */}
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2">
        {/* Color swatches + clear appear in doodle mode */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0, x: 12, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 12, scale: 0.9 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-2 backdrop-blur-md"
            >
              {COLORS.map((c) => (
                <motion.button
                  key={c}
                  type="button"
                  aria-label={`Pick color ${c}`}
                  onClick={() => setColor(c)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.85 }}
                  className={cn(
                    "h-5 w-5 rounded-full ring-offset-2 ring-offset-background transition-shadow",
                    color === c ? "ring-2 ring-foreground" : "ring-0"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
              <div className="mx-1 h-5 w-px bg-border" />
              <motion.button
                type="button"
                aria-label="Clear doodles"
                onClick={clear}
                disabled={!hasDrawing}
                whileHover={{ scale: hasDrawing ? 1.1 : 1 }}
                whileTap={{ scale: hasDrawing ? 0.85 : 1 }}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                  hasDrawing
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-muted-foreground/30"
                )}
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle button */}
        <motion.button
          type="button"
          onClick={() => setActive((a) => !a)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          aria-pressed={active}
          className={cn(
            "group flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-lg transition-colors",
            active
              ? "bg-[hsl(20,100%,70%)] text-black"
              : "border border-border/60 bg-background/80 text-foreground backdrop-blur-md hover:border-[hsl(20,100%,70%)]/40"
          )}
        >
          <motion.span
            animate={active ? { rotate: [0, -18, 14, -8, 0] } : { rotate: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex"
          >
            {active ? (
              <Check className="h-4 w-4" />
            ) : (
              <Pencil className="h-4 w-4" />
            )}
          </motion.span>
          {active ? "Done" : "Doodle on it"}
        </motion.button>
      </div>
    </div>
  );
}

```

## components/sections/hero.tsx
```tsx
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { File, Github, Linkedin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePreloader } from "../preloader";
import { BlurIn, BoxReveal } from "../reveal-animations";
import ScrollDownIcon from "../scroll-down-icon";
import { SiGithub, SiLinkedin, SiX } from "react-icons/si";
import { config } from "@/data/config";

import SectionWrapper from "../ui/section-wrapper";

const HeroSection = () => {
  const { isLoading } = usePreloader();

  return (
    <SectionWrapper id="hero" className={cn("relative w-full h-screen")}>
      <div className="grid md:grid-cols-2">
        <div
          className={cn(
            "h-[calc(100dvh-3rem)] md:h-[calc(100dvh-4rem)] z-[2]",
            "col-span-1",
            "flex flex-col justify-start md:justify-center items-center md:items-start",
            "pt-28 sm:pb-16 md:p-20 lg:p-24 xl:p-28"
          )}
        >
          {!isLoading && (
            <div className="flex flex-col">
              <div>
                <BlurIn delay={0.7}>
                  <p
                    className={cn(
                      "md:self-start mt-4 font-medium text-md text-slate-500 dark:text-zinc-400",
                      "cursor-default sm:text-xl md:text-xl whitespace-nowrap bg-clip-text "
                    )}
                  >
                    Hi, I am
                    <br className="md:hidden" />
                  </p>
                </BlurIn>

                <BlurIn delay={1}>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <h1
                        className={cn(
                          "-ml-[6px] leading-none text-transparent text-slate-800 text-left",
                          "font-bold text-7xl md:text-7xl lg:text-8xl xl:text-9xl",
                          "cursor-default text-edge-outline font-display "
                        )}
                      >
                        {config.author.split(" ")[0]}
                        <br className="md:block hiidden" />
                        {config.author.split(" ")[1]}
                      </h1>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-slate-700 font-medium px-3 py-1.5 rounded-lg text-xs shadow-lg"
                    >
                      ✨ Psst! Open DevTools for a secret... 🕵️‍♂️
                    </TooltipContent>
                  </Tooltip>
                </BlurIn>
                {/* <div className="md:block hidden bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0 w-screen h-px animate-fade-right animate-glow" /> */}
                <BlurIn delay={1.2}>
                  <div
                    className={cn(
                      "md:self-start md:mt-4 font-medium text-md text-slate-500 dark:text-zinc-400",
                      "cursor-default sm:text-xl md:text-xl whitespace-nowrap bg-clip-text flex items-center gap-1.5"
                    )}
                  >
                    Full Stack Developer
                  </div>
                </BlurIn>
              </div>
              <div className="mt-8 flex flex-col gap-3 w-fit">
                <BoxReveal delay={2} width="100%" >
                  <Button asChild className="flex items-center gap-2 w-full">
                    <Link href="/resume">
                      <File size={24} />
                      <p>Resume</p>
                    </Link>
                  </Button>
                </BoxReveal>
                <div className="md:self-start flex gap-3">
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant={"outline"}
                        className="block w-full overflow-hidden"
                      >
                        <Link href={"#contact"}>
                          Hire Me
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>pls 🥹 🙏</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="flex items-center h-full gap-2">
                    <Button asChild variant={"outline"}>
                      <Link href={config.social.twitter} target="_blank">
                        <SiX size={24} />
                      </Link>
                    </Button>
                    <Button asChild variant={"outline"}>
                      <Link
                        href={config.social.github}
                        target="_blank"
                        className="cursor-can-hover"
                      >
                        <SiGithub size={24} />
                      </Link>
                    </Button>
                    <Button asChild variant={"outline"}>
                      <Link
                        href={config.social.linkedin}
                        target="_blank"
                        className="cursor-can-hover"
                      >
                        <SiLinkedin size={24} />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="grid col-span-1"></div>
      </div>
      <div className="absolute bottom-10 left-[50%] translate-x-[-50%]">
        <ScrollDownIcon />
      </div>
    </SectionWrapper>
  );
};

export default HeroSection;

```

## contexts/socketio.tsx
```tsx
"use client";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useToast } from "@/components/ui/use-toast";

export type User = {
  id: string;
  socketId: string;
  name: string;
  avatar: string;
  color: string;
  isOnline: boolean;
  location: string;
  flag: string;
  lastSeen: string;
  createdAt: string;
  isAdmin?: boolean;
};
export type Message = {
  id: string;
  sessionId: string;
  flag: string;
  country: string;
  username: string;
  avatar: string;
  color?: string;
  content: string;
  createdAt: string | Date;
  editedAt?: string | Date;
  replyTo?: { id: string; username: string; content: string };
};

export type SystemMessage = {
  id: string;
  type: "system";
  subtype: "join";
  sessionId: string;
  username: string;
  flag: string;
  createdAt: string | Date;
};

export type ChatItem = Message | SystemMessage;

export type Reaction = { emoji: string; sessionIds: string[] };

export type UserProfile = { name: string; avatar: string; color: string; isAdmin?: boolean };

export type CursorPosition = { x: number; y: number };

type SocketContextType = {
  socket: Socket | null;
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  msgs: ChatItem[];
  reactions: Map<string, Reaction[]>;
  profileMap: Map<string, UserProfile>;
  cursorPositions: Map<string, CursorPosition>;
  followingId: string | null;
  setFollowingId: Dispatch<SetStateAction<string | null>>;
  hasMoreMessages: boolean;
  loadingHistory: boolean;
  fetchOlderMessages: () => void;
  initStatus: "idle" | "loading" | "loaded";
  fetchInitialMessages: () => void;
};

const INITIAL_STATE: SocketContextType = {
  socket: null,
  users: [],
  setUsers: () => { },
  msgs: [],
  reactions: new Map(),
  profileMap: new Map(),
  cursorPositions: new Map(),
  followingId: null,
  setFollowingId: () => { },
  hasMoreMessages: true,
  loadingHistory: false,
  fetchOlderMessages: () => { },
  initStatus: "idle",
  fetchInitialMessages: () => { },
};

export const SocketContext = createContext<SocketContextType>(INITIAL_STATE);

const SESSION_ID_KEY = "portfolio-site-session-id";

const SocketContextProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [msgs, setMsgs] = useState<ChatItem[]>([]);
  const [reactions, setReactions] = useState<Map<string, Reaction[]>>(new Map());
  const [profileMap, setProfileMap] = useState<Map<string, UserProfile>>(new Map());
  const [cursorPositions, setCursorPositions] = useState<Map<string, CursorPosition>>(new Map());
  const [followingId, setFollowingId] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [initStatus, setInitStatus] = useState<"idle" | "loading" | "loaded">("idle");
  const socketRef = useRef<Socket | null>(null);
  const initStatusRef = useRef<"idle" | "loading" | "loaded">("idle");

  const fetchInitialMessages = useCallback(() => {
    if (initStatusRef.current !== "idle") return;
    const s = socketRef.current;
    if (!s) return;
    initStatusRef.current = "loading";
    setInitStatus("loading");
    s.emit("msgs-fetch-init");
  }, []);

  const fetchOlderMessages = useCallback(() => {
    const s = socketRef.current;
    if (!s || loadingHistory || !hasMoreMessages) return;
    setMsgs(current => {
      if (current.length === 0) return current;
      const oldestId = Number(current[0].id);
      if (!oldestId) return current;
      setLoadingHistory(true);
      s.emit("msgs-fetch-history", { before: oldestId });
      return current;
    });
  }, [loadingHistory, hasMoreMessages]);

  // Keep profileMap in sync — only adds/updates, never removes
  useEffect(() => {
    if (users.length === 0) return;
    setProfileMap(prev => {
      const next = new Map(prev);
      for (const u of users) {
        next.set(u.id, { name: u.name, avatar: u.avatar, color: u.color, isAdmin: u.isAdmin });
      }
      return next;
    });
  }, [users]);
  const { toast } = useToast();

  // SETUP SOCKET.IO
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_WS_URL) return;
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: {
        sessionId: localStorage.getItem(SESSION_ID_KEY),
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelayMax: 5000,
    });
    setSocket(newSocket);
    socketRef.current = newSocket;
    newSocket.on("connect", () => {
      // Resync the latest history after a reconnect (e.g. waking from sleep)
      if (initStatusRef.current === "loaded") {
        newSocket.emit("msgs-fetch-init");
      }
    });
    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });
    newSocket.on("disconnect", (reason) => {
      // Transport drops auto-reconnect; only a server disconnect needs a manual nudge
      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    });
    newSocket.on("users-updated", (data: User[]) => {
      setUsers(data);
    });
    newSocket.on("cursor-changed", (data: { pos: { x: number; y: number }; socketId: string }) => {
      setCursorPositions(prev => {
        const next = new Map(prev);
        next.set(data.socketId, data.pos);
        return next;
      });
    });
    newSocket.on("msgs-receive-init", (msgs) => {
      setMsgs(msgs);
      setHasMoreMessages(true);
      initStatusRef.current = "loaded";
      setInitStatus("loaded");
    });
    newSocket.on("msgs-receive-history", (data: { messages: ChatItem[]; hasMore: boolean; reactions: Record<string, Reaction[]> }) => {
      setMsgs(prev => [...data.messages, ...prev]);
      setHasMoreMessages(data.hasMore);
      setLoadingHistory(false);
      if (data.reactions) {
        setReactions(prev => {
          const next = new Map(prev);
          for (const [msgId, rxns] of Object.entries(data.reactions)) {
            if (rxns.length === 0) next.delete(msgId);
            else next.set(msgId, rxns);
          }
          return next;
        });
      }
    });
    newSocket.on("session", ({ sessionId }) => {
      localStorage.setItem(SESSION_ID_KEY, (sessionId));
    });

    newSocket.on("msg-receive", (msgs) => {
      // Drop live messages until the popover is opened and init has been fetched.
      // The init fetch returns the latest 50 user messages anyway, so nothing is lost.
      if (initStatusRef.current !== "loaded") return;
      setMsgs((p) => [...p, msgs]);
    });

    newSocket.on("warning", (data: { message: string }) => {
      toast({
        variant: "destructive",
        title: "System Warning",
        description: data.message,
      });
    });

    newSocket.on("msg-delete", (data: { id: string | number }) => {
      setMsgs((prev) => prev.filter((m) => String(m.id) !== String(data.id)));
    });

    newSocket.on("msg-update", (data: { id: string; content: string; editedAt: string }) => {
      setMsgs((prev) => prev.map((m) =>
        String(m.id) === String(data.id) && (!("type" in m) || !m.type)
          ? { ...m, content: data.content, editedAt: data.editedAt }
          : m
      ));
    });

    newSocket.on("reactions-init", (data: Record<string, Reaction[]>) => {
      setReactions(new Map(Object.entries(data)));
    });
    newSocket.on("reaction-update", (data: { messageId: string; reactions: Reaction[] }) => {
      setReactions(prev => {
        const next = new Map(prev);
        if (data.reactions.length === 0) next.delete(data.messageId);
        else next.set(data.messageId, data.reactions);
        return next;
      });
    });

    // Kick a reconnect on wake/refocus/network-return; backoff timers can stall through sleep
    const ensureConnected = () => {
      if (!newSocket.connected) newSocket.connect();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") ensureConnected();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", ensureConnected);
    window.addEventListener("focus", ensureConnected);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", ensureConnected);
      window.removeEventListener("focus", ensureConnected);
      newSocket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SocketContext.Provider value={{ socket, users, setUsers, msgs, reactions, profileMap, cursorPositions, followingId, setFollowingId, hasMoreMessages, loadingHistory, fetchOlderMessages, initStatus, fetchInitialMessages }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContextProvider;

```

## components/realtime/online-users.tsx
```tsx
"use client";
import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "motion/react";

import { SocketContext, Message, ChatItem } from "@/contexts/socketio";
import { useToast } from "@/components/ui/use-toast";
import { Users, Users2, Hash, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

import { useChatScroll } from "./hooks/use-chat-scroll";
import { useTyping } from "./hooks/use-typing";
import { useSounds } from "./hooks/use-sounds";
import { useConnectionStatus } from "./hooks/use-connection-status";
import { ChatMessageList } from "./components/chat-message-list";
import { ChatInput } from "./components/chat-input";
import type { ProcessedCommand } from "./components/slash-command-menu";
import { UserList } from "./components/user-list";
import { EditProfileModal } from "./components/edit-profile-modal";
import { AdminPasswordDialog } from "./components/admin-password-dialog";
import { THEME } from "./constants";
import { getAvatarUrl } from "@/lib/avatar";

const OnlineUsers = () => {
  const { socket, users: _users, msgs, hasMoreMessages, loadingHistory, fetchOlderMessages, initStatus, fetchInitialMessages } = useContext(SocketContext);
  const users = Array.from(_users.values());
  const [showUserList, setShowUserList] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  const [editTarget, setEditTarget] = useState<Message | null>(null);
  const [showAdminDialog, setShowAdminDialog] = useState(false);

  const currentUser = users.find(u => u.socketId === socket?.id);
  const { toast } = useToast();
  const { playSendSound, playReceiveSound } = useSounds();
  const connectionStatus = useConnectionStatus(socket);
  const prevMsgsLength = useRef(msgs.length);

  // Driven by the server's "warning" event when msg-send is rate limited
  const [rateLimitedUntil, setRateLimitedUntil] = useState<number | null>(null);

  // Listen for server rate limit warnings and show the cooldown banner
  useEffect(() => {
    if (!socket) return;
    const onWarning = (data: { message: string }) => {
      if (data.message.includes("msg-send")) {
        setRateLimitedUntil(Date.now() + 10_000);
      }
    };
    socket.on("warning", onWarning);
    return () => { socket.off("warning", onWarning); };
  }, [socket]);

  // Play send/receive sounds for regular messages
  useEffect(() => {
    if (msgs.length > prevMsgsLength.current) {
      // Skip sounds when receiving initial message history (large batch on connect)
      const isSmallBatch = msgs.length - prevMsgsLength.current <= 2;
      const lastMsg = msgs[msgs.length - 1];
      const isSystem = lastMsg && "type" in lastMsg && lastMsg.type === "system";
      let isRecent = true;
      if (lastMsg?.createdAt) {
        const msgTime = new Date(lastMsg.createdAt).getTime();
        if (Date.now() - msgTime > 10000) isRecent = false;
      }

      if (isSmallBatch && isRecent && lastMsg && !isSystem) {
        if (lastMsg.username === currentUser?.name) playSendSound();
        else playReceiveSound();
      }
    }
    prevMsgsLength.current = msgs.length;
  }, [msgs, playSendSound, playReceiveSound, currentUser]);



  // Use custom hooks
  const {
    chatContainer,
    showScrollButton,
    unreads,
    scrollToBottom,
    isAtBottomRef
  } = useChatScroll(
    isOpen,
    msgs.length,
    currentUser?.id,
    msgs[msgs.length - 1]?.sessionId,
    msgs[0]?.id ? String(msgs[0].id) : undefined
  );

  const {
    typingUsers,
    handleTyping,
    getTypingText
  } = useTyping(
    socket,
    currentUser,
    scrollToBottom,
    isAtBottomRef
  );

  const handleEditLastMessage = useCallback(() => {
    if (!currentUser) return;
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    for (let i = msgs.length - 1; i >= 0; i--) {
      const item = msgs[i];
      if ("type" in item && item.type === "system") continue;
      const msg = item as Message;
      if (msg.sessionId !== currentUser.id) continue;
      if (new Date(msg.createdAt).getTime() < fiveMinAgo) break;
      setEditTarget(msg);
      return;
    }
  }, [msgs, currentUser]);

  const handleCommand = (cmd: ProcessedCommand) => {
    if (cmd.type === "admin") {
      setShowAdminDialog(true);
      return;
    }
    if (editTarget) {
      socket?.emit("msg-edit", { id: editTarget.id, content: cmd.content });
      setEditTarget(null);
      return;
    }

    socket?.emit("msg-send", {
      content: cmd.content,
      ...(replyTarget && { replyTo: replyTarget.id }),
    });
    setReplyTarget(null);
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
    const { dismiss } = toast({ title: "Profile updated" });
    setTimeout(dismiss, 3000);
  };

  // Feature 6: Keyboard shortcut Ctrl+/ to toggle chat
  const toggleOpen = useCallback(() => {
    setIsOpen(prev => {
      if (prev) setShowUserList(false);
      else fetchInitialMessages();
      return !prev;
    });
  }, [fetchInitialMessages]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "/") {
        e.preventDefault();
        toggleOpen();
      }
    };
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [toggleOpen]);

  const isSingleUser = users.length <= 1;

  return (
    <>
      <Popover
        open={isOpen}
        onOpenChange={(newOpen) => {
          // Prevent popover from closing while the profile modal is open (clicks outside)
          if (!newOpen && isEditingProfile) return;
          setIsOpen(newOpen);
          if (newOpen) fetchInitialMessages();
          if (!newOpen) setShowUserList(false)
        }}
      >
        <div className="flex items-center gap-2" data-no-custom-cursor="true">
          {/* Feature 4: "N people here" label */}
          <AnimatePresence>
            {users.length >= 2 && !isOpen && (
              <motion.span
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 5 }}
                className={cn("text-xs hidden md:block font-medium whitespace-nowrap select-none", THEME.text.secondary)}
              >
                {users.length} people here
              </motion.span>
            )}
          </AnimatePresence>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "mr-4 h-11 w-12 shadow-lg transition-all duration-300 z-50 p-0",
                      "bg-background/20 hover:bg-background/80 backdrop-blur-sm border-2 border-white/30 rounded-lg",
                      !isOpen && unreads > 0 && "animate-pulse border-green-500/50"
                    )}
                  >
                    <div className="relative flex items-center justify-center w-full h-full">
                      <div className="relative">
                        <motion.div
                          initial={{ scale: 0.5, opacity: 1 }}
                          animate={{ scale: [0.1, 2], opacity: [1, 0] }}
                          transition={{
                            duration: .4,
                            delay: 0,
                            ease: "easeOut",
                            repeat: Infinity,
                            repeatDelay: 2,
                          }}
                          className={cn("absolute -inset-1 rounded-full", unreads > 0 ? "bg-green-500/40" : "bg-transparent")}
                        />
                        <Users2 className="w-6 h-6" />
                      </div>

                      <span className={cn(
                        "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                        unreads > 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"
                      )}>
                        {unreads > 0 ? unreads : users.length}
                      </span>
                    </div>
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Chat <kbd className="ml-1 text-[10px] opacity-60">Ctrl+/</kbd></p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <PopoverContent
          className={cn(
            "w-80 min-h-[400px] sm:w-96 p-0 border-none shadow-2xl overflow-hidden rounded-xl mr-4 mb-4 flex flex-col",
            THEME.bg.primary,
            THEME.text.primary
          )}
          side="top"
          data-no-custom-cursor="true"
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className={cn("h-12 flex items-center justify-between px-4 shadow-sm border-b shrink-0", THEME.bg.secondary, THEME.border.primary)}>
            <div className={cn("flex items-center gap-2 font-semibold", THEME.text.header)}>
              <Hash className={cn("w-5 h-5", THEME.text.secondary)} />
              <span>general</span>
              {/* Feature 2: Connection status indicator */}
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  connectionStatus === "connected" && "bg-green-500",
                  connectionStatus === "connecting" && "bg-yellow-500 animate-pulse",
                  connectionStatus === "disconnected" && "bg-red-500",
                )} />
                {connectionStatus !== "connected" && (
                  <span className={cn("text-[10px] font-normal", THEME.text.secondary)}>
                    {connectionStatus === "connecting" ? "Connecting..." : "Disconnected"}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 w-9 p-0 gap-2 transition-colors rounded-full",
                    THEME.bg.hover,
                    THEME.text.secondary,
                    "hover:text-[#060607] dark:hover:text-white"
                  )}
                  onClick={() => setIsEditingProfile(true)}
                  title="Edit Profile"
                >
                  <div className="relative w-8 h-8">
                    <img
                      src={getAvatarUrl(currentUser.avatar)}
                      className="w-full h-full rounded-full ring-1 ring-black/10 dark:ring-white/10"
                      style={{ backgroundColor: currentUser.color || '#60a5fa' }}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-[#5865f2] rounded-full border-2 border-[var(--bg-primary)]">
                      <Settings className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </Button>
              )}

              <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-0.5" />

              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "transition-colors gap-2",
                  THEME.bg.hover,
                  `hover:${THEME.text.header.replace("text-", "text-")} `,
                  "hover:text-[#060607] dark:hover:text-white",
                  showUserList && cn(THEME.text.header, THEME.bg.active)
                )}
                onClick={() => setShowUserList(!showUserList)}
              >
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" aria-label="Online" role="status" />
                  <span>
                    {users.length}
                  </span>
                </div>
                <Users className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className={cn("relative flex flex-col flex-1", THEME.bg.primary)}>
            <ChatMessageList
              msgs={msgs}
              users={users}
              currentUser={currentUser}
              chatContainerRef={chatContainer}
              showScrollButton={showScrollButton}
              unreads={unreads}
              scrollToBottom={scrollToBottom}
              isSingleUser={isSingleUser}
              typingUsers={typingUsers}
              getTypingText={getTypingText}
              onReply={setReplyTarget}
              onEdit={setEditTarget}
              hasMoreMessages={hasMoreMessages}
              loadingHistory={loadingHistory}
              onLoadMore={fetchOlderMessages}
              initStatus={initStatus}
            />

            <ChatInput
              onSendMessage={handleCommand}
              onTyping={handleTyping}
              placeholder="Message #general"
              replyTarget={replyTarget}
              onCancelReply={() => setReplyTarget(null)}
              editTarget={editTarget}
              onCancelEdit={() => setEditTarget(null)}
              onEditLastMessage={handleEditLastMessage}
              rateLimitedUntil={rateLimitedUntil}
            />

            <UserList
              users={users}
              socket={socket}
              showUserList={showUserList}
              onClose={() => setShowUserList(false)}
              onEditProfile={() => setIsEditingProfile(true)}
            />
          </div>

        </PopoverContent>
      </Popover>

      {currentUser && (
        <EditProfileModal
          user={currentUser}
          isOpen={isEditingProfile}
          onClose={() => setIsEditingProfile(false)}
          updateProfile={updateProfile}
        />
      )}

      <AdminPasswordDialog
        isOpen={showAdminDialog}
        onClose={() => setShowAdminDialog(false)}
        onSubmit={(password) => socket?.emit("admin-auth", { password })}
      />
    </>
  );
};

export default OnlineUsers;

```

## components/realtime/components/admin-badge.tsx
```tsx
import React from "react";
import { Shield } from "lucide-react";

export const AdminBadge = () => (
  <span className="inline-flex items-center gap-0.5 bg-amber-500/15 text-amber-500 text-[10px] px-1 rounded font-bold" title="Admin">
    <Shield className="w-2.5 h-2.5" />
    ADMIN
  </span>
);

```

## components/realtime/components/admin-password-dialog.tsx
```tsx
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { THEME } from "../constants";
import { Shield } from "lucide-react";

interface AdminPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
}

export const AdminPasswordDialog = ({ isOpen, onClose, onSubmit }: AdminPasswordDialogProps) => {
  const [password, setPassword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    onSubmit(password.trim());
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
        className={cn(
          "w-[320px] p-5 rounded-xl shadow-2xl flex flex-col gap-4",
          "bg-white dark:bg-[#2b2d31] border border-white/10",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-500" />
          <h3 className={cn("text-base font-semibold", THEME.text.header)}>Admin Authentication</h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className={cn(
              "w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors",
              "bg-black/5 dark:bg-black/20 border-black/10 dark:border-white/10",
              "focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2]",
              THEME.text.primary, THEME.text.placeholder,
            )}
            autoComplete="off"
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={cn(THEME.text.secondary)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-[#5865f2] hover:bg-[#4752c4] text-white"
              disabled={!password.trim()}
            >
              Authenticate
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>,
    document.body,
  );
};

```

## components/realtime/components/chat-input.tsx
```tsx
import React, { useRef, useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEME } from "../constants";
import { SlashCommandMenu, getFilteredCommands, processSlashCommand } from "./slash-command-menu";
import type { ProcessedCommand } from "./slash-command-menu";
import { ReplyPreview } from "./reply-preview";
import type { SlashCommand } from "./slash-command-menu";
import type { Message } from "@/contexts/socketio";

interface ChatInputProps {
  onSendMessage: (cmd: ProcessedCommand) => void;
  onTyping: () => void;
  placeholder?: string;
  replyTarget?: Message | null;
  onCancelReply?: () => void;
  editTarget?: Message | null;
  onCancelEdit?: () => void;
  onEditLastMessage?: () => void;
  rateLimitedUntil?: number | null;
}

const MAX_LENGTH = 500;
const MAX_ROWS = 5;

export const ChatInput = ({ onSendMessage, onTyping, placeholder = "Message", replyTarget, onCancelReply, editTarget, onCancelEdit, onEditLastMessage, rateLimitedUntil }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showCommands, setShowCommands] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);

  useEffect(() => {
    if (!rateLimitedUntil) { setRateLimitSeconds(0); return; }
    const tick = () => {
      const remaining = Math.ceil((rateLimitedUntil - Date.now()) / 1000);
      setRateLimitSeconds(remaining > 0 ? remaining : 0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [rateLimitedUntil]);

  useEffect(() => {
    if (replyTarget) textareaRef.current?.focus();
  }, [replyTarget]);

  // Pre-fill textarea when entering edit mode
  useEffect(() => {
    if (editTarget && textareaRef.current) {
      textareaRef.current.value = editTarget.content;
      textareaRef.current.focus();
      resizeTextarea();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTarget]);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    // Reset to 0 first so scrollHeight recalculates from content, not the previous height
    el.style.height = "0";
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
    const maxHeight = lineHeight * MAX_ROWS;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, []);

  const handleSend = () => {
    if (!textareaRef.current?.value) return;
    const raw = textareaRef.current.value.slice(0, MAX_LENGTH).trim();
    textareaRef.current.value = "";
    setShowCommands(false);
    resizeTextarea();

    if (raw === "") return;

    // In edit mode, send content directly (no slash command processing)
    if (editTarget) {
      onSendMessage({ type: "message", content: raw });
      return;
    }
    onSendMessage(processSlashCommand(raw));
  };

  const cancelEdit = () => {
    if (textareaRef.current) textareaRef.current.value = "";
    resizeTextarea();
    onCancelEdit?.();
  };

  const handleCommandSelect = (cmd: SlashCommand) => {
    const el = textareaRef.current;
    if (!el) return;

    if (cmd.name === "/admin") {
      el.value = "";
      setShowCommands(false);
      setSelectedIndex(0);
      resizeTextarea();
      onSendMessage({ type: "admin" });
      return;
    }

    if (cmd.name === "/me") {
      el.value = "/me ";
    } else if (cmd.replacement) {
      el.value = cmd.replacement;
    }

    setShowCommands(false);
    setSelectedIndex(0);
    el.focus();
    resizeTextarea();
  };

  const handleChange = () => {
    onTyping();
    resizeTextarea();

    const val = textareaRef.current?.value ?? "";
    // Show command menu when typing starts with / and is on the first line
    const firstLine = val.split("\n")[0];
    if (firstLine.startsWith("/") && !firstLine.includes(" ")) {
      setCommandQuery(firstLine);
      setShowCommands(true);
      setSelectedIndex(0);
    } else {
      setShowCommands(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommands) {
      const filtered = getFilteredCommands(commandQuery);
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filtered.length) % filtered.length);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filtered.length);
        return;
      }
      if ((e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) && filtered.length > 0) {
        e.preventDefault();
        handleCommandSelect(filtered[selectedIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowCommands(false);
        return;
      }
    }

    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      if (editTarget) {
        cancelEdit();
      } else if (replyTarget && onCancelReply) {
        onCancelReply();
      }
      return;
    }

    // Up arrow with empty input → edit last own message
    if (e.key === "ArrowUp" && !textareaRef.current?.value && !editTarget && onEditLastMessage) {
      e.preventDefault();
      onEditLastMessage();
      return;
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("p-4 pt-0", THEME.bg.primary)}>
      {replyTarget && !editTarget && onCancelReply && (
        <ReplyPreview
          username={replyTarget.username}
          content={replyTarget.content}
          onCancel={onCancelReply}
        />
      )}
      {rateLimitSeconds > 0 && !editTarget && (
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-t-lg text-xs font-medium",
          "bg-red-500/10 text-red-500 dark:text-red-400",
        )}>
          <span>Slow down — you can send again in {rateLimitSeconds}s</span>
        </div>
      )}
      {editTarget && (
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-t-lg text-xs font-medium",
          "bg-[#5865f2]/10 text-[#5865f2] dark:text-[#8891f2]",
        )}>
          <span>Editing message</span>
          <span className={cn("ml-auto text-[10px]", THEME.text.secondary)}>
            Esc to cancel
          </span>
        </div>
      )}
      <div className={cn("relative rounded-lg p-2.5 flex items-center gap-2", THEME.bg.tertiary, (replyTarget || editTarget || rateLimitSeconds > 0) && "rounded-t-none")}>
        {showCommands && !editTarget && (
          <SlashCommandMenu
            query={commandQuery}
            selectedIndex={selectedIndex}
            onSelect={handleCommandSelect}
          />
        )}
        <textarea
          ref={textareaRef}
          autoFocus
          className={cn(
            "flex-1 bg-transparent border-none outline-none font-medium min-w-0 resize-none leading-5 overflow-hidden p-0 h-5",
            THEME.text.primary, THEME.text.placeholder
          )}
          placeholder={editTarget ? "Edit your message" : placeholder}
          aria-label={editTarget ? "Edit your message" : placeholder}
          maxLength={MAX_LENGTH}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {editTarget ? (
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className={cn("h-7 w-7 shrink-0", THEME.text.secondary, THEME.bg.itemHover)}
              onClick={cancelEdit}
              title="Cancel edit"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0 text-[#5865f2] hover:bg-[#5865f2]/10"
              onClick={handleSend}
              title="Save edit"
            >
              <Check className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            size="icon"
            variant="ghost"
            className={cn("h-8 w-8 shrink-0", THEME.text.secondary, THEME.bg.itemHover)}
            onClick={handleSend}
          >
            <Send className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

```

## components/realtime/components/chat-message-list.tsx
```tsx
import React, { useContext, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Reply, Pencil, Loader2 } from "lucide-react";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import { ArrowDown, Hash } from "lucide-react";
import { ScrollArea } from "../../ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Message, User, ChatItem } from "@/contexts/socketio";
import { THEME } from "../constants";
import { getAvatarUrl } from "@/lib/avatar";
import { SocketContext } from "@/contexts/socketio";
import { SystemMessageRow } from "./system-message";
import { QuotedMessage } from "./quoted-message";
import { ReactionPicker } from "./reaction-picker";
import { MessageReactions } from "./message-reactions";
import { AdminBadge } from "./admin-badge";

function isSystemMessage(item: ChatItem): item is import("@/contexts/socketio").SystemMessage {
  return "type" in item && item.type === "system";
}

function formatMessageTime(date: Date): string {
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return `Yesterday at ${format(date, "h:mm a")}`;
  return `${format(date, "M/d/yy")} at ${format(date, "h:mm a")}`;
}

function formatDaySeparator(date: Date): string {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
}

type GroupedSystemItem = { _grouped: true; users: { username: string; flag: string }[] };
type GroupedItem = ChatItem | GroupedSystemItem;

function groupChatItems(items: ChatItem[]): GroupedItem[] {
  const result: GroupedItem[] = [];
  let i = 0;
  while (i < items.length) {
    const item = items[i];
    if (isSystemMessage(item) && item.subtype === "join") {
      const seen = new Set<string>();
      const users: { username: string; flag: string }[] = [];
      while (i < items.length && isSystemMessage(items[i]) && (items[i] as import("@/contexts/socketio").SystemMessage).subtype === "join") {
        const sys = items[i] as import("@/contexts/socketio").SystemMessage;
        if (!seen.has(sys.sessionId)) {
          seen.add(sys.sessionId);
          users.push({ username: sys.username, flag: sys.flag });
        }
        i++;
      }
      result.push({ _grouped: true, users });
    } else {
      result.push(item);
      i++;
    }
  }
  return result;
}

/** Check if two dates are on different calendar days */
function isDifferentDay(a: Date, b: Date): boolean {
  return a.getFullYear() !== b.getFullYear() || a.getMonth() !== b.getMonth() || a.getDate() !== b.getDate();
}

interface ChatMessageListProps {
  msgs: ChatItem[];
  users: User[];
  currentUser: User | undefined;
  chatContainerRef: React.Ref<HTMLDivElement>;
  showScrollButton: boolean;
  unreads: number;
  scrollToBottom: (smooth?: boolean) => void;
  isSingleUser: boolean;
  typingUsers: Map<string, { username: string }>;
  getTypingText: () => string | null;
  onReply: (msg: Message) => void;
  onEdit: (msg: Message) => void;
  hasMoreMessages: boolean;
  loadingHistory: boolean;
  onLoadMore: () => void;
  initStatus: "idle" | "loading" | "loaded";
}

const MessageListSkeleton = () => {
  const widths = [["60%", "85%"], ["75%", "50%", "65%"], ["55%", "70%"], ["80%"], ["45%", "60%", "55%"]];
  return (
    <div className="space-y-5 py-2" aria-busy="true" aria-live="polite">
      {widths.map((lines, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.25 }}
          className="flex gap-3"
        >
          <div className={cn("w-10 h-10 rounded-full shrink-0 animate-pulse", "bg-black/10 dark:bg-white/10")} />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <div className={cn("h-3 w-20 rounded animate-pulse", "bg-black/10 dark:bg-white/10")} />
              <div className={cn("h-2.5 w-12 rounded animate-pulse", "bg-black/[0.06] dark:bg-white/[0.06]")} />
            </div>
            {lines.map((w, j) => (
              <div
                key={j}
                className={cn("h-3 rounded animate-pulse", "bg-black/[0.07] dark:bg-white/[0.07]")}
                style={{ width: w }}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const ChatMessageList = ({
  msgs,
  users,
  currentUser,
  chatContainerRef,
  showScrollButton,
  unreads,
  scrollToBottom,
  isSingleUser,
  typingUsers,
  getTypingText,
  onReply,
  onEdit,
  hasMoreMessages,
  loadingHistory,
  onLoadMore,
  initStatus,
}: ChatMessageListProps) => {
  const { setFollowingId, socket, reactions, profileMap } = useContext(SocketContext);
  const [pickerOpenFor, setPickerOpenFor] = useState<string | null>(null);

  const grouped = useMemo(() => groupChatItems(msgs), [msgs]);

  const handleReaction = (messageId: string, emoji: string) => {
    socket?.emit("reaction-toggle", { messageId, emoji });
    setPickerOpenFor(null);
  };

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("bg-[#5865f2]/10");
      setTimeout(() => el.classList.remove("bg-[#5865f2]/10"), 1500);
    }
  };

  let lastRenderedDate: Date | null = null;
  let prevRegularMsg: Message | null = null;
  let hadNonMessageSincePrev = false;

  return (
    <div className="flex-1 relative overflow-hidden flex flex-col">
      <ScrollArea className="h-[400px] chat-scroll-area" data-lenis-prevent ref={chatContainerRef} type="always">
        <div className="p-4 space-y-0">
          {msgs.length > 0 && hasMoreMessages && (
            <div className="flex justify-center pb-3">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={loadingHistory}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10",
                  THEME.text.secondary,
                  loadingHistory && "opacity-50 cursor-not-allowed"
                )}
              >
                {loadingHistory ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load older messages"
                )}
              </button>
            </div>
          )}

          {initStatus !== "loaded" && msgs.length === 0 && (
            <MessageListSkeleton />
          )}

          {initStatus === "loaded" && msgs.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-70 mt-10">
              <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-2", THEME.bg.welcome)}>
                <Hash className={cn("w-10 h-10", THEME.text.header)} />
              </div>
              <h3 className={cn("text-xl font-bold", THEME.text.header)}>Welcome to #general!</h3>
              <p className={cn("text-sm max-w-[200px]", THEME.text.secondary)}>
                This is the start of the legendary conversation.
                {isSingleUser && <span className="block mt-2 text-yellow-600 dark:text-yellow-400/80 text-xs">(It&apos;s just you right now, invite a friend!)</span>}
              </p>
            </div>
          )}

          {grouped.map((item, groupIdx) => {
            // Grouped system messages
            if ("_grouped" in item) {
              hadNonMessageSincePrev = true;
              return <SystemMessageRow key={`sys-${groupIdx}`} users={item.users} />;
            }

            // Single system message
            if (isSystemMessage(item)) {
              hadNonMessageSincePrev = true;
              return <SystemMessageRow key={item.id} users={[{ username: item.username, flag: item.flag }]} />;
            }

            // Regular message
            const msg = item;
            const profile = profileMap.get(msg.sessionId);
            const user = users.find((u) => u.id === msg.sessionId);
            const displayName = profile?.name ?? msg.username;
            const displayAvatar = profile?.avatar ?? msg.avatar;
            const displayColor = profile?.color ?? msg.color ?? '#60a5fa';
            const isMe = msg.sessionId === currentUser?.id;
            const msgDate = new Date(msg.createdAt);

            const isFirstMsg = !prevRegularMsg;
            const showHeader =
              isFirstMsg ||
              hadNonMessageSincePrev ||
              prevRegularMsg!.sessionId !== msg.sessionId ||
              differenceInMinutes(msg.createdAt, prevRegularMsg!.createdAt) > 3;

            prevRegularMsg = msg;
            hadNonMessageSincePrev = false;

            // Day separator
            let daySeparator: React.ReactNode = null;
            if (!lastRenderedDate || isDifferentDay(msgDate, lastRenderedDate)) {
              daySeparator = (
                <div className={cn("flex items-center gap-3 py-3 select-none", THEME.text.secondary)}>
                  <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
                  <span className="text-[11px] font-semibold">{formatDaySeparator(msgDate)}</span>
                  <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
                </div>
              );
            }
            lastRenderedDate = msgDate;

            const msgReactions = reactions.get(String(msg.id)) || [];

            return (
              <React.Fragment key={msg.id}>
                {daySeparator}
                <div
                  id={`msg-${msg.id}`}
                  className={cn(
                    "group relative flex gap-3 pr-2 py-0.5 -mx-2 px-2 rounded transition-colors",
                    "hover:bg-black/[0.03] dark:hover:bg-white/[0.03]",
                    showHeader && !isFirstMsg && "!mt-4"
                  )}
                >
                  {showHeader ? (
                    <div
                      className={cn(
                        "relative w-10 h-10 flex-shrink-0 mt-0.5",
                        !isMe && user?.socketId && "cursor-pointer"
                      )}
                      onClick={() => {
                        if (!isMe && user?.socketId) {
                          setFollowingId(user.socketId);
                        }
                      }}
                    >
                      <img
                        src={getAvatarUrl(displayAvatar)}
                        alt={displayName}
                        className="w-10 h-10 rounded-full"
                        style={{ backgroundColor: displayColor }}
                      />
                      {user?.isOnline && (
                        <div className={cn("absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2", THEME.border.status)} />
                      )}
                    </div>
                  ) : (
                    <div className={cn("w-10 flex-shrink-0 flex items-center justify-end pr-1")}>
                      <span className={cn("text-[10px] opacity-0 group-hover:opacity-100 select-none tabular-nums", THEME.text.secondary)}>
                        {format(msgDate, "h:mm")}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0 overflow-hidden">
                    {showHeader && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className={cn("flex items-center gap-2", !isMe && user?.socketId && "cursor-pointer group/name")}
                          onClick={() => {
                            if (!isMe && user?.socketId) {
                              setFollowingId(user.socketId);
                            }
                          }}
                        >
                          <span
                            className={cn("font-medium hover:underline", THEME.text.header)}
                            style={{ color: displayColor }}
                          >
                            {displayName}
                          </span>
                          {/* {!isMe && user?.socketId && ( */}
                          {/*   <motion.div */}
                          {/*     initial={{ opacity: 0, x: -5 }} */}
                          {/*     whileHover={{ opacity: 1, x: 0 }} */}
                          {/*     className="group-hover/name:opacity-100 opacity-0 transition-all flex items-center" */}
                          {/*   > */}
                          {/*     <Users className={cn("w-3 h-3", THEME.text.secondary)} /> */}
                          {/*   </motion.div> */}
                          {/* )} */}
                        </div>
                        <span>{msg.flag}</span>
                        {profile?.isAdmin && <AdminBadge />}
                        {isMe && (
                          <span className="bg-[#5865f2] text-white text-[10px] px-1 rounded font-bold">YOU</span>
                        )}
                        <span className={cn("text-xs", THEME.text.secondary)}>
                          {formatMessageTime(msgDate)}
                        </span>
                      </div>
                    )}

                    {msg.replyTo && (
                      <QuotedMessage
                        username={msg.replyTo.username}
                        content={msg.replyTo.content}
                        avatar={(() => {
                          const orig = msgs.find(m => !isSystemMessage(m) && m.id === msg.replyTo!.id) as Message | undefined;
                          return orig?.avatar;
                        })()}
                        color={(() => {
                          const orig = msgs.find(m => !isSystemMessage(m) && m.id === msg.replyTo!.id) as Message | undefined;
                          return orig?.color;
                        })()}
                        onClickQuote={() => scrollToMessage(msg.replyTo!.id)}
                      />
                    )}

                    <p className={cn("whitespace-pre-wrap break-words leading-[1.375rem] text-sm font-medium", THEME.text.primary)}>
                      {msg.content}
                      {msg.editedAt && (
                        <span className={cn("text-[10px] ml-1.5 opacity-50 select-none", THEME.text.secondary)}>(edited)</span>
                      )}
                    </p>

                    <MessageReactions
                      reactions={msgReactions}
                      currentSessionId={currentUser?.id}
                      onToggle={(emoji) => handleReaction(msg.id, emoji)}
                      onPickerOpen={() => setPickerOpenFor(pickerOpenFor === msg.id ? null : msg.id)}
                    />
                  </div>

                  {/* Hover actions */}
                  <div className={cn(
                    "absolute -top-3 right-3 flex items-center rounded-md border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10",
                    THEME.bg.secondary, THEME.border.primary
                  )}>
                    <ReactionPicker
                      onReact={(emoji) => handleReaction(msg.id, emoji)}
                      open={pickerOpenFor === msg.id}
                      onOpenChange={(open) => setPickerOpenFor(open ? msg.id : null)}
                    />
                    {isMe && differenceInMinutes(new Date(), msgDate) < 5 && (
                      <button
                        type="button"
                        className={cn("p-1.5 rounded transition-colors", THEME.bg.hover, THEME.text.secondary)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          onEdit(msg);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      className={cn("p-1.5 rounded transition-colors", THEME.bg.hover, THEME.text.secondary)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onReply(msg);
                      }}
                    >
                      <Reply className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </ScrollArea>

      {/* Typing Indicator */}
      {typingUsers.size > 0 && (
        <div className={cn("h-6 px-4 flex items-center", THEME.bg.primary)}>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-0.5 mt-1">
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
            </div>
            <span className={cn("text-xs font-bold", THEME.text.secondary)}>
              {getTypingText()}
            </span>
          </motion.div>
        </div>
      )}

      {/* New Message / Scroll Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => scrollToBottom(true)}
            className={cn(
              "absolute bottom-20 left-1/2 -translate-x-1/2 z-10",
              "flex items-center gap-2 px-3 py-1.5 rounded-full shadow-lg",
              "bg-[#5865f2] hover:bg-[#4752c4] text-white transition-colors",
              "text-xs font-bold cursor-pointer"
            )}
          >
            {unreads > 0 ? (
              <>
                <span>{unreads} new messages</span>
                <ArrowDown className="w-3 h-3" />
              </>
            ) : (
              <>
                <span>Jump to present</span>
                <ArrowDown className="w-3 h-3" />
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

```

## components/realtime/components/edit-profile-modal.tsx
```tsx
import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User } from "@/contexts/socketio";
import { THEME } from "../constants";
import { getAvatarUrl } from "@/lib/avatar";

const COLORS = [
  "#60a5fa",
  "#f87171",
  "#4ade80",
  "#facc15",
  "#c084fc",
  "#fb923c",
  "#f43f5e",
  "#818cf8",
  "#22d3ee",
  "#a3e635",
];

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  updateProfile: (data: { name: string; avatar: string; color: string }) => void;
}

export const EditProfileModal = ({
  user,
  isOpen,
  onClose,
  updateProfile,
}: EditProfileModalProps) => {
  const [name, setName] = useState(user.name);
  const [avatarSeed, setAvatarSeed] = useState(user.avatar);
  const [color, setColor] = useState(user.color || COLORS[0]);
  const avatarSeeds = useMemo(() => Array.from({ length: 100 }, (_, i) => (i + 1).toString()), []);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setName(user.name);
      setAvatarSeed(user.avatar);
      setColor(user.color || COLORS[0]);
    }
  }, [isOpen, user]);

  const handleSave = () => {
    if (name.trim()) {
      updateProfile({ name, avatar: avatarSeed, color });
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={handleCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
        className={cn(
          "w-[400px] h-[600px] max-h-[85vh] p-4 rounded-xl shadow-2xl flex flex-col",
          "bg-white dark:bg-[#2b2d31] border border-white/10",
          "ring-1 ring-black/5 dark:ring-white/10"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with preview */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-black/10 dark:border-white/10 shrink-0">
          <div className="relative">
            <img
              src={getAvatarUrl(avatarSeed)}
              alt="Preview"
              className="w-12 h-12 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#2b2d31]"
              style={{ backgroundColor: color, "--tw-ring-color": color } as React.CSSProperties}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className={cn("text-xs font-medium uppercase tracking-wide mb-1", THEME.text.secondary)}>
              Edit Profile
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={cn(
                "w-full text-base font-semibold px-2 py-1 rounded-md border-none outline-none",
                "bg-black/5 dark:bg-white/5 focus:bg-black/10 dark:focus:bg-white/10",
                "transition-colors",
                THEME.text.header
              )}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
            />
          </div>
        </div>

        {/* Avatar selection */}
        <div className="mb-4 flex-1 flex flex-col min-h-0">
          <div className={cn("text-xs font-medium uppercase tracking-wide mb-2", THEME.text.secondary)}>
            Avatar
          </div>
          <ScrollArea className="flex-1 w-full rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/20" data-lenis-prevent>
            <div className="grid grid-cols-5 gap-1.5 p-2" data-lenis-prevent>
              {avatarSeeds.map((seed) => (
                <button
                  key={seed}
                  className={cn(
                    "rounded-full p-0.5 transition-all hover:scale-105 aspect-square",
                    avatarSeed === seed
                      ? "bg-[#5865f2] ring-2 ring-[#5865f2] scale-105"
                      : "hover:bg-black/10 dark:hover:bg-white/10"
                  )}
                  onClick={() => setAvatarSeed(seed)}
                >
                  <img
                    src={getAvatarUrl(seed)}
                    className="w-full h-full rounded-full"
                    style={{ backgroundColor: color }}
                    loading="lazy"
                    alt={`Avatar ${seed}`}
                  />
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Color selection */}
        <div className="mb-5 shrink-0">
          <div className={cn("text-xs font-medium uppercase tracking-wide mb-2", THEME.text.secondary)}>
            Accent Color
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {COLORS.map((c) => (
              <button
                key={c}
                className={cn(
                  "w-7 h-7 rounded-full transition-all hover:scale-110",
                  color === c && "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#2b2d31] scale-110 shadow-lg"
                )}
                style={{ backgroundColor: c, "--tw-ring-color": c } as React.CSSProperties}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-black/10 dark:border-white/10 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="h-8 px-4 text-sm"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="h-8 px-4 text-sm bg-[#5865f2] hover:bg-[#4752c4] text-white"
          >
            Save Changes
          </Button>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

```

## components/realtime/components/message-reactions.tsx
```tsx
import React, { useContext } from "react";
import { SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEME } from "../constants";
import { SocketContext } from "@/contexts/socketio";
import type { Reaction } from "@/contexts/socketio";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageReactionsProps {
  reactions: Reaction[];
  currentSessionId: string | undefined;
  onToggle: (emoji: string) => void;
  onPickerOpen: () => void;
}

export const MessageReactions = ({ reactions, currentSessionId, onToggle, onPickerOpen }: MessageReactionsProps) => {
  const { profileMap } = useContext(SocketContext);

  if (reactions.length === 0) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-wrap items-center gap-1 mt-1">
        {reactions.map(r => {
          const isMine = currentSessionId ? r.sessionIds.includes(currentSessionId) : false;
          const names = r.sessionIds.map(id =>
            id === currentSessionId ? "You" : (profileMap.get(id)?.name ?? "Unknown")
          );
          const tooltipText = names.join(", ");

          return (
            <Tooltip key={r.emoji}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs border transition-colors",
                    isMine
                      ? "border-[#5865f2]/60 bg-[#5865f2]/15"
                      : cn("border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5", THEME.bg.itemHover),
                  )}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onToggle(r.emoji);
                  }}
                >
                  <span className="text-sm leading-none">{r.emoji}</span>
                  <span className={cn("text-[11px] font-medium leading-none", isMine ? "text-[#5865f2]" : THEME.text.secondary)}>
                    {r.sessionIds.length}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {tooltipText}
              </TooltipContent>
            </Tooltip>
          );
        })}
      {/* <button */}
      {/*   type="button" */}
      {/*   className={cn( */}
      {/*     "flex items-center justify-center w-7 h-6 rounded-md border transition-colors", */}
      {/*     "border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5", */}
      {/*     THEME.bg.itemHover, THEME.text.secondary */}
      {/*   )} */}
      {/*   onMouseDown={(e) => { */}
      {/*     e.preventDefault(); */}
      {/*     onPickerOpen(); */}
      {/*   }} */}
      {/* > */}
      {/*   <SmilePlus className="w-3.5 h-3.5" /> */}
      {/* </button> */}
      </div>
    </TooltipProvider>
  );
};

```

## components/realtime/components/quoted-message.tsx
```tsx
import React from "react";
import { cn } from "@/lib/utils";
import { THEME } from "../constants";
import { getAvatarUrl } from "@/lib/avatar";

interface QuotedMessageProps {
  username: string;
  content: string;
  color?: string;
  avatar?: string;
  onClickQuote: () => void;
}

export const QuotedMessage = ({ username, content, color, avatar, onClickQuote }: QuotedMessageProps) => {
  return (
    <button
      type="button"
      onClick={onClickQuote}
      className={cn(
        "flex items-center gap-1 text-left pl-3 py-0.5 mb-0.5 cursor-pointer w-full max-w-full overflow-hidden",
        "border-l-2 border-black/20 dark:border-white/15",
        "hover:border-black/40 dark:hover:border-white/30 transition-colors"
      )}
    >
      {avatar && (
        <img
          src={getAvatarUrl(avatar)}
          alt=""
          className="w-4 h-4 rounded-full shrink-0"
          style={{ backgroundColor: color || '#60a5fa' }}
        />
      )}
      <span className="text-xs font-semibold shrink-0 hover:underline" style={{ color: color || undefined }}>
        @{username}
      </span>
      <span className={cn("text-xs truncate min-w-0 flex-1", THEME.text.secondary)}>{content}</span>
    </button>
  );
};

```

## components/realtime/components/reaction-picker.tsx
```tsx
import React, { useState } from "react";
import { SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEME } from "../constants";

const EMOJIS = ["👍", "❤️", "😂", "😮", "🔥"];

interface ReactionPickerProps {
  onReact: (emoji: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ReactionPicker = ({ onReact, open: controlledOpen, onOpenChange }: ReactionPickerProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  return (
    <div className="relative">
      <button
        type="button"
        className={cn(
          "p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity",
          THEME.bg.hover,
          THEME.text.secondary
        )}
        onMouseDown={(e) => {
          e.preventDefault();
          setOpen(!isOpen);
        }}
      >
        <SmilePlus className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute bottom-full right-0 mb-1 flex items-center gap-0.5 px-2 py-1.5 rounded-lg border shadow-lg z-20",
            THEME.bg.secondary,
            THEME.border.primary
          )}
        >
          {EMOJIS.map(emoji => (
            <button
              key={emoji}
              type="button"
              className="text-lg hover:scale-125 transition-transform px-0.5 leading-none"
              onMouseDown={(e) => {
                e.preventDefault();
                onReact(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

```

## components/realtime/components/reply-preview.tsx
```tsx
import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { THEME } from "../constants";

interface ReplyPreviewProps {
  username: string;
  content: string;
  onCancel: () => void;
}

export const ReplyPreview = ({ username, content, onCancel }: ReplyPreviewProps) => {
  const truncated = content.length > 50 ? content.slice(0, 50) + "…" : content;

  return (
    <div className={cn("flex items-center gap-2 px-3 py-1.5 border-l-2 border-[#5865f2] rounded-t-lg", THEME.bg.tertiary)}>
      <div className="flex-1 min-w-0">
        <span className={cn("text-xs font-semibold", THEME.text.header)}>
          Replying to {username}
        </span>
        <p className={cn("text-xs truncate", THEME.text.secondary)}>{truncated}</p>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className={cn("shrink-0 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10", THEME.text.secondary)}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

```

## components/realtime/components/slash-command-menu.tsx
```tsx
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { THEME } from "../constants";

export type SlashCommand = {
  name: string;
  description: string;
  replacement: string | null; // null means special handling (e.g., /me)
};

export const SLASH_COMMANDS: SlashCommand[] = [
  { name: "/admin", description: "Authenticate as admin", replacement: null },
  { name: "/shrug", description: "Appends ¯\\_(ツ)_/¯", replacement: "¯\\_(ツ)_/¯" },
  { name: "/tableflip", description: "Flips the table", replacement: "(╯°□°)╯︵ ┻━┻" },
  { name: "/unflip", description: "Puts the table back", replacement: "┬─┬ノ( º _ ºノ)" },
  { name: "/lenny", description: "Appends ( ͡° ͜ʖ ͡°)", replacement: "( ͡° ͜ʖ ͡°)" },
  { name: "/me", description: "Send an action — /me waves", replacement: null },
];

interface SlashCommandMenuProps {
  query: string;
  selectedIndex: number;
  onSelect: (command: SlashCommand) => void;
}

export const SlashCommandMenu = ({ query, selectedIndex, onSelect }: SlashCommandMenuProps) => {
  const listRef = useRef<HTMLDivElement>(null);
  const filtered = SLASH_COMMANDS.filter(c => c.name.startsWith(query.toLowerCase()));

  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (filtered.length === 0) return null;

  return (
    <div
      ref={listRef}
      className={cn(
        "absolute bottom-full left-0 right-0 mb-1 rounded-lg border shadow-lg overflow-hidden max-h-48 overflow-y-auto z-10",
        THEME.bg.secondary,
        THEME.border.primary
      )}
    >
      {filtered.map((cmd, i) => (
        <button
          key={cmd.name}
          type="button"
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
            i === selectedIndex ? cn(THEME.bg.active, THEME.text.header) : cn(THEME.text.primary, THEME.bg.itemHover),
          )}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(cmd);
          }}
        >
          <span className="font-semibold shrink-0">{cmd.name}</span>
          <span className={cn("text-xs truncate", THEME.text.secondary)}>{cmd.description}</span>
        </button>
      ))}
    </div>
  );
};

export const getFilteredCommands = (query: string) =>
  SLASH_COMMANDS.filter(c => c.name.startsWith(query.toLowerCase()));

export type ProcessedCommand =
  | { type: "message"; content: string }
  | { type: "admin" };

export const processSlashCommand = (text: string): ProcessedCommand => {
  const trimmed = text.trim();

  // /admin → open password dialog (no password in chat input)
  if (trimmed === "/admin") {
    return { type: "admin" };
  }

  // /me <action> → *<action>*
  if (trimmed.startsWith("/me ")) {
    const action = trimmed.slice(4).trim();
    return { type: "message", content: action ? `*${action}*` : trimmed };
  }

  // Other commands: check if message is exactly or starts with a command
  for (const cmd of SLASH_COMMANDS) {
    if (cmd.replacement === null) continue;
    if (trimmed === cmd.name) {
      return { type: "message", content: cmd.replacement };
    }
    if (trimmed.startsWith(cmd.name + " ")) {
      const rest = trimmed.slice(cmd.name.length);
      return { type: "message", content: rest + " " + cmd.replacement };
    }
  }

  return { type: "message", content: text };
};

```

## components/realtime/components/system-message.tsx
```tsx
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { cn } from "@/lib/utils";
import { THEME } from "../constants";

interface SystemMessageProps {
  users: { username: string; flag: string }[];
}

const FLAG_CAP = 5;

export const SystemMessageRow = ({ users }: SystemMessageProps) => {
  const [expanded, setExpanded] = useState(false);

  const flagGroups = useMemo(() => {
    const counts = new Map<string, number>();
    for (const u of users) counts.set(u.flag, (counts.get(u.flag) ?? 0) + 1);
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([flag, count]) => ({ flag, count }));
  }, [users]);

  const hiddenCount = Math.max(0, flagGroups.length - FLAG_CAP);
  const visibleGroups = expanded ? flagGroups : flagGroups.slice(0, FLAG_CAP);

  if (users.length <= 3) {
    return (
      <div className={cn("flex items-center gap-3 py-2 select-none", THEME.text.secondary)}>
        <div className={cn("flex-1 h-px", "bg-black/10 dark:bg-white/10")} />
        <span className="text-xs shrink-0">
          {users.map(u => `${u.username} ${u.flag}`).join(", ")} joined
        </span>
        <div className={cn("flex-1 h-px", "bg-black/10 dark:bg-white/10")} />
      </div>
    );
  }

  return (
    <LayoutGroup>
      <motion.button
        layout
        type="button"
        onClick={() => hiddenCount > 0 && setExpanded(e => !e)}
        aria-expanded={expanded}
        className={cn(
          "group flex w-full items-center gap-3 py-2 select-none transition-colors",
          hiddenCount > 0 && "cursor-pointer hover:text-[#060607] dark:hover:text-white",
          THEME.text.secondary
        )}
      >
        <div className={cn("flex-1 h-px transition-colors", "bg-black/10 dark:bg-white/10", hiddenCount > 0 && "group-hover:bg-black/20 dark:group-hover:bg-white/20")} />
        <motion.div layout className="text-xs flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 max-w-[90%]">
          <motion.span layout="position">{users.length} people visited from</motion.span>

          <AnimatePresence initial={false}>
            {visibleGroups.map(({ flag, count }) => (
              <motion.span
                key={flag}
                layout
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="inline-flex items-center gap-0.5 whitespace-nowrap"
              >
                <span>{flag}</span>
                <AnimatePresence initial={false}>
                  {expanded && count > 1 && (
                    <motion.span
                      key="count"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className={cn("text-[10px] tabular-nums overflow-hidden whitespace-nowrap", THEME.text.secondary)}
                    >
                      ×{count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.span>
            ))}
          </AnimatePresence>

          {hiddenCount > 0 && (
            <motion.span
              layout
              className="text-[10px] font-semibold tabular-nums opacity-70 group-hover:opacity-100 transition-opacity whitespace-nowrap"
            >
              {expanded ? "show less" : `+${hiddenCount}`}
            </motion.span>
          )}
        </motion.div>
        <div className={cn("flex-1 h-px transition-colors", "bg-black/10 dark:bg-white/10", hiddenCount > 0 && "group-hover:bg-black/20 dark:group-hover:bg-white/20")} />
      </motion.button>
    </LayoutGroup>
  );
};

```

## components/realtime/components/user-list.tsx
```tsx
import React, { useContext, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Edit } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User } from "@/contexts/socketio";
import { SocketContext } from "@/contexts/socketio";
import type { Socket } from "socket.io-client";
import { THEME } from "../constants";
import { getAvatarUrl } from "@/lib/avatar";
import { AdminBadge } from "./admin-badge";

interface UserListProps {
  users: User[];
  socket: Socket | null;
  showUserList: boolean;
  onClose: () => void;
  onEditProfile: () => void;
}

export const UserList = ({ users, socket, showUserList, onClose, onEditProfile }: UserListProps) => {
  const { setFollowingId } = useContext(SocketContext);
  const sortedUsers = useMemo(() => [...users].sort((a, b) => {
    if (a.socketId === socket?.id) return -1;
    if (b.socketId === socket?.id) return 1;
    return 0;
  }), [users, socket?.id]);

  return (
    <AnimatePresence>
      {showUserList && (
        <>
          {/* Overlay to close user list when clicking on messages area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-10 cursor-pointer"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className={cn("absolute inset-y-0 right-0 w-60 shadow-xl z-20 flex flex-col border-l", THEME.bg.secondary, THEME.border.primary)}
          >
            <div className="p-4 pb-2">
              <h3 className={cn("text-xs font-bold uppercase tracking-wide mb-2", THEME.text.secondary)}>
                Online — {users.length}
              </h3>
            </div>
            <ScrollArea className="flex-1 px-2" data-lenis-prevent >
              <div className="space-y-0.5 pb-4">
                {sortedUsers.map((user) => (
                  <UserItem
                    key={user.socketId}
                    user={user}
                    socket={socket}
                    onEditProfile={onEditProfile}
                    onScrollToCursor={setFollowingId}
                  />
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const UserItem = ({
  user,
  socket,
  onEditProfile,
  onScrollToCursor,
}: {
  user: User;
  socket: Socket | null;
  onEditProfile: () => void;
  onScrollToCursor: (socketId: string) => void;
}) => {
  const isMe = user.socketId === socket?.id;

  return (
    <div
      className={cn(
        "group flex flex-col p-2 rounded transition-colors relative",
        THEME.bg.itemHover,
        !isMe && "cursor-pointer"
      )}
      onClick={() => {
        if (!isMe) {
          onScrollToCursor(user.socketId);
        }
      }}
    >
      <div className="flex items-center gap-3 w-full">
        <div className="relative">
          <img
            src={getAvatarUrl(user.avatar)}
            alt={user.name}
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: user.color || '#60a5fa' }}
          />
          <div className={cn("absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2", THEME.border.status)} />
        </div>

        <div className="flex-1 min-w-0">
          <div
            className={cn("flex items-center justify-between", isMe && "cursor-pointer")}
            onClick={(e) => {
              if (isMe) {
                e.stopPropagation();
                onEditProfile();
              }
            }}
          >
            <div className="flex gap-1 items-center">
              <span
                className={cn("font-medium truncate text-sm", isMe ? THEME.text.header : cn(THEME.text.secondary, THEME.text.hover))}
                style={{ color: !isMe ? user.color : undefined }}
              >
                {user.name}
              </span>
              {user.isAdmin && <AdminBadge />}
              {isMe && <span className="bg-[#5865f2] text-white text-[10px] px-1 rounded font-bold">YOU</span>}
            </div>
            {isMe ? (
              <Button variant={'ghost'} size={'icon'} className="w-5 h-5">
                <Edit className={cn("w-3 h-3 hover:text-[#060607] dark:hover:text-white", THEME.text.secondary)} />
              </Button>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 5 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="group-hover:opacity-100 opacity-0 transition-all"
              >
                <Users className={cn("w-3 h-3", THEME.text.secondary)} />
              </motion.div>
            )}
          </div>
          <div className={cn("text-[10px] truncate space-x-1", THEME.text.secondary)}>
            <span>{user.location}</span>
            <span>{user.flag}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

```

## components/realtime/hooks/use-chat-scroll.ts
```tsx
import { useEffect, useRef, useState } from 'react';

export const useChatScroll = (isOpen: boolean, msgsLength: number, currentUserId?: string, lastMsgSessionId?: string, firstMsgId?: string) => {
  const chatContainer = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreads, setUnreads] = useState(0);

  // Use ref to track isAtBottom for the effect without adding it to deps
  const isAtBottomRef = useRef(isAtBottom);
  useEffect(() => { isAtBottomRef.current = isAtBottom; }, [isAtBottom]);

  // Preserve scroll position when older messages are prepended
  const prevFirstMsgId = useRef(firstMsgId);
  useEffect(() => {
    if (prevFirstMsgId.current && firstMsgId !== prevFirstMsgId.current) {
      // The first message changed — messages were prepended
      const container = chatContainer.current;
      if (!container) { prevFirstMsgId.current = firstMsgId; return; }
      const viewport = container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (!viewport) { prevFirstMsgId.current = firstMsgId; return; }

      const prevEl = document.getElementById(`msg-${prevFirstMsgId.current}`);
      if (prevEl) {
        // Use requestAnimationFrame to wait for DOM to update
        requestAnimationFrame(() => {
          prevEl.scrollIntoView({ behavior: 'auto', block: 'start' });
        });
      }
    }
    prevFirstMsgId.current = firstMsgId;
  }, [firstMsgId]);

  const scrollToBottom = (smooth = true) => {
    if (!chatContainer.current) return;
    const viewport = chatContainer.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
      setUnreads(0);
      setShowScrollButton(false);
    }
  };

  // Initial scroll to bottom
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => scrollToBottom(false), 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle scroll events
  useEffect(() => {
    const container = chatContainer.current;
    if (!container) return;

    const viewport = container.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!viewport) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      const atBottom = distanceToBottom < 20; // 20px threshold

      setIsAtBottom(atBottom);

      if (atBottom) {
        setUnreads(0);
        setShowScrollButton(false);
      } else {
        setShowScrollButton(true);
      }
    };

    viewport.addEventListener('scroll', handleScroll);
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  // Handle new messages
  useEffect(() => {
    if (msgsLength === 0) return;

    const isMe = lastMsgSessionId === currentUserId;

    if (isAtBottomRef.current || isMe) {
      scrollToBottom(true);
    } else {
      setUnreads(prev => prev + 1);
    }
  }, [msgsLength, currentUserId, lastMsgSessionId]);

  return {
    chatContainer,
    showScrollButton,
    unreads,
    scrollToBottom,
    isAtBottomRef
  };
};

```

## components/realtime/hooks/use-connection-status.ts
```tsx
import { useState, useEffect } from "react";
import type { Socket } from "socket.io-client";

export type ConnectionStatus = "connected" | "connecting" | "disconnected";

export const useConnectionStatus = (socket: Socket | null): ConnectionStatus => {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  useEffect(() => {
    if (!socket) {
      setStatus("disconnected");
      return;
    }

    if (socket.connected) setStatus("connected");
    else setStatus("connecting");

    const onConnect = () => setStatus("connected");
    const onDisconnect = () => setStatus("disconnected");
    const onConnectError = () => setStatus("connecting");
    const onReconnectAttempt = () => setStatus("connecting");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.io.on("reconnect_attempt", onReconnectAttempt);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.io.off("reconnect_attempt", onReconnectAttempt);
    };
  }, [socket]);

  return status;
};

```

## components/realtime/hooks/use-sounds.ts
```tsx
import { useCallback, useEffect, useRef } from "react";

export const useSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const pressBufferRef = useRef<AudioBuffer | null>(null);
  const releaseBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    const loadSound = async () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        audioContextRef.current = ctx;

        const response = await fetch('/assets/keycap-sounds/press.mp3');
        const arrayBuffer = await response.arrayBuffer();
        const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
        pressBufferRef.current = decodedBuffer;

        const releaseResponse = await fetch('/assets/keycap-sounds/release.mp3');
        const releaseArrayBuffer = await releaseResponse.arrayBuffer();
        const releaseDecodedBuffer = await ctx.decodeAudioData(releaseArrayBuffer);
        releaseBufferRef.current = releaseDecodedBuffer;

        const confettiResponse = await fetch('/assets/sounds/vine-boom.mp3');
        const confettiArrayBuffer = await confettiResponse.arrayBuffer();
        confettiBufferRef.current = await ctx.decodeAudioData(confettiArrayBuffer);
      } catch (error) {
        console.error("Failed to load keycap sound", error);
      }
    };

    loadSound();

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const getContext = useCallback(() => {
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume().catch(() => { });
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((startFreq: number, endFreq: number, duration: number, vol: number) => {
    try {
      const ctx = getContext();
      if (!ctx) return;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = "sine";
      const startTime = ctx.currentTime;

      oscillator.frequency.setValueAtTime(startFreq, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(vol, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    } catch (error) {
      console.error("Failed to play notification sound", error);
    }
  }, [getContext]);

  const playSoundBuffer = useCallback((buffer: AudioBuffer | null, baseDetune = 0) => {
    try {
      const ctx = getContext();
      if (!ctx || !buffer) return;

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // Add slight variation
      source.detune.value = baseDetune + (Math.random() * 200) - 100;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.4;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start(0);
    } catch (err) {
      console.error(err);
    }
  }, [getContext]);

  const playPressSound = useCallback(() => {
    playSoundBuffer(pressBufferRef.current);
  }, [playSoundBuffer]);

  const playReleaseSound = useCallback(() => {
    playSoundBuffer(releaseBufferRef.current);
  }, [playSoundBuffer]);

  // Send: Clear, slightly higher pitch, quick
  const playSendSound = useCallback(() => {
    playTone(600, 300, 0.25, 0.08);
  }, [playTone]);

  // Receive: Lower pitch, bubble-like, slightly longer
  const playReceiveSound = useCallback(() => {
    playTone(800, 400, 0.35, 0.1);
  }, [playTone]);

  const confettiBufferRef = useRef<AudioBuffer | null>(null);

  const playConfettiSound = useCallback((intensity: number = 0.5) => {
    try {
      const ctx = getContext();
      const buffer = confettiBufferRef.current;
      if (!ctx || !buffer) return;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      // Lower intensity = higher pitch (lighter pop), higher = deeper boom
      source.playbackRate.value = 1.2 - intensity * 0.4;
      source.detune.value = (Math.random() * 100) - 50;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.15 + intensity * 0.5;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
    } catch (err) {
      console.error(err);
    }
  }, [getContext]);

  // Charge tone — continuous oscillator whose pitch tracks intensity
  const chargeOscRef = useRef<OscillatorNode | null>(null);
  const chargeGainRef = useRef<GainNode | null>(null);

  const startChargeTone = useCallback(() => {
    try {
      const ctx = getContext();
      if (!ctx || chargeOscRef.current) return;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 200;

      const gain = ctx.createGain();
      gain.gain.value = 0;

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      chargeOscRef.current = osc;
      chargeGainRef.current = gain;
    } catch (err) {
      console.error(err);
    }
  }, [getContext]);

  const updateChargeTone = useCallback((intensity: number) => {
    const osc = chargeOscRef.current;
    const gain = chargeGainRef.current;
    if (!osc || !gain) return;
    // Pitch rises from 200Hz to 800Hz
    osc.frequency.value = 200 + intensity * 600;
    // Volume fades in gently
    gain.gain.value = intensity * 0.06;
  }, []);

  const stopChargeTone = useCallback(() => {
    try {
      chargeOscRef.current?.stop();
    } catch { /* already stopped */ }
    chargeOscRef.current = null;
    chargeGainRef.current = null;
  }, []);

  return {
    playSendSound, playReceiveSound, playPressSound, playReleaseSound,
    playConfettiSound,
    startChargeTone, updateChargeTone, stopChargeTone,
  };
};

```

## components/realtime/hooks/use-typing.ts
```tsx
import { useEffect, useRef, useState, type RefObject } from 'react';
import type { Socket } from 'socket.io-client';

export const useTyping = (socket: Socket | null, currentUser: { name: string } | undefined, scrollToBottom: (smooth: boolean) => void, isAtBottomRef: RefObject<boolean>) => {
  const [typingUsers, setTypingUsers] = useState<Map<string, { username: string, timeout: NodeJS.Timeout }>>(new Map());
  const typingUsersRef = useRef(typingUsers);
  typingUsersRef.current = typingUsers;
  const lastTypingSent = useRef<number>(0);

  // Handle typing events
  useEffect(() => {
    if (!socket) return;

    const handleTypingReceive = (data: { socketId: string, username: string, isTyping: boolean }) => {
      // Don't show typing for self
      if (data.socketId === socket.id) return;

      if (!data.isTyping) {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          if (newMap.has(data.socketId)) {
            clearTimeout(newMap.get(data.socketId)!.timeout);
            newMap.delete(data.socketId);
          }
          return newMap;
        });
        return;
      }

      setTypingUsers(prev => {
        const newMap = new Map(prev);

        // Clear existing timeout if any
        if (newMap.has(data.socketId)) {
          clearTimeout(newMap.get(data.socketId)!.timeout);
        }

        // Set new timeout to clear typing status after 3 seconds
        const timeout = setTimeout(() => {
          setTypingUsers(current => {
            const updated = new Map(current);
            updated.delete(data.socketId);
            return updated;
          });
        }, 3000);

        newMap.set(data.socketId, { username: data.username, timeout });
        return newMap;
      });

      // If we are at bottom, keep at bottom when typing indicator appears/re-renders
      if (isAtBottomRef.current) {
        scrollToBottom(true);
      }
    };

    socket.on("typing-receive", handleTypingReceive);

    return () => {
      socket.off("typing-receive", handleTypingReceive);
      // Clear all pending timeouts to prevent state updates after unmount
      typingUsersRef.current.forEach(({ timeout }) => clearTimeout(timeout));
    };
  }, [socket, isAtBottomRef, scrollToBottom]);

  const handleTyping = () => {
    if (!socket || !currentUser) return;

    const now = Date.now();
    // Throttle typing events to once every 2 seconds
    if (now - lastTypingSent.current > 2000) {
      socket.emit("typing-send", { username: currentUser.name || "Anonymous" });
      lastTypingSent.current = now;
    }
  };

  const getTypingText = () => {
    if (typingUsers.size === 0) return null;
    const names = Array.from(typingUsers.values()).map(u => u.username);
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
    if (names.length === 3) return `${names[0]}, ${names[1]}, and ${names[2]} are typing...`;
    return "Several people are typing...";
  };

  return {
    typingUsers,
    handleTyping,
    getTypingText
  };
};

```

