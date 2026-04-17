import { useRef, useEffect } from "react";
import { Animated } from "react-native";

/**
 * Creates N staggered fade+slide-up animations and starts them on mount.
 * Returns the array of Animated.Values and a helper to build the style.
 */
export function useFadeSlideAnims(count: number, staggerMs = 80) {
  const anims = useRef<Animated.Value[]>(
    Array.from({ length: count }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animations = anims.map((anim) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 480,
        useNativeDriver: true,
      })
    );
    Animated.stagger(staggerMs, animations).start();
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

  return { anims, animStyle };
}
