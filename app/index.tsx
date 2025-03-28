// import React, { useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   useWindowDimensions,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { StatusBar } from "expo-status-bar";
// import {
//   Camera,
//   useCameraDevice,
//   useCameraPermission,
//   Frame,
// } from "react-native-vision-camera";
// import { Redirect, router } from "expo-router";
// import { BlurView } from "expo-blur";
// import ObscuraButton from "@/components/ObscuraButton";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   useAnimatedProps,
//   withTiming,
//   runOnJS,
// } from "react-native-reanimated";
// import { Gesture, GestureDetector } from "react-native-gesture-handler";
// import * as MediaLibrary from "expo-media-library";
// import ZoomControls from "@/components/ZoomControls";
// import ExposureControls from "@/components/ExposureControls";
// import CameraNavPanel from "./CameranavPanel";
// import * as FileSystem from "expo-file-system";

// Animated.addWhitelistedNativeProps({ zoom: true });
// const ReanimatedCamera = Animated.createAnimatedComponent(Camera);

// const HomeScreen = () => {
//   const [aiMode, setAiMode] = useState(false);
//   const [angleMode, setAngleMode] = useState(false);
//   const { hasPermission } = useCameraPermission();
//   const microphonePermission = Camera.getMicrophonePermissionStatus();
//   const [showZoomControls, setShowZoomControls] = useState(false);
//   const [showExposureControls, setShowExposureControls] = useState(false);
//   const { width } = useWindowDimensions();
//   const [selectedMode, setSelectedMode] = useState<string>("Photo");
//   const [isCameraActive, setIsCameraActive] = useState(true);
//   const camera = React.useRef<Camera>(null);
//   const [isScreenFrozen, setIsScreenFrozen] = useState<boolean>(false);
//   const [hasPrediction, setHasPrediction] = useState(false); // Tr// Example state for frozen screen
// const [cameraType, setCameraType] = useState<"back" | "front">("back");
//   const [exposure, setExposure] = useState(0);
//   const [flash, setFlash] = useState<"off" | "on">("off");
//   const [torch, setTorch] = useState<"off" | "on">("off");
//   const TEMP_FOLDER =
//     FileSystem.documentDirectory + "/Backend/snappy-ai-backend/temp_images";

//   const device = useCameraDevice(cameraType, {
//     physicalDevices: cameraType === "back" ? ["wide-angle-camera"] : undefined,
//   });

//   const zoom = useSharedValue(device?.neutralZoom ?? 1);
//   const zoomOffset = useSharedValue(0);

//   // Focus bounding box state
//   const focusX = useSharedValue(0);
//   const focusY = useSharedValue(0);
//   const focusWidth = useSharedValue(100); // Dynamic width
//   const focusHeight = useSharedValue(100); // Dynamic height
//   const showFocusBox = useSharedValue(0);

//   // Pinch-to-zoom gesture
//   const pinchGesture = Gesture.Pinch()
//     .onBegin(() => {
//       zoomOffset.value = zoom.value;
//     })
//     .onUpdate((event) => {
//       const z = zoomOffset.value * event.scale;
//       zoom.value = Math.min(
//         Math.max(z, device?.minZoom ?? 1),
//         Math.min(device?.maxZoom ?? 16, 16)
//       );
//     });

//   const longPressGesture = Gesture.LongPress().onStart((event) => {
//     if (aiMode && !isScreenFrozen) {
//       focusX.value = event.absoluteX - focusWidth.value / 2;
//       focusY.value = event.absoluteY - focusHeight.value / 2;
//       runOnJS(setIsScreenFrozen)(true);
//       runOnJS(handleLongPress)();
//     }
//   });

//   const handleLongPress = useCallback(async () => {
//     try {
//       const photo = await camera.current?.takePhoto({
//         flash: flash,
//         enableShutterSound: false,
//       });
//       if (!photo) throw new Error("Failed to capture photo");

//       const filename = `temp_${Date.now()}.jpg`;
//       const tempPath = TEMP_FOLDER + filename;
//       await FileSystem.moveAsync({
//         from: photo.path,
//         to: tempPath,
//       });
//       console.log("Saved temp image at:", tempPath);

//       const bbox = {
//         x: focusX.value,
//         y: focusY.value,
//         width: focusWidth.value,
//         height: focusHeight.value,
//       };

//       const payload = { filename, bbox };

//       console.log("Sending to Flask:", payload);

//       const response = await fetch("http://192.168.1.100:5000/predict", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const result = await response.json();
//       if (response.status === 200) {
//         console.log("Prediction received from Flask:", result.prediction);
//         setHasPrediction(true); // Mark that a prediction exists
//         setIsScreenFrozen(false); // Unfreeze the screen
//         setAiMode(false); // Disable AI mode
//       } else {
//         throw new Error("Flask API returned non-200 status");
//       }
//     } catch (err) {
//       console.error("Error in handleLongPress:", err);
//       setIsScreenFrozen(false);
//     }
//   }, [aiMode, isScreenFrozen, flash, focusX, focusY, focusWidth, focusHeight]);
//   console.log("handleLongPress defined:", !!handleLongPress);

//   const composedGesture = Gesture.Simultaneous(pinchGesture, longPressGesture);

//   const animatedProps = useAnimatedProps(() => ({ zoom: zoom.value }), [zoom]);

//   const focusBoxStyle = useAnimatedStyle(
//     () => ({
//       position: "absolute",
//       width: focusWidth.value,
//       height: focusHeight.value,
//       borderWidth: 2,
//       borderColor: "red",
//       opacity: aiMode && !isScreenFrozen ? showFocusBox.value : 0, // Show only if aiMode is on and not frozen
//       top: focusY.value,
//       left: focusX.value,
//       backgroundColor: "rgba(255, 0, 0, 0.3)",
//     }),
//     [aiMode, isScreenFrozen]
//   );

//   const toggleCameraType = () => {
//     setCameraType((prev) => (prev === "back" ? "front" : "back"));
//     zoom.value = device?.neutralZoom ?? 1;
//   };

//   // Simulate object detection (replace with real detection logic)
//   const detectObject = (frame: Frame, x: number, y: number) => {
//     // Placeholder: Simulate an object at tap point with random size
//     // In reality, use a library like vision-camera-dynamsoft-barcode or ML model
//     const detectedWidth = Math.random() * 100 + 50; // 50-150px
//     const detectedHeight = Math.random() * 100 + 50; // 50-150px
//     return {
//       x: x - detectedWidth / 2,
//       y: y - detectedHeight / 2,
//       width: detectedWidth,
//       height: detectedHeight,
//     };
//   };

//   // Send to backend (placeholder)
//   const sendToBackend = async (
//     x: number,
//     y: number,
//     width: number,
//     height: number
//   ) => {
//     try {
//       console.log("Sending to backend:", { x, y, width, height });
//       // Replace with your backend endpoint
//       const response = await fetch("https://your-backend-api.com/focus", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           x,
//           y,
//           width,
//           height,
//           timestamp: Date.now(),
//         }),
//       });
//       const result = await response.json();
//       console.log("Backend response:", result);
//     } catch (error) {
//       console.error("Failed to send to backend:", error);
//     }
//   };

//   const focus = useCallback(
//     debounce(async (point: { x: number; y: number }) => {
//       console.log("Focusing at:", point);
//       const c = camera.current;
//       if (c == null || !device?.supportsFocus) {
//         console.log("Camera not available or focus not supported");
//         return;
//       }

//       // Simulate capturing the current frame for object detection
//       const frame = await c.takeSnapshot({ quality: 85 });
//       const detected = detectObject(
//         { width: frame.width, height: frame.height } as Frame,
//         point.x,
//         point.y
//       );

//       // Update bounding box to match detected object
//       focusX.value = detected.x;
//       focusY.value = detected.y;
//       focusWidth.value = detected.width;
//       focusHeight.value = detected.height;
//       showFocusBox.value = withTiming(1, { duration: 200 });

//       console.log("Focus box set to:", detected);

//       c.focus(point).catch((error) => {
//         if (
//           error.message.includes("focus-canceled") ||
//           error.code === "capture/focus-canceled"
//         ) {
//           console.log("Focus canceled by a new request, ignoring...");
//         } else {
//           console.error("Failed to focus:", error);
//         }
//       });

//       // Send detected object data to backend
//       sendToBackend(detected.x, detected.y, detected.width, detected.height);

//       setTimeout(() => {
//         showFocusBox.value = withTiming(0, { duration: 200 });
//         console.log("Focus box hidden");
//       }, 1000);
//     }, 300),
//     [
//       device?.supportsFocus,
//       focusX,
//       focusY,
//       focusWidth,
//       focusHeight,
//       showFocusBox,
//     ]
//   );

//   // // Tap gesture for focusing
//   // const tapGesture = Gesture.Tap().onStart((event) => {
//   //   console.log("Tap detected at:", event.x, event.y);
//   //   runOnJS(focus)({ x: event.x, y: event.y });
//   // });

//   // const composedGesture = Gesture.Simultaneous(pinchGesture, tapGesture);

//   // const animatedProps = useAnimatedProps(() => ({ zoom: zoom.value }), [zoom]);

//   // const focusBoxStyle = useAnimatedStyle(() => ({
//   //   position: "absolute",
//   //   width: focusWidth.value,
//   //   height: focusHeight.value,
//   //   borderWidth: 2,
//   //   borderColor: "red",
//   //   opacity: showFocusBox.value,
//   //   top: focusY.value,
//   //   left: focusX.value,
//   //   backgroundColor: "rgba(255, 0, 0, 0.3)",
//   // }));

//   // const toggleCameraType = () => {
//   //   setCameraType((prev) => (prev === "back" ? "front" : "back"));
//   //   zoom.value = device?.neutralZoom ?? 1;
//   // };

//   const openGallery = () => {
//     setIsCameraActive(false);
//     router.push("/media");
//   };

//   const takePicture = async () => {
//     try {
//       if (camera.current == null) throw new Error("Camera ref is null!");
//       const { status } = await MediaLibrary.requestPermissionsAsync();
//       if (status !== "granted") {
//         alert("Permission to access media library is required to save photos.");
//         return;
//       }
//       console.log("Taking photo...");
//       const photo = await camera.current.takePhoto({
//         flash: flash,
//         enableShutterSound: false,
//       });
//       await MediaLibrary.saveToLibraryAsync(photo.path);
//       console.log("Photo saved to gallery:", photo.path);
//     } catch (e) {
//       console.error("Failed to take photo or save!", e);
//       alert("Failed to save the photo. Please try again.");
//     }
//   };

//   const toggleAiMode = () => setAiMode(!aiMode);
//   const toggleAngleMode = () => setAngleMode(!angleMode);

//   if (!hasPermission || microphonePermission === "not-determined") {
//     return <Redirect href={"/permissions"} />;
//   }
//   if (!device) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.loadingText}>Loading Camera...</Text>
//       </View>
//     );
//   }

//   // if (!camera.current) {
//   //   console.error("Camera ref is not available");
//   //   setIsScreenFrozen(false);
//   //   return;
//   // }

//   const panelHeight = useSharedValue(0);
//   const MAX_PANEL_HEIGHT = 300;
//   const panGesture = Gesture.Pan()
//     .onUpdate((event) => {
//       panelHeight.value = Math.max(
//         0,
//         Math.min(event.translationY + MAX_PANEL_HEIGHT, MAX_PANEL_HEIGHT)
//       );
//     })
//     .onEnd(() => {
//       panelHeight.value =
//         panelHeight.value > MAX_PANEL_HEIGHT / 2
//           ? withTiming(MAX_PANEL_HEIGHT, { duration: 200 })
//           : withTiming(0, { duration: 120 });
//     });

//   const panelStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: panelHeight.value }],
//   }));

//   return (
//     <View style={styles.container}>
//       <StatusBar />
//       <SafeAreaView style={styles.container}>
//         <GestureDetector gesture={composedGesture}>
//           <ReanimatedCamera
//             ref={camera}
//             style={StyleSheet.absoluteFillObject}
//             photo={true}
//             device={device}
//             isActive={isCameraActive && !isScreenFrozen}
//             resizeMode="cover"
//             preview={true}
//             exposure={exposure}
//             torch={torch}
//             animatedProps={animatedProps}
//           />
//         </GestureDetector>
//         <BlurView
//           intensity={100}
//           tint="dark"
//           style={{
//             position: "absolute",
//             bottom: 10,
//             right: 10,
//             padding: 10,
//           }}
//           experimentalBlurMethod="dimezisBlurView"
//         />
//         <View style={styles.modeSelection}>
//           {["Photo", "Video", "Portrait", "Panorama"].map((mode) => (
//             <TouchableOpacity
//               key={mode}
//               style={[
//                 styles.modeButton,
//                 { backgroundColor: selectedMode === mode ? "#559" : "white" },
//               ]}
//               onPress={() => setSelectedMode(mode)}
//             >
//               <Text
//                 style={[
//                   styles.modeText,
//                   { color: selectedMode === mode ? "white" : "black" },
//                 ]}
//               >
//                 {mode}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//         <View style={styles.sliderContainer}>
//           {showZoomControls && (
//             <ZoomControls
//               zoom={zoom}
//               setShowZoomControls={setShowZoomControls}
//             />
//           )}
//         </View>
//         <View style={styles.sliderContainerexposure}>
//           {showExposureControls && (
//             <ExposureControls
//               setExposure={setExposure}
//               setShowExposureControls={setShowExposureControls}
//               exposure={exposure}
//             />
//           )}
//         </View>
//         <View style={styles.flashContainer}>
//           <ObscuraButton
//             iconName={flash === "on" ? "flash-sharp" : "flash-off-sharp"}
//             onPress={() => setFlash((f) => (f === "off" ? "on" : "off"))}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>
//         <View style={styles.settingsContainer}>
//           <ObscuraButton
//             iconName="magnet-sharp"
//             onPress={() => setShowZoomControls((s) => !s)}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>
//         <View style={styles.exposureContainer}>
//           <ObscuraButton
//             iconName="eye-sharp"
//             onPress={() => setShowExposureControls((s) => !s)}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>
//         <View style={styles.captureButtonContainer}>
//           <TouchableOpacity onPress={openGallery}>
//             <Ionicons name="images-outline" size={width * 0.09} color="white" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
//             <Ionicons name="camera" size={48} color="white" />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={toggleCameraType}>
//             <Ionicons name="sync-circle" size={width * 0.115} color="white" />
//           </TouchableOpacity>
//         </View>
//         <GestureDetector gesture={panGesture}>
//           <Animated.View style={[styles.draggablePanel, panelStyle]}>
//             <View style={styles.panelHandle} />
//             <CameraNavPanel
//               onSyncPress={toggleCameraType}
//               selectedModeprop={selectedMode}
//               onModeChange={setSelectedMode}
//               aiMode={aiMode}
//               setAiMode={setAiMode}
//             />
//           </Animated.View>
//         </GestureDetector>
//         <Animated.View style={[focusBoxStyle, { zIndex: 1000 }]} />
//       </SafeAreaView>
//     </View>
//   );
// };

// function debounce<T extends (...args: any[]) => void>(
//   func: T,
//   wait: number
// ): (...args: Parameters<T>) => void {
//   let timeout: NodeJS.Timeout | null = null;
//   return (...args: Parameters<T>) => {
//     if (timeout) clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "transparent",
//     justifyContent: "flex-end",
//     paddingTop: 40,
//     paddingBottom: 40,
//   },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "black",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   loadingText: { color: "white", fontSize: 18 },
//   modeSelection: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     position: "absolute",
//     bottom: 130,
//     width: "100%",
//   },
//   modeButton: {
//     backgroundColor: "rgb(255, 255, 255)",
//     padding: 10,
//     borderRadius: 35,
//   },
//   modeText: {
//     color: "black",
//     fontSize: 11,
//   },
//   sliderContainer: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   sliderContainerexposure: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   flashContainer: {
//     position: "absolute",
//     top: 50,
//     right: 20,
//   },
//   settingsContainer: {
//     position: "absolute",
//     top: 50,
//     left: 20,
//   },
//   exposureContainer: {
//     position: "absolute",
//     top: 110,
//     right: 20,
//   },
//   captureButtonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     marginBottom: 40,
//     bottom: -35,
//   },
//   captureButton: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: "rgb(26, 110, 158)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   draggablePanel: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 300,
//     backgroundColor: "rgb(0, 0, 0)",
//     borderTopLeftRadius: 35,
//     borderTopRightRadius: 35,
//     zIndex: 100,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   panelHandle: {
//     width: 40,
//     height: 4,
//     backgroundColor: "white",
//     borderRadius: 2,
//     alignSelf: "center",
//     marginTop: 10,
//   },
// });

// export default HomeScreen;

//working 28.03

