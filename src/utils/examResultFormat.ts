import type {
  ExamResultItemDraft,
  TeacherExamResultItem,
  TeacherExamResultItemRequest,
} from '../types/examResult';

export function itemsToDrafts(items: TeacherExamResultItem[]): ExamResultItemDraft[] {
  return items.map((item) => ({
    studentId: item.studentId,
    studentName: item.studentName,
    marksObtained: item.marksObtained != null ? String(item.marksObtained) : '',
    totalMarks: String(item.totalMarks),
    isAbsent: item.isAbsent,
    remarks: item.remarks ?? '',
  }));
}

export function draftsToRequestItems(drafts: ExamResultItemDraft[]): TeacherExamResultItemRequest[] {
  return drafts.map((draft) => ({
    studentId: draft.studentId,
    marksObtained: draft.isAbsent
      ? null
      : draft.marksObtained.trim() === ''
        ? null
        : Number(draft.marksObtained),
    totalMarks: Number(draft.totalMarks),
    isAbsent: draft.isAbsent,
    remarks: draft.remarks.trim() || null,
  }));
}

export function validateExamResultDrafts(drafts: ExamResultItemDraft[]): string | null {
  for (const draft of drafts) {
    const totalMarks = Number(draft.totalMarks);
    if (!Number.isFinite(totalMarks) || totalMarks <= 0) {
      return `Total marks must be greater than 0 for ${draft.studentName}.`;
    }

    if (draft.isAbsent) {
      continue;
    }

    if (draft.marksObtained.trim() === '') {
      return `Marks obtained is required for ${draft.studentName} when not absent.`;
    }

    const marksObtained = Number(draft.marksObtained);
    if (!Number.isFinite(marksObtained) || marksObtained < 0) {
      return `Marks obtained must be 0 or greater for ${draft.studentName}.`;
    }

    if (marksObtained > totalMarks) {
      return `Marks obtained cannot exceed total marks for ${draft.studentName}.`;
    }
  }

  return null;
}

export function formatResultDateTime(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatMarks(
  marksObtained: number | null,
  totalMarks: number,
  isAbsent: boolean,
): string {
  if (isAbsent) return 'Absent';
  if (marksObtained == null) return '—';
  return `${marksObtained} / ${totalMarks}`;
}
