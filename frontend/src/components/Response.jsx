import React, { useState } from 'react';

export default function Response({ response, loading, error }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Response
        </label>
        {response && !loading && (
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        )}
      </div>

      <div className="flex-1 border border-gray-300 rounded-md p-3 bg-white overflow-y-auto scrollbar-thin">
        {error ? (
          <div className="text-red-600 font-mono text-sm">
            Error: {error}
          </div>
        ) : loading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-sm">Generating response...</span>
          </div>
        ) : response ? (
          <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap break-words">
            {response}
          </pre>
        ) : (
          <div className="text-gray-400 text-sm">
            Run a prompt to see the response here
          </div>
        )}
      </div>
    </div>
  );
}