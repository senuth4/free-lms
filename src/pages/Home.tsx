import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, PlayCircle, Users, BookOpen, Star, ArrowRight, Bot, Sparkles, Activity, Video, Calendar, Clock, ExternalLink, Trophy } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import CourseCard from '../components/CourseCard';
import TeacherCard from '../components/TeacherCard';
import SEO from '../components/SEO';

export default function Home() {
  const { ads, teachers, courses, subjects, user, liveSessions, usersList } = useAppData();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (ads.length > 0) {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [ads.length]);

  const currentAd = ads.length > 0 ? ads[currentAdIndex] : null;
  const adTeacher = currentAd ? teachers.find(t => t.id === currentAd.teacherId) : null;

  const prevAd = () => setCurrentAdIndex(prev => (prev - 1 + ads.length) % ads.length);
  const nextAd = () => setCurrentAdIndex(prev => (prev + 1) % ads.length);

  return (
    <div className="space-y-24 pb-20">
      <SEO title="Platform - Master Your A/L Exams" />
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-cyan-400 mb-8 font-medium">
          <Star className="w-4 h-4 fill-cyan-400" /> Sri Lanka's Premium A/L Learning Platform
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 max-w-4xl leading-tight mb-6 tracking-tight">
          Master Your Exams with <br className="hidden md:block"/> Top Educators
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Access high-quality video lessons, comprehensive resource books, and expert guidance to achieve your best possible grades in Advanced Level examinations.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link to="/courses" className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold text-lg transition-all shadow-[0_0_20px_rgba(0,162,255,0.4)] flex items-center gap-2">
            Explore Courses <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/resource-search" className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg transition-all flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" /> Resource Books
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-10 border-t border-white/10 w-full max-w-4xl mx-auto">
          <div className="space-y-1">
            <h3 className="text-3xl font-bold text-white">{courses.length}+</h3>
            <p className="text-sm text-slate-400 font-medium">Video Lessons</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold text-white">{teachers.length}</h3>
            <p className="text-sm text-slate-400 font-medium">Expert Teachers</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold text-white">{subjects.length}</h3>
            <p className="text-sm text-slate-400 font-medium">Core Subjects</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-bold text-white">10k+</h3>
            <p className="text-sm text-slate-400 font-medium">Active Students</p>
          </div>
        </div>
      </section>

      {/* Live & Upcoming Sessions */}
      {liveSessions && liveSessions.length > 0 && (
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-600 mb-2 flex items-center gap-2">
                 <Video className="w-8 h-8 text-red-500" /> Free Live Classes
              </h2>
              <p className="text-slate-400">Join our expert teachers for scheduled free live streams on YouTube.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveSessions.filter(s => s.status !== 'ended').map(session => {
               const teacher = teachers.find(t => t.id === session.teacherId);
               const subject = subjects.find(s => s.id === session.subjectId);
               const isLive = session.status === 'live';
               
               // Extract YouTube ID
               let videoId = session.youtubeUrl;
               if (videoId) {
                 const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                 const match = videoId.match(regExp);
                 videoId = (match && match[2].length === 11) ? match[2] : videoId;
               }
               
                return (
                  <a key={session.id} href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer" className={`block glass-panel rounded-2xl border ${isLive ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] bg-red-950/20' : 'border-white/10 hover:border-white/20'} overflow-hidden group transition-all`}>
                     
                     {/* Embedded Thumbnail or Video */}
                     <div className="w-full aspect-video bg-black relative">
                          <img 
                              src={session.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`} 
                              alt={session.title}
                              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                          {isLive && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                <PlayCircle className="w-16 h-16 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] group-hover:scale-110 transition-transform" />
                            </div>
                          )}
                         <div className="absolute top-4 left-4 flex gap-2">
                           <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLive ? 'bg-red-500 text-white animate-pulse shadow-lg' : 'bg-black/60 backdrop-blur-md text-white border border-white/20'}`}>
                              {isLive ? <><Video className="w-3.5 h-3.5" /> Live Now</> : <><Calendar className="w-3.5 h-3.5" /> Upcoming</>}
                           </div>
                           <div className="text-xs font-semibold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                              {subject?.name || 'Subject'}
                           </div>
                         </div>
                     </div>

                     <div className="p-6 relative">
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-cyan-400 transition-colors">{session.title}</h3>
                        
                        {session.description && (
                          <p className="text-sm text-slate-400 line-clamp-2 mb-4">{session.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between mt-6 mb-6">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-white/10 overflow-hidden shrink-0">
                                  {teacher?.imageUrl ? <img src={teacher.imageUrl} alt={teacher.name} className="w-full h-full object-cover" /> : null}
                               </div>
                               <div>
                                  <p className="text-sm font-semibold text-white">{teacher?.name || 'Teacher'}</p>
                               </div>
                             </div>
                             {session.scheduledAt && !isLive && (
                                <div className="text-right">
                                  <p className="text-xs text-white bg-white/10 px-2 py-1 rounded border border-white/10 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> 
                                    {session.scheduledAt?.toDate ? session.scheduledAt.toDate().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : new Date(session.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                  </p>
                                </div>
                             )}
                        </div>
                        
                        <div className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-transform ${isLive ? 'bg-red-600 group-hover:bg-red-700 text-white shadow-lg' : 'bg-white/10 group-hover:bg-white/20 text-white border border-white/10'}`}>
                           {isLive ? 'Watch on YouTube' : 'Set Reminder on YouTube'} <ExternalLink className="w-4 h-4" />
                        </div>
                     </div>
                  </a>
                );
            })}
          </div>
        </section>
      )}

      {/* AI Hub & Quizzes Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Hub CTA Section */}
        <section className="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-10 border border-blue-500/30 bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-900 shadow-[0_0_40px_rgba(0,162,255,0.15)] flex flex-col items-center gap-6 group text-center isolate h-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none transition-opacity duration-700 group-hover:opacity-10">
            <Bot className="w-80 h-80 text-blue-500" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center flex-grow space-y-4">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-xs font-bold tracking-wider uppercase border border-blue-500/20">
              <Sparkles className="w-3 h-3" /> New Feature
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">AI Study Hub</h2>
            <p className="text-base text-slate-300 max-w-md leading-relaxed">
              Stuck on a problem or trying to find a specific page in your Resource Book? Let our customized AI assistants guide you.
            </p>
          </div>
          
          <div className="relative z-10 w-full flex flex-col items-center gap-3">
            <Link 
              to="/ai-hub" 
              className="w-full sm:w-auto px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,162,255,0.4)] hover:scale-105"
            >
              Launch AI Hub <ArrowRight className="w-5 h-5" />
            </Link>
            {!user && <span className="text-sm text-slate-400 font-medium">*Requires free account</span>}
          </div>
        </section>

        {/* Practice Quizzes CTA Section */}
        <section className="relative overflow-hidden rounded-3xl glass-panel p-8 md:p-10 border border-purple-500/30 bg-gradient-to-br from-purple-900/40 via-slate-900 to-slate-900 shadow-[0_0_40px_rgba(168,85,247,0.15)] flex flex-col items-center gap-6 group text-center isolate h-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none transition-opacity duration-700 group-hover:opacity-10">
            <BookOpen className="w-80 h-80 text-purple-500" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center flex-grow space-y-4">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-xs font-bold tracking-wider uppercase border border-purple-500/20">
              <Activity className="w-3 h-3" /> Interactive
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Practice Quizzes</h2>
            <p className="text-base text-slate-300 max-w-md leading-relaxed">
              Test your knowledge with timed or untimed practice quizzes. Answer questions based on specific subjects, mixed topics, or OCR extracted texts.
            </p>
          </div>
          
          <div className="relative z-10 w-full flex flex-col items-center gap-3">
            <Link 
              to="/saved?tab=quizzes" 
              className="w-full sm:w-auto px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105"
            >
              Start Practicing <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>

      {/* Leaderboard Section */}
      <section className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-br from-slate-900 to-black">
         <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
         <div className="flex flex-col items-center mb-8 relative z-10 text-center">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 flex items-center justify-center rounded-2xl mb-4 shadow-[0_0_30px_rgba(245,185,66,0.3)]">
               <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Top Students</h2>
            <p className="text-slate-400 mt-2">Ranked by points earned from Daily Challenges</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
            {usersList
               .filter(u => u.points && u.points > 0)
               .sort((a, b) => b.points - a.points)
               .slice(0, 10)
               .map((student, index) => (
                  <div key={student.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center text-center hover:bg-white/10 transition-colors relative overflow-hidden group">
                     {index < 3 && (
                        <div className={`absolute top-0 left-0 w-full h-1 ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-slate-300' : 'bg-amber-600'}`}></div>
                     )}
                     <div className="text-2xl font-black text-white/20 absolute -right-2 -bottom-4 group-hover:text-white/30 transition-colors text-[80px] leading-none z-0">
                        {index + 1}
                     </div>
                     <div className="w-14 h-14 bg-slate-800 rounded-full border-2 border-white/10 flex items-center justify-center mb-3 relative z-10 shadow-lg overflow-hidden">
                         <span className="font-bold text-lg text-slate-300">{student.name?.charAt(0) || 'S'}</span>
                     </div>
                     <div className="font-bold text-white relative z-10 line-clamp-1">{student.name || 'Student'}</div>
                     <div className="text-amber-400 font-bold text-sm flex items-center gap-1.5 mt-1 relative z-10">
                        <Star className="w-3.5 h-3.5 fill-current" /> {student.points} pts
                     </div>
                  </div>
               ))
            }
            {usersList.filter(u => u.points && u.points > 0).length === 0 && (
               <div className="col-span-full text-center text-slate-500 py-10">Leaderboard is currently empty. Start taking daily challenges!</div>
            )}
         </div>
      </section>

      {/* Announcements / Slider */}
      {currentAd && (
        <section className="relative rounded-3xl overflow-hidden glass-panel h-[400px] md:h-[500px] group border border-white/10 shadow-2xl">
          <div 
             className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-100 group-hover:scale-105"
             style={{ backgroundImage: `url(${currentAd.imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
          
          <div className="relative h-full flex flex-col justify-end p-6 md:p-12">
            <div className="max-w-3xl space-y-4">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#00a2ff] bg-[#00a2ff]/10 border border-[#00a2ff]/20 rounded-full inline-block mb-2">
                Featured Update
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg leading-tight">
                {currentAd.title}
              </h2>
              <p className="text-base md:text-lg text-slate-300 max-w-2xl">
                {currentAd.description}
              </p>
            </div>

            {/* Teacher Profile auto-appended under Ad */}
            {adTeacher && (
              <div className="mt-6 flex items-center gap-4 bg-black/40 backdrop-blur-md p-3 pr-6 rounded-2xl w-fit border border-white/10">
                <img 
                  src={adTeacher.imageUrl || undefined} 
                  alt={adTeacher.name} 
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-purple-500/50"
                />
                <div>
                  <h3 className="font-semibold text-white">By {adTeacher.name}</h3>
                  <Link to={`/teacher/${adTeacher.id}`} className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">
                    View Profile
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Carousel Controls */}
          {ads.length > 1 && (
            <>
              <button onClick={prevAd} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 text-white transition-colors opacity-0 group-hover:opacity-100 border border-white/10">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextAd} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 backdrop-blur hover:bg-black/60 text-white transition-colors opacity-0 group-hover:opacity-100 border border-white/10">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </section>
      )}

      {/* Featured Courses */}
      <section>
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
              <PlayCircle className="text-cyan-400 w-8 h-8" /> 
              Popular Courses
            </h2>
            <p className="text-slate-400 mt-2">Highly rated lessons by our top educators</p>
          </div>
          <Link to="/courses" className="text-sm text-white bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-lg font-medium transition-colors">
            View All Courses
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.slice(0, 4).map(course => (
             <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      {/* Popular Teachers */}
      <section>
        <div className="flex flex-col md:flex-row items-baseline justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
              <Users className="text-purple-400 w-8 h-8" />
              Meet Our Educators
            </h2>
            <p className="text-slate-400 mt-2">Learn from the best in the country</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teachers.map(teacher => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-20 pb-10 border-t border-white/10 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="text-2xl font-black tracking-tighter text-white inline-block">
              Platform<span className="text-[#00a2ff]">.</span>
            </Link>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              Empowering students with premium educational content. Learn from anywhere, anytime, with the best resources available.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/courses" className="hover:text-cyan-400 transition-colors">All Courses</Link></li>
              <li><Link to="/resource-search" className="hover:text-cyan-400 transition-colors">Resource Books</Link></li>
              <li><Link to="/saved" className="hover:text-cyan-400 transition-colors">Saved Courses</Link></li>
              <li><Link to="/admin" className="hover:text-cyan-400 transition-colors">Admin Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Subjects</h4>
            <ul className="space-y-2 text-slate-400">
              {subjects.slice(0, 5).map(s => (
                <li key={s.id}><Link to={`/subject/${s.id}`} className="hover:text-cyan-400 transition-colors">{s.name}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="text-center text-slate-500 pt-8 border-t border-white/5 text-sm">
          <p>© {new Date().getFullYear()} Learning Platform. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
