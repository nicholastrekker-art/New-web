# Web Browser Application

## Overview
A Chrome-like web browser application built with React and Node.js. Users can browse websites, manage multiple tabs, and navigate the internet with a clean, modern interface.

## Purpose
This application provides a web-based browser experience where users can:
- Open and manage multiple browser tabs
- Navigate websites with back/forward/refresh controls
- Enter URLs directly or search
- Keep all tabs running in the background (tabs persist even when not visible)
- Browse the internet within the application

## Current State
The application is functional with core browsing features implemented. The frontend includes tab management, address bar navigation, and iframe-based website rendering.

## Recent Changes
- **Oct 31, 2025**: Initial browser implementation with tab management, address bar, and iframe rendering
- **Oct 31, 2025**: Added keyboard shortcuts and localStorage persistence
- **Oct 31, 2025**: Fixed LSP errors in server storage

## Project Architecture

### Frontend Structure
- **Browser.tsx**: Main page component managing tabs, navigation, and history
- **AddressBar.tsx**: URL input and navigation controls (back, forward, refresh, home)
- **TabBar.tsx**: Tab management UI with create/close/switch functionality
- **BrowserFrame.tsx**: Iframe wrapper for displaying websites with loading and error states

### Data Model (shared/schema.ts)
```typescript
Tab {
  id: string
  url: string
  title: string
  isLoading: boolean
  favicon?: string
}
```

### State Management
- **Tabs**: Array of tab objects with unique IDs
- **History**: Per-tab browsing history stored in object keyed by tab ID
- **HistoryIndex**: Current position in history for each tab
- **localStorage**: Persists tabs and history across sessions

### Key Features
1. **Multi-tab Browsing**: Create unlimited tabs, each with independent browsing context
2. **Background Tabs**: All tabs remain active and loaded even when not visible
3. **Navigation**: Full back/forward/refresh functionality per tab
4. **History Management**: Per-tab navigation history with index tracking
5. **Keyboard Shortcuts**: 
   - `Ctrl+T`: New tab
   - `Ctrl+W`: Close current tab
   - `Ctrl+Tab`: Switch to next tab
   - `Ctrl+L`: Focus address bar
6. **Persistence**: Tabs and history saved to localStorage

### Technical Notes

#### CORS and X-Frame-Options
Some websites block iframe embedding using X-Frame-Options headers. The application handles these gracefully with error messages.

#### Iframe Security
The iframe uses sandbox attributes for security:
- `allow-same-origin`: Allows content from same origin
- `allow-scripts`: Enables JavaScript
- `allow-forms`: Allows form submission
- `allow-popups`: Allows popups
- `allow-popups-to-escape-sandbox`: Allows popups to escape sandbox

#### Background Tab Implementation
Tabs use CSS `display: hidden` instead of unmounting, keeping iframes loaded and running in the background.

### Future Enhancements
- Bookmarks/favorites system
- Download manager
- Advanced tab features (pinning, muting, grouping)
- Browsing history viewer
- Incognito/private browsing mode
- Tab drag-and-drop reordering
- Search engine integration

## User Preferences
- Clean, Chrome-inspired UI design
- Minimal interface with focus on content
- Background tab persistence (all tabs keep running)
