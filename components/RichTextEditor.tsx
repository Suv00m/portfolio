"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useEffect, useCallback, useRef } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
}: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerAutocomplete = useCallback(async (editorInstance: any) => {
    if (!isAIEnabled || isAILoading) return;

    // Clear existing timeout
    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
    }

    // Debounce autocomplete requests
    autocompleteTimeoutRef.current = setTimeout(async () => {
      const { from } = editorInstance.state.selection;
      const text = editorInstance.state.doc.textContent;
      
      if (text.length < 10) return; // Don't autocomplete for very short text

      setIsAILoading(true);
      try {
        const response = await fetch('/api/ai/autocomplete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            cursorPosition: from,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.suggestion) {
            setAiSuggestion(data.suggestion);
          }
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
      } finally {
        setIsAILoading(false);
      }
    }, 500); // 500ms debounce
  }, [isAIEnabled, isAILoading]);

  const editor = useEditor({
    immediatelyRender: false,
    parseOptions: {
      preserveWhitespace: 'full',
    },
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use the separate CodeBlock extension
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 rounded-lg p-4 font-mono text-sm my-4',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-600 hover:text-purple-800 underline',
        },
      }),
      TextStyle,
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-yellow-200 px-1 rounded',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      // Trigger autocomplete if enabled
      if (isAIEnabled && editor.state.selection.empty) {
        triggerAutocomplete(editor);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[300px] px-4 py-3',
      },
    },
  });

  const handleImageUpload = async (file: File) => {
    if (!file || !editor) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMsg = `Upload failed (${response.status})`;
        try {
          const json = JSON.parse(text);
          if (json.error) errorMsg = json.error;
        } catch {}
        alert('Failed to upload image: ' + errorMsg);
        return;
      }

      const result = await response.json();
      if (result.success) {
        editor.chain().focus().setImage({ src: result.url }).run();
      } else {
        alert('Failed to upload image: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const acceptSuggestion = useCallback(() => {
    if (!editor || !aiSuggestion) return;

    editor.chain().focus().insertContent(aiSuggestion + ' ').run();
    setAiSuggestion('');
  }, [editor, aiSuggestion]);

  const dismissSuggestion = useCallback(() => {
    setAiSuggestion('');
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (aiSuggestion) {
        if (event.key === 'Tab') {
          event.preventDefault();
          acceptSuggestion();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          dismissSuggestion();
        }
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('keydown', handleKeyDown as any);

    return () => {
      editorElement.removeEventListener('keydown', handleKeyDown as any);
    };
  }, [editor, aiSuggestion, acceptSuggestion, dismissSuggestion]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autocompleteTimeoutRef.current) {
        clearTimeout(autocompleteTimeoutRef.current);
      }
    };
  }, []);

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const setLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };


  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-2">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('bold')
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('italic')
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('highlight')
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Highlight"
        >
          <span className="bg-yellow-200 px-1">H</span>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Heading 3"
        >
          H3
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Numbered List"
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Quote"
        >
          &quot;
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Code */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('code')
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Inline Code"
        >
          {'</>'}
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('codeBlock')
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Code Block"
        >
          {'{ }'}
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* AI Autocomplete Toggle */}
        <button
          type="button"
          onClick={() => setIsAIEnabled(!isAIEnabled)}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            isAIEnabled
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title={isAIEnabled ? 'AI Autocomplete: On (Tab to accept, Esc to dismiss)' : 'AI Autocomplete: Off'}
        >
          {isAILoading ? '⏳' : '✨'}
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Link & Image */}
        <button
          type="button"
          onClick={setLink}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            editor.isActive('link')
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
          title="Add Link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={addImage}
          disabled={isUploading}
          className="px-3 py-1.5 rounded text-sm font-medium transition-colors bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          title="Upload Image"
        >
          {isUploading ? '⏳' : '🖼️'}
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="px-3 py-1.5 rounded text-sm font-medium transition-colors bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          title="Undo"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="px-3 py-1.5 rounded text-sm font-medium transition-colors bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          title="Redo"
        >
          ↷
        </button>
      </div>

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileInputChange}
        className="hidden"
      />

      {/* Editor Content */}
      <div className="relative">
        <EditorContent editor={editor} className="min-h-[300px] bg-white" />
        {/* AI Suggestion Overlay */}
        {aiSuggestion && isAIEnabled && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1">
              <span className="text-xs text-gray-500 mr-2">AI Suggestion:</span>
              <span className="text-sm text-gray-600 italic">{aiSuggestion}</span>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                type="button"
                onClick={acceptSuggestion}
                className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                title="Accept (Tab)"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={dismissSuggestion}
                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                title="Dismiss (Esc)"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
