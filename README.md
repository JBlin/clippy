# Clippy

Clippy is a mobile-first Expo + React Native MVP for saving links in one place. Users can paste YouTube, Instagram, X, TikTok, blog, news, shopping, and other URLs, then organize them with categories, tags, memos, favorites, filtering, and search.

## Run

```bash
npm install
npx expo start
```

Recommended flows:

- `a` for Android emulator
- `i` for iOS simulator on macOS
- Expo Go or a development build for device testing

## Structure

```text
app/                     Expo Router screens
components/              Reusable UI primitives
features/links/          Link-specific form, data, storage service, models
store/                   Zustand store
utils/                   Platform detection, search, sorting, tag/date helpers
constants/               Theme, categories, platform labels, storage keys
hooks/                   Shared stateful logic for forms
```

## MVP Features

- Home summary with recent links, platform filters, category shortcuts, and stats
- Library search, combined filters, and sort options
- Add link screen with live preview, platform auto-detection, fallback title generation, and editable metadata
- Detail screen with open/edit/delete/favorite actions
- Settings screen with demo seed and reset
- AsyncStorage-only persistence, no login, no backend

## Thumbnail Strategy

- YouTube links use the public `img.youtube.com` thumbnail pattern when a video id can be extracted.
- Other platforms fall back to a local in-app placeholder card with platform initials and hostname.

## Preview Enrichment

- URL-based platform detection happens on-device in real time.
- Friendly fallback titles are created from hostname and meaningful path slugs.
- Summary templates are auto-filled by platform, then remain fully editable before save.
- No backend crawling or aggressive scraping is used in the MVP.

## Where To Extend Next

- Backend: replace or complement `features/links/services/linkStorage.ts` with a Supabase repository layer.
- Sync/auth: keep the Zustand store API and swap persistence behind it.
- AI summaries: the `summary` field already exists in `LinkItem`, so a future summarizer can write back through `store/useLinkStore.ts`.
