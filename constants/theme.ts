const brand = {
  primary: "#F87B1B",
  primaryPressed: "#D96A10",
  primaryTintSoft: "#FCE5D0",
  primaryTintStrong: "#FEE5CC",
} as const;

export const lightColors = {
  ...brand,

  white: "#FFFFFF",
  black: "#111111",

  background: "#FFFFFF",
  surface: "#FFFFFF",

  inputBg: "#FAFAFA",
  inputBgFocused: "#FFFFFF",
  border: "#E4E4E4",
  placeholder: "#ADADAD",
  muted: "#8A8A8A",
  divider: "#D8D8D8",
  label: "#333333",
  subtitle: "#555555",
  text: "#111111",
  textOnPrimary: "#FFFFFF",

  surfaceMuted: "#F5F5F5",
  surfaceSubtle: "#F2F2F2",
  surfacePressed: "#F7F7F7",
  surfaceNeutral: "#EFEFEF",
  surfaceReplyReceived: "#EAEAEA",

  pillActiveBg: "#111111",
  pillActiveText: "#FFFFFF",
  pillInactiveBg: "transparent",
  pillInactiveText: "#8A8A8A",

  avatarChat: "#1E4976",
  avatarFallback: "#D9D9D9",

  success: "#2E9E44",
  danger: "#E53935",

  shadow: "#000000",
  overlayLight: "rgba(0,0,0,0.25)",
  overlayModal: "rgba(0,0,0,0.35)",
  overlayModalDark: "rgba(0,0,0,0.4)",
  scrim: "rgba(255,255,255,0.7)",
  scrimStrong: "rgba(255,255,255,0.9)",

  bubbleReceived: "#F5F5F5",
  bubbleReceivedText: "#111111",
  bubbleSentText: "#FFFFFF",

  replyQuoteSent: "#FFE6CC",
  replyQuoteReceived: "#E8E8E8",

  replyComposerBg: "#FCE5D0",

  actionBg: "#EFEFEF",
  actionActiveBg: "#FEE5CC",
  actionDivider: "#D0D0D0",

  logoTint: "#111111",
};

export const darkColors: typeof lightColors = {
  ...brand,

  white: "#1A1A1A",
  black: "#FFFFFF",

  background: "#000000",
  surface: "#1A1A1A",

  inputBg: "#1A1A1A",
  inputBgFocused: "#1A1A1A",
  border: "#2A2A2A",
  placeholder: "#6B6B6B",
  muted: "#8A8A8A",
  divider: "#262626",
  label: "#FFFFFF",
  subtitle: "#B8B8B8",
  text: "#FFFFFF",
  textOnPrimary: "#FFFFFF",

  surfaceMuted: "#2A2A2A",
  surfaceSubtle: "#282828",
  surfacePressed: "#303030",
  surfaceNeutral: "#2C2C2C",
  surfaceReplyReceived: "#2A2A2A",

  pillActiveBg: "#2A2A2A",
  pillActiveText: "#FFFFFF",
  pillInactiveBg: "transparent",
  pillInactiveText: "#8A8A8A",

  avatarChat: "#3B6FA8",
  avatarFallback: "#3A3A3A",

  success: "#4CAF50",
  danger: "#EF5350",

  shadow: "#000000",
  overlayLight: "rgba(0,0,0,0.5)",
  overlayModal: "rgba(0,0,0,0.6)",
  overlayModalDark: "rgba(0,0,0,0.7)",
  scrim: "rgba(0,0,0,0.6)",
  scrimStrong: "rgba(0,0,0,0.8)",

  bubbleReceived: "#1A1A1A",
  bubbleReceivedText: "#FFFFFF",
  bubbleSentText: "#FFFFFF",

  replyQuoteSent: "#331A00",
  replyQuoteReceived: "#2A2A2A",

  replyComposerBg: "#331A00",

  actionBg: "#2A2A2A",
  actionActiveBg: "#3D1F00",
  actionDivider: "#444444",

  logoTint: "#FFFFFF",
};

export type ThemeColors = typeof lightColors;
export type ThemeName = "light" | "dark";

export const themes: Record<ThemeName, ThemeColors> = {
  light: lightColors,
  dark: darkColors,
};
