import type { TeacherReportRow } from './teacherReportFilters';
import { getSubjectTypeLabel } from './subjectType';
import { downloadCsv } from './downloadCsv';

const HEADERS = ['Teacher ID', 'Name', 'Grade', 'Subject', 'Subject Type', 'Class Teacher'];

function teacherRowToCsv(row: TeacherReportRow): string[] {
  return [
    String(row.teacherId),
    row.teacherName,
    row.gradeName,
    row.subjectName,
    getSubjectTypeLabel(row.isOptional),
    row.isClassTeacher ? 'Yes' : 'No',
  ];
}

export function downloadTeacherReportCsv(rows: TeacherReportRow[]): void {
  const date = new Date().toISOString().slice(0, 10);
  const filename = `teacher-report-${date}.csv`;
  downloadCsv(filename, HEADERS, rows.map(teacherRowToCsv));
}
