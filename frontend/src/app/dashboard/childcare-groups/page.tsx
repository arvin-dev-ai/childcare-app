'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '../../../services/api';

interface ChildcareGroup {
  id: string;
  name: string;
}

const ChildcareGroupsPage = () => {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<ChildcareGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role.name !== 'Super Admin')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchGroups = async () => {
      if (token) {
        try {
                    const response = await apiClient.get('/childcare-groups', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setGroups(response.data);
        } catch (err) {
          setError('Failed to fetch childcare groups.');
        }
      }
    };

    fetchGroups();
  }, [token]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const response = await apiClient.post(
                '/childcare-groups',
        { name: newGroupName },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setGroups([...groups, response.data]);
      setNewGroupName('');
    } catch (err) {
      setError('Failed to create group. You may not have the required permissions.');
    }
  };

  if (loading || !user || user.role.name !== 'Super Admin') {
    return <div>Loading or redirecting...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Childcare Groups</h1>
      {error && <p className="text-red-500 bg-red-100 p-2 mb-4 rounded">{error}</p>}

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Existing Groups</h2>
        {groups.length > 0 ? (
          <ul className="space-y-3">
            {groups.map((group) => (
              <li key={group.id} className="p-4 border rounded-md flex justify-between items-center">
                <span className="font-medium">{group.name}</span>
                <Link href={`/dashboard/childcare-groups/${group.id}/centers`}>
                  <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300">
                    Manage Centers
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No childcare groups found. Create one below.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
        <form onSubmit={handleCreateGroup} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Enter new group name"
            className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
          >
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChildcareGroupsPage;
