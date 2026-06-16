import SEO from '../components/SEO';
import { useAppData } from '../context/AppDataContext';
import CourseCard from '../components/CourseCard';
import { Bookmark } from 'lucide-react';

export default function SavedCourses() {
  const { courses, bookmarkedCourses } = useAppData();

  const savedCoursesList = courses.filter(course => bookmarkedCourses.includes(course.id));

  return (
    <div className="space-y-8 pb-16">
      <SEO title="Saved Courses" description="View your bookmarked courses" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center gap-3">
             <Bookmark className="w-8 h-8 text-cyan-400" /> Saved Courses
          </h1>
          <p className="text-slate-400 mt-2">Access your favorite courses and lessons anytime.</p>
        </div>
      </div>

      {savedCoursesList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedCoursesList.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 glass-panel">
           <Bookmark className="w-16 h-16 mx-auto mb-4 text-slate-500 opacity-50" />
           <h2 className="text-xl font-bold text-slate-300">No saved courses yet</h2>
           <p className="text-slate-400 mt-2">Courses you save will appear here for easy access.</p>
        </div>
      )}
    </div>
  );
}
