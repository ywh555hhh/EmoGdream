import { ref } from 'vue'
import type { Emoji } from './useEmojis'

export interface CopyOptions {
  width?: number
  height?: number
  alt?: string
}

export interface CopyResult {
  success: boolean
  message: string
}

export function useClipboard() {
  const isCopying = ref(false)

  const generateHtmlTag = (emoji: Emoji, options: CopyOptions = {}): string => {
    const { width = 64, height = 64, alt = emoji.name } = options
    return `<img src="${emoji.path}" alt="${alt}" width="${width}" height="${height}" />`
  }

  const showSuccessToast = (message: string): void => {
    console.log('✅', message)
    
    const toast = document.createElement('div')
    toast.textContent = message
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #4caf50;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `
    document.body.appendChild(toast)
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 3000)
  }

  const showErrorToast = (message: string): void => {
    console.error('❌', message)
    
    const toast = document.createElement('div')
    toast.textContent = message
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `
    document.body.appendChild(toast)
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 3000)
  }

  const copyWithModernAPI = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (error) {
      return false
    }
  }

  const copyWithFallback = (text: string): boolean => {
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      
      textarea.select()
      const successful = document.execCommand('copy')
      
      document.body.removeChild(textarea)
      
      return successful
    } catch (error) {
      return false
    }
  }

  const copyHtmlTag = async (emoji: Emoji, options: CopyOptions = {}): Promise<CopyResult> => {
    if (isCopying.value) {
      return {
        success: false,
        message: 'Copy operation already in progress'
      }
    }

    isCopying.value = true
    
    try {
      const htmlTag = generateHtmlTag(emoji, options)
      
      let success = await copyWithModernAPI(htmlTag)
      
      if (!success) {
        success = copyWithFallback(htmlTag)
      }
      
      if (success) {
        const message = `Copied HTML tag for ${emoji.name} to clipboard!`
        showSuccessToast(message)
        return {
          success: true,
          message
        }
      } else {
        const message = 'Failed to copy to clipboard. Please try again.'
        showErrorToast(message)
        return {
          success: false,
          message
        }
      }
    } catch (error) {
      let message = 'An unexpected error occurred while copying.'
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          message = 'Clipboard access denied. Please grant clipboard permissions.'
        } else if (error.name === 'NotFoundError') {
          message = 'Clipboard not available in this browser.'
        } else {
          message = `Copy failed: ${error.message}`
        }
      }
      
      showErrorToast(message)
      return {
        success: false,
        message
      }
    } finally {
      isCopying.value = false
    }
  }

  return {
    isCopying,
    copyHtmlTag,
    generateHtmlTag
  }
}