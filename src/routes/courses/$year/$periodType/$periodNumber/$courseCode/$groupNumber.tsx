import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react'
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  DownloadIcon,
  FileArchiveIcon,
  FileAudioIcon,
  FileCode2Icon,
  FileIcon,
  FileImageIcon,
  FileJsonIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileVideoIcon,
  FolderIcon,
  FolderOpenIcon,
  HistoryIcon,
  UserIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const courseTabs = [
  'Inicio',
  'Calendario',
  'Documentos',
  'Evaluaciones',
  'GAAP',
  'Evaluación docente',
] as const

type FileLeaf = { name: string; sizeBytes: number; modifiedAt: string }
type FileTreeItem = FileLeaf | { name: string; items: FileTreeItem[]; modifiedAt: string }

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  return `${value.toFixed(1)} ${units[unitIndex]}`
}

function formatModified(dateIso: string) {
  const d = new Date(dateIso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

function getTreeSize(item: FileTreeItem): number {
  if ('items' in item) {
    return item.items.reduce((acc, child) => acc + getTreeSize(child), 0)
  }
  return item.sizeBytes
}

function getFileIcon(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? ''

  if (['ts', 'tsx', 'js', 'jsx', 'py', 'java', 'go', 'rs'].includes(extension)) {
    return FileCode2Icon
  }
  if (extension === 'json') return FileJsonIcon
  if (['xls', 'xlsx', 'csv'].includes(extension)) return FileSpreadsheetIcon
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) return FileImageIcon
  if (['mp4', 'mov', 'mkv', 'avi'].includes(extension)) return FileVideoIcon
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) return FileAudioIcon
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return FileArchiveIcon
  if (['txt', 'pdf', 'doc', 'docx', 'md'].includes(extension)) return FileTextIcon
  return FileIcon
}

const documentsTree: FileTreeItem[] = [
  {
    name: 'Unidad 1',
    items: [
      {
        name: 'Semana 1',
        items: [
          { name: 'Guía del curso.pdf', sizeBytes: 24576, modifiedAt: '2026-01-10T09:20:00' },
          { name: 'Diapositivas semana 1.pdf', sizeBytes: 5767168, modifiedAt: '2026-01-12T11:45:00' },
          { name: 'Recursos.zip', sizeBytes: 14582784, modifiedAt: '2026-01-12T13:15:00' },
        ],
        modifiedAt: '2026-01-12T13:15:00',
      },
      {
        name: 'Lecturas',
        items: [
          { name: 'Lectura introductoria.pdf', sizeBytes: 1536000, modifiedAt: '2026-01-11T14:05:00' },
          { name: 'notas-clase.txt', sizeBytes: 945, modifiedAt: '2026-01-11T16:08:00' },
        ],
        modifiedAt: '2026-01-11T16:08:00',
      },
    ],
    modifiedAt: '2026-01-12T11:45:00',
  },
  {
    name: 'Unidad 2',
    items: [
      {
        name: 'Laboratorio',
        items: [
          { name: 'starter-template.ts', sizeBytes: 7168, modifiedAt: '2026-02-01T08:10:00' },
          { name: 'config.json', sizeBytes: 2048, modifiedAt: '2026-02-01T08:11:00' },
          { name: 'dataset.xlsx', sizeBytes: 2392064, modifiedAt: '2026-02-02T16:32:00' },
        ],
        modifiedAt: '2026-02-02T16:32:00',
      },
      {
        name: 'Multimedia',
        items: [
          { name: 'demo.mp4', sizeBytes: 2130706432, modifiedAt: '2026-02-03T09:05:00' },
          { name: 'captura.png', sizeBytes: 385024, modifiedAt: '2026-02-03T09:07:00' },
          { name: 'audio-explicacion.mp3', sizeBytes: 8388608, modifiedAt: '2026-02-03T09:15:00' },
        ],
        modifiedAt: '2026-02-03T09:15:00',
      },
      { name: 'Material de apoyo.pdf', sizeBytes: 843776, modifiedAt: '2026-02-03T10:20:00' },
      { name: 'Recursos adicionales.txt', sizeBytes: 890, modifiedAt: '2026-02-03T10:22:00' },
    ],
    modifiedAt: '2026-02-03T10:22:00',
  },
  {
    name: 'Entregables',
    items: [
      { name: 'Plantilla tarea 1.docx', sizeBytes: 67584, modifiedAt: '2026-02-14T13:40:00' },
      { name: 'Plantilla proyecto final.docx', sizeBytes: 112640, modifiedAt: '2026-02-18T17:05:00' },
    ],
    modifiedAt: '2026-02-18T17:05:00',
  },
]

