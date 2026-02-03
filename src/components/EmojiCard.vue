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
const isHovered = ref(false)

// Use Vite's BASE_URL to handle both dev and production paths
const imagePath = computed(() => {
  const basePath = import.meta.env.BASE_URL || '/'
  const cleanBase = basePath.replace(/\/$/, '')
  return `${cleanBase}${props.emoji.path}`
})

// Truncate emotion text if too long
const truncatedEmotion = computed(() => {
  const text = props.emoji.emotion
  return text.length > 18 ? text.slice(0, 17) + '…' : text
})

// Show tooltip if text is truncated
const showTooltip = computed(() => props.emoji.emotion.length > 18)
</script>

<template>
  <div class="card" :class="{ selected, hovered: isHovered }" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
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
      <div v-else-if="imageError" class="error-badge" aria-label="Failed to load">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
    </div>

    <!-- Info section - centered labels -->
    <div class="info">
      <!-- Emotion label -->
      <span class="emotion" :title="showTooltip ? emoji.emotion : ''">{{ truncatedEmotion }}</span>

      <!-- Format labels -->
      <div class="formats">
        <!-- Single format -->
        <span v-if="!emoji.availableFormats || emoji.availableFormats.length === 1" class="format-label" :class="emoji.format">
          {{ emoji.format === 'webp' ? 'WebP' : emoji.format.toUpperCase() }}
        </span>

        <!-- Multiple formats - show all available -->
        <div v-else class="multi-formats">
          <span
            v-for="fmt in ['webp', 'png', 'gif']"
            :key="fmt"
            v-show="emoji.availableFormats?.includes(fmt as any)"
            class="format-pill"
            :class="{ current: fmt === emoji.format }"
          >
            {{ fmt === 'webp' ? 'WebP' : fmt.toUpperCase() }}
          </span>
        </div>
      </div>
    </div>

    <!-- Action buttons overlay -->
    <div class="actions">
      <button class="action-btn" @click="emit('copy')" title="Copy HTML" aria-label="Copy HTML">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <span>Copy</span>
      </button>
      <button class="action-btn" @click="emit('download')" title="Download" aria-label="Download">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span>Save</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-xl);
  background: var(--color-bg-elevated);
  border: 2px solid var(--color-border);
  transition: all var(--transition-fast);
  cursor: pointer;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-accent);
}

.card.hovered {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 3%, transparent);
}

.card.selected {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 8%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent);
}

/* Selection button */
.select-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  background: var(--color-bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  z-index: 2;
}

.card:hover .select-btn {
  border-color: var(--color-accent);
  background: var(--color-bg-subtle);
}

.select-btn.selected {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
  transform: scale(1.1);
}

/* Image wrapper */
.image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
  background: var(--color-bg-subtle);
  min-height: 88px;
  position: relative;
}

.image-wrapper img {
  border-radius: var(--radius-md);
  opacity: 0;
  transition: opacity var(--transition-base);
}

.image-wrapper img.loaded {
  opacity: 1;
}

.skeleton {
  border-radius: var(--radius-md);
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
  background: var(--color-error-bg);
  color: var(--color-error);
}

/* Info section - centered layout */
.info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm);
  min-height: 52px;
}

.emotion {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

/* Format labels container */
.formats {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-wrap: wrap;
  justify-content: center;
}

/* Single format label */
.format-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.format-label.webp { background: var(--color-webp-bg); color: var(--color-webp-text); }
.format-label.gif { background: var(--color-gif-bg); color: var(--color-gif-text); }
.format-label.png { background: var(--color-png-bg); color: var(--color-png-text); }

/* Multiple formats pills */
.multi-formats {
  display: flex;
  align-items: center;
  gap: 3px;
}

.format-pill {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  padding: 3px 6px;
  border-radius: 6px;
  border: 1.5px solid var(--color-border);
  background: var(--color-bg-subtle);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.format-pill.current {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
  box-shadow: var(--shadow-xs);
}

/* Action buttons overlay */
.actions {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  background: color-mix(in srgb, var(--color-bg-elevated) 90%, transparent);
  opacity: 0;
  transition: all var(--transition-fast);
}

.card:hover .actions,
.card.selected .actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px var(--space-sm);
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid var(--color-border);
}

.action-btn:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
  transform: scale(1.05);
}

.action-btn svg {
  flex-shrink: 0;
}

.action-btn span {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

/* Always show actions on touch devices */
@media (hover: none) {
  .actions {
    opacity: 0.9;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .card {
    min-width: 0;
  }

  .select-btn {
    width: 22px;
    height: 22px;
  }

  .image-wrapper {
    padding: var(--space-sm);
    min-height: 72px;
  }

  .info {
    padding: var(--space-xs) var(--space-xs) var(--space-xs);
    min-height: 48px;
    gap: 4px;
  }

  .emotion {
    font-size: var(--font-size-xs);
  }

  .format-label,
  .format-pill {
    font-size: 9px;
    padding: 2px 5px;
  }

  .format-pill {
    padding: 2px 4px;
  }

  .action-btn {
    padding: 6px var(--space-xs);
  }

  .action-btn span {
    font-size: 9px;
  }
}
</style>
