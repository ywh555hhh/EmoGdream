# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

EmoGdream is a Vue 3 emoji library application for browsing, copying, and downloading anime-style emojis. The app auto-discovers emoji files from the `public/` directory (organized by format: `png/`, `gif/`, `webp/`) and extracts emotion categories from filenames using regex patterns.

## Development Commands

```bash
# Install dependencies
npm install

# Development server (Vite)
npm run dev

# Type-check and build for production
npm run build

# Build without type-checking
npm run build-only

# Type-check only
npm run type-check

# Preview production build
npm run preview

# Run tests (Vitest)
npm run test

# Run tests with UI
npm run test:ui
```

## Node Version Requirement
```
Node: ^20.19.0 || >=22.12.0
```

## Architecture

### Composables Pattern (`src/composables/`)
The application follows Vue's Composition API with composable functions encapsulating business logic:

- **useEmojis.ts**: Scans `public/{png,gif,webp}/` directories using `import.meta.glob()`, extracts emotion categories from filenames (regex patterns match `#_emotion.ext` or `#_character_emotion.ext` formats), and provides computed properties for filtering.

- **useBatchSelection.ts**: Manages selected emoji state for batch operations (select all, select none, batch copy HTML tags).

- **useClipboard.ts**: Copies HTML `<img>` tags to clipboard with toast notifications and fallback for older browsers.

- **useDownload.ts**: Handles file downloads with CORS support.

- **useSizeControl.ts**: Manages the size slider state (16px to 128px).

### Key Files

| File | Purpose |
|------|---------|
| `src/App.vue` | Root component with main emoji library UI |
| `src/components/EmojiCard.vue` | Individual emoji card component |
| `src/router/index.ts` | Vue Router config (history mode with BASE_URL) |
| `vite.config.ts` | Build config with base path `/EmoGdream/` for GitHub Pages |

### Emoji Discovery
Emojis are auto-discovered at build time using Vite's `import.meta.glob()` with `{ eager: true }` option. Filenames follow patterns like `123_emotion.png` or `456_character_emotion.gif`. Emotion text is extracted and cleaned (removes Chinese question marks and middle dots).

### Path Aliases
- `@/` maps to `src/` directory (configured in both `vite.config.ts` and `tsconfig.app.json`)

### Deployment
- GitHub Pages auto-deploys from `main` branch on push (`.github/workflows/deploy.yml`)
- Current active branch is `master` - workflow will not trigger until branch is renamed or updated
- Built output goes to `./dist`

### TypeScript Configuration
- Project references setup with separate configs: `tsconfig.app.json` (app), `tsconfig.node.json` (build), `tsconfig.vitest.json` (tests)
- Use `vue-tsc` for type checking `.vue` files instead of regular `tsc`
- Strict mode enabled via `@vue/tsconfig`

### Testing
- Vitest with jsdom environment
- Tests follow `.test.ts` naming convention in `src/__tests__/`
- Component tests in `src/components/__tests__/`
