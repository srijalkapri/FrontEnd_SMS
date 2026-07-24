import type { ReExamRequestStatus } from '../types/reExam';

export function getReExamStatusLabel(status: ReExamRequestStatus | string | null | undefined): string {
  switch (status) {
    case 'Requested':
      return 'Pending approval';
    case 'Approved':
      return 'Approved — awaiting marks';
    case 'Rejected':
      return 'Request rejected';
    case 'MarksSubmitted':
      return 'Marks pending approval';
    case 'MarksApproved':
      return 'Marks approved';
    case 'MarksRejected':
      return 'Marks rejected';
    default:
      return 'Unknown';
  }
}

export function getReExamStatusClass(status: ReExamRequestStatus | string | null | undefined): string {
  switch (status) {
    case 'Requested':
    case 'MarksSubmitted':
      return 'exam-result-status--pending';
    case 'Approved':
      return 'exam-result-status--draft';
    case 'MarksApproved':
      return 'exam-result-status--approved';
    case 'Rejected':
    case 'MarksRejected':
      return 'exam-result-status--rejected';
    default:
      return 'exam-result-status--none';
  }
}

export function canReviewReExamRequest(status: ReExamRequestStatus | string): boolean {
  return status === 'Requested';
}

export function canReviewReExamMarks(status: ReExamRequestStatus | string): boolean {
  return status === 'MarksSubmitted';
}

export function canTeacherSubmitReExamMarks(status: ReExamRequestStatus | string): boolean {
  return status === 'Approved' || status === 'MarksRejected';
}
