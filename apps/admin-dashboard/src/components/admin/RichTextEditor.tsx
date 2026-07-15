'use client';

/**
 * RichTextEditor
 *
 * Wraps Tiptap for the blog admin page.
 * Outputs clean HTML stored directly in the `content TEXT` column.
 * No backend changes required — HTML is stored/retrieved as-is.
 *
 * Supported features:
 *   Headings (H1–H3), Paragraphs, Bold, Italic, Strike,
 *   Bullet list, Ordered list, Blockquote, Code, Code block,
 *   Horizontal rule, Tables (insert / add col / add row / delete),
 *   Images (URL prompt), Links (URL prompt), Undo, Redo
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, useCallback } from 'react';
import {
  Bold, Italic, Strikethrough, List, ListOrdered, Quote,
  Code, Minus, Table as TableIcon, ImageIcon, Link as LinkIcon,
  Undo2, Redo2, Heading1, Heading2, Heading3,
  PilcrowSquare, TableColumnsSplit, Rows3, Trash2,
} from 'lucide-react';
import styles from './RichTextEditor.module.css';

// ─── Types ─────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;          // HTML string from/to the DB
  onChange: (html: string) => void;
  hasError?: boolean;
  placeholder?: string;
}

// ─── Toolbar button helpers ────────────────────────────────────

interface ToolBtnProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolBtn({ onClick, active, disabled, title, children }: ToolBtnProps) {
  return (
    <button
      type="button"
      onMouseDown={e => {
        e.preventDefault(); // keep editor focus
        if (!disabled) onClick();
      }}
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      className={`${styles.toolBtn}${active ? ` ${styles.active}` : ''}`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className={styles.separator} aria-hidden />;
}

// ─── Component ─────────────────────────────────────────────────

export default function RichTextEditor({
  value,
  onChange,
  hasError,
  placeholder = 'Write the full blog post content here…',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        'data-testid': 'blog-content-editor',
        spellcheck: 'true',
      },
    },
    onUpdate: ({ editor }) => {
      // Empty doc → store '' so the backend validation (min 20 chars) fires correctly
      const html = editor.isEmpty ? '' : editor.getHTML();
      onChange(html);
    },
  });

  // Sync external value changes (e.g. when editing an existing post)
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? '' : editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
    // Only run when `value` prop itself changes from outside
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // ── Toolbar action helpers ──────────────────────────────────

  const promptLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter URL', prev ?? 'https://');
    if (url === null) return; // cancelled
    if (url.trim() === '') {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
    }
  }, [editor]);

  const promptImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter image URL', 'https://');
    if (url && url.trim()) {
      editor.chain().focus().setImage({ src: url.trim() }).run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  // ── Stats ──────────────────────────────────────────────────

  const wordCount = editor
    ? editor.storage.characterCount.words()
    : 0;
  const charCount = editor
    ? editor.storage.characterCount.characters()
    : 0;

  // ── Heading value for select ───────────────────────────────

  const activeHeading = editor?.isActive('heading', { level: 1 })
    ? '1'
    : editor?.isActive('heading', { level: 2 })
    ? '2'
    : editor?.isActive('heading', { level: 3 })
    ? '3'
    : '0';

  if (!editor) return null;

  return (
    <div className={`${styles.wrapper}${hasError ? ` ${styles.error}` : ''}`}>

      {/* ══ TOOLBAR ══════════════════════════════════════════ */}
      <div className={styles.toolbar} role="toolbar" aria-label="Rich text formatting toolbar">

        {/* Heading select */}
        <select
          className={styles.headingSelect}
          value={activeHeading}
          onChange={e => {
            const v = e.target.value;
            if (v === '0') editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: parseInt(v) as 1 | 2 | 3 }).run();
          }}
          title="Heading level"
          aria-label="Heading level"
        >
          <option value="0">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        <Sep />

        {/* Inline marks */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline code"
        >
          <Code size={14} />
        </ToolBtn>

        <Sep />

        {/* Lists */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <List size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered list"
        >
          <ListOrdered size={14} />
        </ToolBtn>

        <Sep />

        {/* Block elements */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          <Minus size={14} />
        </ToolBtn>

        <Sep />

        {/* Table */}
        <ToolBtn onClick={insertTable} title="Insert table" disabled={editor.isActive('table')}>
          <TableIcon size={14} />
        </ToolBtn>
        {editor.isActive('table') && (
          <>
            <ToolBtn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add column after">
              <TableColumnsSplit size={14} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().addRowAfter().run()} title="Add row after">
              <Rows3 size={14} />
            </ToolBtn>
            <ToolBtn onClick={() => editor.chain().focus().deleteTable().run()} title="Delete table">
              <Trash2 size={14} />
            </ToolBtn>
          </>
        )}

        <Sep />

        {/* Link & Image */}
        <ToolBtn onClick={promptLink} active={editor.isActive('link')} title="Insert / edit link">
          <LinkIcon size={14} />
        </ToolBtn>
        <ToolBtn onClick={promptImage} title="Insert image by URL">
          <ImageIcon size={14} />
        </ToolBtn>

        <Sep />

        {/* History */}
        <ToolBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={14} />
        </ToolBtn>
      </div>

      {/* ══ EDITOR CONTENT ═══════════════════════════════════ */}
      <div className={styles.editorScroll}>
        <EditorContent editor={editor} />
      </div>

      {/* ══ FOOTER: word/char count ═══════════════════════════ */}
      <div className={styles.footer}>
        <span>{wordCount.toLocaleString()} word{wordCount !== 1 ? 's' : ''}</span>
        <span>{charCount.toLocaleString()} character{charCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
