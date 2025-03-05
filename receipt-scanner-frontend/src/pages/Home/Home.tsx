import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Home component as the entry point after login
const Home = () => {
  // Hook for programmatic navigation (if needed for future enhancements)
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navigation bar */}
      <nav className="bg-blue-600 p-4 text-white shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Receipt Scanner</h1>
          <div className="space-x-4">
            <Link to="/dashboard" className="hover:text-gray-300">
              Dashboard
            </Link>
            <Link to="/historic" className="hover:text-gray-300">
              Historic
            </Link>
            <Link to="/signin" className="hover:text-gray-300">
              Sign In
            </Link>
            <Link to="/signup" className="hover:text-gray-300">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="container mx-auto flex-grow p-6 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Welcome to Receipt Scanner</h2>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-lg">
          Manage your finances by tracking receipts. Choose an option below to get started!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {/* Button to Insert Your Receipt */}
          <Link
            to="/insert-receipt"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-md text-center transition duration-300"
          >
            Insert Your Receipt
          </Link>
          {/* Button to Dashboard */}
          <Link
            to="/dashboard"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg shadow-md text-center transition duration-300"
          >
            Dashboard
          </Link>
          {/* Button to Historic */}
          <Link
            to="/historic"
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-lg shadow-md text-center transition duration-300"
          >
            Historic
          </Link>
        </div>
      </main>

      {/* Footer (optional, for completeness) */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>© 2025 Receipt Scanner. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;