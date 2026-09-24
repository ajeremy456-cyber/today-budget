const { withAppBuildGradle } = require('@expo/config-plugins');

const withResolveWorkManager = (config) => {
  return withAppBuildGradle(config, (config) => {
    config.modResults.contents += `
configurations.all {
    resolutionStrategy {
        force 'androidx.work:work-runtime:2.8.1'
        force 'androidx.work:work-runtime-ktx:2.8.1'
    }
}
`;
    return config;
  });
};

module.exports = withResolveWorkManager;