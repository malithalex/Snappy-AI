import React, { useState } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { TouchableHighlight } from "react-native-gesture-handler";
import Animated, { BounceIn, SharedValue } from "react-native-reanimated";

const MIN_ZOOM = 1;
const MAX_ZOOM = 128;
const NEUTRAL_ZOOM = 1;
const zoomOptions = [1, 2, 3, 4, 5, 6, 7, 8];

export default function ZoomControls({
  zoom, // SharedValue for zoom
  setShowZoomControls,
}: {
  zoom: SharedValue<number>;
  setShowZoomControls: (show: boolean) => void;
}) {
  const [activeZoom, setActiveZoom] = useState<number>(NEUTRAL_ZOOM); // Track the active zoom level
  const radius = 35;
  const { height } = useWindowDimensions();

  // Handle Zoom button press
  const handleZoomPress = (zoomFactor: number) => {
    // Only update zoom if this is the newly selected (active) zoom level
    const newZoom = Math.min(Math.max(zoomFactor, MIN_ZOOM), MAX_ZOOM);
    setActiveZoom(newZoom); // Update the active zoom state
    zoom.value = newZoom; // Update the SharedValue directly
  };

  // Close zoom controls
  const closeZoomControls = () => {
    setShowZoomControls(false);
  };

  return (
    <View style={styles.container}>
      {zoomOptions.map((z, i) => {
        const angle =
          (i / zoomOptions.length) * 2 * Math.PI - Math.PI / 2 + Math.PI / 3;
        const x = Math.cos(angle) * radius + 70;
        const y = Math.sin(angle) * radius + -320;
        const isActive = activeZoom === z; // Check if this zoom level is active

        return (
          <Animated.View
            key={i}
            entering={BounceIn.delay(i)}
            style={{
              position: "absolute",
              left: x,
              top: y,
            }}
          >
            <TouchableHighlight
              onPress={() => handleZoomPress(z)}
              style={{
                width: 20,
                height: 20,
                borderRadius: 25,
                backgroundColor: isActive
                  ? "#ffffff"
                  : "rgba(31, 91, 141, 0.56)",
                justifyContent: "center",
                alignItems: "center",
                marginHorizontal: 10,
              }}
            >
              <Text
                style={{
                  color: isActive ? "black" : "black",
                  fontWeight: "600",
                  fontSize: 10,
                }}
              >
                {z}x
              </Text>
            </TouchableHighlight>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});
