import React from 'react';
import Footer from './Footer.tsx';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 min-h-screen bg-gray-50">
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
