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
  const cleanBase = basePath.replace(/\/$/, '')
  return `${cleanBase}${props.emoji.path}`
})

// Truncate emotion text if too long
const truncatedEmotion = computed(() => {
  const text = props.emoji.emotion
  return text.length > 15 ? text.slice(0, 14) + '…' : text
})

// Show tooltip if text is truncated
const showTooltip = computed(() => props.emoji.emotion.length > 15)
</script>

<template>
  <div class="card" :class="{ selected }">
    <!-- Selection checkbox -->
    <button
      class="select-btn"
      :class="{ selected }"
      @click.stop="emit('toggle')"
      :aria-label="selected ? 'Deselect' : 'Select'"
      :aria-pressed="selected"
      role="checkbox"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </button>

    <!-- Image -->
    <div class="image-wrapper">
      <img
        v-if="!imageError"
        :src="imagePath"
        :alt="emoji.emotion"
        :style="{ width: `${size}px`, height: `${size}px` }"
        @load="imageLoaded = true"
        @error="imageError = true"
        loading="lazy"
        :class="{ loaded: imageLoaded }"
      />
      <div v-if="!imageLoaded && !imageError" class="skeleton" :style="{ width: `${size}px`, height: `${size}px` }" />
      <span v-else-if="imageError" class="error-badge" :aria-label="'Failed to load'">✕</span>
    </div>

    <!-- Info section -->
    <div class="info">
      <div class="info-left">
        <span class="format" :class="emoji.format">{{ emoji.format.toUpperCase() }}</span>
        <span class="emotion" :title="showTooltip ? emoji.emotion : ''">{{ truncatedEmotion }}</span>
      </div>

      <!-- Multi-format indicator -->
      <span v-if="emoji.availableFormats && emoji.availableFormats.length > 1" class="multi-badges" title="Multiple formats available">
        <span v-for="f in emoji.availableFormats" :key="f" class="format-dot" :class="{ current: f === emoji.format }">
          {{ f.toUpperCase() }}
        </span>
      </span>
    </div>

    <!-- Action buttons -->
    <div class="actions">
      <button class="action-btn" @click="emit('copy')" title="Copy HTML" aria-label="Copy HTML">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
      <button class="action-btn" @click="emit('download')" title="Download" aria-label="Download">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
  border: 2px solid transparent;
  transition: all var(--transition-fast);
  cursor: pointer;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border);
}

.card.selected {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
}

/* Selection button */
.select-btn {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--color-border);
  background: var(--color-bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  z-index: 1;
}

.select-btn:hover {
  border-color: var(--color-accent);
  background: var(--color-bg-subtle);
}

.select-btn.selected {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
}

/* Image wrapper */
.image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
  background: var(--color-bg-subtle);
  min-height: 80px;
}

.image-wrapper img {
  border-radius: var(--radius-sm);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.image-wrapper img.loaded {
  opacity: 1;
}

.skeleton {
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    var(--color-border) 25%,
    var(--color-bg-subtle) 50%,
    var(--color-border) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.error-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-error);
  color: white;
  font-size: 20px;
}

/* Info section */
.info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md) var(--space-md);
  gap: var(--space-sm);
  min-height: 44px;
}

.info-left {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex: 1;
  min-width: 0;
}

.format {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.format.png { background: var(--color-png-bg); color: var(--color-png-text); }
.format.gif { background: var(--color-gif-bg); color: var(--color-gif-text); }
.format.webp { background: var(--color-webp-bg); color: var(--color-webp-text); }

.emotion {
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: var(--font-weight-medium);
}

/* Multi-format badges */
.multi-badges {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.format-dot {
  font-size: 8px;
  font-weight: var(--font-weight-semibold);
  padding: 2px 4px;
  border-radius: 3px;
  background: var(--color-border);
  color: var(--color-text-tertiary);
  opacity: 0.6;
}

.format-dot.current {
  opacity: 1;
  background: var(--color-accent);
  color: white;
}

/* Action buttons */
.actions {
  display: flex;
  padding: 0 var(--space-md) var(--space-md);
  gap: var(--space-xs);
  opacity: 0;
  transition: opacity var(--transition-fast);
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
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--color-bg-subtle);
  border-color: var(--color-border-hover);
}

.action-btn:active {
  transform: scale(0.96);
}

/* Responsive */
@media (max-width: 640px) {
  .card {
    min-width: 0;
  }

  .image-wrapper {
    padding: var(--space-sm);
    min-height: 64px;
  }

  .info {
    padding: var(--space-xs) var(--space-sm) var(--space-sm);
    min-height: 40px;
  }

  .emotion {
    font-size: var(--font-size-sm);
  }

  .actions {
    opacity: 1;
    padding: 0 var(--space-sm) var(--space-sm);
  }

  .action-btn {
    padding: 6px;
  }
}
</style>
