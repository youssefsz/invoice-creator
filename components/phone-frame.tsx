"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface PhoneFrameProps {
    children: React.ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const calculateScale = () => {
            // Only scale on desktop/tablet (md breakpoint is usually 768px)
            if (window.innerWidth >= 768) {
                // Target screen size: 390x844
                // We want to fit it nicely with some padding (e.g. 5% margin)
                const vh = window.innerHeight;
                const vw = window.innerWidth;

                const padding = 40; // 20px padding on each side
                const availableHeight = vh - padding * 2;
                const availableWidth = vw - padding * 2;

                // Calculate max scale that fits both dimensions
                // Cap max scale at 1.0 (original size) or 1.1 slightly larger? 
                // User implied it should adjustments size, seemingly to fit.
                // Let's allow it to slightly grow on huge screens but mostly shrink on smaller laptops.
                const scaleHeight = availableHeight / 844;
                const scaleWidth = availableWidth / 390;

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
        <div className="flex w-full h-[100dvh] md:fixed md:inset-0 md:bg-gray-200 md:items-center md:justify-center overflow-hidden">
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
                    "md:w-[390px] md:h-[844px] md:rounded-[3rem] md:border-[8px] md:border-[#1a1a1a] md:ring-1 md:ring-black/5 md:shadow-2xl"
                )}
            >
                {/* Fake Status Bar - Desktop Only */}
                <div className="hidden md:flex h-12 bg-[#f8f7f4] z-50 justify-between items-end px-6 pb-2 text-foreground select-none shrink-0 relative border-b border-gray-100/50">
                    {/* Time */}
                    <span className="font-semibold text-[15px] leading-none mb-0.5">9:41</span>

                    {/* Dynamic Island / Notch Placeholder */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-[#1a1a1a] rounded-b-3xl"></div>

                    {/* Right Icons */}
                    <div className="flex items-center gap-1.5 grayscale opacity-90">
                        {/* Signal */}
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C13.2 2 14.3 2.1 15.4 2.4L19.4 6.4C20.6 7.6 20.6 9.6 19.4 10.8L13.4 16.8C12.6 17.6 11.4 17.6 10.6 16.8L4.6 10.8C3.4 9.6 3.4 7.6 4.6 6.4L8.6 2.4C9.7 2.1 10.8 2 12 2M22 2L2 22M22 22L2 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {/* Wifi */}
                        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
                            <path d="M9 0.5C14.7 0.5 17.6 3.9 17.8 4.2C18.1 4.5 18 5 17.7 5.3L9.6 14.6C9.3 14.9 8.7 14.9 8.4 14.6L0.3 5.3C0 5 -0.1 4.5 0.2 4.2C0.4 3.9 3.3 0.5 9 0.5ZM9 3.2C5.5 3.2 3.6 5.1 3.5 5.3L9 11.7L14.5 5.3C14.4 5.1 12.5 3.2 9 3.2Z" />
                        </svg>
                        {/* Battery */}
                        <div className="w-6 h-3 rounded-[3px] border border-current relative ml-0.5 opacity-80">
                            <div className="absolute top-0.5 bottom-0.5 left-0.5 right-1 bg-current rounded-[1px]" />
                            <div className="absolute top-1 bottom-1 -right-1 w-0.5 bg-current rounded-r-[1px]" />
                        </div>
                    </div>
                </div>

                {/* Screen Content */}
                <div id="phone-viewport" className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent bg-background relative containing-block">
                    {children}
                </div>

                {/* Home Indicator - Desktop Only */}
                <div className="hidden md:block absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/20 rounded-full z-50 pointer-events-none" />
            </div>
        </div>
    );
}
