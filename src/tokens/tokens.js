/** Kibble Design Tokens */

export const colors = {
  primary: '#1F2124',
  secondary: '#404347',
  tertiary: '#62686E',
  success: '#1B6C42',
  link: '#2E67D1',
  white: '#FFFFFF',

  brand:      '#00BD70',
  brandLight: '#E6F9F0',

  blueLight:   '#EBF1FA',
  destructive: '#BC4338',

  bgSecondary: '#F4F5F6',
  bgTertiary:  '#E6E8EB',

  border:            '#D7DCE0',
  borderInteractive: '#C9CFD4',

  disabledBg:     '#F4F5F6',
  disabledBorder: '#E8EBED',
  disabledText:   '#9EA5AC',

  yellow100: '#FCF6EB',
  cyan100:   '#E8F9FC',

  // Semantic extras used across relationship/schedule screens
  grayMid:      '#767C82',
  redLight:     '#FDECEA',
  amber:        '#D4860A',
  amberLight:   '#FEF7E6',
  amberBorder:  '#F0D48A',
  purple:       '#2741CC',
  purpleLight:  '#EBEEFB',
  overlayBg:    'rgba(10,18,30,0.5)',
}

export const radius = {
  primary: 8,
  round:   99999,
}

export const shadows = {
  low:          '0px 1px 4px 0px rgba(27,31,35,0.24)',
  medium:       '0px 2px 12px -1px rgba(27,31,35,0.24)',
  headerShadow: '0px 1px 4px 0px rgba(27,31,35,0.32)',
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

export const textStyles = {
  // Display — Bogart Semibold
  display400:      { fontFamily: "'Bogart', sans-serif",  fontWeight: 600, fontSize: 26, lineHeight: 1.25 },

  // Headings — Averta Semibold
  heading300:      { fontFamily: "'Averta', sans-serif",  fontWeight: 600, fontSize: 20, lineHeight: 1.25 },
  heading200:      { fontFamily: "'Averta', sans-serif",  fontWeight: 600, fontSize: 16, lineHeight: 1.25 },
  heading100:      { fontFamily: "'Averta', sans-serif",  fontWeight: 600, fontSize: 14, lineHeight: 1.25 },

  // Text — Averta Regular
  text200:         { fontFamily: "'Averta', sans-serif",  fontWeight: 400, fontSize: 16, lineHeight: 1.5  },
  text100:         { fontFamily: "'Averta', sans-serif",  fontWeight: 400, fontSize: 14, lineHeight: 1.25 },
  paragraph100:    { fontFamily: "'Averta', sans-serif",  fontWeight: 400, fontSize: 14, lineHeight: 1.5  },

  // Text — Averta Semibold
  text200Semibold: { fontFamily: "'Averta', sans-serif",  fontWeight: 600, fontSize: 16, lineHeight: 1.5  },
  text100Semibold: { fontFamily: "'Averta', sans-serif",  fontWeight: 600, fontSize: 14, lineHeight: 1.5  },
}
