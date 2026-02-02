import { ref, computed } from 'vue'

export function useBatchSelection() {
  const selectedIds = ref<Set<string>>(new Set())

  const toggleSelection = (emojiId: string) => {
    if (selectedIds.value.has(emojiId)) {
      selectedIds.value.delete(emojiId)
    } else {
      selectedIds.value.add(emojiId)
    }
  }

  const selectAll = (emojis: { id: string }[]) => {
    selectedIds.value.clear()
    emojis.forEach(emoji => selectedIds.value.add(emoji.id))
  }

  const selectNone = () => {
    selectedIds.value.clear()
  }

  const isSelected = (emojiId: string) => {
    return selectedIds.value.has(emojiId)
  }

  const allSelected = (emojis: { id: string }[]) => {
    if (emojis.length === 0) return false
    return emojis.every(emoji => selectedIds.value.has(emoji.id))
  }

  const getSelectedEmojis = <T extends { id: string }>(emojis: T[]) => {
    return emojis.filter(emoji => selectedIds.value.has(emoji.id))
  }

  const selectedCount = computed(() => selectedIds.value.size)

  return {
    selectedIds,
    selectedCount,
    toggleSelection,
    selectAll,
    selectNone,
    isSelected,
    allSelected,
    getSelectedEmojis
  }
}
