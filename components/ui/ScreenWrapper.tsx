import React, { ReactNode } from "react";
import { StyleSheet, ViewStyle, StyleProp } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";

interface ScreenWrapperProps {
  children: ReactNode;
  statusBarStyle?: "dark" | "light" | "auto";
  style?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  edges?: React.ComponentProps<typeof SafeAreaView>["edges"];
}

export function ScreenWrapper({
  children,
  statusBarStyle = "dark",
  style,
  scrollable = true,
  edges = ["top", "left", "right"],
}: ScreenWrapperProps) {
  if (!scrollable) {
    return (
      <SafeAreaView style={[styles.root, style]} edges={edges}>
        <StatusBar style={statusBarStyle} />
        {children}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={edges}>
      <StatusBar style={statusBarStyle} />
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flexGrow: 1,
    backgroundColor: Colors.white,
  },
});
