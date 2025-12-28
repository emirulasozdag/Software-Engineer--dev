Personalized Learning Content
(AI-Powered Adaptive Curriculum) Project
Part 2
Department of Software Engineering, Ankara Science University
SENG 321 – Software Engineering
Instructor: Prof. Dr. Hakan Çağlar
Group Members:
Nisa Nur AKLAN – 220204012
Ceyda YILDIZ – 220204011
Emir Ulaş ÖZDAĞ – 220204041
Nisa Nur İLHAN – 220204053
Berke AKÇAY – 220204058
Elifnaz Köseoğlu – 220204027
1.Identify System and Related Actors
1.1 Understand the System and Its Requirements
 This project focuses on developing an AI-powered system that personalizes
English learning materials for each student. The system automatically selects or
generates lessons, exercises, and roleplay activities based on the student’s level,
goals, and learning pace. By doing so, it ensures that every learner receives
content suited to their individual needs, creating a more effective and engaging
learning process.
The main objective of this module is to increase the efficiency of English
education by offering customized learning experiences. Artificial intelligence
analyzes each student’s strengths and weaknesses and provides specific content
in areas such as grammar, vocabulary, pronunciation, and speaking. In this way,
learners receive additional support where needed and progress faster in areas
where they are already strong.
The module covers the dynamic adaptation of English learning materials
according to user performance data. The system continuously analyzes progress
and updates the lessons to maintain motivation and effectiveness. The ultimate
goal is to provide every student with a personalized, interactive, and efficient
English learning journey supported by artificial intelligence.
1.2Identify Actors
• Student
Logs into the system, completes tests, views their personalized plan, and sends
feedback.
• Teacher
Monitors student progress, assigns homework, and generates content
using AI.
• Admin
Manages system performance, user accounts, and the maintenance
process.
• AI Analyse Engine (External System)
Analyzes student data, generates personalized learning plans and content.
• Notification Service (External System)
Sends in-system notifications, reminders, and reward messages to students
and teachers.
• Chatbot (External System)
Interacts with students, provides guidance and Q&A support.
• AI Voice Recognition Service
Processes audio inputs from the speaking module, and analyzes
pronunciation accuracy.
1.3 Identify Requirements
1.3.1 Functional Requirements
User Accounts and Access
FR1: The system must allow students, teachers, and admins to create accounts
and log in.
FR2: The system must allow registered users to reset their password or recover
their account.
FR3: The system must require email verification for new user registrations.
Placement and Testing Modules
FR4: The system must offer the student separate placement test modules for
reading, writing, listening, and speaking.
FR5: The system must determine a separate (A1–C2) level for reading, writing,
listening, and speaking skills.
FR6: The system must accept voice input via the microphone in the speaking
module.
FR7: The system must be able to play audio files in the listening module.
FR8: The system must present text-based content in the reading test.
FR9: The system must accept text input in the writing module.
FR10: The system must analyze the student's pronunciation accuracy in the
speaking module.
FR11: The system must inform the student and the teacher with an interim
results screen after each module.
FR12: The system must generate an overall level (A1–C2) report at the end of
the test.
Personalized Content Generation and Learning Plan
FR13: The system must analyze the student's test results to identify their
strengths and weaknesses.
FR14: The system must generate a personalized lesson plan based on the
student's level.
FR15: The system must provide new content through an artificial intelligence
(AI) engine.
FR16: The system must automatically update the generated content based on
the student's progress.
FR17: The system must show the student a brief explanation of why the
generated content was selected.
Progress Tracking and Visualization
FR18: The system must present the student's past achievements to the student
and teacher using graphs, list completed lessons, and continuously store the
progress status in the database.
FR19: The system must list the student's completed lessons in chronological
order.
FR20: The system must display the student's progress status.
FR21: The system must allow the student and the teacher to export all progress
data as PDF or CSV.
Feedback and Motivation
FR22: The system must provide automatic feedback based on the student's
mistakes.
FR23: The system must allow the student to send feedback for the generated
content.
FR24: The system must offer a badge or point system based on achievements.
FR25: The system must send daily goal completion notifications to students.
Teacher Module
FR26: The system must allow the teacher to view the students' test results.
FR27: The system must allow the teacher to assign homework or assignments to
students.
FR28: The system must allow the teacher to list the students' strengths and
weaknesses.
Administrator and System Management
FR29: The system must allow the administrator to manage all user accounts.
FR30: The system must allow the administrator to view system performance
and statistics.
FR31: The system must allow the administrator to initiate maintenance mode
and announce scheduled updates.
Buyurun, listenin bu bölümünün (FR32–FR38) çevirisi:
Notification, Security, and Communication
FR32: The system must support a messaging and announcement system
between students and teachers.
FR33: The system must maintain and display a "Daily Streak" counter that
tracks the consecutive days a student logs in and completes at least one task.
FR34: The system must remind users via notification or email if they have not
logged in or completed lessons for a specific period.
FR35: The system must allow the teacher to provide directives to the AI engine
regarding the content to be generated for the student.
FR36: The system must continuously record and store the student's progress in
the database.
FR37: The system must provide a chatbot interface for student interaction.
FR38: The system must allow students to ask the chatbot questions about
lessons and exercises.
1.3.2 Non-Functional Requirements
NFR1: The interface must have a simple and intuitive design, allowing even
non-technical users to use the system with ease.
NFR2: The system must support at least 500 concurrent users taking tests or
accessing lessons without performance degradation.
NFR3: All user data and progress records must be stored encrypted, in
compliance with international data security standards.
NFR4: The system must be compatible with modern browsers (e.g., Chrome,
Safari, Edge, and Firefox) and its interface must be responsive, displaying
clearly on both desktop and mobile devices.
NFR5: The system must gracefully handle potential API errors.
NFR6: The implementation of new features must not break or adversely affect
existing system functionality.
NFR7: The system must provide 99% availability excluding scheduled
maintenance.
NFR8: All core operations (e.g., opening a lesson, submitting a test, viewing a
report) must be completable in 5 clicks or less.
NFR9: The system must be compliant with KVKK and GDPR data processing
standards.
NFR10: The database must be automatically backed up on a weekly basis, and
the backups must be retained for at least 30 days.
2.Define and Describe Use Cases
2.1 Define User- Goal Level Use Cases
UC1 – User Registration, Login and Email Verification (FR1–FR3)
Covers creating a new user account, logging in, and email verification for
account activation.
UC2 – Account Recovery (FR2)
Allows registered users to perform password reset or account recovery actions.
UC3 – Placement Test (FR4–FR5)
Provides a level assessment test measuring a student’s reading, writing,
listening, and speaking skills to determine A1–C2 level.
UC4 – Speaking Test and Voice Analysis (FR6, FR10)
Allows students to take speaking tasks via microphone input and enables the
system to analyze pronunciation accuracy.
UC5 – Listening, Reading and Writing Modules (FR7–FR9)
Enables students to progress through listening, reading and writing activities;
includes playing audio files, displaying texts and accepting written input.
UC6 – Displaying Test Results (FR11–FR12)
Informs students and teachers with intermediate results after each module and
provides an overall level report at the end of the test.
UC7 – Student Analysis and Personalized Content Plan (FR13–FR14)
The system analyzes the student’s test results, determines strengths/weaknesses,
and generates a personalized lesson plan.
UC8 – AI-Based Content Delivery (FR15)
The AI engine provides new exercises, tests, or lesson content based on student
needs.
UC9 – Content Update and Rationale Explanation (FR16–FR17)
The system automatically updates content according to student progress and
provides short explanations of why changes were made.
UC10 – Student Progress Tracking (FR18–FR19–FR20)
Displays historical achievements via charts, lists completed lessons, and
continuously stores progress in the database.
UC11 – Data Export (FR21)
Allows exporting student progress data in CSV or PDF format.
UC12 – Automatic Feedback (FR22)
The system provides automatic feedback based on student test results and
assignment performance.
UC13 – Submitting Feedback to the System (FR23)
Enables users to send feedback, suggestions, or bug reports regarding the
interface, content, or performance.
UC14 – Rewards, Motivation and Notification System (FR24 – FR25 -FR33
– FR34)
Covers badge rewards for student achievements, Daily Streak tracking, and
sending notifications.
UC15 – Teacher Assignment of Homework or Tasks (FR27)
Allows teachers to assign homework, tests, or activities to individual students or
groups.
UC16 – Admin Account Management (FR29)
Allows administrator users to manage all user accounts, roles, and permissions
in the system.
UC17 – System Performance and Maintenance Management (FR30–FR31)
The administrator can monitor system performance, view statistics, and activate
maintenance mode to publish updates.
UC18 – Messaging and Announcement System (FR32)
Enables messaging and sharing announcements between students and teachers.
UC19 – Teacher–AI Collaboration (FR35)
Teachers can give content generation directives to the AI engine and co-create
lesson materials with AI.
UC20 – Chatbot Interaction (FR37–FR38)
Allows students to ask questions, practice, and receive guidance via the chatbot
interface.
2.2 Draw a UML Use Case Diagram
2.3 Write Use Cases in Brief Format
Title Primary Actors Goal Brief
Descriptions
UC1 – User
Registration,
Login, and Email
Verification
Student, Teacher,
Admin
To create a new
user account,
verify email, and
log in.
The user fills in the
registration form,
verifies their email,
and logs in to the
system according to
their role.
UC2 – Account
Recovery
Student, Teacher,
Admin
To reset or recover
an account
password.
When the user
forgets the
password, they can
set a new one
through email
verification.
UC3 – Level
Assessment Test
Student To determine the
student’s English
proficiency level.
The student
completes reading,
writing, listening,
and speaking tests to
find out their A1–C2
level.
UC4 – Speaking
Test and Voice
Analysis
Student, Speech
Recognition
Service
To measure
speaking skills.
The student speaks
through the
microphone, and the
Speech Recognition
Service analyzes
pronunciation
accuracy.
UC5 – Listening,
Reading, and
Writing Modules
Student To improve
language skills.
The student
completes listening,
reading, and writing
exercises.
UC6 – Viewing
Test Results
Student, Teacher To view student
test results and
allow teacher
evaluation.
The student views
interim and final test
results; the teacher
reviews detailed
student outputs.
UC7 – Student
Analysis and
AI Analysis
Engine
To analyze student
performance.
The AI Analysis
Engine evaluates
test results,
Personalized Plan
Creation
identifies strengths
and weaknesses, and
creates a
personalized
learning plan.
UC8 – AI-Based
Content Delivery
Student, AI
Analysis Engine
To deliver
personalized
content to the
student.
AI provides
exercises and lesson
materials based on
the student’s level.
UC9 – Content
Update and
Explanation
AI Analysis
Engine
To update content
according to
student progress.
The engine
automatically
refreshes content
and provides short
explanations for
changes.
UC10 – Progress
Tracking
Student, Teacher To monitor the
student’s progress.
The student views
progress through
charts; the teacher
monitors progress
and trends per
student.
UC11 – Data
Export
Student, Teacher To export progress
and report data.
The student exports
personal reports; the
teacher exports class
or student reports in
PDF or CSV format.
UC12 –
Automatic
Feedback
AI Analysis
Engine
To provide
automatic feedback
to the student.
The engine analyzes
student mistakes and
offers corrective
suggestions.
UC13 – System
Feedback
Submission
Student To give feedback
about the system.
The student submits
comments or bug
reports about
content or system
operation.
UC14 – Reward,
Motivation, and
Notification
System
Notification
Service, Student
To motivate the
student.
The Notification
Service enhances
motivation through
badges, points, and
notifications; the
student views their
rewards and
notifications.
UC15 –
Assignment or
Task Allocation
by Teacher
Teacher To assign tasks to
students.
The teacher creates
and assigns
individual or group
tasks.
UC16 – Admin
Account
Management
Admin To manage user
accounts.
The admin adjusts
user roles and
permissions.
UC17 – System
Performance and
Maintenance
Management
Admin To monitor system
performance and
perform
maintenance.
The admin monitors
system statistics,
initiates
maintenance mode,
and announces
updates.
UC18 –
Messaging and
Announcement
System
Student, Teacher To facilitate
communication.
Messages and
announcements are
shared between
teachers and
students.
UC19 – Teacher–
AI Collaboration
AI Analysis
Engine, Teacher
To create
intelligent content.
The teacher instructs
the AI engine to
produce
personalized
learning materials
for the student.
UC20 – Chatbot
Interaction
Student, Chatbot To learn through
conversation
The student interacts
with the chatbot to
get information
about lessons or to
practice.
2.4 Complete Fully Dressed Use Case
UC1 – User Registration, Login, and Email Verification (FR1–FR3)
• Primary Actor: Student, Teacher, Admin
• Goal (Purpose in Context): To create a new user account, complete
email verification, and log into the system.
• Stakeholders and Interests:
o User (Student/Teacher/Admin): Wants to create their account
and access the system.
o Notification Service: Delivers the email verification link to the
user.
• Preconditions:
o The user must have a valid email address.
o The system registration screen must be accessible.
• Success Guarantee: The user account is successfully created, verified,
and becomes ready for login.
• Main Scenario:
1. The user accesses the registration form.
2. The user enters their name, email, and password.
3. The system creates the user account and sends an email
verification link.
4. The user clicks the link in their email.
5. The system verifies the account.
6. The user logs into the system using the login form.
• Exception Flows (Alternative Flows):
o 1a. If the user already has an account, they log in directly using
the login form.
o 3a. If the email is invalid, the system displays an error message.
o 4a. If the verification link expires, the system sends a new link.
UC2 – Account Recovery (FR2)
• Primary Actor: Student, Teacher, Admin
• Goal (Purpose in Context): To allow users who have forgotten their
password to regain access to their accounts via an email password
reset process.
• Stakeholders and Interests:
o User: Wants to regain access to their account.
o Notification Service: Sends the password reset link via email.
• Preconditions: The user must be registered in the system.
• Success Guarantee: The user sets a new password and can log into
their account again.
• Main Scenario:
1. The user clicks the "Forgot Password" option.
2. The user enters their email address.
3. The system validates the email address.
4. The system sends the reset link via the Notification Service.
5. The user clicks the link in the email.
6. The user creates their new password.
7. The system permits login with the new password.
• Exception Flows:
o 2a. If the email is not registered in the system, an error message
is displayed.
o 4a. If the email server does not respond, the process is retried
later.
UC3 – Placement Test (FR4–FR5)
• Primary Actor: Student
• Goal (Purpose in Context): To determine the student's English level
(A1–C2) by measuring their reading, writing, listening, and speaking
skills.
• Stakeholders and Interests:
o Student: Wants to learn their English level.
o Teacher: Wants to assign appropriate content based on the
student's level.
o AI Analysis Engine: Analyzes the assessment results and
determines the correct level.
• Preconditions: The student must be logged into the system.
• Success Guarantee: The placement test is completed, and an accurate
level (A1–C2) report is generated.
• Main Scenario:
1. The student starts the "Placement Test".
2. The system presents the modules for the four skills sequentially.
3. The student completes each module.
4. The system analyzes all answers.
5. The results are reflected on the student's dashboard.
• Exception Flows:
o 4a. If the student leaves the test in the middle (quits), their
progress is saved.
UC4 – Speaking Test and Voice Analysis (FR6, FR10)
• Primary Actor: Student
• Goal (Purpose in Context): To measure the student's speaking skill
via the microphone and analyze pronunciation accuracy.
• Stakeholders and Interests:
o Student: Wants to improve their pronunciation skills.
o Voice Recognition Service: Analyzes the voice data and
determines the accuracy rate.
• Preconditions: Microphone access must be enabled.
• Success Guarantee: The pronunciation analysis is completed, and
feedback is provided to the student.
• Main Scenario:
1. The student starts the speaking test.
2. The system displays the sample sentence (audio or text).
3. The student provides their answer via the microphone.
4. The Voice Recognition Service analyzes the audio.
5. The system saves the results and shows them to the student.
• Exception Flows:
o 3a. If microphone permission has not been granted, the system
requests permission.
o 4a. If no audio input is detected, the student is given another
attempt.
UC5 – Listening, Reading, and Writing Modules (FR7–FR8-FR9)
• Primary Actor: Student
• Goal (Purpose in Context): To enable the student to complete
listening, reading, and writing activities to improve their language
skills.
• Stakeholders and Interests:
o Student: Wants to improve their language skills.
• Preconditions:
o The student must be logged in.
o The relevant tests must be active.
• Success Guarantee: All modules are completed, and the student's
progress is saved.
• Main Scenario:
1. The student opens the listening module and listens to the audio
files.
2. The student answers the related questions.
3. In the reading module, the student reads the texts and answers
questions.
4. In the writing module, the student writes short texts on the given
topics.
5. The system saves all responses and calculates the scores.
• Exception Flows:
o 1a. If the audio file fails to load, the system attempts to reload
it.
o 4a. If an empty text is submitted, a warning is displayed.
UC6 – Viewing Test Results (FR11–FR12-FR26)
• Primary Actor: Student, Teacher
• Goal (Purpose in Context): To enable the student to view their own
results and the teacher to review these results after the tests.
• Stakeholders and Interests:
o Student: Wants to see their own test results.
o Teacher: Wants to track the students' performance.
• Preconditions:
o The student must have completed the test.
o The teacher must be authorized for the student's course.
• Success Guarantee: The results are displayed correctly; the student
and teacher can access the relevant reports.
• Main Scenario:
1. After completing the test, the student opens the "My Results"
tab.
2. The system retrieves the test data.
3. The student sees their scores, level, and error analysis.
4. The teacher views the overall or individual results for the same
test.
5. The system updates all access logs.
• Exception Flows:
o 3a. If the test data cannot be found, an error message is shown
to the user.
UC7 – Student Analysis and Personal Plan Generation (FR13–FR14)
• Primary Actor: AI Analysis Engine
• Goal (Purpose in Context): To analyze the student's test results and
create a personalized lesson plan based on their strengths and
weaknesses.
• Stakeholders and Interests:
o Student: Wants to see which areas they need to improve.
o Teacher: Wants to organize lessons according to the student's
plan.
o System (AI Engine): Wants to analyze the data and produce an
appropriate content plan.
• Preconditions:
o The student must have at least one completed test.
• Success Guarantee: The personalized learning plan is successfully
generated and displayed to the student.
• Main Scenario:
1. The system analyzes the student's test results.
2. The AI engine identifies strengths and weaknesses.
3. A list of topic recommendations is created based on the
student's level.
4. The system displays the personal plan to the student.
• Exception Flows:
o 2a. If the analysis engine detects missing data, it generates a
general plan.
UC8 – AI-Based Content Delivery (FR15)
• Primary Actor: AI Analysis Engine
• Goal (Purpose in Context): To generate and deliver new lesson
content, exercises, and tests appropriate for the student's level.
• Stakeholders and Interests:
o AI Engine: Automatically generates content.
o Student: Wants to study with materials appropriate for their
level.
• Preconditions:
o The student's level information must have been analyzed.
• Success Guarantee: The AI-generated content is displayed to the
student and is accessible.
• Main Scenario:
1. The system checks the student's level information.
2. The AI engine determines the appropriate exercise type.
3. The AI generates content (e.g., sample sentence, text, exercise).
4. The system adds the content for the student.
5. The student accesses the content and starts studying.
• Exception Flows:
o 3a. If content generation fails, the system re-recommends the
last used material.
UC9 – Content Update and Rationale Display (FR16–FR17)
• Primary Actor: AI Analysis Engine
• Goal (Purpose in Context): To automatically update lesson content
based on student progress and explain the rationale for the changes.
• Stakeholders and Interests:
o AI Engine: Wants to monitor progress data and dynamically
update content.
o Student: Wants to know why the content has changed.
• Preconditions:
o The student must have at least one completed lesson or test
result.
• Success Guarantee: The student's lesson plan is updated according to
their latest performance, and a logical explanation for this change is
provided to the student.
• Main Scenario:
1. The system checks the student's progress status.
2. The AI engine compares the progress with the current content.
3. It generates new content for areas where insufficient
performance is detected.
4. The updated content is displayed to the student.
5. A brief "why explanation" (e.g., "This topic was not sufficiently
reinforced") is included with each change.
• Exception Flows:
o 2a. If the data cannot be updated, the system temporarily
retains the existing content.
o 4a. If the student rejects the change, the system allows manual
editing.
UC10 – Student Progress Tracking (FR18–FR20-FR28)
• Primary Actor: Student, Teacher
• Goal (Purpose in Context): To show the student's past achievements
with graphs, list completed lessons, and record progress status.
• Stakeholders and Interests:
o Student: Wants to see their own development.
o Teacher: Wants to monitor and supervise the student's
development.
• Preconditions:
o The student must have at least one completed content item or
test result.
• Success Guarantee: Progress data is updated, graphs are generated,
and shown to both the student and the teacher.
• Main Scenario:
1. The student clicks on the "My Progress" tab.
2. The system fetches past lesson and test data from the database.
3. The lessons completed by the student are listed.
4. Graphical success rates (e.g., percentage of correct answers) are
generated.
5. The teacher views the student's development from their own
panel.
6. The system records all new data daily.
• Exception Flows:
o 2a. If the database connection is lost, the system displays the
most recent data.
o 4a. If graphs cannot be generated, the data is presented in table
format.
UC11 – Data Export (FR21)
• Primary Actor: Student, Teacher
• Supporting Actor: System Database
• Goal (Purpose in Context): To export progress data, test reports, and
success rates in PDF or CSV format for the student or teacher.
• Stakeholders and Interests:
o Student: Wants to export their own progress reports.
o Teacher: Wants to save class-based or student-based reports.
• Preconditions:
o The student or teacher must be logged in.
o There must be at least one saved progress or test result.
• Success Guarantee: Reports are successfully exported, and the file
becomes downloadable on the device.
• Main Scenario:
1. The user (student/teacher) selects the "Export Data" option.
2. The system lists available report types (test results, graphs,
overall progress, etc.).
3. The user selects the file format (PDF or CSV).
4. The system converts the data to the selected format.
5. The system presents the file as a download link.
6. The user downloads the file.
• Exception Flows:
o 2a. If no data is found, the system displays a "No report
generated yet" warning.
o 4a. If a format conversion error occurs, the system re-processes
the request.
o 5a. If the link expires, a new link is generated for the user.
UC12 – Automatic Feedback (FR22)
• Primary Actor: AI Analysis Engine
• Goal (Purpose in Context): To generate automatic feedback based on
the student's test results and assignment performance.
• Stakeholders and Interests:
o AI Engine: Wants to generate error-focused suggestions by
analyzing test results.
o Student: Wants to learn their mistakes and areas for
improvement.
o Teacher: Wants to assign additional homework to the student
based on automatic suggestions.
• Preconditions:
o The student must have at least one completed test.
• Success Guarantee: The AI engine produces appropriate feedback
messages for the student after each test.
• Main Scenario:
1. The system retrieves the student's latest test results.
2. The AI engine analyzes incorrect answers and weak topics.
3. The AI engine generates automatic feedback for each incorrect
answer.
• Exception Flows:
o 4a. If the feedback fails to load, the system sends an email
notification to the user.
UC13 – Submitting System Feedback (FR23)
• Primary Actor: Student
• Goal (Purpose in Context): To allow users to send feedback,
suggestions, or error reports about the system, interface, or content.
• Stakeholders and Interests:
o Student: Wants to send opinions or error reports about the
system.
o Admin: Wants to review user feedback and make system
improvements.
• Preconditions:
o The user must be logged in.
• Success Guarantee: The feedback is saved in the system and notified to
the relevant administrators.
• Main Scenario:
1. The user enters the "Feedback" menu.
2. The user enters a subject line and description.
3. The system saves the feedback.
4. An automatic notification is sent to the Admin.
5. A "Your feedback has been received" message is displayed to the
user.
• Exception Flows:
o 2a. If the user leaves the description field blank, the system
displays a warning.
o 4a. If the Admin cannot be reached, the notification is queued to be
sent later.
UC14 – Reward, Motivation, and Notification System (FR24–FR25, FR33–
FR34)
• Primary Actor: Notification Service, Student
• Goal in Context: To operate reward, badge, and notification mechanisms
to motivate students.
• Stakeholders and Interests:
o Student: Wants to see their achievements and receive rewards.
o Notification Service: Tracks daily logins, delivers reward
notifications.
• Preconditions:
o The student must be logged into the system.
• Success Guarantee: The daily streak, badges, and notifications are
displayed correctly.
• Main Scenario:
1. The system records the student's daily login.
2. The Notification Service updates the "Daily Streak" counter.
3. When the student completes their goal, the system gives a reward
(badge/points).
4. The Notification Service sends the reward notification to the
student.
5. The new badge/points appear on the student's panel.
• Exception Flows:
o 2a. If the student does not log in for several days, the system sends
a "Reminder notification."
o 3a. If the goal is not completed, the system displays a motivational
message.
UC15 – Teacher Assigns Homework or Assignments (FR27)
• Primary Actor: Teacher
• Goal in Context: To enable the teacher to assign homework, tests, or
activities to individual students or groups.
• Stakeholders and Interests:
o Teacher: Wants to assign appropriate homework to students.
o Student: Wants to see and complete assigned homework on time.
• Preconditions:
o The teacher must be logged in, and their students must be defined
in the system.
• Success Guarantee: The homework is successfully assigned, a
notification is sent to the student, and a system record is created.
• Main Scenario:
1. The teacher opens the "Assign Homework" screen.
2. The teacher selects the target student or group.
3. The teacher enters the assignment type, title, due date, and
description.
4. The system creates the assignment.
5. The Notification Service sends a homework notification to the
student.
• Exception Flows:
o 2a. If the student list fails to load, the system requests a refresh.
o 3a. If a past date is entered as the due date, the system displays a
warning.
UC16 – Admin Account Management (FR29)
• Primary Actor: Admin
• Goal in Context: To allow administrators to manage all accounts, roles,
and permissions in the system.
• Stakeholders and Interests:
o Admin: Wants to control account security and role structure.
o User: Expects the admin to be able to fix any issues with their
accounts.
• Preconditions:
o The Admin's and users' accounts must be active and verified.
• Success Guarantee: User accounts are edited, and changes are committed
to the system logs.
• Main Scenario:
1. The Admin logs in as an administrator.
2. The Admin accesses the user list.
3. The Admin changes a user's role or status.
4. The system saves the change.
5. The updated information takes effect instantly.
• Exception Flows:
o 3a. If an unauthorized change is attempted, the system displays a
warning.
UC17 – System Performance and Maintenance Management (FR30–FR31)
• Primary Actor: Admin
• Goal in Context: To enable the administrator to monitor the system's
overall health, performance, and usage statistics, and to put the system
into maintenance mode for scheduled updates.
• Stakeholders and Interests:
o Admin: Wants to ensure stable system operation and timely
updates.
o User: Cannot log into the system while it is in maintenance mode.
• Preconditions:
o The Admin account must be active.
o Access to the system administration panel must be authorized.
• Success Guarantee: Performance reports are displayed, maintenance
mode is successfully initiated, and updates are logged.
• Main Scenario:
1. The Admin logs into the administration panel.
2. The Admin selects the "System Performance" tab.
3. The system displays statistics such as CPU, memory, and user load.
4. The Admin initiates maintenance mode.
5. The system temporarily restricts user access.
6. When the update is complete, the system returns to normal mode.
• Exception Flows:
o 3a. If statistics data cannot be retrieved, the system displays a
"Cannot access data source" warning.
o 5a. If user sessions are not terminated, the system initiates a forced
logout.
UC18 – Messaging and Announcement System (FR32)
• Primary Actor: Student, Teacher
• Goal (Purpose in Context): To provide messaging and announcement
sharing between students and teachers.
• Stakeholders and Interests:
o Teacher: Wants to send mass announcements to their students.
o Student: Wants to communicate individually with their teacher.
o Notification Service: Wants to deliver new message and
announcement notifications.
• Preconditions:
o The student and teacher must be logged into the system.
• Success Guarantee: The message or announcement reaches the
recipient and is saved in the system.
• Main Scenario:
1. The user (student/teacher) enters the "Messages" tab.
2. The user creates a new message or announcement.
3. The system displays the recipient list.
4. The user selects the recipients and sends the message.
5. The Notification Service sends an alert to the recipient.
6. The recipient views the message in their panel.
• Exception Flows:
o 3a. If the recipient cannot be found, the system displays a warning.
o 5a. If the Notification Service is disabled, the message is delivered
to the in-system inbox.
UC19 – Teacher–AI Collaboration (FR35)
• Primary Actor: Teacher, AI Analysis Engine
• Goal in Context: For the teacher to prepare custom lesson materials for
students by giving content creation instructions to the AI engine.
• Stakeholders and Interests:
o Teacher: Wants to design custom materials for students.
o AI Analysis Engine: Wants to generate new content based on
instructions.
• Preconditions:
o The teacher must be logged in.
o The AI Engine must be online.
• Success Guarantee: The content is successfully created, assigned to the
student, and stored in the system.
• Main Scenario:
1. The teacher opens the "AI Content Generation" module.
2. The teacher enters a lesson or topic title.
3. The AI Engine processes the inputs and generates suggested
content.
4. The teacher reviews the suggested content and edits it if necessary.
5. The system saves the content and assigns it to students.
• Exception Flows:
o 3a. If the AI Engine cannot generate suitable content, the system
offers a "Regenerate" option.
o 4a. If the teacher cancels the edit, the content is saved as a draft.
UC20 – Chatbot Interaction (FR37–FR38)
• Primary Actor: Student, Chatbot
• Goal (Purpose in Context): To allow students to ask questions about
lessons and exercises, practice, and receive guidance via the chatbot
interface.
• Stakeholders and Interests:
o Student: Wants to get guidance from the chatbot and find quick
answers to their questions.
o Chatbot Service: Wants to provide appropriate and accurate
responses to the student.
• Preconditions:
o The student must be logged into the system.
o The Chatbot service must be active.
• Success Guarantee: The chatbot interacts with the student, provides
correct answers, and the conversation history is saved.
• Main Scenario:
1. The student opens the Chatbot interface.
2. The student asks a question about a lesson or topic.
3. The Chatbot processes the message and generates an appropriate
response.
4. The student reviews the response and can ask a new question.
5. The system saves the entire chat history.
• Exception Flows:
o 2a. If the chatbot connection is lost, the system displays an error
message.
o 3a. If the chatbot receives a question it does not understand, it
sends a "Could you please rephrase your question?" message.


UML:

title AI-Powered English Learning System - Class Diagram

' ==========================================
' DOMAIN ENTITIES / MODELS
' ==========================================
package "Domain Entities" {
    
    ' ---- User Hierarchy (UC1, UC2, UC16) ----
    abstract class User {
        - userId: int
        - name: String
        - email: String
        - password: String
        - role: UserRole
        - isVerified: boolean
        - createdAt: Date
        - lastLogin: Date
        + register()
        + login()
        + logout()
        + verifyEmail(token: String)
        + resetPassword(newPassword: String)
        + updateProfile()
    }
    
    enum UserRole {
        STUDENT
        TEACHER
        ADMIN
    }
    
    class Student {
        - level: LanguageLevel
        - dailyStreak: int
        - totalPoints: int
        - enrollmentDate: Date
        + takePlacementTest()
        + viewProgress()
        + viewResults()
        + submitFeedback()
        + startChatbot()
    }
    
    class Teacher {
        - department: String
        - specialization: String
        + assignHomework()
        + viewStudentProgress()
        + createContent()
        + sendAnnouncement()
        + collaborateWithAI()
    }
    
    class Admin {
        - adminLevel: int
        - permissions: String[]
        + manageUsers()
        + changeUserRole(userId: int, role: UserRole)
        + viewSystemPerformance()
        + enableMaintenanceMode()
        + viewSystemLogs()
    }
    
    enum LanguageLevel {
        A1
        A2
        B1
        B2
        C1
        C2
    }
    
    ' ---- Test Entities (UC3, UC4, UC5, UC6) ----
    abstract class Test {
        - testId: int
        - title: String
        - description: String
        - duration: int
        - maxScore: int
        - createdAt: Date
        + start()
        + submit()
        + calculateScore(): int
    }
    
    class PlacementTest {
        - readingModule: TestModule
        - writingModule: TestModule
        - listeningModule: TestModule
        - speakingModule: TestModule
        + evaluateLevel(): LanguageLevel
    }
    
    class SpeakingTest {
        - sampleSentence: String
        - audioFile: String
        - pronunciationCriteria: String[]
        + displaySample()
        + recordAudio()
        + analyzeAccuracy(): double
    }
    
    class ListeningTest {
        - audioFiles: String[]
        - questions: Question[]
        + playAudio()
        + submitAnswers()
    }
    
    class ReadingTest {
        - passages: String[]
        - questions: Question[]
        + displayPassage()
        + submitAnswers()
    }
    
    class WritingTest {
        - topic: String
        - minWords: int
        - maxWords: int
        + submitText(text: String)
        + evaluateWriting(): int
    }
    
    class TestModule {
        - moduleId: int
        - moduleType: String
        - questions: Question[]
        - score: int
        + loadQuestions()
        + submitModule()
    }
    
    class Question {
        - questionId: int
        - text: String
        - options: String[]
        - correctAnswer: String
        - points: int
        + validateAnswer(answer: String): boolean
    }
    
    ' ---- Result Entities (UC6, UC12) ----
    class TestResult {
        - resultId: int
        - studentId: int
        - testId: int
        - score: int
        - level: LanguageLevel
        - completedAt: Date
        - strengths: String[]
        - weaknesses: String[]
        + getScoreBreakdown(): Map
        + generateReport(): String
    }
    
    class SpeakingResult {
        - sessionId: int
        - audioData: byte[]
        - accuracyScore: double
        - pronunciationFeedback: String
        - completedAt: Date
        + getFeedback(): String
    }
    
    ' ---- Learning Content Entities (UC7, UC8, UC9, UC19) ----
    class LessonPlan {
        - planId: int
        - studentId: int
        - topics: Topic[]
        - recommendedLevel: LanguageLevel
        - createdAt: Date
        - updatedAt: Date
        - isGeneral: boolean
        + getTopicList(): Topic[]
        + updatePlan(topics: Topic[])
    }
    
    class Topic {
        - topicId: int
        - name: String
        - category: String
        - difficulty: LanguageLevel
        - priority: int
        + getExercises(): Exercise[]
    }
    
    class Content {
        - contentId: int
        - title: String
        - body: String
        - contentType: ContentType
        - level: LanguageLevel
        - createdBy: int
        - createdAt: Date
        - isDraft: boolean
        + display()
        + edit(newBody: String)
        + publish()
    }
    
    enum ContentType {
        LESSON
        EXERCISE
        ROLEPLAY
        VOCABULARY
        GRAMMAR
    }
    
    class Exercise {
        - exerciseId: int
        - type: String
        - instructions: String
        - questions: Question[]
        - maxScore: int
        + start()
        + submit()
        + getScore(): int
    }
    
    ' ---- Progress Entities (UC10, UC11) ----
    class Progress {
        - progressId: int
        - studentId: int
        - completedLessons: int[]
        - completedTests: int[]
        - correctAnswerRate: double
        - lastUpdated: Date
        + getCompletionRate(): double
        + getWeeklyProgress(): Map
    }
    
    class ProgressSnapshot {
        - snapshotId: int
        - studentId: int
        - snapshotDate: Date
        - progressData: String
        + getSnapshot(): Progress
    }
    
    ' ---- Feedback Entities (UC12, UC13) ----
    class Feedback {
        - feedbackId: int
        - studentId: int
        - testResultId: int
        - feedbackList: String[]
        - generatedAt: Date
        + displayFeedback()
    }
    
    
    ' ---- Assignment Entities (UC15) ----
    class Assignment {
        - assignmentId: int
        - teacherId: int
        - title: String
        - description: String
        - dueDate: Date
        - assignmentType: String
        - createdAt: Date
        + assign(studentIds: int[])
        + updateDueDate(newDate: Date)
    }
    
    class StudentAssignment {
        - studentAssignmentId: int
        - assignmentId: int
        - studentId: int
        - status: AssignmentStatus
        - submittedAt: Date
        - score: int
        + submit()
        + grade(score: int)
    }
    
    enum AssignmentStatus {
        PENDING
        SUBMITTED
        GRADED
        LATE
    }
    
    ' ---- Messaging Entities (UC18) ----
    class Message {
        - messageId: int
        - senderId: int
        - recipientId: int
        - subject: String
        - body: String
        - isRead: boolean
        - sentAt: Date
        + send()
        + markAsRead()
    }
    
    class Announcement {
        - announcementId: int
        - teacherId: int
        - title: String
        - content: String
        - recipientGroup: int[]
        - createdAt: Date
        + publish()
        + getRecipients(): User[]
    }
    
    ' ---- Reward Entities (UC14) ----
    class Reward {
        - rewardId: int
        - name: String
        - description: String
        - points: int
        - badgeIcon: String
        + awardTo(studentId: int)
    }
    
    class StudentReward {
        - studentRewardId: int
        - studentId: int
        - rewardId: int
        - earnedAt: Date
        + display()
    }
    
    ' ---- Chatbot Entities (UC20) ----
    class ChatSession {
        - sessionId: int
        - studentId: int
        - startedAt: Date
        - endedAt: Date
        - messages: ChatMessage[]
        + addMessage(message: ChatMessage)
        + endSession()
    }
    
    class ChatMessage {
        - messageId: int
        - sessionId: int
        - sender: String
        - content: String
        - timestamp: Date
        + display()
    }
    
    ' ---- System Entities (UC17) ----
    class SystemPerformance {
        - performanceId: int
        - cpuUsage: double
        - memoryUsage: double
        - activeUsers: int
        - recordedAt: Date
        + getStatistics(): Map
    }
    
    class MaintenanceLog {
        - logId: int
        - adminId: int
        - startTime: Date
        - endTime: Date
        - reason: String
        + startMaintenance()
        + endMaintenance()
    }
}

' ==========================================
' UI LAYER (Following Sequence Diagram Pattern)
' ==========================================
package "UI Layer" {
    
    class RegistrationUI {
        + displayRegistrationForm()
        + displayLoginForm()
        + displayVerificationMessage()
        + displayError(message: String)
    }
    
    class PasswordRecoveryUI {
        + displayForgotPasswordForm()
        + displayResetPasswordForm()
        + displaySuccessMessage()
    }
    
    class PlacementTestUI {
        + displayTestModules()
        + displayQuestion(question: Question)
        + displayResults()
        + saveProgress()
    }
    
    class SpeakingTestUI {
        + startSpeakingTest()
        + showSampleSentence(sampleText: String, audioFile: String)
        + submitSpeech(audioData: byte[])
        + requestMicrophonePermission()
        + showResult(accuracyScore: double, feedback: String)
        + showRetryMessage()
    }
    
    class ListeningTestUI {
        + displayAudioPlayer()
        + displayQuestions()
        + submitAnswers()
        + reloadAudio()
    }
    
    class ReadingTestUI {
        + displayPassage()
        + displayQuestions()
        + submitAnswers()
    }
    
    class WritingTestUI {
        + displayTopic()
        + displayTextEditor()
        + submitText()
        + showWarning(message: String)
    }
    
    class TestResultsUI {
        + displayResults(results: TestResult)
        + displayErrorAnalysis()
        + showError(message: String)
    }
    
    class PersonalPlanUI {
        + viewPersonalPlan()
        + updatePersonalPlanView(studentId: int, plan: LessonPlan)
        + displayTopicRecommendations()
    }
    
    class LearningContentUI {
        + requestNextContent()
        + updateContentView(studentId: int, content: Content)
        + displayExercise()
        + displayRationale(reason: String)
    }
    
    class StudentProgressUI {
        + viewMyProgress()
        + displayStudentProgress(viewModel: Object)
        + displayGraphs()
        + displayTable()
    }
    
    class TeacherProgressUI {
        + viewStudentProgress(studentId: int)
        + displayStudentProgressSummary(summary: Object)
        + displayClassProgress()
    }
    
    class DataExportUI {
        + selectExportOption()
        + selectFormat(format: String)
        + displayDownloadLink(link: String)
        + showNoDataWarning()
    }
    
    class FeedbackUI {
        + viewLatestFeedback()
        + displayFeedback(studentId: int, feedbackList: String[])
        + showErrorState()
    }
    
    
    class RewardUI {
        + displayRewards()
        + displayBadges()
        + displayDailyStreak(days: int)
        + showMotivationalMessage()
    }
    
    class AssignmentUI {
        + displayAssignHomeworkForm()
        + selectStudents()
        + submitAssignment()
        + showWarning(message: String)
    }
    
    class StudentAssignmentUI {
        + displayAssignments()
        + viewAssignmentDetails()
        + submitAssignment()
    }
    
    class AdminDashboardUI {
        + displayUserList()
        + displaySystemPerformance()
        + displayMaintenanceControls()
        + showWarning(message: String)
    }
    
    class MessagingUI {
        + displayInbox()
        + composeMessage()
        + sendMessage()
        + showWarning(message: String)
    }
    
    class AnnouncementUI {
        + displayAnnouncements()
        + createAnnouncement()
        + publishAnnouncement()
    }
    
    class AIContentGenerationUI {
        + openAIContentGenerationModule()
        + enterLessonTopic(title: String, instructions: String)
        + showSuggestedContent(contentDraft: Content)
        + displayDraftForReview()
        + submitEditedContent(finalContent: Content)
        + cancelEdit()
        + showRegenerateOption()
        + updateTeacherContentView()
    }
    
    class ChatbotUI {
        + openChatInterface()
        + sendMessage(message: String)
        + displayResponse(response: String)
        + displayHistory()
        + showConnectionError()
    }
}

' ==========================================
' CONTROLLER LAYER
' ==========================================
package "Controller Layer" {
    
    class AuthController {
        + register(name: String, email: String, password: String)
        + login(email: String, password: String)
        + verifyEmail(token: String)
        + requestPasswordReset(email: String)
        + resetPassword(token: String, newPassword: String)
    }
    
    class PlacementTestController {
        + startPlacementTest(studentId: int)
        + submitModule(studentId: int, moduleId: int, answers: Map)
        + completeTest(studentId: int)
        + saveProgress(studentId: int, progress: Map)
    }
    
    class SpeakingTestController {
        + beginSpeakingTest(studentId: int)
        + submitSpeech(sessionId: int, audioData: byte[])
        + showResult(accuracyScore: double, feedback: String)
        + showRetryMessage()
    }
    
    class ListeningTestController {
        + startListeningTest(studentId: int)
        + submitAnswers(testId: int, answers: Map)
        + reloadAudio(audioId: int)
    }
    
    class ReadingTestController {
        + startReadingTest(studentId: int)
        + submitAnswers(testId: int, answers: Map)
    }
    
    class WritingTestController {
        + startWritingTest(studentId: int)
        + submitWriting(testId: int, text: String)
    }
    
    class TestResultController {
        + getResults(studentId: int, testId: int)
        + getResultsForTeacher(teacherId: int, studentId: int)
        + logAccess(userId: int, resultId: int)
    }
    
    class StudentAnalysisController {
        + requestPersonalPlan(studentId: int)
        + generatePersonalPlan(studentId: int)
        + updatePersonalPlanView(studentId: int, plan: LessonPlan)
    }
    
    class ContentDeliveryController {
        + startContentDelivery(studentId: int)
        + prepareContentForStudent(studentId: int)
        + updateContentView(studentId: int, content: Content)
    }
    
    class ContentUpdateController {
        + checkProgressStatus(studentId: int)
        + updateContent(studentId: int)
        + displayRationale(studentId: int, reason: String)
        + rejectUpdate(studentId: int)
    }
    
    class ProgressTrackingController {
        + requestStudentProgress(studentId: int)
        + requestStudentProgressForTeacher(studentId: int)
        + displayStudentProgress(viewModel: Object)
        + displayStudentProgressSummary(summary: Object)
    }
    
    class DataExportController {
        + listReportTypes(userId: int)
        + exportData(userId: int, reportType: String, format: String)
        + generateDownloadLink(fileId: int)
    }
    
    class AutomaticFeedbackController {
        + requestAutomaticFeedback(studentId: int)
        + displayFeedback(studentId: int, feedbackList: String[])
    }
    
    
    class RewardController {
        + recordDailyLogin(studentId: int)
        + checkGoalCompletion(studentId: int)
        + awardReward(studentId: int, rewardId: int)
        + sendReminder(studentId: int)
    }
    
    class AssignmentController {
        + createAssignment(teacherId: int, assignment: Assignment)
        + assignToStudents(assignmentId: int, studentIds: int[])
        + getStudentAssignments(studentId: int)
        + submitAssignment(studentAssignmentId: int)
    }
    
    class AdminController {
        + getUserList()
        + updateUserRole(userId: int, role: UserRole)
        + updateUserStatus(userId: int, status: String)
        + getSystemPerformance()
        + enableMaintenanceMode()
        + disableMaintenanceMode()
    }
    
    class MessageController {
        + getInbox(userId: int)
        + sendMessage(senderId: int, recipientId: int, message: Message)
        + markAsRead(messageId: int)
    }
    
    class AnnouncementController {
        + createAnnouncement(teacherId: int, announcement: Announcement)
        + publishAnnouncement(announcementId: int)
        + getAnnouncements(userId: int)
    }
    
    class AIContentController {
        + startContentCreationSession(teacherId: int)
        + submitContentInputs(teacherId: int, title: String, instructions: String)
        + saveApprovedContent(teacherId: int, finalContent: Content)
        + saveDraftRequest(teacherId: int, contentDraft: Content)
        + showRegenerateOption()
        + updateTeacherContentView()
    }
    
    class ChatbotController {
        + startChatSession(studentId: int)
        + sendMessage(sessionId: int, message: String)
        + endChatSession(sessionId: int)
        + getChatHistory(sessionId: int)
    }
}

' ==========================================
' SERVICE LAYER
' ==========================================
package "Service Layer" {
    
    class AuthService {
        + createUser(name: String, email: String, password: String): User
        + validateCredentials(email: String, password: String): boolean
        + sendVerificationEmail(userId: int)
        + verifyEmailToken(token: String): boolean
        + generateResetToken(email: String): String
        + updatePassword(userId: int, newPassword: String)
    }
    
    class PlacementTestService {
        + initializeTest(studentId: int): PlacementTest
        + evaluateModule(moduleId: int, answers: Map): int
        + calculateFinalLevel(scores: Map): LanguageLevel
        + saveTestProgress(studentId: int, progress: Map)
    }
    
    class SpeakingTestService {
        + createSpeakingSession(studentId: int): int
        + analyzeAndSaveSpeech(sessionId: int, audioData: byte[])
        + getSampleSentence(level: LanguageLevel): String
    }
    
    class ListeningTestService {
        + initializeTest(studentId: int): ListeningTest
        + evaluateAnswers(testId: int, answers: Map): int
        + getAudioFile(audioId: int): byte[]
    }
    
    class ReadingTestService {
        + initializeTest(studentId: int): ReadingTest
        + evaluateAnswers(testId: int, answers: Map): int
    }
    
    class WritingTestService {
        + initializeTest(studentId: int): WritingTest
        + evaluateWriting(testId: int, text: String): int
        + validateText(text: String): boolean
    }
    
    class TestResultService {
        + saveTestResult(result: TestResult)
        + getTestResult(studentId: int, testId: int): TestResult
        + generateErrorAnalysis(resultId: int): Map
    }
    
    class StudentAnalysisService {
        + generatePersonalPlan(studentId: int): LessonPlan
        + identifyStrengthsWeaknesses(results: TestResult[]): Map
        + createTopicRecommendations(level: LanguageLevel, weaknesses: String[]): Topic[]
    }
    
    class ContentDeliveryService {
        + prepareContentForStudent(studentId: int): Content
        + getStudentLevel(studentId: int): LanguageLevel
        + assignContentToStudent(studentId: int, contentId: int)
    }
    
    class ContentUpdateService {
        + checkProgress(studentId: int): Progress
        + compareWithCurrentContent(progress: Progress, content: Content): boolean
        + generateUpdateRationale(changes: Map): String
    }
    
    class ProgressTrackingService {
        + buildProgressViewModel(progressData: Progress, graphs: Object): Object
        + buildTableViewModel(progressData: Progress): Object
        + getProgressSummary(studentId: int): Object
        + recordDailyProgressSnapshot(studentId: int, progressData: Progress)
    }
    
    class DataExportService {
        + getAvailableReports(userId: int): String[]
        + exportToPDF(data: Object): byte[]
        + exportToCSV(data: Object): byte[]
        + generateDownloadLink(fileData: byte[]): String
    }
    
    class FeedbackService {
        + generateFeedbackForStudent(studentId: int): String[]
        + analyzeIncorrectAnswers(results: TestResult): String[]
        + saveFeedback(studentId: int, feedbackList: String[])
    }
    
    
    class RewardService {
        + updateDailyStreak(studentId: int): int
        + checkGoalCompletion(studentId: int): boolean
        + awardBadge(studentId: int, badgeId: int)
        + getStudentRewards(studentId: int): Reward[]
    }
    
    class AssignmentService {
        + createAssignment(assignment: Assignment): int
        + assignToStudents(assignmentId: int, studentIds: int[])
        + getStudentAssignments(studentId: int): StudentAssignment[]
        + submitAssignment(studentAssignmentId: int)
        + gradeAssignment(studentAssignmentId: int, score: int)
    }
    
    class AdminService {
        + getAllUsers(): User[]
        + updateUserRole(userId: int, role: UserRole)
        + updateUserStatus(userId: int, status: String)
        + getSystemStats(): SystemPerformance
        + setMaintenanceMode(enabled: boolean)
    }
    
    class MessageService {
        + sendMessage(message: Message)
        + getInbox(userId: int): Message[]
        + markAsRead(messageId: int)
    }
    
    class AnnouncementService {
        + createAnnouncement(announcement: Announcement): int
        + publishAnnouncement(announcementId: int)
        + getAnnouncementsForUser(userId: int): Announcement[]
    }
    
    class AIContentService {
        + prepareSuggestedContent(teacherId: int, title: String, instructions: String): Content
        + storeAndAssignContent(teacherId: int, finalContent: Content)
        + saveDraftOnly(teacherId: int, contentDraft: Content)
    }
    
    class ChatbotService {
        + createSession(studentId: int): ChatSession
        + processMessage(sessionId: int, message: String): String
        + saveMessage(sessionId: int, message: ChatMessage)
        + endSession(sessionId: int)
    }
    
    class GraphService {
        + generateProgressGraphs(progressData: Progress): Object
        + generateComparisonChart(data: Map): Object
    }
}

' ==========================================
' REPOSITORY LAYER
' ==========================================
package "Repository Layer" {
    
    class UserRepository {
        + save(user: User): int
        + findById(userId: int): User
        + findByEmail(email: String): User
        + update(user: User)
        + delete(userId: int)
        + findAll(): User[]
    }
    
    class TestRepository {
        + save(test: Test): int
        + findById(testId: int): Test
        + findByStudentId(studentId: int): Test[]
    }
    
    class TestResultRepository {
        + save(result: TestResult): int
        + findByStudentId(studentId: int): TestResult[]
        + findByTestId(testId: int): TestResult[]
        + getLatestTestResults(studentId: int): TestResult[]
        + getTestResults(studentId: int): TestResult[]
    }
    
    class SpeakingResultRepository {
        + saveNewSession(studentId: int): int
        + saveSpeakingResult(sessionId: int, accuracyScore: double, feedback: String)
        + findBySessionId(sessionId: int): SpeakingResult
    }
    
    class LessonPlanRepository {
        + savePersonalPlan(studentId: int, plan: LessonPlan): int
        + saveGeneralPlan(studentId: int, generalPlan: LessonPlan): int
        + findByStudentId(studentId: int): LessonPlan
        + update(plan: LessonPlan)
    }
    
    class ContentRepository {
        + save(content: Content): int
        + findById(contentId: int): Content
        + findByLevel(level: LanguageLevel): Content[]
        + saveContentForStudent(studentId: int, contentData: Content): int
        + getLastUsedMaterial(studentId: int): Content
    }
    
    class StudentProfileRepository {
        + save(student: Student): int
        + findById(studentId: int): Student
        + getStudentLevel(studentId: int): LanguageLevel
        + updateLevel(studentId: int, level: LanguageLevel)
    }
    
    class ProgressDataRepository {
        + save(progress: Progress): int
        + fetchProgressData(studentId: int): Progress
        + saveDailySnapshot(studentId: int, progressData: Progress)
        + update(progress: Progress)
    }
    
    class CachedProgressRepository {
        + getMostRecentProgress(studentId: int): Progress
        + cacheProgress(studentId: int, progress: Progress)
    }
    
    class FeedbackRepository {
        + saveFeedback(studentId: int, feedbackList: String[]): int
        + findByStudentId(studentId: int): Feedback[]
    }
    
    
    class RewardRepository {
        + save(reward: Reward): int
        + findById(rewardId: int): Reward
        + findAll(): Reward[]
    }
    
    class StudentRewardRepository {
        + save(studentReward: StudentReward): int
        + findByStudentId(studentId: int): StudentReward[]
    }
    
    class AssignmentRepository {
        + save(assignment: Assignment): int
        + findById(assignmentId: int): Assignment
        + findByTeacherId(teacherId: int): Assignment[]
    }
    
    class StudentAssignmentRepository {
        + save(studentAssignment: StudentAssignment): int
        + findByStudentId(studentId: int): StudentAssignment[]
        + findByAssignmentId(assignmentId: int): StudentAssignment[]
        + update(studentAssignment: StudentAssignment)
    }
    
    class MessageRepository {
        + save(message: Message): int
        + findByRecipientId(recipientId: int): Message[]
        + findBySenderId(senderId: int): Message[]
        + markAsRead(messageId: int)
    }
    
    class AnnouncementRepository {
        + save(announcement: Announcement): int
        + findById(announcementId: int): Announcement
        + findByTeacherId(teacherId: int): Announcement[]
    }
    
    class LessonContentRepository {
        + saveDraftContent(teacherId: int, contentDraft: Content): int
        + saveLessonContent(teacherId: int, finalContent: Content): int
        + findByTeacherId(teacherId: int): Content[]
    }
    
    class ChatSessionRepository {
        + save(session: ChatSession): int
        + findById(sessionId: int): ChatSession
        + findByStudentId(studentId: int): ChatSession[]
        + addMessage(sessionId: int, message: ChatMessage)
    }
    
    class SystemLogRepository {
        + save(log: MaintenanceLog): int
        + findAll(): MaintenanceLog[]
    }
    
    class SystemPerformanceRepository {
        + save(performance: SystemPerformance): int
        + getLatest(): SystemPerformance
    }
}

' ==========================================
' EXTERNAL SERVICES
' ==========================================
package "External Services" {
    
    class AIAnalysisEngine <<external>> {
        + analyzeTestResults(testResults: TestResult[]): Map
        + identifyStrengths(results: TestResult[]): String[]
        + identifyWeaknesses(results: TestResult[]): String[]
        + generateSuggestedContent(title: String, instructions: String): Content
        + generateContent(levelInfo: LanguageLevel): Content
    }
    
    class AIContentEngine <<external>> {
        + generateContent(levelInfo: LanguageLevel): Content
        + generateExercise(topic: Topic, level: LanguageLevel): Exercise
        + generateRoleplay(scenario: String, level: LanguageLevel): Content
    }
    
    class VoiceRecognitionService <<external>> {
        + analyzeSpeech(audioData: byte[]): Map
        + getAccuracyScore(audioData: byte[], expectedText: String): double
        + getPronunciationFeedback(audioData: byte[]): String
    }
    
    class NotificationService <<external>> {
        + sendEmail(to: String, subject: String, body: String)
        + sendVerificationEmail(userId: int, token: String)
        + sendPasswordResetEmail(userId: int, token: String)
        + sendFeedbackErrorEmail(studentId: int)
        + sendAssignmentNotification(studentId: int, assignmentId: int)
        + sendRewardNotification(studentId: int, rewardId: int)
        + sendReminderNotification(studentId: int)
        + sendMessageNotification(recipientId: int, messageId: int)
    }
    
    class Chatbot <<external>> {
        + processQuery(query: String): String
        + getContextualResponse(sessionId: int, query: String): String
        + handleUnknownQuery(): String
    }
}

' ==========================================
' RELATIONSHIPS
' ==========================================

' User Hierarchy (Generalization)
User <|-- Student
User <|-- Teacher
User <|-- Admin
User -- UserRole

' Test Hierarchy (Generalization)
Test <|-- PlacementTest
Test <|-- SpeakingTest
Test <|-- ListeningTest
Test <|-- ReadingTest
Test <|-- WritingTest

' Composition relationships (parts cannot exist without whole)
PlacementTest *-- "4" TestModule : contains
Test *-- "1..*" Question : contains
TestModule *-- "1..*" Question : contains
ChatSession *-- "0..*" ChatMessage : contains

' Aggregation relationships (parts can exist independently)
LessonPlan o-- "1..*" Topic : includes
Topic o-- "0..*" Exercise : contains
Exercise o-- "1..*" Question : uses

' Association relationships with multiplicities
Student "1" -- "0..*" TestResult : takes
Student "1" -- "0..1" LessonPlan : has
Student "1" -- "1" Progress : tracks
Student "1" -- "0..*" StudentAssignment : receives
Student "1" -- "0..*" StudentReward : earns
Student "1" -- "0..*" Feedback : receives
Student "1" -- "0..*" ChatSession : starts
Student "1" -- "0..*" SpeakingResult : produces

Teacher "1" -- "0..*" Assignment : creates
Teacher "1" -- "0..*" Announcement : publishes
Teacher "1" -- "0..*" Content : creates
Teacher "1" -- "0..*" Message : sends

Admin "1" -- "0..*" MaintenanceLog : creates
Admin "1" -- "0..*" SystemPerformance : monitors

Message "0..*" -- "1" User : received by
Assignment "1" -- "0..*" StudentAssignment : assigned as

TestResult "1" -- "0..*" Feedback : generates
Progress "1" -- "0..*" ProgressSnapshot : snapshots
Reward "1" -- "0..*" StudentReward : awarded as

Content -- ContentType
Student -- LanguageLevel
TestResult -- LanguageLevel
Content -- LanguageLevel
StudentAssignment -- AssignmentStatus

' UI to Controller associations
RegistrationUI ..> AuthController : uses
PasswordRecoveryUI ..> AuthController : uses
PlacementTestUI ..> PlacementTestController : uses
SpeakingTestUI ..> SpeakingTestController : uses
ListeningTestUI ..> ListeningTestController : uses
ReadingTestUI ..> ReadingTestController : uses
WritingTestUI ..> WritingTestController : uses
TestResultsUI ..> TestResultController : uses
PersonalPlanUI ..> StudentAnalysisController : uses
LearningContentUI ..> ContentDeliveryController : uses
StudentProgressUI ..> ProgressTrackingController : uses
TeacherProgressUI ..> ProgressTrackingController : uses
DataExportUI ..> DataExportController : uses
FeedbackUI ..> AutomaticFeedbackController : uses
RewardUI ..> RewardController : uses
AssignmentUI ..> AssignmentController : uses
StudentAssignmentUI ..> AssignmentController : uses
AdminDashboardUI ..> AdminController : uses
MessagingUI ..> MessageController : uses
AnnouncementUI ..> AnnouncementController : uses
AIContentGenerationUI ..> AIContentController : uses
ChatbotUI ..> ChatbotController : uses

' Controller to Service associations
AuthController ..> AuthService : uses
PlacementTestController ..> PlacementTestService : uses
SpeakingTestController ..> SpeakingTestService : uses
ListeningTestController ..> ListeningTestService : uses
ReadingTestController ..> ReadingTestService : uses
WritingTestController ..> WritingTestService : uses
TestResultController ..> TestResultService : uses
StudentAnalysisController ..> StudentAnalysisService : uses
ContentDeliveryController ..> ContentDeliveryService : uses
ContentUpdateController ..> ContentUpdateService : uses
ProgressTrackingController ..> ProgressTrackingService : uses
ProgressTrackingController ..> GraphService : uses
DataExportController ..> DataExportService : uses
AutomaticFeedbackController ..> FeedbackService : uses
RewardController ..> RewardService : uses
AssignmentController ..> AssignmentService : uses
AdminController ..> AdminService : uses
MessageController ..> MessageService : uses
AnnouncementController ..> AnnouncementService : uses
AIContentController ..> AIContentService : uses
ChatbotController ..> ChatbotService : uses

' Service to Repository associations
AuthService ..> UserRepository : uses
PlacementTestService ..> TestRepository : uses
PlacementTestService ..> TestResultRepository : uses
SpeakingTestService ..> SpeakingResultRepository : uses
ListeningTestService ..> TestRepository : uses
ReadingTestService ..> TestRepository : uses
WritingTestService ..> TestRepository : uses
TestResultService ..> TestResultRepository : uses
StudentAnalysisService ..> TestResultRepository : uses
StudentAnalysisService ..> LessonPlanRepository : uses
ContentDeliveryService ..> StudentProfileRepository : uses
ContentDeliveryService ..> ContentRepository : uses
ProgressTrackingService ..> ProgressDataRepository : uses
ProgressTrackingService ..> CachedProgressRepository : uses
FeedbackService ..> TestResultRepository : uses
FeedbackService ..> FeedbackRepository : uses
SystemFeedbackService ..> SystemFeedbackRepository : uses
RewardService ..> RewardRepository : uses
RewardService ..> StudentRewardRepository : uses
AssignmentService ..> AssignmentRepository : uses
AssignmentService ..> StudentAssignmentRepository : uses
AdminService ..> UserRepository : uses
AdminService ..> SystemLogRepository : uses
AdminService ..> SystemPerformanceRepository : uses
MessageService ..> MessageRepository : uses
AnnouncementService ..> AnnouncementRepository : uses
AIContentService ..> LessonContentRepository : uses
ChatbotService ..> ChatSessionRepository : uses

' Service to External Service associations
AuthService ..> NotificationService : uses
SpeakingTestService ..> VoiceRecognitionService : uses
StudentAnalysisService ..> AIAnalysisEngine : uses
ContentDeliveryService ..> AIContentEngine : uses
FeedbackService ..> AIAnalysisEngine : uses
FeedbackService ..> NotificationService : uses
RewardService ..> NotificationService : uses
AssignmentService ..> NotificationService : uses
MessageService ..> NotificationService : uses
AnnouncementService ..> NotificationService : uses
AIContentService ..> AIAnalysisEngine : uses
ChatbotService ..> Chatbot : uses