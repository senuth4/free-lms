import React from 'react';
import { Link } from 'react-router-dom';
import { Play, FileText, Eye } from 'lucide-react';
import { Course } from '../types';
import { useAppData } from '../context/AppDataContext';

export default function CourseCard(props: { course: Course, key?: React.Key }) {
  const { course } = props;
  const { teachers, subjects } = useAppData();
  
  const teacher = teachers.find(t => t.id === course.teacherId);
  const subject = subjects.find(s => s.id === course.subjectId);

  const videoCount = course.links.filter(l => l.type === 'video').length;
  const pdfCount = course.links.filter(l => l.type === 'pdf').length;

  return (
    <Link to={`/course/${course.id}`} className="group block h-full">
      <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={course.thumbnailUrl || undefined} 
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 right-2 flex gap-2">
             <span className="px-2 py-1 text-xs font-medium bg-slate-900/80 backdrop-blur text-white rounded shadow">
               {subject?.name}
             </span>
          </div>
          <div className="absolute bottom-2 right-2 px-2 py-1 text-xs font-medium bg-slate-900/80 backdrop-blur text-white rounded shadow flex items-center gap-1">
             <Eye className="w-3 h-3" /> {(course.views / 1000).toFixed(1)}k
          </div>
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <p className="text-xs text-cyan-400 font-medium mb-1">{course.unit}</p>
          <h3 className="font-bold text-lg text-slate-100 line-clamp-2 mb-2 group-hover:text-[#00a2ff] transition-colors">
            {course.title}
          </h3>
          
          <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <img src={teacher?.imageUrl || undefined} alt={teacher?.name} className="w-6 h-6 rounded-full object-cover" />
              <span className="text-xs text-slate-400 truncate max-w-[100px]">{teacher?.name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
               {videoCount > 0 && <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {videoCount}</span>}
               {pdfCount > 0 && <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {pdfCount}</span>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
