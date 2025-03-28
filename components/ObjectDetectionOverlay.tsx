// // // latest comment

// // // components/ObjectDetectionOverlay.tsx
// // import React, { useEffect, useRef, useState } from "react";
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   Dimensions,
// //   LogBox,
// //   TouchableWithoutFeedback,
// //   Platform,
// // } from "react-native";
// // import * as tf from "@tensorflow/tfjs";
// // import * as cocoSsd from "@tensorflow-models/coco-ssd";
// // import { Camera } from "react-native-vision-camera";
// // import * as FileSystem from "expo-file-system";

// // LogBox.ignoreAllLogs(true);

// // const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// // interface ObjectDetectionOverlayProps {
// //   cameraRef: React.RefObject<Camera>;
// //   isActive: boolean;
// //   selectedObject: string;
// // }

// // interface DetectedObject {
// //   bbox: [number, number, number, number];
// //   class: string;
// //   score: number;
// // }

// // const ObjectDetectionOverlay: React.FC<ObjectDetectionOverlayProps> = ({
// //   cameraRef,
// //   isActive,
// //   selectedObject,
// // }) => {
// //   const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
// //   const [predictions, setPredictions] = useState<DetectedObject[]>([]);
// //   const [selectedPrediction, setSelectedPrediction] =
// //     useState<DetectedObject | null>(null);
// //   const frameProcessingRef = useRef<NodeJS.Timeout | null>(null);
// //   const [cameraDimensions, setCameraDimensions] = useState({
// //     width: 720,
// //     height: 1280,
// //   });

// //   // Load the COCO-SSD model on component mount
// //   useEffect(() => {
// //     const loadModel = async () => {
// //       try {
// //         console.log("Initializing TensorFlow.js...");
// //         await tf.ready();
// //         console.log("TensorFlow.js initialized. Loading COCO-SSD model...");
// //         const loadedModel = await cocoSsd.load();
// //         setModel(loadedModel);
// //         console.log("COCO-SSD model loaded successfully");
// //       } catch (err) {
// //         console.error("Failed to load COCO-SSD model:", err);
// //       }
// //     };
// //     loadModel();
// //   }, []);

// //   // Process camera frames in real-time
// //   useEffect(() => {
// //     console.log("ObjectDetectionOverlay isActive:", isActive);
// //     console.log("Camera Ref:", cameraRef.current);

// //     if (!isActive || !model || !cameraRef.current) {
// //       if (frameProcessingRef.current) {
// //         clearInterval(frameProcessingRef.current);
// //         frameProcessingRef.current = null;
// //         console.log("Frame processing stopped");
// //       }
// //       setPredictions([]);
// //       setSelectedPrediction(null);
// //       return;
// //     }

// //     const processFrame = async () => {
// //       if (!cameraRef.current) {
// //         console.warn("Camera ref is null, cannot process frame");
// //         return;
// //       }

// //       try {
// //         console.log("Taking snapshot...");
// //         const photo = await cameraRef.current.takeSnapshot({
// //           quality: 0.2,
// //           // skipMetadata: true,
// //         });
// //         console.log("Snapshot taken:", photo);

// //         const base64Image = await FileSystem.readAsStringAsync(photo.path, {
// //           encoding: FileSystem.EncodingType.Base64,
// //         });
// //         console.log("Snapshot converted to base64");

// //         const img = new Image();
// //         img.src = `data:image/jpeg;base64,${base64Image}`;

// //         await new Promise((resolve) => {
// //           img.onload = resolve;
// //         });
// //         console.log("Image loaded");

// //         setCameraDimensions({ width: photo.width, height: photo.height });

// //         console.log("Running object detection...");
// //         const detected = await model.detect(img);
// //         console.log("Objects detected:", detected);

// //         const sortedPredictions = detected.sort((a, b) => b.score - a.score);
// //         setPredictions(sortedPredictions);
// //       } catch (err) {
// //         console.error("Error processing frame:", err);
// //       }
// //     };

// //     // Process frames every 200ms (adjusted for better performance)
// //     frameProcessingRef.current = setInterval(processFrame, 200);

// //     return () => {
// //       if (frameProcessingRef.current) {
// //         clearInterval(frameProcessingRef.current);
// //         frameProcessingRef.current = null;
// //         console.log("Frame processing cleanup");
// //       }
// //     };
// //   }, [isActive, model, cameraRef]);

// //   const classMap: { [key: string]: string } = {
// //     flower: "potted plant",
// //     person: "person",
// //     "3d": "unknown",
// //     text: "book",
// //     car: "car",
// //   };
// //   const targetClass = classMap[selectedObject.toLowerCase()] || "unknown";

// //   const handleTouch = async (event: {
// //     nativeEvent: { locationX: number; locationY: number };
// //   }) => {
// //     if (selectedObject !== "Auto") return;

