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
}

const TEXT_COLORS = ['#111827', '#6472EB', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#EC4899']

function parseContent(content: string): JSONContent | string {
  if (!content.trim()) return ''

  try {
    return JSON.parse(content) as JSONContent
  } catch {
    return `<p>${content}</p>`
  }
}

export default function TextPage({ page, onChange }: TextPageProps) {
  const editor = useEditor({
    extensions: [StarterKit, TextStyle, Color, Underline],
    content: parseContent(page.content),
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange({ content: JSON.stringify(editor.getJSON()) })
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[520px] cursor-text-dark outline-none text-[15px] leading-7 text-gray-800 caret-gray-900 prose-editor',
      },
    },
  })

  return (
    <PageContainer size="wide">
      <div className="sticky top-0 z-10 mb-6 flex w-fit max-w-[680px] flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-white/90 p-1.5 shadow-sm backdrop-blur">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition-colors hover:bg-gray-100 ${
            editor?.isActive('heading', { level: 1 }) ? 'bg-gray-100 text-gray-900' : 'text-gray-500'
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition-colors hover:bg-gray-100 ${
            editor?.isActive('heading', { level: 2 }) ? 'bg-gray-100 text-gray-900' : 'text-gray-500'
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition-colors hover:bg-gray-100 ${
            editor?.isActive('heading', { level: 3 }) ? 'bg-gray-100 text-gray-900' : 'text-gray-500'
          }`}
        >
          H3
        </button>
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100 ${
            editor?.isActive('bold') ? 'bg-gray-100 text-gray-900' : 'text-gray-500'
          }`}
          title="Negrita"
        >
          <BoldIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 rounded-md text-[14px] italic transition-colors hover:bg-gray-100 ${
            editor?.isActive('italic') ? 'bg-gray-100 text-gray-900' : 'text-gray-500'
          }`}
          title="Cursiva"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100 ${
            editor?.isActive('underline') ? 'bg-gray-100 text-gray-900' : 'text-gray-500'
          }`}
          title="Subrayado"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100 ${
            editor?.isActive('bulletList') ? 'bg-gray-100 text-gray-900' : 'text-gray-500'
          }`}
          title="Lista"
        >
          <ListBulletIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100 ${
            editor?.isActive('orderedList') ? 'bg-gray-100 text-gray-900' : 'text-gray-500'
          }`}
          title="Lista numerada"
        >
          <NumberedListIcon className="h-4 w-4" />
        </button>
        <div className="mx-1 h-5 w-px bg-gray-200" />
        <div className="flex items-center gap-1 px-1">
          {TEXT_COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => editor?.chain().focus().setColor(color).run()}
              className="h-5 w-5 rounded-full border border-gray-200 transition-transform hover:scale-105"
              style={{ background: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <input
        value={page.title}
        onChange={event => onChange({ title: event.target.value })}
        placeholder="Pagina sin titulo"
        className="cursor-text-dark mb-4 w-full border-none bg-transparent text-[34px] font-bold tracking-tight text-gray-900 caret-gray-900 outline-none placeholder:text-gray-300"
      />

      <EditorContent editor={editor} />
    </PageContainer>
  )
}
