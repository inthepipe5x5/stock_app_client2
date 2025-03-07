import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { DefaultStyle } from "react-native-reanimated/lib/typescript/hook/commonTypes";

type AnimatedTextProps = {
  animatedText?: string | number;
  animationRunAmount?: number;
  transformProps?: Array<{ [key: string]: any }> | DefaultStyle;
};

export function AnimatedText({
  animatedText,
  animationRunAmount,
  transformProps,
}: AnimatedTextProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      animationRunAmount ?? -1, // -1 means infinite repetition
      false // Don't reverse the animation
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    if (transformProps) {
      return {
        transform: transformProps.map((prop) => ({
          [Object.keys(prop)[0]]: prop[Object.keys(prop)[0]],
        })),
      };
    }
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <ThemedText style={styles.text}>{animatedText ?? "🌎"}</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});
