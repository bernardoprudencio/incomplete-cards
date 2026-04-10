import { colors, typography, textStyles } from '../../tokens'

export const fontFamily = typography.fontFamily

// Local token aliases — all values sourced from central tokens (Phase 7: no hardcoded hex values)
export const R = {
  brand:       colors.brand,           brandLight:  colors.brandLight,
  navy:        colors.primary,         navyMid:     colors.secondary,
  gray:        colors.tertiary,        grayMid:     colors.grayMid,
  grayLight:   colors.disabledText,    border:      colors.borderInteractive,
  separator:   colors.border,          bg:          colors.bgSecondary,
  bgTertiary:  colors.bgTertiary,      white:       colors.white,
  blue:        colors.link,            blueLight:   colors.blueLight,
  green:       colors.brand,           greenLight:  colors.brandLight,
  red:         colors.destructive,     redLight:    colors.redLight,
  amber:       colors.amber,           amberLight:  colors.amberLight,
  amberBorder: colors.amberBorder,     purple:      colors.purple,
  purpleLight: colors.purpleLight,     cardBorder:  colors.border,
  disabled:    colors.bgTertiary,      disabledText:colors.disabledText,
}

export const labelSt = {
  ...textStyles.heading100,
  display: 'block', color: R.navyMid, marginBottom: 4,
}
