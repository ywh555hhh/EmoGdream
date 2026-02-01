import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useClipboard } from '../composables/useClipboard'
import type { Emoji } from '../composables/useEmojis'

const mockClipboard = {
  writeText: vi.fn()
}

const mockExecCommand = vi.fn()

const mockCreateElement = vi.fn()
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()
const mockSetTimeout = vi.fn((fn, delay) => {
  if (delay === 3000) {
    return 1 as any
  }
  return fn()
})

describe('useClipboard', () => {
  const mockEmoji: Emoji = {
    id: 'test-emoji',
    name: 'test-emoji.png',
    emotion: 'happy',
    format: 'png',
    path: '/png/test-emoji.png'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true
    })
    
    Object.defineProperty(document, 'execCommand', {
      value: mockExecCommand,
      writable: true
    })
    
    Object.defineProperty(document, 'createElement', {
      value: mockCreateElement,
      writable: true
    })
    
    Object.defineProperty(document, 'body', {
      value: {
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild
      },
      writable: true
    })
    
    global.setTimeout = mockSetTimeout
    
    // Setup mock for createElement to return a proper element mock
    mockCreateElement.mockImplementation((tagName: string) => {
      if (tagName === 'div') {
        return {
          textContent: '',
          style: { cssText: '' },
          parentNode: null
        }
      } else if (tagName === 'textarea') {
        return {
          value: '',
          style: { position: '', opacity: '', left: '' },
          select: vi.fn()
        }
      }
      return {}
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('generates HTML tag with default size attributes', () => {
    const { generateHtmlTag } = useClipboard()
    
    const htmlTag = generateHtmlTag(mockEmoji)
    
    expect(htmlTag).toBe('<img src="/png/test-emoji.png" alt="test-emoji.png" width="64" height="64" />')
  })

  it('generates HTML tag with custom size attributes', () => {
    const { generateHtmlTag } = useClipboard()
    
    const htmlTag = generateHtmlTag(mockEmoji, { width: 128, height: 128, alt: 'Custom Alt' })
    
    expect(htmlTag).toBe('<img src="/png/test-emoji.png" alt="Custom Alt" width="128" height="128" />')
  })

  it('copies HTML tag using modern Clipboard API successfully', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined)
    
    const { copyHtmlTag } = useClipboard()
    const result = await copyHtmlTag(mockEmoji)
    
    expect(mockClipboard.writeText).toHaveBeenCalledWith('<img src="/png/test-emoji.png" alt="test-emoji.png" width="64" height="64" />')
    expect(result.success).toBe(true)
    expect(result.message).toBe('Copied HTML tag for test-emoji.png to clipboard!')
  })

  it('falls back to execCommand when Clipboard API fails', async () => {
    mockClipboard.writeText.mockRejectedValue(new Error('Clipboard API not available'))
    mockExecCommand.mockReturnValue(true)
    
    const mockTextarea = {
      value: '',
      style: {},
      select: vi.fn()
    }
    mockCreateElement.mockReturnValue(mockTextarea)
    
    const { copyHtmlTag } = useClipboard()
    const result = await copyHtmlTag(mockEmoji)
    
    expect(mockClipboard.writeText).toHaveBeenCalled()
    expect(mockCreateElement).toHaveBeenCalledWith('textarea')
    expect(mockTextarea.select).toHaveBeenCalled()
    expect(mockExecCommand).toHaveBeenCalledWith('copy')
    expect(mockAppendChild).toHaveBeenCalledWith(mockTextarea)
    expect(mockRemoveChild).toHaveBeenCalledWith(mockTextarea)
    expect(result.success).toBe(true)
    expect(result.message).toBe('Copied HTML tag for test-emoji.png to clipboard!')
  })

  it('handles clipboard permission denied error', async () => {
    const permissionError = new Error('Permission denied')
    permissionError.name = 'NotAllowedError'
    mockClipboard.writeText.mockRejectedValue(permissionError)
    mockExecCommand.mockReturnValue(false)
    
    const mockTextarea = {
      value: '',
      style: {},
      select: vi.fn()
    }
    mockCreateElement.mockReturnValue(mockTextarea)
    
    const { copyHtmlTag } = useClipboard()
    const result = await copyHtmlTag(mockEmoji)
    
    expect(result.success).toBe(false)
    expect(result.message).toBe('Clipboard access denied. Please grant clipboard permissions.')
  })

  it('handles clipboard not found error', async () => {
    const notFoundError = new Error('Clipboard not found')
    notFoundError.name = 'NotFoundError'
    mockClipboard.writeText.mockRejectedValue(notFoundError)
    mockExecCommand.mockReturnValue(false)
    
    const mockTextarea = {
      value: '',
      style: {},
      select: vi.fn()
    }
    mockCreateElement.mockReturnValue(mockTextarea)
    
    const { copyHtmlTag } = useClipboard()
    const result = await copyHtmlTag(mockEmoji)
    
    expect(result.success).toBe(false)
    expect(result.message).toBe('Clipboard not available in this browser.')
  })

  it('handles generic error from clipboard operations', async () => {
    const genericError = new Error('Something went wrong')
    mockClipboard.writeText.mockRejectedValue(genericError)
    mockExecCommand.mockReturnValue(false)
    
    const mockTextarea = {
      value: '',
      style: {},
      select: vi.fn()
    }
    mockCreateElement.mockReturnValue(mockTextarea)
    
    const { copyHtmlTag } = useClipboard()
    const result = await copyHtmlTag(mockEmoji)
    
    expect(result.success).toBe(false)
    expect(result.message).toBe('Copy failed: Something went wrong')
  })

  it('prevents concurrent copy operations', async () => {
    mockClipboard.writeText.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    const { copyHtmlTag, isCopying } = useClipboard()
    
    const firstCopy = copyHtmlTag(mockEmoji)
    expect(isCopying.value).toBe(true)
    
    const secondCopy = copyHtmlTag(mockEmoji)
    
    const [firstResult, secondResult] = await Promise.all([firstCopy, secondCopy])
    
    expect(firstResult.success).toBe(true)
    expect(secondResult.success).toBe(false)
    expect(secondResult.message).toBe('Copy operation already in progress')
  })

  it('creates success toast notification', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined)
    
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    const { copyHtmlTag } = useClipboard()
    await copyHtmlTag(mockEmoji)
    
    expect(consoleLogSpy).toHaveBeenCalledWith('✅', 'Copied HTML tag for test-emoji.png to clipboard!')
    expect(mockCreateElement).toHaveBeenCalledWith('div')
    expect(mockAppendChild).toHaveBeenCalled()
    expect(mockSetTimeout).toHaveBeenCalled()
    
    consoleLogSpy.mockRestore()
  })

  it('creates error toast notification', async () => {
    mockClipboard.writeText.mockRejectedValue(new Error('Test error'))
    mockExecCommand.mockReturnValue(false)
    
    const mockTextarea = {
      value: '',
      style: {},
      select: vi.fn()
    }
    mockCreateElement.mockReturnValue(mockTextarea)
    
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const { copyHtmlTag } = useClipboard()
    await copyHtmlTag(mockEmoji)
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌', 'Failed to copy to clipboard. Please try again.')
    expect(mockCreateElement).toHaveBeenCalledWith('div')
    expect(mockAppendChild).toHaveBeenCalled()
    expect(mockSetTimeout).toHaveBeenCalled()
    
    consoleErrorSpy.mockRestore()
  })

  it('resets isCopying state after operation completes', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined)
    
    const { copyHtmlTag, isCopying } = useClipboard()
    
    expect(isCopying.value).toBe(false)
    
    await copyHtmlTag(mockEmoji)
    
    expect(isCopying.value).toBe(false)
  })
})