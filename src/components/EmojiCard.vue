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
  return text.length > 16 ? text.slice(0, 15) + '…' : text
})

// Show tooltip if text is truncated
const showTooltip = computed(() => props.emoji.emotion.length > 16)

// Get character name from emoji
const characterName = computed(() => {
  const nameMap: Record<string, string> = {
    nina: 'Nina',
    nijika: 'Nijika',
    tomori: 'Tomori',
    momoka: 'Momoka',
    subaru: 'Subaru',
    hitori: 'Hitori',
    ikuyo: 'Ikuyo',
    soyo: 'Soyo',
    taki: 'Taki',
    tomo: 'Tomo',
    rupa: 'Rupa',
    sakiko: 'Sakiko',
    ryo: 'Ryo',
    uika: 'Uika',
    nyamu: 'Nyamu',
    mutsumi: 'Mutsumi',
    raana: 'Raana',
    umiri: 'Umiri',
    gbc: 'GBC',
    anon: 'Anon',
    KB: 'KB',
    mana: 'Mana'
  }
  return nameMap[props.emoji.character] || props.emoji.character
})

// Get display format text
const formatLabel = computed(() => {
  const labels: Record<string, string> = {
    webp: 'WebP',
    png: 'PNG',
    gif: 'GIF'
  }
  return labels[props.emoji.format] || props.emoji.format.toUpperCase()
})
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

    <!-- Info section -->
    <div class="info">
      <div class="info-main">
        <span class="format" :class="emoji.format">
          {{ formatLabel }}
        </span>
        <span class="emotion" :title="showTooltip ? emoji.emotion : ''">{{ truncatedEmotion }}</span>
      </div>

      <!-- Multi-format indicator -->
      <div v-if="emoji.availableFormats && emoji.availableFormats.length > 1" class="multi-badges" title="Multiple formats available">
        <span v-for="f in emoji.availableFormats" :key="f" class="format-dot" :class="{ current: f === emoji.format }">
          {{ f.toUpperCase() }}
        </span>
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
  top: var(--space-xs);
  right: var(--space-xs);
  width: 28px;
  height: 28px;
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
  transform: scale(1.05);
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

/* Info section */
.info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md) var(--space-md);
  gap: var(--space-sm);
  min-height: 48px;
}

.info-main {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.format {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  padding: 3px 6px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.format.webp { background: var(--color-webp-bg); color: var(--color-webp-text); }
.format.gif { background: var(--color-gif-bg); color: var(--color-gif-text); }
.format.png { background: var(--color-png-bg); color: var(--color-png-text); }

.emotion {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: var(--font-weight-medium);
}

/* Multi-format badges */
.multi-badges {
  display: flex;
  gap: 3px;
  flex-shrink: 0;
}

.format-dot {
  font-size: 9px;
  font-weight: var(--font-weight-bold);
  padding: 2px 4px;
  border-radius: 4px;
  background: var(--color-border);
  color: var(--color-text-tertiary);
  opacity: 0.7;
}

.format-dot.current {
  opacity: 1;
  background: var(--color-accent);
  color: white;
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
    width: 26px;
    height: 26px;
  }

  .image-wrapper {
    padding: var(--space-sm);
    min-height: 72px;
  }

  .info {
    padding: var(--space-xs) var(--space-sm) var(--space-sm);
    min-height: 44px;
  }

  .format {
    font-size: 10px;
    padding: 2px 5px;
  }

  .emotion {
    font-size: var(--font-size-xs);
  }

  .action-btn {
    padding: 6px var(--space-xs);
  }

  .action-btn span {
    font-size: 9px;
  }
}
</style>
