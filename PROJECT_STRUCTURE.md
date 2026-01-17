# 🚀 ProConnect - LinkedIn Clone Project Structure

> **Complete File Structure Analysis & Documentation**  
> Last Updated: January 18, 2026

---

## 📁 Root Directory Structure

```
LinkedIn/
├── backend/           # Node.js + Express Backend
├── frontend/          # Next.js Frontend
├── .git/             # Git repository
└── .gitignore        # Git ignore rules
```

---

## 🔧 BACKEND STRUCTURE

### 📂 Backend Directory Tree

```
backend/
├── controllers/              # Business Logic Controllers
│   ├── user.controller.js   # User & Profile Management
│   └── post.controller.js   # Post & Feed Management
│
├── models/                   # MongoDB Schema Models
│   ├── user.model.js        # User Schema (name, email, password, token)
│   ├── profile.moddel.js    # Profile Schema (bio, work experience, etc)
│   ├── post.model.js        # Post Schema (content, likes, shares)
│   ├── comments.model.js    # Comment Schema
│   └── connections.model.js # Connection Request Schema
│
├── routes/                   # API Route Definitions
│   ├── user.routes.js       # User & Auth Routes
│   ├── post.routes.js       # Post Routes
│   └── api.http             # API Testing File
│
├── uploads/                  # File Upload Storage
│   └── [profile pictures, resumes, etc]
│
├── node_modules/            # Dependencies
├── server.js                # Main Server Entry Point
├── package.json             # Dependencies & Scripts
├── package-lock.json        # Locked Dependencies
└── .env                     # Environment Variables (not tracked)
```

---

### 🎯 Backend File Details

#### **1. server.js** (Main Entry Point)
```javascript
Purpose: Application initialization & configuration
Features:
  ✓ Express server setup
  ✓ CORS configuration for multiple frontend origins
  ✓ MongoDB connection
  ✓ Route mounting
  ✓ Static file serving (uploads)
  ✓ Dynamic PORT configuration (Render compatible)
```

#### **2. Controllers**

**user.controller.js** (13KB, 455 lines)
```javascript
Functions:
  ✓ register()                              - User registration
  ✓ login()                                 - User authentication
  ✓ getUserAndProfile()                     - Get user profile by token
  ✓ updateUserProfile()                     - Update user data
  ✓ updateProfileData()                     - Update profile details
  ✓ uploadProfilePicture()                  - Profile picture upload
  ✓ getAllUserProfile()                     - Get all users
  ✓ downloadProfile()                       - Generate PDF resume
  ✓ sendConnectionRequest()                 - Send connection request
  ✓ getMyConnectionsRequests()              - Get sent requests
  ✓ whatAreMyConnections()                  - Get received requests
  ✓ acceptConnectionRequest()               - Accept/Reject connection
  ✓ getUserProfileAndUserBasedOnUsername()  - Get profile by username
  ✓ convertUserDataToPDF()                  - PDF generation helper
```

**post.controller.js** (4.7KB)
```javascript
Functions:
  ✓ createPost()          - Create new post
  ✓ getAllPosts()         - Get all posts with user data
  ✓ likePost()            - Like/Unlike post
  ✓ commentPost()         - Add comment to post
  ✓ getComments()         - Get post comments
  ✓ sharePost()           - Share post
```

#### **3. Models (MongoDB Schemas)**

**user.model.js**
```javascript
Schema Fields:
  - name: String (required)
  - email: String (required, unique)
  - password: String (required, hashed)
  - username: String (required, unique)
  - profilePicture: String
  - token: String (for authentication)
  - timestamps: true
```

**profile.moddel.js**
```javascript
Schema Fields:
  - userId: ObjectId (ref: User)
  - bio: String
  - currentPost: String
  - postWork: Array of Objects
    - company: String
    - position: String
    - years: String
  - timestamps: true
```

**post.model.js**
```javascript
Schema Fields:
  - userId: ObjectId (ref: User)
  - content: String
  - image: String
  - likes: Array of ObjectIds
  - shares: Number
  - timestamps: true
```

**connections.model.js**
```javascript
Schema Fields:
  - userId: ObjectId (sender)
  - connectionId: ObjectId (receiver)
  - status_accepted: Boolean (default: false)
  - timestamps: true
```

**comments.model.js**
```javascript
Schema Fields:
  - userId: ObjectId (ref: User)
  - postId: ObjectId (ref: Post)
  - body: String
  - timestamps: true
```

#### **4. Routes**

