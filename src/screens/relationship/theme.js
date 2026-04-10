import { colors, typography, textStyles } from '../../tokens'

export const fontFamily = typography.fontFamily

// Local token aliases — all values sourced from central tokens (Phase 7: no hardcoded hex values)
export const R = {
  brand:       colors.brand,           brandLight:  colors.background.success,
  navy:        colors.text.primary,         navyMid:     colors.text.secondary,
  gray:        colors.text.tertiary,        grayMid:     colors.text.navigation,
  grayLight:   colors.text.disabled,    border:      colors.border.primary,
  separator:   colors.border.secondary,          bg:          colors.background.secondary,
  bgTertiary:  colors.background.tertiary,      white:       colors.background.primary,
  blue:        colors.link.primary,            blueLight:   colors.background.info,
  green:       colors.brand,           greenLight:  colors.background.success,
  success:     colors.text.success,   successBorder: colors.border.success,
  red:         colors.text.error,     redLight:    colors.background.error,    errorBorder: colors.border.error,
  highlight:   colors.border.highlight,
  amber:       colors.text.caution,           amberLight:  colors.background.caution,
  amberBorder: colors.border.caution,     purple:      colors.brandSafety,
  purpleLight: colors.background.info,     cardBorder:  colors.border.secondary,
  disabled:    colors.background.tertiary,      disabledText:colors.text.disabled,
}

export const labelSt = {
  ...textStyles.heading100,
  display: 'block', color: R.navyMid, marginBottom: 4,
}
