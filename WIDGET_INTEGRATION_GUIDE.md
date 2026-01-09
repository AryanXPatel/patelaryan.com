# 🎯 Portfolio Widget Integration Guide

Complete setup guide for the **Currently Reading** and **Now Playing** widgets on patelaryan.com.

---

## 📚 CURRENTLY READING (Books + Quotes)

### Option A: Hardcover.app (Recommended - API Integration)

**What it is:** Modern Goodreads alternative with a public GraphQL API that supports tracking books AND saving quotes/highlights.

#### Setup Steps

1. **Create Account**
   - Go to [hardcover.app](https://hardcover.app)
   - Sign up (free tier available)

2. **Get API Access**
   - Hardcover uses a public GraphQL API
   - Endpoint: `https://api.hardcover.app/v1/graphql`
   - No API key needed for public data

3. **Track Your Reading**
   - Add books to your "Currently Reading" shelf
   - Save quotes/highlights as you read

4. **Query Your Data**
   ```graphql
   query CurrentlyReading {
     me {
       user_books(where: { status_id: { _eq: 2 } }) {
         book {
           title
           author
           cover_image
         }
       }
     }
   }
   ```

#### Pros & Cons
| ✅ Pros | ❌ Cons |
|---------|---------|
| Real API (GraphQL) | Newer platform, smaller catalog |
| Quote/highlight support | Need to maintain another account |
| Modern, active development | Requires authentication for personal data |

---

### Option B: Manual JSON File (Simplest)

**What it is:** A local JSON file you edit manually whenever you start a new book or find a new quote.

#### Setup Steps

1. **Create the data file**
   ```
   patelaryan.com/data/reading.json
   ```

2. **JSON Structure**
   ```json
   {
     "currentBook": {
       "title": "Clean Code",
       "author": "Robert C. Martin",
       "cover": "/images/books/clean-code.jpg",
       "progress": 45,
       "startDate": "2026-01-01"
     },
     "currentQuote": {
       "text": "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
       "source": "Clean Code",
       "page": 42
     },
     "recentQuotes": [
       {
         "text": "First, solve the problem. Then, write the code.",
         "source": "John Johnson"
       }
     ]
   }
   ```

3. **Fetch in JavaScript**
   ```javascript
   async function loadReading() {
     const res = await fetch('/data/reading.json');
     const data = await res.json();
     
     document.querySelector('.reading-quote').textContent = `"${data.currentQuote.text}"`;
     document.querySelector('.reading-source').textContent = `— ${data.currentQuote.source}`;
   }
   ```

4. **Update Process**
   - Edit `reading.json` whenever you change books or find a new quote
   - Commit and push to deploy

#### Pros & Cons
| ✅ Pros | ❌ Cons |
|---------|---------|
| No external dependencies | Manual updates required |
| Full control over data | No automatic sync |
| Works offline | Easy to forget to update |
| Zero API costs | — |

---

### Option C: Goodreads RSS Feed (Legacy Workaround)

**What it is:** Parse your Goodreads "Currently Reading" shelf via RSS (no API key needed).

#### Setup Steps

1. **Get Your RSS Feed URL**
   ```
   https://www.goodreads.com/review/list_rss/YOUR_USER_ID?shelf=currently-reading
   ```

2. **Parse with a Serverless Function**
   - Use Cloudflare Workers or Vercel Edge Functions
   - Fetch and parse the XML
   - Convert to JSON for your frontend

> ⚠️ **Note:** RSS doesn't include quotes, only book info. Combine with manual quotes.

---

## 🎵 NOW PLAYING (Brain.fm Music)

### Architecture Overview

```
┌─────────────────────────┐
│   OLD ANDROID PHONE     │
│   (24/7 Music Player)   │
│                         │
│  ┌─────────────────┐    │
│  │ Musicolet/AIMP  │    │
│  │ (plays Brain.fm)│    │
│  └────────┬────────┘    │
│           │             │
│  ┌────────▼────────┐    │
│  │ Pano Scrobbler  │    │  ──► Reads ID3 tags from files
│  │ (background)    │    │      Sends to Last.fm
│  └────────┬────────┘    │
└───────────┼─────────────┘
            │
            ▼ WiFi
┌─────────────────────────┐
│       LAST.FM           │
│   (stores scrobbles)    │
└───────────┬─────────────┘
            │
            ▼ API
┌─────────────────────────┐
│    PATELARYAN.COM       │
│   (fetches & displays)  │
└─────────────────────────┘
```

---

### Step 1: Create Last.fm Account

1. Go to [last.fm/join](https://www.last.fm/join)
2. Create a free account
3. Note your **username**

---

### Step 2: Get Last.fm API Key

1. Go to [last.fm/api/account/create](https://www.last.fm/api/account/create)
2. Create an "Application"
   - Application name: `patelaryan-now-playing`
   - Application description: `Personal portfolio widget`
   - Callback URL: `https://patelaryan.com` (or leave blank)
3. Save your **API Key** (you'll need this)

---

### Step 3: Setup Old Android Phone

#### Install Music Player
Choose ONE (both work great with scrobblers):

| App | Best For | Download |
|-----|----------|----------|
| **Musicolet** | Lightweight, no ads | [Play Store](https://play.google.com/store/apps/details?id=in.krosbits.musicolet) |
| **AIMP** | More features, EQ | [Play Store](https://play.google.com/store/apps/details?id=com.aimp.player) |

#### Install Scrobbler
Choose ONE:

| App | Best For | Download |
|-----|----------|----------|
| **Simple Last.fm Scrobbler** | Old phones, lightweight | [Play Store](https://play.google.com/store/apps/details?id=com.adam.aslfms) |
| **Pano Scrobbler** | More features, offline caching | [GitHub](https://github.com/kawaiiDango/pano-scrobbler) |

#### Configure Scrobbler

1. Open the scrobbler app
2. Sign in with your Last.fm account
3. Grant notification access (required to read track info)
4. Enable scrobbling for your music player app
5. **CRITICAL:** Disable battery optimization for BOTH apps:
   - Settings → Apps → [App] → Battery → Unrestricted

---

### Step 4: Verify Brain.fm ID3 Tags

Your Brain.fm files should have these tags filled:

| Tag Field | Example Value |
|-----------|---------------|
| Title | Deep Focus 01 |
| Artist | Brain.fm |
| Album | Focus Collection |
| Genre | Focus Music |

If tags are missing, use [Mp3tag](https://www.mp3tag.de/en/) to batch edit them.

---

### Step 5: Add Widget to Your Website

#### Option A: Client-Side Fetch (Simple)

```javascript
// scripts/now-playing.js

const LASTFM_USER = 'your-lastfm-username';
const LASTFM_API_KEY = 'your-api-key';

async function fetchNowPlaying() {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    const track = data.recenttracks.track[0];
    
    const isNowPlaying = track['@attr']?.nowplaying === 'true';
    
    document.getElementById('np-track').textContent = track.name;
    document.getElementById('np-artist').textContent = track.artist['#text'];
    document.getElementById('np-time').textContent = isNowPlaying ? '♫ NOW PLAYING' : 'Last played';
    
    // Album art (may not exist for Brain.fm)
    if (track.image?.[2]?.['#text']) {
      document.getElementById('np-art').src = track.image[2]['#text'];
    }
  } catch (err) {
    console.error('Failed to fetch now playing:', err);
    document.getElementById('np-track').textContent = 'Offline';
  }
}

// Fetch on load and every 30 seconds
fetchNowPlaying();
setInterval(fetchNowPlaying, 30000);
```

> ⚠️ **Note:** API key is exposed client-side. For personal sites this is usually fine.

#### Option B: Serverless Proxy (More Secure)

Create a Cloudflare Worker or Vercel Edge Function to hide your API key:

```javascript
// Cloudflare Worker example
export default {
  async fetch(request) {
    const API_KEY = 'your-secret-api-key';
    const USER = 'your-username';
    
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USER}&api_key=${API_KEY}&format=json&limit=1`;
    
    const res = await fetch(url);
    const data = await res.json();
    
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://patelaryan.com'
      }
    });
  }
};
```

---

### Step 6: Manual Fallback Option

If you don't want to set up scrobbling, create a manual JSON file:

```json
// data/now-playing.json
{
  "track": "Deep Focus 01",
  "artist": "Brain.fm",
  "album": "Focus Collection",
  "neuralEffect": "Focus",
  "mood": "Calm, Productive",
  "isPlaying": true,
  "updatedAt": "2026-01-10T00:00:00Z"
}
```

Update manually when you change what's playing (or just leave as "ambient focus music").

---

## 📋 Quick Reference: What You Need

### For Books/Quotes Widget

| Approach | Account Needed | Effort | Auto-Updates |
|----------|---------------|--------|--------------|
| **Manual JSON** | None | Low | ❌ No |
| **Hardcover.app** | Hardcover account | Medium | ✅ Yes |
| **Goodreads RSS** | Goodreads account | Medium | ⚠️ Books only |

### For Music Widget

| Approach | Accounts Needed | Effort | Auto-Updates |
|----------|----------------|--------|--------------|
| **Manual JSON** | None | Low | ❌ No |
| **Last.fm + Scrobbler** | Last.fm + API key | Medium | ✅ Yes |

---

## 🚀 Recommended Setup

For your specific use case (Brain.fm on old phone + books/quotes):

### Books
→ **Manual JSON** - Simple, you control everything, update when you finish a book or find a quote you like.

### Music
→ **Last.fm + Scrobbler** - Your Brain.fm tracks have metadata, so this will work. Set it up once on the old phone and forget about it.

---

## 📝 Files to Create

```
patelaryan.com/
├── data/
│   ├── reading.json      ← Your book/quote data (manual)
│   └── now-playing.json  ← Fallback if Last.fm fails
├── scripts/
│   └── widgets.js        ← Fetching logic for widgets
└── images/
    └── books/            ← Book cover images
```

---

## 🔧 Troubleshooting

### Scrobbler not working?
1. Check notification access is granted
2. Disable battery optimization
3. Lock app in recent apps (long press → lock icon)
4. For Xiaomi/Huawei: enable autostart in security settings

### Last.fm showing "unknown artist"?
- Your Brain.fm files are missing ID3 tags
- Use Mp3tag to add Artist/Title tags

### Widget not updating?
- Check browser console for errors
- Verify your Last.fm username in the API call
- Test the API URL directly in browser

---

*Guide created: 2026-01-10*
