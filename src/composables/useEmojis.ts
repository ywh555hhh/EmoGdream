import { ref, computed, watchEffect } from 'vue'
import { stickers as allStickers } from '../data/stickers'
import characterConfig from '../config/characters.json'

// Raw sticker type from manifest (what stickers.ts exports)
interface RawSticker {
  id: string
  name: string
  emotion: string
  format: 'png' | 'gif' | 'webp'
  character: string
  path: string
  formats?: ('png' | 'gif' | 'webp')[]
}

export interface Emoji {
  id: string
  name: string
  emotion: string
  format: 'png' | 'gif' | 'webp'
  character: string
  path: string
  availableFormats?: ('png' | 'gif' | 'webp')[]
  formats?: Record<'png' | 'gif' | 'webp', string>
}

// Load from config file
const CHARACTER_NAMES = characterConfig.characters as Record<string, { name: string; group: string }>

// Format priority from config (webp > png > gif)
const FORMAT_PRIORITY: Record<string, number> = {
  webp: characterConfig.formatPriority.indexOf('webp') !== -1 ? 3 : 0,
  png: characterConfig.formatPriority.indexOf('png') !== -1 ? 2 : 0,
  gif: characterConfig.formatPriority.indexOf('gif') !== -1 ? 1 : 0
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return ((...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }) as T
}

function getBestStickers(allStickers: RawSticker[]): Emoji[] {
  const grouped = new Map<string, RawSticker[]>()

  for (const sticker of allStickers) {
    const key = `${sticker.character}_${sticker.emotion}`
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push(sticker)
  }

  const bestStickers: Emoji[] = []
  for (const stickerList of grouped.values()) {
    if (!stickerList || stickerList.length === 0) {
      continue
    }

    const sorted = [...stickerList].sort((a, b) =>
      (FORMAT_PRIORITY[b.format] || 0) - (FORMAT_PRIORITY[a.format] || 0)
    )
    const best = sorted[0]

    if (!best) {
      continue
    }

    const availableFormats = stickerList.map(s => s.format) as ('png' | 'gif' | 'webp')[]

    // Store all format paths for later use
    const formats: Record<'png' | 'gif' | 'webp', string> = { png: '', gif: '', webp: '' }
    for (const sticker of stickerList) {
      formats[sticker.format] = sticker.path
    }

    bestStickers.push({
      id: best.id,
      name: best.name,
      emotion: best.emotion,
      format: best.format,
      character: best.character,
      path: best.path,
      availableFormats,
      formats
    })
  }

  return bestStickers
}

