import { ref, computed } from 'vue'

export interface Emoji {
  id: string
  name: string
  emotion: string
  format: 'png' | 'gif' | 'webp'
  character: string
  path: string
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

export function useEmojis() {
  const emojis = ref<Emoji[]>([])
  const loading = ref(true)

  const scanStickers = async () => {
    loading.value = true
    const allEmojis: Emoji[] = []

    try {
      const stickerModules = import.meta.glob('/stickers/**/*.{png,gif,webp}', { eager: true })

      for (const [path, module] of Object.entries(stickerModules)) {
        const filename = path.split('/').pop() || ''
        const character = path.split('/')[2] || ''
        const ext = path.split('.').pop() as 'png' | 'gif' | 'webp'

        const emotion = filename
          .replace(`${character}_`, '')
          .replace(`.${ext}`, '')
          .replace(/[？·！!？]/g, '')
          .trim() || 'unknown'

        allEmojis.push({
          id: `${character}_${emotion}_${ext}`,
          name: filename,
          emotion,
          format: ext,
          character,
          path: path // Keep the path as-is (starts with /stickers/)
        })
      }
    } catch (e) {
      console.error('Failed to scan stickers:', e)
    }

    emojis.value = allEmojis.sort((a, b) => {
      const charCompare = a.character.localeCompare(b.character)
      if (charCompare !== 0) return charCompare
      return a.emotion.localeCompare(b.emotion)
    })
    loading.value = false
  }

  scanStickers()

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

  return {
    emojis,
    characters,
    emotions,
    totalCount,
    filteredCount,
    loading,
    refresh: scanStickers
  }
}
