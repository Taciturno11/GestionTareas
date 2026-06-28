import { ArrowDownTrayIcon, DocumentArrowDownIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useLayoutEffect, useMemo, useRef } from 'react'

import PageContainer from '@/components/PageContainer/PageContainer'
import { DatePicker } from '@/components/ui/date-picker'
import { TimeInput } from '@/components/ui/time-input'
import type { WorkspacePage } from '@/types/workspace'

interface TimeReportPageProps {
  page: WorkspacePage
  onChange: (patch: Partial<WorkspacePage>) => void
  onSaveNow: () => Promise<void>
  readOnly?: boolean
}

interface TimeReportRow {
  id: string
  activity: string
  date: string
  startTime: string
  endTime: string
  observations: string
}

interface TimeReportContent {
  client: string
  service: string
  worker: string
  period: string
  hourlyRate: string
  rows: TimeReportRow[]
}

interface AutoResizeTextareaProps {
  value: string
  disabled?: boolean
  placeholder: string
  className: string
  onChange: (value: string) => void
  onBlur: () => void
}

const DEFAULT_CONTENT: TimeReportContent = {
  client: '',
  service: '',
  worker: '',
  period: '',
  hourlyRate: '',
  rows: [],
}

function createId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `row-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeContent(value: unknown): TimeReportContent {
  if (!value || typeof value !== 'object') return DEFAULT_CONTENT
  const candidate = value as Partial<TimeReportContent>

  return {
    client: typeof candidate.client === 'string' ? candidate.client : '',
    service: typeof candidate.service === 'string' ? candidate.service : '',
    worker: typeof candidate.worker === 'string' ? candidate.worker : '',
    period: typeof candidate.period === 'string' ? candidate.period : '',
    hourlyRate: typeof candidate.hourlyRate === 'string'
      ? candidate.hourlyRate
      : typeof candidate.hourlyRate === 'number'
        ? String(candidate.hourlyRate)
        : '',
    rows: Array.isArray(candidate.rows)
      ? candidate.rows.map(row => ({
          id: typeof row?.id === 'string' ? row.id : createId(),
          activity: typeof row?.activity === 'string' ? row.activity : '',
          date: typeof row?.date === 'string' ? row.date : '',
          startTime: typeof row?.startTime === 'string' ? row.startTime : '',
          endTime: typeof row?.endTime === 'string' ? row.endTime : '',
          observations: typeof row?.observations === 'string' ? row.observations : '',
        }))
      : [],
  }
}

function parseContent(content: string): TimeReportContent {
  if (!content.trim()) return DEFAULT_CONTENT

  try {
    return normalizeContent(JSON.parse(content))
  } catch {
    return DEFAULT_CONTENT
  }
}

function minutesFromTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

function getRowHours(row: TimeReportRow) {
  const start = minutesFromTime(row.startTime)
  const end = minutesFromTime(row.endTime)
  if (start == null || end == null || end <= start) return 0
  return (end - start) / 60
}

function formatDuration(hours: number) {
  const totalMinutes = Math.round(hours * 60)
  const durationHours = Math.floor(totalMinutes / 60)
  const durationMinutes = totalMinutes % 60

  if (durationHours && durationMinutes) return `${durationHours} h ${durationMinutes} min`
  if (durationHours) return `${durationHours} h`
  if (durationMinutes) return `${durationMinutes} min`
  return '0 min'
}

function parseAmount(value: string) {
  const normalized = value.replace(',', '.').trim()
  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function formatCurrency(amount: number) {
  return amount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatPdfText(value: string) {
  return value
    .replace(/\r\n?/g, '\n')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '-')
    .replace(/[→⇒]/g, '->')
    .replace(/[←⇐]/g, '<-')
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim()
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatExcelText(value: string) {
  return escapeHtml(value).replace(/\r?\n/g, '<br />')
}

function toSafeFilename(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function AutoResizeTextarea({
  value,
  disabled = false,
  placeholder,
  className,
  onChange,
  onBlur,
}: AutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [value])

  return (
    <textarea
      ref={textareaRef}
      rows={1}
      value={value}
      disabled={disabled}
      onChange={event => onChange(event.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      className={className}
    />
  )
}

export default function TimeReportPage({
  page,
  onChange,
  onSaveNow,
  readOnly = false,
}: TimeReportPageProps) {
  const report = useMemo(() => parseContent(page.content), [page.content])
  const totalHours = useMemo(
    () => report.rows.reduce((sum, row) => sum + getRowHours(row), 0),
    [report.rows],
  )
  const estimatedPrice = totalHours * parseAmount(report.hourlyRate)

  function updateReport(next: TimeReportContent) {
    if (readOnly) return
    onChange({ content: JSON.stringify(next) })
  }

  function updateField(field: keyof Omit<TimeReportContent, 'rows'>, value: string) {
    updateReport({ ...report, [field]: value })
  }

  function updateRow(rowId: string, patch: Partial<TimeReportRow>) {
    updateReport({
      ...report,
      rows: report.rows.map(row => row.id === rowId ? { ...row, ...patch } : row),
    })
  }

  function addRow() {
    updateReport({
      ...report,
      rows: [
        ...report.rows,
        {
          id: createId(),
          activity: '',
          date: '',
          startTime: '',
          endTime: '',
          observations: '',
        },
      ],
    })
  }

  function deleteRow(rowId: string) {
    updateReport({
      ...report,
      rows: report.rows.filter(row => row.id !== rowId),
    })
  }

  function buildExportHtml(generatedAt: string) {
    const rowsHtml = report.rows.length
      ? report.rows.map(row => `
          <tr>
            <td class="text-cell">${formatExcelText(row.activity)}</td>
            <td class="center-cell">${escapeHtml(row.date)}</td>
            <td class="center-cell">${escapeHtml(row.startTime)}</td>
            <td class="center-cell">${escapeHtml(row.endTime)}</td>
            <td class="center-cell total-cell">${formatDuration(getRowHours(row))}</td>
            <td class="text-cell">${formatExcelText(row.observations)}</td>
          </tr>
        `).join('')
      : `
          <tr>
            <td colspan="6" class="empty-cell">Sin actividades registradas</td>
          </tr>
        `

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>${escapeHtml(page.title || 'Reporte de horas')}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 12mm;
            }
            body {
              font-family: Arial, sans-serif;
              color: #111827;
              margin: 8px;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              table-layout: fixed;
            }
            .title {
              background: #6472EB;
              color: #ffffff;
              font-size: 20px;
              font-weight: 700;
              text-align: center;
              padding: 14px;
            }
            .meta-label {
              background: #F3F4F6;
              color: #6B7280;
              font-weight: 700;
            }
            .meta-value {
              background: #FFFFFF;
              font-weight: 600;
            }
            .generated {
              color: #6B7280;
              font-size: 11px;
              text-align: right;
            }
            th {
              background: #EEF2FF;
              color: #3730A3;
              font-weight: 700;
              text-align: center;
            }
            td,
            th {
              border: 1px solid #D1D5DB;
              padding: 8px;
              vertical-align: middle;
            }
            .text-cell {
              vertical-align: top;
              mso-data-placement: same-cell;
              white-space: normal;
            }
            .center-cell {
              text-align: center;
            }
            .total-cell {
              background: #F9FAFB;
              font-weight: 700;
            }
            .summary-label {
              background: #F3F4F6;
              color: #374151;
              font-weight: 700;
              text-align: right;
            }
            .summary-value {
              background: #FFFFFF;
              font-weight: 700;
              text-align: center;
            }
            .price-value {
              background: #ECFDF5;
              color: #047857;
              font-weight: 700;
              text-align: center;
            }
            .empty-cell {
              color: #6B7280;
              font-style: italic;
              text-align: center;
            }
            .print-note {
              margin-top: 10px;
              color: #6B7280;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <table>
            <tr>
              <td colspan="6" class="title">${escapeHtml(page.title || 'Reporte de horas')}</td>
            </tr>
            <tr>
              <td colspan="6" class="generated">Generado: ${escapeHtml(generatedAt)}</td>
            </tr>
            <tr>
              <td class="meta-label">Cliente</td>
              <td colspan="2" class="meta-value">${formatExcelText(report.client)}</td>
              <td class="meta-label">Servicio</td>
              <td colspan="2" class="meta-value">${formatExcelText(report.service)}</td>
            </tr>
            <tr>
              <td class="meta-label">Trabajador</td>
              <td class="meta-value">${formatExcelText(report.worker)}</td>
              <td class="meta-label">Periodo</td>
              <td class="meta-value">${formatExcelText(report.period)}</td>
              <td class="meta-label">Precio por hora</td>
              <td class="meta-value">S/ ${formatCurrency(parseAmount(report.hourlyRate))}</td>
            </tr>
            <tr><td colspan="6"></td></tr>
            <tr>
              <th>Actividad</th>
              <th>Fecha</th>
              <th>HI</th>
              <th>HF</th>
              <th>TH</th>
              <th>Observaciones</th>
            </tr>
            ${rowsHtml}
            <tr>
              <td colspan="4" class="summary-label">Total de horas</td>
              <td class="summary-value">${formatDuration(totalHours)}</td>
              <td></td>
            </tr>
            <tr>
              <td colspan="4" class="summary-label">Precio por hora</td>
              <td colspan="2" class="summary-value">S/ ${formatCurrency(parseAmount(report.hourlyRate))}</td>
            </tr>
            <tr>
              <td colspan="4" class="summary-label">Precio estimado</td>
              <td colspan="2" class="price-value">S/ ${formatCurrency(estimatedPrice)}</td>
            </tr>
          </table>
        </body>
      </html>
    `
  }

  function downloadExcel() {
    const generatedAt = new Date().toLocaleString('es-PE')
    const safeTitle = toSafeFilename(page.title || 'reporte-de-horas') || 'reporte-de-horas'
    const html = buildExportHtml(generatedAt)
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${safeTitle}.xls`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  async function generatePdf() {
    const generatedAt = new Date().toLocaleString('es-PE')
    const safeTitle = toSafeFilename(page.title || 'reporte-de-horas') || 'reporte-de-horas'
    const [{ jsPDF }, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ])
    const autoTable = autoTableModule.default
    const document = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageWidth = document.internal.pageSize.getWidth()
    const pageHeight = document.internal.pageSize.getHeight()
    const marginX = 12
    let cursorY = 12

    document.setFillColor(100, 114, 235)
    document.rect(marginX, cursorY, pageWidth - marginX * 2, 12, 'F')
    document.setTextColor(255, 255, 255)
    document.setFont('helvetica', 'bold')
    document.setFontSize(15)
    document.text(page.title || 'Reporte de horas', pageWidth / 2, cursorY + 8, { align: 'center' })

    cursorY += 16
    document.setTextColor(107, 114, 128)
    document.setFont('helvetica', 'normal')
    document.setFontSize(8)
    document.text(`Generado: ${generatedAt}`, pageWidth - marginX, cursorY, { align: 'right' })

    cursorY += 5
    autoTable(document, {
      startY: cursorY,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
        lineColor: [226, 232, 240],
        lineWidth: 0.15,
        valign: 'middle',
      },
      columnStyles: {
        0: { fillColor: [248, 250, 252], textColor: [100, 116, 139], fontStyle: 'bold', cellWidth: 30 },
        1: { fontStyle: 'bold', cellWidth: 106 },
        2: { fillColor: [248, 250, 252], textColor: [100, 116, 139], fontStyle: 'bold', cellWidth: 30 },
        3: { fontStyle: 'bold', cellWidth: 107 },
      },
      body: [
        ['Cliente', report.client, 'Servicio', report.service],
        ['Trabajador', report.worker, 'Periodo', report.period],
      ],
    })

    cursorY = (document as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? cursorY + 16
    cursorY += 7

    autoTable(document, {
      startY: cursorY,
      theme: 'grid',
      head: [['Actividad', 'Fecha', 'HI', 'HF', 'TH', 'Observaciones']],
      body: report.rows.length
        ? report.rows.map(row => [
            formatPdfText(row.activity),
            row.date,
            row.startTime,
            row.endTime,
            formatDuration(getRowHours(row)),
            formatPdfText(row.observations),
          ])
        : [['Sin actividades registradas', '', '', '', '', '']],
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 2.5,
        lineColor: [209, 213, 219],
        lineWidth: 0.2,
        overflow: 'linebreak',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [238, 242, 255],
        textColor: [55, 48, 163],
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 105, halign: 'left', valign: 'top' },
        1: { cellWidth: 21, halign: 'center' },
        2: { cellWidth: 16, halign: 'center' },
        3: { cellWidth: 16, halign: 'center' },
        4: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 95, halign: 'left', valign: 'top' },
      },
    })

    const tableEndY = (document as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? cursorY
    const summaryStartY = tableEndY + 7
    const summaryY = summaryStartY > pageHeight - 35 ? marginX : summaryStartY

    if (summaryStartY > pageHeight - 35) {
      document.addPage()
    }

    autoTable(document, {
      startY: summaryY,
      theme: 'grid',
      margin: { left: pageWidth - marginX - 88 },
      tableWidth: 88,
      body: [
        ['Total de horas', formatDuration(totalHours)],
        ['Precio por hora', `S/ ${formatCurrency(parseAmount(report.hourlyRate))}`],
        ['Precio estimado', `S/ ${formatCurrency(estimatedPrice)}`],
      ],
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 3,
        lineColor: [209, 213, 219],
        lineWidth: 0.2,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 45, fillColor: [249, 250, 251], textColor: [17, 24, 39] },
        1: { cellWidth: 43, halign: 'right', textColor: [17, 24, 39] },
      },
      didParseCell: hookData => {
        if (hookData.row.index === 2) {
          hookData.cell.styles.fillColor = [236, 253, 245]
          hookData.cell.styles.textColor = [4, 120, 87]
        }
      },
    })

    document.save(`${safeTitle}.pdf`)
  }

  const inputClass = 'cursor-text-dark h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-[14px] text-gray-800 caret-gray-900 outline-none transition placeholder:text-gray-300 focus:border-gray-300 focus:ring-4 focus:ring-gray-200/60 disabled:bg-gray-50 disabled:text-gray-500'
  const tableTextareaClass = 'cursor-text-dark min-h-10 w-full resize-none overflow-hidden rounded-lg border border-transparent bg-transparent px-2 py-2 text-[13px] leading-5 text-gray-700 caret-gray-900 outline-none transition placeholder:text-gray-300 hover:border-gray-200 focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-200/70 disabled:cursor-default disabled:text-gray-500'

  return (
    <PageContainer size="wide" className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <input
            value={page.title}
            readOnly={readOnly}
            onChange={event => {
              if (!readOnly) onChange({ title: event.target.value })
            }}
            onBlur={() => void onSaveNow()}
            placeholder="Reporte de horas sin titulo"
            className="cursor-text-dark w-full border-none bg-transparent text-[34px] font-bold tracking-tight text-gray-900 caret-gray-900 outline-none placeholder:text-gray-300"
          />
          <p className="mt-2 text-[13px] text-gray-500">
            Registra actividades, calcula horas trabajadas y estima el precio total del servicio.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadExcel}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-[13px] font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Descargar Excel
          </button>
          <button
            type="button"
            onClick={() => void generatePdf()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#6472EB] px-3 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#5360D8]"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            Generar PDF
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Cliente
            </span>
            <input
              value={report.client}
              disabled={readOnly}
              onChange={event => updateField('client', event.target.value)}
              onBlur={() => void onSaveNow()}
              placeholder="Nombre del cliente"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Servicio
            </span>
            <input
              value={report.service}
              disabled={readOnly}
              onChange={event => updateField('service', event.target.value)}
              onBlur={() => void onSaveNow()}
              placeholder="Servicio realizado"
              className={inputClass}
            />
          </label>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Trabajador
            </span>
            <input
              value={report.worker}
              disabled={readOnly}
              onChange={event => updateField('worker', event.target.value)}
              onBlur={() => void onSaveNow()}
              placeholder="Nombre del trabajador"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Periodo
            </span>
            <input
              value={report.period}
              disabled={readOnly}
              onChange={event => updateField('period', event.target.value)}
              onBlur={() => void onSaveNow()}
              placeholder="Ej. Junio 2026"
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Precio por hora
            </span>
            <input
              value={report.hourlyRate}
              disabled={readOnly}
              inputMode="decimal"
              onChange={event => updateField('hourlyRate', event.target.value)}
              onBlur={() => void onSaveNow()}
              placeholder="0.00"
              className={inputClass}
            />
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">Actividades</h2>
            <p className="mt-0.5 text-[12px] text-gray-400">
              TH se calcula automaticamente con HF - HI.
            </p>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={addRow}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#6472EB] px-3 text-[13px] font-semibold text-white transition hover:bg-[#5360D8]"
            >
              <PlusIcon className="h-4 w-4" />
              Agregar fila
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-left">
            <thead className="bg-gray-50 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              <tr>
                <th className="w-[29%] px-4 py-3">Actividad</th>
                <th className="w-[14%] px-2 py-3">Fecha</th>
                <th className="w-[9%] px-2 py-3">HI</th>
                <th className="w-[9%] px-2 py-3">HF</th>
                <th className="w-[8%] px-2 py-3">TH</th>
                <th className="w-[25%] px-2 py-3">Observaciones</th>
                {!readOnly && <th className="w-[6%] px-4 py-3 text-right">Acción</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {report.rows.map(row => (
                <tr key={row.id} className="text-[13px]">
                  <td className="px-4 py-2 align-top">
                    <AutoResizeTextarea
                      value={row.activity}
                      disabled={readOnly}
                      onChange={value => updateRow(row.id, { activity: value })}
                      onBlur={() => void onSaveNow()}
                      placeholder="Actividad realizada"
                      className={tableTextareaClass}
                    />
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <DatePicker
                      value={row.date}
                      disabled={readOnly}
                      onChange={value => {
                        updateRow(row.id, { date: value })
                        void onSaveNow()
                      }}
                      onBlur={() => void onSaveNow()}
                      placeholder="Fecha"
                      displayFormat="d MMM yyyy"
                      className="h-10 rounded-lg border-transparent bg-transparent px-2 text-[13px] hover:border-gray-200 focus-visible:border-gray-300 focus-visible:ring-2 focus-visible:ring-gray-200/70"
                    />
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <TimeInput
                      value={row.startTime}
                      disabled={readOnly}
                      onChange={value => updateRow(row.id, { startTime: value })}
                      onBlur={() => void onSaveNow()}
                      placeholder="HI"
                    />
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <TimeInput
                      value={row.endTime}
                      disabled={readOnly}
                      onChange={value => updateRow(row.id, { endTime: value })}
                      onBlur={() => void onSaveNow()}
                      placeholder="HF"
                    />
                  </td>
                  <td className="px-2 py-2 align-middle">
                    <div className="flex h-10 items-center rounded-lg bg-gray-50 px-2 text-[13px] font-semibold text-gray-700">
                      {formatDuration(getRowHours(row))}
                    </div>
                  </td>
                  <td className="px-2 py-2 align-top">
                    <AutoResizeTextarea
                      value={row.observations}
                      disabled={readOnly}
                      onChange={value => updateRow(row.id, { observations: value })}
                      onBlur={() => void onSaveNow()}
                      placeholder="Notas u observaciones"
                      className={tableTextareaClass}
                    />
                  </td>
                  {!readOnly && (
                    <td className="px-4 py-2 align-top">
                      <button
                        type="button"
                        onClick={() => deleteRow(row.id)}
                        className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                        title="Eliminar fila"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {!report.rows.length && (
                <tr>
                  <td colSpan={readOnly ? 6 : 7} className="px-4 py-10 text-center">
                    <p className="text-[13px] font-semibold text-gray-700">Aun no hay actividades</p>
                    <p className="mt-1 text-[12px] text-gray-400">
                      Agrega una fila para empezar a registrar horas.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="ml-auto grid w-full max-w-[780px] gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Total de horas</p>
          <p className="mt-2 text-[26px] font-bold text-gray-900">{formatDuration(totalHours)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Precio por hora</p>
          <p className="mt-2 text-[26px] font-bold text-gray-900">S/ {formatCurrency(parseAmount(report.hourlyRate))}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Precio estimado</p>
          <p className="mt-2 text-[26px] font-bold text-gray-900">S/ {formatCurrency(estimatedPrice)}</p>
        </div>
      </section>
    </PageContainer>
  )
}
