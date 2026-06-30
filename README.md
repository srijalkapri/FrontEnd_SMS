# School Management UI

A professional React frontend for the Grade and GradeSubject Management APIs.

## Features

### Grades
- **Create Grade** — POST `/api/Grade/CreateGrade`
- **List All Grades** — GET `/api/Grade/GetAllGrades`
- **Find by ID** — GET `/api/Grade/GetGradeById`
- **Update Grade** — PUT `/api/Grade/UpdateGrade`
- **Delete Grade** — DELETE `/api/Grade/DeleteGrade`

### Grade Subjects
- **Create Mapping** — POST `/api/GradeSubject/CreateGradeSubject`
- **List All Mappings** — GET `/api/GradeSubject/GetAllGradeSubjects`
- **Find by ID** — GET `/api/GradeSubject/GetGradeSubjectById`
- **Update Mapping** — PUT `/api/GradeSubject/UpdateGradeSubject`
- **Delete Mapping** — DELETE `/api/GradeSubject/DeleteGradeSubject`

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running at `https://localhost:7172`

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The dev server proxies `/api` requests to `https://localhost:7172` to avoid CORS issues.

### Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- React 18 + TypeScript
- Vite
- Custom CSS (no external UI library)
