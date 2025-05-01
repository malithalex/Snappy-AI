import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Camera, useCameraDevices } from "react-native-vision-camera";

// const CameraNavPanel: React.FC = () => {

type CameraNavPanelProps = {
  onSyncPress: () => void;
  selectedModeprop: string;
  onModeChange: (mode: string) => void;
  aiMode: boolean; // Added aiMode prop
  setAiMode: (value: boolean) => void; //
  setfeedback: (value: boolean) => void; //
  feedMode: boolean;
};

const CameraNavPanel: React.FC<CameraNavPanelProps> = ({
  onSyncPress,
  selectedModeprop,
  onModeChange,
  aiMode,
  setAiMode,
  feedMode,
  setfeedback,
}) => {
  const { width } = useWindowDimensions();
  // const [aiMode, setAiMode] = useState<boolean>(false);
  const [angleMode, setAngleMode] = useState<boolean>(false);
  //   const [selectedMode, setSelectedMode] = useState<string>("Photo");
  const [selectedMode, setSelectedMode] = useState<string>("Photo");
  const [selectedObject, setSelectedObject] = useState<string>("Auto");
  const [awb, setAwb] = useState<number>(50);
  const [ae, setAe] = useState<number>(50);
  const [af, setAf] = useState<number>(50);
  const [cameraType, setCameraType] = useState<"back" | "front">("back");
  const devices = useCameraDevices();
  // const device = cameraType === "back" ? devices.back : devices.front;
  const device = devices.find((d) => d.position === cameraType);

  type ControlType = "awb" | "ae" | "af";
  type ActionType = "increase" | "decrease";

  const adjustValue = (type: ControlType, action: ActionType): void => {
    const change = action === "increase" ? 5 : -5;
    if (type === "awb")
      setAwb((prev) => Math.max(0, Math.min(100, prev + change)));
    if (type === "ae")
      setAe((prev) => Math.max(0, Math.min(100, prev + change)));
    if (type === "af")
      setAf((prev) => Math.max(0, Math.min(100, prev + change)));
  };

  // Animated states for hover effect
  const [refreshScale] = useState(new Animated.Value(1));
  const [syncScale] = useState(new Animated.Value(1));
  const [syncRotate] = useState(new Animated.Value(0));

  //   const animateIcon = (animatedValue: Animated.Value, toValue: number) => {
  //     Animated.spring(animatedValue, {
  //       toValue,
  //       useNativeDriver: true,
  //       speed: 15,
  //     }).start();
  //   };

  const animateIcon = (callback?: () => void) => {
    Animated.timing(syncRotate, {
      toValue: 360,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      syncRotate.setValue(0);
      if (callback) callback();
    });
  };

  // const handleHardRefresh = async () => {
  //   try {
  //     await Updates.reloadAsync(); // This reloads the entire app
  //   } catch (e) {
  //     console.warn("Could not reload app:", e);
  //   }
  // };

  const handleSyncPress = () => {
    animateIcon(onSyncPress);
  };

  // Toggle camera type with a rotation animation
  const toggleCameraType = () => {
    // Rotate the sync icon 360° then toggle the camera type
    Animated.timing(syncRotate, {
      toValue: 360,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      syncRotate.setValue(0);
      setCameraType((prev) => (prev === "back" ? "front" : "back"));
    });
  };

  // Fixed type error for icon names
  const objectIcons = [
    {
      id: "flower",
      outline: "flower-outline",
      filled: "flower",
      label: "Flower",
    },
    {
      id: "person",
      outline: "person-outline",
      filled: "person",
      label: "Person",
    },
    { id: "3d", outline: "cube-outline", filled: "cube", label: "3D" },
    {
      id: "Auto",
      outline: "planet-outline",
      filled: "planet-sharp",
      label: "Auto",
    },
    { id: "text", outline: "text-outline", filled: "text", label: "Text" },
    { id: "car", outline: "car-outline", filled: "car", label: "Car" },
  ];

  // Conditional rendering if device is not available
  if (!device) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <TouchableOpacity
        //   onPressIn={() => animateIcon(refreshScale, 1.2)}
        //   onPressOut={() => animateIcon(refreshScale, 1)}
        >
          <Animated.View style={{ transform: [{ scale: refreshScale }] }}>
            <Ionicons name="refresh-circle" size={width * 0.1} color="white" />
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSyncPress}>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: syncRotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            }}
          >
            <Ionicons name="sync-circle" size={width * 0.1} color="white" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Mode Selection (Row 1) */}
      <View style={styles.modeSelection}>
        {["Photo", "Video", "Portrait", "Panorama"].map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.modeButton,
              { backgroundColor: selectedModeprop === mode ? "#559" : "white" },
            ]}
            // onPress={() => setSelectedMode(mode)}
            onPress={() => onModeChange(mode)}
          >
            <Text
              style={[
                styles.modeText,
                { color: selectedMode === mode ? "black" : "black" },
              ]}
            >
              {mode}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Object Selection (Row 2) - Fixed Type Error */}
      <View style={styles.objectSelection}>
        {objectIcons.map((obj) => (
          <TouchableOpacity
            key={obj.id}
            style={[
              styles.objectButton,
              { backgroundColor: selectedObject === obj.id ? "#559" : "#333" },
            ]}
            onPress={() => setSelectedObject(obj.id)}
          >
            <Ionicons
              name={
                (selectedObject === obj.id
                  ? obj.filled
                  : obj.outline) as keyof typeof Ionicons.glyphMap
              }
              size={width * 0.04}
              color="white"
            />
            {/* <Text style={styles.objectText}>{obj.label}</Text> */}
          </TouchableOpacity>
        ))}
      </View>

      {/* Controls + Toggles Grid Layout (Row 3) */}
      <View style={styles.controlsAndToggles}>
        {/* Controls Section */}
        <View style={styles.controlsWrapper}>
          {(["awb", "ae", "af"] as ControlType[]).map((control) => (
            <View key={control} style={styles.controlContainer}>
              <Text style={styles.controlLabel}>{control.toUpperCase()}</Text>
              <TouchableOpacity
                onPress={() => adjustValue(control, "decrease")}
                style={styles.controlButton}
              >
                <Ionicons
                  name="remove-sharp"
                  size={width * 0.05}
                  color="white"
                />
              </TouchableOpacity>
              <Text style={styles.controlValue}>
                {control === "awb" ? awb : control === "ae" ? ae : af}
              </Text>
              <TouchableOpacity
                onPress={() => adjustValue(control, "increase")}
                style={styles.controlButton}
              >
                <Ionicons name="add" size={width * 0.05} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Toggle Switches Section */}
        <View style={styles.togglesWrapper}>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>AI Mode</Text>
            <Switch value={aiMode} onValueChange={() => setAiMode(!aiMode)} />
            <Text style={styles.toggleStatus}>{aiMode ? "ON" : "OFF"}</Text>
          </View>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>360° Mode</Text>
            <Switch
              value={angleMode}
              onValueChange={() => setAngleMode(!angleMode)}
            />
            <Text style={styles.toggleStatus}>{angleMode ? "ON" : "OFF"}</Text>
          </View>
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>Feedback</Text>
            <Switch
              value={feedMode}
              onValueChange={() => setfeedback(!feedMode)}
            />
            <Text style={styles.toggleStatus}>{feedMode ? "ON" : "OFF"}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    width: "100%",
    alignItems: "center",
    paddingHorizontal: "5%",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 18,
  },
  modeSelection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
    marginTop: 20,
  },
  modeButton: {
    borderRadius: 30,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  modeText: {
    fontSize: 12,
  },
  objectSelection: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
    marginTop: 10,
  },
  objectButton: {
    alignItems: "center",
    borderRadius: 40,
    padding: 10,
  },
  objectText: {
    color: "white",
    fontSize: 10,
    marginTop: 3,
  },
  controlsAndToggles: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
  },
  controlsWrapper: {
    flex: 2,
    flexDirection: "column",
    alignItems: "center",
  },
  controlContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 5,
  },
  controlLabel: {
    color: "#fff",
    fontSize: 12,
    width: 40,
    textAlign: "center",
  },
  controlButton: {
    backgroundColor: "#444",
    padding: 8,
    borderRadius: 50,
    marginHorizontal: 5,
  },
  controlValue: {
    color: "#fff",
    fontSize: 12,
    width: 30,
    textAlign: "center",
  },
  togglesWrapper: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end",
    marginRight: 40,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 8,
  },
  toggleText: {
    color: "white",
    fontSize: 12,
  },
  toggleStatus: {
    color: "white",
    fontSize: 12,
    marginLeft: 8,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 28,
    // marginBottom: 35,
  },
});

