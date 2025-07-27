'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Childcare Management App</h1>
        {user ? (
          <div className="space-y-4">
            <p className="text-xl">Welcome, {user.email}!</p>
            <div className="flex justify-center space-x-4">
              <Link href="/dashboard" className="px-4 py-2 font-semibold text-white bg-green-500 rounded hover:bg-green-600 transition-colors">
                Go to Dashboard
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 font-semibold text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xl mb-4">Please log in to continue.</p>
            <Link href="/login" className="px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors">
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
