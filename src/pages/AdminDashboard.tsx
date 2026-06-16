import React, { useState } from 'react';
import { Activity, Users, Clock, BookOpen, Layers, LogOut } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { Course, Teacher, Subcategory, Ad } from '../types';

export default function AdminDashboard() {
  const { 
    courses, teachers, subjects, subcategories, ads,
    addTeacher, deleteTeacher, updateTeacher,
    addCourse, deleteCourse, updateCourse,
    addSubcategory, deleteSubcategory,
    addAd, deleteAd, logoutAdmin
  } = useAppData();

  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'courses' | 'categories'>('overview');
  
  // Forms state
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showAdForm, setShowAdForm] = useState(false);

  // Form Fields
  const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({ socials: {} });
  const [newCourse, setNewCourse] = useState<Partial<Course> & { courseLinks?: { title: string, url: string, type: 'video' | 'pdf' }[] }>({ courseLinks: [] });
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [newAd, setNewAd] = useState<Partial<Ad>>({});

  const handleSaveTeacher = () => {
    if (newTeacher.name && newTeacher.subjectId) {
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
          subjectId: newTeacher.subjectId,
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
      courseLinks: [...(prev.courseLinks || []), { title: 'New Resource', url: '', type: 'video' }]
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
    if (newCourse.title && newCourse.subjectId && newCourse.teacherId && newCourse.subcategoryId) {
      if (newCourse.id) {
        updateCourse({
          ...newCourse,
          links: newCourse.courseLinks || []
        } as Course);
      } else {
        addCourse({
          id: `c-${Date.now()}`,
          title: newCourse.title,
          subjectId: newCourse.subjectId,
          teacherId: newCourse.teacherId,
          subcategoryId: newCourse.subcategoryId,
          unit: newCourse.unit || 'General',
          thumbnailUrl: newCourse.thumbnailUrl || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&q=80&w=800',
          links: newCourse.courseLinks as any || [],
          views: 0
        });
      }
      setShowCourseForm(false);
      setNewCourse({ courseLinks: [] });
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

  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00a2ff] to-purple-400">
          Admin Dashboard
        </h1>
        <button 
          onClick={logoutAdmin}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium text-gray-300 hover:text-white transition-colors border border-white/10"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      <div className="flex space-x-2 border-b border-white/10 pb-4 overflow-x-auto custom-scrollbar">
        <button
          className={`nav-pill whitespace-nowrap ${activeTab === 'overview' ? 'nav-pill-active' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
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
          className={`nav-pill whitespace-nowrap ${activeTab === 'ads' ? 'nav-pill-active' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('ads')}
        >
          Manage Ads
        </button>
      </div>

      {activeTab === 'overview' && (
        <section className="space-y-6">
          {subjects.length === 0 && (
            <div className="bg-[#00a2ff]/10 border border-[#00a2ff]/20 rounded-xl p-4 flex items-center justify-between">
              <p className="text-gray-300 text-sm">Your database is empty. You can seed initial subjects to get started.</p>
              <button 
                onClick={async () => {
                   // Quick seed
                   const db = (await import('../lib/firebase')).db;
                   const { doc, setDoc } = await import('firebase/firestore');
                   const sample = [
                    { id: 'sub-phy', name: 'Physics' },
                    { id: 'sub-chem', name: 'Chemistry' },
                    { id: 'sub-math', name: 'Combined Maths' },
                    { id: 'sub-bio', name: 'Biology' },
                   ];
                   for (const s of sample) {
                     await setDoc(doc(db, 'subjects', s.id), s);
                   }
                }}
                className="bg-[#00a2ff] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Seed Subjects
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-16 h-16 text-[#00a2ff]" />
              </div>
              <p className="text-gray-400 font-medium text-sm">Daily Visitors</p>
              <h3 className="text-3xl font-bold text-white">12,543</h3>
              <p className="text-green-400 text-xs font-semibold mt-auto">+14% from yesterday</p>
            </div>
            
            <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity className="w-16 h-16 text-purple-400" />
              </div>
              <p className="text-gray-400 font-medium text-sm">Monthly Visitors</p>
              <h3 className="text-3xl font-bold text-white">342k</h3>
              <p className="text-green-400 text-xs font-semibold mt-auto">+5.2% this month</p>
            </div>

            <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BookOpen className="w-16 h-16 text-blue-400" />
              </div>
              <p className="text-gray-400 font-medium text-sm">Total Courses</p>
              <h3 className="text-3xl font-bold text-white">{courses.length}</h3>
              <p className="text-gray-400 text-xs mt-auto">Active on platform</p>
            </div>

            <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Clock className="w-16 h-16 text-green-400" />
              </div>
              <p className="text-gray-400 font-medium text-sm">Total Watch Time</p>
              <h3 className="text-3xl font-bold text-white">8.2m hrs</h3>
              <p className="text-gray-400 text-xs mt-auto">Across all courses</p>
            </div>
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
                      <img src={t.imageUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
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
                      <button onClick={() => deleteCourse(c.id)} className="text-red-400 hover:text-red-300 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'ads' && (
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
                      <img src={t.imageUrl} className="w-16 h-8 rounded object-cover" alt="" />
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

    </div>
  );
}
