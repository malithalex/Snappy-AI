import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Use any icon library of your choice
import ZoomController from "@/components/ZoomControls";
import { StatusBar } from "expo-status-bar";
import ZoomControls from "@/components/ZoomControls";
import {
  Camera,
  useCameraDevice,
  useCameraDevices,
  useCameraPermission,
} from "react-native-vision-camera";
import { Redirect, useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import ObscuraButton from "@/components/ObscuraButton";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  PanGestureHandler,
} from "react-native-gesture-handler";
import * as MediaLibrary from "expo-media-library";
import MediaScreen from "./media";
import ExposureControls from "@/components/ExposureControls";
// import CustomizedSlider from "@/components/LevelControl";

const HomeScreen = () => {
  const [focus, setFocus] = useState(0.5); // Default focus value
  const [aiMode, setAiMode] = useState(false); // Toggle AI mode
  const [angleMode, setAngleMode] = useState(false); // Toggle 360 angle mode
  const { hasPermission } = useCameraPermission();
  const microphonePermission = Camera.getMicrophonePermissionStatus();
  const [showZoomControls, setShowZoomControls] = React.useState(false);
  const [showExposureControls, setShowExposureControls] = React.useState(false);
  const { width } = useWindowDimensions();

  const camera = React.useRef<Camera>(null);
  const devices = useCameraDevices();
  const [cameraPosition, setCameraPosition] = React.useState<"front" | "back">(
    "back"
  );
  const device = useCameraDevice(cameraPosition);
  const [zoom, setZoom] = React.useState(device?.neutralZoom);
  const [exposure, setExposure] = React.useState(0);
  const [flash, setFlash] = React.useState<"off" | "on">("off");
  const [torch, setTorch] = React.useState<"off" | "on">("off");
  const redirectToPermissions =
    !hasPermission || microphonePermission === "not-determined";

  const router = useRouter();

  const takePicture = async () => {
    try {
      if (camera.current == null) throw new Error("Camera ref is null!");

      // Request permission to access media library (to save the photo)
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access media library is required to save photos.");
        return;
      }

      console.log("Taking photo...");
      const photo = await camera.current.takePhoto({
        flash: flash,
        enableShutterSound: false,
      });

      // Save photo to gallery automatically without navigating to the media screen
      await MediaLibrary.saveToLibraryAsync(photo.path);
      console.log("Photo saved to gallery:", photo.path);

      // Optionally show an alert or provide feedback to the user
      // alert("Photo saved to gallery!");
    } catch (e) {
      console.error("Failed to take photo or save!", e);
      alert("Failed to save the photo. Please try again.");
    }
  };

  const toggleAiMode = () => setAiMode(!aiMode);
  const toggleAngleMode = () => setAngleMode(!angleMode);
  const toggleZoomControls = () => setShowZoomControls(!showZoomControls);

  if (redirectToPermissions) return <Redirect href={"/permissions"} />;
  if (!device) return <></>;

  // Draggable Panel State and Gesture
  const panelHeight = useSharedValue(0); // 0 = hidden, full height when dragged up
  const MAX_PANEL_HEIGHT = 300; // Adjust this value to set the panel's maximum height
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      panelHeight.value = Math.max(
        0,
        Math.min(event.translationY + MAX_PANEL_HEIGHT, MAX_PANEL_HEIGHT)
      );
    })
    .onEnd(() => {
      if (panelHeight.value > MAX_PANEL_HEIGHT / 2) {
        panelHeight.value = withTiming(MAX_PANEL_HEIGHT, { duration: 200 });
      } else {
        panelHeight.value = withTiming(0, { duration: 120 });
      }
    });

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: panelHeight.value }],
  }));

  return (
    <>
      <View style={styles.container}>
        <StatusBar />
        <SafeAreaView style={styles.container}>
          {/* Full-Screen Camera */}
          <View style={StyleSheet.absoluteFillObject}>
            <Camera
              ref={camera}
              style={StyleSheet.absoluteFillObject}
              photo={true}
              zoom={zoom}
              device={device!}
              isActive={true}
              resizeMode="cover"
              preview={true}
              exposure={exposure}
              torch={torch}
            />
            <BlurView
              intensity={100}
              tint="dark"
              style={{
                position: "absolute",
                bottom: 10,
                right: 10,
                padding: 10,
              }}
              experimentalBlurMethod="dimezisBlurView"
            ></BlurView>
          </View>
          {/* <ScrollView
            horizontal={false}
            showsHorizontalScrollIndicator={false} // Hide the scroll indicator for a cleaner look
            style={styles.modeSelectionScroll}
            contentContainerStyle={styles.modeSelectionContent}
          > */}
            <View style={styles.modeSelection}>
              <TouchableOpacity style={styles.modeButton}>
                <Text style={styles.modeText}>Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modeButton}>
                <Text style={styles.modeText}>Video</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modeButton}>
                <Text style={styles.modeText}>Portrait</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modeButton}>
                <Text style={styles.modeText}>Panorama</Text>
              </TouchableOpacity>
            </View>
          {/* </ScrollView> */}
          <View style={styles.sliderContainer}>
            {showZoomControls ? (
              <ZoomControls
                setZoom={setZoom}
                setShowZoomControls={setShowZoomControls}
                zoom={zoom ?? 1}
              />
            ) : null}
          </View>
          <View style={styles.sliderContainerexposure}>
            {showExposureControls ? (
              <ExposureControls
                setExposure={setExposure}
                setShowExposureControls={setShowExposureControls}
                exposure={exposure ?? 1}
              />
            ) : null}
          </View>

          <View style={styles.flashContainer}>
            <ObscuraButton
              iconName={flash === "on" ? "flash-sharp" : "flash-off-sharp"}
              onPress={() => setFlash((f) => (f === "off" ? "on" : "off"))}
              containerStyle={{ alignSelf: "center" }}
            />
          </View>

          <View style={styles.settingsContainer}>
            <ObscuraButton
              iconName="magnet-sharp"
              onPress={() => setShowZoomControls((s) => !s)}
              containerStyle={{ alignSelf: "center" }}
            />
          </View>
          <View style={styles.exposureContainer}>
            <ObscuraButton
              iconName="eye-sharp"
              onPress={() => setShowExposureControls((s) => !s)}
              containerStyle={{ alignSelf: "center" }}
            />
          </View>

          <View style={styles.captureButtonContainer}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <Ionicons name="camera" size={48} color="white" />
            </TouchableOpacity>
          </View>

          {/* Draggable Panel */}
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.draggablePanel, panelStyle]}>
              <View style={styles.panelHandle} />
              <View style={styles.toggleContainer}>
                <Text style={styles.texts}>AI Mode</Text>
                <Switch
                  style={styles.switchs}
                  value={aiMode}
                  onValueChange={toggleAiMode}
                />
                <Text style={styles.texttip}>{aiMode ? "ON" : "OFF"}</Text>
              </View>
              <View style={styles.toggleContainer}>
                <Text style={styles.texts}>360° Angle Mode</Text>
                <Switch value={angleMode} onValueChange={toggleAngleMode} />
                <Text style={styles.texttip}>{angleMode ? "ON" : "OFF"}</Text>
              </View>
              <View>
                <Text
                  style={{
                    color: "white",
                  }}
                >
                  Exposure: {exposure} | Zoom: x{zoom}
                </Text>
              </View>
            </Animated.View>
          </GestureDetector>
        </SafeAreaView>
      </View>
    </>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
    paddingTop: 20,
    paddingBottom: 40,
  },
  cameraFeed: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  focusArea: {
    width: 150,
    height: 150,
    borderColor: "red",
    borderWidth: 2,
    position: "absolute",
  },
  modeSelection: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 130,
    width: "100%",
  },
  // Updated styles for ScrollView
  modeSelectionScroll: {
    position: "absolute",
    bottom: 130,
    width: "100%",
  },
  modeSelectionContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 10, // Add padding for better scrolling
  },
  modeButton: {
    backgroundColor: "rgb(255, 255, 255)",
    padding: 5,
    borderRadius: 35,
  },
  modeText: {
    color: "black",
    fontSize: 16,
  },
  sliderContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sliderContainerexposure: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  slider: {
    width: "100%",
    height: 40,
    marginBottom: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    marginHorizontal: 20,
    bottom: -140,
    justifyContent: "flex-end",
  },
  flashContainer: {
    position: "absolute",
    top: 50,
    right: 20,
  },
  settingsContainer: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  exposureContainer: {
    position: "absolute",
    top: 110,
    // left: 20,
    right: 20,
  },
  captureButtonContainer: {
    alignItems: "center",
    marginBottom: 40,
    bottom: -35,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgb(26, 110, 158)",
    justifyContent: "center",
    alignItems: "center",
  },
  texts: { color: "white", fontSize: 10 },
  texttip: { color: "white", fontSize: 7 },
  switchs: { shadowColor: "white" },

  // Draggable Panel Styles
  draggablePanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 300, // Maximum height when fully expanded
    backgroundColor: "rgb(0, 0, 0)",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    zIndex: 100, // Highest zIndex to stay on top
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // For Android shadow
  },
  panelHandle: {
    width: 40,
    height: 4,
    backgroundColor: "white",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
  },
});

export default HomeScreen;
