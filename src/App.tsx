import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Courses from './pages/Courses';
import SubjectPage from './pages/SubjectPage';
import TeacherProfile from './pages/TeacherProfile';
import Player from './pages/Player';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import SavedCourses from './pages/SavedCourses';
import ResourceBookSearch from './components/ResourceBookSearch';
import AIHub from './pages/AIHub';
import SubjectQA from './pages/SubjectQA';
import QuizPage from './pages/QuizPage';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import AppBackground from './components/AppBackground';

import BottomNav from './components/BottomNav';

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { authLoading, isAdminAuthenticated, isSuperAdmin, isEditor, logoutAdmin } = useAppData();
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
        <div className="animate-pulse w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/50">
          <div className="w-6 h-6 border-2 border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  if (!isSuperAdmin && !isEditor) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
        <div className="glass-panel p-8 max-w-md w-full text-center group">
          <div className="animate-pulse w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/50">
            <div className="w-6 h-6 border-2 border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Verifying Access...</h2>
          <p className="text-gray-400 text-sm mb-6">Checking your editor permissions</p>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-400 text-left">
              • If you were just invited, please wait a moment.<br/>
              • If this screen persists, your Google account may not have permission to view the dashboard.
            </p>
          </div>
          <button 
            onClick={logoutAdmin}
            className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold py-3 rounded-xl transition-all border border-red-500/20"
          >
            Sign out of this Google Account
          </button>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <AppDataProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen relative z-0">
          <AppBackground />
          <Navbar />
          <main className="flex-grow pt-20 pb-20 md:pb-8 px-4 md:px-8 lg:px-12 mx-auto w-full max-w-[1600px]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lessons" element={<Courses />} />
              <Route path="/saved" element={<SavedCourses />} />
              <Route path="/subject/:subjectId" element={<SubjectPage />} />
              <Route path="/teacher/:teacherId" element={<TeacherProfile />} />
              <Route path="/course/:courseId" element={<Player />} />
              <Route path="/quiz/:quizId" element={<QuizPage />} />
              <Route path="/ai-hub" element={<AIHub />} />
              <Route path="/ai-hub/qa" element={<SubjectQA />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </BrowserRouter>
    </AppDataProvider>
  );
}
