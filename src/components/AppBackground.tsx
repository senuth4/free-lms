import React from 'react';

export default function AppBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden app-background-base">
      {/* Subtle grid background */}
      <div 
        className="absolute inset-0 app-background-grid" 
      />
      
      {/* Modern top-left light leak */}
      <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-500/10 blur-[120px]" />
      
      {/* Modern top-right light leak */}
      <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px]" />
      
      {/* Subtle bottom light leak */}
      <div className="absolute -bottom-[30%] left-[20%] w-[60%] h-[60%] rounded-full bg-cyan-500/5 blur-[120px]" />

      <div className="absolute inset-0 app-background-gradient" />
    </div>
  );
}
