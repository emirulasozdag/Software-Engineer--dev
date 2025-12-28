# AI-Powered Adaptive Learning Platform - Frontend

This is the React + TypeScript frontend for the AI-Powered Adaptive Curriculum project, an English learning platform with personalized content delivery.

## 🏗️ Project Architecture

This frontend application follows modern React best practices with a clean architecture:

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── ProtectedRoute.tsx
│   ├── contexts/            # React contexts (Auth, etc.)
│   │   └── AuthContext.tsx
│   ├── pages/               # Page components organized by role
│   │   ├── auth/            # Authentication pages
│   │   ├── student/         # Student dashboard and features
│   │   ├── teacher/         # Teacher dashboard and features
│   │   └── admin/           # Admin dashboard and features
│   ├── services/            # API service layer
│   │   └── api/             # API client and service modules
│   │       ├── client.ts    # Axios instance with interceptors
│   │       ├── auth.service.ts
│   │       ├── test.service.ts
│   │       ├── learning.service.ts
│   │       ├── teacher.service.ts
│   │       ├── communication.service.ts
│   │       └── admin.service.ts
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🚀 Features

### Role-Based Access Control
- **Students**: Placement tests, personalized learning plans, progress tracking, assignments, AI chatbot
- **Teachers**: Student management, assignment creation, progress monitoring, AI content directives
- **Admins**: User management, system statistics, feedback management, maintenance mode

### Core Functionality
- ✅ User authentication (login, register, email verification, password reset)
- ✅ Protected routes with role-based access control
- ✅ API service layer for backend communication
- ✅ TypeScript type safety throughout the application
- ✅ Responsive design with clean UI
- ✅ Placeholder components ready for implementation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn** package manager
- **Backend API** running on `http://localhost:8000` (see backend README)

## 🛠️ Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` if your backend runs on a different URL:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

## 🏃 Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

Create an optimized production build:

```bash
npm run build
```

The build files will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## 🔑 Default Login Credentials

*Note: These will be created when you set up your backend. Use the credentials you create during backend setup.*

Example roles for testing:
- **Student**: student@example.com
- **Teacher**: teacher@example.com
- **Admin**: admin@example.com

## 📁 Project Structure Explained

### `/src/services/api/`
All backend API calls are centralized here:
- `client.ts`: Configured Axios instance with request/response interceptors
- `*.service.ts`: Service modules for each feature domain

### `/src/contexts/`
React Context providers for global state:
- `AuthContext.tsx`: Authentication state, login/logout, user management

### `/src/pages/`
Page components organized by user role:
- **auth/**: Login, Register, Password Reset, Email Verification
- **student/**: Dashboard, Tests, Learning Plan, Progress, Assignments, Chatbot
- **teacher/**: Dashboard, Student List, Assignment Creation, Messages
- **admin/**: Dashboard, User Management, System Stats, Feedback

### `/src/types/`
TypeScript type definitions matching backend models:
- `auth.types.ts`: User, login/register requests
- `test.types.ts`: Placement tests, test results
- `learning.types.ts`: Learning plans, content, progress
- `teacher.types.ts`: Assignments, student overviews
- `communication.types.ts`: Messages, announcements, notifications
- `admin.types.ts`: System stats, user accounts, feedback

## 🔌 API Integration

The frontend is configured to proxy API requests to the backend:

```typescript
// vite.config.ts
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

All API calls use the centralized `apiClient` which automatically:
- Adds authentication tokens to requests
- Handles 401 (unauthorized) responses
- Provides consistent error handling

Example usage:
```typescript
import { authService } from '@/services/api';

// Login
const response = await authService.login({ email, password });

// Get current user
const user = await authService.getCurrentUser();
```

## 🎨 Styling

The application uses vanilla CSS with a utility-first approach:
- Global styles in `src/index.css`
- Inline styles for component-specific styling
- Responsive design principles
- Clean, modern UI following the project requirements

## 🧭 Navigation Flow

### Public Routes
- `/login` - User login
- `/register` - New user registration
- `/forgot-password` - Password reset request
- `/verify-email/:token` - Email verification

### Student Routes (Protected)
- `/student/dashboard` - Main dashboard
- `/student/placement-test` - Level assessment
- `/student/learning-plan` - Personalized content
- `/student/content/:id` - Lesson viewer
- `/student/progress` - Progress tracking
- `/student/assignments` - View assignments
- `/student/chatbot` - AI tutor interaction
- `/student/messages` - Communication

### Teacher Routes (Protected)
- `/teacher/dashboard` - Main dashboard
- `/teacher/students` - Student list
- `/teacher/students/:id` - Student details
- `/teacher/assignments/create` - Create assignment
- `/teacher/messages` - Communication

### Admin Routes (Protected)
- `/admin/dashboard` - Main dashboard
- `/admin/users` - User management
- `/admin/stats` - System statistics
- `/admin/feedback` - Feedback management

## 🔐 Authentication Flow

1. User logs in via `/login`
2. Backend returns JWT token and user data
3. Token stored in localStorage
4. `AuthContext` provides authentication state
5. `ProtectedRoute` component guards role-specific routes
6. Axios interceptor adds token to all API requests
7. On 401 response, user is redirected to login

## 🚧 Implementation Notes

### Current Status
✅ Project structure and configuration
✅ API service layer with all endpoints
✅ Authentication context and protected routes
✅ Placeholder UI for all features
✅ TypeScript types for all data models

### Next Steps for Implementation
1. **Replace placeholder data** with actual API calls
2. **Implement form validation** and error handling
3. **Add loading states** for async operations
4. **Implement file upload** for speaking tests and assignments
5. **Add data visualization** for progress charts
6. **Implement real-time features** (notifications, chatbot)
7. **Add unit tests** for components and services
8. **Enhance accessibility** (ARIA labels, keyboard navigation)
9. **Add internationalization** if needed

### Example: Implementing a Real Feature

Current placeholder in `StudentDashboard.tsx`:
```typescript
// Placeholder card
<div className="card">
  <h2>Welcome, {user?.name}!</h2>
</div>
```

After implementation:
```typescript
const [stats, setStats] = useState<StudentProgress | null>(null);

useEffect(() => {
  const fetchStats = async () => {
    try {
      const data = await learningService.getProgress();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };
  fetchStats();
}, []);
```

## 🧪 Testing

### Run Linter
```bash
npm run lint
```

### Future: Run Tests
```bash
npm run test
```

## 🛡️ Security Considerations

- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- API interceptor automatically refreshes expired tokens
- Role-based access control at route level
- Input validation on all forms (to be enhanced)
- XSS protection through React's built-in sanitization

## 📱 Responsive Design

The application is designed to work across:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

All pages use flexible layouts and responsive grid systems.

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.ts or use:
npm run dev -- --port 3001
```

### API Connection Failed
- Ensure backend is running on `http://localhost:8000`
- Check `.env` file for correct API URL
- Verify CORS is enabled on backend

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Router](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)

## 👥 Project Team

- Nisa Nur AKLAN – 220204012
- Ceyda YILDIZ – 220204011
- Emir Ulaş ÖZDAĞ – 220204041
- Nisa Nur İLHAN – 220204053
- Berke AKÇAY – 220204058
- Elifnaz Köseoğlu – 220204027

**Department of Software Engineering**  
**Ankara Science University**  
**SENG 321 – Software Engineering**

---

## 📝 License

This project is part of an academic assignment for SENG 321 course.
