'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

const ChildrenPage = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const { token, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:3003/children', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChildren(response.data);
      } catch (err) {
        setError('Failed to fetch children. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchChildren();
    }
  }, [token, authLoading]);

  if (loading || authLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Children Management</h1>
      {children.length === 0 ? (
        <p>No children found. Add one to get started.</p>
      ) : (
        <ul className="space-y-2">
          {children.map((child) => (
            <li key={child.id} className="p-4 border rounded-md shadow-sm">
              <p className="font-semibold">{child.firstName} {child.lastName}</p>
              <p className="text-sm text-gray-600">DOB: {new Date(child.dateOfBirth).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ProtectedChildrenPage = () => (
  <ProtectedRoute>
    <ChildrenPage />
  </ProtectedRoute>
);

export default ProtectedChildrenPage;
