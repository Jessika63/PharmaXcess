
// app.config.js
module.exports = {
  expo: {
    name: "PharmaXcessApp",
    slug: "PharmaXcessApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      package: "com.pharmaxcess.app",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      usesCleartextTraffic: true
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "ebc76b73-db4e-462f-bafb-9ddac51b6d8a"
      }
    }
  }
};
