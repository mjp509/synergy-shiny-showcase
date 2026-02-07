# Team Synergy Shiny Showcase - Developer Guide

A React-based SPA that showcases Pokemon shiny collections for the Team Synergy gaming community. This guide is for developers maintaining and updating the codebase.

---

## Table of Contents

- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Routing](#routing)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Key Components](#key-components)
- [Custom Hooks](#custom-hooks)
- [Utilities](#utilities)
- [Configuration Files](#configuration-files)
- [Deployment](#deployment)
- [Caching Strategy](#caching-strategy)
- [Development Notes](#development-notes)

---

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | React | 19.0.0 |
| Build Tool | Vite | 6.0.0 |
| Routing | React Router DOM | 6.28.0 |
| Data Fetching | @tanstack/react-query | 5.62.0 |
| ZIP Generation | jszip | 3.10.1 |
| GIF Parsing | omggif | 1.0.10 |
| Deployment | GitHub Pages | - |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd synergy-shiny-showcase

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR (http://localhost:5173/) |
| `npm run build` | Build for production (outputs to `/dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run sitemap` | Generate sitemap via `src/utils/sitemap-builder.js` |

---

## Project Structure

```
src/
├── api/                    # API configuration
│   └── endpoints.js        # Centralized endpoint definitions
│
├── components/             # Reusable UI components
│   ├── BackButton/         # Context-aware back navigation
│   ├── InfoBox/            # Hover info tooltips
│   ├── Navbar/             # Navigation with mobile menu
│   ├── PlayerCard/         # Player info card with shiny preview
│   ├── SearchBar/          # Search input for filtering
│   ├── ShinyItem/          # Individual shiny Pokemon display
│   ├── StarField/          # Animated background
│   └── TrophyShelf/        # Trophy display grid
│
├── context/                # React Context providers
│   └── AdminContext.jsx    # Admin authentication state
│
├── data/                   # Static reference data (JSON)
│   ├── generation.json     # Pokemon by generation (evolution lines)
│   ├── tier_pokemon.json   # Pokemon grouped by rarity tier
│   ├── tier_points.json    # Points per tier (for SHOTM scoring)
│   ├── randomizer_tiers.json # Tiers for randomizer tool
│   ├── streamers.json      # Team streamer Twitch usernames
│   └── trophies.json       # Trophy definitions & assignments
│
├── hooks/                  # Custom React hooks
│   ├── useDatabase.js      # Query main shiny database
│   ├── useDocumentHead.js  # Dynamic page title, meta tags & canonical URLs
│   ├── useShinyData.js     # Fetch user shiny data from Shinyboard.net
│   ├── useStreamers.js     # Query live/offline streamer status
│   ├── useTierData.js      # Load Pokemon tier classifications
│   ├── useTieredShinies.js # Group shinies by tier for SHOTM display
│   └── useTrophies.js      # Load trophy data
│
├── pages/                  # Route-level page components
│   ├── Admin/              # Admin login & management panel
│   │   ├── components/     # Admin-specific UI components
│   │   └── hooks/          # Admin-specific hooks
│   ├── CounterGenerator/   # GIF to ZIP converter for PokeMMO
│   ├── NotFound/           # 404 page
│   ├── PlayerPage/         # Individual player's collection
│   ├── Pokedex/            # Pokemon dex tracker
│   ├── RandomPokemon/      # Random Pokemon generator with bingo
│   ├── SHOTM/              # Shiny Hunters of the Month leaderboard
│   ├── Showcase/           # Main landing page (player grid)
│   ├── Streamers/          # Team streamers with Twitch status
│   ├── TrophyBoard/        # Trophy showcase grid
│   └── TrophyPage/         # Individual trophy details
│
├── utils/                  # Utility functions
│   ├── assets.js           # Asset URL helper (handles base path)
│   ├── bingo.js            # Bingo card game logic
│   ├── points.js           # Shiny point calculation logic
│   ├── pokemon.js          # Pokemon name normalization & image URLs
│   └── sitemap-builder.js  # Generates sitemap.xml for SEO
│
├── App.jsx                 # Main routing & layout
├── main.jsx                # App entry point with providers
└── index.css               # Global styles (dark theme)

public/
├── 404.html                # SPA redirect handler for GitHub Pages
├── favicon.png             # Site icon
├── CNAME                   # GitHub Pages custom domain
├── robots.txt              # Search engine crawl rules
├── sitemap.xml             # Sitemap for SEO
├── service-worker.js       # Offline caching service worker
├── images/                 # UI images (arrows, icons, etc.)
│   └── pokemon_gifs/       # Local Pokemon GIF sprites (tier_0/ through tier_7/)
└── xml/                    # PokeMMO counter template files
```

---

## Routing

Routes are defined in `src/App.jsx` using React Router v6.

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Showcase` | Home page - player card grid |
| `/player/:playerName` | `PlayerPage` | Individual player's shiny collection |
| `/shotm` | `SHOTM` | Shiny Hunters of the Month leaderboard |
| `/pokedex` | `Pokedex` | Pokemon dex tracker (shiny & living dex) |
| `/streamers` | `Streamers` | Team streamers with Twitch status |
| `/trophy-board` | `TrophyBoard` | Trophy grid showcase |
| `/trophy/:trophyName` | `TrophyPage` | Individual trophy details |
| `/counter-generator` | `CounterGenerator` | GIF to ZIP converter tool |
| `/random-pokemon-generator` | `RandomPokemon` | Random Pokemon + bingo game |
| `/admin` | `Admin` | Admin login page |
| `/admin/panel` | `AdminPanel` | Admin management interface (protected) |
| `*` | `NotFound` | 404 fallback |

---

## API Endpoints

Endpoints are centralized in `src/api/endpoints.js`.

### Backend API (Cloudflare Workers)

Base URL: `https://adminpage.hypersmmo.workers.dev/admin`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `API.database` | GET | Fetch main shiny database |
| `API.streamers` | GET | Fetch team streamer list |
| `API.adminCheck` | POST | Verify admin credentials |
| `API.updateDatabase` | POST | Update shiny database (admin) |
| `API.updateStreamers` | POST | Update streamer list (admin) |
| `API.adminLog` | GET | Fetch admin action log |

### External APIs

| Endpoint | Description |
|----------|-------------|
| `API.twitchStreamers` | Get Twitch live status via `twitch-api.hypersmmo.workers.dev` |
| `API.pokemonSprite(name)` | Get local Pokemon GIF path (falls back to PokemonDB on error) |

### Example Usage

```javascript
import { API } from '../api/endpoints';

// Fetch database
const response = await fetch(API.database);
const data = await response.json();

// Get Pokemon sprite URL (local gif path)
const spriteUrl = API.pokemonSprite('pikachu');
```

---

## Data Models

### Player Database Structure

```javascript
{
  "PlayerName": {
    shiny_count: 42,
    shinies: {
      "1": {
        Pokemon: "Pikachu",
        Month: "January",
        Year: "2024",
        Favourite: "yes" | "no",
        Sold: "yes" | "no",
        Alpha: "yes" | "no",
        "Secret Shiny": "yes" | "no",
        Egg: "yes" | "no",
        Safari: "yes" | "no",
        Event: "yes" | "no",
        "Honey Tree": "yes" | "no"
        // Additional trait fields...
      }
    }
  }
}
```

### Streamer Database

```javascript
{
  "PlayerName": {
    twitch_username: "twitch_handle"
  }
}
```

### Trophy Structure

Located in `src/data/trophies.json`:

```javascript
{
  trophies: {
    "TrophyName": "path/to/image.png"
  },
  trophyAssignments: {
    "TrophyName": ["Player1", "Player2"]
  }
}
```

### Tier Data

Located in `src/data/tier_pokemon.json` and `src/data/tier_points.json`:

```javascript
// tier_pokemon.json - Pokemon grouped by tier
{
  "Tier 0": ["bulbasaur", "charmander", ...],
  "Tier 1": ["absol", "aerodactyl", ...],
  // Tier 0 through Tier 7
}

// tier_points.json - Points per tier
{
  "Tier 0": 30,
  "Tier 1": 25,
  // Tier 0 (30) down to Tier 7 (2)
}
```

---

## Key Components

### `<PlayerCard />`
Displays a player's summary with shiny count and preview images.
- **Location:** `src/components/PlayerCard/`
- **Props:** `player`, `data`, `rank`, `streamers`
- **Memoized** for performance

### `<ShinyItem />`
Renders an individual shiny Pokemon with sprite and traits.
- **Location:** `src/components/ShinyItem/`
- **Props:** `shiny`, `points`

### `<Navbar />`
Main navigation with responsive mobile hamburger menu.
- **Location:** `src/components/Navbar/`
- **Features:** Active link highlighting, mobile menu toggle

### `<TrophyShelf />`
Displays trophies for a player.
- **Location:** `src/components/TrophyShelf/`
- **Props:** `playerName`

### `<InfoBox />`
Hover tooltip for additional information.
- **Location:** `src/components/InfoBox/`
- **Props:** `content`, `children`

### `<BackButton />`
Context-aware back navigation (handles referrer-based routing).
- **Location:** `src/components/BackButton/`

---

## Custom Hooks

### `useDatabase()`
Fetches and caches the main shiny database using React Query.

```javascript
const { data, isLoading, error } = useDatabase();
```

### `useStreamers()`
Fetches Twitch live/offline status from the Twitch API worker.

```javascript
const { data, isLoading } = useStreamers();
// data = { live: [...], offline: [...] }
```

### `useTrophies()`
Loads trophy data with path transformations for assets.

```javascript
const { data, isLoading } = useTrophies();
// data = { trophies, trophyAssignments }
```

### `useTierData()`
Builds a lookup map for Pokemon tier classifications.

```javascript
const { tierPokemon, tierPoints, tierLookup } = useTierData();
// tierLookup = { "pikachu": "Tier 7", "charizard": "Tier 0", ... }
```

### `useDocumentHead()`
Sets page title, meta description, Open Graph tags, and canonical URL per route.

```javascript
useDocumentHead({ title: 'Pokedex', description: '...', canonicalPath: '/pokedex' });
```

### `useShinyData()`
Fetches a player's shiny data from the Shinyboard.net API.

```javascript
const shinies = await grabShinyData('playerName');
```

### `useTieredShinies()`
Groups shinies by tier for SHOTM displays, with optional month/year filtering.

```javascript
const tiers = useTieredShinies(shotmData, tierLookup, { onlyCurrentMonth: true });
```

---

## Utilities

### `src/utils/assets.js`
Handles base path for assets in both dev and production.

```javascript
import { getAssetUrl } from '../utils/assets';
const imagePath = getAssetUrl('/images/logo.png');
```

### `src/utils/points.js`
Calculates SHOTM points based on Pokemon tier and traits.

```javascript
import { calculateShinyPoints } from '../utils/points';
const points = calculateShinyPoints(shiny, tierPoints, tierLookup);
```

### `src/utils/pokemon.js`
Pokemon name normalization and local GIF resolution with remote fallback.

```javascript
import { getLocalPokemonGif, onGifError, normalizePokemonName } from '../utils/pokemon';
const gifPath = getLocalPokemonGif('pikachu'); // /images/pokemon_gifs/tier_7/pikachu.gif?v=1
const normalized = normalizePokemonName("Nidoran♂"); // "nidoran-m"
```

### `src/utils/bingo.js`
Bingo card game logic for Random Pokemon Generator.

```javascript
import { checkBingo, saveBingo, loadBingo } from '../utils/bingo';
```

---

## Configuration Files

### `vite.config.js`
- Base URL: `/` (custom domain via CNAME)
- Code splitting configured for `vendor`, `query`, and `jszip` chunks
- React plugin enabled
- Dev server proxy for admin API and Twitch API

### `package.json`
- ES modules (`"type": "module"`)
- Dependencies and scripts defined

### `index.html`
- Entry point with meta tags for SEO (Open Graph, Twitter Cards)
- Preconnects to external resources (PokemonDB, admin API)
- Google Site Verification and Google Analytics included
- Structured data (JSON-LD) for SERP sitelinks
- SPA redirect handler script for GitHub Pages

---

## Deployment

### GitHub Actions (CI/CD)

Workflow file: `.github/workflows/deploy.yml`

**Trigger:** Push to `main` branch

**Steps:**
1. Checkout code
2. Setup Node 20 with npm caching
3. Install dependencies (`npm ci`)
4. Build (`npm run build`)
5. Deploy `/dist/` to GitHub Pages

### Manual Deployment

```bash
# Build production bundle
npm run build

# Preview locally before deploying
npm run preview

# The /dist/ folder contains the deployable assets
```

### GitHub Pages SPA Routing

The `public/404.html` file handles client-side routing by redirecting to the main app with route preservation. The redirect is decoded by an inline script in `index.html` (and a matching handler in `main.jsx`).

---

## Caching Strategy

Service worker located at `public/service-worker.js`.

### Cache Names

| Cache | Purpose |
|-------|---------|
| `synergy-showcase-v4` | Main app assets |
| `pokemon-sprites-v1` | Pokemon sprite images |
| `api-data-v1` | API response data |

### Caching Strategies

- **Pokemon sprites:** Cache-first (aggressive caching)
- **API calls:** Network-first with fallback to cache
- **Static assets:** Cache-first

### Updating Cache Version

When deploying updates that require cache invalidation, increment the cache version in `service-worker.js`:

```javascript
const CACHE_NAME = 'synergy-showcase-v4'; // Increment version
```

---

## Development Notes

### React Query Configuration

Default settings in `src/main.jsx`:

```javascript
{
  staleTime: 5 * 60 * 1000,        // 5 minutes
  gcTime: 30 * 60 * 1000,          // 30 minutes
  refetchOnWindowFocus: false,
  retry: 1,
}
```

### CSS Strategy

- **Global styles:** `src/index.css` (dark theme, animations, layout)
- **Component styles:** CSS Modules (`*.module.css`) for scoped styling
- **Naming:** Component CSS files match component names

### Admin Authentication

- Credentials verified via `API.adminCheck` POST request
- Auth state stored in `AdminContext`
- Protected routes redirect to `/admin` if not authenticated

### Asset Base Path

Always use the `getAssetUrl()` utility for static assets to handle the base path correctly:

```javascript
// Correct
import { getAssetUrl } from '../utils/assets';
<img src={getAssetUrl('/images/icon.png')} />

// Incorrect (may not resolve correctly with different base paths)
<img src="/images/icon.png" />
```

### Adding New Pages

1. Create page component in `src/pages/NewPage/`
2. Add route in `src/App.jsx`
3. Add navigation link in `src/components/Navbar/` if needed
4. Create CSS module for styling

### Adding New API Endpoints

1. Add endpoint to `src/api/endpoints.js`
2. Create custom hook in `src/hooks/` if data fetching is needed
3. Use React Query for caching and state management

---

## Feature-Specific Notes

### SHOTM (Shiny Hunters of the Month)

- Points calculated using tier data from `src/data/tier_points.json`
- Rank changes tracked via localStorage
- Month navigation with arrow indicators for rank movement

### Counter Generator

- Parses GIF frames using `omggif`
- Resizes images via canvas
- Generates XML for PokeMMO format
- Packages as ZIP using `jszip`

### Random Pokemon Generator

- Weighted tier selection from `src/data/randomizer_tiers.json`
- Bingo card sizes: 3x3, 4x4, 5x5
- Canvas fireworks animation on win
- Integration with Shinyboard.net for user shiny data

### Pokedex

- Lazy loading for images
- Generation data from `src/data/generation.json`
- Supports both shiny dex and living dex tracking

---

## Troubleshooting

### Common Issues

**Issue:** Assets not loading in production
**Solution:** Use `getAssetUrl()` utility for all static assets

**Issue:** Routes returning 404 on refresh
**Solution:** Ensure `public/404.html` is deployed and GitHub Pages is configured correctly

**Issue:** Stale data after updates
**Solution:** Increment service worker cache version and deploy

**Issue:** Admin panel not saving
**Solution:** Check network requests to admin API; verify credentials in AdminContext

---

## Contact & Resources

- **Live Site:** GitHub Pages deployment
- **Backend API:** Cloudflare Workers at `adminpage.hypersmmo.workers.dev`
- **Pokemon Sprites:** Local GIFs in `public/images/pokemon_gifs/` (fallback: `img.pokemondb.net`)
- **Twitch API:** `twitch-api.hypersmmo.workers.dev`
