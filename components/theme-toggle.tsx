"use client";

import * as React from "react";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export function ThemeToggle() {
    const [mounted, setMounted] = React.useState(false);

    // Prevent hydration mismatch by only rendering after mount
    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Show a placeholder button during SSR to prevent layout shift
    if (!mounted) {
        return (
            <div className="h-10 w-10 flex items-center justify-center text-foreground">
                <span className="h-6 w-6" />
            </div>
        );
    }

    return (
        <AnimatedThemeToggler
            className="text-foreground transition-all duration-200 hover:scale-105 active:scale-95 h-10 w-10 flex items-center justify-center rounded-md hover:bg-accent"
        />
    );
}
