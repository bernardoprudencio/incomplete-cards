/** Kibble Design Tokens */

// ─── Base Color Palette ───────────────────────────────────────────────────────
// Full Kibble color families. Prefer semantic `colors.*` aliases in components.
export const palette = {
  neutral: {
    white: '#FFFFFF',
    100:   '#F4F5F6',
    200:   '#E6E8EB',
    300:   '#D7DCE0',
    400:   '#C9CFD4',
    500:   '#9EA5AC',
    600:   '#767C82',
    700:   '#62686E',
    800:   '#404347',
    84:    '#CFD7DE',
    900:   '#1F2124',
  },
  green: {
    100: '#F1FDF6',
    200: '#BAE8C9',
    300: '#6BD094',
    400: '#05B86C',
    500: '#169A5B',
    600: '#1A824E',
    700: '#1B6C42',
    800: '#1B5535',
    900: '#173724',
  },
  cyan: {
    100: '#E8F9FC',
    200: '#8BE2EF',
    300: '#39CDE4',
    400: '#1CB0C7',
    500: '#1893A7',
    600: '#127787',
    700: '#116876',
    800: '#0D535D',
    900: '#09363D',
  },
  yellow: {
    100: '#FCF6EB',
    200: '#FFECBD',
    300: '#FFD76A',
    400: '#F8B816',
    500: '#D59418',
    600: '#B77F1D',
    700: '#80561A',
    800: '#654418',
    900: '#412C13',
  },
  blue: {
    100: '#ECF1FB',
    200: '#C5D5F2',
    300: '#A3BDEB',
    400: '#7DA1E2',
    500: '#5685DA',
    600: '#2E67D1',
    700: '#2D5CB1',
    800: '#24498C',
    900: '#172F5B',
  },
  red: {
    100: '#FFEDE8',
    200: '#FFC8BC',
    300: '#FFA494',
    400: '#FF7665',
    500: '#E6564A',
    600: '#BC4338',
    700: '#A03F37',
    800: '#7D342D',
    900: '#4F231F',
  },
  orange: {
    100: '#FCF5EF',
    200: '#FFD4A8',
    300: '#FFA96E',
    400: '#FF8A46',
    500: '#FF7525',
    600: '#E0621B',
    700: '#BB4F12',
    800: '#77320B',
    900: '#331706',
  },
  pink: {
    100: '#FFF2F7',
    200: '#FFD6E8',
    300: '#FFA6CC',
    400: '#FF7DB1',
    500: '#FF66A3',
    600: '#D13880',
    700: '#99215F',
    800: '#661342',
    900: '#330A22',
  },
  brand: {
    rover:      '#00BD70',
    safety:     '#2741CC',
    catinaflat: '#F4715F',
    logoRed:    '#F31E1E',
  },
}

