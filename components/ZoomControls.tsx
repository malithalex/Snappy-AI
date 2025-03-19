import {
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { TouchableHighlight } from "react-native-gesture-handler";
import Animated, { BounceIn } from "react-native-reanimated";
import { useState } from "react";

const MIN_ZOOM = 1;
const MAX_ZOOM = 128;
const NEUTRAL_ZOOM = 1;
const zoomOptions = [1, 2, 3, 4, 5, 6, 7, 8];

export default function ZoomControls({
  setZoom,
  setShowZoomControls,
  zoom,
}: {
  setZoom: (zoom: number) => void;
  setShowZoomControls: (show: boolean) => void;
  zoom: number;
}) {
  const [showSettingsIcon, setShowSettingsIcon] = useState(true);
  const radius = 100; // Circle radius for zoom controls layout
  const angleStart = Math.PI / 4; // 45 degrees
  const angleEnd = Math.PI / 2; // 90 degrees
  const { width, height } = useWindowDimensions();

  // Handle Zoom button press
  const handleZoomPress = (zoomFactor: number) => {
    if (zoomFactor === -1) {
      setZoom(NEUTRAL_ZOOM); // Reset to neutral zoom
    } else {
      const newZoom = Math.min(Math.max(zoomFactor, MIN_ZOOM), MAX_ZOOM);
      setZoom(newZoom); // Set zoom level
    }
  };

  // Close zoom controls when "X" is pressed
  const closeZoomControls = () => {
    setShowZoomControls(false); // Hide zoom controls
    setShowSettingsIcon(true); // Show settings button again
  };

  // Toggle between settings icon and "X"
  const toggleSettingsIcon = () => {
    setShowSettingsIcon(!showSettingsIcon); // Toggle between "Settings" and "X"
  };

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {/* {zoomOptions.map((z, i) => {
        // const angle =
        //   angleStart + (i / (zoomOptions.length / 2)) * (angleEnd - angleStart); // Calculating angle for each zoom option
        // const x = Math.cos(angle) * radius + 45 // Adjust left position
        // const y = Math.sin(angle) * radius + 30; // Adjust top position

        // const angle = (i / zoomOptions.length / 2) * 2 * Math.PI - Math.PI / 2; // Start at 12 o'clock
        // const x = Math.cos(angle) * radius + 40;
        // const y = Math.sin(angle) * radius + height / 4;

        // const angle =
        //   (i / zoomOptions.length / 3) * 2 * Math.PI -
        //   Math.PI / 2 +
        //   Math.PI / 3; // Start at 3 o'clock
        const angle =
          ((i / zoomOptions.length / 3) * 20 * Math.PI) / Math.PI / 2; // Slightly adjust to tighten the curve
        // const angle = ((i / zoomOptions.length) * Math.PI) / 2 - Math.PI ;
        const radius = 60; // Smaller radius to bring controls closer to the "X"
        const x = Math.cos(angle) * radius + 40; // Adjust X position
        const y = Math.sin(angle) * radius - 360; // Adjust Y position */}

      {zoomOptions.map((z, i) => {
        const totalArc = (2 * Math.PI) / 2;
        // const angle =
        //   ((i / zoomOptions.length /2) * 20 * Math.PI) / Math.PI / 2;
        const angle =
          (i / zoomOptions.length ) * 2 * Math.PI -
          Math.PI / 2 +
          Math.PI / 3; // Start at 3 o'clock
        const radius = 35;
        const x = Math.cos(angle) * radius + 70;
        const y = Math.sin(angle) * radius + -320;

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
                backgroundColor:
                  zoom === z ? "#ffffff" : "rgba(31, 91, 141, 0.56)",
                justifyContent: "center",
                alignItems: "center",
                marginHorizontal: 10,
              }}
            >
              <Text
                style={{
                  color: zoom === z ? "black" : "black",
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

      {/* Close Zoom Controls Button */}
      {/* <TouchableOpacity
        onPress={closeZoomControls}
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: "#ffffff30",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          left: 30,
          top: 30, // Top-left position
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>X</Text>
      </TouchableOpacity> */}

      {/* Settings Icon Button */}
      {/* {showSettingsIcon && (
        <TouchableOpacity
          onPress={toggleSettingsIcon}
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: "#ffffff30",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            left: 30,
            top: 30, // Top-left position
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Settings</Text>
        </TouchableOpacity>
      )} */}
    </View>
  );
}
