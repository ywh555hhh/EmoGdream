import { ref, computed } from 'vue'
import { stickers } from '../data/stickers'

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
  const emojis = ref<Emoji[]>(stickers)
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

  return {
    emojis,
    characters,
    emotions,
    totalCount,
    filteredCount,
    loading,
    refresh: () => {}
  }
}
