import React, { useState, useEffect } from 'react';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MobileBottomNav from './MobileBottomNav';
import CommandPalette from '../common/CommandPalette';

const AppLayout = ({ children, onOpenCreatePost }) => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global Command Palette Shortcut: ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-shell">
      {/* Ambient Lighting Mesh for True Glassmorphism Depth */}
      <div className="ambient-glow ambient-glow-1" />
      <div className="ambient-glow ambient-glow-2" />
      <div className="ambient-glow ambient-glow-3" />

      {/* Left Navigation Sidebar */}
      <LeftSidebar onOpenCreatePost={onOpenCreatePost} />

      {/* Center Dynamic Feed / Content Area */}
      <main className="main-content">
        <div className="feed-inner">
          {children}
        </div>
      </main>

      {/* Right Sidebar Widgets */}
      <RightSidebar onOpenPalette={() => setCommandPaletteOpen(true)} />

      {/* Mobile Floating Bottom Bar */}
      <MobileBottomNav onOpenCreatePost={onOpenCreatePost} />

      {/* Global ⌘K Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenCreatePost={onOpenCreatePost}
      />
    </div>
  );
};

export default AppLayout;
