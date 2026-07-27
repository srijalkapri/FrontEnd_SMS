export interface ChartDatum {
  label: string;
  value: number;
  color?: string;
}

export function subjectScorePercent(
  marksObtained: number | null,
  totalMarks: number,
  isAbsent: boolean,
): number | null {
  if (isAbsent || totalMarks <= 0 || marksObtained == null) return null;
  return Math.round((marksObtained / totalMarks) * 100);
}

export function groupCountByField<T>(items: T[], getKey: (item: T) => string): ChartDatum[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = getKey(item) || 'Unknown';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function countByStatus<T>(
  items: T[],
  getStatus: (item: T) => string | null | undefined,
  statusOrder?: string[],
): ChartDatum[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const status = getStatus(item) ?? 'Not started';
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }
  const entries = Array.from(counts.entries()).map(([label, value]) => ({ label, value }));
  if (statusOrder) {
    return entries.sort(
      (a, b) => statusOrder.indexOf(a.label) - statusOrder.indexOf(b.label),
    );
  }
  return entries.sort((a, b) => b.value - a.value);
}

export const CHART_PALETTE = [
  '#6366f1',
  '#8b5cf6',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];

export function withChartColors(data: ChartDatum[]): ChartDatum[] {
  return data.map((item, index) => ({
    ...item,
    color: item.color ?? CHART_PALETTE[index % CHART_PALETTE.length],
  }));
}

export function formatPercent(value: number): string {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;
}

export function truncateLabel(label: string, max = 14): string {
  if (label.length <= max) return label;
  return `${label.slice(0, max - 1)}…`;
}

/** Integer Y-axis ticks for count-based charts (students, classes, etc.) */
export function computeIntegerTicks(max: number, desiredSteps = 4): number[] {
  if (max <= 0) return [0];
  const step = Math.max(1, Math.ceil(max / desiredSteps));
  const ticks: number[] = [];
  for (let value = 0; value <= max; value += step) {
    ticks.push(value);
  }
  if (ticks[ticks.length - 1] < max) {
    ticks.push(max);
  }
  return [...ticks].reverse();
}

export function scaleMaxForTicks(max: number, desiredSteps = 4): number {
  if (max <= 0) return 1;
  // Keep axis tight for small counts so bars fill the chart area
  if (max <= 10) return max;
  const step = Math.max(1, Math.ceil(max / desiredSteps));
  return Math.ceil(max / step) * step;
}

export interface GradeLike {
  id: number;
  className: string;
  level?: number;
}

/**
 * Round share percentages so they always sum to 100.
 * Uses the largest-remainder method (floor first, then give leftover points
 * to the largest fractional parts).
 */
export function allocatePercentages(values: number[]): number[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) return values.map(() => 0);

  const exact = values.map((value) => (value / total) * 100);
  const floored = exact.map((value) => Math.floor(value));
  let leftover = 100 - floored.reduce((sum, value) => sum + value, 0);

  const order = exact
    .map((value, index) => ({ index, fraction: value - floored[index] }))
    .sort((a, b) => b.fraction - a.fraction || values[b.index] - values[a.index]);

  const result = [...floored];
  for (let i = 0; i < leftover; i += 1) {
    result[order[i].index] += 1;
  }
  return result;
}

/** Build enrollment counts for every grade, including grades with zero students. */
export function buildEnrollmentByGrade(
  grades: GradeLike[],
  students: { gradeId: number; gradeName?: string }[],
): ChartDatum[] {
  const countsById = new Map<number, number>();
  for (const student of students) {
    if (student.gradeId == null || Number.isNaN(student.gradeId)) continue;
    countsById.set(student.gradeId, (countsById.get(student.gradeId) ?? 0) + 1);
  }

  const sortedGrades = [...grades].sort(
    (a, b) => (a.level ?? 0) - (b.level ?? 0) || a.className.localeCompare(b.className),
  );

  const knownIds = new Set(sortedGrades.map((grade) => grade.id));
  const data: ChartDatum[] = sortedGrades.map((grade, index) => ({
    label: grade.className,
    value: countsById.get(grade.id) ?? 0,
    color: CHART_PALETTE[index % CHART_PALETTE.length],
  }));

  let unassigned = 0;
  for (const [gradeId, count] of countsById.entries()) {
    if (!knownIds.has(gradeId)) {
      unassigned += count;
    }
  }
  if (unassigned > 0) {
    data.push({ label: 'Unassigned', value: unassigned, color: '#94a3b8' });
  }

  return data;
}
