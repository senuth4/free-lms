import SEO from '../components/SEO';
import { useAppData } from '../context/AppDataContext';
import CourseCard from '../components/CourseCard';
import { Bookmark, LayoutDashboard, User, PlayCircle, FileQuestion, HelpCircle, CheckCircle, Sun, Bell, Clock, Brain, MoreVertical, LayoutTemplate, Shield, Video, Calendar, ExternalLink, Trophy } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function SavedCourses() {
  const { courses, bookmarkedCourses, user, quizzes, quizAttempts, ads, liveSessions, dailyChallenges, resetPassword, teachers, subjects, isSuperAdmin, isEditor } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const validTabs = ['quizzes', 'recent', 'daily', 'analysis', 'settings', 'lessons'];
  const defaultTab = validTabs.includes(searchParams.get('tab') as string) ? searchParams.get('tab') as any : 'lessons';
  const [activeTab, setActiveTab] = useState<'lessons' | 'quizzes' | 'recent' | 'daily' | 'analysis' | 'settings'>(defaultTab);
  
  useEffect(() => {
    if (searchParams.get('tab') && validTabs.includes(searchParams.get('tab') as string)) {
      setActiveTab(searchParams.get('tab') as any);
    }
  }, [searchParams]);

  const handleTabChange = (tab: 'lessons' | 'quizzes' | 'recent' | 'daily' | 'analysis' | 'settings') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const navigate = useNavigate();

  const savedCoursesList = courses.filter(course => bookmarkedCourses.includes(course.id));
  const myQuizAttempts = user ? quizAttempts.filter(a => a.userId === user.uid) : [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Student';
  const studentId = user?.uid?.slice(0, 7).toUpperCase() || 'GUEST';

  return (
    <div className="space-y-6 pb-20">
      <SEO title="Student Dashboard" description="View your dashboard" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white tracking-tight">
          <Sun className="w-6 h-6 text-yellow-400" />
          {getGreeting()} {firstName} !
        </h1>
        <div className="flex items-center gap-3">
          {(isSuperAdmin || isEditor) && (
            <Link to="/admin/dashboard" className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 border border-purple-500/30 transition-colors shadow-lg shadow-purple-500/10">
              <Shield className="w-3.5 h-3.5" /> Back to Admin
            </Link>
          )}
          <div className="bg-blue-500/20 text-blue-400 text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 border border-blue-500/30 shadow-lg shadow-blue-500/10">
            <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard : Student
          </div>
        </div>
      </div>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Student Info */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-stone-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-stone-500/20 transition-colors"></div>
          <div className="relative z-10">
            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">Student ID</div>
            <div className="text-xl font-bold text-white tracking-tight">{studentId}</div>
          </div>
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-white/10 relative z-10 shadow-lg">
            {user?.photoURL ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-gray-400" />}
          </div>
        </div>

        {/* Card 2: AI Hub */}
        <Link to="/ai-hub" className="bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-2xl p-5 flex items-center justify-between group hover:shadow-lg hover:shadow-purple-500/20 transition-all cursor-pointer relative overflow-hidden border border-purple-500/50">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/30 transition-colors"></div>
           <div className="relative z-10">
            <div className="text-[10px] text-white/80 font-bold uppercase tracking-widest mb-1 shadow-sm">Ask Me Anything...</div>
            <div className="text-xl font-bold text-white flex items-center gap-2 drop-shadow-md tracking-tight">AI Hub <span className="text-[10px] bg-white/30 px-2 py-0.5 rounded-full uppercase tracking-widest text-white backdrop-blur-md">Pro</span></div>
          </div>
          <Brain className="w-8 h-8 text-white opacity-90 group-hover:scale-110 group-hover:rotate-6 transition-transform relative z-10 drop-shadow-lg" />
        </Link>
        
        {/* Card 3: Quiz Stats */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between hover:bg-emerald-500/20 transition-colors group">
          <div>
            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">Total Quizzes</div>
            <div className="text-xl font-bold text-emerald-100 tracking-tight">{myQuizAttempts.length} <span className="text-xs font-medium text-emerald-400/60 uppercase tracking-wider ml-1">Attempts</span></div>
          </div>
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/10">
             <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        {/* Card 4: Saved Resources */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-center justify-between hover:bg-amber-500/20 transition-colors group">
          <div>
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-1">Saved Materials</div>
            <div className="text-xl font-bold text-amber-100 tracking-tight">{savedCoursesList.length} <span className="text-xs font-medium text-amber-400/60 uppercase tracking-wider ml-1">Items</span></div>
          </div>
          <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/10">
             <Bookmark className="w-6 h-6 text-amber-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Main Dashboard Content (Saved Materials) */}
        <div className="lg:col-span-2 space-y-6">
           
           <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 min-h-[500px]">
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                 <h3 className="text-blue-400 font-bold text-base flex items-center gap-2 tracking-tight">
                   <LayoutTemplate className="w-5 h-5" /> Saved & Activity Overview
                 </h3>
                 <MoreVertical className="w-5 h-5 text-slate-600" />
              </div>

              <div className="flex space-x-2 border-b border-white/10 pb-6 overflow-x-auto mb-8">
                 <button 
                   onClick={() => handleTabChange('lessons')}
                   className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'lessons' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10' : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
                 >
                   Stored Lessons ({savedCoursesList.length})
                 </button>
                 <button 
                   onClick={() => handleTabChange('quizzes')}
                   className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'quizzes' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-lg shadow-purple-500/10' : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
                 >
                   <FileQuestion className="w-4 h-4" /> Practice Quizzes ({quizzes.length})
                 </button>
                 <button 
                   onClick={() => handleTabChange('recent')}
                   className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'recent' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10' : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
                 >
                   <PlayCircle className="w-4 h-4" /> Recent Courses
                 </button>
                 <button 
                   onClick={() => handleTabChange('daily')}
                   className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'daily' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10' : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
                 >
                   <Sun className="w-4 h-4" /> Daily Challenges
                 </button>
                 <button 
                   onClick={() => handleTabChange('analysis')}
                   className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'analysis' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10' : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
                 >
                   <Brain className="w-4 h-4" /> Analysis
                 </button>
                 <button 
                   onClick={() => handleTabChange('settings')}
                   className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === 'settings' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-lg shadow-rose-500/10' : 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5'}`}
                 >
                   <User className="w-4 h-4" /> Profile & Settings
                 </button>
              </div>

              {activeTab === 'lessons' && (
                <>
                  {!user && (
                    <div className="mb-6 text-sm text-yellow-400 bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20 font-medium tracking-wide">
                      Notice: You are viewing guest state. Sign in to sync your saved items across devices.
                    </div>
                  )}
                  {savedCoursesList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {savedCoursesList.map(course => (
                         // Using CourseCard directly without scaling to look native
                         <CourseCard key={course.id} course={course} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                       <LayoutTemplate className="w-20 h-20 text-slate-800 mx-auto mb-6" />
                       <h2 className="text-xl font-bold text-slate-300 tracking-tight">No Materials to display...</h2>
                       <p className="text-slate-500 text-sm mt-3 max-w-sm mx-auto leading-relaxed">Use the browse section to find and save materials you want to access quickly later.</p>
                       <Link to="/courses" className="mt-8 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl text-sm transition-all border border-white/10 tracking-wide">Browse Catalog</Link>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'quizzes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizzes.map(quiz => {
                     const bestAttempt = myQuizAttempts.find(a => a.quizId === quiz.id);
                     return (
                       <div key={quiz.id} className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 hover:border-purple-500/30 hover:bg-slate-900/80 transition-all flex flex-col h-full group">
                         <div className="flex justify-between items-start mb-3">
                             <div className="flex items-center gap-2 text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-1 rounded-md border border-purple-500/20 uppercase tracking-widest">
                                {quiz.medium}
                             </div>
                             {quiz.timeLimitMins && (
                               <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                                  <Clock className="w-3.5 h-3.5 text-slate-500"/> {quiz.timeLimitMins} m
                               </div>
                             )}
                         </div>
                         <h3 className="text-base font-bold text-white mb-3 line-clamp-2 leading-snug tracking-tight">{quiz.title}</h3>
                         
                         <div className="flex gap-3 mt-auto pt-5 border-t border-white/5">
                             <button onClick={() => navigate(`/quiz/${quiz.id}`)} className="flex-1 bg-white/5 hover:bg-purple-500 group-hover:border-purple-500 text-slate-300 hover:text-white py-2 rounded-xl text-sm font-semibold transition-all border border-white/10 tracking-wide">
                                {bestAttempt ? 'Practice Again' : 'Attempt Now'}
                             </button>
                         </div>
                         {bestAttempt && (
                            <div className="mt-3 text-[10px] text-emerald-400 font-bold tracking-widest uppercase flex justify-center items-center gap-1 bg-emerald-500/10 py-1.5 rounded-lg border border-emerald-500/10">
                               <CheckCircle className="w-3 h-3" /> Completed
                            </div>
                         )}
                       </div>
                     );
                  })}
                  {quizzes.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-500 text-sm font-medium">
                       No quizzes available right now.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'recent' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {courses.slice(0, 3).map(course => (
                     <CourseCard key={course.id} course={course} />
                  ))}
                  {courses.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-500 text-sm font-medium">
                       No recent courses found.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'daily' && (
                <div className="space-y-6">
                  {dailyChallenges
                     .sort((a, b) => new Date(b.activeDate).getTime() - new Date(a.activeDate).getTime())
                     .map(challenge => {
                       const quiz = quizzes.find(q => q.id === challenge.quizId);
                       if (!quiz) return null;
                       
                       const attempt = myQuizAttempts.find(a => a.quizId === quiz.id && a.isDailyChallenge);
                       
                       const isActiveToday = challenge.activeDate === new Date().toISOString().split('T')[0];
                       const isPast = new Date(challenge.activeDate) < new Date(new Date().toISOString().split('T')[0]);
                       
                       return (
                         <div key={challenge.id} className="bg-slate-900/40 p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                           {isActiveToday && (
                             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                           )}
                           
                           <div className="flex justify-between items-start mb-4 relative z-10">
                              <div>
                                <div className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 uppercase tracking-widest inline-flex items-center gap-1.5 mb-2">
                                   <Calendar className="w-3 h-3" /> {challenge.activeDate} {isActiveToday && '(Today)'}
                                </div>
                                <h3 className="text-xl font-bold text-white leading-snug">{quiz.title}</h3>
                              </div>
                              <div className="bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-amber-500/30">
                                 <Trophy className="w-4 h-4" /> {challenge.points} pts
                              </div>
                           </div>
                           
                           <div className="flex gap-4 items-center mt-6 relative z-10">
                              {attempt ? (
                                <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
                                   <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                      <CheckCircle className="w-5 h-5" /> Completed
                                   </div>
                                   <div className="text-right">
                                      <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">Score</div>
                                      <div className="text-lg font-bold text-white">{attempt.score || 0}%</div>
                                   </div>
                                </div>
                              ) : isActiveToday ? (
                                <button 
                                  onClick={() => navigate(`/quiz/${quiz.id}?daily=true`)}
                                  className="w-full bg-amber-500 hover:bg-amber-600 text-black py-3 rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(245,185,66,0.3)] hover:shadow-[0_0_30px_rgba(245,185,66,0.5)]"
                                >
                                  Attempt Challenge Now
                                </button>
                              ) : isPast ? (
                                <div className="w-full bg-white/5 py-3 rounded-xl text-sm font-bold text-slate-400 text-center border border-white/5">
                                  Challenge Expired
                                </div>
                              ) : (
                                <div className="w-full bg-white/5 py-3 rounded-xl text-sm font-bold text-slate-400 text-center border border-white/5 flex items-center justify-center gap-2">
                                  <Clock className="w-4 h-4" /> Unlocks on {challenge.activeDate}
                                </div>
                              )}
                           </div>
                         </div>
                       );
                  })}
                  {dailyChallenges.length === 0 && (
                    <div className="py-20 text-center text-slate-500 text-sm font-medium">
                       No daily challenges currently available.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analysis' && (
                <div className="space-y-6">
                  <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                     <h3 className="text-xl font-bold text-white mb-6">Subject Performance</h3>
                     {subjects.map(subject => {
                        // Find quizzes for this subject
                        const subjectQuizzes = quizzes.filter(q => q.subjectId === subject.id);
                        if (subjectQuizzes.length === 0) return null;
                        
                        // Find attempts for these quizzes
                        const subjectAttempts = myQuizAttempts.filter(a => subjectQuizzes.some(q => q.id === a.quizId));
                        
                        let totalPercentage = 0;
                        if (subjectAttempts.length > 0) {
                           totalPercentage = Math.round(subjectAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / subjectAttempts.length);
                        }

                        return (
                          <div key={subject.id} className="mb-6 last:mb-0">
                             <div className="flex justify-between items-end mb-2">
                               <div className="font-semibold text-slate-300">{subject.name}</div>
                               <div className="text-sm font-bold text-cyan-400">{subjectAttempts.length > 0 ? `${totalPercentage}% Avg` : 'No data'}</div>
                             </div>
                             <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                                <div className="bg-cyan-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${totalPercentage}%` }}></div>
                             </div>
                             <div className="text-xs text-slate-500 mt-2">{subjectAttempts.length} Quizzes Attempted</div>
                          </div>
                        )
                     })}
                     {myQuizAttempts.length === 0 && (
                        <div className="text-slate-500 text-sm py-10 text-center">Take some quizzes to see your analysis here.</div>
                     )}
                  </div>

                  <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                     <h3 className="text-xl font-bold text-white mb-6">Past Quiz Marks</h3>
                     <div className="space-y-3">
                       {myQuizAttempts.filter(a => a.isDailyChallenge).sort((a,b) => b.startedAt - a.startedAt).map(attempt => {
                         const quiz = quizzes.find(q => q.id === attempt.quizId);
                         return (
                           <div key={attempt.id} className="flex justify-between items-center p-4 bg-black/20 rounded-xl border border-white/5">
                             <div>
                               <div className="text-white font-semibold">{quiz?.title || 'Unknown Quiz'}</div>
                               <div className="text-xs text-slate-400 mt-1">
                                 <span className="text-amber-400 font-bold">Daily Challenge</span> • {new Date(attempt.startedAt).toLocaleDateString()}
                                 {attempt.pointsAwarded !== undefined && (
                                    <span className="ml-2 text-emerald-400">+{attempt.pointsAwarded} pts</span>
                                 )}
                               </div>
                             </div>
                             <div className="text-xl font-bold text-white bg-white/10 px-3 py-1 rounded-lg">
                               {attempt.score || 0}%
                             </div>
                           </div>
                         )
                       })}
                       {myQuizAttempts.filter(a => a.isDailyChallenge).length === 0 && (
                         <div className="text-slate-500 text-sm text-center">No past marks found for Daily Challenges.</div>
                       )}
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="max-w-xl space-y-6">
                   <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                      <h4 className="text-white font-bold mb-4">Profile Settings</h4>
                      <div className="space-y-4">
                         <div>
                           <label className="block text-xs font-semibold text-slate-400 mb-1">Display Name</label>
                           <input type="text" value={user?.displayName || ''} disabled className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
                         </div>
                         <div>
                           <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                           <input type="text" value={user?.email || ''} disabled className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white" />
                         </div>
                      </div>
                   </div>

                   <div className="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                      <h4 className="text-white font-bold mb-4">Security</h4>
                      <p className="text-sm text-slate-400 mb-6">Need to update your password? We will send a secure reset link to your registered email address.</p>
                      
                      <button 
                        onClick={() => {
                          if (user?.email) {
                            resetPassword(user.email).then(() => {
                              alert('Password reset link sent to your email.');
                            }).catch(e => {
                              alert('Failed to send reset link.');
                            });
                          }
                        }}
                        className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                      >
                         <Shield className="w-4 h-4" /> Send Password Reset Email
                      </button>
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* Right Column: Notices */}
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 h-fit max-h-[800px] overflow-y-auto">
           <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
             <h3 className="text-orange-400 font-bold text-base flex items-center gap-2 tracking-tight">
                <Bell className="w-5 h-5" /> Notices
             </h3>
             <MoreVertical className="w-5 h-5 text-slate-600" />
           </div>

           <div className="space-y-5">
              {ads.length > 0 ? ads.map(ad => (
                 <div key={ad.id} className="pb-5 border-b border-white/5 last:border-0 last:pb-0 group">
                    <h4 className="text-blue-400 font-bold text-sm mb-1.5 leading-snug group-hover:text-blue-300 transition-colors tracking-tight flex items-start gap-2">
                      <span className="text-blue-500/50 mt-0.5">➔</span> {ad.title || 'Platform Notice'}
                    </h4>
                    {ad.linkUrl && (
                      <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-500 hover:text-blue-400 hover:underline font-medium inline-block mb-3 ml-5">
                        Click here for more details.
                      </a>
                    )}
                    {ad.createdAt && (
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 ml-5">
                          {ad.createdAt?.toDate ? ad.createdAt.toDate().toLocaleDateString() : new Date(ad.createdAt).toLocaleDateString()}
                       </p>
                    )}
                    {ad.imageUrl && (
                      <div className="w-full h-32 rounded-xl overflow-hidden border border-white/10 mt-3 group-hover:border-white/20 transition-colors shadow-lg">
                        <img src={ad.imageUrl} alt="notice" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                 </div>
              )) : (
                <div className="text-center py-10 text-slate-500 text-sm font-medium bg-white/5 rounded-2xl border border-white/5">
                   No recent notices.
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
}

