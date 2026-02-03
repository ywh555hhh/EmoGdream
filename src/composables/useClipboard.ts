import { ref } from 'vue'

interface CopyOptions {
  width?: number
  height?: number
  format?: 'png' | 'gif' | 'webp'
}

// GitHub Pages URL base
const GITHUB_BASE = 'https://ywh555hhh.github.io/EmoGdream'

export function useClipboard() {
  const toast = ref<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  })

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    toast.value = { show: true, message, type }
    setTimeout(() => { toast.value.show = false }, 2000)
  }

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textarea)
      return success
    }
  }

  const copyEmoji = async (emoji: { path: string; name: string; emotion: string; format: string; formats?: Record<string, string> }, options: CopyOptions = {}): Promise<boolean> => {
    const { width = 16, format } = options
    // Use specified format path if available, otherwise use default path
    const imagePath = format && emoji.formats?.[format]
      ? `${GITHUB_BASE}${emoji.formats[format]}`
      : `${GITHUB_BASE}${emoji.path}`
    const html = `<img src="${imagePath}" alt="${emoji.name}" width="${width}" align="absmiddle">`
    const success = await copyToClipboard(html)
    const formatLabel = format ? format.toUpperCase() : emoji.format.toUpperCase()
    showToast(success ? `Copied ${formatLabel}!` : 'Copy failed', success ? 'success' : 'error')
    return success
  }

  const copyMultiple = async (emojis: { path: string; name: string; emotion: string; format: string }[], options: CopyOptions = {}): Promise<boolean> => {
    const { width = 16 } = options
    const html = emojis.map(e =>
      `<img src="${GITHUB_BASE}${e.path}" alt="${e.name}" width="${width}" align="absmiddle">`
    ).join(' ')
    const success = await copyToClipboard(html)
    showToast(success ? `${emojis.length} emojis copied!` : 'Copy failed', success ? 'success' : 'error')
    return success
  }

  return {
    toast,
    copyEmoji,
    copyMultiple
  }
}
