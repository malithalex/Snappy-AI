import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  interpolate,
  Extrapolate,
  SharedValue,
  runOnJS,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const SIZE = Math.min(width, height) * 0.5;
const R = SIZE / 2;
const MATCH_THRESHOLD = 5;

interface Props {
  targetYaw: SharedValue<number>;
  targetPitch: SharedValue<number>;
  targetRoll: SharedValue<number>;
  currentYaw: SharedValue<number>;
  currentPitch: SharedValue<number>;
  currentRoll: SharedValue<number>;
  direction?: string;
  feedbackText: string;
  isVisible: SharedValue<number>;
}

const directions = [
  "up",
  "up-right",
  "right",
  "down-right",
  "down",
  "down-left",
  "left",
  "up-left",
];

const InlineOverlayReanimated = ({
  targetYaw,
  targetPitch,
  targetRoll,
  currentYaw,
  currentPitch,
  currentRoll,
  direction,
  isVisible,
  feedbackText,
}: Props) => {
  const opacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(isVisible.value, [0, 1], [0, 1], Extrapolate.CLAMP),
  }));

  useEffect(() => {
    console.log("Overlay received:", {
      targetYaw: targetYaw.value,
      targetPitch: targetPitch.value,
      targetRoll: targetRoll.value,
      currentYaw: currentYaw.value,
      currentPitch: currentPitch.value,
      currentRoll: currentRoll.value,
    });
  }, []);

  const yawDelta = useDerivedValue(() => currentYaw.value - targetYaw.value);
  const pitchDelta = useDerivedValue(
    () => currentPitch.value - targetPitch.value
  );
  const rollDelta = useDerivedValue(() => currentRoll.value - targetRoll.value);

  const centerDotStyle = useAnimatedStyle(() => ({
    backgroundColor:
      Math.abs(yawDelta.value) <= MATCH_THRESHOLD &&
      Math.abs(pitchDelta.value) <= MATCH_THRESHOLD &&
      Math.abs(rollDelta.value) <= MATCH_THRESHOLD
        ? "rgba(255,255,0,0.5)"
        : "rgba(255,255,255,0.3)",
  }));

  const getArrowColor = (dir: string) =>
    direction === dir ? "yellow" : "white";

  // Colors for adjustment arrows
  const YAW_COLOR = "#00ff00"; // green
  const PITCH_COLOR = "#8a2be2"; // purple
  const ROLL_COLOR = "#ffa500"; // orange
  const NEUTRAL_COLOR = "white";

  // Yaw adjustment arrows
  const yawLeftColor = useDerivedValue(() => {
    return yawDelta.value > MATCH_THRESHOLD ? YAW_COLOR : NEUTRAL_COLOR;
  });
  const yawRightColor = useDerivedValue(() => {
    return yawDelta.value < -MATCH_THRESHOLD ? YAW_COLOR : NEUTRAL_COLOR;
  });

  // Pitch adjustment arrows
  const pitchUpColor = useDerivedValue(() => {
    return pitchDelta.value < -MATCH_THRESHOLD ? PITCH_COLOR : NEUTRAL_COLOR;
  });
  const pitchDownColor = useDerivedValue(() => {
    return pitchDelta.value > MATCH_THRESHOLD ? PITCH_COLOR : NEUTRAL_COLOR;
  });

  // Roll adjustment arrows
  const rollLeftColor = useDerivedValue(() => {
    return rollDelta.value > MATCH_THRESHOLD ? ROLL_COLOR : NEUTRAL_COLOR;
  });
  const rollRightColor = useDerivedValue(() => {
    return rollDelta.value < -MATCH_THRESHOLD ? ROLL_COLOR : NEUTRAL_COLOR;
  });

  // Target values display
  const [targetText, setTargetText] = useState("");
  useDerivedValue(() => {
    const text = `Target: Yaw: ${targetYaw.value.toFixed(1)}°, Pitch: ${targetPitch.value.toFixed(1)}°, Roll: ${targetRoll.value.toFixed(1)}°`;
    runOnJS(setTargetText)(text);
  });

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, opacityStyle]}
      pointerEvents="none"
    >
      <View style={styles.center}>
        <View style={[styles.container, { width: SIZE, height: SIZE }]}>
          {/* Existing directional arrows */}
          <MaterialCommunityIcons
            name="arrow-up-bold"
            size={24}
            color={getArrowColor("up")}
            style={[styles.arrow, { top: -12, left: R - 12 }]}
          />
          <MaterialCommunityIcons
            name="arrow-up-right-bold"
            size={24}
            color={getArrowColor("up-right")}
            style={[styles.arrow, { top: -12, left: SIZE - 12 }]}
          />
          <MaterialCommunityIcons
            name="arrow-right-bold"
            size={24}
            color={getArrowColor("right")}
            style={[styles.arrow, { top: R - 12, left: SIZE - 12 }]}
          />
          <MaterialCommunityIcons
            name="arrow-right-bottom-bold"
            size={24}
            color={getArrowColor("down-right")}
            style={[styles.arrow, { top: SIZE - 12, left: SIZE - 12 }]}
          />
          <MaterialCommunityIcons
            name="arrow-down-bold"
            size={24}
            color={getArrowColor("down")}
            style={[styles.arrow, { top: SIZE - 12, left: R - 12 }]}
          />
          <MaterialCommunityIcons
            name="arrow-left-bottom-bold"
            size={24}
            color={getArrowColor("down-left")}
            style={[styles.arrow, { top: SIZE - 12, left: -12 }]}
          />
          <MaterialCommunityIcons
            name="arrow-left-bold"
            size={24}
            color={getArrowColor("left")}
            style={[styles.arrow, { top: R - 12, left: -12 }]}
          />
          <MaterialCommunityIcons
            name="arrow-up-left-bold"
            size={24}
            color={getArrowColor("up-left")}
            style={[styles.arrow, { top: -12, left: -12 }]}
          />

          {/* New adjustment arrows */}
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={yawLeftColor.value}
            style={{ position: "absolute", left: 20, top: R - 12 }}
          />
          <MaterialCommunityIcons
            name="arrow-right"
            size={24}
            color={yawRightColor.value}
            style={{ position: "absolute", left: SIZE - 44, top: R - 12 }}
          />
          <MaterialCommunityIcons
            name="arrow-up"
            size={24}
            color={pitchUpColor.value}
            style={{ position: "absolute", left: R - 12, top: 20 }}
          />
          <MaterialCommunityIcons
            name="arrow-down"
            size={24}
            color={pitchDownColor.value}
            style={{ position: "absolute", left: R - 12, top: SIZE - 44 }}
          />
          <MaterialCommunityIcons
            name="rotate-left"
            size={24}
            color={rollLeftColor.value}
            style={{ position: "absolute", left: 20, top: 20 }}
          />
          <MaterialCommunityIcons
            name="rotate-right"
            size={24}
            color={rollRightColor.value}
            style={{ position: "absolute", left: SIZE - 44, top: SIZE - 44 }}
          />

          <Animated.View style={[styles.centerDot, centerDotStyle]} />
        </View>
      </View>
      <Text style={styles.targetText}>{targetText}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { alignItems: "center", justifyContent: "center" },
  arrow: { position: "absolute", width: 24, height: 24 },
  centerDot: { position: "absolute", width: 12, height: 12, borderRadius: 6 },
  targetText: {
    position: "absolute",
    bottom: 10,
    left: 20,
    color: "white",
    fontSize: 14,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 5,
    borderRadius: 5,
  },
});

export default InlineOverlayReanimated;
