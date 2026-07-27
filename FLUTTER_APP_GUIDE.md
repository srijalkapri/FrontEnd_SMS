# Flutter App Guide — Student Management System

Verified guide to build a **Flutter** mobile client for the ASP.NET Core backend, aligned with the existing **React frontend** (`FrontEnd/src/api`, `src/types`, auth & status helpers).

Use this file later as the single source of truth when building the Flutter app.

---

## 0. Sources of truth

| Source | What to trust |
|--------|----------------|
| This guide | Endpoints, DTOs, roles, workflows (mirrored from frontend) |
| Live API | `https://student-management-system-tonm.onrender.com` |
| Local Swagger | `http://localhost:5271/swagger` or `https://localhost:7172/swagger` |
| React frontend | `src/api/*`, `src/types/*`, `src/utils/roles.ts`, `examResultStatus.ts`, `reExamStatus.ts` |

JSON uses **camelCase**. Prefer accepting both camelCase and PascalCase on login token fields (frontend does this).

---

## 1. Prerequisites

| Tool | Version | Notes |
|------|---------|--------|
| [Flutter SDK](https://docs.flutter.dev/get-started/install) | 3.22+ | Stable channel |
| Dart | (bundled) | Comes with Flutter |
| Android Studio / Xcode | Latest | Emulator / device |
| Backend | Running | Local or Render |

```bash
flutter doctor
flutter --version
```

Fix anything `flutter doctor` reports before continuing.

---

## 2. Create the Flutter project

```bash
flutter create --org com.school --project-name sms_flutter sms_flutter
cd sms_flutter
```

### Recommended folder structure

```text
lib/
  main.dart
  app.dart
  core/
    config/api_config.dart
    network/api_client.dart
    storage/token_storage.dart
    models/api_response.dart
    models/paged_result.dart
  features/
    auth/
      data/auth_repository.dart
      presentation/login_page.dart
      presentation/register_page.dart
      presentation/pending_users_page.dart   # SuperAdmin
    student/
      data/student_portal_repository.dart
      presentation/...
    teacher/
      data/teacher_portal_repository.dart
      presentation/...
    admin/
      data/          # grade, subject, student, teacher, exam repos
      presentation/...
  shared/
    widgets/...
    utils/roles.dart
    utils/exam_result_status.dart
    utils/re_exam_status.dart
```

### Recommended packages (`pubspec.yaml`)

```yaml
dependencies:
  flutter:
    sdk: flutter
  http: ^1.2.2
  flutter_secure_storage: ^9.2.2
  provider: ^6.1.2          # or riverpod / bloc
  go_router: ^14.6.2
  intl: ^0.19.0
```

```bash
flutter pub get
```

---

## 3. API base URL

Create `lib/core/config/api_config.dart`:

```dart
class ApiConfig {
  static const String productionBaseUrl =
      'https://student-management-system-tonm.onrender.com';

  /// Android emulator → host machine localhost
  static const String localAndroidEmulator = 'http://10.0.2.2:5271';

  /// iOS simulator / desktop
  static const String localIosOrDesktop = 'http://localhost:5271';

  /// Prefer dart-define in CI / flavors
  static const String baseUrl = String.fromEnvironment(
    'API_BASE',
    defaultValue: productionBaseUrl,
  );
}
```

| Platform | Local API URL |
|----------|----------------|
| Android emulator | `http://10.0.2.2:5271` |
| iOS simulator / desktop | `http://localhost:5271` |
| Physical device | `http://YOUR_PC_LAN_IP:5271` (same Wi‑Fi) |
| HTTPS local (if using launch profile) | `https://10.0.2.2:7172` / `https://localhost:7172` |
| Production | Render URL above |

**Web frontend reference:** `VITE_API_URL` (no trailing slash). Dev proxy targets `https://localhost:7172`.

**Android cleartext (local HTTP only):** in `android/app/src/main/AndroidManifest.xml`:

```xml
<application android:usesCleartextTraffic="true" ... >
```

Prefer HTTPS for production. Free Render apps sleep when idle — first request may take 30–60s.

---

## 4. Response wrapper & pagination

### ApiResponse\<T\>

```json
{
  "data": { },
  "success": true,
  "message": "...",
  "errors": []
}
```

**Client rules (match React `apiClient.ts`):**

1. HTTP status ≥ 400 → throw using `errors.join(', ')` or `message` or status text.
2. HTTP OK but `success == false` → same throw.
3. 403 → treat as access denied (wrong role / unauthorized for portal).
4. On success, use `data` as the typed payload.

### Pagination (admin list screens)

Query params (PascalCase keys, as frontend builds them):

`PageNumber`, `PageSize`, `Search`, `SortBy`, `SortDirection` (`asc` | `desc`)

Optional filters: `gradeId`, `isOptional`, etc.

```dart
class PagedResult<T> {
  final List<T> items;
  final int pageNumber;
  final int pageSize;
  final int totalCount;
  final int totalPages;
  final bool hasPreviousPage;
  final bool hasNextPage;
}
```

Normalize PascalCase / alternate item keys if the API sometimes returns them.

---

## 5. Auth

### Endpoints

| Action | Method | Path | Auth |
|--------|--------|------|------|
| Login | POST | `/api/Auth/Login` | No |
| Register | POST | `/api/Auth/Register` | No |
| Refresh | POST | `/api/Auth/Refresh` | No |
| Me | GET | `/api/Auth/Me` | Bearer |
| Logout | POST | `/api/Auth/Logout` | Optional (body has refreshToken) |
| Pending users | GET | `/api/Auth/PendingUsers` | SuperAdmin |
| Approve | POST | `/api/Auth/Approve/{userId}` | SuperAdmin |
| Reject | POST | `/api/Auth/Reject/{userId}` | SuperAdmin |

### Request / response shapes

**Login**

```json
{ "username": "superadmin", "password": "…" }
```

Success `data`:

```json
{
  "token": "<jwt>",
  "expiresAt": "...",
  "refreshToken": "...",
  "refreshTokenExpiresAt": "...",
  "user": {
    "id": 1,
    "username": "superadmin",
    "fullName": "Super Administrator",
    "role": "SuperAdmin"
  }
}
```

Normalize token fields if PascalCase (`Token`, `ExpiresAt`, …) appears.

**Register** (does **not** log the user in)

```json
{
  "username": "jane",
  "password": "Secret@123",
  "confirmPassword": "Secret@123",
  "fullName": "Jane Doe",
  "email": "jane@school.edu"
}
```

New users stay **pending** until SuperAdmin approves.

**Refresh / Logout**

```json
{ "refreshToken": "..." }
```

**Approve user** — discriminated body (required; not a bare approve):

```json
{ "role": "SuperAdmin" }
```

```json
{ "role": "Teacher", "teacherId": 12 }
```

```json
{ "role": "Teacher", "phoneNo": "9841234567" }
```

```json
{ "role": "Student", "studentId": 45 }
```

```json
{ "role": "Student", "gradeId": 3, "phoneNo": "9841234567" }
```

- `teacherId` / `studentId` → link existing profile  
- `phoneNo` (+ `gradeId` for student) → create profile on approve  

**Reject user:** POST with **empty body** (no comment).

### Roles

Canonical: `SuperAdmin` | `Teacher` | `Student`

Normalize legacy aliases to SuperAdmin if seen: `Admin`, `admin`, `ADMIN`, `superadmin`.

### Secure storage

Store (not SharedPreferences plain text):

| Field | Meaning |
|-------|---------|
| access token | JWT |
| expiresAt | access expiry ISO |
| refreshToken | refresh token |
| refreshTokenExpiresAt | refresh expiry ISO |
| user (id, username, fullName, role) | for routing |

### Auth client behavior (mirror frontend)

1. Login → save tokens + user; reject unknown roles.
2. Cold start → if session exists → `GET /api/Auth/Me` → route by role; clear on failure.
3. Protected calls: `Authorization: Bearer <token>`, `Content-Type: application/json`.
4. On **401** (except Login / Register / Refresh): single-flight `POST /api/Auth/Refresh` → update tokens → **retry once**; else clear session → Login.
5. Logout → `POST /api/Auth/Logout` with refresh token (ignore errors) → clear storage.

**Do not hardcode** SuperAdmin passwords in the Flutter app. Seeded credentials live in backend `appsettings` only for local/dev.

---

## 6. Role-based app flow

```text
Splash → read token / Me
  → invalid / missing → Login / Register
  → SuperAdmin → Admin home
  → Teacher    → Teacher home
  → Student    → Student home
```

Use `go_router` redirects from saved role. Frontend isolation:

| Role | Home | Allowed area |
|------|------|----------------|
| SuperAdmin | Admin dashboard | Everything **except** `/teacher/*` and `/student/*` |
| Teacher | Teacher home | Teacher portal only |
| Student | Student home | Student portal only |

Backend still returns **403** if the wrong role hits a portal endpoint.

### Nav map (screens to build)

**Student:** Overview · Profile · Grade · Subjects · Teachers · Results · Re-Exams  

**Teacher:** Overview · Profile · Classes · Students · Subjects · Exam Results (sessions + marks) · Re-Exams  

**SuperAdmin:** Dashboard · Grades · Subjects · Grade Subjects · Promotion · Exam Schedules · Result Approvals · Exam Results lookup · Re-Exam Approvals · Teachers · Students · Reports (optional) · Pending Users  

---

## 7. Student portal (`Authorize: Student`)

Base: `/api/StudentPortal`

| Screen | Method | Path | `data` type |
|--------|--------|------|-------------|
| Dashboard | GET | `/Overview` | `StudentPortalOverview` |
| Profile | GET | `/Me` | `StudentPortalProfile` |
| My grade | GET | `/Grade` | `Grade` |
| Subjects | GET | `/Subjects` | `StudentSubject[]` |
| Teachers | GET | `/Teachers` | `StudentTeacher[]` |
| Exam results | GET | `/Results?examScheduleId=` (optional) | `StudentExamResultSchedule[]` |
| My re-exams | GET | `/ReExams` | `ReExamRequest[]` |
| Apply re-exam | POST | `/ReExams/Apply` | `string` |

**Apply body:**

```json
{ "examSessionId": 1, "reason": "Was absent / failed" }
```

Show **Apply** only when `canApplyReExam == true` on a subject in Results.

### Key student models

```dart
// StudentPortalProfile
{ id, name, email, phoneNo, gradeId, gradeName }

// StudentPortalOverview
{ profile, grade, subjects, teachers }

// StudentExamResultSchedule
{
  examScheduleId, examTitle, academicYear,
  subjects: StudentExamResultSubject[],
  totalObtained, totalMarks, percentage
}

// StudentExamResultSubject
{
  examSessionId, examResultItemId, subjectName,
  marksObtained, totalMarks, isAbsent, remarks,
  canApplyReExam, reExamStatus, reExamRequestId,
  isReExamResult,
  originalMarksObtained, originalTotalMarks, originalIsAbsent
}
```

---

## 8. Teacher portal (`Authorize: Teacher`)

Base: `/api/TeacherPortal`

| Screen | Method | Path | `data` type |
|--------|--------|------|-------------|
| Dashboard | GET | `/Overview` | `TeacherPortalOverview` |
| Profile | GET | `/Me` | `TeacherPortalProfile` |
| Classes | GET | `/Classes` | `Grade[]` |
| Students | GET | `/Students` | `TeacherPortalStudent[]` |
| Subjects | GET | `/Subjects` | `TeacherPortalSubject[]` |
| Exam sessions | GET | `/ExamSessions` | `TeacherExamSession[]` |
| Enter marks | GET | `/ExamResults/{examSessionId}` | `TeacherExamResultBatch` |
| Save draft | POST | `/ExamResults/SaveDraft` | `string` |
| Submit marks | POST | `/ExamResults/Submit` | `string` |
| Re-exam queue | GET | `/ReExams` | `ReExamRequest[]` |
| Re-exam detail | GET | `/ReExams/{id}` | `ReExamRequest` |
| Submit re-exam marks | POST | `/ReExams/{id}/Submit` | `string` |

### Save draft / submit marks body (same shape)

```json
{
  "examSessionId": 1,
  "items": [
    {
      "studentId": 10,
      "marksObtained": 42,
      "totalMarks": 100,
      "isAbsent": false,
      "remarks": null
    }
  ]
}
```

**Client validation (match frontend):**

- `totalMarks > 0`
- If not absent: marks required and `0 ≤ marksObtained ≤ totalMarks`

### Exam result status machine

| Status | UI |
|--------|-----|
| `Draft` | Editable |
| `Rejected` | Editable (fix & resubmit) |
| `PendingApproval` | Locked |
| `Approved` | Locked |

- Editable ⟺ `Draft` \| `Rejected`  
- Locked ⟺ `PendingApproval` \| `Approved`  
- **SaveDraft** vs **Submit**: same body; Submit sends for admin approval.

### Teacher re-exam marks body

```json
{
  "marksObtained": 55,
  "totalMarks": 100,
  "isAbsent": false,
  "remarks": null
}
```

Teacher may submit re-exam marks when status is `Approved` **or** `MarksRejected`.

---

## 9. Admin / SuperAdmin APIs

### Auth admin

| Action | Method | Path |
|--------|--------|------|
| Pending users | GET | `/api/Auth/PendingUsers` |
| Approve | POST | `/api/Auth/Approve/{userId}` + body (§5) |
| Reject | POST | `/api/Auth/Reject/{userId}` (empty body) |

### Grades — `/api/Grade`

| Method | Path |
|--------|------|
| GET | `/GetAllGrades` |
| GET | `/GetGradesPaged?...` |
| GET | `/GetGradeById?id=` |
| POST | `/CreateGrade` |
| PUT | `/UpdateGrade?Id=` |
| DELETE | `/DeleteGrade?id=` |

`Grade`: `{ id, className, level, classTeacherId?, classTeacher? }`

### Subjects — `/api/Subject`

| Method | Path |
|--------|------|
| GET | `/GetAllSubjects` |
| GET | `/GetSubjectsPaged?...` |
| GET | `/GetSubjectById?id=` |
| POST | `/CreateSubject` |
| PUT | `/UpdateSubject?id=` |
| DELETE | `/DeleteSubject?id=` |

### Students — `/api/Student`

| Method | Path |
|--------|------|
| GET | `/GetAllStudents` |
| GET | `/GetStudentsPaged?...` |
| GET | `/GetStudentsByGradePaged?gradeId&...` |
| GET | `/GetStudentsByGrade?gradeId=` |
| GET | `/GetStudentById?id=` |
| POST | `/CreateStudent` |
| PUT | `/UpdateStudent?id=` |
| DELETE | `/DeleteStudent?id=` |
| PUT | `/RestoreStudent?id=` |
| POST | `/PreviewPromotion` |
| POST | `/PromoteStudents` |

Promotion body: `{ fromGradeId, toGradeId, studentIds?: number[] }`

Soft-delete: UI may show `isDeleted` / `deletedAt`; restore via `RestoreStudent`.

### Teachers — `/api/Teacher`

| Method | Path |
|--------|------|
| GET | `/GetAllTeachers` |
| GET | `/GetTeachersPaged?...` |
| GET | `/GetTeacherById?id=` |
| GET | `/GetTeacherDetails?id=` |
| POST | `/CreateTeacher` |
| PUT | `/UpdateTeacher?Id=` |
| DELETE | `/DeleteTeacher?id=` |
| PUT | `/RestoreTeacher?id=` |

### Grade ↔ Subject — `/api/GradeSubject`

CRUD: `GetAll`, `GetPaged` (+ `isOptional`), `GetByGradeIdPaged`, `GetById`, `Create`, `Update`, `Delete`.

### GradeSubject ↔ Teacher — `/api/GradeSubjectTeacher`

CRUD: `GetAll`, `GetPaged`, `GetById`, `Create`, `Update`, `Delete`.

### Exams — `/api/Exam`

**Schedules**

| Method | Path |
|--------|------|
| GET | `/GetAllSchedules` |
| GET | `/GetSchedulesPaged?...` |
| GET | `/GetSchedulesByGradePaged?gradeId&...` |
| GET | `/GetScheduleById?id=` |
| GET | `/GetSchedulesByGrade?gradeId=` |
| POST | `/CreateSchedule` |
| PUT | `/UpdateSchedule?id=` |
| DELETE | `/DeleteSchedule?id=` |
| PUT | `/UpdateSession?id=` |
| PUT | `/BulkUpdateSessions` |
| POST | `/AddSession` |
| DELETE | `/DeleteSession?id=` |

Schedule status enum: `Draft = 0`, `Published = 1`.

Create schedule:

```json
{
  "gradeId": 1,
  "title": "Terminal 1",
  "academicYear": "2025/26",
  "autoGenerateSessions": true
}
```

**Result approvals**

| Method | Path |
|--------|------|
| GET | `/ResultApprovals/Pending` |
| GET | `/ResultApprovals/{batchId}` |
| POST | `/ResultApprovals/{batchId}/Approve` |
| POST | `/ResultApprovals/{batchId}/Reject` |

Review body (optional comment):

```json
{ "comment": "Looks good" }
```

Only review when batch `status === PendingApproval`.

**Marks lookup**

| Method | Path |
|--------|------|
| GET | `/Results/BySchedule/{examScheduleId}` |
| GET | `/Results/ByStudent/{studentId}?examScheduleId=` (optional) |

**Re-exams (admin)**

| Method | Path |
|--------|------|
| GET | `/ReExams/Pending` |
| GET | `/ReExams/Marks/Pending` |
| GET | `/ReExams/{id}` |
| POST | `/ReExams/{id}/Approve` |
| POST | `/ReExams/{id}/Reject` |
| POST | `/ReExams/{id}/ApproveMarks` |
| POST | `/ReExams/{id}/RejectMarks` |

Reject / review bodies usually:

```json
{ "comment": "Reason" }
```

**UI rule from frontend:** rejecting **marks** should require a comment; rejecting a **request** may omit it.

---

## 10. Re-exam lifecycle (all roles)

| Status | Who acts next |
|--------|----------------|
| `Requested` | Admin approve / reject request |
| `Approved` | Teacher submit marks |
| `Rejected` | Terminal (request rejected) |
| `MarksSubmitted` | Admin approve / reject marks |
| `MarksApproved` | Terminal (done) |
| `MarksRejected` | Teacher may resubmit marks |

Helpers to port from frontend:

- `canReviewReExamRequest` → status == `Requested`
- `canReviewReExamMarks` → status == `MarksSubmitted`
- `canTeacherSubmitReExamMarks` → `Approved` \| `MarksRejected`

`ReExamRequest` fields (high level):

```text
id, studentId, studentName, examSessionId, examScheduleId,
examTitle, gradeName, subjectName, attemptNumber, status,
studentReason, adminComment, reviewedAtUtc,
originalMarksObtained, originalTotalMarks, originalIsAbsent,
teacherId, teacherName, marksObtained, totalMarks, isAbsent,
marksRemarks, marksSubmittedAtUtc, marksReviewComment, createdAtUtc
```

---

## 11. Validation rules (from frontend)

| Field | Rule |
|-------|------|
| Email | Required; basic email pattern |
| Phone | Exactly **10 digits** |
| Marks | See teacher section |
| Passwords | Match confirm on register; enforce backend rules |

---

## 12. MVP build order

1. **Login / Register / Logout** + secure token storage + refresh-on-401  
2. **Role homes** (3 shells) + splash / `Me` bootstrap  
3. **Student:** Overview → Results → Apply re-exam → My re-exams  
4. **Teacher:** Exam sessions → Enter / SaveDraft / Submit marks → Re-exam submit  
5. **Admin:** Pending users (with Approve body variants) → Result approvals → Re-exam approvals → Results by schedule  

After MVP: Grades, Subjects, GradeSubjects, Teachers/Students CRUD, Exam schedule CRUD, Promotion, Reports.

---

## 13. Minimal ApiClient pattern

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../storage/token_storage.dart';

class ApiClient {
  final TokenStorage storage;
  Future<bool>? _refreshInFlight;

  ApiClient(this.storage);

  Future<Map<String, dynamic>> request(
    String method,
    String path, {
    Object? body,
    bool auth = true,
    bool retrying = false,
  }) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': '*/*',
    };
    if (auth) {
      final token = await storage.getAccessToken();
      if (token != null) headers['Authorization'] = 'Bearer $token';
    }

    final uri = Uri.parse('${ApiConfig.baseUrl}$path');
    late http.Response res;
    switch (method) {
      case 'GET':
        res = await http.get(uri, headers: headers);
      case 'POST':
        res = await http.post(uri, headers: headers, body: body == null ? null : jsonEncode(body));
      case 'PUT':
        res = await http.put(uri, headers: headers, body: body == null ? null : jsonEncode(body));
      case 'DELETE':
        res = await http.delete(uri, headers: headers);
      default:
        throw Exception('Unsupported method $method');
    }

    final isPublic = path.contains('/api/Auth/Login') ||
        path.contains('/api/Auth/Register') ||
        path.contains('/api/Auth/Refresh');

    if (res.statusCode == 401 && auth && !isPublic && !retrying) {
      final ok = await _refreshOnce();
      if (ok) return request(method, path, body: body, auth: auth, retrying: true);
      await storage.clear();
      throw Exception('Session expired');
    }

    final json = jsonDecode(res.body) as Map<String, dynamic>;
    if (res.statusCode >= 400 || json['success'] == false) {
      final errors = (json['errors'] as List?)?.cast<String>() ?? const [];
      final msg = errors.isNotEmpty
          ? errors.join(', ')
          : (json['message'] as String? ?? 'Request failed (${res.statusCode})');
      throw Exception(msg);
    }
    return json;
  }

  Future<bool> _refreshOnce() {
    return _refreshInFlight ??= () async {
      try {
        final rt = await storage.getRefreshToken();
        if (rt == null) return false;
        final json = await request(
          'POST',
          '/api/Auth/Refresh',
          body: {'refreshToken': rt},
          auth: false,
          retrying: true,
        );
        final data = json['data'] as Map<String, dynamic>;
        await storage.saveLogin(data);
        return true;
      } catch (_) {
        return false;
      } finally {
        _refreshInFlight = null;
      }
    }();
  }
}
```

---

## 14. Run & build

### Against production

```bash
flutter run --dart-define=API_BASE=https://student-management-system-tonm.onrender.com
```

### Against local API

```powershell
cd C:\Users\Srijal\source\repos\CRUD
dotnet run --project CRUD.Web --launch-profile https
```

Then point Flutter at the correct local URL (§3) and `flutter run`.

### Release

```bash
flutter build apk --release
flutter build appbundle --release
# iOS (macOS + Xcode): flutter build ios --release
```

---

## 15. Common issues

| Problem | Fix |
|---------|-----|
| Failed host lookup / connection refused | Wrong base URL; Android emulator needs `10.0.2.2`, not `localhost` |
| Cleartext blocked | `usesCleartextTraffic="true"` for local HTTP |
| 401 after login | Send `Authorization: Bearer …`; implement refresh |
| 403 Forbidden | Wrong role for portal / admin endpoint |
| Approve user fails | Must send role + link/create fields (§5) |
| CORS errors | Browser-only; Flutter mobile unaffected |
| Slow first call on Render | Cold start — wait and retry |
| 500 on ReExams Pending (prod) | DB / migrations on API side |

---

## 16. Checklist before shipping

- [ ] `API_BASE` points to production HTTPS  
- [ ] Tokens in secure storage  
- [ ] Refresh-on-401 works (single-flight)  
- [ ] Role navigation tested for Student / Teacher / SuperAdmin  
- [ ] Approve-user flows: SuperAdmin / Teacher link|create / Student link|create  
- [ ] Exam SaveDraft / Submit + admin approve/reject smoke-tested  
- [ ] Re-exam apply → approve → teacher marks → approve marks smoke-tested  
- [ ] Android release signing configured  
- [ ] No SuperAdmin default password hardcoded in the app  

---

## 17. Prompt to rebuild later

Copy-paste this when you want the agent to implement the app:

> Build the Flutter Student Management System client using `FLUTTER_APP_GUIDE.md` in this repo as the sole spec. Follow the MVP build order in §12, match endpoints/DTOs/status machines exactly, use secure token storage + refresh-on-401, and role-based `go_router` navigation for SuperAdmin / Teacher / Student.

---

## Appendix A — Frontend file map (for parity)

| Flutter concern | Frontend file |
|-----------------|---------------|
| HTTP + refresh | `src/api/apiClient.ts` |
| Auth API | `src/api/authApi.ts` |
| Student portal | `src/api/studentPortalApi.ts` |
| Teacher portal | `src/api/teacherPortalApi.ts` |
| Admin exam / re-exam | `src/api/examApi.ts` |
| CRUD APIs | `src/api/gradeApi.ts`, `subjectApi.ts`, `studentApi.ts`, `teacherApi.ts`, `gradeSubjectApi.ts`, `gradeSubjectTeacherApi.ts` |
| DTOs | `src/types/*` |
| Roles | `src/utils/roles.ts` |
| Exam result UI rules | `src/utils/examResultStatus.ts` |
| Re-exam UI rules | `src/utils/reExamStatus.ts` |
| Auth storage | `src/utils/authStorage.ts` |
| Routes | `src/App.tsx` |
