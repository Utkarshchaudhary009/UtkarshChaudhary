'use client';

import { useState } from 'react';
import { useUsers, useCreateUser, useDeleteUser, type CreateUserInput } from '@/services/exampleService';

export default function UsersList() {
  const { data: users, isLoading, error } = useUsers();
  const createUserMutation = useCreateUser();
  const [newUser, setNewUser] = useState<CreateUserInput>({ name: '', email: '' });
  
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(newUser, {
      onSuccess: () => {
        setNewUser({ name: '', email: '' });
      },
    });
  };

  const DeleteButton = ({ id }: { id: string }) => {
    const deleteUserMutation = useDeleteUser(id);
    
    return (
      <button
        onClick={() => deleteUserMutation.mutate()}
        disabled={deleteUserMutation.isPending}
        className="px-3 py-1 bg-red-600 text-white rounded-md text-sm"
      >
        {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
      </button>
    );
  };

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error loading users: {error.message}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Users</h2>
      
      {/* Create User Form */}
      <form onSubmit={handleCreateUser} className="space-y-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-medium">Add New User</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            className="px-4 py-2 border rounded-md"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            className="px-4 py-2 border rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          disabled={createUserMutation.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          {createUserMutation.isPending ? 'Creating...' : 'Create User'}
        </button>
      </form>

      {/* Users List */}
      <div className="mt-6">
        {users?.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {users?.map((user) => (
              <li key={user.id} className="py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <DeleteButton id={user.id} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 