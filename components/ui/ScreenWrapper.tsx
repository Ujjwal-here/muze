import React, { ReactNode, useMemo } from "react";
import { StyleSheet, ViewStyle, StyleProp } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";

interface ScreenWrapperProps {
  children: ReactNode;
  statusBarStyle?: "dark" | "light" | "auto";
  style?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  edges?: React.ComponentProps<typeof SafeAreaView>["edges"];
}

export function ScreenWrapper({
  children,
  statusBarStyle,
  style,
  scrollable = true,
  edges = ["top", "left", "right"],
}: ScreenWrapperProps) {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const resolvedBarStyle = statusBarStyle ?? (isDark ? "light" : "dark");

  if (!scrollable) {
    return (
      <SafeAreaView style={[styles.root, style]} edges={edges}>
        <StatusBar style={resolvedBarStyle} />
        {children}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={edges}>
      <StatusBar style={resolvedBarStyle} />
      <KeyboardAwareScrollView
        style={styles.root}
        contentContainerStyle={[styles.content, style]}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      backgroundColor: colors.background,
    },
  });
