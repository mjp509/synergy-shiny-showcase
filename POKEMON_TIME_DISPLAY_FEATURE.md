# Pokemon Time Display Feature

## Overview
Implemented time-based encounter display for Pokémon on location routes, with converted season names and dynamic styling based on time of day.

## Features

### 1. Time Label Display
- Shows encounter time below each Pokémon sprite when a specific time is available
- Only displays when time is NOT "ALL"
- Formats as readable text (e.g., "Day/Morning/Summer" instead of "Day/Morning/SEASON0")

### 2. Season Conversion
- Automatically converts season codes to human-readable names:
  - `SEASON0` → Summer
  - `SEASON1` → Spring
  - `SEASON2` → Autumn
  - `SEASON3` → Winter

### 3. Time-Based Color Styling
- **Day/Morning encounters**: Gold background (#FFD700) with dark text
- **Night encounters**: Dark blue-gray background (#2c3e50) with light text
- Subtle tinted background on Pokemon cards for quick visual identification

### 4. Grass Type Display
- Shows "Grass" and "Dark Grass" labels below Pokémon sprite
- Both grass types now render correctly (previously only "Dark Grass" was shown)
- Labels positioned above time labels when both are present

### 5. Dynamic Layout Management
- Time labels automatically adjust position based on visible grass type labels
- Each grass type takes ~18px of space; time label positions below accordingly
- Responsive text sizing ensures long time strings fit within label bounds
- Font size: `0.65rem` with `wordBreak: 'break-word'` for proper text wrapping

### 6. Row Gap Improvements
- Enhanced vertical spacing between grid rows to prevent label overlap on smaller devices
- Responsive row-gap values across all breakpoints:
  - Desktop: 60px
  - 1400px and below: 55px
  - 1200px and below: 50px
  - 900px and below: 45px
  - 600px and below: 40px
  - 400px and below: 35px

## Implementation Details

### Modified Files
1. **Pokedex.jsx**
   - Added `convertTimeString()` helper function for season conversion
   - Modified `getEncounterDetailsForPokemon()` to extract and return time data
   - Updated encounter type map to include time information
   - Implemented time label rendering with dynamic positioning
   - Applied time-based background color styling to Pokemon cards

2. **Pokedex.module.css**
   - Added `row-gap` properties to `.grid` and all responsive breakpoints
   - Maintains responsive design across all device sizes

### Time Label Styling
```
Position: Absolute, below Pokemon sprite
Bottom: Calculated based on grass type count
Font Size: 0.65rem (bold)
Padding: 4px 8px
Border Radius: 4px
Max Width: 110px
Text Alignment: Center
Line Height: 1.2
```

### Data Structure
Time data flows through the encounter system:
```
pokemonData.location_area_encounters[].time
  ↓
getEncounterDetailsForPokemon() extracts & converts
  ↓
encounterTypeMap includes time
  ↓
Time label renders with proper styling
```

## Example Layouts

### Single Grass Type + Time
```
    🔵 (Pokemon sprite)
   Grass
   Night
```

### Both Grass Types + Time
```
    🔵 (Pokemon sprite)
 Grass Dark Grass
     Night
```

### Time Only (No Grass)
```
    🔵 (Pokemon sprite)
     Day/Morning
```

## Testing Checklist
- ✅ Time labels display correctly when time ≠ "ALL"
- ✅ Time labels hide when time = "ALL"
- ✅ Season names convert properly (SEASON0-3 → human names)
- ✅ Colors adjust based on day/night
- ✅ Both grass types render together
- ✅ Single grass types render
- ✅ Labels don't overflow on any device size
- ✅ Labels remain visible when Pokemon wraps to next row
- ✅ Responsive spacing maintains proper layout across breakpoints

## Future Enhancements
- Add additional time-based filtering in search/filter options
- Display probability percentages for specific time encounters
- Add visual indicators for limited-time encounters (seasonal)
