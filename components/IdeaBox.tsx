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
    <div className="w-full max-w-md border-3 border-[#0a0a0a] bg-white shadow-brutal">
      {/* Tabs */}
      <div className="flex border-b-3 border-[#0a0a0a]">
        <button
          type="button"
          onClick={() => setActiveTab('ideas')}
          className={`flex-1 px-4 py-3 font-display text-sm font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'ideas'
              ? 'bg-[#0a0a0a] text-white'
              : 'bg-[#f5f5f5] text-[#737373] hover:bg-[#e5e5e5]'
          }`}
        >
          Ideas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assist')}
          className={`flex-1 px-4 py-3 font-display text-sm font-bold uppercase tracking-wider border-l-3 border-[#0a0a0a] transition-colors ${
            activeTab === 'assist'
              ? 'bg-[#0a0a0a] text-white'
              : 'bg-[#f5f5f5] text-[#737373] hover:bg-[#e5e5e5]'
          }`}
        >
          Writing Assistant
        </button>
      </div>

      {/* Ideas Tab */}
      {activeTab === 'ideas' && (
        <div className="p-6 space-y-6">
          <button
            type="button"
            onClick={generateIdeas}
            disabled={isGeneratingIdeas}
            className="w-full px-4 py-3 bg-[#0066ff] text-white font-display text-sm font-bold uppercase tracking-wider border-3 border-[#0a0a0a] shadow-brutal hover:shadow-brutal-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingIdeas ? (
              <span className="flex items-center justify-center gap-2">
                <div className="loading-dot !w-2.5 !h-2.5 !bg-white" />
                <div className="loading-dot !w-2.5 !h-2.5 !bg-white" />
                <div className="loading-dot !w-2.5 !h-2.5 !bg-white" />
                GENERATING...
              </span>
            ) : (
              'Generate Blog Post Ideas'
            )}
          </button>

          {ideas.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider">Suggested Ideas:</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {ideas.map((idea, index) => (
                  <div
                    key={index}
                    className="p-4 border-3 border-[#0a0a0a] bg-[#f5f5f5] hover:bg-[#0066ff]/10 hover:border-[#0066ff] transition-colors cursor-pointer group"
                    onClick={() => onInsertTitle?.(idea)}
                  >
                    <p className="font-mono text-sm text-[#0a0a0a]">{idea}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onInsertTitle?.(idea);
                      }}
                      className="mt-3 font-display text-xs font-bold uppercase tracking-wider text-[#0066ff] group-hover:text-[#ff3d00] transition-colors"
                    >
                      Use as title &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ideas.length === 0 && !isGeneratingIdeas && (
            <p className="font-mono text-sm text-[#737373] text-center py-6">
              Click &quot;Generate Blog Post Ideas&quot; to get AI-powered suggestions
            </p>
          )}
        </div>
      )}

      {/* Writing Assistant Tab */}
      {activeTab === 'assist' && (
        <div className="p-6 space-y-6">
          <div>
            <label className="block font-display text-sm font-bold uppercase tracking-wider mb-2">
              Action
            </label>
            <select
              value={assistAction}
              onChange={(e) => setAssistAction(e.target.value as typeof assistAction)}
              className="w-full px-3 py-3 border-3 border-[#0a0a0a] font-mono text-sm bg-white focus:outline-none focus:shadow-brutal-accent"
            >
              <option value="expand">Expand</option>
              <option value="improve">Improve</option>
              <option value="summarize">Summarize</option>
              <option value="fix-grammar">Fix Grammar</option>
            </select>
          </div>

          <div>
            <label className="block font-display text-sm font-bold uppercase tracking-wider mb-2">
              Content to Process
            </label>
            <textarea
              value={assistContent}
              onChange={(e) => setAssistContent(e.target.value)}
              rows={6}
              className="w-full px-3 py-3 border-3 border-[#0a0a0a] font-mono text-sm focus:outline-none focus:shadow-brutal-accent resize-y"
              placeholder="Paste your content here..."
            />
          </div>

          <button
            type="button"
            onClick={handleAssist}
            disabled={isProcessing || !assistContent.trim()}
            className="w-full px-4 py-3 bg-[#ff3d00] text-white font-display text-sm font-bold uppercase tracking-wider border-3 border-[#0a0a0a] shadow-brutal hover:shadow-brutal-lg hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="loading-dot !w-2.5 !h-2.5 !bg-white" />
                <div className="loading-dot !w-2.5 !h-2.5 !bg-white" />
                <div className="loading-dot !w-2.5 !h-2.5 !bg-white" />
                PROCESSING...
              </span>
            ) : (
              `Apply ${assistAction.charAt(0).toUpperCase() + assistAction.slice(1)}`
            )}
          </button>

          {assistResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider">Result:</h3>
                <button
                  type="button"
                  onClick={() => {
                    setAssistContent(assistResult);
                    setAssistResult('');
                  }}
                  className="font-display text-xs font-bold uppercase tracking-wider text-[#0066ff] hover:text-[#ff3d00] transition-colors"
                >
                  Replace content
                </button>
              </div>
              <div className="p-4 border-3 border-[#0a0a0a] bg-[#f5f5f5] max-h-64 overflow-y-auto">
                <p className="font-mono text-sm text-[#0a0a0a] whitespace-pre-wrap">{assistResult}</p>
              </div>
              <button
                type="button"
                onClick={() => onInsertContent?.(assistResult)}
                className="w-full px-4 py-3 bg-[#0a0a0a] text-white font-display text-sm font-bold uppercase tracking-wider border-3 border-[#0a0a0a] hover:bg-[#333] transition-colors"
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
