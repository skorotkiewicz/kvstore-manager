# KV Store Manager

A comprehensive full-stack key-value store management application built with React and Node.js. This application provides a complete solution for managing multiple databases, stores, and key-value pairs with user authentication and a modern web interface.

## 🚀 Features

### Backend (server.js)
- **RESTful API** with Express.js
- **User Authentication** with token-based security
- **Multi-tenant Architecture** - Each user has isolated databases
- **File-based Storage** - Simple JSON file storage system
- **Complete CRUD Operations** for databases, stores, and key-value pairs
- **Secure Password Hashing** with SHA-256
- **CORS Support** for cross-origin requests

### Frontend (React App)
- **Modern React Application** with hooks and functional components
- **Multi-view Interface** - Dashboard, Settings, API Documentation
- **Real-time Operations** with immediate UI updates
- **User Management** - Registration, login, logout, token generation
- **Database Management** - Create, view, delete databases (max 3 per user)
- **Store Management** - Create, view, delete stores within databases
- **Key-Value Operations** - Set, get, update, delete individual or multiple keys
- **Interactive UI** with confirmation dialogs and operation feedback

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **bun** package manager

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
- `register` - Create new user account
- `login` - Authenticate user
- `generate-token` - Generate new access token
- `get-user-info` - Get current user information

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
│       └── InfoBox.jsx       # Operation feedback component
├── server.js                # Express.js backend server
├── database/                # File-based storage directory
│   └── users.json           # User accounts storage
├── package.json             # Dependencies and scripts
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

The application uses a simple file-based storage system:

- **Users** are stored in `database/users.json`
- **User data** is organized in `database/{user-id}/{database-name}/{store-name}.json`
- Each user can have **maximum 3 databases**
- Each database can contain **unlimited stores**
- Each store contains **key-value pairs** as JSON objects

## 🛡️ Security Features

- **Password Hashing** using SHA-256
- **Token-based Authentication** with secure random tokens
- **Request Validation** for all API endpoints
- **User Isolation** - users can only access their own data
- **CORS Protection** configured for cross-origin requests

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
- **Port**: 3001 (configurable in server.js:9)
- **Database Path**: `./database` (configurable in server.js:16)
- **CORS**: Enabled for all origins

### Frontend Configuration
- **API Base URL**: `http://localhost:3001/api` (configurable in App.jsx:10)
- **Development Port**: 5173 (Vite default)

## 🚀 Deployment

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

**Built with ❤️ using React, Node.js, and Express.js**