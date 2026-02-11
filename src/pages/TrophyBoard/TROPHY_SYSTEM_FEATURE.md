# Trophy System & Tier Management Feature Documentation

## Overview

The Trophy System manages team achievements, tier-based progression, and player trophies. It integrates with the tier point system where players earn points by catching Pokémon, with points scaled by tier rarity. The system supports trophy assignments, achievements tracking, and tier-based statistics.

## Architecture

### Components & Files

#### 1. **Trophy Board Page** (`src/pages/TrophyBoard/TrophyBoard.jsx`)
- Displays all team trophies and point leaderboards
- Shows tier breakdowns and point distributions
- Lists player achievements and contributions
- Integrates with tier point scoring

#### 2. **Trophy Shelf Component** (`src/components/TrophyShelf/TrophyShelf.jsx`)
- Displays player's personal trophies
- Shows trophy icons, names, and acquisition dates
- Interactive trophy details on hover
- Responsive grid layout

#### 3. **useTierData Hook** (`src/hooks/useTierData.js`)
- Loads and processes tier information from `src/data/tier_pokemon.json`
- Creates Pokemon-to-tier lookup map
- Used across multiple pages for tier-based filtering and scoring

#### 4. **useTrophies Hook** (`src/hooks/useTrophies.js`)
- Fetches trophy assignments from database/API
- Returns object mapping players to trophy arrays
- Used in Trophy Board and Player Page

**Hook Return Structure:**
```javascript
{
  'PlayerName': [
    {
      id: 'trophy-001',
      name: 'Generation Master',
      description: 'Caught all Gen 1 Pokémon',
      date: '2025-01-15',
      icon: 'gen1.png'
    }
  ]
}
```

#### 5. **Tier Points System** (`src/utils/points.js`)
- Calculates points earned per Pokémon based on tier rarity
- Scales rewards to encourage diverse catching

**Point Calculation:**
```javascript
// From src/data/tier_points.json
{
  "tier_0": 1,      // Common Pokemon = 1 point
  "tier_1": 2,
  "tier_2": 5,
  "tier_3": 10,
  "tier_4": 25,
  "tier_5": 50,     // Rare Pokemon = 50 points
  "tier_6": 100,
  "tier_7": 250     // Legendary/Mythical = 250 points
}
```

### Data Files

#### `src/data/tier_pokemon.json`
Associates each Pokémon with a rarity tier:
```javascript
{
  "tier_0": ["Pidgey", "Rattata", "Weedle"],  // Very Common
  "tier_1": ["Spearow", "Jigglypuff"],        // Common
  "tier_2": ["Pikachu", "Vulpix"],            // Uncommon
  // ...
  "tier_7": ["Mewtwo", "Mew", "Arceus"]       // Legendary/Mythical
}
```

#### `src/data/tier_points.json`
Point multipliers per tier for SHOTM (Shiny of the Month) scoring

#### `src/data/trophies.json`
Trophy definitions and player assignments:
```javascript
{
  "trophies": [
    {
      id: "tech-master",
      name: "Tech Master",
      description: "Contributed to website development",
      icon: "tech-master.png",
      type: "achievement"
    }
  ],
  "assignments": {
    "PlayerName": ["tech-master", "shiny-hunter"]
  }
}
```

### Components

#### Trophy Card Component
Displays individual trophy with:
- Trophy icon/image
- Trophy name
- Rarity badge (if applicable)
- Acquisition date
- Description on hover

#### Tier Badge Component
Shows Pokemon tier with color coding:
```
Tier 0-1: Gray (common)
Tier 2-3: Blue (uncommon)
Tier 4-5: Purple (rare)
Tier 6-7: Gold/Red (legendary)
```

### Integration Points

#### 1. **Pokédex Tier Filtering**
- References tier_pokemon.json
- Users can filter by tier rarity
- See page: POKEDEX_FEATURE.md

#### 2. **Database Syncing**
- useDatabase hook fetches player shinies
- Compares caught shinies against tier data
- Calculates earned points for each player

#### 3. **Player Pages**
- Each player profile displays personal trophies
- Shows point totals and tier breakdowns
- References PlayerPage documentation

#### 4. **SHOTM (Shiny of the Month)**
- Uses tier_points.json for scoring
- Winners calculated based on earned points
- Announced on home page

## How to Extend

### Adding a New Trophy

