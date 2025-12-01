# Halloween Theme System Documentation

## Overview
The Halloween Theme System is a spooky UI overhaul designed to bring frightful fun to the Nebula Chat application. It leverages the modular theme architecture to override standard CSS variables, creating an immersive experience for the spooky season.

## Architecture

### 1. CSS Variables & Overrides
The theme is implemented using CSS variables scoped to the `.halloween` class in `src/app/globals.css`.

- **Primary Color**: `#FF7518` (Pumpkin Orange)
- **Secondary Color**: `#663399` (Witch's Purple)
- **Accent Color**: `#32CD32` (Slime Green)
- **Fonts**:
  - Headings: `Creepster`
  - Body: `Roboto Slab` (for a sturdy, classic feel)

### 2. Component Overrides
Specific components receive unique styling when the Halloween theme is active:

- **Inputs**: "Slime" border effect using `border-image` or box-shadows.
- **Buttons**: Bat wing decoration or jagged edges.
- **Cards**: Spiderweb background pattern using radial/linear gradients.
- **Radius**: Sharper, jagged corners (or inconsistent radius) for a chaotic feel.

### 3. State Management
- **Provider**: `HolidayThemeProvider` (`src/components/HolidayThemeProvider.tsx`) manages the `theme` state.
- **Persistence**: State is saved to `localStorage` (`holiday-theme`).
- **Context**: Exposes `theme` string and `setTheme` function.

## Components

### ThemeSelector
A component to switch between available holiday themes.
- **Active State**: Shows a Ghost icon with an orange glow.
- **Animations**: Spring-based transitions.

## Visual Reference Guide

### Typography
- **Headings**: Displayed in "Creepster" font.
- **Body**: Standard Geist Sans, with "Roboto Slab" for accents.

### Colors
| Variable | Hex | Usage |
|----------|-----|-------|
| `--primary` | `#FF7518` | Main actions, buttons |
| `--secondary` | `#663399` | Success states, focus rings |
| `--accent` | `#32CD32` | Borders, highlights |

### Effects
- **Spiderwebs**: Cards have a subtle spiderweb pattern.
- **Slime**: Text inputs feature a green drip effect.
- **Glow**: The toggle button pulses with an eerie green/purple light.
