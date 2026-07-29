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

export interface FloatingReaction {
  id: string;
  x: number;
  y: number;
  emoji: string;
  socketId: string;
}

export interface LofiState {
  isPlaying: boolean;
  trackIndex: number;
  position: number;
  updatedAt: number;
}

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
  floatingReactions: FloatingReaction[];
  spawnReaction: (emoji: string, x?: number, y?: number) => void;
  lofiState: LofiState;
  sendLofiAction: (type: "play" | "pause" | "skip" | "sync", payload?: any) => void;
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
  floatingReactions: [],
  spawnReaction: () => { },
  lofiState: { isPlaying: false, trackIndex: 0, position: 0, updatedAt: 0 },
  sendLofiAction: () => { },
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
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [lofiState, setLofiState] = useState<LofiState>({ isPlaying: false, trackIndex: 0, position: 0, updatedAt: 0 });
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
      const oldestId = current[0].id;
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
    newSocket.on("reaction-spawned", (data: any) => {
      let posX = data.x;
      let posY = data.y;
      if (data.px !== undefined && data.py !== undefined) {
         posX = data.px * window.innerWidth;
         posY = data.py * window.innerHeight;
      } else if (posX === undefined || posY === undefined) {
         posX = window.innerWidth / 2 + (Math.random() * 100 - 50);
         posY = window.innerHeight - 100;
      }

      const reactionData: FloatingReaction = {
        id: data.id,
        emoji: data.emoji,
        socketId: data.socketId,
        x: posX,
        y: posY
      };

      setFloatingReactions(prev => [...prev, reactionData]);
      setTimeout(() => {
        setFloatingReactions(prev => prev.filter(r => r.id !== data.id));
      }, 3000);
    });
    newSocket.on("lofi-state", (state: LofiState) => {
      setLofiState(state);
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

  const spawnReaction = useCallback((emoji: string, x?: number, y?: number) => {
    const s = socketRef.current;
    if (!s) return;
    const posX = x !== undefined ? x : window.innerWidth / 2 + (Math.random() * 100 - 50);
    const posY = y !== undefined ? y : window.innerHeight - 100;
    
    const data: FloatingReaction = { 
      emoji, 
      x: posX, 
      y: posY, 
      id: Date.now().toString() + Math.random().toString(), 
      socketId: s.id || '' 
    };
    
    setFloatingReactions(prev => [...prev, data]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== data.id));
    }, 3000);
    
    const pctX = posX / window.innerWidth;
    const pctY = posY / window.innerHeight;
    s.emit("reaction-spawn", { emoji, px: pctX, py: pctY });
  }, []);

  const sendLofiAction = useCallback((type: "play" | "pause" | "skip" | "sync", payload?: any) => {
    const s = socketRef.current;
    if (!s) return;
    s.emit("lofi-action", { type, payload });
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        users,
        setUsers,
        msgs,
        reactions,
        profileMap,
        cursorPositions,
        followingId,
        setFollowingId,
        hasMoreMessages,
        loadingHistory,
        fetchOlderMessages,
        initStatus,
        fetchInitialMessages,
        floatingReactions,
        spawnReaction,
        lofiState,
        sendLofiAction,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContextProvider;