export default CameraNavPanel;

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Switch,
//   TouchableOpacity,
//   StyleSheet,
//   useWindowDimensions,
//   Animated,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { Camera, useCameraDevices } from "react-native-vision-camera";

// // const CameraNavPanel: React.FC = () => {

// type CameraNavPanelProps = {
//   onSyncPress: () => void;
//   selectedModeprop: string;
//   onModeChange: (mode: string) => void;
//   // objectDetectionEnabled: boolean;
//   onObjectChange: (object: string) => void; // New prop to notify parent of changes
// };

// const CameraNavPanel: React.FC<CameraNavPanelProps> = ({
//   onSyncPress,
//   selectedModeprop,
//   onModeChange,
//   // objectDetectionEnabled,
//   // onObjectDetectionChange,
//   onObjectChange,
// }) => {
//   const { width } = useWindowDimensions();
//   const [aiMode, setAiMode] = useState<boolean>(false);
//   const [angleMode, setAngleMode] = useState<boolean>(false);
//   //   const [selectedMode, setSelectedMode] = useState<string>("Photo");
//   const [selectedMode, setSelectedMode] = useState<string>("Photo");
//   const [selectedObject, setSelectedObject] = useState<string>("Auto");
//   const [objectDetectionEnabled, setObjectDetectionEnabled] =
//     useState<boolean>(true);
//   const [awb, setAwb] = useState<number>(50);
//   const [ae, setAe] = useState<number>(50);
//   const [af, setAf] = useState<number>(50);
//   const [cameraType, setCameraType] = useState<"back" | "front">("back");
//   const devices = useCameraDevices();
//   // const device = cameraType === "back" ? devices.back : devices.front;
//   const device = devices.find((d) => d.position === cameraType);

