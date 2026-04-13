import { Platform } from "react-native";
import { fz } from "@/shared/utils/responsive";

export const Typography = {
  fonts: {
    regular: "Cabin_400Regular",
    medium: "Cabin_500Medium",
    semibold: "Cabin_600SemiBold",
    bold: "Cabin_700Bold",
  },
  fontFamily: Platform.select({
    ios: "Cabin_400Regular",
    android: "Cabin_400Regular",
    default: "System",
  }),

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
