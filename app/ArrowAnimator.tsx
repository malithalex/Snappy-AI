// ArrowAnimator.tsx

import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ArrowAnimatorProps {
  dx: number; // e.g., how many px to move left/right
  dy: number; // e.g., how many px to move up/down
  feedback?: string; // optional text from backend
  visible: boolean; // toggles whether to show/hide the arrows
}

/**
 * Displays up to 8 directional arrows (top, top-right, right, bottom-right,
 * bottom, bottom-left, left, top-left) based on dx/dy feedback from the AI.
 */
const ArrowAnimator: React.FC<ArrowAnimatorProps> = ({
  dx,
  dy,
  feedback,
  visible,
}) => {
  // fadeAnim to fade in/out
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate in or out
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  // Pick a threshold in px to consider “significant.” Could be 30, 50, etc.
  const threshold = 50;

  // 8-direction checks
  // e.g., upLeft means dx < -50 AND dy < -50
  const up = dy < -threshold && Math.abs(dx) < threshold;
  const down = dy > threshold && Math.abs(dx) < threshold;
  const left = dx < -threshold && Math.abs(dy) < threshold;
  const right = dx > threshold && Math.abs(dy) < threshold;

  const upLeft = dx < -threshold && dy < -threshold;
  const upRight = dx > threshold && dy < -threshold;
  const downLeft = dx < -threshold && dy > threshold;
  const downRight = dx > threshold && dy > threshold;

  return (
    <Animated.View
      style={[styles.container, { opacity: fadeAnim }]}
      pointerEvents="none"
    >
      {/* Optional text feedback from backend */}
      {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}

      {/* 1. Up */}
      {up && (
        <View style={[styles.arrowWrapper, { top: 0, alignSelf: "center" }]}>
          <Ionicons name="arrow-up-circle" size={48} color="white" />
        </View>
      )}
      {/* 2. Down */}
      {down && (
        <View style={[styles.arrowWrapper, { bottom: 0, alignSelf: "center" }]}>
          <Ionicons name="arrow-down-circle" size={48} color="white" />
        </View>
      )}
      {/* 3. Left */}
      {left && (
        <View style={[styles.arrowWrapper, { left: 0, alignSelf: "center" }]}>
          <Ionicons name="arrow-back-circle" size={48} color="white" />
        </View>
      )}
      {/* 4. Right */}
      {right && (
        <View style={[styles.arrowWrapper, { right: 0, alignSelf: "center" }]}>
          <Ionicons name="arrow-forward-circle" size={48} color="white" />
        </View>
      )}
      {/* 5. Up-Left */}
      {upLeft && (
        <View style={[styles.arrowWrapper, { top: 0, left: 0 }]}>
          <Ionicons name="arrow-up-circle" size={48} color="white" />
        </View>
      )}
      {/* 6. Up-Right */}
      {upRight && (
        <View style={[styles.arrowWrapper,{ top: 0, right: 0 }]}>
          <Ionicons name="arrow-up-circle" size={48} color="white" />
        </View>
      )}
      {/* 7. Down-Left */}
      {downLeft && (
        <View style={[styles.arrowWrapper, { bottom: 0, left: 0 }]}>
          <Ionicons name="arrow-down-circle" size={48} color="white" />
        </View>
      )}
      {/* 8. Down-Right */}
      {downRight && (
        <View style={[styles.arrowWrapper, { bottom: 0, right: 0 }]}>
          <Ionicons name="arrow-down-circle" size={48} color="white" />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Full-screen overlay
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // So any middle content will be centered
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  feedbackText: {
    position: "absolute",
    top: 80,
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginHorizontal: 20,
  },
  arrowWrapper: {
    position: "absolute",
    margin: 20,
  },
});

export default ArrowAnimator;
