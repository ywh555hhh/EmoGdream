#!/usr/bin/env python3
"""Update README.md to prefer WebP format when available."""

import re
from pathlib import Path

# Read stickers data to build format map
STICKERS_FILE = Path('src/data/stickers.ts')
README_FILE = Path('README.md')

def parse_stickers_ts():
    """Parse stickers.ts file to get available formats for each character/emotion."""
    # Maps character_emotion -> list of available formats
    formats = {}

    with open(STICKERS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all sticker entries
    pattern = r"""
        \{\s*
        id:\s*['"]([^'"]+)['"]\s*,\s*
        name:\s*['"]([^'"]+)['"]\s*,\s*
        emotion:\s*['"]([^'"]+)['"]\s*,\s*
        format:\s*['"]([^'"]+)['"]\s*,\s*
        character:\s*['"]([^'"]+)['"]\s*,\s*
        path:\s*['"]([^'"]+)['"]
    """
    for match in re.finditer(pattern, content, re.VERBOSE):
        emoji_id, name, emotion, format, character, path = match.groups()

        # Create key as character_emotion
        key = f'{character}_{emotion}'
        if key not in formats:
            formats[key] = []
        formats[key].append(format)

    return formats

def get_best_format(formats_map, character, emotion):
    """Get the best format for a character/emotion, preferring webp."""
    key = f'{character}_{emotion}'
    if key not in formats_map:
        return None

    formats = formats_map[key]
    # Prefer webp, then png, then gif
    if 'webp' in formats:
        return 'webp'
    elif 'png' in formats:
        return 'png'
    elif 'gif' in formats:
        return 'gif'
    return None

def update_readme():
    """Update README.md to use webp when available."""
    formats_map = parse_stickers_ts()

    print(f"Found {len(formats_map)} character/emotion combinations")

    # Read README
    with open(README_FILE, 'r', encoding='utf-8') as f:
        readme = f.read()

    # Find all sticker URLs in README
    # Pattern: src="https://ywh555hhh.github.io/EmoGdream/stickers/{character}/{name}.{ext}"
    url_pattern = r'src="(https://ywh555hhh\.github\.io/EmoGdream/stickers/([^/]+)/([^/"]+)\.(png|gif|webp))"'
    matches = list(re.finditer(url_pattern, readme))

    print(f"Found {len(matches)} sticker URLs in README")

    changes = []
    for match in matches:
        full_url, char_path, name, ext = match.groups()

        # Extract character from path (might be in uppercase/lowercase)
        character = char_path

        # Extract emotion from name
        # Name format: {character}_{emotion}.{ext} or {emotion}.{ext}
        emotion = name.replace(f'{character}_', '').replace(f'{character.lower()}_', '')
        emotion = emotion.replace(f'{character.upper()}_', '')

        best_format = get_best_format(formats_map, character, emotion)

        if best_format and best_format != ext:
            new_url = f'https://ywh555hhh.github.io/EmoGdream/stickers/{char_path}/{name}.{best_format}'
            changes.append((full_url, new_url, character, emotion, ext, best_format))

    if changes:
        print(f"\nMaking {len(changes)} changes:")
        for old_url, new_url, char, emo, old_fmt, new_fmt in changes:
            print(f"  {char}/{emo}.{old_fmt} -> {new_fmt}")
            readme = readme.replace(f'src="{old_url}"', f'src="{new_url}"')

        # Write back
        with open(README_FILE, 'w', encoding='utf-8') as f:
            f.write(readme)
        print(f"\n✅ README.md updated with {len(changes)} format changes")
    else:
        print("\n✅ No changes needed - README already uses optimal formats")

if __name__ == '__main__':
    update_readme()
