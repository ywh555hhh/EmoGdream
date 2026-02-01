<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEmojis, type Emoji } from './composables/useEmojis'
import { useSizeControl } from './composables/useSizeControl'
import { useBatchSelection } from './composables/useBatchSelection'
import EmojiCard from './components/EmojiCard.vue'

const { emojis, uniqueEmotions, totalCount } = useEmojis()
const { size, sizeValue, updateSize } = useSizeControl()
const { 
  selectedCount, 
  toggleSelection, 
  selectAll, 
  selectNone, 
  isSelected, 
  allSelected, 
  batchCopy 
} = useBatchSelection()

const formatFilter = ref<'all' | 'png' | 'gif' | 'webp'>('all')
const emotionFilter = ref<string>('all')

const filteredEmojis = computed(() => {
  return emojis.value.filter(emoji => {
    const formatMatch = formatFilter.value === 'all' || emoji.format === formatFilter.value
    const emotionMatch = emotionFilter.value === 'all' || emoji.emotion === emotionFilter.value
    return formatMatch && emotionMatch
  })
})

const handleBatchCopy = async () => {
  const result = await batchCopy(filteredEmojis.value, { width: size, height: size })
  if (result.success) {
    console.log('✅', result.message)
  } else {
    console.error('❌', result.message)
  }
}

const handleSelectAll = () => {
  selectAll(filteredEmojis.value)
}

const handleSelectNone = () => {
  selectNone()
}

const formatOptions = [
  { value: 'all', label: 'All' },
  { value: 'png', label: 'PNG' },
  { value: 'gif', label: 'GIF' },
  { value: 'webp', label: 'WebP' }
] as const

const setFormatFilter = (format: 'all' | 'png' | 'gif' | 'webp') => {
  formatFilter.value = format
}

const setEmotionFilter = (emotion: string) => {
  emotionFilter.value = emotion
}

const resetFilters = () => {
  formatFilter.value = 'all'
  emotionFilter.value = 'all'
}

const handleCopy = (emoji: Emoji) => {
  console.log('Copy emoji:', emoji.name)
}

const handleDownload = (emoji: Emoji) => {
  console.log('Download emoji:', emoji.name)
}
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">
        <span class="title-icon">✨</span>
        Emoji Library
      </h1>
      <p class="app-subtitle">{{ totalCount }} anime-style emojis for your GitHub projects</p>
    </header>

    <section class="filters-section">
      <div class="filter-group">
        <label class="filter-label">Format</label>
        <div class="filter-buttons">
          <button
            v-for="option in formatOptions"
            :key="option.value"
            :class="['filter-btn', { active: formatFilter === option.value }]"
            @click="setFormatFilter(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">Emotion</label>
        <div class="filter-buttons">
          <button
            :class="['filter-btn', { active: emotionFilter === 'all' }]"
            @click="setEmotionFilter('all')"
          >
            All
          </button>
          <button
            v-for="emotion in uniqueEmotions"
            :key="emotion"
            :class="['filter-btn', { active: emotionFilter === emotion }]"
            @click="setEmotionFilter(emotion)"
          >
            {{ emotion }}
          </button>
        </div>
      </div>

      <div class="filter-group">
        <label class="filter-label">Size: {{ sizeValue }}</label>
        <div class="size-slider-container">
          <input
            type="range"
            :value="size"
            @input="updateSize(parseInt(($event.target as HTMLInputElement).value))"
            min="16"
            max="128"
            step="1"
            class="size-slider"
          />
          <div class="size-slider-labels">
            <span>16px</span>
            <span>128px</span>
          </div>
        </div>
      </div>
    </section>

    <main class="emoji-grid-section">
      <div class="results-info">
        <span class="results-count">{{ filteredEmojis.length }}</span>
        <span class="results-text">emojis found</span>
        <button
          v-if="formatFilter !== 'all' || emotionFilter !== 'all'"
          class="reset-btn"
          @click="resetFilters"
        >
          Clear filters
        </button>
      </div>

      <div v-if="filteredEmojis.length > 0" class="batch-controls">
        <div class="batch-info">
          <span class="selected-count">{{ selectedCount }} selected</span>
        </div>
        <div class="batch-buttons">
          <button
            @click="handleSelectAll"
            :disabled="allSelected(filteredEmojis)"
            class="batch-btn"
            :class="{ active: allSelected(filteredEmojis) }"
          >
            Select All
          </button>
          <button
            @click="handleSelectNone"
            :disabled="selectedCount === 0"
            class="batch-btn"
          >
            Select None
          </button>
          <button
            @click="handleBatchCopy"
            :disabled="selectedCount === 0"
            class="batch-btn batch-copy-btn"
            :class="{ active: selectedCount > 0 }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy Selected ({{ selectedCount }})
          </button>
        </div>
      </div>

      <div class="emoji-grid">
        <EmojiCard
          v-for="emoji in filteredEmojis"
          :key="emoji.id"
          :emoji="emoji"
          :selected="isSelected(emoji.id)"
          :size="size"
          @update:selected="(selected: boolean) => toggleSelection(emoji.id, selected)"
          @copy="handleCopy(emoji)"
          @download="handleDownload(emoji)"
        />
      </div>

      <div v-if="filteredEmojis.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <p class="empty-text">No emojis found with current filters</p>
        <button class="reset-btn reset-btn-large" @click="resetFilters">
          Clear all filters
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 2rem 1rem;
}

