import { describe, it, expect, vi, beforeEach, afterEach, nextTick } from 'vitest'
import { useDownload } from '../composables/useDownload'
import type { Emoji } from '../composables/useEmojis'

const { mockCreateElement, mockAppendChild, mockRemoveChild, mockClick, mockSetTimeout, mockCreateObjectURL, mockRevokeObjectURL, mockFetch } = vi.hoisted(() => ({
  mockCreateElement: vi.fn(),
  mockAppendChild: vi.fn(),
  mockRemoveChild: vi.fn(),
  mockClick: vi.fn(),
  mockSetTimeout: vi.fn(),
  mockCreateObjectURL: vi.fn(),
  mockRevokeObjectURL: vi.fn(),
  mockFetch: vi.fn()
}))

describe('useDownload', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    
    Object.defineProperty(global.document, 'createElement', {
      value: mockCreateElement,
      writable: true
    })
    
    Object.defineProperty(global.document, 'body', {
      value: {
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild
      },
      writable: true
    })
    
    Object.defineProperty(global, 'setTimeout', {
      value: mockSetTimeout,
      writable: true
    })
    
    Object.defineProperty(global.URL, 'createObjectURL', {
      value: mockCreateObjectURL,
      writable: true
    })
    
    Object.defineProperty(global.URL, 'revokeObjectURL', {
      value: mockRevokeObjectURL,
      writable: true
    })
    
    Object.defineProperty(global, 'fetch', {
      value: mockFetch,
      writable: true
    })
    
    const mockLink = {
      href: '',
      download: '',
      click: mockClick,
      style: { cssText: '' }
    }
    mockCreateElement.mockReturnValue(mockLink)
    
    mockSetTimeout.mockImplementation((callback, delay) => {
      callback()
      return 123
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mockEmoji: Emoji = {
    id: '123_happy',
    name: '123_happy.png',
    emotion: 'happy',
    format: 'png',
    path: '/png/123_happy.png'
  }

  it('should initialize with default values', () => {
    const { isDownloading, downloadError } = useDownload()
    
    expect(isDownloading.value).toBe(false)
    expect(downloadError.value).toBe(null)
  })

  it('should download local image file successfully', async () => {
    const { downloadEmoji, isDownloading, downloadError } = useDownload()
    
    const downloadPromise = downloadEmoji(mockEmoji)
    
    await nextTick()
    expect(isDownloading.value).toBe(true)
    
    await downloadPromise
    
    expect(isDownloading.value).toBe(false)
    expect(downloadError.value).toBe(null)
    
    expect(mockCreateElement).toHaveBeenCalledWith('a')
    expect(mockAppendChild).toHaveBeenCalled()
    expect(mockClick).toHaveBeenCalled()
    expect(mockRemoveChild).toHaveBeenCalled()
  })

  it('should set correct download filename', async () => {
    const { downloadEmoji } = useDownload()
    
    const mockLink = {
      href: '',
      download: '',
      click: mockClick,
      style: { cssText: '' }
    }
    mockCreateElement.mockReturnValue(mockLink)
    
    await downloadEmoji(mockEmoji)
    
    expect(mockLink.download).toBe(mockEmoji.name)
  })

  it('should handle cross-origin images by fetching and creating blob', async () => {
    const crossOriginEmoji: Emoji = {
      ...mockEmoji,
      path: 'https://example.com/image.png'
    }
    
    const mockResponse = {
      ok: true,
      blob: vi.fn().mockResolvedValue(new Blob())
    }
    mockFetch.mockResolvedValue(mockResponse)
    
    const { downloadEmoji } = useDownload()
    
    await downloadEmoji(crossOriginEmoji)
    
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/image.png', { mode: 'cors' })
    expect(mockResponse.blob).toHaveBeenCalled()
    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalled()
  })

  it('should handle fetch errors for cross-origin images', async () => {
    const crossOriginEmoji: Emoji = {
      ...mockEmoji,
      path: 'https://example.com/image.png'
    }
    
    const mockResponse = {
      ok: false,
      statusText: 'Not Found'
    }
    mockFetch.mockResolvedValue(mockResponse)
    
    const { downloadEmoji, downloadError } = useDownload()
    
    await expect(downloadEmoji(crossOriginEmoji)).rejects.toThrow()
    
    expect(downloadError.value).toBe('Failed to fetch image: Not Found')
  })

  it('should handle network errors', async () => {
    const crossOriginEmoji: Emoji = {
      ...mockEmoji,
      path: 'https://example.com/image.png'
    }
    
    mockFetch.mockRejectedValue(new Error('Network error'))
    
    const { downloadEmoji, downloadError } = useDownload()
    
    await expect(downloadEmoji(crossOriginEmoji)).rejects.toThrow('Network error')
    
    expect(downloadError.value).toBe('Network error')
  })

  it('should show success notification', async () => {
    const { downloadEmoji } = useDownload()
    
    const mockLink = {
      href: '',
      download: '',
      click: mockClick,
      style: { cssText: '' }
    }
    const mockNotification = {
      className: '',
      textContent: '',
      style: { cssText: '', opacity: '' }
    }
    
    mockCreateElement
      .mockReturnValueOnce(mockLink)
      .mockReturnValueOnce(mockNotification)
    
    await downloadEmoji(mockEmoji)
    
    expect(mockCreateElement).toHaveBeenCalledWith('div')
    expect(mockNotification.className).toBe('download-notification success')
    expect(mockNotification.textContent).toBe(`Downloaded ${mockEmoji.name}`)
    expect(mockAppendChild).toHaveBeenCalledWith(mockNotification)
  })

  it('should show error notification on failure', async () => {
    const crossOriginEmoji: Emoji = {
      ...mockEmoji,
      path: 'https://example.com/image.png'
    }
    
    mockFetch.mockRejectedValue(new Error('Network error'))
    
    const mockNotification = {
      className: '',
      textContent: '',
      style: { cssText: '', opacity: '' }
    }
    mockCreateElement.mockReturnValue(mockNotification)
    
    const { downloadEmoji } = useDownload()
    
    await expect(downloadEmoji(crossOriginEmoji)).rejects.toThrow()
    
    expect(mockCreateElement).toHaveBeenCalledWith('div')
    expect(mockNotification.className).toBe('download-notification error')
    expect(mockNotification.textContent).toBe('Network error')
    expect(mockAppendChild).toHaveBeenCalledWith(mockNotification)
  })

  it('should handle different image formats', async () => {
    const gifEmoji: Emoji = {
      id: '456_excited',
      name: '456_excited.gif',
      emotion: 'excited',
      format: 'gif',
      path: '/gif/456_excited.gif'
    }
    
    const webpEmoji: Emoji = {
      id: '789_cool',
      name: '789_cool.webp',
      emotion: 'cool',
      format: 'webp',
      path: '/webp/789_cool.webp'
    }
    
    const { downloadEmoji } = useDownload()
    
    await downloadEmoji(gifEmoji)
    expect(mockCreateElement).toHaveBeenCalledWith('a')
    
    await downloadEmoji(webpEmoji)
    expect(mockCreateElement).toHaveBeenCalledWith('a')
  })

  it('should clean up blob URL after download', async () => {
    const crossOriginEmoji: Emoji = {
      ...mockEmoji,
      path: 'https://example.com/image.png'
    }
    
    const mockResponse = {
      ok: true,
      blob: vi.fn().mockResolvedValue(new Blob())
    }
    mockFetch.mockResolvedValue(mockResponse)
    
    const { downloadEmoji } = useDownload()
    
    await downloadEmoji(crossOriginEmoji)
    
    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalled()
  })
})