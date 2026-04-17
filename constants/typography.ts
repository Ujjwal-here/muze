import { fz } from "@/shared/utils/responsive";
export const Typography = {
  fonts: {
    cabin: {
      regular: "Cabin_400Regular",
      medium: "Cabin_500Medium",
      semibold: "Cabin_600SemiBold",
      bold: "Cabin_700Bold",
    },
    dm: {
      light: "DMSans_300Light",
      regular: "DMSans_400Regular",
      medium: "DMSans_500Medium",
      semibold: "DMSans_600SemiBold",
      bold: "DMSans_700Bold",
    },
  },
  sizes: {
    xxxxs: fz(8),
    xxxs: fz(8.5),
    xxs: fz(10),
    xs: fz(12),
    sm: fz(14),
    base: fz(16),
    lg: fz(18),
    xl: fz(20),
    "2xl": fz(24),
    "3xl": fz(30),
    "4xl": fz(36),
  },
};
