import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { gradeApi } from '../api/gradeApi';
import { gradeSubjectApi } from '../api/gradeSubjectApi';
import { studentApi } from '../api/studentApi';
import { subjectApi } from '../api/subjectApi';
import { teacherApi } from '../api/teacherApi';
import { ChartCard } from '../components/dashboard/ChartCard';
import { DashboardKpi } from '../components/dashboard/DashboardKpi';
import { EnrollmentChart } from '../components/dashboard/EnrollmentChart';
import { PieChart } from '../components/dashboard/PieChart';
import { PageHeader } from '../components/layout/PageHeader';
import { useAdminPendingCounts } from '../hooks/useAdminPendingCounts';
import type { Grade } from '../types/grade';
import type { Student } from '../types/student';
import { buildEnrollmentByGrade, withChartColors } from '../utils/dashboardCharts';
import '../components/dashboard/Dashboard.css';
import './HomePage.css';

interface DashboardStats {
  grades: number;
  subjects: number;
  teachers: number;
  students: number;
  gradeSubjects: number;
}

const quickLinks = [
  { to: '/grades', label: 'Grades', description: 'Manage class levels', color: 'indigo' },
  { to: '/subjects', label: 'Subjects', description: 'Curriculum subjects', color: 'violet' },
  { to: '/teachers', label: 'Teachers', description: 'Faculty directory', color: 'blue' },
  { to: '/students', label: 'Students', description: 'Student records', color: 'emerald' },
  { to: '/grade-subjects', label: 'Grade Subjects', description: 'Grade–subject mappings', color: 'amber' },
  { to: '/exams', label: 'Exam Schedules', description: 'Plan and publish exams', color: 'rose' },
];

const defaultStats: DashboardStats = {
  grades: 0,
  subjects: 0,
  teachers: 0,
  students: 0,
  gradeSubjects: 0,
};

