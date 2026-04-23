/**
 * Return a color resolved against the active theme.
 * Supports the Expo convention of allowing per-theme overrides via props.
 *
 *   const color = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
 *
 * If the matching override is missing, it falls back to the theme's value
 * for `colorName`.
 */
import { themes, type ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/theme";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ThemeColors,
) {
  const { theme } = useTheme();
  const override = props[theme];
  if (override) return override;
  return themes[theme][colorName];
}
