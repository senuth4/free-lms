import React, { createContext, useContext, useState, useEffect } from 'react';
import { Subject, Subcategory, Teacher, Course, Ad, Editor, Admin } from '../types';
import { auth, db, googleProvider } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandler';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';

interface AppDataContextType {
  subjects: Subject[];
  subcategories: Subcategory[];
  teachers: Teacher[];
  ads: Ad[];
  courses: Course[];
  editors: Editor[];
  admins: Admin[];
  bookmarkedCourses: string[];
  isAdminAuthenticated: boolean;
  isSuperAdmin: boolean;
  isEditor: boolean;
  user: User | null;
  toggleCourseBookmark: (courseId: string) => void;
  addTeacher: (teacher: Teacher) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  updateTeacher: (teacher: Teacher) => Promise<void>;
  addCourse: (course: Course) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  updateCourse: (course: Course) => Promise<void>;
  addSubcategory: (subcategory: Subcategory) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;
  addSubject: (subject: Subject) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addEditor: (email: string) => Promise<void>;
  deleteEditor: (email: string) => Promise<void>;
  addAd: (ad: Ad) => Promise<void>;
  deleteAd: (id: string) => Promise<void>;
  loginAdmin: () => Promise<boolean>;
  logoutAdmin: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [editors, setEditors] = useState<Editor[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [user, setUser] = useState<User | null>(null);
  
  const [bookmarkedCourses, setBookmarkedCourses] = useState<string[]>(() => {
    const saved = localStorage.getItem('bookmarked_courses');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleCourseBookmark = (courseId: string) => {
    setBookmarkedCourses(prev => {
      const _new = prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId];
      localStorage.setItem('bookmarked_courses', JSON.stringify(_new));
      return _new;
    });
  };
  
  const isAdminAuthenticated = !!user;
  const isSuperAdmin = user?.email === 'senuthbandara28@gmail.com' || admins.some(a => a.id === user?.email);
  const isEditor = editors.some(e => e.id === user?.email);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, u => setUser(u));
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const unsubTeachers = onSnapshot(collection(db, 'teachers'), snap => {
      setTeachers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher)));
    }, error => handleFirestoreError(error, OperationType.LIST, 'teachers'));

    const unsubCourses = onSnapshot(collection(db, 'courses'), snap => {
      setCourses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
    }, error => handleFirestoreError(error, OperationType.LIST, 'courses'));

    const unsubAds = onSnapshot(collection(db, 'ads'), snap => {
      setAds(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad)));
    }, error => handleFirestoreError(error, OperationType.LIST, 'ads'));

    const unsubSubjects = onSnapshot(collection(db, 'subjects'), snap => {
      setSubjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject)));
    }, error => handleFirestoreError(error, OperationType.LIST, 'subjects'));

    const unsubSubcategories = onSnapshot(collection(db, 'subcategories'), snap => {
      setSubcategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subcategory)));
    }, error => handleFirestoreError(error, OperationType.LIST, 'subcategories'));

    let unsubEditors = () => {};
    let unsubAdmins = () => {};

    if (user) {
      unsubEditors = onSnapshot(collection(db, 'editors'), snap => {
        setEditors(snap.docs.map(doc => ({ id: doc.id } as Editor)));
      }, error => console.warn('Could not read editors', error));

      unsubAdmins = onSnapshot(collection(db, 'admins'), snap => {
        setAdmins(snap.docs.map(doc => ({ id: doc.id } as Admin)));
      }, error => console.warn('Could not read admins', error));
    }

    return () => {
      unsubTeachers();
      unsubCourses();
      unsubAds();
      unsubSubjects();
      unsubSubcategories();
      unsubEditors();
      unsubAdmins();
    };
  }, [user]);

  const addTeacher = async (teacher: Teacher) => {
    try {
      await setDoc(doc(db, 'teachers', teacher.id), {
        name: teacher.name || '',
        subjectId: teacher.subjectId || '',
        imageUrl: teacher.imageUrl || '',
        description: teacher.description || '',
        socials: teacher.socials || {},
        createdAt: serverTimestamp()
      });
    } catch (error) { handleFirestoreError(error, OperationType.CREATE, 'teachers'); }
  };

  const deleteTeacher = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'teachers', id));
    } catch (error) { handleFirestoreError(error, OperationType.DELETE, `teachers/${id}`); }
  };

  const updateTeacher = async (teacher: Teacher) => {
    try {
      await updateDoc(doc(db, 'teachers', teacher.id), {
        name: teacher.name || '',
        subjectId: teacher.subjectId || '',
        imageUrl: teacher.imageUrl || '',
        description: teacher.description || '',
        socials: teacher.socials || {},
        updatedAt: serverTimestamp()
      });
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, `teachers/${teacher.id}`); }
  };
  
  const addCourse = async (course: Course) => {
    try {
      await setDoc(doc(db, 'courses', course.id), {
        title: course.title || '',
        subjectId: course.subjectId || '',
        teacherId: course.teacherId || '',
        subcategoryId: course.subcategoryId || '',
        unit: course.unit || '',
        thumbnailUrl: course.thumbnailUrl || '',
        views: course.views || 0,
        links: course.links || [],
        createdAt: serverTimestamp()
      });
    } catch (error) { handleFirestoreError(error, OperationType.CREATE, 'courses'); }
  };

  const deleteCourse = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'courses', id));
    } catch (error) { handleFirestoreError(error, OperationType.DELETE, `courses/${id}`); }
  };

  const updateCourse = async (course: Course) => {
    try {
      await updateDoc(doc(db, 'courses', course.id), {
        title: course.title || '',
        subjectId: course.subjectId || '',
        teacherId: course.teacherId || '',
        subcategoryId: course.subcategoryId || '',
        unit: course.unit || '',
        thumbnailUrl: course.thumbnailUrl || '',
        views: course.views || 0,
        links: course.links || [],
        updatedAt: serverTimestamp()
      });
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, `courses/${course.id}`); }
  };

  const addSubcategory = async (subcategory: Subcategory) => {
    try {
      await setDoc(doc(db, 'subcategories', subcategory.id), { name: subcategory.name, createdAt: serverTimestamp() });
    } catch (error) { handleFirestoreError(error, OperationType.CREATE, 'subcategories'); }
  };

  const deleteSubcategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'subcategories', id));
    } catch (error) { handleFirestoreError(error, OperationType.DELETE, `subcategories/${id}`); }
  };

  const addSubject = async (subject: Subject) => {
    try {
      await setDoc(doc(db, 'subjects', subject.id), { name: subject.name, imageUrl: subject.imageUrl || '', createdAt: serverTimestamp() });
    } catch (error) { handleFirestoreError(error, OperationType.CREATE, 'subjects'); }
  };

  const deleteSubject = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'subjects', id));
    } catch (error) { handleFirestoreError(error, OperationType.DELETE, `subjects/${id}`); }
  };

  const addEditor = async (email: string) => {
    try {
      await setDoc(doc(db, 'editors', email), { email, createdAt: serverTimestamp() });
    } catch (error) { handleFirestoreError(error, OperationType.CREATE, 'editors'); }
  };

  const deleteEditor = async (email: string) => {
    try {
      await deleteDoc(doc(db, 'editors', email));
    } catch (error) { handleFirestoreError(error, OperationType.DELETE, `editors/${email}`); }
  };

  const addAd = async (ad: Ad) => {
    try {
      await setDoc(doc(db, 'ads', ad.id), {
        title: ad.title || '',
        teacherId: ad.teacherId || '',
        imageUrl: ad.imageUrl || '',
        description: ad.description || '',
        createdAt: serverTimestamp()
      });
    } catch (error) { handleFirestoreError(error, OperationType.CREATE, 'ads'); }
  };

  const deleteAd = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'ads', id));
    } catch (error) { handleFirestoreError(error, OperationType.DELETE, `ads/${id}`); }
  };

  const loginAdmin = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      return !!res.user;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const logoutAdmin = async () => {
    await signOut(auth);
  };

  return (
    <AppDataContext.Provider value={{
      subjects, subcategories, teachers, ads, courses, editors, admins, bookmarkedCourses, isAdminAuthenticated, isSuperAdmin, isEditor, user,
      toggleCourseBookmark, addTeacher, deleteTeacher, updateTeacher, addCourse, deleteCourse, updateCourse,
      addSubcategory, deleteSubcategory, addSubject, deleteSubject, addEditor, deleteEditor, addAd, deleteAd, loginAdmin, logoutAdmin
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData must be used within an AppDataProvider');
  return context;
};