export function HomePage() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const { pendingUsers, pendingResultApprovals, pendingReExams } = useAdminPendingCounts();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [gradesResponse, subjects, teachers, studentsResponse, gradeSubjects] = await Promise.all([
        gradeApi.getAll(),
        subjectApi.getAll(),
        teacherApi.getAll(),
        studentApi.getAll(),
        gradeSubjectApi.getAll(),
      ]);

      setGrades(gradesResponse.data);
      setStudents(studentsResponse.data);
      setStats({
        grades: gradesResponse.data.length,
        subjects: subjects.data.length,
        teachers: teachers.data.length,
        students: studentsResponse.data.length,
        gradeSubjects: gradeSubjects.data.length,
      });
    } catch {
      setStats(defaultStats);
      setStudents([]);
      setGrades([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const enrollmentByGrade = useMemo(
    () => buildEnrollmentByGrade(grades, students),
    [grades, students],
  );

  const peopleOverview = useMemo(
    () =>
      withChartColors(
        [
          { label: 'Students', value: stats.students, color: '#10b981' },
          { label: 'Teachers', value: stats.teachers, color: '#3b82f6' },
        ].filter((item) => item.value > 0),
      ),
    [stats.students, stats.teachers],
  );

  const pendingChartData = useMemo(
    () =>
      withChartColors([
        { label: 'Pending users', value: pendingUsers, color: '#f59e0b' },
        { label: 'Result approvals', value: pendingResultApprovals, color: '#6366f1' },
        { label: 'Re-exam approvals', value: pendingReExams, color: '#ec4899' },
      ].filter((item) => item.value > 0)),
    [pendingUsers, pendingResultApprovals, pendingReExams],
  );

  const totalPendingActions = pendingUsers + pendingResultApprovals + pendingReExams;

  return (
    <div className="page-content home-page">
      <PageHeader
        badge="Live overview"
        title="School Management"
        titleAccent="Portal"
        description="Monitor grades, subjects, teachers, and students at a glance. Review pending approvals and keep academic operations running smoothly."
        icon="dashboard"
        actions={
          <button type="button" className="btn btn--ghost" onClick={fetchStats} disabled={loading}>
            Refresh data
          </button>
        }
        stats={
          loading
            ? undefined
            : [
                { label: 'Students', value: stats.students },
                { label: 'Teachers', value: stats.teachers },
                {
                  label: 'Pending',
                  value: totalPendingActions,
                  tone: totalPendingActions > 0 ? 'alert' : 'success',
                },
              ]
        }
      />

      <section className="dashboard-grid dashboard-grid--3">
        <DashboardKpi
          label="Total students"
          value={loading ? '—' : stats.students}
          meta={`Across ${stats.grades} grade${stats.grades === 1 ? '' : 's'}`}
          to="/students"
          accent="emerald"
          icon="student"
        />
        <DashboardKpi
          label="Faculty"
          value={loading ? '—' : stats.teachers}
          meta={`${stats.subjects} subjects in curriculum`}
          to="/teachers"
          accent="blue"
          icon="faculty"
        />
        <DashboardKpi
          label="Pending actions"
          value={totalPendingActions}
          meta={
            totalPendingActions > 0
              ? 'Users, results, and re-exams awaiting review'
              : 'All caught up'
          }
          to="/admin/pending-users"
          accent="amber"
          icon="pending"
        />
      </section>

      <section className="dashboard-grid dashboard-grid--2">
        <ChartCard
          title="Enrollment by grade"
          subtitle={`${stats.students} enrolled student${stats.students === 1 ? '' : 's'} · ${stats.grades} grade${stats.grades === 1 ? '' : 's'} in system`}
          linkTo="/students"
          linkLabel="Manage students"
          empty={!loading && stats.students === 0 && grades.length === 0}
          emptyMessage="No grades or students yet"
          emptyHint="Create grades first, then enroll students."
        >
          <EnrollmentChart data={enrollmentByGrade} totalStudents={stats.students} />
        </ChartCard>

        {peopleOverview.length > 0 && (
          <ChartCard
            title="Students vs teachers"
            subtitle={`${stats.students + stats.teachers} people in the system`}
          >
            <PieChart
              data={peopleOverview}
              centerValue={stats.students + stats.teachers}
              centerLabel="people"
              size={248}
            />
          </ChartCard>
        )}
      </section>

      <section className="dashboard-grid dashboard-grid--2">
        {pendingChartData.length > 0 ? (
          <ChartCard
            title="Pending approvals"
            subtitle={`${totalPendingActions} item${totalPendingActions === 1 ? '' : 's'} need review`}
          >
            <PieChart
              data={pendingChartData}
              centerValue={totalPendingActions}
              centerLabel="pending"
            />
          </ChartCard>
        ) : (
          <ChartCard
            title="Pending approvals"
            subtitle="All caught up — nothing awaiting review"
            empty
            emptyMessage="No pending approvals"
            emptyHint="New registrations and submitted results will appear here."
          />
        )}

        <ChartCard title="Quick actions" subtitle="Jump to items needing attention">
          <div className="dashboard-pending-panel">
            <Link to="/admin/pending-users" className="dashboard-pending-item">
              <div>
                <div className="dashboard-pending-item__label">Pending users</div>
                <div className="dashboard-pending-item__desc">New registrations awaiting approval</div>
              </div>
              <span
                className={`dashboard-pending-item__count${
                  pendingUsers > 0 ? ' dashboard-pending-item__count--alert' : ''
                }`}
              >
                {pendingUsers}
              </span>
            </Link>
            <Link to="/exams/result-approvals" className="dashboard-pending-item">
              <div>
                <div className="dashboard-pending-item__label">Result approvals</div>
                <div className="dashboard-pending-item__desc">Teacher-submitted marks to review</div>
              </div>
              <span
                className={`dashboard-pending-item__count${
                  pendingResultApprovals > 0 ? ' dashboard-pending-item__count--alert' : ''
                }`}
              >
                {pendingResultApprovals}
              </span>
            </Link>
            <Link to="/exams/re-exams" className="dashboard-pending-item">
              <div>
                <div className="dashboard-pending-item__label">Re-exam approvals</div>
                <div className="dashboard-pending-item__desc">Requests and marks pending review</div>
              </div>
              <span
                className={`dashboard-pending-item__count${
                  pendingReExams > 0 ? ' dashboard-pending-item__count--alert' : ''
                }`}
              >
                {pendingReExams}
              </span>
            </Link>
          </div>
        </ChartCard>
      </section>

      <section className="home-stats">
        <h3 className="home-section__title">Records at a glance</h3>
        <div className="home-stats__grid">
          {[
            { label: 'Grades', value: stats.grades, to: '/grades' },
            { label: 'Subjects', value: stats.subjects, to: '/subjects' },
            { label: 'Teachers', value: stats.teachers, to: '/teachers' },
            { label: 'Students', value: stats.students, to: '/students' },
            { label: 'Mappings', value: stats.gradeSubjects, to: '/grade-subjects' },
          ].map((card) => (
            <Link key={card.label} to={card.to} className="home-stat-card">
              <span className="home-stat-card__label">{card.label}</span>
              <span className="home-stat-card__value">{loading ? '—' : card.value}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-links">
        <h3 className="home-section__title">Quick access</h3>
        <div className="home-links__grid">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`home-link-card home-link-card--${link.color}`}
            >
              <span className="home-link-card__icon">{link.label.charAt(0)}</span>
              <div>
                <div className="home-link-card__title">{link.label}</div>
                <div className="home-link-card__desc">{link.description}</div>
              </div>
              <svg className="home-link-card__arrow" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L10.94 10 7.23 6.29a.75.75 0 111.06-1.06l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06 0z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
