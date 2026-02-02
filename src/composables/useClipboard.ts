import { ref } from 'vue'

interface CopyOptions {
  width?: number
  height?: number
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

  const copyEmoji = async (emoji: { path: string; name: string; emotion: string }, options: CopyOptions = {}): Promise<boolean> => {
    const { width = 16 } = options
    // GitHub README compatible format: just width (no height), with align for inline rendering
    const html = `<img src="${emoji.path}" alt="${emoji.name}" width="${width}" align="absmiddle">`
    const success = await copyToClipboard(html)
    showToast(success ? 'Copied!' : 'Copy failed', success ? 'success' : 'error')
    return success
  }

  const copyMultiple = async (emojis: { path: string; name: string; emotion: string }[], options: CopyOptions = {}): Promise<boolean> => {
    const { width = 16 } = options
    const html = emojis.map(e =>
      `<img src="${e.path}" alt="${e.name}" width="${width}" align="absmiddle">`
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