//   type ControlType = "awb" | "ae" | "af";
//   type ActionType = "increase" | "decrease";

//   const adjustValue = (type: ControlType, action: ActionType): void => {
//     const change = action === "increase" ? 5 : -5;
//     if (type === "awb")
//       setAwb((prev) => Math.max(0, Math.min(100, prev + change)));
//     if (type === "ae")
//       setAe((prev) => Math.max(0, Math.min(100, prev + change)));
//     if (type === "af")
//       setAf((prev) => Math.max(0, Math.min(100, prev + change)));
//   };

//   // Animated states for hover effect
//   const [refreshScale] = useState(new Animated.Value(1));
//   const [syncScale] = useState(new Animated.Value(1));
//   const [syncRotate] = useState(new Animated.Value(0));

//   //   const animateIcon = (animatedValue: Animated.Value, toValue: number) => {
//   //     Animated.spring(animatedValue, {
//   //       toValue,
//   //       useNativeDriver: true,
//   //       speed: 15,
//   //     }).start();
//   //   };

//   const animateIcon = (callback?: () => void) => {
//     Animated.timing(syncRotate, {
//       toValue: 360,
//       duration: 500,
//       useNativeDriver: true,
//     }).start(() => {
//       syncRotate.setValue(0);
//       if (callback) callback();
//     });
//   };

//   const handleSyncPress = () => {
//     animateIcon(onSyncPress);
//   };

//   // Toggle camera type with a rotation animation
//   const toggleCameraType = () => {
//     // Rotate the sync icon 360° then toggle the camera type
//     Animated.timing(syncRotate, {
//       toValue: 360,
//       duration: 500,
//       useNativeDriver: true,
//     }).start(() => {
//       syncRotate.setValue(0);
//       setCameraType((prev) => (prev === "back" ? "front" : "back"));
//     });
//   };

