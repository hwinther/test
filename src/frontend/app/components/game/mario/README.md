# Mario Game Map System

This Mario game now features a flexible map system that separates the game engine from level data, allowing for easy creation and sharing of custom levels.

## Architecture

### 1. **Level Format** (`level-format.ts`)

Defines the structured data format for levels:

- **LevelData**: Complete level definition with metadata, dimensions, tiles, and objects
- **LevelTile**: Individual tile data with type and properties
- **World**: Collection of levels with unlock requirements

### 2. **Level Loader** (`level-loader.ts`)

Converts level data into game objects:

- Parses tile grids into platforms, enemies, and collectibles
- Creates default levels programmatically
- Handles level validation and conversion

### 3. **Map Editor** (`MapEditor.tsx`)

Visual level creation tool:

- Tile-based editing interface
- Real-time preview
- Import/export functionality
- Play testing capabilities

## Features

### **Game Engine Improvements**

- ✅ Separated level data from game logic
- ✅ Support for custom levels
- ✅ Integrated map editor (Press 'E' in-game)
- ✅ Level import/export system
- ✅ Structured tile system
- ✅ Multiple worlds support (framework ready)

### **Map Editor Features**

- 🎨 **Visual Editing**: Point-and-click tile placement
- 🎮 **Play Testing**: Test levels instantly without leaving the editor
- 💾 **Save/Load**: Import and export levels as JSON files
- 🖼️ **Camera Controls**: Navigate large levels easily
- ⚙️ **Level Properties**: Set name, author, difficulty, and theme
- 🧩 **Multiple Tile Types**: Ground, brick, cloud, pipe, coin, enemies, flag pole

## How to Use

### **Playing with Custom Levels**

1. Open the game
2. Press `E` to enter the map editor
3. Create your level or import an existing one
4. Click "Play Test" to try your level

### **Creating Levels**

1. Open the map editor (`E` key)
2. Select tools from the toolbar:
   - **Terrain**: Ground, brick, cloud, pipe
   - **Items**: Coins
   - **Entities**: Enemies, spawn points, flag pole
   - **Tools**: Eraser
3. Click/drag to place tiles
4. Use camera controls to navigate
5. Set level properties (name, author, difficulty)
6. Save or export your level

### **Level Format**

```json
{
  "id": "my-level",
  "name": "My Custom Level",
  "version": "1.0.0",
  "metadata": {
    "author": "Player",
    "description": "A fun custom level",
    "difficulty": 3,
    "theme": "overworld"
  },
  "dimensions": {
    "width": 30,
    "height": 12,
    "tileSize": 32
  },
  "startPosition": { "x": 1, "y": 9 },
  "tiles": [...],  // 2D tile grid
  "objects": {
    "enemies": [...],
    "collectibles": [...],
    "spawners": [...]
  },
  "flagPole": { "x": 27, "y": 5 }
}
```

## Game Controls

### **Playing Mode**

- **Arrow Keys / WASD**: Move Mario
- **Space / Up Arrow**: Jump
- **Shift**: Run
- **E**: Open Map Editor
- **ESC**: Exit Game
- **R**: Restart (when game over/complete)

### **Editor Mode**

- **Click**: Place selected tile
- **Drag**: Paint multiple tiles
- **Arrow Buttons**: Pan camera
- **ESC**: Exit editor

## Technical Benefits

### **For Developers**

- **Modular Design**: Game engine separate from level data
- **Easy Testing**: Create test levels quickly
- **Data-Driven**: Levels defined in JSON format
- **Extensible**: Easy to add new tile types and mechanics

### **For Players**

- **Custom Content**: Create and share levels
- **Infinite Replayability**: Community-generated content
- **Learning Tool**: Understand game mechanics by building

## Example Levels

Check the `levels/` directory for example level files:

- `example-level.json`: Demonstrates the level format with various elements

## Future Enhancements

Possible additions to the system:

- **World Editor**: Create multi-level worlds with progression
- **Online Sharing**: Upload and download community levels
- **Advanced Tiles**: Moving platforms, switches, keys
- **Themes**: Different visual themes (underground, castle, underwater)
- **Scripting**: Custom behaviors and events
- **Multiplayer**: Collaborative level editing

## File Structure

```text
mario/
├── level-format.ts      # Type definitions for levels
├── level-loader.ts      # Level parsing and creation
├── MapEditor.tsx        # Visual level editor
├── MapEditor.css        # Editor styling
├── MarioGame.tsx        # Main game component (updated)
├── mario-types.ts       # Game object types
└── levels/              # Example level files
    └── example-level.json
```
