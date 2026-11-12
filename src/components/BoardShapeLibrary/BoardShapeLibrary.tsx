import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { useEditor, type VecLike } from 'tldraw'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

import { BOARD_FIGURES, figureToDataUrl, type BoardFigure } from './boardFigures'

const DRAG_THRESHOLD_PX = 4

interface PointerStart {
  figure: BoardFigure
  x: number
  y: number
  moved: boolean
}

interface DragPreview {
  figure: BoardFigure
  x: number
  y: number
}

export default function BoardShapeLibrary() {
  const editor = useEditor()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null)
  const pointerStartRef = useRef<PointerStart | null>(null)

  function insertFigure(figure: BoardFigure, screenPoint?: VecLike) {
    const point = screenPoint ? editor.screenToPage(screenPoint) : editor.getViewportPageBounds().center
    void editor.putExternalContent({ type: 'svg-text', text: figure.svg, point })
  }

  function isOverCanvas(x: number, y: number) {
    const target = document.elementFromPoint(x, y)
    return Boolean(target?.closest('.tl-canvas') && editor.getContainer().contains(target))
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>, figure: BoardFigure) {
    if (event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    pointerStartRef.current = { figure, x: event.clientX, y: event.clientY, moved: false }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const start = pointerStartRef.current
    if (!start) return
    if (!start.moved && Math.hypot(event.clientX - start.x, event.clientY - start.y) < DRAG_THRESHOLD_PX) return
    start.moved = true
    setDragPreview({ figure: start.figure, x: event.clientX, y: event.clientY })
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLButtonElement>) {
    const start = pointerStartRef.current
    pointerStartRef.current = null
    setDragPreview(null)
    if (!start) return

    if (!start.moved) {
      insertFigure(start.figure)
    } else if (isOverCanvas(event.clientX, event.clientY)) {
      insertFigure(start.figure, { x: event.clientX, y: event.clientY })
    }
  }

  function handlePointerCancel() {
    pointerStartRef.current = null
    setDragPreview(null)
  }

  return (
    <div
      className="tlui-style-panel pointer-events-auto mx-2 mb-2 overflow-hidden rounded-[var(--tl-radius-3)] bg-[var(--tl-color-panel)] text-[var(--tl-color-text-1)] shadow-[var(--tl-shadow-2)]"
      onPointerDown={event => event.stopPropagation()}
    >
      <button
        type="button"
        className="flex h-9 w-full items-center justify-between px-3 text-[12px] font-semibold hover:bg-[var(--tl-color-muted-2)]"
        aria-expanded={!isCollapsed}
        onClick={() => setIsCollapsed(collapsed => !collapsed)}
      >
        Figuras
        <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
      </button>

      {!isCollapsed && (
        <div className="grid grid-cols-4 gap-0.5 border-t border-[var(--tl-color-divider)] p-1">
          {BOARD_FIGURES.map(figure => (
            <button
              key={figure.id}
              type="button"
              title={`${figure.label} (arrastra o haz clic)`}
              aria-label={`Insertar ${figure.label}`}
              className="flex h-8 w-8 cursor-grab touch-none items-center justify-center rounded-md hover:bg-[var(--tl-color-muted-2)] active:cursor-grabbing"
              onPointerDown={event => handlePointerDown(event, figure)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onClick={event => {
                // Solo teclado: el clic con puntero ya se resuelve en pointerup.
                if (event.detail === 0) insertFigure(figure)
              }}
            >
              <img src={figureToDataUrl(figure)} alt="" draggable={false} className="h-6 w-6" />
            </button>
          ))}
        </div>
      )}

      {dragPreview && createPortal(
        <img
          src={figureToDataUrl(dragPreview.figure)}
          alt=""
          className="pointer-events-none fixed z-[9999] h-16 w-16 -translate-x-1/2 -translate-y-1/2 opacity-80"
          style={{ left: dragPreview.x, top: dragPreview.y }}
        />,
        document.body,
      )}
    </div>
  )
}
