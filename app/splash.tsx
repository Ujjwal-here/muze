import { Layout } from "@/constants/layout";
import { iw } from "@/shared/utils/responsive";
import React, { useEffect, useRef } from "react";
import { Image, Animated, StyleSheet, StatusBar } from "react-native";

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
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

    const exitAnim = Animated.timing(bgOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    });

    Animated.sequence([
      entranceAnim,
      Animated.parallel([
        rippleAnim,
        Animated.sequence([Animated.delay(200), pulseLoop]),
      ]),
    ]).start();

    const exitTimer = setTimeout(() => {
      pulseLoop.stop();
      exitAnim.start(() => onAnimationComplete?.());
    }, 2800);

    return () => clearTimeout(exitTimer);
  }, []);

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
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </Animated.View>
  );
};

const RING_SIZE = Layout.horizontal["10xl"]; // wp(28) ≈ 160px on 360 base

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: Layout.horizontal["9xl"], // wp(26)
    height: Layout.horizontal["9xl"], // keep square
  },
  ring: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: iw(0.55),
    borderColor: "#000000",
    backgroundColor: "transparent",
  },
});

export default SplashScreen;
