import React from 'react';
import Footer from './Footer';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: 'white',
        color: 'black',
      }}
    >
      <main
        style={{
          flex: 1,
          padding: '1rem 1.5rem',
        }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
