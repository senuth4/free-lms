import React, { useEffect, useState } from 'react';

export default function DNABackground() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden" style={{ opacity: 0.15 }}>
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black" />
      
      {/* Container for parallaxing elements */}
      <div 
        className="absolute inset-0 flex items-center justify-center pt-20"
        style={{ transform: `translateY(${scrollY * -0.4}px)` }}
      >
        <div className="flex flex-col gap-12 rotate-[15deg] scale-150 relative -left-32 opacity-50">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} className="flex items-center gap-16 animate-dna" style={{ animationDelay: `${i * -0.3}s` }}>
              <div className="w-16 h-16 rounded-full bg-blue-500 blur-md relative">
                <div className="absolute inset-2 bg-blue-200 rounded-full blur-none" />
              </div>
              <div className="h-1 w-48 bg-gradient-to-r from-blue-500 to-purple-500" />
              <div className="w-16 h-16 rounded-full bg-purple-500 blur-md relative">
                <div className="absolute inset-2 bg-purple-200 rounded-full blur-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
{/* 
      <style>{`
        @keyframes dna-spin {
          0% { transform: scaleX(1); left: 0; }
          50% { transform: scaleX(-1); left: 200px; }
          100% { transform: scaleX(1); left: 0; }
        }
        .animate-dna {
           animation: dna-shift 6s ease-in-out infinite alternate;
        }
        @keyframes dna-shift {
          0% { transform: translateX(0) scaleX(1); }
          100% { transform: translateX(80px) scaleX(-1); }
        }
      `}</style> */}
    </div>
  );
}
