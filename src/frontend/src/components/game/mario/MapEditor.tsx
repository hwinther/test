import { type JSX, useCallback, useEffect, useRef, useState } from 'react'

import type { LevelData } from './level-format'

import { LevelLoader } from './level-loader'
import './MapEditor.css'

interface MapEditorProps {
  readonly initialLevel?: LevelData
  readonly onClose?: () => void
  readonly onPlayTest?: (level: LevelData) => void
  readonly onSave?: (level: LevelData) => void
}

type Tool =
  | 'brick'
  | 'cloud'
  | 'coin'
  | 'enemy-goomba'
  | 'enemy-koopa'
  | 'eraser'
  | 'flag-pole'
  | 'ground'
  | 'pipe'
  | 'player-spawn'

/**
 *
 * @param root0
 * @param root0.initialLevel
 * @param root0.onClose
 * @param root0.onPlayTest
 * @param root0.onSave
 */
export function MapEditor({ initialLevel, onClose, onPlayTest, onSave }: MapEditorProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [level, setLevel] = useState<LevelData>(() => initialLevel || LevelLoader.createDefaultLevel())
  const [selectedTool, setSelectedTool] = useState<Tool>('ground')
  const [isDrawing, setIsDrawing] = useState(false)
  const [cameraX, setCameraX] = useState(0)
  const [cameraY, setCameraY] = useState(0)

  const getTileAtPosition = (x: number, y: number) => {
    const tileX = Math.floor((x + cameraX) / level.dimensions.tileSize)
    const tileY = Math.floor((y + cameraY) / level.dimensions.tileSize)

    if (tileY >= 0 && tileY < level.tiles.length && tileX >= 0 && tileX < level.tiles[0].length) {
      return { tileX, tileY }
    }
    return null
  }

  const placeTile = useCallback((tileX: number, tileY: number, tool: Tool) => {
    setLevel((prevLevel) => {
      const newLevel = { ...prevLevel }
      newLevel.tiles = prevLevel.tiles.map((row) => [...row])

      if (tool === 'eraser') {
        newLevel.tiles[tileY][tileX] = {
          id: `tile-${tileY}-${tileX}`,
          type: 'air',
        }
      } else if (tool.startsWith('enemy-')) {
        // Place enemy spawn point
        newLevel.tiles[tileY][tileX] = {
          id: `tile-${tileY}-${tileX}`,
          properties: {
            enemyType: tool.split('-')[1] as 'goomba' | 'koopa',
          },
          type: 'enemy-spawn',
        }
      } else if (tool === 'flag-pole') {
        newLevel.flagPole = { x: tileX, y: tileY }
        newLevel.tiles[tileY][tileX] = {
          id: `tile-${tileY}-${tileX}`,
          type: 'flag-pole',
        }
      } else if (tool === 'player-spawn') {
        newLevel.startPosition = { x: tileX, y: tileY }
        newLevel.tiles[tileY][tileX] = {
          id: `tile-${tileY}-${tileX}`,
          type: 'player-spawn',
        }
      } else {
        // Regular tile placement
        newLevel.tiles[tileY][tileX] = {
          id: `tile-${tileY}-${tileX}`,
          properties: tool === 'brick' ? { breakable: true } : undefined,
          type: tool as any,
        }
      }

      return newLevel
    })
  }, [])

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      const tilePos = getTileAtPosition(x, y)
      if (tilePos) {
        placeTile(tilePos.tileX, tilePos.tileY, selectedTool)
      }
    },
    [selectedTool, placeTile, cameraX, cameraY, level.dimensions.tileSize],
  )

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      setIsDrawing(true)
      handleCanvasClick(event)
    },
    [handleCanvasClick],
  )

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return
      handleCanvasClick(event)
    },
    [isDrawing, handleCanvasClick],
  )

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#87CEEB'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Save context for camera translation
    ctx.save()
    ctx.translate(-cameraX, -cameraY)

    const { tileSize } = level.dimensions

    // Draw grid
    ctx.strokeStyle = '#CCCCCC'
    ctx.lineWidth = 0.5

    const startX = Math.floor(cameraX / tileSize) * tileSize
    const endX = Math.ceil((cameraX + canvas.width) / tileSize) * tileSize
    const startY = Math.floor(cameraY / tileSize) * tileSize
    const endY = Math.ceil((cameraY + canvas.height) / tileSize) * tileSize

    for (let x = startX; x <= endX; x += tileSize) {
      ctx.beginPath()
      ctx.moveTo(x, startY)
      ctx.lineTo(x, endY)
      ctx.stroke()
    }

    for (let y = startY; y <= endY; y += tileSize) {
      ctx.beginPath()
      ctx.moveTo(startX, y)
      ctx.lineTo(endX, y)
      ctx.stroke()
    }

    // Draw tiles
    for (let row = 0; row < level.tiles.length; row++) {
      for (let col = 0; col < level.tiles[row].length; col++) {
        const tile = level.tiles[row][col]
        const x = col * tileSize
        const y = row * tileSize

        switch (tile.type) {
          case 'brick':
            ctx.fillStyle = '#CD853F'
            ctx.fillRect(x, y, tileSize, tileSize)
            break
          case 'cloud':
            ctx.fillStyle = '#F0F8FF'
            ctx.fillRect(x, y, tileSize, tileSize)
            break
          case 'coin':
            ctx.fillStyle = '#FFD700'
            ctx.beginPath()
            ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize / 3, 0, 2 * Math.PI)
            ctx.fill()
            break
          case 'enemy-spawn':
            ctx.fillStyle = tile.properties?.enemyType === 'koopa' ? '#228B22' : '#8B4513'
            ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8)
            ctx.fillStyle = '#FF0000'
            ctx.font = '12px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(tile.properties?.enemyType?.[0]?.toUpperCase() || 'E', x + tileSize / 2, y + tileSize / 2 + 4)
            break
          case 'flag-pole':
            ctx.fillStyle = '#8B4513'
            ctx.fillRect(x + tileSize / 2 - 2, y, 4, tileSize)
            ctx.fillStyle = '#FF0000'
            ctx.fillRect(x + tileSize / 2 + 2, y, tileSize / 2, tileSize / 3)
            break
          case 'ground':
            ctx.fillStyle = '#8B4513'
            ctx.fillRect(x, y, tileSize, tileSize)
            break
          case 'pipe':
            ctx.fillStyle = '#228B22'
            ctx.fillRect(x, y, tileSize, tileSize)
            break
          case 'player-spawn':
            ctx.fillStyle = '#00FF00'
            ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8)
            ctx.fillStyle = '#FFFFFF'
            ctx.font = '16px Arial'
            ctx.textAlign = 'center'
            ctx.fillText('P', x + tileSize / 2, y + tileSize / 2 + 6)
            break
        }

        // Draw tile border for non-air tiles
        if (tile.type !== 'air') {
          ctx.strokeStyle = '#000000'
          ctx.lineWidth = 1
          ctx.strokeRect(x, y, tileSize, tileSize)
        }
      }
    }

    // Draw start position if not explicitly marked
    const hasPlayerSpawn = level.tiles.some((row) => row.some((tile) => tile.type === 'player-spawn'))
    if (!hasPlayerSpawn) {
      const startX = level.startPosition.x * tileSize
      const startY = level.startPosition.y * tileSize
      ctx.fillStyle = 'rgba(0, 255, 0, 0.7)'
      ctx.fillRect(startX, startY, tileSize, tileSize)
      ctx.fillStyle = '#FFFFFF'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('START', startX + tileSize / 2, startY + tileSize / 2 + 6)
    }

    ctx.restore()
  }, [level, cameraX, cameraY])

  useEffect(() => {
    render()
  }, [render])

  const saveLevel = () => {
    onSave?.(level)
  }

  const playTestLevel = () => {
    onPlayTest?.(level)
  }

  const exportLevel = () => {
    const dataStr = JSON.stringify(level, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${level.name.replace(/\s+/g, '_')}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importLevel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const levelData = JSON.parse(e.target?.result as string) as LevelData
        setLevel(levelData)
      } catch (error) {
        console.error('Failed to import level:', error)
        alert('Invalid level file format')
      }
    }
    reader.readAsText(file)
  }

  const clearLevel = () => {
    if (confirm('Are you sure you want to clear the entire level?')) {
      setLevel(LevelLoader.createEmptyLevel(level.dimensions.width, level.dimensions.height, level.dimensions.tileSize))
    }
  }

  return (
    <div className="map-editor">
      <div className="map-editor-header">
        <h1>Mario Map Editor</h1>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="map-editor-toolbar">
        <div className="tool-section">
          <h3>Terrain</h3>
          {['ground', 'brick', 'cloud', 'pipe'].map((tool) => (
            <button
              className={selectedTool === tool ? 'active' : ''}
              key={tool}
              onClick={() => setSelectedTool(tool as Tool)}
              title={tool}
            >
              {tool}
            </button>
          ))}
        </div>

        <div className="tool-section">
          <h3>Items</h3>
          <button
            className={selectedTool === 'coin' ? 'active' : ''}
            onClick={() => setSelectedTool('coin')}
            title="coin"
          >
            coin
          </button>
        </div>

        <div className="tool-section">
          <h3>Entities</h3>
          {['enemy-goomba', 'enemy-koopa', 'player-spawn', 'flag-pole'].map((tool) => (
            <button
              className={selectedTool === tool ? 'active' : ''}
              key={tool}
              onClick={() => setSelectedTool(tool as Tool)}
              title={tool.replace('enemy-', '').replace('-', ' ')}
            >
              {tool.replace('enemy-', '').replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="tool-section">
          <h3>Tools</h3>
          <button
            className={selectedTool === 'eraser' ? 'active' : ''}
            onClick={() => setSelectedTool('eraser')}
            title="eraser"
          >
            eraser
          </button>
        </div>

        <div className="tool-section">
          <h3>Actions</h3>
          <button onClick={saveLevel} title="Save level">
            Save
          </button>
          <button onClick={playTestLevel} title="Play test this level">
            Play Test
          </button>
          <button onClick={exportLevel} title="Export as JSON file">
            Export
          </button>
          <input accept=".json" id="import-file" onChange={importLevel} style={{ display: 'none' }} type="file" />
          <button onClick={() => document.getElementById('import-file')?.click()} title="Import from JSON file">
            Import
          </button>
          <button onClick={clearLevel} title="Clear entire level">
            Clear
          </button>
        </div>
      </div>

      <div className="map-editor-canvas-container">
        <canvas
          className="map-editor-canvas"
          height={400}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          ref={canvasRef}
          width={800}
        />

        <div className="camera-controls">
          <button onClick={() => setCameraX((x) => Math.max(0, x - 64))} title="Pan left">
            ←
          </button>
          <button onClick={() => setCameraX((x) => x + 64)} title="Pan right">
            →
          </button>
          <button onClick={() => setCameraY((y) => Math.max(0, y - 64))} title="Pan up">
            ↑
          </button>
          <button onClick={() => setCameraY((y) => y + 64)} title="Pan down">
            ↓
          </button>
          <button
            onClick={() => {
              setCameraX(0)
              setCameraY(0)
            }}
            title="Reset camera"
          >
            Home
          </button>
        </div>
      </div>

      <div className="level-properties">
        <div className="property-group">
          <label>
            Level Name:
            <input
              onChange={(e) => setLevel((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Level Name"
              type="text"
              value={level.name}
            />
          </label>

          <label>
            Author:
            <input
              onChange={(e) =>
                setLevel((prev) => ({
                  ...prev,
                  metadata: { ...prev.metadata, author: e.target.value },
                }))
              }
              placeholder="Author Name"
              type="text"
              value={level.metadata.author}
            />
          </label>

          <label>
            Difficulty:
            <select
              onChange={(e) =>
                setLevel((prev) => ({
                  ...prev,
                  metadata: { ...prev.metadata, difficulty: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5 },
                }))
              }
              value={level.metadata.difficulty}
            >
              <option value={1}>1 - Easy</option>
              <option value={2}>2 - Normal</option>
              <option value={3}>3 - Hard</option>
              <option value={4}>4 - Very Hard</option>
              <option value={5}>5 - Expert</option>
            </select>
          </label>
        </div>

        <div className="property-group">
          <span>
            Level Size: {level.dimensions.width} × {level.dimensions.height} tiles
          </span>
          <span>
            Camera: ({Math.floor(cameraX / 32)}, {Math.floor(cameraY / 32)})
          </span>
          <span>Selected Tool: {selectedTool.replace('-', ' ')}</span>
        </div>
      </div>
    </div>
  )
}