**user.routes.js**
```javascript
API Endpoints:
  POST   /register                              - Register new user
  POST   /login                                 - User login
  POST   /user_update                           - Update user info
  GET    /get_user_and_profile                  - Get user profile (by token)
  POST   /update_profile_data                   - Update profile data
  POST   /update_profile_picture                - Upload profile picture
  GET    /user/get_all_users                    - Get all users
  GET    /user/download_resume                  - Download resume PDF
  POST   /user/send_connection_request          - Send connection
  GET    /user/getConnectionRequest             - Get sent requests
  GET    /user/user_connection_request          - Get received requests
  POST   /user/accept_connection_request        - Accept/Reject connection
  GET    /user/get_profile_based_on_username    - Get profile by username
```

**post.routes.js**
```javascript
API Endpoints:
  POST   /create_post                           - Create new post
  GET    /get_all_posts                         - Get all posts
  POST   /like_post                             - Like/Unlike post
  POST   /comment_post                          - Comment on post
  GET    /get_comments                          - Get post comments
  POST   /share_post                            - Share post
```

#### **5. package.json**
```json
Scripts:
  - dev: "nodemon server.js"     - Development mode
  - start: "node server.js"      - Production mode (Render)
  - prod: "node server.js"       - Production mode

Dependencies:
  - express: ^4.21.2             - Web framework
  - mongoose: ^8.12.1            - MongoDB ODM
  - bcrypt: ^5.1.1               - Password hashing
  - cors: ^2.8.5                 - CORS middleware
  - dotenv: ^16.4.7              - Environment variables
  - multer: ^1.4.5-lts.1         - File upload
  - pdfkit: ^0.16.0              - PDF generation
  - crypto: ^1.0.1               - Token generation
  - nodemon: ^3.1.9              - Dev server
```

---

## 🎨 FRONTEND STRUCTURE

### 📂 Frontend Directory Tree

```
frontend/
├── public/                      # Static Assets
│   ├── images/
│   │   └── 10886321.jpg        # Default images
│   ├── favicon.ico
│   ├── next.svg
│   ├── vercel.svg
│   ├── globe.svg
│   ├── file.svg
│   └── window.svg
│
├── src/                         # Source Code
│   ├── pages/                   # Next.js Pages (Routes)
│   │   ├── _app.js             # App wrapper with Redux
│   │   ├── _document.js        # HTML document structure
│   │   ├── index.jsx           # Home/Landing page
│   │   │
│   │   ├── login/              # Login Page
│   │   │   ├── index.jsx
│   │   │   └── style.module.css
│   │   │
│   │   ├── dashboard/          # Main Dashboard/Feed
│   │   │   ├── index.jsx
│   │   │   └── style.module.css
│   │   │
│   │   ├── profile/            # User Profile Page
│   │   │   ├── index.jsx
│   │   │   └── style.module.css
│   │   │
│   │   ├── view_profile/       # View Other User's Profile
│   │   │   ├── [username].jsx  # Dynamic route
│   │   │   └── style.module.css
│   │   │
│   │   ├── Discover/           # Discover Users Page
│   │   │   ├── index.jsx
│   │   │   └── style.module.css
│   │   │
│   │   ├── my_connections/     # Connections Page
│   │   │   ├── index.jsx
│   │   │   └── style.module.css
│   │   │
│   │   └── api/                # API routes (if any)
│   │       └── hello.js
│   │
│   ├── Componennts/            # Reusable Components
│   │   └── Navbar/
│   │       ├── index.jsx       # Navigation component
│   │       └── styles.module.css
│   │
│   ├── layout/                 # Layout Components
│   │   ├── DashboardLayout/
│   │   │   ├── index.jsx       # Dashboard layout wrapper
│   │   │   └── index.module.css
│   │   ├── userLayout/
│   │   │   └── index.jsx       # User layout wrapper
│   │   └── adminLayout/        # Admin layout (if needed)
│   │
│   ├── config/                 # Configuration Files
│   │   ├── index.jsx           # Config exports
│   │   └── redux/              # Redux State Management
│   │       ├── store.js        # Redux store configuration
│   │       │
│   │       ├── action/         # Redux Actions
│   │       │   ├── authAction/
│   │       │   │   └── index.jsx
│   │       │   └── postAction/
│   │       │       └── index.jsx
│   │       │
│   │       ├── reducer/        # Redux Reducers
│   │       │   ├── authReducer/
│   │       │   │   └── index.js
│   │       │   └── postReducers/
│   │       │       └── index.jsx
│   │       │
│   │       └── middleware/     # Redux Middleware
│   │
│   └── styles/                 # Global Styles
│       ├── globals.css         # Global CSS
│       └── Home.module.css     # Home page styles
│
├── .next/                      # Next.js build output
├── node_modules/               # Dependencies
├── .gitignore                  # Git ignore rules
├── jsconfig.json               # JavaScript config
├── next.config.mjs             # Next.js configuration
├── package.json                # Dependencies & Scripts
├── package-lock.json           # Locked Dependencies
└── README.md                   # Project documentation
```