// import React, { useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   useWindowDimensions,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { StatusBar } from "expo-status-bar";
// import {
//   Camera,
//   useCameraDevice,
//   useCameraPermission,
//   Frame,
// } from "react-native-vision-camera";
// import { Redirect, router } from "expo-router";
// import { BlurView } from "expo-blur";
// import ObscuraButton from "@/components/ObscuraButton";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   useAnimatedProps,
//   withTiming,
//   runOnJS,
// } from "react-native-reanimated";
// import { Gesture, GestureDetector } from "react-native-gesture-handler";
// import * as MediaLibrary from "expo-media-library";
// import ZoomControls from "@/components/ZoomControls";
// import ExposureControls from "@/components/ExposureControls";
// import CameraNavPanel from "./CameranavPanel";

// Animated.addWhitelistedNativeProps({ zoom: true });
// const ReanimatedCamera = Animated.createAnimatedComponent(Camera);

// const HomeScreen = () => {
//   const [aiMode, setAiMode] = useState(false);
//   const [angleMode, setAngleMode] = useState(false);
//   const { hasPermission } = useCameraPermission();
//   const microphonePermission = Camera.getMicrophonePermissionStatus();
//   const [showZoomControls, setShowZoomControls] = useState(false);
//   const [showExposureControls, setShowExposureControls] = useState(false);
//   const { width } = useWindowDimensions();
//   const [selectedMode, setSelectedMode] = useState<string>("Photo");
//   const [isCameraActive, setIsCameraActive] = useState(true);
//   const camera = React.useRef<Camera>(null);

//   const [cameraType, setCameraType] = useState<"back" | "front">("back");
//   const [exposure, setExposure] = useState(0);
//   const [flash, setFlash] = useState<"off" | "on">("off");
//   const [torch, setTorch] = useState<"off" | "on">("off");

//   const device = useCameraDevice(cameraType, {
//     physicalDevices: cameraType === "back" ? ["wide-angle-camera"] : undefined,
//   });

//   const zoom = useSharedValue(device?.neutralZoom ?? 1);
//   const zoomOffset = useSharedValue(0);

//   // Focus bounding box state
//   const focusX = useSharedValue(0);
//   const focusY = useSharedValue(0);
//   const focusWidth = useSharedValue(100); // Dynamic width
//   const focusHeight = useSharedValue(100); // Dynamic height
//   const showFocusBox = useSharedValue(0);

//   // Pinch-to-zoom gesture
//   const pinchGesture = Gesture.Pinch()
//     .onBegin(() => {
//       zoomOffset.value = zoom.value;
//     })
//     .onUpdate((event) => {
//       const z = zoomOffset.value * event.scale;
//       zoom.value = Math.min(
//         Math.max(z, device?.minZoom ?? 1),
//         Math.min(device?.maxZoom ?? 16, 16)
//       );
//     });

//   // Simulate object detection (replace with real detection logic)
//   const detectObject = (frame: Frame, x: number, y: number) => {
//     // Placeholder: Simulate an object at tap point with random size
//     // In reality, use a library like vision-camera-dynamsoft-barcode or ML model
//     const detectedWidth = Math.random() * 100 + 50; // 50-150px
//     const detectedHeight = Math.random() * 100 + 50; // 50-150px
//     return {
//       x: x - detectedWidth / 2,
//       y: y - detectedHeight / 2,
//       width: detectedWidth,
//       height: detectedHeight,
//     };
//   };

//   // Send to backend (placeholder)
//   const sendToBackend = async (
//     x: number,
//     y: number,
//     width: number,
//     height: number
//   ) => {
//     try {
//       console.log("Sending to backend:", { x, y, width, height });
//       // Replace with your backend endpoint
//       const response = await fetch("http://localhost:5000/predict", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           x,
//           y,
//           width,
//           height,
//           timestamp: Date.now(),
//         }),
//       });
//       const result = await response.json();
//       console.log("Backend response:", result);
//     } catch (error) {
//       console.error("Failed to send to backend:", error);
//     }
//   };

//   const focus = useCallback(
//     debounce(async (point: { x: number; y: number }) => {
//       console.log("Focusing at:", point);
//       const c = camera.current;
//       if (c == null || !device?.supportsFocus) {
//         console.log("Camera not available or focus not supported");
//         return;
//       }

//       // Simulate capturing the current frame for object detection
//       const frame = await c.takeSnapshot({ quality: 85 });
//       const detected = detectObject(
//         { width: frame.width, height: frame.height } as Frame,
//         point.x,
//         point.y
//       );

//       // Update bounding box to match detected object
//       focusX.value = detected.x;
//       focusY.value = detected.y;
//       focusWidth.value = detected.width;
//       focusHeight.value = detected.height;
//       showFocusBox.value = withTiming(1, { duration: 200 });

//       console.log("Focus box set to:", detected);

//       c.focus(point).catch((error) => {
//         if (
//           error.message.includes("focus-canceled") ||
//           error.code === "capture/focus-canceled"
//         ) {
//           console.log("Focus canceled by a new request, ignoring...");
//         } else {
//           console.error("Failed to focus:", error);
//         }
//       });

//       // Send detected object data to backend
//       sendToBackend(detected.x, detected.y, detected.width, detected.height);

//       setTimeout(() => {
//         showFocusBox.value = withTiming(0, { duration: 200 });
//         console.log("Focus box hidden");
//       }, 1000);
//     }, 300),
//     [
//       device?.supportsFocus,
//       focusX,
//       focusY,
//       focusWidth,
//       focusHeight,
//       showFocusBox,
//     ]
//   );

//   // Tap gesture for focusing
//   const tapGesture = Gesture.Tap().onStart((event) => {
//     console.log("Tap detected at:", event.x, event.y);
//     runOnJS(focus)({ x: event.x, y: event.y });
//   });

//   const composedGesture = Gesture.Simultaneous(pinchGesture, tapGesture);

//   const animatedProps = useAnimatedProps(() => ({ zoom: zoom.value }), [zoom]);

//   const focusBoxStyle = useAnimatedStyle(() => ({
//     position: "absolute",
//     width: focusWidth.value,
//     height: focusHeight.value,
//     borderWidth: 2,
//     borderColor: "red",
//     opacity: showFocusBox.value,
//     top: focusY.value,
//     left: focusX.value,
//     backgroundColor: "rgba(255, 0, 0, 0.3)",
//   }));

//   const toggleCameraType = () => {
//     setCameraType((prev) => (prev === "back" ? "front" : "back"));
//     zoom.value = device?.neutralZoom ?? 1;
//   };

//   const openGallery = () => {
//     setIsCameraActive(false);
//     router.push("/media");
//   };

//   const takePicture = async () => {
//     try {
//       if (camera.current == null) throw new Error("Camera ref is null!");
//       const { status } = await MediaLibrary.requestPermissionsAsync();
//       if (status !== "granted") {
//         alert("Permission to access media library is required to save photos.");
//         return;
//       }
//       console.log("Taking photo...");
//       const photo = await camera.current.takePhoto({
//         flash: flash,
//         enableShutterSound: false,
//       });
//       await MediaLibrary.saveToLibraryAsync(photo.path);
//       console.log("Photo saved to gallery:", photo.path);
//     } catch (e) {
//       console.error("Failed to take photo or save!", e);
//       alert("Failed to save the photo. Please try again.");
//     }
//   };

//   const toggleAiMode = () => setAiMode(!aiMode);
//   const toggleAngleMode = () => setAngleMode(!angleMode);

//   if (!hasPermission || microphonePermission === "not-determined") {
//     return <Redirect href={"/permissions"} />;
//   }
//   if (!device) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.loadingText}>Loading Camera...</Text>
//       </View>
//     );
//   }

//   const panelHeight = useSharedValue(0);
//   const MAX_PANEL_HEIGHT = 300;
//   const panGesture = Gesture.Pan()
//     .onUpdate((event) => {
//       panelHeight.value = Math.max(
//         0,
//         Math.min(event.translationY + MAX_PANEL_HEIGHT, MAX_PANEL_HEIGHT)
//       );
//     })
//     .onEnd(() => {
//       panelHeight.value =
//         panelHeight.value > MAX_PANEL_HEIGHT / 2
//           ? withTiming(MAX_PANEL_HEIGHT, { duration: 200 })
//           : withTiming(0, { duration: 120 });
//     });

//   const panelStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: panelHeight.value }],
//   }));

//   return (
//     <View style={styles.container}>
//       <StatusBar />
//       <SafeAreaView style={styles.container}>
//         <GestureDetector gesture={composedGesture}>
//           <ReanimatedCamera
//             ref={camera}
//             style={StyleSheet.absoluteFillObject}
//             photo={true}
//             device={device}
//             isActive={isCameraActive}
//             resizeMode="cover"
//             preview={true}
//             exposure={exposure}
//             torch={torch}
//             animatedProps={animatedProps}
//           />
//         </GestureDetector>
//         <BlurView
//           intensity={100}
//           tint="dark"
//           style={{
//             position: "absolute",
//             bottom: 10,
//             right: 10,
//             padding: 10,
//           }}
//           experimentalBlurMethod="dimezisBlurView"
//         />
//         <View style={styles.modeSelection}>
//           {["Photo", "Video", "Portrait", "Panorama"].map((mode) => (
//             <TouchableOpacity
//               key={mode}
//               style={[
//                 styles.modeButton,
//                 { backgroundColor: selectedMode === mode ? "#559" : "white" },
//               ]}
//               onPress={() => setSelectedMode(mode)}
//             >
//               <Text
//                 style={[
//                   styles.modeText,
//                   { color: selectedMode === mode ? "white" : "black" },
//                 ]}
//               >
//                 {mode}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//         <View style={styles.sliderContainer}>
//           {showZoomControls && (
//             <ZoomControls
//               zoom={zoom}
//               setShowZoomControls={setShowZoomControls}
//             />
//           )}
//         </View>
//         <View style={styles.sliderContainerexposure}>
//           {showExposureControls && (
//             <ExposureControls
//               setExposure={setExposure}
//               setShowExposureControls={setShowExposureControls}
//               exposure={exposure}
//             />
//           )}
//         </View>
//         <View style={styles.flashContainer}>
//           <ObscuraButton
//             iconName={flash === "on" ? "flash-sharp" : "flash-off-sharp"}
//             onPress={() => setFlash((f) => (f === "off" ? "on" : "off"))}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>
//         <View style={styles.settingsContainer}>
//           <ObscuraButton
//             iconName="magnet-sharp"
//             onPress={() => setShowZoomControls((s) => !s)}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>
//         <View style={styles.exposureContainer}>
//           <ObscuraButton
//             iconName="eye-sharp"
//             onPress={() => setShowExposureControls((s) => !s)}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>
//         <View style={styles.captureButtonContainer}>
//           <TouchableOpacity onPress={openGallery}>
//             <Ionicons name="images-outline" size={width * 0.09} color="white" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
//             <Ionicons name="camera" size={48} color="white" />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={toggleCameraType}>
//             <Ionicons name="sync-circle" size={width * 0.115} color="white" />
//           </TouchableOpacity>
//         </View>
//         <GestureDetector gesture={panGesture}>
//           <Animated.View style={[styles.draggablePanel, panelStyle]}>
//             <View style={styles.panelHandle} />
//             <CameraNavPanel
//               onSyncPress={toggleCameraType}
//               selectedModeprop={selectedMode}
//               onModeChange={setSelectedMode}
//               aiMode={aiMode}
//               setAiMode={setAiMode}
//             />
//           </Animated.View>
//         </GestureDetector>
//         <Animated.View style={[focusBoxStyle, { zIndex: 1000 }]} />
//       </SafeAreaView>
//     </View>
//   );
// };

// function debounce<T extends (...args: any[]) => void>(
//   func: T,
//   wait: number
// ): (...args: Parameters<T>) => void {
//   let timeout: NodeJS.Timeout | null = null;
//   return (...args: Parameters<T>) => {
//     if (timeout) clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "transparent",
//     justifyContent: "flex-end",
//     paddingTop: 40,
//     paddingBottom: 40,
//   },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "black",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   loadingText: { color: "white", fontSize: 18 },
//   modeSelection: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     position: "absolute",
//     bottom: 130,
//     width: "100%",
//   },
//   modeButton: {
//     backgroundColor: "rgb(255, 255, 255)",
//     padding: 10,
//     borderRadius: 35,
//   },
//   modeText: {
//     color: "black",
//     fontSize: 11,
//   },
//   sliderContainer: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   sliderContainerexposure: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   flashContainer: {
//     position: "absolute",
//     top: 50,
//     right: 20,
//   },
//   settingsContainer: {
//     position: "absolute",
//     top: 50,
//     left: 20,
//   },
//   exposureContainer: {
//     position: "absolute",
//     top: 110,
//     right: 20,
//   },
//   captureButtonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     marginBottom: 40,
//     bottom: -35,
//   },
//   captureButton: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: "rgb(26, 110, 158)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   draggablePanel: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 300,
//     backgroundColor: "rgb(0, 0, 0)",
//     borderTopLeftRadius: 35,
//     borderTopRightRadius: 35,
//     zIndex: 100,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   panelHandle: {
//     width: 40,
//     height: 4,
//     backgroundColor: "white",
//     borderRadius: 2,
//     alignSelf: "center",
//     marginTop: 10,
//   },
// });

// export default HomeScreen;

//working

// import React, { useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   useWindowDimensions,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { StatusBar } from "expo-status-bar";
// import {
//   Camera,
//   useCameraDevice,
//   useCameraPermission,
//   Frame,
// } from "react-native-vision-camera";
// import { Redirect, router } from "expo-router";
// import { BlurView } from "expo-blur";
// import ObscuraButton from "@/components/ObscuraButton";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   useAnimatedProps,
//   withTiming,
//   runOnJS,
// } from "react-native-reanimated";
// import { Gesture, GestureDetector } from "react-native-gesture-handler";
// import * as MediaLibrary from "expo-media-library";
// import ZoomControls from "@/components/ZoomControls";
// import ExposureControls from "@/components/ExposureControls";
// import CameraNavPanel from "./CameranavPanel";

// Animated.addWhitelistedNativeProps({ zoom: true });
// const ReanimatedCamera = Animated.createAnimatedComponent(Camera);

// const HomeScreen = () => {
//   const [aiMode, setAiMode] = useState(false);
//   const [angleMode, setAngleMode] = useState(false);
//   const { hasPermission } = useCameraPermission();
//   const microphonePermission = Camera.getMicrophonePermissionStatus();
//   const [showZoomControls, setShowZoomControls] = useState(false);
//   const [showExposureControls, setShowExposureControls] = useState(false);
//   const { width } = useWindowDimensions();
//   const [selectedMode, setSelectedMode] = useState<string>("Photo");
//   const [isCameraActive, setIsCameraActive] = useState(true);
//   const camera = React.useRef<Camera>(null);

//   const [cameraType, setCameraType] = useState<"back" | "front">("back");
//   const [exposure, setExposure] = useState(0);
//   const [flash, setFlash] = useState<"off" | "on">("off");
//   const [torch, setTorch] = useState<"off" | "on">("off");

//   const device = useCameraDevice(cameraType, {
//     physicalDevices: cameraType === "back" ? ["wide-angle-camera"] : undefined,
//   });

//   const zoom = useSharedValue(device?.neutralZoom ?? 1);
//   const zoomOffset = useSharedValue(0);

//   // Focus bounding box state
//   const focusX = useSharedValue(0);
//   const focusY = useSharedValue(0);
//   const focusWidth = useSharedValue(100); // Dynamic width
//   const focusHeight = useSharedValue(100); // Dynamic height
//   const showFocusBox = useSharedValue(0);

//   // Pinch-to-zoom gesture
//   const pinchGesture = Gesture.Pinch()
//     .onBegin(() => {
//       zoomOffset.value = zoom.value;
//     })
//     .onUpdate((event) => {
//       const z = zoomOffset.value * event.scale;
//       zoom.value = Math.min(
//         Math.max(z, device?.minZoom ?? 1),
//         Math.min(device?.maxZoom ?? 16, 16)
//       );
//     });

//   // Simulate object detection (replace with real detection logic)
//   const detectObject = (frame: Frame, x: number, y: number) => {
//     // Placeholder: Simulate an object at tap point with random size
//     // In reality, use a library like vision-camera-dynamsoft-barcode or ML model
//     const detectedWidth = Math.random() * 100 + 50; // 50-150px
//     const detectedHeight = Math.random() * 100 + 50; // 50-150px
//     return {
//       x: x - detectedWidth / 2,
//       y: y - detectedHeight / 2,
//       width: detectedWidth,
//       height: detectedHeight,
//     };
//   };

//   // Send to backend (placeholder)
//   const sendToBackend = async (
//     x: number,
//     y: number,
//     width: number,
//     height: number
//   ) => {
//     try {
//       console.log("Sending to backend:", { x, y, width, height });
//       // Replace with your backend endpoint
//       const response = await fetch("https://your-backend-api.com/focus", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           x,
//           y,
//           width,
//           height,
//           timestamp: Date.now(),
//         }),
//       });
//       const result = await response.json();
//       console.log("Backend response:", result);
//     } catch (error) {
//       console.error("Failed to send to backend:", error);
//     }
//   };

