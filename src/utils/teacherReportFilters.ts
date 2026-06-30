import type { Grade } from '../types/grade';
import type { GradeSubjectTeacher } from '../types/gradeSubjectTeacher';
import type { Student } from '../types/student';
import type { SubjectTypeFilter } from './subjectType';

export interface TeacherReportFilters {
  teacherId?: number;
  name?: string;
  gradeId?: number;
  subjectId?: number;
  subjectType?: SubjectTypeFilter;
  classTeacher?: 'all' | 'yes' | 'no';
}

export interface TeacherReportRow {
  rowId: number;
  teacherId: number;
  teacherName: string;
  gradeId: number;
  gradeName: string;
  subjectId: number;
  subjectName: string;
  isOptional: boolean;
  isClassTeacher: boolean;
  students: Student[];
}

export function hasActiveTeacherReportFilters(filters: TeacherReportFilters): boolean {
  return (
    (filters.teacherId !== undefined && filters.teacherId > 0) ||
    !!filters.name?.trim() ||
    (filters.gradeId !== undefined && filters.gradeId > 0) ||
    (filters.subjectId !== undefined && filters.subjectId > 0) ||
    (filters.subjectType !== undefined && filters.subjectType !== 'all') ||
    (filters.classTeacher !== undefined && filters.classTeacher !== 'all')
  );
}

export function buildTeacherReportRows(
  assignments: GradeSubjectTeacher[],
  grades: Grade[],
  students: Student[],
  filters: TeacherReportFilters,
): TeacherReportRow[] {
  const nameQuery = filters.name?.trim().toLowerCase();

  const rows = assignments.map((assignment) => {
    const grade = grades.find((item) => item.id === assignment.gradeId);
    const isClassTeacher =
      grade?.classTeacherId != null && grade.classTeacherId === assignment.teacherId;

    return {
      rowId: assignment.id,
      teacherId: assignment.teacherId,
      teacherName: assignment.teacherName,
      gradeId: assignment.gradeId,
      gradeName: assignment.gradeName,
      subjectId: assignment.subjectId,
      subjectName: assignment.subjectName,
      isOptional: assignment.isOptional,
      isClassTeacher,
      students: students.filter((student) => student.gradeId === assignment.gradeId),
    };
  });

  return rows.filter((row) => {
    if (filters.teacherId !== undefined && filters.teacherId > 0 && row.teacherId !== filters.teacherId) {
      return false;
    }

    if (nameQuery && !row.teacherName.toLowerCase().includes(nameQuery)) {
      return false;
    }

    if (filters.gradeId !== undefined && filters.gradeId > 0 && row.gradeId !== filters.gradeId) {
      return false;
    }

    if (filters.subjectId !== undefined && filters.subjectId > 0 && row.subjectId !== filters.subjectId) {
      return false;
    }

    if (filters.subjectType === 'compulsory' && row.isOptional) {
      return false;
    }

    if (filters.subjectType === 'optional' && !row.isOptional) {
      return false;
    }

    if (filters.classTeacher === 'yes' && !row.isClassTeacher) {
      return false;
    }

    if (filters.classTeacher === 'no' && row.isClassTeacher) {
      return false;
    }

    return true;
  });
}
