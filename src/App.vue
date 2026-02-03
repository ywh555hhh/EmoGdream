<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useEmojis, type Emoji } from './composables/useEmojis'
import { useSizeControl } from './composables/useSizeControl'
import { useBatchSelection } from './composables/useBatchSelection'
import { useClipboard } from './composables/useClipboard'
import { useDownload } from './composables/useDownload'
import { useZipDownload } from './composables/useZipDownload'
import { useI18n } from './composables/useI18n'
import EmojiCard from './components/EmojiCard.vue'

const { emojis, characters, emotions, totalCount, loading, getFilteredEmojis, debouncedSearchQuery } = useEmojis()
const { size, sizes, setSize, setCustomSize, isCustom, customSize } = useSizeControl()
const { selectedCount, toggleSelection, selectAll, selectNone, isSelected, allSelected, getSelectedEmojis } = useBatchSelection()
const { toast: copyToast, copyEmoji, copyMultiple } = useClipboard()
const { toast: downloadToast, downloadEmoji, downloadMultiple } = useDownload()
const { isZipping, progress, toast: zipToast, downloadZip } = useZipDownload()
const { locale, t } = useI18n()

// Preview size is fixed at 64px for better visibility
const previewSize = 64

const selectedCharacter = ref<string>('all')
const selectedFormat = ref<'all' | 'png' | 'gif' | 'webp'>('all')
const selectedEmotion = ref<string>('all')
const searchQuery = ref<string>('')
const isSearchFocused = ref(false)

// Use the new filtering logic that returns emojis with correct format paths
const filteredEmojis = computed(() => {
  return getFilteredEmojis(selectedCharacter.value, selectedFormat.value, selectedEmotion.value, debouncedSearchQuery.value)
})

// Get unique emotions from the current filtered results
const availableEmotions = computed(() => {
  const set = new Set(filteredEmojis.value.map(e => e.emotion))
  return Array.from(set).sort()
})

// Format selector helper - shows count for each format
const formatCounts = computed(() => {
  const counts = { png: 0, gif: 0, webp: 0 }
  emojis.value.forEach(e => {
    if (e.availableFormats) {
      e.availableFormats.forEach(f => counts[f]++)
    } else {
      counts[e.format]++
    }
  })
  return counts
})

const filteredCount = computed(() => filteredEmojis.value.length)

const resetFilters = () => {
  selectedCharacter.value = 'all'
  selectedFormat.value = 'all'
  selectedEmotion.value = 'all'
  searchQuery.value = ''
}

const handleCopy = async (emoji: Emoji) => {
  await copyEmoji(emoji, { width: size.value })
}

const handleBatchCopy = async () => {
  const selected = getSelectedEmojis(filteredEmojis.value)
  await copyMultiple(selected, { width: size.value })
  selectNone()
}

const handleDownload = async (emoji: Emoji) => {
  await downloadEmoji(emoji)
}

const handleBatchDownload = async () => {
  const selected = getSelectedEmojis(filteredEmojis.value)
  await downloadMultiple(selected)
  selectNone()
}

const handleBatchZipDownload = async () => {
  const selected = getSelectedEmojis(filteredEmojis.value)
  await downloadZip(selected, 'stickers.zip')
  selectNone()
}

const hasActiveFilters = computed(() => {
  return selectedCharacter.value !== 'all' ||
    selectedFormat.value !== 'all' ||
    selectedEmotion.value !== 'all' ||
    searchQuery.value !== ''
})

// Computed toast for display
const activeToast = computed(() => {
  if (zipToast.value.show) return zipToast.value
  if (downloadToast.value.show) return downloadToast.value
  if (copyToast.value.show) return copyToast.value
  return { show: false, message: '', type: 'success' as const }
})

// Watch for selection changes to scroll into view
watch(selectedCount, (newVal, oldVal) => {
  if (newVal > 0 && oldVal === 0) {
    // Selection started
  }
})
</script>