//   const focus = useCallback(
//     debounce(async (point: { x: number; y: number }) => {
//       console.log("Focusing at:", point);
//       const c = camera.current;
//       if (c == null || !device?.supportsFocus) {
//         console.log("Camera not available or focus not supported");
//         return;
//       }

//       // Simulate capturing the current frame for object detection
//       const frame = await c.takeSnapshot({ quality: 85 });
//       const detected = detectObject(
//         { width: frame.width, height: frame.height } as Frame,
//         point.x,
//         point.y
//       );

//       // Update bounding box to match detected object
//       focusX.value = detected.x;
//       focusY.value = detected.y;
//       focusWidth.value = detected.width;
//       focusHeight.value = detected.height;
//       showFocusBox.value = withTiming(1, { duration: 200 });

//       console.log("Focus box set to:", detected);

//       c.focus(point).catch((error) => {
//         if (
//           error.message.includes("focus-canceled") ||
//           error.code === "capture/focus-canceled"
//         ) {
//           console.log("Focus canceled by a new request, ignoring...");
//         } else {
//           console.error("Failed to focus:", error);
//         }
//       });

//       // Send detected object data to backend
//       sendToBackend(detected.x, detected.y, detected.width, detected.height);

//       setTimeout(() => {
//         showFocusBox.value = withTiming(0, { duration: 200 });
//         console.log("Focus box hidden");
//       }, 1000);
//     }, 300),
//     [
//       device?.supportsFocus,
//       focusX,
//       focusY,
//       focusWidth,
//       focusHeight,
//       showFocusBox,
//     ]
//   );

// const tapGesture = Gesture.Tap().onEnd((event) => {
//   console.log("Tap detected at:", event.x, event.y);
//   runOnJS(focus)({ x: event.x, y: event.y });
// });

//   const composedGesture = Gesture.Simultaneous(pinchGesture, tapGesture);

//   const animatedProps = useAnimatedProps(() => ({ zoom: zoom.value }), [zoom]);

//   const focusBoxStyle = useAnimatedStyle(() => ({
//     position: "absolute",
//     width: focusWidth.value,
//     height: focusHeight.value,
//     borderWidth: 2,
//     borderColor: "red",
//     opacity: showFocusBox.value,
//     top: focusY.value,
//     left: focusX.value,
//     backgroundColor: "rgba(255, 0, 0, 0.3)",
//   }));

//   const toggleCameraType = () => {
//     setCameraType((prev) => (prev === "back" ? "front" : "back"));
//     zoom.value = device?.neutralZoom ?? 1;
//   };

//   const openGallery = () => {
//     setIsCameraActive(false);
//     router.push("/media");
//   };

//   const takePicture = async () => {
//     try {
//       if (camera.current == null) throw new Error("Camera ref is null!");
//       const { status } = await MediaLibrary.requestPermissionsAsync();
//       if (status !== "granted") {
//         alert("Permission to access media library is required to save photos.");
//         return;
//       }
//       console.log("Taking photo...");
//       const photo = await camera.current.takePhoto({
//         flash: flash,
//         enableShutterSound: false,
//       });
//       await MediaLibrary.saveToLibraryAsync(photo.path);
//       console.log("Photo saved to gallery:", photo.path);
//     } catch (e) {
//       console.error("Failed to take photo or save!", e);
//       alert("Failed to save the photo. Please try again.");
//     }
//   };

//   const toggleAiMode = () => setAiMode(!aiMode);
//   const toggleAngleMode = () => setAngleMode(!angleMode);

//   if (!hasPermission || microphonePermission === "not-determined") {
//     return <Redirect href={"/permissions"} />;
//   }
//   if (!device) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.loadingText}>Loading Camera...</Text>
//       </View>
//     );
//   }

//   const panelHeight = useSharedValue(0);
//   const MAX_PANEL_HEIGHT = 300;
//   const panGesture = Gesture.Pan()
//     .onUpdate((event) => {
//       panelHeight.value = Math.max(
//         0,
//         Math.min(event.translationY + MAX_PANEL_HEIGHT, MAX_PANEL_HEIGHT)
//       );
//     })
//     .onEnd(() => {
//       panelHeight.value =
//         panelHeight.value > MAX_PANEL_HEIGHT / 2
//           ? withTiming(MAX_PANEL_HEIGHT, { duration: 200 })
//           : withTiming(0, { duration: 120 });
//     });

//   const panelStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: panelHeight.value }],
//   }));

//   return (
//     <View style={styles.container}>
//       <StatusBar />
//       <SafeAreaView style={styles.container}>
//         <GestureDetector gesture={composedGesture}>
//           <ReanimatedCamera
//             ref={camera}
//             style={StyleSheet.absoluteFillObject}
//             photo={true}
//             device={device}
//             isActive={isCameraActive}
//             resizeMode="cover"
//             preview={true}
//             exposure={exposure}
//             torch={torch}
//             animatedProps={animatedProps}
//           />
//         </GestureDetector>
//         <BlurView
//           intensity={100}
//           tint="dark"
//           style={{
//             position: "absolute",
//             bottom: 10,
//             right: 10,
//             padding: 10,
//           }}
//           experimentalBlurMethod="dimezisBlurView"
//         />
//         <View style={styles.modeSelection}>
//           {["Photo", "Video", "Portrait", "Panorama"].map((mode) => (
//             <TouchableOpacity
//               key={mode}
//               style={[
//                 styles.modeButton,
//                 { backgroundColor: selectedMode === mode ? "#559" : "white" },
//               ]}
//               onPress={() => setSelectedMode(mode)}
//             >
//               <Text
//                 style={[
//                   styles.modeText,
//                   { color: selectedMode === mode ? "white" : "black" },
//                 ]}
//               >
//                 {mode}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//         <View style={styles.sliderContainer}>
//           {showZoomControls && (
//             <ZoomControls
//               zoom={zoom}
//               setShowZoomControls={setShowZoomControls}
//             />
//           )}
//         </View>
//         <View style={styles.sliderContainerexposure}>
//           {showExposureControls && (
//             <ExposureControls
//               setExposure={setExposure}
//               setShowExposureControls={setShowExposureControls}
//               exposure={exposure}
//             />
//           )}
//         </View>
//         <View style={styles.flashContainer}>
//           <ObscuraButton
//             iconName={flash === "on" ? "flash-sharp" : "flash-off-sharp"}
//             onPress={() => setFlash((f) => (f === "off" ? "on" : "off"))}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>
//         <View style={styles.settingsContainer}>
//           <ObscuraButton
//             iconName="magnet-sharp"
//             onPress={() => setShowZoomControls((s) => !s)}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>
//         <View style={styles.exposureContainer}>
//           <ObscuraButton
//             iconName="eye-sharp"
//             onPress={() => setShowExposureControls((s) => !s)}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>
//         <View style={styles.captureButtonContainer}>
//           <TouchableOpacity onPress={openGallery}>
//             <Ionicons name="images-outline" size={width * 0.09} color="white" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
//             <Ionicons name="camera" size={48} color="white" />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={toggleCameraType}>
//             <Ionicons name="sync-circle" size={width * 0.115} color="white" />
//           </TouchableOpacity>
//         </View>
//         <GestureDetector gesture={panGesture}>
//           <Animated.View style={[styles.draggablePanel, panelStyle]}>
//             <View style={styles.panelHandle} />
//             <CameraNavPanel
//               onSyncPress={toggleCameraType}
//               selectedModeprop={selectedMode}
//               onModeChange={setSelectedMode}
//             />
//           </Animated.View>
//         </GestureDetector>
//         <Animated.View style={[focusBoxStyle, { zIndex: 1000 }]} />
//       </SafeAreaView>
//     </View>
//   );
// };

// function debounce<T extends (...args: any[]) => void>(
//   func: T,
//   wait: number
// ): (...args: Parameters<T>) => void {
//   let timeout: NodeJS.Timeout | null = null;
//   return (...args: Parameters<T>) => {
//     if (timeout) clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "transparent",
//     justifyContent: "flex-end",
//     paddingTop: 40,
//     paddingBottom: 40,
//   },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "black",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   loadingText: { color: "white", fontSize: 18 },
//   modeSelection: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     position: "absolute",
//     bottom: 130,
//     width: "100%",
//   },
//   modeButton: {
//     backgroundColor: "rgb(255, 255, 255)",
//     padding: 10,
//     borderRadius: 35,
//   },
//   modeText: {
//     color: "black",
//     fontSize: 11,
//   },
//   sliderContainer: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   sliderContainerexposure: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   flashContainer: {
//     position: "absolute",
//     top: 50,
//     right: 20,
//   },
//   settingsContainer: {
//     position: "absolute",
//     top: 50,
//     left: 20,
//   },
//   exposureContainer: {
//     position: "absolute",
//     top: 110,
//     right: 20,
//   },
//   captureButtonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     marginBottom: 40,
//     bottom: -35,
//   },
//   captureButton: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: "rgb(26, 110, 158)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   draggablePanel: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 300,
//     backgroundColor: "rgb(0, 0, 0)",
//     borderTopLeftRadius: 35,
//     borderTopRightRadius: 35,
//     zIndex: 100,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   panelHandle: {
//     width: 40,
//     height: 4,
//     backgroundColor: "white",
//     borderRadius: 2,
//     alignSelf: "center",
//     marginTop: 10,
//   },
// });

// export default HomeScreen;

//test

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  Frame,
} from "react-native-vision-camera";
import { Redirect, router } from "expo-router";
import { BlurView } from "expo-blur";
import ObscuraButton from "@/components/ObscuraButton";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as MediaLibrary from "expo-media-library";
import ZoomControls from "@/components/ZoomControls";
import ExposureControls from "@/components/ExposureControls";
import CameraNavPanel from "./CameranavPanel";
import * as FileSystem from "expo-file-system";

Animated.addWhitelistedNativeProps({ zoom: true });
const ReanimatedCamera = Animated.createAnimatedComponent(Camera);

const HomeScreen = () => {
  const [aiMode, setAiMode] = useState(false);
  const [angleMode, setAngleMode] = useState(false);
  const { hasPermission } = useCameraPermission();
  const microphonePermission = Camera.getMicrophonePermissionStatus();
  const [showZoomControls, setShowZoomControls] = useState(false);
  const [showExposureControls, setShowExposureControls] = useState(false);
  const { width } = useWindowDimensions();
  const [selectedMode, setSelectedMode] = useState<string>("Photo");
  const [isCameraActive, setIsCameraActive] = useState(true);
  const camera = React.useRef<Camera>(null);
  const [isScreenFrozen, setIsScreenFrozen] = useState<boolean>(false);
  const [hasPrediction, setHasPrediction] = useState(false);
  const [cameraType, setCameraType] = useState<"back" | "front">("back");
  const [exposure, setExposure] = useState(0);
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [torch, setTorch] = useState<"off" | "on">("off");
  const TEMP_FOLDER =
    FileSystem.documentDirectory + "Backend/snappy-ai-backend/temp_images/";

  const device = useCameraDevice(cameraType, {
    physicalDevices: cameraType === "back" ? ["wide-angle-camera"] : undefined,
  });

  const zoom = useSharedValue(device?.neutralZoom ?? 1);
  const zoomOffset = useSharedValue(0);

  // Focus bounding box state
  const focusX = useSharedValue(0);
  const focusY = useSharedValue(0);
  const focusWidth = useSharedValue(100);
  const focusHeight = useSharedValue(100);
  const showFocusBox = useSharedValue(0);

  // Ensure TEMP_FOLDER exists
  useEffect(() => {
    const ensureTempFolder = async () => {
      const folderInfo = await FileSystem.getInfoAsync(TEMP_FOLDER);
      if (!folderInfo.exists) {
        await FileSystem.makeDirectoryAsync(TEMP_FOLDER, {
          intermediates: true,
        });
        console.log("Created temp folder:", TEMP_FOLDER);
      }
    };
    ensureTempFolder().catch((err) =>
      console.error("Failed to create temp folder:", err)
    );
  }, [TEMP_FOLDER]);

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

  const longPressGesture = Gesture.LongPress().onStart((event) => {
    if (aiMode && !isScreenFrozen) {
      focusX.value = event.absoluteX - focusWidth.value / 2;
      focusY.value = event.absoluteY - focusHeight.value / 2;
      try {
        console.log("Long press triggered, calling handleLongPress...");
        runOnJS(setIsScreenFrozen)(true);
        console.log(setIsScreenFrozen);

        runOnJS(() => {
          handleLongPress().catch((err) => {
            console.error("Error in handleLongPress (async):", err);
            runOnJS(setIsScreenFrozen)(false);
          });
        })();

        // runOnJS(handleLongPress);
      } catch (error) {
        console.error("Error in longPressGesture:", error);
        runOnJS(setIsScreenFrozen)(false);
      }
    }
  });

  // const handleLongPress = useCallback(async () => {
  //   if (!camera.current) {
  //     console.error("Camera ref is not available");
  //     setIsScreenFrozen(false);
  //     return;
  //   }

  //   try {
  //     const photo = await camera.current.takePhoto({
  //       flash: flash,
  //       enableShutterSound: false,
  //     });
  //     if (!photo) throw new Error("Failed to capture photo");

  //     const filename = `temp_${Date.now()}.jpg`;
  //     const tempPath = TEMP_FOLDER + filename;
  //     await FileSystem.moveAsync({
  //       from: photo.path,
  //       to: tempPath,
  //     });
  //     console.log("Saved temp image at:", tempPath);

  //     const bbox = {
  //       x: focusX.value,
  //       y: focusY.value,
  //       width: focusWidth.value,
  //       height: focusHeight.value,
  //     };

  //     const payload = { filename, bbox };
  //     console.log("Sending to Flask:", payload);

  //     const response = await fetch("http://192.168.1.100:5000/predict", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });

  //     const result = await response.json();
  //     if (response.status === 200) {
  //       console.log("Prediction received from Flask:", result.prediction);
  //       setHasPrediction(true);
  //       setIsScreenFrozen(false);
  //       setAiMode(false);
  //     } else {
  //       throw new Error(`Flask API returned status: ${response.status}`);
  //     }
  //   } catch (err) {
  //     console.error("Error in handleLongPress:", err);
  //     setIsScreenFrozen(false);
  //   }
  // }, [flash, focusX, focusY, focusWidth, focusHeight, TEMP_FOLDER]);

  const handleLongPress = async () => {
    try {
      // Check if camera is available
      if (!camera.current) {
        throw new Error("Camera reference is not available");
      }

      console.log("Taking photo...");
      const photo = await camera.current.takePhoto({
        flash: "off",
        enableShutterSound: false,
      });
      if (!photo) throw new Error("Photo capture failed");

      const tempPath = `${TEMP_FOLDER}temp_${Date.now()}.jpg`;
      console.log("Moving file to:", tempPath);

      // Verify source file exists
      const fileInfo = await FileSystem.getInfoAsync(photo.path);
      if (!fileInfo.exists) {
        throw new Error(`Source file not found: ${photo.path}`);
      }

      await FileSystem.moveAsync({ from: photo.path, to: tempPath });
      console.log("File saved successfully");

      console.log("Sending request to API...");
      const response = await fetch("http://192.168.1.100:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: tempPath }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Success:", result);
    } catch (err) {
      console.error("Detailed error in handleLongPress:", {
        // message: err.message || "Unknown error",
        // stack: err.stack || "No stack trace",
      });
      throw err; // Re-throw to ensure the gesture handler logs it
    }
  };

  console.log("handleLongPress defined:", !!handleLongPress);

  const composedGesture = Gesture.Simultaneous(pinchGesture, longPressGesture);

  const animatedProps = useAnimatedProps(() => ({ zoom: zoom.value }), [zoom]);

  const focusBoxStyle = useAnimatedStyle(
    () => ({
      position: "absolute",
      width: focusWidth.value,
      height: focusHeight.value,
      borderWidth: 2,
      borderColor: "red",
      opacity: aiMode && !isScreenFrozen ? showFocusBox.value : 0,
      top: focusY.value,
      left: focusX.value,
      backgroundColor: "rgba(255, 0, 0, 0.3)",
    }),
    [aiMode, isScreenFrozen]
  );

  const toggleCameraType = () => {
    setCameraType((prev) => (prev === "back" ? "front" : "back"));
    zoom.value = device?.neutralZoom ?? 1;
  };

  const detectObject = (frame: Frame, x: number, y: number) => {
    const detectedWidth = Math.random() * 100 + 50;
    const detectedHeight = Math.random() * 100 + 50;
    return {
      x: x - detectedWidth / 2,
      y: y - detectedHeight / 2,
      width: detectedWidth,
      height: detectedHeight,
    };
  };

  const sendToBackend = async (
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    try {
      console.log("Sending to backend:", { x, y, width, height });
      const response = await fetch("https://your-backend-api.com/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          x,
          y,
          width,
          height,
          timestamp: Date.now(),
        }),
      });
      const result = await response.json();
      console.log("Backend response:", result);
    } catch (error) {
      console.error("Failed to send to backend:", error);
    }
  };

  const focus = useCallback(
    debounce(async (point: { x: number; y: number }) => {
      console.log("Focusing at:", point);
      const c = camera.current;
      if (c == null || !device?.supportsFocus) {
        console.log("Camera not available or focus not supported");
        return;
      }

      const frame = await c.takeSnapshot({ quality: 85 });
      const detected = detectObject(
        { width: frame.width, height: frame.height } as Frame,
        point.x,
        point.y
      );

      focusX.value = detected.x;
      focusY.value = detected.y;
      focusWidth.value = detected.width;
      focusHeight.value = detected.height;
      showFocusBox.value = withTiming(1, { duration: 200 });

      console.log("Focus box set to:", detected);

      c.focus(point).catch((error) => {
        if (
          error.message.includes("focus-canceled") ||
          error.code === "capture/focus-canceled"
        ) {
          console.log("Focus canceled by a new request, ignoring...");
        } else {
          console.error("Failed to focus:", error);
        }
      });

      sendToBackend(detected.x, detected.y, detected.width, detected.height);

      setTimeout(() => {
        showFocusBox.value = withTiming(0, { duration: 200 });
        console.log("Focus box hidden");
      }, 1000);
    }, 300),
    [
      device?.supportsFocus,
      focusX,
      focusY,
      focusWidth,
      focusHeight,
      showFocusBox,
    ]
  );

  const openGallery = () => {
    setIsCameraActive(false);
    router.push("/media");
  };

  const takePicture = async () => {
    try {
      if (camera.current == null) throw new Error("Camera ref is null!");
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
      await MediaLibrary.saveToLibraryAsync(photo.path);
      console.log("Photo saved to gallery:", photo.path);
    } catch (e) {
      console.error("Failed to take photo or save!", e);
      alert("Failed to save the photo. Please try again.");
    }
  };

  const toggleAiMode = () => setAiMode(!aiMode);
  const toggleAngleMode = () => setAngleMode(!angleMode);

  if (!hasPermission || microphonePermission === "not-determined") {
    return <Redirect href={"/permissions"} />;
  }
  if (!device) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Camera...</Text>
      </View>
    );
  }

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
            isActive={isCameraActive && !isScreenFrozen}
            resizeMode="cover"
            preview={true}
            exposure={exposure}
            torch={torch}
            animatedProps={animatedProps}
          />
        </GestureDetector>
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
        />
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
            />
          </Animated.View>
        </GestureDetector>
        <Animated.View style={[focusBoxStyle, { zIndex: 1000 }]} />
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
});

