<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEmojis, type Emoji } from './composables/useEmojis'
import { useSizeControl } from './composables/useSizeControl'
import { useBatchSelection } from './composables/useBatchSelection'
import { useClipboard } from './composables/useClipboard'
import { useDownload } from './composables/useDownload'
import EmojiCard from './components/EmojiCard.vue'

const { emojis, characters, emotions, totalCount, loading, getFilteredEmojis } = useEmojis()
const { size, sizes, setSize, setCustomSize, isCustom, customSize } = useSizeControl()
const { selectedCount, toggleSelection, selectAll, selectNone, isSelected, allSelected, getSelectedEmojis } = useBatchSelection()
const { toast: copyToast, copyEmoji, copyMultiple } = useClipboard()
const { toast: downloadToast, downloadEmoji, downloadMultiple } = useDownload()

// Preview size is fixed at 64px for better visibility
const previewSize = 64

const selectedCharacter = ref<string>('all')
const selectedFormat = ref<'all' | 'png' | 'gif' | 'webp'>('all')
const selectedEmotion = ref<string>('all')
const searchQuery = ref<string>('')

// Use the new filtering logic that returns emojis with correct format paths
const filteredEmojis = computed(() => {
  return getFilteredEmojis(selectedCharacter.value, selectedFormat.value, selectedEmotion.value, searchQuery.value)
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

const hasActiveFilters = computed(() => {
  return selectedCharacter.value !== 'all' ||
    selectedFormat.value !== 'all' ||
    selectedEmotion.value !== 'all' ||
    searchQuery.value !== ''
})
</script>

<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <h1 class="title">
          <span class="title-icon">✨</span>
          EmoGdream
        </h1>
        <p class="subtitle">{{ totalCount }} stickers · Copy HTML tags for use anywhere</p>
      </div>
      <div class="help-tip">
        <span class="help-icon">💡</span>
        <span>Each sticker may have multiple formats. Filter by format to choose.</span>
      </div>
    </header>

    <!-- Filters -->
    <section class="filters">
      <!-- Search -->
      <div class="search-wrapper">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by character or emotion..."
          class="search-input"
          aria-label="Search stickers"
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

      <!-- Filters row -->
      <div class="filters-row">
        <div class="filter-group">
          <label class="filter-label">Character</label>
          <select v-model="selectedCharacter" class="filter-select">
            <option value="all">All</option>
            <option v-for="char in characters" :key="char.id" :value="char.id">
              {{ char.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Format</label>
          <select v-model="selectedFormat" @change="selectedEmotion = 'all'" class="filter-select">
            <option value="all">All ({{ totalCount }})</option>
            <option value="png">PNG ({{ formatCounts.png }})</option>
            <option value="gif">GIF ({{ formatCounts.gif }})</option>
            <option value="webp">WebP ({{ formatCounts.webp }})</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Emotion</label>
          <select v-model="selectedEmotion" :disabled="availableEmotions.length === 0" class="filter-select">
            <option value="all">All</option>
            <option v-for="emo in availableEmotions" :key="emo" :value="emo">
              {{ emo }}
            </option>
          </select>
        </div>
      </div>

      <!-- Size selector and actions -->
      <div class="toolbar">
        <div class="size-selector">
          <label class="size-label">Copy size: {{ size }}px</label>
          <div class="size-buttons">
            <button
              v-for="s in sizes"
              :key="s"
              :class="{ active: !isCustom && size === s }"
              @click="setSize(s)"
              aria-label="Set size to {{ s }}px"
              :aria-pressed="!isCustom && size === s"
            >
              {{ s }}
            </button>
            <input
              type="number"
              :value="isCustom ? customSize : ''"
              @input="setCustomSize(($event.target as HTMLInputElement).value)"
              placeholder="Custom"
              min="8"
              max="128"
              class="custom-size-input"
              :class="{ active: isCustom }"
              aria-label="Custom size"
            />
          </div>
        </div>

        <button
          v-if="hasActiveFilters"
          @click="resetFilters"
          class="reset-btn"
          aria-label="Clear all filters"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Clear filters
        </button>
      </div>

      <!-- Batch actions -->
      <div v-if="filteredEmojis.length > 0" class="batch-bar">
        <span class="selected-info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 0-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {{ selectedCount }} selected
        </span>
        <div class="batch-buttons">
          <button
            @click="selectAll(filteredEmojis)"
            :disabled="allSelected(filteredEmojis)"
            class="batch-btn"
            aria-label="Select all"
          >
            All
          </button>
          <button
            @click="selectNone"
            :disabled="selectedCount === 0"
            class="batch-btn"
            aria-label="Select none"
          >
            None
          </button>
          <button
            @click="handleBatchCopy"
            :disabled="selectedCount === 0"
            class="batch-btn primary"
            aria-label="Copy selected"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy
          </button>
          <button
            @click="handleBatchDownload"
            :disabled="selectedCount === 0"
            class="batch-btn primary"
            aria-label="Download selected"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </button>
        </div>
      </div>
    </section>

    <!-- Results info -->
    <div class="results-info">
      <span class="count">{{ filteredCount }}</span>
      <span>stickers found</span>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading stickers...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredEmojis.length === 0" class="empty">
      <span class="empty-icon">🔍</span>
      <p>No stickers found</p>
      <p v-if="selectedFormat !== 'all'" class="empty-hint">Try selecting "All Formats" or a different format</p>
      <p v-else-if="hasActiveFilters" class="empty-hint">Try clearing filters or using broader search terms</p>
      <p v-else class="empty-hint">Browse all stickers by selecting a character or emotion</p>
      <button v-if="hasActiveFilters" @click="resetFilters" class="btn">Clear filters</button>
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

    <!-- Toast notification -->
    <Transition name="toast">
      <div
        v-if="copyToast.show || downloadToast.show"
        class="toast"
        :class="{ error: (copyToast.show && copyToast.type === 'error') || (downloadToast.show && downloadToast.type === 'error') }"
        role="alert"
        aria-live="polite"
      >
        {{ copyToast.show ? copyToast.message : downloadToast.message }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: var(--color-bg);
  padding: var(--space-lg);
  max-width: 1600px;
  margin: 0 auto;
}

/* ========== Header ========== */
.header {
  background: var(--color-bg-elevated);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.header-content {
  text-align: center;
}

.title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--space-xs) 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-icon {
  font-size: var(--font-size-3xl);
}

.subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin: 0;
}

.help-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  margin-top: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.help-icon {
  font-size: var(--font-size-lg);
}

/* ========== Filters ========== */
.filters {
  background: var(--color-bg-elevated);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

/* Search */
.search-wrapper {
  position: relative;
  margin-bottom: var(--space-lg);
}

.search-icon {
  position: absolute;
  left: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-lg);
  background: var(--color-bg-subtle);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent);
  background: var(--color-bg-elevated);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 15%, transparent);
}

.clear-search {
  position: absolute;
  right: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  padding: var(--space-xs);
  border: none;
  border-radius: var(--radius-sm);
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
}

/* Filters row */
.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.filter-select {
  padding: 10px var(--space-md);
  padding-right: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-lg);
  background: var(--color-bg-subtle);
  color: var(--color-text-primary);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2386868b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--space-sm) center;
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

