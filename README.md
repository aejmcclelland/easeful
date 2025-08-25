# Taskman - Task Management Application

A full-stack task management application built with modern web technologies. Taskman allows users to create, manage, and organize their tasks with advanced features including image uploads, location tracking, user authentication, and avatar management.

## 🚀 Features

### User Features

#### 🔐 Authentication & User Management
- **User Registration & Login**: Simple account creation with secure authentication
- **Avatar Upload**: Personalized user profiles with custom avatar images
- **Profile Management**: Update user details and change passwords
- **Role-Based Access**: User and Admin roles with appropriate permissions

#### 📋 Task Management
- **Create Tasks**: Add tasks with title, description, priority, and due dates
- **Task Status Tracking**: Monitor progress with Pending, In Progress, and Completed statuses
- **Priority Levels**: Organize tasks by Low, Medium, and High priority
- **Labels/Tags**: Categorize tasks with custom labels

#### 🎨 User Interface
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme Support**: Modern UI with DaisyUI components
- **Interactive Navigation**: Clean navbar with user dropdown menus

### Advanced Features

#### 🌐 Real-Time Features
- **Live Updates**: Automatic refresh of user data when window gains focus
- **Optimistic UI**: Immediate feedback for user actions
- **Loading States**: Visual indicators for all async operations

#### 📱 Mobile Experience
- **Mobile Menu**: Hamburger menu with smooth animations
- **Touch Optimized**: Mobile-friendly interactions and gestures
- **Progressive Web App Ready**: Can be installed on mobile devices

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework**: Next.js 15.4.7 (React 19)
- **Styling**: Tailwind CSS 4.1.12 + DaisyUI 5.0.50
- **Icons**: FontAwesome (comprehensive icon library)
- **Notifications**: React Toastify
- **TypeScript**: Full type safety throughout the application
- **Development**: Turbopack for fast development builds

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose 7.3.0 ODM
- **Authentication**: JWT with secure HTTP-only cookies
- **Password Security**: bcryptjs for password hashing
- **File Uploads**: Multer 2.0.2 + express-fileupload
- **Cloud Storage**: Cloudinary integration for images
- **Email**: Nodemailer for password reset emails
- **Geocoding**: Node-geocoder for location services

### Security & Middleware
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers
- **Rate Limiting**: Express rate limit
- **Data Sanitization**: MongoDB injection prevention
- **XSS Protection**: Cross-site scripting prevention
- **HPP**: HTTP parameter pollution prevention

### Development Tools
- **Package Manager**: pnpm for efficient dependency management
- **Development Server**: Nodemon for auto-restart
- **Code Quality**: ESLint for code linting
- **Environment**: dotenv for configuration management