export default HomeScreen;

//below not working

// import React, { useState, useCallback, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   useWindowDimensions,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { StatusBar } from "expo-status-bar";
// import {
//   Camera,
//   useCameraDevice,
//   useCameraPermission,
//   Frame,
// } from "react-native-vision-camera";
// import { Redirect, router } from "expo-router";
// import { BlurView } from "expo-blur";
// import ObscuraButton from "@/components/ObscuraButton";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   useAnimatedProps,
//   withTiming,
//   runOnJS,
// } from "react-native-reanimated";
// import { Gesture, GestureDetector } from "react-native-gesture-handler";
// import * as MediaLibrary from "expo-media-library";
// import ZoomControls from "@/components/ZoomControls";
// import ExposureControls from "@/components/ExposureControls";
// import * as FileSystem from "expo-file-system";
// import CameraNavPanel from "./CameranavPanel";

// Animated.addWhitelistedNativeProps({ zoom: true });
// const ReanimatedCamera = Animated.createAnimatedComponent(Camera);
// const TEMP_FOLDER = FileSystem.documentDirectory + "temp_images/";

// const HomeScreen = () => {
//   const [aiMode, setAiMode] = useState(false);
//   const [angleMode, setAngleMode] = useState(false);
//   const { hasPermission } = useCameraPermission();
//   const microphonePermission = Camera.getMicrophonePermissionStatus();
//   const [showZoomControls, setShowZoomControls] = useState(false);
//   const [showExposureControls, setShowExposureControls] = useState(false);
//   const { width } = useWindowDimensions();
//   const [selectedMode, setSelectedMode] = useState<string>("Photo");
//   const [isCameraActive, setIsCameraActive] = useState(true);
//   const camera = React.useRef<Camera>(null);

//   const [cameraType, setCameraType] = useState<"back" | "front">("back");
//   const [exposure, setExposure] = useState(0);
//   const [flash, setFlash] = useState<"off" | "on">("off");
//   const [torch, setTorch] = useState<"off" | "on">("off");
//   const [selectedObject, setSelectedObject] = useState<string>("Auto");

//   const device = useCameraDevice(cameraType, {
//     physicalDevices: cameraType === "back" ? ["wide-angle-camera"] : undefined,
//   });

//   const zoom = useSharedValue(device?.neutralZoom ?? 1);
//   const zoomOffset = useSharedValue(0);

//   // Focus bounding box state
//   const focusX = useSharedValue(0);
//   const focusY = useSharedValue(0);
//   const focusWidth = useSharedValue(100); // Dynamic width
//   const focusHeight = useSharedValue(100); // Dynamic height
//   const showFocusBox = useSharedValue(0);

//   // Focus bounding box state (for demonstration)
//   const [predictions, setPredictions] = useState<any[]>([]);
//   const [selectedPrediction, setSelectedPrediction] = useState<any>(null);
//   const [cameraDimensions, setCameraDimensions] = useState({
//     width: 640,
//     height: 480,
//   });
//   const { width: screenWidth, height: screenHeight } = useWindowDimensions();

//   // Ensure the temp folder exists
//   useEffect(() => {
//     (async () => {
//       const dirInfo = await FileSystem.getInfoAsync(TEMP_FOLDER);
//       if (!dirInfo.exists) {
//         await FileSystem.makeDirectoryAsync(TEMP_FOLDER, {
//           intermediates: true,
//         });
//         console.log("Created TEMP_FOLDER at", TEMP_FOLDER);
//       }
//     })();
//   }, []);

//   // Example: Dummy object detection predictions (replace with real logic)
//   // For demo, we assume predictions come from elsewhere.
//   // Here, we simulate a detection for testing purposes.
//   useEffect(() => {
//     // Simulate a prediction after 5 seconds for demonstration
//     setTimeout(() => {
//       setPredictions([
//         { bbox: [100, 150, 200, 150], class: "vehicle", score: 0.9 },
//       ]);
//     }, 5000);
//   }, []);

//   // Handler for tapping on the screen (to send temp image and bounding box to Flask)
//   const handleTouch = useCallback(
//     async (event: {
//       nativeEvent: { locationX: number; locationY: number };
//     }) => {
//       // Only process if in Auto mode
//       if (selectedObject !== "Auto") return;

//       const { locationX, locationY } = event.nativeEvent;
//       // For simplicity, find the first prediction that contains the tap
//       const tappedPrediction = predictions.find((pred) => {
//         const [x, y, w, h] = pred.bbox;
//         return (
//           locationX >= x &&
//           locationX <= x + w &&
//           locationY >= y &&
//           locationY <= y + h
//         );
//       });

//       if (!tappedPrediction) {
//         console.log("No detection at tap point");
//         return;
//       }

//       setSelectedPrediction(tappedPrediction);
//       console.log("Tapped prediction:", tappedPrediction);

//       try {
//         // Capture a snapshot from the camera
//         const photo = await camera.current?.takeSnapshot({ quality: 0.2 });
//         if (!photo) throw new Error("Failed to capture photo");

//         // Define a unique filename for the temp image
//         const filename = `temp_${Date.now()}.jpg`;
//         const tempPath = TEMP_FOLDER + filename;

//         // Move the snapshot file to the temp folder
//         await FileSystem.moveAsync({
//           from: photo.path,
//           to: tempPath,
//         });
//         console.log("Saved temp image at:", tempPath);

//         // Calculate bounding box (for demo, use tappedPrediction directly)
//         const [x, y, w, h] = tappedPrediction.bbox;
//         const payload = {
//           filename,
//           bbox: { x, y, width: w, height: h },
//           state: {}, // Add any additional state if needed
//         };

//         console.log("Sending payload to Flask API:", payload);
//         const response = await fetch("http://localhost:5000/predict", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         });
//         const result = await response.json();
//         console.log("Flask API response:", result);
//         // Optionally handle result here (update UI, etc.)
//       } catch (err) {
//         console.error("Error in handleTouch:", err);
//         setSelectedPrediction(null);
//       }
//     },
//     [predictions, selectedObject]
//   );

//   // Pinch-to-zoom gesture
//   const pinchGesture = Gesture.Pinch()
//     .onBegin(() => {
//       zoomOffset.value = zoom.value;
//     })
//     .onUpdate((event) => {
//       const z = zoomOffset.value * event.scale;
//       zoom.value = Math.min(
//         Math.max(z, device?.minZoom ?? 1),
//         Math.min(device?.maxZoom ?? 16, 16)
//       );
//     });

//   // Simulate object detection (replace with real detection logic)
//   const detectObject = (frame: Frame, x: number, y: number) => {
//     // Placeholder: Simulate an object at tap point with random size
//     // In reality, use a library like vision-camera-dynamsoft-barcode or ML model
//     const detectedWidth = Math.random() * 100 + 50; // 50-150px
//     const detectedHeight = Math.random() * 100 + 50; // 50-150px
//     return {
//       x: x - detectedWidth / 2,
//       y: y - detectedHeight / 2,
//       width: detectedWidth,
//       height: detectedHeight,
//     };
//   };

//   // Send to backend (placeholder)
//   const sendToBackend = async (
//     x: number,
//     y: number,
//     width: number,
//     height: number
//   ) => {
//     try {
//       console.log("Sending to backend:", { x, y, width, height });
//       // Replace with your backend endpoint
//       const response = await fetch("https://your-backend-api.com/focus", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           x,
//           y,
//           width,
//           height,
//           timestamp: Date.now(),
//         }),
//       });
//       const result = await response.json();
//       console.log("Backend response:", result);
//     } catch (error) {
//       console.error("Failed to send to backend:", error);
//     }
//   };

//   const focus = useCallback(
//     debounce(async (point: { x: number; y: number }) => {
//       console.log("Focusing at:", point);
//       const c = camera.current;
//       if (c == null || !device?.supportsFocus) {
//         console.log("Camera not available or focus not supported");
//         return;
//       }

//       // Simulate capturing the current frame for object detection
//       const frame = await c.takeSnapshot({ quality: 85 });
//       const detected = detectObject(
//         { width: frame.width, height: frame.height } as Frame,
//         point.x,
//         point.y
//       );

//       // Update bounding box to match detected object
//       focusX.value = detected.x;
//       focusY.value = detected.y;
//       focusWidth.value = detected.width;
//       focusHeight.value = detected.height;
//       showFocusBox.value = withTiming(1, { duration: 200 });

//       console.log("Focus box set to:", detected);

//       c.focus(point).catch((error) => {
//         if (
//           error.message.includes("focus-canceled") ||
//           error.code === "capture/focus-canceled"
//         ) {
//           console.log("Focus canceled by a new request, ignoring...");
//         } else {
//           console.error("Failed to focus:", error);
//         }
//       });

//       // Send detected object data to backend
//       sendToBackend(detected.x, detected.y, detected.width, detected.height);

//       setTimeout(() => {
//         showFocusBox.value = withTiming(0, { duration: 200 });
//         console.log("Focus box hidden");
//       }, 1000);
//     }, 300),
//     [
//       device?.supportsFocus,
//       focusX,
//       focusY,
//       focusWidth,
//       focusHeight,
//       showFocusBox,
//     ]
//   );

//   // const tapGesture = Gesture.Tap().onEnd((event) => {
//   //   console.log("Tap detected at:", event.x, event.y);
//   //   runOnJS(focus)({ x: event.x, y: event.y });
//   // });

//   const tapGesture = Gesture.Tap().onEnd((event) => {
//     console.log("Tap detected at:", event.x, event.y);
//     runOnJS(focus)({ x: event.x, y: event.y });
//     handleTouch({
//       nativeEvent: { locationX: event.x, locationY: event.y },
//     });
//   });

//   const composedGesture = Gesture.Simultaneous(pinchGesture, tapGesture);

//   // const composedGesture = Gesture.Simultaneous(tapGesture);

//   const animatedProps = useAnimatedProps(() => ({ zoom: zoom.value }), [zoom]);

//   const focusBoxStyle = useAnimatedStyle(() => ({
//     position: "absolute",
//     width: focusWidth.value,
//     height: focusHeight.value,
//     borderWidth: 2,
//     borderColor: "red",
//     opacity: showFocusBox.value,
//     top: focusY.value,
//     left: focusX.value,
//     backgroundColor: "rgba(255, 0, 0, 0.3)",
//   }));

//   const toggleCameraType = () => {
//     setCameraType((prev) => (prev === "back" ? "front" : "back"));
//     zoom.value = device?.neutralZoom ?? 1;
//   };

//   const openGallery = () => {
//     setIsCameraActive(false);
//     router.push("/media");
//   };

//   const takePicture = async () => {
//     try {
//       if (camera.current == null) throw new Error("Camera ref is null!");
//       const { status } = await MediaLibrary.requestPermissionsAsync();
//       if (status !== "granted") {
//         alert("Permission to access media library is required to save photos.");
//         return;
//       }
//       console.log("Taking photo...");
//       const photo = await camera.current.takePhoto({
//         flash: flash,
//         enableShutterSound: false,
//       });
//       await MediaLibrary.saveToLibraryAsync(photo.path);
//       console.log("Photo saved to gallery:", photo.path);
//     } catch (e) {
//       console.error("Failed to take photo or save!", e);
//       alert("Failed to save the photo. Please try again.");
//     }
//   };

//   const toggleAiMode = () => setAiMode(!aiMode);
//   const toggleAngleMode = () => setAngleMode(!angleMode);

//   if (!hasPermission || microphonePermission === "not-determined") {
//     return <Redirect href={"/permissions"} />;
//   }
//   if (!device) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.loadingText}>Loading Camera...</Text>
//       </View>
//     );
//   }

//   const panelHeight = useSharedValue(0);
//   const MAX_PANEL_HEIGHT = 300;
//   const panGesture = Gesture.Pan()
//     .onUpdate((event) => {
//       panelHeight.value = Math.max(
//         0,
//         Math.min(event.translationY + MAX_PANEL_HEIGHT, MAX_PANEL_HEIGHT)
//       );
//     })
//     .onEnd(() => {
//       panelHeight.value =
//         panelHeight.value > MAX_PANEL_HEIGHT / 2
//           ? withTiming(MAX_PANEL_HEIGHT, { duration: 200 })
//           : withTiming(0, { duration: 120 });
//     });

//   const panelStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: panelHeight.value }],
//   }));

//   return (
//     <View style={styles.container}>
//       <StatusBar />
//       <SafeAreaView style={styles.container}>
//         <GestureDetector gesture={composedGesture}>
//           <ReanimatedCamera
//             ref={camera}
//             style={StyleSheet.absoluteFillObject}
//             photo={true}
//             device={device}
//             isActive={isCameraActive}
//             resizeMode="cover"
//             preview={true}
//             exposure={exposure}
//             torch={torch}
//             animatedProps={animatedProps}
//           />
//         </GestureDetector>
//         <BlurView
//           intensity={100}
//           tint="dark"
//           style={{
//             position: "absolute",
//             bottom: 10,
//             right: 10,
//             padding: 10,
//           }}
//           experimentalBlurMethod="dimezisBlurView"
//         />
//         <View style={styles.modeSelection}>
//           {["Photo", "Video", "Portrait", "Panorama"].map((mode) => (
//             <TouchableOpacity
//               key={mode}
//               style={[
//                 styles.modeButton,
//                 { backgroundColor: selectedMode === mode ? "#559" : "white" },
//               ]}
//               onPress={() => setSelectedMode(mode)}
//             >
//               <Text
//                 style={[
//                   styles.modeText,
//                   { color: selectedMode === mode ? "white" : "black" },
//                 ]}
//               >
//                 {mode}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//         <View style={styles.sliderContainer}>
//           {showZoomControls && (
//             <ZoomControls
//               zoom={zoom}
//               setShowZoomControls={setShowZoomControls}
//             />
//           )}
//         </View>
//         <View style={styles.sliderContainerexposure}>
//           {showExposureControls && (
//             <ExposureControls
//               setExposure={setExposure}
//               setShowExposureControls={setShowExposureControls}
//               exposure={exposure}
//             />
//           )}
//         </View>
//         <View style={styles.flashContainer}>
//           <ObscuraButton
//             iconName={flash === "on" ? "flash-sharp" : "flash-off-sharp"}
//             onPress={() => setFlash((f) => (f === "off" ? "on" : "off"))}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>
//         <View style={styles.settingsContainer}>
//           <ObscuraButton
//             iconName="magnet-sharp"
//             onPress={() => setShowZoomControls((s) => !s)}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>
//         <View style={styles.exposureContainer}>
//           <ObscuraButton
//             iconName="eye-sharp"
//             onPress={() => setShowExposureControls((s) => !s)}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>
//         <View style={styles.captureButtonContainer}>
//           <TouchableOpacity onPress={openGallery}>
//             <Ionicons name="images-outline" size={width * 0.09} color="white" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
//             <Ionicons name="camera" size={48} color="white" />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={toggleCameraType}>
//             <Ionicons name="sync-circle" size={width * 0.115} color="white" />
//           </TouchableOpacity>
//         </View>
//         <GestureDetector gesture={panGesture}>
//           <Animated.View style={[styles.draggablePanel, panelStyle]}>
//             <View style={styles.panelHandle} />
//             <CameraNavPanel
//               onSyncPress={toggleCameraType}
//               selectedModeprop={selectedMode}
//               onModeChange={setSelectedMode}
//             />
//           </Animated.View>
//         </GestureDetector>
//         <Animated.View style={[focusBoxStyle, { zIndex: 1000 }]} />
//       </SafeAreaView>
//     </View>
//   );
// };

