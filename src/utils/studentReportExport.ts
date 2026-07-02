import type { Student } from '../types/student';
import { downloadCsv } from './downloadCsv';

const HEADERS = ['ID', 'Name', 'Grade', 'Phone', 'Email', 'Subjects'];

function studentToRow(student: Student): string[] {
  return [
    String(student.id),
    student.name,
    student.gradeName,
    student.phoneNo,
    student.email,
    String(student.subjects.length),
  ];
}

export function downloadStudentReportCsv(students: Student[]): void {
  const date = new Date().toISOString().slice(0, 10);
  const filename = `student-report-${date}.csv`;
  downloadCsv(filename, HEADERS, students.map(studentToRow));
}
