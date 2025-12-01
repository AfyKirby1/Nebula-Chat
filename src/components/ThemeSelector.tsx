"use client";

import { useHolidayTheme, HolidayTheme } from "./HolidayThemeProvider";
import { Button } from "@/components/ui/Button";
import { Gift, Ghost, Leaf, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function ThemeSelector({ className }: { className?: string }) {
    const { theme, setTheme } = useHolidayTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const cycleTheme = () => {
        const themes: HolidayTheme[] = ['default', 'christmas', 'halloween', 'thanksgiving'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    if (!mounted) return null;

    const getIcon = () => {
        switch (theme) {
            case 'christmas': return <Gift className="h-5 w-5" />;
            case 'halloween': return <Ghost className="h-5 w-5" />;
            case 'thanksgiving': return <Leaf className="h-5 w-5" />;
            default: return <Palette className="h-5 w-5" />;
        }
    };

    const getColorClass = () => {
        switch (theme) {
            case 'christmas': return "text-red-500 hover:text-red-600 hover:bg-red-100/20 ring-1 ring-red-500/50";
            case 'halloween': return "text-orange-500 hover:text-orange-600 hover:bg-orange-100/20 ring-1 ring-orange-500/50";
            case 'thanksgiving': return "text-amber-600 hover:text-amber-700 hover:bg-amber-100/20 ring-1 ring-amber-600/50";
            default: return "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={cycleTheme}
            className={cn(
                "relative overflow-hidden transition-all duration-500",
                getColorClass(),
                className
            )}
            title={`Current Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={theme}
                    initial={{ y: -20, opacity: 0, rotate: -45 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 20, opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                >
                    {getIcon()}
                </motion.div>
            </AnimatePresence>

            {theme !== 'default' && (
                <span className={cn(
                    "absolute inset-0 pointer-events-none animate-pulse rounded-md ring-2",
                    theme === 'christmas' && "ring-red-500/20",
                    theme === 'halloween' && "ring-orange-500/20",
                    theme === 'thanksgiving' && "ring-amber-600/20"
                )}></span>
            )}
        </Button>
    );
}
