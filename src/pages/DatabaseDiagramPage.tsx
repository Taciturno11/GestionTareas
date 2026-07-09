import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import {
  addEdge,
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEffect, useRef, useState } from 'react'

import { useTheme } from '@/theme/theme-context'
import type { WorkspacePage } from '@/types/workspace'

interface DatabaseDiagramPageProps {
  page: WorkspacePage
  onChange: (patch: Partial<WorkspacePage>) => void
  readOnly?: boolean
}

type TableField = {
  id: string
  name: string
  type: string
  primary?: boolean
}

type TableNodeData = Record<string, unknown> & {
  name: string
  fields: TableField[]
}

type DatabaseTableNode = Node<TableNodeData, 'table'>

type DiagramContent = {
  nodes: DatabaseTableNode[]
  edges: Edge[]
}

const DEFAULT_CONTENT: DiagramContent = {
  nodes: [
    {
      id: 'users',
      type: 'table',
      position: { x: 120, y: 120 },
      data: {
        name: 'users',
        fields: [
          { id: 'id', name: 'id', type: 'uuid', primary: true },
          { id: 'email', name: 'email', type: 'varchar' },
        ],
      },
    },
    {
      id: 'tasks',
      type: 'table',
      position: { x: 440, y: 160 },
      data: {
        name: 'tasks',
        fields: [
          { id: 'id', name: 'id', type: 'uuid', primary: true },
          { id: 'user_id', name: 'user_id', type: 'uuid' },
        ],
      },
    },
  ],
  edges: [
    {
      id: 'users-tasks',
      source: 'users',
      target: 'tasks',
      label: '1:N',
      markerEnd: { type: MarkerType.ArrowClosed },
    },
  ],
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

function parseDiagramContent(content: string): DiagramContent {
  if (!content.trim()) return DEFAULT_CONTENT

  try {
    const parsed = JSON.parse(content) as Partial<DiagramContent>
    return {
      nodes: parsed.nodes?.length ? parsed.nodes : DEFAULT_CONTENT.nodes,
      edges: parsed.edges ?? [],
    }
  } catch {
    return DEFAULT_CONTENT
  }
}

function TableNode({ data, selected }: NodeProps<DatabaseTableNode>) {
  return (
    <div
      className={`min-w-[220px] overflow-hidden rounded-lg border bg-white text-left shadow-sm ${
        selected ? 'border-[#6472EB] ring-2 ring-[#6472EB]/15' : 'border-gray-200'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !bg-gray-400" />
      <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-[13px] font-semibold text-gray-900">
        {data.name}
      </div>
      <div className="divide-y divide-gray-100">
        {data.fields.map(field => (
          <div key={field.id} className="flex items-center justify-between gap-3 px-3 py-1.5 text-[12px]">
            <span className="min-w-0 truncate text-gray-700">
              {field.primary ? 'PK ' : ''}
              {field.name}
            </span>
            <span className="shrink-0 text-gray-400">{field.type}</span>
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !bg-gray-400" />
    </div>
  )
}

const nodeTypes = {
  table: TableNode,
}

export default function DatabaseDiagramPage({ page, onChange, readOnly = false }: DatabaseDiagramPageProps) {
  const { resolvedTheme } = useTheme()
  const [initialContent] = useState(() => parseDiagramContent(page.content))
  const onChangeRef = useRef(onChange)
  const hasMountedRef = useRef(false)
  const [nodes, setNodes, onNodesChange] = useNodesState<DatabaseTableNode>(initialContent.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialContent.edges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialContent.nodes[0]?.id ?? null)

  const selectedNode = nodes.find(node => node.id === selectedNodeId) ?? null

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }
    if (!readOnly) onChangeRef.current({ content: JSON.stringify({ nodes, edges }) })
  }, [edges, nodes, readOnly])

  function handleConnect(connection: Connection) {
    setEdges(currentEdges => addEdge({
      ...connection,
      id: createId('rel'),
      label: '1:N',
      markerEnd: { type: MarkerType.ArrowClosed },
    }, currentEdges))
  }

  function addTable() {
    const id = createId('table')
    const node: DatabaseTableNode = {
      id,
      type: 'table',
      position: { x: 180 + nodes.length * 36, y: 140 + nodes.length * 28 },
      data: {
        name: 'nueva_tabla',
        fields: [
          { id: createId('field'), name: 'id', type: 'uuid', primary: true },
        ],
      },
    }

    setNodes(currentNodes => [...currentNodes, node])
    setSelectedNodeId(id)
  }

  function updateSelectedTable(patch: Partial<TableNodeData>) {
    if (!selectedNode) return
    setNodes(currentNodes => currentNodes.map(node =>
      node.id === selectedNode.id
        ? { ...node, data: { ...node.data, ...patch } }
        : node
    ))
  }

  function addField() {
    if (!selectedNode) return
    updateSelectedTable({
      fields: [
        ...selectedNode.data.fields,
        { id: createId('field'), name: 'nuevo_campo', type: 'varchar' },
      ],
    })
  }

  function updateField(fieldId: string, patch: Partial<TableField>) {
    if (!selectedNode) return
    updateSelectedTable({
      fields: selectedNode.data.fields.map(field =>
        field.id === fieldId ? { ...field, ...patch } : field
      ),
    })
  }

  function deleteField(fieldId: string) {
    if (!selectedNode) return
    updateSelectedTable({
      fields: selectedNode.data.fields.filter(field => field.id !== fieldId),
    })
  }

  function deleteSelectedTable() {
    if (!selectedNode) return
    setNodes(currentNodes => currentNodes.filter(node => node.id !== selectedNode.id))
    setEdges(currentEdges => currentEdges.filter(edge =>
      edge.source !== selectedNode.id && edge.target !== selectedNode.id
    ))
    setSelectedNodeId(null)
  }

  return (
    <div className="flex h-full min-h-0 bg-white">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4">
          {!readOnly && <button
            type="button"
            onClick={addTable}
            className="flex h-8 items-center gap-2 rounded-md bg-[#6472EB] px-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#5360D8]"
          >
            <PlusIcon className="h-4 w-4" />
            Tabla
          </button>}
          <span className="text-[12px] text-gray-400">
            Conecta tablas arrastrando desde el punto derecho al izquierdo.
          </span>
        </div>

        <div className="min-h-0 flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={readOnly ? undefined : handleConnect}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            nodesDraggable={!readOnly}
            nodesConnectable={!readOnly}
            elementsSelectable
            fitView
            colorMode={resolvedTheme}
            defaultEdgeOptions={{
              style: { stroke: resolvedTheme === 'dark' ? '#7E8794' : '#94A3B8' },
              labelStyle: { fill: resolvedTheme === 'dark' ? '#C1C7D0' : '#475569' },
            }}
          >
            <Background
              color={resolvedTheme === 'dark' ? '#3D3D3D' : '#CBD5E1'}
              bgColor={resolvedTheme === 'dark' ? '#151515' : '#FFFFFF'}
            />
            <Controls
              style={{
                background: 'var(--surface-popover)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-card)',
              }}
            />
            <MiniMap
              pannable
              zoomable
              maskColor={resolvedTheme === 'dark' ? 'rgb(15 17 21 / 70%)' : 'rgb(248 250 252 / 70%)'}
              nodeColor={resolvedTheme === 'dark' ? '#38414D' : '#CBD5E1'}
              style={{
                background: 'var(--surface-popover)',
                border: '1px solid var(--border)',
              }}
            />
          </ReactFlow>
        </div>
      </div>

      <aside className="w-[320px] shrink-0 border-l border-gray-200 bg-gray-50 p-4">
        {selectedNode ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-gray-900">Tabla</h2>
              {!readOnly && <button
                type="button"
                onClick={deleteSelectedTable}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600"
                title="Borrar tabla"
              >
                <TrashIcon className="h-4 w-4" />
              </button>}
            </div>

            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Nombre
            </label>
            <input
              value={selectedNode.data.name}
              readOnly={readOnly}
              onChange={event => {
                if (!readOnly) updateSelectedTable({ name: event.target.value })
              }}
              className="cursor-text-dark mb-4 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-[13px] text-gray-800 caret-gray-900 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-200/60"
            />

            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">Campos</h3>
              {!readOnly && <button
                type="button"
                onClick={addField}
                className="rounded-md px-2 py-1 text-[12px] font-medium text-[#6472EB] hover:bg-[#6472EB]/10"
              >
                Agregar
              </button>}
            </div>

            <div className="space-y-2">
              {selectedNode.data.fields.map(field => (
                <div key={field.id} className="rounded-lg border border-gray-200 bg-white p-2">
                  <div className="mb-2 flex items-center gap-2">
                    <input
                      value={field.name}
                      readOnly={readOnly}
                      onChange={event => {
                        if (!readOnly) updateField(field.id, { name: event.target.value })
                      }}
                      className="cursor-text-dark h-8 min-w-0 flex-1 rounded-md border border-gray-200 px-2 text-[12px] text-gray-800 caret-gray-900 outline-none"
                    />
                    {!readOnly && <button
                      type="button"
                      onClick={() => deleteField(field.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={field.type}
                      readOnly={readOnly}
                      onChange={event => {
                        if (!readOnly) updateField(field.id, { type: event.target.value })
                      }}
                      className="cursor-text-dark h-8 min-w-0 flex-1 rounded-md border border-gray-200 px-2 text-[12px] text-gray-800 caret-gray-900 outline-none"
                    />
                    <label className="flex items-center gap-1.5 text-[12px] text-gray-500">
                      <input
                        type="checkbox"
                        checked={Boolean(field.primary)}
                        disabled={readOnly}
                        onChange={event => {
                          if (!readOnly) updateField(field.id, { primary: event.target.checked })
                        }}
                      />
                      PK
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-[13px] leading-5 text-gray-400">
            Selecciona una tabla para editar sus campos.
          </div>
        )}
      </aside>
    </div>
  )
}
