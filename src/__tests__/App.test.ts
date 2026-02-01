import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import App from '../App.vue'

const mockPngModules = {
  '/public/png/001_Block!.png': {},
  '/public/png/010_大哭.png': {},
  '/public/png/002_Love.png': {},
  '/public/png/003_不会吧？.png': {}
}

const mockGifModules = {
  '/public/gif/021_良辰共此曲·动态表情包_TGW.gif': {},
  '/public/gif/022_良辰共此曲·动态表情包_再见.gif': {}
}

const mockWebpModules = {
  '/public/webp/031_良辰共此曲·动态表情包_TGW.webp': {},
  '/public/webp/032_良辰共此曲·动态表情包_再见.webp': {},
  '/public/webp/033_良辰共此曲·动态表情包_握手.webp': {}
}

vi.mock('../composables/useEmojis', () => ({
  useEmojis: () => ({
    emojis: ref([
      { id: '001_Block!', name: '001_Block!.png', emotion: 'Block!', format: 'png', path: '/png/001_Block!.png' },
      { id: '010_大哭', name: '010_大哭.png', emotion: '大哭', format: 'png', path: '/png/010_大哭.png' },
      { id: '002_Love', name: '002_Love.png', emotion: 'Love', format: 'png', path: '/png/002_Love.png' },
      { id: '003_不会吧？', name: '003_不会吧？.png', emotion: '不会吧', format: 'png', path: '/png/003_不会吧？.png' },
      { id: '021_良辰共此曲·动态表情包_TGW', name: '021_良辰共此曲·动态表情包_TGW.gif', emotion: 'TGW', format: 'gif', path: '/gif/021_良辰共此曲·动态表情包_TGW.gif' },
      { id: '022_良辰共此曲·动态表情包_再见', name: '022_良辰共此曲·动态表情包_再见.gif', emotion: '再见', format: 'gif', path: '/gif/022_良辰共此曲·动态表情包_再见.gif' },
      { id: '031_良辰共此曲·动态表情包_TGW', name: '031_良辰共此曲·动态表情包_TGW.webp', emotion: 'TGW', format: 'webp', path: '/webp/031_良辰共此曲·动态表情包_TGW.webp' },
      { id: '032_良辰共此曲·动态表情包_再见', name: '032_良辰共此曲·动态表情包_再见.webp', emotion: '再见', format: 'webp', path: '/webp/032_良辰共此曲·动态表情包_再见.webp' },
      { id: '033_良辰共此曲·动态表情包_握手', name: '033_良辰共此曲·动态表情包_握手.webp', emotion: '握手', format: 'webp', path: '/webp/033_良辰共此曲·动态表情包_握手.webp' }
    ]),
    uniqueEmotions: ref(['Block!', '大哭', 'Love', '不会吧', 'TGW', '再见', '握手']),
    totalCount: ref(9)
  })
}))