const evaluationGroups = [
  {
    title: 'Exámenes',
    weight: 40,
    items: [
      {
        name: 'Examen parcial 1',
        score: { earned: 14.5, max: 20 },
        description: 'Evaluación teórica de los temas vistos en las semanas 1 a 4.',
        dueDate: '15/03/2026 23:45',
        rubric: true,
        allowLate: false,
        peoplePerGroup: 1,
        submission: {
          name: 'respuesta-parcial-1.pdf',
          submittedAt: '2026-03-15T21:10:22',
          isLink: false,
        },
        submissionHistory: [
          { name: 'borrador-parcial-1.pdf', submittedAt: '2026-03-15T20:45:14', isLink: false },
          { name: 'respuesta-parcial-1.pdf', submittedAt: '2026-03-15T21:10:22', isLink: false },
        ],
      },
      {
        name: 'Examen parcial 2',
        score: { earned: 16.2, max: 20 },
        description: 'Evaluación acumulativa de contenidos prácticos y conceptuales.',
        dueDate: '',
        rubric: true,
        allowLate: false,
        peoplePerGroup: 1,
        submission: {
          name: 'https://drive.example.com/examen-2',
          submittedAt: '2026-04-20T19:00:00',
          isLink: true,
        },
        submissionHistory: [
          { name: 'https://drive.example.com/examen-2-v1', submittedAt: '2026-04-20T18:25:30', isLink: true },
          { name: 'https://drive.example.com/examen-2', submittedAt: '2026-04-20T19:00:00', isLink: true },
        ],
      },
    ],
  },
  {
    title: 'Tareas',
    weight: 40,
    items: [
      {
        name: 'Tarea 1',
        score: { earned: 8.8, max: 12 },
        description: 'Resolver ejercicios de análisis y adjuntar evidencia en PDF.',
        dueDate: '10/03/2026 23:59',
        rubric: false,
        allowLate: true,
        peoplePerGroup: 2,
        members: ['Nombre 1', 'Nombre 2'],
        submission: null,
        submissionHistory: [],
        feedbackFiles: [
          { name: 'retroalimentacion_tarea_1_grupo_02.pdf' },
          { name: 'comentarios-detallados-tarea-1.txt' },
        ],
      },
      {
        name: 'Tarea 2',
        score: { earned: 11.4, max: 14 },
        description: 'Informe corto con resultados y conclusiones del laboratorio.',
        dueDate: '27/03/2026 23:59',
        rubric: true,
        allowLate: false,
        peoplePerGroup: 1,
        submission: {
          name: 'https://notion.so/tarea-2-entrega',
          submittedAt: '2026-03-27T23:10:41',
          isLink: true,
        },
        submissionHistory: [
          { name: 'https://notion.so/tarea-2-borrador', submittedAt: '2026-03-27T22:01:17', isLink: true },
          { name: 'https://notion.so/tarea-2-entrega', submittedAt: '2026-03-27T23:10:41', isLink: true },
        ],
      },
      {
        name: 'Tarea 3',
        score: { earned: 13.0, max: 14 },
        description: 'Implementación de mejora incremental con documentación técnica.',
        dueDate: '22/04/2026 23:59',
        rubric: false,
        allowLate: true,
        peoplePerGroup: 3,
        members: ['Nombre 1', 'Nombre 2', 'Nombre 3'],
        submission: {
          name: 'mejora-incremental.zip',
          submittedAt: '2026-04-22T23:05:50',
          isLink: false,
        },
        submissionHistory: [
          { name: 'mejora-incremental-v1.zip', submittedAt: '2026-04-22T21:33:12', isLink: false },
          { name: 'mejora-incremental.zip', submittedAt: '2026-04-22T23:05:50', isLink: false },
        ],
        feedbackFiles: [{ name: 'feedback_tarea3.zip' }],
      },
    ],
  },
  {
    title: 'Proyectos',
    weight: 20,
    items: [
      {
        name: 'Propuesta de proyecto',
        score: { earned: 9.5, max: 10 },
        description: 'Propuesta inicial con objetivos, alcance y cronograma.',
        dueDate: '05/04/2026 22:00',
        rubric: true,
        allowLate: false,
        peoplePerGroup: 2,
        members: ['Nombre 1', 'Nombre 2'],
        submission: {
          name: 'propuesta-proyecto.pdf',
          submittedAt: '2026-04-05T20:30:00',
          isLink: false,
        },
        submissionHistory: [
          { name: 'propuesta-proyecto-v1.pdf', submittedAt: '2026-04-05T18:11:05', isLink: false },
          { name: 'propuesta-proyecto.pdf', submittedAt: '2026-04-05T20:30:00', isLink: false },
        ],
      },
      {
        name: 'Proyecto final',
        score: { earned: 15.0, max: 10 },
        description: 'Entrega final del proyecto con informe y presentación.',
        dueDate: '30/05/2026 23:00',
        rubric: true,
        allowLate: false,
        peoplePerGroup: 2,
        members: ['Nombre 1', 'Nombre 2'],
        submission: {
          name: 'https://github.com/organizacion/proyecto-final',
          submittedAt: '2026-05-30T22:30:10',
          isLink: true,
        },
        submissionHistory: [
          {
            name: 'https://github.com/organizacion/proyecto-final/tree/v1',
            submittedAt: '2026-05-30T20:03:40',
            isLink: true,
          },
          {
            name: 'https://github.com/organizacion/proyecto-final',
            submittedAt: '2026-05-30T22:30:10',
            isLink: true,
          },
        ],
      },
    ],
  },
]

