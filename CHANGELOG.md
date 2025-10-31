# Changelog - VEIN Modding Wiki

## Latest Updates - October 31, 2025

### Layout & Design Improvements
- Removed opaque background overlays from content areas
- Added semi-transparent backdrop (rgba(20,20,20,0.85)) with blur effect for improved text readability
- Homepage now displays with transparent background to showcase background image
- Content stretches across full width while maintaining readability
- Fixed horizontal scrollbar issues across all pages
- Eliminated empty space on right side of pages

### Navigation & Structure
- Sidebar now hidden on homepage and mod showcase pages for cleaner presentation
- Reorganized all wiki pages into logical subfolders:
  - `Pages/Introduction/` - Getting started guides
  - `Pages/CoreFundamentals/` - Essential tools
  - `Pages/BeginnerMods/` - Simple modifications
  - `Pages/IntermediateMods/` - Asset creation and UE basics
  - `Pages/BlueprintMods/` - Visual scripting
  - `Pages/AdvancedMods/` - Complex modifications
  - `Pages/ExpertMods/` - Advanced techniques
  - `Pages/GameSpecific/` - Game-specific guides
  - `Pages/Tools/` - Tool documentation
- Created index pages for each major section
- Updated all internal links to reflect new folder structure
- Updated search functionality to index all reorganized pages

### Mod Showcase Page
- Removed iframe embedding (blocked by Nexus Mods X-Frame-Options)
- Replaced with clean landing page design
- Featured Nexus Mods trending image optimized to 1200px max-width
- Image scales responsively while remaining focal point
- Simplified navigation with direct links to Nexus Mods
- Added rounded corners to preview image
- Sidebar hidden for full-width display

### Community Features
- Replaced FontAwesome icons with actual PNG images for proper brand colors
- Discord icon: `Media/Icons/002-discord.png`
- Steam icon: `Media/Icons/steam.png`
- Email icon: `Media/Icons/001-mail.png`

### Content Updates
- Added Windows SDK requirement documentation to:
  - `Pages/Introduction/6_UEProjectSetup.html`
  - `Pages/IntermediateMods/CreatingProject.html`
  - `Pages/IntermediateMods/CookingContent.html`
- Included link to Microsoft Windows SDK download
- Added troubleshooting notes for SDK-related packaging errors
- Removed table of contents from all pages (simplified navigation)

### Mobile Responsiveness
- Fixed text wrapping issues in portrait mode
- Added orientation banner prompting horizontal viewing for best experience
- Banner dismissible by user
- Improved mobile layouts across all pages
- Content properly scales on all device sizes

### Code Organization
- Modularized CSS into separate files:
  - `css/variables.css` - Color and theme variables
  - `css/base.css` - Base styles and reset
  - `css/navigation.css` - Header and navigation
  - `css/landing.css` - Homepage styles
  - `css/layout.css` - Main layout structure
  - `css/sidebar.css` - Sidebar styles
  - `css/components.css` - Reusable components
  - `css/mobile.css` - Mobile responsive styles
  - `css/content.css` - Content area typography
  - `css/showcase.css` - Mod showcase page
  - `css/widgets.css` - Widget styles
- Modularized JavaScript into separate modules:
  - `js/ui.js` - UI interactions
  - `js/navigation.js` - Sidebar and navigation
  - `js/loader.js` - Page loading logic
  - `js/search.js` - Search functionality
  - `js/theme.js` - Theme switching

