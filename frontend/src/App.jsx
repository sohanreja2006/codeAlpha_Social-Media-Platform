import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Modal from './components/common/Modal';
import CreatePost from './components/feed/CreatePost';

// Pages
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';
import DiscoverPage from './pages/DiscoverPage';
import NotificationsPage from './pages/NotificationsPage';
import MessagesPage from './pages/MessagesPage';
import BookmarksPage from './pages/BookmarksPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Protected Route Component
const ProtectedRoute = ({ children, onOpenCreatePost }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg-gradient)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Loading SOCIALY...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout onOpenCreatePost={onOpenCreatePost}>{children}</AppLayout>;
};

// Public Only Route Component (redirects to / if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [mobileCreateOpen, setMobileCreateOpen] = useState(false);

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute onOpenCreatePost={() => setMobileCreateOpen(true)}>
              <FeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <ProtectedRoute onOpenCreatePost={() => setMobileCreateOpen(true)}>
              <ExplorePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/discover"
          element={
            <ProtectedRoute onOpenCreatePost={() => setMobileCreateOpen(true)}>
              <DiscoverPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute onOpenCreatePost={() => setMobileCreateOpen(true)}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute onOpenCreatePost={() => setMobileCreateOpen(true)}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute onOpenCreatePost={() => setMobileCreateOpen(true)}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute onOpenCreatePost={() => setMobileCreateOpen(true)}>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute onOpenCreatePost={() => setMobileCreateOpen(true)}>
              <BookmarksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute onOpenCreatePost={() => setMobileCreateOpen(true)}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Mobile Create Post Modal */}
      {mobileCreateOpen && (
        <Modal
          isOpen={mobileCreateOpen}
          onClose={() => setMobileCreateOpen(false)}
          title="Create New Post"
          maxWidth={500}
        >
          <CreatePost
            onPostCreated={() => {
              setMobileCreateOpen(false);
              window.location.reload();
            }}
          />
        </Modal>
      )}
    </>
  );
}

export default App;

