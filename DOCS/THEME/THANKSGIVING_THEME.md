# Thanksgiving Theme System Documentation

## Overview
The Thanksgiving Theme System is a warm, inviting UI overhaul designed to bring gratitude and harvest vibes to the Nebula Chat application. It uses the modular theme architecture to override standard CSS variables with rich autumn tones.

## Architecture

### 1. CSS Variables & Overrides
The theme is implemented using CSS variables scoped to the `.thanksgiving` class in `src/app/globals.css`.

- **Primary Color**: `#D2691E` (Chocolate/Pumpkin)
- **Secondary Color**: `#8B4513` (Saddle Brown)
- **Accent Color**: `#DAA520` (Goldenrod)
- **Fonts**:
  - Headings: `Cinzel Decorative` or `Playfair Display`
  - Body: `Lora` (Serif for a storybook feel)

### 2. Component Overrides
Specific components receive unique styling when the Thanksgiving theme is active:

- **Inputs**: Wood grain or simple double borders.
- **Buttons**: Leaf shape hints or warm gradients.
- **Cards**: Subtle falling leaves pattern.
- **Radius**: Moderate, smooth rounding (0.5rem) for a cozy feel.

### 3. State Management
- **Provider**: `HolidayThemeProvider` (`src/components/HolidayThemeProvider.tsx`) manages the `theme` state.
- **Persistence**: State is saved to `localStorage` (`holiday-theme`).
- **Context**: Exposes `theme` string and `setTheme` function.

## Components

### ThemeSelector
- **Active State**: Shows a Leaf icon.
- **Animations**: Spring-based transitions.

## Visual Reference Guide

### Typography
- **Headings**: Displayed in "Playfair Display" font.
- **Body**: Standard Geist Sans, with "Lora" for accents.

### Colors
| Variable | Hex | Usage |
|----------|-----|-------|
| `--primary` | `#D2691E` | Main actions, buttons |
| `--secondary` | `#8B4513` | Success states, focus rings |
| `--accent` | `#DAA520` | Borders, highlights |

### Effects
- **Harvest**: Cards have a warm, textured background.
- **Gold Rim**: Buttons and inputs have a golden highlight.