.app-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
}

.app-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0 0 1rem 0;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.title-icon {
  font-size: 1.2em;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
  50% { transform: scale(1.1) rotate(10deg); opacity: 0.8; }
}

.app-subtitle {
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0;
  font-weight: 400;
}

.filters-section {
  max-width: 1200px;
  margin: 0 auto 2rem;
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.size-slider-container {
  width: 100%;
}

.size-slider {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

.size-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.2s ease;
}

.size-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.size-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.2s ease;
  border: none;
}

.size-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.size-slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6c757d;
}

.filter-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6c757d;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.filter-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.emoji-grid-section {
  max-width: 1200px;
  margin: 0 auto;
}

.results-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.results-count {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.results-text {
  font-size: 0.9rem;
  color: #6c757d;
}

.reset-btn {
  margin-left: auto;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6c757d;
  background: transparent;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  color: #495057;
  background: #f8f9fa;
  border-color: #adb5bd;
}

.reset-btn-large {
  margin-left: 0;
  margin-top: 1rem;
}

.batch-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.selected-count {
  font-size: 0.9rem;
  font-weight: 600;
  color: #667eea;
}

.batch-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.batch-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6c757d;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.batch-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
  color: #495057;
}

.batch-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.batch-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.batch-copy-btn.active {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

.emoji-placeholder {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  cursor: pointer;
}

.emoji-placeholder:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
}

.emoji-image {
  width: 100%;
  height: 100px;
  object-fit: contain;
  margin-bottom: 1rem;
  image-rendering: pixelated;
}

.emoji-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.emoji-emotion {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1a1a2e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.emoji-format {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.format-png {
  background: #e7f3ff;
  color: #0066cc;
}

.format-gif {
  background: #fff3e0;
  color: #e65100;
}

.format-webp {
  background: #f3e5f5;
  color: #7b1fa2;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0 0 1.5rem 0;
}

@media (max-width: 768px) {
  .app-container {
    padding: 1rem 0.5rem;
  }

  .app-header {
    padding: 1.5rem 0;
    margin-bottom: 2rem;
  }

  .app-title {
    font-size: 2rem;
  }

  .app-subtitle {
    font-size: 1rem;
  }

  .filters-section {
    padding: 1rem;
    border-radius: 8px;
  }

  .filter-buttons {
    gap: 0.375rem;
  }

  .filter-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
  }

  .batch-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .batch-info {
    justify-content: center;
  }

  .batch-buttons {
    justify-content: center;
  }

  .batch-btn {
    font-size: 0.8rem;
    padding: 0.5rem 0.75rem;
  }

  .emoji-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }

  .emoji-placeholder {
    padding: 1rem;
  }

  .emoji-image {
    height: 80px;
  }
}

@media (max-width: 480px) {
  .emoji-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .results-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .reset-btn {
    margin-left: 0;
    width: 100%;
  }

  .batch-buttons {
    flex-direction: column;
  }

  .batch-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
