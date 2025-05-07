import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  History,
  FilePlus2,
  LogIn,
  UserPlus,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isLoggedIn, signOut } = useAuth();

  // Common items
  const items = [
    { path: '/', label: 'Home', icon: <Home size={20} /> },
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/historic', label: 'Historic', icon: <History size={20} /> },
    { path: '/insert-receipt', label: 'Insert', icon: <FilePlus2 size={20} /> },
  ];

  // Auth-specific
  const authItems = isLoggedIn
    ? [{ action: signOut, label: 'Sign Out', icon: <LogOut size={20} /> }]
    : [
        { path: '/signin', label: 'Sign In', icon: <LogIn size={20} /> },
        { path: '/signup', label: 'Sign Up', icon: <UserPlus size={20} /> },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="text-2xl font-bold tracking-wide text-black uppercase">
          R<span className="text-blue-600">S</span>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {items.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition duration-300 hover:bg-gray-100 ${
                location.pathname === path ? 'bg-gray-200 font-semibold' : 'text-gray-700'
              }`}
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}

          {authItems.map((item) =>
            'path' in item ? (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition duration-300 hover:bg-gray-100 ${
                  location.pathname === item.path ? 'bg-gray-200 font-semibold' : 'text-gray-700'
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ) : (
              <button
                key={item.label}
                onClick={item.action}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-700 hover:bg-gray-100 transition duration-300"
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
