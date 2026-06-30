import {
  BoldIcon,
  ListBulletIcon,
  NumberedListIcon,
  UnderlineIcon,
} from '@heroicons/react/24/outline'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { EditorContent, type JSONContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import PageContainer from '@/components/PageContainer/PageContainer'
import type { WorkspacePage } from '@/types/workspace'

interface TextPageProps {
  page: WorkspacePage
  onChange: (patch: Partial<WorkspacePage>) => void
  onSaveNow: () => Promise<void>
  readOnly?: boolean
}

const TEXT_COLORS = ['#111827', '#6472EB', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#EC4899']
type TextEditor = NonNullable<ReturnType<typeof useEditor>> | null

function parseContent(content: string): JSONContent | string {
  if (!content.trim()) return ''

  try {
    return JSON.parse(content) as JSONContent
  } catch {
    return `<p>${content}</p>`
  }
}

function toolbarButtonClass(active = false) {
  return `inline-flex h-8 shrink-0 items-center justify-center rounded-md px-2.5 text-[12px] font-semibold transition-colors hover:bg-gray-100 ${
    active ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500'
  }`
}

function iconButtonClass(active = false) {
  return `inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-gray-100 ${
    active ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500'
  }`
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px shrink-0 bg-gray-200" />
}

function TextEditorToolbar({ editor }: { editor: TextEditor }) {
  return (
    <div
      className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur"
      aria-label="Barra de herramientas de texto"
    >
      <div className="mx-auto flex h-11 max-w-[1400px] items-center overflow-x-auto px-4">
        <div className="flex min-w-max items-center gap-1">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            className={toolbarButtonClass(editor?.isActive('heading', { level: 1 }))}
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={toolbarButtonClass(editor?.isActive('heading', { level: 2 }))}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            className={toolbarButtonClass(editor?.isActive('heading', { level: 3 }))}
          >
            H3
          </button>

          <ToolbarDivider />

          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={iconButtonClass(editor?.isActive('bold'))}
            title="Negrita"
          >
            <BoldIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`${iconButtonClass(editor?.isActive('italic'))} text-[14px] italic`}
            title="Cursiva"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={iconButtonClass(editor?.isActive('underline'))}
            title="Subrayado"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>

          <ToolbarDivider />

          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={iconButtonClass(editor?.isActive('bulletList'))}
            title="Lista"
          >
            <ListBulletIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={iconButtonClass(editor?.isActive('orderedList'))}
            title="Lista numerada"
          >
            <NumberedListIcon className="h-4 w-4" />
          </button>

          <ToolbarDivider />

          <div className="flex items-center gap-1 px-1">
            {TEXT_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => editor?.chain().focus().setColor(color).run()}
                className="h-5 w-5 shrink-0 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-105"
                style={{ background: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TextPage({ page, onChange, onSaveNow, readOnly = false }: TextPageProps) {
  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, Underline],
    content: parseContent(page.content),
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (readOnly) return
      onChange({ content: JSON.stringify(editor.getJSON()) })
    },
    onBlur: () => {
      void onSaveNow()
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[520px] cursor-text-dark outline-none text-[15px] leading-7 text-gray-800 caret-gray-900 prose-editor',
      },
    },
  })

  return (
    <>
      {!readOnly && <TextEditorToolbar editor={editor} />}

      <PageContainer size="wide">
        <input
          value={page.title}
          readOnly={readOnly}
          onChange={event => {
            if (!readOnly) onChange({ title: event.target.value })
          }}
          onBlur={() => void onSaveNow()}
          placeholder="Pagina sin titulo"
          className="cursor-text-dark mb-4 w-full border-none bg-transparent text-[34px] font-bold tracking-tight text-gray-900 caret-gray-900 outline-none placeholder:text-gray-300"
        />

        <EditorContent editor={editor} />
      </PageContainer>
    </>
  )
}