## 📊 Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique, validated),
  password: String (required, hashed, min 6 chars),
  role: Enum ['user', 'publisher', 'admin'] (default: 'user'),
  avatar: {
    public_id: String,
    url: String
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: Date
}
```

### Task Model
```javascript
{
  task: String (required, max 150 chars),
  slug: String (auto-generated),
  description: String (required),
  dueDate: Date,
  priority: Enum ['Low', 'Medium', 'High'] (default: 'Medium'),
  status: Enum ['Pending', 'In Progress', 'Completed'] (default: 'Pending'),
  labels: [String],
  images: [{
    url: String,
    filename: String
  }],
  address: String,
  location: {
    type: 'Point',
    coordinates: [Number] // [longitude, latitude]
  },
  user: ObjectId (required, ref: 'User'),
  isPublic: Boolean (default: false),
  sharedWith: [ObjectId] (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /logout` - User logout
- `GET /me` - Get current user
- `PUT /updatedetails` - Update user profile
- `PUT /updatepassword` - Change password
- `PUT /updateavatar` - Upload/update avatar
- `POST /forgotpassword` - Request password reset
- `PUT /resetpassword/:token` - Reset password

### User Management (`/api/users`)
- `POST /register` - Public user registration
- `GET /` - Get all users (admin only)
- `GET /:id` - Get single user (admin only)
- `PUT /:id` - Update user (admin only)
- `DELETE /:id` - Delete user (admin only)

### Task Management (`/api/taskman`)
- `GET /` - Get user's tasks (with filtering/pagination)
- `POST /` - Create new task (with image upload)
- `GET /:id` - Get single task
- `PUT /:id` - Update task
- `DELETE /:id` - Delete task
- `PUT /:id/photo` - Upload task photos
- `PUT /:id/share` - Share task with users
- `PUT /:id/toggle-public` - Toggle task public/private
- `DELETE /reset` - Reset all tasks (development only)

## 🏗️ Architecture

### Monorepo Structure
```
taskmanager/
├── taskmanager-client/          # Next.js frontend
│   ├── src/
│   │   ├── app/                 # App router pages
│   │   ├── components/          # React components
│   │   └── lib/                 # Utilities and types
├── taskmanager-server/          # Express.js backend
│   ├── src/
│   │   ├── controllers/         # Route controllers
│   │   ├── models/             # Mongoose models
│   │   ├── routes/             # Express routes
│   │   ├── middleware/         # Custom middleware
│   │   ├── utils/              # Utility functions
│   │   └── cloudinary/         # Cloudinary configuration
└── package.json                # Root package.json
```

### Authentication Flow
1. **Registration**: User creates account → Password hashed → JWT issued → Cookie set
2. **Login**: Credentials verified → JWT issued → Secure cookie set
3. **Protected Routes**: JWT verified from cookie → User data attached to request
4. **Logout**: Cookie cleared on client and server

### File Upload Flow
1. **Client**: File selected → FormData created → Sent to API route
2. **Server**: Multer processes file → Cloudinary upload → URL stored in database
3. **Avatar**: Old avatar deleted from Cloudinary → New avatar uploaded → User updated
4. **Tasks**: Multiple images supported → Stored in images array

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account or local MongoDB
- Cloudinary account for image storage
- SMTP server for email features

### Environment Variables

#### Server (.env)
```env
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
FILE_UPLOAD_LIMIT=5000000
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_EMAIL=your_email
SMTP_PASSWORD=your_email_password
FROM_EMAIL=noreply@yourapp.com
FROM_NAME=Taskman
```

#### Client (.env.local)
```env
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taskmanager
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env` in server directory
   - Copy `.env.local.example` to `.env.local` in client directory
   - Fill in your configuration values

4. **Start development servers**
   ```bash
   # Start both client and server
   pnpm dev
   
   # Or start individually
   pnpm dev:server  # Server on port 3000
   pnpm dev:client  # Client on port 3001
   ```

## 🔧 Development

### Available Scripts

#### Root Level
- `pnpm dev` - Start both client and server
- `pnpm dev:server` - Start server only
- `pnpm dev:client` - Start client only

#### Server
- `pnpm dev` - Development server with nodemon
- `pnpm start` - Production server

#### Client
- `pnpm dev` - Development server with Turbopack
- `pnpm build` - Production build
- `pnpm start` - Start production build

### Code Structure

#### Frontend Components
- `Navbar.tsx` - Navigation with user authentication and avatar
- `TaskCard.tsx` - Individual task display component
- Various page components in `/app` directory

#### Backend Controllers
- `auth.js` - Authentication logic
- `tasks.js` - Task CRUD operations
- `users.js` - User management

#### Middleware
- `auth.js` - JWT authentication and authorization
- `async.js` - Async error handling wrapper
- `error.js` - Global error handling

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure, httpOnly cookies
- **Input Validation**: Mongoose schema validation
- **SQL Injection Prevention**: MongoDB injection sanitization
- **XSS Protection**: Input sanitization and CSP headers
- **Rate Limiting**: Prevents brute force attacks
- **CORS Configuration**: Controlled cross-origin requests
- **File Upload Security**: File type and size validation

## 📱 Mobile Responsiveness

- **Breakpoint System**: Mobile-first responsive design
- **Touch Interactions**: Optimized for mobile gestures
- **Performance**: Fast loading on mobile networks
- **Navigation**: Mobile-friendly menu system
- **Forms**: Touch-optimized form inputs

## 🎯 Future Enhancement Ideas

### For Contributors

#### Potential Features
- **Real-time Notifications**: WebSocket integration for live updates
- **Task Comments**: Discussion threads on tasks
- **Calendar Integration**: Due date calendar view
- **Team Workspaces**: Collaborative task management
- **Time Tracking**: Built-in time logging
- **Export/Import**: CSV/PDF export capabilities
- **Search & Filters**: Advanced task filtering
- **Dashboard Analytics**: Task completion statistics
- **API Documentation**: Swagger/OpenAPI documentation
- **Testing Suite**: Unit and integration tests
- **Docker Support**: Containerization for deployment
- **PWA Features**: Offline support and push notifications

#### Technical Improvements
- **Caching**: Redis integration for performance
- **Database Optimization**: Indexing and query optimization
- **Error Monitoring**: Sentry or similar integration
- **Logging**: Structured logging with Winston
- **Performance Monitoring**: Application performance tracking
- **Load Balancing**: Multi-instance deployment support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Andrew McClelland**
- GitHub: [@aejmcclelland](https://github.com/aejmcclelland)

---

*Built with ❤️ using modern web technologies*
