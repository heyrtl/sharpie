import React from 'react';

export default function Editor({ 
  systemPrompt, 
  setSystemPrompt, 
  userPrompt, 
  setUserPrompt,
  onRun,
  loading 
}) {
  const handleKeyDown = (e) => {
    // Cmd/Ctrl + Enter to run
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          System Prompt
        </label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="You are a helpful assistant..."
          className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          User Prompt
        </label>
        <textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your prompt here..."
          className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none"
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-500">
          Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to run
        </p>
      </div>

      <button
        onClick={onRun}
        disabled={loading || !userPrompt.trim()}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {loading ? 'Generating...' : 'Run Prompt'}
      </button>
    </div>
  );
}