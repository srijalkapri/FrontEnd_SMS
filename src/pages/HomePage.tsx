import { useCallback, useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import { gradeApi } from '../api/gradeApi';

import { gradeSubjectApi } from '../api/gradeSubjectApi';

import { studentApi } from '../api/studentApi';

import { subjectApi } from '../api/subjectApi';

import { teacherApi } from '../api/teacherApi';

import { PageHeader } from '../components/layout/PageHeader';

import './HomePage.css';



interface DashboardStats {

  grades: number;

  subjects: number;

  teachers: number;

  students: number;

  gradeSubjects: number;

}



const quickLinks = [

  {

    to: '/grades',

    label: 'Grades',

    description: 'Manage class levels',

    icon: 'layers',

    color: 'indigo',

  },

  {

    to: '/subjects',

    label: 'Subjects',

    description: 'Curriculum subjects',

    icon: 'book',

    color: 'violet',

  },

  {

    to: '/teachers',

    label: 'Teachers',

    description: 'Faculty directory',

    icon: 'users',

    color: 'blue',

  },

  {

    to: '/students',

    label: 'Students',

    description: 'Student records',

    icon: 'student',

    color: 'emerald',

  },

  {

    to: '/grade-subjects',

    label: 'Grade Subjects',

    description: 'Grade–subject mappings',

    icon: 'link',

    color: 'amber',

  },

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

  const [loading, setLoading] = useState(true);



  const fetchStats = useCallback(async () => {

    setLoading(true);

    try {

      const [grades, subjects, teachers, students, gradeSubjects] = await Promise.all([

        gradeApi.getAll(),

        subjectApi.getAll(),

        teacherApi.getAll(),

        studentApi.getAll(),

        gradeSubjectApi.getAll(),

      ]);



      setStats({

        grades: grades.data.length,

        subjects: subjects.data.length,

        teachers: teachers.data.length,

        students: students.data.length,

        gradeSubjects: gradeSubjects.data.length,

      });

    } catch {

      setStats(defaultStats);

    } finally {

      setLoading(false);

    }

  }, []);



  useEffect(() => {

    fetchStats();

  }, [fetchStats]);



  const statCards = [

    { label: 'Grades', value: stats.grades, to: '/grades' },

    { label: 'Subjects', value: stats.subjects, to: '/subjects' },

    { label: 'Teachers', value: stats.teachers, to: '/teachers' },

    { label: 'Students', value: stats.students, to: '/students' },

    { label: 'Mappings', value: stats.gradeSubjects, to: '/grade-subjects' },

  ];



  return (

    <div className="page-content home-page">

      <PageHeader

        badge="Dashboard"

        title="Welcome back"

        description="Overview of your school management system. Monitor records, jump to modules, and manage academic operations from one place."

        actions={

          <button type="button" className="btn btn--ghost" onClick={fetchStats} disabled={loading}>

            Refresh data

          </button>

        }

      />



      <section className="home-hero">

        <div className="home-hero__content">

          <h2 className="home-hero__title">School Management Portal</h2>

          <p className="home-hero__text">

            A centralized admin dashboard for grades, subjects, teachers, students, and

            grade-subject mappings. Keep your academic data organized and up to date.

          </p>

        </div>

        <div className="home-hero__accent" aria-hidden="true">

          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">

            <path

              strokeLinecap="round"

              strokeLinejoin="round"

              d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"

            />

          </svg>

        </div>

      </section>



      <section className="home-stats">

        <h3 className="home-section__title">At a glance</h3>

        <div className="home-stats__grid">

          {statCards.map((card) => (

            <Link key={card.label} to={card.to} className="home-stat-card">

              <span className="home-stat-card__label">{card.label}</span>

              <span className="home-stat-card__value">

                {loading ? '—' : card.value}

              </span>

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



      <section className="home-info card">

        <h3 className="home-info__title">Getting started</h3>

        <ul className="home-info__list">

          <li>Set up <Link to="/grades">grades</Link> and <Link to="/subjects">subjects</Link> first.</li>

          <li>

            Link them under <Link to="/grade-subjects">grade subjects</Link> and assign teachers

            there.

          </li>

          <li>Enroll <Link to="/students">students</Link> into their respective grades.</li>

        </ul>

      </section>

    </div>

  );

}

