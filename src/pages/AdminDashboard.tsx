import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Activity, Users, User, Clock, BookOpen, Layers, LogOut, Shield, Eye, Video, FileText, Upload, FileSearch, Loader2, PlayCircle, Briefcase, FileQuestion, Sun } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { Course, Teacher, Subcategory, Ad, Resource, Subject, LiveSession } from '../types';
import AdminQuizzes from './AdminQuizzes';
import AdminDailyChallenges from './AdminDailyChallenges';
import AdminUsers from './AdminUsers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { 
    courses, teachers, subjects, subcategories, ads, editors, resources, liveSessions, isSuperAdmin, isEditor,
    addTeacher, deleteTeacher, updateTeacher,
    addCourse, deleteCourse, updateCourse,
    addLiveSession, updateLiveSession, deleteLiveSession,
    addSubcategory, deleteSubcategory,
    addSubject, deleteSubject, updateSubject,
    addEditor, deleteEditor,
    addResource, deleteResource,
    addAd, deleteAd, logoutAdmin
  } = useAppData();

  const overviewData = useMemo(() => {
    const totalViews = courses.reduce((acc, c) => acc + (c.views || 0), 0);
    const viewsBySubject = subjects.map(s => {
      const subjCourses = courses.filter(c => c.subjectId === s.id);
      return {
        name: s.name,
        views: subjCourses.reduce((acc, c) => acc + (c.views || 0), 0),
        courses: subjCourses.length,
      };
    });

    const viewsByTeacher = teachers.map(t => {
      const teacherCourses = courses.filter(c => c.teacherId === t.id);
      return {
        name: t.name,
        views: teacherCourses.reduce((acc, c) => acc + (c.views || 0), 0),
        courses: teacherCourses.length,
      };
    }).sort((a, b) => b.views - a.views).slice(0, 5);

    return { totalViews, viewsBySubject, viewsByTeacher };
  }, [courses, subjects, teachers]);

  const COLORS = ['#00a2ff', '#a855f7', '#22c55e', '#f59e0b', '#ec4899'];

  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'teachers' | 'courses' | 'live_sessions' | 'categories' | 'quizzes' | 'daily_challenges' | 'ads' | 'editors' | 'resources' | 'users'>('courses');
  
  useEffect(() => {
    if (isSuperAdmin) {
      setActiveTab('overview');
    } else {
      setActiveTab('courses');
    }
  }, [isSuperAdmin]);

  // Forms state
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showAdForm, setShowAdForm] = useState(false);
  const [showEditorForm, setShowEditorForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showLiveSessionForm, setShowLiveSessionForm] = useState(false);

  // Form Fields
  const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({ socials: {} });
  const [newCourse, setNewCourse] = useState<Partial<Course> & { courseLinks?: { title: string, url: string, type: 'video' | 'pdf' }[] }>({ courseLinks: [] });
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [newSubject, setNewSubject] = useState<{ id?: string, name: string, imageUrl: string }>({ name: '', imageUrl: '' });
  const [newAd, setNewAd] = useState<Partial<Ad>>({});
  const [newLiveSession, setNewLiveSession] = useState<Partial<LiveSession>>({ status: 'upcoming' });
  const [newEditorEmail, setNewEditorEmail] = useState('');

  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [isProcessingResource, setIsProcessingResource] = useState(false);
  const [ocrError, setOcrError] = useState('');
  const [ocrProgress, setOcrProgress] = useState('');
  const [newResources, setNewResources] = useState<Partial<Resource>[]>([]);
  const [resourcesSubject, setResourcesSubject] = useState('Biology');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveTeacher = () => {
    if (newTeacher.name) {
      if (newTeacher.id) {
        updateTeacher({
          ...newTeacher,
          socials: {
            youtube: newTeacher.socials?.youtube || undefined,
            facebook: newTeacher.socials?.facebook || undefined,
            telegram: newTeacher.socials?.telegram || undefined
          }
        } as Teacher);
      } else {
        addTeacher({
          id: `t-${Date.now()}`,
          name: newTeacher.name,
          subjectId: newTeacher.subjectId || '',
          imageUrl: newTeacher.imageUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=300',
          description: newTeacher.description || '',
          socials: {
            youtube: newTeacher.socials?.youtube || undefined,
            facebook: newTeacher.socials?.facebook || undefined,
            telegram: newTeacher.socials?.telegram || undefined
          }
        });
      }
      setShowTeacherForm(false);
      setNewTeacher({ socials: {} });
    }
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setNewTeacher({ ...teacher });
    setShowTeacherForm(true);
  };

  const handleAddCourseLink = () => {
    setNewCourse(prev => ({
      ...prev,
      courseLinks: [...(prev.courseLinks || []), { id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, title: 'New Resource', url: '', type: 'video' }]
    }));
  };

  const handleUpdateCourseLink = (index: number, key: string, value: string) => {
    setNewCourse(prev => {
      const links = [...(prev.courseLinks || [])];
      links[index] = { ...links[index], [key]: value } as any;
      return { ...prev, courseLinks: links };
    });
  };

  const handleRemoveCourseLink = (index: number) => {
    setNewCourse(prev => ({
      ...prev,
      courseLinks: (prev.courseLinks || []).filter((_, i) => i !== index)
    }));
  };

  const handleSaveCourse = () => {
    if (newCourse.title && newCourse.subjectId && newCourse.teacherId && newCourse.subcategoryId && newCourse.unit) {
      if (newCourse.id) {
        updateCourse({
          ...newCourse,
          medium: newCourse.medium || 'Sinhala',
          links: newCourse.courseLinks || []
        } as Course);
      } else {
        addCourse({
          id: `c-${Date.now()}`,
          title: newCourse.title,
          subjectId: newCourse.subjectId || '',
          teacherId: newCourse.teacherId || '',
          subcategoryId: newCourse.subcategoryId || '',
          unit: newCourse.unit || 'General',
          medium: newCourse.medium || 'Sinhala',
          thumbnailUrl: newCourse.thumbnailUrl || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=800',
          links: newCourse.courseLinks as any || [],
          views: 0
        });
      }
      setShowCourseForm(false);
      setNewCourse({ courseLinks: [] });
    } else {
      alert("Please fill all required fields (Title, Subject, Teacher, Category, Unit)");
    }
  };

  const handleEditCourse = (course: Course) => {
    setNewCourse({ ...course, courseLinks: course.links || [] });
    setShowCourseForm(true);
  };

  const handleAddCategory = () => {
    if (newCategory.name) {
      addSubcategory({
        id: `cat-${Date.now()}`,
        name: newCategory.name
      });
      setShowCategoryForm(false);
      setNewCategory({ name: '' });
    }
  };

  const handleSaveLiveSession = async () => {
    if (newLiveSession.title && newLiveSession.youtubeUrl) {
      if (newLiveSession.id) {
         try {
           await updateLiveSession({ ...newLiveSession } as LiveSession);
           setShowLiveSessionForm(false);
           setNewLiveSession({ status: 'upcoming' });
         } catch (e) {
           alert("Failed to update stream: " + e);
         }
      } else {
         try {
           await addLiveSession({
             ...newLiveSession,
             id: `ls-${Date.now()}`,
             scheduledAt: newLiveSession.scheduledAt ? new Date(newLiveSession.scheduledAt).getTime() : undefined,
           } as LiveSession);
           setShowLiveSessionForm(false);
           setNewLiveSession({ status: 'upcoming' });
         } catch (e) {
           alert("Failed to post stream: " + e);
         }
      }
    } else {
      alert("Please provide title and youtube URL.");
    }
  };

  const handleAddSubject = () => {
    if (newSubject.name) {
      if (newSubject.id) {
         updateSubject({
            id: newSubject.id,
            name: newSubject.name,
            imageUrl: newSubject.imageUrl
         });
      } else {
         addSubject({
           id: `sub-${Date.now()}`,
           name: newSubject.name,
           imageUrl: newSubject.imageUrl
         });
      }
      setShowSubjectForm(false);
      setNewSubject({ name: '', imageUrl: '' });
    }
  };

  const handleEditSubject = (subject: Subject) => {
     setNewSubject({ id: subject.id, name: subject.name, imageUrl: subject.imageUrl || '' });
     setShowSubjectForm(true);
  };

  const handleAddEditor = () => {
    if (newEditorEmail) {
      addEditor(newEditorEmail.trim());
      
      const loginUrl = window.location.origin + '/admin';
      const subject = encodeURIComponent('Invitation to Editor Dashboard');
      const body = encodeURIComponent(`Hello,\n\nYou have been invited as an Editor to the platform.\n\nPlease log in using this Google account (${newEditorEmail}) at the following link:\n${loginUrl}\n\nBest regards,\nAdmin Team`);
      window.open(`mailto:${newEditorEmail.trim()}?subject=${subject}&body=${body}`, '_blank');
      
      setShowEditorForm(false);
      setNewEditorEmail('');
    }
  };

  const handleAddAd = () => {
    if (newAd.teacherId && newAd.imageUrl) {
      addAd({
        id: `ad-${Date.now()}`,
        title: newAd.title || 'Special Announcement',
        teacherId: newAd.teacherId,
        imageUrl: newAd.imageUrl,
        description: newAd.description || ''
      });
      setShowAdForm(false);
      setNewAd({});
    }
  };

  const loadPdfJs = () => {
    return new Promise<any>((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(pdfjsLib);
      };
      script.onerror = () => reject(new Error("Failed to load PDF processing library from CDN"));
      document.head.appendChild(script);
    });
  };

  const handleResourceFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResourceFile(file);
    setIsProcessingResource(true);
    setOcrError('');
    setOcrProgress('Initializing document processor...');
    setNewResources([]);
    
    try {
      if (file.type === 'application/pdf') {
        const pdfjs = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        setOcrProgress('Loading PDF pages...');
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;
        
        const accumulated: any[] = [];
        
        for (let i = 1; i <= totalPages; i++) {
          setOcrProgress(`Rendering page ${i} of ${totalPages}...`);
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) throw new Error("Could not create canvas context");
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          const base64ImageWithHeader = canvas.toDataURL('image/jpeg', 0.85);
          const base64Data = base64ImageWithHeader.split(',')[1];
          
          setOcrProgress(`[Rate Limit: Pausing for 4s...] Extracting page ${i} of ${totalPages} using OCR AI...`);
          if (i > 1) {
            await new Promise(r => setTimeout(r, 4000));
          }
          setOcrProgress(`Extracting page ${i} of ${totalPages} using OCR AI...`);

          const response = await fetch('/api/ocr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageParams: {
                data: base64Data,
                mimeType: 'image/jpeg'
              }
            })
          });
          
          let data;
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
          } else {
            const rawText = await response.text();
            throw new Error(`Server returned non-JSON response (${response.status}): ${rawText.substring(0, 150)}...`);
          }
          
          if (!response.ok) throw new Error(data.error || `Failed on page ${i}`);
          
          let rawResult = data.result;
          if (typeof rawResult === 'string') {
            rawResult = rawResult.replace(/```json/gi, '').replace(/```/g, '').trim();
          }
          let parsedData: any = { resources: [] };
          try {
            parsedData = JSON.parse(rawResult);
          } catch (parseError) {
            console.error("Failed to parse JSON result:", rawResult);
            // We will attempt to salvage using dirty JSON parsing (e.g. if it got truncated missing `]}`)
            if (rawResult) {
               try {
                   parsedData = JSON.parse(rawResult + ']}');
               } catch(e2) {
                   try {
                       parsedData = JSON.parse(rawResult + '"}]}');
                   } catch(e3) {
                       setOcrError(`Warning: Page ${i} failed to process correctly due to output size limits. Skipping this page.`);
                   }
               }
            }
          }
          
          const extractedResources = parsedData.resources || [];
          if (Array.isArray(extractedResources)) {
            extractedResources.forEach((res: any) => {
              accumulated.push({
                subject: resourcesSubject,
                unit: res.unit || 'Unit 1',
                topic: res.topic || '',
                subtopic: res.subtopic || '',
                page: res.page || String(i),
                textContent: res.text_content || '',
                searchTags: res.search_tags || ''
              });
            });
          }
        }
        
        if (accumulated.length === 0) {
           throw new Error("No text content could be extracted from the PDF pages.");
        }
        setNewResources(accumulated);
        setOcrProgress('OCR processing completed successfully!');
        setIsProcessingResource(false);
      } else {
        // Plain Image upload (PNG/JPEG)
        setOcrProgress('Processing image OCR...');
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64Data = String(reader.result);
          try {
            const response = await fetch('/api/ocr', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageParams: {
                    data: base64Data.split(',')[1],
                    mimeType: file.type
                }
              })
            });
            
            let data;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
              data = await response.json();
            } else {
              const rawText = await response.text();
              throw new Error(`Server returned non-JSON response (${response.status}): ${rawText.substring(0, 150)}...`);
            }
            
            if (!response.ok) throw new Error(data.error);
            
            let rawResult = data.result;
            if (typeof rawResult === 'string') {
                rawResult = rawResult.replace(/```json/gi, '').replace(/```/g, '').trim();
            }
            let parsedData: any = { resources: [] };
            try {
               parsedData = JSON.parse(rawResult);
            } catch(e) {
               console.error("JSON Parse Error: ", rawResult);
               if (rawResult) {
                 try {
                     parsedData = JSON.parse(rawResult + ']}');
                 } catch(e2) {
                     try {
                         parsedData = JSON.parse(rawResult + '"}]}');
                     } catch(e3) {
                         throw new Error("Failed to parse image OCR response");
                     }
                 }
               } else {
                 throw new Error("Failed to parse image OCR response");
               }
            }

            const extractedResources = parsedData.resources || [];
            if (!Array.isArray(extractedResources)) {
                throw new Error("Invalid output format from AI");
            }

            const mappedResources = extractedResources.map((res: any) => ({
               subject: resourcesSubject,
               unit: res.unit || 'Unit 1',
               topic: res.topic || '',
               subtopic: res.subtopic || '',
               page: res.page || '1',
               textContent: res.text_content || '',
               searchTags: res.search_tags || ''
            }));
            
            setNewResources(mappedResources);
            setOcrProgress('Image OCR processed successfully!');
          } catch (err: any) {
            setOcrError(err.message || "Failed to process document");
          } finally {
            setIsProcessingResource(false);
          }
        };
        reader.onerror = () => {
           setOcrError("Failed to read file");
           setIsProcessingResource(false);
        };
      }
    } catch (err: any) {
      setIsProcessingResource(false);
      setOcrError(err.message || "An error occurred");
    }
  };

  const handleSaveResource = () => {
     let hasError = false;
     newResources.forEach(res => {
         if (!res.subject || !res.unit || !res.textContent) {
             hasError = true;
         }
     });

     if (hasError) {
        setOcrError("Subject, Unit, and Text Content are required for all extracted sections.");
        return;
     }

     if (newResources.length > 0) {
        newResources.forEach((res, index) => {
            addResource({
                id: `res-${Date.now()}-${index}`,
                subject: res.subject || resourcesSubject,
                unit: res.unit!,
                topic: res.topic || undefined,
                subtopic: res.subtopic || undefined,
                page: res.page || undefined,
                textContent: res.textContent!,
                searchTags: res.searchTags || undefined
            });
        });
        setShowResourceForm(false);
        setNewResources([]);
        setResourceFile(null);
     }
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00a2ff] to-purple-400">
          {isSuperAdmin ? 'Admin Dashboard' : 'Editor Dashboard'}
        </h1>
        <div className="flex items-center gap-3">
          <Link 
            to="/saved"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-colors border border-blue-500/30"
          >
            <User className="w-4 h-4" />
            View Student Dashboard
          </Link>
          <button 
            onClick={logoutAdmin}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-colors border border-white/10"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-white/10 pb-4 overflow-x-auto custom-scrollbar">
        {isSuperAdmin && (
          <button
            className={`nav-pill whitespace-nowrap ${activeTab === 'overview' ? 'nav-pill-active' : 'text-gray-400 hover:text-white'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
        )}
        <button
          className={`nav-pill whitespace-nowrap ${activeTab === 'subjects' ? 'nav-pill-active' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('subjects')}
        >
          Subjects
        </button>
        <button
          className={`nav-pill whitespace-nowrap ${activeTab === 'teachers' ? 'nav-pill-active' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('teachers')}
        >
          Manage Teachers
        </button>
        <button
          className={`nav-pill whitespace-nowrap ${activeTab === 'courses' ? 'nav-pill-active' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('courses')}
        >
          Manage Courses
        </button>
        <button
          className={`nav-pill whitespace-nowrap ${activeTab === 'categories' ? 'nav-pill-active' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('categories')}
        >
          Course Types
        </button>
        <button
          className={`nav-pill whitespace-nowrap flex items-center gap-2 ${activeTab === 'live_sessions' ? 'nav-pill-active text-red-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('live_sessions')}
        >
          <Video className="w-4 h-4" /> Live streams
        </button>
        <button
          className={`nav-pill whitespace-nowrap flex items-center gap-2 ${activeTab === 'quizzes' ? 'nav-pill-active text-purple-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('quizzes')}
        >
          <FileQuestion className="w-4 h-4" /> Manage Quizzes
        </button>
        <button
          className={`nav-pill whitespace-nowrap flex items-center gap-2 ${activeTab === 'daily_challenges' ? 'nav-pill-active text-amber-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('daily_challenges')}
        >
          <Sun className="w-4 h-4" /> Daily Challenges
        </button>
        <button
          className={`nav-pill whitespace-nowrap flex items-center gap-2 ${activeTab === 'resources' ? 'nav-pill-active text-emerald-400' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('resources')}
        >
          <FileSearch className="w-4 h-4" /> AI Resources (OCR)
        </button>
        {isSuperAdmin && (
          <>
            <button
              className={`nav-pill whitespace-nowrap ${activeTab === 'users' ? 'nav-pill-active' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('users')}
            >
              <Users className="w-4 h-4 inline mr-1"/> Students
            </button>
            <button
              className={`nav-pill whitespace-nowrap ${activeTab === 'ads' ? 'nav-pill-active' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('ads')}
            >
              Manage Ads
            </button>
            <button
              className={`nav-pill whitespace-nowrap ${activeTab === 'editors' ? 'nav-pill-active' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('editors')}
            >
              Manage Editors
            </button>
          </>
        )}
      </div>

      {isSuperAdmin && activeTab === 'overview' && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-16 h-16 text-[#00a2ff]" />
              </div>
              <p className="text-gray-400 font-medium text-sm">Total Teachers</p>
              <h3 className="text-3xl font-bold text-white">{teachers.length}</h3>
            </div>
            
            <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BookOpen className="w-16 h-16 text-purple-400" />
              </div>
              <p className="text-gray-400 font-medium text-sm">Total Subjects</p>
              <h3 className="text-3xl font-bold text-white">{subjects.length}</h3>
            </div>

            <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Video className="w-16 h-16 text-blue-400" />
              </div>
              <p className="text-gray-400 font-medium text-sm">Total Courses</p>
              <h3 className="text-3xl font-bold text-white">{courses.length}</h3>
            </div>

            <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Eye className="w-16 h-16 text-green-400" />
              </div>
              <p className="text-gray-400 font-medium text-sm">Total Watch Views</p>
              <h3 className="text-3xl font-bold text-white">
                {(overviewData.totalViews / 1000).toFixed(1)}k
              </h3>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="text-lg font-bold mb-6">Subject Popularity (Views)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overviewData.viewsBySubject}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={50}
                      fill="#8884d8"
                      dataKey="views"
                      paddingAngle={5}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {overviewData.viewsBySubject.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number) => [`${value} Views`, 'Total']}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="text-lg font-bold mb-6">Top Teachers by Views</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overviewData.viewsByTeacher}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fff" strokeOpacity={0.1} />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <RechartsTooltip 
                      formatter={(value: number) => [`${value} Views`, 'Performance']}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#00a2ff' }}
                    />
                    <Bar dataKey="views" fill="#00a2ff" radius={[4, 4, 0, 0]}>
                      {overviewData.viewsByTeacher.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="glass-panel p-6 rounded-2xl border border-white/10 lg:col-span-2">
              <h3 className="text-lg font-bold mb-6">Courses per Subject</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overviewData.viewsBySubject}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fff" strokeOpacity={0.1} />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" allowDecimals={false} />
                    <RechartsTooltip 
                      formatter={(value: number) => [`${value} Courses`, 'Total']}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#a855f7' }}
                    />
                    <Bar dataKey="courses" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'subjects' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">Subjects</h2>
            <button 
              className="bg-[#00a2ff] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              onClick={() => setShowSubjectForm(!showSubjectForm)}
            >
              + Add Subject
            </button>
          </div>

          {showSubjectForm && (
            <div className="glass-panel p-6 space-y-4">
              <h3 className="font-bold text-lg border-b border-white/10 pb-2">New Subject</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Subject Name (e.g. Mathematics)" 
                  value={newSubject.name}
                  onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff]" 
                />
                <input 
                  type="text" 
                  placeholder="Image URL (Optional)" 
                  value={newSubject.imageUrl}
                  onChange={e => setNewSubject({ ...newSubject, imageUrl: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff]" 
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowSubjectForm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleAddSubject} className="bg-[#00a2ff] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">Save Subject</button>
              </div>
            </div>
          )}

          <div className="glass-panel overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-4 font-semibold text-gray-300">Subject Name</th>
                  <th className="p-4 font-semibold text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map(s => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4 text-white font-medium">{s.name}</td>
                    <td className="p-4 flex justify-end gap-3 text-right">
                      <button onClick={() => handleEditSubject(s)} className="text-blue-400 hover:text-blue-300 text-xs font-medium">Edit</button>
                      <button onClick={() => deleteSubject(s.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'categories' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2"><Layers className="w-5 h-5 text-[#00a2ff]" /> Course Types</h2>
            <button 
              className="bg-[#00a2ff] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              onClick={() => setShowCategoryForm(!showCategoryForm)}
            >
              + Add Type
            </button>
          </div>

          {showCategoryForm && (
            <div className="glass-panel p-6 space-y-4">
              <h3 className="font-bold text-lg border-b border-white/10 pb-2">New Course Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Name (e.g. Theory, Revision)" 
                  value={newCategory.name}
                  onChange={e => setNewCategory({ name: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff] md:col-span-2" 
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowCategoryForm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleAddCategory} className="bg-[#00a2ff] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">Save Type</button>
              </div>
            </div>
          )}

          <div className="glass-panel overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-4 font-semibold text-gray-300">Category / Type Name</th>
                  <th className="p-4 font-semibold text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subcategories.map(c => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4 text-white font-medium">{c.name}</td>
                    <td className="p-4 text-right">
                       <button onClick={() => deleteSubcategory(c.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'quizzes' && (
         <AdminQuizzes />
      )}
      
      {activeTab === 'daily_challenges' && (
         <AdminDailyChallenges />
      )}

      {isSuperAdmin && activeTab === 'users' && (
         <AdminUsers />
      )}

      {isSuperAdmin && activeTab === 'editors' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-purple-400" /> Manage Editors</h2>
            <button 
              className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
              onClick={() => setShowEditorForm(!showEditorForm)}
            >
              + Add Editor
            </button>
          </div>

          {showEditorForm && (
            <div className="glass-panel p-6 space-y-4">
              <h3 className="font-bold text-lg border-b border-white/10 pb-2">Grant Editor Access</h3>
              <p className="text-sm text-gray-400 mb-2">Editors can manage subjects, teachers, courses, and course types. They cannot manage ads or other settings.</p>
              <div className="grid grid-cols-1 gap-4">
                <input 
                  type="email" 
                  placeholder="Google Email Address" 
                  value={newEditorEmail}
                  onChange={e => setNewEditorEmail(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff]" 
                />
              </div>
              <div className="bg-[#00a2ff]/10 border border-[#00a2ff]/20 p-4 rounded-lg mt-4">
                <p className="text-sm text-[#00a2ff] font-medium mb-2">Invite Link</p>
                <p className="text-xs text-gray-300 mb-2">After granting access, share this link with the editor. They can sign in using the Google account you authorized.</p>
                <div className="flex items-center gap-2">
                  <input readOnly value={`${window.location.origin}/admin`} className="bg-slate-900 border border-white/10 rounded p-2 text-white text-xs flex-1 outline-none" />
                  <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/admin`)} className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded text-xs transition-colors">Copy</button>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowEditorForm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleAddEditor} className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors">Grant Access</button>
              </div>
            </div>
          )}

          <div className="glass-panel overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-4 font-semibold text-gray-300">Editor Email</th>
                  <th className="p-4 font-semibold text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {editors.map(e => (
                  <tr key={e.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4 text-white font-medium">{e.id}</td>
                    <td className="p-4 text-right">
                       <button onClick={() => deleteEditor(e.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">Revoke Access</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'teachers' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Teachers</h2>
            <button 
              className="bg-[#00a2ff] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              onClick={() => setShowTeacherForm(!showTeacherForm)}
            >
              + Add Teacher
            </button>
          </div>

          {showTeacherForm && (
            <div className="glass-panel p-6 space-y-4">
              <h3 className="font-bold text-lg border-b border-white/10 pb-2">{newTeacher.id ? 'Edit Teacher' : 'New Teacher'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Name" 
                  value={newTeacher.name || ''}
                  onChange={e => setNewTeacher(prev => ({...prev, name: e.target.value}))}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff]" 
                />
                <select 
                  value={newTeacher.subjectId || ''}
                  onChange={e => setNewTeacher(prev => ({...prev, subjectId: e.target.value}))}
                  className="bg-slate-900 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff]"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input 
                  type="text" 
                  placeholder="Image URL" 
                  value={newTeacher.imageUrl || ''}
                  onChange={e => setNewTeacher(prev => ({...prev, imageUrl: e.target.value}))}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff] md:col-span-2" 
                />
                <textarea 
                  placeholder="Description" 
                  value={newTeacher.description || ''}
                  onChange={e => setNewTeacher(prev => ({...prev, description: e.target.value}))}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff] md:col-span-2 rows-3"
                />
                <input 
                  type="text" 
                  placeholder="YouTube Profile Link (Optional)" 
                  value={newTeacher.socials?.youtube || ''}
                  onChange={e => setNewTeacher(prev => ({...prev, socials: { ...prev.socials, youtube: e.target.value }}))}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff]" 
                />
                <input 
                  type="text" 
                  placeholder="Facebook Profile Link (Optional)" 
                  value={newTeacher.socials?.facebook || ''}
                  onChange={e => setNewTeacher(prev => ({...prev, socials: { ...prev.socials, facebook: e.target.value }}))}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff]" 
                />
                <input 
                  type="text" 
                  placeholder="WhatsApp Link (Optional)" 
                  value={newTeacher.socials?.telegram || ''}
                  onChange={e => setNewTeacher(prev => ({...prev, socials: { ...prev.socials, telegram: e.target.value }}))}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff]" 
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowTeacherForm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleSaveTeacher} className="bg-[#00a2ff] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">Save Teacher</button>
              </div>
            </div>
          )}

          <div className="glass-panel overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-4 font-semibold text-gray-300">Name</th>
                  <th className="p-4 font-semibold text-gray-300">Subject</th>
                  <th className="p-4 font-semibold text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(t => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4 text-white flex items-center gap-3">
                      <img src={t.imageUrl || undefined} className="w-8 h-8 rounded-full object-cover" alt="" />
                      {t.name}
                    </td>
                    <td className="p-4 text-gray-400">{subjects.find(s => s.id === t.subjectId)?.name}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleEditTeacher(t)} className="text-[#00a2ff] hover:text-blue-400 text-xs font-medium mr-4">Edit</button>
                      <button onClick={() => deleteTeacher(t.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'courses' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Courses & Classes</h2>
            <button 
              className="bg-[#00a2ff] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              onClick={() => setShowCourseForm(!showCourseForm)}
            >
              + Add Course
            </button>
          </div>

          {showCourseForm && (
            <div className="glass-panel p-6 space-y-4">
              <h3 className="font-bold text-lg border-b border-white/10 pb-2">{newCourse.id ? 'Edit Course' : 'New Course'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Course Title" 
                  value={newCourse.title || ''}
                  onChange={e => setNewCourse(prev => ({...prev, title: e.target.value}))}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff] md:col-span-2" 
                />
                <select 
                  value={newCourse.subjectId || ''}
                  onChange={e => setNewCourse(prev => ({...prev, subjectId: e.target.value}))}
                  className="bg-slate-900 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff]"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select 
                  value={newCourse.teacherId || ''}
                  onChange={e => setNewCourse(prev => ({...prev, teacherId: e.target.value}))}
                  className="bg-slate-900 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff]"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select 
                  value={newCourse.subcategoryId || ''}
                  onChange={e => setNewCourse(prev => ({...prev, subcategoryId: e.target.value}))}
                  className="bg-slate-900 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff]"
                >
                  <option value="">Select Category (Course Type)</option>
                  {subcategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input 
                  type="text" 
                  placeholder="Unit (e.g. Mechanics)" 
                  value={newCourse.unit || ''}
                  onChange={e => setNewCourse(prev => ({...prev, unit: e.target.value}))}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff]" 
                />
                <select 
                  value={newCourse.medium || ''}
                  onChange={e => setNewCourse(prev => ({...prev, medium: e.target.value as 'Sinhala' | 'English'}))}
                  className="bg-slate-900 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff]"
                >
                  <option value="">Select Medium</option>
                  <option value="Sinhala">Sinhala</option>
                  <option value="English">English</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Thumbnail URL" 
                  value={newCourse.thumbnailUrl || ''}
                  onChange={e => setNewCourse(prev => ({...prev, thumbnailUrl: e.target.value}))}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff] md:col-span-2" 
                />
              </div>

              {/* Dynamic Links Section */}
              <div className="mt-6 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-300">Course Materials & Links</h4>
                  <button onClick={handleAddCourseLink} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white transition-colors">Add Link</button>
                </div>
                <div className="space-y-3">
                  {(newCourse.courseLinks || []).map((link, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-2 items-start md:items-center bg-white/5 p-3 rounded-lg border border-white/5">
                      <select 
                        value={link.type} 
                        onChange={e => handleUpdateCourseLink(i, 'type', e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded p-2 text-white outline-none focus:border-[#00a2ff] text-sm md:w-32"
                      >
                        <option value="video">Video</option>
                        <option value="pdf">PDF</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="Link Title" 
                        value={link.title}
                        onChange={e => handleUpdateCourseLink(i, 'title', e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded p-2 text-white outline-none focus:border-[#00a2ff] text-sm flex-1 w-full"
                      />
                      <input 
                        type="text" 
                        placeholder="URL" 
                        value={link.url}
                        onChange={e => handleUpdateCourseLink(i, 'url', e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded p-2 text-white outline-none focus:border-[#00a2ff] text-sm flex-1 w-full"
                      />
                      <button onClick={() => handleRemoveCourseLink(i)} className="text-red-400 hover:text-red-300 text-xs font-medium px-2 py-2">Remove</button>
                    </div>
                  ))}
                  {(newCourse.courseLinks || []).length === 0 && (
                    <p className="text-sm text-gray-500 italic">No links added yet. Click 'Add Link' to include videos or PDFs.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setShowCourseForm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleSaveCourse} className="bg-[#00a2ff] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">Save Course</button>
              </div>
            </div>
          )}

          <div className="glass-panel overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-4 font-semibold text-gray-300">Course</th>
                  <th className="p-4 font-semibold text-gray-300">Teacher</th>
                  <th className="p-4 font-semibold text-gray-300">Subject</th>
                  <th className="p-4 font-semibold text-gray-300">Type</th>
                  <th className="p-4 font-semibold text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4 text-white font-medium">{c.title}</td>
                    <td className="p-4 text-gray-400">{teachers.find(t => t.id === c.teacherId)?.name}</td>
                    <td className="p-4 text-gray-400">{subjects.find(s => s.id === c.subjectId)?.name}</td>
                    <td className="p-4 text-purple-400">{subcategories.find(s => s.id === c.subcategoryId)?.name}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleEditCourse(c)} className="text-[#00a2ff] hover:text-blue-400 text-xs font-medium mr-4">Edit</button>
                      {isSuperAdmin && (
                        <button onClick={() => deleteCourse(c.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {isSuperAdmin && activeTab === 'ads' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Manage Hero Ads</h2>
            <button 
              className="bg-[#00a2ff] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              onClick={() => setShowAdForm(!showAdForm)}
            >
              + Add Hero Ad
            </button>
          </div>

          {showAdForm && (
            <div className="glass-panel p-6 space-y-4">
              <h3 className="font-bold text-lg border-b border-white/10 pb-2">New Hero Ad</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Ad Title" 
                  value={newAd.title || ''}
                  onChange={e => setNewAd(prev => ({...prev, title: e.target.value}))}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff] md:col-span-2" 
                />
                <select 
                  value={newAd.teacherId || ''}
                  onChange={e => setNewAd(prev => ({...prev, teacherId: e.target.value}))}
                  className="bg-slate-900 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff]"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <input 
                  type="text" 
                  placeholder="Image URL (Hero Banner Landscape)" 
                  value={newAd.imageUrl || ''}
                  onChange={e => setNewAd(prev => ({...prev, imageUrl: e.target.value}))}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff] md:col-span-2" 
                />
                <textarea 
                  placeholder="Description" 
                  value={newAd.description || ''}
                  onChange={e => setNewAd(prev => ({...prev, description: e.target.value}))}
                  className="bg-white/5 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-[#00a2ff] md:col-span-2 rows-3"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAdForm(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleAddAd} className="bg-[#00a2ff] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">Save Ad</button>
              </div>
            </div>
          )}

          <div className="glass-panel overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-4 font-semibold text-gray-300">Ad Title / Banner</th>
                  <th className="p-4 font-semibold text-gray-300">Target Teacher</th>
                  <th className="p-4 font-semibold text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ads.map(t => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4 text-white flex items-center gap-3">
                      <img src={t.imageUrl || undefined} className="w-16 h-8 rounded object-cover" alt="" />
                      {t.title}
                    </td>
                    <td className="p-4 text-gray-400">{teachers.find(s => s.id === t.teacherId)?.name}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => deleteAd(t.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'resources' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2"><FileSearch className="w-5 h-5 text-emerald-400" /> AI Resources Data</h2>
            <button 
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
              onClick={() => setShowResourceForm(!showResourceForm)}
            >
              + Upload Resource (OCR)
            </button>
          </div>

          {showResourceForm && (
            <div className="glass-panel p-6 space-y-4 border border-emerald-500/20">
              <h3 className="font-bold text-lg border-b border-white/10 pb-2">Upload & Process Resource Document</h3>
              
              <div className="bg-white/5 border border-white/10 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center">
                 <input 
                   type="file" 
                   accept="image/*,application/pdf"
                   onChange={handleResourceFileChange}
                   className="hidden"
                   ref={fileInputRef}
                 />
                 <Upload className="w-10 h-10 text-emerald-400 mb-4" />
                 <h3 className="text-lg font-semibold text-white mb-2">Upload Resource Page</h3>
                 <p className="text-gray-400 text-sm mb-4">Upload an image or PDF of a resource book page to automatically extract the text using AI.</p>
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   disabled={isProcessingResource}
                   className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                 >
                   {isProcessingResource ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing OCR...</> : 'Select File'}
                 </button>
                 {isProcessingResource && ocrProgress && (
                     <div className="mt-4 max-w-md w-full space-y-2 bg-black/45 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center justify-center shadow-lg">
                       <Loader2 className="w-6 h-6 animate-spin text-[#00a2ff]" />
                       <span className="text-sm font-medium text-emerald-400 font-mono text-center animate-pulse">{ocrProgress}</span>
                     </div>
                 )}
                 {resourceFile && !isProcessingResource && (
                     <p className="mt-3 text-sm text-emerald-400 font-medium">Loaded: {resourceFile.name}</p>
                 )}
                 {ocrError && (
                     <p className="mt-3 text-sm text-red-400 font-medium">{ocrError}</p>
                 )}
              </div>

              {newResources.length > 0 && (
                <div className="mt-6 space-y-6">
                    <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-emerald-400">Successfully extracted {newResources.length} sections</h4>
                            <p className="text-xs text-slate-400">Please review the sections below before saving them to the database.</p>
                        </div>
                        <div className="flex items-center gap-4">
                           <div>
                               <label className="text-xs text-gray-400 mr-2">Apply Subject explicitly:</label>
                               <select 
                                 value={resourcesSubject}
                                 onChange={e => {
                                     setResourcesSubject(e.target.value);
                                     setNewResources(prev => prev.map(r => ({...r, subject: e.target.value})));
                                 }}
                                 className="bg-white/5 border border-white/10 rounded p-1.5 text-xs text-white outline-none focus:border-emerald-500"
                               >
                                  <option value="">Select Subject</option>
                                  {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                               </select>
                           </div>
                           <button onClick={handleSaveResource} className="bg-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
                             Save All to Database
                           </button>
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                    {newResources.map((res, index) => (
                        <div key={index} className="bg-slate-900 border border-white/10 rounded-xl p-6 relative">
                            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <span className="bg-emerald-500/20 text-emerald-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">{index + 1}</span> 
                                Section Data
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs text-gray-400 mb-1 block">Subject</label>
                                  <select 
                                    value={res.subject || ''}
                                    onChange={e => setNewResources(prev => { const arr = [...prev]; arr[index].subject = e.target.value; return arr; })}
                                    className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-emerald-500 text-sm"
                                  >
                                     <option value="">Select Subject</option>
                                     {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="text-xs text-gray-400 mb-1 block">Unit Number / Name *</label>
                                  <input type="text" value={res.unit || ''} onChange={e => setNewResources(prev => { const arr = [...prev]; arr[index].unit = e.target.value; return arr; })} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-emerald-500 text-sm" />
                              </div>
                              <div>
                                  <label className="text-xs text-gray-400 mb-1 block">Topic (Optional)</label>
                                  <input type="text" value={res.topic || ''} onChange={e => setNewResources(prev => { const arr = [...prev]; arr[index].topic = e.target.value; return arr; })} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-emerald-500 text-sm" />
                              </div>
                              <div>
                                  <label className="text-xs text-gray-400 mb-1 block">Subtopic (Optional)</label>
                                  <input type="text" value={res.subtopic || ''} onChange={e => setNewResources(prev => { const arr = [...prev]; arr[index].subtopic = e.target.value; return arr; })} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-emerald-500 text-sm" />
                              </div>
                              <div>
                                  <label className="text-xs text-gray-400 mb-1 block">Page Number (Optional)</label>
                                  <input type="text" value={res.page || ''} onChange={e => setNewResources(prev => { const arr = [...prev]; arr[index].page = e.target.value; return arr; })} className="w-full bg-white/5 border border-white/10 rounded p-2 text-white outline-none focus:border-emerald-500 text-sm" />
                              </div>
                            </div>
                            <div className="mt-4">
                                <label className="text-xs text-gray-400 mb-1 block">Search Tags (Auto-generated Singlish keywords)</label>
                                <input type="text" value={res.searchTags || ''} onChange={e => setNewResources(prev => { const arr = [...prev]; arr[index].searchTags = e.target.value; return arr; })} className="w-full bg-white/5 border border-emerald-500/30 rounded p-2 text-emerald-300 outline-none focus:border-emerald-500 text-sm font-mono" />
                            </div>
                            <div className="mt-4">
                                <label className="text-xs text-gray-400 mb-1 block">Text Content (Sinhala/English) *</label>
                                <textarea 
                                   value={res.textContent || ''} 
                                   onChange={e => setNewResources(prev => { const arr = [...prev]; arr[index].textContent = e.target.value; return arr; })} 
                                   className="w-full bg-white/5 border border-white/10 rounded p-4 text-white outline-none focus:border-emerald-500 h-48 font-serif text-sm leading-relaxed"
                                />
                            </div>
                            <button 
                                onClick={() => setNewResources(prev => prev.filter((_, i) => i !== index))}
                                className="absolute top-6 right-6 text-red-400 hover:text-red-300 text-xs font-medium bg-red-400/10 px-3 py-1.5 rounded-md"
                            >
                                Remove Section
                            </button>
                        </div>
                    ))}
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-white/10 mt-4">
                        <button onClick={() => { setShowResourceForm(false); setNewResources([]); setResourceFile(null); }} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                    </div>
                </div>
              )}
            </div>
          )}

          <div className="glass-panel overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-4 font-semibold text-gray-300">Subject</th>
                  <th className="p-4 font-semibold text-gray-300">Unit / Topic</th>
                  <th className="p-4 font-semibold text-gray-300">Page</th>
                  <th className="p-4 font-semibold text-gray-300">Content Snippet</th>
                  <th className="p-4 font-semibold text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.map(r => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="p-4 text-white">{r.subject}</td>
                    <td className="p-4 text-gray-400">
                        {r.unit} 
                        {r.topic && <><br/><span className="text-xs text-gray-500">{r.topic}</span></>}
                    </td>
                    <td className="p-4 text-gray-400">{r.page || '-'}</td>
                    <td className="p-4 text-gray-500 text-xs max-w-xs truncate">{r.textContent.substring(0, 80)}...</td>
                    <td className="p-4 text-right">
                      <button onClick={() => deleteResource(r.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      
      {/* Live Sessions Tab */}
      {activeTab === 'live_sessions' && (
         <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Video className="text-[#00a2ff]" /> Manage Live Streams
            </h2>
            <button 
              onClick={() => { setNewLiveSession({ status: 'upcoming' }); setShowLiveSessionForm(true); }}
              className="bg-[#00a2ff] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
            >
              Post New Stream
            </button>
          </div>

          {showLiveSessionForm && (
            <div className="glass-panel p-6 rounded-2xl mb-8 animate-in fade-in slide-in-from-top-4 border-white/10">
              <h3 className="text-lg font-bold mb-4">{newLiveSession.id ? 'Edit Stream' : 'Add New Stream'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Stream Title" 
                  className="input-field"
                  value={newLiveSession.title || ''}
                  onChange={e => setNewLiveSession({...newLiveSession, title: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="YouTube Video ID or URL" 
                  className="input-field"
                  value={newLiveSession.youtubeUrl || ''}
                  onChange={e => setNewLiveSession({...newLiveSession, youtubeUrl: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Custom Thumbnail Image URL (Optional)" 
                  className="input-field"
                  value={newLiveSession.thumbnailUrl || ''}
                  onChange={e => setNewLiveSession({...newLiveSession, thumbnailUrl: e.target.value})}
                />
                <select 
                  className="input-field"
                  value={newLiveSession.teacherId || ''}
                  onChange={e => setNewLiveSession({...newLiveSession, teacherId: e.target.value})}
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <select 
                  className="input-field"
                  value={newLiveSession.subjectId || ''}
                  onChange={e => setNewLiveSession({...newLiveSession, subjectId: e.target.value})}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <select 
                  className="input-field"
                  value={newLiveSession.status || 'upcoming'}
                  onChange={e => setNewLiveSession({...newLiveSession, status: e.target.value as 'upcoming'|'live'|'ended'})}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live Now</option>
                  <option value="ended">Ended</option>
                </select>
                <input 
                  type="datetime-local" 
                  className="input-field"
                  value={newLiveSession.scheduledAt ? (() => {
                     const date = (newLiveSession.scheduledAt as any).toDate ? (newLiveSession.scheduledAt as any).toDate() : new Date(newLiveSession.scheduledAt);
                     const tzOffset = date.getTimezoneOffset() * 60000;
                     return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
                  })() : ''}
                  onChange={e => setNewLiveSession({...newLiveSession, scheduledAt: e.target.value ? new Date(e.target.value).getTime() : undefined})}
                />
                <textarea 
                  placeholder="Short Description..." 
                  className="input-field md:col-span-2 min-h-[100px]"
                  value={newLiveSession.description || ''}
                  onChange={e => setNewLiveSession({...newLiveSession, description: e.target.value})}
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={handleSaveLiveSession} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Save
                </button>
                <button onClick={() => setShowLiveSessionForm(false)} className="bg-white/10 hover:bg-white/20 text-gray-300 px-6 py-2 rounded-lg text-sm font-semibold transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveSessions.map(session => {
              const teacher = teachers.find(t => t.id === session.teacherId);
              return (
                 <div key={session.id} className="glass-panel p-5 rounded-2xl flex border-white/10">
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${session.status === 'live' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : session.status === 'ended' ? 'bg-gray-500/20 text-gray-400' : 'bg-blue-500/20 text-blue-400'}`}>
                           {session.status}
                        </span>
                     </div>
                     <h3 className="font-bold text-white mb-1 truncate">{session.title}</h3>
                     <p className="text-xs text-gray-400 mb-4">{teacher?.name}</p>
                     <div className="flex gap-3">
                       <button onClick={() => { setNewLiveSession(session); setShowLiveSessionForm(true); }} className="text-xs text-[#00a2ff] hover:text-blue-400 font-medium">Edit</button>
                       <button onClick={() => deleteLiveSession(session.id)} className="text-xs text-red-500 hover:text-red-400 font-medium">Delete</button>
                     </div>
                   </div>
                 </div>
              );
            })}
          </div>
         </section>
      )}

    </div>
  );
}
