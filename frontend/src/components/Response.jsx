import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'highlight.js/styles/github-dark.css';

export default function Response({ response, loading, error }) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('rendered'); // 'rendered' or 'raw'

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
        <div className="flex items-center gap-2">
          {response && !loading && (
            <>
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('rendered')}
                  className={`px-2 py-1 text-xs transition-colors ${
                    viewMode === 'rendered'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Rendered
                </button>
                <button
                  onClick={() => setViewMode('raw')}
                  className={`px-2 py-1 text-xs transition-colors ${
                    viewMode === 'raw'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Raw
                </button>
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 border border-gray-300 rounded-md p-4 bg-white overflow-y-auto scrollbar-thin">
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
          viewMode === 'rendered' ? (
            <div className="prose prose-sm max-w-none prose-pre:bg-gray-900 prose-pre:text-gray-100">
              <ReactMarkdown
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    return inline ? (
                      <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {response}
              </ReactMarkdown>
            </div>
          ) : (
            <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap break-words">
              {response}
            </pre>
          )
        ) : (
          <div className="text-gray-400 text-sm">
            Run a prompt to see the response here
          </div>
        )}
      </div>
    </div>
  );
}