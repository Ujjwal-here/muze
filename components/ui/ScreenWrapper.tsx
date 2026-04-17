import React, { ReactNode } from "react";
import { StyleSheet, ViewStyle, StyleProp } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";

interface ScreenWrapperProps {
  children: ReactNode;
  statusBarStyle?: "dark" | "light" | "auto";
  style?: StyleProp<ViewStyle>;
}

export function ScreenWrapper({
  children,
  statusBarStyle = "dark",
  style,
}: ScreenWrapperProps) {
  return (
    <KeyboardAwareScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, style]}
      enableOnAndroid
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style={statusBarStyle} />
      {children}
    </KeyboardAwareScrollView>
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
