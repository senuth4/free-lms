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
import { AppDataProvider, useAppData } from './context/AppDataContext';
import DNABackground from './components/DNABackground';

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdminAuthenticated } = useAppData();
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AppDataProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen relative z-0">
          <DNABackground />
          <Navbar />
          <main className="flex-grow pt-20 px-4 md:px-8 lg:px-12 mx-auto w-full max-w-[1600px]">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/subject/:subjectId" element={<SubjectPage />} />
              <Route path="/teacher/:teacherId" element={<TeacherProfile />} />
              <Route path="/course/:courseId" element={<Player />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppDataProvider>
  );
}
