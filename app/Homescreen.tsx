import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import ObscuraButton from "@/components/ObscuraButton";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  runOnJS,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as MediaLibrary from "expo-media-library";
import ZoomControls from "@/components/ZoomControls";
import ExposureControls from "@/components/ExposureControls";
import CameraNavPanel from "./CameranavPanel";
import InlineOverlayReanimated from "./Svg3DOverlay";
import FeedbackBanner, { getDirectionText } from "./FeedbackBanner";
import FocusBoxWithCaption from "./FocusBox";
// import FocusBoxWithCaption from "./FocusBoxWithCaption";

Animated.addWhitelistedNativeProps({ zoom: true });
const ReanimatedCamera = Animated.createAnimatedComponent(Camera);

const API_BASE_URL = "http://165.22.211.179:5003"; // Replace with your backend URL

const HomeScreen = () => {
  const [aiMode, setAiMode] = useState(false);
  const { hasPermission } = useCameraPermission();
  const [showZoomControls, setShowZoomControls] = useState(false);
  const [showExposureControls, setShowExposureControls] = useState(false);
  const { width } = useWindowDimensions();
  const [selectedMode, setSelectedMode] = useState<string>("Photo");
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [caption, setCaption] = useState(""); // Dynamic caption from backend
  const [isFrozen, setIsFrozen] = useState(false);
  const camera = useRef<Camera>(null);
  const [hasRefinedValues, setHasRefinedValues] = useState(false);
  const [cameraType, setCameraType] = useState<"back" | "front">("back");
  const [exposure, setExposure] = useState(0);
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [torch, setTorch] = useState<"off" | "on">("off");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const device = useCameraDevice(cameraType, {
    physicalDevices: cameraType === "back" ? ["wide-angle-camera"] : undefined,
  });

  const zoom = useSharedValue(device?.neutralZoom ?? 1);
  const zoomOffset = useSharedValue(0);
  const isOverlayVisible = useSharedValue(0);

  // Feedback and orientation states
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [bannerVisible, setBannerVisible] = useState(true);
  const targetYaw = useSharedValue(0);
  const targetPitch = useSharedValue(0);
  const targetRoll = useSharedValue(0);
  const targetYawShared = useSharedValue(targetYaw || 0);
  const targetPitchShared = useSharedValue(targetPitch || 0);
  const targetRollShared = useSharedValue(targetRoll || 0);
  const currentYaw = useSharedValue(0);
  const currentPitch = useSharedValue(0);
  const currentRoll = useSharedValue(0);

  // Parse feedback text and update targets

  // Bounding box states
  const focusX = useSharedValue(0);
  const focusY = useSharedValue(0);
  const focusWidth = useSharedValue(100);
  const focusHeight = useSharedValue(100);
  const showFocusBox = useSharedValue(0);
  const trackingEnabled = useSharedValue(0);

  // Handle aiMode toggle for overlay visibility
  useEffect(() => {
    isOverlayVisible.value = withTiming(aiMode ? 1 : 0, { duration: 300 });
  }, [aiMode]);

  // Pinch-to-zoom gesture
  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      zoomOffset.value = zoom.value;
    })
    .onUpdate((event) => {
      const z = zoomOffset.value * event.scale;
      zoom.value = Math.min(
        Math.max(z, device?.minZoom ?? 1),
        Math.min(device?.maxZoom ?? 16, 16)
      );
    });

  // Manual tracking with setInterval
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (trackingEnabled.value === 1 && !isFrozen) {
      intervalId = setInterval(() => {
        const centerX = focusX.value + focusWidth.value / 2;
        const centerY = focusY.value + focusHeight.value / 2;
        const detectedWidth = Math.random() * 20 + focusWidth.value;
        const detectedHeight = Math.random() * 20 + focusHeight.value;
        const lerpFactor = 0.1;
        focusX.value +=
          lerpFactor * (centerX - detectedWidth / 2 - focusX.value);
        focusY.value +=
          lerpFactor * (centerY - detectedHeight / 2 - focusY.value);
        focusWidth.value += lerpFactor * (detectedWidth - focusWidth.value);
        focusHeight.value += lerpFactor * (detectedHeight - focusHeight.value);
        // console.log("Manual tracking update - Bounding box:", {
        //   x: focusX.value,
        //   y: focusY.value,
        //   width: focusWidth.value,
        //   height: focusHeight.value,
        // });
      }, 200);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [trackingEnabled, isFrozen]);

  // Detect object function for bounding box initialization
  const detectObject = (
    frame: { width: number; height: number },
    x: number,
    y: number
  ) => {
    const { width: screenWidth, height: screenHeight } =
      Dimensions.get("window");
    const regionLeft = (screenWidth - 400) / 2;
    const regionTop = (screenHeight - 400) / 2;
    const regionRight = regionLeft + 400;
    const regionBottom = regionTop + 400;

    const detectedWidth = Math.random() * 100 + 50;
    const detectedHeight = Math.random() * 100 + 50;
    let newX = x;
    let newY = y;

    newX = Math.max(regionLeft, Math.min(newX, regionRight - detectedWidth));
    newY = Math.max(regionTop, Math.min(newY, regionBottom - detectedHeight));

    return { x: newX, y: newY, width: detectedWidth, height: detectedHeight };
  };

  // Backend API calls
  const callClassifier = async (data: {
    bbox_x: number;
    bbox_y: number;
    width: number;
    height: number;
    pitch: number;
    roll: number;
    yaw: number;
    exposure: number;
    zoom_level: number;
  }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/classifier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok)
        throw new Error(`Classifier API error: ${response.statusText}`);
      const json = await response.json();
      if (
        !json.predicted_direction ||
        typeof json.distance_to_center !== "number"
      ) {
        throw new Error("Invalid classifier response");
      }
      return json;
    } catch (error: unknown) {
      throw new Error(
        `Classifier failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const callCaption = async (imagePath: string) => {
    try {
      const formData = new FormData();
      formData.append("image", {
        uri: imagePath,
        type: "image/jpeg",
        name: "temp.jpg",
      } as any);
      const response = await fetch(`${API_BASE_URL}/caption`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok)
        throw new Error(`Caption API error: ${response.statusText}`);
      const json = await response.json();
      if (!json.success || !json.caption) {
        throw new Error("Invalid caption response");
      }
      return json;
    } catch (error: unknown) {
      throw new Error(
        `Caption failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  // const callRefine = async (imagePath: string) => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("image", {
  //       uri: imagePath,
  //       type: "image/jpeg",
  //       name: "temp.jpg",
  //     } as any);
  //     formData.append("delta", "5.0");
  //     const response = await fetch(`${API_BASE_URL}/refine`, {
  //       method: "POST",
  //       body: formData,
  //     });
  //     if (!response.ok)
  //       throw new Error(`Refine API error: ${response.statusText}`);
  //     const json = await response.json();

  //     if (
  //       !json.success ||
  //       !json.refined_angles ||
  //       json.refined_angles.length !== 3
  //     ) {
  //       throw new Error("Invalid refine response");
  //     }
  //     return json;
  //   } catch (error: unknown) {
  //     throw new Error(
  //       `Refine failed: ${error instanceof Error ? error.message : "Unknown error"}`
  //     );
  //   }
  // };

  const callRefine = async (imagePath: string) => {
    try {
      const formData = new FormData();
      formData.append("image", {
        uri: imagePath,
        type: "image/jpeg",
        name: "temp.jpg",
      } as any);
      formData.append("delta", "5.0");

      const response = await fetch(`${API_BASE_URL}/refine`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok)
        throw new Error(`Refine API error: ${response.statusText}`);

      const json = await response.json();

      if (
        !json.success ||
        !json.refined_angles ||
        json.refined_angles.length !== 3
      ) {
        throw new Error("Invalid refine response");
      }

      // Automatically enable AI mode when we get refined values

      runOnJS(setHasRefinedValues)(true);

      return json;
    } catch (error: unknown) {
      runOnJS(setAiMode)(false);
      runOnJS(setHasRefinedValues)(false);
      throw error;
    }
  };
  const getDirectionText = (
    yaw: number,
    pitch: number,
    roll: number,
    distance: number,
    caption: string
  ) => {
    // Convert to degrees if values are in radians
    const toDegrees = (angle: number) =>
      Math.abs(angle) < Math.PI * 1.1 ? angle * (180 / Math.PI) : angle;

    const degYaw = toDegrees(yaw);
    const degPitch = toDegrees(pitch);
    const degRoll = toDegrees(roll);

    // Formatting helper
    const formatInstruction = (value: number, type: string) => {
      const absValue = Math.abs(value);
      if (absValue < 5) return null;

      switch (type) {
        case "yaw":
          const yawDir = value > 0 ? "right" : "left";
          return `${absValue < 15 ? "Slightly" : "Strongly"} rotate ${yawDir}`;
        case "pitch":
          const pitchDir = value > 0 ? "down" : "up";
          return `${absValue < 15 ? "Gently tilt" : "Tilt more"} ${pitchDir}`;
        case "roll":
          const rollDir = value > 0 ? "left" : "right";
          return `${absValue < 15 ? "Slightly tilt" : "Tilt more to the"} ${rollDir}`;
      }
    };

    const steps = [
      formatInstruction(degYaw, "yaw"),
      formatInstruction(degPitch, "pitch"),
      formatInstruction(degRoll, "roll"),
    ].filter(Boolean);

    if (steps.length === 0) {
      return "✅ Perfect position! Hold steady.";
    }

    targetYaw.value = degYaw;
    targetPitch.value = degPitch;
    targetRoll.value = degRoll;
    runOnJS(setAiMode)(false);
    runOnJS(setAiMode)(true);

    return (
      `📷 Adjustment Steps:\n${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n` +
      `Current Orientation:\nYaw: ${degYaw.toFixed(1)}° | Pitch: ${degPitch.toFixed(1)}° | Roll: ${degRoll.toFixed(1)}°\n` +
      `Distance: ${distance.toFixed(2)}\n` +
      `Caption: ${caption}`
    );
  };

  const sendToBackend = async (
    x: number,
    y: number,
    width: number,
    height: number,
    imagePath: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Get caption first
      const captionResponse = await callCaption(imagePath);
      const captionText = captionResponse.caption || "No caption available";
      setCaption(captionText);

      // 2. Call classifier
      const classifierResponse = await callClassifier({
        bbox_x: x / 400,
        bbox_y: y / 400,
        width: width / 400,
        height: height / 400,
        pitch: 0, // These will be updated by refine
        roll: 0,
        yaw: 0,
        exposure,
        zoom_level: zoom.value,
      });

      // 3. Call refine endpoint - THIS IS THE KEY PART
      const refineResult = await callRefine(imagePath); // Changed variable name from refineResponse to refineResult
      if (!refineResult.success || !refineResult.refined_angles) {
        throw new Error("Invalid refine response");
      }

      const [refinedYaw, refinedPitch, refinedRoll] =
        refineResult.refined_angles;

      // 4. Generate human-readable instructions
      const directionGuide = getDirectionText(
        refinedYaw,
        refinedPitch,
        refinedRoll,
        classifierResponse.distance_to_center, // Add distance
        captionText // Add caption
      );

      setFeedbackText(directionGuide);

      console.log("Raw refine angles:", refineResult.refined_angles);
      setFeedbackVisible(true);

      // 6. Update animated values if in AI mode
      if (aiMode) {
        currentYaw.value = withTiming(refinedYaw, { duration: 500 });
        currentPitch.value = withTiming(refinedPitch, { duration: 500 });
        currentRoll.value = withTiming(refinedRoll, { duration: 500 });
      }

      if (!isFrozen) trackingEnabled.value = 1;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
      setFeedbackText("⚠️ Failed to process image. Please try again.");
      setFeedbackVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("Raw refine angles:", feedbackText);
  // Focus and process image
  const focus = useCallback(
    debounce(async (point: { x: number; y: number }) => {
      if (isFrozen) {
        console.log("Tap ignored - Screen is frozen (static mode)");
        setFeedbackText("Camera is in static mode. Unfreeze to interact.");
        setFeedbackVisible(true);
        return;
      }
      console.log("Tap detected - Focusing at:", point);
      const c = camera.current;
      if (!c || !device?.supportsFocus) {
        setError("Camera not available or focus not supported");
        console.error("Camera not available or focus not supported");
        return;
      }

      setIsLoading(true);
      try {
        const frame = await c.takeSnapshot({ quality: 85 });
        const asset = await MediaLibrary.createAssetAsync(frame.path);
        const savedPath = asset.uri;
        console.log("Snapshot saved:", savedPath);

        // Update bounding box
        const detected = detectObject(
          { width: frame.width, height: frame.height },
          point.x,
          point.y
        );
        focusX.value = detected.x;
        focusY.value = detected.y;
        focusWidth.value = detected.width;
        focusHeight.value = detected.height;
        showFocusBox.value = withTiming(1, { duration: 200 });
        console.log("Bounding box set:", detected);

        // Focus camera
        await c.focus(point).catch((error: Error) => {
          if (!error.message.includes("focus-canceled")) {
            throw new Error("Focus failed: " + error.message);
          }
        });

        // Send to backend
        await sendToBackend(
          detected.x,
          detected.y,
          detected.width,
          detected.height,
          savedPath
        );
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setError(errorMessage);
        setFeedbackText("⚠️ Failed to process focus. Please try again.");
        setFeedbackVisible(true);
        console.error("Focus error:", errorMessage);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [device, aiMode, exposure, zoom.value, isFrozen]
  );

  const tapGesture = Gesture.Tap().onEnd((event) => {
    runOnJS(focus)({ x: event.x, y: event.y });
  });

  const composedGesture = Gesture.Simultaneous(pinchGesture, tapGesture);

  const animatedProps = useAnimatedProps(() => ({ zoom: zoom.value }), [zoom]);

  const panelHeight = useSharedValue(0);
  const MAX_PANEL_HEIGHT = 300;
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      panelHeight.value = Math.max(
        0,
        Math.min(event.translationY + MAX_PANEL_HEIGHT, MAX_PANEL_HEIGHT)
      );
    })
    .onEnd(() => {
      panelHeight.value =
        panelHeight.value > MAX_PANEL_HEIGHT / 2
          ? withTiming(MAX_PANEL_HEIGHT, { duration: 200 })
          : withTiming(0, { duration: 120 });
    });
  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: panelHeight.value }],
  }));

  if (!hasPermission) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Camera permission required.</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Camera...</Text>
      </View>
    );
  }

  const openGallery = () => {
    setIsCameraActive(false);
    router.push("/media");
    console.log("Gallery opened");
  };

  const takePicture = async () => {
    try {
      if (!camera.current) throw new Error("Camera ref is null!");
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Media library access needed to save photos."
        );
        console.log("Media library permission denied");
        return;
      }
      setIsLoading(true);
      const photo = await camera.current.takePhoto({
        flash: flash,
        enableShutterSound: false,
      });
      await MediaLibrary.saveToLibraryAsync(photo.path);
      console.log("Photo saved to gallery at path:", photo.path); // Log the saved path
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      console.error("Take picture error:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCameraType = () => {
    setCameraType((prev) => (prev === "back" ? "front" : "back"));
    zoom.value = device?.neutralZoom ?? 1;
    console.log(
      "Camera type toggled to:",
      cameraType === "back" ? "front" : "back"
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <SafeAreaView style={styles.container}>
        <GestureDetector gesture={composedGesture}>
          <ReanimatedCamera
            ref={camera}
            style={StyleSheet.absoluteFillObject}
            photo={true}
            device={device}
            isActive={isCameraActive}
            resizeMode="cover"
            preview={true}
            exposure={exposure}
            torch={torch}
            animatedProps={animatedProps}
          />
        </GestureDetector>
        {aiMode && (
          <InlineOverlayReanimated
            targetYaw={targetYaw}
            targetPitch={targetPitch}
            targetRoll={targetRoll}
            currentYaw={currentYaw}
            currentPitch={currentPitch}
            currentRoll={currentRoll}
            direction={
              feedbackText.includes("Direction")
                ? feedbackText
                    .split("Direction: ")[1]
                    .split(" •")[0]
                    .toLowerCase()
                : undefined
            }
            feedbackText={feedbackText}
            isVisible={isOverlayVisible}
          />
        )}
        {/* <FeedbackBanner
          visible={feedbackVisible}
          feedbackText={feedbackText}
          directionText={directionText}
          onHide={() => setFeedbackVisible(false)}
        /> */}
        <View style={styles.wrapper}>
          <FeedbackBanner
            visible={feedbackVisible}
            feedbackText={feedbackText}
            // This now includes directionText + other info
            onHide={() => setFeedbackVisible(false)}
          />
          {!bannerVisible && (
            <TouchableOpacity
              style={styles.viewFeedbackBtn}
              onPress={() => setBannerVisible(true)}
            >
              <Text style={styles.viewFeedbackText}>View Feedback</Text>
            </TouchableOpacity>
          )}
        </View>
        {/* <FocusBoxWithCaption
          focusX={focusX}
          focusY={focusY}
          focusWidth={focusWidth}
          focusHeight={focusHeight}
          opacity={showFocusBox}
          caption={caption}
        /> */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        )}
        {error && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => setError(null)}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

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
        <View style={styles.sliderContainer}>
          {showZoomControls && (
            <ZoomControls
              zoom={zoom}
              setShowZoomControls={setShowZoomControls}
            />
          )}
        </View>
        <View style={styles.sliderContainerexposure}>
          {showExposureControls && (
            <ExposureControls
              setExposure={setExposure}
              setShowExposureControls={setShowExposureControls}
              exposure={exposure}
            />
          )}
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
          <TouchableOpacity onPress={openGallery}>
            <Ionicons name="images-outline" size={width * 0.09} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <Ionicons name="camera" size={48} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleCameraType}>
            <Ionicons name="sync-circle" size={width * 0.115} color="white" />
          </TouchableOpacity>
        </View>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.draggablePanel, panelStyle]}>
            <View style={styles.panelHandle} />
            <CameraNavPanel
              onSyncPress={toggleCameraType}
              selectedModeprop={selectedMode}
              onModeChange={setSelectedMode}
              aiMode={aiMode}
              setAiMode={setAiMode}
              setfeedback={setFeedbackVisible}
              feedMode={feedbackVisible}
            />
          </Animated.View>
        </GestureDetector>
      </SafeAreaView>
    </View>
  );
};

function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

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
  loadingText: { color: "white", fontSize: 18 },
  modeSelection: {
    flexDirection: "row",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 130,
    width: "100%",
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
  draggablePanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: "rgb(0, 0, 0)",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  panelHandle: {
    width: 40,
    height: 4,
    backgroundColor: "white",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  errorOverlay: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255,0,0,0.8)",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  errorText: {
    color: "white",
    fontSize: 16,
  },
  retryButton: {
    marginTop: 10,
    backgroundColor: "white",
    padding: 8,
    borderRadius: 5,
  },
  retryText: {
    color: "black",
    fontSize: 14,
  },
  wrapper: {
    position: "absolute",
    top: 370,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  viewFeedbackBtn: {
    alignSelf: "center",
    marginTop: 8,
    padding: 5,
    borderRadius: 6,
    backgroundColor: "#333",
  },
  viewFeedbackText: {
    fontSize: 12,
    color: "#fff",
  },
});

export default HomeScreen;
