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
  className: string;
  level?: number;
}

/** Build enrollment counts for every grade, including grades with zero students. */
export function buildEnrollmentByGrade(
  grades: GradeLike[],
  students: { gradeName: string }[],
): ChartDatum[] {
  const counts = new Map<string, number>();
  for (const student of students) {
    const key = student.gradeName?.trim() || 'Unassigned';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const sortedGrades = [...grades].sort(
    (a, b) => (a.level ?? 0) - (b.level ?? 0) || a.className.localeCompare(b.className),
  );

  const data: ChartDatum[] = sortedGrades.map((grade, index) => ({
    label: grade.className,
    value: counts.get(grade.className) ?? 0,
    color: CHART_PALETTE[index % CHART_PALETTE.length],
  }));

  const knownGradeNames = new Set(sortedGrades.map((g) => g.className));
  let unassigned = 0;
  for (const [name, count] of counts.entries()) {
    if (!knownGradeNames.has(name)) {
      unassigned += count;
    }
  }
  if (unassigned > 0) {
    data.push({ label: 'Unassigned', value: unassigned, color: '#94a3b8' });
  }

  return data;
}