// ─── Semantic Color Tokens ────────────────────────────────────────────────────
// Organized to match Kibble alias groups. Import and use these in components.
export const colors = {

  // Text/
  text: {
    primary:          palette.neutral[900],  // #1F2124
    secondary:        palette.neutral[800],  // #404347
    tertiary:         palette.neutral[700],  // #62686E
    disabled:         palette.neutral[500],  // #9EA5AC
    primaryInverse:   palette.neutral.white, // #FFFFFF
    secondaryInverse: palette.neutral[100],  // #F4F5F6
    tertiaryInverse:  palette.neutral[200],  // #E6E8EB
    placeholder:      palette.neutral[700],  // #62686E
    price:            palette.orange[700],   // #BB4F12
    error:            palette.red[600],      // #BC4338
    caution:          palette.yellow[800],   // #654418
    success:          palette.green[700],    // #1B6C42
    navigation:       palette.neutral[600],  // #767C82
  },

  // Background/
  background: {
    primary:            palette.neutral.white, // #FFFFFF
    secondary:          palette.neutral[100],  // #F4F5F6
    tertiary:           palette.neutral[200],  // #E6E8EB
    contrast:           palette.neutral[800],  // #404347
    accent:             palette.yellow[100],   // #FCF6EB
    accentSecondary:    palette.blue[100],     // #ECF1FB
    error:              palette.red[100],      // #FFEDE8
    caution:            palette.yellow[100],   // #FCF6EB
    success:            palette.green[100],    // #F1FDF6
    info:               palette.blue[100],     // #ECF1FB
    highlight:          palette.cyan[100],     // #E8F9FC
    attentionHighlight: palette.yellow[400],   // #F8B816
    navigation:         palette.neutral.white, // #FFFFFF
    overlay:            palette.neutral[900],  // #1F2124 (solid)
    overlayAccent:      '#14A96D',             // brand green overlay (no palette step)
  },

  // Border/
  border: {
    primary:   palette.neutral[400],  // #C9CFD4 — default interactive border
    secondary: palette.neutral[300],  // #D7DCE0 — subtle dividers/outlines
    contrast:  palette.neutral[700],  // #62686E
    error:     palette.red[600],      // #BC4338
    caution:   palette.yellow[400],   // #F8B816
    success:   palette.green[600],    // #1A824E
    info:      palette.neutral[400],  // #C9CFD4
    highlight: palette.cyan[700],     // #116876
    inputFocus: palette.blue[600],    // #2E67D1
    separator: palette.neutral[300],  // #D7DCE0
  },

  // Link/
  link: {
    primary:              palette.blue[600],    // #2E67D1
    primaryHover:         palette.blue[800],    // #24498C
    primaryInverse:       palette.blue[300],    // #A3BDEB
    primaryInverseHover:  palette.blue[100],    // #ECF1FB
    secondary:            palette.neutral[700], // #62686E
    secondaryHover:       palette.neutral[900], // #1F2124
    secondaryInverse:     palette.neutral[100], // #F4F5F6
    secondaryInverseHover: palette.neutral[300],// #D7DCE0
  },

  // Interactive/
  interactive: {
    textPrimary:                   palette.neutral[800],  // #404347
    textPrimaryActive:             palette.blue[600],     // #2E67D1
    textPrimaryHover:              palette.blue[700],     // #2D5CB1
    textDestructive:               palette.red[600],      // #BC4338
    textDestructiveHover:          palette.red[700],      // #A03F37
    textDestructiveInverse:        palette.red[400],      // #FF7665
    textDestructiveInverseHover:   palette.red[300],      // #FFA494
    textDisabled:                  palette.neutral[500],  // #9EA5AC
    bgPrimary:                     palette.neutral.white, // #FFFFFF
    bgPrimaryPressed:              palette.neutral[100],  // #F4F5F6
    bgPrimaryActive:               palette.neutral[800],  // #404347
    bgPrimaryActivePressed:        palette.neutral[900],  // #1F2124
    bgDisabled:                    palette.neutral[100],  // #F4F5F6
    bgDestructive:                 palette.red[600],      // #BC4338
    bgDestructivePressed:          palette.red[700],      // #A03F37
    bgButtonPrimary:               palette.blue[600],     // #2E67D1
    bgButtonPrimaryPressed:        palette.blue[700],     // #2D5CB1
    bgButtonPrimaryInverse:        palette.blue[100],     // #ECF1FB
    bgButtonPrimaryInversePressed: palette.blue[200],     // #C5D5F2
    borderPrimary:                 palette.neutral[400],  // #C9CFD4
    borderPrimaryPressed:          palette.neutral[600],  // #767C82
    borderPrimaryActive:           palette.neutral[800],  // #404347
    borderPrimaryActivePressed:    palette.neutral[900],  // #1F2124
    borderDisabled:                palette.neutral[200],  // #E6E8EB
  },

  // Brand — used across the app, not part of a Figma alias group
  brand:       palette.brand.rover,   // #00BD70
  brandSafety: palette.brand.safety,  // #2741CC

  // Semi-transparent scrim for modals/overlays (distinct from background.overlay)
  overlayBg: 'rgba(10,18,30,0.5)',
}

export const radius = {
  primary: 8,
  round:   99999,
}

// ─── Elevation / Shadows ─────────────────────────────────────────────────────
// Matches Kibble Elevation/Low, Medium, High variables exactly.
export const shadows = {
  low:          '0px 1px 4px 0px rgba(27,31,35,0.32)',   // Elevation/Low
  medium:       '0px 2px 12px -1px rgba(27,31,35,0.24)', // Elevation/Medium
  high:         '0px 8px 10px -6px rgba(27,31,35,0.22)', // Elevation/High
  headerShadow: '0px 1px 4px 0px rgba(27,31,35,0.32)',   // = low, kept for compat
}

export const typography = {
  fontFamily:    "'Averta', sans-serif",
  displayFamily: "'Bogart', sans-serif",
}

export const spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
}

