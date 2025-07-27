'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

function DashboardPage() {
  const { user, loading } = useAuth();

    if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Protected Dashboard</h1>
      {user ? (
        <p className="text-xl mt-4">Welcome, {user.email}! You are logged in.</p>
      ) : (
        <p className="text-xl mt-4">Welcome! You are logged in.</p>
      )}
      <div className="mt-8">
        {user && user.role.name === 'Super Admin' && (
          <Link href="/dashboard/childcare-groups" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75">
              Manage Childcare Groups
          </Link>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
