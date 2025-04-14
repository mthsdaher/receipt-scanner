import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

const Home = () => {
  return (
    <Layout>
      <main className="container mx-auto flex-grow p-6 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Welcome to Receipt Scanner</h2>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-lg">
          Manage your finances by tracking receipts. Choose an option below to get started!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <Link
            to="/insert-receipt"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-md text-center transition duration-300"
          >
            Insert Your Receipt
          </Link>
          <Link
            to="/dashboard"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg shadow-md text-center transition duration-300"
          >
            Dashboard
          </Link>
          <Link
            to="/historic"
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-lg shadow-md text-center transition duration-300"
          >
            Historic
          </Link>
        </div>
      </main>
    </Layout>
  );
};

export default Home;
