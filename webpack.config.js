const path = require('path');

module.exports = {
  entry: 'index.js',  // Your entry point file, adjust if needed
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),  // Output folder
  },
  module: {
    rules: [
      {
        test: /\.js$/,  // Match JavaScript files
        exclude: /node_modules/,
        use: 'babel-loader',  // If you're using Babel to transpile JS
      },
    ],
  },
  resolve: {
    extensions: ['.js'],  // Extensions to resolve
  },
};
