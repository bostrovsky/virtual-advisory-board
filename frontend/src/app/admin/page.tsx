'use client';

import React, { useState, useEffect } from 'react';

interface Advisor {
  id: string;
  name: string;
  description: string;
  personality: string;
}

export default function AdminPanel() {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    personality: ''
  });

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const fetchAdvisors = async () => {
    try {
      const response = await fetch('/api/admin/advisors');
      const data = await response.json();
      setAdvisors(data.advisors);
    } catch (error) {
      console.error('Error fetching advisors:', error);
    }
  };

  const handleSelectAdvisor = async (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setFormData({
      id: advisor.id,
      name: advisor.name,
      description: advisor.description,
      personality: advisor.personality
    });
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setSelectedAdvisor(null);
    setFormData({
      id: '',
      name: '',
      description: '',
      personality: ''
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let response;
      if (isCreating) {
        response = await fetch('/api/admin/advisors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        response = await fetch(`/api/admin/advisors/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      if (response.ok) {
        await fetchAdvisors();
        setIsEditing(false);
        setIsCreating(false);
        if (isCreating) {
          setSelectedAdvisor(null);
        }
      }
    } catch (error) {
      console.error('Error saving advisor:', error);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedAdvisor || !confirm(`Are you sure you want to delete ${selectedAdvisor.name}?`)) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/advisors/${selectedAdvisor.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchAdvisors();
        setSelectedAdvisor(null);
      }
    } catch (error) {
      console.error('Error deleting advisor:', error);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
    if (selectedAdvisor) {
      setFormData({
        id: selectedAdvisor.id,
        name: selectedAdvisor.name,
        description: selectedAdvisor.description,
        personality: selectedAdvisor.personality
      });
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--tt-container)'}}>
      {/* Header */}
      <div className="bg-white shadow-sm" style={{borderBottom: '1px solid var(--tt-border-neutral)', padding: 'var(--tt-space-4) var(--tt-space-4) lg:var(--tt-space-6)'}}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 style={{fontSize: 'var(--tt-font-size-2xl)', fontWeight: 'var(--tt-font-weight-bold)', color: 'var(--tt-text-primary)'}} className="lg:text-3xl">
            Advisor Admin Panel
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a
              href="/"
              className="inline-flex items-center transition-all duration-200 focus:outline-none"
              style={{
                padding: '0.5rem 1rem',
                fontSize: 'var(--tt-font-size-sm)',
                fontWeight: 'var(--tt-font-weight-medium)',
                borderRadius: 'var(--tt-radius-md)',
                backgroundColor: 'white',
                color: 'var(--tt-text-primary)',
                border: '1px solid var(--tt-border-neutral)',
                textDecoration: 'none'
              }}
            >
              ← Back to Chat
            </a>
            <button
              onClick={handleCreate}
              className="inline-flex items-center transition-all duration-200 focus:outline-none"
              style={{
                padding: '0.5rem 1rem',
                fontSize: 'var(--tt-font-size-sm)',
                fontWeight: 'var(--tt-font-weight-medium)',
                borderRadius: 'var(--tt-radius-md)',
                backgroundColor: 'var(--tt-primary)',
                color: 'white',
                border: 'none'
              }}
            >
              + Add Advisor
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-full">
        {/* Sidebar - Advisor List */}
        <div className="w-full lg:w-1/3 bg-white shadow-sm lg:shadow-sm" style={{borderRight: '1px solid var(--tt-border-neutral)', borderBottom: '1px solid var(--tt-border-neutral)', padding: 'var(--tt-space-4)'}}>
          <h2 style={{fontSize: 'var(--tt-font-size-xl)', fontWeight: 'var(--tt-font-weight-semibold)', color: 'var(--tt-text-primary)', marginBottom: 'var(--tt-space-4)'}}>
            Current Advisors
          </h2>
          <div className="space-y-2">
            {advisors.map((advisor) => (
              <button
                key={advisor.id}
                onClick={() => handleSelectAdvisor(advisor)}
                className="w-full text-left p-3 rounded-lg transition-all duration-200 focus:outline-none"
                style={{
                  backgroundColor: selectedAdvisor?.id === advisor.id ? 'var(--tt-container)' : 'transparent',
                  border: selectedAdvisor?.id === advisor.id ? '1px solid var(--tt-border-focus)' : '1px solid var(--tt-border-neutral)'
                }}
              >
                <div style={{fontWeight: 'var(--tt-font-weight-medium)', color: 'var(--tt-text-primary)', marginBottom: 'var(--tt-space-1)'}}>
                  {advisor.name}
                </div>
                <div style={{fontSize: 'var(--tt-font-size-sm)', color: 'var(--tt-text-secondary)'}}>
                  {advisor.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content - Advisor Details/Editor */}
        <div className="flex-1" style={{padding: 'var(--tt-space-6)'}}>
          {(selectedAdvisor || isCreating) ? (
            <div className="bg-white rounded-lg shadow-sm" style={{padding: 'var(--tt-space-6)', border: '1px solid var(--tt-border-neutral)'}}>
              <div className="flex justify-between items-center mb-6">
                <h2 style={{fontSize: 'var(--tt-font-size-2xl)', fontWeight: 'var(--tt-font-weight-semibold)', color: 'var(--tt-text-primary)'}}>
                  {isCreating ? 'Create New Advisor' : (isEditing ? 'Edit Advisor' : 'Advisor Details')}
                </h2>
                {!isCreating && !isEditing && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleEdit}
                      className="inline-flex items-center transition-all duration-200 focus:outline-none"
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: 'var(--tt-font-size-sm)',
                        fontWeight: 'var(--tt-font-weight-medium)',
                        borderRadius: 'var(--tt-radius-md)',
                        backgroundColor: 'var(--tt-primary)',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="inline-flex items-center transition-all duration-200 focus:outline-none"
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: 'var(--tt-font-size-sm)',
                        fontWeight: 'var(--tt-font-weight-medium)',
                        borderRadius: 'var(--tt-radius-md)',
                        backgroundColor: 'var(--tt-error)',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label style={{fontSize: 'var(--tt-font-size-sm)', fontWeight: 'var(--tt-font-weight-medium)', color: 'var(--tt-text-secondary)', marginBottom: 'var(--tt-space-2)', display: 'block'}}>
                    Advisor ID
                  </label>
                  {(isEditing || isCreating) ? (
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData({...formData, id: e.target.value})}
                      disabled={!isCreating}
                      className="w-full transition-all duration-200 focus:outline-none"
                      style={{
                        border: '1px solid var(--tt-border-neutral)',
                        borderRadius: 'var(--tt-radius-md)',
                        padding: '0.625rem 0.75rem',
                        fontSize: 'var(--tt-font-size-md)',
                        backgroundColor: isCreating ? 'white' : 'var(--tt-container)'
                      }}
                    />
                  ) : (
                    <div style={{color: 'var(--tt-text-primary)'}}>{selectedAdvisor?.id}</div>
                  )}
                </div>

                <div>
                  <label style={{fontSize: 'var(--tt-font-size-sm)', fontWeight: 'var(--tt-font-weight-medium)', color: 'var(--tt-text-secondary)', marginBottom: 'var(--tt-space-2)', display: 'block'}}>
                    Name
                  </label>
                  {(isEditing || isCreating) ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full transition-all duration-200 focus:outline-none"
                      style={{
                        border: '1px solid var(--tt-border-neutral)',
                        borderRadius: 'var(--tt-radius-md)',
                        padding: '0.625rem 0.75rem',
                        fontSize: 'var(--tt-font-size-md)'
                      }}
                    />
                  ) : (
                    <div style={{color: 'var(--tt-text-primary)'}}>{selectedAdvisor?.name}</div>
                  )}
                </div>

                <div>
                  <label style={{fontSize: 'var(--tt-font-size-sm)', fontWeight: 'var(--tt-font-weight-medium)', color: 'var(--tt-text-secondary)', marginBottom: 'var(--tt-space-2)', display: 'block'}}>
                    Description
                  </label>
                  {(isEditing || isCreating) ? (
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={2}
                      className="w-full transition-all duration-200 focus:outline-none resize-none"
                      style={{
                        border: '1px solid var(--tt-border-neutral)',
                        borderRadius: 'var(--tt-radius-md)',
                        padding: '0.625rem 0.75rem',
                        fontSize: 'var(--tt-font-size-md)'
                      }}
                    />
                  ) : (
                    <div style={{color: 'var(--tt-text-primary)'}}>{selectedAdvisor?.description}</div>
                  )}
                </div>

                <div>
                  <label style={{fontSize: 'var(--tt-font-size-sm)', fontWeight: 'var(--tt-font-weight-medium)', color: 'var(--tt-text-secondary)', marginBottom: 'var(--tt-space-2)', display: 'block'}}>
                    Personality & Context
                  </label>
                  {(isEditing || isCreating) ? (
                    <textarea
                      value={formData.personality}
                      onChange={(e) => setFormData({...formData, personality: e.target.value})}
                      rows={15}
                      className="w-full transition-all duration-200 focus:outline-none resize-none"
                      style={{
                        border: '1px solid var(--tt-border-neutral)',
                        borderRadius: 'var(--tt-radius-md)',
                        padding: '0.625rem 0.75rem',
                        fontSize: 'var(--tt-font-size-sm)',
                        fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                      }}
                      placeholder="Enter the advisor's personality, knowledge base, communication style, and any other context that will help the AI embody this advisor..."
                    />
                  ) : (
                    <div
                      className="whitespace-pre-wrap"
                      style={{
                        color: 'var(--tt-text-primary)',
                        fontSize: 'var(--tt-font-size-sm)',
                        backgroundColor: 'var(--tt-container)',
                        padding: 'var(--tt-space-4)',
                        borderRadius: 'var(--tt-radius-md)',
                        fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        lineHeight: '1.6'
                      }}
                    >
                      {selectedAdvisor?.personality}
                    </div>
                  )}
                </div>

                {(isEditing || isCreating) && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="inline-flex items-center transition-all duration-200 focus:outline-none"
                      style={{
                        padding: '0.625rem 1.5rem',
                        fontSize: 'var(--tt-font-size-md)',
                        fontWeight: 'var(--tt-font-weight-medium)',
                        borderRadius: 'var(--tt-radius-md)',
                        backgroundColor: 'var(--tt-primary)',
                        color: 'white',
                        border: 'none',
                        opacity: loading ? '0.7' : '1'
                      }}
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center transition-all duration-200 focus:outline-none"
                      style={{
                        padding: '0.625rem 1.5rem',
                        fontSize: 'var(--tt-font-size-md)',
                        fontWeight: 'var(--tt-font-weight-medium)',
                        borderRadius: 'var(--tt-radius-md)',
                        backgroundColor: 'white',
                        color: 'var(--tt-text-primary)',
                        border: '1px solid var(--tt-border-neutral)'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center" style={{marginTop: 'var(--tt-space-10)'}}>
              <div style={{fontSize: '3rem', marginBottom: 'var(--tt-space-4)'}}>⚙️</div>
              <div style={{fontSize: 'var(--tt-font-size-xl)', fontWeight: 'var(--tt-font-weight-semibold)', color: 'var(--tt-text-primary)', marginBottom: 'var(--tt-space-2)'}}>
                Advisor Management
              </div>
              <div style={{color: 'var(--tt-text-secondary)'}}>
                Select an advisor from the left to view or edit their profile, or create a new advisor.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}