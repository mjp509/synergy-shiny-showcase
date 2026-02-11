# Streamers & Twitch Integration Feature Documentation

## Overview

The Streamers page showcases team members who stream PokeMMO content on Twitch. It displays streamer profiles, live status, followers, and integration with the Twitch API for real-time stream information. The feature pulls streamer usernames from data, queries Twitch API for current stream status, and displays social links.

## Architecture

### Components & Files

#### 1. **Streamers Page** (`src/pages/Streamers/Streamers.jsx`)
- Main page component displaying all team streamers
- Fetches live status from Twitch API
- Display: name, profile image, followers, live indicator, bio
- Links to Twitch channel and Discord/social media

**Key Features:**
- Live indicator (green dot when streaming)
- Follower count
- Last game played
- Customizable bio/description
- Social media links

#### 2. **useStreamers Hook** (`src/hooks/useStreamers.js`)
- Fetches streamer metadata from `src/data/streamers.json`
- Returns list of streamer objects with Twitch usernames

**Hook Return Structure:**
```javascript
[
  {
    name: "Streamer Name",
    twitchUsername: "twitch_username",
    bio: "Optional bio text",
    discord: "Discord username",
    website: "https://example.com",
    socialLinks: {
      twitter: "https://twitter.com/handle",
      youtube: "https://youtube.com/@channel"
    }
  }
]
```

#### 3. **Twitch API Integration Worker** (`twitch-api.hypersmmo.workers.dev`)
- Cloudflare Worker handling Twitch API authentication
- Prevents client-side token exposure
- Endpoints:
  - `/users/{username}` - Get user profile (followers, profile image)
  - `/streams/{username}` - Get live stream status
  - `/channels/{username}` - Get channel information

**Worker Flow:**
```
Request from Client
        ↓
[Cloudflare Worker authentication]
        ↓
Query Twitch API with OAuth token
        ↓
Return sanitized data to client
        ↓
Cache response (5 min TTL)
```

#### 4. **StreamerCard Component** (`src/components/StreamerCard/` - conceptual)
- Individual streamer profile card
- Displays:
  - Profile image
  - Name and title
  - Live indicator badge
  - Follower count
  - Current game
  - Social links

### Data Files

#### `src/data/streamers.json`
Source of truth for team streamers:
```javascript
[
  {
    id: "streamer-1",
    name: "Streamer Name",
    twitchUsername: "streamer_twitch",
    displayName: "Custom Display Name",
    bio: "Brief bio about the streamer",
    avatar: "avatar-url-optional.png",
    discord: "discordusername",
    website: "https://example.com",
    socialLinks: {
      twitter: "https://twitter.com/handle",
      youtube: "https://youtube.com/@channel",
      instagram: "https://instagram.com/handle"
    },
    favoriteGames: ["PokeMMO", "Pokemon"],
    joinDate: "2024-01-15"
  }
]
```

### API Integration

#### Twitch OAuth Flow
```
1. Server (Cloudflare Worker) has:
   - Client ID
   - OAuth Token (server-to-server)
   
2. Client requests: POST /api/twitch/user/strearner_name
   
3. Worker authenticates with Twitch using OAuth token
   
4. Returns user data:
   - Profile image
   - Display name
   - Followers
   - Current stream status (if live)
```

#### Rate Limiting
- Twitch API: 120 requests/minute (per user)
- Worker implements caching (5 minute TTL)
- Client-side request deduplication

#### Error Handling
```javascript
// Graceful fallback if API unavailable
const getStreamerData = async (username) => {
  try {
    const response = await fetch(`/api/twitch/user/${username}`)
    return response.json()
  } catch (err) {
    console.error(`Failed to fetch ${username}:`, err)
    return {
      name: username,
      followers: 'N/A',
      isLive: false,
      error: true
    }
  }
}
```

## How to Extend

### Adding a New Streamer

**Step 1:** Update `src/data/streamers.json`
```javascript
{
  id: "streamer-new",
  name: "New Streamer",
  twitchUsername: "new_streamer_twitch",
  displayName: "Display Name",
  bio: "Bio about the streamer",
  discord: "discordusername",
  website: "https://example.com",
  socialLinks: {
    twitter: "https://twitter.com/handle",
    youtube: "https://youtube.com/@channel"
  }
}
```

**Step 2:** Add avatar image to `public/images/streamers/` (optional)

**Step 3:** Verify Twitch username is correct and account is public

**Step 4:** Page will auto-load their Twitch data on next deploy

### Customizing Streamer Display

