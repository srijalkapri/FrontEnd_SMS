import type { Teacher } from '../types/teacher';
import './GradeTable.css';

interface TeacherTableProps {
  teachers: Teacher[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
  onViewDetails: (teacher: Teacher) => void;
  onRefresh: () => void;
}

export function TeacherTable({
  teachers,
  loading,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
  onViewDetails,
  onRefresh,
}: TeacherTableProps) {
  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.phoneNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.id.toString().includes(searchQuery),
  );

  return (
    <section className="card grade-table-section">
      <div className="card__header">
        <div>
          <h2 className="card__title">All Teachers</h2>
          <p className="card__subtitle">
            {teachers.length} teacher{teachers.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="grade-table__actions">
          <div className="search-input">
            <svg className="search-input__icon" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name, phone, email, or ID..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input__field"
            />
          </div>
          <button className="btn btn--ghost" onClick={onRefresh} disabled={loading}>
            <svg
              className={`btn__icon ${loading ? 'btn__icon--spin' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        {loading && teachers.length === 0 ? (
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading teachers...</p>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="table-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            <p>
              {searchQuery
                ? 'No teachers match your search.'
                : 'No teachers found. Create one to get started.'}
            </p>
          </div>
        ) : (
          <table className="grade-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Teacher Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th className="grade-table__actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td>
                    <span className="grade-id">#{teacher.id}</span>
                  </td>
                  <td>
                    <span className="grade-name">{teacher.name}</span>
                  </td>
                  <td>{teacher.phoneNo}</td>
                  <td>
                    <a className="contact-link" href={`mailto:${teacher.email}`}>
                      {teacher.email}
                    </a>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn--icon btn--edit"
                        onClick={() => onViewDetails(teacher)}
                        title="View details"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        className="btn btn--icon btn--edit"
                        onClick={() => onEdit(teacher)}
                        title="Edit teacher"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        className="btn btn--icon btn--delete"
                        onClick={() => onDelete(teacher)}
                        title="Delete teacher"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