// //     const { locationX, locationY } = event.nativeEvent;

// //     const touchedPrediction = predictions.find((prediction) => {
// //       const [x, y, predWidth, predHeight] = prediction.bbox;
// //       const scaleWidth = screenWidth / cameraDimensions.width;
// //       const scaleHeight = screenHeight / cameraDimensions.height;

// //       const boundingBoxX = x * scaleWidth;
// //       const boundingBoxY = y * scaleHeight;
// //       const scaledWidth = predWidth * scaleWidth;
// //       const scaledHeight = predHeight * scaleHeight;

// //       return (
// //         locationX >= boundingBoxX &&
// //         locationX <= boundingBoxX + scaledWidth &&
// //         locationY >= boundingBoxY &&
// //         locationY <= boundingBoxY + scaledHeight
// //       );
// //     });

// //     if (touchedPrediction) {
// //       setSelectedPrediction(touchedPrediction);
// //       console.log("Selected prediction:", touchedPrediction);

// //       try {
// //         const [x, y, predWidth, predHeight] = touchedPrediction.bbox;
// //         const scaleWidth = screenWidth / cameraDimensions.width;
// //         const scaleHeight = screenHeight / cameraDimensions.height;

// //         const boundingBoxX = x * scaleWidth;
// //         const boundingBoxY = y * scaleHeight;
// //         const scaledWidth = predWidth * scaleWidth;
// //         const scaledHeight = predHeight * scaleHeight;

// //         const photo = await cameraRef.current?.takeSnapshot({ quality: 0.2 });
// //         if (!photo) throw new Error("Failed to capture photo");

// //         const base64Image = await FileSystem.readAsStringAsync(photo.path, {
// //           encoding: FileSystem.EncodingType.Base64,
// //         });

// //         console.log("Sending data to Flask API...");
// //         const response = await fetch("http://192.168.1.100:5000/process", {
// //           method: "POST",
// //           headers: {
// //             "Content-Type": "application/json",
// //           },
// //           body: JSON.stringify({
// //             image: base64Image,
// //             bbox: {
// //               x: boundingBoxX,
// //               y: boundingBoxY,
// //               width: scaledWidth,
// //               height: scaledHeight,
// //             },
// //             detectedClass: touchedPrediction.class,
// //           }),
// //         });

// //         const result = await response.json();
// //         console.log("Flask API response:", result);

// //         if (result.success && result.refined_bbox) {
// //           const refinedBbox = result.refined_bbox;
// //           const updatedPrediction = {
// //             ...touchedPrediction,
// //             bbox: [
// //               refinedBbox.x / scaleWidth,
// //               refinedBbox.y / scaleHeight,
// //               refinedBbox.width / scaleWidth,
// //               refinedBbox.height / scaleHeight,
// //             ] as [number, number, number, number],
// //           };
// //           setSelectedPrediction(updatedPrediction);
// //         } else {
// //           console.warn("Flask API failed to confirm object:", result.message);
// //           setSelectedPrediction(null);
// //         }
// //       } catch (err) {
// //         console.error("Error sending data to Flask API:", err);
// //         setSelectedPrediction(null);
// //       }
// //     }
// //   };

// //   return (
// //     <TouchableWithoutFeedback onPress={handleTouch}>
// //       <View style={styles.container}>
// //         {predictions.length > 0 ? (
// //           predictions.map((prediction, index) => {
// //             const [x, y, predWidth, predHeight] = prediction.bbox;
// //             const scaleWidth = screenWidth / cameraDimensions.width;
// //             const scaleHeight = screenHeight / cameraDimensions.height;

// //             const flipHorizontal = Platform.OS === "android";
// //             const boundingBoxX = flipHorizontal
// //               ? screenWidth - (x * scaleWidth + predWidth * scaleWidth)
// //               : x * scaleWidth;
// //             const boundingBoxY = y * scaleHeight;
// //             const scaledWidth = predWidth * scaleWidth;
// //             const scaledHeight = predHeight * scaleHeight;

// //             const isPrioritized =
// //               selectedObject !== "Auto" && prediction.class === targetClass;
// //             const isSelected = selectedPrediction === prediction;

// //             console.log(`Rendering prediction ${index}:`, {
// //               class: prediction.class,
// //               bbox: [boundingBoxX, boundingBoxY, scaledWidth, scaledHeight],
// //               isSelected,
// //               isPrioritized,
// //             });

