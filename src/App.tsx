import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ExamScheduleDetailPage } from './pages/ExamScheduleDetailPage';
import { ExamSchedulesPage } from './pages/ExamSchedulesPage';
import { GradeCurriculumPage } from './pages/GradeCurriculumPage';
import { GradeSubjectsPage } from './pages/GradeSubjectsPage';
import { GradesPage } from './pages/GradesPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { PromotionPage } from './pages/PromotionPage';
import { StudentReportPage } from './pages/StudentReportPage';
import { StudentsPage } from './pages/StudentsPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { TeacherReportPage } from './pages/TeacherReportPage';
import { TeachersPage } from './pages/TeachersPage';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/grades" element={<GradesPage />} />
                <Route path="/grades/:gradeId/subjects" element={<GradeCurriculumPage />} />
                <Route path="/subjects" element={<SubjectsPage />} />
                <Route path="/teachers" element={<TeachersPage />} />
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/grade-subjects" element={<GradeSubjectsPage />} />
                <Route path="/promotion" element={<PromotionPage />} />
                <Route path="/exams" element={<ExamSchedulesPage />} />
                <Route path="/exams/:id" element={<ExamScheduleDetailPage />} />
                <Route path="/reports/students" element={<StudentReportPage />} />
                <Route path="/reports/teachers" element={<TeacherReportPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
