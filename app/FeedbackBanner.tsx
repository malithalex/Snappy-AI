// components/FeedbackBanner.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";

interface Props {
  visible: boolean;
  feedbackText: string;
  onHide?: () => void;
}

const FeedbackBanner = ({ visible, feedbackText, onHide }: Props) => {
  const translateY = useSharedValue(-100);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      });

      setTimeout(() => {
        translateY.value = withTiming(-100, {
          duration: 500,
          easing: Easing.in(Easing.cubic),
        });

        if (onHide) runOnJS(onHide)();
      }, 2500); // Auto-hide after 2.5s
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.bannerContainer, animatedStyle]}>
      <Text style={styles.bannerText}>{feedbackText}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    top: 0,
    width: "90%",
    backgroundColor: "#777",
    paddingVertical: 5,
    alignItems: "center",

    // justifyContent: "center",
    zIndex: 999,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  bannerText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default FeedbackBanner;
