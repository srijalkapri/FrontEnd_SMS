import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleRoute } from './components/auth/RoleRoute';
import { AppLayout } from './components/layout/AppLayout';
import { AuthLayout } from './components/layout/AuthLayout';
import { PortalLayout } from './components/layout/PortalLayout';
import { AuthProvider } from './context/AuthContext';
import { AppearancePage } from './pages/AppearancePage';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ExamScheduleDetailPage } from './pages/ExamScheduleDetailPage';
import { ExamSchedulesPage } from './pages/ExamSchedulesPage';
import { GradeCurriculumPage } from './pages/GradeCurriculumPage';
import { GradeSubjectsPage } from './pages/GradeSubjectsPage';
import { GradesPage } from './pages/GradesPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { PendingUsersPage } from './pages/PendingUsersPage';
import { PromotionPage } from './pages/PromotionPage';
import { RegisterPage } from './pages/RegisterPage';
import { ExamResultsLookupPage } from './pages/ExamResultsLookupPage';
import { ResultApprovalDetailPage } from './pages/ResultApprovalDetailPage';
import { ResultApprovalsPage } from './pages/ResultApprovalsPage';
import { StudentReportPage } from './pages/StudentReportPage';
import { StudentResultsPage } from './pages/student/StudentResultsPage';
import { StudentOverviewPage } from './pages/student/StudentOverviewPage';
import { StudentGradePage } from './pages/student/StudentGradePage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentSubjectsPage } from './pages/student/StudentSubjectsPage';
import { StudentTeachersPage } from './pages/student/StudentTeachersPage';
import { StudentsPage } from './pages/StudentsPage';
import { SubjectsPage } from './pages/SubjectsPage';
import { TeacherReportPage } from './pages/TeacherReportPage';
import { TeacherExamResultsPage } from './pages/teacher/TeacherExamResultsPage';
import { TeacherExamSessionsPage } from './pages/teacher/TeacherExamSessionsPage';
import { TeacherClassesPage } from './pages/teacher/TeacherClassesPage';
import { TeacherOverviewPage } from './pages/teacher/TeacherOverviewPage';
import { TeacherProfilePage } from './pages/teacher/TeacherProfilePage';
import { TeacherStudentsPage } from './pages/teacher/TeacherStudentsPage';
import { TeacherSubjectsPage } from './pages/teacher/TeacherSubjectsPage';
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
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<RoleRoute allowedRoles={['SuperAdmin']} />}>
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
                  <Route path="/exams/result-approvals" element={<ResultApprovalsPage />} />
                  <Route path="/exams/result-approvals/:batchId" element={<ResultApprovalDetailPage />} />
                  <Route path="/exams/results" element={<ExamResultsLookupPage />} />
                  <Route path="/exams/:id" element={<ExamScheduleDetailPage />} />
                  <Route path="/reports/students" element={<StudentReportPage />} />
                  <Route path="/reports/teachers" element={<TeacherReportPage />} />
                  <Route path="/settings/appearance" element={<AppearancePage />} />
                  <Route path="/admin/pending-users" element={<PendingUsersPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Route>

              <Route element={<RoleRoute allowedRoles={['Teacher']} />}>
                <Route element={<PortalLayout portal="teacher" />}>
                  <Route path="/teacher" element={<TeacherOverviewPage />} />
                  <Route path="/teacher/profile" element={<TeacherProfilePage />} />
                  <Route path="/teacher/classes" element={<TeacherClassesPage />} />
                  <Route path="/teacher/students" element={<TeacherStudentsPage />} />
                  <Route path="/teacher/subjects" element={<TeacherSubjectsPage />} />
                  <Route path="/teacher/exams" element={<TeacherExamSessionsPage />} />
                  <Route path="/teacher/exams/:examSessionId" element={<TeacherExamResultsPage />} />
                  <Route path="/teacher/settings/appearance" element={<AppearancePage />} />
                  <Route path="*" element={<Navigate to="/teacher" replace />} />
                </Route>
              </Route>

              <Route element={<RoleRoute allowedRoles={['Student']} />}>
                <Route element={<PortalLayout portal="student" />}>
                  <Route path="/student" element={<StudentOverviewPage />} />
                  <Route path="/student/profile" element={<StudentProfilePage />} />
                  <Route path="/student/grade" element={<StudentGradePage />} />
                  <Route path="/student/subjects" element={<StudentSubjectsPage />} />
                  <Route path="/student/teachers" element={<StudentTeachersPage />} />
                  <Route path="/student/results" element={<StudentResultsPage />} />
                  <Route path="/student/settings/appearance" element={<AppearancePage />} />
                  <Route path="*" element={<Navigate to="/student" replace />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
