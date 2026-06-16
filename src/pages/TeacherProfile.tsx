import { useParams } from 'react-router-dom';
import { Youtube, Facebook, MessageCircle } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import CourseCard from '../components/CourseCard';
import SEO from '../components/SEO';

export default function TeacherProfile() {
  const { teachers, courses, ads, subjects } = useAppData();
  const { teacherId } = useParams();
  const teacher = teachers.find(t => t.id === teacherId);

  if (!teacher) {
    return <div className="text-center py-20 text-slate-400">Teacher not found</div>;
  }

  const subject = subjects.find(s => s.id === teacher.subjectId);
  const teacherCourses = courses.filter(c => c.teacherId === teacher.id);
  const teacherAds = ads.filter(a => a.teacherId === teacher.id);

  return (
    <div className="space-y-12 pb-16">
      <SEO 
        title={teacher.name}
        description={`Learn from ${teacher.name}. ${teacher.description?.slice(0, 150) || ''}`}
        image={teacher.imageUrl}
        type="profile"
      />
      {/* Profile Header */}
      <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-[#00a2ff]/40 to-purple-900/40" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 mt-12 md:mt-16">
            <img 
              src={teacher.imageUrl || undefined} 
              alt={teacher.name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-slate-900 shadow-2xl"
            />
            
            <div className="text-center md:text-left flex-grow">
               <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{teacher.name}</h1>
               <p className="text-purple-400 font-medium mb-4">{subject?.name} Specialist</p>
               <p className="text-slate-300 max-w-2xl text-sm md:text-base leading-relaxed">
                 {teacher.description}
               </p>

               <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
                 {teacher.socials.youtube && (
                    <a href={teacher.socials.youtube} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 glass-card rounded-full text-sm font-medium hover:text-red-400 transition-colors">
                      <Youtube className="w-4 h-4" /> YouTube
                    </a>
                  )}
                  {teacher.socials.facebook && (
                    <a href={teacher.socials.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 glass-card rounded-full text-sm font-medium hover:text-blue-400 transition-colors">
                      <Facebook className="w-4 h-4" /> Facebook
                    </a>
                  )}
                  {teacher.socials.telegram && (
                    <a href={teacher.socials.telegram} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 glass-card rounded-full text-sm font-medium hover:text-[#00a2ff] transition-colors">
                      <MessageCircle className="w-4 h-4" /> Telegram
                    </a>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* Ads Section */}
      {teacherAds.length > 0 && (
         <section className="space-y-6">
           <h2 className="text-2xl font-bold">Announcements & Classes</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teacherAds.map(ad => (
                <div key={ad.id} className="relative rounded-2xl overflow-hidden glass-card h-64 group">
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                    style={{ backgroundImage: `url(${ad.imageUrl})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-full p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00a2ff] transition-colors">{ad.title}</h3>
                    <p className="text-sm text-slate-300 line-clamp-2">{ad.description}</p>
                  </div>
                </div>
              ))}
           </div>
         </section>
      )}

      {/* Teacher Courses Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Courses by {teacher.name}</h2>
        </div>
        
        {teacherCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teacherCourses.map(course => (
               <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No courses available at the moment.</p>
        )}
      </section>

    </div>
  );
}
