import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Brain, Trash2, Plus, X } from "lucide-react";
import { useState } from "react";
import { Memory } from "@/hooks/useChat";

interface MemoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: Memory[];
  onAddMemory: (content: string) => void;
  onDeleteMemory: (id: string) => void;
}

export function MemoriesModal({ isOpen, onClose, memories, onAddMemory, onDeleteMemory }: MemoriesModalProps) {
  const [newMemory, setNewMemory] = useState("");

  const handleAdd = () => {
    if (newMemory.trim()) {
      onAddMemory(newMemory);
      setNewMemory("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-[#09090b] border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="text-purple-500" />
            Core Memories
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Facts and preferences the AI remembers about you.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 my-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {memories.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 italic flex flex-col items-center gap-2">
                    <Brain size={32} className="opacity-20" />
                    <p>No memories yet.</p>
                    <p className="text-xs">Tell the AI to "remember" something, or add it here.</p>
                </div>
            ) : (
                memories.map(memory => (
                    <div key={memory.id} className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 flex items-start justify-between gap-3 group hover:border-purple-500/30 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <p className="text-sm text-zinc-300 mt-0.5 break-words">{memory.content}</p>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => onDeleteMemory(memory.id)}
                            className="h-6 w-6 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                        >
                            <Trash2 size={14} />
                        </Button>
                    </div>
                ))
            )}
        </div>

        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-800">
            <Input 
                value={newMemory}
                onChange={(e) => setNewMemory(e.target.value)}
                placeholder="Add a new memory manually..."
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-purple-500 text-zinc-100 placeholder:text-zinc-600"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button onClick={handleAdd} size="icon" className="bg-purple-600 hover:bg-purple-700 text-white shrink-0">
                <Plus size={18} />
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
