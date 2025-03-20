import React from "react";
import {
  Platform,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { TouchableHighlight } from "react-native-gesture-handler";
import Animated, { BounceIn } from "react-native-reanimated";

const exposureOptionsAndroid = [-20, -10, -5, 0, 5, 10, 20];
const exposureOptionsIOS = [-3, -2, -1, 0, 1, 2, 3];
const exposureOptions =
  Platform.OS === "android" ? exposureOptionsAndroid : exposureOptionsIOS;

export default function ExposureControls({
  setExposure,
  setShowExposureControls,
  exposure,
}: {
  setExposure: (exposure: number) => void;
  setShowExposureControls: (show: boolean) => void;
  exposure: number;
}) {
  const { width, height } = useWindowDimensions();
  const radius = Math.min(width, height - 100) * 0.35;

  const handleExposurePress = (exposureValue: number) => {
    setExposure(exposureValue);
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {/* {exposureOptions.map((exp, i) => {
        const angle =
          (i / exposureOptions.length / 3) * 2 * Math.PI - Math.PI / 2;
        const x = width - Math.cos(angle) * radius - 90; // Align to the right
        const y = Math.sin(angle) * radius + height / 4; */}

      {exposureOptions.map((exp, i) => {
        const totalArc = (2 * Math.PI) / 2;
        // const angle =
        //   ((i / zoomOptions.length /2) * 20 * Math.PI) / Math.PI / 2;
        const angle =
          (i / exposureOptions.length) * 2 * Math.PI -
          Math.PI / 2 +
          Math.PI / 3; // Start at 3 o'clock
        const radius = 35;
        const x = Math.cos(angle) * radius + 220;
        const y = Math.sin(angle) * radius + -320;

        return (
          <Animated.View
            key={i}
            entering={BounceIn.delay(i * 100)}
            style={{
              position: "absolute",
              left: x,
              top: y,
            }}
          >
            <TouchableHighlight
              onPress={() => handleExposurePress(exp)}
              style={{
                width: 20,
                height: 20,
                borderRadius: 25,
                backgroundColor:
                  exposure === exp ? "#ffffff" : "rgba(31, 91, 141, 0.56)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: exposure === exp ? "black" : "white",
                  fontWeight: "600",
                  fontSize: 10,
                }}
              >
                {exp > 0 ? `+${exp}` : exp}
              </Text>
            </TouchableHighlight>
          </Animated.View>
        );
      })}
      {/* <TouchableOpacity
        onPress={() => setShowExposureControls(false)}
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: "#ffffff30",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          right: 30,
          top: height / 4,
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>X</Text>
      </TouchableOpacity> */}
    </View>
  );
}
