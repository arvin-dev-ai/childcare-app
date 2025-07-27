'use client';

'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface GroupMembership {
  id: string;
  user: User;
  role: { name: string };
}

interface ManageGroupAdminsProps {
  groupId: string;
}

export default function ManageGroupAdmins({ groupId }: ManageGroupAdminsProps) {
  const { token } = useAuth();
  const [members, setMembers] = useState<GroupMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fetchGroupMembers = useCallback(async () => {
    if (!token) return;
    try {
      const response = await apiClient.get(`/group-memberships/by-group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(response.data);
    } catch (err) {
      setError('Failed to fetch group admins.');
      console.error(err);
    }
  }, [token, groupId]);

  useEffect(() => {
    setIsLoading(true);
    fetchGroupMembers().finally(() => setIsLoading(false));
  }, [fetchGroupMembers]);

  const handleAddNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.post(
        '/group-memberships/with-user',
        {
          firstName,
          lastName,
          email,
          password,
          groupId,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Reset form and refetch members
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      await fetchGroupMembers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add admin.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-6 p-4 border-t-2 border-gray-200">
      <h3 className="text-lg font-semibold mb-3">Manage Group Admins</h3>
      {error && <p className="text-red-500 bg-red-100 p-2 mb-3 rounded-md">{error}</p>}

      {/* Add Admin Form */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="font-semibold mb-2">Add New Group Admin</h4>
        <form onSubmit={handleAddNewAdmin} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              className="px-3 py-2 border rounded-md"
              required
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              className="px-3 py-2 border rounded-md"
              required
            />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min. 8 characters)"
            className="w-full px-3 py-2 border rounded-md"
            required
            minLength={8}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Adding...' : 'Add New Admin'}
          </button>
        </form>
      </div>

      {/* Admin List */}
      <div>
        <h4 className="font-semibold mb-2">Current Admins</h4>
        {members.length > 0 ? (
          <ul className="space-y-2">
            {members.map((member) => (
              <li key={member.id} className="p-3 bg-white border rounded-md">
                <p className="font-medium">{member.user.firstName} {member.user.lastName}</p>
                <p className="text-sm text-gray-500">{member.user.email}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No group admins assigned.</p>
        )}
      </div>
    </div>
  );
}
