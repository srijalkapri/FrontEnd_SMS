export enum ExamScheduleStatus {
  Draft = 0,
  Published = 1,
}

export interface ExamSession {
  id: number;
  gradeSubjectId: number;
  subjectId: number;
  subjectName: string;
  isOptional: boolean;
  examDate: string | null;
  startTime: string | null;
  endTime: string | null;
  invigilatorTeacherId: number | null;
  invigilatorTeacherName: string | null;
  notes: string | null;
}

export interface ExamSchedule {
  id: number;
  gradeId: number;
  gradeName: string;
  title: string;
  academicYear: string;
  status: ExamScheduleStatus;
  createdAt: string;
  sessions: ExamSession[];
}

export interface CreateExamScheduleRequest {
  gradeId: number;
  title: string;
  academicYear: string;
  autoGenerateSessions: boolean;
}

export interface UpdateExamScheduleRequest {
  title: string;
  academicYear: string;
  status: ExamScheduleStatus;
}

export interface UpdateExamSessionRequest {
  examDate: string | null;
  startTime: string | null;
  endTime: string | null;
  invigilatorTeacherId: number | null;
  notes: string | null;
}

export interface AddExamSessionRequest {
  examScheduleId: number;
  gradeSubjectId: number;
  examDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  invigilatorTeacherId?: number | null;
  notes?: string | null;
}

export interface BulkUpdateExamSessionItem {
  id: number;
  examDate: string | null;
  startTime: string | null;
  endTime: string | null;
  invigilatorTeacherId: number | null;
  notes: string | null;
}

export interface BulkUpdateExamSessionsRequest {
  examScheduleId: number;
  sessions: BulkUpdateExamSessionItem[];
}

export interface ExamSessionDraft {
  id: number;
  examDate: string;
  startTime: string;
  endTime: string;
  invigilatorTeacherId: string;
  notes: string;
}
