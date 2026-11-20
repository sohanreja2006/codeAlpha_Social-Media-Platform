# SOCIALY — Premium Glassmorphic Social Networking Platform

<div align="center">
  <h3>✨ The Modern, Fluid, and Tactile Social Media Experience ✨</h3>
  <p>Built with <strong>React.js (Vite)</strong>, <strong>Node.js</strong>, <strong>Express.js</strong>, and <strong>MongoDB / Mongoose</strong>.</p>
</div>

---

## 🌟 Overview

**SOCIALY** is a full-stack, responsive social networking web application designed with an Apple-inspired glassmorphism aesthetic. It delivers a fluid user experience featuring translucent frosted-glass surfaces, micro-interactions, responsive 3-column desktop dashboard and mobile bottom navigation, persistent authentication, post feeds, image uploads, dynamic commenting, like animations, and a follow/unfollow system.

Zero Tailwind. Zero Bootstrap. 100% custom-crafted design token system.

---

## 🎨 Design System — Premium Glassmorphism

| Token Category | Values / Specs |
| :--- | :--- |
| **Background** | Light lavender / off-white mesh gradient (`#f0f0ff` to `#eef3ff`) |
| **Primary Brand** | Deep Violet (`#7655E8` / `#6c3fc5`) |
| **Secondary Brand** | Soft Blue (`#A5B4FC` / `#4f8ef7`) |
| **Text Primary** | Dark Navy (`#202033` / `#1a1a2e`) |
| **Glass Surfaces** | `rgba(255, 255, 255, 0.65)` with `backdrop-filter: blur(16px)` |
| **Borders** | Subtle translucent borders (`rgba(255, 255, 255, 0.4)`) |
| **Shadows** | Soft atmospheric shadows (`0 8px 32px rgba(108, 63, 197, 0.10)`) |
| **Typography** | Plus Jakarta Sans & Inter |

---

## 🚀 Key Functional Features

### 1. Authentication & Security
- **User Registration & Login** with client & server-side validation.
- **JWT (JSON Web Token)** authentication with automatic session persistence and token header injection.
- **bcrypt password hashing** (salt rounds = 10); plaintext passwords are never stored.
- **Protected routes** on both frontend (`ProtectedRoute`) and backend (`auth` middleware).

### 2. User Profiles
- Custom **Profile Picture** and **Cover Banner** uploads (Multer) or direct image URLs.
- Editable **Full Name**, **Username**, and **Bio**.
- Real-time counters: **Posts**, **Followers**, and **Following**.
- Clickable Followers and Following modals.
- User profile posts stream and photos gallery tab.
- Supports visiting any user's profile (`/profile/:idOrUsername`).

### 3. Post Feed & Creation
- Create text posts with formatted tags and links.
- Image uploads via Multer or direct image links with real-time preview and remove option.
- Chronological feed with author avatar, username, and relative timestamps (`2m ago`, `3h ago`).
- Interactive Heart like button with pulse heartbeat micro-animation.
- Delete own posts with confirmation modal (cascades to related comments).
- One-click post link copy to clipboard.

### 4. Interactive Comments
- Expandable comment section per post.
- Dynamic comment counters that update in real-time.
- Author details and relative timestamps for every comment.
- Delete own comments with confirmation modal.

### 5. Follow / Unfollow System
- One-click follow/unfollow buttons across profiles and suggested users widget.
- Optimistic UI updates with hover state change (`Following` ➔ `Unfollow`).
- Prevents users from following themselves.
- Followers / Following modal lists with active follow buttons.

### 6. Responsive 3-Column Layout
- **Left Sidebar**: SOCIALY glowing logo, Home, Explore, Notifications (with unread badge), Messages, Bookmarks, Profile, Settings, and Log out.
- **Center Feed**: Personalized greeting header, Stories avatar carousel, Create Post composer, and dynamic Post feed.
- **Right Sidebar**: Search bar, Suggested Users to follow, Trending Hashtags with post counts, and Featured Communities.
- **Mobile**: Converts desktop sidebars into a modern elevated glassmorphic Bottom Navigation Bar.

---

## 📁 Project Architecture

