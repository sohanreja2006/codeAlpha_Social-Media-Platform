import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, PlusCircle, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileBottomNav = ({ onOpenCreatePost }) => {
  const { user } = useAuth();

  return (
    <nav className="mobile-bottom-nav">
      <NavLink
        to="/"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <Home size={22} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/explore"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <Compass size={22} />
        <span>Explore</span>
      </NavLink>

      <button
        type="button"
        className="mobile-nav-item mobile-create-btn"
        onClick={onOpenCreatePost}
        aria-label="Create Post"
      >
        <PlusCircle size={28} />
      </button>

      <NavLink
        to="/notifications"
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <Bell size={22} />
        <span>Alerts</span>
      </NavLink>

      <NavLink
        to={user ? `/profile/${user._id || user.username}` : '/login'}
        className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
      >
        <User size={22} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default MobileBottomNav;

