import { ExamScheduleStatus } from '../types/exam';

export function getExamStatusLabel(status: ExamScheduleStatus): string {
  switch (status) {
    case ExamScheduleStatus.Published:
      return 'Published';
    case ExamScheduleStatus.Draft:
    default:
      return 'Draft';
  }
}

export function isExamSchedulePublished(status: ExamScheduleStatus): boolean {
  return status === ExamScheduleStatus.Published;
}
