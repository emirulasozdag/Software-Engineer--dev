// Re-export all services for easy importing
export { authService } from './auth.service';
export { testService } from './test.service';
export { learningService } from './learning.service';
export { teacherService } from './teacher.service';
export { communicationService } from './communication.service';
export { adminService } from './admin.service';
export { default as apiClient } from './client';

// Progress tracking + export (UC10–UC11)
export { progressService } from './progress.service';
