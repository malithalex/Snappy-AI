// InlineOverlayReanimated.tsx
import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  SharedValue,
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
}

const InlineOverlayReanimated = ({
  targetYaw,
  targetPitch,
  targetRoll,
  currentYaw,
  currentPitch,
  currentRoll,
}: Props) => {
  const getRingStyle = (value: SharedValue<number>, axis: "X" | "Y" | "Z") => {
    return useAnimatedStyle(() => {
      const angle = interpolate(
        value.value,
        [-360, 360],
        [-360, 360],
        Extrapolate.CLAMP
      );

      const transformStyle: any[] = [{ perspective: 800 }];
      if (axis === "X") transformStyle.push({ rotateX: `${angle}deg` });
      else if (axis === "Y") transformStyle.push({ rotateY: `${angle}deg` });
      else if (axis === "Z") transformStyle.push({ rotateZ: `${angle}deg` });

      return { transform: transformStyle };
    }, [value]);
  };

  const yawMatch = useAnimatedStyle(() => ({
    borderColor:
      Math.abs(currentYaw.value - targetYaw.value) <= MATCH_THRESHOLD
        ? "rgba(0,128,0,0.3)"
        : "#00ff00",
  }));

  const pitchMatch = useAnimatedStyle(() => ({
    borderColor:
      Math.abs(currentPitch.value - targetPitch.value) <= MATCH_THRESHOLD
        ? "rgba(128,0,128,0.3)"
        : "#8a2be2",
  }));

  const rollMatch = useAnimatedStyle(() => ({
    borderColor:
      Math.abs(currentRoll.value - targetRoll.value) <= MATCH_THRESHOLD
        ? "rgba(255,165,0,0.3)"
        : "#ffa500",
  }));

  const centerDotStyle = useAnimatedStyle(() => ({
    backgroundColor:
      Math.abs(currentYaw.value) <= MATCH_THRESHOLD &&
      Math.abs(currentPitch.value) <= MATCH_THRESHOLD &&
      Math.abs(currentRoll.value) <= MATCH_THRESHOLD
        ? "rgba(255,255,0,0.5)"
        : "rgba(255,255,255,0.3)",
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.center}>
        <View style={[styles.container, { width: SIZE, height: SIZE }]}>
          <View
            style={[
              styles.sphere,
              {
                width: SIZE,
                height: SIZE,
                borderRadius: R,
                backgroundColor: "rgba(255,255,255,0.1)",
                borderColor: "rgba(255,255,255,0.4)",
              },
            ]}
          />

          <Animated.View
            style={[
              styles.ring,
              {
                width: SIZE - 20,
                height: SIZE - 20,
                borderRadius: (SIZE - 20) / 2,
              },
              getRingStyle(targetYaw, "Y"),
              yawMatch,
            ]}
          />

          <Animated.View
            style={[
              styles.ring,
              {
                width: SIZE - 40,
                height: SIZE - 40,
                borderRadius: (SIZE - 40) / 2,
              },
              getRingStyle(targetPitch, "X"),
              pitchMatch,
            ]}
          />

          <Animated.View
            style={[
              styles.ring,
              {
                width: SIZE - 60,
                height: SIZE - 60,
                borderRadius: (SIZE - 60) / 2,
              },
              getRingStyle(targetRoll, "Z"),
              rollMatch,
            ]}
          />

          <MaterialCommunityIcons
            name="arrow-up-bold"
            size={24}
            color="white"
            style={[styles.arrow, { top: -12, left: R - 12 }]}
          />
          <MaterialCommunityIcons
            name="arrow-up-right-bold"
            size={24}
            color="white"
            style={[styles.arrow, { top: -12, left: SIZE - 12 }]}
          />
          <MaterialCommunityIcons
            name="arrow-right-bold"
            size={24}
            color="white"
            style={[styles.arrow, { top: R - 12, left: SIZE - 12 }]}
          />
          <MaterialCommunityIcons
            name="arrow-down-right-bold"
            size={24}
            color="white"
            style={[styles.arrow, { top: SIZE - 12, left: SIZE - 12 }]}
          />
          <MaterialCommunityIcons
            name="arrow-down-bold"
            size={24}
            color="white"
            style={[styles.arrow, { top: SIZE - 12, left: R - 12 }]}
          />
          <MaterialCommunityIcons
            name="arrow-down-left-bold"
            size={24}
            color="white"
            style={[styles.arrow, { top: SIZE - 12, left: -12 }]}
          />
          <MaterialCommunityIcons
            name="arrow-left-bold"
            size={24}
            color="white"
            style={[styles.arrow, { top: R - 12, left: -12 }]}
          />
          <MaterialCommunityIcons
            name="arrow-up-left-bold"
            size={24}
            color="white"
            style={[styles.arrow, { top: -12, left: -12 }]}
          />

          <Animated.View style={[styles.centerDot, centerDotStyle]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { alignItems: "center", justifyContent: "center" },
  sphere: { position: "absolute", borderWidth: 2 },
  ring: {
    position: "absolute",
    borderWidth: 4,
    backgroundColor: "transparent",
  },
  arrow: { position: "absolute", width: 24, height: 24 },
  centerDot: { position: "absolute", width: 12, height: 12, borderRadius: 6 },
});

export default InlineOverlayReanimated;