<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="title-wrapper">
          <span class="title-icon">✨</span>
          <h1 class="title">{{ t('app.title') }}</h1>
          <div class="header-actions">
            <button
              @click="locale.setLocale(locale.locale === 'zh' ? 'en' : 'zh')"
              class="lang-btn"
              :aria-label="`Switch to ${locale.locale === 'zh' ? 'English' : '中文'}`"
            >
              {{ locale.locale === 'zh' ? '中' : 'EN' }}
            </button>
          </div>
          <p class="subtitle">{{ t('app.subtitle', { count: totalCount }) }}</p>
        </div>
      </div>
    </header>

    <!-- Filters -->
    <section class="filters">
      <!-- Search with quick filters -->
      <div class="search-section">
        <div class="search-wrapper" :class="{ focused: isSearchFocused }">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('searchPlaceholder')"
            class="search-input"
            aria-label="Search stickers"
            @focus="isSearchFocused = true"
            @blur="isSearchFocused = false"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="clear-search"
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <!-- Quick format filters as pills -->
        <div class="quick-filters">
          <button
            v-for="fmt in ['all', 'webp', 'png', 'gif']"
            :key="fmt"
            :class="{ active: selectedFormat === fmt }"
            @click="selectedFormat = fmt as any; selectedEmotion = 'all'"
            class="filter-pill"
            :aria-label="`Filter by ${selectedFormat === 'all' ? t('formatAll', { count: totalCount }) : t('formatOnly', { format: selectedFormat === 'webp' ? 'WebP' : selectedFormat === 'png' ? 'PNG' : selectedFormat === 'gif' ? 'GIF' : ''} format`"
            :aria-pressed="selectedFormat === fmt"
          >
            {{ fmt === 'all' ? 'All' : fmt.toUpperCase() }}
          </button>
        </div>
      </div>

      <!-- Dropdown filters -->
      <div class="dropdown-filters">
        <div class="filter-item">
          <label class="filter-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0 0-4-4H8a4 4 0 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Character
          </label>
          <select v-model="selectedCharacter" class="filter-select">
            <option value="all">{{ t('filterAll', { count: totalCount }) }}</option>
            <option v-for="char in characters" :key="char.id" :value="char.id">
              {{ char.name }}
            </option>
          </select>
        </div>

        <div class="filter-item">
          <label class="filter-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            </svg>
            Emotion
          </label>
          <select v-model="selectedEmotion" :disabled="availableEmotions.length === 0" class="filter-select">
            <option value="all">{{ t('emotionAll') }}</option>
            <option v-for="emo in availableEmotions" :key="emo" :value="emo">
              {{ emo }}
            </option>
          </select>
        </div>

        <button
          v-if="hasActiveFilters"
          @click="resetFilters"
          class="reset-all-btn"
          aria-label="Clear all filters"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Clear all
        </button>
      </div>

      <!-- Size selector -->
      <div class="size-section">
        <label class="size-label">Copy size</label>
        <div class="size-buttons">
          <button
            v-for="s in sizes"
            :key="s"
            :class="{ active: !isCustom && size === s }"
            @click="setSize(s)"
            :aria-label="`Set size to ${s}px`"
            :aria-pressed="!isCustom && size === s"
            class="size-btn"
          >
            {{ s }}
          </button>
          <div class="custom-size-wrapper" :class="{ active: isCustom }">
            <input
              type="number"
              :value="isCustom ? customSize : ''"
              @input="setCustomSize(($event.target as HTMLInputElement).value)"
              placeholder="Custom"
              min="8"
              max="128"
              class="custom-size-input"
              aria-label="Custom size"
            />
            <span class="custom-size-label">px</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Results info and batch actions -->
    <section class="results-section">
      <div class="results-info">
        <span class="count">{{ filteredCount }}</span>
        <span class="text">{{ filteredCount === 1 ? 'sticker' : 'stickers' }} found</span>
        <span v-if="hasActiveFilters" class="filter-indicator" aria-label="Filters active">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </span>
      </div>

      <!-- Batch actions bar -->
      <div v-if="filteredEmojis.length > 0" class="batch-actions">
        <div class="selection-controls">
          <span class="selected-count">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 0-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <strong>{{ selectedCount }}</strong> selected
          </span>
          <button
            @click="selectAll(filteredEmojis)"
            :disabled="allSelected(filteredEmojis)"
            class="control-btn"
            aria-label="Select all"
            title="Select all visible"
          >
            All
          </button>
          <button
            @click="selectNone"
            :disabled="selectedCount === 0"
            class="control-btn"
            aria-label="Select none"
            title="Clear selection"
          >
            None
          </button>
        </div>

        <div class="action-buttons">
          <button
            @click="handleBatchCopy"
            :disabled="selectedCount === 0"
            class="action-btn"
            aria-label="Copy selected as HTML"
            title="Copy as HTML tags"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy
          </button>
          <button
            @click="handleBatchZipDownload"
            :disabled="selectedCount === 0 || isZipping"
            class="action-btn primary"
            aria-label="Download as ZIP"
            :title="isZipping ? `Creating ZIP... ${progress.percentage}%` : 'Download as ZIP'"
          >
            <svg v-if="!isZipping" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <svg v-else class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span>{{ isZipping ? `${progress.percentage}%` : 'ZIP' }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ZIP Progress Bar -->
    <div v-if="isZipping" class="zip-progress">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress.percentage}%` }"></div>
      </div>
      <div class="progress-text">
        <span>Creating ZIP archive...</span>
        <span class="progress-count">{{ progress.current }} / {{ progress.total }}</span>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading stickers...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredEmojis.length === 0" class="empty">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <h3 class="empty-title">No stickers found</h3>
      <p v-if="selectedFormat !== 'all'" class="empty-hint">Try selecting "All formats" or a different format</p>
      <p v-else-if="hasActiveFilters" class="empty-hint">Try clearing filters or using broader search terms</p>
      <p v-else class="empty-hint">Browse all stickers by selecting a character or emotion</p>
      <button v-if="hasActiveFilters" @click="resetFilters" class="empty-action">Clear all filters</button>
    </div>

    <!-- Emoji grid -->
    <div v-else class="grid">
      <EmojiCard
        v-for="emoji in filteredEmojis"
        :key="emoji.id"
        :emoji="emoji"
        :selected="isSelected(emoji.id)"
        :size="previewSize"
        @toggle="toggleSelection(emoji.id)"
        @copy="handleCopy(emoji)"
        @download="handleDownload(emoji)"
      />
    </div>

    <!-- Footer -->
    <footer class="footer">
      <p class="footer-text">
        {{ t('footerTip') }}
      </p>
    </footer>

    <!-- Toast notification -->
    <Transition name="toast">
      <div
        v-if="activeToast.show"
        class="toast"
        :class="{ error: activeToast.type === 'error' }"
        role="alert"
        aria-live="polite"
      >
        <svg v-if="activeToast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
        <span>{{ activeToast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  min-height: 100vh;
  background: var(--color-bg);
  padding: var(--space-lg) var(--space-md);
}

/* ========== Header ========== */
.header {
  background: var(--color-bg-elevated);
  border-radius: var(--radius-2xl);
  padding: var(--space-2xl);
  margin-bottom: var(--space-xl);
  box-shadow: var(--shadow-sm);
}

.header-content {
  text-align: center;
}

.title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.title-icon {
  font-size: 32px;
  filter: drop-shadow(0 0 12px rgba(102, 126, 234, 0.4));
}

.title {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin: 0;
}

/* ========== Filters ========== */
.filters {
  background: var(--color-bg-elevated);
  border-radius: var(--radius-2xl);
  padding: var(--space-xl);
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

/* Search Section */
.search-section {
  margin-bottom: var(--space-lg);
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-bg-subtle);
  transition: all var(--transition-fast);
}

.search-wrapper.focused {
  border-color: var(--color-accent);
  background: var(--color-bg-elevated);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-accent) 15%, transparent);
}

.search-icon {
  position: absolute;
  left: var(--space-md);
  color: var(--color-text-tertiary);
  pointer-events: none;
  transition: color var(--transition-fast);
}

.search-wrapper.focused .search-icon {
  color: var(--color-accent);
}

.search-input {
  flex: 1;
  padding: 14px 48px 14px 48px;
  border: none;
  border-radius: var(--radius-xl);
  font-size: var(--font-size-lg);
  background: transparent;
  color: var(--color-text-primary);
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.search-input:focus {
  outline: none;
}

.clear-search {
  position: absolute;
  right: var(--space-sm);
  padding: var(--space-sm);
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.clear-search:hover {
  background: var(--color-error);
  color: white;
  transform: scale(1.1);
}

/* Quick Filters as Pills */
.quick-filters {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  flex-wrap: wrap;
}

.filter-pill {
  padding: 8px var(--space-md);
  border-radius: 50px;
  border: 1.5px solid var(--color-border);
  background: var(--color-bg-elevated);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-pill:hover {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.filter-pill.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--color-accent) 30%, transparent);
}

/* Dropdown Filters */
.dropdown-filters {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border);
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.filter-label {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-bottom: 2px;
}

.filter-select {
  padding: 12px var(--space-md);
  padding-right: 36px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  background: var(--color-bg-subtle);
  color: var(--color-text-primary);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2386868b' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--space-md) center;
  transition: all var(--transition-fast);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-accent);
  background: var(--color-bg-elevated);
}

.filter-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reset-all-btn {
  grid-column: span 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: 10px var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-subtle);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-top: var(--space-sm);
}

.reset-all-btn:hover {
  background: var(--color-border);
  border-color: var(--color-border-hover);
}

/* Size Section */
.size-section {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.size-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.size-buttons {
  display: flex;
  gap: var(--space-xs);
  background: var(--color-bg-subtle);
  padding: var(--space-xs);
  border-radius: var(--radius-lg);
}

.size-btn {
  padding: 8px 14px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-width: 40px;
}

.size-btn:hover {
  color: var(--color-text-primary);
}

.size-btn.active {
  background: var(--color-bg-elevated);
  color: var(--color-accent);
  box-shadow: var(--shadow-xs);
}

.custom-size-wrapper {
  display: flex;
  align-items: center;
  border: 1.5px solid transparent;
  border-radius: var(--radius-md);
  padding: 6px 6px 6px var(--space-sm);
  transition: all var(--transition-fast);
}

.custom-size-wrapper.active {
  background: var(--color-bg-elevated);
  border-color: var(--color-accent);
  box-shadow: var(--shadow-xs);
}

.custom-size-input {
  width: 48px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  text-align: center;
}

.custom-size-input:focus {
  outline: none;
}

.custom-size-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-tertiary);
}

/* ========== Results Section ========== */
.results-section {
  background: var(--color-bg-elevated);
  border-radius: var(--radius-2xl);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.results-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.results-info .count {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent);
  line-height: 1;
}

.results-info .text {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}

.filter-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-accent);
}

/* Batch Actions */
.batch-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.selection-controls {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.selected-count {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  padding-right: var(--space-md);
}

.control-btn {
  padding: 8px var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-subtle);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.control-btn:hover:not(:disabled) {
  background: var(--color-border);
  border-color: var(--color-border-hover);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  gap: var(--space-sm);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 10px var(--space-lg);
  border: none;
  border-radius: var(--radius-lg);
  background: var(--color-bg-subtle);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover:not(:disabled) {
  background: var(--color-border);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.primary {
  background: var(--color-accent);
  color: white;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--color-accent) 25%, transparent);
}

.action-btn.primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
}

.action-btn.primary:disabled {
  box-shadow: none;
}

/* ZIP Progress */
.zip-progress {
  background: var(--color-bg-elevated);
  border-radius: var(--radius-2xl);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.progress-bar {
  height: 8px;
  background: var(--color-bg-subtle);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--space-sm);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent-hover));
  border-radius: 4px;
  transition: width 0.3s ease-out;
}

.progress-text {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.progress-count {
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--color-text-secondary);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-lg);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--color-border) 20%, transparent);
  color: var(--color-text-tertiary);
  margin-bottom: var(--space-lg);
}

.empty-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm) 0;
}

.empty-hint {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-md) 0;
}

.empty-action {
  padding: 12px var(--space-xl);
  border: 2px solid var(--color-accent);
  border-radius: var(--radius-lg);
  background: transparent;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.empty-action:hover {
  background: var(--color-accent);
  color: white;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--card-min-width), 1fr));
  gap: var(--grid-gap);
}

/* Footer */
.footer {
  text-align: center;
  padding: var(--space-lg) 0;
  color: var(--color-text-tertiary);
}

.footer-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  margin: 0;
}

.highlight {
  padding: 2px 8px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--color-accent) 15%, transparent);
  color: var(--color-accent);
  font-weight: var(--font-weight-semibold);
}

/* Toast */
.toast {
  position: fixed;
  bottom: var(--space-xl);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 14px var(--space-xl);
  background: var(--color-success);
  color: white;
  border-radius: var(--radius-xl);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-toast);
}

.toast.error {
  background: var(--color-error);
}

.toast-enter-active,
.toast-leave-active {
  transition: all var(--transition-base);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}

/* Spin animation */
.spin {
  animation: spin 1s linear infinite;
}

/* ========== Responsive ========== */
@media (max-width: 1024px) {
  .app {
    padding: var(--space-md);
  }

  .header {
    padding: var(--space-xl);
  }

  .title {
    font-size: var(--font-size-2xl);
  }

  .filters {
    padding: var(--space-lg);
  }

  .grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: var(--space-md);
  }
}

@media (max-width: 768px) {
  .batch-actions {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }

  .selection-controls {
    justify-content: space-between;
  }

  .action-buttons {
    flex-direction: row;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
  }

  .results-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-xs);
  }

  .dropdown-filters {
    grid-template-columns: 1fr;
  }

  .reset-all-btn {
    grid-column: span 1;
  }
}

@media (max-width: 640px) {
  .app {
    padding: var(--space-sm);
  }

  .header {
    padding: var(--space-lg);
  }

  .title-icon {
    font-size: 24px;
  }

  .title {
    font-size: var(--font-size-xl);
  }

  .subtitle {
    font-size: var(--font-size-sm);
  }

  .filters {
    padding: var(--space-md);
  }

  .search-wrapper {
    border-radius: var(--radius-lg);
  }

  .search-input {
    padding: 12px 40px 12px 40px;
    font-size: var(--font-size-base);
  }

  .quick-filters {
    gap: var(--space-xs);
  }

  .filter-pill {
    padding: 6px var(--space-sm);
    font-size: var(--font-size-xs);
  }

  .size-section {
    flex-direction: column;
    align-items: stretch;
  }

  .size-label {
    align-self: flex-start;
  }

  .size-buttons {
    width: 100%;
    justify-content: center;
  }

  .results-info .count {
    font-size: var(--font-size-3xl);
  }

  .action-buttons {
    flex-direction: column;
  }

  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-sm);
  }
}

@media (max-width: 480px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-xs);
  }

  .selection-controls {
    flex-wrap: wrap;
    gap: var(--space-xs);
  }

  .selected-count {
    width: 100%;
    justify-content: center;
    padding-right: 0;
    padding-bottom: var(--space-sm);
    border-bottom: 1px solid var(--color-border);
  }
}
</style>
