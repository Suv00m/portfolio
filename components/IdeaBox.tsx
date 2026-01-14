"use client";

import { useState } from 'react';

interface IdeaBoxProps {
  onInsertTitle?: (title: string) => void;
  onInsertContent?: (content: string) => void;
}

export default function IdeaBox({ onInsertTitle, onInsertContent }: IdeaBoxProps) {
  const [activeTab, setActiveTab] = useState<'ideas' | 'assist'>('ideas');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [assistContent, setAssistContent] = useState('');
  const [assistResult, setAssistResult] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [assistAction, setAssistAction] = useState<'expand' | 'improve' | 'summarize' | 'fix-grammar'>('improve');

  const generateIdeas = async () => {
    setIsGeneratingIdeas(true);
    try {
      const response = await fetch('/api/ai/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const data = await response.json();
        setIdeas(data.ideas || []);
      } else {
        const error = await response.json();
        alert('Failed to generate ideas: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      alert('Failed to generate ideas');
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleAssist = async () => {
    if (!assistContent.trim()) {
      alert('Please enter some content to process');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: assistContent,
          action: assistAction,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAssistResult(data.result || '');
      } else {
        const error = await response.json();
        alert('Failed to process content: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error processing content:', error);
      alert('Failed to process content');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-md border border-gray-300 rounded-lg bg-white">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('ideas')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'ideas'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Ideas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assist')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'assist'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Writing Assistant
        </button>
      </div>

      {/* Ideas Tab */}
      {activeTab === 'ideas' && (
        <div className="p-4 space-y-4">
          <button
            type="button"
            onClick={generateIdeas}
            disabled={isGeneratingIdeas}
            className="w-full px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingIdeas ? 'Generating Ideas...' : 'Generate Blog Post Ideas'}
          </button>

          {ideas.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Suggested Ideas:</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {ideas.map((idea, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer"
                    onClick={() => onInsertTitle?.(idea)}
                  >
                    <p className="text-sm text-gray-800">{idea}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInsertTitle?.(idea);
                      }}
                      className="mt-2 text-xs text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Use as title →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ideas.length === 0 && !isGeneratingIdeas && (
            <p className="text-sm text-gray-500 text-center py-4">
              Click &quot;Generate Blog Post Ideas&quot; to get AI-powered suggestions
            </p>
          )}
        </div>
      )}

      {/* Writing Assistant Tab */}
      {activeTab === 'assist' && (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action
            </label>
            <select
              value={assistAction}
              onChange={(e) => setAssistAction(e.target.value as typeof assistAction)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="expand">Expand</option>
              <option value="improve">Improve</option>
              <option value="summarize">Summarize</option>
              <option value="fix-grammar">Fix Grammar</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content to Process
            </label>
            <textarea
              value={assistContent}
              onChange={(e) => setAssistContent(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
              placeholder="Paste your content here..."
            />
          </div>

          <button
            type="button"
            onClick={handleAssist}
            disabled={isProcessing || !assistContent.trim()}
            className="w-full px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : `Apply ${assistAction.charAt(0).toUpperCase() + assistAction.slice(1)}`}
          </button>

          {assistResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Result:</h3>
                <button
                  type="button"
                  onClick={() => {
                    setAssistContent(assistResult);
                    setAssistResult('');
                  }}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                >
                  Replace content
                </button>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{assistResult}</p>
              </div>
              <button
                type="button"
                onClick={() => onInsertContent?.(assistResult)}
                className="w-full px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Insert into Editor
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