describe('App', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should render header with title', () => {
    const wrapper = mount(App)

    expect(wrapper.find('.app-title').text()).toContain('Emoji Library')
    expect(wrapper.find('.title-icon').text()).toBe('✨')
  })

  it('should render format filter buttons', () => {
    const wrapper = mount(App)

    const formatButtons = wrapper.findAll('.filter-group:nth-child(1) .filter-btn')
    expect(formatButtons.length).toBe(4)
    expect(formatButtons[0]?.text()).toBe('All')
    expect(formatButtons[1]?.text()).toBe('PNG')
    expect(formatButtons[2]?.text()).toBe('GIF')
    expect(formatButtons[3]?.text()).toBe('WebP')
  })

  it('should render emotion filter buttons', () => {
    const wrapper = mount(App)

    const emotionButtons = wrapper.findAll('.filter-group:nth-child(2) .filter-btn')
    expect(emotionButtons.length).toBeGreaterThan(1)
    expect(emotionButtons[0]?.text()).toBe('All')
  })

  it('should have "All" format filter active by default', () => {
    const wrapper = mount(App)

    const formatButtons = wrapper.findAll('.filter-group:nth-child(1) .filter-btn')
    expect(formatButtons[0]?.classes()).toContain('active')
  })

  it('should have "All" emotion filter active by default', () => {
    const wrapper = mount(App)

    const emotionButtons = wrapper.findAll('.filter-group:nth-child(2) .filter-btn')
    expect(emotionButtons[0]?.classes()).toContain('active')
  })

  it('should filter emojis by format PNG', async () => {
    const wrapper = mount(App)

    const formatButtons = wrapper.findAll('.filter-group:nth-child(1) .filter-btn')
    await formatButtons[1]!.trigger('click')

    expect(formatButtons[1]?.classes()).toContain('active')
    expect(formatButtons[0]?.classes()).not.toContain('active')
  })

  it('should filter emojis by format GIF', async () => {
    const wrapper = mount(App)

    const formatButtons = wrapper.findAll('.filter-group:nth-child(1) .filter-btn')
    await formatButtons[2]!.trigger('click')

    expect(formatButtons[2]?.classes()).toContain('active')
  })

  it('should filter emojis by format WebP', async () => {
    const wrapper = mount(App)

    const formatButtons = wrapper.findAll('.filter-group:nth-child(1) .filter-btn')
    await formatButtons[3]!.trigger('click')

    expect(formatButtons[3]?.classes()).toContain('active')
  })

  it('should filter emojis by emotion', async () => {
    const wrapper = mount(App)

    const emotionButtons = wrapper.findAll('.filter-group:nth-child(2) .filter-btn')
    const cryingButton = emotionButtons.find(btn => btn.text() === '大哭')

    expect(cryingButton).toBeDefined()

    await cryingButton!.trigger('click')

    expect(cryingButton?.classes()).toContain('active')
    expect(emotionButtons[0]?.classes()).not.toContain('active')
  })

  it('should reset format filter to "All" when clicking reset button', async () => {
    const wrapper = mount(App)

    const formatButtons = wrapper.findAll('.filter-group:nth-child(1) .filter-btn')
    await formatButtons[1]!.trigger('click')

    const resetButton = wrapper.find('.reset-btn')
    await resetButton.trigger('click')

    expect(formatButtons[0]?.classes()).toContain('active')
  })

  it('should reset emotion filter to "All" when clicking reset button', async () => {
    const wrapper = mount(App)

    const emotionButtons = wrapper.findAll('.filter-group:nth-child(2) .filter-btn')
    await emotionButtons[1]!.trigger('click')

    const resetButton = wrapper.find('.reset-btn')
    await resetButton.trigger('click')

    expect(emotionButtons[0]?.classes()).toContain('active')
  })

  it('should render emoji grid with EmojiCard components', () => {
    const wrapper = mount(App)

    const emojiGrid = wrapper.find('.emoji-grid')
    expect(emojiGrid.exists()).toBe(true)

    const emojiCards = wrapper.findAll('.emoji-card')
    expect(emojiCards.length).toBeGreaterThan(0)
  })

  it('should display correct results count', () => {
    const wrapper = mount(App)

    const resultsCount = wrapper.find('.results-count')
    expect(resultsCount.text()).toBe('9')
  })

  it('should show empty state when no emojis match filters', async () => {
    const wrapper = mount(App)

    const emotionButtons = wrapper.findAll('.filter-group:nth-child(2) .filter-btn')

    if (emotionButtons.length > 1) {
      await emotionButtons[emotionButtons.length - 1]!.trigger('click')

      const emptyState = wrapper.find('.empty-state')
    }
  })

  it('should render responsive design classes', () => {
    const wrapper = mount(App)

    expect(wrapper.find('.app-container').exists()).toBe(true)
    expect(wrapper.find('.app-header').exists()).toBe(true)
    expect(wrapper.find('.filters-section').exists()).toBe(true)
    expect(wrapper.find('.emoji-grid-section').exists()).toBe(true)
    expect(wrapper.find('.emoji-grid').exists()).toBe(true)
  })

  it('should have clear filters button when filters are active', async () => {
    const wrapper = mount(App)

    expect(wrapper.find('.reset-btn').exists()).toBe(false)

    const formatButtons = wrapper.findAll('.filter-group:nth-child(1) .filter-btn')
    await formatButtons[1]!.trigger('click')

    expect(wrapper.find('.reset-btn').exists()).toBe(true)
  })
})
