module.exports = {
  expo: {
    name: "EnategaDeliveriesStoreApp",
    slug: "enatega-deliveries-store-app",
    owner: "ninjas_code",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.enatega.deliveries.store",
      infoPlist: {
        UIBackgroundModes: ["audio"],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      googleServicesFile: "./google-services.json",
      package: "com.enatega.deliveries.store",
      edgeToEdgeEnabled: false,
    },
    androidNavigationBar: {
      backgroundColor: "#E5E7EB",
      barStyle: "dark-content",
      visible: "visible",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    updates: {
      url: "https://u.expo.dev/5cf97681-9db5-457b-bf07-07c5ff3f3a9d",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    plugins: [
      "expo-secure-store",
      "expo-font",
      [
        "expo-navigation-bar",
        {
          backgroundColor: "#E5E7EB",
          barStyle: "dark",
          borderColor: "#E5E7EB",
          visibility: "visible",
          behavior: "inset-swipe",
          position: "relative",
        },
      ],
      [
        "expo-notifications",
        {
          sounds: ["./src/assets/sound/beep3.mp3"],
        },
      ],
    ],
    extra: {
      eas: {
        projectId: "5cf97681-9db5-457b-bf07-07c5ff3f3a9d",
      },
    },
  },
};
