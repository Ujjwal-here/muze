import React, { useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { CornerUpLeft } from "lucide-react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "@/context/theme";
import type { ThemeColors } from "@/constants/theme";
import { iw } from "@/shared/utils/responsive";
import { Layout } from "@/constants/layout";

const SWIPE_THRESHOLD = 60;
const SWIPE_MAX = 90;

type Props = {
  isMe: boolean;
  canSwipe: boolean;
  onSwipeReply: () => void;
  children: React.ReactNode;
};

export function SwipeableMessageRow({
  isMe,
  canSwipe,
  onSwipeReply,
  children,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const translateX = useSharedValue(0);
  const didCrossHaptic = useSharedValue(false);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-8, 8])
    .onBegin(() => {
      didCrossHaptic.value = false;
    })
    .onUpdate((e) => {
      if (!canSwipe) return;
      let x = e.translationX;
      if (isMe) {
        if (x > 0) x = 0;
        if (x < -SWIPE_MAX) x = -SWIPE_MAX;
      } else {
        if (x < 0) x = 0;
        if (x > SWIPE_MAX) x = SWIPE_MAX;
      }
      translateX.value = x;

      if (!didCrossHaptic.value && Math.abs(x) >= SWIPE_THRESHOLD) {
        didCrossHaptic.value = true;
        runOnJS(triggerHaptic)();
      }
    })
    .onEnd(() => {
      const crossed = Math.abs(translateX.value) >= SWIPE_THRESHOLD;
      if (crossed && canSwipe) {
        runOnJS(onSwipeReply)();
      }
      translateX.value = withSpring(0, {
        damping: 18,
        stiffness: 220,
      });
    });

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const iconStyle = useAnimatedStyle(() => {
    const travel = Math.abs(translateX.value);
    const progress = interpolate(
      travel,
      [10, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      opacity: progress,
      transform: [{ scale: 0.7 + progress * 0.3 }],
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.wrap}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.revealIcon,
            isMe ? styles.revealRight : styles.revealLeft,
            iconStyle,
          ]}
        >
          <CornerUpLeft
            size={iw(18)}
            color={colors.primary}
            strokeWidth={2.25}
          />
        </Animated.View>
        <Animated.View style={bubbleStyle}>{children}</Animated.View>
      </View>
    </GestureDetector>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  wrap: {
    position: "relative",
    maxWidth: "75%",
  },
  revealIcon: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: Layout.horizontal.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  revealLeft: {
    left: 0,
  },
  revealRight: {
    right: 0,
  },
});
