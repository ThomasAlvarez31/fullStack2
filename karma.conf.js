
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      'src/tests/**/*.test.js'
    ],
    browsers: ['ChromeHeadless'],
    singleRun: true
  });
};
