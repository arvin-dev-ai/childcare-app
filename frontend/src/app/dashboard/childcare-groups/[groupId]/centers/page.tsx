'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '../../../../../services/api';
import { useAuth } from '../../../../../context/AuthContext';
import ManageCenterUsers from '../../../../../components/ManageCenterUsers';

interface ChildcareCenter {
  id: string;
  name: string;
  address: string;
}

interface ChildcareGroup {
    id: string;
    name: string;
}

export default function ManageChildcareCenters() {
  const { token } = useAuth();
  const params = useParams();
  const groupId = params.groupId as string;

  const [centers, setCenters] = useState<ChildcareCenter[]>([]);
  const [group, setGroup] = useState<ChildcareGroup | null>(null);
  const [newCenterName, setNewCenterName] = useState('');
  const [newCenterAddress, setNewCenterAddress] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);

  const fetchGroupDetails = useCallback(async () => {
    if (token && groupId) {
        try {
                        const response = await apiClient.get(`/childcare-groups/${groupId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGroup(response.data);
        } catch (err) {
            setError('Failed to fetch group details.');
            console.error(err);
        }
    }
  }, [token, groupId]);

  const fetchCenters = useCallback(async () => {
    if (token && groupId) {
      try {
                const response = await apiClient.get(`/childcare-centers/by-group/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCenters(response.data);
      } catch (err) {
        setError('Failed to fetch childcare centers.');
        console.error(err);
      }
    }
  }, [token, groupId]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchGroupDetails(), fetchCenters()]).finally(() => setIsLoading(false));
  }, [fetchGroupDetails, fetchCenters]);

  const handleCreateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCenterName.trim() || !newCenterAddress.trim()) {
      setError('Center name and address cannot be empty.');
      return;
    }
    setError(null);

    try {
      await apiClient.post(
                '/childcare-centers',
        {
          name: newCenterName,
          address: newCenterAddress,
          childcareGroupId: groupId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewCenterName('');
      setNewCenterAddress('');
      await fetchCenters(); // Refresh the list
    } catch (err) {
      setError('Failed to create center. You may not have the required permissions.');
      console.error(err);
    }
  };

  const handleToggleUsers = (centerId: string) => {
    setSelectedCenterId(prevId => (prevId === centerId ? null : centerId));
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Manage Centers for {group?.name || 'Group'}</h1>
      
      {error && <p className="text-red-500 bg-red-100 p-3 mb-4 rounded-md">{error}</p>}

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Center</h2>
        <form onSubmit={handleCreateCenter} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newCenterName}
              onChange={(e) => setNewCenterName(e.target.value)}
              placeholder="Enter new center name"
              className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newCenterAddress}
              onChange={(e) => setNewCenterAddress(e.target.value)}
              placeholder="Enter center address"
              className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            type="submit"
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-300"
          >
            Add Center
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Existing Centers</h2>
        {centers.length > 0 ? (
          <ul className="space-y-3">
            {centers.map((center) => (
              <li key={center.id} className="p-4 border rounded-md bg-gray-50 transition-shadow duration-300 hover:shadow-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-lg">{center.name}</p>
                    <p className="text-gray-600">{center.address}</p>
                  </div>
                  <button 
                    onClick={() => handleToggleUsers(center.id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm transition-transform duration-200 transform hover:scale-105"
                  >
                    {selectedCenterId === center.id ? 'Hide Users' : 'Manage Users'}
                  </button>
                </div>
                {selectedCenterId === center.id && <ManageCenterUsers centerId={center.id} />}
              </li>
            ))}
          </ul>
        ) : (
          <p>No centers found for this group. Add one above.</p>
        )}
      </div>
    </div>
  );
}
