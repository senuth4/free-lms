import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Bot, BookOpen, MessageSquare, Zap, ChevronRight, Lock } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import AuthModal from '../components/AuthModal';
import SEO from '../components/SEO';

export default function AIHub() {
  const { user } = useAppData();
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  return (
    <div className="space-y-12 pb-16">
      <SEO title="AI Study Hub" description="Futuristic student dashboard with AI-powered study tools." />
      
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-8 md:p-12 border border-white/10 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-center">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Bot className="w-64 h-64 text-blue-400" />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 flex items-center justify-center rounded-2xl mb-6 shadow-[0_0_20px_rgba(0,162,255,0.3)]">
            <Bot className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tight mb-4">
            AI Study Hub
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl">
            Welcome back, {user.displayName?.split(' ')[0] || 'Student'}! Your personal AI-powered study assistants are ready to help you master your A/L subjects.
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* Tool 1: Q&A Assistant */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all duration-300 group flex flex-col h-full bg-slate-900/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />
          
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-3 tracking-tight">Subject Q&A</h2>
          <p className="text-sm text-slate-400 mb-8 flex-grow leading-relaxed">
            Stuck on a difficult concept? Get instant, accurate explanations tailored to the A/L syllabus.
          </p>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-center text-xs text-slate-300"><Zap className="w-3 h-3 text-amber-400 mr-2" /> Step-by-step solutions</li>
            <li className="flex items-center text-xs text-slate-300"><Zap className="w-3 h-3 text-amber-400 mr-2" /> Past paper analysis</li>
          </ul>

          <Link 
            to="/ai-hub/qa"
            className="w-full py-4 text-sm bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500 hover:to-indigo-500 text-blue-400 hover:text-white border border-blue-500/20 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
          >
            Launch Q&A Bot <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Tool 2: Resource Book Finder */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 group flex flex-col h-full bg-slate-900/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all" />
          
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-3 tracking-tight">Book Finder</h2>
          <p className="text-sm text-slate-400 mb-8 flex-grow leading-relaxed">
            Stop flipping through notes! Describe a concept and find the exact Unit and Page Number.
          </p>

          <ul className="space-y-3 mb-8">
            <li className="flex items-center text-xs text-slate-300"><Zap className="w-3 h-3 text-purple-400 mr-2" /> Find exact page numbers</li>
            <li className="flex items-center text-xs text-slate-300"><Zap className="w-3 h-3 text-purple-400 mr-2" /> Filter by subject & unit</li>
          </ul>

          <Link 
            to="/resource-search"
            className="w-full py-4 text-sm bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500 hover:to-pink-500 text-purple-400 hover:text-white border border-purple-500/20 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
          >
            Launch Finder <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </div>
  );
}
