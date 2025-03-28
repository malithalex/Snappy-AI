// import {
//   Camera,
//   useCameraDevice,
//   CameraProps,
// } from "react-native-vision-camera";
// import Reanimated, {
//   useAnimatedProps,
//   useSharedValue,
// } from "react-native-reanimated";
// import { Gesture, GestureDetector } from "react-native-gesture-handler";

// Reanimated.addWhitelistedNativeProps({
//   zoom: true,
// });
// const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);

// export function ZoomingGesture() {
//   const device = useCameraDevice("back");
//   const zoom = useSharedValue(device.neutralZoom);

//   const zoomOffset = useSharedValue(0);
//   const gesture = Gesture.Pinch()
//     .onBegin(() => {
//       zoomOffset.value = zoom.value;
//     })
//     .onUpdate((event) => {
//       const z = zoomOffset.value * event.scale;
//       zoom.value = interpolate(
//         z,
//         [1, 10],
//         [device.minZoom, device.maxZoom],
//         Extrapolation.CLAMP
//       );
//     });

//   const animatedProps = useAnimatedProps<CameraProps>(
//     () => ({ zoom: zoom.value }),
//     [zoom]
//   );

//   if (device == null) return <NoCameraDeviceError />;
//   return (
//     <GestureDetector gesture={gesture}>
//       <ReanimatedCamera
//         style={StyleSheet.absoluteFill}
//         device={device}
//         isActive={true}
//         animatedProps={animatedProps}
//       />
//     </GestureDetector>
//   );
// }
