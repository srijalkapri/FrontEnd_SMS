import type { Student } from '../../types/student';
import { getSubjectTypeLabel } from '../../utils/subjectType';
import { TableScrollWrapper } from '../ui/TableScrollWrapper';
import '../SearchGradeSubject.css';

export function StudentDetailsCard({ student }: { student: Student }) {
  return (
    <div className="search-result__card search-result__card--stacked">
      <div className="search-result__badge">Details</div>
      <div className="search-result__details search-result__details--grid">
        <div className="search-result__field">
          <span className="search-result__label">ID</span>
          <span className="grade-id">#{student.id}</span>
        </div>
        <div className="search-result__field">
          <span className="search-result__label">Name</span>
          <span className="search-result__value">{student.name}</span>
        </div>
        <div className="search-result__field">
          <span className="search-result__label">Phone</span>
          <span className="search-result__value">{student.phoneNo}</span>
        </div>
        <div className="search-result__field">
          <span className="search-result__label">Email</span>
          <a className="contact-link" href={`mailto:${student.email}`}>
            {student.email}
          </a>
        </div>
        <div className="search-result__field">
          <span className="search-result__label">Grade</span>
          <span className="search-result__value">{student.gradeName}</span>
        </div>
        <div className="search-result__field search-result__field--full">
          <span className="search-result__label">Subjects & Teachers</span>
          {student.subjects.length > 0 ? (
            <TableScrollWrapper>
              <table className="grade-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Type</th>
                    <th>Teachers</th>
                  </tr>
                </thead>
                <tbody>
                  {student.subjects.map((subject) => (
                    <tr key={subject.id}>
                      <td>{subject.subjectName}</td>
                      <td>
                        <span
                          className={`teacher-tag ${subject.isOptional ? 'teacher-tag--optional' : 'teacher-tag--compulsory'}`}
                        >
                          {getSubjectTypeLabel(subject.isOptional)}
                        </span>
                      </td>
                      <td>
                        {subject.teachers.length > 0 ? (
                          <div className="teacher-tags">
                            {subject.teachers.map((teacher) => (
                              <span key={teacher.id} className="teacher-tag">
                                {teacher.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="search-result__muted">No teachers assigned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScrollWrapper>
          ) : (
            <span className="search-result__muted">No subjects enrolled</span>
          )}
        </div>
      </div>
    </div>
  );
}
