# Christmas Theme System Documentation

## Overview
The Christmas Theme System is a comprehensive UI overhaul designed to bring holiday cheer to the Otter Chat application. It features a modular architecture that overrides standard CSS variables, ensuring compatibility with both Light and Dark modes.

## Architecture

### 1. CSS Variables & Overrides
The theme is implemented using CSS variables scoped to the `.christmas` class in `src/app/globals.css`. This allows for instant switching without page reloads.

- **Primary Color**: `#D32F2F` (Festive Red)
- **Secondary Color**: `#388E3C` (Evergreen)
- **Accent Color**: `#FBC02D` (Gold)
- **Fonts**:
  - Headings: `Mountains of Christmas`
  - Body: `Dancing Script` (used for accents)

### 2. Component Overrides
Specific components receive unique styling when the Christmas theme is active:

- **Inputs**: Candy cane border effect using `border-image`.
- **Buttons**: Holly leaf decoration (pseudo-element) on primary buttons.
- **Cards**: Subtle snowflake background pattern using radial gradients.
- **Radius**: Increased border radius (1rem) for a softer, friendlier look.

### 3. State Management
- **Provider**: `HolidayThemeProvider` (`src/components/HolidayThemeProvider.tsx`) manages the `theme` state.
- **Persistence**: State is saved to `localStorage` (`holiday-theme`).
- **Context**: Exposes `theme` string and `setTheme` function.

## Components

### ThemeSelector (`src/components/ThemeSelector.tsx`)
An animated toggle button integrated into the Sidebar.
- **Active State**: Shows a Gift icon with a red glow.
- **Inactive State**: Shows a Palette icon (or other theme icons).
- **Animations**: Uses `framer-motion` for smooth icon transitions (slide/rotate) and spring physics.

## Usage

### Enabling the Theme
Wrap your application (or part of it) in the `HolidayThemeProvider`:

```tsx
import { HolidayThemeProvider } from "@/components/HolidayThemeProvider";

export default function Layout({ children }) {
  return (
    <HolidayThemeProvider>
      {children}
    </HolidayThemeProvider>
  );
}
```

### Toggling
Use the `ThemeSelector` component or the `useHolidayTheme` hook:

```tsx
import { useHolidayTheme } from "@/components/HolidayThemeProvider";

const { setTheme } = useHolidayTheme();
<button onClick={() => setTheme('christmas')}>Enable Christmas Mode</button>
```

## Visual Reference Guide

### Typography
- **Headings**: Displayed in "Mountains of Christmas" font.
- **Body**: Standard Geist Sans, with "Dancing Script" for festive accents.

### Colors
| Variable | Hex | Usage |
|----------|-----|-------|
| `--primary` | `#D32F2F` | Main actions, buttons |
| `--secondary` | `#388E3C` | Success states, focus rings |
| `--accent` | `#FBC02D` | Borders, highlights |

### Effects
- **Snowfall**: Cards have a subtle static snowflake pattern.
- **Candy Cane**: Text inputs feature a red/white striped border.
- **Glow**: The toggle button pulses when active.

## Testing
- Verify toggle persistence on page reload.
- Check Light/Dark mode compatibility (Theme should adapt brightness while keeping festive colors).
- Ensure animations run smoothly at 60fps.
