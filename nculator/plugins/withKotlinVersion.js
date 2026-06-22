const { withProjectBuildGradle } = require('@expo/config-plugins');

const SUPPRESS_FLAG =
  '-P plugin:androidx.compose.compiler.plugins.kotlin:suppressKotlinVersionCompatibilityCheck=true';

const ALLPROJECTS_BLOCK = `
allprojects {
    tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
        kotlinOptions {
            freeCompilerArgs += ["${SUPPRESS_FLAG}"]
        }
    }
}
`;

module.exports = (config) =>
  withProjectBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('suppressKotlinVersionCompatibilityCheck')) {
      config.modResults.contents += ALLPROJECTS_BLOCK;
    }
    return config;
  });