```
internship-proj-2/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection (supports MongoDB URI & auto-fallback)
│   ├── controllers/
│   │   ├── auth.controller.js    # Register, login, getMe
│   │   ├── user.controller.js    # Profile, suggestions, follow/unfollow, followers/following
│   │   ├── post.controller.js    # Feed, explore, create, delete, like toggle, comments
│   │   └── comment.controller.js # Add comment, delete comment
│   ├── middleware/
│   │   ├── auth.js               # JWT authorization header validator
│   │   ├── upload.js             # Multer image storage and format filter
│   │   └── errorHandler.js       # Centralized error handler
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Post.js               # Post schema
│   │   └── Comment.js            # Comment schema
│   ├── routes/
│   │   ├── auth.routes.js        # /api/auth routes
│   │   ├── user.routes.js        # /api/users routes
│   │   ├── post.routes.js        # /api/posts routes
│   │   └── comment.routes.js     # /api/comments routes
│   ├── utils/
│   │   └── seed.js               # Initial sample creators, posts, comments & followers
│   ├── uploads/                  # Multer media storage directory
│   ├── .env                      # Backend environment config
│   ├── .env.example              # Example environment template
│   ├── server.js                 # Express server entry point
│   └── test-api.js               # Full 10-step integration test suite
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js          # Pre-configured Axios instance with JWT interceptor
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Global user auth state and actions
│   │   │   └── ToastContext.jsx  # Glassmorphic toast notification manager
│   │   ├── components/
│   │   │   ├── common/           # Avatar, Button, Modal, FollowButton, Skeletons, ConfirmModal
│   │   │   ├── layout/           # AppLayout, LeftSidebar, RightSidebar, MobileBottomNav
│   │   │   ├── feed/             # CreatePost, PostCard, CommentSection, StoriesBar
│   │   │   ├── profile/          # ProfileHeader, EditProfileModal, FollowListModal
│   │   │   └── widgets/          # SuggestedUsers, TrendingTopics, CommunityDiscovery
│   │   ├── pages/
│   │   │   ├── FeedPage.jsx      # Home dashboard
│   │   │   ├── ProfilePage.jsx   # User profile and gallery
│   │   │   ├── ExplorePage.jsx   # Explore, search, and category tags
│   │   │   ├── NotificationsPage.jsx # Activity center
│   │   │   ├── BookmarksPage.jsx # Saved posts
│   │   │   ├── SettingsPage.jsx  # Preferences and design specs
│   │   │   ├── LoginPage.jsx     # Glassmorphic sign in with demo autofill
│   │   │   └── RegisterPage.jsx  # Sign up
│   │   ├── styles/
│   │   │   ├── variables.css     # CSS design tokens
│   │   │   ├── base.css          # Reset and typography
│   │   │   ├── components.css    # Glass cards, buttons, inputs, toasts, modals
│   │   │   ├── layout.css        # 3-column layout and shell
│   │   │   └── pages.css         # Page-specific styling and animations
│   │   ├── App.jsx               # Route definitions
│   │   └── main.jsx              # React DOM entry
│   ├── index.html
│   ├── vite.config.js            # Vite configuration with /api proxy
│   └── package.json
│
└── package.json                  # Root convenience scripts
```

---

## ⚡ Quick Start & Execution Instructions

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB (Optional: An embedded MongoMemoryServer automatically boots if a local MongoDB service is not detected)

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies (already installed)
npm install

# Start the backend server
npm start
# OR for live reloading during development:
npm run dev
```
The backend will launch at `http://localhost:5000` and automatically seed sample creators and posts if the database is clean.

### 3. Frontend Setup
```bash
# Open a new terminal tab and navigate to frontend directory
cd frontend

# Install dependencies (already installed)
npm install

# Start the Vite development server
npm run dev
```
The frontend will launch at `http://localhost:3000` (or `http://localhost:5173`). Open the URL in your browser.

---

## 🔑 Demo Accounts (Pre-Seeded)

The platform includes demo accounts with avatars, bios, sample posts, and followers:

| Name | Role | Email | Password |
| :--- | :--- | :--- | :--- |
| **Elena Rostova** | Product Designer | `elena@socialy.io` | `password123` |
| **Marcus Vance** | Full-Stack Architect | `marcus@socialy.io` | `password123` |
| **Sophia Chen** | AI Researcher | `sophia@socialy.io` | `password123` |
| **Julian Hayes** | Design Engineer | `julian@socialy.io` | `password123` |

> 💡 **Tip:** On the Sign In page, you can click any of the "Quick Demo Login" pills to instantly autofill credentials! You can also click **Create an account** to register a brand new user profile.

---

## 🧪 Testing the API Suite

A comprehensive 10-step automated integration test is included:

```bash
cd backend
node test-api.js
```

This verifies:
1. Health check endpoint (`GET /api/health`)
2. Demo user login & JWT generation (`POST /api/auth/login`)
3. Auth user profile query (`GET /api/auth/me`)
4. Chronological feed retrieval (`GET /api/posts/feed`)
5. Creating text and image posts (`POST /api/posts`)
6. Like and unlike toggling (`POST /api/posts/:id/like`)
7. Comment addition (`POST /api/comments`)
8. Comment deletion (`DELETE /api/comments/:id`)
9. Suggested user recommendations (`GET /api/users/suggestions`)
10. Post deletion with cascade cleanup (`DELETE /api/posts/:id`)

---

## 🛡️ Security & Quality Standards

- **Environment Isolation**: Database URIs, PORT, and JWT secrets are configured via `.env`.
- **Validation**: Strict schema rules with `express-validator` and client-side feedback.
- **Authorization Verification**: Users can only edit or delete their own posts, comments, and profile data.
- **Cross-Origin Resource Sharing (CORS)**: Pre-configured for seamless development and proxying.

