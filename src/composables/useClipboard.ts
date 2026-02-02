import { ref } from 'vue'

interface CopyOptions {
  width?: number
  height?: number
}

// GitHub Pages URL base
const GITHUB_BASE = 'https://ywh555hhh.github.io/EmoGdream'

// Try to use webp format if available, otherwise use the emoji's current format
const getBestFormatPath = (emoji: { path: string; name: string; emotion: string; character: string }): string => {
  // Extract base path without extension
  const basePath = emoji.path.replace(/\.(png|gif|webp)$/, '')
  // Characters that don't have webp: mana
  // All other characters have at least some webp files
  // Try webp first, fallback to current format
  const webpPath = `${basePath}.webp`
  return webpPath
}

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

  const copyEmoji = async (emoji: { path: string; name: string; emotion: string; character: string; format: string }, options: CopyOptions = {}): Promise<boolean> => {
    const { width = 16 } = options
    // Prefer webp format for clipboard (if emoji has webp available, use it)
    const html = `<img src="${GITHUB_BASE}${getBestFormatPath(emoji)}" alt="${emoji.name}" width="${width}" align="absmiddle">`
    const success = await copyToClipboard(html)
    showToast(success ? 'Copied!' : 'Copy failed', success ? 'success' : 'error')
    return success
  }

  const copyMultiple = async (emojis: { path: string; name: string; emotion: string; character: string; format: string }[], options: CopyOptions = {}): Promise<boolean> => {
    const { width = 16 } = options
    const html = emojis.map(e =>
      `<img src="${GITHUB_BASE}${getBestFormatPath(e)}" alt="${e.name}" width="${width}" align="absmiddle">`
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
