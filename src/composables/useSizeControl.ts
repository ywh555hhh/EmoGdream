import { ref, computed } from 'vue'

export function useSizeControl() {
  const size = ref<number>(64)

  const htmlTag = computed(() => {
    return `<img width="${size.value}" height="${size.value}" />`
  })

  const sizeValue = computed(() => {
    return `${size.value}px`
  })

  const updateSize = (newSize: number) => {
    size.value = Math.max(16, Math.min(128, newSize))
  }

  const resetSize = () => {
    size.value = 64
  }

  return {
    size,
    htmlTag,
    sizeValue,
    updateSize,
    resetSize
  }
}