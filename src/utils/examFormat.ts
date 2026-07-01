import type { ExamSession, ExamSessionDraft } from '../types/exam';

export function formatExamDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatExamTime(value: string | null): string {
  if (!value) return '—';
  const parts = value.split(':');
  if (parts.length < 2) return value;
  return `${parts[0]}:${parts[1]}`;
}

export function toDateInputValue(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function toTimeInputValue(value: string | null): string {
  if (!value) return '';
  const parts = value.split(':');
  if (parts.length < 2) return '';
  return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
}

export function toApiTime(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  return null;
}

export function toApiDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return `${trimmed}T00:00:00.000Z`;
}

export function sessionToDraft(session: ExamSession): ExamSessionDraft {
  return {
    id: session.id,
    examDate: toDateInputValue(session.examDate),
    startTime: toTimeInputValue(session.startTime),
    endTime: toTimeInputValue(session.endTime),
    invigilatorTeacherId: session.invigilatorTeacherId?.toString() ?? '',
    notes: session.notes ?? '',
  };
}

export function draftToBulkItem(draft: ExamSessionDraft) {
  return {
    id: draft.id,
    examDate: toApiDate(draft.examDate),
    startTime: toApiTime(draft.startTime),
    endTime: toApiTime(draft.endTime),
    invigilatorTeacherId: draft.invigilatorTeacherId
      ? parseInt(draft.invigilatorTeacherId, 10)
      : null,
    notes: draft.notes.trim() || null,
  };
}

export function countConfiguredSessions(sessions: ExamSession[] | undefined | null): number {
  return (sessions ?? []).filter(
    (session) => session.examDate && session.invigilatorTeacherId,
  ).length;
}
