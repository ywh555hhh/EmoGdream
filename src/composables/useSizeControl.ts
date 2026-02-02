import { ref, computed } from 'vue'

// GitHub inline emoji is about 16-20px, using sizes that fit inline text
const SIZES: readonly number[] = [12, 16, 20, 24, 32, 40, 48, 64]

export function useSizeControl() {
  // Default to 16px (GitHub emoji size)
  const sizeIndex = ref<number>(1)
  const customSize = ref<number | null>(null)

  const size = computed((): number => customSize.value ?? SIZES[sizeIndex.value]!)

  const sizeValue = computed(() => `${size.value}px`)
  const isCustom = computed(() => customSize.value !== null)

  const setSize = (value: number) => {
    // If value is in preset sizes, select that
    const idx = SIZES.indexOf(value)
    if (idx !== -1) {
      sizeIndex.value = idx
      customSize.value = null
    } else {
      // Use custom size
      customSize.value = value
    }
  }

  const setCustomSize = (value: string) => {
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 8 && num <= 128) {
      customSize.value = num
    } else if (value === '') {
      customSize.value = null
    }
  }

  const setSizeIndex = (idx: number) => {
    sizeIndex.value = Math.max(0, Math.min(SIZES.length - 1, idx))
    customSize.value = null
  }

  const increaseSize = () => {
    if (isCustom.value) {
      const current = customSize.value
      if (current !== null && current !== undefined) {
        const newSize = current + 8
        if (newSize <= 128) {
          customSize.value = newSize
        }
      }
    } else if (sizeIndex.value < SIZES.length - 1) {
      sizeIndex.value++
    }
  }

  const decreaseSize = () => {
    if (isCustom.value) {
      const current = customSize.value
      if (current !== null && current !== undefined) {
        const newSize = current - 8
        if (newSize >= 8) {
          customSize.value = newSize
        }
      }
    } else if (sizeIndex.value > 0) {
      sizeIndex.value--
    }
  }

  return {
    size,
    sizeValue,
    sizes: SIZES,
    sizeIndex,
    isCustom,
    customSize,
    setSize,
    setCustomSize,
    setSizeIndex,
    increaseSize,
    decreaseSize
  }
}
