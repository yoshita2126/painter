import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDown, ArrowUp, Brush, ChevronDown, Circle, Copy, Download, Eye,
  EyeOff, FilePlus2, FolderOpen, Maximize, MoreVertical, Palette, PaintBucket,
  Pencil, Plus, Redo2, Save, Settings, Square, Trash2, Triangle, Undo2,
  ZoomIn, ZoomOut, Eraser, Pipette, MoveUpRight, Minus as LineIcon,
  RectangleHorizontal, X,
} from 'lucide-react'

const INITIAL_WIDTH = 1200
const INITIAL_HEIGHT = 800
const palette = ['#111827', '#ffffff', '#ef4444', '#fb923c', '#facc15', '#22c55e', '#06b6d4', '#1684f8', '#8b5cf6', '#ec4899']

const buildPolygonPoints = (sides, radius = 42, cx = 50, cy = 50, rotation = -Math.PI / 2) => Array.from({ length: sides }, (_, index) => {
  const angle = rotation + (index * Math.PI * 2) / sides
  return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`
}).join(' ')

const buildStarPoints = (outerRadius = 42, innerRadius = 18, cx = 50, cy = 50, rotation = -Math.PI / 2) => Array.from({ length: 10 }, (_, index) => {
  const angle = rotation + (index * Math.PI) / 5
  const radius = index % 2 === 0 ? outerRadius : innerRadius
  return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`
}).join(' ')

const shapeGroups = {
  all: 'All',
  basic: 'Basic',
  arrows: 'Arrows',
  geometry: 'Geometry',
  marks: 'Marks',
  ui: 'UI',
}

const shapeLibrary = [
  { id: 'line', name: 'Line', kind: 'line', group: 'basic' },
  { id: 'arrow', name: 'Arrow', kind: 'arrow', group: 'arrows' },
  { id: 'double-arrow', name: 'Double Arrow', kind: 'doubleArrow', group: 'arrows' },
  { id: 'triangle', name: 'Triangle', kind: 'triangle', group: 'geometry' },
  { id: 'diamond', name: 'Diamond', kind: 'diamond', group: 'geometry' },
  { id: 'pentagon', name: 'Pentagon', kind: 'pentagon', group: 'geometry' },
  { id: 'hexagon', name: 'Hexagon', kind: 'hexagon', group: 'geometry' },
  { id: 'octagon', name: 'Octagon', kind: 'octagon', group: 'geometry' },
  { id: 'star', name: 'Star', kind: 'star', group: 'geometry' },
  { id: 'heart', name: 'Heart', kind: 'heart', group: 'marks' },
  { id: 'circle', name: 'Circle', kind: 'circle', group: 'geometry' },
  { id: 'rect', name: 'Rectangle', kind: 'rect', group: 'geometry' },
  { id: 'rounded', name: 'Rounded Rect', kind: 'rect', group: 'geometry' },
  { id: 'bubble', name: 'Speech Bubble', kind: 'bubble', group: 'marks' },
  { id: 'folder', name: 'Folder', kind: 'folder', group: 'ui' },
  { id: 'document', name: 'Document', kind: 'document', group: 'ui' },
  { id: 'shield', name: 'Shield', kind: 'shield', group: 'marks' },
  { id: 'warning', name: 'Warning', kind: 'warning', group: 'marks' },
  { id: 'check', name: 'Check', kind: 'check', group: 'marks' },
  { id: 'cross', name: 'Cross', kind: 'cross', group: 'marks' },
  { id: 'plus', name: 'Plus', kind: 'plus', group: 'marks' },
  { id: 'cloud', name: 'Cloud', kind: 'cloud', group: 'marks' },
  { id: 'sun', name: 'Sun', kind: 'sun', group: 'marks' },
  { id: 'moon', name: 'Moon', kind: 'moon', group: 'marks' },
  { id: 'upload', name: 'Upload', kind: 'upload', group: 'ui' },
  { id: 'download', name: 'Download', kind: 'download', group: 'ui' },
  { id: 'badge', name: 'Badge', kind: 'badge', group: 'ui' },
]

