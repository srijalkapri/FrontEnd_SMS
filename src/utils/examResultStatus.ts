import type { ExamResultStatusLabel } from '../types/examResult';

export function getExamResultStatusLabel(status: ExamResultStatusLabel | null | undefined): string {
  switch (status) {
    case 'Draft':
      return 'Draft';
    case 'PendingApproval':
      return 'Pending approval';
    case 'Approved':
      return 'Approved';
    case 'Rejected':
      return 'Rejected';
    default:
      return 'Not started';
  }
}

export function getExamResultStatusClass(status: ExamResultStatusLabel | null | undefined): string {
  switch (status) {
    case 'Draft':
      return 'exam-result-status--draft';
    case 'PendingApproval':
      return 'exam-result-status--pending';
    case 'Approved':
      return 'exam-result-status--approved';
    case 'Rejected':
      return 'exam-result-status--rejected';
    default:
      return 'exam-result-status--none';
  }
}

export function isExamResultEditable(status: ExamResultStatusLabel): boolean {
  return status === 'Draft' || status === 'Rejected';
}

export function isExamResultLocked(status: ExamResultStatusLabel): boolean {
  return status === 'PendingApproval' || status === 'Approved';
}
