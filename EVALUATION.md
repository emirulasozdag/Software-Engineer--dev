# Project Evaluation Report (Web Application)

Project: **Personalized Learning Content (AI-Powered Adaptive Curriculum)**

Date: **28 Aralık 2025**

## 0) Scope & Evidence

This evaluation is based on:
- Codebase structure (backend + frontend)
- Role-based routing and API authorization checks
- Implemented endpoints and UI pages
- The provided UML Use Case diagram (image)

Not evaluated (needs manual evidence):
- Git commit quality (commit messages/frequency)
- UI screenshots per screen
- External services’ real integrations (AI engine / notification / speech recognition)

---

## 1) Overall Consistency & Architecture

### Architectural pattern
- Backend: Layered architecture: `app/api/routes` → `application/controllers` → `application/services` → `domain` + `infrastructure`.
- Frontend: React + TypeScript with service layer `src/services/api/*` and global auth state in `src/contexts/AuthContext.tsx`.

### Consistency: UML → Code → UI
- Use cases in UML largely map to existing backend routes and frontend pages.
- Gaps exist where UML includes modules that exist as route files but are not registered in the API router, or are UI placeholders.

### Design decisions justification (what exists)
- Centralized API client with Axios interceptor for token injection and 401 handling.
- Backend uses dependency `require_role(...)` and `get_current_user` to enforce authorization.

---

## 2) Role-Based Design & Authorization (Checklist highlights)

### UI-level role control
- Frontend routes are grouped by role via `ProtectedRoute` using `allowedRoles`.

### Logic-level role control
- Backend uses `require_role(UserRole.…)` on sensitive endpoints.

### Notes / risk
- A few endpoints allow broad access via `get_current_user` without verifying ownership (e.g. some student detail endpoints). Verify business rules (student self vs teacher/admin view) for those.

---

## 3) Use Case Diagram → Code Mapping (Evidence)

Below is a pragmatic mapping from the UML use cases to repo artifacts.

