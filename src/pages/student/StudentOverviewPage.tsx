import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { studentPortalApi } from '../../api/studentPortalApi';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { DashboardKpi } from '../../components/dashboard/DashboardKpi';
import { PieChart } from '../../components/dashboard/PieChart';
import { RadialGauge } from '../../components/dashboard/RadialGauge';
import { VerticalBarChart } from '../../components/dashboard/VerticalBarChart';
import { PageHeader } from '../../components/layout/PageHeader';
import { useToast } from '../../context/ToastContext';
import type { StudentExamResultSchedule } from '../../types/examResult';
import type { ReExamRequest } from '../../types/reExam';
import type { StudentPortalOverview } from '../../types/studentPortal';
import {
  groupByFieldWithDetails,
  subjectScorePercent,
  withChartColors,
} from '../../utils/dashboardCharts';
import { getReExamStatusLabel } from '../../utils/reExamStatus';
import '../HomePage.css';
import '../PortalPages.css';
import '../../components/dashboard/Dashboard.css';

export function StudentOverviewPage() {
  const { showToast } = useToast();
  const [overview, setOverview] = useState<StudentPortalOverview | null>(null);
  const [results, setResults] = useState<StudentExamResultSchedule[]>([]);
  const [reExams, setReExams] = useState<ReExamRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedExamScheduleId, setSelectedExamScheduleId] = useState<number | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewResponse, resultsResponse, reExamsResponse] = await Promise.all([
        studentPortalApi.getOverview(),
        studentPortalApi.getResults(),
        studentPortalApi.getReExams(),
      ]);
      setOverview(overviewResponse.data);
      setResults(resultsResponse.data);
      setReExams(reExamsResponse.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard.';
      setError(message);
      showToast('error', message);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (results.length === 0) {
      setSelectedExamScheduleId(null);
      return;
    }

    setSelectedExamScheduleId((current) =>
      current != null && results.some((exam) => exam.examScheduleId === current)
        ? current
        : results[0].examScheduleId,
    );
  }, [results]);

  const latestExam = results[0] ?? null;
  const selectedExam =
    results.find((exam) => exam.examScheduleId === selectedExamScheduleId) ?? latestExam;
  const activeReExams = reExams.filter(
    (item) => !['MarksApproved', 'Rejected', 'MarksRejected'].includes(item.status),
  );

  const subjectChartData = useMemo(() => {
    if (!selectedExam) return [];
    return withChartColors(
      selectedExam.subjects
        .map((subject) => {
          const percent = subjectScorePercent(
            subject.marksObtained,
            subject.totalMarks,
            subject.isAbsent,
          );
          if (percent == null) return null;
          return { label: subject.subjectName, value: percent };
        })
        .filter((item): item is { label: string; value: number } => item != null),
    );
  }, [selectedExam]);

  const examComparisonData = useMemo(
    () =>
      withChartColors(
        [...results]
          .reverse()
          .map((exam) => ({
            label: exam.examTitle,
            value: Math.round(exam.percentage),
          })),
      ),
    [results],
  );

  const reExamStatusData = useMemo(
    () =>
      withChartColors(
        groupByFieldWithDetails(
          reExams,
          (item) => getReExamStatusLabel(item.status),
          (item) => item.subjectName || item.examTitle || `#${item.id}`,
          'Subjects',
        ),
      ),
    [reExams],
  );

  return (
    <div className="page-content portal-page">
      <PageHeader
        framed
        badge="Student Portal"
        title={overview ? `Welcome, ${overview.profile.name}` : 'Student Dashboard'}
        description="Track your academic progress, exam performance, and re-exam requests."
        actions={
          <button type="button" className="btn btn--ghost" onClick={fetchDashboard} disabled={loading}>
            Refresh
          </button>
        }
      />

      {error && <div className="portal-error">{error}</div>}

      <section className="dashboard-grid dashboard-grid--3">
        <DashboardKpi
          label="Latest exam score"
          value={loading ? '—' : latestExam ? `${Math.round(latestExam.percentage)}%` : '—'}
          meta={latestExam ? latestExam.examTitle : 'No published results yet'}
          to="/student/results"
          accent="indigo"
          icon="score"
        />
        <DashboardKpi
          label="Exams completed"
          value={loading ? '—' : results.length}
          meta={latestExam?.academicYear ? `Year ${latestExam.academicYear}` : 'Approved results'}
          to="/student/results"
          accent="emerald"
          icon="exam"
        />
        <DashboardKpi
          label="Active re-exams"
          value={loading ? '—' : activeReExams.length}
          meta={
            activeReExams.length > 0
              ? 'Requests in progress'
              : 'No pending re-exam activity'
          }
          to="/student/re-exams"
          accent="amber"
          icon="reexam"
        />
      </section>

      {latestExam && !loading && (
        <ChartCard
          title="Latest exam overview"
          subtitle={`${latestExam.examTitle}${latestExam.academicYear ? ` · ${latestExam.academicYear}` : ''}`}
          linkTo="/student/results"
          linkLabel="Full results"
        >
          <div className="dashboard-score-hero">
            <RadialGauge
              value={Math.round(latestExam.percentage)}
              label="Overall"
              sublabel={latestExam.examTitle}
            />
            <div className="dashboard-score-hero__details">
              <div className="dashboard-score-hero__exam">{latestExam.examTitle}</div>
              <div className="dashboard-score-hero__meta">
                {latestExam.subjects.length} subjects · {latestExam.totalObtained}/{latestExam.totalMarks} marks
              </div>
              <div className="dashboard-score-hero__stats">
                <div className="dashboard-score-hero__stat">
                  <span className="dashboard-score-hero__stat-value">{latestExam.subjects.length}</span>
                  <span className="dashboard-score-hero__stat-label">Subjects</span>
                </div>
                <div className="dashboard-score-hero__stat">
                  <span className="dashboard-score-hero__stat-value">{latestExam.totalObtained}</span>
                  <span className="dashboard-score-hero__stat-label">Obtained</span>
                </div>
                <div className="dashboard-score-hero__stat">
                  <span className="dashboard-score-hero__stat-value">{latestExam.totalMarks}</span>
                  <span className="dashboard-score-hero__stat-label">Total</span>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>
      )}

      <section className="dashboard-grid dashboard-grid--2">
        <ChartCard
          title="Subject performance"
          subtitle="Score by subject for the selected exam"
          headerExtra={
            results.length > 0 ? (
              <label className="dashboard-chart-card__exam-picker">
                <select
                  className="dashboard-chart-card__select"
                  value={selectedExamScheduleId ?? ''}
                  onChange={(event) => setSelectedExamScheduleId(Number(event.target.value))}
                  aria-label="Select exam for subject performance"
                >
                  {results.map((exam) => (
                    <option key={exam.examScheduleId} value={exam.examScheduleId}>
                      {exam.examTitle}
                      {exam.academicYear ? ` (${exam.academicYear})` : ''}
                    </option>
                  ))}
                </select>
              </label>
            ) : null
          }
          linkTo="/student/results"
          linkLabel="View results"
          empty={!loading && subjectChartData.length === 0}
          emptyMessage="No subject marks to display yet"
          emptyHint="Results appear here after exams are graded and approved."
        >
          <VerticalBarChart
            data={subjectChartData}
            mode="percent"
            maxValue={100}
          />
        </ChartCard>

        <ChartCard
          title="Exam comparison"
          subtitle="Overall percentage for each published exam"
          linkTo="/student/results"
          empty={!loading && examComparisonData.length === 0}
          emptyMessage="No exam history yet"
          emptyHint="Complete exams and wait for results to be published."
        >
          <VerticalBarChart
            data={examComparisonData}
            mode="percent"
            maxValue={100}
          />
        </ChartCard>
      </section>

      <section className="dashboard-grid dashboard-grid--2">
        {reExamStatusData.length > 0 ? (
          <ChartCard
            title="Re-exam breakdown"
            subtitle={`${reExams.length} total request${reExams.length === 1 ? '' : 's'}`}
            linkTo="/student/re-exams"
            linkLabel="Manage re-exams"
          >
            <PieChart
              data={reExamStatusData}
              centerValue={reExams.length}
              centerLabel="requests"
              valueUnit="request"
            />
          </ChartCard>
        ) : (
          <ChartCard
            title="Re-exam breakdown"
            subtitle="Track requests when you apply for a re-exam"
            linkTo="/student/re-exams"
            empty
            emptyMessage="No re-exam requests"
            emptyHint="Apply from your exam results page if eligible."
          />
        )}

        {overview && (
          <section className="card">
            <div className="card__header">
              <div>
                <h2 className="card__title">Academic overview</h2>
                <p className="card__subtitle">{overview.profile.gradeName}</p>
              </div>
              <Link to="/student/profile" className="btn btn--ghost">
                View profile
              </Link>
            </div>
            <div className="portal-stats" style={{ marginBottom: '1rem' }}>
              <Link to="/student/grade" className="portal-stat-card">
                <div className="portal-stat-card__label">Grade</div>
                <div className="portal-stat-card__value">{overview.grade.className}</div>
              </Link>
              <Link to="/student/subjects" className="portal-stat-card">
                <div className="portal-stat-card__label">Subjects</div>
                <div className="portal-stat-card__value">{overview.subjects.length}</div>
              </Link>
              <Link to="/student/teachers" className="portal-stat-card">
                <div className="portal-stat-card__label">Teachers</div>
                <div className="portal-stat-card__value">{overview.teachers.length}</div>
              </Link>
            </div>
            <div className="portal-profile-grid">
              <div className="portal-profile-item">
                <span className="portal-profile-item__label">Email</span>
                <span className="portal-profile-item__value">{overview.profile.email}</span>
              </div>
              <div className="portal-profile-item">
                <span className="portal-profile-item__label">Phone</span>
                <span className="portal-profile-item__value">{overview.profile.phoneNo}</span>
              </div>
            </div>
          </section>
        )}
      </section>
    </div>
  );
}
