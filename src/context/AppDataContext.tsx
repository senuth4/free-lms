import React, { createContext, useContext, useState, useEffect } from 'react';
import { Subject, Subcategory, Teacher, Course, Ad } from '../types';
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
  isAdminAuthenticated: boolean;
  user: User | null;
  addTeacher: (teacher: Teacher) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  updateTeacher: (teacher: Teacher) => Promise<void>;
  addCourse: (course: Course) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  updateCourse: (course: Course) => Promise<void>;
  addSubcategory: (subcategory: Subcategory) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  
  // Admins collection checks are enforced by rules. 
  // We'll consider any logged in user as authenticated for the UI, 
  // but operations will fail if they aren't in the 'admins' collection.
  const isAdminAuthenticated = !!user;

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

    return () => {
      unsubTeachers();
      unsubCourses();
      unsubAds();
      unsubSubjects();
      unsubSubcategories();
    };
  }, []);

  const addTeacher = async (teacher: Teacher) => {
    try {
      await setDoc(doc(db, 'teachers', teacher.id), {
        name: teacher.name,
        subjectId: teacher.subjectId,
        imageUrl: teacher.imageUrl,
        description: teacher.description,
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
        name: teacher.name,
        subjectId: teacher.subjectId,
        imageUrl: teacher.imageUrl,
        description: teacher.description,
        socials: teacher.socials || {},
        updatedAt: serverTimestamp()
      });
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, `teachers/${teacher.id}`); }
  };
  
  const addCourse = async (course: Course) => {
    try {
      await setDoc(doc(db, 'courses', course.id), {
        title: course.title,
        subjectId: course.subjectId,
        teacherId: course.teacherId,
        subcategoryId: course.subcategoryId,
        unit: course.unit,
        thumbnailUrl: course.thumbnailUrl,
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
        title: course.title,
        subjectId: course.subjectId,
        teacherId: course.teacherId,
        subcategoryId: course.subcategoryId,
        unit: course.unit,
        thumbnailUrl: course.thumbnailUrl,
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

  const addAd = async (ad: Ad) => {
    try {
      await setDoc(doc(db, 'ads', ad.id), {
        title: ad.title,
        teacherId: ad.teacherId,
        imageUrl: ad.imageUrl,
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
      subjects, subcategories, teachers, ads, courses, isAdminAuthenticated, user,
      addTeacher, deleteTeacher, updateTeacher, addCourse, deleteCourse, updateCourse,
      addSubcategory, deleteSubcategory, addAd, deleteAd, loginAdmin, logoutAdmin
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
