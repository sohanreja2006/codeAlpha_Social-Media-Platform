import React from 'react';

const Avatar = ({ src, name = 'User', size = 'md', className = '', onClick }) => {
  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  const resolvedSrc = src
    ? src.startsWith('http') || src.startsWith('data:')
      ? src
      : src.startsWith('/')
      ? src
      : `/${src}`
    : null;

  return (
    <div
      className={`avatar avatar-${size} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      title={name}
    >
      {resolvedSrc ? (
        <img
          src={resolvedSrc}
          alt={name}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;

