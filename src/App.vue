<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEmojis, type Emoji } from './composables/useEmojis'
import { useSizeControl } from './composables/useSizeControl'
import { useBatchSelection } from './composables/useBatchSelection'
import { useClipboard } from './composables/useClipboard'
import { useDownload } from './composables/useDownload'
import EmojiCard from './components/EmojiCard.vue'

const { emojis, characters, emotions, totalCount, loading } = useEmojis()
const { size, sizes, setSize } = useSizeControl()
const { selectedCount, toggleSelection, selectAll, selectNone, isSelected, allSelected, getSelectedEmojis } = useBatchSelection()
const { toast: copyToast, copyEmoji, copyMultiple } = useClipboard()
const { toast: downloadToast, downloadEmoji, downloadMultiple } = useDownload()

// Preview size is fixed at 64px for better visibility
const previewSize = 64

const selectedCharacter = ref<string>('all')
const selectedFormat = ref<'all' | 'png' | 'gif' | 'webp'>('all')
const selectedEmotion = ref<string>('all')
const searchQuery = ref<string>('')

const filteredEmojis = computed(() => {
  return emojis.value.filter(emoji => {
    const charMatch = selectedCharacter.value === 'all' || emoji.character === selectedCharacter.value
    const formatMatch = selectedFormat.value === 'all' || emoji.format === selectedFormat.value
    const emotionMatch = selectedEmotion.value === 'all' || emoji.emotion === selectedEmotion.value
    const searchMatch = !searchQuery.value ||
      emoji.emotion.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      emoji.character.toLowerCase().includes(searchQuery.value.toLowerCase())
    return charMatch && formatMatch && emotionMatch && searchMatch
  })
})

