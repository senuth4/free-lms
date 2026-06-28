import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ArrowLeft, Loader2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import SEO from '../components/SEO';
import { useAppData } from '../context/AppDataContext';
import AuthModal from '../components/AuthModal';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function SubjectQA() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your AI Subject Q&A Assistant. Ask me any question based on your Biology syllabus and I will help you out based on the resource book!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, resources } = useAppData();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) {
      setShowAuthModal(true);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Lock className="w-16 h-16 text-slate-500 mb-6" />
        <h2 className="text-3xl font-bold text-white mb-4">Protected Area</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-8">
          The AI Study Hub is an exclusive feature for registered students. Sign in to access powerful AI tutors and resource finders.
        </p>
        <button 
          onClick={() => setShowAuthModal(true)}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
        >
          Sign In to Access
        </button>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)}
          title="Sign in for AI Hub"
          subtitle="Unlock your personal AI study assistants"
        />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/science-solver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg.content })
      });
      
      let answer = "";
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        answer = data.text || data.answer || data.result || data.message || data.content || data.reply || JSON.stringify(data);
      } else {
        answer = await res.text();
      }
      
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: answer || "Sorry, an error occurred." };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "Failed to connect to the server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col pt-4 pb-2 px-2 md:px-0">
      <SEO title="Science Solver | AI Hub" />
      
      <div className="flex-1 flex flex-col bg-[#0e1621] rounded-2xl overflow-hidden shadow-2xl border border-white/5 relative">
        {/* Header */}
        <div className="flex items-center justify-between bg-[#17212b] p-3 md:p-4 shrink-0 z-10 border-b border-white/5 shadow-sm">
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/ai-hub" className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-base md:text-lg font-semibold text-white leading-tight">Science AI Solver</h1>
                <p className="text-xs text-purple-400">online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 z-10 custom-scrollbar">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Bubble */}
                <div 
                  className={`p-3 md:p-4 shadow-sm ${
                    message.role === 'user' 
                      ? 'bg-[#2b5278] text-white rounded-2xl rounded-tr-sm' 
                      : 'bg-[#182533] text-slate-200 rounded-2xl rounded-tl-sm'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
                  ) : (
                    <div className="markdown-body prose prose-invert max-w-none text-[15px] leading-relaxed prose-p:leading-relaxed prose-pre:bg-[#0e1621] prose-pre:border prose-pre:border-white/5">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#182533] p-3 rounded-2xl rounded-tl-sm flex items-center gap-2 shadow-sm">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                <span className="text-sm text-slate-400">typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-[#17212b] z-10 shrink-0">
          <form onSubmit={handleSubmit} className="relative flex items-center max-w-5xl mx-auto gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message..."
              className="flex-1 bg-[#242f3d] border-none rounded-full py-3 px-5 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 flex items-center justify-center bg-blue-500 hover:bg-blue-600 disabled:bg-[#242f3d] disabled:text-slate-500 text-white rounded-full transition-colors disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </form>
          <div className="text-center mt-2">
             <p className="text-[10px] text-slate-500">Powerful AI Science Problem Solver. Answers may contain inaccuracies.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
