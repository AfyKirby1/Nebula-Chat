"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Plus, User, Trash2, Brain, Box, ChevronLeft, ChevronRight, Settings, LogOut, Sparkles, Zap, Code, Palette, BarChart3, Sun, Moon } from "lucide-react";
import { ChatSession, Memory } from "@/hooks/useChat";
import { ModelSelector } from "@/components/ModelSelector";
import { SettingsModal } from "@/components/SettingsModal";
import { MemoriesModal } from "@/features/memories/MemoriesModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Model } from "@/types/chat";
import { useTheme } from "next-themes";
import { useArtifact } from "@/contexts/ArtifactContext";
import { ThemeSelector } from "@/components/ThemeSelector";

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onLoadSession: (id: string) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onNewChat: () => void;
  userName: string;
  setUserName: (name: string) => void;
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
  models: Model[];
  isModelsLoading: boolean;
  chatMode: string;
  setChatMode: (mode: string) => void;
  memories: Memory[];
  onAddMemory: (content: string) => void;
  onDeleteMemory: (id: string) => void;
}

export function Sidebar({
  sessions,
  currentSessionId,
  onLoadSession,
  onDeleteSession,
  onNewChat,
  userName,
  setUserName,
  selectedModel,
  setSelectedModel,
  models,
  isModelsLoading,
  chatMode,
  setChatMode,
  memories,
  onAddMemory,
  onDeleteMemory,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMemoriesOpen, setIsMemoriesOpen] = React.useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { toggleArtifact } = useArtifact();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = resolvedTheme || theme;

  const modes = [
    { id: "standard", name: "Standard", icon: Zap, color: "text-yellow-500", desc: "Balanced helper for everyday tasks" },
    { id: "developer", name: "Developer", icon: Code, color: "text-blue-500", desc: "Strict code generation & technical precision" },
    { id: "creative", name: "Creative", icon: Palette, color: "text-purple-500", desc: "Imaginative brainstorming & visionary ideas" },
    { id: "analyst", name: "Analyst", icon: BarChart3, color: "text-green-500", desc: "Data-driven insights & structured reasoning" },
  ];

  return (
    <TooltipProvider>
      <div
        className={cn(
          "bg-black/95 border-r border-white/10 flex flex-col h-full text-gray-300 shrink-0 transition-all duration-300 ease-in-out relative",
          isCollapsed ? "w-16" : "w-64"
        )}
        suppressHydrationWarning
      >
        <MemoriesModal
          isOpen={isMemoriesOpen}
          onClose={() => setIsMemoriesOpen(false)}
          memories={memories}
          onAddMemory={onAddMemory}
          onDeleteMemory={onDeleteMemory}
        />

        {/* Collapse Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 h-6 w-6 rounded-full bg-indigo-600 text-white border border-white/10 hover:bg-indigo-700 z-50 shadow-md"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </Button>

        {/* Header / Branding */}
        <div className={cn("p-4 flex items-center gap-2 font-semibold text-white", isCollapsed && "justify-center px-2")}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-lg">🌌</span>
          </div>
          {!isCollapsed && <span>Nebula Chat</span>}
        </div>

        {/* New Chat Button */}
        <div className="px-3 mb-2" suppressHydrationWarning>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                onClick={onNewChat}
                className={cn(
                  "w-full justify-start gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <Plus size={16} />
                {!isCollapsed && "New Chat"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-zinc-900 text-zinc-100 border-zinc-800">
              <p className="font-semibold">New Chat</p>
              <p className="text-xs text-zinc-400">Start a fresh conversation</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Model Selector (Integrated into Sidebar) */}
        <div className={cn("px-3 mb-4", isCollapsed && "hidden")}>
          <div className="text-xs font-medium text-gray-500 mb-2 px-1" suppressHydrationWarning>Model</div>
          <ModelSelector
            currentModel={selectedModel}
            onModelChange={setSelectedModel}
            models={models}
            isLoading={isModelsLoading}
          />
        </div>

        {/* Chat Mode Selector */}
        <div className={cn("px-3 mb-4", isCollapsed && "px-2")}>
          {!isCollapsed && <div className="text-xs font-medium text-gray-500 mb-2 px-1">Persona</div>}
          <div className={cn("grid gap-1", isCollapsed ? "grid-cols-1" : "grid-cols-2")}>
            {modes.map((mode) => (
              <Tooltip key={mode.id} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size={isCollapsed ? "icon" : "sm"}
                    onClick={() => setChatMode(mode.id)}
                    className={cn(
                      "relative overflow-hidden transition-all duration-200",
                      isCollapsed ? "w-full h-10" : "justify-start gap-2 h-9",
                      chatMode === mode.id
                        ? "bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-white/10"
                        : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <mode.icon size={16} className={cn("shrink-0 transition-colors", chatMode === mode.id ? mode.color : "text-gray-400 group-hover:text-white")} />
                    {!isCollapsed && <span className="text-xs font-medium">{mode.name}</span>}
                    {chatMode === mode.id && (
                      <span className={cn("absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-50 pointer-events-none")} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-zinc-900 text-zinc-100 border-zinc-800">
                  <p className="font-semibold">{mode.name}</p>
                  <p className="text-xs text-zinc-400">{mode.desc}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Navigation / Main Items */}
        <div className={cn("px-3 space-y-1 mb-6", isCollapsed && "px-2")}>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full text-gray-400 hover:text-white hover:bg-white/5 transition-all",
                  isCollapsed ? "justify-center px-0" : "justify-start gap-2"
                )}
                onClick={toggleArtifact}
              >
                <Sparkles size={16} />
                {!isCollapsed && "Nebula"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-zinc-900 text-zinc-100 border-zinc-800">
              <p className="font-semibold">Nebula Artifacts</p>
              <p className="text-xs text-zinc-400">View generated content in full screen</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full text-gray-400 hover:text-white hover:bg-white/5 transition-all",
                  isCollapsed ? "justify-center px-0" : "justify-start gap-2"
                )}
                onClick={() => setIsMemoriesOpen(true)}
              >
                <Brain size={16} />
                {!isCollapsed && "Memories"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-zinc-900 text-zinc-100 border-zinc-800">
              <p className="font-semibold">Core Memories</p>
              <p className="text-xs text-zinc-400">Manage what the AI remembers about you</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-3 min-h-0 custom-scrollbar">
          {!isCollapsed && <div className="text-xs font-medium text-gray-500 mb-2 px-2">Recent Chats</div>}
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onLoadSession(session.id)}
                className={cn(
                  "group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer text-sm transition-colors relative",
                  currentSessionId === session.id
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white",
                  isCollapsed && "justify-center px-0"
                )}
                title={session.title}
              >
                <MessageSquare size={14} className="shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="truncate flex-1">{session.title}</span>
                    <button
                      onClick={(e) => onDeleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/20 rounded transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Profile / Bottom Section */}
        <div className="p-4 border-t border-white/10 mt-auto">
          <SettingsModal userName={userName} setUserName={setUserName}>
            <button
              className={cn("flex items-center gap-3 p-2 rounded-md hover:bg-white/5 cursor-pointer transition-colors w-full text-left border-none bg-transparent", isCollapsed && "justify-center px-0")}
              suppressHydrationWarning
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0" suppressHydrationWarning>
                {userName.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate" suppressHydrationWarning>{userName}</div>
                  <div className="text-xs text-gray-500 truncate">Pro Plan</div>
                </div>
              )}
            </button>
          </SettingsModal>
          {!isCollapsed && (
            <div className="mt-2 flex items-center justify-between px-2">
              <ThemeSelector className="h-6 w-6" />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-400 hover:text-white"
                onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
                suppressHydrationWarning
              >
                {mounted ? (currentTheme === 'dark' ? <Moon size={14} /> : <Sun size={14} />) : <div className="w-[14px] h-[14px]" />}
              </Button>

              <SettingsModal userName={userName} setUserName={setUserName}>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                  <Settings size={14} />
                </Button>
              </SettingsModal>
            </div>
          )}

          {/* Version Indicator */}
          <div className={cn("mt-4 text-[10px] font-mono text-zinc-600 flex items-center", isCollapsed ? "justify-center" : "justify-between px-2")}>
            <span>v0.1</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
