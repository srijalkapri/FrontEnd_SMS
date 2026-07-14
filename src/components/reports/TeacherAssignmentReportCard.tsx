import type { Teacher, TeacherDetails } from '../../types/teacher';
import { getSubjectTypeLabel } from '../../utils/subjectType';
import type { TeacherReportRow } from '../../utils/teacherReportFilters';
import { TableScrollWrapper } from '../ui/TableScrollWrapper';
import '../SearchGradeSubject.css';

interface TeacherAssignmentReportCardProps {
  teacher: Teacher | TeacherDetails;
  row: TeacherReportRow;
}

export function TeacherAssignmentReportCard({ teacher, row }: TeacherAssignmentReportCardProps) {
  return (
    <div className="search-result__card search-result__card--stacked">
      <div className="search-result__badge">Details</div>
      <div className="search-result__details search-result__details--grid">
        <div className="search-result__field">
          <span className="search-result__label">ID</span>
          <span className="grade-id">#{teacher.id}</span>
        </div>
        <div className="search-result__field">
          <span className="search-result__label">Name</span>
          <span className="search-result__value">{teacher.name}</span>
        </div>
        <div className="search-result__field">
          <span className="search-result__label">Phone</span>
          <span className="search-result__value">{teacher.phoneNo}</span>
        </div>
        <div className="search-result__field">
          <span className="search-result__label">Email</span>
          <a className="contact-link" href={`mailto:${teacher.email}`}>
            {teacher.email}
          </a>
        </div>
        <div className="search-result__field">
          <span className="search-result__label">Grade</span>
          <span className="search-result__value">{row.gradeName}</span>
        </div>
        <div className="search-result__field">
          <span className="search-result__label">Subject</span>
          <span className="search-result__value">{row.subjectName}</span>
        </div>
        <div className="search-result__field">
          <span className="search-result__label">Subject Type</span>
          <span
            className={`teacher-tag ${row.isOptional ? 'teacher-tag--optional' : 'teacher-tag--compulsory'}`}
          >
            {getSubjectTypeLabel(row.isOptional)}
          </span>
        </div>
        <div className="search-result__field">
          <span className="search-result__label">Class Teacher</span>
          <span
            className={`teacher-tag ${row.isClassTeacher ? 'teacher-tag--compulsory' : ''}`}
          >
            {row.isClassTeacher ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="search-result__field search-result__field--full">
          <span className="search-result__label">Students</span>
          {row.students.length > 0 ? (
            <TableScrollWrapper>
              <table className="grade-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {row.students.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <span className="grade-id">#{student.id}</span>
                      </td>
                      <td>{student.name}</td>
                      <td>
                        <a className="contact-link" href={`mailto:${student.email}`}>
                          {student.email}
                        </a>
                      </td>
                      <td>{student.phoneNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
</TableScrollWrapper>
          ) : (
            <span className="search-result__muted">No students enrolled in this grade.</span>
          )}
        </div>
      </div>
    </div>
  );
}
