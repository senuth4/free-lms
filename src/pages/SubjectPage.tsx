import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import CourseCard from '../components/CourseCard';
import TeacherCard from '../components/TeacherCard';
import SEO from '../components/SEO';

export default function SubjectPage() {
  const { subjects, subcategories, courses, teachers } = useAppData();
  const { subjectId } = useParams();
  const subject = subjects.find(s => s.id === subjectId);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  if (!subject) {
    return <div className="text-center py-20">Subject not found</div>;
  }

  const subjectCourses = courses.filter(c => c.subjectId === subject.id);
  const subjectTeachers = teachers.filter(t => t.subjectId === subject.id);

  const displayedCategories = activeCategoryId 
    ? subcategories.filter(c => c.id === activeCategoryId)
    : subcategories;

  return (
    <div className="space-y-12 pb-16">
      <SEO 
        title={subject.name}
        description={`Explore all courses and teachers for ${subject.name}.`}
        image={subject.imageUrl}
      />
      <div className="relative rounded-3xl overflow-hidden glass-panel h-[300px] flex items-center">
         <div 
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url(${subject.imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070a] to-transparent" />
          <div className="relative z-10 p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {subject.name}
            </h1>
            <p className="text-gray-300 max-w-2xl">
              Master your {subject.name} skills with our comprehensive video lessons and PDF resources provided by expert teachers.
            </p>
          </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2 custom-scrollbar">
        <button
          onClick={() => setActiveCategoryId(null)}
          className={`nav-pill whitespace-nowrap ${activeCategoryId === null ? 'nav-pill-active' : 'text-gray-400 hover:text-white'}`}
        >
          All Categories
        </button>
        {subcategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategoryId(cat.id)}
            className={`nav-pill whitespace-nowrap ${activeCategoryId === cat.id ? 'nav-pill-active' : 'text-gray-400 hover:text-white'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {displayedCategories.map(cat => {
        const catCourses = subjectCourses.filter(c => c.subcategoryId === cat.id);
        if (catCourses.length === 0) return null;
        return (
          <section key={cat.id}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-gradient-to-r from-[#00a2ff] to-purple-500 rounded-full" />
              {cat.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {catCourses.map(course => (
                 <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        );
      })}

      {subjectTeachers.length > 0 && (
         <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 mt-8">
             <span className="w-8 h-1 bg-gradient-to-r from-[#00a2ff] to-purple-500 rounded-full" />
             {subject.name} Teachers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjectTeachers.map(teacher => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
         </section>
      )}
    </div>
  );
}
