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
import { Redirect, router, useRouter } from "expo-router";
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
import CameraNavPanel from "./CameranavPanel";
// import CameraNavPanel from "./navpannel";
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
  const router = useRouter();

  const [selectedMode, setSelectedMode] = useState<string>("Photo");

  // const [syncRotate] = useState(new Animated.Value(0));

  const camera = React.useRef<Camera>(null);
  // const devices = useCameraDevices();
  const [cameraPosition, setCameraPosition] = React.useState<"front" | "back">(
    "back"
  );
  // Function to open the gallery
  const [isCameraActive, setIsCameraActive] = useState(true);

  const openGallery = () => {
    setIsCameraActive(false); // Disable the camera
    router.push("/media"); // Navigate to MediaScreen
  };

  const devices = useCameraDevices();
  const [cameraType, setCameraType] = useState<"back" | "front">("back");

  // Toggle the camera type (front/back)
  const toggleCameraType = () => {
    setCameraType((prev) => (prev === "back" ? "front" : "back"));
  };

  // Select the appropriate device based on cameraType.
  const device = devices.find((d) => d.position === cameraType);

  const [zoom, setZoom] = React.useState(device?.neutralZoom);
  const [exposure, setExposure] = React.useState(0);
  const [flash, setFlash] = React.useState<"off" | "on">("off");
  const [torch, setTorch] = React.useState<"off" | "on">("off");
  const redirectToPermissions =
    !hasPermission || microphonePermission === "not-determined";

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
  if (!device) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Camera...</Text>
      </View>
    );
  }

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
              isActive={isCameraActive} // Camera is disabled when opening gallery
              // isActive={true}
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

          <View style={styles.modeSelection}>
            {["Photo", "Video", "Portrait", "Panorama"].map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.modeButton,
                  { backgroundColor: selectedMode === mode ? "#559" : "white" },
                ]}
                onPress={() => setSelectedMode(mode)}
              >
                <Text
                  style={[
                    styles.modeText,
                    { color: selectedMode === mode ? "white" : "black" },
                  ]}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
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
            <TouchableOpacity>
              <Ionicons
                name="images-outline"
                size={width * 0.09}
                color="white"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <Ionicons name="camera" size={48} color="white" />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleCameraType}>
              <Ionicons name="sync-circle" size={width * 0.115} color="white" />
            </TouchableOpacity>
          </View>
          {/* Draggable Panel */}
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.draggablePanel, panelStyle]}>
              <View style={styles.panelHandle} />
              <View>
                {/* <CameraNavPanel /> */}
                <CameraNavPanel
                  onSyncPress={toggleCameraType}
                  selectedModeprop={selectedMode}
                  onModeChange={setSelectedMode}
                />
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
    paddingTop: 40,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  captureAndSyncContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  loadingText: { color: "white", fontSize: 18 },
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
    padding: 10,
    borderRadius: 35,
  },
  modeText: {
    color: "black",
    fontSize: 11,
    
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
    // zIndex: 1,
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
    flexDirection: "row",
    justifyContent: "space-around",
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
  texts: { color: "white", fontSize: 12 },
  texttip: { color: "white", fontSize: 8 },
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
