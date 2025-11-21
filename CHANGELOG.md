# Changelog

All notable changes to XGarden will be documented in this file.

## [0.1.4] - 2024-11-21

### Added
- **UI Enhancements**
  - Typewriter sound effects for authentic text appearance
  - Improved background image clarity with bg-cover stretching
  - Enhanced toolbar transparency (70%) for better background visibility
  - Logo branding in sidebar header

- **Character Management**
  - Avatar deletion functionality
  - Portrait deletion functionality
  - Upload and preview avatars directly in character dialog

- **World Management**
  - World rename functionality
  - Complete data export including all character avatars and portraits
  - Portrait download capability during conversations

- **Localization**
  - Multi-language support: English, Chinese (Simplified), Thai
  - Language auto-detection based on browser settings
  - Language persistence in local storage

- **Media & Assets**
  - 5 royalty-free background music tracks
  - Improved image generation integration

### Fixed
- Dialog z-index issues with proper createPortal usage
- AI Settings dialog accessibility
- World defaults persistence
- Character portrait display in chat

### Improved
- UI transparency allowing better background visibility
- Chat interface responsiveness
- Input box height and visual weight
- Group member display in header

### Changed
- Background image mode from bg-contain to bg-cover
- Top toolbar transparency from 80% to 30% (70% transparent)
- Bottom toolbar transparency from 70% to 30% (70% transparent)
- Database schema updated to include portrait field

---

## [0.1.3] - 2024-11-20

### Added
- World default backgrounds and music
- Chapter system with auto-progression
  - Time-based triggers (dialogue count, duration)
  - Keyword-based triggers
  - AI judgment-based progression
- Character and group management
- Worldbook entries for story context
- Image API configuration (Jimeng/Volcengine)
- Chapter-specific background images and music
- Character avatar display in chat

### Features
- Multiple world support
- World import/export functionality
- AI integration (Google Gemini, OpenAI compatible)
- Local data persistence with IndexedDB

---

## [0.1.2] - Previous Release

### Core Features
- Basic chat interface
- Character creation
- Simple world management
- AI integration setup

---

## Roadmap

### v0.2.0
- [ ] AI image generation integration
- [ ] Enhanced RAG with vector embeddings
- [ ] Performance optimizations
- [ ] Character relationship system

### v0.3.0
- [ ] Pre-built world templates
  - Romance of the Three Kingdoms
  - Journey to the West
  - Greek Mythology
  - Norse Mythology
- [ ] Historical character database
- [ ] Educational storytelling

### v0.4.0
- [ ] Famous personalities database
- [ ] Scientists, philosophers, economists
- [ ] Historical figures and artists
- [ ] Community character sharing

### v0.5.0
- [ ] Community features
- [ ] World sharing and rating
- [ ] Multiplayer interactions
- [ ] Achievement system
- [ ] Gamification

### Future Vision
- [ ] Video generation for cinematic storytelling
- [ ] Voice synthesis for dialogues
- [ ] Branching storylines with consequences
- [ ] NFT character/world support
- [ ] Mobile companion app
- [ ] Extended language support (Japanese, Korean, Russian, etc.)
