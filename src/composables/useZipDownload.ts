import { ref } from 'vue'
import JSZip from 'jszip'
import type { Emoji } from './useEmojis'

export interface ZipDownloadProgress {
  current: number
  total: number
  percentage: number
}

export function useZipDownload() {
  const isZipping = ref(false)
  const progress = ref<ZipDownloadProgress>({ current: 0, total: 0, percentage: 0 })
  const toast = ref<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  })
  let toastTimer: ReturnType<typeof setTimeout> | null = null

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimer) clearTimeout(toastTimer)
    toast.value = { show: true, message, type }
    toastTimer = setTimeout(() => {
      toast.value.show = false
    }, 3000)
  }

  const fetchFileAsBlob = async (url: string): Promise<Blob> => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`)
    }
    return response.blob()
  }

  const downloadZip = async (emojis: Emoji[], filename: string = 'stickers.zip') => {
    if (emojis.length === 0) {
      showToast('No stickers selected for download', 'error')
      return
    }

    isZipping.value = true
    progress.value = { current: 0, total: emojis.length, percentage: 0 }

    try {
      const zip = new JSZip()
      const folderName = 'stickers'
      const folder = zip.folder(folderName)

      // Download all files and add to zip
      for (let i = 0; i < emojis.length; i++) {
        const emoji = emojis[i]
        if (!emoji) continue

        try {
          const blob = await fetchFileAsBlob(emoji.path)
          // Use filename with format
          const filename = `${emoji.name}`
          folder?.file(filename, blob)
        } catch (error) {
          console.error(`Failed to download ${emoji?.name}:`, error)
        }

        // Update progress
        progress.value = {
          current: i + 1,
          total: emojis.length,
          percentage: Math.round(((i + 1) / emojis.length) * 100)
        }
      }

      // Generate zip file
      const content = await zip.generateAsync({ type: 'blob' })

      // Trigger download
      const url = URL.createObjectURL(content)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      showToast(`Downloaded ${emojis.length} stickers as ZIP`, 'success')
    } catch (error) {
      console.error('Failed to create ZIP:', error)
      showToast('Failed to create ZIP file', 'error')
    } finally {
      isZipping.value = false
      progress.value = { current: 0, total: 0, percentage: 0 }
    }
  }

  return {
    isZipping,
    progress,
    toast,
    downloadZip
  }
}
