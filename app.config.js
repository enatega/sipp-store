module.exports = {
  expo: {
    name: "Sipp Store",
    slug: "sipp-store",
    owner: "ninjas_code",
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
      bundleIdentifier: "com.sipp.delivery.ios.store",
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
      package: "com.sipp.delivery.ios.store",
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
      url: "https://u.expo.dev/48406364-5232-4c2b-91b3-b1a2acce6a86",
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
        projectId: "48406364-5232-4c2b-91b3-b1a2acce6a86",
      },
    },
  },
};
