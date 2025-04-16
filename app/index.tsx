// index.tsx
import React from "react";
import { AppRegistry } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
import HomeScreen from "./Homescreen";
import { OverlayProvider } from "./overlayprovider";
// import HomeScreen from "./HomeScreen";

const Main = () => {
  return (
    <PaperProvider>
      <OverlayProvider>
        <HomeScreen />
      </OverlayProvider>
    </PaperProvider>
  );
};

AppRegistry.registerComponent("main", () => Main);
export default Main;

