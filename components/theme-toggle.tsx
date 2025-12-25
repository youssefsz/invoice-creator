"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Prevent hydration mismatch by only rendering after mount
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    // Show a placeholder button during SSR to prevent layout shift
    if (!mounted) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className="text-foreground transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Toggle theme"
            >
                <span className="h-6 w-6" />
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
        >
            {resolvedTheme === "dark" ? (
                <Sun className="h-6 w-6 stroke-[1.5] transition-transform duration-200" />
            ) : (
                <Moon className="h-6 w-6 stroke-[1.5] transition-transform duration-200" />
            )}
        </Button>
    );
}
