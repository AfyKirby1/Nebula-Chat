"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Loader2, Sparkles, Brain, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Model } from "@/types/chat";

interface ModelSelectorProps {
    currentModel: string;
    onModelChange: (modelId: string) => void;
    models: Model[];
    isLoading?: boolean;
}

export function ModelSelector({ currentModel, onModelChange, models, isLoading }: ModelSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedModelName = models.find((m) => m.id === currentModel)?.name || currentModel;

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-full h-9 pl-3 pr-4 gap-2 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 transition-all group w-full justify-between shadow-sm"
            >
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-500/10 text-teal-500 group-hover:bg-teal-500/20 transition-colors">
                        <Sparkles size={12} />
                    </div>
                    <span className="text-sm font-medium text-zinc-100 truncate max-w-[120px]">{selectedModelName}</span>
                </div>
                <ChevronDown size={14} className={`text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </Button>

            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-72 bg-[#09090b] border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-6 text-muted-foreground">
                                <Loader2 size={16} className="animate-spin mr-2" />
                                <span className="text-xs">Loading models...</span>
                            </div>
                        ) : (
                            <>
                                <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider border-b border-zinc-800 mb-1">
                                    Select Model
                                </div>
                                {models.map((model) => (
                                    <button
                                        key={model.id}
                                        onClick={() => {
                                            onModelChange(model.id);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-start justify-between transition-colors mb-0.5 ${currentModel === model.id
                                            ? "bg-teal-500/10 text-teal-400"
                                            : "hover:bg-zinc-800 text-zinc-300"
                                            }`}
                                    >
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium truncate">{model.name}</span>
                                                {model.thinking && (
                                                    <div className="bg-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5 border border-purple-500/20">
                                                        <Brain size={8} />
                                                        <span>Thinking</span>
                                                    </div>
                                                )}
                                                {model.vision && (
                                                    <div className="bg-blue-500/20 text-blue-300 text-[9px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5 border border-blue-500/20">
                                                        <ImageIcon size={8} />
                                                        <span>Vision</span>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-zinc-500 truncate opacity-70 font-mono">
                                                {model.id}
                                            </span>
                                            <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                                {model.description}
                                            </p>
                                        </div>
                                        {currentModel === model.id && <Check size={16} className="mt-0.5 shrink-0" />}
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
