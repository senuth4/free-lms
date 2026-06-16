import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const { loginAdmin } = useAppData();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginAdmin();
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('Login failed or cancelled.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
      <div className="glass-panel p-8 max-w-md w-full relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00a2ff] to-purple-500" />
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-[#00a2ff]" />
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Access</h2>
          <p className="text-gray-400 text-sm mt-2">Sign in to manage content</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="text-center">
            {error && <p className="text-red-400 text-sm mt-2 font-medium mb-4">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#00a2ff] to-blue-600 text-white font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(0,162,255,0.4)] transition-all flex items-center justify-center gap-2"
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
}
