// FocusBox.tsx
import React from "react";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

interface FocusBoxProps {
  focusX: Animated.SharedValue<number>;
  focusY: Animated.SharedValue<number>;
  focusWidth: Animated.SharedValue<number>;
  focusHeight: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
}

const FocusBox: React.FC<FocusBoxProps> = ({
  focusX,
  focusY,
  focusWidth,
  focusHeight,
  opacity,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      left: focusX.value,
      top: focusY.value,
      width: focusWidth.value,
      height: focusHeight.value,
      opacity: opacity.value,
      borderWidth: 2,
      borderColor: "red",
      backgroundColor: "rgba(255, 0, 0, 0.3)",
    };
  });

  return <Animated.View style={animatedStyle} />;
};

export default FocusBox;
