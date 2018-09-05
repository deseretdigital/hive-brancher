const webpack = require('webpack');
const path = require ('path');

module.exports = {
    devtool: 'cheap-eval-source-map',
    entry: [
        'babel-polyfill',
        path.join(__dirname, 'index.js')
    ],
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },{
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"]
            }
        ]
    },
    output: {
        path: __dirname + '/build',
        filename: 'bundle.js'
    },
    plugins: [
        new webpack.DefinePlugin({ // <-- key to reducing React's size
          'process.env': {
            'NODE_ENV': JSON.stringify('production')
          }
      })
    ],
    resolve: {
        modules: [
            path.join(__dirname, 'app'),
            path.join(__dirname, 'node_modules')
        ]
    }
};
