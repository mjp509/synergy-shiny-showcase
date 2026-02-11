# Random Pokémon Generator & Bingo Feature Documentation

## Overview

The Random Pokémon Generator allows users to create randomized Pokémon selections for gameplay challenges, with support for weighted tier-based selection and Shiny Bingo functionality. Users can generate cards in multiple sizes (3x3, 4x4, 5x5) and track bingo progress with interactive cell marking and win animations.

## Architecture

### Components & Files

#### 1. **RandomPokemon Page** (`src/pages/RandomPokemon/RandomPokemon.jsx`)
- Main generator interface with mode selection
- Bingo card display and interaction
- Settings panel for customization
- Win detection and celebration animation

**Key State Variables:**
```javascript
const [mode, setMode] = useState('generator')        // 'generator' or 'bingo'
const [selectedPokemon, setSelectedPokemon] = useState([])
const [cardSize, setCardSize] = useState(3)          // 3, 4, or 5
const [markedCells, setMarkedCells] = useState(new Set())  // Bingo progress
const [hasWon, setHasWon] = useState(false)
const [difficulty, setDifficulty] = useState('all')  // Tier filter
```

**Key Functions:**
- `generateRandomPokemon()` - Weighted tier selection
- `generateBingoCard()` - Creates unique bingo grid
- `markCell()` - Toggle cell marked state
- `checkWinCondition()` - Detect bingo patterns
- `triggerWinAnimation()` - Fireworks celebration

#### 2. **useTierData Hook** (`src/hooks/useTierData.js`)
- Loads tier definitions from `src/data/tier_pokemon.json`
- Provides Pokemon-to-tier mapping
- Creates tier-filtered selection pools

#### 3. **Randomizer Tiers** (`src/data/randomizer_tiers.json`)
- Alternative tier groupings for challenge runs
- Special categories: "Nuzlocke", "Speedrun", "Monotype"

**Structure:**
```javascript
{
  "easy": ["tier_0", "tier_1"],           // Only common Pokemon
  "normal": ["tier_0", "tier_1", "tier_2"], // Common + Uncommon
  "hard": ["tier_2", "tier_3", "tier_4"],    // Challenging Pokemon
  "extreme": ["tier_4", "tier_5", "tier_6", "tier_7"], // Rare + Legendary
  "all": ["tier_0", "tier_1", "tier_2", "tier_3", "tier_4", "tier_5", "tier_6", "tier_7"]
}
```

### Data Flow

#### Generator Mode
```
User clicks "Generate"
        ↓
Select difficulty (easy/normal/hard/extreme)
        ↓
Load Pokemon from tier_pokemon.json filtered by difficulty
        ↓
Weighted random selection (100-300 Pokemon typically)
        ↓
Display grid with pagination
```

#### Bingo Mode
```
User selects card size (3x3/4x4/5x5)
        ↓
Generate unique Pokemon for grid (9/16/25 required)
        ↓
Display bingo card with clickable cells
        ↓
User marks caught Pokemon
        ↓
Check for win patterns on each mark
        ↓
Trigger animation on bingo/full card completion
```

### Bingo Win Detection

```javascript
// Pattern detection
const PATTERNS = [
  // Rows
  ...Array(cardSize).fill().map((_, i) => 
    Array(cardSize).fill().map((_, j) => i * cardSize + j)
  ),
  // Columns
  ...Array(cardSize).fill().map((_, i) => 
    Array(cardSize).fill().map((_, j) => j * cardSize + i)
  ),
  // Diagonals
  Array(cardSize).fill().map((_, i) => i * (cardSize + 1)),
  Array(cardSize).fill().map((_, i) => (i + 1) * (cardSize - 1))
]

const hasWon = PATTERNS.some(pattern => 
  pattern.every(idx => markedCells.has(idx))
)
```

### Win Animation

**Uses Canvas fireworks:**
```javascript
const createFireworks = () => {
  const canvas = document.getElementById('fireworks')
  const ctx = canvas.getContext('2d')
  
  // Create multiple particles
  const particles = Array(100).fill().map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 8,
    vy: (Math.random() - 0.5) * 8,
    life: 1,
    color: `hsl(${Math.random() * 360}, 100%, 50%)`
  }))
  
  // Animate particles
  const animate = () => {
    particles.forEach(p => {
      p.x += p.vx
      p.y += p.vy
      p.life -= 0.02
      // Draw particle...
    })
  }
}
```

### Integration with Shinyboard.net

- Optional: Load user's caught shinies from Shinyboard API
- Auto-mark common shinies in bingo
- Share bingo results to social media

