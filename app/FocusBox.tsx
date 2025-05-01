import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface FocusBoxWithCaptionProps {
  focusX: SharedValue<number>;
  focusY: SharedValue<number>;
  focusWidth: SharedValue<number>;
  focusHeight: SharedValue<number>;
  opacity: SharedValue<number>;
  caption: string;
}

const FocusBoxWithCaption = ({
  focusX,
  focusY,
  focusWidth,
  focusHeight,
  opacity,
  caption,
}: FocusBoxWithCaptionProps) => {
  const focusBoxStyle = useAnimatedStyle(() => ({
    position: "absolute",
    width: focusWidth.value,
    height: focusHeight.value,
    borderWidth: 2,
    borderColor: "red",
    transform: [
      { translateX: focusX.value - focusWidth.value / 2 },
      { translateY: focusY.value - focusHeight.value / 2 },
    ],
    opacity: opacity.value,
  }));

  const captionStyle = useAnimatedStyle(() => ({
    position: "absolute",
    top: focusY.value - focusHeight.value / 2 - 20, // 20px above focus box
    left: focusX.value - focusWidth.value / 2,
    fontSize: 8,
    color: "white",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 2,
    borderRadius: 2,
    opacity: withTiming(caption ? opacity.value : 0, { duration: 200 }),
  }));

  return (
    <>
      <Animated.View style={focusBoxStyle} />
      {caption && <Animated.Text style={captionStyle}>{caption}</Animated.Text>}
    </>
  );
};

export default FocusBoxWithCaption;
