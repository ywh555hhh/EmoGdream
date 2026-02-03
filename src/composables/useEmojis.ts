import { ref, computed } from 'vue'
import { stickers as allStickers } from '../data/stickers'

// Sticker type from manifest
interface Sticker {
  id: string
  name: string
  emotion: string
  format: 'png' | 'gif' | 'webp'
  character: string
  path: string
}

export interface Emoji {
  id: string
  name: string
  emotion: string
  format: 'png' | 'gif' | 'webp'
  character: string
  path: string
  availableFormats?: ('png' | 'gif' | 'webp')[]
  formats?: Record<'png' | 'gif' | 'webp', string>  // Store all format paths
}

const CHARACTER_NAMES: Record<string, string> = {
  nina: 'Nina',
  nijika: 'Nijika',
  tomori: 'Tomori',
  momoka: 'Momoka',
  subaru: 'Subaru',
  hitori: 'Hitori',
  ikuyo: 'Ikuyo',
  soyo: 'Soyo',
  taki: 'Taki',
  tomo: 'Tomo',
  rupa: 'Rupa',
  sakiko: 'Sakiko',
  ryo: 'Ryo',
  uika: 'Uika',
  nyamu: 'Nyamu',
  mutsumi: 'Mutsumi',
  raana: 'Raana',
  umiri: 'Umiri',
  gbc: 'GBC',
  anon: 'Anon',
  KB: 'KB',
  mana: 'Mana'
}

const FORMAT_PRIORITY: Record<string, number> = {
  webp: 3,
  png: 2,
  gif: 1
}

function getBestStickers(allStickers: Sticker[]): Emoji[] {
  const grouped = new Map<string, Sticker[]>()

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
  const emojis = ref<Emoji[]>(getBestStickers(allStickers))
  const loading = ref(false)

  const characters = computed(() => {
    const chars = new Set(emojis.value.map(e => e.character))
    return Array.from(chars)
      .sort((a, b) => a.localeCompare(b))
      .map(c => ({ id: c, name: CHARACTER_NAMES[c] || c }))
  })

  const emotions = computed(() => {
    const emos = new Set(emojis.value.map(e => e.emotion))
    return Array.from(emos).sort((a, b) => a.localeCompare(b))
  })

  const totalCount = computed(() => emojis.value.length)
  const filteredCount = computed(() => emojis.value.length)

  // Get the correct path based on the selected format preference
  // If the selected format is available, use it; otherwise use the best available format
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

  // Get filtered emojis with correct format paths
  const getFilteredEmojis = (
    selectedCharacter: string,
    selectedFormat: 'all' | 'png' | 'gif' | 'webp',
    selectedEmotion: string,
    searchQuery: string
  ): Emoji[] => {
    return emojis.value.filter(emoji => {
      const charMatch = selectedCharacter === 'all' || emoji.character === selectedCharacter
      // Match if emoji has the selected format (not if it IS the selected format)
      const formatMatch = selectedFormat === 'all' || emoji.availableFormats?.includes(selectedFormat)
      const emotionMatch = selectedEmotion === 'all' || emoji.emotion === selectedEmotion
      const searchMatch = !searchQuery ||
        emoji.emotion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emoji.character.toLowerCase().includes(searchQuery.toLowerCase())
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
    getFilteredEmojis
  }
}
