<script setup lang="ts">
import { useDownload } from '../composables/useDownload'
import { useClipboard } from '../composables/useClipboard'
import type { Emoji } from '../composables/useEmojis'

const props = withDefaults(defineProps<{
  emoji: Emoji
  selected: boolean
  size: number
}>(), {
  size: 64
})

const emit = defineEmits<{
  (e: 'update:selected', value: boolean): void
  (e: 'copy'): void
  (e: 'download'): void
}>()

const { downloadEmoji } = useDownload()
const { copyHtmlTag, isCopying } = useClipboard()

const handleDownload = async () => {
  try {
    await downloadEmoji(props.emoji)
    emit('download')
  } catch (error) {
    console.error('Download failed:', error)
  }
}

const handleCopy = async () => {
  emit('copy')
  await copyHtmlTag(props.emoji, { width: props.size, height: props.size })
}
</script>

<template>
  <div class="emoji-card">
    <!-- Checkbox for batch selection -->
    <div class="checkbox-wrapper">
      <input
        type="checkbox"
        :checked="selected"
        @change="$emit('update:selected', ($event.target as HTMLInputElement).checked)"
        :id="`checkbox-${emoji.id}`"
        class="emoji-checkbox"
      />
      <label :for="`checkbox-${emoji.id}`" class="checkbox-label">Select</label>
    </div>

    <!-- Emoji image -->
    <div class="emoji-image-wrapper">
      <img
        :src="emoji.path"
        :alt="emoji.name"
        class="emoji-image"
        :style="{ width: `${size}px`, height: `${size}px` }"
        loading="lazy"
      />
    </div>

    <!-- Emoji information -->
    <div class="emoji-info">
      <h3 class="emoji-name">{{ emoji.name }}</h3>
      <p class="emoji-emotion">{{ emoji.emotion }}</p>
      <span class="emoji-format" :class="`format-${emoji.format}`">{{ emoji.format.toUpperCase() }}</span>
    </div>

    <!-- Size preview -->
    <div class="size-preview">
      <span class="preview-label">Size Preview</span>
      <div class="preview-placeholder">
        <span>{{ size }}px</span>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="action-buttons">
      <button @click="handleCopy" class="btn btn-copy" :disabled="isCopying" aria-label="Copy HTML tag">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        {{ isCopying ? 'Copying...' : 'Copy' }}
      </button>
      <button @click="handleDownload" class="btn btn-download" aria-label="Download image">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download
      </button>
    </div>
  </div>
</template>

<style scoped>
.emoji-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
  position: relative;
}

.emoji-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--color-border-hover);
}

/* Checkbox styling */
.checkbox-wrapper {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.emoji-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: hsla(160, 100%, 37%, 1);
}

.checkbox-label {
  font-size: 0.8125rem;
  color: var(--color-text);
  opacity: 0;
  transition: opacity 0.2s ease;
  cursor: pointer;
  user-select: none;
}

.emoji-card:hover .checkbox-label {
  opacity: 1;
}

/* Emoji image */
.emoji-image-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
  background-color: var(--color-background);
  border-radius: 8px;
  padding: 1rem;
}

.emoji-image {
  object-fit: contain;
  image-rendering: pixelated;
}

/* Emoji information */
.emoji-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.emoji-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.emoji-emotion {
  font-size: 0.875rem;
  color: var(--color-text);
  margin: 0;
  opacity: 0.8;
}

.emoji-format {
  display: inline-block;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  width: fit-content;
}

.format-png {
  background-color: #e3f2fd;
  color: #1565c0;
}

.format-gif {
  background-color: #fce4ec;
  color: #c2185b;
}

.format-webp {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

/* Size preview placeholder */
.size-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: var(--color-background);
  border: 1px dashed var(--color-border);
  border-radius: 6px;
}

.preview-label {
  font-size: 0.75rem;
  color: var(--color-text);
  opacity: 0.6;
  font-weight: 500;
}

.preview-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text);
  font-family: monospace;
}

/* Action buttons */
.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
}

.btn:active {
  transform: scale(0.97);
}

.btn-copy {
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-copy:hover {
  background-color: var(--color-background-mute);
  border-color: var(--color-border-hover);
}

.btn-download {
  background-color: hsla(160, 100%, 37%, 1);
  color: #ffffff;
}

.btn-download:hover {
  background-color: hsla(160, 100%, 32%, 1);
}

/* Responsive design */
@media (max-width: 640px) {
  .emoji-card {
    padding: 1rem;
  }

  .emoji-image {
    width: 80px;
    height: 80px;
  }

  .emoji-image-wrapper {
    min-height: 100px;
  }

  .checkbox-label {
    display: none;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }

  .btn {
    width: 100%;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .format-png {
    background-color: #1565c0;
    color: #e3f2fd;
  }

  .format-gif {
    background-color: #c2185b;
    color: #fce4ec;
  }

  .format-webp {
    background-color: #7b1fa2;
    color: #f3e5f5;
  }
}
</style>
