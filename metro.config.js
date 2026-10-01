const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const existingBlockList = config.resolver.blockList;

// Preview's Chromium cache is transient and is not application source.
// Watching it can crash Metro when Chromium removes a cache directory.
config.resolver.blockList = [
  ...(Array.isArray(existingBlockList)
    ? existingBlockList
    : existingBlockList ? [existingBlockList] : []),
  /[/\\]\.config[/\\]chromium([/\\].*)?$/,
];

module.exports = config;
