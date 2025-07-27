'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import apiClient from '../../services/api';
import { AxiosError } from 'axios';

interface GroupMembership {
  group: {
    id: string;
    name: string;
  };
}

function DashboardPage() {
  const { user, loading } = useAuth();
  const [groups, setGroups] = useState<GroupMembership[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role.name === 'Childcare Group Admin') {
      const fetchGroups = async () => {
        try {
          const response = await apiClient.get<GroupMembership[]>('/group-memberships/my-groups');
          setGroups(response.data);
        } catch (err) {
          const error = err as AxiosError;
          setError(error.message || 'Failed to fetch groups');
          console.error('Failed to fetch groups', error);
        }
      };
      fetchGroups();
    }
  }, [user]);

  if (loading) {
    return <p className="text-center py-10">Loading...</p>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Protected Dashboard</h1>
      {user ? (
        <p className="text-xl mt-4">Welcome, {user.email}! You are logged in.</p>
      ) : (
        <p className="text-xl mt-4">Welcome! You are logged in.</p>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="mt-8">
        {user && user.role.name === 'Super Admin' && (
          <Link href="/dashboard/childcare-groups" className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75">
            Manage Childcare Groups
          </Link>
        )}

        {user && user.role.name === 'Childcare Group Admin' && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4 text-center">Your Childcare Groups</h2>
            {groups.length > 0 ? (
              <ul className="space-y-3">
                {groups.map((membership) => (
                  <li key={membership.group.id} className="bg-white p-4 rounded-lg shadow-md">
                    <Link href={`/dashboard/childcare-groups/${membership.group.id}/centers`} className="text-blue-600 hover:underline font-semibold">
                      {membership.group.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p>You are not assigned to any childcare groups.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const Dashboard = () => (
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
);

export default Dashboard;