const availableEmotions = computed(() => {
  const set = new Set(filteredEmojis.value.map(e => e.emotion))
  return Array.from(set).sort()
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
        <h1 class="title">EmoGdream</h1>
        <p class="subtitle">{{ totalCount }} anime stickers</p>
      </div>
    </header>

    <!-- Filters -->
    <section class="filters">
      <div class="filter-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search stickers..."
          class="search-input"
        />
      </div>

      <div class="filter-row">
        <div class="filter-select">
          <select v-model="selectedCharacter">
            <option value="all">All Characters</option>
            <option v-for="char in characters" :key="char.id" :value="char.id">
              {{ char.name }}
            </option>
          </select>
        </div>

        <div class="filter-select">
          <select v-model="selectedFormat" @change="selectedEmotion = 'all'">
            <option value="all">All Formats</option>
            <option value="png">PNG</option>
            <option value="gif">GIF</option>
            <option value="webp">WebP</option>
          </select>
        </div>

        <div class="filter-select">
          <select v-model="selectedEmotion" :disabled="availableEmotions.length === 0">
            <option value="all">All Emotions</option>
            <option v-for="emo in availableEmotions" :key="emo" :value="emo">
              {{ emo }}
            </option>
          </select>
        </div>
      </div>

      <div class="filter-row">
        <div class="size-selector">
          <span class="size-label">Copy size:</span>
          <div class="size-buttons">
            <button
              v-for="s in sizes"
              :key="s"
              :class="{ active: size === s }"
              @click="setSize(s)"
            >
              {{ s }}
            </button>
          </div>
        </div>

        <button
          v-if="hasActiveFilters"
          @click="resetFilters"
          class="reset-btn"
        >
          Clear filters
        </button>
      </div>

      <!-- Batch actions -->
      <div v-if="filteredEmojis.length > 0" class="batch-actions">
        <span class="selected-count">{{ selectedCount }} selected</span>
        <div class="batch-buttons">
          <button
            @click="selectAll(filteredEmojis)"
            :disabled="allSelected(filteredEmojis)"
            class="batch-btn"
          >
            All
          </button>
          <button
            @click="selectNone"
            :disabled="selectedCount === 0"
            class="batch-btn"
          >
            None
          </button>
          <button
            @click="handleBatchCopy"
            :disabled="selectedCount === 0"
            class="batch-btn primary"
          >
            Copy {{ selectedCount }}
          </button>
          <button
            @click="handleBatchDownload"
            :disabled="selectedCount === 0"
            class="batch-btn primary"
          >
            Download {{ selectedCount }}
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
      >
        {{ copyToast.show ? copyToast.message : downloadToast.message }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #f5f5f7;
  padding: 20px;
}

.header {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  text-align: center;
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 14px;
  color: #86868b;
  margin: 0;
}

.filters {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-group {
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e5ea;
  border-radius: 10px;
  font-size: 15px;
  background: #f5f5f7;
  transition: all 0.15s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007aff;
  background: white;
}

.filter-select {
  flex: 1;
  min-width: 140px;
}

.filter-select select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e5ea;
  border-radius: 10px;
  font-size: 14px;
  background: #f5f5f7;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2386868b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.filter-select select:focus {
  outline: none;
  border-color: #007aff;
  background-color: white;
}

.filter-select select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.size-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.size-label {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
  white-space: nowrap;
}

.size-buttons {
  display: flex;
  gap: 4px;
  background: #f5f5f7;
  padding: 4px;
  border-radius: 8px;
}

.size-buttons button {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #86868b;
  cursor: pointer;
  transition: all 0.15s ease;
}

.size-buttons button.active {
  background: white;
  color: #007aff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.reset-btn {
  margin-left: auto;
  padding: 10px 16px;
  border: 1px solid #e5e5ea;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  color: #007aff;
  cursor: pointer;
  transition: all 0.15s ease;
}

.reset-btn:hover {
  background: #f5f5f7;
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e5e5ea;
}

.selected-count {
  font-size: 14px;
  font-weight: 600;
  color: #007aff;
}

.batch-buttons {
  display: flex;
  gap: 8px;
}

.batch-btn {
  padding: 8px 14px;
  border: 1px solid #e5e5ea;
  border-radius: 8px;
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: #1d1d1f;
  cursor: pointer;
  transition: all 0.15s ease;
}

.batch-btn:hover:not(:disabled) {
  background: #f5f5f7;
}

.batch-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.batch-btn.primary {
  background: #007aff;
  border-color: #007aff;
  color: white;
}

.batch-btn.primary:hover:not(:disabled) {
  background: #0066d6;
}

.results-info {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 16px;
  color: #86868b;
  font-size: 14px;
}

.results-info .count {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #86868b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e5ea;
  border-top-color: #007aff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #86868b;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty p {
  margin: 0 0 16px 0;
  font-size: 16px;
}

.btn {
  padding: 10px 20px;
  border: 1px solid #e5e5ea;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  color: #007aff;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn:hover {
  background: #f5f5f7;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: #34c759;
  color: white;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.toast.error {
  background: #ff3b30;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

@media (max-width: 768px) {
  .app {
    padding: 12px;
  }

  .header {
    padding: 20px 16px;
  }

  .title {
    font-size: 24px;
  }

  .filters {
    padding: 16px;
  }

  .filter-row {
    flex-direction: column;
  }

  .size-selector {
    flex-wrap: wrap;
  }

  .batch-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .batch-buttons {
    flex-wrap: wrap;
  }

  .batch-btn {
    flex: 1;
    min-width: 80px;
  }

  .grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
  }
}

@media (prefers-color-scheme: dark) {
  .app {
    background: #000;
  }

  .header,
  .filters {
    background: #1c1c1e;
  }

  .title {
    background: linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle,
  .loading p,
  .empty p,
  .results-info {
    color: #86868b;
  }

  .search-input,
  .filter-select select,
  .reset-btn,
  .batch-btn,
  .btn {
    background: #2c2c2e;
    border-color: #3a3a3c;
    color: #f5f5f7;
  }

  .search-input:focus,
  .filter-select select:focus {
    background: #3a3a3c;
    border-color: #0a84ff;
  }

  .size-label,
  .results-info .count {
    color: #f5f5f7;
  }

  .size-buttons {
    background: #2c2c2e;
  }

  .size-buttons button {
    color: #86868b;
  }

  .size-buttons button.active {
    background: #3a3a3c;
    color: #0a84ff;
  }

  .batch-btn.primary {
    background: #0a84ff;
    border-color: #0a84ff;
  }

  .batch-btn.primary:hover:not(:disabled) {
    background: #0066d6;
  }

  .batch-actions {
    border-top-color: #3a3a3c;
  }

  .selected-count {
    color: #0a84ff;
  }
}
</style>
