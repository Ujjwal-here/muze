import React, { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";
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
    <KeyboardAvoidingView
      style={[styles.root, style]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style={statusBarStyle} />
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