---

### 🎯 Frontend File Details

#### **1. Pages (Routes)**

**_app.js** (App Wrapper)
```javascript
Purpose: Global app configuration
Features:
  ✓ Redux Provider wrapper
  ✓ Global state management
  ✓ Layout wrapper
  ✓ Global styles import
```

**index.jsx** (Landing Page)
```javascript
Route: /
Purpose: Home/Landing page
Features:
  ✓ Welcome screen
  ✓ Login/Register navigation
```

**login/index.jsx**
```javascript
Route: /login
Purpose: Authentication page
Features:
  ✓ Login form
  ✓ Register form
  ✓ Token-based authentication
  ✓ Redux state management
```

**dashboard/index.jsx**
```javascript
Route: /dashboard
Purpose: Main feed/dashboard
Features:
  ✓ Create post
  ✓ View all posts
  ✓ Like/Comment/Share posts
  ✓ Real-time updates
```

**profile/index.jsx**
```javascript
Route: /profile
Purpose: User's own profile
Features:
  ✓ View profile data
  ✓ Edit profile
  ✓ Update bio, work experience
  ✓ Upload profile picture
```

**view_profile/[username].jsx**
```javascript
Route: /view_profile/[username]
Purpose: View other user's profile
Features:
  ✓ Dynamic routing
  ✓ View user details
  ✓ Send connection request
  ✓ Download resume
```

**Discover/index.jsx**
```javascript
Route: /Discover
Purpose: Discover new users
Features:
  ✓ List all users
  ✓ Search users
  ✓ Send connection requests
```

**my_connections/index.jsx**
```javascript
Route: /my_connections
Purpose: Manage connections
Features:
  ✓ View sent requests
  ✓ View received requests
  ✓ Accept/Reject connections
```

#### **2. Components**

**Navbar/index.jsx**
```javascript
Purpose: Navigation bar
Features:
  ✓ Logo
  ✓ Navigation links
  ✓ User profile dropdown
  ✓ Logout functionality
```

#### **3. Layouts**

**DashboardLayout/index.jsx**
```javascript
Purpose: Dashboard page wrapper
Features:
  ✓ Navbar integration
  ✓ Sidebar (if any)
  ✓ Content area
  ✓ Footer
```

**userLayout/index.jsx**
```javascript
Purpose: User page wrapper
Features:
  ✓ User-specific layout
  ✓ Protected routes
```

#### **4. Redux State Management**

**store.js**
```javascript
Purpose: Redux store configuration
Features:
  ✓ Combine reducers
  ✓ Middleware setup
  ✓ DevTools integration
```

**authAction/index.jsx**
```javascript
Actions:
  ✓ LOGIN_USER
  ✓ REGISTER_USER
  ✓ LOGOUT_USER
  ✓ UPDATE_PROFILE
  ✓ GET_USER_PROFILE
```

**authReducer/index.js**
```javascript
State:
  - user: null
  - token: null
  - isAuthenticated: false
  - loading: false
  - error: null
```

**postAction/index.jsx**
```javascript
Actions:
  ✓ CREATE_POST
  ✓ GET_ALL_POSTS
  ✓ LIKE_POST
  ✓ COMMENT_POST
  ✓ SHARE_POST
```

**postReducers/index.jsx**
```javascript
State:
  - posts: []
  - loading: false
  - error: null
```

#### **5. package.json**
```json
Scripts:
  - dev: "next dev"              - Development mode
  - build: "next build"          - Production build
  - start: "next start"          - Production server
  - lint: "next lint"            - Linting

Dependencies:
  - next: ^14.x.x                - Next.js framework
  - react: ^18.x.x               - React library
  - react-dom: ^18.x.x           - React DOM
  - react-redux: ^8.x.x          - Redux for React
  - redux: ^4.x.x                - State management
  - axios: ^1.x.x                - HTTP client
```

---

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  User Interface (Next.js Pages)                      │  │
│  │  ├── Login/Register                                  │  │
│  │  ├── Dashboard (Feed)                                │  │
│  │  ├── Profile                                         │  │
│  │  ├── Discover                                        │  │
│  │  └── Connections                                     │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │  Redux State Management                              │  │
│  │  ├── Actions (API calls)                             │  │
│  │  ├── Reducers (State updates)                        │  │
│  │  └── Store (Global state)                            │  │
│  └──────────────────┬───────────────────────────────────┘  │
└────────────────────┼────────────────────────────────────────┘
                     │
                     │ HTTP Requests (Axios)
                     │
