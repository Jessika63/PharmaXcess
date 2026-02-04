const { withAndroidManifest } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withNetworkSecurityConfig(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    
    // Trouver l'élément <application>
    const application = androidManifest.manifest.application[0];
    
    // Ajouter l'attribut networkSecurityConfig
    application.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    application.$['android:usesCleartextTraffic'] = 'true';
    
    return config;
  });
};
