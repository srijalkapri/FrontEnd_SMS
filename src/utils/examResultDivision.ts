import type {
  AdminStudentMarksRow,
  DivisionLabel,
  ExamResultStats,
  StudentExamResultSubject,
  StudentExamResultSummary,
} from '../types/examResult';

export const PASS_MARK_PERCENT = 40;

export const DIVISION_OPTIONS: { value: DivisionLabel; label: string }[] = [
  { value: 'Distinction', label: 'Distinction (≥ 80%)' },
  { value: 'First', label: 'First (≥ 70%)' },
  { value: 'Second', label: 'Second (≥ 50%)' },
  { value: 'Third', label: 'Third (≥ 40%)' },
  { value: 'Failed', label: 'Failed' },
];

export const DIVISION_BAND_HINT =
  'Pass requires every subject ≥40% (and not absent), plus overall ≥40%. Divisions: Distinction ≥80, First ≥70, Second ≥50, Third ≥40.';

export interface SubjectMarkInput {
  marksObtained: number | null;
  totalMarks: number;
  isAbsent: boolean;
}

/**
 * Backend classification rules:
 * Fail if absent in any subject, any subject below 40%, or overall below 40%.
 * Otherwise assign division from overall percentage bands.
 */
export function classifyExamResult(
  percentage: number,
  subjects?: SubjectMarkInput[] | null,
): { division: DivisionLabel; isPassed: boolean } {
  const pct = Number.isFinite(percentage) ? percentage : 0;

  if (subjects && subjects.length > 0) {
    for (const subject of subjects) {
      if (subject.isAbsent) {
        return { division: 'Failed', isPassed: false };
      }
      const total = subject.totalMarks;
      const obtained = subject.marksObtained;
      if (obtained == null || total <= 0) {
        return { division: 'Failed', isPassed: false };
      }
      const subjectPct = (obtained / total) * 100;
      if (subjectPct < PASS_MARK_PERCENT) {
        return { division: 'Failed', isPassed: false };
      }
    }
  }

  if (pct < PASS_MARK_PERCENT) {
    return { division: 'Failed', isPassed: false };
  }

  if (pct >= 80) return { division: 'Distinction', isPassed: true };
  if (pct >= 70) return { division: 'First', isPassed: true };
  if (pct >= 50) return { division: 'Second', isPassed: true };
  return { division: 'Third', isPassed: true };
}

export function normalizeDivisionLabel(value: unknown): DivisionLabel | null {
  if (value == null) return null;
  const key = String(value).trim().toLowerCase();
  if (key === 'distinction') return 'Distinction';
  if (key === 'first' || key === 'first division') return 'First';
  if (key === 'second' || key === 'second division') return 'Second';
  if (key === 'third' || key === 'third division') return 'Third';
  if (key === 'fail' || key === 'failed' || key === 'fail division') return 'Failed';
  return null;
}

function pickNumber(raw: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return undefined;
}

function pickBoolean(raw: Record<string, unknown>, keys: string[]): boolean | undefined {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true' || normalized === 'passed' || normalized === 'pass' || normalized === 'yes') {
        return true;
      }
      if (normalized === 'false' || normalized === 'failed' || normalized === 'fail' || normalized === 'no') {
        return false;
      }
    }
  }
  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

/** Map API stats payload (camelCase / PascalCase / *Count aliases) into a stable shape. */
export function normalizeExamResultStats(
  rawInput: unknown,
  examScheduleId: number,
): ExamResultStats {
  const raw = asRecord(rawInput);
  return {
    examScheduleId:
      pickNumber(raw, ['examScheduleId', 'ExamScheduleId']) ?? examScheduleId,
    totalStudents: pickNumber(raw, ['totalStudents', 'TotalStudents', 'total', 'Total']) ?? 0,
    passed:
      pickNumber(raw, ['passed', 'Passed', 'passedCount', 'PassedCount', 'passCount', 'PassCount']) ??
      0,
    failed:
      pickNumber(raw, ['failed', 'Failed', 'failedCount', 'FailedCount', 'failCount', 'FailCount']) ??
      0,
    distinction:
      pickNumber(raw, [
        'distinction',
        'Distinction',
        'distinctionCount',
        'DistinctionCount',
      ]) ?? 0,
    first:
      pickNumber(raw, [
        'first',
        'First',
        'firstCount',
        'FirstCount',
        'firstDivision',
        'FirstDivision',
      ]) ?? 0,
    second:
      pickNumber(raw, [
        'second',
        'Second',
        'secondCount',
        'SecondCount',
        'secondDivision',
        'SecondDivision',
      ]) ?? 0,
    third:
      pickNumber(raw, [
        'third',
        'Third',
        'thirdCount',
        'ThirdCount',
        'thirdDivision',
        'ThirdDivision',
      ]) ?? 0,
  };
}

