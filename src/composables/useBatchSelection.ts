import { ref, computed } from 'vue'
import type { Emoji } from './useEmojis'
import { useClipboard } from './useClipboard'

export function useBatchSelection() {
  const selectedIds = ref<Set<string>>(new Set())
  const { copyHtmlTag } = useClipboard()

  const toggleSelection = (emojiId: string, selected: boolean) => {
    if (selected) {
      selectedIds.value.add(emojiId)
    } else {
      selectedIds.value.delete(emojiId)
    }
  }

  const selectAll = (emojis: Emoji[]) => {
    selectedIds.value.clear()
    emojis.forEach(emoji => selectedIds.value.add(emoji.id))
  }

  const selectNone = () => {
    selectedIds.value.clear()
  }

  const isSelected = (emojiId: string) => {
    return selectedIds.value.has(emojiId)
  }

  const selectedCount = computed(() => selectedIds.value.size)

  const allSelected = computed(() => (emojis: Emoji[]) => {
    if (emojis.length === 0) return false
    return emojis.every(emoji => selectedIds.value.has(emoji.id))
  })

  const batchCopy = async (emojis: Emoji[], options?: { width?: number; height?: number }) => {
    if (selectedCount.value === 0) {
      return {
        success: false,
        message: 'No emojis selected for batch copy'
      }
    }

    try {
      const selectedEmojis = emojis.filter(emoji => selectedIds.value.has(emoji.id))
      
      const combinedTags = selectedEmojis.map(emoji => {
        const { width = 64, height = 64 } = options || {}
        return `<img src="${emoji.path}" alt="${emoji.name}" width="${width}" height="${height}" />`
      }).join('\n')

      const textSize = new Blob([combinedTags]).size
      const MAX_SIZE = 1024 * 1024
      
      if (textSize > MAX_SIZE) {
        return {
          success: false,
          message: `Batch content too large (${Math.round(textSize / 1024)}KB). Maximum allowed size is 1MB. Please select fewer emojis.`
        }
      }
      try {
        await navigator.clipboard.writeText(combinedTags)
        return {
          success: true,
          message: `Copied ${selectedCount.value} emoji HTML tags to clipboard!`
        }
      } catch (clipboardError) {
        const textarea = document.createElement('textarea')
        textarea.value = combinedTags
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        textarea.style.left = '-9999px'
        document.body.appendChild(textarea)
        textarea.select()
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textarea)
        
        if (successful) {
          return {
            success: true,
            message: `Copied ${selectedCount.value} emoji HTML tags to clipboard!`
          }
        } else {
          return {
            success: false,
            message: 'Failed to copy to clipboard. Please try again.'
          }
        }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred during batch copy.'
      }
    }
  }

  const getSelectedEmojis = (emojis: Emoji[]) => {
    return emojis.filter(emoji => selectedIds.value.has(emoji.id))
  }

  return {
    selectedIds,
    selectedCount,
    toggleSelection,
    selectAll,
    selectNone,
    isSelected,
    allSelected,
    batchCopy,
    getSelectedEmojis
  }
}