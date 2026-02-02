// Debug file to test import.meta.glob
console.log('=== Testing import.meta.glob ===')

// Test 1: Simple glob
const simpleGlob = import.meta.glob('/stickers/*.{png,gif,webp}', { eager: true })
console.log('Simple glob result:', Object.keys(simpleGlob).length)
console.log('Sample paths:', Object.keys(simpleGlob).slice(0, 5))

// Test 2: Recursive glob
const recursiveGlob = import.meta.glob('/stickers/**/*.{png,gif,webp}', { eager: true })
console.log('Recursive glob result:', Object.keys(recursiveGlob).length)
console.log('Sample paths:', Object.keys(recursiveGlob).slice(0, 5))

// Test 3: Check if we can access the modules
console.log('Module content check:', Object.entries(recursiveGlob)[0]?.[1])
