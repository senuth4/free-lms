import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function TelegramChat() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Replace with the actual bot username provided by the user later
  const botUsername = 'your_telegram_bot_username'; 

  const handleOpenTelegram = () => {
    window.open(`https://t.me/${botUsername}`, '_blank');
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-slate-900 border border-white/10 shadow-2xl rounded-2xl w-[320px] mb-4 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center p-2">
                 <svg viewBox="0 0 24 24" className="w-full h-full fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.676c.223-.205-.05-.316-.346-.118l-6.4 4.02-2.76-.864c-.6-.188-.61-.6.126-.89l10.8-4.16c.5-.188.948.118.81 1.333z"/>
                 </svg>
              </div>
              <div className="text-white">
                <h3 className="font-bold text-sm">Live Support Bot</h3>
                <p className="text-xs text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 bg-slate-900/50 h-48 overflow-y-auto flex flex-col gap-3">
            <div className="bg-white/10 text-slate-200 text-sm p-3 rounded-2xl rounded-tl-sm w-[85%]">
              Hello! 👋 Welcome to our platform. Click the button below to start a live chat with our Telegram assistant. 
            </div>
            <div className="bg-white/10 text-slate-200 text-sm p-3 rounded-2xl rounded-tl-sm w-[85%]">
              How can we help you today?
            </div>
          </div>
          
          <div className="p-4 border-t border-white/10 bg-slate-900">
            <button 
              onClick={handleOpenTelegram}
              className="w-full py-3 bg-[#00a2ff] hover:bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" /> Open in Telegram
            </button>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,162,255,0.4)] transition-transform hover:scale-110 active:scale-95 ${isOpen ? 'bg-slate-800 border border-white/10 text-white' : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : (
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white translate-x-[-1px] translate-y-[1px]" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.676c.223-.205-.05-.316-.346-.118l-6.4 4.02-2.76-.864c-.6-.188-.61-.6.126-.89l10.8-4.16c.5-.188.948.118.81 1.333z"/>
          </svg>
        )}
      </button>
    </div>
  );
}
