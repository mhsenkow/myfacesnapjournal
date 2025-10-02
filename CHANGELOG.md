# Changelog

All notable changes to MyFace SnapJournal will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Interactive like and bookmark functionality for Mastodon posts
- Floating title bubble for feed controls (half-on/half-off pattern)
- Menu-style action buttons with smooth animations
- Enhanced post icons showing media, tags, polls, mentions, and content warnings
- 9 smart algorithms for post selection (latest, trending, viral, diverse, balanced, fresh, media-rich, conversational, random)
- Time decay scoring for trending content
- Engagement rate calculation for viral post detection
- Background feed loading service
- Live feed mode with configurable batch sizes and intervals
- Smooth slide-up animations for footer panel
- Glass morphism design system with theme-aware styling

### Changed
- Footer panel now uses slide-up motion like the search panel
- Menu buttons positioned half-on/half-off the footer panel
- Reduced spacing throughout the footer for better organization
- Enhanced visual feedback for post interactions
- Improved responsive design for better mobile experience

### Fixed
- Footer panel no longer gets pushed off the page
- Theme toggle functionality restored
- Proper OAuth scopes for like and bookmark actions
- Rate limiting handling for large post fetches
- Layout overlaps and spacing issues

## [0.1.0] - 2024-01-10

### Added
- Initial release of MyFace SnapJournal
- Core journaling functionality with rich text editing
- Mastodon integration with OAuth authentication
- Multiple feed display modes (Refined, Cards, Instagram, DataViz, Dense)
- Glass morphism UI with light/dark/brutalist themes
- Facebook integration framework
- AI companion and echo engine foundations
- Tauri desktop app wrapper
- Responsive design for desktop and mobile
- State management with Zustand
- TypeScript throughout the codebase

### Technical
- React 18 with Vite build system
- Tailwind CSS for styling
- Lucide React for icons
- SQLite database with migrations
- Rust backend with Tauri integration
- OAuth 2.0 authentication flow
- Real-time feed updates

## [0.0.1] - 2024-01-01

### Added
- Project initialization
- Basic project structure
- Development environment setup
- Initial documentation
