<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Emoji } from '../composables/useEmojis'

const props = withDefaults(defineProps<{
  emoji: Emoji
  selected: boolean
  size: number
}>(), {
  size: 64
})

const emit = defineEmits<{
  (e: 'toggle'): void
  (e: 'copy'): void
  (e: 'download'): void
}>()

const imageLoaded = ref(false)
const imageError = ref(false)

// Use Vite's BASE_URL to handle both dev and production paths
const imagePath = computed(() => {
  const basePath = import.meta.env.BASE_URL || '/'
  // Remove trailing slash from basePath if present
  const cleanBase = basePath.replace(/\/$/, '')
  // emoji.path already starts with /stickers/, so just prepend base
  return `${cleanBase}${props.emoji.path}`
})
</script>

<template>
  <div class="card" :class="{ selected }">
    <button
      class="select-btn"
      :class="{ selected }"
      @click.stop="emit('toggle')"
      :aria-label="selected ? 'Deselect' : 'Select'"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </button>

    <div class="image-container">
      <img
        v-if="!imageError"
        :src="imagePath"
        :alt="emoji.emotion"
        :style="{ width: `${size}px`, height: `${size}px` }"
        @load="imageLoaded = true"
        @error="imageError = true"
        loading="lazy"
      />
      <span v-else class="error-icon">✕</span>
    </div>

    <div class="info">
      <span class="format" :class="emoji.format">{{ emoji.format }}</span>
      <span class="emotion">{{ emoji.emotion }}</span>
    </div>

    <div class="actions">
      <button class="action-btn" @click="emit('copy')" title="Copy HTML">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
      <button class="action-btn" @click="emit('download')" title="Download">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.card {
  position: relative;
  border-radius: 12px;
  background: #f5f5f7;
  border: 2px solid transparent;
  transition: all 0.15s ease;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card.selected {
  border-color: #007aff;
  background: #e8f2ff;
}

.select-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 2px solid #d1d1d6;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  z-index: 1;
}

.select-btn:hover {
  border-color: #007aff;
}

.select-btn.selected {
  background: #007aff;
  border-color: #007aff;
  color: white;
}

.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  min-height: 80px;
}

.image-container img {
  border-radius: 8px;
}

.error-icon {
  font-size: 24px;
  color: #86868b;
}

.info {
  padding: 8px 12px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.format {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.format.png { background: #e0f2fe; color: #0284c7; }
.format.gif { background: #fef3c7; color: #d97706; }
.format.webp { background: #fce7f3; color: #db2777; }

.emotion {
  font-size: 13px;
  color: #1d1d1f;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: flex;
  padding: 8px 12px 12px;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.card:hover .actions {
  opacity: 1;
}

@media (hover: none) {
  .actions {
    opacity: 1;
  }
}

.action-btn {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: none;
  background: white;
  color: #1d1d1f;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: #e5e5ea;
}

@media (prefers-color-scheme: dark) {
  .card {
    background: #2c2c2e;
  }

  .card.selected {
    background: #1c3a5e;
  }

  .select-btn {
    border-color: #48484a;
    background: #3a3a3c;
  }

  .error-icon {
    color: #86868b;
  }

  .emotion {
    color: #f5f5f7;
  }

  .action-btn {
    background: #3a3a3c;
    color: #f5f5f7;
  }

  .action-btn:hover {
    background: #48484a;
  }
}
</style>
