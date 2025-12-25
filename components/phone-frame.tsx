"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PhoneFrameProps {
    children: React.ReactNode;
}

function formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
    const [scale, setScale] = useState(1);
    const [currentTime, setCurrentTime] = useState<string>("");

    // Update time every minute
    useEffect(() => {
        // Set initial time
        setCurrentTime(formatTime(new Date()));

        // Update every minute
        const interval = setInterval(() => {
            setCurrentTime(formatTime(new Date()));
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const calculateScale = () => {
            // Only scale on desktop/tablet (md breakpoint is usually 768px)
            if (window.innerWidth >= 768) {
                // Target screen size: 390x844
                // We want to fit it nicely with some padding (e.g. 5% margin)
                const vh = window.innerHeight;
                const vw = window.innerWidth;

                // Reduce padding to maximize size on laptop screens (14-16 inch)
                // Use smaller buffer (e.g. 24px total vertical instead of 80px)
                const verticalBuffer = 24;
                const horizontalBuffer = 40;

                const availableHeight = vh - verticalBuffer;
                const availableWidth = vw - horizontalBuffer;

                const scaleHeight = availableHeight / 844;
                const scaleWidth = availableWidth / 390;

                // Maintain aspect ratio and fit within screen
                const newScale = Math.min(scaleHeight, scaleWidth);
                setScale(newScale);
            } else {
                setScale(1);
            }
        };

        calculateScale();
        window.addEventListener("resize", calculateScale);
        return () => window.removeEventListener("resize", calculateScale);
    }, []);

    return (
        <div className="flex w-full h-[100dvh] md:fixed md:inset-0 md:bg-gray-200 dark:md:bg-gray-900 md:items-center md:justify-center overflow-hidden">
            {/* Phone Frame */}
            <div
                id="phone-frame"
                style={{
                    transform: scale === 1 ? "none" : `scale(${scale})`,
                }}
                className={cn(
                    "relative isolate flex flex-col overflow-hidden transition-transform duration-200 ease-out origin-center",
                    // Mobile Styles (Default)
                    "w-full h-full border-none bg-background shadow-none",
                    // Desktop Styles (md+)
                    "md:w-[390px] md:h-[844px] md:rounded-[3rem] md:border-[8px] md:border-[#1a1a1a] md:ring-1 md:ring-black/5 dark:md:ring-white/5 md:shadow-2xl"
                )}
            >
                {/* Fake Status Bar - Desktop Only */}
                <div className="hidden md:flex h-12 bg-background z-50 justify-between items-end px-6 pb-2 text-foreground select-none shrink-0 relative border-b border-border/30">
                    {/* Time */}
                    <span className="font-semibold text-[15px] leading-none mb-0.5">
                        {currentTime || "0:00"}
                    </span>

                    {/* Dynamic Island / Notch Placeholder */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-[#1a1a1a] rounded-b-3xl"></div>

                    {/* Right Icons */}
                    <div className="flex items-center gap-1.5 opacity-90">
                        {/* Battery */}
                        <div className="w-6 h-3 rounded-[3px] border border-current relative ml-0.5 opacity-80">
                            <div className="absolute top-0.5 bottom-0.5 left-0.5 right-1 bg-current rounded-[1px]" />
                            <div className="absolute top-1 bottom-1 -right-1 w-0.5 bg-current rounded-r-[1px]" />
                        </div>
                    </div>
                </div>

                {/* Screen Content */}
                <div id="phone-viewport" className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent bg-background relative containing-block">
                    {children}
                </div>

                {/* Home Indicator - Desktop Only */}
                <div className="hidden md:block absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/20 rounded-full z-50 pointer-events-none" />
            </div>
        </div>
    );
}


