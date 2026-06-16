import { useState } from 'react';
import { Filter } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import CourseCard from '../components/CourseCard';
import SEO from '../components/SEO';

export default function Courses() {
  const { courses, teachers } = useAppData();
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');

  const uniqueUnits = Array.from(new Set(courses.map(c => c.unit)));

  const filteredCourses = courses.filter(c => {
    let match = true;
    if (selectedTeacher && c.teacherId !== selectedTeacher) match = false;
    if (selectedUnit && c.unit !== selectedUnit) match = false;
    return match;
  });

  return (
    <div className="space-y-8 pb-16">
      <SEO title="All Courses" description="Browse all available classes and courses across different subjects." />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
            All Courses
          </h1>
          <p className="text-slate-400 mt-2">Find your perfect revision or theory course.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 glass-panel p-2 rounded-xl">
          <div className="flex items-center gap-2 px-3 text-slate-300">
            <Filter className="w-4 h-4" /> <span className="text-sm font-medium">Filter</span>
          </div>
          
          <select 
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            className="bg-slate-800/50 border border-white/10 rounded-lg text-sm px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
          >
            <option value="">All Teachers</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <select 
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="bg-slate-800/50 border border-white/10 rounded-lg text-sm px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
          >
            <option value="">All Units</option>
            {uniqueUnits.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {filteredCourses.map(course => (
             <CourseCard key={course.id} course={course} />
           ))}
         </div>
      ) : (
        <div className="py-20 text-center text-slate-400 glass-panel rounded-2xl">
          No courses found matching your criteria.
        </div>
      )}
    </div>
  );
}
