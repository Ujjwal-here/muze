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
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";
import { Typography } from "@/constants/typography";
import { Colors } from "@/constants/colors";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const emailRef = useRef<TextInput>(null);

  const logoAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const orAnim = useRef(new Animated.Value(0)).current;
  const googleAnim = useRef(new Animated.Value(0)).current;

  const fadeSlide = (anim: Animated.Value, delay: number) =>
    Animated.timing(anim, {
      toValue: 1,
      duration: 480,
      delay,
      useNativeDriver: true,
    });

  useEffect(() => {
    Animated.stagger(80, [
      fadeSlide(logoAnim, 0),
      fadeSlide(titleAnim, 0),
      fadeSlide(subtitleAnim, 0),
      fadeSlide(formAnim, 0),
      fadeSlide(orAnim, 0),
      fadeSlide(googleAnim, 0),
    ]).start();
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

  const handleContinue = () => {
    if (email.trim()) {
      router.push("/");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />

      <View style={styles.inner}>
        <Animated.View style={[styles.logoWrap, animStyle(logoAnim, 20)]}>
          <Image
            source={require("@/assets/images/muze-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.Text style={[styles.title, animStyle(titleAnim)]}>
          Muze, a new social network
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, animStyle(subtitleAnim)]}>
          Be the vibe, break the mold.{"\n"}Make it big on Muze.
        </Animated.Text>

        <Animated.View style={[styles.fieldWrap, animStyle(formAnim)]}>
          <Text style={styles.label}>Email</Text>
          <Pressable
            style={[styles.inputRow, emailFocused && styles.inputRowFocused]}
            onPress={() => emailRef.current?.focus()}
          >
            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={Colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.continueBtnWrap, animStyle(formAnim)]}>
          <Pressable
            style={({ pressed }) => [
              styles.continueBtn,
              pressed && { backgroundColor: Colors.primaryPressed },
            ]}
            onPress={handleContinue}
          >
            <Text style={styles.continueTxt}>Continue</Text>
          </Pressable>
        </Animated.View>

        <Animated.View style={[styles.orRow, animStyle(orAnim)]}>
          <View style={styles.orLine} />
          <Text style={styles.orTxt}>OR</Text>
          <View style={styles.orLine} />
        </Animated.View>

        <Animated.View style={[styles.googleBtnWrap, animStyle(googleAnim)]}>
          <Pressable
            style={({ pressed }) => [
              styles.googleBtn,
              pressed && { backgroundColor: Colors.googleBtnPressed },
            ]}
            onPress={() => {}}
          >
            <Image
              source={{
                uri: "https://developers.google.com/identity/images/g-logo.png",
              }}
              style={styles.googleIcon}
            />
            <Text style={styles.googleTxt}>Sign in with Google</Text>
          </Pressable>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Layout.horizontal.lg,
    justifyContent: "center",
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: Layout.vertical.lg,
  },
  logo: {
    width: iw(70),
    height: iw(70),
  },
  title: {
    fontFamily: Typography.fonts.bold,
    fontSize: Typography.sizes.xl,
    color: Colors.black,
    textAlign: "center",
    marginBottom: Layout.vertical.sm,
  },
  subtitle: {
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.subtitle,
    textAlign: "center",
    lineHeight: Typography.sizes.sm * 1.6,
    marginBottom: Layout.vertical["3xl"],
  },
  fieldWrap: {
    marginBottom: Layout.vertical.lg,
  },
  label: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.xs,
    color: Colors.label,
    marginBottom: Layout.vertical.xs,
  },
  inputRow: {
    height: Layout.horizontal["2xl"],
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: Layout.horizontal.sm,
    backgroundColor: Colors.inputBg,
    justifyContent: "center",
  },
  inputRowFocused: {
    borderWidth: 1,
    borderColor: Colors.divider,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    fontFamily: Typography.fonts.regular,
    fontSize: Typography.sizes.sm,
    color: Colors.black,
    paddingVertical: 0,
  },
  continueBtnWrap: {
    marginBottom: Layout.vertical["2xl"],
  },
  continueBtn: {
    paddingVertical: Layout.vertical.smMd,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  continueTxt: {
    fontFamily: Typography.fonts.semibold,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
    letterSpacing: 0.2,
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Layout.vertical["2xl"],
    gap: Layout.horizontal.sm,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  orTxt: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.xxs,
    color: Colors.muted,
    letterSpacing: 1.2,
  },
  googleBtnWrap: {
    alignItems: "center",
  },
  googleBtn: {
    width: "100%",
    paddingVertical: Layout.vertical.smMd,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Layout.horizontal.sm,
    backgroundColor: Colors.white,
  },
  googleIcon: {
    width: iw(20),
    height: iw(20),
  },
  googleTxt: {
    fontFamily: Typography.fonts.medium,
    fontSize: Typography.sizes.sm,
    color: Colors.label,
  },
});