export function useEmojis() {
  const emojis = ref<Emoji[]>(getBestStickers(allStickers as RawSticker[]))
  const loading = ref(false)
  const debouncedSearchQuery = ref('')
  const searchQuery = ref('')

  // Debounce search query updates (300ms delay)
  const updateDebouncedSearch = debounce((query: string) => {
    debouncedSearchQuery.value = query
  }, 300)

  // Watch for changes to search query and trigger debounced update
  watchEffect(() => {
    updateDebouncedSearch(searchQuery.value)
  })

  // Build search index by first letter for faster lookups
  const searchIndex = computed(() => {
    const index = new Map<string, Emoji[]>()
    emojis.value.forEach(emoji => {
      // Index by emotion first character
      const emotionKey = emoji.emotion.charAt(0).toLowerCase()
      if (!index.has(`e_${emotionKey}`)) {
        index.set(`e_${emotionKey}`, [])
      }
      index.get(`e_${emotionKey}`)!.push(emoji)

      // Index by character first character
      const charKey = emoji.character.charAt(0).toLowerCase()
      if (!index.has(`c_${charKey}`)) {
        index.set(`c_${charKey}`, [])
      }
      index.get(`c_${charKey}`)!.push(emoji)
    })
    return index
  })

  // Get candidate emojis from search index (narrow down search space)
  const getCandidatesFromIndex = (query: string): Emoji[] => {
    if (!query || query.length === 0) {
      return emojis.value
    }

    const lowerQuery = query.toLowerCase()
    const firstChar = lowerQuery.charAt(0)

    // Get candidates from both emotion and character indexes
    const emotionCandidates = searchIndex.value.get(`e_${firstChar}`) || []
    const charCandidates = searchIndex.value.get(`c_${firstChar}`) || []

    // Combine and deduplicate
    const candidates = new Map<string, Emoji>()
    for (const emoji of [...emotionCandidates, ...charCandidates]) {
      candidates.set(emoji.id, emoji)
    }

    // If index doesn't contain results, fall back to full list
    return candidates.size > 0 ? Array.from(candidates.values()) : emojis.value
  }

  const characters = computed(() => {
    const chars = new Set(emojis.value.map(e => e.character))
    return Array.from(chars)
      .sort((a, b) => a.localeCompare(b))
      .map(c => ({ id: c, name: CHARACTER_NAMES[c]?.name || c, group: CHARACTER_NAMES[c]?.group || '' }))
  })

  const emotions = computed(() => {
    const emos = new Set(emojis.value.map(e => e.emotion))
    return Array.from(emos).sort((a, b) => a.localeCompare(b))
  })

  const totalCount = computed(() => emojis.value.length)
  const filteredCount = computed(() => emojis.value.length)

  // Get the correct path based on the selected format preference
  const getPathByFormat = (emoji: Emoji, preferredFormat?: 'png' | 'gif' | 'webp'): string => {
    if (preferredFormat && emoji.formats && emoji.formats[preferredFormat]) {
      return emoji.formats[preferredFormat]
    }
    return emoji.path  // Default to best format
  }

  // Get the display format based on current selection
  const getDisplayFormat = (emoji: Emoji, selectedFormat: 'all' | 'png' | 'gif' | 'webp'): 'png' | 'gif' | 'webp' => {
    if (selectedFormat !== 'all' && emoji.availableFormats?.includes(selectedFormat)) {
      return selectedFormat
    }
    return emoji.format  // Default to best format
  }

  // Get filtered emojis with correct format paths (optimized with search index)
  const getFilteredEmojis = (
    selectedCharacter: string,
    selectedFormat: 'all' | 'png' | 'gif' | 'webp',
    selectedEmotion: string,
    searchQuery: string
  ): Emoji[] => {
    // Use debounced search query internally
    const query = searchQuery

    // Get candidates from search index first (smaller set to filter)
    const candidates = getCandidatesFromIndex(query)

    return candidates.filter(emoji => {
      const charMatch = selectedCharacter === 'all' || emoji.character === selectedCharacter
      // Match if emoji has the selected format (not if it IS the selected format)
      const formatMatch = selectedFormat === 'all' || emoji.availableFormats?.includes(selectedFormat)
      const emotionMatch = selectedEmotion === 'all' || emoji.emotion === selectedEmotion
      const searchMatch = !query ||
        emoji.emotion.toLowerCase().includes(query.toLowerCase()) ||
        emoji.character.toLowerCase().includes(query.toLowerCase()) ||
        CHARACTER_NAMES[emoji.character]?.name.toLowerCase().includes(query.toLowerCase())
      return charMatch && formatMatch && emotionMatch && searchMatch
    }).map(emoji => {
      // For display, adjust the format to match the selection
      const displayFormat = getDisplayFormat(emoji, selectedFormat)
      return {
        ...emoji,
        format: displayFormat,
        path: getPathByFormat(emoji, displayFormat)
      }
    })
  }

  return {
    emojis,
    characters,
    emotions,
    totalCount,
    filteredCount,
    loading,
    refresh: () => {},
    getPathByFormat,
    getDisplayFormat,
    getFilteredEmojis,
    searchQuery,
    debouncedSearchQuery
  }
}