### UC1 – Registration/Login/Email Verification (FR1–FR3)
- Backend endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-email`, `/api/auth/me`
- Frontend pages: `src/pages/auth/*`
- Notes: dev convenience returns verification token in dev/debug.

### UC2 – Account Recovery (FR2)
- Backend endpoints: `/api/auth/forgot-password`, `/api/auth/reset-password`
- Frontend pages: `src/pages/auth/ForgotPasswordPage.tsx`

### UC3 – Placement Test (FR4–FR5)
- Backend endpoints: `/api/placement-test/*` and test result endpoints
- Frontend page: `src/pages/student/PlacementTest.tsx`

### UC4 – Speaking Test and Speech Analysis (FR6, FR10)
- Frontend: `PlacementTest.tsx` uses microphone recording via `MediaRecorder`.
- Backend: speaking submission endpoints should exist under speaking modules; verify they are registered and called by `test.service.ts`.

### UC5 – Listening/Reading/Writing modules (FR7–FR9)
- Backend route files exist for each module.
- Frontend is implemented within placement test flow.

### UC6 – Displaying Test Results (FR11–FR12, FR26)
- Backend endpoints: `/api/test-results/*`
- Frontend pages: student dashboard shows latest results and teacher screens exist.

### UC7 – Student Analysis & Personalized Content Plan (FR13–FR14)
- Backend endpoints: `/api/personal-plan/me` and `/api/personal-plan/student/{id}`
- Frontend page: `src/pages/student/LearningPlan.tsx`

### UC8 – AI-Based Content Delivery (FR15)
- Backend endpoint: `/api/content-delivery` (student-only, studentId must match token)
- Frontend: `src/pages/student/AIContentDelivery.tsx` (should call `learningService.deliverNextContent`)

### UC9 – Content Update + Rationale (FR16–FR17)
- Backend endpoint: `/api/content-update` (student-only, validates `correctAnswerRate`)
- Frontend: calls exist in `learning.service.ts` (`updateContentByProgress`)

### UC10 – Progress Tracking (FR18–FR20)
- Backend endpoint: `/api/progress/me`, `/api/progress/{student_id}` (teacher/admin)
- Frontend page: `src/pages/student/Progress.tsx`
- Notes: some UI cards are placeholders (hard-coded), while “Live Progress” uses backend.

### UC11 – Data Export (FR21)
- Backend endpoint: `/api/export/progress/me.csv` and `/api/export/progress/{student_id}.csv`
- Frontend: `src/services/api/progress.service.ts` uses correct endpoints.
- Fix applied: `learningService.exportProgress` now uses the correct CSV endpoint.

### UC18 – Messaging & Announcement System (FR32)
- Backend endpoints: `/api/messaging/*`, `/api/announcements/*`
- Frontend pages: student/teacher messages pages exist.

### UC20 – Chatbot interaction (FR37–FR38)
- Backend endpoints: `/api/chatbot/*`
- Frontend page: `src/pages/student/Chatbot.tsx`

### Admin use cases (UC16–UC17)
- Frontend admin pages exist.
- Backend route files exist for admin/system features; verify they are registered in `app/api/router.py` and wired to frontend services.

---

## 4) Class Diagram → Code Mapping (UML Consistency)

Your class diagram is largely mirrored in the repo via **domain dataclasses** (conceptual model) plus **SQLAlchemy ORM models** (persistence model). In this codebase, many “entity methods” in the UML (e.g., `User.login()`, `Progress.getWeeklyProgress()`) are implemented in **service/controller** layers instead of inside entity objects (an *anemic domain model* approach). This is acceptable as long as you justify it in the report.

### Domain entities (UML ↔ domain models)
- User hierarchy: `User`, `Student`, `Teacher`, `Admin` exist in `backend/app/domain/models/user_hierarchy.py`.
- Enums: `UserRole`, `LanguageLevel`, `ContentType`, `AssignmentStatus` exist in `backend/app/domain/enums.py`.
- Tests: `Test`, `PlacementTest`, `SpeakingTest`, `ListeningTest`, `ReadingTest`, `WritingTest`, `TestModule`, `Question` exist in `backend/app/domain/models/tests.py`.
- Results: `TestResult`, `SpeakingResult` exist in `backend/app/domain/models/results.py`.
- Learning content: `LessonPlan`, `Topic`, `Content`, `Exercise` exist in `backend/app/domain/models/content.py`.
- Progress: `Progress`, `ProgressSnapshot` exist in `backend/app/domain/models/progress.py`.
- Messaging: `Message`, `Announcement` exist in `backend/app/domain/models/messaging.py`.

### Persistence model (UML ↔ ORM)
The ORM models mirror UML attributes with snake_case + JSON text fields where lists are needed.
- Users: `backend/app/infrastructure/db/models/user.py` (`UserDB`, `StudentDB`, `TeacherDB`, `AdminDB`)
- Tests: `backend/app/infrastructure/db/models/tests.py` (`TestDB`, module and question tables, specialized test tables)
- Results: `backend/app/infrastructure/db/models/results.py` (`TestResultDB`, `SpeakingResultDB`)
- Content/Plan: `backend/app/infrastructure/db/models/content.py` (`ContentDB`, `LessonPlanDB`, `TopicDB`, `ExerciseDB`)
- Messaging: `backend/app/infrastructure/db/models/messaging.py` (`MessageDB`, `AnnouncementDB`)
- Progress: `backend/app/infrastructure/db/models/progress.py` (`ProgressDB`, `ProgressSnapshotDB`)

### Controller/Service layer (where UML “methods” live)
Examples of UML operations being handled in services/controllers:
- Auth flows (`register/login/verify/reset`): `backend/app/application/services/auth_service.py` + `backend/app/application/controllers/auth_controller.py`
- UC7 plan generation: `backend/app/application/services/student_analysis_service.py` + `backend/app/application/controllers/student_analysis_controller.py`
- UC8 content delivery: `backend/app/application/services/content_delivery_service.py` + `backend/app/application/controllers/content_delivery_controller.py`
- UC9 content update: `backend/app/application/services/content_update_service.py` + `backend/app/application/controllers/content_update_controller.py`
- UC10 progress tracking: repositories + routes in `backend/app/api/routes/progress.py`

### UML alignment notes (important for checklist)
- Domain entity **methods are mostly stubs** (`pass`) in `backend/app/domain/models/*`. The implemented behavior is in application services/controllers and API routes.
- If your rubric expects “methods are fully implemented in classes”, state this as a deliberate architectural choice: entities represent state; services implement business rules.
- Attribute naming differs by layer (camelCase in UML/domain vs snake_case in DB). This is normal; include it as a mapping rule.

---

## 5) UI/UX Checklist (Web)

### Visual design & consistency
- Central CSS tokens/variables exist in `src/index.css`.
- Buttons/inputs/cards are standardized.

### Loading / error / disabled states
- Examples present in student dashboard, learning plan, progress, placement test.

### Responsive layout
- Many screens use grid/flex with `auto-fit` minmax; verify small-screen views manually.

---

## 6) Security & Access Control (Web)

What is covered:
- Token is stored in localStorage and attached via Axios interceptor.
- Backend checks token validity and role gates important endpoints.

What is not covered / needs explicit statement in report:
- Encryption at rest for user data (NFR3) is not implemented by default with SQLite.
- GDPR/KVKK compliance requires policy + data handling procedures (not code-only).

---

## 7) Open Items (Needed to fully satisfy the course checklist)

- Add UI screenshots per role (student/teacher/admin) and for each major use case.
- Add Git history evidence (commit messages, frequency, branch strategy).
- Confirm all backend route modules that exist as files are either:
  - registered in `app/api/router.py`, or
  - intentionally excluded and documented.
- Confirm speaking/listening modules end-to-end against backend endpoints used by `test.service.ts`.

---

## 8) UML Use Case Diagram feedback (quick improvements)

Your diagram covers the right actors and use cases for the scope.

Suggestions (optional, improves grading clarity):
- Use `<<include>>` relations where one use case always calls another:
  - Placement Test `<<include>>` (Listening/Reading/Writing + Speaking)
  - Content Update `<<include>>` Rationale Explanation
- Use `<<extend>>` for optional/conditional flows:
  - Rewards/Notification can `<<extend>>` completion events
- Keep naming consistent with requirements (e.g., “AI Analysis Engine” vs “AI Analyse Engine”).
- Consider separating “External Systems” actors (Notification, Speech Recognition, Chatbot) with a clear system boundary.