/* Toolbar */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.size-selector {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.size-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.size-buttons {
  display: flex;
  gap: var(--space-xs);
  background: var(--color-bg-subtle);
  padding: var(--space-xs);
  border-radius: var(--radius-md);
}

.size-buttons button {
  padding: 6px 10px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.size-buttons button.active {
  background: var(--color-bg-elevated);
  color: var(--color-accent);
  box-shadow: var(--shadow-xs);
}

.custom-size-input {
  width: 48px;
  padding: 6px var(--space-sm);
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-align: center;
}

.custom-size-input:focus {
  outline: none;
  background: var(--color-bg-elevated);
  color: var(--color-accent);
}

.custom-size-input.active {
  background: var(--color-bg-elevated);
  color: var(--color-accent);
  box-shadow: var(--shadow-xs);
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 8px var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.reset-btn:hover {
  background: var(--color-bg-subtle);
  border-color: var(--color-border-hover);
}

/* Batch actions */
.batch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding-top: var(--space-md);
  margin-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.selected-info {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-accent);
}

.batch-buttons {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.batch-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 8px var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.batch-btn:hover:not(:disabled) {
  background: var(--color-bg-subtle);
  border-color: var(--color-border-hover);
}

.batch-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.batch-btn.primary {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
}

.batch-btn.primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

/* Results info */
.results-info {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
  margin-bottom: var(--space-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.results-info .count {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--color-text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: var(--space-md);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty state */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--space-md);
}

.empty p {
  margin: 0 0 var(--space-sm) 0;
  font-size: var(--font-size-xl);
  color: var(--color-text-secondary);
}

.empty-hint {
  margin: 0 0 var(--space-lg) 0;
  font-size: var(--font-size-lg);
  color: var(--color-text-tertiary);
}

.btn {
  padding: 10px var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-accent);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn:hover {
  background: var(--color-bg-subtle);
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--card-min-width), 1fr));
  gap: var(--grid-gap);
}

/* Toast */
.toast {
  position: fixed;
  bottom: var(--space-lg);
  left: 50%;
  transform: translateX(-50%);
  padding: 12px var(--space-xl);
  background: var(--color-success);
  color: white;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-lg);
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
  transform: translateX(-50%) translateY(20px);
}

/* ========== Responsive ========== */
@media (max-width: 1024px) {
  .app {
    padding: var(--space-md);
  }

  .header {
    padding: var(--space-lg);
  }

  .title {
    font-size: var(--font-size-3xl);
  }

  .filters {
    padding: var(--space-md);
  }

  .grid {
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: var(--space-md);
  }
}

@media (max-width: 640px) {
  .app {
    padding: var(--space-sm);
  }

  .header {
    padding: var(--space-md);
  }

  .title {
    font-size: var(--font-size-2xl);
  }

  .title-icon {
    font-size: var(--font-size-2xl);
  }

  .subtitle {
    font-size: var(--font-size-md);
  }

  .filters {
    padding: var(--space-md);
  }

  .search-wrapper {
    margin-bottom: var(--space-md);
  }

  .search-input {
    padding: 10px 36px 10px 36px;
    font-size: var(--font-size-md);
  }

  .filters-row {
    grid-template-columns: 1fr;
    gap: var(--space-sm);
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-sm);
  }

  .size-selector {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-xs);
  }

  .size-buttons {
    width: 100%;
    overflow-x: auto;
  }

  .batch-bar {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-sm);
  }

  .batch-buttons {
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .batch-btn {
    flex: 1;
    min-width: 80px;
    justify-content: center;
  }

  .results-info {
    font-size: var(--font-size-md);
  }

  .results-info .count {
    font-size: var(--font-size-2xl);
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
}
</style>
