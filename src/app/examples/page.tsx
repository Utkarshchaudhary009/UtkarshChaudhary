'use client';

import { useState } from 'react';
import { useExamples, useCreateExample, useExample, useUpdateExample, useDeleteExample } from '@/lib/api/services/exampleService';

export default function ExamplesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  
  // Query to fetch all examples
  const { data: examples, isLoading, error } = useExamples();
  
  // Query to fetch a single example (enabled only when an ID is selected)
  const { data: selectedExample } = useExample(selectedId || '');
  
  // Mutations
  const createMutation = useCreateExample();
  const updateMutation = useUpdateExample(selectedId || '');
  const deleteMutation = useDeleteExample();
  
  // Handle form submission to create a new example
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      { title: newTitle, description: newDescription },
      {
        onSuccess: () => {
          setNewTitle('');
          setNewDescription('');
        },
      }
    );
  };
  
  // Handle form submission to update an example
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    
    updateMutation.mutate(
      { title: newTitle, description: newDescription }
    );
  };
  
  // Handle deleting an example
  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        if (selectedId === id) {
          setSelectedId(null);
        }
      },
    });
  };
  
  // Handle selecting an example for editing
  const handleSelectExample = (id: string) => {
    setSelectedId(id);
    const example = examples?.find(ex => ex.id === id);
    if (example) {
      setNewTitle(example.title);
      setNewDescription(example.description);
    }
  };
  
  if (isLoading) return <div>Loading examples...</div>;
  if (error) return <div>Error loading examples: {(error as Error).message}</div>;
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Examples with TanStack Query</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            {selectedId ? 'Update Example' : 'Create New Example'}
          </h2>
          
          <form onSubmit={selectedId ? handleUpdate : handleCreate}>
            <div className="mb-4">
              <label className="block mb-1">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-1">Description</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
                required
              />
            </div>
            
            <div className="flex justify-between">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : selectedId
                  ? 'Update'
                  : 'Create'}
              </button>
              
              {selectedId && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(null);
                    setNewTitle('');
                    setNewDescription('');
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Examples List */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Examples</h2>
          
          {!examples?.length ? (
            <p>No examples found. Create your first one!</p>
          ) : (
            <ul className="divide-y">
              {examples.map((example) => (
                <li key={example.id} className="py-3">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{example.title}</h3>
                      <p className="text-sm text-gray-600">{example.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSelectExample(example.id)}
                        className="text-sm text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(example.id)}
                        className="text-sm text-red-500 hover:text-red-700"
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending && deleteMutation.variables === example.id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 