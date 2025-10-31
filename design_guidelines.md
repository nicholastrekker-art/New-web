# Design Guidelines: Web Browser Application

## Design Approach

**Selected Approach**: Design System - Material Design 3
**Rationale**: Browser applications prioritize function over form, requiring instant recognition of controls and minimal learning curve. Material Design's clear hierarchy and established browser patterns ensure users can focus on content, not interface navigation.

**Reference Inspiration**: Chrome, Arc Browser, Brave
- Chrome's minimal chrome UI and maximum viewport space
- Arc's clean sidebar navigation patterns
- Focus on content-first, interface-second philosophy

**Core Principles**:
1. Maximum browsing area with minimal UI footprint
2. Instant control recognition
3. Clear hierarchy: navigation controls > address bar > content
4. No distracting visual elements

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16**
- Component padding: p-2, p-4
- Section spacing: gap-4, gap-6
- Major layout divisions: p-8, p-12

**Structure**:
```
[Browser Chrome Bar] - Fixed height: h-14
├─ Navigation Controls (Left)
├─ Address Bar (Center/Flex-grow)
└─ Action Buttons (Right)

[Content Viewport] - calc(100vh - 56px)
└─ Iframe container
```

**Container Strategy**:
- Browser chrome: Full-width with max-w-none
- Address bar: flex-1 with max-width constraints (max-w-4xl)
- Content viewport: Absolute positioning to fill remaining space

---

## Typography

**Font Family**: 
- Primary: 'Inter' from Google Fonts (400, 500, 600)
- Fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui

**Type Scale**:
- URL/Address text: text-sm (14px) - font-normal
- Button labels: text-xs (12px) - font-medium
- Placeholders: text-sm - font-normal with reduced opacity
- Error messages: text-xs - font-medium

**Text Treatment**:
- Address bar: Single-line with text truncation (truncate)
- No text shadows or effects
- Standard letter-spacing

---

## Component Library

### A. Browser Chrome Bar
**Structure**: Fixed top bar with three-column layout
- Height: h-14 (56px)
- Background: Solid with subtle border-b
- Shadow: shadow-sm
- Padding: px-4
- Display: flex items-center gap-3

**Left Section**: Navigation Controls
- Back button: Icon button (w-8 h-8)
- Forward button: Icon button (w-8 h-8)
- Refresh button: Icon button (w-8 h-8)
- Home button: Icon button (w-8 h-8)
- Icons: Use **Heroicons** (outline style, 20px)
- Spacing: gap-1 between buttons

**Center Section**: Address Bar
- Input field with rounded-lg (12px radius)
- Height: h-10 (40px)
- Padding: px-4
- Flex: flex-1
- Max-width: max-w-4xl
- Border: border with focus:ring-2
- Protocol display: Include https:// prefix as read-only text
- Clear button: Small X icon on right (appears on input)

**Right Section**: Utility Controls
- Settings/Menu icon button (w-8 h-8)
- Gap: gap-2

### B. Content Viewport
**Container**:
- Position: Fixed or absolute
- Top: top-14 (below chrome bar)
- Dimensions: w-full h-[calc(100vh-3.5rem)]
- Overflow: hidden

**Iframe Element**:
- Dimensions: w-full h-full
- Border: border-0
- Display: block
- Background: Loading state with subtle pulse

### C. Loading States
**Address Bar Loading**:
- Thin progress bar below chrome bar (h-0.5)
- Animated gradient or progress indicator
- Width: Animates 0% to 100%

**Page Loading**:
- Center spinner in viewport
- Icon: Simple circular spinner (w-8 h-8)
- Position: Centered with flex

### D. Error States
**Failed Load Screen**:
- Centered container (max-w-md mx-auto)
- Error icon (w-16 h-16)
- Heading: text-lg font-semibold
- Message: text-sm
- Retry button: Standard button component
- Spacing: flex flex-col items-center gap-4

### E. Empty State (New Tab)
**Layout**:
- Centered content (min-h-screen flex items-center justify-center)
- Logo/Brand icon (w-20 h-20)
- Welcome message: text-2xl font-semibold
- Suggestion text: text-sm with reduced opacity
- Spacing: flex flex-col items-center gap-6

### F. Button Components
**Icon Buttons** (Navigation controls):
- Size: w-8 h-8
- Padding: p-1.5
- Border radius: rounded-md
- Hover: Subtle background change
- Active: Slight scale or background shift
- Disabled: Reduced opacity (opacity-40)

**Primary Button** (Retry, etc.):
- Height: h-10
- Padding: px-6
- Border radius: rounded-lg
- Font: text-sm font-medium
- Hover: Subtle transformation
- Focus: ring-2

---

## Interaction Patterns

**URL Navigation**:
1. Click address bar → Select all text
2. Type URL → Show protocol hints if missing
3. Press Enter → Validate and navigate
4. Invalid URL → Show inline error, don't navigate

**Browser Controls**:
- Back/Forward: Disabled states when no history
- Refresh: Animated icon rotation during reload
- Home: Returns to empty state

**Keyboard Shortcuts**:
- Ctrl/Cmd + L: Focus address bar
- Ctrl/Cmd + R: Refresh page
- Escape: Stop loading (if applicable)

---

## Animations

**Minimal Animation Strategy**:
- Address bar focus: ring-2 transition (150ms)
- Button hovers: background opacity (100ms)
- Loading indicator: Continuous linear progress
- Page transitions: None (instant iframe load)
- Icon button presses: No animation, instant feedback

**Explicitly Avoid**:
- Slide-in animations for chrome bar
- Fade transitions between pages
- Fancy hover effects
- Scroll-based animations

---

## Accessibility

- All icon buttons: aria-label attributes
- Address bar: role="textbox" with proper labels
- Keyboard navigation: Full tab-index support
- Focus indicators: Visible ring-2 states
- Color contrast: WCAG AA minimum for all text
- Screen reader: Announce page loads and errors

---

## Images

**No hero images required** - This is a utility application focused on function.

**Icon Requirements**:
- Use **Heroicons** via CDN
- Required icons: 
  - arrow-left (back)
  - arrow-right (forward)
  - arrow-path (refresh)
  - home (home button)
  - cog-6-tooth (settings)
  - x-mark (clear input)
  - exclamation-circle (errors)

---

## Technical Notes

- **Security**: Implement CSP headers for iframe sandboxing
- **Responsive**: Maintain layout integrity on all screen sizes (min-width: 320px)
- **Performance**: Lazy-load iframe content, debounce URL validation
- **Browser Support**: Modern browsers supporting iframe sandbox attributes