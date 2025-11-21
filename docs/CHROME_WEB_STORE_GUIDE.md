# Publishing to Chrome Web Store

## Prerequisites

1. **Google Account**: You need a Google account
2. **Developer Fee**: One-time $5 registration fee
3. **Built Extension**: The `dist` folder from `pnpm run build`

## Step-by-Step Guide

### 1. Register as Chrome Web Store Developer

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the one-time $5 developer registration fee
4. Accept the developer agreement

### 2. Prepare Your Extension

1. **Build the extension**
   ```bash
   pnpm run build
   ```

2. **Create a ZIP file**
   ```bash
   cd dist
   zip -r ../xgarden-v0.1.3.zip .
   cd ..
   ```

3. **Prepare assets** (required):
   - **Icon**: 128x128px PNG (already have: `public/assets/icon.png`)
   - **Screenshots**: At least 1, max 5 (1280x800 or 640x400)
   - **Promotional images** (optional but recommended):
     - Small tile: 440x280
     - Marquee: 1400x560

### 3. Create Store Listing

1. Go to [Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click **"New Item"**
3. Upload your ZIP file (`xgarden-v0.1.3.zip`)
4. Fill in the store listing:

#### Store Listing Information

**Name**: XGarden - AI Interactive Storytelling

**Summary** (132 characters max):
```
Create interactive story worlds with AI characters. Free Gemini API support. Build worlds, chat with NPCs, immersive chapters.
```

**Description**:
```
XGarden is an open-source Chrome extension for AI-powered interactive storytelling and world-building.

✨ KEY FEATURES

🎭 Character & World Management
• Create custom NPCs with unique personalities
• Design your player character
• Build immersive story worlds with worldbook entries
• Organize characters into groups

📖 Dynamic Chapter System
• Create chapters with custom backgrounds and music
• Auto-progression based on time, keywords, or AI judgment
• Immersive visual and audio experience

🤖 AI Integration
• Free Google Gemini API support (recommended)
• OpenAI compatible APIs
• Natural conversations with AI characters

🎨 Rich Media
• Chapter-specific background images
• Atmospheric background music
• Beautiful visual effects

💾 Full Control
• All data stored locally
• Import/export worlds as JSON
• Multiple world support

🆓 COMPLETELY FREE
• No subscription required
• Use free Gemini API from Google AI Studio
• Open-source and community-driven

Perfect for:
• Interactive fiction writers
• RPG enthusiasts
• Creative storytelling
• Educational scenarios
• AI experimentation

Get started in minutes with our comprehensive documentation!
```

**Category**: Productivity (or Entertainment)

**Language**: English (add Chinese as additional language)

**Privacy Policy**: 
```
XGarden Privacy Policy

Data Storage:
All user data (worlds, characters, conversations) is stored locally in your browser using IndexedDB. No data is sent to our servers.

API Keys:
Your AI API keys are stored locally in Chrome's storage. We never access or transmit your API keys.

Third-Party Services:
- Google Gemini API: Used for AI conversations (requires your own API key)
- Volcengine Jimeng API: Optional, for image generation (requires your own API key)

We do not collect, store, or transmit any personal information.

For questions: [your-email@example.com]
```

**Screenshots**: Upload 3-5 screenshots showing:
1. World selector
2. Chat interface with background
3. Character creation
4. Worldbook panel
5. Settings dialog

### 4. Set Permissions Justification

For each permission in `manifest.json`, provide justification:

- **storage**: "Store user worlds, characters, and settings locally"
- **tabs**: "Open extension in new tab for better experience"

### 5. Submit for Review

1. Click **"Submit for review"**
2. Review process typically takes **1-3 business days**
3. You'll receive email notification when approved

### 6. After Approval

- Your extension will be live on Chrome Web Store
- Users can install it directly from the store
- You can publish updates anytime

## Tips for Approval

✅ **Do**:
- Provide clear, accurate description
- Include high-quality screenshots
- Test thoroughly before submitting
- Respond quickly to reviewer feedback

❌ **Don't**:
- Use misleading descriptions
- Include copyrighted content without permission
- Request unnecessary permissions
- Violate Chrome Web Store policies

## Updating Your Extension

1. Build new version: `pnpm run build`
2. Update version in `manifest.json`
3. Create new ZIP
4. Upload to existing item in dashboard
5. Submit for review

---

**Useful Links**:
- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Developer Program Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Best Practices](https://developer.chrome.com/docs/webstore/best-practices/)
