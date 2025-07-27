'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  centerMemberships: { role: { name: string } }[];
}

interface Role {
  id: string;
  name: string;
}

interface ManageCenterUsersProps {
  centerId: string;
}

export default function ManageCenterUsers({ centerId }: ManageCenterUsersProps) {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      const response = await apiClient.get(`/users/by-center/${centerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users.');
      console.error(err);
    }
  }, [token, centerId]);

  const fetchRoles = useCallback(async () => {
    if (!token) return;
    try {
      const response = await apiClient.get('/roles/center-assignable', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(response.data);
    } catch (err) {
      setError('Failed to fetch roles.');
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchUsers(), fetchRoles()]).finally(() => setIsLoading(false));
  }, [fetchUsers, fetchRoles]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserFirstName.trim() || !newUserLastName.trim() || !newUserEmail.trim() || !newUserPassword.trim() || !selectedRoleId) {
      setError('All fields are required.');
      return;
    }
    setError(null);

    try {
      await apiClient.post(
        '/users/with-membership',
        {
          firstName: newUserFirstName,
          lastName: newUserLastName,
          email: newUserEmail,
          password: newUserPassword,
          roleId: selectedRoleId,
          centerId: centerId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Reset form and refresh user list
      setNewUserFirstName('');
      setNewUserLastName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setSelectedRoleId('');
      await fetchUsers();
    } catch (err) {
      setError('Failed to add user. Please check the details and try again.');
      console.error(err);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading users...</div>;
  }

  return (
    <div className="mt-4 p-4 border-t-2 border-gray-200">
      <h3 className="text-lg font-semibold mb-3">Manage Users</h3>
      {error && <p className="text-red-500 bg-red-100 p-2 mb-3 rounded-md">{error}</p>}

      {/* Add User Form */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="font-semibold mb-2">Add New User</h4>
        <form onSubmit={handleAddUser} className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newUserFirstName}
              onChange={(e) => setNewUserFirstName(e.target.value)}
              placeholder="First Name"
              className="w-1/2 px-3 py-2 border rounded-md"
            />
            <input
              type="text"
              value={newUserLastName}
              onChange={(e) => setNewUserLastName(e.target.value)}
              placeholder="Last Name"
              className="w-1/2 px-3 py-2 border rounded-md"
            />
          </div>
          <input
            type="email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full px-3 py-2 border rounded-md"
          />
          <input
            type="password"
            value={newUserPassword}
            onChange={(e) => setNewUserPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 border rounded-md"
          />
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="" disabled>Select a Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
            Add User
          </button>
        </form>
      </div>

      {/* Users List */}
      <div>
        <h4 className="font-semibold mb-2">Existing Users</h4>
        {users.length > 0 ? (
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id} className="p-3 bg-white border rounded-md flex justify-between items-center">
                <div>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {user.centerMemberships[0]?.role?.name || 'No Role'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No users found for this center.</p>
        )}
      </div>
    </div>
  );
}