// //             return (
// //               <View key={index} style={styles.predictionContainer}>
// //                 <View
// //                   style={[
// //                     styles.boundingBox,
// //                     {
// //                       left: boundingBoxX,
// //                       top: boundingBoxY,
// //                       width: scaledWidth,
// //                       height: scaledHeight,
// //                       borderColor: isSelected
// //                         ? "red"
// //                         : isPrioritized
// //                         ? "yellow"
// //                         : "yellow",
// //                     },
// //                   ]}
// //                 />
// //                 <Text
// //                   style={[
// //                     styles.label,
// //                     {
// //                       left: boundingBoxX,
// //                       top: boundingBoxY - 20,
// //                       color: isSelected
// //                         ? "red"
// //                         : isPrioritized
// //                         ? "yellow"
// //                         : "yellow",
// //                     },
// //                   ]}
// //                 >
// //                   {`${prediction.class} (${Math.round(
// //                     prediction.score * 100
// //                   )}%)`}
// //                 </Text>
// //               </View>
// //             );
// //           })
// //         ) : (
// //           <Text style={styles.debugText}>No objects detected</Text>
// //         )}
// //         {targetClass === "unknown" && selectedObject !== "Auto" && isActive && (
// //           <View style={styles.messageContainer}>
// //             <Text style={styles.messageText}>
// //               Object detection not supported for {selectedObject}.
// //             </Text>
// //           </View>
// //         )}
// //       </View>
// //     </TouchableWithoutFeedback>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     position: "absolute",
// //     top: 0,
// //     left: 0,
// //     width: "100%",
// //     height: "100%",
// //   },
// //   predictionContainer: {
// //     position: "absolute",
// //   },
// //   boundingBox: {
// //     position: "absolute",
// //     borderWidth: 2,
// //   },
// //   label: {
// //     position: "absolute",
// //     fontSize: 16,
// //     backgroundColor: "rgba(0, 0, 0, 0.5)",
// //     padding: 2,
// //   },
// //   messageContainer: {
// //     position: "absolute",
// //     top: "50%",
// //     left: 0,
// //     right: 0,
// //     alignItems: "center",
// //   },
// //   messageText: {
// //     color: "white",
// //     fontSize: 16,
// //     backgroundColor: "rgba(0, 0, 0, 0.7)",
// //     padding: 10,
// //     borderRadius: 5,
// //   },
// //   debugText: {
// //     position: "absolute",
// //     top: 50,
// //     left: 20,
// //     color: "white",
// //     fontSize: 16,
// //     backgroundColor: "rgba(0, 0, 0, 0.7)",
// //     padding: 5,
// //   },
// // });

// // export default ObjectDetectionOverlay;


// // components/ObjectDetectionOverlay.tsx
// import React, { useEffect, useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Dimensions,
//   TouchableWithoutFeedback,
//   Platform,
// } from "react-native";
// // import { useObjectDetection } from "@infinitered/react-native-mlkit-object-detection";
// import { Camera } from "react-native-vision-camera";
// import { MyModelsConfig } from "@/app/_layout";
// import { useObjectDetection } from "@infinitered/react-native-mlkit-object-detection";
// import { ObjectDetectionObject } from "@/app/types/ObjectDetectionObject";
// // import type { MyModelsConfig } from "../model/model";

// const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// interface ObjectDetectionOverlayProps {
//   cameraRef: React.RefObject<Camera>;
//   isActive: boolean;
//   selectedObject: string;
//   imagePath: string | null;
// }

// const ObjectDetectionOverlay: React.FC<ObjectDetectionOverlayProps> = ({
//   cameraRef,
//   isActive,
//   selectedObject,
//   imagePath,
// }) => {
//   const detector = useObjectDetection<MyModelsConfig>(); // Use the default model
//   const [detectedObjects, setDetectedObjects] = useState<ObjectDetectionObject[]>([]);
//   const [selectedObjectDetection, setSelectedObjectDetection] = useState<ObjectDetectionObject | null>(null);
//   const [cameraDimensions, setCameraDimensions] = useState({ width: 1280, height: 720 });
//   const processingRef = useRef(false);

//   // Update camera dimensions when the camera ref changes
//   useEffect(() => {
//     if (cameraRef.current) {
//       // Note: react-native-vision-camera doesn't directly expose camera dimensions
//       // You may need to hardcode or dynamically fetch these based on your device
//       setCameraDimensions({ width: 1280, height: 720 }); // Adjust based on your camera resolution
//     }
//   }, [cameraRef]);

//   // Process frames when imagePath changes
//   useEffect(() => {
//     if (!isActive || !detector || !imagePath || processingRef.current) {
//       if (!isActive) {
//         setDetectedObjects([]);
//         setSelectedObjectDetection(null);
//       }
//       return;
//     }

//     processingRef.current = true;

//     const detectObjects = async () => {
//       try {
//         console.log("Detecting objects in frame:", imagePath);
//         const detectionResults = await detector.detectObjects(imagePath);
//         console.log("Objects detected:", detectionResults);
//         setDetectedObjects(detectionResults);
//       } catch (error) {
//         console.error("Error detecting objects:", error);
//       } finally {
//         processingRef.current = false;
//       }
//     };

//     detectObjects();
//   }, [isActive, detector, imagePath]);

