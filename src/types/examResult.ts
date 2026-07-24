export type ExamResultStatusLabel =
  | 'Draft'
  | 'PendingApproval'
  | 'Approved'
  | 'Rejected';

export interface TeacherExamResultItem {
  studentId: number;
  studentName: string;
  marksObtained: number | null;
  totalMarks: number;
  isAbsent: boolean;
  remarks: string | null;
}

export interface TeacherExamResultItemRequest {
  studentId: number;
  marksObtained: number | null;
  totalMarks: number;
  isAbsent: boolean;
  remarks?: string | null;
}

export interface AdminPendingExamResult {
  batchId: number;
  examSessionId: number;
  examScheduleId: number;
  examTitle: string;
  gradeName: string;
  subjectName: string;
  teacherId: number;
  teacherName: string;
  studentCount: number;
  submittedAtUtc: string | null;
}

export interface AdminExamResultReview {
  batchId: number;
  status: ExamResultStatusLabel;
  examTitle: string;
  gradeName: string;
  subjectName: string;
  teacherName: string;
  submittedAtUtc: string | null;
  reviewComment: string | null;
  items: TeacherExamResultItem[];
}

export interface ReviewExamResultsRequest {
  comment?: string | null;
}

export interface TeacherExamSession {
  examSessionId: number;
  examScheduleId: number;
  examTitle: string;
  academicYear: string | null;
  gradeId: number;
  gradeName: string;
  gradeSubjectId: number;
  subjectId: number;
  subjectName: string;
  examDate: string | null;
  startTime: string | null;
  endTime: string | null;
  batchId: number | null;
  resultStatus: ExamResultStatusLabel | null;
}

export interface TeacherExamResultBatch {
  batchId: number;
  examSessionId: number;
  status: ExamResultStatusLabel;
  submittedAtUtc: string | null;
  reviewedAtUtc: string | null;
  reviewComment: string | null;
  items: TeacherExamResultItem[];
}

export interface TeacherSaveExamResultsRequest {
  examSessionId: number;
  items: TeacherExamResultItemRequest[];
}

export interface StudentExamResultSubject {
  examSessionId: number;
  examResultItemId: number;
  subjectName: string;
  marksObtained: number | null;
  totalMarks: number;
  isAbsent: boolean;
  remarks: string | null;
  canApplyReExam: boolean;
  reExamStatus: string | null;
  reExamRequestId: number | null;
  isReExamResult: boolean;
  originalMarksObtained: number | null;
  originalTotalMarks: number | null;
  originalIsAbsent: boolean | null;
}

export interface StudentExamResultSchedule {
  examScheduleId: number;
  examTitle: string;
  academicYear: string | null;
  subjects: StudentExamResultSubject[];
  totalObtained: number;
  totalMarks: number;
  percentage: number;
}

export interface AdminStudentMarksRow {
  studentId: number;
  studentName: string;
  subjects: StudentExamResultSubject[];
  totalObtained: number;
  totalMarks: number;
  percentage: number;
}

export interface AdminScheduleMarks {
  examScheduleId: number;
  examTitle: string;
  academicYear: string | null;
  gradeName: string;
  students: AdminStudentMarksRow[];
}

export interface AdminStudentMarksRecord {
  studentId: number;
  studentName: string;
  gradeName: string;
  results: StudentExamResultSchedule[];
}

export interface ExamResultItemDraft {
  studentId: number;
  studentName: string;
  marksObtained: string;
  totalMarks: string;
  isAbsent: boolean;
  remarks: string;
}
