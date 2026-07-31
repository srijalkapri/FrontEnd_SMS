import type { Teacher, TeacherDetails } from '../../types/teacher';
import { getSubjectTypeLabel } from '../../utils/subjectType';
import type { TeacherReportRow } from '../../utils/teacherReportFilters';
import { SearchFoundPanel } from '../ui/SearchFoundPanel';
import { TableScrollWrapper } from '../ui/TableScrollWrapper';

interface TeacherAssignmentReportCardProps {
  teacher: Teacher | TeacherDetails;
  row: TeacherReportRow;
}

export function TeacherAssignmentReportCard({ teacher, row }: TeacherAssignmentReportCardProps) {
  return (
    <SearchFoundPanel
      status="details"
      fields={[
        { label: 'ID', value: <span className="grade-id">#{teacher.id}</span> },
        { label: 'Name', value: teacher.name },
        { label: 'Phone', value: teacher.phoneNo },
        {
          label: 'Email',
          value: (
            <a className="contact-link" href={`mailto:${teacher.email}`}>
              {teacher.email}
            </a>
          ),
        },
        { label: 'Grade', value: row.gradeName },
        { label: 'Subject', value: row.subjectName },
        {
          label: 'Subject type',
          value: (
            <span
              className={`search-found-tag ${row.isOptional ? 'search-found-tag--warn' : 'search-found-tag--accent'}`}
            >
              {getSubjectTypeLabel(row.isOptional)}
            </span>
          ),
        },
        {
          label: 'Class teacher',
          value: row.isClassTeacher ? 'Yes' : 'No',
        },
      ]}
    >
      <span className="search-found__extra-label">Students</span>
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
        <span className="search-found__muted">No students enrolled in this grade.</span>
      )}
    </SearchFoundPanel>
  );
}