//   const classMap: { [key: string]: string } = {
//     flower: "potted plant",
//     person: "person",
//     "3d": "unknown",
//     text: "book",
//     car: "car",
//   };
//   const targetClass = classMap[selectedObject.toLowerCase()] || "unknown";

//   const handleTouch = (event: { nativeEvent: { locationX: number; locationY: number } }) => {
//     if (selectedObject !== "Auto") return;

//     const { locationX, locationY } = event.nativeEvent;

//     const touchedObject = detectedObjects.find((obj) => {
//       const { origin, size } = obj.frame;
//       const scaleWidth = screenWidth / cameraDimensions.width;
//       const scaleHeight = screenHeight / cameraDimensions.height;

//       const boundingBoxX = origin.x * scaleWidth;
//       const boundingBoxY = origin.y * scaleHeight;
//       const scaledWidth = size.x * scaleWidth;
//       const scaledHeight = size.y * scaleHeight;

//       return (
//         locationX >= boundingBoxX &&
//         locationX <= boundingBoxX + scaledWidth &&
//         locationY >= boundingBoxY &&
//         locationY <= boundingBoxY + scaledHeight
//       );
//     });

//     if (touchedObject) {
//       setSelectedObjectDetection(touchedObject);
//       console.log("Selected object:", touchedObject);
//     }
//   };

//   return (
//     <TouchableWithoutFeedback onPress={handleTouch}>
//       <View style={styles.container}>
//         {detectedObjects.length > 0 ? (
//           detectedObjects.map((obj, index) => {
//             const { origin, size, labels } = obj;
//             const scaleWidth = screenWidth / cameraDimensions.width;
//             const scaleHeight = screenHeight / cameraDimensions.height;

//             const boundingBoxX = origin.x * scaleWidth;
//             const boundingBoxY = origin.y * scaleHeight;
//             const scaledWidth = size.x * scaleWidth;
//             const scaledHeight = size.y * scaleHeight;

//             const flipHorizontal = Platform.OS === "android";
//             const adjustedX = flipHorizontal
//               ? screenWidth - (boundingBoxX + scaledWidth)
//               : boundingBoxX;

//             const label = labels.length > 0 ? labels[0].text : "unknown";
//             const confidence = labels.length > 0 ? labels[0].confidence : 0;
//             const isPrioritized = selectedObject !== "Auto" && label === targetClass;
//             const isSelected = selectedObjectDetection === obj;

//             console.log(`Rendering object ${index}:`, {
//               label,
//               bbox: [adjustedX, boundingBoxY, scaledWidth, scaledHeight],
//               isSelected,
//               isPrioritized,
//             });

//             return (
//               <View key={index} style={styles.predictionContainer}>
//                 <View
//                   style={[
//                     styles.boundingBox,
//                     {
//                       left: adjustedX,
//                       top: boundingBoxY,
//                       width: scaledWidth,
//                       height: scaledHeight,
//                       borderColor: isSelected ? "red" : isPrioritized ? "yellow" : "yellow",
//                     },
//                   ]}
//                 />
//                 <Text
//                   style={[
//                     styles.label,
//                     {
//                       left: adjustedX,
//                       top: boundingBoxY - 20,
//                       color: isSelected ? "red" : isPrioritized ? "yellow" : "yellow",
//                     },
//                   ]}
//                 >
//                   {`${label} (${Math.round(confidence * 100)}%)`}
//                 </Text>
//               </View>
//             );
//           })
//         ) : (
//           <Text style={styles.debugText}>No objects detected</Text>
//         )}
//         {targetClass === "unknown" && selectedObject !== "Auto" && isActive && (
//           <View style={styles.messageContainer}>
//             <Text style={styles.messageText}>
//               Object detection not supported for {selectedObject}.
//             </Text>
//           </View>
//         )}
//       </View>
//     </TouchableWithoutFeedback>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     width: "100%",
//     height: "100%",
//   },
//   predictionContainer: {
//     position: "absolute",
//   },
//   boundingBox: {
//     position: "absolute",
//     borderWidth: 2,
//   },
//   label: {
//     position: "absolute",
//     fontSize: 16,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     padding: 2,
//   },
//   messageContainer: {
//     position: "absolute",
//     top: "50%",
//     left: 0,
//     right: 0,
//     alignItems: "center",
//   },
//   messageText: {
//     color: "white",
//     fontSize: 16,
//     backgroundColor: "rgba(0, 0, 0, 0.7)",
//     padding: 10,
//     borderRadius: 5,
//   },
//   debugText: {
//     position: "absolute",
//     top: 50,
//     left: 20,
//     color: "white",
//     fontSize: 16,
//     backgroundColor: "rgba(0, 0, 0, 0.7)",
//     padding: 5,
//   },
// });

// export default ObjectDetectionOverlay;