//   // Automatically enable/disable object detection based on selectedObject
//   useEffect(() => {
//     if (selectedObject === "Auto") {
//       setObjectDetectionEnabled(true);
//     } else {
//       setObjectDetectionEnabled(false);
//     }
//     // Notify parent of the selected object
//     onObjectChange(selectedObject);
//   }, [selectedObject, onObjectChange]);

//   // Fixed type error for icon names
//   const objectIcons = [
//     {
//       id: "flower",
//       outline: "flower-outline",
//       filled: "flower",
//       label: "Flower",
//     },
//     {
//       id: "person",
//       outline: "person-outline",
//       filled: "person",
//       label: "Person",
//     },
//     { id: "3d", outline: "cube-outline", filled: "cube", label: "3D" },
//     {
//       id: "Auto",
//       outline: "planet-outline",
//       filled: "planet-sharp",
//       label: "Auto",
//     },
//     { id: "text", outline: "text-outline", filled: "text", label: "Text" },
//     { id: "car", outline: "car-outline", filled: "car", label: "Car" },
//   ];

//   // Conditional rendering if device is not available
//   if (!device) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.loadingText}>Loading Camera...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.iconContainer}>
//         <TouchableOpacity
//         //   onPressIn={() => animateIcon(refreshScale, 1.2)}
//         //   onPressOut={() => animateIcon(refreshScale, 1)}
//         >
//           <Animated.View style={{ transform: [{ scale: refreshScale }] }}>
//             <Ionicons name="refresh-circle" size={width * 0.1} color="white" />
//           </Animated.View>
//         </TouchableOpacity>
//         <TouchableOpacity onPress={handleSyncPress}>
//           <Animated.View
//             style={{
//               transform: [
//                 {
//                   rotate: syncRotate.interpolate({
//                     inputRange: [0, 360],
//                     outputRange: ["0deg", "360deg"],
//                   }),
//                 },
//               ],
//             }}
//           >
//             <Ionicons name="sync-circle" size={width * 0.1} color="white" />
//           </Animated.View>
//         </TouchableOpacity>
//       </View>

//       {/* Mode Selection (Row 1) */}
//       <View style={styles.modeSelection}>
//         {["Photo", "Video", "Portrait", "Panorama"].map((mode) => (
//           <TouchableOpacity
//             key={mode}
//             style={[
//               styles.modeButton,
//               { backgroundColor: selectedModeprop === mode ? "#559" : "white" },
//             ]}
//             // onPress={() => setSelectedMode(mode)}
//             onPress={() => onModeChange(mode)}
//           >
//             <Text
//               style={[
//                 styles.modeText,
//                 { color: selectedMode === mode ? "black" : "black" },
//               ]}
//             >
//               {mode}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Object Selection (Row 2) - Fixed Type Error */}
//       <View style={styles.objectSelection}>
//         {objectIcons.map((obj) => (
//           <TouchableOpacity
//             key={obj.id}
//             style={[
//               styles.objectButton,
//               { backgroundColor: selectedObject === obj.id ? "#559" : "#333" },
//             ]}
//             onPress={() => setSelectedObject(obj.id)}
//           >
//             <Ionicons
//               name={
//                 (selectedObject === obj.id
//                   ? obj.filled
//                   : obj.outline) as keyof typeof Ionicons.glyphMap
//               }
//               size={width * 0.04}
//               color="white"
//             />
//           </TouchableOpacity>
//         ))}
//       </View>
//       {/* <View style={styles.objectSelection}>
//         {objectIcons.map((obj) => (
//           <TouchableOpacity
//             key={obj.id}
//             style={[
//               styles.objectButton,
//               { backgroundColor: selectedObject === obj.id ? "#559" : "#333" },
//             ]}
//             onPress={() => setSelectedObject(obj.id)}
//           >
//             <Ionicons
//               name={
//                 (selectedObject === obj.id
//                   ? obj.filled
//                   : obj.outline) as keyof typeof Ionicons.glyphMap
//               }
//               size={width * 0.04}
//               color="white"
//             />
//           </TouchableOpacity>
//         ))}
//       </View> */}

