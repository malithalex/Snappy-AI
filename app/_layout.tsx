// import {
//   DarkTheme,
//   DefaultTheme,
//   ThemeProvider,
// } from "@react-navigation/native";
// import { useFonts } from "expo-font";
// import { Stack } from "expo-router";
// import * as SplashScreen from "expo-splash-screen";
// import { useEffect } from "react";
// import "react-native-reanimated";

// import { useColorScheme } from "@/hooks/useColorScheme";
// import { GestureHandlerRootView } from "react-native-gesture-handler";

// // Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const [loaded] = useFonts({
//     SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
//   });

//   useEffect(() => {
//     if (loaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [loaded]);

//   if (!loaded) {
//     return null;
//   }

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <ThemeProvider value={DarkTheme}>
//         <Stack>
//           <Stack.Screen name="index" options={{ headerShown: false }} />
//           <Stack.Screen
//             name="permissions"
//             options={{ presentation: "modal", headerShown: true }}
//           />
//           <Stack.Screen
//             name="media"
//             options={{ presentation: "modal", headerShown: false }}
//           />
//           <Stack.Screen name="+not-found" options={{ presentation: "modal" }} />
//         </Stack>
//       </ThemeProvider>
//     </GestureHandlerRootView>
//   );
// }

// RootLayout.tsx (or index.tsx)
import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper"; // Import PaperProvider
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { Stack } from "expo-router";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { OverlayProvider } from "./overlayprovider";
// import { OverlayProvider } from "@/components/OverlayProvider"; // adjust path if needed

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // If you use fonts, load them here. For brevity, this example assumes fonts are loaded.
  // If not loaded, you can return null.
  // const [loaded] = useFonts({
  //   SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  // });
  // if (!loaded) return null;

  useEffect(() => {
    // When fonts load or other assets are ready, hide the splash screen.
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Wrap the entire app in PaperProvider so that Portal works correctly */}
      <PaperProvider>
        <ThemeProvider value={DarkTheme}>
          {/* Place your OverlayProvider here so that overlay context is available to all children */}
          <OverlayProvider>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen
                name="permissions"
                options={{ presentation: "modal", headerShown: true }}
              />
              <Stack.Screen
                name="media"
                options={{ presentation: "modal", headerShown: false }}
              />
              <Stack.Screen name="+not-found" options={{ presentation: "modal" }} />
            </Stack>
          </OverlayProvider>
        </ThemeProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}


// import {
//   DarkTheme,
//   DefaultTheme,
//   ThemeProvider,
// } from "@react-navigation/native";
// import { useFonts } from "expo-font";
// import { Stack } from "expo-router";
// import * as SplashScreen from "expo-splash-screen";
// import { useEffect } from "react";
// import "react-native-reanimated";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { useColorScheme } from "@/hooks/useColorScheme";

// // Ensure gesture handler is imported early (Expo usually handles this)
// import "react-native-gesture-handler";

// // Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const [loaded] = useFonts({
//     SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
//   });

//   useEffect(() => {
//     if (loaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [loaded]);

//   if (!loaded) {
//     return null;
//   }

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <ThemeProvider value={DarkTheme}>
//         <Stack>
//           <Stack.Screen name="index" options={{ headerShown: false }} />
//           <Stack.Screen
//             name="permissions"
//             options={{ presentation: "modal", headerShown: true }}
//           />
//           <Stack.Screen
//             name="media"
//             options={{ presentation: "modal", headerShown: false }}
//           />
//           <Stack.Screen name="+not-found" options={{ presentation: "modal" }} />
//         </Stack>
//       </ThemeProvider>
//     </GestureHandlerRootView>
//   );
// }