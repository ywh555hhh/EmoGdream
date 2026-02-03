import { ref, computed } from 'vue'

export type Locale = 'zh' | 'en'

const availableLocales: Locale[] = ['zh', 'en']

// Load translations
const translations: Record<Locale, Record<string, string>> = {
  zh: () => import('./locales/zh.json'),
  en: () => import('./locales/en.json')
}

// Detect user's preferred language
const detectBrowserLanguage = (): Locale => {
  const lang = navigator.language || 'zh'
  if (lang.startsWith('zh')) return 'zh'
  if (lang.includes('en')) return 'en'
  return 'en'
}

// Local storage key
const STORAGE_KEY = 'emogdream-locale'

export function useI18n() {
  const locale = ref<Locale>('zh')  // Default to Chinese
  const isChanging = ref(false)

  // Load saved preference
  const loadSavedLocale = (): Locale => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && availableLocales.includes(saved as Locale)) {
        locale.value = saved as Locale
      }
    } catch (e) {
      console.error('Failed to load saved locale:', e)
    }
  }

  // Save preference
  const saveLocale = (newLocale: Locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, newLocale)
      locale.value = newLocale
    } catch (e) {
      console.error('Failed to save locale:', e)
    }
  }

  const currentLocale = computed(() => translations.value[locale.value])

  const t = (key: string, params?: Record<string, string | number>): string => {
    const template = currentLocale.value[key]
    if (!template) {
      console.warn(`Translation missing for key: ${key}`)
      return key
    }

    // Simple interpolation for dynamic values
    let result = template
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(new RegExp(`\\$\\{k\\}`, 'g'), v as string)
      })
    }
    return result
  }

  const changeLocale = (newLocale: Locale) => {
    if (!availableLocales.includes(newLocale)) {
      console.warn(`Invalid locale: ${newLocale}`)
      return
    }
    isChanging.value = true
    locale.value = newLocale
    saveLocale(newLocale)
    setTimeout(() => {
      isChanging.value = false
    }, 300)
  }

  return {
    locale,
    setLocale: changeLocale,
    currentLocale,
    t,
    isChanging
  }
}
