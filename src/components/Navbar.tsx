import { Link } from 'react-router-dom';
import { BookOpen, Search, Menu, LayoutDashboard, X, Home, Library, Settings } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
    <nav className="fixed top-0 inset-x-0 z-40 glass-panel border-b-0 border-white/10 backdrop-blur-xl">
      <div className="mx-auto px-4 md:px-8 lg:px-12 h-16 flex items-center justify-between max-w-[1600px]">
        <Link to="/" className="flex items-center gap-2 group">
          <BookOpen className="w-8 h-8 text-[#00a2ff] group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold tracking-tight">
            EduLanka <span className="text-[#00a2ff]">LMS</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="text-gray-300 hover:text-[#00a2ff] transition-colors">Home</Link>
          <Link to="/courses" className="text-gray-300 hover:text-[#00a2ff] transition-colors">Courses</Link>
          <Link to="/subject/sub-phy" className="text-gray-300 hover:text-[#00a2ff] transition-colors">Physics</Link>
          <Link to="/subject/sub-chem" className="text-gray-300 hover:text-[#00a2ff] transition-colors">Chemistry</Link>
          <Link to="/subject/sub-math" className="text-gray-300 hover:text-[#00a2ff] transition-colors">Maths</Link>
          <Link to="/subject/sub-bio" className="text-gray-300 hover:text-[#00a2ff] transition-colors">Biology</Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button className="p-2 text-gray-300 hover:text-[#00a2ff] transition-colors">
            <Search className="w-5 h-5" />
          </button>
        </div>

        <button 
          className="md:hidden p-2 text-gray-300 hover:text-[#00a2ff] transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>

    {/* Mobile Drawer Overlay */}
    {isOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden" onClick={() => setIsOpen(false)} />
    )}
    
    {/* Mobile Drawer */}
    <div className={`fixed top-0 left-0 w-72 h-full bg-slate-950 border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <BookOpen className="w-7 h-7 text-[#00a2ff]" />
            <span className="text-lg font-bold tracking-tight">EduLanka</span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-2 flex-grow overflow-y-auto pb-4">
          <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-[#00a2ff] transition-colors">
            <Home className="w-5 h-5" /> Home
          </Link>
          <Link to="/courses" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-gray-300 hover:bg-white/5 hover:text-[#00a2ff] transition-colors">
            <Library className="w-5 h-5" />  All Courses
          </Link>
          
          <div className="mt-4 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subjects</div>
          <Link to="/subject/sub-phy" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-gray-300 hover:bg-white/5 transition-colors">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div> Physics
          </Link>
          <Link to="/subject/sub-chem" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-gray-300 hover:bg-white/5 transition-colors">
            <div className="w-2 h-2 rounded-full bg-green-400"></div> Chemistry
          </Link>
          <Link to="/subject/sub-math" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-gray-300 hover:bg-white/5 transition-colors">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div> Maths
          </Link>
          <Link to="/subject/sub-bio" onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-gray-300 hover:bg-white/5 transition-colors">
            <div className="w-2 h-2 rounded-full bg-pink-400"></div> Biology
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
