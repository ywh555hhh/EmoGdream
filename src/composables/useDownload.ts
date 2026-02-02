import { ref } from 'vue'

// Use Vite's BASE_URL to handle both dev and production paths
const getFullPath = (path: string): string => {
  const basePath = import.meta.env.BASE_URL || '/'
  const cleanBase = basePath.replace(/\/$/, '')
  return `${cleanBase}${path}`
}

export function useDownload() {
  const toast = ref<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  })

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 2000)
  }

  const downloadEmoji = async (emoji: { path: string; name: string }): Promise<void> => {
    try {
      const link = document.createElement('a')
      link.href = getFullPath(emoji.path)
      link.download = emoji.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showToast(`Downloaded ${emoji.name}!`, 'success')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Download failed'
      showToast(msg, 'error')
      throw error
    }
  }

  const downloadMultiple = async (emojis: { path: string; name: string }[]): Promise<void> => {
    for (const emoji of emojis) {
      await downloadEmoji(emoji)
      await new Promise(r => setTimeout(r, 200))
    }
    showToast(`Downloaded ${emojis.length} emojis!`, 'success')
  }

  return {
    toast,
    downloadEmoji,
    downloadMultiple
  }
}