function formatDate(dateIso: string) {
  const d = new Date(dateIso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function formatTime(dateIso: string) {
  const d = new Date(dateIso)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

function roundToNearestFive(value: number) {
  return Math.round(value / 5) * 5
}

function formatScore(value: number, decimals: number) {
  return value.toFixed(decimals)
}

function DocumentsTab() {
  const [menuState, setMenuState] = useState<{ x: number; y: number; target: string } | null>(
    null,
  )

  useEffect(() => {
    const close = () => setMenuState(null)
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }

    window.addEventListener('click', close)
    window.addEventListener('keydown', onEscape)

    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('keydown', onEscape)
    }
  }, [])

  const openContextMenu = (event: ReactMouseEvent, target: string) => {
    event.preventDefault()
    event.stopPropagation()
    setMenuState({ x: event.clientX, y: event.clientY, target })
  }

  const renderItem = (item: FileTreeItem) => {
    if ('items' in item) {
      const totalSize = getTreeSize(item)

      return (
        <Collapsible key={item.name}>
          <CollapsibleTrigger
            className="group grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_96px_160px] items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
            onContextMenu={(event) => openContextMenu(event, item.name)}
          >
            <span className="flex min-w-0 items-center gap-2">
              <ChevronRightIcon className="size-4 shrink-0 transition-transform group-data-[panel-open]:rotate-90" />
              <FolderIcon className="size-4 shrink-0 text-muted-foreground group-data-[panel-open]:hidden" />
              <FolderOpenIcon className="hidden size-4 shrink-0 text-muted-foreground group-data-[panel-open]:block" />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="text-right font-mono text-muted-foreground">{formatBytes(totalSize)}</span>
            <span className="text-right font-mono text-muted-foreground">{formatModified(item.modifiedAt)}</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-6 mt-1 space-y-1">
            {item.items.map((child) => renderItem(child))}
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <button
        key={item.name}
        type="button"
        className="grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_96px_160px] items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
        onContextMenu={(event) => openContextMenu(event, item.name)}
      >
        <span className="flex min-w-0 items-center gap-2">
          {(() => {
            const Icon = getFileIcon(item.name)
            return <Icon className="size-4 shrink-0 text-muted-foreground" />
          })()}
          <span className="truncate">{item.name}</span>
        </span>
        <span className="text-right font-mono text-muted-foreground">{formatBytes(item.sizeBytes)}</span>
        <span className="text-right font-mono text-muted-foreground">{formatModified(item.modifiedAt)}</span>
      </button>
    )
  }

  return (
    <div className="relative p-6">
      <div className="mx-auto w-full max-w-6xl space-y-1">
        <div className="grid grid-cols-[minmax(0,1fr)_96px_160px] gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Nombre</span>
          <span className="text-right">Tamaño</span>
          <span className="text-right">Modificado</span>
        </div>
        <Separator />
        <div className="space-y-1 pt-1">{documentsTree.map((item) => renderItem(item))}</div>
      </div>

      {menuState && (
        <div
          className="fixed z-50 min-w-48 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-lg"
          style={{ left: menuState.x, top: menuState.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="px-2 py-1.5 text-xs text-muted-foreground">{menuState.target}</div>
          <Separator />
          <button type="button" className="w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent">
            Subir archivo
          </button>
          <button type="button" className="w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent">
            Descargar
          </button>
          <button type="button" className="w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent">
            Crear carpeta
          </button>
          <button type="button" className="w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent">
            Renombrar
          </button>
          <button type="button" className="w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10">
            Eliminar
          </button>
        </div>
      )}
    </div>
  )
}

function EvaluationsTab() {
  const detailLabelClass = 'text-xs font-semibold'
  const [historyState, setHistoryState] = useState<{
    evaluationName: string
    entries: { name: string; submittedAt: string; isLink: boolean }[]
  } | null>(null)
  const [rubricOpen, setRubricOpen] = useState(false)

  const rubricRows = [
    {
      category: 'Vocabulary',
      weight: '20%',
      levels: [
        'Not done',
        'Very limited vocabulary, many inappropriate word choices.',
        'Limited range of vocabulary and some inappropriate choices.',
        'Use of appropriate vocabulary with few errors.',
        'Use of wide range of appropriate vocabulary.',
      ],
    },
    {
      category: 'Grammar',
      weight: '20%',
      levels: [
        'Not done',
        'Many errors in grammar, difficult to understand.',
        'Frequent errors but still understandable.',
        'Generally accurate with only a few errors.',
        'Accurate use of grammar with no errors.',
      ],
    },
    {
      category: 'Pronunciation / Intonation',
      weight: '20%',
      levels: [
        'Not done',
        'Significant difficulties with pronunciation and intonation.',
        'Frequent mispronunciations or stress/intonation errors.',
        'Occasional mispronunciations or stress errors.',
        'Clear, accurate pronunciation, stress and intonation.',
      ],
    },
    {
      category: 'Content',
      weight: '20%',
      levels: [
        'Not done',
        'Does not address the topic or information is inaccurate.',
        'Addresses the topic with limited or inaccurate information.',
        'Addresses the topic with mostly relevant information.',
        'Addresses the topic with relevant information.',
      ],
    },
    {
      category: 'Delivery',
      weight: '20%',
      levels: [
        'Not done',
        'Very unclear or hesitant, with significant pauses.',
        'Somewhat unclear or hesitant, with frequent pauses.',
        'Mostly clear and confident but with some hesitation.',
        'Clear and confident delivery, appropriate pacing.',
      ],
    },
  ]
  const totalWithoutRounding = evaluationGroups.reduce(
    (groupAcc, group) => groupAcc + group.items.reduce((itemAcc, item) => itemAcc + item.score.earned, 0),
    0,
  )
  const finalRounded = roundToNearestFive(totalWithoutRounding)
  const courseMax = evaluationGroups.reduce(
    (groupAcc, group) => groupAcc + group.items.reduce((itemAcc, item) => itemAcc + item.score.max, 0),
    0,
  )

  return (
    <>
      <div className="mx-auto w-full max-w-3xl space-y-5 p-6">
      <div className="flex items-center justify-between gap-3 px-2 py-1">
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
            <UserIcon className="size-6" />
          </span>
          <span className="truncate text-2xl font-normal sm:text-3xl">Nombre</span>
        </div>
        <span className="shrink-0 text-right text-2xl font-semibold text-muted-foreground sm:text-3xl">{String(finalRounded).padStart(2, '0')} / 100</span>
      </div>

      <div className="space-y-2">
        {evaluationGroups.map((group, groupIndex) => (
          <Collapsible key={group.title} className="px-2 py-1">
            <div className="flex items-center gap-3">
              <CollapsibleTrigger className="flex flex-1 cursor-pointer items-end gap-3 rounded-sm">
                <span className="text-base font-medium leading-none">{group.title}</span>
                <span className="mb-[2px] h-px flex-1 bg-border" />
                <span className="text-base leading-none text-muted-foreground">
                  {formatScore(group.items.reduce((acc, item) => acc + item.score.earned, 0), 1)} / {group.weight}
                </span>
              </CollapsibleTrigger>
              <CollapsibleTrigger className="group grid size-7 cursor-pointer place-items-center rounded-full border border-border text-base leading-none">
                <span className="group-data-[panel-open]:hidden">+</span>
                <span className="hidden group-data-[panel-open]:block">-</span>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="pt-3">
              <div className="overflow-hidden rounded-lg border border-border">
                {group.items.map((item, index) => (
                  <div key={item.name}>
                    <Collapsible>
                      <CollapsibleTrigger className="group flex w-full cursor-pointer items-center justify-between px-4 py-3 text-left hover:bg-accent/40">
                        <p className="text-sm font-medium">{item.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatScore(item.score.earned, 2)} / {formatScore(item.score.max, 2)}</span>
                          <ChevronDownIcon className="size-4 group-data-[panel-open]:hidden" />
                          <ChevronUpIcon className="hidden size-4 group-data-[panel-open]:block" />
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="grid gap-0 border-t border-border md:grid-cols-2">
                          <div className="p-3 md:border-r md:border-border">
                            <p className="mb-2 bg-muted px-2 py-1 text-sm font-semibold">Detalles de la asignación</p>
                            <div className="pl-2">
                              <p className={detailLabelClass}>Descripción:</p>
                              <p className="mb-3 text-sm text-muted-foreground">{item.description}</p>
                              <p className={detailLabelClass}>Valor de la asignación:</p>
                              <p className="mb-3 text-sm text-muted-foreground">{formatScore(item.score.max, 2)}</p>
                              <p className={detailLabelClass}>Rúbrica:</p>
                              <RadioGroup
                                value={item.rubric ? 'si' : 'no'}
                                className="mb-3 flex w-fit items-center gap-2 text-sm text-muted-foreground"
                                disabled
                              >
                                <Field orientation="horizontal" className="w-auto gap-1" data-disabled>
                                  <RadioGroupItem value="si" id={`rubric-si-${groupIndex}-${index}`} disabled />
                                  <FieldLabel htmlFor={`rubric-si-${groupIndex}-${index}`} className="flex-none font-normal">
                                    Sí
                                  </FieldLabel>
                                </Field>
                                <Field orientation="horizontal" className="w-auto gap-1" data-disabled>
                                  <RadioGroupItem value="no" id={`rubric-no-${groupIndex}-${index}`} disabled />
                                  <FieldLabel htmlFor={`rubric-no-${groupIndex}-${index}`} className="flex-none font-normal">
                                    No
                                  </FieldLabel>
                                </Field>
                              </RadioGroup>
                              <p className={detailLabelClass}>Fecha de entrega:</p>
                              <p className="mb-3 text-sm text-muted-foreground">{item.dueDate}</p>
                              <p className={detailLabelClass}>Posibilidad de entregar después de la fecha límite:</p>
                              <RadioGroup
                                value={item.allowLate ? 'si' : 'no'}
                                className="mb-3 flex w-fit items-center gap-2 text-sm text-muted-foreground"
                                disabled
                              >
                                <Field orientation="horizontal" className="w-auto gap-1" data-disabled>
                                  <RadioGroupItem value="si" id={`late-si-${groupIndex}-${index}`} disabled />
                                  <FieldLabel htmlFor={`late-si-${groupIndex}-${index}`} className="flex-none font-normal">
                                    Sí
                                  </FieldLabel>
                                </Field>
                                <Field orientation="horizontal" className="w-auto gap-1" data-disabled>
                                  <RadioGroupItem value="no" id={`late-no-${groupIndex}-${index}`} disabled />
                                  <FieldLabel htmlFor={`late-no-${groupIndex}-${index}`} className="flex-none font-normal">
                                    No
                                  </FieldLabel>
                                </Field>
                              </RadioGroup>
                              <p className={detailLabelClass}>Cantidad de personas por grupo:</p>
                              <p className="text-sm text-muted-foreground">{item.peoplePerGroup}</p>
                              {item.peoplePerGroup > 1 && item.members?.length ? (
                                <>
                                  <p className={`mt-3 ${detailLabelClass}`}>Miembros del grupo:</p>
                                  <div className="text-sm text-muted-foreground">
                                    {item.members.map((member) => (
                                      <p key={member}>{member}</p>
                                    ))}
                                  </div>
                                </>
                              ) : null}
                            </div>
                          </div>
                          <div className="px-3 pb-3 pt-1 md:p-3">
                            <p className="mb-2 bg-muted px-2 py-1 text-sm font-semibold">Mis entregas</p>
                            <div className="pl-2">
                              {item.dueDate ? (
                                <>
                                  <p className={detailLabelClass}>Entrega:</p>
                                  <div className="mb-3 ml-px border-l-4 border-blue-500 pl-3">
                                    {item.submission ? (
                                      <>
                                        <div className="mb-1.5 flex items-start justify-between gap-3">
                                          <p className="min-w-0 truncate text-sm text-muted-foreground">{item.submission.name}</p>
                                          <div className="flex items-center gap-1.5">
                                            <button
                                              type="button"
                                              className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                                              onClick={() =>
                                                setHistoryState({
                                                  evaluationName: item.name,
                                                  entries: item.submissionHistory,
                                                })
                                              }
                                              aria-label={`Ver historial de ${item.name}`}
                                            >
                                              <HistoryIcon className="size-4" />
                                            </button>
                                            {!item.submission.isLink ? (
                                              <button
                                                type="button"
                                                className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                                                aria-label={`Descargar ${item.submission.name}`}
                                              >
                                                <DownloadIcon className="size-4" />
                                              </button>
                                            ) : null}
                                          </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Día de entrega: {formatDate(item.submission.submittedAt)}</p>
                                        <p className="text-xs text-muted-foreground">Hora de entrega: {formatTime(item.submission.submittedAt)}</p>
                                      </>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No hay entregas de archivo o enlace.</p>
                                    )}
                                  </div>
                                </>
                              ) : null}
                              <p className={detailLabelClass}>Nota obtenida:</p>
                              <p className="mb-1 text-sm text-muted-foreground">{formatScore(item.score.earned, 2)} / {formatScore(item.score.max, 2)}</p>
                              {item.feedbackFiles?.length ? (
                                <div className="mb-2">
                                  <p className={detailLabelClass}>Archivos de retroalimentación:</p>
                                  <div className="space-y-1 pt-1">
                                    {item.feedbackFiles.map((file) => (
                                      <div key={file.name} className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
                                        <p className="min-w-0 truncate">{file.name}</p>
                                        <button
                                          type="button"
                                          className="shrink-0 cursor-pointer rounded-md p-1 hover:bg-accent hover:text-foreground"
                                          aria-label={`Descargar ${file.name}`}
                                        >
                                          <DownloadIcon className="size-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                              {item.rubric ? (
                                <button
                                  type="button"
                                  className="mb-2 cursor-pointer text-sm text-primary underline underline-offset-2"
                                  onClick={() => setRubricOpen(true)}
                                >
                                  Ver rúbrica
                                </button>
                              ) : null}
                              {item.dueDate ? (
                                <>
                                  <p className={detailLabelClass}>Comentarios:</p>
                                  <p className="text-sm text-muted-foreground">Sin comentarios</p>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                    {index < group.items.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Nota total (sin redondear)</p>
          <p className="font-mono text-sm text-muted-foreground">{totalWithoutRounding.toFixed(1)} / {courseMax}</p>
        </div>
        <Separator className="my-2" />
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold">Nota final</p>
          <p className="font-mono text-2xl font-bold">{String(finalRounded).padStart(2, '0')} / 100</p>
        </div>
      </div>
      </div>

      <Dialog open={historyState !== null} onOpenChange={(open) => !open && setHistoryState(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-3xl gap-0 p-0 sm:max-w-3xl" showCloseButton>
          <DialogHeader className="gap-1 border-b border-border px-4 py-3">
            <DialogTitle>Historial de archivos subidos</DialogTitle>
            <DialogDescription>{historyState?.evaluationName ?? ''}</DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto px-4 pb-4">
            <div className="grid grid-cols-[minmax(0,1fr)_150px_28px] items-center gap-1 border-b border-border py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Nombre del archivo</span>
              <span className="text-right">Fecha de entrega</span>
              <span aria-hidden="true" />
            </div>
            {(historyState?.entries ?? []).map((entry) => (
              <div
                key={`${entry.name}-${entry.submittedAt}`}
                className="grid grid-cols-[minmax(0,1fr)_150px_28px] items-center gap-1 border-b border-border/60 py-2 text-sm"
              >
                <p className="truncate text-muted-foreground">{entry.name}</p>
                <p className="text-right font-mono text-xs text-muted-foreground">
                  {formatDate(entry.submittedAt)} {formatTime(entry.submittedAt)}
                </p>
                {!entry.isLink ? (
                  <button
                    type="button"
                    className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label={`Descargar ${entry.name}`}
                  >
                    <DownloadIcon className="size-4" />
                  </button>
                ) : (
                  <span aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={rubricOpen} onOpenChange={setRubricOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-6xl gap-0 p-0 sm:max-w-6xl" showCloseButton>
          <DialogHeader className="gap-1 border-b border-border px-4 py-3">
            <DialogTitle>Evaluación por rúbrica</DialogTitle>
            <DialogDescription>Rubric oral presentation of a project - Puntuación: 0.0</DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-auto p-3">
            <table className="w-full min-w-[980px] border-collapse text-xs">
              <thead>
                <tr>
                  <th className="border border-border bg-muted px-2 py-1 text-left font-semibold">Categorías de Evaluación</th>
                  <th className="border border-border bg-muted px-2 py-1 text-left font-semibold">Not done (0)</th>
                  <th className="border border-border bg-muted px-2 py-1 text-left font-semibold">Inadequate (1)</th>
                  <th className="border border-border bg-muted px-2 py-1 text-left font-semibold">Needs improvement (2)</th>
                  <th className="border border-border bg-muted px-2 py-1 text-left font-semibold">Meets expectations (3)</th>
                  <th className="border border-border bg-muted px-2 py-1 text-left font-semibold">Exceeds expectations (4)</th>
                </tr>
              </thead>
              <tbody>
                {rubricRows.map((row) => (
                  <tr key={row.category}>
                    <td className="border border-border px-2 py-1 align-top">
                      <p className="font-semibold">{row.category}</p>
                      <p className="text-muted-foreground">Peso {row.weight}</p>
                    </td>
                    {row.levels.map((level) => (
                      <td key={`${row.category}-${level}`} className="border border-border px-2 py-1 align-top text-muted-foreground">
                        {level}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const Route = createFileRoute(
  '/courses/$year/$periodType/$periodNumber/$courseCode/$groupNumber',
)({
  validateSearch: (search: Record<string, unknown>) => {
    const rawTab = Number(search.tab)
    const tab = Number.isInteger(rawTab) ? rawTab : 0

    return {
      tab: Math.min(Math.max(tab, 0), courseTabs.length - 1),
    }
  },
  component: CoursePage,
})

function CoursePage() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const tabIndex = search.tab

  return (
    <div className="flex grow flex-col">
      <div className="px-6 py-3">
        <Tabs
          value={String(tabIndex)}
          onValueChange={(value) => {
            const nextTab = Number(value)
            if (!Number.isInteger(nextTab)) return
            navigate({
              search: (prev) => ({ ...prev, tab: nextTab }),
              replace: true,
            })
          }}
        >
          <div className="overflow-x-auto">
            <TabsList className="min-w-max justify-start">
              {courseTabs.map((tab, index) => (
                <TabsTrigger key={tab} value={String(index)}>
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto">
        {tabIndex === 2 && <DocumentsTab />}
        {tabIndex === 3 && <EvaluationsTab />}
      </div>
    </div>
  )
}
