module.exports = {
  expo: {
    name: "Sipp Store",
    slug: "sipp-store",
    owner: "sipp-delivery",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash-light.png",
      resizeMode: "cover",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.sipp.store.app",
      splash: {
        image: "./assets/splash-light.png",
        resizeMode: "cover",
        backgroundColor: "#ffffff",
        dark: {
          image: "./assets/splash-dark.png",
          resizeMode: "cover",
          backgroundColor: "#ffffff",
        },
      },
      infoPlist: {
        UIBackgroundModes: ["audio"],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      splash: {
        image: "./assets/splash-light.png",
        resizeMode: "cover",
        backgroundColor: "#ffffff",
        dark: {
          image: "./assets/splash-dark.png",
          resizeMode: "cover",
          backgroundColor: "#ffffff",
        },
      },
      googleServicesFile: "./google-services.json",
      package: "com.sipp.store.app",
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
      url: "https://u.expo.dev/ac761cd8-fdca-4498-b679-e174b6cfb3ac",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    plugins: [
      "expo-secure-store",
      "expo-font",
      [
        "expo-image-picker",
        {
          photosPermission: "Allow Sipp Store to select photos for order chats.",
          cameraPermission: "Allow Sipp Store to take photos for order chats.",
          microphonePermission: false,
        },
      ],
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
        projectId: "ac761cd8-fdca-4498-b679-e174b6cfb3ac",
      },
    },
  },
};
