import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useEmojis, type Emoji } from '../composables/useEmojis'

const mockPngModules = {
  '/public/png/001_Block!.png': {},
  '/public/png/010_大哭.png': {},
  '/public/png/002_Love.png': {},
  '/public/png/003_不会吧？.png': {},
  '/public/png/004_不要吵架.png': {},
  '/public/png/005_为什么！.png': {}
}

const mockGifModules = {
  '/public/gif/021_良辰共此曲·动态表情包_TGW.gif': {},
  '/public/gif/022_良辰共此曲·动态表情包_再见.gif': {},
  '/public/gif/023_良辰共此曲·动态表情包_握手.gif': {}
}

const mockWebpModules = {
  '/public/webp/031_良辰共此曲·动态表情包_TGW.webp': {},
  '/public/webp/032_良辰共此曲·动态表情包_再见.webp': {},
  '/public/webp/033_良辰共此曲·动态表情包_握手.webp': {},
  '/public/webp/034_良辰共此曲·动态表情包_玩头发.webp': {},
  '/public/webp/035_良辰共此曲·动态表情包_谢谢大家.webp': {}
}

const mockFileScanner = () => ({
  pngModules: mockPngModules,
  gifModules: mockGifModules,
  webpModules: mockWebpModules
})

describe('useEmojis', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should initialize with correct emoji counts', () => {
    const { totalCount, pngEmojis, gifEmojis, webpEmojis } = useEmojis(mockFileScanner)
    
    expect(totalCount.value).toBe(14)
    expect(pngEmojis.value.length).toBe(6)
    expect(gifEmojis.value.length).toBe(3)
    expect(webpEmojis.value.length).toBe(5)
  })

  it('should extract emotions correctly from PNG filenames', () => {
    const { pngEmojis } = useEmojis(mockFileScanner)
    
    const emotions = pngEmojis.value.map(emoji => emoji.emotion)
    expect(emotions).toContain('Block!')
    expect(emotions).toContain('大哭')
    expect(emotions).toContain('Love')
    expect(emotions).toContain('不会吧')
    expect(emotions).toContain('不要吵架')
    expect(emotions).toContain('为什么！')
  })

  it('should extract emotions correctly from GIF filenames', () => {
    const { gifEmojis } = useEmojis(mockFileScanner)
    
    const emotions = gifEmojis.value.map(emoji => emoji.emotion)
    expect(emotions).toContain('TGW')
    expect(emotions).toContain('再见')
    expect(emotions).toContain('握手')
  })

  it('should extract emotions correctly from WebP filenames', () => {
    const { webpEmojis } = useEmojis(mockFileScanner)
    
    const emotions = webpEmojis.value.map(emoji => emoji.emotion)
    expect(emotions).toContain('TGW')
    expect(emotions).toContain('再见')
    expect(emotions).toContain('握手')
    expect(emotions).toContain('玩头发')
    expect(emotions).toContain('谢谢大家')
  })

  it('should handle special characters correctly', () => {
    const { emojis } = useEmojis(mockFileScanner)
    
    const blockEmoji = emojis.value.find(e => e.name === '001_Block!.png')
    const questionEmoji = emojis.value.find(e => e.name === '003_不会吧？.png')
    const exclamationEmoji = emojis.value.find(e => e.name === '005_为什么！.png')
    
    expect(blockEmoji?.emotion).toBe('Block!')
    expect(questionEmoji?.emotion).toBe('不会吧')
    expect(exclamationEmoji?.emotion).toBe('为什么！')
  })

  it('should create correct emoji objects with proper structure', () => {
    const { emojis } = useEmojis(mockFileScanner)
    
    expect(emojis.value.length).toBeGreaterThan(0)
    const firstEmoji = emojis.value[0]!
    
    expect(firstEmoji).toHaveProperty('id')
    expect(firstEmoji).toHaveProperty('name')
    expect(firstEmoji).toHaveProperty('emotion')
    expect(firstEmoji).toHaveProperty('format')
    expect(firstEmoji).toHaveProperty('path')
    
    expect(['png', 'gif', 'webp']).toContain(firstEmoji.format)
    expect(firstEmoji.path).not.toContain('/public')
    expect(firstEmoji.id).not.toContain('.')
  })

  it('should group emotions by format correctly', () => {
    const { emotionsByFormat } = useEmojis(mockFileScanner)
    
    expect(emotionsByFormat.value.png).toContain('Block!')
    expect(emotionsByFormat.value.png).toContain('大哭')
    expect(emotionsByFormat.value.gif).toContain('TGW')
    expect(emotionsByFormat.value.webp).toContain('谢谢大家')
  })

  it('should provide unique emotions across all formats', () => {
    const { uniqueEmotions } = useEmojis(mockFileScanner)
    
    expect(uniqueEmotions.value).toContain('Block!')
    expect(uniqueEmotions.value).toContain('大哭')
    expect(uniqueEmotions.value).toContain('TGW')
    expect(uniqueEmotions.value).toContain('谢谢大家')
    
    const tgwCount = uniqueEmotions.value.filter(e => e === 'TGW').length
    const goodbyeCount = uniqueEmotions.value.filter(e => e === '再见').length
    
    expect(tgwCount).toBe(1)
    expect(goodbyeCount).toBe(1)
  })

  it('should have correct file paths', () => {
    const { emojis } = useEmojis(mockFileScanner)
    
    const pngEmoji = emojis.value.find(e => e.format === 'png')
    const gifEmoji = emojis.value.find(e => e.format === 'gif')
    const webpEmoji = emojis.value.find(e => e.format === 'webp')
    
    expect(pngEmoji?.path).toMatch(/^\/png\/[^\/]+\.png$/)
    expect(gifEmoji?.path).toMatch(/^\/gif\/[^\/]+\.gif$/)
    expect(webpEmoji?.path).toMatch(/^\/webp\/[^\/]+\.webp$/)
  })

  it('should generate correct IDs from filenames', () => {
    const { emojis } = useEmojis(mockFileScanner)
    
    const blockEmoji = emojis.value.find(e => e.name === '001_Block!.png')
    const goodbyeGifEmoji = emojis.value.find(e => e.name === '022_良辰共此曲·动态表情包_再见.gif')
    
    expect(blockEmoji?.id).toBe('001_Block!')
    expect(goodbyeGifEmoji?.id).toBe('022_良辰共此曲·动态表情包_再见')
  })
})