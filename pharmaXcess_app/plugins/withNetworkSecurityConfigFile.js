const { withDangerousMod, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withNetworkSecurityConfigFile(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const resXmlDir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'xml'
      );
      
      // Créer le dossier xml s'il n'existe pas
      if (!fs.existsSync(resXmlDir)) {
        fs.mkdirSync(resXmlDir, { recursive: true });
      }
      
      // Copier le fichier network_security_config.xml
      const sourceFile = path.join(projectRoot, 'network_security_config.xml');
      const destFile = path.join(resXmlDir, 'network_security_config.xml');
      
      if (fs.existsSync(sourceFile)) {
        fs.copyFileSync(sourceFile, destFile);
        console.log('✅ network_security_config.xml copié dans res/xml/');
      } else {
        console.warn('⚠️ network_security_config.xml non trouvé');
      }
      
      return config;
    },
  ]);
};
