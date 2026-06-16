import React from 'react';
import { Link } from 'react-router-dom';
import { Teacher } from '../types';
import { useAppData } from '../context/AppDataContext';
import { Youtube, Facebook, MessageCircle } from 'lucide-react';

export default function TeacherCard(props: { teacher: Teacher, key?: React.Key }) {
  const { teacher } = props;
  const { subjects } = useAppData();
  const subject = subjects.find(s => s.id === teacher.subjectId);

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col items-center text-center p-6 group">
      <Link to={`/teacher/${teacher.id}`} className="block relative w-24 h-24 mb-4">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-purple-500 rounded-full animate-spin-slow opacity-0 group-hover:opacity-100 blur-md transition-opacity" />
        <img 
          src={teacher.imageUrl} 
          alt={teacher.name}
          className="relative w-full h-full rounded-full object-cover border-2 border-white/10 group-hover:border-transparent transition-all"
        />
      </Link>
      
      <Link to={`/teacher/${teacher.id}`}>
        <h3 className="font-bold text-lg text-slate-100 group-hover:text-[#00a2ff] transition-colors">
          {teacher.name}
        </h3>
      </Link>
      <p className="text-sm font-medium text-purple-400 mb-3">{subject?.name}</p>
      
      <p className="text-xs text-slate-400 line-clamp-3 mb-4">
        {teacher.description}
      </p>

      <div className="mt-auto flex items-center justify-center gap-3">
        {teacher.socials.youtube && (
          <a href={teacher.socials.youtube} target="_blank" rel="noreferrer" className="p-2 glass-card rounded-full text-slate-300 hover:text-red-500 transition-colors">
            <Youtube className="w-4 h-4" />
          </a>
        )}
        {teacher.socials.facebook && (
          <a href={teacher.socials.facebook} target="_blank" rel="noreferrer" className="p-2 glass-card rounded-full text-slate-300 hover:text-blue-500 transition-colors">
            <Facebook className="w-4 h-4" />
          </a>
        )}
        {teacher.socials.telegram && (
          <a href={teacher.socials.telegram} target="_blank" rel="noreferrer" className="p-2 glass-card rounded-full text-slate-300 hover:text-cyan-500 transition-colors">
            <MessageCircle className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
