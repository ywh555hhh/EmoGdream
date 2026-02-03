<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
  (e: 'copy', format?: 'png' | 'gif' | 'webp'): void
  (e: 'download'): void
}>()

const imageLoaded = ref(false)
const imageError = ref(false)
const showFormatMenu = ref(false)

// Use Vite's BASE_URL to handle both dev and production paths
const imagePath = computed(() => {
  const basePath = import.meta.env.BASE_URL || '/'
  const cleanBase = basePath.replace(/\/$/, '')
  return `${cleanBase}${props.emoji.path}`
})

// Get available formats count
const formatCount = computed(() => {
  if (!props.emoji.availableFormats) return 1
  return props.emoji.availableFormats.length
})

// Has multiple formats
const hasMultipleFormats = computed(() => formatCount.value > 1)

// Close menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (showFormatMenu.value && !target.closest('.format-dropdown')) {
    showFormatMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
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
      <div v-else-if="imageError" class="error-badge" aria-label="Failed to load">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </div>
    </div>

    <!-- Info section - single row with format badge -->
    <div class="info">
      <span class="emotion" :title="emoji.emotion">{{ emoji.emotion }}</span>
      <span class="format-badge" :class="emoji.format">
        {{ emoji.format.toUpperCase() }}
        <span v-if="hasMultipleFormats" class="format-count">+{{ formatCount - 1 }}</span>
      </span>
    </div>

    <!-- Action buttons overlay -->
    <div class="actions">
      <button
        class="action-btn"
        @click.stop="emit('copy')"
        :title="`Copy ${emoji.format.toUpperCase()} HTML`"
        :aria-label="`Copy ${emoji.format.toUpperCase()} format as HTML`"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>

      <!-- Format dropdown for multi-format emojis -->
      <div v-if="hasMultipleFormats" class="format-dropdown" :class="{ open: showFormatMenu }">
        <button
          class="format-toggle"
          @click.stop="showFormatMenu = !showFormatMenu"
          :aria-expanded="showFormatMenu"
          aria-label="Select format"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <div class="format-menu">
          <button
            v-if="emoji.availableFormats?.includes('webp')"
            class="format-option"
            @click.stop="emit('copy', 'webp'); showFormatMenu = false"
          >
            <span class="format-opt-label">WebP</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
          <button
            v-if="emoji.availableFormats?.includes('png')"
            class="format-option"
            @click.stop="emit('copy', 'png'); showFormatMenu = false"
          >
            <span class="format-opt-label">PNG</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
          <button
            v-if="emoji.availableFormats?.includes('gif')"
            class="format-option"
            @click.stop="emit('copy', 'gif'); showFormatMenu = false"
          >
            <span class="format-opt-label">GIF</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        </div>
      </div>

      <button class="action-btn" @click="emit('download')" title="Download" aria-label="Download">
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
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-xl);
  background: var(--color-bg-elevated);
  border: 2px solid var(--color-border);
  transition: all var(--transition-fast);
  overflow: hidden;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-accent);
}

.card.selected {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 5%, transparent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-accent) 15%, transparent);
}

/* Selection button */
.select-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-sm);
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
}

/* Image wrapper */
.image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
  background: var(--color-bg-subtle);
  min-height: 76px;
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
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-error-bg);
  color: var(--color-error);
}

/* Info section - compact single row */
.info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-xs);
  padding: var(--space-sm);
  min-height: 40px;
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

/* Format badge */
.format-badge {
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  padding: 3px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 2px;
}

.format-badge.webp { background: var(--color-webp-bg); color: var(--color-webp-text); }
.format-badge.gif { background: var(--color-gif-bg); color: var(--color-gif-text); }
.format-badge.png { background: var(--color-png-bg); color: var(--color-png-text); }

.format-count {
  font-weight: var(--font-weight-normal);
  opacity: 0.8;
}

/* Action buttons overlay - show on hover */
.actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-sm);
  background: color-mix(in srgb, var(--color-bg-elevated) 95%, transparent);
  opacity: 0;
  transform: translateY(8px);
  transition: all var(--transition-fast);
}

.card:hover .actions {
  opacity: 1;
  transform: translateY(0);
}

/* Always show actions on touch devices */
@media (hover: none) {
  .actions {
    opacity: 1;
    transform: translateY(0);
  }
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
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

/* Format dropdown */
.format-dropdown {
  position: relative;
}

.format-toggle {
  width: 28px;
  height: 32px;
  border-radius: var(--radius-md);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.format-toggle:hover {
  background: var(--color-bg-subtle);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.format-dropdown.open .format-toggle {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
}

.format-menu {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%) scale(0.95);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-xs);
  min-width: 80px;
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-fast);
  z-index: 10;
}

.format-dropdown.open .format-menu {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) scale(1);
}

.format-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: 6px 10px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  width: 100%;
}

.format-option:hover {
  background: var(--color-bg-subtle);
}

.format-opt-label {
  text-transform: uppercase;
  font-size: 11px;
  font-weight: var(--font-weight-bold);
}

.format-option svg {
  color: var(--color-accent);
  opacity: 0;
  transform: translateX(-4px);
  transition: all var(--transition-fast);
}

.format-option:hover svg {
  opacity: 1;
  transform: translateX(0);
}

/* Responsive */
@media (max-width: 640px) {
  .card {
    min-width: 0;
  }

  .select-btn {
    width: 18px;
    height: 18px;
  }

  .image-wrapper {
    padding: var(--space-sm);
    min-height: 64px;
  }

  .info {
    padding: var(--space-xs);
    min-height: 36px;
  }

  .emotion {
    font-size: var(--font-size-xs);
  }

  .format-badge {
    font-size: 9px;
    padding: 2px 4px;
  }

  .action-btn {
    width: 28px;
    height: 28px;
  }

  .action-btn svg {
    width: 14px;
    height: 14px;
  }

  .format-toggle {
    width: 24px;
    height: 28px;
  }

  .format-toggle svg {
    width: 12px;
    height: 12px;
  }
}
</style>