export function normalizeExamResultSummary(
  rawInput: unknown,
  subjects?: SubjectMarkInput[] | null,
): StudentExamResultSummary | null {
  const raw = asRecord(rawInput);
  const studentId = pickNumber(raw, ['studentId', 'StudentId', 'id', 'Id']);
  if (studentId == null) return null;

  const totalObtained =
    pickNumber(raw, ['totalObtained', 'TotalObtained', 'obtained', 'Obtained']) ?? 0;
  const totalMarks = pickNumber(raw, ['totalMarks', 'TotalMarks', 'total', 'Total']) ?? 0;
  const percentage =
    pickNumber(raw, ['percentage', 'Percentage', 'percent', 'Percent']) ??
    (totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0);

  const apiDivision = normalizeDivisionLabel(
    raw.division ?? raw.Division ?? raw.divisionName ?? raw.DivisionName,
  );
  const apiPassed = pickBoolean(raw, [
    'isPassed',
    'IsPassed',
    'passed',
    'Passed',
    'hasPassed',
    'HasPassed',
  ]);

  // Subject-aware rules when we have per-subject marks; otherwise trust API, then overall %.
  const classified = classifyExamResult(percentage, subjects);
  const useSubjectRules = Boolean(subjects && subjects.length > 0);
  const division = useSubjectRules
    ? classified.division
    : (apiDivision ?? classified.division);
  const isPassed = useSubjectRules
    ? classified.isPassed
    : (apiPassed ?? classified.isPassed);

  return {
    studentId,
    studentName: String(raw.studentName ?? raw.StudentName ?? raw.name ?? raw.Name ?? 'Student'),
    totalObtained,
    totalMarks,
    percentage,
    division,
    isPassed,
  };
}

export function normalizeExamResultSummaries(
  rawInput: unknown,
  subjectsByStudentId?: Map<number, SubjectMarkInput[]>,
): StudentExamResultSummary[] {
  const list = Array.isArray(rawInput)
    ? rawInput
    : Array.isArray((rawInput as { data?: unknown })?.data)
      ? ((rawInput as { data: unknown[] }).data)
      : Array.isArray((rawInput as { items?: unknown })?.items)
        ? ((rawInput as { items: unknown[] }).items)
        : [];

  return list
    .map((item) => {
      const raw = asRecord(item);
      const studentId = pickNumber(raw, ['studentId', 'StudentId', 'id', 'Id']);
      const subjects =
        studentId != null ? subjectsByStudentId?.get(studentId) : undefined;
      return normalizeExamResultSummary(item, subjects);
    })
    .filter((item): item is StudentExamResultSummary => item != null);
}

export function subjectsToMarkInputs(
  subjects: StudentExamResultSubject[],
): SubjectMarkInput[] {
  return subjects.map((subject) => ({
    marksObtained: subject.marksObtained,
    totalMarks: subject.totalMarks,
    isAbsent: subject.isAbsent,
  }));
}

/** Re-apply full pass/fail rules using published subject marks from BySchedule. */
export function enrichSummariesWithSubjects(
  summaries: StudentExamResultSummary[],
  students?: AdminStudentMarksRow[] | null,
): StudentExamResultSummary[] {
  if (!students?.length) return summaries;
  const byId = new Map(students.map((student) => [student.studentId, student]));

  return summaries.map((row) => {
    const detail = byId.get(row.studentId);
    if (!detail) return row;
    const classified = classifyExamResult(
      detail.percentage,
      subjectsToMarkInputs(detail.subjects),
    );
    return {
      ...row,
      totalObtained: detail.totalObtained,
      totalMarks: detail.totalMarks,
      percentage: detail.percentage,
      division: classified.division,
      isPassed: classified.isPassed,
    };
  });
}

export function buildSubjectsByStudentId(
  students?: AdminStudentMarksRow[] | null,
): Map<number, SubjectMarkInput[]> | undefined {
  if (!students?.length) return undefined;
  return new Map(
    students.map((student) => [student.studentId, subjectsToMarkInputs(student.subjects)]),
  );
}

export function computeStatsFromSummaries(
  examScheduleId: number,
  summaries: StudentExamResultSummary[],
): ExamResultStats {
  const stats: ExamResultStats = {
    examScheduleId,
    totalStudents: summaries.length,
    passed: 0,
    failed: 0,
    distinction: 0,
    first: 0,
    second: 0,
    third: 0,
  };

  for (const row of summaries) {
    if (row.isPassed) stats.passed += 1;
    else stats.failed += 1;

    if (row.division === 'Distinction') stats.distinction += 1;
    else if (row.division === 'First') stats.first += 1;
    else if (row.division === 'Second') stats.second += 1;
    else if (row.division === 'Third') stats.third += 1;
  }

  return stats;
}

export function statsLookIncomplete(stats: ExamResultStats): boolean {
  const bandTotal = stats.distinction + stats.first + stats.second + stats.third;
  const outcomeTotal = stats.passed + stats.failed;
  if (stats.totalStudents > 0 && outcomeTotal === 0 && bandTotal === 0) return true;
  if (stats.totalStudents > 0 && outcomeTotal === 0) return true;
  return false;
}

export function filterSummaries(
  summaries: StudentExamResultSummary[],
  filters: { division?: string; minPercentage?: number; maxPercentage?: number },
): StudentExamResultSummary[] {
  return summaries.filter((row) => {
    if (filters.division) {
      const wanted = normalizeDivisionLabel(filters.division);
      if (wanted && row.division !== wanted) return false;
    }
    if (filters.minPercentage != null && row.percentage < filters.minPercentage) return false;
    if (filters.maxPercentage != null && row.percentage > filters.maxPercentage) return false;
    return true;
  });
}

export function getDivisionBadgeClass(division: string): string {
  const key = division.trim().toLowerCase();
  if (key === 'distinction') return 'exam-division-badge exam-division-badge--distinction';
  if (key === 'first') return 'exam-division-badge exam-division-badge--first';
  if (key === 'second') return 'exam-division-badge exam-division-badge--second';
  if (key === 'third') return 'exam-division-badge exam-division-badge--third';
  return 'exam-division-badge exam-division-badge--fail';
}

export function formatPercentage(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return `${value.toFixed(2)}%`;
}