**API Call:**
```javascript
const loadUserShinies = async (username) => {
  // Query Shinyboard.net API
  const shinies = await fetch(`https://api.shinyboard.net/user/${username}`)
    .then(r => r.json())
  
  // Auto-mark matching cells
  shinies.forEach(shiny => {
    const cellIndex = bingoCard.findIndex(p => 
      normalizeName(p) === normalizeName(shiny.name)
    )
    if (cellIndex !== -1) {
      markedCells.add(cellIndex)
    }
  })
}
```

## How to Extend

### Adding New Difficulty Levels

**Update `src/data/randomizer_tiers.json`:**
```javascript
{
  "legendary-only": ["tier_6", "tier_7"],
  "typelock-water": {
    // Custom logic for type-specific runs
    type: "Water",
    tiers: ["tier_0", "tier_1", "tier_2", "tier_3"]
  },
  "monotype-lock": {
    // Similar to above but enforced per-card
    type: "user-selected",
    tiers: ["tier_0", "tier_1", "tier_2"]
  }
}
```

**Update UI selector:**
```jsx
<select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
  <option value="easy">Easy (Common only)</option>
  <option value="normal">Normal (Common + Uncommon)</option>
  <option value="hard">Hard (Rare)</option>
  <option value="extreme">Extreme (Legendary)</option>
  <option value="legendary-only">🔥 Legendary Only</option>
</select>
```

### Adding Card Size Options

```javascript
const CARD_SIZES = [2, 3, 4, 5, 6]  // Add 6x6 = 36 Pokemon

// Adjust bingo card generation
const generateBingoCard = (size) => {
  const poolSize = size * size
  return selectRandomUnique(allPokemon, poolSize)
}
```

### Custom Bingo Rules

```javascript
// Variant: Four Corners
const checkFourCorners = (cardSize, markedCells) => {
  const corners = [
    0,                          // top-left
    cardSize - 1,               // top-right
    (cardSize - 1) * cardSize,  // bottom-left
    cardSize * cardSize - 1     // bottom-right
  ]
  return corners.every(idx => markedCells.has(idx))
}

// Variant: X Pattern (both diagonals)
const checkXPattern = (cardSize, markedCells) => {
  const mainDiag = Array(cardSize).fill().map((_, i) => i * (cardSize + 1))
  const antiDiag = Array(cardSize).fill().map((_, i) => (i + 1) * (cardSize - 1))
  const allDiag = [...mainDiag, ...antiDiag]
  return allDiag.every(idx => markedCells.has(idx))
}

// Variant: Full Card (all cells marked)
const checkFullCard = (cardSize, markedCells) => {
  return markedCells.size === cardSize * cardSize
}
```

### Persistence & Sharing

```javascript
// Save bingo to localStorage
const saveBingo = () => {
  localStorage.setItem('currentBingo', JSON.stringify({
    pokemon: bingoCard,
    marked: Array.from(markedCells),
    size: cardSize,
    startTime: Date.now()
  }))
}

// Load previous bingo
const loadBingo = () => {
  const saved = localStorage.getItem('currentBingo')
  if (saved) {
    const data = JSON.parse(saved)
    setBingoCard(data.pokemon)
    setMarkedCells(new Set(data.marked))
  }
}

// Share to social media
const shareResult = () => {
  const message = `Just completed a ${cardSize}x${cardSize} Bingo! 🎉`
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`)
}
```

## Performance Considerations

- **Random Selection**: Using Fisher-Yates shuffle for O(n) complexity
- **Bingo Detection**: Check win patterns on each mark (O(patterns) complexity)
- **Canvas Animation**: RequestAnimationFrame for smooth 60fps firewords
- **Local Storage**: Automatic cleanup after 7 days (session bingo only)

## UI/UX Features

### Cell Styling States
```css
.bingoCell {
  border: 2px solid #ccc;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.bingoCell:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.bingoCell.marked {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.bingoCell.center {
  /* Free space in middle of large cards */
  background: #f0f0f0;
  font-weight: bold;
  text-decoration: line-through;
}
```

### Responsive Grid Layout
```css
@media (max-width: 768px) {
  .bingoGrid {
    max-width: 300px;
    grid-auto-rows: 60px;
  }
}

@media (max-width: 480px) {
  .bingoGrid {
    max-width: 250px;
    grid-auto-rows: 50px;
  }
}
```

## Testing Checklist

- [ ] Generate button produces unique Pokemon
- [ ] Each difficulty level filters correctly
- [ ] Bingo card contains unique Pokemon
- [ ] Card sizes (3x3, 4x4, 5x5) generate correct grid
- [ ] Clicking cells marks them correctly
- [ ] Win detection works for all patterns
- [ ] Win animation triggers on bingo
- [ ] Fireworks animation is smooth and visible
- [ ] Responsive layout works on mobile
- [ ] localStorage persistence works
- [ ] Clearing bingo resets state
- [ ] Share buttons work (if implemented)

## Related Features

- **Pokédex**: Random generator can filter by Pokédex entries
- **Tier System**: Uses tier data for difficulty levels
- **Shinyboard Integration**: Optional auto-marking from API
- **Desktop Counter**: GIF counter generator can use same Pokemon list

## Common Issues & Solutions

### Issue: Marked cells don't stick after refresh
**Cause:** localStorage not implemented or browser privacy mode
**Solution:** Add persistence or session-based storage

### Issue: Win condition triggers too early
**Cause:** Pattern detection logic includes diagonal twice
**Solution:** Use Set to deduplicate pattern indices

### Issue: Animation too slow or stuttering
**Cause:** Canvas redraw frequency too high or DOM manipulation in loop
**Solution:** Use requestAnimationFrame and canvas-only rendering

### Issue: Random Pokemon repeats in card
**Cause:** Using random() twice instead of shuffle algorithm
**Solution:** Implement Fisher-Yates shuffle for unique selection
