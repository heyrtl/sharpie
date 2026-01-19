import React, { useState, useEffect } from 'react';
import Editor from './components/Editor';
import Response from './components/Response';
import Settings from './components/Settings';
import { generateStream, savePrompt, getPrompt, forkPrompt } from './utils/api';

function App() {
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');
  const [userPrompt, setUserPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [model, setModel] = useState('qwen2.5:3b');
  const [showSettings, setShowSettings] = useState(false);
  const [currentPromptId, setCurrentPromptId] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if loading shared prompt from URL
    const params = new URLSearchParams(window.location.search);
    const promptId = params.get('p');
    
    if (promptId) {
      loadSharedPrompt(promptId);
    }
  }, []);

  const loadSharedPrompt = async (promptId) => {
    try {
      const data = await getPrompt(promptId);
      setSystemPrompt(data.system_prompt);
      setUserPrompt(data.user_prompt);
      setModel(data.model);
      if (data.response) {
        setResponse(data.response);
      }
      setCurrentPromptId(promptId);
    } catch (err) {
      console.error('Failed to load prompt:', err);
      setError('Failed to load shared prompt');
    }
  };

  const handleRun = async () => {
    if (!userPrompt.trim()) return;

    setLoading(true);
    setError(null);
    setResponse('');

    let fullResponse = '';

    await generateStream(
      systemPrompt,
      userPrompt,
      model,
      (chunk) => {
        fullResponse += chunk;
        setResponse(fullResponse);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    setLoading(false);
  };

  const handleShare = async () => {
    try {
      const data = await savePrompt(systemPrompt, userPrompt, model, response);
      const url = `${window.location.origin}${window.location.pathname}?p=${data.id}`;
      
      setShareUrl(url);
      setCurrentPromptId(data.id);
      
      // Update URL without reload
      window.history.pushState({}, '', `?p=${data.id}`);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to share:', err);
      setError('Failed to create share link');
    }
  };

  const handleFork = async () => {
    if (!currentPromptId) {
      // If no current prompt, just clear and start fresh
      setResponse('');
      setCurrentPromptId(null);
      window.history.pushState({}, '', window.location.pathname);
      return;
    }

    try {
      const data = await forkPrompt(currentPromptId, systemPrompt, userPrompt, model);
      const url = `${window.location.origin}${window.location.pathname}?p=${data.id}`;
      
      setCurrentPromptId(data.id);
      setResponse('');
      
      window.history.pushState({}, '', `?p=${data.id}`);
      
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to fork:', err);
      setError('Failed to fork prompt');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sharpie</h1>
            <p className="text-sm text-gray-500">Self-hostable AI prompt playground</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleFork}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Fork
            </button>
            <button
              onClick={handleShare}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {copied ? '✓ Copied!' : 'Share'}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Editor */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Editor
              systemPrompt={systemPrompt}
              setSystemPrompt={setSystemPrompt}
              userPrompt={userPrompt}
              setUserPrompt={setUserPrompt}
              onRun={handleRun}
              loading={loading}
            />
          </div>

          {/* Right: Response */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-[600px]">
            <Response
              response={response}
              loading={loading}
              error={error}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Built by{' '}
            <a
              href="https://twitter.com/heyrtl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              @heyrtl
            </a>
            {' • '}
            <a
              href="https://github.com/heyrtl/sharpie"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Open Source
            </a>
          </p>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <Settings
          model={model}
          setModel={setModel}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;