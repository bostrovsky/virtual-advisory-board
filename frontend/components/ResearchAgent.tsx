import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResearchRequest {
  id: string;
  query: string;
  original_context: string;
  advisor_suggestions: Array<{
    advisor: string;
    suggestion: string;
  }>;
  refined_query: string;
  status: 'proposed' | 'approved' | 'denied' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  approved_at?: string;
  completed_at?: string;
  results?: any;
  cost_estimate: number;
}

interface ResearchAgentProps {
  onClose: () => void;
  currentContext: string;
  advisorSuggestions: Array<{ advisor: string; suggestion: string }>;
}

export default function ResearchAgent({ onClose, currentContext, advisorSuggestions }: ResearchAgentProps) {
  const [researchQuery, setResearchQuery] = useState('');
  const [pendingRequests, setPendingRequests] = useState<ResearchRequest[]>([]);
  const [completedRequests, setCompletedRequests] = useState<ResearchRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'propose' | 'pending' | 'completed'>('propose');

  useEffect(() => {
    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/research/pending');
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data.pending || []);
        setCompletedRequests(data.completed || []);
      }
    } catch (error) {
      console.error('Failed to fetch research requests:', error);
    }
  };

  const proposeResearch = async () => {
    if (!researchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/research/propose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: researchQuery,
          context: currentContext,
          advisor_suggestions: advisorSuggestions
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResearchQuery('');
        setActiveTab('pending');
        await fetchPendingRequests();
      }
    } catch (error) {
      console.error('Failed to propose research:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (requestId: string, approved: boolean) => {
    try {
      const endpoint = approved ? 'approve' : 'deny';
      const response = await fetch(`/api/research/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId })
      });

      if (response.ok && approved) {
        // Trigger execution of approved research
        await fetch('/api/research/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ request_id: requestId })
        });
      }

      await fetchPendingRequests();
    } catch (error) {
      console.error('Failed to handle approval:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Research Agent</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('propose')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'propose'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Propose Research
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg transition-colors relative ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Pending Approval
            {pendingRequests.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Completed
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'propose' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Research Query
                </label>
                <textarea
                  value={researchQuery}
                  onChange={(e) => setResearchQuery(e.target.value)}
                  placeholder="What would you like to research?"
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {advisorSuggestions.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Advisor Suggestions</h3>
                  <div className="space-y-2">
                    {advisorSuggestions.map((suggestion, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="text-blue-400 font-medium">{suggestion.advisor}:</span>
                        <span className="text-gray-300 ml-2">{suggestion.suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={proposeResearch}
                disabled={isLoading || !researchQuery.trim()}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Proposing...' : 'Propose Research'}
              </button>
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No pending research requests
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <div key={request.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">Research Query</h3>
                        <p className="text-gray-300 text-sm">{request.query}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        Est. cost: ${request.cost_estimate?.toFixed(3)}
                      </span>
                    </div>

                    {request.refined_query && (
                      <div className="mb-3 p-3 bg-gray-700/50 rounded">
                        <h4 className="text-sm font-medium text-gray-300 mb-1">Refined Query</h4>
                        <p className="text-sm text-gray-400">{request.refined_query}</p>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproval(request.id, true)}
                        className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Approve & Execute
                      </button>
                      <button
                        onClick={() => handleApproval(request.id, false)}
                        className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Deny
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'completed' && (
            <div className="space-y-4">
              {completedRequests.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No completed research requests
                </div>
              ) : (
                completedRequests.map((request) => (
                  <div key={request.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-white font-medium">{request.query}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        request.status === 'completed'
                          ? 'bg-green-600/20 text-green-400'
                          : request.status === 'failed'
                          ? 'bg-red-600/20 text-red-400'
                          : 'bg-gray-600/20 text-gray-400'
                      }`}>
                        {request.status}
                      </span>
                    </div>

                    {request.results && (
                      <div className="mt-3 p-3 bg-gray-700/50 rounded">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                          {typeof request.results === 'string'
                            ? request.results
                            : JSON.stringify(request.results, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}