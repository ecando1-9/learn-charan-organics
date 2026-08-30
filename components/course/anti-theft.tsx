"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

export function AntiTheft() {
  const [isFocused, setIsFocused] = useState(true);
  const [warning, setWarning] = useState(false);

  useEffect(() => {
    // Prevent right-click (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showWarning();
    };

    // Prevent screenshot/print shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === "PrintScreen") {
        e.preventDefault();
        showWarning();
        navigator.clipboard.writeText("Screenshots are disabled for copyright protection.");
      }
      
      // Ctrl/Cmd + P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        showWarning();
      }

      // Cmd + Shift + 3/4/5 (Mac Screenshots)
      if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5")) {
        e.preventDefault();
        showWarning();
      }

      // Ctrl + Shift + S (Windows Snipping tool shortcut sometimes)
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
         e.preventDefault();
         showWarning();
      }
      
      // Ctrl + S / Cmd + S (Save page)
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        showWarning();
      }
    };

    const showWarning = () => {
      setWarning(true);
      setTimeout(() => setWarning(false), 3000);
    };

    // Obscure screen when window loses focus (often happens when snipping tool is activated)
    const handleBlur = () => setIsFocused(false);
    const handleFocus = () => setIsFocused(true);

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <>
      {/* Warning Toast */}
      {warning && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[10000] bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold animate-in slide-in-from-top-10 fade-in">
          <ShieldAlert size={20} />
          Action disabled for copyright protection
        </div>
      )}

      {/* Unfocused Blackout Overlay (Blocks Snipping Tools) */}
      {!isFocused && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center backdrop-blur-2xl">
          <div className="text-center text-white p-6 max-w-md">
            <ShieldAlert size={64} className="mx-auto text-forest mb-6 opacity-80" />
            <h2 className="text-2xl font-black text-white mb-3">Content Protected</h2>
            <p className="text-white/70">
              For copyright reasons, the screen is obscured when this window is not active. 
              Please click anywhere to resume learning.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
