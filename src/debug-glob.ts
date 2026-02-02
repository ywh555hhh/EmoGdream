// Debug file to test import.meta.glob
console.log('=== Testing import.meta.glob ===')

// Test 1: Check what import.meta.glob returns
const simpleGlob = import.meta.glob('/stickers/*.{png,gif,webp}', { eager: true })
console.log('Simple glob count:', Object.keys(simpleGlob).length)
console.log('All keys from simple glob:', Object.keys(simpleGlob))

// Test 2: Recursive glob
const recursiveGlob = import.meta.glob('/stickers/**/*.{png,gif,webp}', { eager: true })
console.log('Recursive glob count:', Object.keys(recursiveGlob).length)
console.log('First 10 keys from recursive glob:', Object.keys(recursiveGlob).slice(0, 10))

// Test 3: Check module structure
const firstModule = Object.entries(recursiveGlob)[0]
if (firstModule) {
  console.log('First module path:', firstModule[0])
  console.log('First module type:', typeof firstModule[1])
}
