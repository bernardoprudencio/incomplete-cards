# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Rover – Incomplete Cards Prototype** — An interactive React prototype for user testing the "Decrease Missed Rover Cards" UX flow. Figma source: [UX2-7159](https://www.figma.com/design/xqBd8IpIkViuhZ9BcPvnid/-UX2-7159--Decrease-missed-Rover-Cards?node-id=16783-5188).

## Commands

```bash
npm install     # Install dependencies
npm run dev     # Start dev server at http://localhost:5173
npm run build   # Production build
npm run preview # Preview production build
```

No linting or test setup exists in this project.

## Architecture

**Routing:** State-driven (no React Router). `App.jsx` owns `screen` state (`'home'` | `'conversation'`), `actionSheet` visibility, and CSS transition direction. Screen switches trigger animated slide transitions via CSS transforms.

**Design Tokens:** All colors, spacing, radius, shadows, and typography are centralized in `src/tokens/tokens.js`. Use these values instead of hardcoding CSS — spacing is an 8-based scale (4, 8, 12, 16, 24, 32px), and the palette uses semantic names (primary, secondary, success, link, etc.).

**Component Variants:** `Button.jsx` supports `default`, `primary`, `flat`, and `disabled` variants via a `variant` prop. SVG icons live in `src/assets/icons.jsx` as named React components (17 total).

**Responsive Behavior:** On desktop, the app renders inside a 375×812px phone frame with a CSS shadow shell (`global.css`). On mobile (≤420px viewport), it goes full-screen for native-feeling user tests.

**No Backend:** All data (pet names, images, service info) is hardcoded in components or imported from `src/assets/images.js`. No API calls or state management libraries.
