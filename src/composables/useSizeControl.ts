import { ref, computed } from 'vue'

const SIZES: readonly [number, number, number, number, number] = [32, 48, 64, 96, 128]

export function useSizeControl() {
  const sizeIndex = ref<number>(2)

  const size = computed((): number => SIZES[sizeIndex.value]!)

  const sizeValue = computed(() => `${size.value}px`)

  const setSize = (value: number) => {
    const idx = SIZES.indexOf(value)
    if (idx !== -1) {
      sizeIndex.value = idx
    }
  }

  const setSizeIndex = (idx: number) => {
    sizeIndex.value = Math.max(0, Math.min(SIZES.length - 1, idx))
  }

  const increaseSize = () => {
    if (sizeIndex.value < SIZES.length - 1) {
      sizeIndex.value++
    }
  }

  const decreaseSize = () => {
    if (sizeIndex.value > 0) {
      sizeIndex.value--
    }
  }

  return {
    size,
    sizeValue,
    sizes: SIZES,
    sizeIndex,
    setSize,
    setSizeIndex,
    increaseSize,
    decreaseSize
  }
}
