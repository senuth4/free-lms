import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, PlayCircle, Users } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import CourseCard from '../components/CourseCard';
import TeacherCard from '../components/TeacherCard';

export default function Home() {
  const { ads, teachers, courses } = useAppData();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (ads.length > 0) {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [ads.length]);

  if (ads.length === 0) return <div></div>;

  const currentAd = ads[currentAdIndex];
  const adTeacher = teachers.find(t => t.id === currentAd.teacherId);

  const prevAd = () => setCurrentAdIndex(prev => (prev - 1 + ads.length) % ads.length);
  const nextAd = () => setCurrentAdIndex(prev => (prev + 1) % ads.length);


  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section - Ad Slider */}
      <section className="relative rounded-3xl overflow-hidden glass-panel h-[500px]">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 opacity-40"
          style={{ backgroundImage: `url(${currentAd.imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        
        <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
          <div className="max-w-3xl space-y-4">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded-full">
              Latest Announcement
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              {currentAd.title}
            </h1>
            <p className="text-lg text-slate-300">
              {currentAd.description}
            </p>
          </div>

          {/* Teacher Profile auto-appended under Ad */}
          {adTeacher && (
            <div className="mt-8 flex items-center gap-4 glass-card p-4 rounded-2xl w-fit">
              <img 
                src={adTeacher.imageUrl} 
                alt={adTeacher.name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/50"
              />
              <div>
                <h3 className="font-semibold text-lg text-white">By {adTeacher.name}</h3>
                <Link to={`/teacher/${adTeacher.id}`} className="text-sm text-cyan-400 hover:text-cyan-300">
                  View Profile & Courses
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Carousel Controls */}
        <button onClick={prevAd} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass-card hover:bg-white/10 text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={nextAd} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass-card hover:bg-white/10 text-white">
          <ChevronRight className="w-6 h-6" />
        </button>
      </section>

      {/* Featured Courses */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <PlayCircle className="text-cyan-400" /> 
            Popular Courses
          </h2>
          <Link to="/courses" className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">View All</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.slice(0, 4).map(course => (
             <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* Popular Teachers */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-purple-400" />
            Popular Teachers
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teachers.map(teacher => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      </section>

    </div>
  );
}
