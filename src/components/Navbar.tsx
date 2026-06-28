import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Menu, LayoutDashboard, X, Home, Library, Bookmark, Book, User, Bot, LogOut, Shield, Sun, Moon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAppData } from '../context/AppDataContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  const { subjects, bookmarkedCourses, courses, teachers, user, logoutAdmin, isSuperAdmin, isEditor } = useAppData();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Search logic
  const searchResults = () => {
    if (!searchQuery.trim()) return { courses: [], teachers: [], subjects: [] };
    const query = searchQuery.toLowerCase();
    
    return {
      courses: courses.filter(c => c.title.toLowerCase().includes(query) || (c as any).description?.toLowerCase().includes(query)).slice(0, 3),
      teachers: teachers.filter(t => t.name.toLowerCase().includes(query) || (subjects.find(s => s.id === t.subjectId)?.name || '').toLowerCase().includes(query)).slice(0, 3),
      subjects: subjects.filter(s => s.name.toLowerCase().includes(query)).slice(0, 3)
    };
  };

  const results = searchResults();
  const hasResults = results.courses.length > 0 || results.teachers.length > 0 || results.subjects.length > 0;

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
    <nav className="fixed top-0 inset-x-0 z-40 glass-panel border-b-0 border-white/10 backdrop-blur-xl">
      <div className="mx-auto px-4 md:px-8 lg:px-12 h-16 flex items-center justify-between max-w-[1600px]">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.svg" alt="Science API Logo" className="w-12 h-10 object-contain group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold tracking-tight">
            Science <span className="text-[#00a2ff]">API</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="text-gray-300 hover:text-[#00a2ff] transition-colors">Home</Link>
          <Link to="/lessons" className="text-gray-300 hover:text-[#00a2ff] transition-colors flex items-center gap-1"><Book className="w-4 h-4"/> Lessons</Link>
          <Link to="/ai-hub" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 font-bold"><Bot className="w-4 h-4"/> AI Hub</Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {user && (
             <>
               <Link 
                 to="/saved" 
                 className="hidden md:flex relative p-2 text-gray-300 hover:text-cyan-400 transition-colors" 
                 title="Student Dashboard"
               >
                 <LayoutDashboard className="w-5 h-5" />
                 {bookmarkedCourses.length > 0 && !(isSuperAdmin || isEditor) && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,162,255,0.8)]"></span>
                 )}
               </Link>
               {(isSuperAdmin || isEditor) && (
                 <Link 
                   to="/admin/dashboard" 
                   className="hidden md:flex relative p-2 text-purple-400 hover:text-purple-300 transition-colors" 
                   title="Admin Dashboard"
                 >
                   <Shield className="w-5 h-5" />
                 </Link>
               )}
             </>
          )}
          <button 
            className="p-2 text-gray-300 hover:text-[#00a2ff] transition-colors"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            className="p-2 text-gray-300 hover:text-[#00a2ff] transition-colors"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="w-5 h-5" />
          </button>
          {user ? (
             <div className="hidden md:flex items-center gap-3 ml-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                   {user.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">{user.email?.[0].toUpperCase()}</div>}
                </div>
                <button onClick={logoutAdmin} className="text-gray-400 hover:text-red-400 transition-colors" title="Sign Out">
                   <LogOut className="w-4 h-4" />
                </button>
             </div>
          ) : (
             <button onClick={() => setIsAuthModalOpen(true)} className="hidden md:flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ml-2">
               Sign In
             </button>
          )}
          <button 
            className="md:hidden p-2 text-gray-300 hover:text-[#00a2ff] transition-colors"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
    <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

    {/* Search Modal */}
    {isSearchOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4" onClick={() => setIsSearchOpen(false)}>
        <div 
          className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center p-4 border-b border-white/10">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search courses, teachers, subjects..." 
              className="bg-transparent border-none outline-none flex-grow text-white placeholder-gray-500 text-lg"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button 
              className="p-1 text-gray-400 hover:text-white rounded-full bg-white/5 bg-opacity-0 hover:bg-opacity-10 transition-all"
              onClick={() => setIsSearchOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {searchQuery.trim() && (
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
              {hasResults ? (
                <>
                  {results.subjects.length > 0 && (
                    <div className="mb-4">
                      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Subjects</div>
                      {results.subjects.map(s => (
                        <button 
                          key={s.id} 
                          onClick={() => handleNavigate(`/subject/${s.id}`)}
                          className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                        >
                          <div className="p-2 rounded-md bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 transition-colors">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <span className="text-slate-200">{s.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {results.teachers.length > 0 && (
                    <div className="mb-4">
                      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Teachers</div>
                      {results.teachers.map(t => (
                        <button 
                          key={t.id} 
                          onClick={() => handleNavigate(`/teacher/${t.id}`)}
                          className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                        >
                          <img src={t.imageUrl} alt={t.name} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <div className="text-slate-200 text-sm font-medium">{t.name}</div>
                            <div className="text-slate-500 text-xs">{subjects.find(s => s.id === t.subjectId)?.name || ''}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {results.courses.length > 0 && (
                    <div>
                      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Courses</div>
                      {results.courses.map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => handleNavigate(`/course/${c.id}`)}
                          className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                        >
                          <div className="w-12 h-8 rounded shrink-0 overflow-hidden bg-slate-800">
                            {c.thumbnailUrl ? (
                              <img src={c.thumbnailUrl} alt={c.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-blue-500/20 text-blue-400">
                                <Book className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-slate-200 text-sm font-medium truncate">{c.title}</div>
                            <div className="text-slate-500 text-xs truncate">
                              {subjects.find(s => s.id === c.subjectId)?.name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p>No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )}

    {/* Mobile Drawer Overlay */}
    {isOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden" onClick={() => setIsOpen(false)} />
    )}
    
    {/* Mobile Drawer */}
    <div className={`fixed top-0 left-0 w-72 h-full bg-slate-950 border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
            <img src="/logo.svg" alt="Science API Logo" className="w-10 h-8 object-contain group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold tracking-tight">Science API</span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2 flex-grow overflow-y-auto pb-4">
          <div className="md:hidden flex flex-col gap-2 mb-4 border-b border-white/10 pb-4">
             {user && (
               <>
                 <Link to="/saved" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-gray-300 bg-white/5 hover:bg-white/10 hover:text-white transition-colors border border-white/5">
                    <LayoutDashboard className="w-5 h-5 text-blue-400" /> Student Dashboard
                 </Link>
                 {(isSuperAdmin || isEditor) && (
                   <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:text-purple-200 transition-colors border border-purple-500/20 mt-2">
                      <Shield className="w-5 h-5 text-purple-400" /> Admin Dashboard
                   </Link>
                 )}
               </>
             )}
             <Link to="/lessons" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-[#00a2ff] transition-colors">
               <Book className="w-5 h-5 text-blue-400" /> Lessons
             </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
