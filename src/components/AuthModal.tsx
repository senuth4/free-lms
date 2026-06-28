import React, { useState } from 'react';
import { X, Bot, Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  title = "Welcome Back", 
  subtitle = "Sign in to access premium features" 
}: AuthModalProps) {
  const { loginAdmin, loginWithEmail, registerWithEmail, resetPassword } = useAppData();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    const success = await loginAdmin();
    if (success) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
       if (mode === 'login') {
          await loginWithEmail(email, password);
          onClose();
       } else if (mode === 'register') {
          if (!name) throw new Error("Name is required");
          await registerWithEmail(email, password, name);
          onClose();
       } else if (mode === 'forgot') {
          await resetPassword(email);
          setMessage('Password reset email sent. Check your inbox.');
          // Don't close immediately so they see the message
       }
    } catch (err: any) {
       setError(err.message || 'Authentication failed');
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md" 
        onClick={onClose}
      />
      
      <div className="relative bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 pb-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6 border border-white/10">
            <Bot className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
            {mode === 'login' ? title : mode === 'register' ? 'Create an Account' : 'Reset Password'}
          </h2>
          <p className="text-slate-400 text-sm mb-6">
             {mode === 'login' ? subtitle : mode === 'register' ? 'Join us to access materials' : 'Enter your email to receive a password reset link.'}
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-3 mb-6">
            {error && <div className="p-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm mb-2">{error}</div>}
            {message && <div className="p-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 text-sm mb-2">{message}</div>}
            
            {mode === 'register' && (
              <div className="relative">
                <UserIcon className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 p-2.5 pl-10 rounded-xl text-white outline-none focus:border-blue-500"
                  required
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 p-2.5 pl-10 rounded-xl text-white outline-none focus:border-blue-500"
                required
              />
            </div>
            
            {mode !== 'forgot' && (
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 p-2.5 pl-10 rounded-xl text-white outline-none focus:border-blue-500"
                  required
                />
              </div>
            )}

            {mode === 'login' && (
               <div className="text-right">
                  <button type="button" onClick={() => setMode('forgot')} className="text-xs text-blue-400 hover:text-blue-300 font-medium">Forgot password?</button>
               </div>
            )}
            
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Sign Up' : 'Send Reset Link'}
            </button>
          </form>

          {mode !== 'forgot' && (
             <>
               <div className="w-full flex items-center gap-4 mb-6">
                 <div className="h-px bg-slate-800 flex-1" />
                 <span className="text-xs text-slate-500">OR</span>
                 <div className="h-px bg-slate-800 flex-1" />
               </div>

               <div className="w-full space-y-4">
                 <button 
                   onClick={handleGoogleLogin}
                   type="button"
                   className="w-full relative group overflow-hidden rounded-xl border border-white/10"
                 >
                   <div className="absolute inset-0 bg-white/5 opacity-80 group-hover:opacity-100 transition-opacity" />
                   <div className="relative flex items-center justify-center gap-3 px-6 py-3">
                     <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                       <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                       <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                       <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                     </svg>
                     <span className="font-medium text-white text-sm">Continue with Google</span>
                   </div>
                 </button>
               </div>
             </>
          )}
          
          <p className="text-xs text-slate-500 mt-6">
            {mode === 'login' ? "Don't have an account? " : mode === 'register' ? "Already have an account? " : "Remember your password? "}
            <button 
               type="button"
               onClick={() => setMode(mode === 'login' ? 'register' : 'login')} 
               className="text-blue-400 hover:text-blue-300 font-medium"
            >
               {mode === 'login' ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
