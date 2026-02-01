import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import EmojiCard from '../components/EmojiCard.vue'

const mockEmoji = {
  id: '001_Block!',
  name: '001_Block!.png',
  emotion: 'Block!',
  format: 'png' as const,
  path: '/png/001_Block!.png'
}

describe('EmojiCard', () => {
  it('should render emoji image correctly', () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: false,
        size: 64,
        size: 64
      }
    })

    const emojiImage = wrapper.find('.emoji-image')
    expect(emojiImage.exists()).toBe(true)
    expect(emojiImage.attributes('src')).toBe('/png/001_Block!.png')
    expect(emojiImage.attributes('alt')).toBe('001_Block!.png')
    expect(emojiImage.attributes('loading')).toBe('lazy')
  })

  it('should display emoji name', () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: false,
        size: 64
      }
    })

    const emojiName = wrapper.find('.emoji-name')
    expect(emojiName.exists()).toBe(true)
    expect(emojiName.text()).toBe('001_Block!.png')
  })

  it('should display emoji emotion', () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: false,
        size: 64
      }
    })

    const emojiEmotion = wrapper.find('.emoji-emotion')
    expect(emojiEmotion.exists()).toBe(true)
    expect(emojiEmotion.text()).toBe('Block!')
  })

  it('should display emoji format badge', () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: false,
        size: 64
      }
    })

    const formatBadge = wrapper.find('.emoji-format')
    expect(formatBadge.exists()).toBe(true)
    expect(formatBadge.text()).toBe('PNG')
    expect(formatBadge.classes()).toContain('format-png')
  })

  it('should display correct format badge for GIF', () => {
    const gifEmoji = { ...mockEmoji, format: 'gif' as const, path: '/gif/emoji.gif' }
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: gifEmoji,
        selected: false,
        size: 64
      }
    })

    const formatBadge = wrapper.find('.emoji-format')
    expect(formatBadge.text()).toBe('GIF')
    expect(formatBadge.classes()).toContain('format-gif')
  })

  it('should display correct format badge for WebP', () => {
    const webpEmoji = { ...mockEmoji, format: 'webp' as const, path: '/webp/emoji.webp' }
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: webpEmoji,
        selected: false,
        size: 64
      }
    })

    const formatBadge = wrapper.find('.emoji-format')
    expect(formatBadge.text()).toBe('WEBP')
    expect(formatBadge.classes()).toContain('format-webp')
  })

  it('should render checkbox with correct checked state', () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: false,
        size: 64
      }
    })

    const checkbox = wrapper.find('.emoji-checkbox')
    expect(checkbox.exists()).toBe(true)
    expect(checkbox.attributes('checked')).toBeFalsy()
  })

  it('should show checkbox checked when selected prop is true', () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: true,
        size: 64
      }
    })

    const checkbox = wrapper.find('.emoji-checkbox')
    expect(checkbox.attributes('checked')).toBeDefined()
  })

  it('should emit update:selected event when checkbox is toggled', async () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: false,
        size: 64
      }
    })

    const checkbox = wrapper.find('.emoji-checkbox')
    await checkbox.setChecked(true)

    expect(wrapper.emitted('update:selected')).toBeTruthy()
    expect(wrapper.emitted('update:selected')![0]).toEqual([true])
  })

  it('should emit update:selected with false when unchecking checkbox', async () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: true,
        size: 64
      }
    })

    const checkbox = wrapper.find('.emoji-checkbox')
    await checkbox.setChecked(false)

    expect(wrapper.emitted('update:selected')).toBeTruthy()
    expect(wrapper.emitted('update:selected')![0]).toEqual([false])
  })

  it('should render copy button', () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: false,
        size: 64
      }
    })

    const copyButton = wrapper.find('.btn-copy')
    expect(copyButton.exists()).toBe(true)
    expect(copyButton.text()).toContain('Copy')
    expect(copyButton.attributes('aria-label')).toBe('Copy HTML tag')
  })

  it('should emit copy event when copy button is clicked', async () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: false,
        size: 64
      }
    })

    const copyButton = wrapper.find('.btn-copy')
    await copyButton.trigger('click')

    expect(wrapper.emitted('copy')).toBeTruthy()
    expect(wrapper.emitted('copy')!.length).toBe(1)
  })

  it('should render download button', () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: false,
        size: 64
      }
    })

    const downloadButton = wrapper.find('.btn-download')
    expect(downloadButton.exists()).toBe(true)
    expect(downloadButton.text()).toContain('Download')
    expect(downloadButton.attributes('aria-label')).toBe('Download image')
  })

  it('should emit download event when download button is clicked', async () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: false,
        size: 64
      }
    })

    const downloadButton = wrapper.find('.btn-download')
    await downloadButton.trigger('click')

    expect(wrapper.emitted('download')).toBeTruthy()
    expect(wrapper.emitted('download')!.length).toBe(1)
  })

  it('should render size preview placeholder', () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: false,
        size: 64
      }
    })

    const sizePreview = wrapper.find('.size-preview')
    expect(sizePreview.exists()).toBe(true)

    const previewLabel = wrapper.find('.preview-label')
    expect(previewLabel.text()).toBe('Size Preview')

    const previewPlaceholder = wrapper.find('.preview-placeholder')
    expect(previewPlaceholder.text()).toBe('64px')
  })

  it('should render checkbox with unique ID', () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: false,
        size: 64
      }
    })

    const checkbox = wrapper.find('.emoji-checkbox')
    expect(checkbox.attributes('id')).toBe('checkbox-001_Block!')

    const label = wrapper.find('.checkbox-label')
    expect(label.attributes('for')).toBe('checkbox-001_Block!')
  })

  it('should render emoji card container with correct classes', () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: false,
        size: 64
      }
    })

    const card = wrapper.find('.emoji-card')
    expect(card.exists()).toBe(true)
  })

  it('should render emoji image wrapper', () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: false,
        size: 64
      }
    })

    const imageWrapper = wrapper.find('.emoji-image-wrapper')
    expect(imageWrapper.exists()).toBe(true)
  })

  it('should render emoji info section', () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: false,
        size: 64
      }
    })

    const emojiInfo = wrapper.find('.emoji-info')
    expect(emojiInfo.exists()).toBe(true)
  })

  it('should render action buttons section', () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: false,
        size: 64
      }
    })

    const actionButtons = wrapper.find('.action-buttons')
    expect(actionButtons.exists()).toBe(true)
  })

  it('should render both copy and download buttons', () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: false,
        size: 64
      }
    })

    const copyButton = wrapper.find('.btn-copy')
    const downloadButton = wrapper.find('.btn-download')

    expect(copyButton.exists()).toBe(true)
    expect(downloadButton.exists()).toBe(true)
  })

  it('should handle emoji with special characters in name', () => {
    const emojiWithSpecialChars = {
      id: '003_不会吧？',
      name: '003_不会吧？.png',
      emotion: '不会吧',
      format: 'png' as const,
      path: '/png/003_不会吧？.png'
    }

    const wrapper = mount(EmojiCard, {
      props: {
        emoji: emojiWithSpecialChars,
        selected: false,
        size: 64
      }
    })

    const emojiName = wrapper.find('.emoji-name')
    expect(emojiName.text()).toBe('003_不会吧？.png')
  })

  it('should handle emoji with Chinese emotion', () => {
    const chineseEmoji = {
      id: '010_大哭',
      name: '010_大哭.png',
      emotion: '大哭',
      format: 'png' as const,
      path: '/png/010_大哭.png'
    }

    const wrapper = mount(EmojiCard, {
      props: {
        emoji: chineseEmoji,
        selected: false,
        size: 64
      }
    })

    const emojiEmotion = wrapper.find('.emoji-emotion')
    expect(emojiEmotion.text()).toBe('大哭')
  })

  it('should have correct checkbox label text', () => {
    const wrapper = mount(EmojiCard, {
      props: {
        emoji: mockEmoji,
        selected: false,
        size: 64
      }
    })

    const checkboxLabel = wrapper.find('.checkbox-label')
    expect(checkboxLabel.text()).toBe('Select')
  })
})
