# KV Store Manager

A comprehensive full-stack key-value store management application built with React and Node.js. This application provides a complete solution for managing multiple databases, stores, and key-value pairs with user authentication and a modern web interface.

### [DEMO - kv.sekor.eu.org](https://kv.sekor.eu.org/)
**email**: admin@example.com  
**password**: adminadmin  

demo restart every 10 minutes

## 🚀 Features

### Backend (server.js)
- **RESTful API** with Hono.js framework
- **User Authentication** with token-based security and Google reCAPTCHA
- **Rate Limiting** - 30 requests per minute per user
- **Multi-tenant Architecture** - Each user has isolated databases
- **File-based Storage** - Simple JSON file storage system
- **Complete CRUD Operations** for databases, stores, and key-value pairs
- **Secure Password Hashing** with SHA-256
- **CORS Support** for cross-origin requests
- **Account Management** - Password changes and account deletion

### Frontend (React App)
- **Modern React Application** with hooks and functional components
- **Multi-view Interface** - Front page, Dashboard, Settings, API Documentation
- **Advanced Code Editor** with Monaco Editor (VS Code-like)
- **Syntax Highlighting** with Shiki for multiple languages
- **Real-time Operations** with immediate UI updates
- **User Management** - Registration, login, logout, token generation
- **Database Management** - Create, view, delete databases (max 3 per user)
- **Store Management** - Create, view, delete stores within databases
- **Key-Value Operations** - Set, get, update, delete individual or multiple keys
- **Interactive UI** with custom popups, confirmation dialogs, and operation feedback
- **Google reCAPTCHA** integration for enhanced security

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **bun** package manager
- **Google reCAPTCHA keys** (optional, for CAPTCHA verification)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
# Start both frontend and backend concurrently
npm run start
# or
bun run start
```

### Individual Components
```bash
# Start only the backend server
npm run server
# or
bun run server

# Start only the frontend development server
npm run dev
# or
bun run dev
```

### Production Build
```bash
# Build the frontend for production
npm run build
# or
bun run build

