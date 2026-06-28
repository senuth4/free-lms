import { useState } from 'react';
import { Filter } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import CourseCard from '../components/CourseCard';
import SEO from '../components/SEO';

export default function Courses() {
  const { courses, subjects, subcategories } = useAppData();
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedCourseType, setSelectedCourseType] = useState<string>('');
  const [selectedMedium, setSelectedMedium] = useState<string>('');

  const uniqueUnits = Array.from(new Set(courses.map(c => c.unit).filter(Boolean)));

  const filteredCourses = courses.filter(c => {
    let match = true;
    if (selectedSubject && c.subjectId !== selectedSubject) match = false;
    if (selectedUnit && c.unit !== selectedUnit) match = false;
    if (selectedCourseType && c.subcategoryId !== selectedCourseType) match = false;
    if (selectedMedium && c.medium !== selectedMedium) match = false;
    return match;
  });

  return (
    <div className="space-y-8 pb-16">
      <SEO title="All Lessons" description="Browse all available lessons across different subjects." />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
            All Lessons
          </h1>
          <p className="text-slate-400 mt-2">Find your perfect lessons filtered by subject, unit, and medium.</p>
        </div>

        <div className="w-full glass-panel p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-4 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 text-cyan-400 shrink-0">
            <Filter className="w-5 h-5" /> <span className="font-semibold">Filter:</span>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl text-sm px-4 py-2.5 text-slate-200 outline-none focus:border-cyan-500 hover:bg-white/10 transition-colors shrink-0 appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23cbd5e1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_auto] bg-no-repeat bg-[position:right_12px_center]"
            >
              <option value="" className="bg-slate-900">All Subjects</option>
              {subjects.map(t => (
                <option key={t.id} value={t.id} className="bg-slate-900">{t.name}</option>
              ))}
            </select>
            
            <select 
              value={selectedCourseType}
              onChange={(e) => setSelectedCourseType(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl text-sm px-4 py-2.5 text-slate-200 outline-none focus:border-cyan-500 hover:bg-white/10 transition-colors shrink-0 appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23cbd5e1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_auto] bg-no-repeat bg-[position:right_12px_center]"
            >
               <option value="" className="bg-slate-900">All Types</option>
               {subcategories.map(s => (
                  <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>
               ))}
            </select>

            <select 
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl text-sm px-4 py-2.5 text-slate-200 outline-none focus:border-cyan-500 hover:bg-white/10 transition-colors shrink-0 appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23cbd5e1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_auto] bg-no-repeat bg-[position:right_12px_center]"
            >
              <option value="" className="bg-slate-900">All Units</option>
              {uniqueUnits.map(u => (
                <option key={u} value={u} className="bg-slate-900">{u}</option>
              ))}
            </select>

            <select 
               value={selectedMedium}
               onChange={(e) => setSelectedMedium(e.target.value)}
               className="bg-white/5 border border-white/10 rounded-xl text-sm px-4 py-2.5 text-slate-200 outline-none focus:border-cyan-500 hover:bg-white/10 transition-colors shrink-0 appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23cbd5e1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_auto] bg-no-repeat bg-[position:right_12px_center]"
            >
               <option value="" className="bg-slate-900">All Mediums</option>
               <option value="Sinhala" className="bg-slate-900">Sinhala Medium</option>
               <option value="English" className="bg-slate-900">English Medium</option>
            </select>
          </div>
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
          No lessons found matching your criteria.
        </div>
      )}
    </div>
  );
}
