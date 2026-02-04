
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
        projectId: "0569e36f-e7dd-46ff-ae88-5ac240e5866e"
      }
      // Vous pouvez définir des variables ici si besoin
    }
  }
};