**Change follower threshold for "featured" badge:**
```javascript
const isFeatured = (streamer) => streamer.followers >= 1000
```

**Sort by followers/live status:**
```javascript
const sortStreamers = (streamers, sortBy = 'live') => {
  if (sortBy === 'live') {
    return streamers.sort((a, b) => b.isLive - a.isLive)
  } else if (sortBy === 'followers') {
    return streamers.sort((a, b) => b.followers - a.followers)
  }
}
```

### Adding Custom Streaming Platforms

To support YouTube Live, Kick.com, etc.:

```javascript
// Extend data structure
{
  streamingPlatforms: {
    twitch: "streamer_twitch",
    youtube: "channel_id",
    kick: "streamer_kick"
  }
}

// Create platform-specific components
const getPlatformData = async (streamer, platform) => {
  switch(platform) {
    case 'twitch':
      return await fetchTwitchData(streamer.twitchUsername)
    case 'youtube':
      return await fetchYouTubeData(streamer.youtube)
    case 'kick':
      return await fetchKickData(streamer.kick)
  }
}
```

### Adding Live Notification System

```javascript
// Check for streaming status changes
const checkStreamStatus = async (streamers) => {
  const previousStatus = sessionStorage.getItem('streamStatus')
  const currentStatus = await Promise.all(
    streamers.map(s => checkIfLive(s.twitchUsername))
  )
  
  // Compare and notify if went live
  currentStatus.forEach((live, idx) => {
    const wasLive = previousStatus[idx]
    if (live && !wasLive) {
      notifyStreamerGoesLive(streamers[idx])
    }
  })
  
  sessionStorage.setItem('streamStatus', JSON.stringify(currentStatus))
}
```

## UI Features

### Live Indicator Animation
```css
.liveIndicator {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Follower Count with Formatting
```javascript
const formatFollowers = (count) => {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'K'
  return count.toString()
}
```

### Social Links Display
- Clickable icons linking to streamer socials
- Fallback text if icon unavailable
- Keyboard accessible

## Performance Considerations

### Caching Strategy
- **Server (Worker)**: 5 minute TTL on Twitch data
- **Client**: sessionStorage for current session
- **Browser**: HTTP cache headers respected

### Parallel Requests
- Fetch all streamer data in parallel (Promise.all)
- Prevents waterfall loading delays
- Graceful degradation if one request fails

### Image Optimization
- Lazy load streamer avatars
- Progressive JPEG for faster initial display
- WebP format with fallback to PNG

## Common Issues & Solutions

### Issue: "Failed to fetch streamer data" error
**Cause:** Twitch API rate limit exceeded or OAuth token expired
**Solution:**
- Check worker logs in Cloudflare dashboard
- Verify OAuth token hasn't expired
- Implement exponential backoff retry

### Issue: Follower count shows "0" for all streamers
**Cause:** API response format changed or parsing error
**Solution:**
```javascript
// Debug: log actual API response
const data = await fetch('/api/twitch/user/username')
console.log('Raw response:', data)
```

### Issue: Username not found on Twitch
**Cause:** Typo in streamers.json or account deleted
**Solution:**
- Visit twitch.tv/username to verify
- Check for case sensitivity
- Verify account isn't suspended

### Issue: Live status doesn't update
**Cause:** API caching or client-side cache stale
**Solution:**
- Clear browser cache
- Reduce TTL on worker from 5 min to 1 min
- Force manual refresh button

## Integration with Other Features

### Player Pages
- If player is a streamer, show Twitch link on their player card
- Link to Streamers page from player bio

### Admin Panel
- Interface to add/remove streamers
- Update streamer bios and social links
- Manual cache invalidation button

### Notifications
- Optional: Notify users when team streamer goes live
- Show "Now Live" indicator on home page

## Testing Checklist

- [ ] All streamers from streamers.json load correctly
- [ ] Live indicator updates within 5 minutes
- [ ] Follower counts display with correct formatting
- [ ] Social media links open in new tabs
- [ ] Graceful error if Twitch API unavailable
- [ ] Avatar images load without 404s
- [ ] Responsive layout on mobile
- [ ] Keyboard navigation works on all links
- [ ] Worker properly caches responses (check network tab)
- [ ] Adding new streamer appears after redeploy

## Deployment Notes

- Twitch OAuth token stored in Cloudflare Worker secrets (not in GitHub)
- Verify token has appropriate Twitch API scopes:
  - `user:read:email`
  - `user:read:email`
  - `analytics:read:extensions`
- Test worker in staging before production deploy
