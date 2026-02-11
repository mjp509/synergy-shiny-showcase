# Pokédex Filtering & Search Feature Documentation

## Overview

The Pokédex page is the central hub for exploring and filtering Pokémon across multiple criteria. It supports advanced filtering by generation, type, ability, location, egg group, tier, rarity, and stats. Users can filter Shinies vs Living Dex and search by name.

## Architecture

### Components & Files

#### 1. **Pokedex Page** (`src/pages/Pokedex/Pokedex.jsx`)
- Main page component (~1900 lines)
- Manages all filter state simultaneously
- Dynamically renders filtered results
- Integrates with multiple custom hooks

**Key State Variables:**
```javascript
const [mode, setMode] = useState('shiny')              // 'shiny' or 'livingdex'
const [search, setSearch] = useState('')                // Pokemon name search
const [selectedRarities, setSelectedRarities] = useState([])
const [selectedTiers, setSelectedTiers] = useState([])
const [selectedTypes, setSelectedTypes] = useState([])
const [selectedEggGroups, setSelectedEggGroups] = useState([])
const [locationSearch, setLocationSearch] = useState('')
const [statMinimums, setStatMinimums] = useState({})    // Min HP, ATK, etc.
const [abilitySearch, setAbilitySearch] = useState('')
```

**Navigation State Handling:**
- Accepts `locationSearch` via React Router `location.state`
- Used when clicking location cards in Pokemon Detail page
- Automatically applies location filter on page load

#### 2. **useDatabase Hook** (`src/hooks/useDatabase.js`)
- Fetches the main shiny database from Cloudflare Workers
- Returns team members' caught shinies and ownership data
- Used for "Complete" tracking and ownership display

#### 3. **useTierData Hook** (`src/hooks/useTierData.js`)
- Loads tier information from `src/data/tier_pokemon.json`
- Provides Pokemon-to-tier lookup map
- Used for filtering by rarity tier

#### 4. **usePokemonSprites Hook** (`src/hooks/usePokemonSprites.js`)
- Manages Pokemon GIF/sprite assets
- Handles local fallback and remote loading
- Critical for legendary Pokemon handling

#### 5. **Pokedex.module.css** (`src/pages/Pokedex/Pokedex.module.css`)
- Grid layouts for Pokemon display
- Filter panel styling
- Responsive design for mobile

### Custom Helper Functions

#### `getEncounterTypeForPokemon(pokemonName, locationSearch)`
- Categorizes encounter types (Horde, Fishing, Headbutt, etc.)
- Filters by location to find specific route encounters
- Returns array of applicable encounter types

#### `getEncounterDetailsForPokemon(pokemonName, locationSearch, encounterType)`
- Gets detailed encounter info for a specific location/type combo
- Returns rarity, level, grass type, water type data
- Used for encounter type badge generation

#### `getAllTypeCombinations()`
- Extracts all possible type combinations from Pokemon data
- Used to populate type filter options
- Prevents hardcoding type list

### Filter Logic Flow

1. **Location Filtering**
   - Normalizes search: lowercase, replaces hyphens with spaces, trims whitespace
   - Matches against Pokemon location data
   - Format: "ROUTE 3 - Kanto"

2. **Type Filtering**
   - Checks both primary and secondary types
   - AND logic: Pokemon must match ALL selected types
   - Example: Select "Water" + "Flying" = only dual-type Pokemon matching both

3. **Stat Filtering**
   - Allows setting minimum values for HP, ATK, DEF, SP.ATK, SP.DEF, SPD
   - Uses >= comparison (if min HP = 75, shows Pokemon with 75+)

4. **Ability Filtering**
   - Searches Pokemon normal and hidden abilities
   - Case-insensitive matching

5. **Tier Filtering**
   - References `tier_pokemon.json` for Pokemon-to-tier mapping
   - "All" tier shows all Pokemon regardless of tier

## Key Features

### Location Card Integration
- When user clicks location card in Pokemon Detail, navigates with state
- Automatically sets location filter and populates search input
- Format: "ROUTE 3 - Kanto" (Location - Region)

### Synergy Data Toggle
- When enabled, shows only Pokemon relevant to current team/players
- Hides legendary egg group and incomplete entries
- Clears egg group filter when toggled on

### Responsive Search
- Debounced search input
- Real-time filtering
- Maintains filter state across navigation

## Data Files Referenced

### Tier & Rarity Data
- `src/data/tier_pokemon.json` - Pokemon grouped by rarity tier
- `src/data/randomizer_tiers.json` - Alternative tier definitions
- `src/data/pokemmo_data/pokemon-data.json` - PokeMMO location & encounter data

### Generation Data
- `src/data/generation.json` - Pokemon organized by generation
- Used for displaying evolution lines

### Stateful Data
- `src/data/streamers.json` - Team members for owner lookup
- `src/data/trophies.json` - Trophy tracking

## How to Extend

### Adding a New Filter Type

1. **Add state variable:**
```javascript
const [selectedNewFilter, setSelectedNewFilter] = useState([])
```

2. **Create filter helper function:**
```javascript
const getNewFilterOptions = () => {
  // Extract options from data
  return uniqueOptions
}
```

3. **Add to filtered results calculation:**
```javascript
const matchesNewFilter = selectedNewFilter.length === 0 || 
  selectedNewFilter.includes(pokemon.newProperty)
```

4. **Add UI controls:**
```jsx
<div className={styles.filterGroup}>
  <label>New Filter</label>
  {getNewFilterOptions().map(option => (
    <input
      type="checkbox"
      checked={selectedNewFilter.includes(option)}
      onChange={(e) => {
        if (e.target.checked) {
          setSelectedNewFilter([...selectedNewFilter, option])
        } else {
          setSelectedNewFilter(selectedNewFilter.filter(f => f !== option))
        }
      }}
    />
  ))}
</div>
```

### Modifying Encounter Logic

Edit `getEncounterTypeForPokemon()` and `getEncounterDetailsForPokemon()` functions to:
- Add new encounter types
- Modify rarity detection logic
- Add new encounter attributes

### Updating Location Data

Location data comes from `src/data/pokemmo_data/pokemon-data.json`. The format expected:
```javascript
{
  "pokemon-name": {
    "location_area_encounters": [
      {
        "location": "Route 3",
        "region_name": "Kanto",
        "rarity": "Common",
        "min_level": 20,
        "max_level": 25,
        "type": "Grass",
        "time": "All"
      }
    ]
  }
}
```

## Performance Considerations

- Combined filters run on client-side (no API calls)
- Uses memoization for expensive calculations
- Pokemon list regenerated only when filters change (via useMemo)
- Location suggestions cached to prevent recalculation

## Common Issues & Solutions

### Issue: Pokemon not appearing after location filter
**Solution:** Check `src/data/pokemmo_data/pokemon-data.json` has location data for that Pokemon

### Issue: Type filter not working
**Solution:** Verify both primary (`type1`) and secondary (`type2`) fields exist in Pokemon data

### Issue: Stat minimums not applying
**Solution:** Check stat values are actual numbers, not strings

### Issue: Location search shows "All Locations" but doesn't filter
**Solution:** Ensure `locationSearchInput` state is being set AND `locationSearch` state is being set (two separate states for display vs filtering)

## Related Features

- **Clickable Location Cards**: Click any location in Pokemon Detail to pre-filter Pokedex
- **Shiny Item Component**: Each Pokemon displayed is clickable and links to detail page
- **Tier System**: Reference `TROPHY_SYSTEM_FEATURE.md` for tier point scoring