const averta  = "'Averta', sans-serif"
const bogart  = "'Bogart', sans-serif"

export const textStyles = {
  // ── Display — Bogart Semibold ────────────────────────────────────────────
  display400: { fontFamily: bogart, fontWeight: 600, fontSize: 26, lineHeight: 1.25, letterSpacing: 0 },
  display500: { fontFamily: bogart, fontWeight: 600, fontSize: 32, lineHeight: 1.25, letterSpacing: 0 },
  display600: { fontFamily: bogart, fontWeight: 600, fontSize: 38, lineHeight: 1.25, letterSpacing: 0 },

  // ── Heading — Averta Semibold ────────────────────────────────────────────
  heading100: { fontFamily: averta, fontWeight: 600, fontSize: 14, lineHeight: 1.25, letterSpacing: 0 },
  heading200: { fontFamily: averta, fontWeight: 600, fontSize: 16, lineHeight: 1.25, letterSpacing: 0 },
  heading300: { fontFamily: averta, fontWeight: 600, fontSize: 20, lineHeight: 1.25, letterSpacing: 0 },
  heading400: { fontFamily: averta, fontWeight: 600, fontSize: 26, lineHeight: 1.25, letterSpacing: '-0.01em' },
  heading500: { fontFamily: averta, fontWeight: 600, fontSize: 32, lineHeight: 1.25, letterSpacing: '-0.01em' },
  heading600: { fontFamily: averta, fontWeight: 600, fontSize: 38, lineHeight: 1.25, letterSpacing: '-0.01em' },

  // ── Text — Averta Regular ────────────────────────────────────────────────
  text100:    { fontFamily: averta, fontWeight: 400, fontSize: 14, lineHeight: 1.25, letterSpacing: 0 },
  text200:    { fontFamily: averta, fontWeight: 400, fontSize: 16, lineHeight: 1.5,  letterSpacing: 0 },
  text300:    { fontFamily: averta, fontWeight: 400, fontSize: 20, lineHeight: 1.2,  letterSpacing: 0 },

  // ── Text — Averta Semibold ───────────────────────────────────────────────
  text100Semibold: { fontFamily: averta, fontWeight: 600, fontSize: 14, lineHeight: 1.25, letterSpacing: 0 },
  text200Semibold: { fontFamily: averta, fontWeight: 600, fontSize: 16, lineHeight: 1.5,  letterSpacing: 0 },
  text300Semibold: { fontFamily: averta, fontWeight: 600, fontSize: 20, lineHeight: 1.2,  letterSpacing: 0 },

  // ── Paragraph — Averta Regular (longer line height for body copy) ────────
  paragraph100: { fontFamily: averta, fontWeight: 400, fontSize: 14, lineHeight: 1.5, letterSpacing: 0 },
  paragraph200: { fontFamily: averta, fontWeight: 400, fontSize: 16, lineHeight: 1.5, letterSpacing: 0 },
  paragraph300: { fontFamily: averta, fontWeight: 400, fontSize: 20, lineHeight: 1.5, letterSpacing: 0 },

  // ── Link — Averta, underlined (color applied at usage site) ─────────────
  link100:         { fontFamily: averta, fontWeight: 400, fontSize: 14, lineHeight: 1.25, letterSpacing: 0 },
  link100Semibold: { fontFamily: averta, fontWeight: 600, fontSize: 14, lineHeight: 1.25, letterSpacing: 0 },
  link200:         { fontFamily: averta, fontWeight: 400, fontSize: 16, lineHeight: 1.25, letterSpacing: 0 },
  link200Semibold: { fontFamily: averta, fontWeight: 600, fontSize: 16, lineHeight: 1.25, letterSpacing: 0 },
  link300:         { fontFamily: averta, fontWeight: 400, fontSize: 20, lineHeight: 1.25, letterSpacing: 0 },
  link300Semibold: { fontFamily: averta, fontWeight: 600, fontSize: 20, lineHeight: 1.5,  letterSpacing: 0 },
  link400Semibold: { fontFamily: averta, fontWeight: 600, fontSize: 26, lineHeight: 1.25, letterSpacing: '-0.01em' },
  link500Semibold: { fontFamily: averta, fontWeight: 600, fontSize: 32, lineHeight: 1.25, letterSpacing: '-0.01em' },
  link600Semibold: { fontFamily: averta, fontWeight: 600, fontSize: 38, lineHeight: 1.25, letterSpacing: '-0.01em' },
}
