import { ref } from 'vue'
import type { Emoji } from './useEmojis'

export function useDownload() {
  const isDownloading = ref(false)
  const downloadError = ref<string | null>(null)

  const downloadEmoji = async (emoji: Emoji): Promise<void> => {
    isDownloading.value = true
    downloadError.value = null

    try {
      const link = document.createElement('a')
      link.href = emoji.path
      
      const filename = emoji.name
      link.download = filename
      
      if (emoji.path.startsWith('http')) {
        const response = await fetch(emoji.path, { mode: 'cors' })
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`)
        }
        
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        link.href = blobUrl
        
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
      }
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      showSuccessNotification(`Downloaded ${filename}`)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed'
      downloadError.value = errorMessage
      showErrorNotification(errorMessage)
      throw error
    } finally {
      isDownloading.value = false
    }
  }

  const showSuccessNotification = (message: string) => {
    const notification = document.createElement('div')
    notification.className = 'download-notification success'
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #4caf50;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 1000;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: opacity 0.3s ease;
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.style.opacity = '0'
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  const showErrorNotification = (message: string) => {
    const notification = document.createElement('div')
    notification.className = 'download-notification error'
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 1000;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: opacity 0.3s ease;
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.style.opacity = '0'
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 5000)
  }

  return {
    isDownloading,
    downloadError,
    downloadEmoji
  }
}