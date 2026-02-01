import { ref, computed } from 'vue'

export interface Emoji {
  id: string
  name: string
  emotion: string
  format: 'png' | 'gif' | 'webp'
  path: string
}

const extractEmotion = (filename: string): string => {
  const pattern1 = /^[\d]+_([^\.]+)\..+$/
  const pattern2 = /^[\d]+_[^_]+_(.+)\..+$/
  const pattern3 = /^[\d]+_(.+)\..+$/

  let match = filename.match(pattern2)
  if (match && match[1]) {
    return match[1].replace(/[？·]/g, '').trim()
  }

  match = filename.match(pattern1)
  if (match && match[1]) {
    return match[1].replace(/[？·]/g, '').trim()
  }

  match = filename.match(pattern3)
  if (match && match[1]) {
    return match[1].replace(/[？·]/g, '').trim()
  }

  return filename
}

const getFileModules = () => ({
  pngModules: import.meta.glob('/public/png/*.png', { eager: true }),
  gifModules: import.meta.glob('/public/gif/*.gif', { eager: true }),
  webpModules: import.meta.glob('/public/webp/*.webp', { eager: true })
})

export function useEmojis(fileScanner: () => ReturnType<typeof getFileModules> = getFileModules) {
  const emojis = ref<Emoji[]>([])

  const processEmojis = () => {
    const allEmojis: Emoji[] = []
    const { pngModules, gifModules, webpModules } = fileScanner()

    Object.entries(pngModules).forEach(([path, module]) => {
      const filename = path.split('/').pop() || ''
      const emotion = extractEmotion(filename)
      allEmojis.push({
        id: filename.replace(/\.[^.]+$/, ''),
        name: filename,
        emotion,
        format: 'png',
        path: path.replace('/public', '')
      })
    })

    Object.entries(gifModules).forEach(([path, module]) => {
      const filename = path.split('/').pop() || ''
      const emotion = extractEmotion(filename)
      allEmojis.push({
        id: filename.replace(/\.[^.]+$/, ''),
        name: filename,
        emotion,
        format: 'gif',
        path: path.replace('/public', '')
      })
    })

    Object.entries(webpModules).forEach(([path, module]) => {
      const filename = path.split('/').pop() || ''
      const emotion = extractEmotion(filename)
      allEmojis.push({
        id: filename.replace(/\.[^.]+$/, ''),
        name: filename,
        emotion,
        format: 'webp',
        path: path.replace('/public', '')
      })
    })

    emojis.value = allEmojis
  }

  processEmojis()

  const pngEmojis = computed(() => emojis.value.filter(e => e.format === 'png'))
  const gifEmojis = computed(() => emojis.value.filter(e => e.format === 'gif'))
  const webpEmojis = computed(() => emojis.value.filter(e => e.format === 'webp'))
  
  const emotionsByFormat = computed(() => {
    const grouped = {
      png: new Set<string>(),
      gif: new Set<string>(),
      webp: new Set<string>()
    }

    emojis.value.forEach(emoji => {
      grouped[emoji.format].add(emoji.emotion)
    })

    return {
      png: Array.from(grouped.png),
      gif: Array.from(grouped.gif),
      webp: Array.from(grouped.webp)
    }
  })

  const uniqueEmotions = computed(() => {
    const allEmotions = new Set<string>()
    emojis.value.forEach(emoji => allEmotions.add(emoji.emotion))
    return Array.from(allEmotions)
  })

  const totalCount = computed(() => emojis.value.length)

  return {
    emojis,
    pngEmojis,
    gifEmojis,
    webpEmojis,
    emotionsByFormat,
    uniqueEmotions,
    totalCount,
    refreshEmojis: processEmojis
  }
}