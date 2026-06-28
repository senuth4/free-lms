import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Subject, Subcategory, Teacher, Course, Ad, Editor, Admin, Resource, Quiz, QuizAttempt, LiveSession, DailyChallenge } from '../types';
import { auth, db, googleProvider } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/errorHandler';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, serverTimestamp, query, where, getDoc } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

interface AppDataContextType {
  subjects: Subject[];
  subcategories: Subcategory[];
  teachers: Teacher[];
  ads: Ad[];
  courses: Course[];
  editors: Editor[];
  admins: Admin[];
  resources: Resource[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  liveSessions: LiveSession[];
  dailyChallenges: DailyChallenge[];
  usersList: any[];
  bookmarkedCourses: string[];
  isAdminAuthenticated: boolean;
  isSuperAdmin: boolean;
  isEditor: boolean;
  user: User | null;
  authLoading: boolean;
  toggleCourseBookmark: (courseId: string) => void;
  addTeacher: (teacher: Teacher) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  updateTeacher: (teacher: Teacher) => Promise<void>;
  addCourse: (course: Course) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  updateCourse: (course: Course) => Promise<void>;
  addLiveSession: (session: LiveSession) => Promise<void>;
  updateLiveSession: (session: LiveSession) => Promise<void>;
  deleteLiveSession: (id: string) => Promise<void>;
  addSubcategory: (subcategory: Subcategory) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;
  addSubject: (subject: Subject) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  updateSubject: (subject: Subject) => Promise<void>;
  addResource: (resource: Resource) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  addQuiz: (quiz: Quiz) => Promise<void>;
  deleteQuiz: (id: string) => Promise<void>;
  updateQuiz: (quiz: Quiz) => Promise<void>;
  submitQuizAttempt: (attempt: QuizAttempt) => Promise<void>;
  addEditor: (email: string) => Promise<void>;
  deleteEditor: (email: string) => Promise<void>;
  addAd: (ad: Ad) => Promise<void>;
  deleteAd: (id: string) => Promise<void>;
  loginAdmin: () => Promise<boolean>;
  loginWithEmail: (e: string, p: string) => Promise<boolean>;
  registerWithEmail: (e: string, p: string, name: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
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
  const [resources, setResources] = useState<Resource[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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
    const unsubAuth = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
    });
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

    const unsubResources = onSnapshot(collection(db, 'resources'), snap => {
      setResources(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource)));
    }, error => handleFirestoreError(error, OperationType.LIST, 'resources'));

    const unsubQuizzes = onSnapshot(collection(db, 'quizzes'), snap => {
      setQuizzes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz)));
    }, error => handleFirestoreError(error, OperationType.LIST, 'quizzes'));

    const unsubLiveSessions = onSnapshot(collection(db, 'liveSessions'), snap => {
      setLiveSessions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as LiveSession)));
    }, error => handleFirestoreError(error, OperationType.LIST, 'liveSessions'));

    const unsubDailyChallenges = onSnapshot(collection(db, 'dailyChallenges'), snap => {
      setDailyChallenges(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyChallenge)));
    }, error => console.warn('Could not read daily challenges', error));

    const unsubUsersList = onSnapshot(collection(db, 'users'), snap => {
      setUsersList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, error => console.warn('Could not read users list', error));

    let unsubEditors = () => {};
    let unsubAdmins = () => {};
    let unsubAttempts = () => {};

    if (user) {
      unsubEditors = onSnapshot(collection(db, 'editors'), snap => {
        setEditors(snap.docs.map(doc => ({ id: doc.id } as Editor)));
      }, error => console.warn('Could not read editors', error));

      unsubAdmins = onSnapshot(collection(db, 'admins'), snap => {
        setAdmins(snap.docs.map(doc => ({ id: doc.id } as Admin)));
      }, error => console.warn('Could not read admins', error));
      
      unsubAttempts = onSnapshot(query(collection(db, 'quizAttempts'), where('userId', '==', user.uid)), snap => {
        setQuizAttempts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizAttempt)));
      }, error => console.warn('Could not read attempts', error));
    }

    return () => {
      unsubTeachers();
      unsubCourses();
      unsubAds();
      unsubSubjects();
      unsubSubcategories();
      unsubResources();
      unsubQuizzes();
      unsubLiveSessions();
      unsubDailyChallenges();
      unsubUsersList();
      unsubEditors();
      unsubAdmins();
      unsubAttempts();
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
        medium: course.medium || 'Sinhala',
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
        medium: course.medium || 'Sinhala',
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

  const updateSubject = async (subject: Subject) => {
    try {
      await updateDoc(doc(db, 'subjects', subject.id), { name: subject.name, imageUrl: subject.imageUrl || '', updatedAt: serverTimestamp() });
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, `subjects/${subject.id}`); }
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

  const addLiveSession = async (session: LiveSession) => {
    try {
      await setDoc(doc(db, 'liveSessions', session.id), {
        title: session.title || '',
        teacherId: session.teacherId || '',
        subjectId: session.subjectId || '',
        youtubeUrl: session.youtubeUrl || '',
        thumbnailUrl: session.thumbnailUrl || '',
        scheduledAt: session.scheduledAt || null,
        status: session.status || 'upcoming',
        description: session.description || '',
        createdAt: serverTimestamp()
      });
    } catch (error) { 
      handleFirestoreError(error, OperationType.CREATE, 'liveSessions'); 
      throw error;
    }
  };

  const updateLiveSession = async (session: LiveSession) => {
    try {
      await updateDoc(doc(db, 'liveSessions', session.id), {
        title: session.title || '',
        teacherId: session.teacherId || '',
        subjectId: session.subjectId || '',
        youtubeUrl: session.youtubeUrl || '',
        thumbnailUrl: session.thumbnailUrl || '',
        scheduledAt: session.scheduledAt !== undefined ? session.scheduledAt : null,
        status: session.status || 'upcoming',
        description: session.description || ''
      });
    } catch (error) { 
      handleFirestoreError(error, OperationType.UPDATE, `liveSessions/${session.id}`); 
      throw error;
    }
  };

  const deleteLiveSession = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'liveSessions', id));
    } catch (error) { handleFirestoreError(error, OperationType.DELETE, `liveSessions/${id}`); }
  };

  const addResource = async (resource: Resource) => {
    try {
      await setDoc(doc(db, 'resources', resource.id), {
        subject: resource.subject || '',
        unit: resource.unit || '',
        topic: resource.topic || null,
        subtopic: resource.subtopic || null,
        page: resource.page || null,
        textContent: resource.textContent || '',
        createdAt: serverTimestamp()
      });
    } catch (error) { handleFirestoreError(error, OperationType.CREATE, 'resources'); }
  };

  const deleteResource = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'resources', id));
    } catch (error) { handleFirestoreError(error, OperationType.DELETE, `resources/${id}`); }
  };

  const addQuiz = async (quiz: Quiz) => {
    try {
      await setDoc(doc(db, 'quizzes', quiz.id), {
        title: quiz.title,
        description: quiz.description,
        subjectId: quiz.subjectId,
        unit: quiz.unit,
        medium: quiz.medium,
        timeLimitMins: quiz.timeLimitMins || null,
        questions: quiz.questions,
        imageUrl: quiz.imageUrl || null,
        createdAt: serverTimestamp()
      });
    } catch (error) { handleFirestoreError(error, OperationType.CREATE, 'quizzes'); }
  };

  const deleteQuiz = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'quizzes', id));
    } catch (error) { handleFirestoreError(error, OperationType.DELETE, `quizzes/${id}`); }
  };

  const updateQuiz = async (quiz: Quiz) => {
    try {
      await updateDoc(doc(db, 'quizzes', quiz.id), {
        title: quiz.title,
        description: quiz.description,
        subjectId: quiz.subjectId,
        unit: quiz.unit,
        medium: quiz.medium,
        timeLimitMins: quiz.timeLimitMins || null,
        questions: quiz.questions,
        imageUrl: quiz.imageUrl || null,
        updatedAt: serverTimestamp()
      });
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, `quizzes/${quiz.id}`); }
  };

  const submitQuizAttempt = async (attempt: QuizAttempt) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'quizAttempts', attempt.id), {
        userId: user.uid,
        quizId: attempt.quizId,
        score: attempt.score || 0,
        startedAt: attempt.startedAt,
        completedAt: serverTimestamp(),
        answers: attempt.answers
      });
    } catch (error) { handleFirestoreError(error, OperationType.CREATE, 'quizAttempts'); }
  };

  const isLoggingInRef = useRef(false);

  const loginAdmin = async () => {
    if (isLoggingInRef.current) return false;
    isLoggingInRef.current = true;
    try {
      const res = await signInWithPopup(auth, googleProvider);
      return !!res.user;
    } catch (error: any) {
      console.warn("Auth popup error:", error.code || error.message);
      return false;
    } finally {
      isLoggingInRef.current = false;
    }
  };

  const loginWithEmail = async (e: string, p: string) => {
    try {
      await signInWithEmailAndPassword(auth, e, p);
      return true;
    } catch (error) {
      console.warn("Login failed:", error);
      throw error;
    }
  };

  const registerWithEmail = async (e: string, p: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, e, p);
      if (res.user) {
         await setDoc(doc(db, 'users', res.user.uid), {
            name,
            email: e,
            role: 'student',
            createdAt: serverTimestamp()
         });
      }
      return true;
    } catch (error) {
      console.warn("Registration failed:", error);
      throw error;
    }
  };

  const resetPassword = async (e: string) => {
    try {
      await sendPasswordResetEmail(auth, e);
      return true;
    } catch (error) {
      console.warn("Password reset failed:", error);
      throw error;
    }
  };

  const logoutAdmin = async () => {
    await signOut(auth);
  };

  return (
    <AppDataContext.Provider value={{
      subjects, subcategories, teachers, ads, courses, editors, admins, resources, quizzes, quizAttempts, liveSessions, dailyChallenges, usersList, bookmarkedCourses, isAdminAuthenticated, isSuperAdmin, isEditor, user, authLoading,
      toggleCourseBookmark, addTeacher, deleteTeacher, updateTeacher, addCourse, deleteCourse, updateCourse,
      addLiveSession, updateLiveSession, deleteLiveSession,
      addSubcategory, deleteSubcategory, addSubject, deleteSubject, updateSubject, addResource, deleteResource, 
      addQuiz, deleteQuiz, updateQuiz, submitQuizAttempt,
      addEditor, deleteEditor, addAd, deleteAd, loginAdmin, loginWithEmail, registerWithEmail, resetPassword, logoutAdmin
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