┌────────────────────▼────────────────────────────────────────┐
│                        BACKEND                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes (Express Router)                             │  │
│  │  ├── /register, /login                               │  │
│  │  ├── /get_user_and_profile                           │  │
│  │  ├── /create_post, /get_all_posts                    │  │
│  │  └── /send_connection_request                        │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │  Controllers (Business Logic)                        │  │
│  │  ├── user.controller.js                              │  │
│  │  └── post.controller.js                              │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │  Models (MongoDB Schemas)                            │  │
│  │  ├── User, Profile                                   │  │
│  │  ├── Post, Comment                                   │  │
│  │  └── Connection                                      │  │
│  └──────────────────┬───────────────────────────────────┘  │
└────────────────────┼────────────────────────────────────────┘
                     │
                     │ Mongoose ODM
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   MongoDB Database                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Collections:                                        │  │
│  │  ├── users                                           │  │
│  │  ├── profiles                                        │  │
│  │  ├── posts                                           │  │
│  │  ├── comments                                        │  │
│  │  └── connectionrequests                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
1. User Registration:
   Frontend → POST /register → Backend → Hash Password → Save to DB
   
2. User Login:
   Frontend → POST /login → Backend → Verify Password → Generate Token → Return Token
   
3. Authenticated Requests:
   Frontend (with token) → GET /get_user_and_profile?token=xxx → Backend → Verify Token → Return Data
```

---

## 🌐 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                         │
│  https://pro-connect-linkedin-clone-eight.vercel.app        │
│  ├── Next.js Static & Server-Side Rendering                 │
│  ├── Automatic deployments from GitHub                      │
│  └── Environment Variables (API_URL)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ API Calls
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    RENDER (Backend)                          │
│  https://proconnect-linkedin-clone.onrender.com             │
│  ├── Node.js Express Server                                 │
│  ├── Auto-deploy from GitHub (main branch)                  │
│  ├── Environment Variables (PORT, MONGODB_URI)              │
│  └── File uploads storage                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Database Connection
                     │
┌────────────────────▼────────────────────────────────────────┐
│                 MongoDB Atlas (Database)                     │
│  mongodb+srv://subhanshukumar290:***@linkedin.xps8o...      │
│  ├── Cloud-hosted MongoDB                                   │
│  ├── Automatic backups                                      │
│  └── Global distribution                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Key Features Implementation

### ✅ Implemented Features

1. **User Management**
   - ✓ Registration & Login
   - ✓ Profile creation & editing
   - ✓ Profile picture upload
   - ✓ Resume/CV generation (PDF)

2. **Social Features**
   - ✓ Create posts
   - ✓ Like posts
   - ✓ Comment on posts
   - ✓ Share posts
   - ✓ View feed

3. **Networking**
   - ✓ Send connection requests
   - ✓ Accept/Reject requests
   - ✓ View connections
   - ✓ Discover users

4. **Profile Features**
   - ✓ Bio & current position
   - ✓ Work experience history
   - ✓ View other profiles
   - ✓ Download resume

---

## 🛠️ Technology Stack Summary

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: Token-based (crypto)
- **File Upload**: Multer
- **PDF Generation**: PDFKit
- **Security**: bcrypt (password hashing), CORS

### Frontend
- **Framework**: Next.js (React)
- **State Management**: Redux
- **Styling**: CSS Modules
- **HTTP Client**: Axios (likely)
- **Routing**: Next.js file-based routing

### DevOps
- **Version Control**: Git/GitHub
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Render
- **Database**: MongoDB Atlas

---

## 📝 Important Notes

### Backend Issues Found:
1. ✅ **FIXED**: Missing `start` script in package.json
2. ✅ **FIXED**: Hardcoded port (now uses `process.env.PORT`)
3. ⚠️ **TYPO**: `profile.moddel.js` should be `profile.model.js`
4. ⚠️ **TYPO**: `Componennts` should be `Components`

### Security Considerations:
- ⚠️ MongoDB credentials exposed in `server.js` (should use .env)
- ⚠️ Token stored in plain text (consider JWT)
- ⚠️ No rate limiting on API endpoints
- ⚠️ No input validation middleware

### Recommended Improvements:
1. Move MongoDB URI to environment variables
2. Implement JWT instead of random tokens
3. Add input validation (express-validator)
4. Add rate limiting (express-rate-limit)
5. Add API documentation (Swagger)
6. Add unit tests
7. Fix typos in folder names
8. Add error logging (Winston/Morgan)

---

## 🚀 Quick Start Commands

### Backend
```bash
cd backend
npm install
npm run dev        # Development
npm start          # Production
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # Development
npm run build      # Build for production
npm start          # Production server
```

---

**Created by**: Shubhanshu Kumar  
**Project**: ProConnect - LinkedIn Clone  
**Last Updated**: January 18, 2026
