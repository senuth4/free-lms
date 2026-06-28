import { Link, useLocation } from 'react-router-dom';
import { Home, Library, Bookmark, Menu } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export default function BottomNav() {
  const location = useLocation();
  const { bookmarkedCourses } = useAppData();

  const navItems = [
    { label: 'Home', path: '/', icon: <Home className="w-6 h-6" /> },
    { label: 'Lessons', path: '/lessons', icon: <Library className="w-6 h-6" /> },
    { 
      label: 'Dashboard', 
      path: '/saved', 
      icon: (
        <div className="relative">
          <Bookmark className="w-6 h-6" />
          {bookmarkedCourses.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-slate-900"></span>
          )}
        </div>
      ) 
    },
    // Adding a dummy menu that could scroll or open drawer
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-white/10 px-6 py-3 pb-safe z-40">
      <div className="flex justify-between items-center">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center gap-1 ${isActive ? 'text-[#00a2ff]' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