# Preview the production build
npm run preview
# or
bun run preview
```

## 🌐 API Endpoints

The backend exposes a single endpoint that handles all operations:

**POST** `/api/connect`

### Authentication Actions
- `register` - Create new user account (with CAPTCHA)
- `login` - Authenticate user (with CAPTCHA)
- `generate-token` - Generate new access token
- `get-user-info` - Get current user information
- `change-password` - Change user password
- `delete-account` - Delete user account and all data

### Database Operations
- `get-databases` - List user's databases
- `create-database` - Create new database
- `delete-database` - Delete database and all its stores

### Store Operations
- `get-stores` - List stores in a database
- `create-store` - Create new store
- `delete-store` - Delete store and all its data

### Key-Value Operations
- `set` - Set a key-value pair
- `get` - Get value by key
- `setMany` - Set multiple key-value pairs
- `getMany` - Get multiple values by keys
- `update` - Update existing key
- `delete` - Delete key
- `deleteMany` - Delete multiple keys
- `entries` - Get all key-value pairs
- `keys` - Get all keys
- `values` - Get all values
- `clear` - Clear all data in store

## 🗂️ Project Structure

```
project/
├── src/
│   ├── App.jsx              # Main React application
│   ├── App.css              # Application styles
│   ├── KVStore.js           # API client class
│   ├── main.jsx             # React entry point
│   └── containers/
│       ├── AuthView.jsx     # Login/Register interface
│       ├── DashboardView.jsx # Main application interface
│       ├── SettingsView.jsx  # User settings and token management
│       ├── ApiDocsView.jsx   # API documentation interface
│       ├── FrontPageView.jsx # Landing page component
│       ├── StoreEditor.jsx   # Advanced store data editor
│       ├── CodeEditor.jsx    # Monaco code editor wrapper
│       ├── CodeBlock.jsx     # Syntax highlighted code display
│       ├── PopUp.jsx         # Custom popup component
│       ├── ConfirmDialog.jsx # Confirmation dialog component
│       └── InfoBox.jsx       # Operation feedback component
├── server.js                # Hono.js backend server
├── libs.js                  # Server utility functions
├── database/                # File-based storage directory
│   ├── users.json           # User accounts storage
│   └── {user-id}/           # User-specific data directories
├── package.json             # Dependencies and scripts
├── biome.json               # Biome linter configuration
├── vite.config.js           # Vite configuration
└── index.html               # HTML entry point
```

## 🔑 Authentication Flow

1. **Register/Login** - Users create accounts or authenticate with email/password
2. **Token Storage** - Access tokens are stored in localStorage for persistence
3. **Auto-login** - Application attempts automatic login on page load
4. **Token Refresh** - Users can generate new tokens in settings
5. **Secure Requests** - All API requests include Bearer token authorization

## 💾 Data Storage

The application uses modern dependencies and architecture:

**Key Technologies:**
- **Hono.js** - Fast, lightweight web framework replacing Express.js
- **React 19** - Latest React version with modern features  
- **Monaco Editor** - VS Code editor component for advanced editing
- **Shiki** - Fast syntax highlighter with multiple language support
- **Lucide React** - Beautiful, customizable icon library
- **Rate Limiter** - API rate limiting for security
- **Google reCAPTCHA** - Bot protection and spam prevention
- **Biome** - Fast linter and formatter replacing ESLint/Prettier

**Storage System:**
- **Users** are stored in `database/users.json`
- **User data** is organized in `database/{user-id}/{database-name}/{store-name}.json`
- Each user can have **maximum 3 databases**
- Each database can contain **unlimited stores**
- Each store contains **key-value pairs** as JSON objects

## 🛡️ Security Features

- **Password Hashing** using SHA-256
- **Token-based Authentication** with secure random tokens
- **Google reCAPTCHA** integration for bot protection
- **Rate Limiting** - 30 requests per minute per user
- **Request Validation** for all API endpoints
- **User Isolation** - users can only access their own data
- **CORS Protection** configured for cross-origin requests
- **Secure Account Management** with password confirmation

## 🎯 Usage Examples

### Creating a Database
1. Login to the application
2. Click "Create Database" in the dashboard
3. Enter database name
4. Database will appear in the sidebar

### Managing Key-Value Pairs
1. Select a database from the sidebar
2. Create or select a store
3. Use the interface to:
   - Add new key-value pairs
   - Edit existing values
   - Delete individual keys
   - Clear entire store

### API Documentation
The application includes built-in API documentation accessible from the main interface, providing:
- Complete endpoint reference
- Request/response examples
- Authentication requirements
- Error handling information

## 🔧 Configuration

### Backend Configuration
- **Port**: 3001 (configurable in server.js:24)
- **Database Path**: `./database` (configurable in libs.js:7)
- **Rate Limiting**: 30 requests per 60 seconds (configurable in server.js:27-30)
- **CORS**: Enabled for all origins
- **CAPTCHA**: Optional reCAPTCHA verification (configured via environment variables)

### Frontend Configuration
- **API Base URL**: `http://localhost:3001/api` (configurable in KVStore.js)
- **Development Port**: 5173 (Vite default)
- **Google reCAPTCHA**: Site key configured via environment variables
- **Monaco Editor**: VS Code-like editor with multiple language support

## 🚀 Deployment

### Environment Variables
Create a `.env` file for production configuration:
```bash
CAPTCHA_SECRET_KEY=your_recaptcha_secret_key
VITE_CAPTCHA_ENABLED=true
VITE_CAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### Backend Deployment
```bash
NODE_ENV=production node server.js
```

### Frontend Deployment
```bash
npm run build
# Deploy the dist/ directory to your web server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

---

**Built with ❤️ using React 19, Hono.js, Monaco Editor, and modern web technologies**