// function debounce<T extends (...args: any[]) => void>(
//   func: T,
//   wait: number
// ): (...args: Parameters<T>) => void {
//   let timeout: NodeJS.Timeout | null = null;
//   return (...args: Parameters<T>) => {
//     if (timeout) clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "transparent",
//     justifyContent: "flex-end",
//     paddingTop: 40,
//     paddingBottom: 40,
//   },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "black",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   loadingText: { color: "white", fontSize: 18 },
//   modeSelection: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     position: "absolute",
//     bottom: 130,
//     width: "100%",
//   },
//   modeButton: {
//     backgroundColor: "rgb(255, 255, 255)",
//     padding: 10,
//     borderRadius: 35,
//   },
//   modeText: {
//     color: "black",
//     fontSize: 11,
//   },
//   sliderContainer: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   sliderContainerexposure: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   flashContainer: {
//     position: "absolute",
//     top: 50,
//     right: 20,
//   },
//   settingsContainer: {
//     position: "absolute",
//     top: 50,
//     left: 20,
//   },
//   exposureContainer: {
//     position: "absolute",
//     top: 110,
//     right: 20,
//   },
//   captureButtonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     marginBottom: 40,
//     bottom: -35,
//   },
//   captureButton: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: "rgb(26, 110, 158)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   draggablePanel: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 300,
//     backgroundColor: "rgb(0, 0, 0)",
//     borderTopLeftRadius: 35,
//     borderTopRightRadius: 35,
//     zIndex: 100,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   panelHandle: {
//     width: 40,
//     height: 4,
//     backgroundColor: "white",
//     borderRadius: 2,
//     alignSelf: "center",
//     marginTop: 10,
//   },
// });

// export default HomeScreen;

// import React, { useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   useWindowDimensions,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { StatusBar } from "expo-status-bar";
// import {
//   Camera,
//   useCameraDevice,
//   useCameraPermission,
// } from "react-native-vision-camera";
// import { Redirect, router } from "expo-router";
// import { BlurView } from "expo-blur";
// import ObscuraButton from "@/components/ObscuraButton";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   useAnimatedProps,
//   withTiming,
//   runOnJS,
// } from "react-native-reanimated";
// import { Gesture, GestureDetector } from "react-native-gesture-handler";
// import * as MediaLibrary from "expo-media-library";
// import ZoomControls from "@/components/ZoomControls";
// import ExposureControls from "@/components/ExposureControls";
// import CameraNavPanel from "./CameranavPanel";

// // Make Camera component animatable
// Animated.addWhitelistedNativeProps({ zoom: true });
// const ReanimatedCamera = Animated.createAnimatedComponent(Camera);

// const HomeScreen = () => {
//   const [aiMode, setAiMode] = useState(false);
//   const [angleMode, setAngleMode] = useState(false);
//   const { hasPermission } = useCameraPermission();
//   const microphonePermission = Camera.getMicrophonePermissionStatus();
//   const [showZoomControls, setShowZoomControls] = useState(false);
//   const [showExposureControls, setShowExposureControls] = useState(false);
//   const { width } = useWindowDimensions();
//   const [selectedMode, setSelectedMode] = useState<string>("Photo");
//   const [isCameraActive, setIsCameraActive] = useState(true);
//   const camera = React.useRef<Camera>(null);

//   const [cameraType, setCameraType] = useState<"back" | "front">("back");
//   const [exposure, setExposure] = useState(0);
//   const [flash, setFlash] = useState<"off" | "on">("off");
//   const [torch, setTorch] = useState<"off" | "on">("off");

//   // Select camera device with wide-angle preference for back camera
//   const device = useCameraDevice(cameraType, {
//     physicalDevices: cameraType === "back" ? ["wide-angle-camera"] : undefined,
//   });

//   // Zoom setup with Reanimated
//   const zoom = useSharedValue(device?.neutralZoom ?? 1);
//   const zoomOffset = useSharedValue(0);

//   // Focus bounding box state
//   const focusX = useSharedValue(0);
//   const focusY = useSharedValue(0);
//   const showFocusBox = useSharedValue(0); // 0 to 1 for opacity animation

//   // Pinch-to-zoom gesture
//   const pinchGesture = Gesture.Pinch()
//     .onBegin(() => {
//       zoomOffset.value = zoom.value;
//     })
//     .onUpdate((event) => {
//       const z = zoomOffset.value * event.scale;
//       zoom.value = Math.min(
//         Math.max(z, device?.minZoom ?? 1),
//         Math.min(device?.maxZoom ?? 16, 16)
//       );
//     });

//   // Debounced tap-to-focus function with bounding box
//   const focus = useCallback(
//     debounce((point: { x: number; y: number }) => {
//       const c = camera.current;
//       if (c == null || !device?.supportsFocus) return;

//       // Set focus point and show bounding box
//       focusX.value = point.x;
//       focusY.value = point.y;
//       showFocusBox.value = withTiming(1, { duration: 200 }); // Fade in

//       c.focus(point).catch((error) => {
//         if (
//           error.message.includes("focus-canceled") ||
//           error.code === "capture/focus-canceled"
//         ) {
//           console.log("Focus canceled by a new request, ignoring...");
//         } else {
//           console.error("Failed to focus:", error);
//         }
//       });

//       // Hide bounding box after 1 second
//       setTimeout(() => {
//         showFocusBox.value = withTiming(0, { duration: 200 }); // Fade out
//       }, 1000);
//     }, 300),
//     [device?.supportsFocus, focusX, focusY, showFocusBox]
//   );

//   const tapGesture = Gesture.Tap().onEnd((event) => {
//     runOnJS(focus)({ x: event.x, y: event.y });
//   });

//   // Combine pinch and tap gestures
//   const composedGesture = Gesture.Simultaneous(pinchGesture, tapGesture);

//   const animatedProps = useAnimatedProps(() => ({ zoom: zoom.value }), [zoom]);

//   // Animated style for the bounding box
//   // const focusBoxStyle = useAnimatedStyle(() => ({
//   //   position: "absolute",
//   //   width: 100,
//   //   height: 100,
//   //   borderWidth: 2,
//   //   borderColor: "yellow",
//   //   opacity: showFocusBox.value,
//   //   transform: [
//   //     { translateX: focusX.value - 50 }, // Center the box
//   //     { translateY: focusY.value - 50 },
//   //   ],
//   // }));
//   const focusBoxStyle = useAnimatedStyle(() => ({
//     position: "absolute",
//     width: 100,
//     height: 100,
//     borderWidth: 2,
//     borderColor: "rgb(255, 208, 0)", // Change to red for visibility
//     opacity: showFocusBox.value,
//     top: focusY.value - 50, // Use top/left instead of transform for debugging
//     left: focusX.value - 50,
//     backgroundColor: "rgba(56, 56, 56, 0.11)", // Add background for visibility
//   }));

//   // Toggle between front and back cameras
//   const toggleCameraType = () => {
//     setCameraType((prev) => (prev === "back" ? "front" : "back"));
//     zoom.value = device?.neutralZoom ?? 1;
//   };

//   // Open gallery
//   const openGallery = () => {
//     setIsCameraActive(false);
//     router.push("/media");
//   };

//   // Take a picture
//   const takePicture = async () => {
//     try {
//       if (camera.current == null) throw new Error("Camera ref is null!");
//       const { status } = await MediaLibrary.requestPermissionsAsync();
//       if (status !== "granted") {
//         alert("Permission to access media library is required to save photos.");
//         return;
//       }
//       console.log("Taking photo...");
//       const photo = await camera.current.takePhoto({
//         flash: flash,
//         enableShutterSound: false,
//       });
//       await MediaLibrary.saveToLibraryAsync(photo.path);
//       console.log("Photo saved to gallery:", photo.path);
//     } catch (e) {
//       console.error("Failed to take photo or save!", e);
//       alert("Failed to save the photo. Please try again.");
//     }
//   };

//   const toggleAiMode = () => setAiMode(!aiMode);
//   const toggleAngleMode = () => setAngleMode(!angleMode);

//   if (!hasPermission || microphonePermission === "not-determined") {
//     return <Redirect href={"/permissions"} />;
//   }
//   if (!device) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.loadingText}>Loading Camera...</Text>
//       </View>
//     );
//   }

//   // Draggable Panel State and Gesture
//   const panelHeight = useSharedValue(0);
//   const MAX_PANEL_HEIGHT = 300;
//   const panGesture = Gesture.Pan()
//     .onUpdate((event) => {
//       panelHeight.value = Math.max(
//         0,
//         Math.min(event.translationY + MAX_PANEL_HEIGHT, MAX_PANEL_HEIGHT)
//       );
//     })
//     .onEnd(() => {
//       panelHeight.value =
//         panelHeight.value > MAX_PANEL_HEIGHT / 2
//           ? withTiming(MAX_PANEL_HEIGHT, { duration: 200 })
//           : withTiming(0, { duration: 120 });
//     });

//   const panelStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: panelHeight.value }],
//   }));

//   return (
//     <View style={styles.container}>
//       <StatusBar />
//       <SafeAreaView style={styles.container}>
//         <GestureDetector gesture={composedGesture}>
//           <ReanimatedCamera
//             ref={camera}
//             style={StyleSheet.absoluteFillObject}
//             photo={true}
//             device={device}
//             isActive={isCameraActive}
//             resizeMode="cover"
//             preview={true}
//             exposure={exposure}
//             torch={torch}
//             animatedProps={animatedProps}
//           />
//         </GestureDetector>
//         {/* Focus Bounding Box Overlay */}
//         <Animated.View style={focusBoxStyle} />
//         <BlurView
//           intensity={100}
//           tint="dark"
//           style={{
//             position: "absolute",
//             bottom: 10,
//             right: 10,
//             padding: 10,
//           }}
//           experimentalBlurMethod="dimezisBlurView"
//         />

//         <View style={styles.modeSelection}>
//           {["Photo", "Video", "Portrait", "Panorama"].map((mode) => (
//             <TouchableOpacity
//               key={mode}
//               style={[
//                 styles.modeButton,
//                 { backgroundColor: selectedMode === mode ? "#559" : "white" },
//               ]}
//               onPress={() => setSelectedMode(mode)}
//             >
//               <Text
//                 style={[
//                   styles.modeText,
//                   { color: selectedMode === mode ? "white" : "black" },
//                 ]}
//               >
//                 {mode}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <View style={styles.sliderContainer}>
//           {showZoomControls && (
//             <ZoomControls
//               zoom={zoom}
//               setShowZoomControls={setShowZoomControls}
//             />
//           )}
//         </View>
//         <View style={styles.sliderContainerexposure}>
//           {showExposureControls && (
//             <ExposureControls
//               setExposure={setExposure}
//               setShowExposureControls={setShowExposureControls}
//               exposure={exposure}
//             />
//           )}
//         </View>

//         <View style={styles.flashContainer}>
//           <ObscuraButton
//             iconName={flash === "on" ? "flash-sharp" : "flash-off-sharp"}
//             onPress={() => setFlash((f) => (f === "off" ? "on" : "off"))}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>

//         <View style={styles.settingsContainer}>
//           <ObscuraButton
//             iconName="magnet-sharp"
//             onPress={() => setShowZoomControls((s) => !s)}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>
//         <View style={styles.exposureContainer}>
//           <ObscuraButton
//             iconName="eye-sharp"
//             onPress={() => setShowExposureControls((s) => !s)}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>

//         <View style={styles.captureButtonContainer}>
//           <TouchableOpacity onPress={openGallery}>
//             <Ionicons name="images-outline" size={width * 0.09} color="white" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
//             <Ionicons name="camera" size={48} color="white" />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={toggleCameraType}>
//             <Ionicons name="sync-circle" size={width * 0.115} color="white" />
//           </TouchableOpacity>
//         </View>

//         <GestureDetector gesture={panGesture}>
//           <Animated.View style={[styles.draggablePanel, panelStyle]}>
//             <View style={styles.panelHandle} />
//             <CameraNavPanel
//               onSyncPress={toggleCameraType}
//               selectedModeprop={selectedMode}
//               onModeChange={setSelectedMode}
//             />
//           </Animated.View>
//         </GestureDetector>
//       </SafeAreaView>
//     </View>
//   );
// };

// // Debounce utility function
// function debounce<T extends (...args: any[]) => void>(
//   func: T,
//   wait: number
// ): (...args: Parameters<T>) => void {
//   let timeout: NodeJS.Timeout | null = null;
//   return (...args: Parameters<T>) => {
//     if (timeout) clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// }

// // Styles (unchanged)
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "transparent",
//     justifyContent: "flex-end",
//     paddingTop: 40,
//     paddingBottom: 40,
//   },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "black",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   loadingText: { color: "white", fontSize: 18 },
//   modeSelection: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     position: "absolute",
//     bottom: 130,
//     width: "100%",
//   },
//   modeButton: {
//     backgroundColor: "rgb(255, 255, 255)",
//     padding: 10,
//     borderRadius: 35,
//   },
//   modeText: {
//     color: "black",
//     fontSize: 11,
//   },
//   sliderContainer: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   sliderContainerexposure: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   flashContainer: {
//     position: "absolute",
//     top: 50,
//     right: 20,
//   },
//   settingsContainer: {
//     position: "absolute",
//     top: 50,
//     left: 20,
//   },
//   exposureContainer: {
//     position: "absolute",
//     top: 110,
//     right: 20,
//   },
//   captureButtonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     marginBottom: 40,
//     bottom: -35,
//   },
//   captureButton: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: "rgb(26, 110, 158)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   draggablePanel: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 300,
//     backgroundColor: "rgb(0, 0, 0)",
//     borderTopLeftRadius: 35,
//     borderTopRightRadius: 35,
//     zIndex: 100,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   panelHandle: {
//     width: 40,
//     height: 4,
//     backgroundColor: "white",
//     borderRadius: 2,
//     alignSelf: "center",
//     marginTop: 10,
//   },
// });

// export default HomeScreen;

// import React, { useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   useWindowDimensions,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { StatusBar } from "expo-status-bar";
// import {
//   Camera,
//   useCameraDevice,
//   useCameraPermission,
// } from "react-native-vision-camera";
// import { Redirect, router } from "expo-router";
// import { BlurView } from "expo-blur";
// import ObscuraButton from "@/components/ObscuraButton";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   useAnimatedProps,
//   withTiming,
//   runOnJS,
// } from "react-native-reanimated";
// import { Gesture, GestureDetector } from "react-native-gesture-handler";
// import * as MediaLibrary from "expo-media-library";
// import ZoomControls from "@/components/ZoomControls";
// import CameraNavPanel from "./CameranavPanel";
// import ExposureControls from "@/components/ExposureControls";

// // Make Camera component animatable
// Animated.addWhitelistedNativeProps({ zoom: true });
// const ReanimatedCamera = Animated.createAnimatedComponent(Camera);

// const HomeScreen = () => {
//   const [aiMode, setAiMode] = useState(false);
//   const [angleMode, setAngleMode] = useState(false);
//   const { hasPermission } = useCameraPermission();
//   const microphonePermission = Camera.getMicrophonePermissionStatus();
//   const [showZoomControls, setShowZoomControls] = useState(false);
//   const [showExposureControls, setShowExposureControls] = useState(false);
//   const { width } = useWindowDimensions();
//   const [selectedMode, setSelectedMode] = useState<string>("Photo");
//   const [isCameraActive, setIsCameraActive] = useState(true);
//   const camera = React.useRef<Camera>(null);