//       {/* Controls + Toggles Grid Layout (Row 3) */}
//       <View style={styles.controlsAndToggles}>
//         {/* Controls Section */}
//         <View style={styles.controlsWrapper}>
//           {(["awb", "ae", "af"] as ControlType[]).map((control) => (
//             <View key={control} style={styles.controlContainer}>
//               <Text style={styles.controlLabel}>{control.toUpperCase()}</Text>
//               <TouchableOpacity
//                 onPress={() => adjustValue(control, "decrease")}
//                 style={styles.controlButton}
//               >
//                 <Ionicons
//                   name="remove-sharp"
//                   size={width * 0.05}
//                   color="white"
//                 />
//               </TouchableOpacity>
//               <Text style={styles.controlValue}>
//                 {control === "awb" ? awb : control === "ae" ? ae : af}
//               </Text>
//               <TouchableOpacity
//                 onPress={() => adjustValue(control, "increase")}
//                 style={styles.controlButton}
//               >
//                 <Ionicons name="add" size={width * 0.05} color="white" />
//               </TouchableOpacity>
//             </View>
//           ))}
//         </View>

//         {/* Toggle Switches Section */}
//         <View style={styles.togglesWrapper}>
//           <View style={styles.toggleContainer}>
//             <Text style={styles.toggleText}>AI Mode</Text>
//             <Switch value={aiMode} onValueChange={() => setAiMode(!aiMode)} />
//             <Text style={styles.toggleStatus}>{aiMode ? "ON" : "OFF"}</Text>
//           </View>
//           <View style={styles.toggleContainer}>
//             <Text style={styles.toggleText}>360° Mode</Text>
//             <Switch
//               value={angleMode}
//               onValueChange={() => setAngleMode(!angleMode)}
//             />
//             <Text style={styles.toggleStatus}>{angleMode ? "ON" : "OFF"}</Text>
//           </View>
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: "transparent",
//     width: "100%",
//     alignItems: "center",
//     paddingHorizontal: "5%",
//   },

//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "black",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   loadingText: {
//     color: "white",
//     fontSize: 18,
//   },
//   modeSelection: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     width: "100%",
//     marginBottom: 10,
//     marginTop: 20,
//   },
//   modeButton: {
//     borderRadius: 30,
//     paddingVertical: 5,
//     paddingHorizontal: 15,
//   },
//   modeText: {
//     fontSize: 12,
//   },
//   objectSelection: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     width: "100%",
//     marginBottom: 20,
//     marginTop: 10,
//   },
//   objectButton: {
//     alignItems: "center",
//     borderRadius: 40,
//     padding: 10,
//   },
//   objectText: {
//     color: "white",
//     fontSize: 10,
//     marginTop: 3,
//   },
//   controlsAndToggles: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     width: "100%",
//     alignItems: "center",
//   },
//   controlsWrapper: {
//     flex: 2,
//     flexDirection: "column",
//     alignItems: "center",
//   },
//   controlContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     width: "100%",
//     marginBottom: 5,
//   },
//   controlLabel: {
//     color: "#fff",
//     fontSize: 12,
//     width: 40,
//     textAlign: "center",
//   },
//   controlButton: {
//     backgroundColor: "#444",
//     padding: 8,
//     borderRadius: 50,
//     marginHorizontal: 5,
//   },
//   controlValue: {
//     color: "#fff",
//     fontSize: 12,
//     width: 30,
//     textAlign: "center",
//   },
//   togglesWrapper: {
//     flex: 1,
//     flexDirection: "column",
//     alignItems: "flex-end",
//     marginRight: 40,
//   },
//   toggleContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     width: "100%",
//     marginBottom: 8,
//   },
//   toggleText: {
//     color: "white",
//     fontSize: 12,
//   },
//   toggleStatus: {
//     color: "white",
//     fontSize: 12,
//     marginLeft: 8,
//   },
//   iconContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     width: "100%",
//     marginTop: 28,
//     // marginBottom: 35,
//   },
// });

// export default CameraNavPanel;