**Step 1:** Update `src/data/trophies.json`
```javascript
{
  "trophies": [
    // ... existing trophies
    {
      id: "new-trophy-id",
      name: "Trophy Name",
      description: "What this trophy represents",
      icon: "trophy-icon.png",
      type: "achievement",  // or "milestone", "seasonal", etc.
      earnedDate: "2025-02-01" // optional
    }
  ]
}
```

**Step 2:** Add icon file to `public/images/trophies/`

**Step 3:** Assign to players in assignments section:
```javascript
"assignments": {
  "PlayerName": ["new-trophy-id"],
  "AnotherPlayer": ["new-trophy-id", "existing-trophy"]
}
```

**Step 4:** Update TrophyShelf component if custom rendering needed

### Modifying Tier System

**To reclassify a Pokémon's tier:**
1. Edit `src/data/tier_pokemon.json`
2. Move Pokémon from one tier_X array to another
3. Point values automatically update based on new tier
4. Redeploy - existing data remains unchanged

**To adjust point values** (affects future SHOTM rounds):
1. Edit `src/data/tier_points.json`
2. Modify tier_0 through tier_7 values
3. Run new point calculations for upcoming SHOTM

### Adding Custom Trophy Logic

```javascript
// Example: Award trophy on milestone
const checkMilestones = (playerData) => {
  const shinies = playerData.shinies
  
  // Gen Master - caught all Gen 1
  if (hasAllGeneration(shinies, 1)) {
    assignTrophy(playerData.id, 'gen-master-1')
  }
  
  // Shiny Hoarder - 100+ shinies
  if (shinies.length >= 100) {
    assignTrophy(playerData.id, 'hoarder-100')
  }
}
```

### Creating Seasonal Trophies

```javascript
// Top 3 winners from May SHOTM
const seasonalTrophies = {
  "may-2025-first": { name: "May Champion", points: 1000 },
  "may-2025-second": { name: "May Runner-Up", points: 750 },
  "may-2025-third": { name: "May Third Place", points: 500 }
}
```

## Point Calculation Flow

```
Player catches Shiny Pokémon
        ↓
Look up Pokémon tier (tier_pokemon.json)
        ↓
Get point value for tier (tier_points.json)
        ↓
Add points to player total
        ↓
Check against milestone thresholds
        ↓
Award trophies if milestones met
        ↓
Update leaderboard display
```

## Performance Considerations

- **Tier Lookups**: Cached via useTierData hook (only loads once)
- **Trophy Rendering**: Memoized components prevent unnecessary re-renders
- **Point Calculations**: Done client-side on shiny data (no API calls)
- **Leaderboard**: Sorted on mount, updated on data refresh

## Database Integration

**API Endpoint for trophies:**
- Cloudflare Worker: `adminpage.hypersmmo.workers.dev/trophies`
- Returns trophy assignments and metadata
- Updates propagated to all connected clients

**API Endpoint for player points:**
- Calculates total from shiny catches
- Tier-weighted based on tier_points.json
- Used for SHOTM rankings

## Common Issues & Solutions

### Issue: Trophy not showing for eligible player
**Cause:** Trophy ID doesn't match in trophies.json assignments
**Solution:** Verify exact string match in assignments object

### Issue: Points not updating after catching shiny
**Cause:** Database hasn't synced or tier data missing
**Solution:**
- Check useDatabase hook is refetching
- Verify Pokemon exists in tier_pokemon.json
- Manually trigger data refresh

### Issue: Tier colors not displaying correctly
**Cause:** CSS tier class names don't match tier level
**Solution:** Check TrophyShelf.module.css has all tier ranges (0-7)

### Issue: SHOTM scores incorrect
**Cause:** Outdated tier_points.json or Pokemon miscategorized
**Solution:**
- Verify all tier_points.json values
- Check Pokemon tier assignments
- Manually recalculate for affected players

## Testing Checklist

- [ ] All trophies display in Trophy Board
- [ ] Player trophies show on individual player pages
- [ ] Point totals match manual calculation
- [ ] Tier filter works in Pokédex
- [ ] Tier colors display consistently
- [ ] Trophy icons load without 404s
- [ ] New trophy assignments appear immediately
- [ ] Tier reclassification updates points correctly
- [ ] Seasonal trophies display with correct badges
- [ ] Leaderboard sorts by points descending

## Related Features

- **Pokédex Filtering**: See POKEDEX_FEATURE.md for tier filtering
- **Player Pages**: Individual player trophy displays
- **Admin Panel**: Manage trophy assignments and tiers
- **SHOTM Event**: Uses tier points for scoring