//   const [cameraType, setCameraType] = useState<"back" | "front">("back");
//   const [exposure, setExposure] = useState(0);
//   const [flash, setFlash] = useState<"off" | "on">("off");
//   const [torch, setTorch] = useState<"off" | "on">("off");

//   // Select camera device with wide-angle preference for back camera
//   const device = useCameraDevice(cameraType, {
// physicalDevices: cameraType === "back" ? ["ultra-wide-angle-camera" + "wide-angle-camera" + "telephoto-camera"] : undefined,
//   });

//   // Zoom setup with Reanimated
//   const zoom = useSharedValue(device?.neutralZoom ?? 1);
//   const zoomOffset = useSharedValue(0);

//   // Pinch-to-zoom gesture
//   const pinchGesture = Gesture.Pinch()
//     .onBegin(() => {
//       zoomOffset.value = zoom.value;
//     })
//     .onUpdate((event) => {
//       const z = zoomOffset.value * event.scale;
//       zoom.value = Math.min(
//         Math.max(z, device?.minZoom ?? 1),
//         Math.min(device?.maxZoom ?? 16, 16)
//       );
//     });

//   // Debounced tap-to-focus function
//   const focus = useCallback(
//     debounce((point: { x: number; y: number }) => {
//       const c = camera.current;
//       if (c == null || !device?.supportsFocus) return;
//       c.focus(point).catch((error) => {
//         // Ignore focus-canceled errors, log others
//         if (
//           error.message.includes("focus-canceled") ||
//           error.code === "capture/focus-canceled"
//         ) {
//           console.log("Focus canceled by a new request, ignoring...");
//         } else {
//           console.error("Failed to focus:", error);
//         }
//       });
//     }, 300), // 300ms debounce
//     [device?.supportsFocus]
//   );

//   const tapGesture = Gesture.Tap().onEnd((event) => {
//     runOnJS(focus)({ x: event.x, y: event.y });
//   });

//   // Combine pinch and tap gestures
//   const composedGesture = Gesture.Simultaneous(pinchGesture, tapGesture);

//   const animatedProps = useAnimatedProps(() => ({ zoom: zoom.value }), [zoom]);

//   // Toggle between front and back cameras
//   const toggleCameraType = () => {
//     setCameraType((prev) => (prev === "back" ? "front" : "back"));
//     zoom.value = device?.neutralZoom ?? 1;
//   };

//   // Open gallery
//   const openGallery = () => {
//     setIsCameraActive(false);
//     router.push("/media");
//   };

//   // Take a picture
//   const takePicture = async () => {
//     try {
//       if (camera.current == null) throw new Error("Camera ref is null!");
//       const { status } = await MediaLibrary.requestPermissionsAsync();
//       if (status !== "granted") {
//         alert("Permission to access media library is required to save photos.");
//         return;
//       }
//       console.log("Taking photo...");
//       const photo = await camera.current.takePhoto({
//         flash: flash,
//         enableShutterSound: false,
//       });
//       await MediaLibrary.saveToLibraryAsync(photo.path);
//       console.log("Photo saved to gallery:", photo.path);
//     } catch (e) {
//       console.error("Failed to take photo or save!", e);
//       alert("Failed to save the photo. Please try again.");
//     }
//   };

//   const toggleAiMode = () => setAiMode(!aiMode);
//   const toggleAngleMode = () => setAngleMode(!angleMode);

//   if (!hasPermission || microphonePermission === "not-determined") {
//     return <Redirect href={"/permissions"} />;
//   }
//   if (!device) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.loadingText}>Loading Camera...</Text>
//       </View>
//     );
//   }

//   // Draggable Panel State and Gesture
//   const panelHeight = useSharedValue(0);
//   const MAX_PANEL_HEIGHT = 300;
//   const panGesture = Gesture.Pan()
//     .onUpdate((event) => {
//       panelHeight.value = Math.max(
//         0,
//         Math.min(event.translationY + MAX_PANEL_HEIGHT, MAX_PANEL_HEIGHT)
//       );
//     })
//     .onEnd(() => {
//       panelHeight.value =
//         panelHeight.value > MAX_PANEL_HEIGHT / 2
//           ? withTiming(MAX_PANEL_HEIGHT, { duration: 200 })
//           : withTiming(0, { duration: 120 });
//     });

//   const panelStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: panelHeight.value }],
//   }));

//   return (
//     <View style={styles.container}>
//       <StatusBar />
//       <SafeAreaView style={styles.container}>
//         <GestureDetector gesture={composedGesture}>
//           <ReanimatedCamera
//             ref={camera}
//             style={StyleSheet.absoluteFillObject}
//             photo={true}
//             device={device}
//             isActive={isCameraActive}
//             resizeMode="cover"
//             preview={true}
//             exposure={exposure}
//             torch={torch}
//             animatedProps={animatedProps}
//           />
//         </GestureDetector>
//         <BlurView
//           intensity={100}
//           tint="dark"
//           style={{
//             position: "absolute",
//             bottom: 10,
//             right: 10,
//             padding: 10,
//           }}
//           experimentalBlurMethod="dimezisBlurView"
//         />

//         <View style={styles.modeSelection}>
//           {["Photo", "Video", "Portrait", "Panorama"].map((mode) => (
//             <TouchableOpacity
//               key={mode}
//               style={[
//                 styles.modeButton,
//                 { backgroundColor: selectedMode === mode ? "#559" : "white" },
//               ]}
//               onPress={() => setSelectedMode(mode)}
//             >
//               <Text
//                 style={[
//                   styles.modeText,
//                   { color: selectedMode === mode ? "white" : "black" },
//                 ]}
//               >
//                 {mode}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <View style={styles.sliderContainer}>
//           {showZoomControls && (
//             <ZoomControls
//               zoom={zoom}
//               setShowZoomControls={setShowZoomControls}
//             />
//           )}
//         </View>
//         <View style={styles.sliderContainerexposure}>
//           {showExposureControls && (
//             <ExposureControls
//               setExposure={setExposure}
//               setShowExposureControls={setShowExposureControls}
//               exposure={exposure}
//             />
//           )}
//         </View>

//         <View style={styles.flashContainer}>
//           <ObscuraButton
//             iconName={flash === "on" ? "flash-sharp" : "flash-off-sharp"}
//             onPress={() => setFlash((f) => (f === "off" ? "on" : "off"))}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>

//         <View style={styles.settingsContainer}>
//           <ObscuraButton
//             iconName="magnet-sharp"
//             onPress={() => setShowZoomControls((s) => !s)}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>
//         <View style={styles.exposureContainer}>
//           <ObscuraButton
//             iconName="eye-sharp"
//             onPress={() => setShowExposureControls((s) => !s)}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>

//         <View style={styles.captureButtonContainer}>
//           <TouchableOpacity onPress={openGallery}>
//             <Ionicons name="images-outline" size={width * 0.09} color="white" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
//             <Ionicons name="camera" size={48} color="white" />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={toggleCameraType}>
//             <Ionicons name="sync-circle" size={width * 0.115} color="white" />
//           </TouchableOpacity>
//         </View>

//         <GestureDetector gesture={panGesture}>
//           <Animated.View style={[styles.draggablePanel, panelStyle]}>
//             <View style={styles.panelHandle} />
//             <CameraNavPanel
//               onSyncPress={toggleCameraType}
//               selectedModeprop={selectedMode}
//               onModeChange={setSelectedMode}
//             />
//           </Animated.View>
//         </GestureDetector>
//       </SafeAreaView>
//     </View>
//   );
// };

// // Debounce utility function
// function debounce<T extends (...args: any[]) => void>(
//   func: T,
//   wait: number
// ): (...args: Parameters<T>) => void {
//   let timeout: NodeJS.Timeout | null = null;
//   return (...args: Parameters<T>) => {
//     if (timeout) clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// }

// // Styles (unchanged)
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "transparent",
//     justifyContent: "flex-end",
//     paddingTop: 40,
//     paddingBottom: 40,
//   },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "black",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   loadingText: { color: "white", fontSize: 18 },
//   modeSelection: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     position: "absolute",
//     bottom: 130,
//     width: "100%",
//   },
//   modeButton: {
//     backgroundColor: "rgb(255, 255, 255)",
//     padding: 10,
//     borderRadius: 35,
//   },
//   modeText: {
//     color: "black",
//     fontSize: 11,
//   },
//   sliderContainer: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   sliderContainerexposure: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   flashContainer: {
//     position: "absolute",
//     top: 50,
//     right: 20,
//   },
//   settingsContainer: {
//     position: "absolute",
//     top: 50,
//     left: 20,
//   },
//   exposureContainer: {
//     position: "absolute",
//     top: 110,
//     right: 20,
//   },
//   captureButtonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     marginBottom: 40,
//     bottom: -35,
//   },
//   captureButton: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: "rgb(26, 110, 158)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   draggablePanel: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 300,
//     backgroundColor: "rgb(0, 0, 0)",
//     borderTopLeftRadius: 35,
//     borderTopRightRadius: 35,
//     zIndex: 100,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   panelHandle: {
//     width: 40,
//     height: 4,
//     backgroundColor: "white",
//     borderRadius: 2,
//     alignSelf: "center",
//     marginTop: 10,
//   },
// });

// export default HomeScreen;

// import React, { useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   useWindowDimensions,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { StatusBar } from "expo-status-bar";
// import {
//   Camera,
//   useCameraDevice,
//   useCameraPermission,
// } from "react-native-vision-camera";
// import { Redirect, router } from "expo-router";
// import { BlurView } from "expo-blur";
// import ObscuraButton from "@/components/ObscuraButton";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   useAnimatedProps,
//   withTiming,
// } from "react-native-reanimated";
// import { Gesture, GestureDetector } from "react-native-gesture-handler";
// import * as MediaLibrary from "expo-media-library";
// import ZoomControls from "@/components/ZoomControls";
// import ExposureControls from "@/components/ExposureControls";
// import CameraNavPanel from "./CameranavPanel";

// // Make Camera component animatable
// Animated.addWhitelistedNativeProps({ zoom: true });
// const ReanimatedCamera = Animated.createAnimatedComponent(Camera);

// const HomeScreen = () => {
//   // const [focus] = useState(0.5);
//   const [aiMode, setAiMode] = useState(false);
//   const [angleMode, setAngleMode] = useState(false);
//   const { hasPermission } = useCameraPermission();
//   const microphonePermission = Camera.getMicrophonePermissionStatus();
//   const [showZoomControls, setShowZoomControls] = useState(false);
//   const [showExposureControls, setShowExposureControls] = useState(false);
//   const { width } = useWindowDimensions();
//   const [selectedMode, setSelectedMode] = useState<string>("Photo");
//   const [isCameraActive, setIsCameraActive] = useState(true);
//   const camera = React.useRef<Camera>(null);

//   const [cameraType, setCameraType] = useState<"back" | "front">("back");
//   const [exposure, setExposure] = useState(0);
//   const [flash, setFlash] = useState<"off" | "on">("off");
//   const [torch, setTorch] = useState<"off" | "on">("off");

//   // Select camera device with wide-angle preference for back camera
//   const device = useCameraDevice(cameraType, {
//     physicalDevices: cameraType === "back" ? ["wide-angle-camera"] : undefined,
//   });

//   // Zoom setup with Reanimated
//   const zoom = useSharedValue(device?.neutralZoom ?? 1);
//   const zoomOffset = useSharedValue(0);

//   // Pinch-to-zoom gesture
//   const pinchGesture = Gesture.Pinch()
//     .onBegin(() => {
//       zoomOffset.value = zoom.value;
//     })
//     .onUpdate((event) => {
//       const z = zoomOffset.value * event.scale;
//       zoom.value = Math.min(
//         Math.max(z, device?.minZoom ?? 1),
//         Math.min(device?.maxZoom ?? 16, 16)
//       );
//     });

//   // Tap-to-focus gesture
//   const focus = useCallback(
//     (point: { x: number; y: number }) => {
//       const c = camera.current;
//       if (c == null || !device?.supportsFocus) return;
//       c.focus(point).catch((error) => {
//         console.error("Failed to focus:", error);
//       });
//     },
//     [device?.supportsFocus]
//   );

//   const tapGesture = Gesture.Tap().onEnd((event) => {
//     focus({ x: event.x, y: event.y });
//   });

//   // Combine pinch and tap gestures
//   const composedGesture = Gesture.Simultaneous(pinchGesture, tapGesture);

//   const animatedProps = useAnimatedProps(() => ({ zoom: zoom.value }), [zoom]);

//   // Toggle between front and back cameras
//   const toggleCameraType = () => {
//     setCameraType((prev) => (prev === "back" ? "front" : "back"));
//     zoom.value = device?.neutralZoom ?? 1;
//   };

//   // Open gallery
//   const openGallery = () => {
//     setIsCameraActive(false);
//     router.push("/media");
//   };

//   // Take a picture
//   const takePicture = async () => {
//     try {
//       if (camera.current == null) throw new Error("Camera ref is null!");
//       const { status } = await MediaLibrary.requestPermissionsAsync();
//       if (status !== "granted") {
//         alert("Permission to access media library is required to save photos.");
//         return;
//       }
//       console.log("Taking photo...");
//       const photo = await camera.current.takePhoto({
//         flash: flash,
//         enableShutterSound: false,
//       });
//       await MediaLibrary.saveToLibraryAsync(photo.path);
//       console.log("Photo saved to gallery:", photo.path);
//     } catch (e) {
//       console.error("Failed to take photo or save!", e);
//       alert("Failed to save the photo. Please try again.");
//     }
//   };

//   const toggleAiMode = () => setAiMode(!aiMode);
//   const toggleAngleMode = () => setAngleMode(!angleMode);

//   if (!hasPermission || microphonePermission === "not-determined") {
//     return <Redirect href={"/permissions"} />;
//   }
//   if (!device) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.loadingText}>Loading Camera...</Text>
//       </View>
//     );
//   }

//   // Draggable Panel State and Gesture
//   const panelHeight = useSharedValue(0);
//   const MAX_PANEL_HEIGHT = 300;
//   const panGesture = Gesture.Pan()
//     .onUpdate((event) => {
//       panelHeight.value = Math.max(
//         0,
//         Math.min(event.translationY + MAX_PANEL_HEIGHT, MAX_PANEL_HEIGHT)
//       );
//     })
//     .onEnd(() => {
//       panelHeight.value =
//         panelHeight.value > MAX_PANEL_HEIGHT / 2
//           ? withTiming(MAX_PANEL_HEIGHT, { duration: 200 })
//           : withTiming(0, { duration: 120 });
//     });

//   const panelStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: panelHeight.value }],
//   }));

//   return (
//     <View style={styles.container}>
//       <StatusBar />
//       <SafeAreaView style={styles.container}>
//         <GestureDetector gesture={composedGesture}>
//           <ReanimatedCamera
//             ref={camera}
//             style={StyleSheet.absoluteFillObject}
//             photo={true}
//             device={device}
//             isActive={isCameraActive}
//             resizeMode="cover"
//             preview={true}
//             exposure={exposure}
//             torch={torch}
//             animatedProps={animatedProps}
//           />
//         </GestureDetector>
//         <BlurView
//           intensity={100}
//           tint="dark"
//           style={{
//             position: "absolute",
//             bottom: 10,
//             right: 10,
//             padding: 10,
//           }}
//           experimentalBlurMethod="dimezisBlurView"
//         />

//         <View style={styles.modeSelection}>
//           {["Photo", "Video", "Portrait", "Panorama"].map((mode) => (
//             <TouchableOpacity
//               key={mode}
//               style={[
//                 styles.modeButton,
//                 { backgroundColor: selectedMode === mode ? "#559" : "white" },
//               ]}
//               onPress={() => setSelectedMode(mode)}
//             >
//               <Text
//                 style={[
//                   styles.modeText,
//                   { color: selectedMode === mode ? "white" : "black" },
//                 ]}
//               >
//                 {mode}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <View style={styles.sliderContainer}>
//           {showZoomControls && (
//             <ZoomControls
//               zoom={zoom}
//               setShowZoomControls={setShowZoomControls}
//             />
//           )}
//         </View>
//         <View style={styles.sliderContainerexposure}>
//           {showExposureControls && (
//             <ExposureControls
//               setExposure={setExposure}
//               setShowExposureControls={setShowExposureControls}
//               exposure={exposure}
//             />
//           )}
//         </View>

//         <View style={styles.flashContainer}>
//           <ObscuraButton
//             iconName={flash === "on" ? "flash-sharp" : "flash-off-sharp"}
//             onPress={() => setFlash((f) => (f === "off" ? "on" : "off"))}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>

//         <View style={styles.settingsContainer}>
//           <ObscuraButton
//             iconName="magnet-sharp"
//             onPress={() => setShowZoomControls((s) => !s)}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>
//         <View style={styles.exposureContainer}>
//           <ObscuraButton
//             iconName="eye-sharp"
//             onPress={() => setShowExposureControls((s) => !s)}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>