const renderShapeSvg = (shape, strokeColor = '#111827', fillColor = 'transparent') => {
  const stroke = strokeColor || '#111827'
  const fill = fillColor || 'transparent'
  const outline = `stroke="${stroke}" fill="${fill}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"`

  switch (shape.kind) {
    case 'line':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><path d="M10 50H90" stroke="${stroke}" stroke-width="4" stroke-linecap="round" /></svg>`
    case 'arrow':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><path d="M11 50H72M72 50L52 29M72 50L52 71" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" /></svg>`
    case 'doubleArrow':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><path d="M12 50H40L24 34M12 50H40L24 66M60 50H88L72 34M60 50H88L72 66" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" /></svg>`
    case 'triangle':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><polygon points="50,12 90,88 10,88" ${outline} /></svg>`
    case 'diamond':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><polygon points="50,10 90,50 50,90 10,50" ${outline} /></svg>`
    case 'pentagon':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><polygon points="${buildPolygonPoints(5, 40, 50, 50, -Math.PI / 2)}" ${outline} /></svg>`
    case 'hexagon':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><polygon points="${buildPolygonPoints(6, 42, 50, 50, -Math.PI / 2)}" ${outline} /></svg>`
    case 'octagon':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><polygon points="${buildPolygonPoints(8, 40, 50, 50, -Math.PI / 2)}" ${outline} /></svg>`
    case 'star':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><polygon points="${buildStarPoints()}" ${outline} /></svg>`
    case 'heart':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><path d="M50 84C24 66 14 58 14 39C14 25 23 16 35 16C42 16 47 19 50 25C53 19 58 16 65 16C77 16 86 25 86 39C86 58 76 66 50 84Z" ${outline} /></svg>`
    case 'circle':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><circle cx="50" cy="50" r="38" ${outline} /></svg>`
    case 'rect':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><rect x="18" y="18" width="64" height="64" rx="8" ${outline} /></svg>`
    case 'bubble':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><path d="M18 28C18 18 27 12 37 12H70C80 12 88 19 88 30V48C88 59 80 66 70 66H61L46 82V66H37C27 66 18 59 18 48V28Z" ${outline} /></svg>`
    case 'folder':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><path d="M14 36V68C14 77 21 84 30 84H70C79 84 86 77 86 68V36C86 27 79 20 70 20H56L49 14H30C21 14 14 21 14 30V36Z" stroke="${stroke}" fill="${fill}" stroke-width="3.5" stroke-linejoin="round" /></svg>`
    case 'document':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><path d="M28 14H60L80 34V78C80 84 75 89 69 89H28C22 89 18 84 18 78V22C18 18 22 14 28 14Z" stroke="${stroke}" fill="${fill}" stroke-width="3.5" stroke-linejoin="round" /><path d="M60 14V34H80" stroke="${stroke}" stroke-width="3.5" fill="none" /></svg>`
    case 'badge':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><path d="M50 14L66 22V46C66 61 58 71 50 78C42 71 34 61 34 46V22L50 14Z" stroke="${stroke}" fill="${fill}" stroke-width="3.5" stroke-linejoin="round" /></svg>`
    case 'shield':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><path d="M50 10L76 22V46C76 64 65 78 50 88C35 78 24 64 24 46V22L50 10Z" stroke="${stroke}" fill="${fill}" stroke-width="3.5" stroke-linejoin="round" /></svg>`
    case 'warning':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><path d="M50 14L88 80H12L50 14Z" stroke="${stroke}" fill="${fill}" stroke-width="3.5" stroke-linejoin="round" /><path d="M50 36V57" stroke="${stroke}" stroke-width="5" stroke-linecap="round" fill="none" /><circle cx="50" cy="70" r="4" fill="${stroke}" stroke="${stroke}" /></svg>`
    case 'check':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><path d="M16 54L38 76L84 30" stroke="${stroke}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none" /></svg>`
    case 'cross':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><path d="M24 24L76 76M76 24L24 76" stroke="${stroke}" stroke-width="5" stroke-linecap="round" /></svg>`
    case 'plus':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><path d="M50 18V82M18 50H82" stroke="${stroke}" stroke-width="5" stroke-linecap="round" /></svg>`
    case 'cloud':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><path d="M30 78C18 78 10 70 10 58C10 47 18 39 29 38C33 27 43 20 55 20C69 20 79 30 82 43C88 46 92 52 92 59C92 71 83 78 71 78H30Z" stroke="${stroke}" fill="${fill}" stroke-width="3.5" stroke-linejoin="round" /></svg>`
    case 'sun':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><circle cx="50" cy="50" r="18" stroke="${stroke}" fill="${fill}" stroke-width="3.5" /><path d="M50 6V20M50 80V94M94 50H80M20 50H6M83 17L72 28M28 72L17 83M17 17L28 28M72 72L83 83" stroke="${stroke}" stroke-width="4" stroke-linecap="round" /></svg>`
    case 'moon':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><path d="M68 18C58 21 52 30 52 40C52 56 64 70 80 70C75 76 68 81 60 84C42 89 22 82 14 65C6 48 11 27 27 17C37 10 49 9 60 12C62 14 64 16 68 18Z" stroke="${stroke}" fill="${fill}" stroke-width="3.5" stroke-linejoin="round" /></svg>`
    case 'upload':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><path d="M25 64V72C25 77 29 81 34 81H66C71 81 75 77 75 72V64M50 18V62M35 33L50 18L65 33" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" /></svg>`
    case 'download':
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><path d="M25 64V72C25 77 29 81 34 81H66C71 81 75 77 75 72V64M50 18V62M35 67L50 82L65 67" stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" /></svg>`
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" aria-label="${shape.name}"><path d="M18 70L50 18L82 70H18Z" stroke="${stroke}" fill="${fill}" stroke-width="3.5" stroke-linejoin="round" /></svg>`
  }
}

const tools = [
  { id: 'brush', name: 'Brush', Icon: Brush },
  { id: 'pencil', name: 'Pencil', Icon: Pencil },
  { id: 'eraser', name: 'Eraser', Icon: Eraser },
  { id: 'fill', name: 'Fill', Icon: PaintBucket },
  { id: 'picker', name: 'Color Picker', Icon: Pipette },
  { id: 'line', name: 'Line', Icon: LineIcon },
  { id: 'rectangle', name: 'Rectangle', Icon: Square },
  { id: 'circle', name: 'Circle', Icon: Circle },
  { id: 'triangle', name: 'Triangle', Icon: Triangle },
  { id: 'rounded', name: 'Rounded Rect', Icon: RectangleHorizontal },
  { id: 'arrow', name: 'Arrow', Icon: MoveUpRight },
]

