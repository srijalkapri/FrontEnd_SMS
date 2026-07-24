export type ReExamRequestStatus =
  | 'Requested'
  | 'Approved'
  | 'Rejected'
  | 'MarksSubmitted'
  | 'MarksApproved'
  | 'MarksRejected';

export interface ReExamRequest {
  id: number;
  studentId: number;
  studentName: string;
  examSessionId: number;
  examScheduleId: number;
  examTitle: string;
  gradeName: string;
  subjectName: string;
  attemptNumber: number;
  status: ReExamRequestStatus;
  studentReason: string | null;
  adminComment: string | null;
  reviewedAtUtc: string | null;
  originalMarksObtained: number | null;
  originalTotalMarks: number;
  originalIsAbsent: boolean;
  teacherId: number | null;
  teacherName: string | null;
  marksObtained: number | null;
  totalMarks: number | null;
  isAbsent: boolean;
  marksRemarks: string | null;
  marksSubmittedAtUtc: string | null;
  marksReviewComment: string | null;
  createdAtUtc: string;
}

export interface ApplyReExamRequest {
  examSessionId: number;
  reason?: string | null;
}

export interface ReviewReExamRequest {
  comment?: string | null;
}

export interface TeacherSubmitReExamMarksRequest {
  marksObtained: number | null;
  totalMarks: number;
  isAbsent: boolean;
  remarks?: string | null;
}