//         <View style={styles.captureButtonContainer}>
//           <TouchableOpacity onPress={openGallery}>
//             <Ionicons name="images-outline" size={width * 0.09} color="white" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
//             <Ionicons name="camera" size={48} color="white" />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={toggleCameraType}>
//             <Ionicons name="sync-circle" size={width * 0.115} color="white" />
//           </TouchableOpacity>
//         </View>

//         <GestureDetector gesture={panGesture}>
//           <Animated.View style={[styles.draggablePanel, panelStyle]}>
//             <View style={styles.panelHandle} />
//             <CameraNavPanel
//               onSyncPress={toggleCameraType}
//               selectedModeprop={selectedMode}
//               onModeChange={setSelectedMode}
//             />
//           </Animated.View>
//         </GestureDetector>
//       </SafeAreaView>
//     </View>
//   );
// };

// // Styles (unchanged)
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "transparent",
//     justifyContent: "flex-end",
//     paddingTop: 40,
//     paddingBottom: 40,
//   },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "black",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   loadingText: { color: "white", fontSize: 18 },
//   modeSelection: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     position: "absolute",
//     bottom: 130,
//     width: "100%",
//   },
//   modeButton: {
//     backgroundColor: "rgb(255, 255, 255)",
//     padding: 10,
//     borderRadius: 35,
//   },
//   modeText: {
//     color: "black",
//     fontSize: 11,
//   },
//   sliderContainer: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   sliderContainerexposure: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   flashContainer: {
//     position: "absolute",
//     top: 50,
//     right: 20,
//   },
//   settingsContainer: {
//     position: "absolute",
//     top: 50,
//     left: 20,
//   },
//   exposureContainer: {
//     position: "absolute",
//     top: 110,
//     right: 20,
//   },
//   captureButtonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     marginBottom: 40,
//     bottom: -35,
//   },
//   captureButton: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: "rgb(26, 110, 158)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   draggablePanel: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 300,
//     backgroundColor: "rgb(0, 0, 0)",
//     borderTopLeftRadius: 35,
//     borderTopRightRadius: 35,
//     zIndex: 100,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   panelHandle: {
//     width: 40,
//     height: 4,
//     backgroundColor: "white",
//     borderRadius: 2,
//     alignSelf: "center",
//     marginTop: 10,
//   },
// });

// export default HomeScreen;

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   useWindowDimensions,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { StatusBar } from "expo-status-bar";
// import {
//   Camera,
//   useCameraDevice,
//   useCameraPermission,
// } from "react-native-vision-camera";
// import { Redirect, router } from "expo-router";
// import { BlurView } from "expo-blur";
// import ObscuraButton from "@/components/ObscuraButton";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   useAnimatedProps,
//   withTiming,
// } from "react-native-reanimated";
// import { Gesture, GestureDetector } from "react-native-gesture-handler";
// import * as MediaLibrary from "expo-media-library";
// import ZoomControls from "@/components/ZoomControls"; // Updated ZoomControls
// import ExposureControls from "@/components/ExposureControls";
// import CameraNavPanel from "./CameranavPanel";

// // Make Camera component animatable
// Animated.addWhitelistedNativeProps({ zoom: true });
// const ReanimatedCamera = Animated.createAnimatedComponent(Camera);

// const HomeScreen = () => {
//   const [focus] = useState(0.5);
//   const [aiMode, setAiMode] = useState(false);
//   const [angleMode, setAngleMode] = useState(false);
//   const { hasPermission } = useCameraPermission();
//   const microphonePermission = Camera.getMicrophonePermissionStatus();
//   const [showZoomControls, setShowZoomControls] = useState(false);
//   const [showExposureControls, setShowExposureControls] = useState(false);
//   const { width } = useWindowDimensions();
//   const [selectedMode, setSelectedMode] = useState<string>("Photo");
//   const [isCameraActive, setIsCameraActive] = useState(true);
//   const camera = React.useRef<Camera>(null);

//   const [cameraType, setCameraType] = useState<"back" | "front">("back");
//   const [exposure, setExposure] = useState(0);
//   const [flash, setFlash] = useState<"off" | "on">("off");
//   const [torch, setTorch] = useState<"off" | "on">("off");

//   // Select camera device with wide-angle preference for back camera
//   const device = useCameraDevice(cameraType, {
//     physicalDevices: cameraType === "back" ? ["wide-angle-camera"] : undefined,
//   });

//   // Zoom setup with Reanimated
//   const zoom = useSharedValue(device?.neutralZoom ?? 0.5); // Unified zoom control
//   const zoomOffset = useSharedValue(0);

//   // Pinch-to-zoom gesture
//   const pinchGesture = Gesture.Pinch()
//     .onBegin(() => {
//       zoomOffset.value = zoom.value;
//     })
//     .onUpdate((event) => {
//       const z = zoomOffset.value * event.scale;
//       zoom.value = Math.min(
//         Math.max(z, device?.minZoom ?? 0.5),
//         Math.min(device?.maxZoom ?? 16, 16) // Clamp max zoom to 16
//       );
//     });

//   const animatedProps = useAnimatedProps(() => ({ zoom: zoom.value }), [zoom]);

//   // Toggle between front and back cameras
//   const toggleCameraType = () => {
//     setCameraType((prev) => (prev === "back" ? "front" : "back"));
//     zoom.value = device?.neutralZoom ?? 1; // Reset zoom
//   };

//   // Open gallery
//   const openGallery = () => {
//     setIsCameraActive(false);
//     router.push("/media");
//   };

//   // Take a picture
//   const takePicture = async () => {
//     try {
//       if (camera.current == null) throw new Error("Camera ref is null!");
//       const { status } = await MediaLibrary.requestPermissionsAsync();
//       if (status !== "granted") {
//         alert("Permission to access media library is required to save photos.");
//         return;
//       }
//       console.log("Taking photo...");
//       const photo = await camera.current.takePhoto({
//         flash: flash,
//         enableShutterSound: false,
//       });
//       await MediaLibrary.saveToLibraryAsync(photo.path);
//       console.log("Photo saved to gallery:", photo.path);
//     } catch (e) {
//       console.error("Failed to take photo or save!", e);
//       alert("Failed to save the photo. Please try again.");
//     }
//   };

//   const toggleAiMode = () => setAiMode(!aiMode);
//   const toggleAngleMode = () => setAngleMode(!angleMode);

//   if (!hasPermission || microphonePermission === "not-determined") {
//     return <Redirect href={"/permissions"} />;
//   }
//   if (!device) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.loadingText}>Loading Camera...</Text>
//       </View>
//     );
//   }

//   // Draggable Panel State and Gesture
//   const panelHeight = useSharedValue(0);
//   const MAX_PANEL_HEIGHT = 300;
//   const panGesture = Gesture.Pan()
//     .onUpdate((event) => {
//       panelHeight.value = Math.max(
//         0,
//         Math.min(event.translationY + MAX_PANEL_HEIGHT, MAX_PANEL_HEIGHT)
//       );
//     })
//     .onEnd(() => {
//       panelHeight.value =
//         panelHeight.value > MAX_PANEL_HEIGHT / 2
//           ? withTiming(MAX_PANEL_HEIGHT, { duration: 200 })
//           : withTiming(0, { duration: 120 });
//     });

//   const panelStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: panelHeight.value }],
//   }));

//   return (
//     <View style={styles.container}>
//       <StatusBar />
//       <SafeAreaView style={styles.container}>
//         <GestureDetector gesture={pinchGesture}>
//           <ReanimatedCamera
//             ref={camera}
//             style={StyleSheet.absoluteFillObject}
//             photo={true}
//             device={device}
//             isActive={isCameraActive}
//             resizeMode="cover"
//             preview={true}
//             exposure={exposure}
//             torch={torch}
//             animatedProps={animatedProps}
//           />
//         </GestureDetector>
//         <BlurView
//           intensity={100}
//           tint="dark"
//           style={{
//             position: "absolute",
//             bottom: 10,
//             right: 10,
//             padding: 10,
//           }}
//           experimentalBlurMethod="dimezisBlurView"
//         />

//         <View style={styles.modeSelection}>
//           {["Photo", "Video", "Portrait", "Panorama"].map((mode) => (
//             <TouchableOpacity
//               key={mode}
//               style={[
//                 styles.modeButton,
//                 { backgroundColor: selectedMode === mode ? "#559" : "white" },
//               ]}
//               onPress={() => setSelectedMode(mode)}
//             >
//               <Text
//                 style={[
//                   styles.modeText,
//                   { color: selectedMode === mode ? "white" : "black" },
//                 ]}
//               >
//                 {mode}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <View style={styles.sliderContainer}>
//           {showZoomControls && (
//             <ZoomControls
//               zoom={zoom} // Pass SharedValue directly
//               setShowZoomControls={setShowZoomControls}
//             />
//           )}
//         </View>
//         <View style={styles.sliderContainerexposure}>
//           {showExposureControls && (
//             <ExposureControls
//               setExposure={setExposure}
//               setShowExposureControls={setShowExposureControls}
//               exposure={exposure}
//             />
//           )}
//         </View>

//         <View style={styles.flashContainer}>
//           <ObscuraButton
//             iconName={flash === "on" ? "flash-sharp" : "flash-off-sharp"}
//             onPress={() => setFlash((f) => (f === "off" ? "on" : "off"))}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>

//         <View style={styles.settingsContainer}>
//           <ObscuraButton
//             iconName="magnet-sharp"
//             onPress={() => setShowZoomControls((s) => !s)}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>
//         <View style={styles.exposureContainer}>
//           <ObscuraButton
//             iconName="eye-sharp"
//             onPress={() => setShowExposureControls((s) => !s)}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>

//         <View style={styles.captureButtonContainer}>
//           <TouchableOpacity onPress={openGallery}>
//             <Ionicons name="images-outline" size={width * 0.09} color="white" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
//             <Ionicons name="camera" size={48} color="white" />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={toggleCameraType}>
//             <Ionicons name="sync-circle" size={width * 0.115} color="white" />
//           </TouchableOpacity>
//         </View>

//         <GestureDetector gesture={panGesture}>
//           <Animated.View style={[styles.draggablePanel, panelStyle]}>
//             <View style={styles.panelHandle} />
//             <CameraNavPanel
//               onSyncPress={toggleCameraType}
//               selectedModeprop={selectedMode}
//               onModeChange={setSelectedMode}
//             />
//           </Animated.View>
//         </GestureDetector>
//       </SafeAreaView>
//     </View>
//   );
// };

// // Styles (unchanged)
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "transparent",
//     justifyContent: "flex-end",
//     paddingTop: 40,
//     paddingBottom: 40,
//   },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "black",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   loadingText: { color: "white", fontSize: 18 },
//   modeSelection: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     position: "absolute",
//     bottom: 130,
//     width: "100%",
//   },
//   modeButton: {
//     backgroundColor: "rgb(255, 255, 255)",
//     padding: 10,
//     borderRadius: 35,
//   },
//   modeText: {
//     color: "black",
//     fontSize: 11,
//   },
//   sliderContainer: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   sliderContainerexposure: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   flashContainer: {
//     position: "absolute",
//     top: 50,
//     right: 20,
//   },
//   settingsContainer: {
//     position: "absolute",
//     top: 50,
//     left: 20,
//   },
//   exposureContainer: {
//     position: "absolute",
//     top: 110,
//     right: 20,
//   },
//   captureButtonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     marginBottom: 40,
//     bottom: -35,
//   },
//   captureButton: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: "rgb(26, 110, 158)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   draggablePanel: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 300,
//     backgroundColor: "rgb(0, 0, 0)",
//     borderTopLeftRadius: 35,
//     borderTopRightRadius: 35,
//     zIndex: 100,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   panelHandle: {
//     width: 40,
//     height: 4,
//     backgroundColor: "white",
//     borderRadius: 2,
//     alignSelf: "center",
//     marginTop: 10,
//   },
// });

// export default HomeScreen;

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Switch,
//   ImageBackground,
//   Platform,
//   SafeAreaView,
//   ScrollView,
//   useWindowDimensions,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons"; // Use any icon library of your choice
// import ZoomController from "@/components/ZoomControls";
// import { StatusBar } from "expo-status-bar";
// import ZoomControls from "@/components/ZoomControls";
// import {
//   Camera,
//   useCameraDevice,
//   useCameraDevices,
//   useCameraPermission,
// } from "react-native-vision-camera";
// import { Redirect, router, useRouter } from "expo-router";
// import { BlurView } from "expo-blur";
// import ObscuraButton from "@/components/ObscuraButton";
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   runOnJS,
// } from "react-native-reanimated";
// import {
//   Gesture,
//   GestureDetector,
//   PanGestureHandler,
// } from "react-native-gesture-handler";
// import * as MediaLibrary from "expo-media-library";
// import MediaScreen from "./media";
// import ExposureControls from "@/components/ExposureControls";
// import CameraNavPanel from "./CameranavPanel";
// // import CameraNavPanel from "./navpannel";
// // import CustomizedSlider from "@/components/LevelControl";
// // import { Gesture, GestureDetector } from "react-native-gesture-handler";

// const HomeScreen = () => {
//   const [focus, setFocus] = useState(0.5); // Default focus value
//   const [aiMode, setAiMode] = useState(false); // Toggle AI mode
//   const [angleMode, setAngleMode] = useState(false); // Toggle 360 angle mode
//   const { hasPermission } = useCameraPermission();
//   const microphonePermission = Camera.getMicrophonePermissionStatus();
//   const [showZoomControls, setShowZoomControls] = React.useState(false);

//   const [showExposureControls, setShowExposureControls] = React.useState(false);
//   const { width } = useWindowDimensions();
//   const router = useRouter();

//   const [selectedMode, setSelectedMode] = useState<string>("Photo");

//   // const [syncRotate] = useState(new Animated.Value(0));

//   const camera = React.useRef<Camera>(null);
//   // const devices = useCameraDevices();
//   const [cameraPosition, setCameraPosition] = React.useState<"front" | "back">(
//     "back"
//   );
//   // Function to open the gallery
//   const [isCameraActive, setIsCameraActive] = useState(true);

//   const openGallery = () => {
//     setIsCameraActive(false); // Disable the camera
//     router.push("/media"); // Navigate to MediaScreen
//   };

//   const devices = useCameraDevices();
//   const [cameraType, setCameraType] = useState<"back" | "front">("back");

//   // Toggle the camera type (front/back)
//   const toggleCameraType = () => {
//     setCameraType((prev) => (prev === "back" ? "front" : "back"));
//   };

//   // Select the appropriate device based on cameraType.
//   // const device = devices.find((d) => d.position === cameraType);
//   // Select camera device with wide-angle preference for back camera
//   const device = useCameraDevice(cameraType, {
//     physicalDevices: cameraType === "back" ? ["wide-angle-camera"] : undefined,
//   });

//   // const [zoom, setZoom] = React.useState(device?.neutralZoom);
//   const [exposure, setExposure] = React.useState(0);
//   const [flash, setFlash] = React.useState<"off" | "on">("off");
//   const [torch, setTorch] = React.useState<"off" | "on">("off");
//   const redirectToPermissions =
//     !hasPermission || microphonePermission === "not-determined";

//   const takePicture = async () => {
//     try {
//       if (camera.current == null) throw new Error("Camera ref is null!");

//       // Request permission to access media library (to save the photo)
//       const { status } = await MediaLibrary.requestPermissionsAsync();
//       if (status !== "granted") {
//         alert("Permission to access media library is required to save photos.");
//         return;
//       }

//       console.log("Taking photo...");
//       const photo = await camera.current.takePhoto({
//         flash: flash,
//         enableShutterSound: false,
//       });

//       // Save photo to gallery automatically without navigating to the media screen
//       await MediaLibrary.saveToLibraryAsync(photo.path);
//       console.log("Photo saved to gallery:", photo.path);

//       // Optionally show an alert or provide feedback to the user
//       // alert("Photo saved to gallery!");
//     } catch (e) {
//       console.error("Failed to take photo or save!", e);
//       alert("Failed to save the photo. Please try again.");
//     }
//   };

//   const toggleAiMode = () => setAiMode(!aiMode);
//   const toggleAngleMode = () => setAngleMode(!angleMode);
//   const toggleZoomControls = () => setShowZoomControls(!showZoomControls);

//   if (redirectToPermissions) return <Redirect href={"/permissions"} />;
//   if (!device) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.loadingText}>Loading Camera...</Text>
//       </View>
//     );
//   }

//   // Draggable Panel State and Gesture
//   const panelHeight = useSharedValue(0); // 0 = hidden, full height when dragged up
//   const MAX_PANEL_HEIGHT = 300; // Adjust this value to set the panel's maximum height
//   const panGesture = Gesture.Pan()
//     .onUpdate((event) => {
//       panelHeight.value = Math.max(
//         0,
//         Math.min(event.translationY + MAX_PANEL_HEIGHT, MAX_PANEL_HEIGHT)
//       );
//     })
//     .onEnd(() => {
//       if (panelHeight.value > MAX_PANEL_HEIGHT / 2) {
//         panelHeight.value = withTiming(MAX_PANEL_HEIGHT, { duration: 200 });
//       } else {
//         panelHeight.value = withTiming(0, { duration: 120 });
//       }
//     });