const toolLabels = { brush: 'Brush', pencil: 'Pencil', eraser: 'Eraser', fill: 'Bucket fill', picker: 'Color picker', line: 'Line', rectangle: 'Rectangle', circle: 'Ellipse', triangle: 'Triangle', rounded: 'Rounded rectangle', arrow: 'Arrow' }

function blankData(width, height) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas.toDataURL()
}

function initialLayer(id, name, width, height) {
  return { id, name, visible: true, opacity: 100, data: blankData(width, height) }
}

function App() {
  const [size, setSize] = useState({ width: INITIAL_WIDTH, height: INITIAL_HEIGHT })
  const [layers, setLayers] = useState(() => [initialLayer(1, 'Layer 1', INITIAL_WIDTH, INITIAL_HEIGHT)])
  const layersRef = useRef(layers)
  const canvasRefs = useRef({})
  const [activeLayer, setActiveLayer] = useState(1)
  const [tool, setTool] = useState('brush')
  const [color, setColor] = useState('#1684f8')
  const [brushSize, setBrushSize] = useState(12)
  const [opacity, setOpacity] = useState(100)
  const [zoom, setZoom] = useState(100)
  const [history, setHistory] = useState({ undo: [], redo: [] })
  const historyRef = useRef(history)
  const [exportOpen, setExportOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [sizeDraft, setSizeDraft] = useState({ width: INITIAL_WIDTH, height: INITIAL_HEIGHT })
  const [layerNameEdit, setLayerNameEdit] = useState(null)
  const [customColor, setCustomColor] = useState('#1684f8')
  const [status, setStatus] = useState('Ready to create')
  const [clipboard, setClipboard] = useState(null)
  const [menuLayer, setMenuLayer] = useState(null)
  const [background, setBackground] = useState('white')
  const [shapeFilter, setShapeFilter] = useState('all')
  const [shapeSearch, setShapeSearch] = useState('')
  const fileInputRef = useRef(null)
  const colorInputRef = useRef(null)
  const drawState = useRef(null)
  const stageRef = useRef(null)

  const updateLayers = useCallback((next) => {
    layersRef.current = next
    setLayers(next)
  }, [])

  const pushHistory = useCallback(() => {
    const snapshot = structuredClone(layersRef.current)
    const next = { undo: [...historyRef.current.undo.slice(-29), snapshot], redo: [] }
    historyRef.current = next
    setHistory(next)
  }, [])

  const updateHistory = useCallback((next) => {
    historyRef.current = next
    setHistory(next)
  }, [])

  useEffect(() => {
    layers.forEach((layer) => {
      const canvas = canvasRefs.current[layer.id]
      if (!canvas) return
      canvas.width = size.width
      canvas.height = size.height
      if (layer.data) {
        const image = new window.Image()
        image.onload = () => {
          const context = canvas.getContext('2d')
          context.clearRect(0, 0, canvas.width, canvas.height)
          context.drawImage(image, 0, 0, canvas.width, canvas.height)
        }
        image.src = layer.data
      }
    })
  }, [layers, size])

  const saveLayerCanvas = useCallback((layerId) => {
    const canvas = canvasRefs.current[layerId]
    if (!canvas) return
    const data = canvas.toDataURL('image/png')
    updateLayers(layersRef.current.map((layer) => layer.id === layerId ? { ...layer, data } : layer))
  }, [updateLayers])

  const changeTool = (next) => {
    setTool(next)
    setStatus(`${toolLabels[next]} selected`)
  }

  const insertShape = (shape) => {
    const svgMarkup = renderShapeSvg(shape, color, color)
    const svgUrl = URL.createObjectURL(new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' }))
    const image = new window.Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size.width
      canvas.height = size.height
      const context = canvas.getContext('2d')
      const scale = Math.min(size.width, size.height) * 0.68
      const x = (size.width - scale) / 2
      const y = (size.height - scale) / 2
      context.clearRect(0, 0, size.width, size.height)
      context.drawImage(image, x, y, scale, scale)
      const id = Date.now()
      const nextLayer = { ...initialLayer(id, shape.name, size.width, size.height), data: canvas.toDataURL() }
      pushHistory()
      updateLayers([nextLayer, ...layersRef.current])
      setActiveLayer(id)
      setStatus(`${shape.name} inserted`)
      URL.revokeObjectURL(svgUrl)
    }
    image.onerror = () => {
      URL.revokeObjectURL(svgUrl)
      setStatus(`Could not add ${shape.name}`)
    }
    image.src = svgUrl
  }

  const getPoint = (event) => {
    const canvas = canvasRefs.current[activeLayer]
    const rect = canvas.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const compositeCanvas = () => {
    const result = document.createElement('canvas')
    result.width = size.width
    result.height = size.height
    const context = result.getContext('2d')
    if (background === 'white') {
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, size.width, size.height)
    }
    layersRef.current.slice().reverse().forEach((layer) => {
      if (!layer.visible) return
      const canvas = canvasRefs.current[layer.id]
      if (canvas) {
        context.globalAlpha = layer.opacity / 100
        context.drawImage(canvas, 0, 0)
      }
    })
    context.globalAlpha = 1
    return result
  }

  const fillAt = (canvas, point) => {
    const context = canvas.getContext('2d', { willReadFrequently: true })
    const x = Math.floor(point.x)
    const y = Math.floor(point.y)
    const image = context.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = image.data
    const index = (y * canvas.width + x) * 4
    const target = [pixels[index], pixels[index + 1], pixels[index + 2], pixels[index + 3]]
    const parsed = color.match(/[a-f\d]{2}/gi)?.map((value) => parseInt(value, 16)) || [0, 0, 0]
    const replacement = [...parsed, Math.round(opacity * 2.55)]
    if (target.every((value, i) => value === replacement[i])) return
    const stack = [[x, y]]
    const matches = (px, py) => {
      if (px < 0 || py < 0 || px >= canvas.width || py >= canvas.height) return false
      const offset = (py * canvas.width + px) * 4
      return pixels[offset] === target[0] && pixels[offset + 1] === target[1] && pixels[offset + 2] === target[2] && pixels[offset + 3] === target[3]
    }
    while (stack.length) {
      const [px, py] = stack.pop()
      if (!matches(px, py)) continue
      let left = px
      let right = px
      while (matches(left - 1, py)) left -= 1
      while (matches(right + 1, py)) right += 1
      for (let fillX = left; fillX <= right; fillX += 1) {
        const offset = (py * canvas.width + fillX) * 4
        pixels[offset] = replacement[0]
        pixels[offset + 1] = replacement[1]
        pixels[offset + 2] = replacement[2]
        pixels[offset + 3] = replacement[3]
      }
      for (const adjacentY of [py - 1, py + 1]) {
        let inSpan = false
        for (let fillX = left; fillX <= right; fillX += 1) {
          if (matches(fillX, adjacentY)) {
            if (!inSpan) stack.push([fillX, adjacentY])
            inSpan = true
          } else {
            inSpan = false
          }
        }
      }
    }
    context.putImageData(image, 0, 0)
  }

  const pointerDown = (event) => {
    if (event.button !== 0) return
    const canvas = canvasRefs.current[activeLayer]
    if (!canvas) return
    const point = getPoint(event)
    if (tool === 'picker') {
      const context = compositeCanvas().getContext('2d')
      const pixel = context.getImageData(Math.max(0, Math.min(size.width - 1, Math.floor(point.x))), Math.max(0, Math.min(size.height - 1, Math.floor(point.y))), 1, 1).data
      if (pixel[3]) {
        const picked = `#${[pixel[0], pixel[1], pixel[2]].map((value) => value.toString(16).padStart(2, '0')).join('')}`
        setColor(picked)
        setCustomColor(picked)
        setStatus(`Picked ${picked.toUpperCase()}`)
      }
      return
    }
    if (tool === 'fill') {
      pushHistory()
      fillAt(canvas, point)
      saveLayerCanvas(activeLayer)
      setStatus('Area filled')
      return
    }
    pushHistory()
    event.currentTarget.setPointerCapture(event.pointerId)
    const context = canvas.getContext('2d')
    drawState.current = {
      canvas, context, start: point, previous: point, original: context.getImageData(0, 0, canvas.width, canvas.height),
      shape: ['line', 'rectangle', 'circle', 'triangle', 'rounded', 'arrow'].includes(tool),
    }
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.lineWidth = tool === 'pencil' ? Math.max(1, brushSize * 0.45) : brushSize
    context.strokeStyle = color
    context.globalAlpha = opacity / 100
    if (tool === 'eraser') {
      context.globalCompositeOperation = 'destination-out'
      context.globalAlpha = 1
      context.lineWidth = brushSize * 2
    }
    if (!drawState.current.shape) {
      context.beginPath()
      context.moveTo(point.x, point.y)
      context.lineTo(point.x + 0.01, point.y + 0.01)
      context.stroke()
    }
  }

  const drawShape = (state, point) => {
    const { context, start } = state
    context.putImageData(state.original, 0, 0)
    context.beginPath()
    const width = point.x - start.x
    const height = point.y - start.y
    if (tool === 'line') {
      context.moveTo(start.x, start.y)
      context.lineTo(point.x, point.y)
    } else if (tool === 'rectangle') {
      context.rect(start.x, start.y, width, height)
    } else if (tool === 'circle') {
      context.ellipse(start.x + width / 2, start.y + height / 2, Math.abs(width / 2), Math.abs(height / 2), 0, 0, Math.PI * 2)
    } else if (tool === 'triangle') {
      context.moveTo(start.x + width / 2, start.y)
      context.lineTo(point.x, point.y)
      context.lineTo(start.x, point.y)
      context.closePath()
    } else if (tool === 'rounded') {
      context.roundRect(Math.min(start.x, point.x), Math.min(start.y, point.y), Math.abs(width), Math.abs(height), Math.min(18, Math.abs(width) / 5, Math.abs(height) / 5))
    } else if (tool === 'arrow') {
      const angle = Math.atan2(height, width)
      const head = Math.max(12, brushSize * 3)
      context.moveTo(start.x, start.y)
      context.lineTo(point.x, point.y)
      context.moveTo(point.x - head * Math.cos(angle - Math.PI / 6), point.y - head * Math.sin(angle - Math.PI / 6))
      context.lineTo(point.x, point.y)
      context.lineTo(point.x - head * Math.cos(angle + Math.PI / 6), point.y - head * Math.sin(angle + Math.PI / 6))
    }
    context.stroke()
  }

  const pointerMove = (event) => {
    const state = drawState.current
    if (!state) return
    const point = getPoint(event)
    if (state.shape) {
      drawShape(state, point)
    } else {
      state.context.beginPath()
      state.context.moveTo(state.previous.x, state.previous.y)
      state.context.lineTo(point.x, point.y)
      state.context.stroke()
      state.previous = point
    }
  }

  const pointerUp = () => {
    if (!drawState.current) return
    drawState.current.context.globalAlpha = 1
    drawState.current.context.globalCompositeOperation = 'source-over'
    saveLayerCanvas(activeLayer)
    drawState.current = null
    setStatus('Changes saved')
  }

  const undo = () => {
    if (!historyRef.current.undo.length) return
    const current = structuredClone(layersRef.current)
    const previous = historyRef.current.undo.at(-1)
    updateHistory({ undo: historyRef.current.undo.slice(0, -1), redo: [...historyRef.current.redo, current] })
    updateLayers(structuredClone(previous))
    setStatus('Undo')
  }

  const redo = () => {
    if (!historyRef.current.redo.length) return
    const current = structuredClone(layersRef.current)
    const next = historyRef.current.redo.at(-1)
    updateHistory({ undo: [...historyRef.current.undo, current], redo: historyRef.current.redo.slice(0, -1) })
    updateLayers(structuredClone(next))
    setStatus('Redo')
  }

  const addLayer = () => {
    const id = Date.now()
    pushHistory()
    updateLayers([{ ...initialLayer(id, `Layer ${layersRef.current.length + 1}`, size.width, size.height) }, ...layersRef.current])
    setActiveLayer(id)
    setStatus('Layer added')
  }

  const deleteLayer = (id = activeLayer) => {
    if (layersRef.current.length <= 1) {
      setStatus('Your canvas needs at least one layer')
      return
    }
    pushHistory()
    const next = layersRef.current.filter((layer) => layer.id !== id)
    updateLayers(next)
    if (id === activeLayer) setActiveLayer(next[0].id)
    setStatus('Layer deleted')
  }

  const moveLayer = (id, direction) => {
    const index = layersRef.current.findIndex((layer) => layer.id === id)
    const target = index + direction
    if (target < 0 || target >= layersRef.current.length) return
    pushHistory()
    const next = [...layersRef.current]
    ;[next[index], next[target]] = [next[target], next[index]]
    updateLayers(next)
  }

  const clearCanvas = () => {
    const canvas = canvasRefs.current[activeLayer]
    if (!canvas) return
    pushHistory()
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    saveLayerCanvas(activeLayer)
    setStatus('Active layer cleared')
  }

  const changeCanvasSize = () => {
    const width = Math.max(1, Math.min(4000, Number(sizeDraft.width) || size.width))
    const height = Math.max(1, Math.min(4000, Number(sizeDraft.height) || size.height))
    pushHistory()
    const nextLayers = layersRef.current.map((layer) => {
      const oldCanvas = canvasRefs.current[layer.id]
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      if (oldCanvas) canvas.getContext('2d').drawImage(oldCanvas, 0, 0)
      return { ...layer, data: canvas.toDataURL() }
    })
    setSize({ width, height })
    updateLayers(nextLayers)
    setSettingsOpen(false)
    setStatus(`Canvas resized to ${width} × ${height}`)
  }

  const download = (format) => {
    const canvas = compositeCanvas()
    let url
    let filename
    if (format === 'svg') {
      const data = canvas.toDataURL('image/png')
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}"><image width="${size.width}" height="${size.height}" href="${data}"/></svg>`
      url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
      filename = 'painter-artwork.svg'
    } else {
      const mime = format === 'jpg' ? 'image/jpeg' : 'image/png'
      if (format === 'jpg') {
        const context = canvas.getContext('2d')
        context.globalCompositeOperation = 'destination-over'
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, size.width, size.height)
      }
      url = canvas.toDataURL(mime, 0.92)
      filename = `painter-artwork.${format}`
    }
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    if (format === 'svg') URL.revokeObjectURL(url)
    setExportOpen(false)
    setStatus(`Exported ${format.toUpperCase()} artwork`)
  }

  const saveProject = () => {
    try {
      localStorage.setItem('painter-project', JSON.stringify({ size, layers: layersRef.current, background }))
      setStatus('Project saved on this device')
    } catch (error) {
      setStatus(`Could not save project: ${error.message}`)
    }
  }

  const newCanvas = () => {
    const id = Date.now()
    setSize({ width: INITIAL_WIDTH, height: INITIAL_HEIGHT })
    updateLayers([initialLayer(id, 'Layer 1', INITIAL_WIDTH, INITIAL_HEIGHT)])
    setActiveLayer(id)
    setBackground('white')
    updateHistory({ undo: [], redo: [] })
    setStatus('New canvas created')
  }

  const openFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onerror = () => setStatus(`Could not open file: ${reader.error?.message || 'read failed'}`)
    reader.onload = () => {
      if (file.type === 'application/json' || file.name.endsWith('.painter')) {
        try {
          const project = JSON.parse(reader.result)
          if (!project.size || !Array.isArray(project.layers) || !project.layers.length) throw new Error('Invalid Painter project')
          pushHistory()
          setSize(project.size)
          updateLayers(project.layers)
          setActiveLayer(project.layers[0].id)
          setBackground(project.background || 'white')
          setStatus('Project opened')
        } catch (error) {
          setStatus(`Could not open project: ${error.message}`)
        }
        return
      }
      const image = new window.Image()
      image.onerror = () => setStatus('Could not open that image file')
      image.onload = () => {
        pushHistory()
        const canvas = document.createElement('canvas')
        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight
        canvas.getContext('2d').drawImage(image, 0, 0)
        const id = Date.now()
        const layer = { id, name: file.name.replace(/\.[^.]+$/, '') || 'Imported image', visible: true, opacity: 100, data: canvas.toDataURL() }
        setSize({ width: canvas.width, height: canvas.height })
        updateLayers([layer])
        setActiveLayer(id)
        setStatus('Image opened as a new canvas')
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  const exportProject = () => {
    const blob = new Blob([JSON.stringify({ size, layers: layersRef.current, background }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'painter-project.painter'
    link.click()
    URL.revokeObjectURL(url)
    setExportOpen(false)
    setStatus('Project downloaded')
  }

  const copyLayer = () => {
    const layer = layersRef.current.find((entry) => entry.id === activeLayer)
    setClipboard(layer ? structuredClone(layer) : null)
    setStatus(layer ? 'Layer copied' : 'Select a layer to copy')
  }

  const duplicateLayer = () => {
    const layer = layersRef.current.find((entry) => entry.id === activeLayer)
    if (!layer) return
    pushHistory()
    const id = Date.now()
    updateLayers([{ ...structuredClone(layer), id, name: `${layer.name} copy` }, ...layersRef.current])
    setActiveLayer(id)
    setStatus('Layer duplicated')
  }

  const pasteLayer = () => {
    if (!clipboard) return
    pushHistory()
    const id = Date.now()
    updateLayers([{ ...structuredClone(clipboard), id, name: `${clipboard.name} copy` }, ...layersRef.current])
    setActiveLayer(id)
    setStatus('Layer pasted')
  }

  const saveLayerName = (id, name) => {
    const next = layersRef.current.map((layer) => layer.id === id ? { ...layer, name: name.trim() || layer.name } : layer)
    updateLayers(next)
    setLayerNameEdit(null)
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        event.shiftKey ? redo() : undo()
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        redo()
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        saveProject()
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
        copyLayer()
      } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
        pasteLayer()
      } else if ((event.key === 'Delete' || event.key === 'Backspace') && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        deleteLayer()
      } else if (event.key === 'Escape') {
        setSettingsOpen(false)
        setExportOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const activeLayerData = layers.find((layer) => layer.id === activeLayer)
  const visibleShapes = useMemo(() => shapeLibrary.filter((shape) => {
    const inGroup = shapeFilter === 'all' || shape.group === shapeFilter
    const inSearch = !shapeSearch || shape.name.toLowerCase().includes(shapeSearch.toLowerCase())
    return inGroup && inSearch
  }), [shapeFilter, shapeSearch])

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Palette size={21} strokeWidth={2.2} /></div>
          <span>Painter</span>
        </div>
        <div className="top-divider" />
        <nav className="document-actions" aria-label="Document actions">
          <button className="top-action" onClick={newCanvas}><FilePlus2 /><span>New</span></button>
          <button className="top-action" onClick={() => fileInputRef.current?.click()}><FolderOpen /><span>Open</span></button>
          <button className="top-action" onClick={saveProject}><Save /><span>Save</span></button>
        </nav>
        <div className="top-divider history-divider" />
        <div className="history-actions">
          <button className="top-action" onClick={undo} disabled={!history.undo.length}><Undo2 /><span>Undo</span></button>
          <button className="top-action" onClick={redo} disabled={!history.redo.length}><Redo2 /><span>Redo</span></button>
        </div>
        <div className="top-spacer" />
        <button className="icon-button settings-button" aria-label="Canvas settings" title="Canvas settings" onClick={() => { setSizeDraft(size); setSettingsOpen(true) }}><Settings /></button>
        <div className="top-divider export-divider" />
        <div className="export-wrap">
          <button className="export-button" onClick={() => setExportOpen(!exportOpen)}><Download /><span>Export</span><ChevronDown size={15} /></button>
          {exportOpen && <div className="dropdown export-menu">
            <button onClick={() => download('png')}>Export as PNG <span>Transparent</span></button>
            <button onClick={() => download('jpg')}>Export as JPG <span>White background</span></button>
            <button onClick={() => download('svg')}>Export as SVG <span>SVG image wrapper</span></button>
            <div className="menu-divider" />
            <button onClick={exportProject}>Download project <span>.painter</span></button>
          </div>}
        </div>
      </header>

      <div className="workspace">
        <aside className="tools-panel panel">
          <div className="section-title">Tools</div>
          <div className="tool-list">
            {tools.map(({ id, name, Icon }) => (
              <button key={id} className={`tool-button ${tool === id ? 'active' : ''}`} onClick={() => changeTool(id)} title={name}>
                <Icon size={19} strokeWidth={2.2} /><span>{name}</span>
              </button>
            ))}
          </div>
          <div className="panel-separator" />
          <div className="section-title color-title">Colors</div>
          <div className="swatches">
            {palette.map((swatch) => <button key={swatch} className={`swatch ${color.toLowerCase() === swatch.toLowerCase() ? 'selected' : ''}`} style={{ '--swatch': swatch }} onClick={() => { setColor(swatch); setCustomColor(swatch) }} title={swatch} />)}
          </div>
          <div className="color-picker-row">
            <button className="color-plane" style={{ '--chosen-color': customColor }} onClick={() => colorInputRef.current?.click()} aria-label="Choose custom color"><span /></button>
            <button className="hue-strip" onClick={() => colorInputRef.current?.click()} aria-label="Choose color hue"><span /></button>
            <input ref={colorInputRef} className="hidden-input" type="color" value={customColor} onChange={(event) => { setCustomColor(event.target.value); setColor(event.target.value) }} />
          </div>
          <div className="active-color"><span style={{ background: color }} /> <span>{color.toUpperCase()}</span><button onClick={() => colorInputRef.current?.click()} aria-label="Edit color"><Pipette size={14} /></button></div>
          <div className="panel-separator" />
          <div className="section-title color-title">Shape library</div>
          <div className="shape-search-wrap">
            <input aria-label="Search shapes" placeholder="Search shapes..." value={shapeSearch} onChange={(event) => setShapeSearch(event.target.value)} />
          </div>
          <div className="shape-filter-row">
            {Object.entries(shapeGroups).map(([key, label]) => (
              <button key={key} className={shapeFilter === key ? 'filter-active' : ''} onClick={() => setShapeFilter(key)}>{label}</button>
            ))}
          </div>
          <div className="shape-library">
            {visibleShapes.length ? visibleShapes.map((shape) => (
              <button key={shape.id} className="shape-button" onClick={() => insertShape(shape)} title={shape.name}>
                <span className="shape-thumb" dangerouslySetInnerHTML={{ __html: renderShapeSvg(shape, color, color) }} />
                <span>{shape.name}</span>
              </button>
            )) : <div className="shape-empty">No shapes found</div>}
          </div>
        </aside>

        <section className="canvas-column">
          <div className="canvas-stage" ref={stageRef}>
            <div className="canvas-board-wrap" style={{ '--zoom': zoom / 100, '--board-ratio': `${size.width} / ${size.height}` }}>
              <div className={`canvas-board ${background === 'transparent' ? 'transparent-bg' : ''}`} style={{ aspectRatio: `${size.width} / ${size.height}` }}>
                {layers.slice().reverse().map((layer) => (
                  <canvas
                    key={layer.id}
                    ref={(element) => { if (element) canvasRefs.current[layer.id] = element; else delete canvasRefs.current[layer.id] }}
                    className={`drawing-layer ${layer.id === activeLayer ? 'current-layer' : ''}`}
                    style={{ zIndex: layers.length - layers.indexOf(layer), opacity: layer.visible ? layer.opacity / 100 : 0, pointerEvents: layer.id === activeLayer ? 'auto' : 'none' }}
                    onPointerDown={pointerDown}
                    onPointerMove={pointerMove}
                    onPointerUp={pointerUp}
                    onPointerCancel={pointerUp}
                  />
                ))}
              </div>
            </div>
          </div>
          <footer className="bottom-bar">
            <div className="brush-controls">
              <label className="slider-control size-control"><span>Brush Size</span><input type="range" min="1" max="80" value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} /><output>{brushSize}</output></label>
              <div className="control-separator" />
              <label className="slider-control opacity-control"><span>Opacity</span><input type="range" min="1" max="100" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} /><output>{opacity}%</output></label>
            </div>
            <div className="zoom-controls">
              <button className="icon-button small" onClick={() => setZoom((value) => Math.max(25, value - 10))} aria-label="Zoom out"><ZoomOut /></button>
              <span className="zoom-value">{zoom}%</span>
              <button className="icon-button small" onClick={() => setZoom((value) => Math.min(200, value + 10))} aria-label="Zoom in"><ZoomIn /></button>
              <div className="control-separator" />
              <button className="icon-button small fit-button" onClick={() => setZoom(100)} aria-label="Reset zoom" title="Reset zoom"><Maximize /></button>
            </div>
          </footer>
        </section>

        <aside className="layers-panel panel">
          <div className="layers-heading"><div className="section-title">Layers</div><button className="icon-button small add-icon" onClick={addLayer} aria-label="Add layer"><Plus /></button></div>
          <div className="layers-list">
            {layers.map((layer) => (
              <div key={layer.id} className={`layer-card ${layer.id === activeLayer ? 'selected' : ''}`} onClick={() => setActiveLayer(layer.id)}>
                <button className="layer-eye" aria-label={layer.visible ? 'Hide layer' : 'Show layer'} onClick={(event) => { event.stopPropagation(); updateLayers(layersRef.current.map((item) => item.id === layer.id ? { ...item, visible: !item.visible } : item)) }}>{layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                <div className={`layer-thumb ${background === 'transparent' ? 'transparent-bg' : ''}`}><canvas ref={(element) => { if (element) { const image = new window.Image(); image.onload = () => { const context = element.getContext('2d'); context.clearRect(0, 0, element.width, element.height); context.drawImage(image, 0, 0, element.width, element.height) }; image.src = layer.data } }} width="64" height="52" /></div>
                <div className="layer-info">
                  {layerNameEdit === layer.id ? <input autoFocus className="rename-input" defaultValue={layer.name} onBlur={(event) => saveLayerName(layer.id, event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') saveLayerName(layer.id, event.currentTarget.value); if (event.key === 'Escape') setLayerNameEdit(null) }} onClick={(event) => event.stopPropagation()} /> : <span className="layer-name">{layer.name}</span>}
                  <div className="layer-opacity"><span>{layer.opacity}%</span><input aria-label={`${layer.name} opacity`} type="range" min="0" max="100" value={layer.opacity} onClick={(event) => event.stopPropagation()} onChange={(event) => updateLayers(layersRef.current.map((item) => item.id === layer.id ? { ...item, opacity: Number(event.target.value) } : item))} /></div>
                </div>
                <div className="layer-menu-wrap">
                  <button className="layer-menu-trigger" aria-label="Layer options" onClick={(event) => { event.stopPropagation(); setMenuLayer(menuLayer === layer.id ? null : layer.id) }}><MoreVertical size={17} /></button>
                  {menuLayer === layer.id && <div className="dropdown layer-menu" onClick={(event) => event.stopPropagation()}>
                    <button onClick={() => { setLayerNameEdit(layer.id); setMenuLayer(null) }}>Rename layer</button>
                    <button onClick={() => { moveLayer(layer.id, -1); setMenuLayer(null) }}>Move up</button>
                    <button onClick={() => { moveLayer(layer.id, 1); setMenuLayer(null) }}>Move down</button>
                    <button className="danger" onClick={() => { deleteLayer(layer.id); setMenuLayer(null) }}>Delete layer</button>
                  </div>}
                </div>
              </div>
            ))}
          </div>
          <div className="layer-footer">
            <div className="layer-quick-actions">
              <button className="icon-button small" title="Move layer up" onClick={() => moveLayer(activeLayer, -1)}><ArrowUp /></button>
              <button className="icon-button small" title="Move layer down" onClick={() => moveLayer(activeLayer, 1)}><ArrowDown /></button>
              <button className="icon-button small" title="Duplicate layer" onClick={duplicateLayer}><Copy /></button>
              <button className="icon-button small danger-hover" title="Delete layer" onClick={() => deleteLayer()}><Trash2 /></button>
            </div>
            <button className="add-layer-button" onClick={addLayer}><Plus size={15} /> Add Layer</button>
            <button className="clear-layer-button" onClick={clearCanvas}><Trash2 size={14} /> Clear active layer</button>
          </div>
        </aside>
      </div>

      <div className="statusline"><span><span className="status-dot" />{status}</span><span>{toolLabels[tool]} <b>·</b> {size.width} × {size.height}px <b>·</b> {layers.length} {layers.length === 1 ? 'layer' : 'layers'}</span></div>

      <input ref={fileInputRef} className="hidden-input" type="file" accept="image/*,.painter,.json,application/json" onChange={(event) => { openFile(event.target.files?.[0]); event.target.value = '' }} />

      {settingsOpen && <div className="modal-backdrop" onClick={() => setSettingsOpen(false)}>
        <section className="settings-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <div className="modal-heading"><div><span className="modal-eyebrow">CANVAS</span><h2 id="settings-title">Canvas settings</h2></div><button className="icon-button" onClick={() => setSettingsOpen(false)} aria-label="Close"><X /></button></div>
          <p className="modal-copy">Set up a canvas that's the right size for your next idea.</p>
          <div className="dimension-fields">
            <label>Width <div className="number-field"><input type="number" min="1" max="4000" value={sizeDraft.width} onChange={(event) => setSizeDraft({ ...sizeDraft, width: event.target.value })} /><span>px</span></div></label>
            <span className="dimension-cross">×</span>
            <label>Height <div className="number-field"><input type="number" min="1" max="4000" value={sizeDraft.height} onChange={(event) => setSizeDraft({ ...sizeDraft, height: event.target.value })} /><span>px</span></div></label>
          </div>
          <div className="background-choice"><span>Canvas background</span><div><button className={background === 'white' ? 'chosen' : ''} onClick={() => setBackground('white')}><span className="background-swatch white-swatch" />White</button><button className={background === 'transparent' ? 'chosen' : ''} onClick={() => setBackground('transparent')}><span className="background-swatch checker-swatch" />Transparent</button></div></div>
          <div className="modal-actions"><button className="cancel-button" onClick={() => setSettingsOpen(false)}>Cancel</button><button className="primary-button" onClick={changeCanvasSize}>Apply size</button></div>
        </section>
      </div>}
    </main>
  )
}

export default App
