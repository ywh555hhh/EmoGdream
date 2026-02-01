import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useSizeControl } from '../composables/useSizeControl'

describe('useSizeControl', () => {
  let sizeControl: ReturnType<typeof useSizeControl>

  beforeEach(() => {
    sizeControl = useSizeControl()
  })

  it('initializes with default size of 64px', () => {
    expect(sizeControl.size.value).toBe(64)
    expect(sizeControl.sizeValue.value).toBe('64px')
    expect(sizeControl.htmlTag.value).toBe('<img width="64" height="64" />')
  })

  it('updates size value within valid range', () => {
    sizeControl.updateSize(32)
    expect(sizeControl.size.value).toBe(32)
    expect(sizeControl.sizeValue.value).toBe('32px')
    expect(sizeControl.htmlTag.value).toBe('<img width="32" height="32" />')
  })

  it('clamps size to minimum of 16px', () => {
    sizeControl.updateSize(10)
    expect(sizeControl.size.value).toBe(16)
    expect(sizeControl.sizeValue.value).toBe('16px')
    expect(sizeControl.htmlTag.value).toBe('<img width="16" height="16" />')
  })

  it('clamps size to maximum of 128px', () => {
    sizeControl.updateSize(200)
    expect(sizeControl.size.value).toBe(128)
    expect(sizeControl.sizeValue.value).toBe('128px')
    expect(sizeControl.htmlTag.value).toBe('<img width="128" height="128" />')
  })

  it('resets size to default 64px', () => {
    sizeControl.updateSize(100)
    expect(sizeControl.size.value).toBe(100)
    
    sizeControl.resetSize()
    expect(sizeControl.size.value).toBe(64)
    expect(sizeControl.sizeValue.value).toBe('64px')
    expect(sizeControl.htmlTag.value).toBe('<img width="64" height="64" />')
  })

  it('reactively updates HTML tag when size changes', async () => {
    expect(sizeControl.htmlTag.value).toBe('<img width="64" height="64" />')
    
    sizeControl.updateSize(80)
    await nextTick()
    expect(sizeControl.htmlTag.value).toBe('<img width="80" height="80" />')
    
    sizeControl.updateSize(24)
    await nextTick()
    expect(sizeControl.htmlTag.value).toBe('<img width="24" height="24" />')
  })

  it('reactively updates size value when size changes', async () => {
    expect(sizeControl.sizeValue.value).toBe('64px')
    
    sizeControl.updateSize(48)
    await nextTick()
    expect(sizeControl.sizeValue.value).toBe('48px')
    
    sizeControl.updateSize(120)
    await nextTick()
    expect(sizeControl.sizeValue.value).toBe('120px')
  })

  it('handles edge values correctly', () => {
    sizeControl.updateSize(16)
    expect(sizeControl.size.value).toBe(16)
    expect(sizeControl.sizeValue.value).toBe('16px')
    
    sizeControl.updateSize(128)
    expect(sizeControl.size.value).toBe(128)
    expect(sizeControl.sizeValue.value).toBe('128px')
  })
})