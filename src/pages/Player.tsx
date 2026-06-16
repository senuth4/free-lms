import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlayCircle, FileText, ChevronLeft, PenTool } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
// @ts-ignore
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import SEO from '../components/SEO';

export default function Player() {
  const { courses, teachers, subjects } = useAppData();
  const { courseId } = useParams();
  const course = courses.find(c => c.id === courseId);

  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (courseId) {
      const savedNotes = localStorage.getItem(`course_notes_${courseId}`);
      if (savedNotes) {
        setNotes(savedNotes);
      }
    }
  }, [courseId]);

  const handleNotesChange = (content: string) => {
    setNotes(content);
    if (courseId) {
      localStorage.setItem(`course_notes_${courseId}`, content);
    }
  };

  if (!course) {
    return <div className="text-center py-20 text-slate-400">Course not found</div>;
  }

  const teacher = teachers.find(t => t.id === course.teacherId);
  const subject = subjects.find(s => s.id === course.subjectId);
  
  const videoLinks = course.links?.filter((l: any) => l.type === 'video') || [];
  const pdfLinks = course.links?.filter((l: any) => l.type === 'pdf') || [];

  const [activeVideo, setActiveVideo] = useState(videoLinks.length > 0 ? videoLinks[0] : null);

  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com/watch?v=')) {
        return url.replace('youtube.com/watch?v=', 'youtube.com/embed/').split('&')[0];
      }
      if (url.includes('youtu.be/')) {
        return url.replace('youtu.be/', 'youtube.com/embed/');
      }
      return url;
    } catch {
      return url;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <SEO 
        title={course.title}
        description={`Course: ${course.title} by ${teacher?.name}`}
        image={course.thumbnailUrl}
      />
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#00a2ff] transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area (Video Player & Info) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Video Player Box */}
          <div className="glass-panel rounded-2xl overflow-hidden aspect-video relative">
            {activeVideo ? (
              <iframe 
                src={getEmbedUrl(activeVideo.url)} 
                title={activeVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full absolute inset-0"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-400 gap-4">
                <PlayCircle className="w-16 h-16 opacity-50" />
                <p>No video content available for this course.</p>
              </div>
            )}
          </div>

          <div className="glass-panel rounded-2xl p-6 md:p-8">
            <div className="flex flex-wrap gap-2 mb-4">
               <span className="px-3 py-1 text-xs font-semibold text-purple-400 bg-purple-400/10 rounded-full border border-purple-400/20">
                 {subject?.name}
               </span>
               <span className="px-3 py-1 text-xs font-semibold text-cyan-400 bg-cyan-400/10 rounded-full border border-cyan-400/20">
                 {course.unit}
               </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 w-full">{course.title}</h1>
            
            <div className="flex items-center justify-between border-t border-white/5 pt-6">
               <Link to={`/teacher/${teacher?.id}`} className="flex items-center gap-4 group">
                 <img src={teacher?.imageUrl} alt={teacher?.name} className="w-12 h-12 rounded-full border border-white/10 group-hover:border-cyan-400 transition-colors" />
                 <div>
                   <p className="font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">{teacher?.name}</p>
                   <p className="text-xs text-slate-400">View Profile</p>
                 </div>
               </Link>
               
               <div className="text-right">
                 <p className="text-lg font-bold text-white">{(course.views / 1000).toFixed(1)}k</p>
                 <p className="text-xs text-slate-400">Students Reached</p>
               </div>
            </div>
          </div>

          {/* Personal Notes Editor */}
          <div className="glass-panel rounded-2xl p-6 md:p-8">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
               <PenTool className="w-5 h-5 text-[#00a2ff]" /> Personal Notes
            </h3>
            <div className="text-slate-300">
              <ReactQuill 
                theme="snow" 
                value={notes} 
                onChange={handleNotesChange} 
                placeholder="Take notes while studying... (Auto-saved locally)"
                className="quill-dark"
              />
            </div>
          </div>
        </div>

        {/* Sidebar (Playlist & PDFs) */}
        <div className="space-y-6">
           
           {/* Video Playlist */}
           <div className="glass-panel rounded-2xl p-6">
             <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
               <PlayCircle className="w-5 h-5 text-cyan-400" /> Lesson Playlist
             </h3>
             <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
               {videoLinks.length > 0 ? (
                 videoLinks.map((video: any, idx: number) => (
                   <button 
                     key={idx}
                     onClick={() => setActiveVideo(video)}
                     className={`w-full text-left p-3 rounded-xl text-sm transition-all flex gap-3 ${
                       activeVideo?.url === video.url 
                        ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-50 font-medium'
                        : 'hover:bg-white/5 text-slate-300 border border-transparent'
                     }`}
                   >
                     <span className="text-slate-500 font-mono text-xs mt-0.5">{String(idx + 1).padStart(2, '0')}</span>
                     <span className="line-clamp-2">{video.title}</span>
                   </button>
                 ))
               ) : (
                 <p className="text-sm text-slate-400 py-4 text-center">No video lessons found.</p>
               )}
             </div>
           </div>

           {/* PDF Resources */}
           <div className="glass-panel rounded-2xl p-6">
             <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
               <FileText className="w-5 h-5 text-purple-400" /> Tutes & PDFs
             </h3>
             <div className="space-y-2">
               {pdfLinks.length > 0 ? (
                 pdfLinks.map((pdf: any, idx: number) => (
                   <a 
                     key={idx}
                     href={pdf.url}
                     target="_blank"
                     rel="noreferrer"
                     className="w-full text-left p-3 rounded-xl text-sm hover:bg-white/5 text-slate-300 border border-transparent transition-all flex items-center gap-3 group"
                   >
                     <div className="p-2 rounded bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                       <FileText className="w-4 h-4" />
                     </div>
                     <span className="line-clamp-1">{pdf.title}</span>
                   </a>
                 ))
               ) : (
                 <p className="text-sm text-slate-400 py-4 text-center">No PDF resources found.</p>
               )}
             </div>
           </div>

        </div>
      </div>
    </div>
  );
}
