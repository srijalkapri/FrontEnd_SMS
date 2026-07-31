import type { Student } from '../../types/student';
import { getSubjectTypeLabel } from '../../utils/subjectType';
import { SearchFoundPanel } from '../ui/SearchFoundPanel';
import { TableScrollWrapper } from '../ui/TableScrollWrapper';

export function StudentDetailsCard({ student }: { student: Student }) {
  return (
    <SearchFoundPanel
      status="details"
      fields={[
        { label: 'ID', value: <span className="grade-id">#{student.id}</span> },
        { label: 'Name', value: student.name },
        { label: 'Phone', value: student.phoneNo },
        {
          label: 'Email',
          value: (
            <a className="contact-link" href={`mailto:${student.email}`}>
              {student.email}
            </a>
          ),
        },
        { label: 'Grade', value: student.gradeName },
      ]}
    >
      <span className="search-found__extra-label">Subjects & teachers</span>
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
                      <span className="search-found__muted">No teachers assigned</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScrollWrapper>
      ) : (
        <span className="search-found__muted">No subjects enrolled</span>
      )}
    </SearchFoundPanel>
  );
}
