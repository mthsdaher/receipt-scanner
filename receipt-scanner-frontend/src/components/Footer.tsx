import React from 'react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#111',
        color: '#d1d5db',
        borderTop: '1px solid #374151',
        padding: '24px 16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '0.875rem',
          letterSpacing: '0.05em',
          maxWidth: '1280px',
        }}
      >
        © 2025 Receipt Scanner — All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
