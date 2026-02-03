<template>
  <div class="about">
    <h1>EmoGdream</h1>
    <p class="subtitle">Your anime sticker browser</p>
    <div class="content">
      <p>A simple and elegant sticker browser for GitHub READMEs and more.</p>
      <ul>
        <li>Click to copy HTML ready for use</li>
        <li>Download stickers directly</li>
        <li>Filter by character, format, or emotion</li>
        <li>Batch select and copy/download</li>
        <li>Auto-prefers WebP format, falls back to PNG/GIF</li>
      </ul>
    </div>
    <div class="footer">
      <p>Made with love for the community</p>
    </div>
  </div>
</template>

<style scoped>
.about {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 16px;
  color: #86868b;
  margin-bottom: 40px;
}

.content {
  max-width: 400px;
  text-align: left;
}

.content p {
  font-size: 15px;
  color: #1d1d1f;
  line-height: 1.6;
  margin-bottom: 24px;
}

.content ul {
  list-style: none;
  padding: 0;
}

.content li {
  font-size: 15px;
  color: #1d1d1f;
  padding: 12px 0;
  line-height: 1.6;
}

.footer {
  margin-top: auto;
  padding-top: 40px;
}

.footer p {
  font-size: 14px;
  color: #86868b;
}

@media (prefers-color-scheme: dark) {
  .subtitle {
    color: #86868b;
  }

  .content p,
  .content li {
    color: #f5f5f7;
  }

  .footer p {
    color: #86868b;
  }
}
</style>
