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
  return text.length > 20 ? text.slice(0, 19) + '…' : text
})

// Show tooltip if text is truncated
const showTooltip = computed(() => props.emoji.emotion.length > 20)

// Check if formats are available
const hasWebP = computed(() => props.emoji.formats && Array.isArray(props.emoji.formats) && props.emoji.formats.includes('webp'))
const hasPNG = computed(() => props.emoji.formats && Array.isArray(props.emoji.formats) && props.emoji.formats.includes('png'))
const hasGIF = computed(() => props.emoji.formats && Array.isArray(props.emoji.formats) && props.emoji.formats.includes('gif'))
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

    <!-- Info section - two rows -->
    <div class="info">
      <!-- Row 1: Emotion name -->
      <div class="info-row">
        <span class="emotion" :title="showTooltip ? emoji.emotion : ''">{{ truncatedEmotion }}</span>
      </div>

      <!-- Row 2: Format labels + Quick copy buttons -->
      <div class="info-row format-row">
        <!-- Format label (current) -->
        <span class="format-label" :class="emoji.format">
          {{ emoji.format === 'webp' ? 'WebP' : emoji.format.toUpperCase() }}
        </span>

        <!-- Quick copy buttons -->
        <div class="quick-copies">
          <!-- Copy current format -->
          <button
            class="copy-btn"
            @click.stop="emit('copy')"
            :title="`Copy ${emoji.format === 'webp' ? 'WebP' : emoji.format.toUpperCase()} HTML`"
            :aria-label="`Copy ${emoji.format === 'webp' ? 'WebP' : emoji.format.toUpperCase()} format as HTML`"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>

          <!-- Copy WebP if available -->
          <button
            v-if="hasWebP"
            class="copy-btn"
            @click.stop="emit('copy')"
            title="Copy WebP HTML"
            aria-label="Copy WebP HTML"
          >
            WebP
          </button>

          <!-- Copy PNG if available -->
          <button
            v-if="hasPNG"
            class="copy-btn"
            @click.stop="emit('copy')"
            title="Copy PNG HTML"
            aria-label="Copy PNG HTML"
          >
            PNG
          </button>

          <!-- Copy GIF if available -->
          <button
            v-if="hasGIF"
            class="copy-btn"
            @click.stop="emit('copy')"
            title="Copy GIF HTML"
            aria-label="Copy GIF HTML"
          >
            GIF
          </button>
        </div>
      </div>
    </div>

    <!-- Action buttons overlay -->
    <div class="actions">
      <button class="action-btn download-btn" @click="emit('download')" title="Download" aria-label="Download">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
  border-radius: var(--radius-xl);
  background: var(--color-bg-elevated);
  border: 2px solid var(--color-border);
  transition: all var(--transition-fast);
  cursor: pointer;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-3px);
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
  width: 22px;
  height: 22px;
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

/* Info section - two rows */
.info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md) var(--space-md);
  min-height: 64px;
}

.info-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.info-row:first-child {
  justify-content: flex-start;
}

.info-row.format-row {
  justify-content: space-between;
  gap: var(--space-xs);
}

.emotion {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

/* Format label */
.format-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.format-label.webp { background: var(--color-webp-bg); color: var(--color-webp-text); }
.format-label.gif { background: var(--color-gif-bg); color: var(--color-gif-text); }
.format-label.png { background: var(--color-png-bg); color: var(--color-png-text); }

/* Quick copy buttons */
.quick-copies {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
  justify-content: flex-end;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-bg-subtle);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.copy-btn:hover {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
}

.copy-btn svg {
  flex-shrink: 0;
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
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
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

.download-btn {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: white;
}

.download-btn:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}

/* Always show actions on touch devices */
@media (hover: none) {
  .actions {
    opacity: 0.85;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .card {
    min-width: 0;
  }

  .select-btn {
    width: 20px;
    height: 20px;
  }

  .image-wrapper {
    padding: var(--space-sm);
    min-height: 72px;
  }

  .info {
    padding: var(--space-xs) var(--space-sm) var(--space-sm);
    min-height: 56px;
    gap: var(--space-xs);
  }

  .emotion {
    font-size: var(--font-size-xs);
    }

  .format-label {
    font-size: 10px;
    padding: 2px 6px;
  }

  .quick-copies {
    gap: var(--space-xs);
    justify-content: center;
  }

  .copy-btn {
    padding: 4px 8px;
    font-size: 10px;
  }

  .copy-btn svg {
    width: 12px;
    height: 12px;
  }

  .action-btn {
    padding: 8px 12px;
  }

  .action-btn svg {
    width: 16px;
    height: 16px;
  }
}
</style>
