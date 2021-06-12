const webpack = require('webpack');

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai', 'webpack'],
    plugins: [
      'karma-webpack',
      'karma-mocha',
      'karma-chai',
      'karma-chrome-launcher',
    ],
    preprocessors: {
      'test/**/*.mocha.js': ['webpack'],
    },
    files: [{
      pattern: 'test/**/*.mocha.js',
      type: 'module',
    }],
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
    autoWatch: false,
    concurrency: Infinity,
    webpack: {
      plugins: [
        new webpack.SourceMapDevToolPlugin({
          filename: null, // if no value is provided the sourcemap is inlined
          test: /\.(ts|js)($|\?)/i, // process .js and .ts files only
        }),
      ],
    },
    client: {
      mocha: {
        ui: 'tdd',
      },
    },
  });
};
