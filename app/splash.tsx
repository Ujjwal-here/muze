import { Layout } from "@/constants/layout";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { iw } from "@/shared/utils/responsive";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Image, Animated, StyleSheet, StatusBar } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/auth";

const MIN_SPLASH_MS = 2800;

const SplashScreen: React.FC = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { session, user, loading } = useAuth();
  const [animDone, setAnimDone] = useState(false);

  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(
    new Animated.Value(Layout.vertical["5xl"]),
  ).current;
  const bgOpacity = useRef(new Animated.Value(1)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(0.5)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0.5)).current;
  const ring3Opacity = useRef(new Animated.Value(0)).current;
  const ring3Scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const entranceAnim = Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoTranslateY, {
        toValue: 0,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]);

    const rippleDelay = (
      delay: number,
      opacity: Animated.Value,
      scale: Animated.Value,
    ) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 2.4,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      ]);

    const rippleAnim = Animated.parallel([
      Animated.sequence([
        Animated.timing(ring1Opacity, {
          toValue: 0.55,
          duration: 0,
          useNativeDriver: true,
        }),
        rippleDelay(0, ring1Opacity, ring1Scale),
      ]),
      Animated.sequence([
        Animated.timing(ring2Opacity, {
          toValue: 0.4,
          duration: 0,
          useNativeDriver: true,
        }),
        rippleDelay(180, ring2Opacity, ring2Scale),
      ]),
      Animated.sequence([
        Animated.timing(ring3Opacity, {
          toValue: 0.25,
          duration: 0,
          useNativeDriver: true,
        }),
        rippleDelay(360, ring3Opacity, ring3Scale),
      ]),
    ]);

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.06,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );

    Animated.sequence([
      entranceAnim,
      Animated.parallel([
        rippleAnim,
        Animated.sequence([Animated.delay(200), pulseLoop]),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      pulseLoop.stop();
      setAnimDone(true);
    }, MIN_SPLASH_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!animDone || loading) return;

    const exitAnim = Animated.timing(bgOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    });

    exitAnim.start(() => {
      if (session && user) {
        const onboardingDone = user.user_metadata?.onboarding_complete === true;
        const hasName = !!user.user_metadata?.full_name;
        if (onboardingDone && hasName) {
          router.replace("/home");
        } else {
          router.replace("/onboarding");
        }
      } else {
        router.replace("/login");
      }
    });
  }, [animDone, loading, session, user]);

  const ringStyle = (opacity: Animated.Value, scale: Animated.Value) => ({
    ...styles.ring,
    opacity,
    transform: [{ scale }],
  });

  return (
    <Animated.View style={[styles.container, { opacity: bgOpacity }]}>
      <StatusBar hidden />
      <Animated.View style={ringStyle(ring1Opacity, ring1Scale)} />
      <Animated.View style={ringStyle(ring2Opacity, ring2Scale)} />
      <Animated.View style={ringStyle(ring3Opacity, ring3Scale)} />
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: logoOpacity,
            transform: [
              { scale: Animated.multiply(logoScale, pulseScale) },
              { translateY: logoTranslateY },
            ],
          },
        ]}
      >
        <Image
          source={require("@/assets/images/muze-logo.png")}
          style={[styles.logo, { tintColor: colors.logoTint }]}
          resizeMode="contain"
        />
      </Animated.View>
    </Animated.View>
  );
};

const RING_SIZE = Layout.horizontal["10xl"];

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    logoWrapper: {
      alignItems: "center",
      justifyContent: "center",
    },
    logo: {
      width: iw(70),
      height: iw(70),
    },
    ring: {
      position: "absolute",
      width: RING_SIZE,
      height: RING_SIZE,
      borderRadius: RING_SIZE / 2,
      borderWidth: 1,
      borderColor: colors.black,
      backgroundColor: "transparent",
    },
  });

export default SplashScreen;
