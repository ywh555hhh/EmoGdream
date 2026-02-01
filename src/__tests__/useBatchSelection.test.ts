import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useBatchSelection } from '../composables/useBatchSelection'
import type { Emoji } from '../composables/useEmojis'

const mockClipboard = {
  writeText: vi.fn()
}

const mockExecCommand = vi.fn()

const mockCreateElement = vi.fn()
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()

describe('useBatchSelection', () => {
  const mockEmojis: Emoji[] = [
    {
      id: 'emoji1',
      name: 'happy1.png',
      emotion: 'happy',
      format: 'png',
      path: '/png/happy1.png'
    },
    {
      id: 'emoji2',
      name: 'sad1.gif',
      emotion: 'sad',
      format: 'gif',
      path: '/gif/sad1.gif'
    },
    {
      id: 'emoji3',
      name: 'angry1.webp',
      emotion: 'angry',
      format: 'webp',
      path: '/webp/angry1.webp'
    }
  ]

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
    
    mockCreateElement.mockReturnValue({
      value: '',
      style: {},
      select: vi.fn()
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should initialize with empty selection', () => {
    const { selectedCount, selectedIds } = useBatchSelection()
    
    expect(selectedCount.value).toBe(0)
    expect(selectedIds.value.size).toBe(0)
  })

  it('should toggle individual selection correctly', () => {
    const { toggleSelection, isSelected, selectedCount } = useBatchSelection()
    
    toggleSelection('emoji1', true)
    expect(isSelected('emoji1')).toBe(true)
    expect(selectedCount.value).toBe(1)
    
    toggleSelection('emoji1', false)
    expect(isSelected('emoji1')).toBe(false)
    expect(selectedCount.value).toBe(0)
  })

  it('should select all emojis correctly', () => {
    const { selectAll, isSelected, selectedCount } = useBatchSelection()
    
    selectAll(mockEmojis)
    
    expect(selectedCount.value).toBe(mockEmojis.length)
    expect(isSelected('emoji1')).toBe(true)
    expect(isSelected('emoji2')).toBe(true)
    expect(isSelected('emoji3')).toBe(true)
  })

  it('should clear all selections correctly', () => {
    const { selectAll, selectNone, isSelected, selectedCount } = useBatchSelection()
    
    selectAll(mockEmojis)
    expect(selectedCount.value).toBe(mockEmojis.length)
    
    selectNone()
    expect(selectedCount.value).toBe(0)
    expect(isSelected('emoji1')).toBe(false)
    expect(isSelected('emoji2')).toBe(false)
    expect(isSelected('emoji3')).toBe(false)
  })

  it('should check if all emojis are selected correctly', () => {
    const { toggleSelection, selectAll, selectNone, allSelected } = useBatchSelection()
    
    selectNone()
    expect(allSelected.value(mockEmojis)).toBe(false)
    
    toggleSelection('emoji1', true)
    expect(allSelected.value(mockEmojis)).toBe(false)
    
    toggleSelection('emoji2', true)
    toggleSelection('emoji3', true)
    expect(allSelected.value(mockEmojis)).toBe(true)
    
    selectAll(mockEmojis)
    expect(allSelected.value(mockEmojis)).toBe(true)
    
    expect(allSelected.value([])).toBe(false)
  })

  it('should get selected emojis correctly', () => {
    const { toggleSelection, getSelectedEmojis } = useBatchSelection()
    
    expect(getSelectedEmojis(mockEmojis)).toEqual([])
    
    toggleSelection('emoji1', true)
    toggleSelection('emoji3', true)
    
    const selected = getSelectedEmojis(mockEmojis)
    expect(selected).toHaveLength(2)
    expect(selected).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'emoji1' }),
        expect.objectContaining({ id: 'emoji3' })
      ])
    )
  })

  it('should handle batch copy with no selection', async () => {
    const { batchCopy } = useBatchSelection()
    
    const result = await batchCopy(mockEmojis)
    
    expect(result.success).toBe(false)
    expect(result.message).toBe('No emojis selected for batch copy')
  })

  it('should handle batch copy successfully with clipboard API', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined)
    
    const { toggleSelection, batchCopy } = useBatchSelection()
    
    toggleSelection('emoji1', true)
    toggleSelection('emoji2', true)
    
    const result = await batchCopy(mockEmojis)
    
    expect(result.success).toBe(true)
    expect(result.message).toBe('Copied 2 emoji HTML tags to clipboard!')
    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      '<img src="/png/happy1.png" alt="happy1.png" width="64" height="64" />\n' +
      '<img src="/gif/sad1.gif" alt="sad1.gif" width="64" height="64" />'
    )
  })

  it('should handle batch copy with fallback method', async () => {
    mockClipboard.writeText.mockRejectedValue(new Error('Clipboard not available'))
    mockExecCommand.mockReturnValue(true)
    
    const mockTextarea = {
      value: '',
      style: {},
      select: vi.fn()
    }
    mockCreateElement.mockReturnValue(mockTextarea)
    
    const { toggleSelection, batchCopy } = useBatchSelection()
    
    toggleSelection('emoji1', true)
    
    const result = await batchCopy(mockEmojis)
    
    expect(result.success).toBe(true)
    expect(result.message).toBe('Copied 1 emoji HTML tags to clipboard!')
    expect(mockCreateElement).toHaveBeenCalledWith('textarea')
    expect(mockAppendChild).toHaveBeenCalledWith(mockTextarea)
    expect(mockTextarea.select).toHaveBeenCalled()
    expect(mockExecCommand).toHaveBeenCalledWith('copy')
    expect(mockRemoveChild).toHaveBeenCalledWith(mockTextarea)
  })

  it('should handle batch copy failure with fallback method', async () => {
    mockClipboard.writeText.mockRejectedValue(new Error('Clipboard not available'))
    mockExecCommand.mockReturnValue(false)
    
    const mockTextarea = {
      value: '',
      style: {},
      select: vi.fn()
    }
    mockCreateElement.mockReturnValue(mockTextarea)
    
    const { toggleSelection, batchCopy } = useBatchSelection()
    
    toggleSelection('emoji1', true)
    
    const result = await batchCopy(mockEmojis)
    
    expect(result.success).toBe(false)
    expect(result.message).toBe('Failed to copy to clipboard. Please try again.')
  })

  it('should handle clipboard size limit correctly', async () => {
    const { toggleSelection, batchCopy } = useBatchSelection()
    
    toggleSelection('emoji1', true)
    
    const result = await batchCopy(mockEmojis, { width: 1000, height: 1000 })
    
    expect(result.success).toBe(false)
    expect(result.message).toContain('Batch content too large')
    expect(result.message).toContain('Maximum allowed size is 1MB')
  })

  it('should use custom dimensions in batch copy', async () => {
    mockClipboard.writeText.mockResolvedValue(undefined)
    
    const { toggleSelection, batchCopy } = useBatchSelection()
    
    toggleSelection('emoji1', true)
    
    await batchCopy(mockEmojis, { width: 128, height: 128 })
    
    expect(mockClipboard.writeText).toHaveBeenCalledWith(
      '<img src="/png/happy1.png" alt="happy1.png" width="128" height="128" />'
    )
  })

  it('should handle unexpected errors in batch copy', async () => {
    mockClipboard.writeText.mockImplementation(() => {
      throw new Error('Unexpected error')
    })
    
    const { toggleSelection, batchCopy } = useBatchSelection()
    
    toggleSelection('emoji1', true)
    
    const result = await batchCopy(mockEmojis)
    
    expect(result.success).toBe(false)
    expect(result.message).toBe('Unexpected error')
  })
})