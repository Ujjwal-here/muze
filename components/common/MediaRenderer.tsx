import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { Typography } from "@/constants/typography";
import { iw, ih } from "@/shared/utils/responsive";

export function parseMediaUrls(
  raw: string[] | string | null | undefined,
): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const inner = trimmed.slice(1, -1);
      const urls: string[] = [];
      let current = "";
      let inQuotes = false;
      for (const ch of inner) {
        if (ch === '"') {
          inQuotes = !inQuotes;
          continue;
        }
        if (ch === "," && !inQuotes) {
          if (current.trim()) urls.push(current.trim());
          current = "";
          continue;
        }
        current += ch;
      }
      if (current.trim()) urls.push(current.trim());
      return urls.filter(Boolean);
    }
    if (trimmed.startsWith("http")) return [trimmed];
  }
  return [];
}

function ImageCard({
  url,
  cardHeight,
  radius,
}: {
  url: string;
  cardHeight: number;
  radius: number;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [error, setError] = useState(false);

  const safeUrl = (() => {
    try {
      const u = new URL(url);
      u.pathname = u.pathname
        .split("/")
        .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
        .join("/");
      return u.toString();
    } catch {
      return url;
    }
  })();

  if (error) {
    return (
      <View
        style={[styles.errorBox, { height: cardHeight, borderRadius: radius }]}
      >
        <Ionicons name="image-outline" size={iw(32)} color={colors.muted} />
        <Text style={styles.errorTxt}>Image unavailable</Text>
        <Text style={styles.errorUrl} numberOfLines={2}>
          {safeUrl}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: safeUrl }}
      style={{
        width: "100%",
        height: cardHeight,
        borderRadius: radius,
        backgroundColor: colors.border,
      }}
      resizeMode="cover"
      onError={() => setError(true)}
    />
  );
}

export function MediaRenderer({
  urls,
  height = 200,
  borderRadius = 12,
}: {
  urls: string[] | string | null | undefined;
  height?: number;
  borderRadius?: number;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const parsed = parseMediaUrls(urls);
  if (parsed.length === 0) return null;

  return (
    <ImageCard
      url={parsed[0]}
      cardHeight={ih(height)}
      radius={iw(borderRadius)}
    />
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  errorBox: {
    width: "100%",
    backgroundColor: colors.inputBg,
    alignItems: "center",
    justifyContent: "center",
    gap: ih(8),
  },
  errorTxt: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xs,
    color: colors.muted,
  },
  errorUrl: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xxxs,
    color: colors.muted,
    paddingHorizontal: iw(16),
    textAlign: "center",
  },
});
