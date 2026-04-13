import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";

const CODE_LENGTH = 6;

export default function VerificationScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const codeAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  const fadeSlide = (anim: Animated.Value, delay: number) =>
    Animated.timing(anim, {
      toValue: 1,
      duration: 480,
      delay,
      useNativeDriver: true,
    });

  useEffect(() => {
    Animated.stagger(80, [
      fadeSlide(titleAnim, 0),
      fadeSlide(subtitleAnim, 0),
      fadeSlide(codeAnim, 0),
      fadeSlide(btnAnim, 0),
    ]).start();

    setTimeout(() => inputRefs.current[0]?.focus(), 500);
  }, []);

  const animStyle = (anim: Animated.Value, offsetY = 16) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [offsetY, 0],
        }),
      },
    ],
  });

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      const digits = text
        .replace(/[^0-9]/g, "")
        .split("")
        .slice(0, CODE_LENGTH);
      const newCode = [...code];
      digits.forEach((digit, i) => {
        if (index + i < CODE_LENGTH) {
          newCode[index + i] = digit;
        }
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, CODE_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = text.replace(/[^0-9]/g, "");
    setCode(newCode);

    if (text && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleContinue = () => {
    const fullCode = code.join("");
    if (fullCode.length === CODE_LENGTH) {
      router.push("/onboarding");
    }
  };

  const isComplete = code.every((digit) => digit !== "");

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />

      <View style={styles.inner}>
        <View style={styles.content}>
          <Animated.Text style={[styles.title, animStyle(titleAnim)]}>
            Enter Verification Code
          </Animated.Text>

          <Animated.View style={[styles.subtitleWrap, animStyle(subtitleAnim)]}>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to your email address to
            </Text>
            <View style={styles.emailRow}>
              <Text style={styles.emailTxt}>{email || "your@email.com"}</Text>
              <Pressable onPress={() => router.back()}>
                <Text style={styles.changeTxt}>Change incorrect email</Text>
              </Pressable>
            </View>
          </Animated.View>

          <Animated.View style={[styles.codeRow, animStyle(codeAnim)]}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.codeInput,
                  digit ? styles.codeInputFilled : null,
                ]}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoComplete="one-time-code"
              />
            ))}
          </Animated.View>
        </View>

        <Animated.View style={[styles.btnWrap, animStyle(btnAnim)]}>
          <Pressable
            style={({ pressed }) => [
              styles.continueBtn,
              !isComplete && styles.continueBtnDisabled,
              pressed &&
                isComplete && { backgroundColor: Colors.primaryPressed },
            ]}
            onPress={handleContinue}
            disabled={!isComplete}
          >
            <Text style={styles.continueTxt}>Continue</Text>
          </Pressable>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const INPUT_SIZE = iw(42);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  inner: {
    flex: 1,
    justifyContent: "space-between",
  },
  content: {
    paddingHorizontal: Layout.horizontal.lg,
    paddingTop: Layout.vertical["7xl"],
  },
  title: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.xl,
    color: Colors.black,
    textAlign: "center",
    marginBottom: Layout.vertical.md,
  },
  subtitleWrap: {
    alignItems: "center",
    marginBottom: Layout.vertical["3xl"],
  },
  subtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.xs,
    color: Colors.subtitle,
    textAlign: "center",
    lineHeight: Typography.sizes.xs * 1.6,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Layout.horizontal.xs,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  emailTxt: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.xs,
    color: Colors.black,
  },
  changeTxt: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    textDecorationLine: "underline",
  },
  codeRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Layout.horizontal.sm,
  },
  codeInput: {
    width: INPUT_SIZE,
    height: INPUT_SIZE,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.inputBg,
    textAlign: "center",
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.xl,
    color: Colors.black,
  },
  codeInputFilled: {
    borderColor: Colors.divider,
    backgroundColor: Colors.white,
  },
  btnWrap: {
    paddingHorizontal: Layout.horizontal.lg,
    paddingBottom: Layout.vertical["3xl"],
  },
  continueBtn: {
    paddingVertical: Layout.vertical.smMd,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueTxt: {
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    letterSpacing: 0.2,
  },
});
