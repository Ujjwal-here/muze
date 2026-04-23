/**
 * Backward-compatible color re-export.
 *
 * Historically components imported a flat `Colors` object from here.
 * That's now the *light* palette, kept for compatibility with
 * `StyleSheet.create` blocks that still reference `Colors.foo`.
 *
 * New code should prefer reading `colors` from `useTheme()` so it
 * responds to light/dark mode switches.
 */
export { lightColors as Colors } from "@/constants/theme";
