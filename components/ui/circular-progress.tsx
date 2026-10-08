"use client";

import React from "react";

export function CircularProgress({
  progress = 0,
  size = 48,
  strokeWidth = 4,
  label,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="inline-flex flex-col items-center justify-center gap-1">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90 transform">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-black/10 dark:text-white/10 fill-none"
          />
          {/* Animated progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-emerald-600 dark:text-emerald-400 transition-all duration-300 ease-out fill-none"
          />
        </svg>
        <span className="absolute text-[11px] font-black text-forest dark:text-cream">
          {Math.round(clamped)}%
        </span>
      </div>
      {label && <span className="text-[10px] font-bold text-ink/60 dark:text-cream/60">{label}</span>}
    </div>
  );
}
