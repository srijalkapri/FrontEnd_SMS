import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { teacherPortalApi } from '../../api/teacherPortalApi';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { DashboardKpi } from '../../components/dashboard/DashboardKpi';
import { DonutChart } from '../../components/dashboard/DonutChart';
import { PieChart } from '../../components/dashboard/PieChart';
import { VerticalBarChart } from '../../components/dashboard/VerticalBarChart';
import { PageHeader } from '../../components/layout/PageHeader';
import { useToast } from '../../context/ToastContext';
import type { TeacherExamSession } from '../../types/examResult';
import type { ReExamRequest } from '../../types/reExam';
import type { TeacherPortalOverview } from '../../types/teacherPortal';
import { groupByFieldWithDetails, groupCountByField, withChartColors } from '../../utils/dashboardCharts';
import { getReExamStatusLabel } from '../../utils/reExamStatus';
import '../HomePage.css';
import '../PortalPages.css';
import '../../components/dashboard/Dashboard.css';

const EXAM_STATUS_ORDER = ['Approved', 'PendingApproval', 'Draft', 'Rejected', 'Not started'];

export function TeacherOverviewPage() {
  const { showToast } = useToast();
  const [overview, setOverview] = useState<TeacherPortalOverview | null>(null);
  const [examSessions, setExamSessions] = useState<TeacherExamSession[]>([]);
  const [reExams, setReExams] = useState<ReExamRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewResponse, sessionsResponse, reExamsResponse] = await Promise.all([
        teacherPortalApi.getOverview(),
        teacherPortalApi.getExamSessions(),
        teacherPortalApi.getReExams(),
      ]);
      setOverview(overviewResponse.data);
      setExamSessions(sessionsResponse.data);
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

  const pendingSessions = examSessions.filter((s) => s.resultStatus === 'PendingApproval');
  const draftSessions = examSessions.filter(
    (s) => !s.resultStatus || s.resultStatus === 'Draft' || s.resultStatus === 'Rejected',
  );
  const pendingReExams = reExams.filter((r) =>
    ['Approved', 'MarksRejected'].includes(r.status),
  );

  const statusChartData = useMemo(
    () =>
      withChartColors(
        groupByFieldWithDetails(
          examSessions,
          (session) => session.resultStatus ?? 'Not started',
          (session) =>
            `${session.subjectName}${session.gradeName ? ` (${session.gradeName})` : ''}`,
          'Sessions',
        ).sort(
          (a, b) =>
            EXAM_STATUS_ORDER.indexOf(a.label) - EXAM_STATUS_ORDER.indexOf(b.label),
        ),
      ),
    [examSessions],
  );

  const studentsByClass = useMemo(
    () =>
      withChartColors(
        groupCountByField(overview?.students ?? [], (student) => student.gradeName),
      ),
    [overview?.students],
  );

  const reExamChartData = useMemo(
    () =>
      withChartColors(
        groupByFieldWithDetails(
          reExams,
          (item) => getReExamStatusLabel(item.status),
          (item) => item.studentName || item.examTitle || `#${item.id}`,
          'Requests',
        ),
      ),
    [reExams],
  );

  const subjectsByGrade = useMemo(
    () =>
      withChartColors(
        groupByFieldWithDetails(
          overview?.subjects ?? [],
          (s) => s.gradeName,
          (s) => s.subjectName,
          'Subjects taught',
        ),
      ),
    [overview?.subjects],
  );

  return (
    <div className="page-content portal-page">
      <PageHeader
        framed
        badge="Teacher Portal"
        title={overview ? `Welcome, ${overview.profile.name}` : 'Teacher Dashboard'}
        description="Monitor your classes, exam marking progress, and re-exam workload."
        actions={
          <button type="button" className="btn btn--ghost" onClick={fetchDashboard} disabled={loading}>
            Refresh
          </button>
        }
      />

      {error && <div className="portal-error">{error}</div>}

      <section className="dashboard-grid dashboard-grid--3">
        <DashboardKpi
          label="Classes"
          value={loading ? '—' : overview?.classes.length ?? 0}
          meta="Grades you teach"
          to="/teacher/classes"
          accent="indigo"
          icon="class"
        />
        <DashboardKpi
          label="Students"
          value={loading ? '—' : overview?.students.length ?? 0}
          meta={`${overview?.subjects.length ?? 0} subject assignments`}
          to="/teacher/students"
          accent="emerald"
          icon="student"
        />
        <DashboardKpi
          label="Exams to action"
          value={loading ? '—' : draftSessions.length + pendingReExams.length}
          meta={
            pendingSessions.length > 0
              ? `${pendingSessions.length} awaiting admin approval`
              : 'Drafts and re-exams needing marks'
          }
          to="/teacher/exams"
          accent="amber"
          icon="exam"
        />
      </section>

      <section className="dashboard-grid dashboard-grid--2">
        <ChartCard
          title="Exam result status"
          subtitle={`${examSessions.length} exam session${examSessions.length === 1 ? '' : 's'} assigned`}
          linkTo="/teacher/exams"
          linkLabel="Open exams"
          empty={!loading && examSessions.length === 0}
          emptyMessage="No exam sessions yet"
          emptyHint="Exam sessions appear when schedules are published for your subjects."
        >
          <DonutChart data={statusChartData} size={220} valueUnit="session" />
        </ChartCard>

        <ChartCard
          title="Students by class"
          subtitle="Enrollment across your assigned grades"
          linkTo="/teacher/students"
          empty={!loading && studentsByClass.length === 0}
          emptyMessage="No students assigned"
          emptyHint="Students linked to your classes will appear here."
        >
          <VerticalBarChart
            data={studentsByClass}
            mode="count"
            formatValue={(value) => String(Math.round(value))}
          />
        </ChartCard>
      </section>

      <section className="dashboard-grid dashboard-grid--2">
        <ChartCard
          title="Subjects by grade"
          subtitle="Your teaching assignments distribution"
          linkTo="/teacher/subjects"
          linkLabel="View subjects"
          empty={!loading && subjectsByGrade.length === 0}
          emptyMessage="No subject assignments yet"
          emptyHint="Subjects appear here once you are assigned to grade subjects."
        >
          {subjectsByGrade.length > 0 && (
            <PieChart
              data={subjectsByGrade}
              centerValue={overview?.subjects.length ?? subjectsByGrade.reduce((sum, item) => sum + item.value, 0)}
              centerLabel="subjects"
              valueUnit="subject"
            />
          )}
        </ChartCard>

        {reExamChartData.length > 0 ? (
          <ChartCard
            title="Re-exam workload"
            subtitle={`${reExams.length} re-exam request${reExams.length === 1 ? '' : 's'}`}
            linkTo="/teacher/re-exams"
            linkLabel="View re-exams"
          >
            <PieChart
              data={reExamChartData}
              centerValue={reExams.length}
              centerLabel="total"
              valueUnit="request"
            />
          </ChartCard>
        ) : (
          <ChartCard
            title="Re-exam workload"
            subtitle="Re-exam marks you need to submit"
            linkTo="/teacher/re-exams"
            empty
            emptyMessage="No re-exam requests"
            emptyHint="Approved re-exam requests will appear here."
          />
        )}
      </section>

      {overview && (
        <section className="card">
          <div className="card__header">
            <div>
              <h2 className="card__title">Quick profile</h2>
              <p className="card__subtitle">{overview.profile.email}</p>
            </div>
            <Link to="/teacher/profile" className="btn btn--ghost">
              View profile
            </Link>
          </div>
          <div className="portal-profile-grid">
            <div className="portal-profile-item">
              <span className="portal-profile-item__label">Phone</span>
              <span className="portal-profile-item__value">{overview.profile.phoneNo}</span>
            </div>
            <div className="portal-profile-item">
              <span className="portal-profile-item__label">Subjects taught</span>
              <span className="portal-profile-item__value">{overview.subjects.length}</span>
            </div>
            <div className="portal-profile-item">
              <span className="portal-profile-item__label">Re-exams pending marks</span>
              <span className="portal-profile-item__value">{pendingReExams.length}</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
