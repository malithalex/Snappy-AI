// // OverlayProvider.tsx
// import React, { createContext, useContext, useState } from "react";
// import { Portal } from "react-native-paper";
// import { View, Text, StyleSheet } from "react-native";

// // Define the shape of the overlay properties
// export interface OverlayProps {
//   targetYaw: number;
//   targetPitch: number;
//   targetRoll: number;
//   currentYaw: number;
//   currentPitch: number;
//   currentRoll: number;
// }

// // Define the context type
// interface OverlayContextType {
//   showOverlay: boolean;
//   overlayProps: OverlayProps;
//   setOverlayProps: (props: OverlayProps) => void;
//   setShowOverlay: (visible: boolean) => void;
// }

// // Create the context with default values.
// const OverlayContext = createContext<OverlayContextType | null>(null);

// export const OverlayProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [showOverlay, setShowOverlay] = useState(false);
//   const [overlayProps, setOverlayProps] = useState<OverlayProps>({
//     targetYaw: 0,
//     targetPitch: 0,
//     targetRoll: 0,
//     currentYaw: 0,
//     currentPitch: 0,
//     currentRoll: 0,
//   });

//   return (
//     <OverlayContext.Provider
//       value={{ showOverlay, overlayProps, setOverlayProps, setShowOverlay }}
//     >
//       {children}
//       <Portal>{showOverlay && <OverlayView {...overlayProps} />}</Portal>
//     </OverlayContext.Provider>
//   );
// };

// export const useOverlay = () => {
//   const context = useContext(OverlayContext);
//   if (!context) {
//     throw new Error("useOverlay must be used within an OverlayProvider");
//   }
//   return context;
// };

// //
// // Simple overlay view component.
// // You can replace this with your custom overlay (e.g., your animated rings, arrows, etc.)
// // This example simply displays orientation values on a semi-transparent background.
// const OverlayView: React.FC<OverlayProps> = ({
//   targetYaw,
//   targetPitch,
//   targetRoll,
//   currentYaw,
//   currentPitch,
//   currentRoll,
// }) => {
//   return (
//     <View style={styles.overlayContainer} pointerEvents="none">
//       <View style={styles.overlayContent}>
//         <Text style={styles.text}>Overlay Active</Text>
//         <Text style={styles.text}>
//           Target: Yaw {targetYaw}, Pitch {targetPitch}, Roll {targetRoll}
//         </Text>
//         <Text style={styles.text}>
//           Current: Yaw {currentYaw}, Pitch {currentPitch}, Roll {currentRoll}
//         </Text>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   overlayContainer: {
//     position: "absolute",
//     top: 0,
//     right: 0,
//     bottom: 0,
//     left: 0,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   overlayContent: {
//     backgroundColor: "rgba(0,0,0,0.5)",
//     padding: 20,
//     borderRadius: 10,
//   },
//   text: {
//     color: "#fff",
//     fontSize: 16,
//     textAlign: "center",
//     marginVertical: 4,
//   },
// });

// overlayprovider.tsx
import React, { createContext, useContext, useState } from "react";
import { Portal } from "react-native-paper";
import { View, Text, StyleSheet } from "react-native";

export interface OverlayProps {
  targetYaw: number;
  targetPitch: number;
  targetRoll: number;
  currentYaw: number;
  currentPitch: number;
  currentRoll: number;
}

interface OverlayContextType {
  showOverlay: boolean;
  overlayProps: OverlayProps;
  setOverlayProps: (props: OverlayProps) => void;
  setShowOverlay: (visible: boolean) => void;
}

const OverlayContext = createContext<OverlayContextType | null>(null);

export const OverlayProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayProps, setOverlayProps] = useState<OverlayProps>({
    targetYaw: 0,
    targetPitch: 0,
    targetRoll: 0,
    currentYaw: 0,
    currentPitch: 0,
    currentRoll: 0,
  });

  return (
    <OverlayContext.Provider
      value={{ showOverlay, overlayProps, setOverlayProps, setShowOverlay }}
    >
      {children}
      <Portal>{showOverlay && <OverlayView {...overlayProps} />}</Portal>
    </OverlayContext.Provider>
  );
};

export const useOverlay = () => {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error("useOverlay must be used within an OverlayProvider");
  }
  return context;
};

const OverlayView: React.FC<OverlayProps> = (props) => {
  return (
    <View style={styles.overlayContainer} pointerEvents="none">
      <View style={styles.overlayContent}>
        <Text style={styles.text}>Overlay Active</Text>
        <Text style={styles.text}>
          Target: Yaw {props.targetYaw}, Pitch {props.targetPitch}, Roll{" "}
          {props.targetRoll}
        </Text>
        <Text style={styles.text}>
          Current: Yaw {props.currentYaw}, Pitch {props.currentPitch}, Roll{" "}
          {props.currentRoll}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  overlayContent: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
    borderRadius: 10,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 4,
  },
});