//   const panelStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: panelHeight.value }],
//   }));

//   //   // Zoom setup with Reanimated
//     const zoom = useSharedValue(device?.neutralZoom || 1);
//     const zoomOffset = useSharedValue(0);
//   // Pinch-to-zoom gesture
//   const pinchGesture = Gesture.Pinch()
//     .onBegin(() => {
//       zoomOffset.value = zoom.value;
//     })
//     .onUpdate((event) => {
//       const z = zoomOffset.value * event.scale;
//       zoom.value = Math.min(
//         Math.max(z, device?.minZoom || 1),
//         Math.min(device?.maxZoom || 16, 16) // Clamp max zoom to 16
//       );
//     });

//   return (
//     <>
//       <View style={styles.container}>
//         <StatusBar />
//         <SafeAreaView style={styles.container}>
//           <GestureDetector gesture={pinchGesture}>
//             {/* Full-Screen Camera */}
//             <View style={StyleSheet.absoluteFillObject}>
//               <Camera
//                 ref={camera}
//                 style={StyleSheet.absoluteFillObject}
//                 photo={true}
//                 zoom={zoom}
//                 device={device!}
//                 isActive={isCameraActive} // Camera is disabled when opening gallery
//                 // isActive={true}
//                 resizeMode="cover"
//                 preview={true}
//                 exposure={exposure}
//                 torch={torch}
//               />
//               <BlurView
//                 intensity={100}
//                 tint="dark"
//                 style={{
//                   position: "absolute",
//                   bottom: 10,
//                   right: 10,
//                   padding: 10,
//                 }}
//                 experimentalBlurMethod="dimezisBlurView"
//               ></BlurView>
//             </View>
//           </GestureDetector>

//           <View style={styles.modeSelection}>
//             {["Photo", "Video", "Portrait", "Panorama"].map((mode) => (
//               <TouchableOpacity
//                 key={mode}
//                 style={[
//                   styles.modeButton,
//                   { backgroundColor: selectedMode === mode ? "#559" : "white" },
//                 ]}
//                 onPress={() => setSelectedMode(mode)}
//               >
//                 <Text
//                   style={[
//                     styles.modeText,
//                     { color: selectedMode === mode ? "white" : "black" },
//                   ]}
//                 >
//                   {mode}
//                 </Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//           {/* </ScrollView> */}
//           <View style={styles.sliderContainer}>
//             {showZoomControls ? (
//               <ZoomControls
//                 setZoom={setZoom}
//                 setShowZoomControls={setShowZoomControls}
//                 zoom={zoom ?? 1}
//               />
//             ) : null}
//           </View>
//           <View style={styles.sliderContainerexposure}>
//             {showExposureControls ? (
//               <ExposureControls
//                 setExposure={setExposure}
//                 setShowExposureControls={setShowExposureControls}
//                 exposure={exposure ?? 1}
//               />
//             ) : null}
//           </View>

//           <View style={styles.flashContainer}>
//             <ObscuraButton
//               iconName={flash === "on" ? "flash-sharp" : "flash-off-sharp"}
//               onPress={() => setFlash((f) => (f === "off" ? "on" : "off"))}
//               containerStyle={{ alignSelf: "center" }}
//             />
//           </View>

//           <View style={styles.settingsContainer}>
//             <ObscuraButton
//               iconName="magnet-sharp"
//               onPress={() => setShowZoomControls((s) => !s)}
//               containerStyle={{ alignSelf: "center" }}
//             />
//           </View>
//           <View style={styles.exposureContainer}>
//             <ObscuraButton
//               iconName="eye-sharp"
//               onPress={() => setShowExposureControls((s) => !s)}
//               containerStyle={{ alignSelf: "center" }}
//             />
//           </View>

//           <View style={styles.captureButtonContainer}>
//             <TouchableOpacity>
//               <Ionicons
//                 name="images-outline"
//                 size={width * 0.09}
//                 color="white"
//               />
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.captureButton}
//               onPress={takePicture}
//             >
//               <Ionicons name="camera" size={48} color="white" />
//             </TouchableOpacity>

//             <TouchableOpacity onPress={toggleCameraType}>
//               <Ionicons name="sync-circle" size={width * 0.115} color="white" />
//             </TouchableOpacity>
//           </View>
//           {/* Draggable Panel */}
//           <GestureDetector gesture={panGesture}>
//             <Animated.View style={[styles.draggablePanel, panelStyle]}>
//               <View style={styles.panelHandle} />
//               <View>
//                 {/* <CameraNavPanel /> */}
//                 <CameraNavPanel
//                   onSyncPress={toggleCameraType}
//                   selectedModeprop={selectedMode}
//                   onModeChange={setSelectedMode}
//                 />
//               </View>
//             </Animated.View>
//           </GestureDetector>
//         </SafeAreaView>
//       </View>
//     </>
//   );
// };

// // Styles
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "transparent",
//     justifyContent: "flex-end",
//     paddingTop: 40,
//     paddingBottom: 40,
//   },

//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "black",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   captureAndSyncContainer: {
//     position: "absolute",
//     bottom: 100,
//     left: 0,
//     right: 0,
//     flexDirection: "row",
//     justifyContent: "space-evenly",
//     alignItems: "center",
//   },
//   loadingText: { color: "white", fontSize: 18 },
//   cameraFeed: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   focusArea: {
//     width: 150,
//     height: 150,
//     borderColor: "red",
//     borderWidth: 2,
//     position: "absolute",
//   },
//   modeSelection: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     position: "absolute",
//     bottom: 130,
//     width: "100%",
//   },
//   // Updated styles for ScrollView
//   modeSelectionScroll: {
//     position: "absolute",
//     bottom: 130,
//     width: "100%",
//   },
//   modeSelectionContent: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     paddingHorizontal: 10, // Add padding for better scrolling
//   },
//   modeButton: {
//     backgroundColor: "rgb(255, 255, 255)",
//     padding: 10,
//     borderRadius: 35,
//   },
//   modeText: {
//     color: "black",
//     fontSize: 11,
//   },
//   sliderContainer: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   sliderContainerexposure: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   slider: {
//     width: "100%",
//     height: 40,
//     marginBottom: 10,
//   },
//   toggleContainer: {
//     // zIndex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 5,
//     marginHorizontal: 20,
//     bottom: -140,
//     justifyContent: "flex-end",
//   },
//   flashContainer: {
//     position: "absolute",
//     top: 50,
//     right: 20,
//   },
//   settingsContainer: {
//     position: "absolute",
//     top: 50,
//     left: 20,
//   },
//   exposureContainer: {
//     position: "absolute",
//     top: 110,
//     // left: 20,
//     right: 20,
//   },
//   captureButtonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     marginBottom: 40,
//     bottom: -35,
//   },
//   captureButton: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: "rgb(26, 110, 158)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   texts: { color: "white", fontSize: 12 },
//   texttip: { color: "white", fontSize: 8 },
//   switchs: { shadowColor: "white" },

//   // Draggable Panel Styles
//   draggablePanel: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 300, // Maximum height when fully expanded
//     backgroundColor: "rgb(0, 0, 0)",
//     borderTopLeftRadius: 35,
//     borderTopRightRadius: 35,
//     zIndex: 100, // Highest zIndex to stay on top
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5, // For Android shadow
//   },
//   panelHandle: {
//     width: 40,
//     height: 4,
//     backgroundColor: "white",
//     borderRadius: 2,
//     alignSelf: "center",
//     marginTop: 10,
//   },
// });

// export default HomeScreen;

// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   useWindowDimensions,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { StatusBar } from "expo-status-bar";
// import {
//   Camera,
//   useCameraDevice,
//   useCameraPermission,
// } from "react-native-vision-camera";
// import { Redirect, router } from "expo-router";
// import { BlurView } from "expo-blur";
// import ObscuraButton from "@/components/ObscuraButton";
// import Animated, {
//   useSharedValue,
//   useAnimatedProps,
//   withTiming,
//   useAnimatedStyle,
// } from "react-native-reanimated";
// import { Gesture, GestureDetector } from "react-native-gesture-handler";
// import * as MediaLibrary from "expo-media-library";
// import ExposureControls from "@/components/ExposureControls";
// import CameraNavPanel from "./CameranavPanel";

// // Make Camera component animatable
// Animated.addWhitelistedNativeProps({ zoom: true });
// const ReanimatedCamera = Animated.createAnimatedComponent(Camera);

// const HomeScreen = () => {
//   const [focus, setFocus] = useState(0.5);
//   const [aiMode, setAiMode] = useState(false);
//   const [angleMode, setAngleMode] = useState(false);
//   const { hasPermission } = useCameraPermission();
//   const microphonePermission = Camera.getMicrophonePermissionStatus();
//   const [showExposureControls, setShowExposureControls] = React.useState(false);
//   const { width } = useWindowDimensions();
//   const [selectedMode, setSelectedMode] = useState<string>("Photo");
//   const [isCameraActive, setIsCameraActive] = useState(true);
//   const camera = React.useRef<Camera>(null);

//   const [cameraType, setCameraType] = useState<"back" | "front">("back");
//   const [exposure, setExposure] = React.useState(0);
//   const [flash, setFlash] = React.useState<"off" | "on">("off");
//   const [torch, setTorch] = React.useState<"off" | "on">("off");

//   // Select camera device with wide-angle preference for back camera
//   const device = useCameraDevice(cameraType, {
//     physicalDevices: cameraType === "back" ? ["wide-angle-camera"] : undefined,
//   });

//   // Zoom setup with Reanimated
//   const zoom = useSharedValue(device?.neutralZoom || 1);
//   const zoomOffset = useSharedValue(0);

//   // Pinch-to-zoom gesture
//   const pinchGesture = Gesture.Pinch()
//     .onBegin(() => {
//       zoomOffset.value = zoom.value;
//     })
//     .onUpdate((event) => {
//       const z = zoomOffset.value * event.scale;
//       zoom.value = Math.min(
//         Math.max(z, device?.minZoom || 1),
//         Math.min(device?.maxZoom || 16, 16) // Clamp max zoom to 16
//       );
//     });

//   const animatedProps = useAnimatedProps(() => ({ zoom: zoom.value }), [zoom]);

//   // Toggle between front and back cameras
//   const toggleCameraType = () => {
//     setCameraType((prev) => (prev === "back" ? "front" : "back"));
//     zoom.value = device?.neutralZoom || 1; // Reset zoom when switching cameras
//   };

//   // Open gallery
//   const openGallery = () => {
//     setIsCameraActive(false);
//     router.push("/media");
//   };

//   // Take a picture
//   const takePicture = async () => {
//     try {
//       if (camera.current == null) throw new Error("Camera ref is null!");
//       const { status } = await MediaLibrary.requestPermissionsAsync();
//       if (status !== "granted") {
//         alert("Permission to access media library is required to save photos.");
//         return;
//       }
//       console.log("Taking photo...");
//       const photo = await camera.current.takePhoto({
//         flash: flash,
//         enableShutterSound: false,
//       });
//       await MediaLibrary.saveToLibraryAsync(photo.path);
//       console.log("Photo saved to gallery:", photo.path);
//     } catch (e) {
//       console.error("Failed to take photo or save!", e);
//       alert("Failed to save the photo. Please try again.");
//     }
//   };

//   const toggleAiMode = () => setAiMode(!aiMode);
//   const toggleAngleMode = () => setAngleMode(!angleMode);

//   if (!hasPermission || microphonePermission === "not-determined") {
//     return <Redirect href={"/permissions"} />;
//   }
//   if (!device) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.loadingText}>Loading Camera...</Text>
//       </View>
//     );
//   }

//   // Draggable Panel State and Gesture
//   const panelHeight = useSharedValue(0);
//   const MAX_PANEL_HEIGHT = 300;
//   const panGesture = Gesture.Pan()
//     .onUpdate((event) => {
//       panelHeight.value = Math.max(
//         0,
//         Math.min(event.translationY + MAX_PANEL_HEIGHT, MAX_PANEL_HEIGHT)
//       );
//     })
//     .onEnd(() => {
//       panelHeight.value =
//         panelHeight.value > MAX_PANEL_HEIGHT / 2
//           ? withTiming(MAX_PANEL_HEIGHT, { duration: 200 })
//           : withTiming(0, { duration: 120 });
//     });

//   const panelStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: panelHeight.value }],
//   }));

//   return (
//     <View style={styles.container}>
//       <StatusBar />
//       <SafeAreaView style={styles.container}>
//         <GestureDetector gesture={pinchGesture}>
//           <ReanimatedCamera
//             ref={camera}
//             style={StyleSheet.absoluteFillObject}
//             photo={true}
//             device={device}
//             isActive={isCameraActive}
//             resizeMode="cover"
//             preview={true}
//             exposure={exposure}
//             torch={torch}
//             animatedProps={animatedProps}
//           />
//         </GestureDetector>
//         <BlurView
//           intensity={100}
//           tint="dark"
//           style={{
//             position: "absolute",
//             bottom: 10,
//             right: 10,
//             padding: 10,
//           }}
//           experimentalBlurMethod="dimezisBlurView"
//         />

//         <View style={styles.modeSelection}>
//           {["Photo", "Video", "Portrait", "Panorama"].map((mode) => (
//             <TouchableOpacity
//               key={mode}
//               style={[
//                 styles.modeButton,
//                 { backgroundColor: selectedMode === mode ? "#559" : "white" },
//               ]}
//               onPress={() => setSelectedMode(mode)}
//             >
//               <Text
//                 style={[
//                   styles.modeText,
//                   { color: selectedMode === mode ? "white" : "black" },
//                 ]}
//               >
//                 {mode}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         <View style={styles.sliderContainerexposure}>
//           {showExposureControls && (
//             <ExposureControls
//               setExposure={setExposure}
//               setShowExposureControls={setShowExposureControls}
//               exposure={exposure}
//             />
//           )}
//         </View>

//         <View style={styles.flashContainer}>
//           <ObscuraButton
//             iconName={flash === "on" ? "flash-sharp" : "flash-off-sharp"}
//             onPress={() => setFlash((f) => (f === "off" ? "on" : "off"))}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>

//         <View style={styles.exposureContainer}>
//           <ObscuraButton
//             iconName="eye-sharp"
//             onPress={() => setShowExposureControls((s) => !s)}
//             containerStyle={{ alignSelf: "center" }}
//           />
//         </View>

//         <View style={styles.captureButtonContainer}>
//           <TouchableOpacity onPress={openGallery}>
//             <Ionicons name="images-outline" size={width * 0.09} color="white" />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
//             <Ionicons name="camera" size={48} color="white" />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={toggleCameraType}>
//             <Ionicons name="sync-circle" size={width * 0.115} color="white" />
//           </TouchableOpacity>
//         </View>

//         <GestureDetector gesture={panGesture}>
//           <Animated.View style={[styles.draggablePanel, panelStyle]}>
//             <View style={styles.panelHandle} />
//             <CameraNavPanel
//               onSyncPress={toggleCameraType}
//               selectedModeprop={selectedMode}
//               onModeChange={setSelectedMode}
//             />
//           </Animated.View>
//         </GestureDetector>
//       </SafeAreaView>
//     </View>
//   );
// };

// // Styles (unchanged)
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "transparent",
//     justifyContent: "flex-end",
//     paddingTop: 40,
//     paddingBottom: 40,
//   },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "black",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   loadingText: { color: "white", fontSize: 18 },
//   modeSelection: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     position: "absolute",
//     bottom: 130,
//     width: "100%",
//   },
//   modeButton: {
//     backgroundColor: "rgb(255, 255, 255)",
//     padding: 10,
//     borderRadius: 35,
//   },
//   modeText: {
//     color: "black",
//     fontSize: 11,
//   },
//   sliderContainerexposure: {
//     paddingHorizontal: 20,
//     marginBottom: 30,
//   },
//   flashContainer: {
//     position: "absolute",
//     top: 50,
//     right: 20,
//   },
//   exposureContainer: {
//     position: "absolute",
//     top: 110,
//     right: 20,
//   },
//   captureButtonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     marginBottom: 40,
//     bottom: -35,
//   },
//   captureButton: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: "rgb(26, 110, 158)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   draggablePanel: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 300,
//     backgroundColor: "rgb(0, 0, 0)",
//     borderTopLeftRadius: 35,
//     borderTopRightRadius: 35,
//     zIndex: 100,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   panelHandle: {
//     width: 40,
//     height: 4,
//     backgroundColor: "white",
//     borderRadius: 2,
//     alignSelf: "center",
//     marginTop: 10,
//   },
// });

// export default HomeScreen;
