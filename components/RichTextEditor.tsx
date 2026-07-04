"use client";

import { useEditor, EditorContent, Extension } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { useState, useEffect, useCallback, useRef } from 'react';
import MarkdownIt from 'markdown-it';
import {
  Highlighter, List, ListOrdered, Quote as QuoteIcon, Code, Braces,
  Sparkles, Wand2, Link as LinkIcon, ImagePlus, Undo2, Redo2,
} from 'lucide-react';
import IdeaBox, { AssistAction } from './IdeaBox';

const markdown = new MarkdownIt();

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    flashHighlight: {
      flashRange: (from: number, to: number) => ReturnType;
    };
  }
}

// Purely visual — a decoration never touches the document, so it can't leak
// into saved content and doesn't hijack the user's selection while it fades.
const flashHighlightKey = new PluginKey('flashHighlight');

const FlashHighlight = Extension.create({
  name: 'flashHighlight',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: flashHighlightKey,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, old) {
            const meta = tr.getMeta(flashHighlightKey);
            if (meta) {
              return DecorationSet.create(tr.doc, [
                Decoration.inline(meta.from, meta.to, { class: 'ai-flash' }),
              ]);
            }
            return old.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
  addCommands() {
    return {
      flashRange:
        (from: number, to: number) =>
        ({ tr, dispatch }: { tr: any; dispatch?: (tr: any) => void }) => {
          if (dispatch) tr.setMeta(flashHighlightKey, { from, to });
          return true;
        },
    } as any;
  },
});

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
}: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [showIdeaBox, setShowIdeaBox] = useState(false);
  const [assistingAction, setAssistingAction] = useState<AssistAction | null>(null);
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ideaBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showIdeaBox) return;
    const handleClick = (e: MouseEvent) => {
      if (ideaBoxRef.current && !ideaBoxRef.current.contains(e.target as Node)) {
        setShowIdeaBox(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowIdeaBox(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showIdeaBox]);

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
      FlashHighlight,
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

  const applyAssist = async (action: AssistAction) => {
    if (!editor || assistingAction) return;

    const { from, to, empty } = editor.state.selection;
    const range = empty ? { from: 0, to: editor.state.doc.content.size } : { from, to };
    const sourceText = editor.state.doc.textBetween(range.from, range.to, '\n\n');

    if (!sourceText.trim()) {
      alert('Add some content first');
      return;
    }

    setAssistingAction(action);
    // Locked so the range captured above can't drift out from under us while the request is in flight.
    editor.setEditable(false);
    try {
      const response = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: sourceText, action }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert('Failed to process content: ' + (data.error || 'Unknown error'));
        return;
      }

      const resultText = (data.result || '').trim();
      if (!resultText) return;

      // Markdown headings/lists/bold arrive as real markup here, parsed through the
      // editor's own HTML parser — not flattened into plain paragraphs.
      const html = markdown.render(resultText);
      const sizeBefore = editor.state.doc.content.size;
      editor.chain().focus().insertContentAt(range, html).run();
      const sizeAfter = editor.state.doc.content.size;
      const insertedSize = sizeAfter - sizeBefore + (range.to - range.from);
      const insertedTo = range.from + insertedSize;

      editor.chain()
        .setTextSelection(insertedTo)
        .flashRange(range.from, insertedTo)
        .run();
    } catch (error) {
      console.error('Writing assistant error:', error);
      alert('Failed to process content');
    } finally {
      editor.setEditable(true);
      setAssistingAction(null);
      setShowIdeaBox(false);
    }
  };

  if (!editor) {
    return null;
  }

  const tbBtn = (active: boolean, disabled = false): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.25rem 0.5rem",
    borderRadius: "3px",
    fontSize: "0.8125rem",
    fontWeight: "500",
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.35 : 1,
    background: active ? "var(--accent)" : "transparent",
    color: active ? "var(--bg)" : "var(--tx-2)",
    transition: "background 0.1s, color 0.1s",
    fontFamily: "var(--font-mono)",
  });

  const sep = (
    <div style={{ width: "1px", alignSelf: "stretch", background: "var(--border)", margin: "0 2px" }} />
  );

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden" }}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5"
           style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-subtle)" }}>
        <button type="button" title="Bold"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                style={tbBtn(editor.isActive("bold"), !editor.can().chain().focus().toggleBold().run())}>
          <strong>B</strong>
        </button>
        <button type="button" title="Italic"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                style={tbBtn(editor.isActive("italic"), !editor.can().chain().focus().toggleItalic().run())}>
          <em>I</em>
        </button>
        <button type="button" title="Highlight"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                style={tbBtn(editor.isActive("highlight"))}>
          <Highlighter size={15} strokeWidth={2} />
        </button>

        {sep}

        <button type="button" title="Heading 1"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                style={tbBtn(editor.isActive("heading", { level: 1 }))}>H1</button>
        <button type="button" title="Heading 2"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                style={tbBtn(editor.isActive("heading", { level: 2 }))}>H2</button>
        <button type="button" title="Heading 3"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                style={tbBtn(editor.isActive("heading", { level: 3 }))}>H3</button>

        {sep}

        <button type="button" title="Bullet list"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                style={tbBtn(editor.isActive("bulletList"))}>
          <List size={15} strokeWidth={2} />
        </button>
        <button type="button" title="Numbered list"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                style={tbBtn(editor.isActive("orderedList"))}>
          <ListOrdered size={15} strokeWidth={2} />
        </button>
        <button type="button" title="Quote"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                style={tbBtn(editor.isActive("blockquote"))}>
          <QuoteIcon size={15} strokeWidth={2} />
        </button>

        {sep}

        <button type="button" title="Inline code"
                onClick={() => editor.chain().focus().toggleCode().run()}
                disabled={!editor.can().chain().focus().toggleCode().run()}
                style={tbBtn(editor.isActive("code"), !editor.can().chain().focus().toggleCode().run())}>
          <Code size={15} strokeWidth={2} />
        </button>
        <button type="button" title="Code block"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                style={tbBtn(editor.isActive("codeBlock"))}>
          <Braces size={15} strokeWidth={2} />
        </button>

        {sep}

        <button type="button"
                title={isAIEnabled ? "AI autocomplete on (Tab=accept, Esc=dismiss)" : "AI autocomplete off"}
                onClick={() => setIsAIEnabled(!isAIEnabled)}
                style={tbBtn(isAIEnabled)}>
          {isAILoading ? "…" : <Sparkles size={15} strokeWidth={2} />}
        </button>

        <div ref={ideaBoxRef} style={{ position: "relative" }}>
          <button type="button" title="Writing assistant"
                  onClick={() => setShowIdeaBox((v) => !v)}
                  style={tbBtn(showIdeaBox)}>
            <Wand2 size={15} strokeWidth={2} />
          </button>
          {showIdeaBox && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              zIndex: 20,
              boxShadow: "0 8px 24px oklch(0% 0 0 / 0.35)",
              borderRadius: "6px",
            }}>
              <IdeaBox
                scope={editor.state.selection.empty ? "post" : "selection"}
                activeAction={assistingAction}
                onApply={applyAssist}
              />
            </div>
          )}
        </div>

        {sep}

        <button type="button" title="Add link"
                onClick={setLink}
                style={tbBtn(editor.isActive("link"))}>
          <LinkIcon size={15} strokeWidth={2} />
        </button>
        <button type="button" title="Upload image"
                onClick={addImage} disabled={isUploading}
                style={tbBtn(false, isUploading)}>
          {isUploading ? "…" : <ImagePlus size={15} strokeWidth={2} />}
        </button>

        {sep}

        <button type="button" title="Undo"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                style={tbBtn(false, !editor.can().chain().focus().undo().run())}>
          <Undo2 size={15} strokeWidth={2} />
        </button>
        <button type="button" title="Redo"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                style={tbBtn(false, !editor.can().chain().focus().redo().run())}>
          <Redo2 size={15} strokeWidth={2} />
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileInputChange} className="hidden" />

      {/* Editor area */}
      <div className="relative" style={{ background: "var(--bg-hover)" }}>
        <EditorContent
          editor={editor}
          style={{
            minHeight: "300px",
            color: "var(--tx-1)",
            opacity: assistingAction ? 0.6 : 1,
            transition: "opacity 0.15s ease-out",
          }}
        />
        {aiSuggestion && isAIEnabled && (
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2"
               style={{ background: "var(--bg-subtle)", borderTop: "1px solid var(--border)" }}>
            <div className="flex-1">
              <span className="text-xs mr-2" style={{ color: "var(--tx-3)" }}>Suggestion:</span>
              <span className="text-xs italic" style={{ color: "var(--tx-2)" }}>{aiSuggestion}</span>
            </div>
            <div className="flex gap-2 ml-4">
              <button type="button" onClick={acceptSuggestion} title="Accept (Tab)"
                      style={{ padding: "0.2rem 0.625rem", fontSize: "0.75rem", background: "var(--accent)", color: "var(--bg)", border: "none", borderRadius: "3px", cursor: "pointer" }}>
                Accept
              </button>
              <button type="button" onClick={dismissSuggestion} title="Dismiss (Esc)"
                      style={{ padding: "0.2rem 0.625rem", fontSize: "0.75rem", background: "var(--bg-hover)", color: "var(--tx-2)", border: "1px solid var(--border)", borderRadius: "3px", cursor: "pointer" }}>
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
