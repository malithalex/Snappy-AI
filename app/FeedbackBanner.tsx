import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface Props {
  visible: boolean;
  feedbackText: string;
  // directionText: string;
  onHide: () => void;
}

const FeedbackBanner: React.FC<Props> = ({ visible, feedbackText, onHide }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(visible ? 1 : 0, { duration: 300 }),
    transform: [
      { translateY: withTiming(visible ? 0 : -50, { duration: 300 }) },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.text}>{feedbackText}</Text>
      <TouchableOpacity style={styles.closeButton} onPress={onHide}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Helper function to generate direction text (export this separately if needed)
export const getDirectionText = (
  yaw: number,
  pitch: number,
  roll: number
): string => {
  const instructions: string[] = [];

  // Yaw adjustments
  if (Math.abs(yaw) > 5) {
    const direction = yaw > 0 ? "right" : "left";
    instructions.push(`Rotate ${direction} ${Math.abs(yaw).toFixed(1)}°`);
  }

  // Pitch adjustments
  if (Math.abs(pitch) > 5) {
    const direction = pitch > 0 ? "down" : "up";
    instructions.push(`Tilt ${direction} ${Math.abs(pitch).toFixed(1)}°`);
  }

  // Roll adjustments
  if (Math.abs(roll) > 5) {
    const direction = roll > 0 ? "left" : "right";
    instructions.push(`Lean ${direction} ${Math.abs(roll).toFixed(1)}°`);
  }

  return instructions.length > 0
    ? `Adjust your device:\n${instructions.join("\n")}`
    : "Perfect position! Hold steady";
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(49, 49, 49, 0.9)",
    padding: 5,
    marginHorizontal: 20,
    marginTop: 53,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  text: {
    color: "#fff",
    fontSize: 12,
    flex: 1,
    lineHeight: 10,
  },
  closeButton: {
    padding: 4,
    marginLeft: 20,
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default FeedbackBanner;



